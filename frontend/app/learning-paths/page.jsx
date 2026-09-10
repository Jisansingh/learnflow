'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LearningPathsPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/courses');
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data = await response.json();
        setCourses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-[#FAF9F5] min-h-screen py-10 px-4 md:px-12 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-[#10B981] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-[#FAF9F5] min-h-screen py-10 px-4 md:px-12 max-w-7xl mx-auto">
        <div className="bg-white border border-red-200 rounded-2xl p-6 shadow-sm text-center">
          <span className="material-symbols-outlined text-red-500 text-4xl mb-2 block">error</span>
          <h2 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Learning Paths</h2>
          <p className="text-stone-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FAF9F5] min-h-screen py-10 px-4 md:px-12 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <span className="text-xs font-semibold text-[#006c49] uppercase tracking-wider">
          Learning Paths
        </span>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1b1c1a] mt-1">
          Your Learning Journey
        </h1>
        <p className="text-stone-600 text-sm md:text-base mt-2 max-w-2xl">
          Explore curated learning paths to build in-demand skills step by step.
        </p>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white border border-[#e3e2df] rounded-2xl p-6 shadow-sm hover:shadow transition-all"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-[#efeeea] border border-[#e3e2df] text-[#1b1c1a] text-xs font-semibold">
                {course.category || 'General'}
              </span>
              {course.estimatedTime && (
                <span className="text-xs text-[#3c4a42]">Estimated: {course.estimatedTime}</span>
              )}
            </div>
            <h3 className="font-bold text-lg text-[#1b1c1a] mb-2">{course.title}</h3>
            <p className="text-xs text-stone-600 mb-4 line-clamp-2">{course.description}</p>

            {course.modules && course.modules.length > 0 ? (
              <div className="space-y-3">
                {course.modules.map((module) => (
                  <div
                    key={module.id}
                    className="bg-[#FAF9F5] p-3 rounded-xl border border-[#e3e2df] text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-[#1b1c1a]">Module {module.number}</span>
                      <span className="px-2 py-0.5 rounded-md bg-[#efeeea] text-stone-600 text-[11px] font-medium">
                        {module.level}
                      </span>
                    </div>
                    <p className="text-stone-600">{module.title}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-stone-500 mb-4">
                Modules coming soon
              </div>
            )}

            <div className="pt-2 border-t border-[#efeeea]">
              <Link
                href={`/assessments?pathId=${course.id}`}
                className="w-full py-2.5 bg-[#10B981] hover:bg-[#059669] text-white font-semibold text-xs rounded-xl transition-all shadow text-center block"
              >
                Start Learning
              </Link>
            </div>
          </div>
        ))}

        {courses.length === 0 && (
          <div className="col-span-full text-center py-12">
            <span className="material-symbols-outlined text-stone-400 text-4xl mb-2 block">menu_book</span>
            <p className="text-stone-600">No learning paths available yet</p>
          </div>
        )}
      </div>
    </div>
  );
}