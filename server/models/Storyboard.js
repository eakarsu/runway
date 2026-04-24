const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Storyboard = sequelize.define('Storyboard', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  scenes: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  projectId: {
    type: DataTypes.INTEGER,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Storyboard;
