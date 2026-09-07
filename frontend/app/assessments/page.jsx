'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { mockAssessment } from '../../data/mockData';

export default function AssessmentsPage() {
  const [currentIdx, setCurrentIdx] = useState(3); // index 3 = Question 4
  const [selectedOptions, setSelectedOptions] = useState({});
  const [showExplanation, setShowExplanation] = useState(true);
  const [secondsRemaining, setSecondsRemaining] = useState(28 * 60 + 45); // 28m 45s

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = mockAssessment.questions[currentIdx] || mockAssessment.questions[0];
  const selectedOptionIndex = selectedOptions[currentQ.id];

  const handleSelectOption = (idx) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [currentQ.id]: idx,
    }));
  };

  return (
    <div className="w-full bg-[#FAF9F5] min-h-screen py-8 px-4 md:px-12 max-w-7xl mx-auto">
      {/* Top Header / Context Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200">
              {mockAssessment.track}
            </span>
            <span className="text-stone-600 text-xs">• {mockAssessment.pathName}</span>
          </div>
          <h1 className="text-3xl font-bold text-stone-900">{mockAssessment.title}</h1>
        </div>

        {/* Timer & Quick Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white border border-stone-200 px-4 py-3 rounded-xl shadow-sm">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-200">
              <span className="material-symbols-outlined text-[20px]">timer</span>
            </div>
            <div>
              <div className="text-xs text-stone-500 font-medium">Time Remaining</div>
              <div className="text-lg font-bold text-stone-900 font-mono">
                {formatTimer(secondsRemaining)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Tracker Bar */}
      <div className="w-full bg-white border border-stone-200 rounded-2xl p-4 md:p-6 mb-8 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-stone-900">
            Question {currentIdx + 1} of {mockAssessment.totalQuestions}
          </span>
          <span className="text-xs font-semibold text-[#10B981]">
            {Math.round(((currentIdx + 1) / mockAssessment.totalQuestions) * 100)}% Complete
          </span>
        </div>

        <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
          <div
            className="h-full bg-[#10B981] rounded-full transition-all duration-500"
            style={{ width: `${((currentIdx + 1) / mockAssessment.totalQuestions) * 100}%` }}
          ></div>
        </div>

        {/* Question Dots Navigation */}
        <div className="flex items-center gap-2 pt-2 overflow-x-auto pb-1">
          {Array.from({ length: mockAssessment.totalQuestions }).map((_, idx) => {
            const isCurrent = idx === currentIdx;
            const isAnswered = selectedOptions[mockAssessment.questions[idx]?.id] !== undefined;

            return (
              <button
                key={idx}
                onClick={() => setCurrentIdx(idx)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center shrink-0 ${
                  isCurrent
                    ? 'bg-white text-stone-900 border-2 border-[#10B981] shadow-sm scale-105'
                    : isAnswered
                    ? 'bg-[#10B981] text-white'
                    : 'bg-stone-100 border border-stone-200 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Quiz Area: Asymmetric Layout / Bento Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Question Card (Span 8) */}
        <div className="lg:col-span-8 bg-white border border-stone-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-900 px-3 py-1 bg-stone-100 rounded-lg border border-stone-200">
              {currentQ.type}
            </span>
            <span className="text-xs text-stone-500 font-medium">Topic: {currentQ.topic}</span>
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-stone-900 leading-snug">
            {currentQ.questionText}
          </h2>

          {/* Options */}
          <div className="space-y-3 pt-2">
            {currentQ.options.map((opt, oIdx) => {
              const isSelected = selectedOptionIndex === oIdx;
              return (
                <div
                  key={oIdx}
                  onClick={() => handleSelectOption(oIdx)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-4 ${
                    isSelected
                      ? 'bg-emerald-50/70 border-[#10B981] ring-1 ring-[#10B981]'
                      : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 border transition-colors ${
                      isSelected
                        ? 'bg-[#10B981] text-white border-[#10B981]'
                        : 'bg-stone-100 border-stone-300 text-stone-700'
                    }`}
                  >
                    {opt.label}
                  </div>
                  <div className="text-sm text-stone-800 font-medium pt-0.5">{opt.text}</div>
                </div>
              );
            })}
          </div>

          {/* Explanation Box */}
          {selectedOptionIndex !== undefined && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between font-bold text-emerald-900">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">lightbulb</span>
                  <span>Answer Rationale</span>
                </span>
                <button
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="text-stone-500 hover:text-stone-900 underline"
                >
                  {showExplanation ? 'Hide' : 'Show'}
                </button>
              </div>
              {showExplanation && (
                <p className="text-stone-700 leading-relaxed pt-1">{currentQ.explanation}</p>
              )}
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            <button
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-700 text-xs font-semibold hover:bg-stone-50 disabled:opacity-40 transition-colors"
            >
              Previous
            </button>

            <div className="flex items-center gap-3">
              {currentIdx < mockAssessment.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx((prev) => prev + 1)}
                  className="px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-semibold rounded-xl transition-all shadow"
                >
                  Next Question
                </button>
              ) : (
                <Link
                  href="/progress"
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-all shadow"
                >
                  Submit Assessment
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Code Snippet & Reference Console (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-stone-900 text-stone-200 rounded-2xl p-6 shadow-md border border-stone-800 space-y-4">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-stone-800">
              <span className="flex items-center gap-2 font-mono text-stone-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>code_sample.py</span>
              </span>
              <span className="text-stone-500">Python 3.11</span>
            </div>

            <pre className="text-xs font-mono leading-relaxed overflow-x-auto text-emerald-400 bg-stone-950 p-4 rounded-xl border border-stone-800">
              <code>{mockAssessment.codeSnippet}</code>
            </pre>

            <div className="pt-2 text-xs text-stone-400 space-y-2">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#FF72B1]">info</span>
                <span>Code Context</span>
              </div>
              <p className="leading-relaxed">
                Review how Python handles tuple indexing attempts. Notice the exception handling block around `data_tuple[0]`.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
