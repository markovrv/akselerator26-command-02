import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { userStore, UpdateProfileDto } from '../stores/userStore';
import { passportStore } from '../stores/passportStore';

const router = Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { message: 'Пользователь не авторизован.' }
      });
    }

    const user = userStore.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'Пользователь не найден.' }
      });
    }

    // Fetch passport data from passportStore
    const testResults = passportStore.getTestResults(userId);
    const recommendedVacancies = passportStore.getRecommendedVacancies(userId);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          digitalPassport: {
            testResults: testResults.map(tr => ({
              id: tr.id,
              completedAt: tr.completed_at,
              answersCount: JSON.parse(tr.answers || '[]').length
            })),
            recommendedVacancies: recommendedVacancies
          },
          createdAt: user.created_at
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Ошибка при получении профиля.' }
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { message: 'Пользователь не авторизован.' }
      });
    }

    const dto: UpdateProfileDto = {};
    if (req.body.name) dto.name = req.body.name;
    if (req.body.phone) dto.phone = req.body.phone;
    if (req.body.city) dto.city = req.body.city;

    const updatedUser = userStore.updateProfile(userId, dto);
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: { message: 'Пользователь не найден.' }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        message: 'Профиль обновлён.',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Ошибка при обновлении профиля.' }
    });
  }
});

export default router;
