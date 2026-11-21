/**
 * ============================================================================
 * CREST GROUP HARDENED SQLITE DATABASE LAYER (v2 — Zero External Dependencies)
 * - 100% Parameterized Prepared Statements (Zero SQL Injection Surface)
 * - AES-256-GCM Field-Level Encryption at Rest for All Sensitive PII & TOTP Secrets
 * - Async Argon2id + Pepper Verification (Non-Blocking + Concurrency Guarded)
 * - SHA-256 Hashed Session Storage + Peek-Without-Touch Idle Check + IP Anomaly Alert
 * - Persistent IP + Per-Username Rate Limiting with Automatic Table Pruning
 * - HMAC-SHA256 Tamper-Evident Audit Hash Chain + Auto-Shred Bootstrap Credentials
 * ============================================================================
 */

import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import {
  DATA_DIR,
  hashPasswordArgon2idSync,
  hashPasswordArgon2idAsync,
  verifyPasswordArgon2idAsync,
  encryptPII,
  decryptPII,
  generateSecureToken,
  sha256Hex,
  computeAuditHash,
  generateStrongBootstrapPassword,
  generateTotpSecretBase32,
  buildOtpAuthUri,
  verifyTotpCode
} from './crypto.mjs';

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });
}

const DB_PATH = path.join(DATA_DIR, 'crest_secure.db');
export const BOOTSTRAP_FILE = path.join(DATA_DIR, 'BOOTSTRAP_CREDENTIALS.txt');

export const db = new DatabaseSync(DB_PATH);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  PRAGMA synchronous = NORMAL;
  PRAGMA secure_delete = ON;
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'SUPER_ADMIN',
    must_change_password INTEGER NOT NULL DEFAULT 1,
    totp_enabled INTEGER NOT NULL DEFAULT 0,
    totp_secret_enc TEXT,
    totp_pending_enc TEXT,
    totp_last_step INTEGER NOT NULL DEFAULT -1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    csrf_token TEXT NOT NULL,
    ip TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    last_active_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS rate_limits (
    bucket_key TEXT PRIMARY KEY,
    attempts INTEGER NOT NULL DEFAULT 0,
    window_start INTEGER NOT NULL,
    locked_until INTEGER
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    ip TEXT NOT NULL,
    details_json TEXT NOT NULL,
    prev_hash TEXT NOT NULL,
    entry_hash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS inquiries (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    organization TEXT NOT NULL,
    email_enc TEXT NOT NULL,
    phone_enc TEXT NOT NULL,
    division TEXT NOT NULL,
    service_or_product TEXT NOT NULL,
    budget_range TEXT NOT NULL,
    message_enc TEXT NOT NULL,
    created_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'New'
  );

  CREATE TABLE IF NOT EXISTS partnerships (
    id TEXT PRIMARY KEY,
    organization_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    email_enc TEXT NOT NULL,
    phone_enc TEXT NOT NULL,
    partnership_type TEXT NOT NULL,
    target_division TEXT NOT NULL,
    investment_capacity TEXT NOT NULL,
    proposal_enc TEXT NOT NULL,
    created_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending Review'
  );

  CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    job_title TEXT NOT NULL,
    applicant_name TEXT NOT NULL,
    email_enc TEXT NOT NULL,
    phone_enc TEXT NOT NULL,
    portfolio_enc TEXT NOT NULL,
    experience_years TEXT NOT NULL,
    cover_note_enc TEXT NOT NULL,
    created_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Submitted'
  );

  CREATE TABLE IF NOT EXISTS cms_state (
    key TEXT PRIMARY KEY,
    value_json TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

// Safe forward migration if upgrading an existing v1 SQLite database
const adminCols = new Set(db.prepare('PRAGMA table_info(admin_users)').all().map((c) => c.name));
if (!adminCols.has('totp_enabled')) {
  db.exec('ALTER TABLE admin_users ADD COLUMN totp_enabled INTEGER NOT NULL DEFAULT 0');
}
if (!adminCols.has('totp_secret_enc')) {
  db.exec('ALTER TABLE admin_users ADD COLUMN totp_secret_enc TEXT');
}
if (!adminCols.has('totp_pending_enc')) {
  db.exec('ALTER TABLE admin_users ADD COLUMN totp_pending_enc TEXT');
}
if (!adminCols.has('totp_last_step')) {
  db.exec('ALTER TABLE admin_users ADD COLUMN totp_last_step INTEGER NOT NULL DEFAULT -1');
}

// ============================================================================
// TAMPER-EVIDENT CRYPTOGRAPHIC AUDIT LOG (HMAC-SHA256 HASH CHAIN)
// ============================================================================
const GENESIS_HASH = '0'.repeat(64);

export function appendAuditLog({ actor, action, ip, details = {} }) {
  const timestamp = new Date().toISOString();
  const detailsJson = JSON.stringify(details);
  const lastRow = db.prepare('SELECT entry_hash FROM audit_logs ORDER BY id DESC LIMIT 1').get();
  const prevHash = lastRow ? lastRow.entry_hash : GENESIS_HASH;
  const payload = `${timestamp}|${actor}|${action}|${ip}|${detailsJson}`;
  const entryHash = computeAuditHash(prevHash, payload);

  db.prepare(`
    INSERT INTO audit_logs (timestamp, actor, action, ip, details_json, prev_hash, entry_hash)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(timestamp, actor, action, ip, detailsJson, prevHash, entryHash);

  return { timestamp, actor, action, entryHash };
}

export function verifyAuditLogChain() {
  const rows = db.prepare('SELECT * FROM audit_logs ORDER BY id ASC').all();
  let expectedPrev = GENESIS_HASH;

  for (const row of rows) {
    if (row.prev_hash !== expectedPrev) {
      return {
        valid: false,
        totalEntries: rows.length,
        corruptedId: row.id,
        reason: `Broken previous-hash link at audit entry #${row.id}.`
      };
    }
    const payload = `${row.timestamp}|${row.actor}|${row.action}|${row.ip}|${row.details_json}`;
    const recomputed = computeAuditHash(row.prev_hash, payload);
    if (recomputed !== row.entry_hash) {
      return {
        valid: false,
        totalEntries: rows.length,
        corruptedId: row.id,
        reason: `Cryptographic HMAC mismatch at audit entry #${row.id} (possible tampering).`
      };
    }
    expectedPrev = row.entry_hash;
  }

  return {
    valid: true,
    totalEntries: rows.length,
    headHash: expectedPrev,
    verifiedAt: new Date().toISOString()
  };
}

