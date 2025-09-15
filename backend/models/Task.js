const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('todo', 'in_progress', 'done'),
    defaultValue: 'todo',
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  assignedTo: {
    type: DataTypes.UUID,
    allowNull: true,
  },
});

module.exports = Task; 