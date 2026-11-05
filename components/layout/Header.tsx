'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Search, Sun, Moon, Menu } from 'lucide-react';
import { useGetReportsQuery } from '@/lib/features/reports/reportsApi';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { admin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const { data: pending } = useGetReportsQuery({ status: 'pending', limit: 1 }, { pollingInterval: 60000 });
  const pendingCount = pending?.total ?? 0;

  return (
    <header className="h-14 sm:h-16 bg-[var(--sidebar-bg)] border-b border-[var(--border-color)] flex items-center justify-between px-3 sm:px-4 md:px-6 transition-colors">
      {/* Mobile Menu Button & Search */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-hover)] transition-all"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar - Hidden on mobile */}
        <div className="hidden sm:flex flex-1 max-w-md">
          <form
            className="relative w-full"
            onSubmit={(e) => {
              e.preventDefault();
              const q = query.trim();
              router.push(q ? `/brands?q=${encodeURIComponent(q)}` : '/brands');
            }}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search brands…"
              aria-label="Search brands"
              className="w-full pl-10 pr-4 py-2 text-sm border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-all bg-[var(--bg-hover)]"
            />
          </form>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-hover)] transition-all"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </button>

        {/* Notifications */}
        <Link
          href="/reports"
          className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-hover)] transition-all"
          aria-label={`${pendingCount} pending reports`}
          title={`${pendingCount} pending reports`}
        >
          <Bell className="w-5 h-5" />
          {pendingCount > 0 && (
            <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 flex items-center justify-center text-[10px] font-bold bg-[var(--danger-solid)] text-white rounded-full">
              {pendingCount > 99 ? '99+' : pendingCount}
            </span>
          )}
        </Link>

        {/* User Info */}
        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-[var(--border-color)]">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {admin?.firstName} {admin?.lastName}
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              {admin?.email}
            </p>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)] text-xs font-bold">
            {admin?.firstName?.[0]}{admin?.lastName?.[0]}
          </div>
        </div>
      </div>
    </header>
  );
}
