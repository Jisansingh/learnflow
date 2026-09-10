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
                "completionPercentage": 0,
                "modules": [],
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
                "url": row.get("url", ""),
                "category": row.get("resource_type", ""),
                "type": row.get("resource_type", ""),
                "duration": "",
                "level": "",
                "author": "",
                "rating": 0,
                "description": "",
                "tags": [],
                "isFeatured": False,
                "bookmarkCount": 0,
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
        exam_result = client.table("exams").select("id, title, passing_score, topic_id").execute()
        exams_data = exam_result.data if exam_result.data else []

        if not exams_data:
            return {"exams": [], "count": 0}

        # Get questions for all exams
        exam_ids = [e["id"] for e in exams_data]
        questions_result = client.table("questions").select("id, exam_id, order_index, question_text").in_("exam_id", exam_ids).execute()
        questions_data = questions_result.data if questions_result.data else []

        # Get options for all questions
        question_ids = [q["id"] for q in questions_data]
        options_result = client.table("question_options").select("id, question_id, option_text, is_correct").in_("question_id", question_ids).execute()
        options_data = options_result.data if options_result.data else []

        # Build options lookup by question_id (without is_correct)
        options_by_question = {}
        for opt in options_data:
            qid = opt["question_id"]
            if qid not in options_by_question:
                options_by_question[qid] = []
            options_by_question[qid].append({
                "label": chr(65 + len(options_by_question[qid])),  # A, B, C, D
                "text": opt["option_text"],
            })

        # Build questions lookup by exam_id
        questions_by_exam = {}
        for q in questions_data:
            eid = q["exam_id"]
            if eid not in questions_by_exam:
                questions_by_exam[eid] = []
            qid = q["id"]
            questions_by_exam[eid].append({
                "id": qid,
                "type": "Multiple Choice",
                "topic": "General",
                "questionText": q["question_text"],
                "options": options_by_question.get(qid, []),
                "explanation": "",
            })

        # Build nested response for the first exam (frontend expects single assessment)
        first_exam = exams_data[0]
        exam_questions = questions_by_exam.get(first_exam["id"], [])

        return {
            "id": first_exam["id"],
            "title": first_exam["title"],
            "track": "Certification Track",
            "pathName": "Learning Path",
            "totalQuestions": len(exam_questions),
            "timeLimitMinutes": 30,
            "currentQuestionIndex": 0,
            "questions": exam_questions,
            "codeSnippet": "",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch assessments: {str(e)[:100]}")


@app.post("/api/assessments/{assessment_id}/submit")
def submit_assessment(assessment_id: str, payload: SubmitAnswers):
    client = get_supabase_client()
    if client is None:
        raise HTTPException(status_code=500, detail="Supabase is not configured")
    try:
        # Get questions for this exam
        questions_result = client.table("questions").select("id").eq("exam_id", assessment_id).execute()
        questions_data = questions_result.data if questions_result.data else []
        question_ids = [q["id"] for q in questions_data]

        if not question_ids:
            raise HTTPException(status_code=404, detail="Assessment not found")

        # Get correct options for these questions
        options_result = client.table("question_options").select("id, question_id, option_text, is_correct").in_("question_id", question_ids).execute()
        options_data = options_result.data if options_result.data else []

        # Build correct answer index per question
        correct_index_by_question = {}
        for opt in options_data:
            if opt.get("is_correct"):
                qid = opt["question_id"]
                # Find the index of this option among all options for this question
                q_opts = [o for o in options_data if o["question_id"] == qid]
                for idx, o in enumerate(q_opts):
                    if o["id"] == opt["id"]:
                        correct_index_by_question[qid] = idx
                        break

        # Calculate score
        answers = payload.answers
        correct_count = 0
        total_count = len(question_ids)

        for qid in question_ids:
            submitted_idx = answers.get(str(qid))
            if submitted_idx is not None and correct_index_by_question.get(qid) == submitted_idx:
                correct_count += 1

        score = int((correct_count / total_count) * 100) if total_count > 0 else 0
        passed = score >= 70  # default passing threshold

        return {
            "score": score,
            "passed": passed,
            "correct": correct_count,
            "total": total_count,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit assessment: {str(e)[:100]}")


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