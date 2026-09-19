import React, { useState, useEffect } from 'react';
import {
  CarFront,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Send,
  Edit,
} from 'lucide-react';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { DataTable, Column } from '../../components/common/DataTable.js';
import { Modal } from '../../components/common/Modal.js';
import { Select, Input } from '../../components/common/Input.js';
import { Timeline } from '../../components/common/Timeline.js';
import { api } from '../../services/api.js';
import { Claim, ClaimTimelineStage } from '../../types/index.js';

export const ClaimsOverview: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState<boolean>(false);
  const [targetStatus, setTargetStatus] = useState<string>('Authorized');
  const [targetStage, setTargetStage] = useState<ClaimTimelineStage>('Authorisation');
  const [statusNote, setStatusNote] = useState<string>('');
  const [updating, setUpdating] = useState<boolean>(false);

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    setLoading(true);
    try {
      const data = await api.claims.getAll({ all: true });
      setClaims(data || []);
    } catch (err: any) {
      console.error('Failed to load adviser claims:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatusModal = (claim: Claim) => {
    setSelectedClaim(claim);
    setTargetStatus(claim.status);
    setTargetStage(claim.currentStage);
    setStatusNote('');
    setStatusModalOpen(true);
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim) return;
    setUpdating(true);
    try {
      await api.claims.updateStatus(selectedClaim.id, targetStatus, targetStage, statusNote);
      setStatusModalOpen(false);
      loadClaims();
    } catch (err: any) {
      alert(err.message || 'Failed to update claim stage');
    } finally {
      setUpdating(false);
    }
  };

  const formatZAR = (num?: number) => {
    if (!num) return 'R 0';
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const columns: Column<Claim>[] = [
    {
      key: 'claimNumber',
      header: 'Claim Ref & Type',
      render: (c) => (
        <div>
          <span className="font-mono font-bold text-xs text-[#111111] block">{c.claimNumber}</span>
          <span className="font-semibold text-sm text-[#111111]">{c.description}</span>
          <span className="text-xs text-[#6B6B6B] block mt-0.5">
            Client ID: {c.clientId} • Date: {new Date(c.incidentDate).toLocaleDateString('en-ZA')}
          </span>
        </div>
      ),
    },
    {
      key: 'insurer',
      header: 'Underwriter',
      render: (c) => (
        <div>
          <span className="px-2.5 py-0.5 rounded bg-[#F2F2F2] border border-[#D9D9D9] text-xs font-bold text-[#1F1F1F]">
            {c.insurer}
          </span>
          <span className="text-[11px] text-[#6B6B6B] block mt-0.5 font-mono">{c.policyNumber}</span>
        </div>
      ),
    },
    {
      key: 'estimatedAmount',
      header: 'Estimated Loss',
      align: 'right',
      render: (c) => (
        <div>
          <span className="font-bold text-[#111111] font-mono text-sm block">{formatZAR(c.estimatedAmount)}</span>
          {c.settlementAmount && (
            <span className="text-[11px] text-emerald-700 font-mono">
              Settled: {formatZAR(c.settlementAmount)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'currentStage',
      header: 'Workflow Stage',
      render: (c) => (
        <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold bg-red-50 text-[#C62828] border border-red-200 uppercase">
          {c.currentStage}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (c) => <StatusBadge status={c.status} size="sm" />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (c) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleOpenStatusModal(c)}
        >
          Advance Stage
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9D9D9] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] tracking-tight">Claims Management & Authorisation</h1>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Institutional oversight across Santam, Discovery, and Old Mutual short-term claim pipelines.
          </p>
        </div>
      </div>

      {/* Claims Table */}
      <Card
        title="Active Claims Register"
        subtitle="Review incident dockets and advance underwriting assessment stages"
      >
        <DataTable
          columns={columns}
          data={claims}
          keyExtractor={(c) => c.id}
          isLoading={loading}
          emptyTitle="No claims found"
          emptyDescription="Zero claims are currently awaiting underwriter dispatch."
        />
      </Card>

      {/* Advance Stage Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={selectedClaim ? `Update Claim: ${selectedClaim.claimNumber}` : 'Advance Stage'}
        subtitle="Record underwriter assessor determination, authorization number, or repair dispatch"
        maxWidth="lg"
      >
        {selectedClaim && (
          <form onSubmit={handleSaveStatus} className="space-y-4">
            <div className="p-4 bg-[#F8F9FA] rounded border border-[#D9D9D9] space-y-2 text-xs">
              <div><strong>Claim Ref:</strong> {selectedClaim.claimNumber}</div>
              <div><strong>Insurer:</strong> {selectedClaim.insurer} • Policy: {selectedClaim.policyNumber}</div>
              <div><strong>Incident:</strong> {selectedClaim.description}</div>
              <div><strong>Location:</strong> {selectedClaim.incidentLocation}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Current Stage Pipeline"
                value={targetStage}
                onChange={(e) => setTargetStage(e.target.value as ClaimTimelineStage)}
                options={[
                  { label: 'Accident Reported', value: 'Accident Reported' },
                  { label: 'Claim Submitted', value: 'Claim Submitted' },
                  { label: 'Claim Number Received', value: 'Claim Number Received' },
                  { label: 'Assessment (Assessor Appointed)', value: 'Assessment' },
                  { label: 'Authorisation (Panel Beater Approved)', value: 'Authorisation' },
                  { label: 'Repair (Vehicle in Workshop)', value: 'Repair' },
                  { label: 'Closed (Claim Settled)', value: 'Closed' },
                ]}
              />

              <Select
                label="Overall Status"
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value)}
                options={[
                  { label: 'In Review (Underwriter Evaluating)', value: 'In Review' },
                  { label: 'Authorized (Excess Paid & Go-ahead)', value: 'Authorized' },
                  { label: 'Repairing (Workshop Active)', value: 'Repairing' },
                  { label: 'Settled (Final Release Signed)', value: 'Settled' },
                  { label: 'Rejected (Repudiation)', value: 'Rejected' },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F1F1F] mb-1.5 uppercase tracking-wider">
                Adviser Case Notes / Underwriter Reference
              </label>
              <textarea
                className="w-full px-3 py-2 text-sm text-[#111111] bg-white border border-[#D9D9D9] rounded-md focus:outline-none focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828]"
                rows={3}
                placeholder="e.g. Panel beater quote approved. Excess invoice dispatched to client. Assessor concluded inspection."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
              />
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-[#D9D9D9]">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setStatusModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={updating}
              >
                Apply Stage Update
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
