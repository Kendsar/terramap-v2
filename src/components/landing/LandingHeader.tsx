'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Map as MapIcon, Bell, Globe, User, LogOut, LogIn, Menu, X, Plus, ChevronDown } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { cn } from '@/lib/utils';

interface LandingHeaderProps {
  onOpenAuth: () => void;
}

export function LandingHeader({ onOpenAuth }: LandingHeaderProps) {
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-[900] transition-all duration-300',
          isScrolled
            ? 'bg-white/80 dark:bg-[#0b0d10]/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/10 shadow-sm'
            : 'bg-transparent'
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative">
              <MapIcon className="h-7 w-7 text-emerald-500 stroke-[2.5px] transition-transform duration-300 group-hover:scale-110" />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span className="font-outfit text-[22px] font-extrabold tracking-[0.08em] text-white">
              Terra<span className="text-emerald-500">Link</span>
            </span>
          </Link>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="px-4 py-2 text-[14px] font-semibold text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/8 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
            >
              Explore
            </Link>
            <Link
              href="/map"
              className="flex items-center gap-1.5 px-4 py-2 text-[14px] font-semibold text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/8 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
            >
              <MapIcon className="h-3.5 w-3.5" />
              Map
            </Link>
            <Link
              href="/map?action=list"
              className="px-4 py-2 text-[14px] font-semibold text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/8 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
            >
              List a Property
            </Link>
            {user && (
              <Link
                href="/map"
                className="px-4 py-2 text-[14px] font-semibold text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/8 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
              >
                My Properties
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme Toggle */}
            <ThemeToggle variant="header" />

            {/* Language / Currency */}
            <button className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-semibold text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/8 hover:text-slate-900 dark:hover:text-white transition-all">
              <Globe className="h-4 w-4" />
              <span>TND · AR</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </button>

            {user ? (
              <>
                {/* Notifications */}
                <button className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/8 hover:text-slate-900 dark:hover:text-white transition-all">
                  <Bell className="h-4.5 w-4.5" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500" />
                </button>

                {/* User Avatar + logout */}
                <div className="flex items-center gap-1.5">
                  <button
                    title={`Signed in as ${user.displayName || user.email}`}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 py-1.5 px-3 text-sm text-slate-800 dark:text-gray-200 hover:border-emerald-500/40 transition-all"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white uppercase">
                      {(user.displayName || user.email || 'U')[0]}
                    </div>
                    <span className="max-w-[80px] truncate text-[13px] font-semibold">
                      {user.displayName || user.email?.split('@')[0]}
                    </span>
                  </button>
                  <button
                    onClick={() => logout()}
                    title="Sign Out"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-semibold text-white hover:hover:bg-white/8 dark:hover:bg-white/8 transition-all"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Sign In
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 text-white hover:bg-slate-100 dark:hover:bg-white/8 transition-all"
            onClick={() => setIsMobileMenuOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <div
        className={cn(
          'fixed inset-0 z-[800] md:hidden transition-all duration-300',
          isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'
        )}
      >
        {/* Backdrop */}
        <div
          className={cn(
            'absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300',
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        {/* Panel */}
        <div
          className={cn(
            'absolute top-0 right-0 h-full w-72 bg-white dark:bg-[#15181e] shadow-2xl transition-transform duration-300',
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <div className="p-6 pt-20 flex flex-col gap-2">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block rounded-xl px-4 py-3 text-[15px] font-semibold text-slate-800 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/8 transition-all">Explore</Link>
            <Link href="/map?action=list" onClick={() => setIsMobileMenuOpen(false)} className="block rounded-xl px-4 py-3 text-[15px] font-semibold text-slate-800 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/8 transition-all">Add a Property</Link>
            <Link href="/map" onClick={() => setIsMobileMenuOpen(false)} className="block rounded-xl px-4 py-3 text-[15px] font-semibold text-slate-800 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/8 transition-all">Map</Link>
            {user && <Link href="/map" onClick={() => setIsMobileMenuOpen(false)} className="block rounded-xl px-4 py-3 text-[15px] font-semibold text-slate-800 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/8 transition-all">My Properties</Link>}
            <div className="h-px bg-slate-200 dark:bg-white/10 my-2" />
            {user ? (
              <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="flex items-center gap-2 rounded-xl px-4 py-3 text-[15px] font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            ) : (
              <button onClick={() => { onOpenAuth(); setIsMobileMenuOpen(false); }} className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-[15px] font-bold text-white transition-all">
                <LogIn className="h-4 w-4" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
