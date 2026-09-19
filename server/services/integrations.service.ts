import { integrationsRepository } from '../repositories/integrations.repository.js';
import { insurerAdapters } from '../integrations/index.js';
import { InsurerIntegration, IntegrationStatus } from '../repositories/types.js';

export class IntegrationsService {
  async getIntegrations(): Promise<InsurerIntegration[]> {
    return integrationsRepository.getIntegrations();
  }

  async syncIntegration(providerId: string): Promise<{ success: boolean; message: string; integration: InsurerIntegration }> {
    const adapter = insurerAdapters[providerId];
    if (adapter) {
      const health = await adapter.checkHealth();
      await integrationsRepository.updateIntegrationStatus(providerId, 'Connected', health.status);
    }
    return integrationsRepository.triggerSync(providerId);
  }

  async updateIntegrationStatus(providerId: string, status: IntegrationStatus): Promise<InsurerIntegration | null> {
    return integrationsRepository.updateIntegrationStatus(providerId, status);
  }
}

export const integrationsService = new IntegrationsService();
