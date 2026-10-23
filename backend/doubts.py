"""Doubts, community discussions, teacher applications and notifications.
Imported by app.py just before the static mount, so these routes reuse app's helpers and Clerk auth."""
from datetime import datetime, timezone
from typing import Literal
from fastapi import Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from app import app, current_user, insert, need_admin, need_row, need_student, one, role_of, sb, select, teacher_application

class Form(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)  # "   " counts as empty
class DoubtIn(Form):
    learning_path_id: int
    question: str = Field(min_length=1, max_length=4000)
class MessageIn(Form):
    body: str = Field(min_length=1, max_length=4000)
class ApplicationIn(Form):
    qualification: str = Field(min_length=1, max_length=200)
    institution: str = Field(min_length=1, max_length=200)
    experience_years: int = Field(ge=0, le=70)
    subjects: str = Field(min_length=1, max_length=1000)
    skills: str = Field(default="", max_length=1000)
    introduction: str = Field(min_length=1, max_length=2000)
class DecisionIn(BaseModel):
    decision: Literal["accept", "reject"]

DOUBT_COLS = "*, learning_paths(name), students(full_name)"
def now(): return datetime.now(timezone.utc).isoformat()
def is_teacher(student):  # teacher permission exists only once an admin accepted the application
    appl = teacher_application(student["id"])
    return bool(appl and appl["status"] == "accepted")
def is_admin(student): return role_of(student.get("email")) == "admin"
def need_teacher(student=Depends(need_student)):
    if not is_admin(student) and not is_teacher(student):  # admins may look at Teacher Corner, read-only
        raise HTTPException(status_code=403, detail="Only approved teachers can open Teacher Corner")
    return student
def notify(message, link="", recipient_id=None, for_admins=False):
    try:
        sb().table("notifications").insert({"recipient_id": recipient_id, "for_admins": for_admins,
                                            "message": message, "link": link}).execute()
    except Exception as exc:  # a missed notification must not undo the answer or decision that caused it
        print(f"Notice: could not save notification: {exc}")
def doubt_view(d, student):  # author name only; emails and student ids stay on the server
    return {"id": d["id"], "kind": d["kind"], "status": d["status"], "question": d["question"], "created_at": d["created_at"],
            "learning_path_id": d["learning_path_id"], "learning_path": (d.get("learning_paths") or {}).get("name", ""),
            "author": (d.get("students") or {}).get("full_name") or "Student", "mine": d["student_id"] == student["id"]}
def need_poster(student=Depends(need_student)):
    if is_admin(student):
        raise HTTPException(status_code=403, detail="Admins can view discussions but cannot post in them")
    return student
def need_doubt(doubt_id, student):  # returns (doubt, asked_by_this_user)
    d = one("doubts", {"id": doubt_id, "kind": "public"}, cols=DOUBT_COLS)  # legacy private rows stay hidden
    if not d:
        raise HTTPException(status_code=404, detail="Question not found")
    return d, d["student_id"] == student["id"]

@app.post("/api/doubts", status_code=201)
def ask(body: DoubtIn, student=Depends(need_poster)):
    need_row("learning_paths", body.learning_path_id, "Learning path")
    return insert("doubts", {"student_id": student["id"], "kind": "public", **body.model_dump()})[0]
@app.get("/api/doubts/mine")
def my_doubts(student=Depends(need_student)):
    rows = select("doubts", {"student_id": student["id"], "kind": "public"}, order="id", desc=True, cols=DOUBT_COLS)
    return {"doubts": [doubt_view(d, student) for d in rows]}
@app.get("/api/discussions")
def discussions(student=Depends(need_student)):
    # shortcut: returns every public discussion, add paging with .range() once there are hundreds
    rows = select("doubts", {"kind": "public"}, order="id", desc=True, cols=DOUBT_COLS)
    return {"discussions": [doubt_view(d, student) for d in rows]}
@app.get("/api/doubts/{doubt_id}")
def doubt_detail(doubt_id: int, student=Depends(need_student)):
    d, owner = need_doubt(doubt_id, student)
    msgs = select("discussion_replies", {"doubt_id": doubt_id}, order="id", cols="*, students(full_name)")
    open_ = d["status"] != "resolved" and not is_admin(student)
    return {"doubt": {**doubt_view(d, student), "can_resolve": owner and open_, "can_reply": open_},
            "messages": [{"id": m["id"], "author": (m.get("students") or {}).get("full_name") or "Student",
                          "author_role": m["author_role"], "body": m["body"], "created_at": m["created_at"],
                          "mine": m["author_id"] == student["id"]} for m in msgs]}
