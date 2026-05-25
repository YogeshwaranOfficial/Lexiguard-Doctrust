import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  color?: string;
  sub?: string;
}

export default function StatCard({ label, value, icon, color = '#1eb3ff', sub }: StatCardProps) {
  return (
    <div className="card p-5" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 80, height: 80,
        background: `radial-gradient(circle at top right, ${color}18, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
          <div className="text-3xl font-display font-700" style={{ color: 'var(--text-primary)' }}>{value}</div>
          {sub && <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{sub}</div>}
        </div>
        <div style={{ color, opacity: 0.8 }}>{icon}</div>
      </div>
    </div>
  );
}
