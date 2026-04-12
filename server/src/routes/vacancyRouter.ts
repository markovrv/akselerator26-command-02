import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { body, validationResult } from 'express-validator';
import { vacancyStore, CreateVacancyDto, UpdateVacancyDto } from '../stores/vacancyStore';
import { enterpriseStore } from '../stores/enterpriseStore';

const router = Router();

// @route   GET /api/vacancies
// @desc    Get all vacancies with filters
// @access  Public
router.get('/', async (req: Request, res: Response) => {
  try {
    const { enterpriseId, city, isActive } = req.query;
    const filters: { enterpriseId?: number; city?: string; isActive?: boolean } = {};

    if (enterpriseId) filters.enterpriseId = parseInt(enterpriseId as string);
    if (city) filters.city = city as string;
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    const vacancies = vacancyStore.getAll(filters);

    // Добавляем название предприятия
    const vacanciesWithEnterprise = vacancies.map(v => {
      const enterprise = enterpriseStore.findById(v.enterprise_id);
      return {
        ...v,
        enterpriseName: enterprise?.name || 'Неизвестно'
      };
    });

    res.status(200).json({
      success: true,
      data: { vacancies: vacanciesWithEnterprise }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Ошибка при получении вакансий.' }
    });
  }
});

// @route   GET /api/vacancies/:id
// @desc    Get vacancy by ID
// @access  Public
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const vacancy = vacancyStore.findById(id);

    if (!vacancy) {
      return res.status(404).json({
        success: false,
        error: { message: 'Вакансия не найдена.' }
      });
    }

    const enterprise = enterpriseStore.findById(vacancy.enterprise_id);

    res.status(200).json({
      success: true,
      data: {
        vacancy: {
          ...vacancy,
          enterpriseName: enterprise?.name || 'Неизвестно'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Ошибка при получении вакансии.' }
    });
  }
});

// @route   POST /api/vacancies
// @desc    Create vacancy (Admin only)
// @access  Private/Admin
router.post('/', [authenticate, authorize('admin')], [
  body('enterpriseId').isInt({ min: 1 }).withMessage('Укажите предприятие.'),
  body('title').trim().notEmpty().withMessage('Название вакансии обязательно.'),
  body('city').optional().trim()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Ошибка валидации.', details: errors.array() }
      });
    }

    // Проверяем существование предприятия
    const enterprise = enterpriseStore.findById(req.body.enterpriseId);
    if (!enterprise) {
      return res.status(404).json({
        success: false,
        error: { message: 'Предприятие не найдено.' }
      });
    }

    const dto: CreateVacancyDto = req.body;
    const vacancy = vacancyStore.create(dto);

    res.status(201).json({
      success: true,
      data: {
        message: 'Вакансия создана.',
        vacancy
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Ошибка при создании вакансии.' }
    });
  }
});

// @route   PUT /api/vacancies/:id
// @desc    Update vacancy (Admin only)
// @access  Private/Admin
router.put('/:id', [authenticate, authorize('admin')], async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const dto: UpdateVacancyDto = req.body;

    const vacancy = vacancyStore.update(id, dto);
    if (!vacancy) {
      return res.status(404).json({
        success: false,
        error: { message: 'Вакансия не найдена.' }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        message: 'Вакансия обновлена.',
        vacancy
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Ошибка при обновлении вакансии.' }
    });
  }
});

// @route   DELETE /api/vacancies/:id
// @desc    Delete vacancy (Admin only)
// @access  Private/Admin
router.delete('/:id', [authenticate, authorize('admin')], async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (!vacancyStore.delete(id)) {
      return res.status(404).json({
        success: false,
        error: { message: 'Вакансия не найдена.' }
      });
    }

    res.status(200).json({
      success: true,
      data: { message: 'Вакансия удалена.' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Ошибка при удалении вакансии.' }
    });
  }
});

export default router;
