const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Export = sequelize.define('Export', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  format: {
    type: DataTypes.STRING,
    defaultValue: 'mp4',
  },
  resolution: {
    type: DataTypes.STRING,
    defaultValue: '1080p',
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
  },
  fileUrl: {
    type: DataTypes.STRING,
  },
  projectId: {
    type: DataTypes.INTEGER,
  },
  projectVersion: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  idempotencyKey: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  provider: {
    type: DataTypes.STRING,
  },
  providerReference: {
    type: DataTypes.STRING,
  },
  attempts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  lastError: {
    type: DataTypes.TEXT,
  },
  nextRetryAt: {
    type: DataTypes.DATE,
  },
}, {
  indexes: [{ unique: true, fields: ['userId', 'idempotencyKey'] }],
});

module.exports = Export;
