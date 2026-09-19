import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Target,
  FileText,
  CarFront,
  HelpCircle,
  Plus,
  Clock,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { ProgressBar } from '../../components/common/ProgressBar.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { api } from '../../services/api.js';
import { FinancialCalculationSummary, Claim, Goal } from '../../types/index.js';

export const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [finances, setFinances] = useState<FinancialCalculationSummary | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [overallGoalProgress, setOverallGoalProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [finRes, claimsRes, goalsRes] = await Promise.all([
        api.finances.get(),
        api.claims.getAll(),
        api.goals.getAll(),
      ]);
      setFinances(finRes);
      setClaims(claimsRes || []);
      setGoals(goalsRes.goals || []);
      setOverallGoalProgress(goalsRes.overallProgress || 0);
    } catch (err: any) {
      console.error('Failed to load client dashboard:', err);
      setError(err.message || 'Unable to load dashboard metrics');
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

  const activeClaim = claims.find((c) => c.status !== 'Settled' && c.status !== 'Rejected') || claims[0];

  return (
    <div className="space-y-6">
      {/* Top Banner: Welcome & Quick Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9D9D9] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] tracking-tight">Portfolio Overview</h1>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Royal Square Financial Executive Client Portal • Real-time valuation as of{' '}
            {finances?.lastValuationDate ? new Date(finances.lastValuationDate).toLocaleDateString('en-ZA') : 'today'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<HelpCircle className="w-3.5 h-3.5" />}
            onClick={() => navigate('/client/service-requests')}
          >
            Lodge Service Request
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<CarFront className="w-3.5 h-3.5" />}
            onClick={() => navigate('/client/claims')}
          >
            Motor Claims Wizard
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-800 flex items-center justify-between">
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={loadDashboardData}>
            Retry
          </Button>
        </div>
      )}

      {/* Net Worth Summary Banner */}
      <div className="bg-[#111111] text-white rounded-xl p-6 md:p-8 shadow-md border border-[#1F1F1F] relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#C62828]/20 to-transparent pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          {/* Net Worth (Total Assets - Total Liabilities) */}
          <div className="lg:border-r lg:border-white/10 lg:pr-6">
            <span className="text-xs uppercase font-semibold tracking-wider text-gray-400">Total Net Worth</span>
            <div className="text-3xl md:text-4xl font-black tracking-tight text-white mt-2">
              {loading ? 'R ...' : formatZAR(finances?.netWorth || 0)}
            </div>
            <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              Dynamic Balance: Assets less current liabilities
            </p>
          </div>

          {/* Total Assets Breakdown */}
          <div className="lg:border-r lg:border-white/10 lg:pr-6">
            <span className="text-xs uppercase font-semibold tracking-wider text-gray-400">Total Assets Under Advice</span>
            <div className="text-2xl md:text-3xl font-bold text-white mt-2 flex items-center gap-2">
              {loading ? 'R ...' : formatZAR(finances?.totalAssets || 0)}
              <ArrowUpRight className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
              <span>{finances?.assets?.length || 0} recorded assets across 5 categories</span>
            </div>
          </div>

          {/* Total Liabilities */}
          <div>
            <span className="text-xs uppercase font-semibold tracking-wider text-gray-400">Total Liabilities</span>
            <div className="text-2xl md:text-3xl font-bold text-white mt-2 flex items-center gap-2">
              {loading ? 'R ...' : formatZAR(finances?.totalLiabilities || 0)}
              <ArrowDownRight className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
              <span>Debt-to-Asset Ratio: {finances?.debtToAssetRatio || 0}%</span>
            </div>
          </div>
        </div>

        {/* Quick Actions Strip */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-gray-400">Quick Navigation:</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate('/client/finances')}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded transition cursor-pointer"
            >
              Manage Assets & Debts →
            </button>
            <button
              onClick={() => navigate('/client/goals')}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded transition cursor-pointer"
            >
              Goal Projections →
            </button>
            <button
              onClick={() => navigate('/client/policies')}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded transition cursor-pointer"
            >
              Active Policies →
            </button>
            <button
              onClick={() => navigate('/client/documents')}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded transition cursor-pointer"
            >
              Documents Vault →
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Recent Claim Status & Goal Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Claim Status Card */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <CarFront className="w-4 h-4 text-[#C62828]" />
              <span>Active Insurance Claim Status</span>
            </div>
          }
          headerAction={
            activeClaim && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/client/claims')}
              >
                Track Timeline →
              </Button>
            )
          }
        >
          {loading ? (
            <div className="h-40 bg-gray-50 animate-pulse rounded" />
          ) : activeClaim ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b border-[#D9D9D9] pb-3">
                <div>
                  <span className="text-xs font-bold text-[#C62828] tracking-wider uppercase">
                    {activeClaim.claimNumber}
                  </span>
                  <h4 className="text-sm font-semibold text-[#111111] mt-0.5">{activeClaim.description}</h4>
                  <p className="text-xs text-[#6B6B6B] mt-1">
                    Insurer: <strong className="text-[#111111]">{activeClaim.insurer}</strong> • Policy: {activeClaim.policyNumber}
                  </p>
                </div>
                <StatusBadge status={activeClaim.status} />
              </div>

              <div className="bg-[#F8F9FA] p-3.5 rounded-lg border border-[#D9D9D9]">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-[#6B6B6B]">Current Workflow Stage:</span>
                  <span className="font-bold text-[#C62828] uppercase tracking-wide">{activeClaim.currentStage}</span>
                </div>
                {/* Visual miniature pipeline */}
                <div className="flex items-center gap-1">
                  {['Reported', 'Submitted', 'Claim #', 'Assessment', 'Auth', 'Repair', 'Closed'].map((step, idx) => {
                    const activeIdx = 4; // authorising
                    const isDone = idx <= activeIdx;
                    return (
                      <div key={step} className="flex-1">
                        <div
                          className={`h-1.5 rounded-full ${
                            isDone ? 'bg-[#C62828]' : 'bg-[#E5E7EB]'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#6B6B6B]">
                <span>Estimated Claim Value: <strong className="text-[#111111]">{formatZAR(activeClaim.estimatedAmount || 0)}</strong></span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Logged: {new Date(activeClaim.createdAt).toLocaleDateString('en-ZA')}
                </span>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No active claims recorded"
              description="You have no pending or active insurance claims with Santam, Discovery, or Old Mutual."
              actionLabel="Lodge Motor Claim"
              onAction={() => navigate('/client/claims')}
            />
          )}
        </Card>

        {/* Wealth Goals Progress Card */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#C62828]" />
              <span>Financial Wealth Goals</span>
            </div>
          }
          headerAction={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/client/goals')}
            >
              All Goals →
            </Button>
          }
        >
          {loading ? (
            <div className="h-40 bg-gray-50 animate-pulse rounded" />
          ) : goals.length > 0 ? (
            <div className="space-y-4">
              <div className="p-3 bg-[#F8F9FA] rounded-md border border-[#D9D9D9] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#6B6B6B]">Overall Contribution Progress</span>
                  <div className="text-base font-bold text-[#111111]">{overallGoalProgress}% of Target Wealth</div>
                </div>
                <div className="w-24">
                  <ProgressBar value={overallGoalProgress} showPercentage={false} size="sm" />
                </div>
              </div>

              <div className="space-y-3 divide-y divide-gray-100">
                {goals.slice(0, 3).map((g) => (
                  <div key={g.id} className="pt-3 first:pt-0">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-semibold text-[#111111] truncate max-w-[220px]">{g.title}</span>
                      <span className="text-[#6B6B6B] font-mono">
                        {formatZAR(g.currentAmount)} / {formatZAR(g.targetAmount)}
                      </span>
                    </div>
                    <ProgressBar
                      value={g.progressPercentage || Math.round((g.currentAmount / g.targetAmount) * 100)}
                      showPercentage={false}
                      size="sm"
                    />
                    <div className="flex justify-between items-center text-[11px] text-[#6B6B6B] mt-1">
                      <span>Target: {new Date(g.targetDate).getFullYear()}</span>
                      <StatusBadge status={g.status} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              title="No goals created yet"
              description="Establish strategic wealth objectives such as retirement, emergency reserves, and education funds."
              actionLabel="Create First Goal"
              onAction={() => navigate('/client/goals')}
            />
          )}
        </Card>
      </div>

      {/* Asset Allocation Breakdown Banner */}
      <Card
        title="Asset Allocation & Solvency Breakdown"
        subtitle="Consolidated view of liquid, fixed, and retirement capital assets"
      >
        {loading ? (
          <div className="h-24 bg-gray-50 animate-pulse rounded" />
        ) : finances && finances.assets && finances.assets.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {Object.entries(finances.assetsByCategory).map(([category, data]) => (
                <div key={category} className="p-3 bg-[#F8F9FA] rounded-md border border-[#D9D9D9]">
                  <span className="text-[11px] uppercase font-bold text-[#6B6B6B] block truncate">{category}</span>
                  <div className="text-base font-bold text-[#111111] mt-1">{formatZAR(data.total)}</div>
                  <span className="text-[10px] text-[#6B6B6B] mt-0.5 block">{data.count} items recorded</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            title="No assets registered"
            description="Add your investment portfolios, properties, and retirement accounts."
            actionLabel="Add Asset"
            onAction={() => navigate('/client/finances')}
          />
        )}
      </Card>
    </div>
  );
};
