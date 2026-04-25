const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const { authMiddleware } = require('../middleware/auth');

router.post('/generate', authMiddleware, recommendationController.generateRecommendations);
router.get('/', authMiddleware, recommendationController.getRecommendations);

module.exports = router;
