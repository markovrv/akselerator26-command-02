import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { userStore, User, UpdateProfileDto } from '../stores/userStore';
import { vacancyStore } from '../stores/vacancyStore';
import { enterpriseStore } from '../stores/enterpriseStore';
import { passportStore } from '../stores/passportStore';

const router = Router();

// ============================================================
//  Пользователи
// ============================================================

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', [authenticate, authorize('admin')], async (req: Request, res: Response) => {
  try {
    const users = userStore.getAllUsers();
    const usersSummary = users.map((u: User) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      isActive: u.is_active === 1,
      createdAt: u.created_at,
      testResultsCount: passportStore.getTestResults(u.id).length,
      recommendedVacanciesCount: passportStore.getRecommendedVacancies(u.id).length
    }));

    res.status(200).json({
      success: true,
      data: { users: usersSummary }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Ошибка при получении списка пользователей.' }
    });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get user with full digital passport
// @access  Private/Admin
router.get('/users/:id', [authenticate, authorize('admin')], async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const user = userStore.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'Пользователь не найден.' }
      });
    }

    // Обогащаем рекомендации данными о вакансиях
    const rawRecommended = passportStore.getRecommendedVacancies(user.id);
    const recommendedWithDetails = rawRecommended.map(rv => {
      const vacancy = vacancyStore.findById(rv.vacancy_id);
      const enterprise = vacancy ? enterpriseStore.getAll().find(e => e.id === vacancy.enterprise_id) : null;

      return {
        ...rv,
        title: vacancy?.title || 'Вакансия удалена',
        enterpriseName: enterprise?.name || 'Неизвестно',
        city: vacancy?.city || '',
        salaryMin: vacancy?.salary_min,
        salaryMax: vacancy?.salary_max,
        isActive: vacancy?.is_active === 1
      };
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.is_active === 1,
          createdAt: user.created_at,
          digitalPassport: {
            testResults: passportStore.getTestResults(user.id),
            recommendedVacancies: recommendedWithDetails,
            excursionRegistrations: []
          }
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Ошибка при получении данных пользователя.' }
    });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Change user role
// @access  Private/Admin
router.put('/users/:id/role', [authenticate, authorize('admin')], async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const { role } = req.body;

    if (!['seeker', 'student', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Недопустимая роль.' }
      });
    }

    const user = userStore.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'Пользователь не найден.' }
      });
    }

    userStore.updateProfile(userId, { role });
    const updated = userStore.findById(userId)!;

    res.status(200).json({
      success: true,
      data: { message: 'Роль изменена.', user: { id: updated.id, email: updated.email, role: updated.role } }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Ошибка при изменении роли.' }
    });
  }
});

// @route   PUT /api/admin/users/:id/toggle-active
// @desc    Toggle user active status
// @access  Private/Admin
router.put('/users/:id/toggle-active', [authenticate, authorize('admin')], async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const user = userStore.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'Пользователь не найден.' }
      });
    }

    const updatedUser = userStore.toggleActive(userId);
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: { message: 'Пользователь не найден.' }
      });
    }

    res.status(200).json({
      success: true,
      data: { message: updatedUser.is_active ? 'Пользователь активирован.' : 'Пользователь деактивирован.', isActive: updatedUser.is_active === 1 }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Ошибка при изменении статуса.' }
    });
  }
});

// ============================================================
//  Цифровой паспорт
// ============================================================

// @route   DELETE /api/admin/users/:id/passport/test-results/:testId
// @desc    Delete a test result from passport
// @access  Private/Admin
router.delete('/users/:id/passport/test-results/:testId', [authenticate, authorize('admin')], async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const testId = parseInt(req.params.testId);

    const user = userStore.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'Пользователь не найден.' }
      });
    }

    const removed = passportStore.deleteTestResult(userId, testId);
    if (!removed) {
      return res.status(404).json({
        success: false,
        error: { message: 'Результат теста не найден.' }
      });
    }

    res.status(200).json({
      success: true,
      data: { message: 'Результат теста удалён.' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Ошибка при удалении результата теста.' }
    });
  }
});

// @route   DELETE /api/admin/users/:id/passport/recommendations/:vacancyId
// @desc    Delete a recommended vacancy from passport
// @access  Private/Admin
router.delete('/users/:id/passport/recommendations/:vacancyId', [authenticate, authorize('admin')], async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const vacancyId = parseInt(req.params.vacancyId);

    const user = userStore.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'Пользователь не найден.' }
      });
    }

    const removed = passportStore.deleteRecommendedVacancy(userId, vacancyId);
    if (!removed) {
      return res.status(404).json({
        success: false,
        error: { message: 'Рекомендация не найдена.' }
      });
    }

    res.status(200).json({
      success: true,
      data: { message: 'Рекомендация удалена.' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Ошибка при удалении рекомендации.' }
    });
  }
});

// @route   POST /api/admin/users/:id/passport/recommendations
// @desc    Manually add recommended vacancy to passport
// @access  Private/Admin
router.post('/users/:id/passport/recommendations', [authenticate, authorize('admin')], async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const { vacancyId, matchScore = 80, reason = 'Добавлено администратором' } = req.body;

    if (!vacancyId || typeof vacancyId !== 'number') {
      return res.status(400).json({
        success: false,
        error: { message: 'Укажите vacancyId.' }
      });
    }

    const user = userStore.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'Пользователь не найден.' }
      });
    }

    const vacancy = vacancyStore.findById(vacancyId);
    if (!vacancy) {
      return res.status(404).json({
        success: false,
        error: { message: 'Вакансия не найдена.' }
      });
    }

    passportStore.addRecommendedVacancies(userId, [{ vacancyId, matchScore, reason }]);

    res.status(201).json({
      success: true,
      data: { message: 'Рекомендация добавлена.' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Ошибка при добавлении рекомендации.' }
    });
  }
});

// @route   DELETE /api/admin/users/:id/passport
// @desc    Clear entire digital passport
// @access  Private/Admin
router.delete('/users/:id/passport', [authenticate, authorize('admin')], async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const user = userStore.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'Пользователь не найден.' }
      });
    }

    passportStore.clearPassport(userId);

    res.status(200).json({
      success: true,
      data: { message: 'Цифровой паспорт очищен.' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Ошибка при очистке паспорта.' }
    });
  }
});

export default router;
