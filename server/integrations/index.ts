import { IInsurerAdapter } from './types.js';

export class SantamAdapter implements IInsurerAdapter {
  providerId = 'santam';
  providerName = 'Santam Insurance';

  async checkHealth() {
    return {
      status: 'Healthy' as const,
      latencyMs: 142,
      lastChecked: new Date().toISOString(),
    };
  }

  async fetchPolicies(clientId: string) {
    return [
      {
        policyNumber: 'SAN-AUTO-491028',
        type: 'Comprehensive Motor Insurance',
        underwriter: 'Santam Ltd',
        status: 'Active',
      }
    ];
  }

  async fetchClaimUpdates(claimNumber: string) {
    return {
      claimNumber,
      provider: 'Santam',
      currentStage: 'Authorisation',
      assessmentApproved: true,
      repairerAllocated: 'Precision Panelbeaters Sandton',
      lastTelemetry: new Date().toISOString(),
    };
  }

  async syncValuations(clientId: string) {
    return {
      totalValue: 720000,
      assetCount: 1,
      timestamp: new Date().toISOString(),
    };
  }
}

export class SanlamAdapter implements IInsurerAdapter {
  providerId = 'sanlam';
  providerName = 'Sanlam Glacier';

  async checkHealth() {
    return {
      status: 'Healthy' as const,
      latencyMs: 180,
      lastChecked: new Date().toISOString(),
    };
  }

  async fetchPolicies(clientId: string) {
    return [
      {
        policyNumber: 'SAN-LIFE-99214',
        type: 'Matrix Risk Life & Disability Cover',
        underwriter: 'Sanlam Life',
        status: 'Active',
      }
    ];
  }

  async fetchClaimUpdates(claimNumber: string) {
    return null;
  }

  async syncValuations(clientId: string) {
    return {
      totalValue: 6000000,
      assetCount: 1,
      timestamp: new Date().toISOString(),
    };
  }
}

export class OldMutualAdapter implements IInsurerAdapter {
  providerId = 'oldmutual';
  providerName = 'Old Mutual Wealth';

  async checkHealth() {
    return {
      status: 'Healthy' as const,
      latencyMs: 195,
      lastChecked: new Date().toISOString(),
    };
  }

  async fetchPolicies(clientId: string) {
    return [
      {
        policyNumber: 'OM-RET-7712',
        type: 'SuperFund Preservation Pension',
        underwriter: 'Old Mutual Life Assurance Co (SA)',
        status: 'Active',
      }
    ];
  }

  async fetchClaimUpdates(claimNumber: string) {
    return null;
  }

  async syncValuations(clientId: string) {
    return {
      totalValue: 1850000,
      assetCount: 1,
      timestamp: new Date().toISOString(),
    };
  }
}

export class DiscoveryAdapter implements IInsurerAdapter {
  providerId = 'discovery';
  providerName = 'Discovery Insure & Vitality';

  async checkHealth() {
    return {
      status: 'Healthy' as const,
      latencyMs: 120,
      lastChecked: new Date().toISOString(),
    };
  }

  async fetchPolicies(clientId: string) {
    return [
      {
        policyNumber: 'DISC-HOME-20911',
        type: 'Classic Building & Household Contents',
        underwriter: 'Discovery Insure Ltd',
        status: 'Pending Renewal',
      }
    ];
  }

  async fetchClaimUpdates(claimNumber: string) {
    return {
      claimNumber,
      provider: 'Discovery',
      status: 'Settled',
      payoutReference: 'DISC-EFT-99120',
      lastTelemetry: new Date().toISOString(),
    };
  }

  async syncValuations(clientId: string) {
    return {
      totalValue: 5500000,
      assetCount: 1,
      timestamp: new Date().toISOString(),
    };
  }
}

export class AllanGrayAdapter implements IInsurerAdapter {
  providerId = 'allangray';
  providerName = 'Allan Gray Investment Platform';

  async checkHealth() {
    return {
      status: 'Healthy' as const,
      latencyMs: 160,
      lastChecked: new Date().toISOString(),
    };
  }

  async fetchPolicies(clientId: string) {
    return [
      {
        policyNumber: 'AG-984210',
        type: 'Balanced Fund Class A Unit Trust',
        underwriter: 'Allan Gray Unit Trust Management Ltd',
        status: 'Active',
      }
    ];
  }

  async fetchClaimUpdates(claimNumber: string) {
    return null;
  }

  async syncValuations(clientId: string) {
    return {
      totalValue: 1250000,
      assetCount: 1,
      timestamp: new Date().toISOString(),
    };
  }
}

export class LibertyAdapter implements IInsurerAdapter {
  providerId = 'liberty';
  providerName = 'Liberty Life';

  async checkHealth() {
    return {
      status: 'Degraded' as const,
      latencyMs: 820,
      lastChecked: new Date().toISOString(),
    };
  }

  async fetchPolicies(clientId: string) {
    return [];
  }

  async fetchClaimUpdates(claimNumber: string) {
    return null;
  }

  async syncValuations(clientId: string) {
    return {
      totalValue: 0,
      assetCount: 0,
      timestamp: new Date().toISOString(),
    };
  }
}

export const insurerAdapters: Record<string, IInsurerAdapter> = {
  santam: new SantamAdapter(),
  sanlam: new SanlamAdapter(),
  oldmutual: new OldMutualAdapter(),
  discovery: new DiscoveryAdapter(),
  allangray: new AllanGrayAdapter(),
  liberty: new LibertyAdapter(),
};
