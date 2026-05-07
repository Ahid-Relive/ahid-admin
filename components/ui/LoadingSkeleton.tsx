'use client';

export function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="dark:bg-[var(--bg-card)] rounded-xl p-6 h-32 border border-[var(--border-color)]">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-4 border-b border-[var(--border-color)]">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
        </div>
      ))}
    </div>
  );
}
