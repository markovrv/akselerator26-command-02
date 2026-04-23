const jwt = require('jsonwebtoken');
const { User, UserProfile } = require('../models');
const env = require('../config/env');

class AuthService {
  async register(email, password, fullName, role = 'seeker') {
    // Check if user exists
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      throw { statusCode: 400, message: 'Email already registered' };
    }

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash: password,
      role,
      status: 'pending',
    });

    // Create profile
    await UserProfile.create({
      userId: user.id,
      fullName,
    });

    return this.generateTokens(user);
  }

  async login(email, password) {
    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) throw { statusCode: 401, message: 'Invalid credentials' };
    const isValid = await user.checkPassword(password);
    if (!isValid) throw { statusCode: 401, message: 'Invalid credentials' };
    await user.reload();
    return this.generateTokens(user);
  }

  async verifyEmail(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    user.emailVerified = true;
    user.status = 'active';
    await user.save();

    return user;
  }

  generateTokens(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      enterpriseId: user.enterpriseId || null,   // критично
    };
    const accessToken = jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.expiresIn });
    const refreshToken = jwt.sign({ id: user.id }, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiresIn });
    return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } };
  }

  async refreshAccessToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, env.jwt.refreshSecret);
      const user = await User.findByPk(decoded.id);

      if (!user) {
        throw { statusCode: 401, message: 'User not found' };
      }

      return this.generateTokens(user);
    } catch (_error) {
      throw { statusCode: 401, message: 'Invalid refresh token' };
    }
  }
}

module.exports = new AuthService();
