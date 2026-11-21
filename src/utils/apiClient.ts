/**
 * ============================================================================
 * CREST GROUP HARDENED API CLIENT
 * - Uses browser-managed HttpOnly + SameSite=Strict session cookies
 * - Stores Synchronizer CSRF token STRICTLY in JS memory (never localStorage)
 * - Enforces JSON responses and propagates server 401/403/429 security states
 * ============================================================================
 */

import {
  CustomerInquiry,
  PartnershipRequest,
  CareerApplication,
  ProductItem,
  ProjectItem,
  NewsArticle
} from '../types/ecosystem';

export interface CmsAdditions {
  divisionActivities: Record<string, string[]>;
  products: ProductItem[];
  projects: ProjectItem[];
  news: NewsArticle[];
}

export interface AuditLogEntry {
  id: number;
  timestamp: string;
  actor: string;
  action: string;
  ip: string;
  details: Record<string, unknown>;
  entryHash: string;
}

export interface AuditVerificationResult {
  valid: boolean;
  totalEntries: number;
  headHash?: string;
  verifiedAt?: string;
  corruptedId?: number;
  reason?: string;
}

export interface SecurityPostureInfo {
  transportHttps: boolean;
  passwordKdf: string;
  mfaStatus?: string;
  piiAtRest: string;
  sessionControl: string;
  csrfProtection: string;
  rateLimiting: string;
  auditLog: string;
  zeroThirdPartyFonts?: string;
}

export interface BackupManifestEntry {
  fileName: string;
  createdAt: string;
  algorithm: string;
  encryptedBytes: number;
  ciphertextSha256: string;
}

export interface ActiveSessionEntry {
  idPrefix: string;
  ip: string;
  userAgent: string;
  createdAt: string;
  lastActiveAt: string;
  current: boolean;
}

export interface AuthSessionState {
  authenticated: boolean;
  mfaRequired?: boolean;
  message?: string;
  user?: {
    username: string;
    role: string;
    mustChangePassword: boolean;
    totpEnabled?: boolean;
  };
  csrfToken?: string;
  idleExpiresAt?: number;
  absoluteExpiresAt?: number;
  transportHttps?: boolean;
}

export interface AdminDashboardPayload {
  inquiries: CustomerInquiry[];
  partnerships: PartnershipRequest[];
  applications: CareerApplication[];
  additions: CmsAdditions;
  auditLogs: AuditLogEntry[];
  auditVerification: AuditVerificationResult;
  activeSessions?: ActiveSessionEntry[];
  backups?: BackupManifestEntry[];
  securityPosture: SecurityPostureInfo;
  user: {
    username: string;
    role: string;
    mustChangePassword: boolean;
    totpEnabled?: boolean;
  };
}

export class ApiError extends Error {
  status: number;
  locked?: boolean;
  attemptsLeft?: number;
  retryAfterSec?: number;

  constructor(
    message: string,
    status: number,
    meta?: { locked?: boolean; attemptsLeft?: number; retryAfterSec?: number }
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.locked = meta?.locked;
    this.attemptsLeft = meta?.attemptsLeft;
    this.retryAfterSec = meta?.retryAfterSec;
  }
}

// Held strictly in closure memory — never written to localStorage/sessionStorage
let inMemoryCsrfToken: string | null = null;

export function setCsrfToken(token: string | null): void {
  inMemoryCsrfToken = token;
}

async function apiRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
    body?: unknown;
    includeCsrf?: boolean;
  } = {}
): Promise<T> {
  const method = options.method || 'GET';
  const headers: Record<string, string> = {
    Accept: 'application/json'
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (options.includeCsrf && inMemoryCsrfToken) {
    headers['X-CSRF-Token'] = inMemoryCsrfToken;
  }

  let response: Response;
  try {
    response = await fetch(path, {
      method,
      credentials: 'same-origin',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined
    });
  } catch {
    throw new ApiError(
      'Security API server is unreachable. Start the backend with `npm run server`.',
      0
    );
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) {
      inMemoryCsrfToken = null;
    }
    throw new ApiError(data.error || `Request failed (${response.status})`, response.status, {
      locked: data.locked,
      attemptsLeft: data.attemptsLeft,
      retryAfterSec: data.retryAfterSec
    });
  }

  return data as T;
}

// ============================================================================
// PUBLIC ENDPOINTS
// ============================================================================
export async function fetchPublicCatalog(): Promise<CmsAdditions> {
  const res = await apiRequest<{ additions: CmsAdditions }>('/api/public/catalog');
  return res.additions;
}

export async function submitPublicInquiry(
  payload: Omit<CustomerInquiry, 'id' | 'createdAt' | 'status'> & { website_hp?: string }
): Promise<{ ok: boolean; id: string; createdAt: string }> {
  return apiRequest('/api/public/inquiries', { method: 'POST', body: payload });
}

export async function submitPublicPartnership(
  payload: Omit<PartnershipRequest, 'id' | 'createdAt' | 'status'> & { website_hp?: string }
): Promise<{ ok: boolean; id: string; createdAt: string }> {
  return apiRequest('/api/public/partnerships', { method: 'POST', body: payload });
}

export async function submitPublicApplication(
  payload: Omit<CareerApplication, 'id' | 'createdAt' | 'status'> & { website_hp?: string }
): Promise<{ ok: boolean; id: string; createdAt: string }> {
  return apiRequest('/api/public/applications', { method: 'POST', body: payload });
}

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================
export async function checkAuthSession(): Promise<AuthSessionState> {
  const res = await apiRequest<AuthSessionState>('/api/auth/session');
  inMemoryCsrfToken = res.authenticated && res.csrfToken ? res.csrfToken : null;
  return res;
}

