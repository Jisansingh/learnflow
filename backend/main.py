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
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
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
def get_assessments(learning_path_id: str | None = None):
    client = get_supabase_client()
    if client is None:
        raise HTTPException(status_code=500, detail="Supabase is not configured")
    try:
        # Resolve the learning path when a filter is provided.
        # Chain: learning_paths.id <- skills.learning_path_id
        #        <- topics.skill_id <- exams.topic_id
        #        <- questions.exam_id <- question_options.question_id
        path_name = "Learning Path"
        target_exam_ids: list | None = None
        if learning_path_id is not None:
            try:
                lp_id = int(learning_path_id)
            except (TypeError, ValueError):
                raise HTTPException(status_code=400, detail="Invalid learning_path_id")
            path_result = client.table("learning_paths").select("id, name").eq("id", lp_id).execute()
            if not path_result.data:
                raise HTTPException(status_code=404, detail="Learning path not found")
            path_name = path_result.data[0].get("name", "Learning Path")

            skills_result = client.table("skills").select("id").eq("learning_path_id", lp_id).execute()
            skill_ids = [s["id"] for s in (skills_result.data or [])]
            if not skill_ids:
                return {
                    "id": f"path-{lp_id}",
                    "title": f"{path_name} Assessment",
                    "track": "Certification Track",
                    "pathName": path_name,
                    "learning_path_id": lp_id,
                    "totalQuestions": 0,
                    "timeLimitMinutes": 30,
                    "currentQuestionIndex": 0,
                    "questions": [],
                    "codeSnippet": "",
                }
            topics_result = client.table("topics").select("id").in_("skill_id", skill_ids).execute()
            topic_ids = [t["id"] for t in (topics_result.data or [])]
            if not topic_ids:
                return {
                    "id": f"path-{lp_id}",
                    "title": f"{path_name} Assessment",
                    "track": "Certification Track",
                    "pathName": path_name,
                    "learning_path_id": lp_id,
                    "totalQuestions": 0,
                    "timeLimitMinutes": 30,
                    "currentQuestionIndex": 0,
                    "questions": [],
                    "codeSnippet": "",
                }
            exams_result = client.table("exams").select("id, title, passing_score, topic_id").in_("topic_id", topic_ids).execute()
            path_exams = exams_result.data if exams_result.data else []
            if not path_exams:
                return {
                    "id": f"path-{lp_id}",
                    "title": f"{path_name} Assessment",
                    "track": "Certification Track",
                    "pathName": path_name,
                    "learning_path_id": lp_id,
                    "totalQuestions": 0,
                    "timeLimitMinutes": 30,
                    "currentQuestionIndex": 0,
                    "questions": [],
                    "codeSnippet": "",
                }
            target_exam_ids = [e["id"] for e in path_exams]
            exams_data = path_exams
        else:
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

        if learning_path_id is not None:
            # Return ALL questions across every exam in this learning path.
            # No slicing — count comes from the database.
            all_questions = []
            for exam in sorted(exams_data, key=lambda e: e["id"]):
                all_questions.extend(
                    sorted(
                        questions_by_exam.get(exam["id"], []),
                        key=lambda _: 0,
                    )
                )
            # Keep DB order (order_index) by re-sorting on the raw rows
            order = {(q["exam_id"], q["id"]): (q.get("order_index") or 0, q["id"]) for q in questions_data}
            id_to_q = {}
            for qs in questions_by_exam.values():
                for q in qs:
                    id_to_q[q["id"]] = q
            all_questions = [id_to_q[qid] for (_, qid) in sorted(order, key=lambda k: (k[0], order[k])) if qid in id_to_q]
            return {
                "id": f"path-{lp_id}",
                "title": f"{path_name} Assessment",
                "track": "Certification Track",
                "pathName": path_name,
                "learning_path_id": lp_id,
                "totalQuestions": len(all_questions),
                "timeLimitMinutes": 30,
                "currentQuestionIndex": 0,
                "questions": all_questions,
                "codeSnippet": "",
            }

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
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch assessments: {str(e)[:100]}")


@app.post("/api/assessments/{assessment_id}/submit")
def submit_assessment(assessment_id: str, payload: SubmitAnswers):
    client = get_supabase_client()
    if client is None:
        raise HTTPException(status_code=500, detail="Supabase is not configured")
    try:
        # Support both single-exam ids and aggregated learning-path ids ("path-<id>")
        question_ids: list = []
        if isinstance(assessment_id, str) and assessment_id.startswith("path-"):
            try:
                lp_id = int(assessment_id.split("path-", 1)[1])
            except (TypeError, ValueError):
                raise HTTPException(status_code=400, detail="Invalid assessment id")
            skills_result = client.table("skills").select("id").eq("learning_path_id", lp_id).execute()
            skill_ids = [s["id"] for s in (skills_result.data or [])]
            topic_ids: list = []
            if skill_ids:
                topics_result = client.table("topics").select("id").in_("skill_id", skill_ids).execute()
                topic_ids = [t["id"] for t in (topics_result.data or [])]
            exam_ids: list = []
            if topic_ids:
                exams_result = client.table("exams").select("id").in_("topic_id", topic_ids).execute()
                exam_ids = [e["id"] for e in (exams_result.data or [])]
            if exam_ids:
                questions_result = client.table("questions").select("id").in_("exam_id", exam_ids).execute()
                question_ids = [q["id"] for q in (questions_result.data or [])]
        else:
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