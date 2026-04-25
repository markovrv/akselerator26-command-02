const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MessageThread = sequelize.define('MessageThread', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  enterpriseId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  vacancyId: {
    type: DataTypes.UUID,
  },
  lastMessageAt: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'message_threads',
  timestamps: true,
});

module.exports = MessageThread;
