const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('planned', 'in_progress', 'completed', 'on_hold'),
    defaultValue: 'planned',
  },
  teamId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  managerId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
});

module.exports = Project; 