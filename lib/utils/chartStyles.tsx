// Chart color constants that work well in both light and dark modes
export const CHART_COLORS = ['#22D3BE', '#34D399', '#FBBF24', '#F87171', '#60A5FA', '#A78BFA'];

// Custom Tooltip component for Recharts that respects theme
export const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="dark:bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-[var(--text-primary)] mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs text-[var(--text-secondary)]">
            <span style={{ color: entry.color }}>{entry.name}: </span>
            <span className="font-semibold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};
