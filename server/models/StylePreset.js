const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StylePreset = sequelize.define('StylePreset', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.TEXT,
  },
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = StylePreset;
