const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    lowercase: true,
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('seeker', 'student', 'enterprise_user', 'superadmin'),
    defaultValue: 'seeker',
  },
  enterpriseId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'enterprises', key: 'id' },
  },
  status: {
    type: DataTypes.ENUM('active', 'pending', 'blocked'),
    defaultValue: 'pending',
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'users',
  timestamps: true,
});

// Hash password before saving
User.beforeCreate(async (user) => {
  if (user.passwordHash) {
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
  }
});

// Method to check password
User.prototype.checkPassword = async function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = User;
