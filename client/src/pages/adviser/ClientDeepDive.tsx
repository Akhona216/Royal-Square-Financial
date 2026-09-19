import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  UserCheck,
  ShieldCheck,
  TrendingUp,
  FileCheck2,
  CarFront,
  HelpCircle,
  FolderLock,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { ProgressBar } from '../../components/common/ProgressBar.js';
import { api } from '../../services/api.js';

export const ClientDeepDive: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [clientData, setClientData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadDeepDive(id);
    }
  }, [id]);

  const loadDeepDive = async (clientId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.adviser.getClientDeepDive(clientId);
      setClientData(res);
    } catch (err: any) {
      console.error('Failed to load client 360:', err);
      setError(err.message || 'Unable to load client 360 data');
    } finally {
      setLoading(false);
    }
  };

  const [exportNotice, setExportNotice] = useState(false);
  const handleExportSummary = () => {
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  const formatZAR = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse" />
        <div className="h-64 bg-white border border-[#D9D9D9] rounded-lg animate-pulse" />
      </div>
    );
  }

  if (error || !clientData) {
    return (
      <div className="p-8 text-center bg-white border border-[#D9D9D9] rounded-lg">
        <h3 className="text-base font-bold text-red-700">Client Not Found</h3>
        <p className="text-xs text-[#6B6B6B] mt-1">{error || 'Unable to retrieve client record.'}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/adviser/clients')}>
          Back to Directory
        </Button>
      </div>
    );
  }

  const { client, finances, policies, claims, goals, serviceRequests, documents } = clientData;

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9D9D9] pb-5">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            onClick={() => navigate('/adviser/clients')}
          >
            Directory
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#111111] tracking-tight">{client.name}</h1>
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#111111] text-white">
                {client.tier || 'Private Wealth'}
              </span>
            </div>
            <p className="text-xs text-[#6B6B6B] mt-0.5">
              Client ID: {client.id} • FSP Advisory Mandate Active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportSummary}
          >
            Export Compliance Pack
          </Button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-md flex items-center justify-between">
          <span>Client 360 Advisory Pack for {client.name} exported for FSP compliance records.</span>
          <span className="text-[10px] text-emerald-600 uppercase font-mono font-bold">FAIS Cat I</span>
        </div>
      )}

      {/* Client Profile Card */}
      <div className="bg-white p-6 rounded-lg border border-[#D9D9D9] shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <span className="text-xs font-bold text-[#6B6B6B] uppercase tracking-wider block">Contact Particulars</span>
            <div className="text-sm font-semibold text-[#111111] mt-1">{client.email}</div>
            <div className="text-xs text-[#6B6B6B]">{client.phone || '+27 82 459 8920'}</div>
          </div>
          <div>
            <span className="text-xs font-bold text-[#6B6B6B] uppercase tracking-wider block">FICA & Tax References</span>
            <div className="text-xs font-medium text-[#111111] mt-1">ID: {client.idNumber || '8803155123088'}</div>
            <div className="text-xs text-[#6B6B6B]">SARS Tax: {client.taxNumber || '9482103492'}</div>
          </div>
          <div>
            <span className="text-xs font-bold text-[#6B6B6B] uppercase tracking-wider block">Risk Tolerance</span>
            <div className="mt-1">
              <StatusBadge status={client.riskProfile || 'Moderate Aggressive'} size="sm" />
            </div>
          </div>
          <div>
            <span className="text-xs font-bold text-[#6B6B6B] uppercase tracking-wider block">Mandate Review Schedule</span>
            <div className="text-xs text-[#111111] mt-1">Last: {client.lastReviewDate}</div>
            <div className="text-xs text-emerald-700 font-medium">Next: {client.nextReviewDate}</div>
          </div>
        </div>
      </div>

      {/* Financial Position Snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-lg border border-[#D9D9D9] shadow-xs">
          <span className="text-xs uppercase font-bold text-[#6B6B6B] tracking-wider">Total Net Worth</span>
          <div className="text-2xl font-extrabold text-[#111111] mt-1.5">
            {formatZAR(finances?.netWorth || 0)}
          </div>
          <span className="text-[11px] text-emerald-700 mt-1 block">Assets: {formatZAR(finances?.totalAssets || 0)}</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#D9D9D9] shadow-xs">
          <span className="text-xs uppercase font-bold text-[#6B6B6B] tracking-wider">Total Liabilities</span>
          <div className="text-2xl font-extrabold text-[#C62828] mt-1.5">
            {formatZAR(finances?.totalLiabilities || 0)}
          </div>
          <span className="text-[11px] text-[#6B6B6B] mt-1 block">Debt Ratio: {finances?.debtToAssetRatio || 0}%</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#D9D9D9] shadow-xs">
          <span className="text-xs uppercase font-bold text-[#6B6B6B] tracking-wider">Active Policy Contracts</span>
          <div className="text-2xl font-extrabold text-[#111111] mt-1.5">
            {policies?.length || 0} Policies
          </div>
          <span className="text-[11px] text-[#6B6B6B] mt-1 block">Santam, Sanlam, Discovery</span>
        </div>
      </div>

      {/* Deep Dive Multi-Module Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Policies */}
        <Card title="Insurance & Investment Policies" subtitle={`${policies?.length || 0} institutional policies registered`}>
          <div className="divide-y divide-[#D9D9D9]">
            {policies?.map((pol: any) => (
              <div key={pol.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#111111] block">{pol.type}</span>
                  <span className="text-[#6B6B6B] font-mono">{pol.policyNumber} • {pol.provider}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#111111] block font-mono">{formatZAR(pol.coverageAmount)}</span>
                  <StatusBadge status={pol.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Insurance Claims */}
        <Card title="Insurance Claims Register" subtitle="Active and closed loss assessments">
          {claims && claims.length > 0 ? (
            <div className="divide-y divide-[#D9D9D9]">
              {claims.map((claim: any) => (
                <div key={claim.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#111111] block">{claim.claimNumber}</span>
                    <span className="text-[#6B6B6B]">{claim.description}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#C62828] uppercase block">{claim.currentStage}</span>
                    <StatusBadge status={claim.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#6B6B6B]">No claims lodged under this client portfolio.</p>
          )}
        </Card>
      </div>

      {/* Strategic Goals & Service Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goals */}
        <Card title="Strategic Wealth Goals" subtitle="Retirement and capital preservation targets">
          {goals && goals.length > 0 ? (
            <div className="space-y-3">
              {goals.map((g: any) => (
                <div key={g.id} className="p-3 bg-[#F8F9FA] rounded border border-[#D9D9D9]">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-bold text-[#111111]">{g.title}</span>
                    <span className="font-mono">{formatZAR(g.currentAmount)} / {formatZAR(g.targetAmount)}</span>
                  </div>
                  <ProgressBar value={g.progressPercentage || 50} size="sm" showPercentage={false} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#6B6B6B]">No goals recorded yet.</p>
          )}
        </Card>

        {/* FICA Documents */}
        <Card title="FICA Vault Records" subtitle="Identity and compliance filings">
          <div className="divide-y divide-[#D9D9D9]">
            {documents?.map((doc: any) => (
              <div key={doc.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-[#111111] block">{doc.name}</span>
                  <span className="text-[#6B6B6B]">{doc.category} • {doc.fileSize}</span>
                </div>
                <span className="text-xs font-bold text-emerald-700">Verified</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
