const profileService = require('../services/profileService');

class ProfileController {
  async getProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const profile = await profileService.getFullProfile(userId);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const data = req.body;
      const profile = await profileService.updateProfile(userId, data);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }

  async setRole(req, res, next) {
    try {
      const userId = req.user.id;
      const { role, enterpriseId } = req.body;
      if (!role) return res.status(400).json({ error: 'Role required' });
      if (role === 'enterprise_user' && !enterpriseId) {
        return res.status(400).json({ error: 'enterpriseId required for enterprise_user role' });
      }
      const user = await profileService.setRole(userId, role, enterpriseId);
      res.json({ user });
    } catch (error) { next(error); }
  }
}

module.exports = new ProfileController();
