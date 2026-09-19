import { Request, Response, NextFunction } from 'express';
import { profileService, ProfileUpdateActor } from '../services/profile.service.js';
import { auditRepository } from '../repositories/audit.repository.js';

export class ProfileController {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user || { id: 'usr_client_001', role: 'client' };
      // Allow adviser to query a client's profile via query param if needed
      const targetUserId = (req.query.clientId as string) || user.id;

      const actor: ProfileUpdateActor = {
        id: user.id,
        role: user.role,
        name: user.name,
        ipAddress: req.ip || (req.headers['x-forwarded-for'] as string) || '127.0.0.1',
      };

      const data = await profileService.getProfile(targetUserId, actor);
      return res.status(200).json({
        success: true,
        data: data.profile,
        recentAuditLogs: data.recentAuditLogs,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user || { id: 'usr_client_001', role: 'client' };
      const targetUserId = (req.query.clientId as string) || user.id;

      const actor: ProfileUpdateActor = {
        id: user.id,
        role: user.role,
        name: user.name,
        ipAddress: req.ip || (req.headers['x-forwarded-for'] as string) || '127.0.0.1',
      };

      const result = await profileService.updateProfile(targetUserId, req.body, actor);

      return res.status(200).json({
        success: true,
        data: result.profile,
        auditEntry: result.auditEntry,
        sensitiveChangesFlagged: result.sensitiveChangesFlagged,
        message: result.sensitiveChangesFlagged
          ? 'Profile updated. Important: Banking detail changes are flagged for compliance verification.'
          : 'Personal information successfully updated.',
      });
    } catch (error: any) {
      next(error);
    }
  }

  async verifyBanking(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user || { id: 'usr_client_001', role: 'client' };
      const targetUserId = (req.query.clientId as string) || user.id;
      const { verificationMethod = 'Bank Confirmation Letter & FICA OTP' } = req.body;

      const actor: ProfileUpdateActor = {
        id: user.id,
        role: user.role,
        name: user.name,
        ipAddress: req.ip || (req.headers['x-forwarded-for'] as string) || '127.0.0.1',
      };

      const profile = await profileService.verifyBankingDetails(targetUserId, verificationMethod, actor);

      return res.status(200).json({
        success: true,
        data: profile,
        message: 'Banking details verified successfully. Debit order and payout routing activated.',
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user || { id: 'usr_client_001', role: 'client' };
      const targetUserId = (req.query.clientId as string) || user.id;

      const logs = await auditRepository.getLogs({
        userId: targetUserId,
        limit: 25,
      });

      return res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export const profileController = new ProfileController();
