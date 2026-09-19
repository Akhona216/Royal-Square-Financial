import { clientsRepository, ClientProfileSummary } from '../repositories/clients.repository.js';
import { claimsRepository } from '../repositories/claims.repository.js';
import { servicesRepository } from '../repositories/services.repository.js';
import { tasksRepository } from '../repositories/tasks.repository.js';
import { calendarRepository } from '../repositories/calendar.repository.js';
import { financeRepository } from '../repositories/finance.repository.js';
import { goalsRepository } from '../repositories/goals.repository.js';
import { policiesRepository, documentsRepository } from '../repositories/policies.repository.js';
import { TaskItem, CalendarAppointment, Policy, DocumentItem, Claim, ServiceRequest } from '../repositories/types.js';

export class AdviserService {
  async getDashboardMetrics(adviserId: string) {
    const clients = await clientsRepository.getClients();
    const claims = await claimsRepository.getClaims();
    const serviceRequests = await servicesRepository.getServiceRequests();
    const tasks = await tasksRepository.getTasks(adviserId);
    const appointments = await calendarRepository.getAppointments(adviserId);

    const totalAum = clients.reduce((sum, c) => sum + (c.totalAum || 0), 0);
    const activeClaimsRequiringAttention = claims.filter(c => c.status !== 'Settled' && c.status !== 'Rejected').length;
    const pendingServiceRequests = serviceRequests.filter(r => r.status === 'Submitted' || r.status === 'In Review').length;
    const pendingTasksCount = tasks.filter(t => t.status === 'Pending').length;
    const upcomingReviewsCount = appointments.filter(a => a.type === 'Financial Review' && a.status === 'Scheduled').length;

    return {
      clientCount: clients.length,
      totalAum,
      activeClaimsRequiringAttention,
      pendingServiceRequests,
      pendingTasksCount,
      upcomingReviewsCount,
      recentClaims: claims.slice(0, 5),
      recentRequests: serviceRequests.slice(0, 5),
      todayTasks: tasks.filter(t => t.status === 'Pending').slice(0, 5),
      nextAppointments: appointments.filter(a => a.status === 'Scheduled').slice(0, 4),
    };
  }

  async getClientDeepDive(clientId: string) {
    const profile = await clientsRepository.getClientById(clientId);
    if (!profile) {
      throw new Error(`Client ${clientId} not found`);
    }

    const finances = await financeRepository.getFinancialPosition(clientId);
    const goals = await goalsRepository.getGoals(clientId);
    const claims = await claimsRepository.getClaims({ clientId });
    const requests = await servicesRepository.getServiceRequests({ clientId });
    const policies = await policiesRepository.getPolicies(clientId);
    const documents = await documentsRepository.getDocuments(clientId);

    return {
      profile,
      finances,
      goals,
      claims,
      requests,
      policies,
      documents,
    };
  }

  async getClients(query?: string): Promise<ClientProfileSummary[]> {
    return clientsRepository.getClients(query);
  }

  async getTasks(adviserId: string, filterStatus?: string): Promise<TaskItem[]> {
    const tasks = await tasksRepository.getTasks(adviserId);
    if (!filterStatus || filterStatus === 'All') return tasks;

    const todayStr = '2026-09-19'; // anchored local date
    if (filterStatus === 'Due Today') {
      return tasks.filter(t => t.dueDate === todayStr && t.status === 'Pending');
    }
    if (filterStatus === 'Upcoming') {
      return tasks.filter(t => t.dueDate > todayStr && t.status === 'Pending');
    }
    if (filterStatus === 'Overdue') {
      return tasks.filter(t => t.dueDate < todayStr && t.status === 'Pending');
    }
    if (filterStatus === 'Completed') {
      return tasks.filter(t => t.status === 'Completed');
    }
    return tasks;
  }

  async createTask(data: Omit<TaskItem, 'id'>): Promise<TaskItem> {
    return tasksRepository.createTask(data);
  }

  async updateTask(id: string, updates: Partial<TaskItem>): Promise<TaskItem | null> {
    return tasksRepository.updateTask(id, updates);
  }

  async getAppointments(adviserId: string): Promise<CalendarAppointment[]> {
    return calendarRepository.getAppointments(adviserId);
  }

  async createAppointment(data: Omit<CalendarAppointment, 'id'>): Promise<CalendarAppointment> {
    return calendarRepository.createAppointment(data);
  }
}

export const adviserService = new AdviserService();
