const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourController');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, tourController.getAll);
router.get('/:id', optionalAuth, tourController.getById);
router.post('/', authMiddleware, tourController.create);
router.post('/:id/book', authMiddleware, tourController.book);
router.get('/me/bookings', authMiddleware, tourController.getUserBookings);
router.delete('/bookings/:id', authMiddleware, tourController.delUserBookings);
router.get('/enterprise/bookings', authMiddleware, tourController.getEnterpriseBookings);

module.exports = router;
