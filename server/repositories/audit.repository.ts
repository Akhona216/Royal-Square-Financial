import { AuditLogEntry } from './types.js';

export class AuditRepository {
  private logs: AuditLogEntry[] = [
    {
      id: 'aud_001',
      timestamp: '2026-08-15T09:12:00Z',
      userId: 'usr_client_001',
      userName: 'Sipho Dlamini',
      userRole: 'client',
      action: 'FICA_VERIFICATION_COMPLETED',
      category: 'security',
      entityId: 'usr_client_001',
      entityType: 'user',
      description: 'National Identity Document & Proof of Residence verified under FSP FAIS compliance standards.',
      status: 'SUCCESS',
      ipAddress: '197.185.102.44',
    },
    {
      id: 'aud_002',
      timestamp: '2026-09-01T14:30:00Z',
      userId: 'usr_client_001',
      userName: 'Sipho Dlamini',
      userRole: 'client',
      action: 'TWO_FACTOR_ENABLED',
      category: 'security',
      entityId: 'usr_client_001',
      entityType: 'user',
      description: 'Multi-factor SMS/OTP verification enabled for transaction authorizations.',
      status: 'SUCCESS',
      ipAddress: '197.185.102.44',
    },
    {
      id: 'aud_003',
      timestamp: '2026-09-08T18:30:00Z',
      userId: 'usr_client_001',
      userName: 'Sipho Dlamini',
      userRole: 'client',
      action: 'CLAIM_SUBMITTED',
      category: 'claims',
      entityId: 'clm_001',
      entityType: 'claim',
      description: 'Motor vehicle accident claim #RSF-CLM-2026-0841 lodged via client portal.',
      status: 'SUCCESS',
      ipAddress: '197.185.102.44',
    },
  ];

  async log(entryData: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry> {
    const newEntry: AuditLogEntry = {
      id: `aud_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...entryData,
    };
    this.logs.unshift(newEntry);
    return { ...newEntry };
  }

  async getLogs(filter?: {
    userId?: string;
    entityId?: string;
    category?: string;
    limit?: number;
  }): Promise<AuditLogEntry[]> {
    let results = [...this.logs];
    if (filter?.userId) {
      results = results.filter((l) => l.userId === filter.userId);
    }
    if (filter?.entityId) {
      results = results.filter((l) => l.entityId === filter.entityId);
    }
    if (filter?.category) {
      results = results.filter((l) => l.category === filter.category);
    }
    if (filter?.limit) {
      results = results.slice(0, filter.limit);
    }
    return results;
  }
}

export const auditRepository = new AuditRepository();
