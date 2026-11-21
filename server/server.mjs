/**
 * ============================================================================
 * CREST GROUP HARDENED API & SECURITY SERVER (v2 — Red-Team Hardened)
 * - Async Argon2id + Pepper + Concurrency Cap (No Event-Loop / OOM DoS)
 * - Dual Persistent Rate Limiting: Per-IP AND Per-Username (Blocks Botnet Spray)
 * - RFC 6238 TOTP 2FA / MFA with Replay Protection
 * - Server-Enforced Bootstrap Password Rotation Gate + Auto-Shred
 * - Fetch Metadata (Sec-Fetch-Site) + Origin/Referer + Synchronizer CSRF
 * - Strict Path Boundary Check (path.sep + null-byte + decodeURIComponent guard)
 * - True Idle Timeout (Session Peek Without Sliding Refresh)
 * ============================================================================
 */

import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { constantTimeEqual, validatePasswordPolicy } from './crypto.mjs';
import { createEncryptedDbBackup, listEncryptedBackups, verifyEncryptedBackup } from './backup.mjs';
import { applySecurityHeaders, isRequestHttps } from './securityHeaders.mjs';
import {
  stripDangerousKeys,
  cleanText,
  requireText,
  validateEnum,
  validateInquiryPayload,
  validatePartnershipPayload,
  validateApplicationPayload,
  INQUIRY_STATUSES,
  PARTNERSHIP_STATUSES,
  PRODUCT_CATEGORIES,
  PROJECT_CATEGORIES,
  NEWS_CATEGORIES,
  ValidationError
} from './validation.mjs';
import {
  bootstrapDatabase,
  authenticateAdminAsync,
  verifyUserTotp,
  initiateTotpSetup,
  confirmEnableTotp,
  disableTotp,
  createSession,
  validateSessionToken,
  listUserSessions,
  revokeOtherSessions,
  deleteSessionByRawToken,
  rotateAdminPasswordAsync,
  checkRateLimit,
  recordRateLimitAttempt,
  resetRateLimit,
  appendAuditLog,
  verifyAuditLogChain,
  getRecentAuditLogs,
  createInquiryRecord,
  listDecryptedInquiries,
  updateInquiryStatus,
  createPartnershipRecord,
  listDecryptedPartnerships,
  updatePartnershipStatus,
  createApplicationRecord,
  listDecryptedApplications,
  getCmsAdditions,
  saveCmsAdditions
} from './database.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '..', 'dist');

const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || 4000);
const SERVE_STATIC = process.env.SERVE_STATIC === 'true';
const SESSION_COOKIE_NAME = 'crest_sid';
const MAX_BODY_BYTES = 32 * 1024;

const ALLOWED_HOSTS = new Set(
  (process.env.ALLOWED_HOSTS || '127.0.0.1:4000,localhost:4000,127.0.0.1:5173,localhost:5173')
    .split(',')
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean)
);

const LOGIN_IP_MAX_ATTEMPTS = 5;
const LOGIN_USER_MAX_ATTEMPTS = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000;

const PUBLIC_FORM_MAX_ATTEMPTS = 12;
const PUBLIC_FORM_WINDOW_MS = 15 * 60 * 1000;
const PUBLIC_FORM_LOCKOUT_MS = 15 * 60 * 1000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2'
};

bootstrapDatabase();

function getClientIp(req) {
  if (process.env.TRUST_PROXY === 'true' && req.headers['x-forwarded-for']) {
    return String(req.headers['x-forwarded-for']).split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

function parseCookies(req) {
  const header = req.headers.cookie;
  const cookies = Object.create(null);
  if (!header) return cookies;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key && !['__proto__', 'constructor', 'prototype'].includes(key)) {
      try {
        cookies[key] = decodeURIComponent(val);
      } catch {
        // Ignore malformed cookie encoding
      }
    }
  }
  return cookies;
}

