courses = [
    {
        "id": "advanced-react-ai",
        "title": "Advanced React & AI Engineering",
        "description": "Master modern concurrent React patterns, custom hooks, and seamless LLM API integrations.",
        "category": "AI & Fullstack",
        "level": "Intermediate to Advanced",
        "estimatedTime": "6 weeks (42 Hours)",
    },
    {
        "id": "python-llm-infra",
        "title": "Python LLM Infrastructure",
        "description": "Build production ready async API gateways, LangChain workflows, and vLLM deployment instances.",
        "category": "Python & LLM Ops",
        "level": "Intermediate",
        "estimatedTime": "4 weeks",
    },
    {
        "id": "rag-vector-search",
        "title": "RAG Architectures & Vector Search",
        "description": "Master embedding generation, hybrid search, Pinecone indexing, and context window optimization.",
        "category": "Vector DB & RAG",
        "level": "Advanced",
        "estimatedTime": "5 weeks",
    },
]

resources = [
    {
        "id": "res-1",
        "title": "Mastering Next.js 14 Server Actions & Form Handling",
        "category": "Interactive Labs",
        "type": "Interactive Lab",
        "duration": "45 mins",
        "level": "Advanced",
        "description": "Hands-on tutorial with live sandbox code environments.",
    },
    {
        "id": "res-2",
        "title": "Prompt Engineering Architecture Guide 2026",
        "category": "Articles & Guides",
        "type": "Article",
        "duration": "15 mins read",
        "level": "All Levels",
        "description": "System prompt construction, chain-of-thought formatting, and few-shot optimization.",
    },
    {
        "id": "res-3",
        "title": "Building Production Vector Search with Supabase",
        "category": "Video Tutorials",
        "type": "Video",
        "duration": "28 mins",
        "level": "Intermediate",
        "description": "Installing pgvector, computing embeddings, and running similarity queries.",
    },
    {
        "id": "res-4",
        "title": "Python Asyncio Deep Dive & Microservice Patterns",
        "category": "Documentation",
        "type": "Documentation",
        "duration": "30 mins read",
        "level": "Advanced",
        "description": "Task groups, event loop tuning, and async database connections.",
    },
]

assessments = [
    {
        "id": "python-fundamentals-quiz",
        "title": "Python Fundamentals Assessment",
        "totalQuestions": 3,
        "timeLimitMinutes": 30,
        "questions": [
            {
                "id": 1,
                "questionText": "What happens when you print a variable declared inside a function without returning it?",
                "options": ["Global Scope Reference", "NameError: name is not defined", "None", "Undefined"],
            },
            {
                "id": 2,
                "questionText": "Which syntax correctly filters even numbers from a list `nums`?",
                "options": [
                    "[x for x in nums if x % 2 == 0]",
                    "[x if x % 2 == 0 for x in nums]",
                    "[if x % 2 == 0: x for x in nums]",
                    "[x for x in nums filter x % 2 == 0]",
                ],
            },
            {
                "id": 3,
                "questionText": "Which keyword pauses an async function until a coroutine completes?",
                "options": ["yield", "await", "pause", "defer"],
            },
        ],
    },
]

students = [
    {
        "id": "student-1",
        "name": "Alex Morgan",
        "level": "Intermediate",
        "goal": "Become an AI Engineer",
    },
]

assessment_answers = {
    "python-fundamentals-quiz": {
        "1": 1,
        "2": 0,
        "3": 1,
    },
}

progress = [
    {
        "student_id": "student-1",
        "completed_hours": 38.5,
        "streak_days": 14,
        "skills": [
            {"skill": "React & Next.js", "level": 82},
            {"skill": "Python Async", "level": 74},
            {"skill": "Prompt Engineering", "level": 90},
        ],
        "achievements": ["14-Day Study Streak", "Python Pro Certification"],
    },
]
