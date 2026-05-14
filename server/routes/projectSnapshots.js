// Apply pass 5 — project revision history.
// PRODUCT-DECISION: snapshots store name/description/status/thumbnail. Restore
// updates the live Project (does not delete other snapshots). versionNumber is
// auto-incremented per project starting at 1.
// No required env vars.
const express = require('express');
const authenticate = require('../middleware/auth');
const { Project, ProjectSnapshot } = require('../models');

const router = express.Router();

// List snapshots
router.get('/:projectId/snapshots', authenticate, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId, 10);
    if (Number.isNaN(projectId)) {
      return res.status(400).json({ error: 'Invalid project id' });
    }
    const snapshots = await ProjectSnapshot.findAll({
      where: { projectId },
      order: [['versionNumber', 'DESC']],
    });
    res.json({ success: true, snapshots });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a snapshot of the current project state
router.post('/:projectId/snapshots', authenticate, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId, 10);
    if (Number.isNaN(projectId)) {
      return res.status(400).json({ error: 'Invalid project id' });
    }
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    if (project.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const last = await ProjectSnapshot.findOne({
      where: { projectId },
      order: [['versionNumber', 'DESC']],
    });
    const versionNumber = (last?.versionNumber || 0) + 1;
    const snapshot = await ProjectSnapshot.create({
      projectId,
      userId: req.user.id,
      versionNumber,
      name: project.name,
      description: project.description,
      status: project.status,
      thumbnail: project.thumbnail,
      note: req.body?.note || null,
    });
    res.status(201).json({ success: true, snapshot });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Restore a snapshot (updates the live project)
router.post('/:projectId/snapshots/:snapshotId/restore', authenticate, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId, 10);
    const snapshotId = parseInt(req.params.snapshotId, 10);
    const project = await Project.findByPk(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    const snapshot = await ProjectSnapshot.findByPk(snapshotId);
    if (!snapshot || snapshot.projectId !== projectId) {
      return res.status(404).json({ error: 'Snapshot not found' });
    }
    project.name = snapshot.name;
    project.description = snapshot.description;
    project.status = snapshot.status;
    project.thumbnail = snapshot.thumbnail;
    await project.save();
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
