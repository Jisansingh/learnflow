'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import HeroShader from '../components/HeroShader';

export default function HomePage() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/courses')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCourses(Array.isArray(data) ? data : []))
      .catch(() => setCourses([]));
  }, []);

  const featuredCourses = courses.slice(0, 3);

  return (
    <div className="flex flex-col w-full">
      {/* 1. HERO SECTION */}
      <section className="relative w-full bg-[#1B1C1A] text-[#FAF9F5] overflow-hidden py-16 md:py-24 px-4 md:px-12 border-b border-stone-800">
        <HeroShader />
        
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-4 relative z-10">
          <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#FAF9F5] leading-tight">
            Master Any Skill With <span className="text-[#10B981]">Personalized</span> <span className="text-[#FF72B1]">Learning</span>
          </h1>

          <p className="text-stone-300 text-base md:text-lg max-w-xl leading-relaxed">
            Transform your career and personal growth with custom AI-generated learning paths tailored precisely to your goals, schedule, and current knowledge level.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
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

          <div className="flex items-center justify-center gap-6 pt-4 text-xs md:text-sm text-stone-300 font-medium">
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
            {featuredCourses.length === 0 ? (
              <p className="text-sm text-stone-600">Loading featured tracks...</p>
            ) : (
              featuredCourses.map((course) => (
                <div key={course.id} className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-[#1B1C1A] mb-2">{course.title}</h3>
                    <p className="text-sm text-stone-600 line-clamp-2 mb-4">{course.description}</p>
                  </div>
                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-700">Details coming soon</span>
                    <Link
                      href="/learning-paths"
                      className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-semibold rounded-xl transition-colors"
                    >
                      Start Path
                    </Link>
                  </div>
                </div>
              ))
            )}
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
