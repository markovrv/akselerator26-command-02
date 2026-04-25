const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const { authMiddleware } = require('../middleware/auth');

router.get('/questions', assessmentController.getQuestions);
router.post('/start', authMiddleware, assessmentController.startAssessment);
router.post('/:sessionId/answer', authMiddleware, assessmentController.answerQuestion);
router.post('/:sessionId/complete', authMiddleware, assessmentController.completeAssessment);

module.exports = router;
