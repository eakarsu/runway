const test = require('node:test');
const assert = require('node:assert/strict');
process.env.DATABASE_URL ||= 'postgresql://test:test@127.0.0.1:5432/runway_unit_test';
const { eventHash, verifyAudit } = require('../lib/audit');

test('audit verification accepts a canonical hash chain and rejects tampering', () => {
  const createdAt = new Date('2026-07-20T12:00:00.000Z');
  const first = { projectId: 1, actorId: 2, sequence: 1, action: 'PROJECT_CREATED', payload: { b: 2, a: 1 }, previousHash: 'GENESIS', createdAt };
  const normalizedFirst = { ...first };
  delete normalizedFirst.hash;
  delete normalizedFirst.createdAt;
  normalizedFirst.occurredAt = createdAt.toISOString();
  first.hash = eventHash(normalizedFirst);
  const second = { projectId: 1, actorId: 2, sequence: 2, action: 'PROJECT_APPROVED', payload: { version: 0 }, previousHash: first.hash, createdAt };
  const normalizedSecond = { ...second };
  delete normalizedSecond.createdAt;
  normalizedSecond.occurredAt = createdAt.toISOString();
  second.hash = eventHash(normalizedSecond);
  assert.equal(verifyAudit([first, second]), true);
  second.payload.version = 9;
  assert.equal(verifyAudit([first, second]), false);
});
