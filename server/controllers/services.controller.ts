import { Request, Response, NextFunction } from 'express';
import { servicesService } from '../services/services.service.js';
import { notificationsService } from '../services/notifications.service.js';

export class ServicesController {
  async getServiceRequests(req: Request, res: Response, Next: NextFunction) {
    try {
      const clientId = (req.query.clientId as string) || (req as any).user?.id;
      const status = req.query.status as string;
      const type = req.query.type as string;

      const requests = await servicesService.getServiceRequests({
        clientId: (req as any).user?.role === 'adviser' && req.query.all === 'true' ? undefined : clientId,
        status,
        type,
      });
      return res.status(200).json({ success: true, data: requests });
    } catch (error: any) {
      Next(error);
    }
  }

  async createServiceRequest(req: Request, res: Response, Next: NextFunction) {
    try {
      const clientId = req.body.clientId || (req as any).user?.id || 'usr_client_001';
      const clientName = req.body.clientName || (req as any).user?.name || 'Sipho Dlamini';
      const { type, details, urgency, supportingDocuments } = req.body;

      if (!type || !details) {
        return res.status(400).json({ success: false, message: 'Type and details are required' });
      }

      const request = await servicesService.createServiceRequest({
        clientId,
        clientName,
        type,
        details,
        urgency,
        supportingDocuments,
      });

      // Dispatch real-time global notification
      notificationsService.notifyServiceRequest(request, 'created');

      return res.status(201).json({ success: true, data: request });
    } catch (error: any) {
      Next(error);
    }
  }

  async updateServiceRequest(req: Request, res: Response, Next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await servicesService.updateServiceRequest(id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Service request not found' });
      }

      // Dispatch notification for service request status/note update
      notificationsService.notifyServiceRequest(updated, 'updated');

      return res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      Next(error);
    }
  }
}

export const servicesController = new ServicesController();

