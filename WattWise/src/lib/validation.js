/**
 * Client-side validation rules for WattWise.
 *
 * Design notes
 * ------------
 * Email is checked structurally rather than with one catch-all regex. A single
 * regex can only answer "valid / invalid"; splitting the address into local part
 * and domain lets us tell the user *which* part is wrong ("add the part after
 * the @", "that domain is missing a .com") which is far more useful than a
 * generic "invalid email".
 *
 * The rules follow the practical subset of RFC 5321/5322 that real sign-up
 * forms accept: total length <= 254, local part <= 64, at least two domain
 * labels, and an alphabetic top-level domain of two or more characters. Quoted
 * local parts ("john doe"@example.com) and IP-literal domains are deliberately
 * rejected — they are legal but never used by the venue staff this product is
 * for, and accepting them would let obvious typos through.
 *
 * Everything here runs in the browser; there is no server to validate against,
 * so these checks are about catching honest mistakes early, not about security.
 */

/* ------------------------------------------------------------------ *
 * Email
 * ------------------------------------------------------------------ */

const MAX_EMAIL_LENGTH = 254;
const MAX_LOCAL_LENGTH = 64;
const MAX_LABEL_LENGTH = 63;

/** Characters RFC 5322 allows unquoted in the local part. */
const LOCAL_PART_CHARS = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
const DOMAIN_LABEL = /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/;
const TLD = /^[A-Za-z]{2,}$/;

/** Domains and TLDs we can confidently offer a correction for. */
const KNOWN_DOMAINS = [
  'gmail.com',
  'googlemail.com',
  'outlook.com',
  'hotmail.com',
  'hotmail.co.uk',
  'live.com',
  'yahoo.com',
  'yahoo.co.uk',
  'icloud.com',
  'me.com',
  'aol.com',
  'protonmail.com',
  'proton.me',
  'nhs.net',
  'brunel.ac.uk',
];

const KNOWN_TLDS = ['com', 'org', 'net', 'co.uk', 'org.uk', 'ac.uk', 'gov.uk', 'edu'];

/** Levenshtein distance, capped early so we never scan long strings needlessly. */
function editDistance(a, b, max = 2) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + cost,
      );
      rowMin = Math.min(rowMin, current[j]);
    }
    if (rowMin > max) return max + 1;
    previous = current;
  }
  return previous[b.length];
}

/**
 * Looks for a near-miss against a well-known domain. Returns the suggestion as
 * a *warning* only — we never block on it, because plenty of venues run their
 * own mail domain that happens to look like a typo of a big provider.
 */
function suggestDomain(domain) {
  const lower = domain.toLowerCase();
  if (KNOWN_DOMAINS.includes(lower)) return null;

  for (const candidate of KNOWN_DOMAINS) {
    if (editDistance(lower, candidate) <= 2) return candidate;
  }

  // The domain name itself is fine but the TLD looks mistyped (".con", ".cmo").
  const firstDot = lower.indexOf('.');
  if (firstDot > 0) {
    const name = lower.slice(0, firstDot);
    const tail = lower.slice(firstDot + 1);
    for (const candidate of KNOWN_TLDS) {
      if (tail !== candidate && editDistance(tail, candidate, 1) === 1) {
        return `${name}.${candidate}`;
      }
    }
  }

  return null;
}

/**
 * @returns {{valid: boolean, error?: string, warning?: string, suggestion?: string, value?: string}}
 */
