const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Spreadsheet = sequelize.define('Spreadsheet', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  template: { type: DataTypes.STRING, defaultValue: 'blank' },
  fileName: { type: DataTypes.STRING },
  fileSize: { type: DataTypes.INTEGER },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  data: { type: DataTypes.JSONB, defaultValue: [] },
  columns: { type: DataTypes.JSONB, defaultValue: [] },
  calculations: { type: DataTypes.JSONB, defaultValue: [] },
  summary: { type: DataTypes.JSONB, defaultValue: {} },
  variables: { type: DataTypes.JSONB, defaultValue: [] },
  tabs: { type: DataTypes.JSONB, defaultValue: ['Variables'] },
});

module.exports = Spreadsheet;
