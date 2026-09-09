from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq
# pyrefly: ignore [missing-import]
from supabase import create_client
import os

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
    client = get_supabase_client()
    if client is None:
        raise HTTPException(status_code=500, detail="Supabase is not configured")
    try:
        result = client.table("learning_paths").select("*").execute()
        courses = result.data if result.data else []
        mapped = []
        for row in courses:
            mapped.append({
                "id": row.get("id", ""),
                "title": row.get("name", ""),
                "description": row.get("description", ""),
                "category": "",
                "level": "",
                "estimatedTime": "",
            })
        return mapped
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch courses")


@app.get("/api/resources")
def get_resources():
    client = get_supabase_client()
    if client is None:
        raise HTTPException(status_code=500, detail="Supabase is not configured")
    try:
        result = client.table("resources").select("*").execute()
        resources = result.data if result.data else []
        mapped = []
        for row in resources:
            mapped.append({
                "id": row.get("id", ""),
                "title": row.get("title", ""),
                "category": row.get("resource_type", ""),
                "duration": "",
                "level": "",
                "description": row.get("url", ""),
            })
        return mapped
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch resources")


@app.get("/api/assessments")
def get_assessments():
    client = get_supabase_client()
    if client is None:
        raise HTTPException(status_code=500, detail="Supabase is not configured")
    try:
        # Read from exams, questions, question_options tables
        # Return raw data first to verify connection
        exam_result = client.table("exams").select("id, title, passing_score").execute()
        questions_result = client.table("questions").select("id, exam_id, question_text").execute()
        options_result = client.table("question_options").select("id, question_id, option_text, is_correct").execute()

        exams_data = exam_result.data if exam_result.data else []
        questions_data = questions_result.data if questions_result.data else []
        options_data = options_result.data if options_result.data else []

        return {
            "exams": exams_data,
            "questions": questions_data,
            "options": options_data,
            "counts": {
                "exams": len(exams_data),
                "questions": len(questions_data),
                "options": len(options_data),
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch assessments: {str(e)[:100]}")


@app.get("/api/student/{student_id}")
def get_student(student_id: str):
    client = get_supabase_client()
    if client is None:
        raise HTTPException(status_code=500, detail="Failed to get student")
    try:
        result = client.table("students").select("*").eq("id", student_id).execute()
    except Exception:
        raise HTTPException(status_code=404, detail="Student not found")
    if not result.data:
        raise HTTPException(status_code=404, detail="Student not found")
    return result.data[0]


@app.get("/api/progress/{student_id}")
def get_progress(student_id: str):
    client = get_supabase_client()
    if client is None:
        raise HTTPException(status_code=500, detail="Failed to get progress")
    try:
        result = client.table("student_progress").select("*").eq("student_id", student_id).execute()
    except Exception:
        raise HTTPException(status_code=404, detail="Progress not found")
    if not result.data:
        raise HTTPException(status_code=404, detail="Progress not found")
    return result.data[0]


def find_title(items, item_id):
    for item in items:
        if item.get("id") == item_id:
            return item.get("title", item.get("name", ""))
    return item_id


@app.get("/api/recommendations/{student_id}")
def get_recommendations(student_id: str):
    client = get_supabase_client()
    # Try to get student and progress from Supabase
    student = None
    try:
        s_result = client.table("students").select("*").limit(1).execute()
        students_list = s_result.data if s_result.data else []
        for s in students_list:
            if s.get("id") == student_id:
                student = s
                break
    except Exception:
        pass

    student_progress = None
    try:
        p_result = client.table("student_progress").select("*").eq("student_id", student_id).execute()
        if p_result.data:
            student_progress = p_result.data[0]
    except Exception:
        pass

    if student is None or student_progress is None:
        raise HTTPException(status_code=404, detail="Student not found or progress not found")

    skills = student_progress.get("skills", [])
    lowest = skills[0] if skills else {}
    for skill in skills:
        if skill.get("level", 0) < lowest.get("level", 0):
            lowest = skill
    highest = skills[0] if skills else {}
    for skill in skills:
        if skill.get("level", 0) > highest.get("level", 0):
            highest = skill

    recommendations = []

    if lowest.get("level", 0) < 75:
        if "Python" in lowest.get("skill", ""):
            resource_id = "res-4"
        elif "React" in lowest.get("skill", ""):
            resource_id = "res-1"
        else:
            resource_id = "res-2"
        recommendations.append(
            {
                "type": "resource",
                "id": resource_id,
                "title": find_title([], resource_id),
                "reason": f"Your {lowest.get('skill', '')} level is {lowest.get('level', 0)}, strengthen this weakest skill first.",
            }
        )

    if highest.get("level", 0) >= 85:
        recommendations.append(
            {
                "type": "course",
                "id": "rag-vector-search",
                "title": find_title([], "rag-vector-search"),
                "reason": f"Your {highest.get('skill', '')} level is {highest.get('level', 0)}, try this advanced course next.",
            }
        )

    if student.get("level") == "Intermediate":
        recommendations.append(
            {
                "type": "course",
                "id": "python-llm-infra",
                "title": find_title([], "python-llm-infra"),
                "reason": "This intermediate course fits your current level.",
            }
        )

    return {"student_id": student_id, "recommendations": recommendations}