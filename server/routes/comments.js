// Apply pass 5 — comment / annotation routes.
// PRODUCT-DECISION: comments are scoped per-project, only the comment author
// can delete (no admin override). Threading omitted (top-level only).
// No required env vars.
const express = require('express');
const authenticate = require('../middleware/auth');
const { Comment, User } = require('../models');

const router = express.Router();

// List comments for a project
router.get('/project/:projectId', authenticate, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId, 10);
    if (Number.isNaN(projectId)) {
      return res.status(400).json({ error: 'Invalid project id' });
    }
    const comments = await Comment.findAll({
      where: { projectId },
      order: [['createdAt', 'DESC']],
      include: [{ model: User, attributes: ['id', 'email', 'name'] }],
    });
    res.json({ success: true, comments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a comment
router.post('/', authenticate, async (req, res) => {
  try {
    const { projectId, body, anchor } = req.body;
    if (!projectId || !body) {
      return res.status(400).json({ error: 'projectId and body are required' });
    }
    const comment = await Comment.create({
      projectId,
      userId: req.user.id,
      body,
      anchor: anchor || null,
    });
    res.status(201).json({ success: true, comment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a comment (author only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ error: 'Not found' });
    }
    if (comment.userId !== req.user.id) {
      return res.status(403).json({ error: 'Only the author can delete this comment' });
    }
    await comment.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
