export interface IInsurerAdapter {
  providerId: string;
  providerName: string;
  checkHealth(): Promise<{ status: 'Healthy' | 'Degraded' | 'Offline'; latencyMs: number; lastChecked: string }>;
  fetchPolicies(clientId: string): Promise<any[]>;
  fetchClaimUpdates(claimNumber: string): Promise<any>;
  syncValuations(clientId: string): Promise<{ totalValue: number; assetCount: number; timestamp: string }>;
}
