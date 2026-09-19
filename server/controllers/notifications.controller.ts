import { Request, Response, NextFunction } from 'express';
import { notificationsService } from '../services/notifications.service.js';

export class NotificationsController {
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const role = (req.headers['x-user-role'] as 'client' | 'adviser') || user?.role || 'client';
      const clientId = (req.headers['x-client-id'] as string) || user?.id || (role === 'client' ? 'usr_client_001' : undefined);

      const result = await notificationsService.getNotifications(role, clientId);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const success = await notificationsService.markAsRead(id);
      return res.status(200).json({ success, message: 'Notification marked as read' });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const role = (req.headers['x-user-role'] as 'client' | 'adviser') || user?.role || 'client';
      const clientId = (req.headers['x-client-id'] as string) || user?.id || (role === 'client' ? 'usr_client_001' : undefined);

      const success = await notificationsService.markAllAsRead(role, clientId);
      return res.status(200).json({ success, message: 'All notifications marked as read' });
    } catch (error) {
      next(error);
    }
  }

  async dismissNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const success = await notificationsService.dismissNotification(id);
      return res.status(200).json({ success, message: 'Notification dismissed' });
    } catch (error) {
      next(error);
    }
  }

  async sendBirthdayGreeting(req: Request, res: Response, next: NextFunction) {
    try {
      const { clientId, clientName, message } = req.body;
      if (!clientId || !clientName) {
        return res.status(400).json({ success: false, message: 'clientId and clientName are required' });
      }

      const defaultMsg = `Dear ${clientName}, Johan van der Merwe and the Royal Square Financial team wish you a joyous and memorable birthday! May this milestone year bring continued financial security and compounding prosperity.`;
      const result = await notificationsService.sendBirthdayGreeting(
        clientId,
        clientName,
        message || defaultMsg
      );

      return res.status(200).json({
        success: true,
        message: 'Birthday greeting dispatched successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationsController = new NotificationsController();
