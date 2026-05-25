import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, SlidersHorizontal, Trash2, ExternalLink } from 'lucide-react';
import RiskBadge from '../components/ui/RiskBadge';
import StatusBadge from '../components/ui/StatusBadge';
import SkeletonRow from '../components/ui/SkeletonRow';
import { useDocuments } from '../hooks/useDocuments';
import { deleteDocument } from '../utils/api';
import type { DocumentStatus, RiskLevel, Filters } from '../types';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function DocumentsPage() {
  const [filters, setFilters] = useState<Filters>({});
  const [deleting, setDeleting] = useState<string | null>(null);
  const { data, loading, error, refetch, page, setPage } = useDocuments(filters);

  const docs = data?.documents || [];
  const pagination = data?.pagination;

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    setDeleting(id);
    try {
      await deleteDocument(id);
      toast.success('Document deleted');
      refetch();
    } catch {
      toast.error('Failed to delete document');
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-700" style={{ color: 'var(--text-primary)' }}>
            Document Library
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {pagination ? `${pagination.total} documents total` : 'Loading...'}
          </p>
        </div>
        <Link to="/" className="btn-primary">
          + Upload New
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 flex items-center gap-4">
        <SlidersHorizontal size={15} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
        <div className="flex items-center gap-3 flex-1">
          <div>
            <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>Status</label>
            <select
              value={filters.status || ''}
              onChange={e => setFilters(f => ({ ...f, status: e.target.value as DocumentStatus | '' }))}
              style={{
                background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px',
                fontSize: 13, outline: 'none', cursor: 'pointer',
              }}>
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Completed">Completed</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>Risk Level</label>
            <select
              value={filters.risk_level || ''}
              onChange={e => setFilters(f => ({ ...f, risk_level: e.target.value as RiskLevel | '' }))}
              style={{
                background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px',
                fontSize: 13, outline: 'none', cursor: 'pointer',
              }}>
              <option value="">All Risk Levels</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          {(filters.status || filters.risk_level) && (
            <button className="btn-ghost text-xs mt-5" onClick={() => setFilters({})}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Document', 'Uploaded', 'Status', 'Risk Level', 'Actions'].map(h => (
                <th key={h} style={{
                  padding: '12px 16px', textAlign: 'left', fontSize: 11,
                  fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
                  color: 'var(--text-secondary)', fontFamily: '"DM Sans", sans-serif',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
            {!loading && error && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#ef4444' }}>
                  Error: {error}
                </td>
              </tr>
            )}
            {!loading && !error && docs.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 48 }}>
                  <FileText size={28} style={{ color: 'var(--text-secondary)', margin: '0 auto 12px', opacity: 0.4 }} />
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No documents found</p>
                </td>
              </tr>
            )}
            {!loading && docs.map((doc, idx) => (
              <tr key={doc.id}
                style={{
                  borderBottom: idx < docs.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '12px 16px' }}>
                  <div className="flex items-center gap-3">
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: 'rgba(30,179,255,0.08)', border: '1px solid rgba(30,179,255,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <FileText size={14} style={{ color: '#1eb3ff' }} />
                    </div>
                    <div>
                      <Link to={`/documents/${doc.id}`}
                        style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: 14, textDecoration: 'none' }}
                        className="hover:underline">
                        {doc.file_name}
                      </Link>
                      <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, fontFamily: 'JetBrains Mono, monospace' }}>
                        {doc.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
                  {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <StatusBadge status={doc.status} />
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <RiskBadge level={doc.risk_level} />
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div className="flex items-center gap-2">
                    <Link to={`/documents/${doc.id}`} className="btn-ghost"
                      style={{ padding: '5px 10px', fontSize: 12 }}>
                      <ExternalLink size={12} />
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(doc.id, doc.file_name)}
                      disabled={deleting === doc.id}
                      style={{
                        background: 'transparent', border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: 6, padding: '5px 8px', cursor: 'pointer',
                        color: '#ef4444', transition: 'all 0.15s', display: 'flex', alignItems: 'center',
                      }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3"
            style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button className="btn-ghost text-xs" disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}>
                Previous
              </button>
              <button className="btn-ghost text-xs" disabled={page >= pagination.totalPages}
                onClick={() => setPage(p => p + 1)}>
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
