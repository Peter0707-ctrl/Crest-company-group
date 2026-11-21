/**
 * ============================================================================
 * REAL HTTP SECURITY RESPONSE HEADERS (OWASP Secure Headers Project)
 * Enforced at the HTTP transport layer — never relying on ignored <meta> tags.
 * ============================================================================
 */

export const PRODUCTION_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data: blob: https://images.unsplash.com",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'"
].join('; ');

/**
 * Only trusts X-Forwarded-Proto when TRUST_PROXY='true' (prevents header spoofing).
 */
export function isRequestHttps(req) {
  if (req.socket?.encrypted) return true;
  if (process.env.TRUST_PROXY === 'true') {
    const forwarded = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim().toLowerCase();
    return forwarded === 'https';
  }
  return false;
}

export function applySecurityHeaders(req, res, { isApi = true } = {}) {
  res.setHeader('Content-Security-Policy', PRODUCTION_CSP);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.removeHeader('X-Powered-By');

  if (isRequestHttps(req)) {
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }

  if (isApi) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
  }
}
