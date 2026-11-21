/**
 * ============================================================================
 * CREST GROUP SERVER-SIDE CRYPTOGRAPHIC ENGINE (HARDENED v2)
 * Standards: RFC 9106 (Argon2id + Native Secret Pepper), RFC 5869 (HKDF-SHA256),
 * NIST SP 800-38D (AES-256-GCM AEAD), RFC 6238 (TOTP 2FA), NIST SP 800-63B.
 * Zero external dependencies — built purely on Node.js native OpenSSL crypto.
 * ============================================================================
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = path.resolve(__dirname, 'data');
const SECRETS_FILE = path.join(DATA_DIR, '.secrets.env');

// Argon2id RFC 9106 / OWASP 2024 hardened parameters (64 MiB RAM, 3 passes, 1 lane)
const ARGON2_PARAMS = Object.freeze({
  memory: 65536, // 64 MiB
  passes: 3,
  parallelism: 1,
  tagLength: 32 // 256-bit derived key
});

// Global concurrency cap preventing Argon2id RAM/CPU exhaustion DoS
const MAX_CONCURRENT_ARGON2 = 4;
let activeArgon2Ops = 0;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });
  }
}

function loadOrCreateMasterKey() {
  if (process.env.CREST_MASTER_KEY) {
    const raw = process.env.CREST_MASTER_KEY.trim();
    if (!/^[0-9a-fA-F]{64}$/.test(raw)) {
      throw new Error('CREST_MASTER_KEY must be a 64-character hex string (256 bits).');
    }
    return Buffer.from(raw, 'hex');
  }

  ensureDataDir();

  if (fs.existsSync(SECRETS_FILE)) {
    const content = fs.readFileSync(SECRETS_FILE, 'utf8');
    const match = content.match(/^CREST_MASTER_KEY=([0-9a-fA-F]{64})$/m);
    if (match) {
      return Buffer.from(match[1], 'hex');
    }
  }

  const generated = crypto.randomBytes(32);
  const fileBody = [
    '# AUTO-GENERATED CRYPTOGRAPHIC MASTER KEY — NEVER COMMIT OR SHARE',
    `CREST_MASTER_KEY=${generated.toString('hex')}`,
    ''
  ].join('\n');

  fs.writeFileSync(SECRETS_FILE, fileBody, { encoding: 'utf8', mode: 0o600 });
  return generated;
}

const MASTER_KEY = loadOrCreateMasterKey();

function deriveDomainKey(infoLabel) {
  const derived = crypto.hkdfSync(
    'sha256',
    MASTER_KEY,
    Buffer.from('CREST_GROUP_HKDF_SALT_V1', 'utf8'),
    Buffer.from(infoLabel, 'utf8'),
    32
  );
  return Buffer.from(derived);
}

const PII_AEAD_KEY = deriveDomainKey('crest-aead-pii-aes256gcm-v1');
const PASSWORD_PEPPER_KEY = deriveDomainKey('crest-argon2id-pepper-v1');
const AUDIT_HMAC_KEY = deriveDomainKey('crest-audit-chain-hmac-sha256-v1');
const BACKUP_AEAD_KEY = deriveDomainKey('crest-db-backup-aes256gcm-v1');

/**
 * Constant-time string equality using fixed-size SHA-256 HMAC digests
 * so neither byte content nor string length leaks side-channel timing.
 */
export function constantTimeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const hA = crypto.createHmac('sha256', AUDIT_HMAC_KEY).update(a, 'utf8').digest();
  const hB = crypto.createHmac('sha256', AUDIT_HMAC_KEY).update(b, 'utf8').digest();
  return crypto.timingSafeEqual(hA, hB);
}

/**
 * Async Argon2id wrapper with global concurrency semaphore (prevents event-loop block & OOM DoS).
 */
function runArgon2Async(options) {
  return new Promise((resolve, reject) => {
    if (activeArgon2Ops >= MAX_CONCURRENT_ARGON2) {
      return reject(
        Object.assign(new Error('Authentication subsystem busy. Please retry shortly.'), {
          statusCode: 503
        })
      );
    }
    activeArgon2Ops += 1;
    crypto.argon2('argon2id', options, (err, derivedKey) => {
      activeArgon2Ops = Math.max(0, activeArgon2Ops - 1);
      if (err) return reject(err);
      resolve(Buffer.from(derivedKey));
    });
  });
}

/**
 * Synchronous Argon2id (used ONLY during one-time initial database bootstrap).
 */
