import { Router } from 'express';
import { adviserController } from '../controllers/adviser.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

router.use(authMiddleware);

// Adviser specific endpoints
router.get('/adviser/dashboard', adviserController.getDashboard);
router.get('/adviser/actions', adviserController.getActions);
router.get('/adviser/clients', adviserController.getClients);
router.get('/adviser/clients/:id', adviserController.getClientDeepDive);
router.get('/adviser/tasks', adviserController.getTasks);
router.post('/adviser/tasks', adviserController.createTask);
router.put('/adviser/tasks/:id', adviserController.updateTask);
router.get('/adviser/calendar', adviserController.getCalendar);
router.post('/adviser/calendar', adviserController.createAppointment);

// Shared client & adviser policies and documents endpoints
router.get('/policies', adviserController.getPolicies);
router.get('/documents', adviserController.getDocuments);
router.post('/documents', adviserController.uploadDocument);

export default router;
