const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, profileController.getProfile);
router.patch('/', authMiddleware, profileController.updateProfile);
router.post('/role', authMiddleware, profileController.setRole);

module.exports = router;
