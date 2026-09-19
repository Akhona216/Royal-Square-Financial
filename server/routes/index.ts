import { Router } from 'express';
import authRoutes from './auth.routes.js';
import financeRoutes from './finance.routes.js';
import goalsRoutes from './goals.routes.js';
import claimsRoutes from './claims.routes.js';
import servicesRoutes from './services.routes.js';
import integrationsRoutes from './integrations.routes.js';
import notificationsRoutes from './notifications.routes.js';
import adviserRoutes from './adviser.routes.js';
import profileRoutes from './profile.routes.js';
import providersRoutes from './providers.routes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/finances', financeRoutes);
apiRouter.use('/goals', goalsRoutes);
apiRouter.use('/claims', claimsRoutes);
apiRouter.use('/service-requests', servicesRoutes);
apiRouter.use('/integrations', integrationsRoutes);
apiRouter.use('/notifications', notificationsRoutes);
apiRouter.use('/profile', profileRoutes);
apiRouter.use('/providers', providersRoutes);
apiRouter.use('/', adviserRoutes);

export default apiRouter;

