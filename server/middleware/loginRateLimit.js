const attempts = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function key(req, email = '') {
  return `${req.ip || req.socket?.remoteAddress || 'unknown'}:${String(email).trim().toLowerCase()}`;
}

function cleanup(now) {
  for (const [entryKey, entry] of attempts) if (entry.resetAt <= now) attempts.delete(entryKey);
}

function checkLoginRate(req, res, next) {
  const now = Date.now();
  cleanup(now);
  const entry = attempts.get(key(req, req.body?.email));
  if (entry && entry.count >= MAX_ATTEMPTS) {
    res.set('Retry-After', String(Math.max(1, Math.ceil((entry.resetAt - now) / 1000))));
    return res.status(429).json({ error: 'Too many authentication attempts', code: 'RATE_LIMITED' });
  }
  next();
}

function recordLoginFailure(req, email) {
  const entryKey = key(req, email);
  const now = Date.now();
  const current = attempts.get(entryKey);
  attempts.set(entryKey, current && current.resetAt > now
    ? { count: current.count + 1, resetAt: current.resetAt }
    : { count: 1, resetAt: now + WINDOW_MS });
}

function clearLoginFailures(req, email) {
  attempts.delete(key(req, email));
}

module.exports = { checkLoginRate, recordLoginFailure, clearLoginFailures, _attempts: attempts };
