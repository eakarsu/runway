const crypto = require('node:crypto');
const { AuditEvent } = require('../models');

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function eventHash(event) {
  return crypto.createHash('sha256').update(canonical(event)).digest('hex');
}

async function appendAudit({ projectId, actorId, action, payload = {}, transaction }) {
  const previous = await AuditEvent.findOne({
    where: { projectId },
    order: [['sequence', 'DESC']],
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  const sequence = (previous?.sequence || 0) + 1;
  const previousHash = previous?.hash || 'GENESIS';
  const occurredAt = new Date();
  const hash = eventHash({ projectId, actorId, sequence, action, payload, previousHash, occurredAt: occurredAt.toISOString() });
  return AuditEvent.create({ projectId, actorId, sequence, action, payload, previousHash, hash, createdAt: occurredAt }, { transaction });
}

function verifyAudit(events) {
  let previousHash = 'GENESIS';
  for (const event of events) {
    const plain = event.toJSON ? event.toJSON() : event;
    const occurredAt = new Date(plain.createdAt).toISOString();
    const expected = eventHash({
      projectId: plain.projectId,
      actorId: plain.actorId,
      sequence: plain.sequence,
      action: plain.action,
      payload: plain.payload,
      previousHash,
      occurredAt,
    });
    if (plain.previousHash !== previousHash || plain.hash !== expected) return false;
    previousHash = plain.hash;
  }
  return true;
}

module.exports = { appendAudit, canonical, eventHash, verifyAudit };
