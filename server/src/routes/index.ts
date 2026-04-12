import { Router } from 'express';
import authRouter from './authRouter';
import userRouter from './userRouter';
import enterpriseRouter from './enterpriseRouter';
import vacancyRouter from './vacancyRouter';
import testRouter from './testRouter';
import excursionRouter from './excursionRouter';
import fileRouter from './fileRouter';
import adminRouter from './adminRouter';

const router = Router();

// Routes
router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/enterprises', enterpriseRouter);
router.use('/vacancies', vacancyRouter);
router.use('/tests', testRouter);
router.use('/excursions', excursionRouter);
router.use('/files', fileRouter);
router.use('/admin', adminRouter);

export { router as routes };
