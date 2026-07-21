const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditEvent = sequelize.define('AuditEvent', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  actorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  sequence: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  payload: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
  previousHash: {
    type: DataTypes.STRING(64),
    allowNull: false,
  },
  hash: {
    type: DataTypes.STRING(64),
    allowNull: false,
  },
}, {
  updatedAt: false,
});

module.exports = AuditEvent;