function buildSessionCookie(req, token, maxAgeSeconds) {
  const parts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${maxAgeSeconds}`
  ];
  if (isRequestHttps(req) || process.env.NODE_ENV === 'production') {
    parts.push('Secure');
  }
  return parts.join('; ');
}

function sendJson(req, res, statusCode, data, extraHeaders = {}) {
  applySecurityHeaders(req, res, { isApi: true });
  for (const [k, v] of Object.entries(extraHeaders)) {
    res.setHeader(k, v);
  }
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const contentType = String(req.headers['content-type'] || '').toLowerCase();
    if (!contentType.includes('application/json')) {
      return reject(new ValidationError('Content-Type must be application/json.'));
    }

    let size = 0;
    const chunks = [];
    let aborted = false;

    req.on('data', (chunk) => {
      if (aborted) return;
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        aborted = true;
        req.destroy();
        reject(Object.assign(new Error('Request payload exceeds 32 KB limit.'), { statusCode: 413 }));
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (aborted) return;
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        if (!raw.trim()) return resolve({});
        const parsed = JSON.parse(raw);
        if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
          return reject(new ValidationError('Request body must be a JSON object.'));
        }
        resolve(stripDangerousKeys(parsed));
      } catch {
        reject(new ValidationError('Malformed JSON request body.'));
      }
    });

    req.on('error', () => {
      if (!aborted) reject(new ValidationError('Request stream interrupted.'));
    });
  });
}

/**
 * Defense-in-Depth Same-Origin Verification:
 * 1. Fetch Metadata (Sec-Fetch-Site) rejects cross-site browser requests outright.
 * 2. Host header allowlist prevents Host+Origin spoofing.
 * 3. Origin (or Referer fallback) must match allowed host.
 */
function verifySameOrigin(req) {
  const secFetchSite = String(req.headers['sec-fetch-site'] || '').toLowerCase();
  if (secFetchSite && secFetchSite !== 'same-origin' && secFetchSite !== 'none') {
    return false;
  }

  const host = String(req.headers.host || '').toLowerCase();
  if (host && !ALLOWED_HOSTS.has(host)) {
    return false;
  }

  const origin = req.headers.origin;
  if (origin) {
    try {
      const originHost = new URL(origin).host.toLowerCase();
      return ALLOWED_HOSTS.has(originHost);
    } catch {
      return false;
    }
  }

  const referer = req.headers.referer;
  if (referer) {
    try {
      const refHost = new URL(referer).host.toLowerCase();
      return ALLOWED_HOSTS.has(refHost);
    } catch {
      return false;
    }
  }

  return true;
}

function requireAdminAuth(req, { requireCsrf = false, allowPendingRotation = false } = {}) {
  const cookies = parseCookies(req);
  const rawToken = cookies[SESSION_COOKIE_NAME];
  const ip = getClientIp(req);
  const session = validateSessionToken(rawToken, { touch: true, currentIp: ip });
  if (!session) {
    throw Object.assign(new Error('Authentication required. Session missing or expired.'), {
      statusCode: 401
    });
  }
  if (requireCsrf) {
    if (!verifySameOrigin(req)) {
      throw Object.assign(new Error('Cross-origin mutation blocked by Fetch Metadata / Origin guard.'), {
        statusCode: 403
      });
    }
    const headerCsrf = String(req.headers['x-csrf-token'] || '');
    if (!headerCsrf || !constantTimeEqual(headerCsrf, session.csrfToken)) {
      throw Object.assign(new Error('Invalid or missing CSRF token.'), { statusCode: 403 });
    }
  }
  if (session.mustChangePassword && !allowPendingRotation) {
    throw Object.assign(
      new Error('Mandatory bootstrap password rotation required before modifying executive data.'),
      { statusCode: 403, code: 'PASSWORD_ROTATION_REQUIRED' }
    );
  }
  return { session, rawToken };
}

function serveStaticFile(req, res, rawPathname) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(rawPathname);
  } catch {
    applySecurityHeaders(req, res, { isApi: false });
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Bad Request');
  }

  if (decodedPath.includes('\0') || decodedPath.includes('\\')) {
    applySecurityHeaders(req, res, { isApi: false });
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Bad Request');
  }

  const safePath = decodedPath === '/' ? '/index.html' : decodedPath;
  const resolved = path.resolve(DIST_DIR, `.${safePath}`);

  // Strict directory boundary check (blocks sibling prefix bypass like dist-secret/)
  if (resolved !== DIST_DIR && !resolved.startsWith(DIST_DIR + path.sep)) {
    applySecurityHeaders(req, res, { isApi: false });
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Forbidden');
  }

  let targetFile = resolved;
  if (!fs.existsSync(targetFile) || fs.statSync(targetFile).isDirectory()) {
    targetFile = path.join(DIST_DIR, 'index.html');
  }

  if (!fs.existsSync(targetFile)) {
    applySecurityHeaders(req, res, { isApi: false });
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Frontend build not found. Run npm run build first.');
  }

  const ext = path.extname(targetFile).toLowerCase();
  applySecurityHeaders(req, res, { isApi: false });
  res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
  fs.createReadStream(targetFile).pipe(res);
}

async function handleRequest(req, res) {
  const url = new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`);
  const pathname = url.pathname;
  const method = (req.method || 'GET').toUpperCase();
  const ip = getClientIp(req);

  try {
    // ------------------------------------------------------------------------
    // HEALTH CHECK
    // ------------------------------------------------------------------------
    if (pathname === '/api/health' && method === 'GET') {
      return sendJson(req, res, 200, {
        status: 'ok',
        https: isRequestHttps(req),
        crypto: {
          passwordKdf: 'Async Argon2id (m=64MiB, t=3, p=1) + RFC 9106 Pepper + Concurrency Cap',
          mfa: 'RFC 6238 TOTP (Replay Protected)',
          piiEncryption: 'AES-256-GCM (Record-Bound AAD)',
          auditIntegrity: 'HMAC-SHA256 Hash Chain',
          sessionStorage: 'Server-Side SHA-256 Hashed + HttpOnly SameSite=Strict Cookie'
        }
      });
    }

    // ------------------------------------------------------------------------
    // PUBLIC CATALOG (READ-ONLY, ZERO PII)
    // ------------------------------------------------------------------------
    if (pathname === '/api/public/catalog' && method === 'GET') {
      return sendJson(req, res, 200, { additions: getCmsAdditions() });
    }

    // ------------------------------------------------------------------------
    // PUBLIC WRITE-ONLY SUBMISSIONS
    // ------------------------------------------------------------------------
    if (pathname === '/api/public/inquiries' && method === 'POST') {
      if (!verifySameOrigin(req)) return sendJson(req, res, 403, { error: 'Origin rejected.' });
      const bucket = `public_form:${ip}`;
      const rl = checkRateLimit(bucket, PUBLIC_FORM_MAX_ATTEMPTS, PUBLIC_FORM_WINDOW_MS);
      if (!rl.allowed) {
        return sendJson(
          req,
          res,
          429,
          { error: `Too many submissions. Please wait ${rl.retryAfterSec}s before trying again.` },
          { 'Retry-After': String(rl.retryAfterSec) }
        );
      }
      recordRateLimitAttempt(bucket, PUBLIC_FORM_MAX_ATTEMPTS, PUBLIC_FORM_WINDOW_MS, PUBLIC_FORM_LOCKOUT_MS);
      const body = await readJsonBody(req);
      const valid = validateInquiryPayload(body);
      const created = createInquiryRecord(valid);
      appendAuditLog({
        actor: 'PUBLIC_VISITOR',
        action: 'INQUIRY_SUBMITTED',
        ip,
        details: { id: created.id, division: valid.division }
      });
      return sendJson(req, res, 201, { ok: true, id: created.id, createdAt: created.createdAt });
    }

    if (pathname === '/api/public/partnerships' && method === 'POST') {
      if (!verifySameOrigin(req)) return sendJson(req, res, 403, { error: 'Origin rejected.' });
      const bucket = `public_form:${ip}`;
      const rl = checkRateLimit(bucket, PUBLIC_FORM_MAX_ATTEMPTS, PUBLIC_FORM_WINDOW_MS);
      if (!rl.allowed) {
        return sendJson(
          req,
          res,
          429,
          { error: `Too many submissions. Please wait ${rl.retryAfterSec}s before trying again.` },
          { 'Retry-After': String(rl.retryAfterSec) }
        );
      }
      recordRateLimitAttempt(bucket, PUBLIC_FORM_MAX_ATTEMPTS, PUBLIC_FORM_WINDOW_MS, PUBLIC_FORM_LOCKOUT_MS);
      const body = await readJsonBody(req);
      const valid = validatePartnershipPayload(body);
      const created = createPartnershipRecord(valid);
      appendAuditLog({
        actor: 'PUBLIC_VISITOR',
        action: 'PARTNERSHIP_SUBMITTED',
        ip,
        details: { id: created.id, targetDivision: valid.targetDivision }
      });
      return sendJson(req, res, 201, { ok: true, id: created.id, createdAt: created.createdAt });
    }

    if (pathname === '/api/public/applications' && method === 'POST') {
      if (!verifySameOrigin(req)) return sendJson(req, res, 403, { error: 'Origin rejected.' });
      const bucket = `public_form:${ip}`;
      const rl = checkRateLimit(bucket, PUBLIC_FORM_MAX_ATTEMPTS, PUBLIC_FORM_WINDOW_MS);
      if (!rl.allowed) {
        return sendJson(
          req,
          res,
          429,
          { error: `Too many submissions. Please wait ${rl.retryAfterSec}s before trying again.` },
          { 'Retry-After': String(rl.retryAfterSec) }
        );
      }
      recordRateLimitAttempt(bucket, PUBLIC_FORM_MAX_ATTEMPTS, PUBLIC_FORM_WINDOW_MS, PUBLIC_FORM_LOCKOUT_MS);
      const body = await readJsonBody(req);
      const valid = validateApplicationPayload(body);
      const created = createApplicationRecord(valid);
      appendAuditLog({
        actor: 'PUBLIC_VISITOR',
        action: 'CAREER_APPLICATION_SUBMITTED',
        ip,
        details: { id: created.id, jobId: valid.jobId }
      });
      return sendJson(req, res, 201, { ok: true, id: created.id, createdAt: created.createdAt });
    }

    // ------------------------------------------------------------------------
    // AUTHENTICATION ENDPOINTS (ASYNC ARGON2ID + DUAL RATE LIMIT + TOTP 2FA)
    // ------------------------------------------------------------------------
    if (pathname === '/api/auth/login' && method === 'POST') {
      if (!verifySameOrigin(req)) return sendJson(req, res, 403, { error: 'Origin rejected.' });

      const body = await readJsonBody(req);
      const username = cleanText(body.username || 'admin', 64).toLowerCase();
      const password = typeof body.password === 'string' ? body.password : '';
      const totpCode = typeof body.totpCode === 'string' ? body.totpCode.trim() : '';

      const ipBucket = `admin_login_ip:${ip}`;
      const userBucket = `admin_login_user:${username}`;

      const ipRl = checkRateLimit(ipBucket, LOGIN_IP_MAX_ATTEMPTS, LOGIN_WINDOW_MS);
      const userRl = checkRateLimit(userBucket, LOGIN_USER_MAX_ATTEMPTS, LOGIN_WINDOW_MS);

      if (!ipRl.allowed || !userRl.allowed) {
        const retryAfter = Math.max(ipRl.retryAfterSec, userRl.retryAfterSec);
        appendAuditLog({
          actor: username,
          action: 'LOGIN_BLOCKED_RATE_LIMIT',
          ip,
          details: { retryAfterSec: retryAfter }
        });
        return sendJson(
          req,
          res,
          429,
          {
            error: `Brute-force protection engaged. Locked for ${retryAfter}s.`,
            locked: true,
            retryAfterSec: retryAfter
          },
          { 'Retry-After': String(retryAfter) }
        );
      }

      if (!password || password.length > 128) {
        return sendJson(req, res, 400, { error: 'Executive access key is required.' });
      }

      const user = await authenticateAdminAsync(username, password);
      if (!user) {
        const ipHit = recordRateLimitAttempt(ipBucket, LOGIN_IP_MAX_ATTEMPTS, LOGIN_WINDOW_MS, LOGIN_LOCKOUT_MS);
        const userHit = recordRateLimitAttempt(userBucket, LOGIN_USER_MAX_ATTEMPTS, LOGIN_WINDOW_MS, LOGIN_LOCKOUT_MS);
        const locked = ipHit.locked || userHit.locked;
        const retryAfterSec = Math.max(ipHit.retryAfterSec, userHit.retryAfterSec);
        const attemptsLeft = Math.min(ipHit.attemptsLeft, userHit.attemptsLeft);

        appendAuditLog({
          actor: username,
          action: locked ? 'LOGIN_LOCKOUT_TRIGGERED' : 'LOGIN_FAILED',
          ip,
          details: { attemptsLeft, locked }
        });
        return sendJson(req, res, locked ? 429 : 401, {
          error: locked
            ? `Maximum failed attempts exceeded. Locked for ${retryAfterSec}s.`
            : `Invalid credentials. ${attemptsLeft} attempt(s) remaining before lockout.`,
          locked,
          attemptsLeft,
          retryAfterSec
        });
      }

      // Check RFC 6238 TOTP 2FA if enabled for this account
      if (user.totp_enabled) {
        if (!totpCode) {
          return sendJson(req, res, 200, {
            authenticated: false,
            mfaRequired: true,
            message: 'Enter your 6-digit Authenticator App TOTP code.'
          });
        }
        const totpOk = verifyUserTotp(user, totpCode);
        if (!totpOk) {
          const ipHit = recordRateLimitAttempt(ipBucket, LOGIN_IP_MAX_ATTEMPTS, LOGIN_WINDOW_MS, LOGIN_LOCKOUT_MS);
          recordRateLimitAttempt(userBucket, LOGIN_USER_MAX_ATTEMPTS, LOGIN_WINDOW_MS, LOGIN_LOCKOUT_MS);
          appendAuditLog({ actor: user.username, action: 'LOGIN_MFA_FAILED', ip });
          return sendJson(req, res, ipHit.locked ? 429 : 401, {
            error: ipHit.locked
              ? `Too many failed 2FA attempts. Locked for ${ipHit.retryAfterSec}s.`
              : `Invalid or already-used 6-digit 2FA code. ${ipHit.attemptsLeft} attempt(s) left.`,
            mfaRequired: true,
            locked: ipHit.locked,
            retryAfterSec: ipHit.retryAfterSec
          });
        }
      }

      resetRateLimit(ipBucket);
      resetRateLimit(userBucket);

      const oldCookies = parseCookies(req);
      if (oldCookies[SESSION_COOKIE_NAME]) {
        deleteSessionByRawToken(oldCookies[SESSION_COOKIE_NAME]);
      }

      const session = createSession(user.id, ip, req.headers['user-agent']);
      appendAuditLog({
        actor: user.username,
        action: 'LOGIN_SUCCESS',
        ip,
        details: {
          role: user.role,
          mfaVerified: Boolean(user.totp_enabled),
          mustChangePassword: Boolean(user.must_change_password)
        }
      });

      return sendJson(
        req,
        res,
        200,
        {
          authenticated: true,
          user: {
            username: user.username,
            role: user.role,
            mustChangePassword: Boolean(user.must_change_password),
            totpEnabled: Boolean(user.totp_enabled)
          },
          csrfToken: session.csrfToken,
          idleExpiresAt: session.expiresAt,
          transportHttps: isRequestHttps(req)
        },
        {
          'Set-Cookie': buildSessionCookie(req, session.rawToken, 8 * 60 * 60)
        }
      );
    }

    // IMPORTANT: touch: false so idle polling NEVER resets the 30-min inactivity timeout!
    if (pathname === '/api/auth/session' && method === 'GET') {
      const cookies = parseCookies(req);
      const session = validateSessionToken(cookies[SESSION_COOKIE_NAME], {
        touch: false,
        currentIp: ip
      });
      if (!session) {
        return sendJson(req, res, 200, {
          authenticated: false,
          transportHttps: isRequestHttps(req)
        });
      }
      return sendJson(req, res, 200, {
        authenticated: true,
        user: {
          username: session.username,
          role: session.role,
          mustChangePassword: session.mustChangePassword,
          totpEnabled: session.totpEnabled
        },
        csrfToken: session.csrfToken,
        idleExpiresAt: session.idleExpiresAt,
        absoluteExpiresAt: session.absoluteExpiresAt,
        transportHttps: isRequestHttps(req)
      });
    }

    if (pathname === '/api/auth/logout' && method === 'POST') {
      if (!verifySameOrigin(req)) return sendJson(req, res, 403, { error: 'Origin rejected.' });
      const cookies = parseCookies(req);
      const rawToken = cookies[SESSION_COOKIE_NAME];
      const session = validateSessionToken(rawToken, { touch: false });
      if (session) {
        const headerCsrf = String(req.headers['x-csrf-token'] || '');
        if (!constantTimeEqual(headerCsrf, session.csrfToken)) {
          return sendJson(req, res, 403, { error: 'Invalid CSRF token.' });
        }
        deleteSessionByRawToken(rawToken);
        appendAuditLog({ actor: session.username, action: 'LOGOUT', ip });
      }
      return sendJson(
        req,
        res,
        200,
        { authenticated: false },
        { 'Set-Cookie': buildSessionCookie(req, '', 0) }
      );
    }

    if (pathname === '/api/auth/change-password' && method === 'POST') {
      const { session } = requireAdminAuth(req, { requireCsrf: true, allowPendingRotation: true });
      const body = await readJsonBody(req);
      const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
      const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';

      const verifiedUser = await authenticateAdminAsync(session.username, currentPassword);
      if (!verifiedUser) {
        appendAuditLog({ actor: session.username, action: 'PASSWORD_CHANGE_FAILED_AUTH', ip });
        return sendJson(req, res, 401, { error: 'Current password verification failed.' });
      }

      const policy = validatePasswordPolicy(newPassword);
      if (!policy.valid) {
        return sendJson(req, res, 400, { error: policy.reason });
      }

      await rotateAdminPasswordAsync(verifiedUser.id, newPassword);
      const freshSession = createSession(verifiedUser.id, ip, req.headers['user-agent']);

      appendAuditLog({
        actor: session.username,
        action: 'PASSWORD_ROTATED_AND_SESSIONS_REVOKED',
        ip
      });

      return sendJson(
        req,
        res,
        200,
        {
          ok: true,
          csrfToken: freshSession.csrfToken,
          idleExpiresAt: freshSession.expiresAt,
          mustChangePassword: false
        },
        {
          'Set-Cookie': buildSessionCookie(req, freshSession.rawToken, 8 * 60 * 60)
        }
      );
    }

    // RFC 6238 TOTP 2FA Management Endpoints
    if (pathname === '/api/auth/mfa/setup' && method === 'POST') {
      const { session } = requireAdminAuth(req, { requireCsrf: true, allowPendingRotation: true });
      const setup = initiateTotpSetup(session.userId, session.username);
      appendAuditLog({ actor: session.username, action: 'MFA_SETUP_INITIATED', ip });
      return sendJson(req, res, 200, setup);
    }

    if (pathname === '/api/auth/mfa/enable' && method === 'POST') {
      const { session } = requireAdminAuth(req, { requireCsrf: true, allowPendingRotation: true });
      const body = await readJsonBody(req);
      const verifiedUser = await authenticateAdminAsync(session.username, String(body.currentPassword || ''));
      if (!verifiedUser) {
        return sendJson(req, res, 401, { error: 'Current password verification failed.' });
      }
      const resEnable = confirmEnableTotp(session.userId, String(body.totpCode || ''));
      if (!resEnable.ok) {
        return sendJson(req, res, 400, { error: resEnable.reason });
      }
      appendAuditLog({ actor: session.username, action: 'MFA_TOTP_ENABLED', ip });
      return sendJson(req, res, 200, { ok: true, totpEnabled: true });
    }

    if (pathname === '/api/auth/mfa/disable' && method === 'POST') {
      const { session } = requireAdminAuth(req, { requireCsrf: true, allowPendingRotation: true });
      const body = await readJsonBody(req);
      const verifiedUser = await authenticateAdminAsync(session.username, String(body.currentPassword || ''));
      if (!verifiedUser) {
        return sendJson(req, res, 401, { error: 'Current password verification failed.' });
      }
      const resDisable = disableTotp(session.userId, String(body.totpCode || ''));
      if (!resDisable.ok) {
        return sendJson(req, res, 400, { error: resDisable.reason });
      }
      appendAuditLog({ actor: session.username, action: 'MFA_TOTP_DISABLED', ip });
      return sendJson(req, res, 200, { ok: true, totpEnabled: false });
    }

    if (pathname === '/api/auth/sessions/revoke-others' && method === 'POST') {
      const { session } = requireAdminAuth(req, { requireCsrf: true, allowPendingRotation: true });
      const revoked = revokeOtherSessions(session.userId, session.tokenHash);
      appendAuditLog({ actor: session.username, action: 'OTHER_SESSIONS_REVOKED', ip, details: { count: revoked } });
      return sendJson(req, res, 200, { ok: true, revokedCount: revoked });
    }

    // ------------------------------------------------------------------------
    // PROTECTED EXECUTIVE ADMIN ENDPOINTS
    // ------------------------------------------------------------------------
    if (pathname === '/api/admin/dashboard' && method === 'GET') {
      const { session } = requireAdminAuth(req, { allowPendingRotation: true });
      return sendJson(req, res, 200, {
        inquiries: listDecryptedInquiries(),
        partnerships: listDecryptedPartnerships(),
        applications: listDecryptedApplications(),
        additions: getCmsAdditions(),
        auditLogs: getRecentAuditLogs(40),
        auditVerification: verifyAuditLogChain(),
        activeSessions: listUserSessions(session.userId, session.tokenHash),
        backups: listEncryptedBackups(),
        securityPosture: {
          transportHttps: isRequestHttps(req),
          passwordKdf: 'Async Argon2id (64 MiB, t=3, RFC 9106 pepper, concurrency-capped)',
          mfaStatus: session.totpEnabled ? 'RFC 6238 TOTP 2FA Enabled (Replay Protected)' : 'Available — Enable TOTP 2FA Below',
          piiAtRest: 'AES-256-GCM AEAD (96-bit IV + 128-bit Tag + Record AAD)',
          sessionControl: 'HttpOnly + SameSite=Strict + SHA-256 DB Hash + True 30m Idle / 8h Max',
          csrfProtection: 'Fetch Metadata (Sec-Fetch-Site) + Host Allowlist + 256-bit CSRF Token',
          rateLimiting: 'Dual SQLite Rate Limiter (5/IP & 10/Username per 15m)',
          auditLog: 'HMAC-SHA256 Tamper-Evident Hash Chain + IP Anomaly Alerting',
          zeroThirdPartyFonts: 'Self-Hosted Local WOFF2 Fonts + Strict CSP (font-src self)'
        },
        user: {
          username: session.username,
          role: session.role,
          mustChangePassword: session.mustChangePassword,
          totpEnabled: session.totpEnabled
        }
      });
    }

    if (pathname === '/api/admin/audit/verify' && method === 'GET') {
      const { session } = requireAdminAuth(req, { allowPendingRotation: true });
      const verification = verifyAuditLogChain();
      appendAuditLog({
        actor: session.username,
        action: 'AUDIT_CHAIN_VERIFIED',
        ip,
        details: { valid: verification.valid, totalEntries: verification.totalEntries }
      });
      return sendJson(req, res, 200, verification);
    }

    if (pathname === '/api/admin/backup' && method === 'POST') {
      const { session } = requireAdminAuth(req, { requireCsrf: true, allowPendingRotation: true });
      const manifest = createEncryptedDbBackup();
      const verification = verifyEncryptedBackup(manifest.fileName);
      appendAuditLog({
        actor: session.username,
        action: 'ENCRYPTED_VAULT_BACKUP_CREATED',
        ip,
        details: { fileName: manifest.fileName, verified: verification.valid }
      });
      return sendJson(req, res, 201, {
        ok: true,
        manifest,
        verification,
        backups: listEncryptedBackups()
      });
    }

    // All state-changing admin operations require: Auth + CSRF + Rotated Password!
    if (pathname === '/api/admin/inquiries/status' && method === 'PATCH') {
      const { session } = requireAdminAuth(req, { requireCsrf: true });
      const body = await readJsonBody(req);
      const id = requireText(body.id, 'Inquiry ID', 3, 64);
      const status = validateEnum(body.status, INQUIRY_STATUSES, 'Inquiry Status');
      const updated = updateInquiryStatus(id, status);
      if (!updated) return sendJson(req, res, 404, { error: 'Inquiry not found.' });
      appendAuditLog({ actor: session.username, action: 'INQUIRY_STATUS_UPDATED', ip, details: { id, status } });
      return sendJson(req, res, 200, { ok: true });
    }

    if (pathname === '/api/admin/partnerships/status' && method === 'PATCH') {
      const { session } = requireAdminAuth(req, { requireCsrf: true });
      const body = await readJsonBody(req);
      const id = requireText(body.id, 'Partnership ID', 3, 64);
      const status = validateEnum(body.status, PARTNERSHIP_STATUSES, 'Partnership Status');
      const updated = updatePartnershipStatus(id, status);
      if (!updated) return sendJson(req, res, 404, { error: 'Partnership not found.' });
      appendAuditLog({ actor: session.username, action: 'PARTNERSHIP_STATUS_UPDATED', ip, details: { id, status } });
      return sendJson(req, res, 200, { ok: true });
    }

    if (pathname === '/api/admin/divisions/activity' && method === 'POST') {
      const { session } = requireAdminAuth(req, { requireCsrf: true });
      const body = await readJsonBody(req);
      const divisionId = requireText(body.divisionId, 'Division ID', 2, 80);
      const activity = requireText(body.activity, 'Activity', 3, 240);
      const additions = getCmsAdditions();
      additions.divisionActivities[divisionId] = [...(additions.divisionActivities[divisionId] || []), activity];
      saveCmsAdditions(additions);
      appendAuditLog({ actor: session.username, action: 'CMS_DIVISION_ACTIVITY_ADDED', ip, details: { divisionId } });
      return sendJson(req, res, 201, { ok: true, additions });
    }

    if (pathname === '/api/admin/products' && method === 'POST') {
      const { session } = requireAdminAuth(req, { requireCsrf: true });
      const body = await readJsonBody(req);
      const productName = requireText(body.name, 'Product Name', 2, 120);
      const product = {
        id: `prod-${Date.now()}`,
        name: productName,
        divisionId: requireText(body.divisionId, 'Division ID', 2, 80),
        divisionName: requireText(body.divisionName, 'Division Name', 2, 120),
        category: validateEnum(body.category, PRODUCT_CATEGORIES, 'Category'),
        badge: 'NEW PROPRIETARY SOLUTION',
        tagline: requireText(body.tagline, 'Tagline', 2, 180),
        description: requireText(body.description, 'Description', 5, 1500),
        keyFeatures: Array.isArray(body.keyFeatures)
          ? body.keyFeatures.map((f) => cleanText(f, 160)).filter(Boolean).slice(0, 12)
          : [],
        targetUsers: ['Corporate Enterprises', 'SMEs & Institutions'],
        techSpecs: ['React + Vite Frontend', 'Hardened Zero-Trust API + Encrypted DB'],
        status: 'Live & Deployed',
        metrics: 'Published via CREST Secure Executive CMS',
        demoPreview: {
          title: `${productName} — Live Platform Module`,
          kpis: [
            { label: 'Availability', value: '99.9%', trend: 'Active' },
            { label: 'Deployment', value: 'Cloud & API', trend: 'Ready' },
            { label: 'Encryption', value: 'AES-256-GCM', trend: 'Verified' }
          ],
          modules: ['Core Operational Engine', 'Executive Analytics Portal', 'API Integration Hub']
        }
      };
      const additions = getCmsAdditions();
      additions.products = [product, ...additions.products];
      saveCmsAdditions(additions);
      appendAuditLog({ actor: session.username, action: 'CMS_PRODUCT_PUBLISHED', ip, details: { id: product.id, name: product.name } });
      return sendJson(req, res, 201, { ok: true, product, additions });
    }

    if (pathname === '/api/admin/projects' && method === 'POST') {
      const { session } = requireAdminAuth(req, { requireCsrf: true });
      const body = await readJsonBody(req);
      const project = {
        id: `proj-${Date.now()}`,
        title: requireText(body.title, 'Project Title', 2, 160),
        divisionId: requireText(body.divisionId, 'Division ID', 2, 80),
        divisionName: requireText(body.divisionName, 'Division Name', 2, 120),
        category: validateEnum(body.category, PROJECT_CATEGORIES, 'Category'),
        status: 'Active Flagship',
        summary: requireText(body.summary, 'Project Summary', 5, 1500),
        impact: cleanText(body.impact || 'Delivering measurable cross-industry operational transformation.', 400),
        deliverables: ['System Architecture', 'Deployment & Training', 'Ongoing SLA Support'],
        year: '2026',
        clientOrScope: 'CREST Ecosystem Initiative'
      };
      const additions = getCmsAdditions();
      additions.projects = [project, ...additions.projects];
      saveCmsAdditions(additions);
      appendAuditLog({ actor: session.username, action: 'CMS_PROJECT_PUBLISHED', ip, details: { id: project.id } });
      return sendJson(req, res, 201, { ok: true, project, additions });
    }

    if (pathname === '/api/admin/news' && method === 'POST') {
      const { session } = requireAdminAuth(req, { requireCsrf: true });
      const body = await readJsonBody(req);
      const contentArr = Array.isArray(body.content)
        ? body.content.map((p) => cleanText(p, 1500)).filter(Boolean).slice(0, 20)
        : [];
      if (contentArr.length === 0) {
        throw new ValidationError('Article content requires at least one paragraph.');
      }
      const article = {
        id: `news-${Date.now()}`,
        title: requireText(body.title, 'Headline Title', 3, 180),
        category: validateEnum(body.category, NEWS_CATEGORIES, 'Category'),
        date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        readTime: '3 min read',
        author: 'CREST Executive Desk',
        divisionTag: cleanText(body.divisionTag || 'CREST GROUP Corporate', 80),
        excerpt: requireText(body.excerpt, 'Excerpt', 5, 400),
        content: contentArr,
        featured: true
      };
      const additions = getCmsAdditions();
      additions.news = [article, ...additions.news];
      saveCmsAdditions(additions);
      appendAuditLog({ actor: session.username, action: 'CMS_NEWS_PUBLISHED', ip, details: { id: article.id } });
      return sendJson(req, res, 201, { ok: true, article, additions });
    }

    if (pathname === '/api/admin/reset-catalog' && method === 'POST') {
      const { session } = requireAdminAuth(req, { requireCsrf: true });
      const clean = { divisionActivities: {}, products: [], projects: [], news: [] };
      saveCmsAdditions(clean);
      appendAuditLog({ actor: session.username, action: 'CMS_CATALOG_RESET', ip });
      return sendJson(req, res, 200, { ok: true, additions: clean });
    }

    if (SERVE_STATIC && !pathname.startsWith('/api/')) {
      return serveStaticFile(req, res, pathname);
    }

    return sendJson(req, res, 404, { error: 'Endpoint not found.' });
  } catch (err) {
    const statusCode = err?.statusCode || (err instanceof ValidationError ? 400 : 500);
    const publicMessage = statusCode < 500 ? err.message : 'Internal security service error.';
    if (statusCode >= 500) {
      console.error('[CREST SECURITY SERVER ERROR]', err);
    }
    return sendJson(req, res, statusCode, {
      error: publicMessage,
      ...(err?.code ? { code: err.code } : {})
    });
  }
}

const TLS_CERT_PATH = process.env.TLS_CERT_PATH;
const TLS_KEY_PATH = process.env.TLS_KEY_PATH;

const server =
  TLS_CERT_PATH && TLS_KEY_PATH
    ? https.createServer(
        {
          cert: fs.readFileSync(TLS_CERT_PATH),
          key: fs.readFileSync(TLS_KEY_PATH),
          minVersion: 'TLSv1.3'
        },
        handleRequest
      )
    : http.createServer(handleRequest);

server.requestTimeout = 15000;
server.headersTimeout = 10000;
server.keepAliveTimeout = 5000;

const protoLabel = TLS_CERT_PATH && TLS_KEY_PATH ? 'https (Native TLS 1.3)' : 'http';
server.listen(PORT, HOST, () => {
  console.log(
    `[CREST SECURITY API v3] Listening on ${protoLabel}://${HOST}:${PORT} (Async Argon2id + RFC6238 TOTP + AES-256-GCM + Encrypted Backups)`
  );
});
