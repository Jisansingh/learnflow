'use client';

import { useState } from 'react';
import Link from 'next/link';
import LiquidShader from '../../components/LiquidShader';

export default function SignUpPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [goal, setGoal] = useState('AI Engineering');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div className="w-full bg-[#FAF9F5] min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 md:px-12">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden min-h-[600px]">
        {/* Left Side: Interactive Liquid WebGL Hero Panel (5 cols) */}
        <div className="lg:col-span-5 relative overflow-hidden bg-stone-100 p-8 md:p-12 flex flex-col justify-between hidden lg:flex">
          {/* Animated Liquid WebGL Shader Background */}
          <LiquidShader />

          {/* Top Brand / Back Link */}
          <div className="relative z-10 flex items-center justify-between">
            <Link
              href="/"
              className="text-xs font-semibold text-stone-800 backdrop-blur-md bg-white/60 hover:bg-white/80 px-3.5 py-2 rounded-xl border border-white/70 shadow-sm transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Center Glassmorphism Value Card */}
          <div className="relative z-10 my-auto py-6 max-w-md backdrop-blur-md bg-white/50 p-6 rounded-2xl border border-white/70 shadow-sm space-y-4">
            <h2 className="text-2xl font-bold text-stone-900 leading-snug">
              Start your personalized learning path today.
            </h2>
            <p className="text-xs text-stone-700 leading-relaxed">
              Create your free account in seconds. Get AI-tailored study modules, interactive coding environments, and progress badges.
            </p>
            <div className="pt-2 border-t border-stone-900/10 flex items-center gap-2 text-xs font-semibold text-[#006c49]">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>100% Free Starter Plan</span>
            </div>
          </div>

          {/* Footer Micro Tag */}
          <div className="relative z-10 text-[11px] text-stone-600 backdrop-blur-md bg-white/50 px-3 py-1 rounded-lg inline-block w-fit border border-white/60">
            © 2026 LearnFlow. All rights reserved.
          </div>
        </div>

        {/* Right Side Registration Form (Span 7) */}
        <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-stone-900">Create Your LearnFlow Account</h1>
            <p className="text-xs text-stone-500">
              Fill in details to generate your first custom learning path.
            </p>
          </div>

          {submitted && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-[#006c49] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>Account created successfully! Welcome to LearnFlow.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-800 block">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Morgan"
                  required
                  className="w-full bg-[#FAF9F5] border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-900 focus:outline-none focus:border-[#10B981] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-800 block">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  required
                  className="w-full bg-[#FAF9F5] border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-900 focus:outline-none focus:border-[#10B981] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800 block">Primary Learning Goal</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full bg-[#FAF9F5] border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-900 focus:outline-none focus:border-[#10B981] transition-colors"
              >
                <option value="AI Engineering">Advanced React & AI Engineering</option>
                <option value="Python LLM">Python & LLM Infrastructure</option>
                <option value="Vector Search">RAG & Vector Search Databases</option>
                <option value="Prompt Engineering">Prompt Engineering & Agent Design</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create password (min 8 chars)"
                required
                minLength={8}
                className="w-full bg-[#FAF9F5] border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-900 focus:outline-none focus:border-[#10B981] transition-colors"
              />
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-0.5 rounded border-stone-300 text-[#10B981] focus:ring-[#10B981]"
              />
              <label htmlFor="terms" className="text-xs text-stone-600 cursor-pointer leading-relaxed">
                I agree to the LearnFlow <span className="text-[#006c49] underline font-semibold">Terms of Service</span> and <span className="text-[#006c49] underline font-semibold">Privacy Policy</span>.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
              ) : (
                <>
                  <span>Create Account & Start</span>
                  <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-stone-500 pt-2">
            Already have an account?{' '}
            <Link href="/sign-in" className="font-bold text-[#006c49] hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
