import { useState, useEffect, useCallback } from 'react';
import { getDocument } from '../utils/api';
import type { Document } from '../types';

export function useDocument(id: string) {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocument = useCallback(async () => {
    try {
      const doc = await getDocument(id);
      setDocument(doc);
      return doc;
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to fetch document');
      return null;
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchDocument(); }, [fetchDocument]);

  // Poll if still processing
  useEffect(() => {
    if (!document) return;
    if (document.status !== 'Pending' && document.status !== 'Processing') return;
    const interval = setInterval(async () => {
      const updated = await fetchDocument();
      if (updated && updated.status !== 'Pending' && updated.status !== 'Processing') {
        clearInterval(interval);
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [document?.status]);

  return { document, loading, error, refetch: fetchDocument };
}
