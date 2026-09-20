import { Request, Response, NextFunction } from 'express';
import { adviserService } from '../services/adviser.service.js';
import { policiesRepository, documentsRepository } from '../repositories/policies.repository.js';

export class AdviserController {
  async getDashboard(req: Request, res: Response, Next: NextFunction) {
    try {
      const adviserId = (req as any).user?.id || 'usr_adv_001';
      const metrics = await adviserService.getDashboardMetrics(adviserId);
      return res.status(200).json({ success: true, data: metrics });
    } catch (error: any) {
      Next(error);
    }
  }

  async getActions(req: Request, res: Response, Next: NextFunction) {
    try {
      const adviserId = (req as any).user?.id || 'usr_adv_001';
      const actions = await adviserService.getActions(adviserId);
      return res.status(200).json({ success: true, data: actions });
    } catch (error: any) {
      Next(error);
    }
  }

  async getClients(req: Request, res: Response, Next: NextFunction) {
    try {
      const query = req.query.q as string;
      const clients = await adviserService.getClients(query);
      return res.status(200).json({ success: true, data: clients });
    } catch (error: any) {
      Next(error);
    }
  }

  async getClientDeepDive(req: Request, res: Response, Next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await adviserService.getClientDeepDive(id);
      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      Next(error);
    }
  }

  async getTasks(req: Request, res: Response, Next: NextFunction) {
    try {
      const adviserId = (req as any).user?.id || 'usr_adv_001';
      const filter = req.query.filter as string;
      const tasks = await adviserService.getTasks(adviserId, filter);
      return res.status(200).json({ success: true, data: tasks });
    } catch (error: any) {
      Next(error);
    }
  }

  async createTask(req: Request, res: Response, Next: NextFunction) {
    try {
      const adviserId = (req as any).user?.id || 'usr_adv_001';
      const { title, dueDate, priority, category, clientId, clientName } = req.body;
      if (!title || !dueDate || !priority) {
        return res.status(400).json({ success: false, message: 'Title, dueDate, and priority are required' });
      }
      const task = await adviserService.createTask({
        adviserId,
        title,
        dueDate,
        priority,
        status: 'Pending',
        category: category || 'Review',
        clientId,
        clientName,
      });
      return res.status(201).json({ success: true, data: task });
    } catch (error: any) {
      Next(error);
    }
  }

  async updateTask(req: Request, res: Response, Next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await adviserService.updateTask(id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }
      return res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      Next(error);
    }
  }

  async getCalendar(req: Request, res: Response, Next: NextFunction) {
    try {
      const adviserId = (req as any).user?.id || 'usr_adv_001';
      const appointments = await adviserService.getAppointments(adviserId);
      return res.status(200).json({ success: true, data: appointments });
    } catch (error: any) {
      Next(error);
    }
  }

  async createAppointment(req: Request, res: Response, Next: NextFunction) {
    try {
      const adviserId = (req as any).user?.id || 'usr_adv_001';
      const { clientId, clientName, title, type, date, time, durationMinutes, location, notes } = req.body;
      if (!title || !date || !time) {
        return res.status(400).json({ success: false, message: 'Title, date, and time are required' });
      }
      const apt = await adviserService.createAppointment({
        adviserId,
        clientId: clientId || 'usr_client_001',
        clientName: clientName || 'Sipho Dlamini',
        title,
        type: type || 'Client Consultation',
        date,
        time,
        durationMinutes: durationMinutes ? Number(durationMinutes) : 45,
        location: location || 'Royal Square Financial Sandton / Online',
        notes,
        status: 'Scheduled',
      });
      return res.status(201).json({ success: true, data: apt });
    } catch (error: any) {
      Next(error);
    }
  }

  async getPolicies(req: Request, res: Response, Next: NextFunction) {
    try {
      const clientId = (req.query.clientId as string) || (req as any).user?.id;
      const policies = await policiesRepository.getPolicies(clientId);
      return res.status(200).json({ success: true, data: policies });
    } catch (error: any) {
      Next(error);
    }
  }

  async getDocuments(req: Request, res: Response, Next: NextFunction) {
    try {
      const clientId = (req.query.clientId as string) || (req as any).user?.id;
      const category = req.query.category as string;
      const documents = await documentsRepository.getDocuments(clientId, category);
      return res.status(200).json({ success: true, data: documents });
    } catch (error: any) {
      Next(error);
    }
  }

  async uploadDocument(req: Request, res: Response, Next: NextFunction) {
    try {
      const clientId = req.body.clientId || (req as any).user?.id || 'usr_client_001';
      const { name, category, fileSize, fileType } = req.body;
      if (!name || !category) {
        return res.status(400).json({ success: false, message: 'Document name and category are required' });
      }
      const doc = await documentsRepository.uploadDocument({
        clientId,
        name,
        category,
        fileSize: fileSize || '1.4 MB',
        fileType: fileType || 'application/pdf',
      });
      return res.status(201).json({ success: true, data: doc });
    } catch (error: any) {
      Next(error);
    }
  }
}

export const adviserController = new AdviserController();
