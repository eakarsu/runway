const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Script = sequelize.define('Script', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  genre: {
    type: DataTypes.STRING,
  },
  content: {
    type: DataTypes.TEXT,
  },
  wordCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  tone: {
    type: DataTypes.STRING,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Script;