@app.post("/api/doubts/{doubt_id}/messages", status_code=201)
def reply(doubt_id: int, body: MessageIn, student=Depends(need_poster)):
    d, owner = need_doubt(doubt_id, student)
    if d["status"] == "resolved":
        raise HTTPException(status_code=400, detail="This question is resolved, so it is closed for replies.")
    msg = insert("discussion_replies", {"doubt_id": doubt_id, "author_id": student["id"],
                                        "author_role": "teacher" if is_teacher(student) else "student", "body": body.body})[0]
    # an answer moves the doubt out of the open queue; the asker's follow-up puts it back
    sb().table("doubts").update({"status": "open" if owner else "answered"}).eq("id", doubt_id).neq("status", "resolved").execute()
    if not owner:
        notify(f"{student.get('full_name') or 'Someone'} replied to your discussion.", f"doubt.html?id={doubt_id}", recipient_id=d["student_id"])
    return msg
@app.post("/api/doubts/{doubt_id}/resolve")
def resolve(doubt_id: int, student=Depends(need_poster)):
    _, owner = need_doubt(doubt_id, student)
    if not owner:
        raise HTTPException(status_code=403, detail="Only the person who asked can mark it resolved")
    sb().table("doubts").update({"status": "resolved"}).eq("id", doubt_id).execute()
    return {"id": doubt_id, "status": "resolved"}

@app.get("/api/teacher/doubts")
def teacher_queue(teacher=Depends(need_teacher)):
    rows = select("doubts", {"kind": "public"}, order="id", cols=DOUBT_COLS)  # oldest first, so nobody waits forever
    return {"doubts": [doubt_view(d, teacher) for d in rows]}
@app.get("/api/teacher/application")
def my_application(student=Depends(need_student)):
    appl = teacher_application(student["id"])
    keys = ("full_name", "email", "qualification", "institution", "experience_years", "subjects", "skills", "introduction", "status", "created_at")
    return {"application": {k: appl[k] for k in keys} if appl else None,  # reviewer email stays admin-only
            "account": {"full_name": student.get("full_name", ""), "email": student.get("email", "")}}
@app.post("/api/teacher/application", status_code=201)
def apply(body: ApplicationIn, student=Depends(need_student)):
    if teacher_application(student["id"]):
        raise HTTPException(status_code=409, detail="You have already applied. Your application status is shown below.")
    insert("teacher_applications", {"student_id": student["id"], "full_name": student.get("full_name") or "",
                                    "email": student.get("email") or "", **body.model_dump()})  # name/email from the verified account
    notify(f"New teacher application from {student.get('full_name') or student.get('email')}.", "admin.html#teacher-applications", for_admins=True)
    return my_application(student)

@app.get("/api/admin/teacher-applications")
def applications(admin=Depends(need_admin)):
    return {"applications": select("teacher_applications", order="id", desc=True)}
@app.post("/api/admin/teacher-applications/{app_id}/decision")
def decide(app_id: int, body: DecisionIn, admin=Depends(need_admin)):
    new = "accepted" if body.decision == "accept" else "rejected"
    # only a pending row is updated, so a second or conflicting click can never flip an earlier decision
    res = (sb().table("teacher_applications").update({"status": new, "reviewed_by": admin["user"]["email"], "reviewed_at": now()})
           .eq("id", app_id).eq("status", "pending").execute())
    if not res.data:
        row = need_row("teacher_applications", app_id, "Application")
        raise HTTPException(status_code=409, detail=f"This application was already {row['status']}.")
    notify(f"Your teacher application was {new}.", "teacher-apply.html", recipient_id=res.data[0]["student_id"])
    return res.data[0]

def mine(query, ctx):  # notifications addressed to this user, plus the shared admin ones for admins
    ors = ([f"recipient_id.eq.{ctx['student']['id']}"] if ctx["student"] else []) + (["for_admins.is.true"] if ctx["role"] == "admin" else [])
    return query.or_(",".join(ors)) if ors else None
@app.get("/api/notifications")
def notifications(ctx=Depends(current_user)):
    q = mine(sb().table("notifications").select("id, message, link, created_at").is_("read_at", "null").order("id", desc=True).limit(50), ctx)
    return {"notifications": q.execute().data if q else []}
@app.post("/api/notifications/read")
def read_all(ctx=Depends(current_user)):
    q = mine(sb().table("notifications").update({"read_at": now()}).is_("read_at", "null"), ctx)
    if q:
        q.execute()
    return {"ok": True}
