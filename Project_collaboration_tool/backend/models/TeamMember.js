const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TeamMember = sequelize.define('TeamMember', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  teamId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('manager', 'member'),
    defaultValue: 'member'
  }
}, {
  uniqueKeys: {
    unique_team_user: {
      fields: ['teamId', 'userId']
    }
  }
});
module.exports = TeamMember;
