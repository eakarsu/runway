const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VideoGeneration = sequelize.define('VideoGeneration', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  prompt: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
  },
  resultUrl: {
    type: DataTypes.STRING,
  },
  duration: {
    type: DataTypes.FLOAT,
  },
  resolution: {
    type: DataTypes.STRING,
    defaultValue: '1080p',
  },
  style: {
    type: DataTypes.STRING,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = VideoGeneration;
