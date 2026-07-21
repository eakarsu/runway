const express = require('express');
const sequelize = require('../config/database');
const authenticate = require('../middleware/auth');
const { Project, ProjectSnapshot } = require('../models');
const { appendAudit } = require('../lib/audit');
const { InputError, integerId, text, expectedVersion, safeError } = require('../lib/validation');

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

async function nextVersion(projectId, transaction) {
  const latest = await ProjectSnapshot.findOne({ where: { projectId }, order: [['versionNumber', 'DESC']], transaction });
  return (latest?.versionNumber || 0) + 1;
}

async function saveSnapshot(project, note, transaction) {
  return ProjectSnapshot.create({
    projectId: project.id,
    userId: project.userId,
    versionNumber: await nextVersion(project.id, transaction),
    name: project.name,
    description: project.description,
    status: project.status,
    reviewStatus: project.reviewStatus,
    thumbnail: project.thumbnail,
    note,
  }, { transaction });
}

router.get('/:projectId/snapshots', async (req, res) => {
  try {
    const project = await ownedProject(req.params.projectId, req.user.id);
    const snapshots = await ProjectSnapshot.findAll({
      where: { projectId: project.id, userId: req.user.id },
      order: [['versionNumber', 'DESC']],
    });
    res.json({ data: snapshots });
  } catch (error) { respondError(res, error); }
});

router.post('/:projectId/snapshots', async (req, res) => {
  try {
    const version = expectedVersion(req.body?.version);
    const note = text(req.body?.note, 'note', { min: 3, max: 2000 });
    const result = await sequelize.transaction(async (transaction) => {
      const project = await ownedProject(req.params.projectId, req.user.id, transaction, true);
      if (project.version !== version) throw new InputError('Project version conflict', 409, 'VERSION_CONFLICT');
      const created = await saveSnapshot(project, note, transaction);
      await appendAudit({ projectId: project.id, actorId: req.user.id, action: 'SNAPSHOT_CREATED', payload: { snapshotId: created.id, versionNumber: created.versionNumber }, transaction });
      return created;
    });
    res.status(201).json(result);
  } catch (error) { respondError(res, error); }
});

router.post('/:projectId/snapshots/:snapshotId/restore', async (req, res) => {
  try {
    const version = expectedVersion(req.body?.version);
    const result = await sequelize.transaction(async (transaction) => {
      const project = await ownedProject(req.params.projectId, req.user.id, transaction, true);
      if (project.version !== version) throw new InputError('Project version conflict', 409, 'VERSION_CONFLICT');
      const source = await ProjectSnapshot.findOne({
        where: {
          id: integerId(req.params.snapshotId, 'snapshot id'),
          projectId: project.id,
          userId: req.user.id,
        },
        transaction,
      });
      if (!source) throw new InputError('Snapshot not found', 404, 'NOT_FOUND');
      const before = await saveSnapshot(project, `Before restore of snapshot ${source.id}`, transaction);
      await project.update({
        name: source.name,
        description: source.description,
        status: source.status,
        thumbnail: source.thumbnail,
        version: project.version + 1,
        reviewStatus: 'pending',
        reviewedAt: null,
        reviewedBy: null,
        reviewNotes: null,
      }, { transaction });
      await appendAudit({ projectId: project.id, actorId: req.user.id, action: 'SNAPSHOT_RESTORED', payload: { sourceSnapshotId: source.id, preservedSnapshotId: before.id, version: project.version }, transaction });
      return project;
    });
    res.json(result);
  } catch (error) { respondError(res, error); }
});

module.exports = router;
