const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { validateRuntime } = require('../config/runtime');

const root = path.join(__dirname, '..', '..');

function withEnvironment(values, action) {
  const original = {};
  for (const [key, value] of Object.entries(values)) {
    original[key] = process.env[key];
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
  try { return action(); }
  finally {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
}

test('runtime configuration rejects weak secrets, wildcard origins, non-PostgreSQL URLs, and invalid ports', () => {
  const base = { DATABASE_URL: 'postgresql://user:pass@127.0.0.1/runway', JWT_SECRET: 'runtime-secret-longer-than-thirty-two-characters', CORS_ORIGIN: 'http://127.0.0.1:5173', SERVER_PORT: '3001' };
  assert.equal(withEnvironment(base, () => validateRuntime()).serverPort, 3001);
  for (const override of [
    { JWT_SECRET: 'replace-with-a-secret-that-is-long-enough' },
    { CORS_ORIGIN: '*' },
    { DATABASE_URL: 'sqlite://local.db' },
    { SERVER_PORT: '70000' },
  ]) assert.throws(() => withEnvironment({ ...base, ...override }, () => validateRuntime()));
});

test('startup is prepared-artifact only and checks migrations without mutating them', () => {
  const launcher = fs.readFileSync(path.join(root, 'start.sh'), 'utf8');
  const index = fs.readFileSync(path.join(root, 'server/index.js'), 'utf8');
  for (const forbidden of ['npm install', 'npm ci', 'npm run build', 'kill -9', 'pkill', 'rm -rf', 'sync({ alter', 'sync({ force', 'seed.js']) {
    assert.equal(launcher.includes(forbidden), false, forbidden);
    assert.equal(index.includes(forbidden), false, forbidden);
  }
  assert.match(index, /migrate\(\{ checkOnly: true \}\)/);
  assert.match(launcher, /refusing to stop an unrelated process/);
});

test('prototype routes are disabled unless the operator explicitly opts in', () => {
  const app = fs.readFileSync(path.join(root, 'server/app.js'), 'utf8');
  assert.match(app, /ENABLE_PROTOTYPE_ROUTES === 'true'/);
  assert.match(app, /PROTOTYPE_DISABLED/);
  assert.match(app, /private-project-review-version-and-export/);
});
