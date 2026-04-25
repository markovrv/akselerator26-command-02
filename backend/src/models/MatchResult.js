const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MatchResult = sequelize.define('MatchResult', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  sessionId: {
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
  matchScore: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
  explanation: {
    type: DataTypes.TEXT,
  },
  factors: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  rankOrder: {
    type: DataTypes.INTEGER,
  },
}, {
  tableName: 'match_results',
  timestamps: true,
});

module.exports = MatchResult;
