import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, AlertTriangle, CheckCircle, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import UploadZone from '../components/ui/UploadZone';
import StatCard from '../components/ui/StatCard';
import RiskBadge from '../components/ui/RiskBadge';
import StatusBadge from '../components/ui/StatusBadge';
import SkeletonRow from '../components/ui/SkeletonRow';
import { useDocuments, useStats } from '../hooks/useDocuments';

export default function DashboardPage() {
  const { data, loading, refetch } = useDocuments();
  const { stats, loading: statsLoading } = useStats();
  const [uploading, setUploading] = useState(false);

  const recentDocs = data?.documents.slice(0, 5) || [];

  const statCards = [
    {
      label: 'Total Documents',
      value: stats?.total ?? '—',
      icon: <FileText size={22} />,
      color: '#1eb3ff',
    },
    {
      label: 'High Risk',
      value: stats?.byRisk.find(r => r.risk_level === 'High')?._count ?? 0,
      icon: <AlertTriangle size={22} />,
      color: '#ef4444',
    },
    {
      label: 'Completed',
      value: stats?.byStatus.find(s => s.status === 'Completed')?._count ?? 0,
      icon: <CheckCircle size={22} />,
      color: '#10b981',
    },
    {
      label: 'Processing',
      value: stats?.byStatus.find(s => s.status === 'Processing')?._count
           + (stats?.byStatus.find(s => s.status === 'Pending')?._count ?? 0) || 0,
      icon: <Clock size={22} />,
      color: '#f59e0b',
    },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-700" style={{ color: 'var(--text-primary)' }}>
          Document Risk Analysis
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Upload contracts and agreements for AI-powered risk classification
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Upload */}
        <div className="card p-5">
          <h3 className="font-display font-600 mb-1" style={{ color: 'var(--text-primary)' }}>
            Upload Document
          </h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
            Securely stored in Azure Blob Storage · Analyzed by Azure Functions
          </p>
          <UploadZone onSuccess={refetch} />
          <div className="mt-4 flex items-center gap-2 text-xs p-3 rounded-lg"
            style={{ background: 'rgba(30,179,255,0.06)', border: '1px solid rgba(30,179,255,0.15)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1eb3ff', flexShrink: 0 }} />
            <span style={{ color: 'var(--text-secondary)' }}>
              Documents are analyzed asynchronously — results appear automatically
            </span>
          </div>
        </div>

        {/* Recent */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-600" style={{ color: 'var(--text-primary)' }}>
              Recent Documents
            </h3>
            <Link to="/documents" className="text-xs flex items-center gap-1"
              style={{ color: '#1eb3ff' }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <div className="skeleton h-8 w-8 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-3 w-40" />
                    <div className="skeleton h-3 w-24" />
                  </div>
                  <div className="skeleton h-5 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : recentDocs.length === 0 ? (
            <div className="text-center py-10">
              <FileText size={32} style={{ color: 'var(--text-secondary)', margin: '0 auto 12px', opacity: 0.4 }} />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No documents yet</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>Upload one to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentDocs.map(doc => (
                <Link key={doc.id} to={`/documents/${doc.id}`}
                  className="flex items-center gap-3 p-2.5 rounded-lg transition-all hover:bg-white/[0.03] block">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(30,179,255,0.08)', border: '1px solid rgba(30,179,255,0.15)' }}>
                    <FileText size={14} style={{ color: '#1eb3ff' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {doc.file_name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {doc.status === 'Completed' ? (
                    <RiskBadge level={doc.risk_level} />
                  ) : (
                    <StatusBadge status={doc.status} />
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Azure architecture info */}
      <div className="card p-5">
        <h3 className="font-display font-600 mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <TrendingUp size={16} style={{ color: '#1eb3ff' }} />
          Cloud Architecture
        </h3>
        <div className="grid grid-cols-5 gap-3">
          {[
            { step: '01', label: 'Upload UI', sub: 'React + Vite', color: '#1eb3ff' },
            { step: '02', label: 'API Server', sub: 'Node + Express', color: '#7c3aed' },
            { step: '03', label: 'Blob Storage', sub: 'Azure Blob', color: '#f59e0b' },
            { step: '04', label: 'Processing', sub: 'Azure Functions', color: '#10b981' },
            { step: '05', label: 'Database', sub: 'Azure PostgreSQL', color: '#ef4444' },
          ].map(({ step, label, sub, color }) => (
            <div key={step} className="text-center">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                <span className="text-xs font-mono font-600" style={{ color }}>{step}</span>
              </div>
              <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
