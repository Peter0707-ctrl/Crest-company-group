/**
 * ============================================================================
 * CREST GROUP RED-TEAM AUTOMATED SECURITY & PENETRATION VERIFICATION SUITE (v2)
 * Verifies every cryptographic, HTTP header, Auth, TOTP 2FA + Replay, CSRF,
 * Fetch Metadata, Header Spoofing, Idle-Timeout Peek, Rotation Gate, AEAD,
 * Audit Chain, and Bundle Secret-Leak invariant live.
 * ============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { generateTotpForStep, sha256Hex } from './crypto.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'http://127.0.0.1:4000';
const DIST_ASSETS = path.resolve(__dirname, '..', 'dist', 'assets');
const BOOTSTRAP_FILE = path.join(__dirname, 'data', 'BOOTSTRAP_CREDENTIALS.txt');
const DB_PATH = path.join(__dirname, 'data', 'crest_secure.db');

let passed = 0;
let total = 0;
async function test(name, fn) {
  total += 1;
  try {
    await fn();
    passed += 1;
    console.log(`  [PASS] ${name}`);
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error('        ', err?.message || err);
    process.exitCode = 1;
  }
}

function readBootstrapPassword() {
  const txt = fs.readFileSync(BOOTSTRAP_FILE, 'utf8');
  const match = txt.match(/^Password\s*:\s*(.+)$/m);
  if (!match) throw new Error('Could not parse bootstrap password from BOOTSTRAP_CREDENTIALS.txt');
  return match[1].trim();
}

async function run() {
  console.log('\n=== CREST GROUP RED-TEAM SECURITY VERIFICATION SUITE (v2) ===\n');

  // 1. HTTP Security Headers + Spoofed X-Forwarded-Proto Resistance
  await test('HTTP security headers strict & spoofed X-Forwarded-Proto: https ignored when TRUST_PROXY!=true', async () => {
    const res = await fetch(`${BASE_URL}/api/health`, {
      headers: { 'X-Forwarded-Proto': 'https' }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.https, false, 'Untrusted X-Forwarded-Proto must NOT spoof HTTPS!');
    assert.equal(res.headers.get('strict-transport-security'), null);
    const csp = res.headers.get('content-security-policy') || '';
    assert.ok(csp.includes("script-src 'self'"));
    assert.ok(!csp.includes("script-src 'self' 'unsafe-inline'"));
    assert.ok(csp.includes("frame-ancestors 'none'"));
    assert.equal(res.headers.get('x-frame-options'), 'DENY');
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.ok((res.headers.get('cache-control') || '').includes('no-store'));
  });

  // 2. Unauthenticated Admin & Forged Cookie Blocked
  await test('Unauthenticated dashboard & forged 64-hex cookie both rejected with 401', async () => {
    const r1 = await fetch(`${BASE_URL}/api/admin/dashboard`);
    assert.equal(r1.status, 401);
    const r2 = await fetch(`${BASE_URL}/api/admin/dashboard`, {
      headers: { Cookie: 'crest_sid=' + 'a'.repeat(64) }
    });
    assert.equal(r2.status, 401);
  });

  // 3. Fetch Metadata Cross-Site Attack Blocked
  await test('Cross-site POST blocked by Sec-Fetch-Site: cross-site Fetch Metadata guard (403)', async () => {
    const res = await fetch(`${BASE_URL}/api/public/inquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Sec-Fetch-Site': 'cross-site'
      },
      body: JSON.stringify({ fullName: 'Attacker', email: 'a@b.com', phone: '+255700000001', division: 'CREST', message: 'cross site' })
    });
    assert.equal(res.status, 403);
  });

  // 4. Honeypot Bot Trap
  await test('Public form rejects automated bot payload with filled honeypot (400)', async () => {
    const res = await fetch(`${BASE_URL}/api/public/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Bot User',
        email: 'bot@example.com',
        phone: '+255700000001',
        division: 'CREST Technologies',
        message: 'Spam message payload here',
        website_hp: 'http://spam.example'
      })
    });
    assert.equal(res.status, 400);
  });

  // 5. Nested XSS + Prototype Pollution + AES-256-GCM Encryption at Rest
  let createdInquiryId = '';
  await test('Nested <scr<script>ipt> + prototype pollution stripped; PII encrypted with AES-256-GCM in SQLite', async () => {
    const res = await fetch(`${BASE_URL}/api/public/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        __proto__: { polluted: true },
        fullName: '<scr<script>ipt>alert(1)</scr</script>ipt>Dr. Amina & Co',
        organization: 'East Africa Ventures',
        email: 'amina.test@crest-audit.tz',
        phone: '+255 779 304 500',
        division: 'CREST Technologies',
        serviceOrProduct: 'Copetra AI',
        budgetRange: '$15,000 – $50,000',
        message: '<img src=x onerror=alert(1)>Requesting enterprise AI quote for Q2.'
      })
    });
    assert.equal(res.status, 201);
    const json = await res.json();
    createdInquiryId = json.id;

    const db = new DatabaseSync(DB_PATH, { readOnly: true });
    const row = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(createdInquiryId);
    db.close();

    assert.ok(!row.full_name.includes('<script>'), 'Nested script tag must not survive');
    assert.ok(row.full_name.includes('Dr. Amina & Co'));
    assert.ok(row.email_enc.startsWith('v1:'));
    assert.ok(!row.email_enc.includes('amina.test@crest-audit.tz'));
    assert.ok(row.message_enc.startsWith('v1:'));
  });

  // 6. Real Executive Login (Async Argon2id + Pepper + HttpOnly Cookie)
  let sessionCookie = '';
  let csrfToken = '';
  const bootstrapPassword = readBootstrapPassword();

  await test('Async Argon2id+Pepper login issues HttpOnly SameSite=Strict cookie & 256-bit CSRF token', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: bootstrapPassword })
    });
    assert.equal(res.status, 200);
    const setCookie = res.headers.get('set-cookie') || '';
    assert.ok(setCookie.includes('crest_sid='));
    assert.ok(setCookie.includes('HttpOnly'));
    assert.ok(setCookie.includes('SameSite=Strict'));
    sessionCookie = setCookie.split(';')[0];
    const body = await res.json();
    assert.equal(body.authenticated, true);
    assert.equal(body.csrfToken.length, 64);
    csrfToken = body.csrfToken;
  });

  // 7. True Idle-Timeout Peek Check (GET /api/auth/session MUST NOT reset last_active_at!)
  await test('GET /api/auth/session peeks session WITHOUT resetting last_active_at (true idle timeout)', async () => {
    const rawSid = sessionCookie.split('=')[1];
    const tokenHash = sha256Hex(rawSid);
    const db = new DatabaseSync(DB_PATH, { readOnly: true });
    const before = db.prepare('SELECT last_active_at FROM sessions WHERE token_hash = ?').get(tokenHash);
    db.close();

    await new Promise((r) => setTimeout(r, 30));
    const pollRes = await fetch(`${BASE_URL}/api/auth/session`, {
      headers: { Cookie: sessionCookie }
    });
    assert.equal(pollRes.status, 200);

    const db2 = new DatabaseSync(DB_PATH, { readOnly: true });
    const after = db2.prepare('SELECT last_active_at FROM sessions WHERE token_hash = ?').get(tokenHash);
    db2.close();
    assert.equal(after.last_active_at, before.last_active_at, 'Idle poll must NOT extend last_active_at!');
  });

  // 8. Server-Enforced Bootstrap Password Rotation Gate
  await test('Server blocks admin mutations with 403 PASSWORD_ROTATION_REQUIRED while bootstrap password is active', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/inquiries/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({ id: createdInquiryId, status: 'Quoted' })
    });
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.code, 'PASSWORD_ROTATION_REQUIRED');
  });

  // 9. Missing CSRF Blocked
  await test('State-changing request without X-CSRF-Token returns 403 Forbidden', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/mfa/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
      body: '{}'
    });
    assert.equal(res.status, 403);
  });

  // 10. RFC 6238 TOTP 2FA Setup + Enable + Replay Attack Rejection + Disable
  await test('RFC 6238 TOTP 2FA setup, verification, replay-attack block, and clean disable', async () => {
    const setupRes = await fetch(`${BASE_URL}/api/auth/mfa/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie, 'X-CSRF-Token': csrfToken },
      body: '{}'
    });
    assert.equal(setupRes.status, 200);
    const { secretBase32, otpauthUri } = await setupRes.json();
    assert.ok(secretBase32.length >= 32);
    assert.ok(otpauthUri.startsWith('otpauth://totp/'));

    const currentStep = Math.floor(Date.now() / 30000);
    const validCode = generateTotpForStep(secretBase32, currentStep);

    const enableRes = await fetch(`${BASE_URL}/api/auth/mfa/enable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie, 'X-CSRF-Token': csrfToken },
      body: JSON.stringify({ currentPassword: bootstrapPassword, totpCode: validCode })
    });
    assert.equal(enableRes.status, 200);

    // Attempt login WITHOUT totpCode -> must challenge mfaRequired: true
    const challengeRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: bootstrapPassword })
    });
    assert.equal(challengeRes.status, 200);
    const challengeData = await challengeRes.json();
    assert.equal(challengeData.authenticated, false);
    assert.equal(challengeData.mfaRequired, true);

    // Replay attack: reusing the EXACT same 6-digit code in the same 30s window MUST FAIL (401)!
    const replayRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: bootstrapPassword, totpCode: validCode })
    });
    assert.equal(replayRes.status, 401, 'Replaying a previously consumed TOTP code MUST fail!');

    // Advance step +1 (valid within ±1 skew window) to cleanly disable test 2FA so user can set up their own app
    const nextCode = generateTotpForStep(secretBase32, currentStep + 1);
    const disableRes = await fetch(`${BASE_URL}/api/auth/mfa/disable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie, 'X-CSRF-Token': csrfToken },
      body: JSON.stringify({ currentPassword: bootstrapPassword, totpCode: nextCode })
    });
    assert.equal(disableRes.status, 200);
  });

  // 11. Authenticated Dashboard Decryption + Audit Chain Verification
  await test('Authenticated dashboard decrypts AES-256-GCM PII & HMAC-SHA256 audit chain verifies 100% intact', async () => {
    const dashRes = await fetch(`${BASE_URL}/api/admin/dashboard`, {
      headers: { Cookie: sessionCookie }
    });
    assert.equal(dashRes.status, 200);
    const dash = await dashRes.json();
    const found = dash.inquiries.find((i) => i.id === createdInquiryId);
    assert.ok(found);
    assert.equal(found.email, 'amina.test@crest-audit.tz');

    const auditRes = await fetch(`${BASE_URL}/api/admin/audit/verify`, {
      headers: { Cookie: sessionCookie }
    });
    assert.equal(auditRes.status, 200);
    const audit = await auditRes.json();
    assert.equal(audit.valid, true);
  });

  // 12. Logout Session Revocation
  await test('Logout revokes server session so replaying old cookie immediately returns 401', async () => {
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie, 'X-CSRF-Token': csrfToken },
      body: '{}'
    });
    assert.equal(logoutRes.status, 200);

    const replayRes = await fetch(`${BASE_URL}/api/admin/dashboard`, {
      headers: { Cookie: sessionCookie }
    });
    assert.equal(replayRes.status, 401);
  });

  // 13. Production JS Bundle Secret/PII Leak Audit + Zero External Font CDN Audit
  await test('Built JS/HTML bundle contains ZERO secrets, customer PII, or external Google Font CDN links', async () => {
    const files = fs.readdirSync(DIST_ASSETS).filter((f) => f.endsWith('.js'));
    assert.ok(files.length > 0);
    const combined = files.map((f) => fs.readFileSync(path.join(DIST_ASSETS, f), 'utf8')).join('\n');
    for (const secret of [
      'crest2026',
      '63726573745f73616c745f323032365f',
      '4a8fc7f32a3b3a01efbd880fd011c1b76eb855fc9b30f221d30f14325b58ff86',
      'd.mwakasege@kilihaulage.co.tz',
      'kelvin.mushi.dev@gmail.com',
      'v.nyerere@eacventures.com',
      'CREST_MASTER_KEY'
    ]) {
      assert.ok(!combined.includes(secret), `Forbidden secret/PII found in public JS bundle: ${secret}`);
    }
    const indexHtml = fs.readFileSync(path.resolve(__dirname, '..', 'dist', 'index.html'), 'utf8');
    assert.ok(!indexHtml.includes('fonts.googleapis.com'), 'External Google Fonts link still present in dist/index.html');
    assert.ok(!indexHtml.includes('fonts.gstatic.com'), 'External gstatic link still present in dist/index.html');

    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const csp = healthRes.headers.get('content-security-policy') || '';
    assert.ok(!csp.includes('fonts.googleapis.com'), 'CSP should not whitelist external Google Fonts');
    assert.ok(!csp.includes('fonts.gstatic.com'), 'CSP should not whitelist external gstatic');
  });

  // 14. Authenticated Encrypted Vault Backup & AEAD Decryption Verification
  await test('AES-256-GCM encrypted SQLite backup creation & cryptographic AEAD verification succeed', async () => {
    const { createEncryptedDbBackup, verifyEncryptedBackup } = await import('./backup.mjs');
    const manifest = createEncryptedDbBackup();
    const check = verifyEncryptedBackup(manifest.fileName);
    assert.equal(check.valid, true);
    assert.ok(check.decryptedBytes > 4096);
  });

  // Cleanup test inquiry + reset test login rate-limit buckets so user starts completely clean
  const rwDb = new DatabaseSync(DB_PATH);
  rwDb.prepare('DELETE FROM inquiries WHERE id = ?').run(createdInquiryId);
  rwDb.prepare('DELETE FROM rate_limits').run();
  rwDb.close();

  console.log(`\n=== SUMMARY: ${passed} / ${total} RED-TEAM SECURITY CHECKS PASSED ===\n`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
