import { Router } from 'express';
import { claimsController } from '../controllers/claims.controller.js';

const router = Router();

// Mock B2B Telemetry Webhook endpoint for insurer vehicle repair updates
// POST /api/providers/:provider/claims/:claimNumber/updates
router.post('/:provider/claims/:claimNumber/updates', (req, res, next) => {
  claimsController.receiveProviderRepairUpdate(req, res, next);
});

export default router;
