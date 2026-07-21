const test = require('node:test');
const assert = require('node:assert/strict');
const { integerId, text, choice, expectedVersion, InputError } = require('../lib/validation');

test('bounded workflow validation normalizes accepted values', () => {
  assert.equal(integerId('42'), 42);
  assert.equal(text('  reviewed  ', 'notes'), 'reviewed');
  assert.equal(choice(undefined, 'format', ['mp4', 'mov'], 'mp4'), 'mp4');
  assert.equal(expectedVersion(0), 0);
});

test('bounded workflow validation rejects identifiers, large text, choices, and versions', () => {
  for (const action of [
    () => integerId('../1'),
    () => text('x'.repeat(21), 'name', { max: 20 }),
    () => choice('exe', 'format', ['mp4']),
    () => expectedVersion(-1),
  ]) assert.throws(action, InputError);
});
