import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Plus,
  Clock,
  CheckCircle2,
  FileText,
  AlertCircle,
  Building,
  CreditCard,
  Plane,
  Calculator,
  UserCheck,
} from 'lucide-react';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { Modal } from '../../components/common/Modal.js';
import { Input, Select } from '../../components/common/Input.js';
import { DataTable, Column } from '../../components/common/DataTable.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { api } from '../../services/api.js';
import { ServiceRequest, ServiceRequestType } from '../../types/index.js';
import { useNotifications } from '../../context/NotificationContext.js';

export const ServiceRequests: React.FC = () => {
  const { fetchNotifications } = useNotifications();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [requestType, setRequestType] = useState<ServiceRequestType>('Border Letter');
  const [details, setDetails] = useState('');
  const [urgency, setUrgency] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.serviceRequests.getAll();
      setRequests(data || []);
    } catch (err: any) {
      console.error('Failed to load service requests:', err);
      setError(err.message || 'Unable to load service requests');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details) return;
    setSubmitting(true);
    try {
      await api.serviceRequests.create({
        type: requestType,
        details,
        urgency,
      });
      setIsModalOpen(false);
      setDetails('');
      fetchRequests();
      fetchNotifications();
    } catch (err: any) {
      alert(err.message || 'Failed to submit service request');
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<ServiceRequest>[] = [
    {
      key: 'referenceNumber',
      header: 'Reference # & Type',
      render: (r) => (
        <div>
          <span className="font-mono font-bold text-xs text-[#111111] block">{r.referenceNumber}</span>
          <span className="font-semibold text-sm text-[#111111]">{r.type}</span>
        </div>
      ),
    },
    {
      key: 'details',
      header: 'Instructions / Request Details',
      render: (r) => (
        <p className="text-xs text-[#6B6B6B] max-w-md line-clamp-2 leading-relaxed">{r.details}</p>
      ),
    },
    {
      key: 'urgency',
      header: 'Urgency',
      render: (r) => (
        <span
          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
            r.urgency === 'High'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : r.urgency === 'Medium'
              ? 'bg-amber-50 text-amber-800 border border-amber-200'
              : 'bg-gray-100 text-gray-800'
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
          {new Date(r.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge status={r.status} size="sm" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9D9D9] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] tracking-tight">Service Requests & Change Tickets</h1>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Submit formal administrative change requests, cross-border letters, and tax certificates directly to your adviser.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsModalOpen(true)}
        >
          Lodge New Request
        </Button>
      </div>

      {/* Quick Service Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Border Letter', type: 'Border Letter' as ServiceRequestType, icon: Plane },
          { label: 'Bank Details', type: 'Bank details' as ServiceRequestType, icon: CreditCard },
          { label: 'Address Change', type: 'Address change' as ServiceRequestType, icon: Building },
          { label: 'IRP5 Certificate', type: 'IRP5 request' as ServiceRequestType, icon: Calculator },
          { label: 'Balance Sheet', type: 'Balance Sheet update' as ServiceRequestType, icon: FileText },
          { label: 'Consultation', type: 'Consultation' as ServiceRequestType, icon: UserCheck },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => {
                setRequestType(item.type);
                setIsModalOpen(true);
              }}
              className="p-3.5 bg-white border border-[#D9D9D9] hover:border-[#C62828] rounded-lg text-left shadow-xs transition-colors group cursor-pointer"
            >
              <div className="w-7 h-7 rounded bg-[#F8F9FA] group-hover:bg-red-50 text-[#6B6B6B] group-hover:text-[#C62828] flex items-center justify-center mb-2 transition-colors">
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#111111] block leading-tight">{item.label}</span>
              <span className="text-[10px] text-[#6B6B6B] mt-0.5 block">Quick dispatch</span>
            </button>
          );
        })}
      </div>

      {/* Requests Table */}
      <Card
        title="Submitted Service Requests"
        subtitle="Track tickets processed by your dedicated Royal Square advisory team"
      >
        <DataTable
          columns={columns}
          data={requests}
          keyExtractor={(r) => r.id}
          isLoading={loading}
          emptyTitle="No service requests lodged"
          emptyDescription="Lodge a ticket whenever you need cross-border travel authorization, address updates, or tax documentation."
          emptyActionLabel="Lodge Service Request"
          onEmptyAction={() => setIsModalOpen(true)}
        />
      </Card>

      {/* Create Request Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Lodge Administrative Service Request"
        subtitle="Your assigned adviser will review and execute the required insurer notifications"
      >
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Service Request Category"
              value={requestType}
              onChange={(e) => setRequestType(e.target.value as ServiceRequestType)}
              options={[
                { label: 'Cross-Border Letter (SADC Vehicle Travel)', value: 'Border Letter' },
                { label: 'Change of Banking Details / Debit Order', value: 'Bank details' },
                { label: 'Residential / Postal Address Update', value: 'Address change' },
                { label: 'IRP5 Tax Assessment Request', value: 'IRP5 request' },
                { label: 'Balance Sheet & Financial Valuation Update', value: 'Balance Sheet update' },
                { label: 'Schedule Financial Review Consultation', value: 'Consultation' },
              ]}
            />
            <Select
              label="Urgency Level"
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as any)}
              options={[
                { label: 'Standard (24 - 48 hours)', value: 'Low' },
                { label: 'Medium (Same day turnaround)', value: 'Medium' },
                { label: 'Urgent / Departure in < 24h', value: 'High' },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F1F1F] mb-1.5 uppercase tracking-wider">
              Request Specifics & Narrative
            </label>
            <textarea
              className="w-full px-3 py-2 text-sm text-[#111111] bg-white border border-[#D9D9D9] rounded-md focus:outline-none focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828]"
              rows={4}
              placeholder={
                requestType === 'Border Letter'
                  ? 'Specify country of destination (e.g. Botswana / Mozambique), travel dates, vehicle registration, and border post...'
                  : 'Describe specific updates, account numbers, or address particulars...'
              }
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              required
            />
          </div>

          <div className="p-3 bg-[#F8F9FA] rounded border border-[#D9D9D9] text-xs text-[#6B6B6B]">
            Royal Square Financial will automatically generate the compliant underwriter endorsement letters and notify you via email and portal notification upon authorization.
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-[#D9D9D9]">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={submitting}
            >
              Dispatch Ticket
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
