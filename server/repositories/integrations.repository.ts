import { InsurerIntegration, IntegrationStatus } from './types.js';

export interface IIntegrationsRepository {
  getIntegrations(): Promise<InsurerIntegration[]>;
  getIntegrationByProvider(providerId: string): Promise<InsurerIntegration | null>;
  updateIntegrationStatus(providerId: string, status: IntegrationStatus, apiHealth?: InsurerIntegration['apiHealth']): Promise<InsurerIntegration | null>;
  triggerSync(providerId: string): Promise<{ success: boolean; message: string; integration: InsurerIntegration }>;
}

const mockIntegrations: InsurerIntegration[] = [
  {
    id: 'int_001',
    providerId: 'santam',
    name: 'Santam Insurance B2B Gateway',
    logo: 'Santam',
    category: 'Short-Term',
    status: 'Connected',
    lastSync: '2026-09-19T06:15:00Z',
    policiesCount: 142,
    claimsCount: 28,
    endpointUrl: 'https://api.santam.co.za/broker/v3/telemetry',
    apiHealth: 'Healthy',
  },
  {
    id: 'int_002',
    providerId: 'sanlam',
    name: 'Sanlam Glacier & Wealth Connect',
    logo: 'Sanlam',
    category: 'Long-Term',
    status: 'Connected',
    lastSync: '2026-09-19T05:30:00Z',
    policiesCount: 98,
    claimsCount: 6,
    endpointUrl: 'https://gateway.sanlam.co.za/wealth/api/v2',
    apiHealth: 'Healthy',
  },
  {
    id: 'int_003',
    providerId: 'oldmutual',
    name: 'Old Mutual Wealth Open Broker Hub',
    logo: 'Old Mutual',
    category: 'Asset Management',
    status: 'Syncing',
    lastSync: '2026-09-19T08:00:00Z',
    policiesCount: 184,
    claimsCount: 12,
    endpointUrl: 'https://wealthapi.oldmutual.co.za/fais/v1',
    apiHealth: 'Healthy',
  },
  {
    id: 'int_004',
    providerId: 'discovery',
    name: 'Discovery Insure & Vitality Bridge',
    logo: 'Discovery',
    category: 'Health & Life',
    status: 'Connected',
    lastSync: '2026-09-19T07:45:00Z',
    policiesCount: 215,
    claimsCount: 39,
    endpointUrl: 'https://api.discovery.co.za/partner/insure/v4',
    apiHealth: 'Healthy',
  },
  {
    id: 'int_005',
    providerId: 'allangray',
    name: 'Allan Gray Investment Platform Direct',
    logo: 'Allan Gray',
    category: 'Asset Management',
    status: 'Connected',
    lastSync: '2026-09-18T22:00:00Z',
    policiesCount: 110,
    claimsCount: 0,
    endpointUrl: 'https://broker-api.allangray.co.za/valuations/v2',
    apiHealth: 'Healthy',
  },
  {
    id: 'int_006',
    providerId: 'liberty',
    name: 'Liberty Life Risk & Corporate Suite',
    logo: 'Liberty',
    category: 'Health & Life',
    status: 'Error',
    lastSync: '2026-09-17T14:10:00Z',
    policiesCount: 64,
    claimsCount: 4,
    endpointUrl: 'https://secure.liberty.co.za/intermediary/rest/v1',
    apiHealth: 'Degraded',
  },
];

export class IntegrationsRepository implements IIntegrationsRepository {
  async getIntegrations(): Promise<InsurerIntegration[]> {
    return JSON.parse(JSON.stringify(mockIntegrations));
  }

  async getIntegrationByProvider(providerId: string): Promise<InsurerIntegration | null> {
    const item = mockIntegrations.find(i => i.providerId === providerId);
    return item ? { ...item } : null;
  }

  async updateIntegrationStatus(providerId: string, status: IntegrationStatus, apiHealth?: InsurerIntegration['apiHealth']): Promise<InsurerIntegration | null> {
    const item = mockIntegrations.find(i => i.providerId === providerId);
    if (!item) return null;
    item.status = status;
    if (apiHealth) item.apiHealth = apiHealth;
    item.lastSync = new Date().toISOString();
    return { ...item };
  }

  async triggerSync(providerId: string): Promise<{ success: boolean; message: string; integration: InsurerIntegration }> {
    const item = mockIntegrations.find(i => i.providerId === providerId);
    if (!item) {
      throw new Error(`Integration provider '${providerId}' not found`);
    }

    item.status = 'Syncing';
    // Simulate brief synchronisation update
    item.lastSync = new Date().toISOString();
    item.status = 'Connected';
    item.apiHealth = 'Healthy';
    return {
      success: true,
      message: `Successfully synchronized policies and data feeds for ${item.name}`,
      integration: { ...item },
    };
  }
}

export const integrationsRepository = new IntegrationsRepository();
