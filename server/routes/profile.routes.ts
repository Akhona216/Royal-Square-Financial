import { Router } from 'express';
import { profileController } from '../controllers/profile.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);
router.post('/verify-banking', profileController.verifyBanking);
router.get('/audit-logs', profileController.getAuditLogs);

export default router;