export function getRecentAuditLogs(limit = 50) {
  return db
    .prepare('SELECT id, timestamp, actor, action, ip, details_json, entry_hash FROM audit_logs ORDER BY id DESC LIMIT ?')
    .all(limit)
    .map((r) => ({
      id: r.id,
      timestamp: r.timestamp,
      actor: r.actor,
      action: r.action,
      ip: r.ip,
      details: JSON.parse(r.details_json),
      entryHash: r.entry_hash
    }));
}

// ============================================================================
// SERVER-SIDE PERSISTENT RATE LIMITING (WITH STALE PRUNING)
// ============================================================================
let lastPruneMs = 0;

function maybePruneRateLimits(now) {
  if (now - lastPruneMs < 5 * 60 * 1000) return;
  lastPruneMs = now;
  const staleCutoff = now - 60 * 60 * 1000;
  db.prepare(
    'DELETE FROM rate_limits WHERE (locked_until IS NULL AND window_start < ?) OR (locked_until IS NOT NULL AND locked_until < ?)'
  ).run(staleCutoff, now);
}

export function checkRateLimit(bucketKey, maxAttempts, windowMs) {
  const now = Date.now();
  maybePruneRateLimits(now);

  const row = db.prepare('SELECT * FROM rate_limits WHERE bucket_key = ?').get(bucketKey);
  if (!row) {
    return { allowed: true, attemptsLeft: maxAttempts, retryAfterSec: 0 };
  }

  if (row.locked_until && now < row.locked_until) {
    return {
      allowed: false,
      attemptsLeft: 0,
      retryAfterSec: Math.ceil((row.locked_until - now) / 1000)
    };
  }

  if (now - row.window_start > windowMs || (row.locked_until && now >= row.locked_until)) {
    db.prepare('DELETE FROM rate_limits WHERE bucket_key = ?').run(bucketKey);
    return { allowed: true, attemptsLeft: maxAttempts, retryAfterSec: 0 };
  }

  return {
    allowed: row.attempts < maxAttempts,
    attemptsLeft: Math.max(0, maxAttempts - row.attempts),
    retryAfterSec: 0
  };
}

