const crypto = require('node:crypto');
const express = require('express');
const sequelize = require('../config/database');
const authenticate = require('../middleware/auth');
const { Comment, Project, User } = require('../models');
const { appendAudit } = require('../lib/audit');
const { InputError, integerId, text, safeError } = require('../lib/validation');

const router = express.Router();
router.use(authenticate);

function respondError(res, error) {
  const safe = safeError(error);
  if (safe.status === 500) console.error(error);
  return res.status(safe.status).json(safe.body);
}

async function ownedProject(value, userId, transaction, lock = false) {
  const project = await Project.findOne({
    where: { id: integerId(value, 'project id'), userId },
    transaction,
    lock: lock ? transaction.LOCK.UPDATE : undefined,
  });
  if (!project) throw new InputError('Project not found', 404, 'NOT_FOUND');
  return project;
}

router.get('/project/:projectId', async (req, res) => {
  try {
    const project = await ownedProject(req.params.projectId, req.user.id);
    const comments = await Comment.findAll({
      where: { projectId: project.id, userId: req.user.id },
      order: [['createdAt', 'DESC']],
      include: [{ model: User, attributes: ['id', 'email', 'name'] }],
    });
    res.json({ data: comments });
  } catch (error) { respondError(res, error); }
});

router.post('/', async (req, res) => {
  try {
    const body = text(req.body?.body, 'body', { max: 5000 });
    const anchor = text(req.body?.anchor, 'anchor', { max: 255, optional: true });
    const comment = await sequelize.transaction(async (transaction) => {
      const project = await ownedProject(req.body?.projectId, req.user.id, transaction, true);
      const created = await Comment.create({ projectId: project.id, userId: req.user.id, body, anchor: anchor ?? null }, { transaction });
      await appendAudit({
        projectId: project.id,
        actorId: req.user.id,
        action: 'COMMENT_ADDED',
        payload: { commentId: created.id, bodyHash: crypto.createHash('sha256').update(body).digest('hex'), anchor: created.anchor },
        transaction,
      });
      return created;
    });
    res.status(201).json(comment);
  } catch (error) { respondError(res, error); }
});

router.delete('/:id', async (req, res) => {
  try {
    await sequelize.transaction(async (transaction) => {
      const comment = await Comment.findOne({ where: { id: integerId(req.params.id), userId: req.user.id }, transaction, lock: transaction.LOCK.UPDATE });
      if (!comment) throw new InputError('Comment not found', 404, 'NOT_FOUND');
      const project = await ownedProject(comment.projectId, req.user.id, transaction, true);
      await comment.destroy({ transaction });
      await appendAudit({ projectId: project.id, actorId: req.user.id, action: 'COMMENT_REMOVED', payload: { commentId: comment.id }, transaction });
    });
    res.status(204).end();
  } catch (error) { respondError(res, error); }
});

module.exports = router;
