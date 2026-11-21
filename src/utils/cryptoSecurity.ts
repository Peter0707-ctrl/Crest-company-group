/**
 * ============================================================================
 * CREST GROUP CLIENT-SIDE CRYPTOGRAPHIC UTILITIES
 *
 * SECURITY ARCHITECTURE NOTICE:
 * Authentication, Argon2id+pepper password verification, AES-256-GCM PII
 * encryption, IP rate limiting, and HttpOnly session cookies are enforced
 * EXCLUSIVELY on the backend server (server/). Never store passwords, hashes,
 * or auth trust flags in browser localStorage/sessionStorage.
 * ============================================================================
 */

const textEncoder = new TextEncoder();

/**
 * Constant-Time String Comparison (side-channel resistant).
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Generate cryptographically secure random hex entropy via WebCrypto CSPRNG.
 */
export function generateSecureToken(byteLength = 32): string {
  const array = new Uint8Array(byteLength);
  window.crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * SHA-256 Content Fingerprinting via native WebCrypto SubtleCrypto.
 */
export async function computeSHA256Hash(message: string): Promise<string> {
  const data = textEncoder.encode(message);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Truthful runtime transport security check (never fakes TLS on plain HTTP).
 */
export function isHttpsTransport(): boolean {
  return typeof window !== 'undefined' && window.location.protocol === 'https:';
}