export function recordRateLimitAttempt(bucketKey, maxAttempts, windowMs, lockoutMs) {
  const now = Date.now();
  const row = db.prepare('SELECT * FROM rate_limits WHERE bucket_key = ?').get(bucketKey);

  let attempts = 1;
  let windowStart = now;

  if (row && now - row.window_start <= windowMs && (!row.locked_until || now < row.locked_until)) {
    attempts = row.attempts + 1;
    windowStart = row.window_start;
  }

  const lockedUntil = attempts >= maxAttempts ? now + lockoutMs : null;

  db.prepare(`
    INSERT INTO rate_limits (bucket_key, attempts, window_start, locked_until)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(bucket_key) DO UPDATE SET
      attempts = excluded.attempts,
      window_start = excluded.window_start,
      locked_until = excluded.locked_until
  `).run(bucketKey, attempts, windowStart, lockedUntil);

  return {
    locked: Boolean(lockedUntil),
    attemptsLeft: Math.max(0, maxAttempts - attempts),
    retryAfterSec: lockedUntil ? Math.ceil(lockoutMs / 1000) : 0
  };
}

export function resetRateLimit(bucketKey) {
  db.prepare('DELETE FROM rate_limits WHERE bucket_key = ?').run(bucketKey);
}

// ============================================================================
// ADMIN AUTHENTICATION, TOTP 2FA & SERVER-SIDE SESSIONS
// ============================================================================
export const SESSION_IDLE_MS = 30 * 60 * 1000;
export const SESSION_ABSOLUTE_MS = 8 * 60 * 60 * 1000;
const MAX_SESSIONS_PER_USER = 5;

const DUMMY_ARGON2_PHC =
  '$argon2id$v=19$m=65536,t=3,p=1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

export async function authenticateAdminAsync(username, password) {
  const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
  if (!user) {
    await verifyPasswordArgon2idAsync(password, DUMMY_ARGON2_PHC);
    return null;
  }
  const ok = await verifyPasswordArgon2idAsync(password, user.password_hash);
  return ok ? user : null;
}

export function verifyUserTotp(user, totpCode) {
  if (!user.totp_enabled || !user.totp_secret_enc) return true;
  const secretBase32 = decryptPII(user.totp_secret_enc, `admin_users:${user.id}:totp_secret`);
  const result = verifyTotpCode(secretBase32, totpCode, user.totp_last_step ?? -1);
  if (!result.valid) return false;

  // Persist last used time step to block replay of the same 6-digit code
  db.prepare('UPDATE admin_users SET totp_last_step = ? WHERE id = ?').run(result.matchedStep, user.id);
  return true;
}

export function initiateTotpSetup(userId, username) {
  const secretBase32 = generateTotpSecretBase32(20);
  const encPending = encryptPII(secretBase32, `admin_users:${userId}:totp_pending`);
  db.prepare('UPDATE admin_users SET totp_pending_enc = ?, updated_at = ? WHERE id = ?').run(
    encPending,
    new Date().toISOString(),
    userId
  );
  return {
    secretBase32,
    otpauthUri: buildOtpAuthUri(username, secretBase32)
  };
}

export function confirmEnableTotp(userId, totpCode) {
  const user = db.prepare('SELECT id, totp_pending_enc FROM admin_users WHERE id = ?').get(userId);
  if (!user || !user.totp_pending_enc) {
    return { ok: false, reason: 'No pending 2FA setup found. Click Generate 2FA Secret first.' };
  }
  const secretBase32 = decryptPII(user.totp_pending_enc, `admin_users:${userId}:totp_pending`);
  const verified = verifyTotpCode(secretBase32, totpCode, -1);
  if (!verified.valid) {
    return { ok: false, reason: 'Invalid 6-digit authenticator code.' };
  }
  const encActive = encryptPII(secretBase32, `admin_users:${userId}:totp_secret`);
  db.prepare(`
    UPDATE admin_users
    SET totp_enabled = 1, totp_secret_enc = ?, totp_pending_enc = NULL, totp_last_step = ?, updated_at = ?
    WHERE id = ?
  `).run(encActive, verified.matchedStep, new Date().toISOString(), userId);
  return { ok: true };
}

