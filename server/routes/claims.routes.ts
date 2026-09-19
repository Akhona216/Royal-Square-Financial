import { Router } from 'express';
import { claimsController } from '../controllers/claims.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', claimsController.getClaims);
router.post('/', claimsController.createClaim);
router.get('/:id', claimsController.getClaimById);
router.put('/:id/status', claimsController.updateClaimStatus);

export default router;
