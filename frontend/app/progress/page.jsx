'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProgressPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/courses')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCourses(Array.isArray(data) ? data : []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  // No student/progress rows exist in the backend yet. The current path
  // below is real data from GET /api/courses.
  const currentPath = courses.length > 0 ? courses[0] : null;

  if (loading) {
    return (
      <div className="w-full bg-[#FAF9F5] min-h-screen py-10 px-4 md:px-12 max-w-3xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-stone-300 border-t-stone-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FAF9F5] min-h-screen py-10 px-4 md:px-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Learner</h1>
          <p className="text-sm text-stone-500 mt-1">No progress recorded yet</p>
        </div>

        <section className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900">Current Learning Path</h2>
            <Link href="/learning-paths" className="text-xs font-bold text-stone-900 hover:underline">
              View Path
            </Link>
          </div>

          <div className="pt-4 border-t border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                {currentPath && currentPath.category ? currentPath.category : 'General'}
              </span>
              <span className="text-xs text-stone-500">Not started</span>
            </div>
            <h3 className="text-base font-bold text-stone-900">{currentPath ? currentPath.title : 'No learning path yet'}</h3>
            <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
              <div className="h-full bg-stone-900 rounded-full" style={{ width: '0%' }}></div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-stone-600">Next: pick a path to begin</span>
              <Link
                href="/learning-paths"
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Continue
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