export function disableTotp(userId, totpCode) {
  const user = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(userId);
  if (!user || !user.totp_enabled) return { ok: false, reason: '2FA is not currently enabled.' };
  if (!verifyUserTotp(user, totpCode)) {
    return { ok: false, reason: 'Invalid 6-digit authenticator code.' };
  }
  db.prepare(`
    UPDATE admin_users
    SET totp_enabled = 0, totp_secret_enc = NULL, totp_pending_enc = NULL, totp_last_step = -1, updated_at = ?
    WHERE id = ?
  `).run(new Date().toISOString(), userId);
  return { ok: true };
}

export function createSession(userId, ip, userAgent) {
  const now = Date.now();
  const rawToken = generateSecureToken(32);
  const tokenHash = sha256Hex(rawToken);
  const csrfToken = generateSecureToken(32);

  // Prune globally expired sessions
  db.prepare('DELETE FROM sessions WHERE expires_at < ? OR (? - last_active_at) > ?').run(
    now,
    now,
    SESSION_IDLE_MS
  );

  // Enforce max concurrent sessions per executive user (evict oldest)
  const activeSessions = db
    .prepare('SELECT token_hash FROM sessions WHERE user_id = ? ORDER BY last_active_at DESC')
    .all(userId);
  if (activeSessions.length >= MAX_SESSIONS_PER_USER) {
    for (const stale of activeSessions.slice(MAX_SESSIONS_PER_USER - 1)) {
      db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(stale.token_hash);
    }
  }

  db.prepare(`
    INSERT INTO sessions (token_hash, user_id, csrf_token, ip, user_agent, created_at, last_active_at, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(tokenHash, userId, csrfToken, ip, String(userAgent || '').slice(0, 200), now, now, now + SESSION_ABSOLUTE_MS);

  return { rawToken, csrfToken, expiresAt: now + SESSION_IDLE_MS };
}

/**
 * Validates session cookie token against SQLite hash.
 * IMPORTANT: Pass { touch: false } on background idle polls so polling NEVER
 * resets the 30-minute inactivity clock!
 */
export function validateSessionToken(rawToken, { touch = true, currentIp = null } = {}) {
  if (!rawToken || typeof rawToken !== 'string' || rawToken.length !== 64) {
    return null;
  }
  const tokenHash = sha256Hex(rawToken);
  const now = Date.now();

  const row = db
    .prepare(`
      SELECT s.*, u.username, u.role, u.must_change_password, u.totp_enabled
      FROM sessions s
      JOIN admin_users u ON u.id = s.user_id
      WHERE s.token_hash = ?
    `)
    .get(tokenHash);

  if (!row) return null;

  if (now > row.expires_at || now - row.last_active_at > SESSION_IDLE_MS) {
    db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
    return null;
  }

  // Detect mid-session IP change anomaly (potential session hijacking indicator)
  if (currentIp && row.ip !== currentIp) {
    appendAuditLog({
      actor: row.username,
      action: 'SESSION_IP_CHANGE_ANOMALY',
      ip: currentIp,
      details: { previousIp: row.ip, newIp: currentIp }
    });
    db.prepare('UPDATE sessions SET ip = ? WHERE token_hash = ?').run(currentIp, tokenHash);
  }

  let effectiveLastActive = row.last_active_at;
  if (touch) {
    effectiveLastActive = now;
    db.prepare('UPDATE sessions SET last_active_at = ? WHERE token_hash = ?').run(now, tokenHash);
  }

  return {
    tokenHash,
    userId: row.user_id,
    username: row.username,
    role: row.role,
    mustChangePassword: Boolean(row.must_change_password),
    totpEnabled: Boolean(row.totp_enabled),
    csrfToken: row.csrf_token,
    idleExpiresAt: effectiveLastActive + SESSION_IDLE_MS,
    absoluteExpiresAt: row.expires_at
  };
}

export function listUserSessions(userId, currentTokenHash) {
  const now = Date.now();
  return db
    .prepare('SELECT token_hash, ip, user_agent, created_at, last_active_at, expires_at FROM sessions WHERE user_id = ? AND expires_at > ? ORDER BY last_active_at DESC')
    .all(userId, now)
    .map((s) => ({
      idPrefix: s.token_hash.slice(0, 12),
      ip: s.ip,
      userAgent: s.user_agent,
      createdAt: new Date(s.created_at).toISOString(),
      lastActiveAt: new Date(s.last_active_at).toISOString(),
      current: s.token_hash === currentTokenHash
    }));
}

export function revokeOtherSessions(userId, keepTokenHash) {
  const info = db
    .prepare('DELETE FROM sessions WHERE user_id = ? AND token_hash != ?')
    .run(userId, keepTokenHash);
  return info.changes;
}

export function deleteSessionByRawToken(rawToken) {
  if (!rawToken) return;
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha256Hex(rawToken));
}

export async function rotateAdminPasswordAsync(userId, newPassword) {
  const newHash = await hashPasswordArgon2idAsync(newPassword);
  const nowIso = new Date().toISOString();
  db.prepare('UPDATE admin_users SET password_hash = ?, must_change_password = 0, updated_at = ? WHERE id = ?').run(
    newHash,
    nowIso,
    userId
  );
  // Invalidate ALL existing sessions for this user
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);

  // Auto-shred one-time plaintext bootstrap credentials file if it still exists on disk
  try {
    if (fs.existsSync(BOOTSTRAP_FILE)) {
      fs.writeFileSync(BOOTSTRAP_FILE, '0'.repeat(256), 'utf8');
      fs.unlinkSync(BOOTSTRAP_FILE);
    }
  } catch {
    // Best-effort cleanup
  }
}

// ============================================================================
// ENCRYPTED PII RECORDS (INQUIRIES, PARTNERSHIPS, APPLICATIONS)
// ============================================================================
export function createInquiryRecord(data) {
  const count = db.prepare('SELECT COUNT(*) AS c FROM inquiries').get().c;
  const id = `INQ-2026-${String(count + 1).padStart(3, '0')}-${generateSecureToken(2).toUpperCase()}`;
  const createdAt = new Date().toISOString().slice(0, 16).replace('T', ' ');

  db.prepare(`
    INSERT INTO inquiries (id, full_name, organization, email_enc, phone_enc, division, service_or_product, budget_range, message_enc, created_at, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New')
  `).run(
    id,
    data.fullName,
    data.organization,
    encryptPII(data.email, `inquiries:${id}:email`),
    encryptPII(data.phone, `inquiries:${id}:phone`),
    data.division,
    data.serviceOrProduct,
    data.budgetRange,
    encryptPII(data.message, `inquiries:${id}:message`),
    createdAt
  );

  return { id, createdAt, status: 'New' };
}

export function listDecryptedInquiries() {
  return db
    .prepare('SELECT * FROM inquiries ORDER BY rowid DESC')
    .all()
    .map((r) => ({
      id: r.id,
      fullName: r.full_name,
      organization: r.organization,
      email: decryptPII(r.email_enc, `inquiries:${r.id}:email`),
      phone: decryptPII(r.phone_enc, `inquiries:${r.id}:phone`),
      division: r.division,
      serviceOrProduct: r.service_or_product,
      budgetRange: r.budget_range,
      message: decryptPII(r.message_enc, `inquiries:${r.id}:message`),
      createdAt: r.created_at,
      status: r.status
    }));
}

export function updateInquiryStatus(id, status) {
  const info = db.prepare('UPDATE inquiries SET status = ? WHERE id = ?').run(status, id);
  return info.changes > 0;
}

export function createPartnershipRecord(data) {
  const count = db.prepare('SELECT COUNT(*) AS c FROM partnerships').get().c;
  const id = `PRT-2026-${String(count + 1).padStart(3, '0')}-${generateSecureToken(2).toUpperCase()}`;
  const createdAt = new Date().toISOString().slice(0, 10);

  db.prepare(`
    INSERT INTO partnerships (id, organization_name, contact_person, email_enc, phone_enc, partnership_type, target_division, investment_capacity, proposal_enc, created_at, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending Review')
  `).run(
    id,
    data.organizationName,
    data.contactPerson,
    encryptPII(data.email, `partnerships:${id}:email`),
    encryptPII(data.phone, `partnerships:${id}:phone`),
    data.partnershipType,
    data.targetDivision,
    data.investmentCapacity,
    encryptPII(data.proposalSummary, `partnerships:${id}:proposal`),
    createdAt
  );

  return { id, createdAt, status: 'Pending Review' };
}

export function listDecryptedPartnerships() {
  return db
    .prepare('SELECT * FROM partnerships ORDER BY rowid DESC')
    .all()
    .map((r) => ({
      id: r.id,
      organizationName: r.organization_name,
      contactPerson: r.contact_person,
      email: decryptPII(r.email_enc, `partnerships:${r.id}:email`),
      phone: decryptPII(r.phone_enc, `partnerships:${r.id}:phone`),
      partnershipType: r.partnership_type,
      targetDivision: r.target_division,
      investmentCapacity: r.investment_capacity,
      proposalSummary: decryptPII(r.proposal_enc, `partnerships:${r.id}:proposal`),
      createdAt: r.created_at,
      status: r.status
    }));
}

export function updatePartnershipStatus(id, status) {
  const info = db.prepare('UPDATE partnerships SET status = ? WHERE id = ?').run(status, id);
  return info.changes > 0;
}

export function createApplicationRecord(data) {
  const count = db.prepare('SELECT COUNT(*) AS c FROM applications').get().c;
  const id = `APP-2026-${String(count + 1).padStart(3, '0')}-${generateSecureToken(2).toUpperCase()}`;
  const createdAt = new Date().toISOString().slice(0, 10);

  db.prepare(`
    INSERT INTO applications (id, job_id, job_title, applicant_name, email_enc, phone_enc, portfolio_enc, experience_years, cover_note_enc, created_at, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Submitted')
  `).run(
    id,
    data.jobId,
    data.jobTitle,
    data.applicantName,
    encryptPII(data.email, `applications:${id}:email`),
    encryptPII(data.phone, `applications:${id}:phone`),
    encryptPII(data.portfolioOrLinkedin || '', `applications:${id}:portfolio`),
    data.experienceYears,
    encryptPII(data.coverNote, `applications:${id}:coverNote`),
    createdAt
  );

  return { id, createdAt, status: 'Submitted' };
}

export function listDecryptedApplications() {
  return db
    .prepare('SELECT * FROM applications ORDER BY rowid DESC')
    .all()
    .map((r) => ({
      id: r.id,
      jobId: r.job_id,
      jobTitle: r.job_title,
      applicantName: r.applicant_name,
      email: decryptPII(r.email_enc, `applications:${r.id}:email`),
      phone: decryptPII(r.phone_enc, `applications:${r.id}:phone`),
      portfolioOrLinkedin: decryptPII(r.portfolio_enc, `applications:${r.id}:portfolio`),
      experienceYears: r.experience_years,
      coverNote: decryptPII(r.cover_note_enc, `applications:${r.id}:coverNote`),
      createdAt: r.created_at,
      status: r.status
    }));
}

export function getCmsAdditions() {
  const row = db.prepare("SELECT value_json FROM cms_state WHERE key = 'additions'").get();
  if (!row) {
    return { divisionActivities: {}, products: [], projects: [], news: [] };
  }
  return JSON.parse(row.value_json);
}

export function saveCmsAdditions(additions) {
  const nowIso = new Date().toISOString();
  db.prepare(`
    INSERT INTO cms_state (key, value_json, updated_at)
    VALUES ('additions', ?, ?)
    ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at
  `).run(JSON.stringify(additions), nowIso);
}

export function bootstrapDatabase() {
  const existingAdmin = db.prepare('SELECT id FROM admin_users LIMIT 1').get();
  if (!existingAdmin) {
    const envPassword = process.env.CREST_ADMIN_PASSWORD;
    const bootstrapPassword = envPassword || generateStrongBootstrapPassword();
    const passwordHash = hashPasswordArgon2idSync(bootstrapPassword);
    const nowIso = new Date().toISOString();

    db.prepare(`
      INSERT INTO admin_users (username, password_hash, role, must_change_password, created_at, updated_at)
      VALUES ('admin', ?, 'SUPER_ADMIN', ?, ?, ?)
    `).run(passwordHash, envPassword ? 0 : 1, nowIso, nowIso);

    if (!envPassword) {
      const notice = [
        '========================================================================',
        'CREST GROUP EXECUTIVE SECURITY BOOTSTRAP CREDENTIALS (ONE-TIME SETUP)',
        '========================================================================',
        'Username : admin',
        `Password : ${bootstrapPassword}`,
        '',
        'SECURITY REQUIREMENT:',
        '1. Log in at http://127.0.0.1:5173/#admin and rotate this password immediately.',
        '2. This file will be automatically shredded upon password rotation.',
        '3. This file is gitignored and never exposed to browsers.',
        '========================================================================',
        ''
      ].join('\n');
      fs.writeFileSync(BOOTSTRAP_FILE, notice, { encoding: 'utf8', mode: 0o600 });
      console.log('\n[CREST SECURITY] Initial Executive Admin bootstrapped.');
      console.log(`[CREST SECURITY] One-time credentials written securely to: ${BOOTSTRAP_FILE}`);
    }

    appendAuditLog({
      actor: 'SYSTEM',
      action: 'SECURITY_BOOTSTRAP_COMPLETE',
      ip: '127.0.0.1',
      details: { algorithm: 'Argon2id(m=64MiB,t=3,p=1)+Pepper', encryption: 'AES-256-GCM', mfa: 'RFC6238-TOTP' }
    });
  }

  const inqCount = db.prepare('SELECT COUNT(*) AS c FROM inquiries').get().c;
  if (inqCount === 0) {
    createInquiryRecord({
      fullName: 'Eng. Daniel Mwakasege',
      organization: 'Kilimanjaro Haulage & Freight Ltd',
      email: 'd.mwakasege@kilihaulage.co.tz',
      phone: '+255 754 810 290',
      division: 'CREST Logistics & Transport',
      serviceOrProduct: 'Cargoo Fleet Onboarding & Enterprise GPS Telemetry',
      budgetRange: '$10,000 – $25,000',
      message:
        'We operate 38 heavy-duty transit trucks along the Dar–Lusaka corridor and want to onboard our fleet onto Cargoo and deploy custom fleet management software.'
    });
    createInquiryRecord({
      fullName: 'Grace K. Mutalemwa',
      organization: 'St. Augustine Premier Academy',
      email: 'principal@staugustine.ac.tz',
      phone: '+255 713 409 112',
      division: 'CREST Technologies',
      serviceOrProduct: 'CREST School Portal (Multi-Campus License)',
      budgetRange: '$5,000 – $10,000',
      message:
        'Looking for full deployment of CREST School Portal across our Primary and Secondary campuses (1,450 students) including parent mobile app and Mobile Money fee integration.'
    });
  }

  const prtCount = db.prepare('SELECT COUNT(*) AS c FROM partnerships').get().c;
  if (prtCount === 0) {
    createPartnershipRecord({
      organizationName: 'East Africa Corridor Ventures',
      contactPerson: 'Victor Nyerere',
      email: 'v.nyerere@eacventures.com',
      phone: '+255 767 900 118',
      partnershipType: 'Joint Venture',
      targetDivision: 'CREST Logistics & Transport',
      investmentCapacity: '$100,000 – $500,000',
      proposalSummary:
        'Strategic co-investment and corridor hub partnership to scale the Cargoo digital freight marketplace across Tanzania, Kenya, Zambia, and DRC.'
    });
  }

  const appCount = db.prepare('SELECT COUNT(*) AS c FROM applications').get().c;
  if (appCount === 0) {
    createApplicationRecord({
      jobId: 'job-1',
      jobTitle: 'Senior Full-Stack Software Engineer (React / Laravel / PostgreSQL)',
      applicantName: 'Kelvin Mushi',
      email: 'kelvin.mushi.dev@gmail.com',
      phone: '+255 742 991 023',
      portfolioOrLinkedin: 'https://github.com/kelvinmushi',
      experienceYears: '5 Years',
      coverNote:
        'Experienced architect in Vite/React, Laravel APIs, and PostgreSQL multi-tenant ERP & POS systems. Excited to contribute to CREST Technologies.'
    });
  }
}