export function hashPasswordArgon2idSync(password) {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('Password cannot be empty.');
  }
  const salt = crypto.randomBytes(16);
  const derived = crypto.argon2Sync('argon2id', {
    message: Buffer.from(password, 'utf8'),
    nonce: salt,
    secret: PASSWORD_PEPPER_KEY,
    passes: ARGON2_PARAMS.passes,
    memory: ARGON2_PARAMS.memory,
    parallelism: ARGON2_PARAMS.parallelism,
    tagLength: ARGON2_PARAMS.tagLength
  });

  return `$argon2id$v=19$m=${ARGON2_PARAMS.memory},t=${ARGON2_PARAMS.passes},p=${ARGON2_PARAMS.parallelism}$${salt.toString('base64url')}$${Buffer.from(derived).toString('base64url')}`;
}

/**
 * Async Argon2id password hashing (runs off event loop with concurrency guard).
 */
export async function hashPasswordArgon2idAsync(password) {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('Password cannot be empty.');
  }
  const salt = crypto.randomBytes(16);
  const derived = await runArgon2Async({
    message: Buffer.from(password, 'utf8'),
    nonce: salt,
    secret: PASSWORD_PEPPER_KEY,
    passes: ARGON2_PARAMS.passes,
    memory: ARGON2_PARAMS.memory,
    parallelism: ARGON2_PARAMS.parallelism,
    tagLength: ARGON2_PARAMS.tagLength
  });

  return `$argon2id$v=19$m=${ARGON2_PARAMS.memory},t=${ARGON2_PARAMS.passes},p=${ARGON2_PARAMS.parallelism}$${salt.toString('base64url')}$${derived.toString('base64url')}`;
}

/**
 * Async constant-time Argon2id verification against stored PHC string.
 */
export async function verifyPasswordArgon2idAsync(password, storedPhc) {
  if (typeof password !== 'string' || typeof storedPhc !== 'string') return false;
  const parts = storedPhc.split('$');
  if (parts.length !== 6 || parts[1] !== 'argon2id' || parts[2] !== 'v=19') {
    return false;
  }

  const paramMap = Object.fromEntries(
    parts[3].split(',').map((kv) => {
      const [k, v] = kv.split('=');
      return [k, Number(v)];
    })
  );

  const salt = Buffer.from(parts[4], 'base64url');
  const expectedHash = Buffer.from(parts[5], 'base64url');

  if (
    !Number.isInteger(paramMap.m) ||
    !Number.isInteger(paramMap.t) ||
    !Number.isInteger(paramMap.p) ||
    salt.length < 16 ||
    expectedHash.length !== 32
  ) {
    return false;
  }

  const derived = await runArgon2Async({
    message: Buffer.from(password, 'utf8'),
    nonce: salt,
    secret: PASSWORD_PEPPER_KEY,
    passes: paramMap.t,
    memory: paramMap.m,
    parallelism: paramMap.p,
    tagLength: expectedHash.length
  });

  return crypto.timingSafeEqual(derived, expectedHash);
}

/**
 * Authenticated Encryption at Rest (AES-256-GCM) with record-bound AAD.
 */
