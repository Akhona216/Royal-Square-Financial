import React, { useState, useEffect } from 'react';
import {
  Network,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Server,
  Activity,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { api } from '../../services/api.js';
import { InsurerIntegration } from '../../types/index.js';

export const IntegrationsHub: React.FC = () => {
  const [integrations, setIntegrations] = useState<InsurerIntegration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      const data = await api.integrations.getAll();
      setIntegrations(data || []);
    } catch (err: any) {
      console.error('Failed to load insurer integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (integration: InsurerIntegration) => {
    setSyncingId(integration.id);
    setSyncSuccessMsg(null);
    try {
      const result = await api.integrations.sync(integration.providerId);
      setSyncSuccessMsg(`Successfully synchronized with ${integration.name}: ${result.syncedPolicies} policies & ${result.syncedClaims} claims refreshed.`);
      await loadIntegrations();
    } catch (err: any) {
      alert(err.message || `Failed to sync with ${integration.name}`);
    } finally {
      setSyncingId(null);
    }
  };

  const handleToggleStatus = async (integration: InsurerIntegration) => {
    const nextStatus = integration.status === 'Connected' ? 'Not Connected' : 'Connected';
    try {
      await api.integrations.updateStatus(integration.providerId, nextStatus);
      loadIntegrations();
    } catch (err: any) {
      alert(err.message || 'Failed to update integration status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9D9D9] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] tracking-tight">Institutional Insurer Integrations Hub</h1>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Direct API adapters for real-time policy schedules, claims telemetry, and balance sheet valuations.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${syncingId ? 'animate-spin' : ''}`} />}
          onClick={loadIntegrations}
        >
          Refresh All Feeds
        </Button>
      </div>

      {syncSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-md flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncSuccessMsg}</span>
        </div>
      )}

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((item) => {
          const isSyncing = syncingId === item.id;
          const isConnected = item.status === 'Connected';

          return (
            <Card
              key={item.id}
              className="flex flex-col justify-between"
              title={
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded bg-[#111111] text-white flex items-center justify-center font-bold text-xs uppercase">
                      {item.providerId.slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#111111] leading-tight">{item.name}</h4>
                      <span className="text-[11px] text-[#6B6B6B]">{item.category}</span>
                    </div>
                  </div>
                </div>
              }
              headerAction={<StatusBadge status={item.status} size="sm" />}
            >
              <div className="space-y-4">
                {/* Telemetry info */}
                <div className="p-3 bg-[#F8F9FA] rounded border border-[#D9D9D9] space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B6B6B]">API Gateway:</span>
                    <span className="font-mono text-[#111111] font-semibold text-[11px]">{item.endpointUrl}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B6B6B]">Health Status:</span>
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {item.apiHealth}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B6B6B]">Synced Policies:</span>
                    <span className="font-bold text-[#111111]">{item.policiesCount} Active Contracts</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B6B6B]">Claims Integrated:</span>
                    <span className="font-bold text-[#111111]">{item.claimsCount} Dossiers</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-[#D9D9D9] text-[11px]">
                    <span className="text-[#6B6B6B]">Last Sync:</span>
                    <span className="text-[#111111]">
                      {item.lastSync ? new Date(item.lastSync).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(item)}
                  >
                    {isConnected ? 'Disconnect' : 'Connect Feed'}
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    disabled={!isConnected || isSyncing}
                    isLoading={isSyncing}
                    leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                    onClick={() => handleSync(item)}
                  >
                    Sync Now
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
