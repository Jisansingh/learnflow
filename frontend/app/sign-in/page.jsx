'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase, setSessionPersistence, clearPersistedSession } from '../../lib/supabaseClient';

function getFriendlyError(message) {
  const msg = (message || '').toLowerCase();
  if (msg.includes('invalid login credentials')) {
    return 'Incorrect email or password. Please try again.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Please confirm your email address first, then sign in.';
  }
  if (msg.includes('rate limit')) {
    return 'Too many attempts. Please wait a minute and try again.';
  }
  return 'Could not sign you in. Please try again.';
}

// Ensures a students row exists for the authenticated user.
// Uses students.id = auth user id. Does not create duplicates.
// Does NOT store the learning goal because the student_goals table
// has no "goal" column (only: id, student_id, status, target_date, created_at).
async function ensureStudentProfile(user) {
  if (!user) return;
  const { data: existing, error: checkErr } = await supabase.from('students').select('id').eq('id', user.id).maybeSingle();
  if (checkErr) return;
  if (existing) return; // already exists, no duplicate
  await supabase.from('students').insert({
    id: user.id,
    full_name: user.user_metadata?.full_name || '',
    email: user.email,
  });
  // TODO: student_goals table has no "goal" column —
  // learning goal storage deferred to later checkpoint with schema update.
}

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    setLoading(true);
    // Route the Supabase Auth session to persistent (localStorage) or
    // session-only (in-memory) storage before signing in.
    setSessionPersistence(rememberMe);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError(getFriendlyError(signInError.message));
        return;
      }
      if (data.user) {
        // Without "remember me", drop any previously persisted session so
        // only the in-memory session remains.
        if (!rememberMe) {
          clearPersistedSession();
        }
        try {
          await ensureStudentProfile(data.user);
        } catch {
          // best-effort; the account is still signed in.
        }
        setSubmitted(true);
        router.push('/');
      }
    } catch {
      setError('Could not sign you in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-clear error message when user starts typing
  useEffect(() => {
    const timer = setTimeout(() => setError(''), 3000);
    return () => clearTimeout(timer);
  }, [error]);

  return (
    <div className="w-full bg-[#FAF9F5] min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 md:px-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden">
        {/* Sign In Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-stone-900">Sign In to LearnFlow</h1>
            <p className="text-xs text-stone-500">
              Enter your credentials to access your account dashboard.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {submitted && (
            <div className="p-4 bg-stone-100 border border-stone-200 rounded-xl text-xs text-stone-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>Signed in successfully! Taking you to LearnFlow...</span>
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
                className="w-full bg-[#FAF9F5] border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-900 focus:outline-none focus:border-stone-400 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-800">Password</label>
                <span className="text-xs text-stone-900 hover:underline cursor-pointer font-semibold">
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
                  className="w-full bg-[#FAF9F5] border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-900 focus:outline-none focus:border-stone-400 transition-colors pr-10"
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
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-stone-300 text-stone-900 focus:ring-stone-400"
              />
              <label htmlFor="remember" className="text-xs text-stone-600 cursor-pointer">
                Keep me signed in for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
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

          <p className="text-center text-xs text-stone-500 pt-2">
            Don't have an account yet?{' '}
            <Link href="/sign-up" className="font-bold text-stone-900 hover:underline">
              Create a free account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}