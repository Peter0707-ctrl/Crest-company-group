/**
 * ============================================================================
 * CREST GROUP ENCRYPTED DATABASE BACKUP & INTEGRITY VERIFICATION ENGINE
 * - Checkpoints SQLite WAL cleanly before snapshot
 * - Encrypts database binary using AES-256-GCM (HKDF-separated backup key + AAD)
 * - Generates SHA-256 integrity manifest per backup snapshot
 * - Usage:
 *     npm run backup:create
 *     npm run backup:verify
 * ============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { DATA_DIR, encryptBackupBinary, decryptBackupBinary } from './crypto.mjs';
import { db } from './database.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const BACKUPS_DIR = path.resolve(__dirname, 'backups');
const DB_PATH = path.join(DATA_DIR, 'crest_secure.db');

function ensureBackupsDir() {
  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true, mode: 0o700 });
  }
}

export function createEncryptedDbBackup() {
  ensureBackupsDir();

  // Flush WAL frames into main SQLite file for atomic consistent snapshot
  db.exec('PRAGMA wal_checkpoint(TRUNCATE);');

  const rawBytes = fs.readFileSync(DB_PATH);
  const rawSha256 = crypto.createHash('sha256').update(rawBytes).digest('hex');

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `crest-vault-${stamp}.db.enc`;
  const aadContext = `crest-db-backup-v1:${fileName}`;
  const encryptedBytes = encryptBackupBinary(rawBytes, aadContext);
  const encSha256 = crypto.createHash('sha256').update(encryptedBytes).digest('hex');

  const encPath = path.join(BACKUPS_DIR, fileName);
  const metaPath = path.join(BACKUPS_DIR, `${fileName}.meta.json`);

  fs.writeFileSync(encPath, encryptedBytes, { mode: 0o600 });
  const manifest = {
    version: 1,
    fileName,
    createdAt: new Date().toISOString(),
    algorithm: 'AES-256-GCM (HKDF-SHA256 Separated Key + Filename AAD)',
    encryptedBytes: encryptedBytes.length,
    ciphertextSha256: encSha256,
    plaintextSha256: rawSha256
  };
  fs.writeFileSync(metaPath, JSON.stringify(manifest, null, 2), { encoding: 'utf8', mode: 0o600 });

  return manifest;
}

export function listEncryptedBackups() {
  ensureBackupsDir();
  const files = fs
    .readdirSync(BACKUPS_DIR)
    .filter((f) => f.endsWith('.meta.json'))
    .sort()
    .reverse();

  return files.slice(0, 15).map((metaFile) => {
    try {
      return JSON.parse(fs.readFileSync(path.join(BACKUPS_DIR, metaFile), 'utf8'));
    } catch {
      return null;
    }
  }).filter(Boolean);
}

export function verifyEncryptedBackup(fileName) {
  ensureBackupsDir();
  if (!/^[a-zA-Z0-9._-]+\.db\.enc$/.test(fileName)) {
    throw new Error('Invalid backup filename.');
  }
  const encPath = path.join(BACKUPS_DIR, fileName);
  const metaPath = path.join(BACKUPS_DIR, `${fileName}.meta.json`);

  if (!fs.existsSync(encPath) || !fs.existsSync(metaPath)) {
    throw new Error('Backup or manifest file not found.');
  }

  const manifest = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  const encryptedBytes = fs.readFileSync(encPath);
  const actualCipherSha = crypto.createHash('sha256').update(encryptedBytes).digest('hex');

  if (actualCipherSha !== manifest.ciphertextSha256) {
    return { valid: false, fileName, reason: 'Ciphertext SHA-256 mismatch (disk corruption or tampering).' };
  }

  const aadContext = `crest-db-backup-v1:${fileName}`;
  const decrypted = decryptBackupBinary(encryptedBytes, aadContext);
  const actualPlainSha = crypto.createHash('sha256').update(decrypted).digest('hex');

  if (actualPlainSha !== manifest.plaintextSha256) {
    return { valid: false, fileName, reason: 'Decrypted plaintext SHA-256 mismatch.' };
  }

  // Verify SQLite magic header ("SQLite format 3\0")
  const sqliteHeader = decrypted.subarray(0, 16).toString('utf8');
  if (sqliteHeader !== 'SQLite format 3\0') {
    return { valid: false, fileName, reason: 'Decrypted payload is not a valid SQLite 3 database.' };
  }

  return {
    valid: true,
    fileName,
    decryptedBytes: decrypted.length,
    verifiedAt: new Date().toISOString()
  };
}

// CLI execution support
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const cmd = process.argv[2] || 'create';
  if (cmd === 'create') {
    const manifest = createEncryptedDbBackup();
    console.log('[CREST BACKUP] AES-256-GCM encrypted backup created:', manifest.fileName);
    console.log('[CREST BACKUP] Ciphertext SHA-256:', manifest.ciphertextSha256);
    const check = verifyEncryptedBackup(manifest.fileName);
    console.log('[CREST BACKUP] Immediate AEAD decrypt verification:', check.valid ? 'PASSED' : 'FAILED');
    if (!check.valid) process.exit(1);
  } else if (cmd === 'verify') {
    const backups = listEncryptedBackups();
    if (backups.length === 0) {
      console.log('[CREST BACKUP] No backups found. Run `npm run backup:create` first.');
      process.exit(0);
    }
    for (const b of backups) {
      const check = verifyEncryptedBackup(b.fileName);
      console.log(`  [${check.valid ? 'PASS' : 'FAIL'}] ${b.fileName} (${check.valid ? `${check.decryptedBytes}B SQLite3 verified` : check.reason})`);
      if (!check.valid) process.exitCode = 1;
    }
  }
}
