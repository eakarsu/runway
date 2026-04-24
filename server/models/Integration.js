const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Integration = sequelize.define('Integration', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  provider: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'other',
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'disconnected',
  },
  config: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  lastSyncAt: {
    type: DataTypes.DATE,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Integration;
