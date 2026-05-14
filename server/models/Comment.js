// Apply pass 5 — additive Comment model for project annotations.
// PRODUCT-DECISION: comments are user-scoped per project, top-level only
// (no threading) to keep the schema simple. Threading can be added later
// via an optional parentId column.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Comment = sequelize.define('Comment', {
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
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  // Optional anchor (e.g. timecode, asset id, scene number)
  anchor: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Comment;
