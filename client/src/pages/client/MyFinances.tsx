import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  TrendingUp,
  Wallet,
  ShieldCheck,
  Building,
  PiggyBank,
  Car,
  Landmark,
  CreditCard,
  Percent,
} from 'lucide-react';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { Modal } from '../../components/common/Modal.js';
import { Input, Select } from '../../components/common/Input.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { DataTable, Column } from '../../components/common/DataTable.js';
import { api } from '../../services/api.js';
import {
  Asset,
  Liability,
  AssetCategory,
  LiabilityCategory,
  FinancialCalculationSummary,
} from '../../types/index.js';

export const MyFinances: React.FC = () => {
  const [finances, setFinances] = useState<FinancialCalculationSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Asset Modal State
  const [isAssetModalOpen, setIsAssetModalOpen] = useState<boolean>(false);
  const [assetName, setAssetName] = useState('');
  const [assetCategory, setAssetCategory] = useState<AssetCategory>('Investments');
  const [assetInstitution, setAssetInstitution] = useState('');
  const [assetValue, setAssetValue] = useState('');
  const [assetAccountNo, setAssetAccountNo] = useState('');
  const [assetSubmitting, setAssetSubmitting] = useState(false);

  // Liability Modal State
  const [isLiabilityModalOpen, setIsLiabilityModalOpen] = useState<boolean>(false);
  const [liabilityName, setLiabilityName] = useState('');
  const [liabilityCategory, setLiabilityCategory] = useState<LiabilityCategory>('Home Loan');
  const [liabilityInstitution, setLiabilityInstitution] = useState('');
  const [liabilityBalance, setLiabilityBalance] = useState('');
  const [liabilityMonthly, setLiabilityMonthly] = useState('');
  const [liabilityRate, setLiabilityRate] = useState('');
  const [liabilitySubmitting, setLiabilitySubmitting] = useState(false);

  useEffect(() => {
    fetchFinances();
  }, []);

  const fetchFinances = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.finances.get();
      setFinances(data);
    } catch (err: any) {
      console.error('Error loading finances:', err);
      setError(err.message || 'Unable to load financial position');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName || !assetValue) return;
    setAssetSubmitting(true);
    try {
      await api.finances.addAsset({
        name: assetName,
        category: assetCategory,
        institution: assetInstitution || 'Allan Gray / Sanlam / Standard Bank',
        currentValue: Number(assetValue),
        accountNumber: assetAccountNo,
        currency: 'ZAR',
      });
      setIsAssetModalOpen(false);
      setAssetName('');
      setAssetValue('');
      setAssetAccountNo('');
      fetchFinances();
    } catch (err: any) {
      alert(err.message || 'Failed to add asset');
    } finally {
      setAssetSubmitting(false);
    }
  };

  const handleCreateLiability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liabilityName || !liabilityBalance) return;
    setLiabilitySubmitting(true);
    try {
      await api.finances.addLiability({
        name: liabilityName,
        category: liabilityCategory,
        institution: liabilityInstitution || 'Standard Bank / WesBank / Investec',
        outstandingBalance: Number(liabilityBalance),
        monthlyPayment: Number(liabilityMonthly || 0),
        interestRate: liabilityRate ? Number(liabilityRate) : undefined,
        currency: 'ZAR',
      });
      setIsLiabilityModalOpen(false);
      setLiabilityName('');
      setLiabilityBalance('');
      setLiabilityMonthly('');
      setLiabilityRate('');
      fetchFinances();
    } catch (err: any) {
      alert(err.message || 'Failed to add liability');
    } finally {
      setLiabilitySubmitting(false);
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (!confirm('Are you sure you want to remove this asset?')) return;
    try {
      await api.finances.deleteAsset(id);
      fetchFinances();
    } catch (err: any) {
      alert(err.message || 'Failed to delete asset');
    }
  };

  const handleDeleteLiability = async (id: string) => {
    if (!confirm('Are you sure you want to remove this liability?')) return;
    try {
      await api.finances.deleteLiability(id);
      fetchFinances();
    } catch (err: any) {
      alert(err.message || 'Failed to delete liability');
    }
  };

  const formatZAR = (num: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const assetColumns: Column<Asset>[] = [
    {
      key: 'name',
      header: 'Asset Description',
      render: (item) => (
        <div>
          <div className="font-semibold text-[#111111]">{item.name}</div>
          <div className="text-xs text-[#6B6B6B]">
            {item.institution} {item.accountNumber ? `• Ref: ${item.accountNumber}` : ''}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (item) => (
        <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-[#F2F2F2] text-[#1F1F1F] border border-[#D9D9D9]">
          {item.category}
        </span>
      ),
    },
    {
      key: 'currentValue',
      header: 'Valuation (ZAR)',
      align: 'right',
      render: (item) => (
        <span className="font-bold text-[#111111] font-mono text-sm">{formatZAR(item.currentValue)}</span>
      ),
    },
    {
      key: 'lastUpdated',
      header: 'Valuation Date',
      render: (item) => (
        <span className="text-xs text-[#6B6B6B]">
          {item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString('en-ZA') : 'Recent'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (item) => (
        <button
          onClick={() => handleDeleteAsset(item.id)}
          className="p-1.5 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded transition cursor-pointer"
          title="Remove asset"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const liabilityColumns: Column<Liability>[] = [
    {
      key: 'name',
      header: 'Liability Facility',
      render: (item) => (
        <div>
          <div className="font-semibold text-[#111111]">{item.name}</div>
          <div className="text-xs text-[#6B6B6B]">{item.institution}</div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Type',
      render: (item) => (
        <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-800 border border-red-200">
          {item.category}
        </span>
      ),
    },
    {
      key: 'interestRate',
      header: 'Interest Rate',
      render: (item) => (
        <span className="text-xs font-semibold text-[#1F1F1F]">
          {item.interestRate ? `${item.interestRate}% p.a.` : 'Prime'}
        </span>
      ),
    },
    {
      key: 'monthlyPayment',
      header: 'Monthly Repayment',
      align: 'right',
      render: (item) => (
        <span className="text-xs font-semibold text-[#6B6B6B] font-mono">
          {item.monthlyPayment ? `${formatZAR(item.monthlyPayment)} / mo` : '—'}
        </span>
      ),
    },
    {
      key: 'outstandingBalance',
      header: 'Balance Owed (ZAR)',
      align: 'right',
      render: (item) => (
        <span className="font-bold text-red-700 font-mono text-sm">{formatZAR(item.outstandingBalance)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (item) => (
        <button
          onClick={() => handleDeleteLiability(item.id)}
          className="p-1.5 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded transition cursor-pointer"
          title="Remove liability"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9D9D9] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] tracking-tight">Balance Sheet & Net Worth</h1>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Dynamic asset and liability register with automated solvency metrics calculation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsLiabilityModalOpen(true)}
          >
            Add Liability
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsAssetModalOpen(true)}
          >
            Add Asset
          </Button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-[#D9D9D9] shadow-xs">
          <span className="text-xs uppercase font-bold text-[#6B6B6B] tracking-wider">Total Net Worth</span>
          <div className="text-2xl font-extrabold text-[#111111] mt-1.5">
            {loading ? '...' : formatZAR(finances?.netWorth || 0)}
          </div>
          <span className="text-[11px] text-emerald-700 mt-1 block font-medium">
            Assets minus Total Liabilities
          </span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#D9D9D9] shadow-xs">
          <span className="text-xs uppercase font-bold text-[#6B6B6B] tracking-wider">Total Assets</span>
          <div className="text-2xl font-extrabold text-emerald-800 mt-1.5">
            {loading ? '...' : formatZAR(finances?.totalAssets || 0)}
          </div>
          <span className="text-[11px] text-[#6B6B6B] mt-1 block">
            {finances?.assets?.length || 0} items registered
          </span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#D9D9D9] shadow-xs">
          <span className="text-xs uppercase font-bold text-[#6B6B6B] tracking-wider">Total Liabilities</span>
          <div className="text-2xl font-extrabold text-[#C62828] mt-1.5">
            {loading ? '...' : formatZAR(finances?.totalLiabilities || 0)}
          </div>
          <span className="text-[11px] text-[#6B6B6B] mt-1 block">
            {finances?.liabilities?.length || 0} debt facilities active
          </span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#D9D9D9] shadow-xs">
          <span className="text-xs uppercase font-bold text-[#6B6B6B] tracking-wider">Monthly Debt Service</span>
          <div className="text-2xl font-extrabold text-[#1F1F1F] mt-1.5">
            {loading ? '...' : formatZAR(finances?.totalMonthlyDebtPayment || 0)}
          </div>
          <span className="text-[11px] text-[#6B6B6B] mt-1 block">
            Debt-to-Asset: {finances?.debtToAssetRatio || 0}%
          </span>
        </div>
      </div>

      {/* Asset Table Section */}
      <Card
        title="Assets Portfolio"
        subtitle="Investments, fixed property, notice savings, and retirement annuity positions"
        headerAction={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsAssetModalOpen(true)}
          >
            Add New Asset
          </Button>
        }
      >
        <DataTable
          columns={assetColumns}
          data={finances?.assets || []}
          keyExtractor={(item) => item.id}
          isLoading={loading}
          emptyTitle="No assets registered"
          emptyDescription="You have not added any investment, property, or savings assets yet."
          emptyActionLabel="Register First Asset"
          onEmptyAction={() => setIsAssetModalOpen(true)}
        />
      </Card>

      {/* Liability Table Section */}
      <Card
        title="Liabilities & Financing Facilities"
        subtitle="Home loans, vehicle asset finance, personal loans, and credit facilities"
        headerAction={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsLiabilityModalOpen(true)}
          >
            Add Liability
          </Button>
        }
      >
        <DataTable
          columns={liabilityColumns}
          data={finances?.liabilities || []}
          keyExtractor={(item) => item.id}
          isLoading={loading}
          emptyTitle="No liabilities recorded"
          emptyDescription="Zero debts or active borrowing facilities are listed under this portfolio."
          emptyActionLabel="Add Debt Facility"
          onEmptyAction={() => setIsLiabilityModalOpen(true)}
        />
      </Card>

      {/* Add Asset Modal */}
      <Modal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        title="Register New Asset"
        subtitle="Add a financial holding to your balance sheet valuation"
      >
        <form onSubmit={handleCreateAsset} className="space-y-4">
          <Input
            label="Asset Name / Description"
            placeholder="e.g. Allan Gray Balanced Fund or Hermanus Holiday House"
            value={assetName}
            onChange={(e) => setAssetName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Asset Category"
              value={assetCategory}
              onChange={(e) => setAssetCategory(e.target.value as AssetCategory)}
              options={[
                { label: 'Investments (Unit Trusts / Equities)', value: 'Investments' },
                { label: 'Property (Primary Residence / Commercial)', value: 'Property' },
                { label: 'Savings (Fixed Deposits / Money Market)', value: 'Savings' },
                { label: 'Retirement (Preservation / Annuity)', value: 'Retirement' },
                { label: 'Other (Vehicles / Collectibles)', value: 'Other' },
              ]}
            />
            <Input
              label="Financial Institution"
              placeholder="e.g. Allan Gray / Standard Bank"
              value={assetInstitution}
              onChange={(e) => setAssetInstitution(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Current Valuation (ZAR)"
              type="number"
              prefixText="R"
              placeholder="e.g. 500000"
              value={assetValue}
              onChange={(e) => setAssetValue(e.target.value)}
              required
            />
            <Input
              label="Account / Reference Number (Optional)"
              placeholder="e.g. AG-10294"
              value={assetAccountNo}
              onChange={(e) => setAssetAccountNo(e.target.value)}
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-[#D9D9D9]">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsAssetModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={assetSubmitting}
            >
              Save Asset to Balance Sheet
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Liability Modal */}
      <Modal
        isOpen={isLiabilityModalOpen}
        onClose={() => setIsLiabilityModalOpen(false)}
        title="Register Liability Facility"
        subtitle="Add a loan or credit balance to calculate net solvency"
      >
        <form onSubmit={handleCreateLiability} className="space-y-4">
          <Input
            label="Liability Description"
            placeholder="e.g. Standard Bank Bond or WesBank Vehicle Finance"
            value={liabilityName}
            onChange={(e) => setLiabilityName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Liability Category"
              value={liabilityCategory}
              onChange={(e) => setLiabilityCategory(e.target.value as LiabilityCategory)}
              options={[
                { label: 'Home Loan (Mortgage Bond)', value: 'Home Loan' },
                { label: 'Vehicle Finance (Asset Finance)', value: 'Vehicle Finance' },
                { label: 'Personal Loans', value: 'Personal Loans' },
                { label: 'Credit Card / Overdraft', value: 'Credit' },
                { label: 'Other Debt', value: 'Other' },
              ]}
            />
            <Input
              label="Lender Institution"
              placeholder="e.g. WesBank / Standard Bank"
              value={liabilityInstitution}
              onChange={(e) => setLiabilityInstitution(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Outstanding Balance"
              type="number"
              prefixText="R"
              placeholder="e.g. 250000"
              value={liabilityBalance}
              onChange={(e) => setLiabilityBalance(e.target.value)}
              required
            />
            <Input
              label="Monthly Installment"
              type="number"
              prefixText="R"
              placeholder="e.g. 5200"
              value={liabilityMonthly}
              onChange={(e) => setLiabilityMonthly(e.target.value)}
            />
            <Input
              label="Interest Rate (%)"
              type="number"
              step="0.01"
              suffixText="%"
              placeholder="e.g. 11.75"
              value={liabilityRate}
              onChange={(e) => setLiabilityRate(e.target.value)}
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-[#D9D9D9]">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsLiabilityModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={liabilitySubmitting}
            >
              Record Liability
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
