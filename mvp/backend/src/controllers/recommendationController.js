const matchingService = require('../services/matchingService');

class RecommendationController {
  async generateRecommendations(req, res, next) {
    try {
      const { sessionId } = req.query;
      const filters = req.query;

      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID required' });
      }

      const recommendations = await matchingService.generateRecommendations(
        sessionId,
        filters
      );

      res.json({
        count: recommendations.length,
        recommendations,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRecommendations(req, res, next) {
    try {
      const { sessionId } = req.query;

      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID required' });
      }

      const matches = await matchingService.getRecommendations(sessionId);
      res.json({
        count: matches.length,
        recommendations: matches,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RecommendationController();
