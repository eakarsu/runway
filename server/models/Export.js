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
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Export;
