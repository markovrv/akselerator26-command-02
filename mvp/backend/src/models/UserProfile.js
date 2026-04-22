const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserProfile = sequelize.define('UserProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  fullName: {
    type: DataTypes.STRING(255),
  },
  phone: {
    type: DataTypes.STRING(32),
  },
  city: {
    type: DataTypes.STRING(128),
  },
  age: {
    type: DataTypes.INTEGER,
  },
  relocationReady: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  desiredPosition: {
    type: DataTypes.STRING(255),
  },
  desiredSalaryFrom: {
    type: DataTypes.INTEGER,
  },
  desiredSalaryTo: {
    type: DataTypes.INTEGER,
  },
  preferredSchedule: {
    type: DataTypes.STRING(128),
  },
  healthLimitations: {
    type: DataTypes.TEXT,
  },
  experienceSummary: {
    type: DataTypes.TEXT,
  },
  educationInfo: {
    type: DataTypes.TEXT,
  },
  studentInfoJson: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
}, {
  tableName: 'user_profiles',
  timestamps: true,
});

module.exports = UserProfile;
