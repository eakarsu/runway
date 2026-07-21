const express = require('express');
const sequelize = require('../config/database');
const { Project, ProjectSnapshot, AuditEvent } = require('../models');
const authenticate = require('../middleware/auth');
const { appendAudit, verifyAudit } = require('../lib/audit');
const { InputError, integerId, text, choice, expectedVersion, safeError } = require('../lib/validation');

const router = express.Router();
router.use(authenticate);

function respondError(res, error) {
  const safe = safeError(error);
  if (safe.status === 500) console.error(error);
  return res.status(safe.status).json(safe.body);
}

async function ownedProject(id, userId, transaction, lock = false) {
  const project = await Project.findOne({
    where: { id: integerId(id, 'project id'), userId },
    transaction,
    lock: lock ? transaction.LOCK.UPDATE : undefined,
  });
  if (!project) throw new InputError('Project not found', 404, 'NOT_FOUND');
  return project;
}

async function snapshot(project, note, transaction) {
  const latest = await ProjectSnapshot.findOne({
    where: { projectId: project.id },
    order: [['versionNumber', 'DESC']],
    transaction,
  });
  return ProjectSnapshot.create({
    projectId: project.id,
    userId: project.userId,
    versionNumber: (latest?.versionNumber || 0) + 1,
    name: project.name,
    description: project.description,
    status: project.status,
    reviewStatus: project.reviewStatus,
    thumbnail: project.thumbnail,
    note,
  }, { transaction });
}

router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const { count, rows } = await Project.findAndCountAll({
      where: { userId: req.user.id },
      limit,
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']],
    });
    res.json({ data: rows, total: count, page, totalPages: Math.ceil(count / limit) });
  } catch (error) { respondError(res, error); }
});

router.get('/:id/audit', async (req, res) => {
  try {
    const project = await ownedProject(req.params.id, req.user.id);
    const events = await AuditEvent.findAll({ where: { projectId: project.id }, order: [['sequence', 'ASC']] });
    res.json({ data: events, validHashChain: verifyAudit(events) });
  } catch (error) { respondError(res, error); }
});

router.get('/:id', async (req, res) => {
  try { res.json(await ownedProject(req.params.id, req.user.id)); }
  catch (error) { respondError(res, error); }
});

router.post('/', async (req, res) => {
  try {
    const input = {
      name: text(req.body?.name, 'name', { max: 200 }),
      description: text(req.body?.description, 'description', { max: 5000, optional: true }),
      type: choice(req.body?.type, 'type', ['video', 'image', 'mixed'], 'video'),
      thumbnail: text(req.body?.thumbnail, 'thumbnail', { max: 2048, optional: true }),
    };
    const project = await sequelize.transaction(async (transaction) => {
      const created = await Project.create({ ...input, status: 'draft', reviewStatus: 'pending', version: 0, userId: req.user.id }, { transaction });
      await appendAudit({ projectId: created.id, actorId: req.user.id, action: 'PROJECT_CREATED', payload: { type: created.type }, transaction });
      return created;
    });
    res.status(201).json(project);
  } catch (error) { respondError(res, error); }
});

router.put('/:id', async (req, res) => {
  try {
    const version = expectedVersion(req.body?.version);
    const changes = {};
    if ('name' in req.body) changes.name = text(req.body.name, 'name', { max: 200 });
    if ('description' in req.body) changes.description = text(req.body.description, 'description', { max: 5000, optional: true }) ?? null;
    if ('type' in req.body) changes.type = choice(req.body.type, 'type', ['video', 'image', 'mixed']);
    if ('thumbnail' in req.body) changes.thumbnail = text(req.body.thumbnail, 'thumbnail', { max: 2048, optional: true }) ?? null;
    if ('status' in req.body) changes.status = choice(req.body.status, 'status', ['draft', 'active']);
    if (!Object.keys(changes).length) throw new InputError('At least one editable project field is required');

    const project = await sequelize.transaction(async (transaction) => {
      const current = await ownedProject(req.params.id, req.user.id, transaction, true);
      if (current.version !== version) throw new InputError('Project version conflict', 409, 'VERSION_CONFLICT');
      await snapshot(current, `Before update from version ${version}`, transaction);
      await current.update({
        ...changes,
        version: current.version + 1,
        reviewStatus: 'pending',
        reviewedAt: null,
        reviewedBy: null,
        reviewNotes: null,
      }, { transaction });
      await appendAudit({ projectId: current.id, actorId: req.user.id, action: 'PROJECT_UPDATED', payload: { fields: Object.keys(changes), version: current.version }, transaction });
      return current;
    });
    res.json(project);
  } catch (error) { respondError(res, error); }
});

router.post('/:id/review', async (req, res) => {
  try {
    const version = expectedVersion(req.body?.version);
    const decision = choice(req.body?.decision, 'decision', ['approved', 'rejected']);
    const notes = text(req.body?.notes, 'notes', { min: 5, max: 2000 });
    const project = await sequelize.transaction(async (transaction) => {
      const current = await ownedProject(req.params.id, req.user.id, transaction, true);
      if (current.version !== version) throw new InputError('Project version conflict', 409, 'VERSION_CONFLICT');
      await current.update({ reviewStatus: decision, reviewedAt: new Date(), reviewedBy: req.user.id, reviewNotes: notes }, { transaction });
      await appendAudit({ projectId: current.id, actorId: req.user.id, action: decision === 'approved' ? 'PROJECT_APPROVED' : 'PROJECT_REJECTED', payload: { version, notes }, transaction });
      return current;
    });
    res.json(project);
  } catch (error) { respondError(res, error); }
});

router.post('/:id/archive', async (req, res) => {
  try {
    const version = expectedVersion(req.body?.version);
    const project = await sequelize.transaction(async (transaction) => {
      const current = await ownedProject(req.params.id, req.user.id, transaction, true);
      if (current.version !== version) throw new InputError('Project version conflict', 409, 'VERSION_CONFLICT');
      await snapshot(current, `Before archive from version ${version}`, transaction);
      await current.update({ status: 'archived', reviewStatus: 'pending', version: current.version + 1, reviewedAt: null, reviewedBy: null, reviewNotes: null }, { transaction });
      await appendAudit({ projectId: current.id, actorId: req.user.id, action: 'PROJECT_ARCHIVED', payload: { version: current.version }, transaction });
      return current;
    });
    res.json(project);
  } catch (error) { respondError(res, error); }
});

router.delete('/:id', (req, res) => res.status(405).json({ error: 'Projects are archived to preserve audit evidence', code: 'ARCHIVE_REQUIRED' }));

module.exports = router;
