/**
 * ============================================================================
 * SERVER-SIDE INPUT VALIDATION & PROTOTYPE POLLUTION DEFENSE
 * Compliant with OWASP ASVS 4.0 (V5: Validation, Sanitization & Encoding)
 * ============================================================================
 */

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const PHONE_REGEX = /^[0-9+\s().-]{7,25}$/;
const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Recursively strips prototype pollution keys from parsed JSON.
 */
export function stripDangerousKeys(value) {
  if (Array.isArray(value)) {
    return value.map((item) => stripDangerousKeys(item));
  }
  if (value !== null && typeof value === 'object') {
    const clean = Object.create(null);
    for (const [k, v] of Object.entries(value)) {
      if (DANGEROUS_KEYS.has(k)) continue;
      clean[k] = stripDangerousKeys(v);
    }
    return { ...clean };
  }
  return value;
}

/**
 * Clean plain text input: strips null/control bytes, dangerous tags, inline handlers,
 * and executable URI schemes using fixed-point iteration so nested obfuscation
 * (e.g. <scr<script>ipt>) cannot survive, WITHOUT corrupting safe punctuation (&, /, ').
 */
export function cleanText(input, maxLength = 500) {
  if (typeof input !== 'string') return '';
  let current = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  for (let pass = 0; pass < 5; pass++) {
    const next = current
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/<\/?[a-z][^>]*>/gi, '')
      .replace(/\bon\w+\s*=/gi, '')
      .replace(/(?:javascript|vbscript|data\s*:\s*text\/html)\s*:/gi, '');
    if (next === current) break;
    current = next;
  }

  return current.trim().slice(0, maxLength);
}

export function requireText(input, fieldName, minLen = 1, maxLen = 500) {
  const cleaned = cleanText(input, maxLen);
  if (cleaned.length < minLen) {
    throw new ValidationError(`${fieldName} is required (minimum ${minLen} characters).`);
  }
  return cleaned;
}

export function validateEmail(input) {
  if (typeof input !== 'string') {
    throw new ValidationError('A valid email address is required.');
  }
  const normalized = input.trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalized) || normalized.length > 254) {
    throw new ValidationError('Invalid email address format.');
  }
  return normalized;
}

export function validatePhone(input) {
  if (typeof input !== 'string') {
    throw new ValidationError('A valid phone number is required.');
  }
  const normalized = input.trim();
  if (!PHONE_REGEX.test(normalized)) {
    throw new ValidationError('Invalid phone number format (use 7-25 digits/symbols).');
  }
  return normalized;
}

export function validateOptionalUrl(input, maxLen = 300) {
  const cleaned = cleanText(input || '', maxLen);
  if (!cleaned) return '';
  if (/^(?:javascript|vbscript|data|file):/i.test(cleaned)) {
    throw new ValidationError('Unsafe URL protocol rejected.');
  }
  if (/^https?:\/\//i.test(cleaned)) {
    try {
      const parsed = new URL(cleaned);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new ValidationError('Only http(s) URLs are allowed.');
      }
      return parsed.toString().slice(0, maxLen);
    } catch {
      throw new ValidationError('Invalid portfolio/profile URL format.');
    }
  }
  return cleaned;
}

export function validateEnum(value, allowedList, fieldName) {
  if (!allowedList.includes(value)) {
    throw new ValidationError(`Invalid value for ${fieldName}.`);
  }
  return value;
}

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

export const INQUIRY_STATUSES = ['New', 'In Review', 'Quoted', 'Resolved'];
export const PARTNERSHIP_STATUSES = ['Pending Review', 'Executive Committee', 'Approved', 'Archived'];
export const PARTNERSHIP_TYPES = [
  'Strategic Collaboration',
  'Joint Venture',
  'Equity / Project Investment',
  'Distribution & Supply Chain',
  'Technology Integration'
];
export const PRODUCT_CATEGORIES = [
  'AI & Automation',
  'Enterprise & POS',
  'EdTech',
  'Logistics Marketplace',
  'Cloud & Infrastructure',
  'Consumer Goods'
];
export const PROJECT_CATEGORIES = [
  'Technology & AI',
  'Logistics & Mobility',
  'Foods & Beverages',
  'Real Estate',
  'Agribusiness & Education'
];
export const NEWS_CATEGORIES = [
  'Corporate Announcement',
  'Product Launch',
  'Technology & AI',
  'Strategic Partnership',
  'Industry Insight'
];

export function validateInquiryPayload(body) {
  // Honeypot anti-bot field check
  if (body.website_hp && String(body.website_hp).trim().length > 0) {
    throw new ValidationError('Automated submission rejected.');
  }
  return {
    fullName: requireText(body.fullName, 'Full Name', 2, 120),
    organization: cleanText(body.organization || 'Private Client', 160) || 'Private Client',
    email: validateEmail(body.email),
    phone: validatePhone(body.phone),
    division: requireText(body.division, 'Division', 2, 120),
    serviceOrProduct: cleanText(body.serviceOrProduct || 'General Corporate Consultation', 180) || 'General Corporate Consultation',
    budgetRange: cleanText(body.budgetRange || 'To Be Determined', 80) || 'To Be Determined',
    message: requireText(body.message, 'Inquiry Details', 5, 2500)
  };
}

export function validatePartnershipPayload(body) {
  if (body.website_hp && String(body.website_hp).trim().length > 0) {
    throw new ValidationError('Automated submission rejected.');
  }
  return {
    organizationName: requireText(body.organizationName, 'Organization Name', 2, 160),
    contactPerson: requireText(body.contactPerson, 'Contact Person', 2, 120),
    email: validateEmail(body.email),
    phone: validatePhone(body.phone),
    partnershipType: validateEnum(body.partnershipType, PARTNERSHIP_TYPES, 'Partnership Model'),
    targetDivision: requireText(body.targetDivision, 'Target Division', 2, 120),
    investmentCapacity: cleanText(body.investmentCapacity || 'Commercial Alliance', 100),
    proposalSummary: requireText(body.proposalSummary, 'Proposal Summary', 10, 3000)
  };
}

export function validateApplicationPayload(body) {
  if (body.website_hp && String(body.website_hp).trim().length > 0) {
    throw new ValidationError('Automated submission rejected.');
  }
  return {
    jobId: requireText(body.jobId, 'Job ID', 1, 60),
    jobTitle: requireText(body.jobTitle, 'Job Title', 2, 180),
    applicantName: requireText(body.applicantName, 'Applicant Name', 2, 120),
    email: validateEmail(body.email),
    phone: validatePhone(body.phone),
    portfolioOrLinkedin: validateOptionalUrl(body.portfolioOrLinkedin, 300),
    experienceYears: cleanText(body.experienceYears || 'Not Specified', 60),
    coverNote: requireText(body.coverNote, 'Cover Note', 10, 3000)
  };
}
