'use client';

import { useState } from 'react';
import Link from 'next/link';
import { mockLearningPath } from '../../data/mockData';

export default function LearningPathsPage() {
  const [expandedNodes, setExpandedNodes] = useState({ 'module-1': true, 'module-3': true });
  const [copiedShare, setCopiedShare] = useState(false);

  const toggleDetails = (nodeId) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const handleShare = () => {
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 3000);
  };

  return (
    <div className="w-full bg-[#FAF9F5] min-h-screen py-10 px-4 md:px-12 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-[#efeeea] border border-[#e3e2df] text-[#1b1c1a] text-xs font-semibold">
              {mockLearningPath.category}
            </span>
            <span className="text-xs text-[#3c4a42]">Estimated completion: {mockLearningPath.estimatedTime}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1b1c1a]">
            {mockLearningPath.title}
          </h1>
          <p className="text-stone-600 text-sm md:text-base mt-2 max-w-2xl">
            {mockLearningPath.description}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="px-4 py-2.5 bg-white hover:bg-[#efeeea] border border-[#e3e2df] text-[#1b1c1a] text-xs font-semibold rounded-xl transition-all flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">
              {copiedShare ? 'check' : 'share'}
            </span>
            <span>{copiedShare ? 'Link Copied!' : 'Share Path'}</span>
          </button>
          <Link
            href="/assessments"
            className="px-4 py-2.5 bg-[#006c49] hover:bg-[#005236] text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">play_arrow</span>
            <span>Resume Learning</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Roadmap + Sidebar Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Sequential Roadmap Nodes (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6 relative">
          {/* Connecting Line Background */}
          <div className="absolute left-8 top-12 bottom-12 w-0.5 bg-stone-300 -z-10 hidden sm:block"></div>

          {mockLearningPath.modules.map((module) => {
            const isExpanded = expandedNodes[module.id];
            const isCompleted = module.status === 'completed';
            const isInProgress = module.status === 'in-progress';
            const isLocked = module.status === 'locked';

            return (
              <div
                key={module.id}
                className={`group bg-white border border-[#e3e2df] rounded-2xl p-6 shadow-sm hover:shadow transition-all relative ${
                  isInProgress ? 'ring-2 ring-[#10B981]/50 border-[#10B981]' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Node Status Badge */}
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${
                        isCompleted
                          ? 'bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981]'
                          : isInProgress
                          ? 'bg-[#FF72B1]/10 border-[#FF72B1]/30 text-[#b4136d] animate-pulse'
                          : 'bg-stone-100 border-stone-200 text-stone-400'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[24px]">
                        {isCompleted ? 'check' : isInProgress ? 'play_arrow' : 'lock'}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-[#1b1c1a] font-bold">Module {module.number}</span>
                        <span className="text-xs text-stone-500">• {module.lessonsCount} Lessons</span>
                        <span className="px-2 py-0.5 rounded-md bg-[#efeeea] text-stone-600 text-[11px] font-medium">
                          {module.level}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-[#1b1c1a]">{module.title}</h3>
                      <p className="text-xs text-stone-600 mt-1">{module.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        isCompleted
                          ? 'bg-[#10b981]/15 text-[#00422b] border-[#10b981]/30'
                          : isInProgress
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-stone-100 text-stone-500 border-stone-200'
                      }`}
                    >
                      {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Locked'}
                    </span>
                    <button
                      onClick={() => toggleDetails(module.id)}
                      className="p-2 rounded-xl bg-[#FAF9F5] hover:bg-[#efeeea] border border-[#e3e2df] text-[#1b1c1a] transition-all"
                      aria-label="Toggle details"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {isExpanded ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Collapsible Accordion Drawer */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-[#efeeea] text-xs text-[#3c4a42] space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#e3e2df]">
                        <span className="font-semibold text-[#1b1c1a] block mb-1">Estimated Time</span>
                        <span>{module.estimatedTime}</span>
                      </div>
                      <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#e3e2df]">
                        <span className="font-semibold text-[#1b1c1a] block mb-1">Prerequisites</span>
                        <span>{module.prerequisites}</span>
                      </div>
                      <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#e3e2df]">
                        <span className="font-semibold text-[#1b1c1a] block mb-1">Projects Built</span>
                        <span>{module.projects.join(', ')}</span>
                      </div>
                    </div>

                    <div>
                      <span className="font-semibold text-[#1b1c1a] block mb-2">Key Topics Covered:</span>
                      <div className="flex flex-wrap gap-2">
                        {module.topics.map((topic, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200 text-stone-700 font-medium">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Link
                        href="/assessments"
                        className="text-xs font-bold text-[#006c49] hover:underline flex items-center gap-1"
                      >
                        <span>{isCompleted ? 'Review Module Materials' : 'Launch Module Quiz'}</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Sidebar: Progress & Path Info (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-[#e3e2df] rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-lg text-[#1b1c1a] mb-1">Path Completion</h3>
              <p className="text-xs text-stone-500">2 of 4 Modules Mastered</p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#006c49]">Progress Score</span>
                <span className="text-[#1b1c1a]">45%</span>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                <div
                  className="h-full bg-[#10B981] rounded-full transition-all duration-500"
                  style={{ width: '45%' }}
                ></div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs py-2 border-b border-stone-100">
                <span className="text-stone-600">Total Duration</span>
                <span className="font-semibold text-stone-900">42 Hours</span>
              </div>
              <div className="flex items-center justify-between text-xs py-2 border-b border-stone-100">
                <span className="text-stone-600">Earned Certificate</span>
                <span className="font-semibold text-[#10B981] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  Verified AI Badge
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-2">
                <span className="text-stone-600">Community Rank</span>
                <span className="font-semibold text-stone-900">Top 12%</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/assessments"
                className="w-full py-3 bg-[#10B981] hover:bg-[#059669] text-white font-semibold text-xs rounded-xl transition-all shadow text-center block"
              >
                Continue Next Assessment
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
