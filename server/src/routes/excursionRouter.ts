import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { body, validationResult } from 'express-validator';
import { excursionStore, CreateExcursionDto, UpdateExcursionDto } from '../stores/excursionStore';
import { enterpriseStore } from '../stores/enterpriseStore';
import { userStore } from '../stores/userStore';
import { generateReferralPDF, ReferralData } from '../services/pdfService';

const router = Router();

// @route   GET /api/excursions
// @desc    Get all available excursions
// @access  Public
router.get('/', async (req: Request, res: Response) => {
  try {
    const excursions = excursionStore.getAllExcursions({ isActive: true });

    const excursionsWithEnterprise = excursions.map(e => {
      const enterprise = enterpriseStore.findById(e.enterprise_id);
      return {
        ...e,
        enterpriseName: enterprise?.name || 'Неизвестно'
      };
    });

    res.status(200).json({
      success: true,
      data: { excursions: excursionsWithEnterprise }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Ошибка при получении экскурсий.' }
    });
  }
});

// @route   POST /api/excursions
// @desc    Create excursion (Admin only)
// @access  Private/Admin
router.post('/', [authenticate, authorize('admin')], [
  body('enterpriseId').isInt({ min: 1 }).withMessage('Укажите предприятие.'),
  body('title').trim().notEmpty().withMessage('Название обязательно.'),
  body('dateTime').notEmpty().withMessage('Укажите дату.'),
  body('excursionType').isIn(['online', 'offline']).withMessage('Тип: online или offline.')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Ошибка валидации.', details: errors.array() }
      });
    }

    const enterprise = enterpriseStore.findById(req.body.enterpriseId);
    if (!enterprise) {
      return res.status(404).json({
        success: false,
        error: { message: 'Предприятие не найдено.' }
      });
    }

    const dto: CreateExcursionDto = req.body;
    const excursion = excursionStore.create(dto);

    res.status(201).json({
      success: true,
      data: { message: 'Экскурсия создана.', excursion }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Ошибка при создании экскурсии.' }
    });
  }
});

// @route   PUT /api/excursions/:id
// @desc    Update excursion (Admin only)
// @access  Private/Admin
router.put('/:id', [authenticate, authorize('admin')], async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const dto: UpdateExcursionDto = req.body;

    const excursion = excursionStore.updateExcursion(id, dto);
    if (!excursion) {
      return res.status(404).json({
        success: false,
        error: { message: 'Экскурсия не найдена.' }
      });
    }

    res.status(200).json({
      success: true,
      data: { message: 'Экскурсия обновлена.', excursion }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Ошибка при обновлении экскурсии.' }
    });
  }
});

// @route   DELETE /api/excursions/:id
// @desc    Delete excursion (Admin only)
// @access  Private/Admin
router.delete('/:id', [authenticate, authorize('admin')], async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (!excursionStore.deleteExcursion(id)) {
      return res.status(404).json({
        success: false,
        error: { message: 'Экскурсия не найдена.' }
      });
    }

    res.status(200).json({
      success: true,
      data: { message: 'Экскурсия удалена.' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Ошибка при удалении экскурсии.' }
    });
  }
});

// @route   POST /api/excursions/:id/register
// @desc    Register for an excursion
// @access  Private
router.post('/:id/register', authenticate, async (req: Request, res: Response) => {
  try {
    const excursionId = parseInt(req.params.id);
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { message: 'Пользователь не авторизован.' }
      });
    }

    const registration = excursionStore.register(userId, excursionId);

    if (!registration) {
      return res.status(400).json({
        success: false,
        error: { message: 'Не удалось записаться. Возможно, мест нет или вы уже записаны.' }
      });
    }

    // TODO: Send notification to enterprise via n8n webhook

    res.status(201).json({
      success: true,
      data: {
        message: 'Вы записались на экскурсию.',
        registration
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Ошибка при записи на экскурсию.' }
    });
  }
});

// @route   DELETE /api/excursions/:id/register
// @desc    Unregister from an excursion
// @access  Private
router.delete('/:id/register', authenticate, async (req: Request, res: Response) => {
  try {
    const excursionId = parseInt(req.params.id);
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { message: 'Пользователь не авторизован.' }
      });
    }

    const removed = excursionStore.unregister(userId, excursionId);

    if (!removed) {
      return res.status(404).json({
        success: false,
        error: { message: 'Запись не найдена.' }
      });
    }

    res.status(200).json({
      success: true,
      data: { message: 'Вы отписались от экскурсии.' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Ошибка при отписке от экскурсии.' }
    });
  }
});

