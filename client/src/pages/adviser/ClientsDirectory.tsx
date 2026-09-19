import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Building,
  UserCheck,
  Eye,
} from 'lucide-react';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { DataTable, Column } from '../../components/common/DataTable.js';
import { api } from '../../services/api.js';
import { ClientProfileSummary } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';

export const ClientsDirectory: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedClientId } = useAuth();
  const [clients, setClients] = useState<ClientProfileSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [tierFilter, setTierFilter] = useState<string>('ALL');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.adviser.getClients();
      setClients(data || []);
    } catch (err: any) {
      console.error('Failed to load clients:', err);
      setError(err.message || 'Unable to load client directory');
    } finally {
      setLoading(false);
    }
  };

  const formatZAR = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.idNumber && c.idNumber.includes(search));

    const matchesTier = tierFilter === 'ALL' || c.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const handleInspectClient = (client: ClientProfileSummary) => {
    setSelectedClientId(client.id);
    navigate(`/adviser/clients/${client.id}`);
  };

  const columns: Column<ClientProfileSummary>[] = [
    {
      key: 'name',
      header: 'Client Legal Entity',
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-xs uppercase">
            {c.name.slice(0, 2)}
          </div>
          <div>
            <div className="font-bold text-[#111111] text-sm">{c.name}</div>
            <div className="text-xs text-[#6B6B6B]">
              ID: {c.idNumber || 'FICA on file'} • {c.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'tier',
      header: 'Advisory Tier',
      render: (c) => (
        <span
          className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${
            c.tier === 'Private Wealth'
              ? 'bg-[#111111] text-white'
              : c.tier === 'Executive Client'
              ? 'bg-[#C62828] text-white'
              : 'bg-[#F2F2F2] text-[#1F1F1F] border border-[#D9D9D9]'
          }`}
        >
          {c.tier}
        </span>
      ),
    },
    {
      key: 'totalAum',
      header: 'AUM Under Advice',
      align: 'right',
      render: (c) => (
        <span className="font-bold text-[#111111] font-mono text-sm">{formatZAR(c.totalAum)}</span>
      ),
    },
    {
      key: 'netWorth',
      header: 'Declared Net Worth',
      align: 'right',
      render: (c) => (
        <span className="font-bold text-emerald-800 font-mono text-sm">{formatZAR(c.netWorth)}</span>
      ),
    },
    {
      key: 'riskProfile',
      header: 'Risk Profile',
      render: (c) => <StatusBadge status={c.riskProfile} size="sm" />,
    },
    {
      key: 'lastReviewDate',
      header: 'Last Review',
      render: (c) => (
        <span className="text-xs text-[#6B6B6B]">
          {new Date(c.lastReviewDate).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (c) => (
        <div className="flex items-center justify-end">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Eye className="w-3.5 h-3.5" />}
            onClick={() => handleInspectClient(c)}
          >
            Client 360 Review
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9D9D9] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] tracking-tight">Client Directory & Register</h1>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Institutional client book management under Category I FSP license provisions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#6B6B6B]" />
            <input
              type="text"
              placeholder="Search by client name, ID, or email..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-[#D9D9D9] focus:outline-none focus:border-[#C62828]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tier Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {['ALL', 'Private Wealth', 'Executive Client', 'Affluent'].map((tier) => (
          <button
            key={tier}
            onClick={() => setTierFilter(tier)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              tierFilter === tier
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-white border border-[#D9D9D9] text-[#6B6B6B] hover:text-[#111111] hover:bg-[#F2F2F2]'
            }`}
          >
            {tier === 'ALL' ? 'All Clients' : tier}
          </button>
        ))}
      </div>

      {/* Client Table */}
      <Card
        title="Registered Client Mandates"
        subtitle="Click any row to open the complete financial review deep dive"
      >
        <DataTable
          columns={columns}
          data={filteredClients}
          keyExtractor={(c) => c.id}
          isLoading={loading}
          emptyTitle="No clients found"
          emptyDescription="Try adjusting your search filter or classification criteria."
        />
      </Card>
    </div>
  );
};
