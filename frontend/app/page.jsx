'use client';

import { useState } from 'react';
import Link from 'next/link';
import HeroShader from '../components/HeroShader';
import { mockLearningPath } from '../data/mockData';

export default function HomePage() {
  const [promptInput, setPromptInput] = useState('Build a path for Senior Fullstack Engineer specializing in LLMs');
  const [generating, setGenerating] = useState(false);
  const [generatedSuccess, setGeneratedSuccess] = useState(false);

  const handleGenerate = (e) => {
    e.preventDefault();
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGeneratedSuccess(true);
    }, 1200);
  };

  return (
    <div className="flex flex-col w-full">
      {/* 1. HERO SECTION */}
      <section className="relative w-full bg-[#1B1C1A] text-[#FAF9F5] overflow-hidden py-16 md:py-24 px-4 md:px-12 border-b border-stone-800">
        <HeroShader />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 flex flex-col items-start gap-4">
            <div className="inline-flex items-center gap-2 bg-stone-900/90 backdrop-blur border border-stone-800 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#10B981]">
              <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
              <span>AI-Powered Education Platform</span>
            </div>
            
            <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#FAF9F5] leading-tight">
              Master Any Skill With <span className="text-[#10B981]">Personalized</span> <span className="text-[#FF72B1]">Learning</span>
            </h1>
            
            <p className="text-stone-300 text-base md:text-lg max-w-xl leading-relaxed">
              Transform your career and personal growth with custom AI-generated learning paths tailored precisely to your goals, schedule, and current knowledge level.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/learning-paths"
                className="bg-[#10B981] text-white hover:bg-[#059669] px-6 py-3.5 rounded-xl font-semibold transition-all shadow-lg inline-flex items-center gap-2"
              >
                <span>Build My Learning Path</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </Link>
              <Link
                href="/resources"
                className="bg-stone-900/90 backdrop-blur border border-stone-700 hover:bg-stone-800 text-stone-200 px-6 py-3.5 rounded-xl font-semibold transition-all"
              >
                Explore Resources
              </Link>
            </div>
            
            <div className="flex items-center gap-6 pt-4 text-xs md:text-sm text-stone-300 font-medium">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#10B981] text-[18px]">check_circle</span>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#10B981] text-[18px]">check_circle</span>
                <span>Adapts to your goals</span>
              </div>
            </div>
          </div>

          {/* Interactive AI Preview Card */}
          <div className="lg:col-span-5 relative">
            <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 p-6 rounded-2xl shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#10B981]/20 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
                    <span className="material-symbols-outlined text-[22px]">psychology</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-base">AI Path Generator</h3>
                    <p className="text-xs text-stone-400">Target: AI Fullstack Engineer</p>
                  </div>
                </div>
                <span className="text-xs bg-[#10B981]/20 border border-[#10B981]/30 text-[#10B981] px-3 py-1 rounded-full font-medium">
                  Active Demo
                </span>
              </div>

              <form onSubmit={handleGenerate} className="space-y-3 mb-4">
                <div className="relative">
                  <input
                    type="text"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    className="w-full bg-stone-950/90 border border-stone-800 rounded-xl px-3.5 py-3 text-xs text-stone-200 focus:outline-none focus:border-[#10B981] transition-all pr-24"
                    placeholder="Enter learning goal..."
                  />
                  <button
                    type="submit"
                    disabled={generating}
                    className="absolute right-1.5 top-1.5 bottom-1.5 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-semibold px-3 rounded-lg transition-colors flex items-center gap-1"
                  >
                    {generating ? (
                      <span className="animate-spin material-symbols-outlined text-[14px]">progress_activity</span>
                    ) : (
                      <>
                        <span>Generate</span>
                        <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {generatedSuccess && (
                <div className="mb-4 p-3 bg-[#10B981]/15 border border-[#10B981]/30 rounded-xl text-xs text-[#10B981] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Path generated! 4 Modules, 42 Lessons ready.</span>
                </div>
              )}

              <div className="space-y-2.5">
                <div className="bg-stone-950/80 border border-stone-800/80 p-3 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-stone-300">Proficiency Target</span>
                  <span className="text-xs text-[#10B981] font-semibold">Intermediate (64%)</span>
                </div>
                <div className="bg-stone-950/80 border border-stone-800/80 p-3 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-stone-300">Daily Commitment</span>
                  <span className="text-xs text-stone-100 font-semibold">30 mins / day</span>
                </div>
                <div className="bg-stone-950/80 border border-stone-800/80 p-3 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-stone-300">Estimated Duration</span>
                  <span className="text-xs text-[#FF72B1] font-semibold">6 Weeks</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs">
                <span className="text-stone-400">Next module unlocks in:</span>
                <span className="text-stone-200 font-semibold">2h 15m</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS BAR */}
      <section className="py-8 bg-stone-100 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl md:text-3xl font-extrabold text-[#1B1C1A]">50,000+</div>
            <div className="text-xs md:text-sm text-stone-600 mt-1">Active Learners</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-extrabold text-[#10B981]">98.4%</div>
            <div className="text-xs md:text-sm text-stone-600 mt-1">Assessment Pass Rate</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-extrabold text-[#FF72B1]">1,200+</div>
            <div className="text-xs md:text-sm text-stone-600 mt-1">Interactive Modules</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-extrabold text-[#1B1C1A]">4.9 / 5</div>
            <div className="text-xs md:text-sm text-stone-600 mt-1">Average Student Rating</div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES GRID */}
      <section className="py-16 md:py-24 px-4 md:px-12 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="px-3.5 py-1 rounded-full bg-[#10B981]/15 text-[#006c49] border border-[#10B981]/30 text-xs font-semibold">
            Features & Innovation
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1B1C1A]">
            Designed for Maximum Skill Retention
          </h2>
          <p className="text-stone-600 text-sm md:text-base">
            Combine real-world project roadmaps, immediate AI code evaluations, and personalized spacing algorithms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-stone-200 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">route</span>
            </div>
            <h3 className="text-xl font-bold text-[#1B1C1A]">Dynamic Roadmaps</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Paths update in real-time as you complete lessons, skipping topics you already master and expanding tricky concepts.
            </p>
            <Link href="/learning-paths" className="inline-flex items-center gap-1 text-sm font-semibold text-[#006c49] hover:underline">
              <span>View sample paths</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          <div className="bg-white border border-stone-200 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#FF72B1]/15 text-[#b4136d] border border-[#FF72B1]/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">quiz</span>
            </div>
            <h3 className="text-xl font-bold text-[#1B1C1A]">Interactive Assessments</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Test your logic with timed quizzes, code snippet debugging, and detailed step-by-step rationale hints.
            </p>
            <Link href="/assessments" className="inline-flex items-center gap-1 text-sm font-semibold text-[#b4136d] hover:underline">
              <span>Try an assessment</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          <div className="bg-white border border-stone-200 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#acf847]/30 text-[#416900] border border-[#acf847]/50 flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">insights</span>
            </div>
            <h3 className="text-xl font-bold text-[#1B1C1A]">Real-Time Analytics</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Track streak counters, weekly hour graphs, and verifiable skill badges ready to share on LinkedIn or resume.
            </p>
            <Link href="/progress" className="inline-flex items-center gap-1 text-sm font-semibold text-[#416900] hover:underline">
              <span>See progress dashboard</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. POPULAR PATHS SHOWCASE */}
      <section className="py-16 bg-stone-100/70 border-t border-b border-stone-200 px-4 md:px-12">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#006c49]">Curriculum Highlights</span>
              <h2 className="text-3xl font-bold text-[#1B1C1A] mt-1">Featured Learning Tracks</h2>
            </div>
            <Link href="/learning-paths" className="text-sm font-semibold text-[#10B981] hover:text-[#059669] flex items-center gap-1">
              <span>Browse All Paths</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Track 1 */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 bg-emerald-50 text-[#006c49] border border-emerald-200 text-xs font-semibold rounded-full">
                    AI Engineering
                  </span>
                  <span className="text-xs text-stone-500 font-medium">6 Weeks</span>
                </div>
                <h3 className="text-xl font-bold text-[#1B1C1A] mb-2">{mockLearningPath.title}</h3>
                <p className="text-sm text-stone-600 line-clamp-2 mb-4">{mockLearningPath.description}</p>
              </div>
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-700">4 Modules • 60 Lessons</span>
                <Link
                  href="/learning-paths"
                  className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  Start Path
                </Link>
              </div>
            </div>

            {/* Track 2 */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 bg-pink-50 text-[#b4136d] border border-pink-200 text-xs font-semibold rounded-full">
                    Python & LLM Ops
                  </span>
                  <span className="text-xs text-stone-500 font-medium">4 Weeks</span>
                </div>
                <h3 className="text-xl font-bold text-[#1B1C1A] mb-2">Python LLM Infrastructure</h3>
                <p className="text-sm text-stone-600 line-clamp-2 mb-4">
                  Build production ready async API gateways, LangChain workflows, and vLLM deployment instances.
                </p>
              </div>
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-700">3 Modules • 40 Lessons</span>
                <Link
                  href="/learning-paths"
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  Start Path
                </Link>
              </div>
            </div>

            {/* Track 3 */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 bg-lime-50 text-[#416900] border border-lime-200 text-xs font-semibold rounded-full">
                    Vector DB & RAG
                  </span>
                  <span className="text-xs text-stone-500 font-medium">5 Weeks</span>
                </div>
                <h3 className="text-xl font-bold text-[#1B1C1A] mb-2">RAG Architectures & Vector Search</h3>
                <p className="text-sm text-stone-600 line-clamp-2 mb-4">
                  Master embedding generation, hybrid search, Pinecone indexing, and context window optimization.
                </p>
              </div>
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-700">5 Modules • 52 Lessons</span>
                <Link
                  href="/learning-paths"
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  Start Path
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BOTTOM CTA BANNER */}
      <section className="py-20 px-4 md:px-12 bg-[#1B1C1A] text-white text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[32px]">rocket_launch</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Ready to Accelerate Your AI Engineering Journey?
          </h2>
          <p className="text-stone-400 text-base md:text-lg">
            Join thousands of developers using LearnFlow to master fullstack AI engineering with personalized paths.
          </p>
          <div className="pt-4">
            <Link
              href="/sign-up"
              className="px-8 py-4 bg-[#10B981] hover:bg-[#059669] text-white font-bold text-base rounded-xl transition-all shadow-xl hover:shadow-2xl inline-block"
            >
              Get Started Free Today
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
