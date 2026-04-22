const express = require('express');
const router = express.Router();
const enterpriseController = require('../controllers/enterpriseController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, enterpriseController.getAll);
router.get('/:slug', optionalAuth, enterpriseController.getBySlug);
router.post('/', enterpriseController.create);
router.patch('/:id', enterpriseController.update);

module.exports = router;
