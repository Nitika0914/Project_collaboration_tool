const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const JoinRequest = sequelize.define('JoinRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  teamId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
});

module.exports = JoinRequest; 