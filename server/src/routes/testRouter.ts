import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { body, validationResult } from 'express-validator';
import { VacancyMatchingService, VacancyForLLM } from '../services/vacancyMatchingService';
import { userStore } from '../stores/userStore';
import { vacancyStore } from '../stores/vacancyStore';
import { enterpriseStore } from '../stores/enterpriseStore';
import { passportStore } from '../stores/passportStore';

const router = Router();

// @route   GET /api/tests/questions
// @desc    Get test questions for AI testing
// @access  Private
router.get('/questions', authenticate, async (req: Request, res: Response) => {
  try {
    // TODO: Get test questions from database
    const questions = [
      {
        id: 1,
        text: 'Какая сфера промышленности вас интересует?',
        type: 'multiple_choice',
        options: [
          'Машиностроение',
          'Металлургия',
          'Химическая промышленность',
          'Энергетика',
          'Строительство',
          'IT и автоматизация'
        ]
      },
      {
        id: 2,
        text: 'Готовы ли вы к переезду в другой город?',
        type: 'single_choice',
        options: ['Да', 'Нет', 'Рассматриваю варианты']
      },
      {
        id: 3,
        text: 'Какие у вас ограничения по здоровью?',
        type: 'text',
        placeholder: 'Укажите ограничения или оставьте пустым'
      },
      {
        id: 4,
        text: 'Какие ваши ожидания по заработной плате?',
        type: 'single_choice',
        options: ['до 40 000₽', '40 000₽ - 60 000₽', '60 000₽ - 90 000₽', '90 000₽ - 120 000₽', 'от 120 000₽']
      },
      {
        id: 5,
        text: 'Какой тип работы вы предпочитаете?',
        type: 'multiple_choice',
        options: [
          'Офисная работа',
          'Работа на производстве',
          'Полевая работа',
          'Удаленная работа',
          'Сменный график'
        ]
      }
    ];

    res.status(200).json({
      success: true,
      data: { questions }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch test questions' }
    });
  }
});

// @route   POST /api/tests/submit
// @desc    Submit test answers for AI vacancy matching
// @access  Private
router.post('/submit', authenticate, [
  body('answers').isArray({ min: 1 })
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    const { answers } = req.body;
    const userId = req.user?.userId;

    // Получаем все активные вакансии из хранилища
    const vacanciesRaw = vacancyStore.getAll({ isActive: true });
    const vacancies: VacancyForLLM[] = vacanciesRaw.map(v => ({
      id: v.id,
      title: v.title,
      description: v.description,
      city: v.city,
      salaryMin: v.salary_min,
      salaryMax: v.salary_max,
      requirements: v.requirements
    }));

    console.log(`📊 Matching ${vacancies.length} vacancies for user ${userId}`);

    // Подбор вакансий через LLM или fallback
    const matches = await VacancyMatchingService.matchVacancies(answers, vacancies);

    // Строим мапу вакансий для быстрого поиска
    const vacancyMap = new Map(vacancies.map(v => [v.id, v]));

    // Сохраняем результаты в цифровой паспорт
    passportStore.addTestResult(userId!, JSON.stringify(answers));
    passportStore.addRecommendedVacancies(userId!, matches.map(m => ({
      vacancyId: m.vacancyId,
      matchScore: m.matchScore,
      reason: m.reason
    })));

    // Формируем ответ с подробностями о вакансиях
    const recommendedVacancies = matches.map(match => {
      const v = vacancyMap.get(match.vacancyId);
      const enterprise = v ? enterpriseStore.getAll().find(e => {
        const vac = vacancyStore.findById(v.id);
        return vac?.enterprise_id === e.id;
      }) : null;

      return {
        vacancyId: match.vacancyId,
        title: v?.title || 'Неизвестно',
        enterpriseName: enterprise?.name || 'Неизвестно',
        city: v?.city || '',
        salaryMin: v?.salaryMin,
        salaryMax: v?.salaryMax,
        requirements: v?.requirements || '',
        matchScore: match.matchScore,
        reason: match.reason
      };
    });

    res.status(200).json({
      success: true,
      data: {
        message: 'Тест завершён. Рекомендации сформированы.',
        recommendedVacancies
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to submit test' }
    });
  }
});

// @route   GET /api/tests/results
// @desc    Get user's test results
// @access  Private
router.get('/results', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { message: 'Пользователь не авторизован.' }
      });
    }

    const testResults = passportStore.getTestResults(userId);
    const rawRecommended = passportStore.getRecommendedVacancies(userId);

    // Обогащаем рекомендации данными о вакансиях
    const recommendedWithDetails = rawRecommended.map(rv => {
      const vacancy = vacancyStore.findById(rv.vacancy_id);
      const enterprise = vacancy ? enterpriseStore.getAll().find(e => e.id === vacancy.enterprise_id) : null;

      return {
        vacancyId: rv.vacancy_id,
        matchScore: rv.match_score,
        reason: rv.reason,
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
        testResults: testResults.map(tr => ({
          id: tr.id,
          completedAt: tr.completed_at,
          answersCount: JSON.parse(tr.answers || '[]').length
        })),
        recommendedVacancies: recommendedWithDetails
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Ошибка при получении результатов тестов.' }
    });
  }
});

export default router;
