import { Router } from 'express';
import { integrationsController } from '../controllers/integrations.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', integrationsController.getIntegrations);
router.post('/:id/sync', integrationsController.syncIntegration);
router.put('/:id/status', integrationsController.updateStatus);

export default router;
