import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  Shield,
  Clock,
  CarFront,
  HelpCircle,
  Download,
  AlertTriangle,
  Search,
} from 'lucide-react';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { DataTable, Column } from '../../components/common/DataTable.js';
import { Modal } from '../../components/common/Modal.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { api } from '../../services/api.js';
import { Policy } from '../../types/index.js';

export const MyPolicies: React.FC = () => {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.policies.getAll();
      setPolicies(data || []);
    } catch (err: any) {
      console.error('Failed to load policies:', err);
      setError(err.message || 'Unable to retrieve policies');
    } finally {
      setLoading(false);
    }
  };

  const formatZAR = (val: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filteredPolicies = policies.filter((p) => {
    const q = searchTerm.toLowerCase();
    return (
      p.policyNumber.toLowerCase().includes(q) ||
      p.provider.toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q)
    );
  });

  const columns: Column<Policy>[] = [
    {
      key: 'policyNumber',
      header: 'Policy Ref & Type',
      render: (p) => (
        <div>
          <span className="font-bold text-[#111111] font-mono text-xs block">{p.policyNumber}</span>
          <span className="text-sm font-semibold text-[#111111]">{p.type}</span>
        </div>
      ),
    },
    {
      key: 'provider',
      header: 'Underwriting Insurer',
      render: (p) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F2F2F2] border border-[#D9D9D9] text-xs font-bold text-[#1F1F1F]">
          {p.provider}
        </span>
      ),
    },
    {
      key: 'coverageAmount',
      header: 'Sum Insured / Cover',
      align: 'right',
      render: (p) => (
        <span className="font-bold text-[#111111] font-mono text-sm">{formatZAR(p.coverageAmount)}</span>
      ),
    },
    {
      key: 'premium',
      header: 'Debit Premium',
      align: 'right',
      render: (p) => (
        <span className="text-xs font-semibold text-[#1F1F1F] font-mono">
          {formatZAR(p.premium)} / {p.frequency}
        </span>
      ),
    },
    {
      key: 'renewalDate',
      header: 'Annual Renewal',
      render: (p) => (
        <span className="text-xs text-[#6B6B6B]">
          {new Date(p.renewalDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Policy Status',
      render: (p) => <StatusBadge status={p.status} size="sm" />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (p) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedPolicy(p)}
        >
          View Schedule
        </Button>
      ),
    },
  ];

  const totalCoverage = policies.reduce((acc, curr) => acc + (curr.coverageAmount || 0), 0);
  const totalMonthlyPremium = policies
    .filter((p) => p.status === 'Active')
    .reduce((acc, curr) => acc + (curr.frequency === 'Monthly' ? curr.premium : curr.premium / 12), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9D9D9] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] tracking-tight">Active Policies & Insurance Cover</h1>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Consolidated short-term, life, and risk policies integrated with institutional underwriters.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<HelpCircle className="w-3.5 h-3.5" />}
            onClick={() => navigate('/client/service-requests')}
          >
            Request Policy Schedule
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<CarFront className="w-3.5 h-3.5" />}
            onClick={() => navigate('/client/claims')}
          >
            Lodge Claim Against Policy
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-lg border border-[#D9D9D9] shadow-xs">
          <span className="text-xs uppercase font-bold text-[#6B6B6B] tracking-wider">Total Risk Sum Insured</span>
          <div className="text-2xl font-extrabold text-[#111111] mt-1.5">
            {loading ? '...' : formatZAR(totalCoverage)}
          </div>
          <span className="text-[11px] text-[#6B6B6B] mt-1 block">Active across {policies.length} integrated contracts</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#D9D9D9] shadow-xs">
          <span className="text-xs uppercase font-bold text-[#6B6B6B] tracking-wider">Total Monthly Risk Premium</span>
          <div className="text-2xl font-extrabold text-[#C62828] mt-1.5">
            {loading ? '...' : `${formatZAR(totalMonthlyPremium)} / mo`}
          </div>
          <span className="text-[11px] text-[#6B6B6B] mt-1 block">Consolidated monthly debit orders</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#D9D9D9] shadow-xs">
          <span className="text-xs uppercase font-bold text-[#6B6B6B] tracking-wider">Underwriting Partners</span>
          <div className="text-sm font-bold text-[#111111] mt-2 flex flex-wrap gap-1.5">
            {['Santam', 'Sanlam', 'Discovery', 'Allan Gray'].map((ins) => (
              <span key={ins} className="px-2 py-0.5 rounded bg-[#F2F2F2] border border-[#D9D9D9] text-xs font-semibold">
                {ins}
              </span>
            ))}
          </div>
          <span className="text-[11px] text-emerald-700 mt-2 block font-medium">All policies verified with live API feeds</span>
        </div>
      </div>

      {/* Policy Search & Table */}
      <Card
        title="Institutional Policy Register"
        subtitle="Click any policy schedule to view detailed benefit wording and excesses"
        headerAction={
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#6B6B6B]" />
            <input
              type="text"
              placeholder="Search policy # or provider..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-[#D9D9D9] focus:outline-none focus:border-[#C62828]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        }
      >
        <DataTable
          columns={columns}
          data={filteredPolicies}
          keyExtractor={(p) => p.id}
          isLoading={loading}
          emptyTitle="No matching policies found"
          emptyDescription="There are no insurance policies matching your query."
        />
      </Card>

      {/* Policy Schedule Modal */}
      <Modal
        isOpen={!!selectedPolicy}
        onClose={() => setSelectedPolicy(null)}
        title={selectedPolicy ? `${selectedPolicy.type} Schedule` : 'Policy Schedule'}
        subtitle={selectedPolicy ? `Policy Ref: ${selectedPolicy.policyNumber} • ${selectedPolicy.provider}` : ''}
      >
        {selectedPolicy && (
          <div className="space-y-4">
            <div className="p-4 bg-[#F8F9FA] rounded-lg border border-[#D9D9D9] space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#6B6B6B]">Underwriting Insurer:</span>
                <span className="text-sm font-bold text-[#111111]">{selectedPolicy.provider}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#6B6B6B]">Total Cover / Sum Insured:</span>
                <span className="text-sm font-bold text-[#C62828] font-mono">{formatZAR(selectedPolicy.coverageAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#6B6B6B]">Premium Contribution:</span>
                <span className="text-sm font-bold text-[#111111] font-mono">{formatZAR(selectedPolicy.premium)} ({selectedPolicy.frequency})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#6B6B6B]">Inception Date:</span>
                <span className="text-xs text-[#111111] font-medium">{new Date(selectedPolicy.startDate).toLocaleDateString('en-ZA')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#6B6B6B]">Next Policy Renewal:</span>
                <span className="text-xs text-[#111111] font-medium">{new Date(selectedPolicy.renewalDate).toLocaleDateString('en-ZA')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#6B6B6B]">Current Standing:</span>
                <StatusBadge status={selectedPolicy.status} size="sm" />
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900 leading-relaxed">
              <strong className="block mb-0.5">Need to claim against this policy?</strong>
              You can initiate an immediate Motor Claim or lodge a General Request with your Royal Square financial adviser.
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-[#D9D9D9]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedPolicy(null);
                  navigate('/client/service-requests');
                }}
              >
                Request Schedule Update
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<CarFront className="w-3.5 h-3.5" />}
                onClick={() => {
                  setSelectedPolicy(null);
                  navigate('/client/claims');
                }}
              >
                Initiate Claim
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
