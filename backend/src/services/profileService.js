const { User, UserProfile, Enterprise } = require('../models');

class ProfileService {
  async getProfile(userId) {
    const profile = await UserProfile.findOne({ where: { userId } });
    if (!profile) {
      throw { statusCode: 404, message: 'Profile not found' };
    }
    return profile;
  }

  async updateProfile(userId, data) {
    let profile = await UserProfile.findOne({ where: { userId } });

    if (!profile) {
      profile = await UserProfile.create({ userId, ...data });
    } else {
      Object.assign(profile, data);
      await profile.save();
    }

    return profile;
  }

  async setRole(userId, role, enterpriseId = null) {
    const user = await User.findByPk(userId);
    if (!user) throw { statusCode: 404, message: 'User not found' };
    if (role === 'enterprise_user') {
      if (!enterpriseId) throw { statusCode: 400, message: 'enterpriseId required' };
      const enterprise = await Enterprise.findByPk(enterpriseId);
      if (!enterprise) throw { statusCode: 404, message: 'Enterprise not found' };
      user.enterpriseId = enterpriseId;
    } else {
      user.enterpriseId = null;
    }
    user.role = role;
    await user.save();
    return user;
  }

  async getFullProfile(userId) {
    const user = await User.findByPk(userId, {
      include: ['UserProfile'],
    });

    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      profile: user.UserProfile,
    };
  }
}

module.exports = new ProfileService();
