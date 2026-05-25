import { logger } from '../utils/logger';

interface AnalysisResult {
  summary: string;
  risk_clauses: RiskClause[];
  key_terms: string[];
  confidence_score: number;
  risk_level: 'Low' | 'Medium' | 'High';
  word_count: number;
  flags: string[];
}

interface RiskClause {
  clause: string;
  severity: 'Low' | 'Medium' | 'High';
  explanation: string;
  page?: number;
}

const HIGH_RISK_KEYWORDS = [
  'indemnify', 'indemnification', 'unlimited liability', 'perpetual license',
  'irrevocable', 'waive all rights', 'exclusive rights', 'sole discretion',
  'non-compete', 'liquidated damages', 'penalty clause', 'automatic renewal',
  'termination without cause', 'arbitration mandatory', 'class action waiver',
  'unilateral modification', 'binding arbitration',
];

const MEDIUM_RISK_KEYWORDS = [
  'confidential', 'proprietary', 'intellectual property', 'data retention',
  'third party', 'assignment', 'sublicense', 'governing law', 'jurisdiction',
  'limitation of liability', 'warranty disclaimer', 'force majeure',
  'amendment', 'entire agreement', 'severability',
];

const LOW_RISK_KEYWORDS = [
  'payment terms', 'delivery', 'notice period', 'contact information',
  'effective date', 'renewal', 'general terms', 'standard practice',
  'industry standard', 'mutual agreement', 'good faith',
];

const MOCK_CLAUSES_HIGH: RiskClause[] = [
  {
    clause: 'Unlimited Indemnification Clause',
    severity: 'High',
    explanation: 'Party agrees to indemnify and hold harmless without any cap on liability. This exposes your organization to unlimited financial risk.',
    page: 3,
  },
  {
    clause: 'Perpetual & Irrevocable License Grant',
    severity: 'High',
    explanation: 'License granted is perpetual and irrevocable, meaning you cannot revoke access to your IP even after contract termination.',
    page: 5,
  },
  {
    clause: 'Mandatory Arbitration + Class Action Waiver',
    severity: 'High',
    explanation: 'Disputes must go to binding arbitration and you waive the right to class action lawsuits, severely limiting legal recourse.',
    page: 8,
  },
];

const MOCK_CLAUSES_MEDIUM: RiskClause[] = [
  {
    clause: 'Data Retention & Usage Rights',
    severity: 'Medium',
    explanation: 'Third-party may retain your data for up to 5 years and use it for service improvement purposes.',
    page: 4,
  },
  {
    clause: 'Unilateral Amendment Right',
    severity: 'Medium',
    explanation: 'Vendor reserves the right to modify terms with 30-day notice. Continued use constitutes acceptance.',
    page: 6,
  },
  {
    clause: 'Broad IP Assignment',
    severity: 'Medium',
    explanation: 'Work product assignment clause is broadly worded and may include background IP created prior to engagement.',
    page: 7,
  },
];

const MOCK_CLAUSES_LOW: RiskClause[] = [
  {
    clause: 'Standard Payment Terms',
    severity: 'Low',
    explanation: 'Net-30 payment terms with standard late fee provisions. Industry standard and well-defined.',
    page: 2,
  },
  {
    clause: 'Reasonable Notice Period',
    severity: 'Low',
    explanation: '60-day termination notice is fair and gives adequate time for transition planning.',
    page: 9,
  },
];

export async function analyzeDocument(
  fileName: string,
  _fileBuffer?: Buffer
): Promise<AnalysisResult> {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 3000));

  const fileNameLower = fileName.toLowerCase();
  
  // Determine risk profile based on filename keywords (mock logic)
  let riskProfile: 'High' | 'Medium' | 'Low';
  
  if (
    fileNameLower.includes('nda') ||
    fileNameLower.includes('non-disclosure') ||
    fileNameLower.includes('enterprise') ||
    fileNameLower.includes('acquisition')
  ) {
    riskProfile = 'High';
  } else if (
    fileNameLower.includes('service') ||
    fileNameLower.includes('vendor') ||
    fileNameLower.includes('partner') ||
    fileNameLower.includes('msa')
  ) {
    riskProfile = 'Medium';
  } else {
    // Random for other docs
    const r = Math.random();
    riskProfile = r < 0.2 ? 'High' : r < 0.6 ? 'Medium' : 'Low';
  }

  // Build risk clauses based on profile
  let risk_clauses: RiskClause[];
  let summary: string;
  let confidence_score: number;
  let flags: string[];

  if (riskProfile === 'High') {
    risk_clauses = [...MOCK_CLAUSES_HIGH, MOCK_CLAUSES_MEDIUM[0]];
    summary =
      'This document contains several high-severity clauses that pose significant legal and financial risk to your organization. Immediate legal review is strongly recommended before signing. Key concerns include unlimited indemnification, irrevocable IP assignment, and mandatory arbitration clauses that severely limit your legal recourse.';
    confidence_score = 0.89 + Math.random() * 0.08;
    flags = [
      'Unlimited liability exposure detected',
      'Irrevocable license grant identified',
      'Mandatory arbitration clause present',
      'Class action waiver found',
    ];
  } else if (riskProfile === 'Medium') {
    risk_clauses = [...MOCK_CLAUSES_MEDIUM, MOCK_CLAUSES_LOW[0]];
    summary =
      'This document presents moderate risk with several clauses requiring careful review. While no critical red flags were detected, data retention provisions, broad IP assignment language, and unilateral amendment rights warrant attention. Consider negotiating specific clauses before execution.';
    confidence_score = 0.82 + Math.random() * 0.1;
    flags = [
      'Broad data retention rights detected',
      'IP assignment language review recommended',
      'Unilateral amendment clause present',
    ];
  } else {
    risk_clauses = MOCK_CLAUSES_LOW;
    summary =
      'This document appears to be standard and low-risk. Payment terms, notice periods, and general provisions are within acceptable industry norms. Minimal legal intervention required, though a routine review is always advisable for compliance.';
    confidence_score = 0.91 + Math.random() * 0.08;
    flags = ['Standard payment terms', 'Reasonable notice periods'];
  }

  // Build key terms
  const allKeywords =
    riskProfile === 'High'
      ? HIGH_RISK_KEYWORDS.slice(0, 6)
      : riskProfile === 'Medium'
      ? [...MEDIUM_RISK_KEYWORDS.slice(0, 4), ...LOW_RISK_KEYWORDS.slice(0, 2)]
      : LOW_RISK_KEYWORDS;

  logger.info(`Document analysis complete: ${fileName} → Risk: ${riskProfile}`);

  return {
    summary,
    risk_clauses,
    key_terms: allKeywords,
    confidence_score: Math.min(0.99, confidence_score),
    risk_level: riskProfile,
    word_count: Math.floor(1200 + Math.random() * 8000),
    flags,
  };
}
