import { Router } from 'express';
import { servicesController } from '../controllers/services.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', servicesController.getServiceRequests);
router.post('/', servicesController.createServiceRequest);
router.put('/:id', servicesController.updateServiceRequest);

export default router;
