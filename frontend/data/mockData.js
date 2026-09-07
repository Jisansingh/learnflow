export const mockLearningPath = {
  id: "advanced-react-ai",
  title: "Advanced React & AI Engineering",
  description: "Master modern concurrent React patterns, custom hooks, and seamless LLM API integrations to build next-generation intelligent web applications.",
  category: "AI & Fullstack",
  estimatedTime: "6 weeks (42 Hours)",
  level: "Intermediate to Advanced",
  completionPercentage: 45,
  modules: [
    {
      id: "module-1",
      number: 1,
      title: "Python Fundamentals for AI",
      description: "Core syntax, data structures, asynchronous programming, and environment setup for LLM tooling.",
      lessonsCount: 12,
      level: "Beginner",
      status: "completed",
      estimatedTime: "10 Hours",
      prerequisites: "Basic Programming Knowledge",
      projects: ["Async API Scraper", "CLI Tool for Prompt Formatting"],
      topics: [
        "Python Types & Mutability",
        "Asyncio & Concurrency",
        "Virtual Environments & Poetry",
        "Handling JSON & REST APIs"
      ]
    },
    {
      id: "module-2",
      number: 2,
      title: "React Essentials & Component Architecture",
      description: "JSX mastery, props flow, component composition, and modern state paradigms.",
      lessonsCount: 16,
      level: "Intermediate",
      status: "completed",
      estimatedTime: "12 Hours",
      prerequisites: "HTML/CSS & JavaScript ES6+",
      projects: ["Component Design System", "Interactive Dashboard Widget"],
      topics: [
        "React Component Lifecycle & Hooks",
        "Context API & Custom Hooks",
        "State Management Patterns",
        "Performance Optimization with useMemo"
      ]
    },
    {
      id: "module-3",
      number: 3,
      title: "LLM API Integrations & Streaming UX",
      description: "Connecting OpenAI & Anthropic APIs, handling chunked streaming responses, and managing UI state.",
      lessonsCount: 14,
      level: "Advanced",
      status: "in-progress",
      estimatedTime: "12 Hours",
      prerequisites: "React Essentials",
      projects: ["Real-time AI Chatbot", "Streaming Text Summarizer"],
      topics: [
        "Server-Sent Events & ReadableStream",
        "Optimistic UI Updates for AI",
        "Token Usage Optimization",
        "Error Recovery & Retry Logic"
      ]
    },
    {
      id: "module-4",
      number: 4,
      title: "Vector Databases & RAG Systems",
      description: "Embeddings, Pinecone/Supabase Vector, Retrieval-Augmented Generation workflows in Next.js.",
      lessonsCount: 18,
      level: "Advanced",
      status: "locked",
      estimatedTime: "15 Hours",
      prerequisites: "LLM API Integrations",
      projects: ["DocuQuery RAG App", "Semantic Search Engine"],
      topics: [
        "Text Embeddings with OpenAI",
        "Vector Similarity & Cosine Distance",
        "Hybrid Search & Chunking Strategies",
        "RAG Pipeline Evaluation"
      ]
    }
  ]
};

