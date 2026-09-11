'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  // The Home page ends with its own content (no black CTA/footer area).
  if (pathname === '/') {
    return null;
  }
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-[#1B1C1A] text-stone-300 border-t border-stone-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-stone-800">
          {/* Brand Info */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-1.5 font-headline tracking-tight text-white">
              <span className="text-xl font-extrabold ml-1">LearnFlow</span>
            </div>
            <p className="text-sm text-stone-400 max-w-sm leading-relaxed">
              Empowering learners worldwide with adaptive AI-generated learning paths, interactive code assessments, and real-time skill analytics.
            </p>
            <div className="flex items-center gap-3 pt-2">
              {['code', 'terminal', 'hub', 'rocket_launch'].map((iconName, idx) => (
                <div
                  key={idx}
                  className="w-9 h-9 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-300 hover:text-white hover:border-stone-500 cursor-pointer transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">{iconName}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links Column 1 */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-white text-sm font-semibold tracking-wide uppercase">Platform</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/learning-paths" className="hover:text-white transition-colors">Learning Paths</Link>
              </li>
              <li>
                <Link href="/assessments" className="hover:text-white transition-colors">Assessments</Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-white transition-colors">Resources</Link>
              </li>
              <li>
                <Link href="/progress" className="hover:text-white transition-colors">Progress Tracker</Link>
              </li>
            </ul>
          </div>

          {/* Quick Links Column 2 */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-white text-sm font-semibold tracking-wide uppercase">Tracks</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li><span className="hover:text-white cursor-pointer transition-colors">React & AI Developer</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Python & LLM Ops</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Vector Databases & RAG</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Prompt Engineering</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Fullstack Next.js</span></li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-white text-sm font-semibold tracking-wide uppercase">Stay Updated</h4>
            <p className="text-sm text-stone-400">
              Subscribe to get notified about new AI engineering paths, tools, and weekly code challenges.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-stone-500 flex-1"
                  required
                />
                <button
                  type="submit"
                  className="bg-white hover:bg-stone-200 text-stone-900 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow"
                >
                  Join
                </button>
              </div>
              {subscribed && (
                <p className="text-xs text-stone-300 flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  Successfully subscribed!
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© 2026 LearnFlow AI Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-stone-300 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-stone-300 cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-stone-300 cursor-pointer transition-colors">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
