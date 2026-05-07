'use client';

import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'purple' | 'teal' | 'orange' | 'red' | 'primary';
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const colorClasses = {
  blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', icon: 'bg-blue-100 dark:bg-blue-800/30' },
  green: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', icon: 'bg-green-100 dark:bg-green-800/30' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', icon: 'bg-purple-100 dark:bg-purple-800/30' },
  teal: { bg: 'bg-teal-50 dark:bg-teal-900/20', text: 'text-teal-600 dark:text-teal-400', icon: 'bg-teal-100 dark:bg-teal-800/30' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', icon: 'bg-orange-100 dark:bg-orange-800/30' },
  red: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', icon: 'bg-red-100 dark:bg-red-800/30' },
  primary: { bg: 'bg-[var(--primary-subtle)]', text: 'text-[var(--primary)]', icon: 'bg-[var(--primary-light)]' },
};

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  color = 'primary',
  subtitle,
  trend
}: StatsCardProps) {
  const colors = colorClasses[color];

  return (
    <div className="dark:bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-3 sm:p-4 md:p-5 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide mb-1">
            {title}
          </p>
          <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-1 truncate">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
          {subtitle && (
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-xs font-semibold ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-[var(--text-tertiary)]">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-2 sm:p-2.5 rounded-lg ${colors.icon} flex-shrink-0`}>
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${colors.text}`} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
