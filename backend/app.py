"""LearnFlow backend: FastAPI + Supabase (database) + Clerk (auth)."""
import base64
import json
import os
import time
import urllib.request
import threading
from concurrent.futures import ThreadPoolExecutor
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Optional
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from supabase import create_client
import jwt
from jwt import PyJWKClient
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SECRET_KEY", "")
ADMIN_EMAILS = {e.strip().lower() for e in os.getenv("ADMIN_EMAILS", "").split(",") if e.strip()}
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY", "")
CLERK_PUB_KEY = os.getenv("CLERK_PUBLISHABLE_KEY", "") or os.getenv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "")
CLERK_JWKS_URL = os.getenv("CLERK_JWKS_URL", "")  # optional override; else derived from publishable key
app = FastAPI(title="Learning App API")
@app.middleware("http")
async def revalidate_static(request, call_next):
    res = await call_next(request)  # without this, browsers keep running stale HTML/JS after an update
    if not request.url.path.startswith("/api/"):
        res.headers["Cache-Control"] = "no-cache"
    return res
bearer = HTTPBearer(auto_error=False)
_jwks_client = None
_profile_cache: Dict[str, dict] = {}
CLERK_UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Authorization": f"Bearer {CLERK_SECRET_KEY}", "Content-Type": "application/json"}
_local = threading.local()
# Pool tasks must be single queries that never wait on other pool tasks, or a busy pool can deadlock.
POOL = ThreadPoolExecutor(16)
def sb():  # one client per thread: reuses its HTTPS connection, and httpx's HTTP/2 client is not thread-safe
    if not hasattr(_local, "client"):
        _local.client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _local.client
def role_of(email: str) -> str:
    return "admin" if (email or "").lower() in ADMIN_EMAILS else "student"
def teacher_application(student_id):
    try: return one("teacher_applications", {"student_id": student_id})
    except Exception: return None  # table missing until doubts.sql has run; login must keep working
class SyncRequest(BaseModel):
    full_name: Optional[str] = None
    learning_path_id: Optional[int] = None
class PathRequest(BaseModel):
    learning_path_id: int
class SubmitRequest(BaseModel):
    answers: Dict[str, int]
def select(table, filters=None, in_col=None, in_vals=None, order=None, desc=False, cols="*"):
    q = sb().table(table).select(cols)
    for k, v in (filters or {}).items():
        q = q.eq(k, v)
    if in_col:
        if not in_vals:
            return []
        q = q.in_(in_col, in_vals)
    if order:
        q = q.order(order, desc=desc)
    return q.execute().data or []
def one(table, filters=None, cols="*"):
    rows = select(table, filters, cols=cols)
    return rows[0] if rows else None
def friendly_error(exc):
    msg = str(exc.args[0] if exc.args else exc)
    if "duplicate key" in msg:
        return "An item with that name already exists."
    return "Invalid resource type. Allowed: doc, video, other." if "resource_type" in msg else "Database write failed."
def insert(table, data):
    try: return sb().table(table).insert(data).execute().data or []
    except Exception as exc:
        raise HTTPException(status_code=400, detail=friendly_error(exc)) from exc
def need_row(table, row_id, name="Item"):
    row = one(table, {"id": row_id})
    if not row:
        raise HTTPException(status_code=404, detail=f"{name} not found")
    return row
def pct(part, total): return round((part / total) * 100) if total else 0
def clerk_frontend_api() -> str:
    if CLERK_JWKS_URL:
        return CLERK_JWKS_URL.split("/.well-known/")[0]
    try:  # publishable key embeds the Frontend API domain as base64
        raw = CLERK_PUB_KEY.split("_", 2)[2] + "=="
        return f"https://{base64.b64decode(raw).decode().split('$')[0]}"
    except Exception:
        return ""
def clerk_jwks_url() -> str:
    base = clerk_frontend_api()
    return f"{base}/.well-known/jwks.json" if base else ""
