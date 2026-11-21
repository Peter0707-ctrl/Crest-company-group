# Security Policy — CREST GROUP Corporate Ecosystem

## Supported Architecture & Cryptographic Controls

This repository implements defense-in-depth security controls aligned with **OWASP Top 10 (2024)**, **OWASP ASVS 4.0**, **RFC 9106**, **RFC 6238**, and **NIST SP 800-63B**:

| Security Layer | Implementation |
| :--- | :--- |
| **Password KDF** | Async **Argon2id** (`64 MiB` memory, `3` passes, `128-bit` CSPRNG salt) + RFC 9106 server-side HKDF-derived secret pepper + global concurrency cap |
| **Multi-Factor Auth (MFA)** | **RFC 6238 TOTP 2FA** with AES-256-GCM encrypted secrets & replay-attack protection |
| **PII Encryption at Rest** | **AES-256-GCM AEAD** (96-bit IV, 128-bit auth tag, record-bound AAD) in SQLite WAL (`secure_delete = ON`) |
| **Sessions & CSRF** | `HttpOnly; SameSite=Strict` (`Secure` under HTTPS) cookies, SHA-256 hashed server-side tokens, true 30m idle / 8h max expiry, `Sec-Fetch-Site` Fetch Metadata + Host allowlist + 256-bit Synchronizer CSRF tokens |
| **Brute-Force Defense** | Persistent SQLite dual rate limiting (per-IP & per-username) + anti-bot honeypots |
| **Audit Integrity** | Tamper-evident **HMAC-SHA256 hash chain** with live verification & mid-session IP anomaly alerts |
| **HTTP Security Headers** | Strict CSP (`script-src 'self'`, `font-src 'self'`, `frame-ancestors 'none'`), `X-Frame-Options: DENY`, `nosniff`, `Permissions-Policy`, `COOP`, `CORP`, `HSTS` |
| **Encrypted Backups** | AES-256-GCM authenticated SQLite snapshots with SHA-256 manifests (`npm run backup:create` / `verify`) |

## Reporting a Vulnerability

If you discover a security vulnerability in this repository or live infrastructure:

1. **Do NOT open a public GitHub issue.**
2. Email **security@crestgroup.co.tz** (or **info@crestgroup.co.tz**) with reproduction details and impact assessment.
3. We acknowledge reports within 24 hours and remediate confirmed issues promptly.

## Production Deployment Checklist

- Never commit `server/data/`, `server/backups/`, `.env`, `.secrets.env`, or `BOOTSTRAP_CREDENTIALS.txt`.
- Inject `CREST_MASTER_KEY` from a Secret Manager / KMS (see `.env.example`).
- Terminate TLS 1.3 + HSTS using `deploy/nginx.security.conf` (or native `TLS_CERT_PATH` / `TLS_KEY_PATH`) behind a WAF (e.g., Cloudflare).
- Rotate the first-boot executive password immediately and activate TOTP 2FA.