export async function loginExecutive(
  username: string,
  password: string,
  totpCode?: string
): Promise<AuthSessionState> {
  const res = await apiRequest<AuthSessionState>('/api/auth/login', {
    method: 'POST',
    body: { username, password, ...(totpCode ? { totpCode } : {}) }
  });
  if (res.csrfToken) {
    inMemoryCsrfToken = res.csrfToken;
  }
  return res;
}

export async function initiateMfaSetup(): Promise<{ secretBase32: string; otpauthUri: string }> {
  return apiRequest('/api/auth/mfa/setup', { method: 'POST', includeCsrf: true, body: {} });
}

export async function enableMfaTotp(
  currentPassword: string,
  totpCode: string
): Promise<{ ok: boolean; totpEnabled: boolean }> {
  return apiRequest('/api/auth/mfa/enable', {
    method: 'POST',
    includeCsrf: true,
    body: { currentPassword, totpCode }
  });
}

export async function disableMfaTotp(
  currentPassword: string,
  totpCode: string
): Promise<{ ok: boolean; totpEnabled: boolean }> {
  return apiRequest('/api/auth/mfa/disable', {
    method: 'POST',
    includeCsrf: true,
    body: { currentPassword, totpCode }
  });
}

export async function revokeOtherSessions(): Promise<{ ok: boolean; revokedCount: number }> {
  return apiRequest('/api/auth/sessions/revoke-others', {
    method: 'POST',
    includeCsrf: true,
    body: {}
  });
}

export async function logoutExecutive(): Promise<void> {
  try {
    await apiRequest('/api/auth/logout', { method: 'POST', includeCsrf: true, body: {} });
  } finally {
    inMemoryCsrfToken = null;
  }
}

export async function changeExecutivePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ ok: boolean; csrfToken: string; idleExpiresAt: number; mustChangePassword: boolean }> {
  const res = await apiRequest<{
    ok: boolean;
    csrfToken: string;
    idleExpiresAt: number;
    mustChangePassword: boolean;
  }>('/api/auth/change-password', {
    method: 'POST',
    includeCsrf: true,
    body: { currentPassword, newPassword }
  });
  inMemoryCsrfToken = res.csrfToken;
  return res;
}

// ============================================================================
// AUTHENTICATED EXECUTIVE ADMIN ENDPOINTS
// ============================================================================
export async function fetchAdminDashboard(): Promise<AdminDashboardPayload> {
  return apiRequest<AdminDashboardPayload>('/api/admin/dashboard');
}

export async function verifyAuditChain(): Promise<AuditVerificationResult> {
  return apiRequest<AuditVerificationResult>('/api/admin/audit/verify');
}

export async function createEncryptedVaultBackup(): Promise<{
  ok: boolean;
  manifest: BackupManifestEntry;
  verification: { valid: boolean; decryptedBytes?: number };
  backups: BackupManifestEntry[];
}> {
  return apiRequest('/api/admin/backup', { method: 'POST', includeCsrf: true, body: {} });
}

export async function adminUpdateInquiryStatus(
  id: string,
  status: CustomerInquiry['status']
): Promise<void> {
  await apiRequest('/api/admin/inquiries/status', {
    method: 'PATCH',
    includeCsrf: true,
    body: { id, status }
  });
}

export async function adminUpdatePartnershipStatus(
  id: string,
  status: PartnershipRequest['status']
): Promise<void> {
  await apiRequest('/api/admin/partnerships/status', {
    method: 'PATCH',
    includeCsrf: true,
    body: { id, status }
  });
}

export async function adminAddDivisionActivity(
  divisionId: string,
  activity: string
): Promise<CmsAdditions> {
  const res = await apiRequest<{ ok: boolean; additions: CmsAdditions }>(
    '/api/admin/divisions/activity',
    {
      method: 'POST',
      includeCsrf: true,
      body: { divisionId, activity }
    }
  );
  return res.additions;
}

export async function adminCreateProduct(product: {
  name: string;
  divisionId: string;
  divisionName: string;
  category: ProductItem['category'];
  tagline: string;
  description: string;
  keyFeatures: string[];
}): Promise<CmsAdditions> {
  const res = await apiRequest<{ ok: boolean; additions: CmsAdditions }>('/api/admin/products', {
    method: 'POST',
    includeCsrf: true,
    body: product
  });
  return res.additions;
}

export async function adminCreateProject(project: {
  title: string;
  divisionId: string;
  divisionName: string;
  category: ProjectItem['category'];
  summary: string;
  impact: string;
}): Promise<CmsAdditions> {
  const res = await apiRequest<{ ok: boolean; additions: CmsAdditions }>('/api/admin/projects', {
    method: 'POST',
    includeCsrf: true,
    body: project
  });
  return res.additions;
}

export async function adminCreateNews(article: {
  title: string;
  category: NewsArticle['category'];
  divisionTag: string;
  excerpt: string;
  content: string[];
}): Promise<CmsAdditions> {
  const res = await apiRequest<{ ok: boolean; additions: CmsAdditions }>('/api/admin/news', {
    method: 'POST',
    includeCsrf: true,
    body: article
  });
  return res.additions;
}

export async function adminResetCatalog(): Promise<CmsAdditions> {
  const res = await apiRequest<{ ok: boolean; additions: CmsAdditions }>(
    '/api/admin/reset-catalog',
    {
      method: 'POST',
      includeCsrf: true,
      body: {}
    }
  );
  return res.additions;
}
