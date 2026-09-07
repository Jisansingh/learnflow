'use client';

import { useState } from 'react';
import Link from 'next/link';
import LiquidShader from '../../components/LiquidShader';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
              Master skills faster with intelligent pathways.
            </h2>
            <p className="text-xs text-stone-700 leading-relaxed">
              "Join over 10,000 learners mastering skills with AI-powered personalized paths tailored precisely to your goals."
            </p>
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-stone-900/10">
              <div>
                <div className="text-base font-bold text-stone-900">10K+</div>
                <div className="text-[10px] text-stone-600 font-medium">Active Learners</div>
              </div>
              <div>
                <div className="text-base font-bold text-stone-900">94%</div>
                <div className="text-[10px] text-stone-600 font-medium">Completion Rate</div>
              </div>
              <div>
                <div className="text-base font-bold text-stone-900">200+</div>
                <div className="text-[10px] text-stone-600 font-medium">Skill Paths</div>
              </div>
            </div>
          </div>

          {/* Footer Micro Tag */}
          <div className="relative z-10 text-[11px] text-stone-600 backdrop-blur-md bg-white/50 px-3 py-1 rounded-lg inline-block w-fit border border-white/60">
            © 2026 LearnFlow. All rights reserved.
          </div>
        </div>

        {/* Right Side Form (Span 7) */}
        <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-stone-900">Sign In to LearnFlow</h1>
            <p className="text-xs text-stone-500">
              Enter your credentials to access your account dashboard.
            </p>
          </div>

          {submitted && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-[#006c49] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>Successfully authenticated demo user! Redirecting to progress...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800 block">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full bg-[#FAF9F5] border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-900 focus:outline-none focus:border-[#10B981] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-800">Password</label>
                <span className="text-xs text-[#006c49] hover:underline cursor-pointer font-semibold">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#FAF9F5] border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-900 focus:outline-none focus:border-[#10B981] transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-stone-400 hover:text-stone-700"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                className="rounded border-stone-300 text-[#10B981] focus:ring-[#10B981]"
              />
              <label htmlFor="remember" className="text-xs text-stone-600 cursor-pointer">
                Keep me signed in for 30 days
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
                  <span>Sign In to Account</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div className="relative flex items-center justify-center text-xs text-stone-400 py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200"></div>
            </div>
            <span className="relative bg-white px-3 text-stone-500 font-medium">Or continue with</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="py-2.5 px-4 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-red-500">g_mobiledata</span>
              <span>Google</span>
            </button>
            <button className="py-2.5 px-4 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-stone-900">code</span>
              <span>GitHub</span>
            </button>
          </div>

          <p className="text-center text-xs text-stone-500 pt-2">
            Don't have an account yet?{' '}
            <Link href="/sign-up" className="font-bold text-[#006c49] hover:underline">
              Create a free account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
