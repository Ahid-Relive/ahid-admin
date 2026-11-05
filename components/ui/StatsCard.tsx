'use client';

import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

type Tone = 'primary' | 'blue' | 'green' | 'purple' | 'teal' | 'orange' | 'red';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: Tone;
  subtitle?: string;
  /** Percentage change vs previous period (null = not enough data) */
  delta?: number | null;
  deltaLabel?: string;
}

const tones: Record<Tone, string> = {
  primary: 'bg-[var(--primary-light)] text-[var(--primary)]',
  teal: 'bg-[var(--primary-light)] text-[var(--primary)]',
  blue: 'bg-[var(--info-light)] text-[var(--info)]',
  green: 'bg-[var(--success-light)] text-[var(--success)]',
  orange: 'bg-[var(--warning-light)] text-[var(--warning)]',
  red: 'bg-[var(--danger-light)] text-[var(--danger)]',
  purple: 'bg-[color-mix(in_srgb,var(--chart-4)_16%,transparent)] text-[var(--chart-4)]',
};

export function StatsCard({ title, value, icon: Icon, color = 'primary', subtitle, delta, deltaLabel = 'vs last month' }: StatsCardProps) {
  const up = (delta ?? 0) > 0;
  const flat = delta === 0;
  return (
    <div className="card card-hover p-4 sm:p-5 transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow">{title}</p>
          <p className="mt-2 truncate font-[family-name:var(--font-manrope)] text-2xl font-extrabold text-[var(--text-primary)] sm:text-[1.75rem]">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${tones[color]}`}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        {delta !== undefined && delta !== null && (
          <span
            className={`inline-flex items-center gap-0.5 font-semibold ${
              flat ? 'text-[var(--text-tertiary)]' : up ? 'text-[var(--success)]' : 'text-[var(--danger)]'
            }`}
          >
            {flat ? <Minus className="h-3 w-3" /> : up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {Math.abs(delta).toFixed(delta % 1 === 0 ? 0 : 1)}%
          </span>
        )}
        {delta !== undefined && delta !== null && <span className="text-[var(--text-tertiary)]">{deltaLabel}</span>}
        {subtitle && <span className="text-[var(--text-secondary)]">{subtitle}</span>}
      </div>
    </div>
  );
}
