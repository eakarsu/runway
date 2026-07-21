const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (relative) => fs.readFileSync(path.join(__dirname, '..', relative), 'utf8');

test('JWT verification pins algorithm, issuer, and audience', () => {
  const source = read('middleware/auth.js');
  for (const value of ["algorithms: ['HS256']", "issuer: 'runway-api'", "audience: 'runway-client'"]) {
    assert.match(source, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('seed is explicitly gated and has no checked-in demo password', () => {
  const source = read('seed.js');
  assert.match(source, /ALLOW_DISPOSABLE_SEED/);
  assert.match(source, /DISPOSABLE_DATABASE_CONFIRMATION/);
  assert.match(source, /ALLOW_REMOTE_DISPOSABLE_SEED/);
  assert.match(source, /DROP TABLE IF EXISTS "SchemaMigrations"/);
  assert.match(source, /await migrate\(\)/);
  assert.match(source, /governed review is required before submission/);
  assert.doesNotMatch(source, /admin123/);
});
