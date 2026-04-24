const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Plan = sequelize.define('Plan', {
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
    defaultValue: 'revenue',
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'draft',
  },
  drivers: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  data: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Plan;
