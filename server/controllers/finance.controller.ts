import { Request, Response, NextFunction } from 'express';
import { financeService } from '../services/finance.service.js';

export class FinanceController {
  async getFinances(req: Request, res: Response, Next: NextFunction) {
    try {
      const clientId = (req.query.clientId as string) || (req as any).user?.id || 'usr_client_001';
      const summary = await financeService.getFinancialPositionSummary(clientId);
      return res.status(200).json({ success: true, data: summary });
    } catch (error: any) {
      Next(error);
    }
  }

  async addAsset(req: Request, res: Response, Next: NextFunction) {
    try {
      const clientId = req.body.clientId || (req as any).user?.id || 'usr_client_001';
      const { name, category, institution, currentValue, accountNumber, currency } = req.body;
      if (!name || !category || currentValue === undefined) {
        return res.status(400).json({ success: false, message: 'Missing required asset fields (name, category, currentValue)' });
      }
      const newAsset = await financeService.addAsset(clientId, {
        name,
        category,
        institution: institution || 'Self-Reported',
        currentValue: Number(currentValue),
        accountNumber,
        currency: currency || 'ZAR',
      });
      return res.status(201).json({ success: true, data: newAsset });
    } catch (error: any) {
      Next(error);
    }
  }

  async addLiability(req: Request, res: Response, Next: NextFunction) {
    try {
      const clientId = req.body.clientId || (req as any).user?.id || 'usr_client_001';
      const { name, category, institution, outstandingBalance, monthlyPayment, interestRate, currency } = req.body;
      if (!name || !category || outstandingBalance === undefined) {
        return res.status(400).json({ success: false, message: 'Missing required liability fields (name, category, outstandingBalance)' });
      }
      const newLiability = await financeService.addLiability(clientId, {
        name,
        category,
        institution: institution || 'Self-Reported',
        outstandingBalance: Number(outstandingBalance),
        monthlyPayment: Number(monthlyPayment || 0),
        interestRate: interestRate ? Number(interestRate) : undefined,
        currency: currency || 'ZAR',
      });
      return res.status(201).json({ success: true, data: newLiability });
    } catch (error: any) {
      Next(error);
    }
  }

  async deleteAsset(req: Request, res: Response, Next: NextFunction) {
    try {
      const clientId = (req.query.clientId as string) || (req as any).user?.id || 'usr_client_001';
      const { id } = req.params;
      const success = await financeService.deleteAsset(clientId, id);
      if (!success) {
        return res.status(404).json({ success: false, message: 'Asset not found' });
      }
      return res.status(200).json({ success: true, message: 'Asset deleted successfully' });
    } catch (error: any) {
      Next(error);
    }
  }

  async deleteLiability(req: Request, res: Response, Next: NextFunction) {
    try {
      const clientId = (req.query.clientId as string) || (req as any).user?.id || 'usr_client_001';
      const { id } = req.params;
      const success = await financeService.deleteLiability(clientId, id);
      if (!success) {
        return res.status(404).json({ success: false, message: 'Liability not found' });
      }
      return res.status(200).json({ success: true, message: 'Liability deleted successfully' });
    } catch (error: any) {
      Next(error);
    }
  }
}

export const financeController = new FinanceController();
