import express, { Express } from 'express';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';

export function createExpressApp(): Express {
  const app = express();

  // Basic middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS headers for client-server decoupling
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-User-Role, X-Client-Id');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', platform: 'Royal Square Financial (Pty) Ltd REST API', timestamp: new Date().toISOString() });
  });

  // Mount API router on both /api/v1 and /api for compatibility
  app.use('/api/v1', apiRouter);
  app.use('/api', apiRouter);

  // Centralized error handling
  app.use(errorHandler);

  return app;
}

export default createExpressApp;
