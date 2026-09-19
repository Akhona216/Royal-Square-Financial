import { Request, Response, NextFunction } from 'express';
import { integrationsService } from '../services/integrations.service.js';

export class IntegrationsController {
  async getIntegrations(req: Request, res: Response, Next: NextFunction) {
    try {
      const integrations = await integrationsService.getIntegrations();
      return res.status(200).json({ success: true, data: integrations });
    } catch (error: any) {
      Next(error);
    }
  }

  async syncIntegration(req: Request, res: Response, Next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await integrationsService.syncIntegration(id);
      return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      Next(error);
    }
  }

  async updateStatus(req: Request, res: Response, Next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await integrationsService.updateIntegrationStatus(id, status);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Integration not found' });
      }
      return res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      Next(error);
    }
  }
}

export const integrationsController = new IntegrationsController();
