import { Router } from 'express';
import { notificationsController } from '../controllers/notifications.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', notificationsController.getNotifications);
router.post('/read-all', notificationsController.markAllAsRead);
router.post('/send-greeting', notificationsController.sendBirthdayGreeting);
router.post('/:id/read', notificationsController.markAsRead);
router.delete('/:id', notificationsController.dismissNotification);

export default router;
