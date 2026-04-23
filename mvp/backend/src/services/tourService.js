const { Tour, TourBooking, Enterprise, User } = require('../models');
const { Op } = require('sequelize');

class TourService {
  async getAll(filters = {}) {
    const where = { status: 'open' };

    if (filters.format) {
      where.format = filters.format;
    }
    if (filters.enterpriseId) {
      where.enterpriseId = filters.enterpriseId;
    }

    const include = [{
      model: Enterprise,
      where: { moderationStatus: 'approved' },
      required: true,
    }];

    const tours = await Tour.findAll({
      where,
      include,
      order: [['startAt', 'ASC']],
    });

    return tours;
  }

  async getById(id) {
    const tour = await Tour.findByPk(id, {
      include: [
        { model: Enterprise },
        { model: TourBooking },
      ],
    });

    if (!tour) {
      throw { statusCode: 404, message: 'Tour not found' };
    }

    return tour;
  }

  async create(enterpriseId, data) {
    const enterprise = await Enterprise.findByPk(enterpriseId);
    if (!enterprise) {
      throw { statusCode: 404, message: 'Enterprise not found' };
    }

    const tour = await Tour.create({
      ...data,
      enterpriseId,
    });
    return tour;
  }

  async book(tourId, userId) {
    const tour = await Tour.findByPk(tourId);
    if (!tour) {
      throw { statusCode: 404, message: 'Tour not found' };
    }

    if (tour.status !== 'open') {
      throw { statusCode: 400, message: 'Tour is not open for booking' };
    }

    // Check capacity
    const bookingCount = await TourBooking.count({
      where: { tourId, status: { [Op.ne]: 'cancelled' } },
    });

    if (bookingCount >= tour.capacity) {
      throw { statusCode: 400, message: 'Tour is fully booked' };
    }

    // Check if already booked
    const existingBooking = await TourBooking.findOne({
      where: { tourId, userId, status: { [Op.ne]: 'cancelled' } },
    });

    if (existingBooking) {
      throw { statusCode: 400, message: 'You have already booked this tour' };
    }

    const booking = await TourBooking.create({
      tourId,
      userId,
      status: 'new',
    });

    return booking;
  }

  async getUserBookings(userId) {
    const bookings = await TourBooking.findAll({
      where: { userId },
      include: [{
        model: Tour,
        include: [{ model: Enterprise }],
      }],
      order: [['createdAt', 'DESC']],
    });

    return bookings;
  }

  async getEnterpriseBookings(enterpriseId) {
    const bookings = await TourBooking.findAll({
      include: [{
        model: Tour,
        where: { enterpriseId },
        required: true,
      },
      { model: User, as: 'User', attributes: ['id', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    return bookings;
  }

  async getByEnterprise(enterpriseId) {
    return await Tour.findAll({ where: { enterpriseId }, order: [['startAt', 'ASC']] });
  }

  async countByEnterprise(enterpriseId) {
    return await Tour.count({ where: { enterpriseId } });
  }

  async update(id, data, enterpriseId) {
    const tour = await Tour.findOne({ where: { id, enterpriseId } });
    if (!tour) throw { statusCode: 404, message: 'Tour not found or access denied' };
    await tour.update(data);
    return tour;
  }

  async getBookingsByTour(tourId, enterpriseId) {
    const tour = await Tour.findOne({ where: { id: tourId, enterpriseId } });
    if (!tour) throw { statusCode: 404, message: 'Tour not found or access denied' };
    const bookings = await TourBooking.findAll({
      where: { tourId },
      include: [{ model: User, attributes: ['id', 'email'], include: ['UserProfile'] }],
    });
    return bookings;
  }

}

module.exports = new TourService();
