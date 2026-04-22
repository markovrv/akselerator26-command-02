const authService = require('../services/authService');

class AuthController {
  async register(req, res, next) {
    try {
      const { email, password, fullName, role } = req.body;

      if (!email || !password || !fullName) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await authService.register(email, password, fullName, role);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      const result = await authService.login(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token required' });
      }

      const result = await authService.refreshAccessToken(refreshToken);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await authService.verifyEmail(userId);
      res.json({ message: 'Email verified', user });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