export function validateEmail(input, { required = true, label = 'email' } = {}) {
  const raw = String(input ?? '');
  const value = raw.trim();

  if (!value) {
    return required
      ? { valid: false, error: `Enter your ${label}.` }
      : { valid: true, value: '' };
  }

  if (/\s/.test(value)) {
    return { valid: false, error: 'An email address cannot contain spaces.' };
  }

  if (value.length > MAX_EMAIL_LENGTH) {
    return { valid: false, error: 'That email address is too long.' };
  }

  const atCount = (value.match(/@/g) || []).length;
  if (atCount === 0) {
    return { valid: false, error: 'Add an @ — for example name@yourvenue.org' };
  }
  if (atCount > 1) {
    return { valid: false, error: 'An email address can only contain one @.' };
  }

  const [local, domain] = value.split('@');

  /* Local part ---------------------------------------------------- */
  if (!local) {
    return { valid: false, error: 'Add the part before the @.' };
  }
  if (local.length > MAX_LOCAL_LENGTH) {
    return { valid: false, error: 'The part before the @ is too long.' };
  }
  if (!LOCAL_PART_CHARS.test(local)) {
    return {
      valid: false,
      error: 'The part before the @ contains a character that is not allowed.',
    };
  }
  if (local.startsWith('.') || local.endsWith('.')) {
    return { valid: false, error: 'The part before the @ cannot start or end with a dot.' };
  }
  if (local.includes('..')) {
    return { valid: false, error: 'The part before the @ cannot contain two dots in a row.' };
  }

  /* Domain -------------------------------------------------------- */
  if (!domain) {
    return { valid: false, error: 'Add the domain after the @ — for example yourvenue.org' };
  }
  if (domain.startsWith('.') || domain.endsWith('.')) {
    return { valid: false, error: 'The domain cannot start or end with a dot.' };
  }
  if (domain.includes('..')) {
    return { valid: false, error: 'The domain cannot contain two dots in a row.' };
  }

  const labels = domain.split('.');
  if (labels.length < 2) {
    return {
      valid: false,
      error: 'The domain needs a dot — for example .org, .com or .co.uk',
    };
  }
  for (const part of labels) {
    if (!part) {
      return { valid: false, error: 'That domain is not complete.' };
    }
    if (part.length > MAX_LABEL_LENGTH) {
      return { valid: false, error: 'Part of that domain is too long.' };
    }
    if (!DOMAIN_LABEL.test(part)) {
      return {
        valid: false,
        error: 'The domain can only use letters, numbers and hyphens.',
      };
    }
  }

  const tld = labels[labels.length - 1];
  if (!TLD.test(tld)) {
    return {
      valid: false,
      error: 'The domain must end in letters — for example .org, .com or .co.uk',
    };
  }

  const suggestion = suggestDomain(domain);
  if (suggestion) {
    return {
      valid: true,
      value: value.toLowerCase(),
      warning: `Did you mean ${local}@${suggestion}?`,
      suggestion: `${local}@${suggestion}`,
    };
  }

  return { valid: true, value: value.toLowerCase() };
}

/**
 * Sign-in accepts either an email or a venue ID, so we only apply the full
 * email rules once the user has typed an @ — otherwise we'd reject valid IDs.
 */
export function validateVenueIdOrEmail(input) {
  const value = String(input ?? '').trim();

  if (!value) return { valid: false, error: 'Enter your venue ID or email address.' };

  if (value.includes('@')) {
    return validateEmail(value, { label: 'email address' });
  }

  if (value.length < 3) {
    return { valid: false, error: 'A venue ID is at least 3 characters.' };
  }
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value)) {
    return {
      valid: false,
      error: 'A venue ID can only use letters, numbers, dots, hyphens and underscores.',
    };
  }

  return { valid: true, value };
}

/* ------------------------------------------------------------------ *
 * Password
 * ------------------------------------------------------------------ */

const COMMON_PASSWORDS = new Set([
  'password', 'password1', 'password123', '12345678', '123456789', 'qwertyui',
  'qwerty123', 'letmein1', 'welcome1', 'iloveyou', 'admin123', 'abc12345',
  'football', 'monkey12', 'sunshine', 'princess', 'wattwise', 'wattwise1',
]);

