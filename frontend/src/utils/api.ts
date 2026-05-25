import axios from 'axios';
import toast from 'react-hot-toast';
import type { Document, PaginatedDocuments, StatsOverview, AuthResponse, Filters } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lexiguard_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global error handling
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const msg = error.response?.data?.error || 'An unexpected error occurred';
    if (error.response?.status === 401) {
      localStorage.removeItem('lexiguard_token');
      localStorage.removeItem('lexiguard_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Documents
export async function uploadDocument(file: File, onProgress?: (pct: number) => void): Promise<Document> {
  const formData = new FormData();
  formData.append('document', file);
  const { data } = await api.post<{ document: Document }>('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
    },
  });
  return data.document;
}

export async function getDocuments(filters?: Filters, page = 1, limit = 20): Promise<PaginatedDocuments> {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.risk_level) params.set('risk_level', filters.risk_level);
  params.set('page', String(page));
  params.set('limit', String(limit));
  const { data } = await api.get<PaginatedDocuments>(`/documents?${params}`);
  return data;
}

export async function getDocument(id: string): Promise<Document> {
  const { data } = await api.get<Document>(`/documents/${id}`);
  return data;
}

export async function deleteDocument(id: string): Promise<void> {
  await api.delete(`/documents/${id}`);
}

export async function getStats(): Promise<StatsOverview> {
  const { data } = await api.get<StatsOverview>('/documents/stats/overview');
  return data;
}

// Auth
export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
  return data;
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', { name, email, password });
  return data;
}

export default api;