export const mockAssessment = {
  id: "python-fundamentals-quiz",
  title: "Python Fundamentals Assessment",
  track: "Certification Track",
  pathName: "Python Developer Path",
  totalQuestions: 10,
  timeLimitMinutes: 30,
  currentQuestionIndex: 3, // 4th question (1-indexed: 4)
  questions: [
    {
      id: 1,
      type: "Multiple Choice",
      topic: "Variables & Scope",
      questionText: "What will be the output of printing a variable declared inside a function without returning it?",
      options: [
        { label: "A", text: "Global Scope Reference", isCorrect: false },
        { label: "B", text: "NameError: name is not defined", isCorrect: true },
        { label: "C", text: "None", isCorrect: false },
        { label: "D", text: "Undefined", isCorrect: false }
      ],
      explanation: "Variables declared inside a function belong to the local scope of that function and cannot be accessed globally."
    },
    {
      id: 2,
      type: "Multiple Choice",
      topic: "List Comprehension",
      questionText: "Which syntax correctly filters even numbers from a list `nums` using list comprehension?",
      options: [
        { label: "A", text: "[x for x in nums if x % 2 == 0]", isCorrect: true },
        { label: "B", text: "[x if x % 2 == 0 for x in nums]", isCorrect: false },
        { label: "C", text: "[if x % 2 == 0: x for x in nums]", isCorrect: false },
        { label: "D", text: "[x for x in nums filter x % 2 == 0]", isCorrect: false }
      ],
      explanation: "In Python list comprehensions, `if` filter clauses appear after the `for` iteration loop."
    },
    {
      id: 3,
      type: "Multiple Choice",
      topic: "Decorators",
      questionText: "What is the main purpose of the `@wraps` decorator from functools when creating custom decorators?",
      options: [
        { label: "A", text: "To speed up function execution time", isCorrect: false },
        { label: "B", text: "To preserve the original function's name and docstring", isCorrect: true },
        { label: "C", text: "To make the function asynchronous", isCorrect: false },
        { label: "D", text: "To validate argument types automatically", isCorrect: false }
      ],
      explanation: "functools.wraps copies original function metadata like `__name__` and `__doc__` to the wrapper function."
    },
    {
      id: 4,
      type: "Multiple Choice",
      topic: "Data Structures & Mutability",
      questionText: "Which of the following data types in Python is strictly immutable, and what happens if you attempt to modify its element directly?",
      options: [
        { label: "A", text: "List; raises a TypeError exception at runtime", isCorrect: false },
        { label: "B", text: "Tuple; raises a TypeError exception indicating item assignment is not supported", isCorrect: true },
        { label: "C", text: "Dictionary; silently ignores modification attempt without throwing errors", isCorrect: false },
        { label: "D", text: "Set; creates a copy of the object with updated elements", isCorrect: false }
      ],
      explanation: "Tuples are immutable sequence types in Python. Attempting to assign values to specific indices (e.g., `t[0] = 5`) triggers a `TypeError: 'tuple' object does not support item assignment`."
    },
    {
      id: 5,
      type: "Multiple Choice",
      topic: "Asyncio & Event Loop",
      questionText: "Which keyword is used to pause the execution of an async function until a coroutine completes?",
      options: [
        { label: "A", text: "yield", isCorrect: false },
        { label: "B", text: "await", isCorrect: true },
        { label: "C", text: "pause", isCorrect: false },
        { label: "D", text: "defer", isCorrect: false }
      ],
      explanation: "`await` yields control back to the event loop until the awaited coroutine completes."
    }
  ],
  codeSnippet: `def update_record(data_tuple, new_value):
    # Attempting to modify first element
    try:
        data_tuple[0] = new_value
        return True
    except TypeError as e:
        print(f"Error caught: {e}")
        return False

# Execution test:
record = ("Alice", 28, "Engineer")
result = update_record(record, "Bob")`
};

