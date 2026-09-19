import { Request, Response, NextFunction } from 'express';
import { goalsService } from '../services/goals.service.js';

export class GoalsController {
  async getGoals(req: Request, res: Response, Next: NextFunction) {
    try {
      const clientId = (req.query.clientId as string) || (req as any).user?.id || 'usr_client_001';
      const result = await goalsService.getClientGoals(clientId);
      return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      Next(error);
    }
  }

  async createGoal(req: Request, res: Response, Next: NextFunction) {
    try {
      const clientId = req.body.clientId || (req as any).user?.id || 'usr_client_001';
      const { title, category, targetAmount, currentAmount, monthlyContribution, targetDate, notes } = req.body;
      if (!title || !category || !targetAmount || !targetDate) {
        return res.status(400).json({ success: false, message: 'Missing required goal fields (title, category, targetAmount, targetDate)' });
      }
      const goal = await goalsService.createGoal(clientId, {
        title,
        category,
        targetAmount: Number(targetAmount),
        currentAmount: Number(currentAmount || 0),
        monthlyContribution: Number(monthlyContribution || 0),
        targetDate,
        notes,
        status: 'on_track',
      });
      return res.status(201).json({ success: true, data: goal });
    } catch (error: any) {
      Next(error);
    }
  }

  async updateGoal(req: Request, res: Response, Next: NextFunction) {
    try {
      const clientId = (req.query.clientId as string) || (req as any).user?.id || 'usr_client_001';
      const { id } = req.params;
      const updated = await goalsService.updateGoal(clientId, id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Goal not found' });
      }
      return res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      Next(error);
    }
  }

  async deleteGoal(req: Request, res: Response, Next: NextFunction) {
    try {
      const clientId = (req.query.clientId as string) || (req as any).user?.id || 'usr_client_001';
      const { id } = req.params;
      const deleted = await goalsService.deleteGoal(clientId, id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Goal not found' });
      }
      return res.status(200).json({ success: true, message: 'Goal removed successfully' });
    } catch (error: any) {
      Next(error);
    }
  }
}

export const goalsController = new GoalsController();
