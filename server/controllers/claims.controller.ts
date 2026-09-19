import { Request, Response, NextFunction } from 'express';
import { claimsService } from '../services/claims.service.js';

export class ClaimsController {
  async getClaims(req: Request, res: Response, Next: NextFunction) {
    try {
      const clientId = (req.query.clientId as string) || (req as any).user?.id;
      const status = req.query.status as string;
      const insurer = req.query.insurer as string;
      const claims = await claimsService.getClaims({
        clientId: (req as any).user?.role === 'adviser' && req.query.all === 'true' ? undefined : clientId,
        status,
        insurer,
      });
      return res.status(200).json({ success: true, data: claims });
    } catch (error: any) {
      Next(error);
    }
  }

  async getClaimById(req: Request, res: Response, Next: NextFunction) {
    try {
      const { id } = req.params;
      const claim = await claimsService.getClaimById(id);
      if (!claim) {
        return res.status(404).json({ success: false, message: 'Claim not found' });
      }
      return res.status(200).json({ success: true, data: claim });
    } catch (error: any) {
      Next(error);
    }
  }

  async createClaim(req: Request, res: Response, Next: NextFunction) {
    try {
      const clientId = req.body.clientId || (req as any).user?.id || 'usr_client_001';
      const claim = await claimsService.submitMotorClaim({
        clientId,
        ...req.body,
      });
      return res.status(201).json({ success: true, data: claim });
    } catch (error: any) {
      Next(error);
    }
  }

  async updateClaimStatus(req: Request, res: Response, Next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, stage, note } = req.body;
      if (!status) {
        return res.status(400).json({ success: false, message: 'Status is required' });
      }
      const updated = await claimsService.updateClaimStatus(id, status, stage, note);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Claim not found' });
      }
      return res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      Next(error);
    }
  }
}

export const claimsController = new ClaimsController();
