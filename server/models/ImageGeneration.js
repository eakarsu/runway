const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ImageGeneration = sequelize.define('ImageGeneration', {
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
  width: {
    type: DataTypes.INTEGER,
    defaultValue: 1024,
  },
  height: {
    type: DataTypes.INTEGER,
    defaultValue: 1024,
  },
  style: {
    type: DataTypes.STRING,
  },
  negativePrompt: {
    type: DataTypes.TEXT,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = ImageGeneration;
