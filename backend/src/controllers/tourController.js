const tourService = require('../services/tourService');

class TourController {
  async getAll(req, res, next) {
    try {
      const tours = await tourService.getAll(req.query);
      res.json({
        count: tours.length,
        tours,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const tour = await tourService.getById(id);
      res.json(tour);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const enterpriseId = req.user.enterpriseId;
      const tour = await tourService.create(enterpriseId, req.body);
      res.status(201).json(tour);
    } catch (error) {
      next(error);
    }
  }

  async book(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const booking = await tourService.book(id, userId);
      res.status(201).json(booking);
    } catch (error) {
      next(error);
    }
  }

  async getUserBookings(req, res, next) {
    try {
      const userId = req.user.id;
      const bookings = await tourService.getUserBookings(userId);
      res.json({
        count: bookings.length,
        bookings,
      });
    } catch (error) {
      next(error);
    }
  }

  async delUserBookings(req, res, next) {
    try {
      const { id } = req.params;
      const bookings = await tourService.delUserBookings(id);
      res.json({
        count: bookings.length,
        bookings,
      });
    } catch (error) {
      next(error);
    }
  }

  async getEnterpriseBookings(req, res, next) {
    try {
      const enterpriseId = req.query.enterpriseId;
      const bookings = await tourService.getEnterpriseBookings(enterpriseId);
      res.json({
        count: bookings.length,
        bookings,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TourController();
