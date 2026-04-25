const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vacancy = sequelize.define('Vacancy', {
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
  department: {
    type: DataTypes.STRING(255),
  },
  employmentType: {
    type: DataTypes.ENUM('full_time', 'internship', 'practice', 'shift'),
    defaultValue: 'full_time',
  },
  salaryFrom: {
    type: DataTypes.INTEGER,
  },
  salaryTo: {
    type: DataTypes.INTEGER,
  },
  schedule: {
    type: DataTypes.STRING(128),
  },
  requirements: {
    type: DataTypes.TEXT,
  },
  responsibilities: {
    type: DataTypes.TEXT,
  },
  benefits: {
    type: DataTypes.TEXT,
  },
  medicalRequirements: {
    type: DataTypes.TEXT,
  },
  isStudentAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  publishedAt: {
    type: DataTypes.DATE,
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft',
  },
}, {
  tableName: 'vacancies',
  timestamps: true,
});

module.exports = Vacancy;
