const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: 'video',
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'draft',
  },
  reviewStatus: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending',
    validate: { isIn: [['pending', 'approved', 'rejected']] },
  },
  reviewedAt: {
    type: DataTypes.DATE,
  },
  reviewedBy: {
    type: DataTypes.INTEGER,
  },
  reviewNotes: {
    type: DataTypes.TEXT,
  },
  version: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  thumbnail: {
    type: DataTypes.STRING,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Project;
