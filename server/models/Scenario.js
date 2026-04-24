const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Scenario = sequelize.define('Scenario', {
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
    defaultValue: 'base',
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active',
  },
  drivers: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  metrics: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Scenario;
