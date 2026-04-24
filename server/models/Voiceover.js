const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Voiceover = sequelize.define('Voiceover', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  voice: {
    type: DataTypes.STRING,
    defaultValue: 'neutral',
  },
  language: {
    type: DataTypes.STRING,
    defaultValue: 'en-US',
  },
  duration: {
    type: DataTypes.FLOAT,
  },
  audioUrl: {
    type: DataTypes.STRING,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Voiceover;
