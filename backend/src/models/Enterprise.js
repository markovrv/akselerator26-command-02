const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Enterprise = sequelize.define('Enterprise', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  industry: {
    type: DataTypes.STRING(128),
  },
  region: {
    type: DataTypes.STRING(128),
  },
  city: {
    type: DataTypes.STRING(128),
  },
  address: {
    type: DataTypes.STRING(255),
  },
  description: {
    type: DataTypes.TEXT,
  },
  laborConditions: {
    type: DataTypes.TEXT,
  },
  safetyInfo: {
    type: DataTypes.TEXT,
  },
  salaryCalcInfo: {
    type: DataTypes.TEXT,
  },
  medicalExamInfo: {
    type: DataTypes.TEXT,
  },
  collectiveAgreementUrl: {
    type: DataTypes.STRING(500),
  },
  logo: {
    type: DataTypes.STRING(500),
  },
  moderationStatus: {
    type: DataTypes.ENUM('draft', 'pending', 'approved', 'rejected'),
    defaultValue: 'draft',
  },
}, {
  tableName: 'enterprises',
  timestamps: true,
});

module.exports = Enterprise;
