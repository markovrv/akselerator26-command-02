const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TourBooking = sequelize.define('TourBooking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  tourId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('new', 'confirmed', 'cancelled', 'visited'),
    defaultValue: 'new',
  },
  comment: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'tour_bookings',
  timestamps: true,
});

module.exports = TourBooking;