export function encryptPII(plaintext, aadContext) {
  const safeText = typeof plaintext === 'string' ? plaintext : String(plaintext ?? '');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', PII_AEAD_KEY, iv);
  cipher.setAAD(Buffer.from(aadContext, 'utf8'));

  const encrypted = Buffer.concat([cipher.update(safeText, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `v1:${iv.toString('base64url')}:${authTag.toString('base64url')}:${encrypted.toString('base64url')}`;
}

export function decryptPII(ciphertextBlob, aadContext) {
  if (typeof ciphertextBlob !== 'string' || !ciphertextBlob.startsWith('v1:')) {
    return '[INTEGRITY ERROR]';
  }
  try {
    const [, ivB64, tagB64, dataB64] = ciphertextBlob.split(':');
    const iv = Buffer.from(ivB64, 'base64url');
    const authTag = Buffer.from(tagB64, 'base64url');
    const encrypted = Buffer.from(dataB64, 'base64url');

    const decipher = crypto.createDecipheriv('aes-256-gcm', PII_AEAD_KEY, iv);
    decipher.setAAD(Buffer.from(aadContext, 'utf8'));
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  } catch {
    return '[TAMPERED OR CORRUPTED CIPHERTEXT]';
  }
}

export function generateSecureToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

export function sha256Hex(value) {
  return crypto.createHash('sha256').update(String(value), 'utf8').digest('hex');
}

export function computeAuditHash(prevHash, entryPayload) {
  return crypto
    .createHmac('sha256', AUDIT_HMAC_KEY)
    .update(`${prevHash}|${entryPayload}`, 'utf8')
    .digest('hex');
}

/**
 * Binary AES-256-GCM Authenticated Encryption for SQLite Database Backups.
 * Binary format: [4B magic "CRB1"][12B IV][16B AuthTag][Ciphertext...]
 */
const BACKUP_MAGIC = Buffer.from('CRB1', 'ascii');

export function encryptBackupBinary(rawBuffer, aadContext) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', BACKUP_AEAD_KEY, iv);
  cipher.setAAD(Buffer.from(aadContext, 'utf8'));
  const ciphertext = Buffer.concat([cipher.update(rawBuffer), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([BACKUP_MAGIC, iv, authTag, ciphertext]);
}

export function decryptBackupBinary(encryptedBuffer, aadContext) {
  if (!Buffer.isBuffer(encryptedBuffer) || encryptedBuffer.length < 32) {
    throw new Error('Backup buffer truncated or invalid.');
  }
  const magic = encryptedBuffer.subarray(0, 4);
  if (!magic.equals(BACKUP_MAGIC)) {
    throw new Error('Invalid encrypted backup header magic.');
  }
  const iv = encryptedBuffer.subarray(4, 16);
  const authTag = encryptedBuffer.subarray(16, 32);
  const ciphertext = encryptedBuffer.subarray(32);

  const decipher = crypto.createDecipheriv('aes-256-gcm', BACKUP_AEAD_KEY, iv);
  decipher.setAAD(Buffer.from(aadContext, 'utf8'));
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

// ============================================================================
// RFC 6238 TOTP (2FA / MFA) — PURE NODE CRYPTO (ZERO DEPENDENCIES)
// ============================================================================
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function generateTotpSecretBase32(byteLength = 20) {
  const bytes = crypto.randomBytes(byteLength);
  let bits = 0;
  let value = 0;
  let output = '';
  for (const b of bytes) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

function decodeBase32(base32Str) {
  const cleaned = String(base32Str).toUpperCase().replace(/=+$/g, '').replace(/\s+/g, '');
  let bits = 0;
  let value = 0;
  const out = [];
  for (const ch of cleaned) {
    const idx = BASE32_ALPHABET.indexOf(ch);
    if (idx === -1) throw new Error('Invalid Base32 character.');
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

export function generateTotpForStep(secretBase32, timeStep) {
  const key = decodeBase32(secretBase32);
  const counterBuf = Buffer.alloc(8);
  counterBuf.writeBigUInt64BE(BigInt(timeStep));
  const hmac = crypto.createHmac('sha1', key).update(counterBuf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binCode =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return String(binCode % 1_000_000).padStart(6, '0');
}

/**
 * Verifies a 6-digit RFC 6238 TOTP token with ±1 step clock-skew window
 * AND strict replay protection (rejects any timeStep <= lastUsedStep).
 */
export function verifyTotpCode(secretBase32, userCode, lastUsedStep = -1) {
  const normalized = String(userCode || '').replace(/\s+/g, '');
  if (!/^\d{6}$/.test(normalized)) {
    return { valid: false, matchedStep: null };
  }
  const currentStep = Math.floor(Date.now() / 30000);
  for (const delta of [-1, 0, 1]) {
    const candidateStep = currentStep + delta;
    if (candidateStep <= lastUsedStep) continue; // Replay protection!
    const expected = generateTotpForStep(secretBase32, candidateStep);
    if (constantTimeEqual(normalized, expected)) {
      return { valid: true, matchedStep: candidateStep };
    }
  }
  return { valid: false, matchedStep: null };
}

export function buildOtpAuthUri(username, secretBase32) {
  const issuer = 'CREST GROUP';
  const label = encodeURIComponent(`${issuer}:${username}`);
  return `otpauth://totp/${label}?secret=${secretBase32}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

export function generateStrongBootstrapPassword() {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%^&*-_=+';
  const all = upper + lower + digits + symbols;

  const pick = (charset) => charset[crypto.randomInt(0, charset.length)];
  const chars = [
    pick(upper),
    pick(upper),
    pick(lower),
    pick(lower),
    pick(digits),
    pick(digits),
    pick(symbols),
    pick(symbols)
  ];

  while (chars.length < 20) {
    chars.push(pick(all));
  }

  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

export function validatePasswordPolicy(password) {
  if (typeof password !== 'string') {
    return { valid: false, reason: 'Password must be a string.' };
  }
  if (password.length < 12) {
    return { valid: false, reason: 'Password must be at least 12 characters long.' };
  }
  if (password.length > 128) {
    return { valid: false, reason: 'Password cannot exceed 128 characters.' };
  }
  if (
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !/[^A-Za-z0-9]/.test(password)
  ) {
    return {
      valid: false,
      reason: 'Password must contain uppercase, lowercase, a number, and a special character.'
    };
  }
  const lower = password.toLowerCase();
  const banned = ['crest2026', 'crestgroup', 'password', '12345678', 'qwerty', 'admin123'];
  if (banned.some((b) => lower.includes(b))) {
    return { valid: false, reason: 'Password contains a prohibited common or company pattern.' };
  }
  return { valid: true };
}
