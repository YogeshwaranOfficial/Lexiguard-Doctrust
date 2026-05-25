export type DocumentStatus = 'Pending' | 'Processing' | 'Completed' | 'Failed';
export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface RiskClause {
  clause: string;
  severity: RiskLevel;
  explanation: string;
  page?: number;
}

export interface ExtractedJson {
  summary: string;
  risk_clauses: RiskClause[];
  key_terms: string[];
  confidence_score: number;
  risk_level: RiskLevel;
  word_count: number;
  flags: string[];
}

export interface Document {
  id: string;
  file_name: string;
  blob_url: string;
  status: DocumentStatus;
  risk_level?: RiskLevel;
  extracted_json?: ExtractedJson;
  created_at: string;
  updated_at: string;
}

export interface PaginatedDocuments {
  documents: Document[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface StatsOverview {
  total: number;
  byStatus: { status: DocumentStatus; _count: number }[];
  byRisk: { risk_level: RiskLevel; _count: number }[];
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Filters {
  status?: DocumentStatus | '';
  risk_level?: RiskLevel | '';
}
