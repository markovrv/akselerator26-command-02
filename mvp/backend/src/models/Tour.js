const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tour = sequelize.define('Tour', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  enterpriseId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  format: {
    type: DataTypes.ENUM('offline', 'online'),
    defaultValue: 'offline',
  },
  description: {
    type: DataTypes.TEXT,
  },
  startAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endAt: {
    type: DataTypes.DATE,
  },
  capacity: {
    type: DataTypes.INTEGER,
    defaultValue: 20,
  },
  status: {
    type: DataTypes.ENUM('planned', 'open', 'closed', 'cancelled'),
    defaultValue: 'planned',
  },
}, {
  tableName: 'tours',
  timestamps: true,
});

module.exports = Tour;
