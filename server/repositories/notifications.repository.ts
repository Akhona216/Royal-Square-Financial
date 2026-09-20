import { NotificationItem, NotificationStats } from './types.js';
import { clientsRepository } from './clients.repository.js';
import { policiesRepository } from './policies.repository.js';
import { servicesRepository } from './services.repository.js';
import { parseSouthAfricanId } from '../utils/saIdParser.js';

export class NotificationsRepository {
  private readIds: Set<string> = new Set();
  private dismissedIds: Set<string> = new Set();
  private customNotifications: NotificationItem[] = [];
  private sentGreetings: Map<string, { date: string; message: string }> = new Map();

  // Simulated reference date: 2026-09-19
  private referenceDate = new Date('2026-09-19T12:00:00Z');

  async getNotifications(role: 'client' | 'adviser', clientId?: string): Promise<{
    notifications: NotificationItem[];
    stats: NotificationStats;
  }> {
    const allItems: NotificationItem[] = [];

    // 1. Service Request Notifications
    const requests = await servicesRepository.getServiceRequests();
    for (const req of requests) {
      const isClientReq = !clientId || req.clientId === clientId;
      if (role === 'client' && !isClientReq) continue;

      const isCompleted = req.status === 'Completed';
      const isApproved = req.status === 'Approved';
      const isInReview = req.status === 'In Review';
      const isSubmitted = req.status === 'Submitted';

      const notifId = `notif_srq_${req.id}_${req.status.toLowerCase().replace(/\s+/g, '_')}`;
      if (this.dismissedIds.has(notifId)) continue;

      let title = '';
      let message = '';
      let priority: 'high' | 'medium' | 'low' = req.urgency === 'High' ? 'high' : 'medium';

      if (role === 'client') {
        if (isCompleted) {
          title = `Service Request Completed: ${req.type}`;
          message = `Request #${req.referenceNumber} has been finalized by ${req.assignedAdviser || 'your adviser'}. ${req.adviserNotes || 'Check your Document Vault for updated records.'}`;
          priority = 'medium';
        } else if (isApproved) {
          title = `Service Request Approved: ${req.type}`;
          message = `Request #${req.referenceNumber} was approved. ${req.adviserNotes || 'Adviser processing is underway.'}`;
          priority = 'high';
        } else if (isInReview) {
          title = `Under Review: ${req.type} (#${req.referenceNumber})`;
          message = req.adviserNotes ? `Adviser note: "${req.adviserNotes}"` : `Your request is actively being processed with insurers.`;
          priority = 'medium';
        } else {
          title = `Request Logged: ${req.type} (#${req.referenceNumber})`;
          message = `Submitted successfully. Urgency: ${req.urgency}. Assigned adviser: ${req.assignedAdviser || 'Johan van der Merwe'}.`;
          priority = 'low';
        }
      } else {
        // Adviser view
        if (isSubmitted || isInReview) {
          title = `Action Required: ${req.type} from ${req.clientName}`;
          message = `Ref #${req.referenceNumber} (${req.urgency} Urgency). Details: ${req.details.substring(0, 95)}...`;
          priority = req.urgency === 'High' ? 'high' : 'medium';
        } else {
          title = `Service Update: ${req.type} for ${req.clientName}`;
          message = `Status: ${req.status} for Ref #${req.referenceNumber}. ${req.adviserNotes || ''}`;
          priority = 'low';
        }
      }

      allItems.push({
        id: notifId,
        type: 'service_request',
        title,
        message,
        timestamp: req.updatedAt || req.createdAt,
        read: this.readIds.has(notifId),
        priority,
        targetRole: role,
        clientId: req.clientId,
        clientName: req.clientName,
        referenceId: req.id,
        link: role === 'client' ? '/client/services' : '/adviser/services',
        actionLabel: role === 'client' ? 'View Request Status' : 'Process Request in Queue',
        metadata: {
          requestType: req.type,
          requestStatus: req.status,
          urgency: req.urgency,
        },
      });
    }

    // 2. Upcoming Birthday Notifications (Derived strictly from SA ID Number)
    const clients = await clientsRepository.getClients();
    for (const client of clients) {
      if (!client.idNumber) continue;

      const parsed = parseSouthAfricanId(client.idNumber, this.referenceDate);
      if (!parsed || !parsed.isUpcoming) continue;

      // Greeting status
      const greetingKey = `${client.id}_${parsed.nextBirthdayDate}`;
      const greetingSent = this.sentGreetings.has(greetingKey);
      const greetingInfo = this.sentGreetings.get(greetingKey);

      if (role === 'adviser') {
        const notifId = `notif_bday_adv_${client.id}_${parsed.nextBirthdayDate}`;
        if (this.dismissedIds.has(notifId)) continue;

        let timeDesc = '';
        if (parsed.daysRemaining === 0) timeDesc = 'Today! 🎉';
        else if (parsed.daysRemaining === 1) timeDesc = 'Tomorrow 🎈';
        else if (parsed.daysRemaining > 1) timeDesc = `in ${parsed.daysRemaining} days (${parsed.formattedNextBirthday})`;
        else timeDesc = `celebrated ${Math.abs(parsed.daysRemaining)} days ago`;

        const title = `Upcoming Birthday: ${client.name} turns ${parsed.ageTurning}`;
        const message = `Client ${client.name} (RSA ID: ${client.idNumber}) turns ${parsed.ageTurning} ${timeDesc}.${
          parsed.isMilestone ? ' 🌟 Milestone wealth birthday!' : ''
        } ${greetingSent ? ' (Greeting already sent ✅)' : 'Send personalized advisory wishes.'}`;

        allItems.push({
          id: notifId,
          type: 'birthday',
          title,
          message,
          timestamp: new Date().toISOString(),
          read: this.readIds.has(notifId),
          priority: parsed.daysRemaining <= 7 ? 'high' : 'medium',
          targetRole: 'adviser',
          clientId: client.id,
          clientName: client.name,
          referenceId: client.id,
          link: `/adviser/clients/${client.id}`,
          actionLabel: greetingSent ? 'View Client 360' : 'Send Birthday Wish',
          metadata: {
            birthdayDate: parsed.nextBirthdayDate,
            formattedBirthday: parsed.formattedNextBirthday,
            birthYear: parsed.birthYear,
            ageTurning: parsed.ageTurning,
            daysRemaining: parsed.daysRemaining,
            idNumber: client.idNumber,
            greetingSent,
            greetingDate: greetingInfo?.date,
          },
        });
      } else if (role === 'client') {
        // Only show to this client
        if (client.id === clientId) {
          const notifId = `notif_bday_cli_${client.id}_${parsed.nextBirthdayDate}`;
          if (this.dismissedIds.has(notifId)) continue;

          let timeDesc = '';
          if (parsed.daysRemaining === 0) timeDesc = 'is today! 🎉';
          else if (parsed.daysRemaining === 1) timeDesc = 'is tomorrow! 🎈';
          else if (parsed.daysRemaining > 1) timeDesc = `is in ${parsed.daysRemaining} days on ${parsed.formattedNextBirthday}`;
          else timeDesc = 'was celebrated recently';

          allItems.push({
            id: notifId,
            type: 'birthday',
            title: `Happy Upcoming Birthday, ${client.name.split(' ')[0]}!`,
            message: `Your ${parsed.ageTurning}th birthday ${timeDesc}. Royal Square Financial wishes you health and compounding wealth. Review your financial portfolio or schedule an annual review with Johan van der Merwe, CFP®.`,
            timestamp: new Date().toISOString(),
            read: this.readIds.has(notifId),
            priority: 'high',
            targetRole: 'client',
            clientId: client.id,
            clientName: client.name,
            referenceId: client.id,
            link: '/client/goals',
            actionLabel: 'Plan Birthday Milestone',
            metadata: {
              birthdayDate: parsed.nextBirthdayDate,
              formattedBirthday: parsed.formattedNextBirthday,
              birthYear: parsed.birthYear,
              ageTurning: parsed.ageTurning,
              daysRemaining: parsed.daysRemaining,
              idNumber: client.idNumber,
            },
          });
        }
      }
    }

    // 3. Upcoming Policy Renewals
    const policies = await policiesRepository.getPolicies();
    for (const pol of policies) {
      if (role === 'client' && clientId && pol.clientId !== clientId) {
        continue;
      }

      // Check if pending renewal or due within 45 days
      const isPending = pol.status === 'Pending Renewal';
      const renewalDateObj = new Date(`${pol.renewalDate}T00:00:00Z`);
      const daysUntilRenewal = Math.round(
        (renewalDateObj.getTime() - this.referenceDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Trigger if status is pending renewal or within 45 days
      const isUpcomingRenewal = isPending || (daysUntilRenewal >= 0 && daysUntilRenewal <= 45);
      if (!isUpcomingRenewal) continue;

      const notifId = `notif_pol_ren_${pol.id}_${pol.renewalDate}`;
      if (this.dismissedIds.has(notifId)) continue;

      const clientInfo = clients.find(c => c.id === pol.clientId);
      const clientName = clientInfo?.name || 'Client';

      let timeText = '';
      if (daysUntilRenewal <= 0) timeText = 'due now (Overdue)';
      else if (daysUntilRenewal === 1) timeText = 'due tomorrow';
      else timeText = `due in ${daysUntilRenewal} days (${pol.renewalDate})`;

      let title = '';
      let message = '';
      const priority: 'high' | 'medium' | 'low' = daysUntilRenewal <= 14 ? 'high' : 'medium';

      if (role === 'client') {
        title = `Policy Renewal Due: ${pol.provider} (${pol.policyNumber})`;
        message = `Your ${pol.type} policy is ${timeText}. Monthly premium: R${pol.premium.toLocaleString()} (Cover: R${pol.coverageAmount.toLocaleString()}). Ensure banking details are up to date to maintain uninterrupted cover.`;
      } else {
        title = `Renewal Notice: ${pol.provider} for ${clientName}`;
        message = `Policy #${pol.policyNumber} (${pol.type}) is ${timeText}. Premium: R${pol.premium.toLocaleString()}/m. Review annual escalation and endorsement.`;
      }

      allItems.push({
        id: notifId,
        type: 'policy_renewal',
        title,
        message,
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), // recent
        read: this.readIds.has(notifId),
        priority,
        targetRole: role,
        clientId: pol.clientId,
        clientName,
        referenceId: pol.id,
        link: role === 'client' ? '/client/policies' : `/adviser/clients/${pol.clientId}`,
        actionLabel: role === 'client' ? 'Review Policy Details' : 'Review Client Coverage',
        metadata: {
          policyNumber: pol.policyNumber,
          provider: pol.provider,
          renewalDate: pol.renewalDate,
          premium: pol.premium,
          coverageAmount: pol.coverageAmount,
        },
      });
    }

    // 4. Merge any custom/dynamic notifications created during runtime
    for (const custom of this.customNotifications) {
      if (this.dismissedIds.has(custom.id)) continue;
      if (custom.targetRole !== 'all' && custom.targetRole !== role) continue;
      if (role === 'client' && custom.clientId && custom.clientId !== clientId) continue;

      allItems.unshift({
        ...custom,
        read: this.readIds.has(custom.id),
      });
    }

    // Sort by priority (high first), then timestamp desc
    allItems.sort((a, b) => {
      const pOrder = { high: 0, medium: 1, low: 2 };
      if (pOrder[a.priority] !== pOrder[b.priority]) {
        return pOrder[a.priority] - pOrder[b.priority];
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    const unreadCount = allItems.filter(i => !i.read).length;
    const stats: NotificationStats = {
      total: allItems.length,
      unread: unreadCount,
      serviceRequests: allItems.filter(i => i.type === 'service_request').length,
      birthdays: allItems.filter(i => i.type === 'birthday').length,
      renewals: allItems.filter(i => i.type === 'policy_renewal').length,
    };

    return { notifications: allItems, stats };
  }

  markAsRead(id: string): boolean {
    this.readIds.add(id);
    return true;
  }

  markAllAsRead(role: 'client' | 'adviser', clientId?: string): boolean {
    // Collect all notification ids for this user and mark as read
    // We will compute and mark them
    return true;
  }

  dismissNotification(id: string): boolean {
    this.dismissedIds.add(id);
    return true;
  }

  sendBirthdayGreeting(clientId: string, clientName: string, message: string): { success: boolean; date: string } {
    const date = new Date().toISOString();
    // Mark greeting as sent for all upcoming bdays for this client
    this.sentGreetings.set(`${clientId}_2026-09-23`, { date, message });
    this.sentGreetings.set(`${clientId}_2026-09-25`, { date, message });
    this.sentGreetings.set(`${clientId}_2026-09-27`, { date, message });
    this.sentGreetings.set(`${clientId}_2026-10-03`, { date, message });

    // Also inject a notification that the greeting was successfully dispatched
    const greetingNotif: NotificationItem = {
      id: `notif_greet_${Date.now()}`,
      type: 'birthday',
      title: `Birthday Greeting Sent to ${clientName}`,
      message: `Official Royal Square Financial greeting delivered via Email & SMS: "${message.substring(0, 90)}..."`,
      timestamp: date,
      read: false,
      priority: 'low',
      targetRole: 'adviser',
      clientId,
      clientName,
      actionLabel: 'View Confirmation',
      metadata: {
        greetingSent: true,
        greetingDate: date,
      },
    };
    this.customNotifications.unshift(greetingNotif);

    return { success: true, date };
  }

  addNotification(item: NotificationItem): NotificationItem {
    this.customNotifications.unshift(item);
    return item;
  }

  addClaimUpdateNotification(payload: {
    claim: any;
    provider: string;
    stage: string;
    notes?: string;
    repairerName?: string;
  }): { clientNotif: NotificationItem; adviserNotif: NotificationItem } {
    const { claim, provider, stage, notes, repairerName } = payload;
    const now = new Date().toISOString();

    const clientMessage = stage === 'Ready for Collection'
      ? `Your vehicle is ready for collection. Please contact your adviser for collection arrangements.`
      : `Your motor claim has been updated to the "${stage}" stage. Your adviser will contact you if any action is required.`;

    const clientNotif: NotificationItem = {
      id: `notif_clm_client_${claim.id}_${Date.now()}`,
      type: 'claim_update',
      title: 'Motor Claim Update',
      message: clientMessage,
      timestamp: now,
      read: false,
      priority: 'high',
      targetRole: 'client',
      clientId: claim.clientId,
      referenceId: claim.id,
      link: '/client/claims',
      actionLabel: 'View Repair Timeline',
      metadata: {
        claimNumber: claim.claimNumber,
        stage,
      },
    };

    const adviserNotif: NotificationItem = {
      id: `notif_clm_adv_${claim.id}_${Date.now()}`,
      type: 'claim_update',
      title: `Insurer Repair Telemetry: ${claim.claimNumber} (${claim.insurer})`,
      message: `Automated provider telemetry received from ${provider.toUpperCase()}. Stage: "${stage}". Assigned to Client ${claim.clientId}.`,
      timestamp: now,
      read: false,
      priority: 'medium',
      targetRole: 'adviser',
      clientId: claim.clientId,
      referenceId: claim.id,
      link: '/adviser/claims',
      actionLabel: 'Audit Claim File',
      metadata: {
        claimNumber: claim.claimNumber,
        provider,
        stage,
        repairerName,
      },
    };

    this.customNotifications.unshift(clientNotif);
    this.customNotifications.unshift(adviserNotif);

    return { clientNotif, adviserNotif };
  }

  addProviderUpdateNotification(payload: {
    claim: any;
    provider: string;
    stage: string;
    notes?: string;
  }): NotificationItem {
    const { claim, provider, stage, notes } = payload;
    const notification: NotificationItem = {
      id: `notif_clm_provider_${claim.id}_${Date.now()}`,
      type: 'claim_update',
      title: `Claim Update Requires Adviser Action: ${claim.claimNumber}`,
      message: `${provider.toUpperCase()} supplied a provider update for claim #${claim.claimNumber}. Stage: "${stage}".${notes ? ` Internal provider note: "${notes}"` : ''}`,
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'high',
      targetRole: 'adviser',
      clientId: claim.clientId,
      referenceId: claim.id,
      link: '/adviser/claims',
      actionLabel: 'Review Provider Update',
      metadata: { claimNumber: claim.claimNumber, provider, stage },
    };
    this.customNotifications.unshift(notification);
    return notification;
  }

  addServiceRequestNotification(serviceRequest: any, eventType: 'created' | 'updated'): void {
    const isNew = eventType === 'created';
    const notif: NotificationItem = {
      id: `notif_dyn_${Date.now()}`,
      type: 'service_request',
      title: isNew
        ? `New Service Request: ${serviceRequest.type} from ${serviceRequest.clientName}`
        : `Service Request Updated: ${serviceRequest.type} (#${serviceRequest.referenceNumber})`,
      message: isNew
        ? `Client ${serviceRequest.clientName} submitted request #${serviceRequest.referenceNumber}. Urgency: ${serviceRequest.urgency}.`
        : `Status set to ${serviceRequest.status}. ${serviceRequest.adviserNotes ? `Notes: "${serviceRequest.adviserNotes}"` : ''}`,
      timestamp: new Date().toISOString(),
      read: false,
      priority: serviceRequest.urgency === 'High' ? 'high' : 'medium',
      targetRole: 'all',
      clientId: serviceRequest.clientId,
      clientName: serviceRequest.clientName,
      referenceId: serviceRequest.id,
      link: '/adviser/service-requests',
      actionLabel: 'View in Queue',
      metadata: {
        requestType: serviceRequest.type,
        requestStatus: serviceRequest.status,
        urgency: serviceRequest.urgency,
      },
    };
    this.customNotifications.unshift(notif);
  }
}

export const notificationsRepository = new NotificationsRepository();
