import { Router } from 'express';
import { financeController } from '../controllers/finance.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', financeController.getFinances);
router.post('/assets', financeController.addAsset);
router.post('/liabilities', financeController.addLiability);
router.delete('/assets/:id', financeController.deleteAsset);
router.delete('/liabilities/:id', financeController.deleteLiability);

export default router;
