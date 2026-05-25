import { useState, useEffect, useCallback } from 'react';
import { getDocuments, getStats } from '../utils/api';
import type { Document, PaginatedDocuments, StatsOverview, Filters } from '../types';

export function useDocuments(filters?: Filters) {
  const [data, setData] = useState<PaginatedDocuments | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getDocuments(filters, page);
      setData(result);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  }, [filters?.status, filters?.risk_level, page]);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  // Auto-refresh if any doc is still processing
  useEffect(() => {
    const hasProcessing = data?.documents.some(
      (d) => d.status === 'Pending' || d.status === 'Processing'
    );
    if (!hasProcessing) return;
    const interval = setInterval(fetchDocuments, 3000);
    return () => clearInterval(interval);
  }, [data, fetchDocuments]);

  return { data, loading, error, refetch: fetchDocuments, page, setPage };
}

export function useStats() {
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
}
