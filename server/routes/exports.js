const express = require('express');
const sequelize = require('../config/database');
const { Export, Project } = require('../models');
const authenticate = require('../middleware/auth');
const { appendAudit } = require('../lib/audit');
const { submitExport, ExportProviderError } = require('../lib/exportProvider');
const { InputError, integerId, text, choice, safeError } = require('../lib/validation');

const router = express.Router();
router.use(authenticate);

function respondError(res, error) {
  const safe = safeError(error);
  if (safe.status === 500) console.error(error);
  return res.status(safe.status).json(safe.body);
}

async function ownedProject(projectId, userId, transaction, lock = false) {
  const project = await Project.findOne({
    where: { id: integerId(projectId, 'project id'), userId },
    transaction,
    lock: lock ? transaction.LOCK.UPDATE : undefined,
  });
  if (!project) throw new InputError('Project not found', 404, 'NOT_FOUND');
  return project;
}

async function ownedExport(exportId, userId, transaction, lock = false) {
  const record = await Export.findOne({
    where: { id: integerId(exportId, 'export id'), userId },
    transaction,
    lock: lock ? transaction.LOCK.UPDATE : undefined,
  });
  if (!record) throw new InputError('Export not found', 404, 'NOT_FOUND');
  return record;
}

router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const { count, rows } = await Export.findAndCountAll({
      where: { userId: req.user.id },
      limit,
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']],
    });
    res.json({ data: rows, total: count, page, totalPages: Math.ceil(count / limit) });
  } catch (error) { respondError(res, error); }
});

router.get('/:id', async (req, res) => {
  try { res.json(await ownedExport(req.params.id, req.user.id)); }
  catch (error) { respondError(res, error); }
});

router.post('/', async (req, res) => {
  try {
    const idempotencyKey = text(req.get('idempotency-key'), 'Idempotency-Key header', { min: 16, max: 200 });
    const input = {
      name: text(req.body?.name, 'name', { max: 200 }),
      format: choice(req.body?.format, 'format', ['mp4', 'mov', 'webm'], 'mp4'),
      resolution: choice(req.body?.resolution, 'resolution', ['720p', '1080p', '4k'], '1080p'),
    };
    const result = await sequelize.transaction(async (transaction) => {
      const existing = await Export.findOne({ where: { userId: req.user.id, idempotencyKey }, transaction, lock: transaction.LOCK.UPDATE });
      if (existing) return { record: existing, created: false };
      const project = await ownedProject(req.body?.projectId, req.user.id, transaction, true);
      if (project.status === 'archived') throw new InputError('Archived projects cannot be exported', 409, 'PROJECT_ARCHIVED');
      if (project.reviewStatus !== 'approved') throw new InputError('Human approval is required before export', 409, 'REVIEW_REQUIRED');
      const record = await Export.create({
        ...input,
        projectId: project.id,
        projectVersion: project.version,
        userId: req.user.id,
        idempotencyKey,
        status: 'pending',
      }, { transaction });
      await appendAudit({ projectId: project.id, actorId: req.user.id, action: 'EXPORT_REQUESTED', payload: { exportId: record.id, projectVersion: project.version, format: record.format, resolution: record.resolution }, transaction });
      return { record, created: true };
    });
    res.status(result.created ? 201 : 200).json(result.record);
  } catch (error) { respondError(res, error); }
});

router.post('/:id/submit', async (req, res) => {
  let record;
  let project;
  try {
    ({ record, project } = await sequelize.transaction(async (transaction) => {
      const current = await ownedExport(req.params.id, req.user.id, transaction, true);
      const owned = await ownedProject(current.projectId, req.user.id, transaction, true);
      if (current.status === 'submitted') return { record: current, project: owned, alreadySubmitted: true };
      if (current.status === 'submitting') throw new InputError('Export submission is already in progress', 409, 'SUBMISSION_IN_PROGRESS');
      if (current.nextRetryAt && current.nextRetryAt > new Date()) throw new InputError('Export retry is not due yet', 429, 'RETRY_NOT_DUE');
      if (owned.reviewStatus !== 'approved' || owned.version !== current.projectVersion) throw new InputError('Project approval is stale; create a new export after review', 409, 'STALE_APPROVAL');
      await current.update({ status: 'submitting', attempts: current.attempts + 1, lastError: null, nextRetryAt: null }, { transaction });
      await appendAudit({ projectId: owned.id, actorId: req.user.id, action: 'EXPORT_SUBMISSION_STARTED', payload: { exportId: current.id, attempt: current.attempts }, transaction });
      return { record: current, project: owned, alreadySubmitted: false };
    }));
    if (record.status === 'submitted') return res.json(record);

    const evidence = await submitExport({
      idempotencyKey: record.idempotencyKey,
      exportId: record.id,
      projectId: project.id,
      projectVersion: record.projectVersion,
      name: record.name,
      format: record.format,
      resolution: record.resolution,
    });
    const submitted = await sequelize.transaction(async (transaction) => {
      const current = await ownedExport(record.id, req.user.id, transaction, true);
      await current.update({ status: 'submitted', provider: evidence.provider, providerReference: evidence.reference, lastError: null, nextRetryAt: null }, { transaction });
      await appendAudit({ projectId: project.id, actorId: req.user.id, action: 'EXPORT_SUBMITTED', payload: { exportId: current.id, provider: evidence.provider, providerReference: evidence.reference }, transaction });
      return current;
    });
    res.json(submitted);
  } catch (error) {
    if (record && error instanceof ExportProviderError) {
      const retryAt = new Date(Date.now() + error.retryAfterSeconds * 1000);
      await sequelize.transaction(async (transaction) => {
        const current = await ownedExport(record.id, req.user.id, transaction, true);
        await current.update({ status: 'failed', lastError: error.message, nextRetryAt: retryAt }, { transaction });
        await appendAudit({ projectId: project.id, actorId: req.user.id, action: 'EXPORT_SUBMISSION_FAILED', payload: { exportId: current.id, attempt: current.attempts, retryAt: retryAt.toISOString(), reason: error.message }, transaction });
      }).catch((persistenceError) => console.error('Could not persist export failure', persistenceError));
      return res.status(error.status).json({ error: error.message, code: 'PROVIDER_FAILURE', retryAt: retryAt.toISOString() });
    }
    return respondError(res, error);
  }
});

router.put('/:id', (req, res) => res.status(405).json({ error: 'Export state is workflow-controlled', code: 'WORKFLOW_CONTROLLED' }));
router.delete('/:id', (req, res) => res.status(405).json({ error: 'Exports are retained as audit evidence', code: 'RETENTION_REQUIRED' }));

module.exports = router;