/** The individual rules, so the UI can show a live checklist. */
export const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { id: 'case', label: 'Upper and lower case', test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { id: 'number', label: 'A number', test: (v) => /\d/.test(v) },
  { id: 'symbol', label: 'A symbol', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export function passwordStrength(input) {
  const value = String(input ?? '');
  const met = PASSWORD_RULES.filter((rule) => rule.test(value)).map((rule) => rule.id);

  let score = met.length;
  if (value.length >= 12) score += 1;
  if (COMMON_PASSWORDS.has(value.toLowerCase())) score = Math.min(score, 1);

  const levels = [
    { label: 'Too short', tone: 'weak' },
    { label: 'Weak', tone: 'weak' },
    { label: 'Fair', tone: 'fair' },
    { label: 'Good', tone: 'good' },
    { label: 'Strong', tone: 'strong' },
    { label: 'Strong', tone: 'strong' },
  ];

  return { score, met, max: 5, ...levels[Math.min(score, levels.length - 1)] };
}

export function validatePassword(input, { minLength = 8 } = {}) {
  const value = String(input ?? '');

  if (!value) return { valid: false, error: 'Choose a password.' };
  if (value.length < minLength) {
    return { valid: false, error: `Password must be at least ${minLength} characters` };
  }
  if (/\s$/.test(value) || /^\s/.test(value)) {
    return { valid: false, error: 'Password cannot start or end with a space.' };
  }
  if (COMMON_PASSWORDS.has(value.toLowerCase())) {
    return { valid: false, error: 'That password is too common — choose something harder to guess.' };
  }

  const strength = passwordStrength(value);
  if (strength.score < 3) {
    return {
      valid: true,
      value,
      warning: 'Add a number, a symbol or a capital letter to make this stronger.',
    };
  }

  return { valid: true, value };
}

/* ------------------------------------------------------------------ *
 * Other fields
 * ------------------------------------------------------------------ */

export function validateRequired(input, label) {
  const value = String(input ?? '').trim();
  if (!value) return { valid: false, error: `Enter ${label}.` };
  return { valid: true, value };
}

export function validateName(input, label = 'your full name') {
  const value = String(input ?? '').trim();
  if (!value) return { valid: false, error: `Enter ${label}.` };
  if (value.length < 2) return { valid: false, error: 'That name looks too short.' };
  if (value.length > 70) return { valid: false, error: 'That name is too long.' };
  if (!/^[\p{L}\p{M}][\p{L}\p{M}'’. -]*$/u.test(value)) {
    return { valid: false, error: 'A name can only use letters, spaces, apostrophes and hyphens.' };
  }
  return { valid: true, value };
}

/** UK numbers, the only ones this product's venues use. Optional by default. */
export function validatePhone(input, { required = false } = {}) {
  const raw = String(input ?? '').trim();
  if (!raw) {
    return required ? { valid: false, error: 'Enter a phone number.' } : { valid: true, value: '' };
  }

  const digits = raw.replace(/[\s()-]/g, '');
  if (!/^(\+44|0)\d{9,10}$/.test(digits)) {
    return {
      valid: false,
      error: 'Enter a UK number — for example 07700 900000 or +44 7700 900000.',
    };
  }
  return { valid: true, value: raw };
}

/**
 * Numeric fields in the device form. `integer` is used for quantity, where a
 * fractional device makes no sense.
 */
export function validateNumber(
  input,
  { label, min = 0, max = Number.MAX_SAFE_INTEGER, integer = false, exclusiveMin = true } = {},
) {
  const raw = String(input ?? '').trim();
  if (!raw) return { valid: false, error: `Enter ${label}.` };

  const number = Number(raw);
  if (!Number.isFinite(number)) return { valid: false, error: `${label} must be a number.` };
  if (integer && !Number.isInteger(number)) {
    return { valid: false, error: `${label} must be a whole number.` };
  }
  if (exclusiveMin ? number <= min : number < min) {
    return {
      valid: false,
      error: exclusiveMin
        ? `${label} must be greater than ${min}.`
        : `${label} must be at least ${min}.`,
    };
  }
  if (number > max) return { valid: false, error: `${label} cannot be more than ${max}.` };

  return { valid: true, value: number };
}

/** Device names must be unique so the overview and plan stay unambiguous. */
export function validateDeviceName(input, devices, editingId) {
  const value = String(input ?? '').trim();

  if (!value) return { valid: false, error: 'Enter a device name.' };
  if (value.length < 2) return { valid: false, error: 'That name looks too short.' };
  if (value.length > 48) return { valid: false, error: 'Keep device names under 48 characters.' };

  const clash = devices.find(
    (device) =>
      device.id !== editingId &&
      device.name.trim().toLowerCase() === value.toLowerCase(),
  );
  if (clash) {
    return { valid: false, error: `You already have a device called “${clash.name}”.` };
  }

  return { valid: true, value };
}
