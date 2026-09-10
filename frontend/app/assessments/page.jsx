'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function AssessmentsContent() {
  const searchParams = useSearchParams();
  const pathId = searchParams.get('pathId');
  const [courses, setCourses] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(null);

  useEffect(() => {
    const fetchAssessments = async () => {
      // Do not fall back to a generic assessment when no path is selected.
      if (!pathId) {
        setError('No learning path selected. Please go back and choose a learning path.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `http://localhost:8000/api/assessments?learning_path_id=${encodeURIComponent(pathId)}`
        );
        if (!response.ok) {
          const errBody = await response.json().catch(() => ({}));
          throw new Error(errBody.detail || 'Failed to fetch assessments');
        }
        const data = await response.json();
        setCourses(data);
        setCurrentIdx(0);
        setSelectedOptions({});
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, [pathId]);

  if (loading) {
    return (
      <div className="w-full bg-[#FAF9F5] min-h-screen py-8 px-4 md:px-12 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-[#10B981] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-[#FAF9F5] min-h-screen py-8 px-4 md:px-12 max-w-7xl mx-auto">
        <div className="bg-white border border-red-200 rounded-2xl p-6 shadow-sm text-center">
          <span className="material-symbols-outlined text-red-500 text-4xl mb-2 block">error</span>
          <h2 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Assessment</h2>
          <p className="text-stone-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!courses) {
    return null;
  }

  const assessment = courses;

  if (!assessment.questions || assessment.questions.length === 0) {
    return (
      <div className="w-full bg-[#FAF9F5] min-h-screen py-8 px-4 md:px-12 max-w-7xl mx-auto">
        <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm text-center">
          <span className="material-symbols-outlined text-stone-400 text-4xl mb-2 block">quiz</span>
          <h2 className="text-lg font-semibold text-stone-900 mb-2">No questions available</h2>
          <p className="text-stone-600 text-sm mb-6">
            There are no assessment questions for {assessment.pathName || 'this learning path'} yet.
          </p>
          <Link
            href="/learning-paths"
            className="inline-block px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-white font-semibold text-sm rounded-xl transition-all shadow"
          >
            Back to Learning Paths
          </Link>
        </div>
      </div>
    );
  }

  const currentQ = assessment.questions[currentIdx] || assessment.questions[0];
  const selectedOptionIndex = selectedOptions[currentQ.id];

  const handleSelectOption = (idx) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [currentQ.id]: idx,
    }));
  };

  const handleSubmit = async () => {
    setShowScore(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/assessments/${assessment.id}/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            answers: selectedOptions,
          }),
        }
      );
      const data = await response.json();
      setScore(data);
    } catch (err) {
      setError(err.message);
    }
  };

  if (showScore && score) {
    return (
      <div className="w-full bg-[#FAF9F5] min-h-screen py-8 px-4 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center pt-20">
          <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm text-center">
            <span className="material-symbols-outlined text-emerald-500 text-4xl mb-2 block">
              {score.passed ? 'check_circle' : 'sentiment_dissatisfied'}
            </span>
            <h2 className="text-3xl font-bold text-stone-900 mb-2">
              {score.passed ? 'Congratulations!' : 'Keep Trying'}
            </h2>
            <p className="text-4xl font-bold text-emerald-600 mb-4">
              {score.score}%
            </p>
            <p className="text-stone-600 mb-8">
              {score.passed ? 'You passed the assessment!' : 'Review and try again.'}
            </p>
            <Link
              href="/learning-paths"
              className="inline-block px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-xl transition-all shadow"
            >
              Back to Paths
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FAF9F5] min-h-screen py-8 px-4 md:px-12 max-w-7xl mx-auto">
      {/* Top Header / Context Bar */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-stone-900">
          {assessment.title}
        </h1>
      </div>

      {/* Progress Tracker Bar */}
      <div className="w-full bg-white border border-stone-200 rounded-2xl p-4 md:p-6 mb-8 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-stone-900">
            Question {currentIdx + 1} of {assessment.totalQuestions}
          </span>
          <span className="text-xs font-semibold text-[#10B981]">
            {Math.round(((currentIdx + 1) / assessment.totalQuestions) * 100)}% Complete
          </span>
        </div>

        <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
          <div
            className="h-full bg-[#10B981] rounded-full transition-all duration-500"
            style={{ width: `${((currentIdx + 1) / assessment.totalQuestions) * 100}%` }}
          ></div>
        </div>

        {/* Question Dots Navigation */}
        <div className="flex items-center gap-2 pt-2 overflow-x-auto pb-1">
          {Array.from({ length: assessment.totalQuestions }).map((_, idx) => {
            const isCurrent = idx === currentIdx;
            const isAnswered = selectedOptions[assessment.questions[idx]?.id] !== undefined;

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
            {currentQ.topic && (
              <span className="text-xs text-stone-500 font-medium">Topic: {currentQ.topic}</span>
            )}
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
              {currentIdx < assessment.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx((prev) => prev + 1)}
                  className="px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-semibold rounded-xl transition-all shadow"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={Object.keys(selectedOptions).length !== assessment.questions.length}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-all shadow"
                >
                  Submit Assessment
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Assessment Info (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-stone-900 text-stone-200 rounded-2xl p-6 shadow-md border border-stone-800 space-y-4">
            <div className="pt-2 text-xs text-stone-400 space-y-3">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#FF72B1]">info</span>
                <span>Assessment Info</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-400">Total Questions</span>
                  <span className="text-stone-200 font-semibold">{assessment.totalQuestions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Current Question</span>
                  <span className="text-stone-200 font-semibold">{currentIdx + 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Answered</span>
                  <span className="text-stone-200 font-semibold">{Object.keys(selectedOptions).length} / {assessment.totalQuestions}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AssessmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full bg-[#FAF9F5] min-h-screen py-8 px-4 md:px-12 max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-[#10B981] border-t-transparent"></div>
          </div>
        </div>
      }
    >
      <AssessmentsContent />
    </Suspense>
  );
}