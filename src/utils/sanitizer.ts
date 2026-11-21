/**
 * ============================================================================
 * FRONTEND INPUT SANITIZATION & VALIDATION ENGINE
 * Defends against XSS payloads, Prototype Pollution, and Malformed Inputs.
 * Compliant with OWASP ASVS 4.0 (V5) & CWE-79.
 *
 * NOTE: React automatically HTML-encodes JSX text nodes. Therefore sanitizeText()
 * strips dangerous tags/handlers/protocols WITHOUT HTML-entity-encoding safe
 * characters like "&" or "/", preventing double-escaping and broken image URLs.
 * ============================================================================
 */

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const PHONE_CHARS_REGEX = /^[0-9+\s().-]{7,25}$/;
const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Sanitizes plain text for React state and API transport without corrupting URLs
 * or causing React double-escaping (&amp;amp;).
 */
export function sanitizeText(input: unknown, maxLength = 3000): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<\/?[a-z][^>]*>/gi, '')
    .replace(/\bon\w+\s*=/gi, '')
    .replace(/(?:javascript|vbscript|data\s*:\s*text\/html)\s*:/gi, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Explicit HTML entity escaper (for non-React raw HTML contexts only).
 */
export function escapeHtml(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Validates and normalizes email addresses.
 */
export function validateAndSanitizeEmail(email: unknown): string {
  if (typeof email !== 'string') {
    throw new Error('Please enter a valid email address.');
  }
  const cleanEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(cleanEmail) || cleanEmail.length > 254) {
    throw new Error('Invalid email address format.');
  }
  return cleanEmail;
}

/**
 * Validates and normalizes international phone numbers.
 */
export function validateAndSanitizePhone(phone: unknown): string {
  if (typeof phone !== 'string') {
    throw new Error('Please enter a valid phone number.');
  }
  const cleanPhone = phone.trim();
  if (!PHONE_CHARS_REGEX.test(cleanPhone)) {
    throw new Error('Invalid phone number format (7-25 digits/symbols, e.g. +255 779 304 500).');
  }
  return cleanPhone;
}

/**
 * Validates external URLs, rejecting javascript:, data:, vbscript:, and file: schemes.
 */
export function sanitizeSafeUrl(url: unknown): string {
  if (typeof url !== 'string') {
    return '';
  }
  const trimmed = url.trim();
  if (!trimmed) return '';
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    throw new Error('Unsafe URL protocol rejected.');
  }
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error('Only http(s) URLs are allowed.');
      }
      return parsed.toString();
    } catch {
      throw new Error('Please enter a valid URL starting with https:// or http://.');
    }
  }
  return sanitizeText(trimmed, 300);
}

/**
 * Client-side mirror of NIST SP 800-63B password policy (enforced authoritatively on server).
 */
export function validateStrongPassword(password: string): { valid: boolean; reason?: string } {
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
      reason: 'Must include uppercase, lowercase, a number, and a special symbol.'
    };
  }
  return { valid: true };
}

/**
 * Recursively sanitizes arrays and objects while preserving Array structure
 * and stripping prototype-pollution keys (__proto__, constructor, prototype).
 */
export function deepSanitizePayload<T>(value: T): T {
  if (typeof value === 'string') {
    return sanitizeText(value) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => deepSanitizePayload(item)) as unknown as T;
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (DANGEROUS_KEYS.has(key)) {
        continue;
      }
      result[key] = deepSanitizePayload(val);
    }
    return result as T;
  }
  return value;
}
