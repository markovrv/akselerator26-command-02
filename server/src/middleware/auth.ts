import { Request, Response, NextFunction } from 'express';
import { jwtService } from '../services/jwtService';
import { userStore } from '../stores/userStore';

interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: 'Требуется авторизация. Токен не передан.' }
      });
    }

    const decoded = jwtService.verifyToken(token) as JwtPayload;

    // Проверяем, что пользователь существует и активен
    const user = userStore.findById(decoded.userId);
    if (!user || user.is_active !== 1) {
      return res.status(401).json({
        success: false,
        error: { message: 'Пользователь не найден или неактивен.' }
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { message: 'Недействительный или просроченный токен.' }
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Требуется авторизация.' }
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { message: 'Недостаточно прав для выполнения операции.' }
      });
    }

    next();
  };
};
