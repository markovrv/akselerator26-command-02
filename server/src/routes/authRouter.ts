import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { jwtService } from '../services/jwtService';
import { userStore } from '../stores/userStore';

const router = Router();

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('name').optional({ checkFalsy: true }).trim(),
  body('role').optional().isIn(['seeker', 'student', 'admin'])
], async (req: Request, res: Response) => {
  try {
    console.log('📝 Register attempt, body:', req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    const { email, name, role } = req.body;

    // Проверяем, не существует ли уже пользователь
    const existingUser = userStore.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: { message: 'Пользователь с таким email уже существует.' }
      });
    }

    // Дефолтная роль, если не указана
    const userRole = role || 'seeker';
    const userName = name || email.split('@')[0];

    // Создаём пользователя
    const newUser = userStore.create({
      email,
      name: userName,
      role: userRole as 'seeker' | 'student' | 'admin'
    });

    // Генерируем JWT
    const token = jwtService.generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role
    });

    res.status(201).json({
      success: true,
      data: {
        message: 'Пользователь зарегистрирован.',
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Registration failed' }
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail()
], async (req: Request, res: Response) => {
  try {
    console.log('🔑 Login attempt, body:', req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    const { email } = req.body;

    // Ищем пользователя
    const user = userStore.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'Пользователь не найден. Зарегистрируйтесь.' }
      });
    }

    if (user.is_active !== 1) {
      return res.status(403).json({
        success: false,
        error: { message: 'Аккаунт заблокирован.' }
      });
    }

    // Генерируем JWT
    const token = jwtService.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    res.status(200).json({
      success: true,
      data: {
        message: 'Вход выполнен.',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Login failed' }
    });
  }
});

export default router;
