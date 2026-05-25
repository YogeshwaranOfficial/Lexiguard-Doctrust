import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, AlertTriangle, CheckCircle, Clock, Tag, Flag, Zap } from 'lucide-react';
import RiskBadge from '../components/ui/RiskBadge';
import StatusBadge from '../components/ui/StatusBadge';
import ConfidenceBar from '../components/ui/ConfidenceBar';
import { useDocument } from '../hooks/useDocument';
import { formatDistanceToNow, format } from 'date-fns';
import type { RiskLevel } from '../types';

const SEVERITY_CONFIG: Record<RiskLevel, { icon: any; color: string; bg: string }> = {
  High:   { icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
  Medium: { icon: Clock,         color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  Low:    { icon: CheckCircle,   color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
};

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { document, loading, error } = useDocument(id!);

  if (loading) return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="skeleton h-8 w-8 rounded-lg" />
        <div className="skeleton h-6 w-48" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-xl" />)}
      </div>
      <div className="skeleton h-48 rounded-xl" />
      <div className="skeleton h-96 rounded-xl" />
    </div>
  );

  if (error || !document) return (
    <div className="text-center py-20">
      <AlertTriangle size={32} style={{ color: '#ef4444', margin: '0 auto 12px' }} />
      <p style={{ color: 'var(--text-secondary)' }}>{error || 'Document not found'}</p>
      <Link to="/documents" className="btn-ghost mt-4 inline-flex">Back to Library</Link>
    </div>
  );

  const analysis = document.extracted_json;
  const isProcessing = document.status === 'Pending' || document.status === 'Processing';

  return (
    <div className="space-y-5 animate-slide-up max-w-5xl">
      {/* Back nav */}
      <Link to="/documents" className="inline-flex items-center gap-2 text-sm"
        style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.15s' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
        <ArrowLeft size={14} /> Back to Library
      </Link>

      {/* Header */}
      <div className="card p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div style={{
              width: 48, height: 48, borderRadius: 12, flexShrink: 0,
              background: 'rgba(30,179,255,0.08)', border: '1px solid rgba(30,179,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FileText size={22} style={{ color: '#1eb3ff' }} />
            </div>
            <div>
              <h2 className="font-display text-xl font-700" style={{ color: 'var(--text-primary)' }}>
                {document.file_name}
              </h2>
              <p className="text-xs mt-1 font-mono" style={{ color: 'var(--text-secondary)' }}>
                {document.id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={document.status} />
            {document.risk_level && <RiskBadge level={document.risk_level} />}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-5 pt-5" style={{ borderTop: '1px solid var(--border)' }}>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Uploaded</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {format(new Date(document.created_at), 'MMM d, yyyy • HH:mm')}
            </p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Last Updated</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {formatDistanceToNow(new Date(document.updated_at), { addSuffix: true })}
            </p>
          </div>
          {analysis && (
            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Word Count</p>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {analysis.word_count.toLocaleString()} words
              </p>
            </div>
          )}
        </div>

        {analysis && (
          <div className="mt-4">
            <ConfidenceBar score={analysis.confidence_score} />
          </div>
        )}
      </div>

      {/* Processing state */}
      {isProcessing && (
        <div className="card p-8 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(30,179,255,0.08)', border: '1px solid rgba(30,179,255,0.2)' }}>
            <Zap size={24} style={{ color: '#1eb3ff' }} className="animate-pulse" />
          </div>
          <h3 className="font-display font-600 mb-2" style={{ color: 'var(--text-primary)' }}>
            Azure Function Processing
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Your document is being analyzed. This page will update automatically.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-xs"
            style={{ color: '#1eb3ff' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            {document.status === 'Pending' ? 'Queued for analysis...' : 'Running NLP analysis...'}
          </div>
        </div>
      )}

      {/* Analysis results */}
      {analysis && document.status === 'Completed' && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="card p-5">
            <h3 className="font-display font-600 mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Flag size={15} style={{ color: '#1eb3ff' }} />
              Executive Summary
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
              {analysis.summary}
            </p>
          </div>

          {/* Risk Clauses */}
          <div className="card p-5">
            <h3 className="font-display font-600 mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <AlertTriangle size={15} style={{ color: '#f59e0b' }} />
              Risk Clauses ({analysis.risk_clauses.length})
            </h3>
            <div className="space-y-3">
              {analysis.risk_clauses.map((clause, i) => {
                const config = SEVERITY_CONFIG[clause.severity];
                const Icon = config.icon;
                return (
                  <div key={i} style={{
                    background: config.bg, border: `1px solid ${config.color}22`,
                    borderRadius: 10, padding: '14px 16px',
                  }}>
                    <div className="flex items-start gap-3">
                      <Icon size={16} style={{ color: config.color, marginTop: 2, flexShrink: 0 }} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-600" style={{ color: config.color }}>{clause.clause}</p>
                          {clause.page && (
                            <span className="text-xs font-mono px-2 py-0.5 rounded"
                              style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                              p.{clause.page}
                            </span>
                          )}
                        </div>
                        <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          {clause.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key terms & Flags */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="font-display font-600 mb-3 flex items-center gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                <Tag size={14} style={{ color: '#1eb3ff' }} />
                Key Legal Terms
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.key_terms.map((term, i) => (
                  <span key={i} style={{
                    background: 'rgba(30,179,255,0.08)', color: '#1eb3ff',
                    border: '1px solid rgba(30,179,255,0.2)', borderRadius: 20,
                    padding: '4px 10px', fontSize: 12, fontWeight: 500,
                  }}>
                    {term}
                  </span>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <h3 className="font-display font-600 mb-3 flex items-center gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                <Flag size={14} style={{ color: '#f59e0b' }} />
                Analysis Flags
              </h3>
              <div className="space-y-2">
                {analysis.flags.map((flag, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#f59e0b', marginTop: 6, flexShrink: 0, display: 'block' }} />
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{flag}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Raw JSON */}
          <div className="card p-5">
            <h3 className="font-display font-600 mb-3 text-sm" style={{ color: 'var(--text-primary)' }}>
              Raw Extracted JSON
            </h3>
            <pre style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '16px', fontSize: 11, lineHeight: '1.6',
              color: 'var(--text-secondary)', overflow: 'auto', maxHeight: 320,
              fontFamily: '"JetBrains Mono", monospace',
            }}>
              {JSON.stringify(analysis, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Failed state */}
      {document.status === 'Failed' && (
        <div className="card p-8 text-center">
          <AlertTriangle size={28} style={{ color: '#ef4444', margin: '0 auto 12px' }} />
          <h3 className="font-display font-600 mb-2" style={{ color: '#ef4444' }}>Analysis Failed</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            The document could not be processed. Please try uploading again.
          </p>
        </div>
      )}
    </div>
  );
}
