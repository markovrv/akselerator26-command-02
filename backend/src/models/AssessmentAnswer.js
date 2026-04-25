const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AssessmentAnswer = sequelize.define('AssessmentAnswer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  sessionId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  questionCode: {
    type: DataTypes.STRING(64),
    allowNull: false,
  },
  answerValue: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  weight: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 1.0,
  },
}, {
  tableName: 'assessment_answers',
  timestamps: true,
});

module.exports = AssessmentAnswer;
