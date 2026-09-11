'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMobileMenuOpen(false);
    router.push('/');
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Learning Paths', href: '/learning-paths' },
    { name: 'Assessments', href: '/assessments' },
    { name: 'Resources', href: '/resources' },
  ];

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-[#FAF9F5]/90 backdrop-blur-xl border-b border-stone-200">
      <div className="h-20 max-w-7xl mx-auto px-4 md:px-12 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex items-center gap-1.5 font-headline tracking-tight text-[#1B1C1A]">
            <span className="text-xl font-extrabold ml-1">Learning Path</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`transition-all px-3 py-1.5 rounded-lg text-sm md:text-base font-medium ${
                  active
                    ? 'text-[#1B1C1A] font-semibold bg-stone-200/60 border border-stone-300 shadow-sm'
                    : 'text-stone-600 hover:text-[#1B1C1A] hover:bg-stone-100/50'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Auth / User Action */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm font-semibold text-stone-700 max-w-[160px] truncate">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-sm font-semibold text-[#1B1C1A] hover:text-stone-600 px-3 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow"
              >
                Sign Up
              </Link>
            </>
          )}
          <Link href="/progress" className="w-9 h-9 rounded-full bg-stone-200 border border-stone-300 flex items-center justify-center hover:bg-stone-300 transition-colors">
            <span className="material-symbols-outlined text-[#1B1C1A] text-[18px]">person</span>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/progress" className="w-8 h-8 rounded-full bg-stone-200 border border-stone-300 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#1B1C1A] text-[16px]">person</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-stone-700 hover:bg-stone-200/60 transition-colors"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF9F5] border-b border-stone-200 px-4 pt-2 pb-6 space-y-3 shadow-lg">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-base font-medium transition-colors ${
                  active
                    ? 'bg-stone-200 border border-stone-300 text-[#1B1C1A] font-semibold'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <div className="pt-4 border-t border-stone-200 flex flex-col gap-2">
            {user ? (
              <>
                <button
                  onClick={handleLogout}
                  className="w-full text-center py-2.5 text-white font-semibold rounded-xl bg-stone-900 shadow-sm"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-stone-900 font-semibold border border-stone-300 rounded-xl bg-white"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-white font-semibold rounded-xl bg-stone-900 shadow-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}