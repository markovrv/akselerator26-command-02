import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { body, validationResult } from 'express-validator';
import { enterpriseStore, CreateEnterpriseDto, UpdateEnterpriseDto } from '../stores/enterpriseStore';
import { vacancyStore } from '../stores/vacancyStore';

const router = Router();

// @route   GET /api/enterprises
// @desc    Get all enterprises
// @access  Public
router.get('/', async (req: Request, res: Response) => {
  try {
    const { city, isActive } = req.query;
    const filters: { isActive?: boolean; city?: string } = {};

    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (city) filters.city = city as string;

    const enterprises = enterpriseStore.getAll(filters);

    // Добавляем счётчик вакансий
    const enterprisesWithCount = enterprises.map(e => ({
      ...e,
      vacanciesCount: vacancyStore.getByEnterpriseId(e.id).length
    }));

    res.status(200).json({
      success: true,
      data: { enterprises: enterprisesWithCount }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Ошибка при получении списка предприятий.' }
    });
  }
});

// @route   GET /api/enterprises/:id
// @desc    Get enterprise by ID
// @access  Public
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const enterprise = enterpriseStore.findById(id);

    if (!enterprise) {
      return res.status(404).json({
        success: false,
        error: { message: 'Предприятие не найдено.' }
      });
    }

    const vacancies = vacancyStore.getByEnterpriseId(id);

    res.status(200).json({
      success: true,
      data: {
        enterprise: {
          ...enterprise,
          vacancies
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Ошибка при получении предприятия.' }
    });
  }
});

// @route   POST /api/enterprises
// @desc    Create enterprise (Admin only)
// @access  Private/Admin
router.post('/', [authenticate, authorize('admin')], [
  body('name').trim().notEmpty().withMessage('Название обязательно.'),
  body('contactEmail').optional().isEmail().withMessage('Некорректный email.'),
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

    const dto: CreateEnterpriseDto = req.body;
    const enterprise = enterpriseStore.create(dto);

    res.status(201).json({
      success: true,
      data: {
        message: 'Предприятие создано.',
        enterprise
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Ошибка при создании предприятия.' }
    });
  }
});

// @route   PUT /api/enterprises/:id
// @desc    Update enterprise (Admin only)
// @access  Private/Admin
router.put('/:id', [authenticate, authorize('admin')], async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const dto: UpdateEnterpriseDto = req.body;

    const enterprise = enterpriseStore.update(id, dto);
    if (!enterprise) {
      return res.status(404).json({
        success: false,
        error: { message: 'Предприятие не найдено.' }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        message: 'Предприятие обновлено.',
        enterprise
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Ошибка при обновлении предприятия.' }
    });
  }
});

// @route   DELETE /api/enterprises/:id
// @desc    Delete enterprise (Admin only)
// @access  Private/Admin
router.delete('/:id', [authenticate, authorize('admin')], async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (!enterpriseStore.delete(id)) {
      return res.status(404).json({
        success: false,
        error: { message: 'Предприятие не найдено.' }
      });
    }

    res.status(200).json({
      success: true,
      data: { message: 'Предприятие удалено.' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Ошибка при удалении предприятия.' }
    });
  }
});

export default router;
