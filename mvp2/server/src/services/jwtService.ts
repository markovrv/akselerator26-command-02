import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

class JwtService {
  private secret: string;
  private expiresIn: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || 'default-secret-change-me';
    this.expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  }

  generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn,
      algorithm: 'HS256'
    });
  }

  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.secret) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

export const jwtService = new JwtService();
