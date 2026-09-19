import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  Filter,
  FileCheck,
  AlertCircle,
  Plane,
  CreditCard,
  Building,
} from 'lucide-react';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { DataTable, Column } from '../../components/common/DataTable.js';
import { Modal } from '../../components/common/Modal.js';
import { Select } from '../../components/common/Input.js';
import { api } from '../../services/api.js';
import { ServiceRequest } from '../../types/index.js';

export const ServiceRequestsQueue: React.FC = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedReq, setSelectedReq] = useState<ServiceRequest | null>(null);
  const [statusActionModal, setStatusActionModal] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<string>('Approved');
  const [adviserNotes, setAdviserNotes] = useState<string>('');
  const [updating, setUpdating] = useState<boolean>(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await api.serviceRequests.getAll({ all: true });
      setRequests(data || []);
    } catch (err: any) {
      console.error('Failed to load service requests queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenActionModal = (req: ServiceRequest) => {
    setSelectedReq(req);
    setNewStatus(req.status === 'Submitted' ? 'Approved' : 'Completed');
    setAdviserNotes('');
    setStatusActionModal(true);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;
    setUpdating(true);
    try {
      await api.serviceRequests.update(selectedReq.id, {
        status: newStatus,
        adviserNotes,
      });
      setStatusActionModal(false);
      loadRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to update request');
    } finally {
      setUpdating(false);
    }
  };

  const columns: Column<ServiceRequest>[] = [
    {
      key: 'referenceNumber',
      header: 'Ticket Ref & Client',
      render: (r) => (
        <div>
          <span className="font-mono font-bold text-xs text-[#111111] block">{r.referenceNumber}</span>
          <span className="font-semibold text-sm text-[#111111]">{r.clientName}</span>
          <span className="text-xs text-[#6B6B6B] block">Client ID: {r.clientId}</span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Category',
      render: (r) => (
        <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold bg-[#F2F2F2] border border-[#D9D9D9] text-[#1F1F1F]">
          {r.type}
        </span>
      ),
    },
    {
      key: 'details',
      header: 'Instructions & Details',
      render: (r) => (
        <div>
          <p className="text-xs text-[#111111] max-w-sm line-clamp-2 leading-relaxed">{r.details}</p>
          {r.adviserNotes && (
            <p className="text-[11px] text-[#C62828] font-medium mt-1">Note: {r.adviserNotes}</p>
          )}
        </div>
      ),
    },
    {
      key: 'urgency',
      header: 'Urgency',
      render: (r) => (
        <span
          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
            r.urgency === 'High' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {r.urgency}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Lodged Date',
      render: (r) => (
        <span className="text-xs text-[#6B6B6B]">
          {new Date(r.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge status={r.status} size="sm" />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (r) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleOpenActionModal(r)}
        >
          Process Ticket
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9D9D9] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] tracking-tight">Service Requests & Change Queue</h1>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Execute cross-border travel certificates, debit order adjustments, and statutory tax assessments.
          </p>
        </div>
      </div>

      {/* Table */}
      <Card
        title="Administrative Ticket Queue"
        subtitle="Review, approve, and issue underwriter endorsement documents"
      >
        <DataTable
          columns={columns}
          data={requests}
          keyExtractor={(r) => r.id}
          isLoading={loading}
          emptyTitle="No service requests pending"
          emptyDescription="All administrative client tickets are completed."
        />
      </Card>

      {/* Process Modal */}
      <Modal
        isOpen={statusActionModal}
        onClose={() => setStatusActionModal(false)}
        title={selectedReq ? `Process Ticket: ${selectedReq.referenceNumber}` : 'Process Ticket'}
        subtitle={selectedReq ? `${selectedReq.type} for ${selectedReq.clientName}` : ''}
      >
        {selectedReq && (
          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div className="p-4 bg-[#F8F9FA] rounded border border-[#D9D9D9] text-xs space-y-2">
              <div><strong>Client:</strong> {selectedReq.clientName}</div>
              <div><strong>Category:</strong> {selectedReq.type}</div>
              <div><strong>Instructions:</strong> {selectedReq.details}</div>
              <div><strong>Urgency:</strong> {selectedReq.urgency}</div>
            </div>

            <Select
              label="Action Decision"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              options={[
                { label: 'Approve & Issue Documentation', value: 'Approved' },
                { label: 'Mark Completed (Executed with Insurer)', value: 'Completed' },
                { label: 'Move to In Review', value: 'In Review' },
                { label: 'Reject with Reason', value: 'Rejected' },
              ]}
            />

            <div>
              <label className="block text-xs font-semibold text-[#1F1F1F] mb-1.5 uppercase tracking-wider">
                Adviser Endorsement Notes
              </label>
              <textarea
                className="w-full px-3 py-2 text-sm text-[#111111] bg-white border border-[#D9D9D9] rounded-md focus:outline-none focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828]"
                rows={3}
                placeholder="e.g. Santam cross-border letter generated and uploaded to client Documents Vault. Valid 30 days."
                value={adviserNotes}
                onChange={(e) => setAdviserNotes(e.target.value)}
              />
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-[#D9D9D9]">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setStatusActionModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={updating}
              >
                Execute Ticket Action
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
