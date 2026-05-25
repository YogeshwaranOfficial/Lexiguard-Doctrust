import type { DocumentStatus } from '../../types';
import { Loader2 } from 'lucide-react';

const config: Record<DocumentStatus, { label: string; pulse?: boolean }> = {
  Pending:    { label: 'Pending' },
  Processing: { label: 'Processing', pulse: true },
  Completed:  { label: 'Completed' },
  Failed:     { label: 'Failed' },
};

export default function StatusBadge({ status }: { status: DocumentStatus }) {
  const { label, pulse } = config[status];
  return (
    <span className={`status-badge status-${status.toLowerCase()}`}>
      {pulse ? <Loader2 size={10} className="animate-spin" /> : <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />}
      {label}
    </span>
  );
}