def verify_clerk_token(token: str) -> dict:
    global _jwks_client
    url, iss = clerk_jwks_url(), clerk_frontend_api()
    if not url or not iss:
        raise HTTPException(status_code=500, detail="Authentication is not configured")
    try:
        _jwks_client = _jwks_client or PyJWKClient(url, cache_keys=True)
        key = _jwks_client.get_signing_key_from_jwt(token).key
        return jwt.decode(token, key, algorithms=["RS256"], issuer=[iss, iss.rstrip("/") + "/"],
                          leeway=30, options={"verify_aud": False})  # session tokens carry no aud claim
    except HTTPException:
        raise
    except jwt.ExpiredSignatureError as exc:
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.") from exc
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired session token") from exc
def clerk_profile(user_id: str) -> dict:
    if user_id in _profile_cache:
        return _profile_cache[user_id]
    prof = {"email": "", "legacy_id": None}
    if CLERK_SECRET_KEY:
        try:  # UA header required: api.clerk.com is Cloudflare-shielded and blocks bare urllib
            req = urllib.request.Request(f"https://api.clerk.com/v1/users/{user_id}", headers=CLERK_UA)
            with urllib.request.urlopen(req, timeout=10) as res:
                data = json.load(res)
            addrs = data.get("email_addresses", [])
            prim = next((a for a in addrs if a.get("id") == data.get("primary_email_address_id")), (addrs or [{}])[0])
            prof = {"email": prim.get("email_address", ""),
                    "legacy_id": (data.get("public_metadata") or {}).get("legacy_supabase_id")}
        except Exception:
            return prof  # not cached: a passing Clerk outage must not stick until restart
    _profile_cache[user_id] = prof
    return prof
def is_uuid(v):
    try:
        uuid.UUID(str(v))
        return True
    except ValueError:
        return False
def lookup_student(clerk_id, email, legacy_id=None):
    if legacy_id and is_uuid(legacy_id):
        hit = one("students", {"id": legacy_id})  # explicit migration mapping wins over email
        if hit:
            return hit
    # students.id is a uuid column; Clerk ids ("user_...") can't be queried against it
    return (is_uuid(clerk_id) and one("students", {"id": clerk_id})) or (one("students", {"email": email}) if email else None)
def get_student_row(clerk_id, email, full_name=None, learning_path_id=None, legacy_id=None):
    found = lookup_student(clerk_id, email, legacy_id)  # explicit mapping, then id, then verified email; never duplicates
    patch = {}
    if full_name and (not found or not found.get("full_name")):
        patch["full_name"] = full_name
    if learning_path_id and (not found or not found.get("learning_path_id")):
        patch["learning_path_id"] = learning_path_id
    if found:
        if patch:
            try:
                res = sb().table("students").update(patch).eq("id", found["id"]).execute()
                if res and res.data:
                    return res.data[0]
            except Exception as err:
                print(f"Notice: could not update student profile: {err}")
            found.update(patch)
        return found
    row = {"email": email, "full_name": full_name or (email.split("@")[0].title() if email else "Student")}
    row["id"] = clerk_id if is_uuid(clerk_id) else str(uuid.uuid4())  # students.id is uuid with no DB default
    if learning_path_id:
        row["learning_path_id"] = learning_path_id
    try:
        res = sb().table("students").upsert(row).execute()
        if res and res.data:
            return res.data[0]
    except Exception as err:
        print(f"Notice: could not save student profile: {err}")
    return row
def current_user(creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer)):
    if not creds or creds.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Missing or invalid authorization token")
    payload = verify_clerk_token(creds.credentials)
    clerk_id = payload.get("sub", "")
    if not clerk_id:
        raise HTTPException(status_code=401, detail="Invalid or expired session token")
    prof = clerk_profile(clerk_id)  # shortcut: cached for the process lifetime, add a TTL if user emails change often
    email = prof["email"] or payload.get("email", "")  # email always server-resolved, never trusted from the client
    if not email:  # without it we can't find the right student row and would create an empty duplicate
        raise HTTPException(status_code=503, detail="Could not verify your account right now. Please try again.")
    legacy_id = prof["legacy_id"]  # explicit Supabase->Clerk migration mapping
    return {"user": {"id": clerk_id, "email": email}, "legacy_id": legacy_id,
            "student": lookup_student(clerk_id, email, legacy_id), "role": role_of(email)}
