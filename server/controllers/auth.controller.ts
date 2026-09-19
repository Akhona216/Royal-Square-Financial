import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';

export class AuthController {
  async login(req: Request, res: Response, Next: NextFunction) {
    try {
      const { email, role } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email address is required' });
      }
      const result = await authService.login(email, role);
      return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      Next(error);
    }
  }

  async register(req: Request, res: Response, Next: NextFunction) {
    try {
      const { email, name, role, phone, idNumber } = req.body;
      if (!email || !name || !role) {
        return res.status(400).json({ success: false, message: 'Email, name, and role are required' });
      }
      const result = await authService.register({ email, name, role, phone, idNumber });
      return res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      Next(error);
    }
  }

  async me(req: Request, res: Response, Next: NextFunction) {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      return res.status(200).json({ success: true, data: { user } });
    } catch (error: any) {
      Next(error);
    }
  }
}

export const authController = new AuthController();
