const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AssessmentSession = sequelize.define('AssessmentSession', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  roleContext: {
    type: DataTypes.ENUM('seeker', 'student'),
    defaultValue: 'seeker',
  },
  status: {
    type: DataTypes.ENUM('in_progress', 'completed'),
    defaultValue: 'in_progress',
  },
  scoreJson: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  completedAt: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'assessment_sessions',
  timestamps: true,
});

module.exports = AssessmentSession;
