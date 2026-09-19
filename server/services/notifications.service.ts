import { notificationsRepository } from '../repositories/notifications.repository.js';
import { NotificationItem, NotificationStats } from '../repositories/types.js';

export class NotificationsService {
  async getNotifications(role: 'client' | 'adviser', clientId?: string): Promise<{
    notifications: NotificationItem[];
    stats: NotificationStats;
  }> {
    return notificationsRepository.getNotifications(role, clientId);
  }

  async markAsRead(id: string): Promise<boolean> {
    return notificationsRepository.markAsRead(id);
  }

  async markAllAsRead(role: 'client' | 'adviser', clientId?: string): Promise<boolean> {
    const data = await notificationsRepository.getNotifications(role, clientId);
    for (const item of data.notifications) {
      notificationsRepository.markAsRead(item.id);
    }
    return true;
  }

  async dismissNotification(id: string): Promise<boolean> {
    return notificationsRepository.dismissNotification(id);
  }

  async sendBirthdayGreeting(clientId: string, clientName: string, message: string) {
    if (!clientId || !clientName) {
      throw new Error('Client ID and Client Name are required');
    }
    return notificationsRepository.sendBirthdayGreeting(clientId, clientName, message);
  }

  notifyServiceRequest(serviceRequest: any, eventType: 'created' | 'updated'): void {
    notificationsRepository.addServiceRequestNotification(serviceRequest, eventType);
  }

  notifyClaimUpdate(payload: {
    claim: any;
    provider: string;
    stage: string;
    notes?: string;
    repairerName?: string;
  }) {
    return notificationsRepository.addClaimUpdateNotification(payload);
  }
}

export const notificationsService = new NotificationsService();
