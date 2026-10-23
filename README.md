# Personalised Learning Path Recommendation System

DBMS Minor Project, Group 5

## About the project

This is a web application that helps students learn in a planned way. A student picks a learning path (for example Web Development or Data Science) and the app shows the skills and topics of that path in order. It keeps track of which topics are done, suggests the next topic to study, and has short quizzes for each topic.

Students can also ask questions. Every question becomes a discussion that other students and teachers can read and reply to. Teachers are approved by the admin before they get access to the Teacher Corner.

## Features

**Student**
- Sign up with email verification and log in
- Choose a learning path
- See a roadmap of skills and topics, with the next topic to study
- Mark topics as complete and see progress in percent
- Take topic quizzes and see past scores
- Ask questions, reply to discussions and mark own questions as resolved

**Teacher**
- Apply to become a teacher from the signup page
- After approval, use the Teacher Corner to see questions sorted into Open, Answered and Resolved
- Reply to questions (replies are tagged as Teacher)
- See own teacher details on the profile page

**Admin**
- Add courses, skills, topics, resources, quizzes and questions
- Accept or reject teacher applications
- Read every discussion (admins cannot post)
- Get notified about new teacher applications

## How the recommendation works

1. Each learning path is split into skills, and each skill into topics, kept in a fixed order.
2. The app stores every student's progress for each topic in the `student_progress` table.
3. The dashboard looks at the student's chosen path and recommends the first topic that is not completed yet.
4. Progress is calculated as completed topics divided by total topics in the path.
5. Quiz results are stored for every attempt, so the profile page can show the latest score for each quiz.

## Tech stack

| Part | Used |
|---|---|
| Frontend | HTML, JavaScript, Tailwind CSS (CDN) |
| Backend | Python, FastAPI |
| Database | PostgreSQL on Supabase |
| Login | Clerk (email and password, or email code) |

## Database tables

| Table | What it stores |
|---|---|
| students | Name, email and chosen learning path of every user |
| learning_paths | The courses a student can choose |
| skills | Skills inside a learning path, with order |
| topics | Topics inside a skill, with difficulty and estimated hours |
| resources | Links to study material for a topic |
| student_progress | Which topics each student has completed |
| exams | Quizzes for a topic, with passing score |
| questions | Questions of a quiz |
| question_options | Options for each question, one is marked correct |
| exam_attempts | Each time a student submits a quiz |
| student_answers | The option picked for each question in an attempt |
| results | Score and pass or fail for each attempt |
| teacher_applications | Teacher applications and the admin decision |
| doubts | Questions asked by students |
| discussion_replies | Replies to a question, tagged student or teacher |
| notifications | In-app messages for students, teachers and admins |

Main relationships:
- learning_paths 1 to many skills, skills 1 to many topics
- topics 1 to many resources and exams, exams 1 to many questions
- students many to many topics through student_progress
- students 1 to many exam_attempts, each attempt has one result
- students 1 to many doubts, doubts 1 to many discussion_replies

## Folder structure

```
backend/
  app.py        main API: login, courses, progress, quizzes, admin
  doubts.py     questions, discussions, teacher applications, notifications
frontend/
  login.html          login and signup
  dashboard.html      roadmap and next topic
  courses.html        all learning paths
  course.html         topics, resources and quiz links
  assessments.html    quiz page
  profile.html        progress and quiz history
  select-path.html    choose a learning path
  doubts.html         ask and browse questions
  doubt.html          one discussion
  teacher.html        Teacher Corner
  teacher-apply.html  teacher application form
  admin.html          admin panel
  common.js           shared helpers used by every page
```

## How to run

1. Install Python 3.10 or newer.
2. Install the packages:
   ```
   pip install fastapi uvicorn supabase python-dotenv "pyjwt[crypto]"
   ```
3. Create a file named `.env` in the main project folder (next to `backend/`) with these values:
   ```
   SUPABASE_URL=
   SUPABASE_SECRET_KEY=
   ADMIN_EMAILS=
   CLERK_PUBLISHABLE_KEY=
   CLERK_SECRET_KEY=
   ```
   `ADMIN_EMAILS` is a comma separated list of emails that get admin access.
4. Run the SQL file `doubts.sql` once in the Supabase SQL editor. It creates the tables for questions, discussions, teacher applications and notifications. This file is not in the repository, so ask a team member for it.
5. Start the server:
   ```
   cd backend
   uvicorn app:app --host 127.0.0.1 --port 8081
   ```
6. Open http://localhost:8081 in the browser.

