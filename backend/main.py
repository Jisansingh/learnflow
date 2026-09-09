from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq
# pyrefly: ignore [missing-import]
from supabase import create_client
import os
from data import courses, resources, assessments, students, progress, assessment_answers

load_dotenv()


def get_supabase_client():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    if not url or not key:
        return None
    return create_client(url, key)


class SubmitAnswers(BaseModel):
    answers: dict[str, int]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"message": "LearnFlow backend is running"}


@app.get("/api/ai-test")
def ai_test():
    api_key = os.getenv("GROQ_API_KEY") or os.getenv("groq_api_key")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured")
    try:
        client = Groq(api_key=api_key)
        reply = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {
                    "role": "user",
                    "content": "You are testing the LearnFlow AI connection. Reply with a short sentence confirming that the AI API connection works.",
                }
            ],
            max_tokens=200,
        )
        return {"message": reply.choices[0].message.content}
    except Exception:
        raise HTTPException(status_code=500, detail="Groq API request failed")


@app.get("/api/supabase-test")
def supabase_test():
    client = get_supabase_client()
    if client is None:
        raise HTTPException(status_code=500, detail="Supabase is not configured")
    try:
        client.table("students").select("*").limit(1).execute()
        return {"message": "Supabase connection is working"}
    except Exception:
        raise HTTPException(status_code=500, detail="Supabase connection failed")


@app.get("/api/courses")
def get_courses():
    return courses


@app.get("/api/resources")
def get_resources():
    return resources


@app.get("/api/assessments")
def get_assessments():
    return assessments


@app.post("/api/assessments/{assessment_id}/submit")
def submit_assessment(assessment_id: str, body: SubmitAnswers):
    found = None
    for assessment in assessments:
        if assessment["id"] == assessment_id:
            found = assessment
    if found is None:
        raise HTTPException(status_code=404, detail="Assessment not found")

    correct_map = assessment_answers.get(assessment_id, {})
    correct_count = 0
    for question_id, correct_index in correct_map.items():
        if body.answers.get(question_id) == correct_index:
            correct_count += 1

    total = len(found["questions"])
    score = round(correct_count / total * 100, 2) if total > 0 else 0

    return {
        "assessment_id": assessment_id,
        "correct_answers": correct_count,
        "total_questions": total,
        "score": score,
    }


@app.get("/api/student/{student_id}")
def get_student(student_id: str):
    client = get_supabase_client()
    if client is None:
        raise HTTPException(status_code=500, detail="Failed to get student")
    try:
        result = client.table("students").select("*").eq("id", student_id).execute()
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to get student")
    if not result.data:
        raise HTTPException(status_code=404, detail="Student not found")
    return result.data[0]


@app.get("/api/progress/{student_id}")
def get_progress(student_id: str):
    for entry in progress:
        if entry["student_id"] == student_id:
            return entry
    raise HTTPException(status_code=404, detail="Progress not found")


def find_title(items, item_id):
    for item in items:
        if item["id"] == item_id:
            return item["title"]
    return item_id


@app.get("/api/recommendations/{student_id}")
def get_recommendations(student_id: str):
    student = None
    for s in students:
        if s["id"] == student_id:
            student = s
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")

    student_progress = None
    for entry in progress:
        if entry["student_id"] == student_id:
            student_progress = entry
    if student_progress is None:
        raise HTTPException(status_code=404, detail="Progress not found")

    skills = student_progress["skills"]
    lowest = skills[0]
    for skill in skills:
        if skill["level"] < lowest["level"]:
            lowest = skill
    highest = skills[0]
    for skill in skills:
        if skill["level"] > highest["level"]:
            highest = skill

    recommendations = []

    if lowest["level"] < 75:
        if "Python" in lowest["skill"]:
            resource_id = "res-4"
        elif "React" in lowest["skill"]:
            resource_id = "res-1"
        else:
            resource_id = "res-2"
        recommendations.append(
            {
                "type": "resource",
                "id": resource_id,
                "title": find_title(resources, resource_id),
                "reason": f"Your {lowest['skill']} level is {lowest['level']}, strengthen this weakest skill first.",
            }
        )

    if highest["level"] >= 85:
        recommendations.append(
            {
                "type": "course",
                "id": "rag-vector-search",
                "title": find_title(courses, "rag-vector-search"),
                "reason": f"Your {highest['skill']} level is {highest['level']}, try this advanced course next.",
            }
        )

    if student["level"] == "Intermediate":
        recommendations.append(
            {
                "type": "course",
                "id": "python-llm-infra",
                "title": find_title(courses, "python-llm-infra"),
                "reason": "This intermediate course fits your current level.",
            }
        )

    return {"student_id": student_id, "recommendations": recommendations}