def need_student(creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer)):
    ctx = current_user(creds)  # profile row is created by /api/auth/sync (post-OTP) or here on first use
    return ctx["student"] or get_student_row(ctx["user"]["id"], ctx["user"]["email"], legacy_id=ctx.get("legacy_id"))
def need_admin(creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer)):
    ctx = current_user(creds)
    if ctx["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return ctx
def course_summary(student_id):
    jobs = [POOL.submit(select, "learning_paths", order="id"), POOL.submit(select, "skills", order="order_index"),  # ~200ms each, so run together
            POOL.submit(select, "topics", order="order_index"), POOL.submit(select, "student_progress", {"student_id": student_id})]
    paths, skills, topics, progress = [j.result() for j in jobs]
    done = {r["topic_id"] for r in progress if r.get("status") == "completed"}
    by_path, by_skill = {}, {}
    for s in skills:
        by_path.setdefault(s["learning_path_id"], []).append(s)
    for t in topics:
        by_skill.setdefault(t["skill_id"], []).append(t)
    def summ(p):
        pts = [t for s in by_path.get(p["id"], []) for t in by_skill.get(s["id"], [])]
        n = sum(1 for t in pts if t["id"] in done)
        skills_view = [{"id": s["id"], "name": s["name"],
                        "topics": [{**t, "status": "completed" if t["id"] in done else "not_started"} for t in by_skill.get(s["id"], [])]}
                       for s in by_path.get(p["id"], [])]
        return {"id": p["id"], "name": p["name"], "description": p.get("description", ""), "completed_topics": n,
                "total_topics": len(pts), "progress_percentage": pct(n, len(pts)), "topics": pts, "skills": skills_view}
    return [summ(p) for p in paths], topics, done
def exam_scores(student_id):
    out = {}  # newest first, so the first row per exam is the latest score
    for a in select("exam_attempts", {"student_id": student_id}, order="id", desc=True, cols="*, results(*)"):
        eid, raw = a.get("exam_id"), a.get("results")
        r = raw[0] if isinstance(raw, list) and raw else raw
        if eid not in out and isinstance(r, dict):
            out[eid] = {"score_text": f"{r.get('correct_answers', 0)}/{r.get('total_questions', 0)} ({round(r.get('score_percent', 0))}%)",
                        "passed": bool(r.get("passed")), "status": "Passed" if r.get("passed") else "Failed"}
    return out
def save_topic(student_id, topic_id, new_status):
    need_row("topics", topic_id, "Topic")
    stamp = datetime.now(timezone.utc).isoformat() if new_status == "completed" else None
    old = one("student_progress", {"student_id": student_id, "topic_id": topic_id})
    data = {"status": new_status, "completed_at": stamp}
    try:
        if old:
            sb().table("student_progress").update(data).eq("id", old["id"]).execute()
        else:
            sb().table("student_progress").insert({"student_id": student_id, "topic_id": topic_id, **data}).execute()
    except Exception as exc:
        print(f"Error updating progress: {exc}")
        raise HTTPException(status_code=500, detail="Could not save your progress.") from exc
    return {"status": new_status, "topic_id": topic_id}
@app.get("/api/health")
def health(): return {"ok": True}
@app.get("/api/config")
def config(): return {"publishableKey": CLERK_PUB_KEY}  # public key only; secret never leaves the backend
@app.post("/api/auth/sync")
def sync(body: SyncRequest, ctx=Depends(current_user)):
    name = (body.full_name or "").strip() or None  # pending name/path from signup, applied once after OTP verification
    pid = body.learning_path_id if body.learning_path_id and one("learning_paths", {"id": body.learning_path_id}) else None
    if body.learning_path_id and not pid:
        raise HTTPException(status_code=404, detail="Learning path not found")
    student = get_student_row(ctx["user"]["id"], ctx["user"]["email"], name, pid, ctx.get("legacy_id"))
    appl = teacher_application(student["id"]) if student.get("id") else None
    role = full_role(ctx["role"], appl)
    print(f"auth.sync ok clerk={ctx['user']['id']} student={student.get('id')} role={role}")  # ids only, never tokens/secrets
    return {"user": ctx["user"], "student": student, "role": role, "application": appl and appl["status"]}
def full_role(role, appl): return "teacher" if role == "student" and appl and appl["status"] == "accepted" else role
@app.get("/api/auth/me")
def me(ctx=Depends(current_user)):
    appl = teacher_application(ctx["student"]["id"]) if ctx["student"] else None
    return {"student": ctx["student"], "role": full_role(ctx["role"], appl), "user": ctx["user"]}
@app.get("/api/learning-paths")
def list_paths(): return {"learning_paths": select("learning_paths", order="id")}  # public: signup dropdown loads before login
@app.post("/api/select-path")
def pick_path(body: PathRequest, student=Depends(need_student)):
    if not one("learning_paths", {"id": body.learning_path_id}):
        raise HTTPException(status_code=404, detail="Learning path not found")
    try:
        res = sb().table("students").update({"learning_path_id": body.learning_path_id}).eq("id", student["id"]).execute()
        if res and res.data: return {"student": res.data[0]}
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Could not save learning path.") from exc
    student["learning_path_id"] = body.learning_path_id
    return {"student": student}
@app.get("/api/dashboard")
def dashboard(student=Depends(need_student)):
    courses, topics, done = course_summary(student["id"])
    picked = student.get("learning_path_id")
    ordered = sorted(courses, key=lambda c: (0 if picked and c["id"] == picked else 1, c["id"]))
    current = next(({"id": c["id"], "name": c["name"], "topic_id": t["id"], "topic_name": t["name"]}
                    for c in ordered for t in c["topics"] if t["id"] not in done), None)
    if not current and courses:
        first, topic = courses[0], (courses[0]["topics"] or [None])[0]
        current = {"id": first["id"], "name": first["name"], "topic_id": topic["id"] if topic else None,
                   "topic_name": topic["name"] if topic else "No topics available"}
    mine = next((c for c in courses if c["id"] == picked), None)
    progress = ({"name": mine["name"], "completed_topics": mine["completed_topics"], "total_topics": mine["total_topics"],
                 "percentage": mine["progress_percentage"]} if mine else
                {"completed_topics": len(done), "total_topics": len(topics), "percentage": pct(len(done), len(topics))})
    roadmap = {"id": mine["id"], "name": mine["name"], "skills": mine["skills"]} if mine else None
    return {"student": student, "overall_progress": progress, "current_course": current, "roadmap": roadmap}
@app.get("/api/courses")
def list_courses(student=Depends(need_student)):
    courses, _, _ = course_summary(student["id"])
    keys = ("id", "name", "description", "completed_topics", "total_topics", "progress_percentage")
    return {"courses": [{k: c[k] for k in keys} for c in courses]}
@app.get("/api/courses/{course_id}")
def course_detail(course_id: int, student=Depends(need_student)):
    jobs = (POOL.submit(need_row, "learning_paths", course_id, "Course"),  # skills arrive with topics, resources and exams embedded
            POOL.submit(select, "skills", {"learning_path_id": course_id}, order="order_index",
                        cols="*, topics(*, resources(*), exams(id, title, passing_score))"),
            POOL.submit(select, "student_progress", {"student_id": student["id"]}))
    path, skills, progress = [j.result() for j in jobs]
    status_of = {r["topic_id"]: r.get("status", "not_started") for r in progress}
    by_order = lambda rows: sorted(rows or [], key=lambda r: (r.get("order_index") or 0, r["id"]))
    def topic_view(t):
        return {"id": t["id"], "name": t["name"], "description": t.get("description"), "difficulty": t.get("difficulty"),
                "estimated_hours": t.get("estimated_hours"), "status": status_of.get(t["id"], "not_started"),
                "resources": by_order(t.get("resources")),
                "exams": [{"id": e["id"], "title": e["title"], "passing_score": e.get("passing_score", 60)}
                          for e in sorted(t.get("exams") or [], key=lambda e: e["id"])]}
    out = [{"id": s["id"], "name": s["name"], "description": s.get("description"),
            "topics": [topic_view(t) for t in by_order(s.get("topics"))]} for s in skills]
    topics = [t for s in out for t in s["topics"]]
    n = sum(1 for t in topics if status_of.get(t["id"]) == "completed")
    return {"id": path["id"], "name": path["name"], "description": path.get("description"), "skills": out,
            "progress": {"completed_topics": n, "total_topics": len(topics), "progress_percentage": pct(n, len(topics))}}
@app.post("/api/topics/{topic_id}/complete")
def complete(topic_id: int, student=Depends(need_student)): return save_topic(student["id"], topic_id, "completed")
@app.post("/api/topics/{topic_id}/uncomplete")
def uncomplete(topic_id: int, student=Depends(need_student)): return save_topic(student["id"], topic_id, "not_started")
@app.get("/api/assessments/{exam_id}")
def assessment(exam_id: int, student=Depends(need_student)):
    je = POOL.submit(need_row, "exams", exam_id, "Assessment")  # options come embedded with their questions
    jq = POOL.submit(select, "questions", {"exam_id": exam_id}, order="order_index",
                     cols="id, question_text, question_options(id, question_id, option_text)")
    exam, questions = je.result(), jq.result()
    return {"id": exam["id"], "title": exam["title"], "passing_score": exam.get("passing_score", 60),
            "questions": [{"id": q["id"], "question_text": q["question_text"],
                           "options": sorted(q.get("question_options") or [], key=lambda o: o["id"])} for q in questions]}
@app.post("/api/assessments/{exam_id}/submit")
def submit(exam_id: int, body: SubmitRequest, student=Depends(need_student)):
    exam = need_row("exams", exam_id, "Assessment")
    qids = [q["id"] for q in select("questions", {"exam_id": exam_id}, cols="id")]
    opts = select("question_options", in_col="question_id", in_vals=qids, cols="id, question_id, is_correct")
    correct = {o["question_id"]: o["id"] for o in opts if o.get("is_correct")}
    valid = {(o["question_id"], o["id"]) for o in opts}
    score, rows = 0, []
    for qid in qids:
        picked = body.answers.get(str(qid), body.answers.get(qid))
        if (qid, picked) in valid:  # ignores option ids that belong to another question
            rows.append({"question_id": qid, "selected_option_id": picked})
            score += (correct.get(qid) == picked)
    total, now = len(qids), datetime.now(timezone.utc).isoformat()
    passed = pct(score, total) >= exam.get("passing_score", 60)
    try:
        aid = sb().table("exam_attempts").insert({"student_id": student["id"], "exam_id": exam_id, "started_at": now,
              "submitted_at": now, "status": "submitted"}).execute().data[0]["id"]
        sb().table("results").insert({"attempt_id": aid, "total_questions": total, "correct_answers": score,
              "score_percent": pct(score, total), "passed": passed, "graded_at": now}).execute()
        for r in rows:
            r["attempt_id"] = aid
        if rows:
            sb().table("student_answers").insert(rows).execute()
    except Exception as exc:
        print(f"Error saving assessment submission: {exc}")
        raise HTTPException(status_code=500, detail="Could not save your answers. Please try again.") from exc
    return {"exam_id": exam_id, "score": score, "total": total, "percentage": pct(score, total), "passed": passed}
@app.get("/api/profile")
def profile(student=Depends(need_student)):
    je, jx = POOL.submit(select, "exams", order="id"), POOL.submit(exam_scores, student["id"])
    courses, topics, done = course_summary(student["id"])  # runs on this thread; it uses the pool itself
    exams, scores = je.result(), jx.result()
    names = {t["id"]: t["name"] for t in topics}
    prog = {"completed_topics": len(done), "total_topics": len(topics), "percentage": pct(len(done), len(topics))}
    mine = next((c for c in courses if c["id"] == student.get("learning_path_id")), None)
    path = {"name": mine["name"], "completed_topics": mine["completed_topics"], "total_topics": mine["total_topics"],
            "percentage": mine["progress_percentage"]} if mine else None
    return {"student": student, "overall_progress": prog, "path_progress": path,
            "assessment_scores": [{"exam_id": e["id"], "title": e["title"], "topic_name": names.get(e.get("topic_id"), "General"),
                                   "score": scores.get(e["id"], {}).get("score_text", "--"),
                                   "status": scores.get(e["id"], {}).get("status", "Not attempted")} for e in exams]}
def admin_create(table, body: dict, parent=None):
    if parent and not one(parent[0], {"id": body.get(parent[2])}): raise HTTPException(status_code=404, detail=f"{parent[1]} not found")
    return insert(table, body)[0]
@app.get("/api/admin/overview")
def overview(admin=Depends(need_admin)):
    jobs = [POOL.submit(select, "learning_paths", order="id"), POOL.submit(select, "skills", order="order_index"),
            POOL.submit(select, "topics", order="order_index"), POOL.submit(select, "resources", order="order_index"),
            POOL.submit(select, "exams", order="id"), POOL.submit(select, "questions", cols="id, exam_id"),
            POOL.submit(select, "students", cols="id")]
    paths, skills, topics, resources, exams, questions, students = [j.result() for j in jobs]
    counts = {}
    for q in questions:
        counts[q["exam_id"]] = counts.get(q["exam_id"], 0) + 1
    t_by_skill, s_by_path, e_by_topic = {}, {}, {}
    for t in topics:
        t_by_skill.setdefault(t["skill_id"], []).append(t)
    for s in skills:
        s_by_path.setdefault(s["learning_path_id"], []).append(s)
    for e in exams:
        e_by_topic.setdefault(e["topic_id"], []).append({"id": e["id"], "title": e["title"], "question_count": counts.get(e["id"], 0)})
    courses = [{"id": p["id"], "name": p["name"], "description": p.get("description", ""),
                "skills": [{"id": s["id"], "name": s["name"], "topic_count": len(t_by_skill.get(s["id"], [])),
                            "topics": [{"id": t["id"], "name": t["name"], "exams": e_by_topic.get(t["id"], [])} for t in t_by_skill.get(s["id"], [])]}
                           for s in s_by_path.get(p["id"], [])]} for p in paths]
    stats = {"courses": len(paths), "skills": len(skills), "topics": len(topics), "resources": len(resources),
             "exams": len(exams), "questions": len(questions), "students": len(students)}
    return {"stats": stats, "courses": courses}
@app.post("/api/admin/courses", status_code=201)
def c_create(body: dict, admin=Depends(need_admin)): return admin_create("learning_paths", body)
@app.post("/api/admin/skills", status_code=201)
def s_create(body: dict, admin=Depends(need_admin)): return admin_create("skills", body, ("learning_paths", "Course", "learning_path_id"))
@app.post("/api/admin/topics", status_code=201)
def t_create(body: dict, admin=Depends(need_admin)): return admin_create("topics", body, ("skills", "Skill", "skill_id"))
@app.post("/api/admin/resources", status_code=201)
def r_create(body: dict, admin=Depends(need_admin)): return admin_create("resources", body, ("topics", "Topic", "topic_id"))
@app.post("/api/admin/exams", status_code=201)
def e_create(body: dict, admin=Depends(need_admin)): return admin_create("exams", body, ("topics", "Topic", "topic_id"))
@app.get("/api/admin/exams/{eid}/questions")
def e_questions(eid: int, admin=Depends(need_admin)):
    need_row("exams", eid, "Exam")
    questions = select("questions", {"exam_id": eid}, order="order_index")
    opts = select("question_options", in_col="question_id", in_vals=[q["id"] for q in questions], order="id")
    by_q = {}
    for o in opts:
        by_q.setdefault(o["question_id"], []).append(o)
    return {"questions": [{**q, "options": by_q.get(q["id"], [])} for q in questions]}
@app.post("/api/admin/questions", status_code=201)
def q_create(body: dict, admin=Depends(need_admin)):
    if not one("exams", {"id": body.get("exam_id")}): raise HTTPException(status_code=404, detail="Exam not found")
    opts = body.pop("options", None)
    existing = select("questions", {"exam_id": body["exam_id"]}, cols="order_index")
    body["order_index"] = max((q["order_index"] or 0 for q in existing), default=0) + 1  # seeded exams number from 1
    question = insert("questions", body)[0]
    saved = insert("question_options", [{**o, "question_id": question["id"]} for o in opts]) if opts else []
    return {**question, "options": saved}
import doubts  # noqa: E402,F401  registers the doubts/teacher routes; must come before the catch-all static mount
app.mount("/", StaticFiles(directory=Path(__file__).resolve().parent.parent / "frontend", html=True), name="frontend")