// @route   GET /api/excursions/my
// @desc    Get user's excursion registrations
// @access  Private
router.get('/my', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { message: 'Пользователь не авторизован.' }
      });
    }

    const registrations = excursionStore.getRegistrations({ userId });

    const registrationsWithDetails = registrations.map(reg => {
      const excursion = excursionStore.getExcursionById(reg.excursion_id);
      const enterprise = excursion ? enterpriseStore.findById(excursion.enterprise_id) : null;

      return {
        ...reg,
        excursionTitle: excursion?.title || '',
        enterpriseName: enterprise?.name || '',
        excursionDateTime: excursion?.date_time || '',
        excursionType: excursion?.excursion_type || 'offline'
      };
    });

    res.status(200).json({
      success: true,
      data: { registrations: registrationsWithDetails }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Ошибка при получении записей.' }
    });
  }
});

// @route   GET /api/excursions/registrations/:id/referral
// @desc    Download excursion referral PDF
// @access  Private
router.get('/registrations/:id/referral', authenticate, async (req: Request, res: Response) => {
  try {
    const registrationId = parseInt(req.params.id);
    console.log(`📄 Referral request: registrationId=${registrationId}, userId=${req.user?.userId}`);
    const registration = excursionStore.getRegistrationById(registrationId);
    console.log(`  Registration found: ${!!registration}, userId match: ${registration?.user_id === req.user?.userId}`);

    if (!registration || registration.user_id !== req.user?.userId) {
      return res.status(404).json({
        success: false,
        error: { message: 'Запись не найдена.' }
      });
    }

    const user = userStore.findById(registration.user_id);
    const excursion = excursionStore.getExcursionById(registration.excursion_id);
    const enterprise = excursion ? enterpriseStore.findById(excursion.enterprise_id) : null;

    if (!user || !excursion) {
      return res.status(404).json({
        success: false,
        error: { message: 'Данные не найдены.' }
      });
    }

    const referralData: ReferralData = {
      userName: user.name,
      userEmail: user.email,
      enterpriseName: enterprise?.name || 'Неизвестно',
      enterpriseAddress: enterprise?.address || '',
      enterpriseContact: enterprise ? `${enterprise.contact_email} / ${enterprise.contact_phone}` : '',
      excursionTitle: excursion.title,
      excursionDate: new Date(excursion.date_time).toLocaleString('ru-RU', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }),
      excursionType: excursion.excursion_type,
      referralNumber: `REF-${registration.id}-${new Date().getFullYear()}`,
      generatedAt: new Date().toLocaleString('ru-RU')
    };

    await generateReferralPDF(res, referralData);
  } catch (error) {
    console.error('❌ PDF generation error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Ошибка при генерации направления.', detail: error instanceof Error ? error.message : String(error) }
    });
  }
});

// @route   GET /api/excursions/registrations (Admin only)
// @desc    Get all excursion registrations (Admin)
// @access  Private/Admin
router.get('/registrations', authenticate, async (req: Request, res: Response) => {
  try {
    const registrations = excursionStore.getRegistrations();

    const registrationsWithDetails = registrations.map(reg => {
      const excursion = excursionStore.getExcursionById(reg.excursion_id);
      const enterprise = excursion ? enterpriseStore.findById(excursion.enterprise_id) : null;

      return {
        ...reg,
        excursionTitle: excursion?.title || '',
        enterpriseName: enterprise?.name || '',
        excursionDateTime: excursion?.date_time || '',
        excursionType: excursion?.excursion_type || 'offline'
      };
    });

    res.status(200).json({
      success: true,
      data: { registrations: registrationsWithDetails }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Ошибка при получении записей.' }
    });
  }
});

// @route   PUT /api/excursions/registrations/:id/status (Admin only)
// @desc    Update registration status (Admin)
// @access  Private/Admin
router.put('/registrations/:id/status', [authenticate, authorize('admin')], async (req: Request, res: Response) => {
  try {
    const registrationId = parseInt(req.params.id);
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Недопустимый статус.' }
      });
    }

    const registration = excursionStore.updateRegistrationStatus(registrationId, status);
    if (!registration) {
      return res.status(404).json({
        success: false,
        error: { message: 'Запись не найдена.' }
      });
    }

    res.status(200).json({
      success: true,
      data: { message: 'Статус обновлён.', registration }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Ошибка при обновлении статуса.' }
    });
  }
});

export default router;
