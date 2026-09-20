import { clientsRepository, ClientProfileSummary } from '../repositories/clients.repository.js';
import { claimsRepository } from '../repositories/claims.repository.js';
import { servicesRepository } from '../repositories/services.repository.js';
import { tasksRepository } from '../repositories/tasks.repository.js';
import { calendarRepository } from '../repositories/calendar.repository.js';
import { financeRepository } from '../repositories/finance.repository.js';
import { goalsRepository } from '../repositories/goals.repository.js';
import { policiesRepository, documentsRepository } from '../repositories/policies.repository.js';
import { auditRepository } from '../repositories/audit.repository.js';
import { TaskItem, CalendarAppointment, Policy, DocumentItem, Claim, ServiceRequest, AdviserActionItem } from '../repositories/types.js';

export class AdviserService {
  async getDashboardMetrics(adviserId: string) {
    const clients = await clientsRepository.getClients();
    const claims = await claimsRepository.getClaims();
    const serviceRequests = await servicesRepository.getServiceRequests();
    const tasks = await tasksRepository.getTasks(adviserId);
    const appointments = await calendarRepository.getAppointments(adviserId);
    const actions = await this.getActions(adviserId);

    const totalAum = clients.reduce((sum, c) => sum + (c.totalAum || 0), 0);
    const activeClaims = claims.filter(c => c.status !== 'Settled' && c.status !== 'Rejected');
    const activeClaimsRequiringAttention = activeClaims.length;
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
      claims: activeClaims,
      tasks: tasks.filter(t => t.status === 'Pending'),
      calendar: appointments.filter(a => a.status === 'Scheduled'),
      recentClaims: activeClaims.slice(0, 5),
      recentRequests: serviceRequests.slice(0, 5),
      todayTasks: tasks.filter(t => t.status === 'Pending').slice(0, 5),
      nextAppointments: appointments.filter(a => a.status === 'Scheduled').slice(0, 4),
      actions,
    };
  }

  async getActions(adviserId: string): Promise<AdviserActionItem[]> {
    const [clients, claims, serviceRequests, tasks, appointments, policies, documents, auditLogs] = await Promise.all([
      clientsRepository.getClients(),
      claimsRepository.getClaims(),
      servicesRepository.getServiceRequests(),
      tasksRepository.getTasks(adviserId),
      calendarRepository.getAppointments(adviserId),
      policiesRepository.getPolicies(),
      documentsRepository.getDocuments(),
      auditRepository.getLogs({ limit: 50 }),
    ]);

    const clientMap = new Map(clients.map((client) => [client.id, client]));
    const actions: AdviserActionItem[] = [];

    for (const claim of claims) {
      const client = clientMap.get(claim.clientId);
      if (!client) continue;

      if (claim.status === 'Pending' || claim.status === 'In Review') {
        actions.push({
          id: `action_claim_review_${claim.id}`,
          type: 'New claim requiring review',
          title: 'New Motor Claim',
          clientId: claim.clientId,
          clientName: client.name,
          priority: claim.status === 'Pending' ? 'Urgent' : 'High',
          status: 'New',
          dateTime: claim.createdAt,
          requiredAction: 'Review Claim',
          link: '/adviser/claims',
          recordType: 'claim',
          recordId: claim.id,
          claimNumber: claim.claimNumber,
          metadata: { claimId: claim.id, insurer: claim.insurer },
        });
      }

      if (claim.status === 'Ready for Collection' || claim.currentStage === 'Ready for Collection') {
        actions.push({
          id: `action_claim_update_${claim.id}`,
          type: 'Claim update requires adviser action',
          title: 'Vehicle Claim Update',
          clientId: claim.clientId,
          clientName: client.name,
          priority: 'High',
          status: 'Waiting',
          dateTime: claim.updatedAt,
          requiredAction: 'Notify/Update Client',
          link: '/adviser/claims',
          recordType: 'claim',
          recordId: claim.id,
          claimNumber: claim.claimNumber,
          metadata: { claimId: claim.id, status: claim.status },
        });
      }
    }

    for (const request of serviceRequests) {
      const client = clientMap.get(request.clientId);
      if (!client) continue;
      if (request.status === 'Submitted' || request.status === 'In Review') {
        actions.push({
          id: `action_sr_${request.id}`,
          type: 'New service request',
          title: `${request.type} Service Request`,
          clientId: request.clientId,
          clientName: client.name,
          priority: request.urgency === 'High' ? 'High' : request.urgency === 'Medium' ? 'Medium' : 'Low',
          status: 'New',
          dateTime: request.createdAt,
          requiredAction: 'Process Ticket',
          link: '/adviser/service-requests',
          recordType: 'service-request',
          recordId: request.id,
          claimNumber: request.referenceNumber,
          metadata: { requestType: request.type, urgency: request.urgency },
        });
      }
    }

    for (const doc of documents) {
      if (doc.verified === false) {
        const client = clientMap.get(doc.clientId);
        if (!client) continue;
        actions.push({
          id: `action_doc_${doc.id}`,
          type: 'Missing client document',
          title: 'Document Requires Review',
          clientId: doc.clientId,
          clientName: client.name,
          priority: 'Medium',
          status: 'Waiting',
          dateTime: doc.uploadDate,
          requiredAction: 'Review Document',
          link: `/adviser/clients/${doc.clientId}`,
          recordType: 'document',
          recordId: doc.id,
          metadata: { category: doc.category, fileName: doc.name },
        });
      }
    }

    for (const policy of policies) {
      const renewalDate = new Date(`${policy.renewalDate}T00:00:00Z`);
      const diffDays = Math.ceil((renewalDate.getTime() - new Date('2026-09-19T12:00:00Z').getTime()) / 86400000);
      const client = clientMap.get(policy.clientId);
      if (!client) continue;
      if (policy.status === 'Pending Renewal' || diffDays <= 45) {
        actions.push({
          id: `action_policy_${policy.id}`,
          type: 'Policy renewal approaching',
          title: 'Policy Renewal Approaching',
          clientId: policy.clientId,
          clientName: client.name,
          priority: diffDays <= 14 ? 'High' : 'Medium',
          status: 'Waiting',
          dateTime: policy.renewalDate,
          requiredAction: 'Review Renewal',
          link: `/adviser/clients/${policy.clientId}`,
          recordType: 'policy',
          recordId: policy.id,
          metadata: { policyNumber: policy.policyNumber, renewalDate: policy.renewalDate },
        });
      }
    }

    for (const task of tasks) {
      if (task.status === 'Pending') {
        const client = clientMap.get(task.clientId || '');
        if (!client) continue;
        actions.push({
          id: `action_task_${task.id}`,
          type: 'Adviser follow-up',
          title: task.title,
          clientId: task.clientId || '',
          clientName: client.name,
          priority: task.priority,
          status: 'In Progress',
          dateTime: task.dueDate,
          requiredAction: 'Complete Task',
          link: '/adviser/tasks',
          recordType: 'task',
          recordId: task.id,
          metadata: { category: task.category },
        });
      }
    }

    for (const appointment of appointments) {
      if (appointment.status === 'Scheduled' && appointment.type === 'Financial Review') {
        const client = clientMap.get(appointment.clientId);
        if (!client) continue;
        actions.push({
          id: `action_review_${appointment.id}`,
          type: 'Upcoming client review',
          title: 'Upcoming Client Review',
          clientId: appointment.clientId,
          clientName: client.name,
          priority: 'Medium',
          status: 'Waiting',
          dateTime: `${appointment.date}T${appointment.time}:00Z`,
          requiredAction: 'Prepare for Review',
          link: '/adviser/calendar',
          recordType: 'calendar',
          recordId: appointment.id,
          metadata: { title: appointment.title, date: appointment.date },
        });
      }
    }

    for (const log of auditLogs) {
      if (log.category === 'profile' && (log.action === 'PROFILE_UPDATED' || log.action === 'BANKING_DETAILS_CHANGED')) {
        const client = clientMap.get(log.userId);
        if (!client) continue;
        actions.push({
          id: `action_profile_${log.id}`,
          type: 'Client profile updated',
          title: 'Profile Update Requires Review',
          clientId: log.userId,
          clientName: client.name,
          priority: 'Medium',
          status: 'New',
          dateTime: log.timestamp,
          requiredAction: 'Review Client Profile Change',
          link: `/adviser/clients/${log.userId}`,
          recordType: 'profile',
          recordId: log.entityId,
          metadata: { action: log.action },
        });
      }
    }

    return actions
      .sort((a, b) => {
        const priorityOrder = { Urgent: 0, High: 1, Medium: 2, Low: 3 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
      })
      .slice(0, 50);
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
