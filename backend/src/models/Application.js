const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  vacancyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('job_application', 'practice_application'),
    defaultValue: 'job_application',
  },
  coverNote: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.ENUM('new', 'viewed', 'invited', 'rejected', 'hired'),
    defaultValue: 'new',
  },
}, {
  tableName: 'applications',
  timestamps: true,
});

module.exports = Application;
