class InputError extends Error {
  constructor(message, status = 400, code = 'INVALID_INPUT') {
    super(message);
    this.name = 'InputError';
    this.status = status;
    this.code = code;
  }
}

function integerId(value, label = 'id') {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) throw new InputError(`${label} must be a positive integer`);
  return parsed;
}

function text(value, label, { min = 1, max = 5000, optional = false } = {}) {
  if ((value === undefined || value === null) && optional) return undefined;
  const normalized = String(value || '').trim();
  if (normalized.length < min || normalized.length > max) throw new InputError(`${label} must contain ${min}-${max} characters`);
  return normalized;
}

function choice(value, label, allowed, fallback) {
  const normalized = String(value ?? fallback ?? '').trim();
  if (!allowed.includes(normalized)) throw new InputError(`${label} must be one of: ${allowed.join(', ')}`);
  return normalized;
}

function expectedVersion(value) {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0) throw new InputError('version must be a non-negative integer');
  return parsed;
}

function safeError(error) {
  if (error instanceof InputError) return { status: error.status, body: { error: error.message, code: error.code } };
  return { status: 500, body: { error: 'Internal server error', code: 'INTERNAL_ERROR' } };
}

module.exports = { InputError, integerId, text, choice, expectedVersion, safeError };
