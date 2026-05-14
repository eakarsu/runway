// Apply pass 5 — additive ProjectSnapshot model for revision history.
// PRODUCT-DECISION: snapshot stores name/description/status/thumbnail at a
// point in time. Restoring a snapshot updates the live Project record.
// We intentionally do NOT delete prior snapshots on restore; restoring
// creates a new "current" state but old snapshots remain for history.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProjectSnapshot = sequelize.define('ProjectSnapshot', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  versionNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.STRING,
  },
  thumbnail: {
    type: DataTypes.STRING,
  },
  note: {
    type: DataTypes.TEXT,
  },
});

module.exports = ProjectSnapshot;
