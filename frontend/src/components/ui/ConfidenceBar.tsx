export default function ConfidenceBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 90 ? '#10b981' : pct >= 75 ? '#f59e0b' : '#ef4444';
  return (
    <div>
      <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
        <span>Analysis Confidence</span>
        <span style={{ color, fontWeight: 600 }}>{pct}%</span>
      </div>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
        <div style={{
          height: '100%', width: `${pct}%`, background: color,
          borderRadius: 2, transition: 'width 1s ease-out',
          boxShadow: `0 0 8px ${color}66`,
        }} />
      </div>
    </div>
  );
}
