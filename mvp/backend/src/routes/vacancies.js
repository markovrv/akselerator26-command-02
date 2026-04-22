const express = require('express');
const router = express.Router();
const vacancyController = require('../controllers/vacancyController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, vacancyController.getAll);
router.get('/:id', optionalAuth, vacancyController.getById);
router.post('/', vacancyController.create);
router.patch('/:id', vacancyController.update);

module.exports = router;
