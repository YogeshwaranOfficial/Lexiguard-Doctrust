import type { RiskLevel } from '../../types';

const config: Record<RiskLevel, { label: string; dot: string }> = {
  Low:    { label: 'Low Risk',    dot: '#10b981' },
  Medium: { label: 'Med Risk',   dot: '#f59e0b' },
  High:   { label: 'High Risk',  dot: '#ef4444' },
};

export default function RiskBadge({ level }: { level?: RiskLevel }) {
  if (!level) return <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>—</span>;
  const { label, dot } = config[level];
  return (
    <span className={`risk-badge risk-${level.toLowerCase()}`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, display: 'inline-block' }} />
      {label}
    </span>
  );
}
