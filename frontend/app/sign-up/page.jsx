'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

function getFriendlyError(message) {
  const msg = (message || '').toLowerCase();
  if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('already been registered')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (msg.includes('rate limit')) {
    return 'Too many attempts. Please wait a minute and try again.';
  }
  if (msg.includes('email')) {
    return 'Please enter a valid email address.';
  }
  if (msg.includes('password')) {
    return 'Password is too weak. Use at least 8 characters with a mix of letters and numbers.';
  }
  return 'Could not create your account. Please try again.';
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

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (signUpError) {
        setError(getFriendlyError(signUpError.message));
        return;
      }
      if (data.user) {
        try {
          await ensureStudentProfile(data.user);
        } catch {
          // best-effort; sign-in will retry it.
        }
        setSubmitted(true);
        setInfo('Account created! Please check your email to confirm it, then sign in.');
      } else {
        setSubmitted(true);
        setInfo('Account creation started. Please check your email to confirm.');
      }
    } catch {
      setError('Could not create your account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-clear info message after a few seconds
  useEffect(() => {
    if (info && !submitted) {
      const timer = setTimeout(() => setInfo(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [info, submitted]);

  return (
    <div className="w-full bg-[#FAF9F5] min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 md:px-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden">
        {/* Sign Up Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-stone-900">Create Your LearnFlow Account</h1>
            <p className="text-xs text-stone-500">
              Fill in details to generate your first custom learning path.
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
              <span>{info || 'Account created successfully! Welcome to LearnFlow.'}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-800 block">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  required
                  className="w-full bg-[#FAF9F5] border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-900 focus:outline-none focus:border-stone-400 transition-colors"
                />
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
                  className="w-full bg-[#FAF9F5] border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-900 focus:outline-none focus:border-stone-400 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-0.5 rounded border-stone-300 text-stone-900 focus:ring-stone-400"
              />
              <label htmlFor="terms" className="text-xs text-stone-600 cursor-pointer leading-relaxed">
                I agree to the LearnFlow <span className="text-stone-900 underline font-semibold">Terms of Service</span> and <span className="text-stone-900 underline font-semibold">Privacy Policy</span>.
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
                  <span>Create Account & Start</span>
                  <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-stone-500 pt-2">
            Already have an account?{' '}
            <Link href="/sign-in" className="font-bold text-stone-900 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}