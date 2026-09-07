'use client';

import Link from 'next/link';
import { mockProgressData, mockLearningPath } from '../../data/mockData';

export default function ProgressPage() {
  const maxHours = Math.max(...mockProgressData.weeklyActivity.map((a) => a.hours));

  return (
    <div className="w-full bg-[#FAF9F5] min-h-screen py-10 px-4 md:px-12 max-w-7xl mx-auto space-y-8">
      {/* User Header Profile Card */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-stone-900 text-[#10B981] flex items-center justify-center font-bold text-2xl shadow">
            AM
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-stone-900">{mockProgressData.userName}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#006c49] border border-emerald-200 text-xs font-semibold">
                Pro Student
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">{mockProgressData.userRole} • Member since {mockProgressData.joinDate}</p>
          </div>
        </div>

        {/* Quick KPI Badges */}
        <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
          <div className="bg-[#FAF9F5] border border-stone-200 p-3.5 rounded-2xl text-center">
            <div className="text-amber-500 font-bold text-lg flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                local_fire_department
              </span>
              <span>{mockProgressData.streakDays}</span>
            </div>
            <div className="text-[11px] text-stone-500 font-medium mt-0.5">Day Streak</div>
          </div>

          <div className="bg-[#FAF9F5] border border-stone-200 p-3.5 rounded-2xl text-center">
            <div className="text-[#10B981] font-bold text-lg flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[20px]">schedule</span>
              <span>{mockProgressData.totalHoursStudied}h</span>
            </div>
            <div className="text-[11px] text-stone-500 font-medium mt-0.5">Studied</div>
          </div>

          <div className="bg-[#FAF9F5] border border-stone-200 p-3.5 rounded-2xl text-center">
            <div className="text-[#b4136d] font-bold text-lg flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
              <span>{mockProgressData.certificatesEarned}</span>
            </div>
            <div className="text-[11px] text-stone-500 font-medium mt-0.5">Certificates</div>
          </div>
        </div>
      </div>

      {/* Grid Section: Weekly Chart + Skills Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Weekly Activity Bar Chart (Span 7) */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-stone-900">Weekly Learning Activity</h2>
              <p className="text-xs text-stone-500">Hours spent studying per day this week</p>
            </div>
            <span className="text-xs font-semibold text-[#10B981] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              22.8 hrs total
            </span>
          </div>

          {/* Bar Visualization */}
          <div className="h-48 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-stone-100 px-2">
            {mockProgressData.weeklyActivity.map((act, idx) => {
              const heightPercent = Math.round((act.hours / maxHours) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="text-[10px] font-bold text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {act.hours}h
                  </div>
                  <div className="w-full bg-stone-100 rounded-t-xl h-full flex items-end overflow-hidden">
                    <div
                      className="w-full bg-[#10B981] hover:bg-[#059669] rounded-t-xl transition-all duration-500"
                      style={{ height: `${heightPercent}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-stone-600">{act.day}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
            <span>Most Active: Saturday (5.5 hrs)</span>
            <span className="text-stone-900 font-semibold">Goal: 20 hrs / week</span>
          </div>
        </div>

        {/* Skills Proficiency Breakdown (Span 5) */}
        <div className="lg:col-span-5 bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Skill Proficiency</h2>
            <p className="text-xs text-stone-500">Evaluated from assessments & quizzes</p>
          </div>

          <div className="space-y-4">
            {mockProgressData.skillsProficiency.map((sk, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-stone-800">{sk.skill}</span>
                  <span className="text-stone-600">{sk.level}%</span>
                </div>
                <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                  <div
                    className={`h-full ${sk.color} rounded-full transition-all duration-500`}
                    style={{ width: `${sk.level}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements & Ongoing Paths */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Achievements Grid (Span 6) */}
        <div className="lg:col-span-6 bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-stone-900">Recent Achievements</h2>
          <div className="space-y-3">
            {mockProgressData.recentAchievements.map((ach) => (
              <div
                key={ach.id}
                className="p-4 rounded-xl border border-stone-200 flex items-start gap-4 hover:border-stone-300 transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${ach.color}`}>
                  <span className="material-symbols-outlined text-[20px]">{ach.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-stone-900">{ach.title}</h3>
                    <span className="text-[11px] text-stone-400">{ach.date}</span>
                  </div>
                  <p className="text-xs text-stone-600 mt-0.5">{ach.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ongoing Path Summary (Span 6) */}
        <div className="lg:col-span-6 bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900">Current Learning Path</h2>
            <Link href="/learning-paths" className="text-xs font-bold text-[#006c49] hover:underline">
              View Path
            </Link>
          </div>

          <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#10B981] uppercase tracking-wider">
                {mockLearningPath.category}
              </span>
              <span className="text-xs text-stone-500 font-medium">45% Completed</span>
            </div>
            <h3 className="text-base font-bold text-stone-900">{mockLearningPath.title}</h3>
            <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#10B981] rounded-full" style={{ width: '45%' }}></div>
            </div>
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-stone-600">Next: Module 3 (LLM APIs)</span>
              <Link
                href="/learning-paths"
                className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
              >
                Continue
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