export const mockResources = [
  {
    id: "res-1",
    title: "Mastering Next.js 14 Server Actions & Form Handling",
    category: "Interactive Labs",
    type: "Interactive Lab",
    duration: "45 mins",
    level: "Advanced",
    author: "LearnFlow Engineering",
    rating: 4.9,
    description: "Hands-on tutorial with live sandbox code environments. Learn how to mutate data securely without client API endpoints.",
    tags: ["Next.js", "React", "Server Actions"],
    isFeatured: true,
    bookmarkCount: 1420
  },
  {
    id: "res-2",
    title: "Prompt Engineering Architecture Guide 2026",
    category: "Articles & Guides",
    type: "Article",
    duration: "15 mins read",
    level: "All Levels",
    author: "Dr. Elena Rostova",
    rating: 4.8,
    description: "In-depth research paper on system prompt construction, chain-of-thought formatting, and few-shot optimization.",
    tags: ["AI", "Prompt Engineering", "LLM"],
    isFeatured: false,
    bookmarkCount: 890
  },
  {
    id: "res-3",
    title: "Building Production Vector Search with Supabase",
    category: "Video Tutorials",
    type: "Video",
    duration: "28 mins",
    level: "Intermediate",
    author: "Marcus Chen",
    rating: 4.9,
    description: "Step-by-step video guide installing pgvector, computing embeddings with OpenAI, and running cosine similarity queries.",
    tags: ["Supabase", "pgvector", "Databases"],
    isFeatured: false,
    bookmarkCount: 1105
  },
  {
    id: "res-4",
    title: "Python Asyncio Deep Dive & Microservice Patterns",
    category: "Documentation",
    type: "Documentation",
    duration: "30 mins read",
    level: "Advanced",
    author: "Python Core Team",
    rating: 4.7,
    description: "Comprehensive breakdown of task groups, cancellation shields, event loop performance tuning, and async database connections.",
    tags: ["Python", "Asyncio", "Backend"],
    isFeatured: false,
    bookmarkCount: 654
  },
  {
    id: "res-5",
    title: "Tailwind CSS Layouts & Responsive Micro-Animations",
    category: "Articles & Guides",
    type: "Article",
    duration: "18 mins read",
    level: "Beginner",
    author: "Sarah Jenkins",
    rating: 4.9,
    description: "Design pattern guide for responsive flexbox, grid, glassmorphism UI card components, and CSS transition performance.",
    tags: ["CSS", "Tailwind", "UI/UX"],
    isFeatured: false,
    bookmarkCount: 978
  },
  {
    id: "res-6",
    title: "RAG Evaluation Frameworks & Metric Dashboards",
    category: "Interactive Labs",
    type: "Interactive Lab",
    duration: "50 mins",
    level: "Advanced",
    author: "LearnFlow AI Lab",
    rating: 4.9,
    description: "Build precision and recall benchmarking scripts for document retrieval pipelines using synthetic test datasets.",
    tags: ["RAG", "Evaluation", "AI"],
    isFeatured: false,
    bookmarkCount: 1310
  }
];

export const mockProgressData = {
  userName: "Alex Morgan",
  userRole: "AI Engineer Aspirant",
  joinDate: "August 2026",
  streakDays: 14,
  totalHoursStudied: 38.5,
  completedPathsCount: 2,
  certificatesEarned: 3,
  weeklyActivity: [
    { day: "Mon", hours: 2.5, completedTasks: 4 },
    { day: "Tue", hours: 3.0, completedTasks: 5 },
    { day: "Wed", hours: 1.8, completedTasks: 3 },
    { day: "Thu", hours: 4.2, completedTasks: 7 },
    { day: "Fri", hours: 2.0, completedTasks: 3 },
    { day: "Sat", hours: 5.5, completedTasks: 8 },
    { day: "Sun", hours: 3.8, completedTasks: 6 }
  ],
  skillsProficiency: [
    { skill: "React & Next.js", level: 82, color: "bg-[#10B981]" },
    { skill: "Python Async", level: 74, color: "bg-[#FF72B1]" },
    { skill: "Prompt Engineering", level: 90, color: "bg-[#acf847]" },
    { skill: "Vector DBs & RAG", level: 58, color: "bg-[#416900]" },
    { skill: "TypeScript", level: 68, color: "bg-[#b4136d]" }
  ],
  recentAchievements: [
    {
      id: "ach-1",
      title: "14-Day Study Streak",
      description: "Studied consecutive days without missing a session.",
      date: "Yesterday",
      icon: "local_fire_department",
      color: "text-amber-500 bg-amber-50 border-amber-200"
    },
    {
      id: "ach-2",
      title: "Python Pro Certification",
      description: "Passed Python Fundamentals Assessment with 94% score.",
      date: "3 days ago",
      icon: "workspace_premium",
      color: "text-emerald-600 bg-emerald-50 border-emerald-200"
    },
    {
      id: "ach-3",
      title: "Speed Builder",
      description: "Completed 5 interactive labs in less than 2 hours.",
      date: "1 week ago",
      icon: "bolt",
      color: "text-pink-600 bg-pink-50 border-pink-200"
    }
  ]
};
