import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  Edit2,
} from 'lucide-react';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { Modal } from '../../components/common/Modal.js';
import { Input, Select, DatePicker } from '../../components/common/Input.js';
import { ProgressBar } from '../../components/common/ProgressBar.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { api } from '../../services/api.js';
import { Goal, GoalCategory } from '../../types/index.js';

export const MyGoals: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [totalTarget, setTotalTarget] = useState<number>(0);
  const [totalSaved, setTotalSaved] = useState<number>(0);
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GoalCategory>('Retirement');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.goals.getAll();
      setGoals(res.goals || []);
      setTotalTarget(res.totalTarget || 0);
      setTotalSaved(res.totalSaved || 0);
      setOverallProgress(res.overallProgress || 0);
    } catch (err: any) {
      console.error('Failed to load goals:', err);
      setError(err.message || 'Unable to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingGoalId(null);
    setTitle('');
    setCategory('Retirement');
    setTargetAmount('');
    setCurrentAmount('');
    setMonthlyContribution('');
    setTargetDate('2035-12-31');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setTitle(goal.title);
    setCategory(goal.category);
    setTargetAmount(goal.targetAmount.toString());
    setCurrentAmount(goal.currentAmount.toString());
    setMonthlyContribution(goal.monthlyContribution?.toString() || '');
    setTargetDate(goal.targetDate.split('T')[0]);
    setNotes(goal.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetAmount || !targetDate) return;
    setSubmitting(true);
    try {
      const payload = {
        title,
        category,
        targetAmount: Number(targetAmount),
        currentAmount: Number(currentAmount || 0),
        monthlyContribution: Number(monthlyContribution || 0),
        targetDate,
        notes,
      };

      if (editingGoalId) {
        await api.goals.update(editingGoalId, payload);
      } else {
        await api.goals.create(payload);
      }
      setIsModalOpen(false);
      fetchGoals();
    } catch (err: any) {
      alert(err.message || 'Failed to save goal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm('Are you sure you want to remove this financial goal?')) return;
    try {
      await api.goals.delete(id);
      fetchGoals();
    } catch (err: any) {
      alert(err.message || 'Failed to delete goal');
    }
  };

  const formatZAR = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9D9D9] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] tracking-tight">Strategic Wealth Goals</h1>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Track multi-horizon objectives across retirement annuities, capital growth, and emergency liquidity.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={handleOpenCreateModal}
        >
          Define New Goal
        </Button>
      </div>

      {/* Aggregate Goal Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-lg border border-[#D9D9D9] shadow-xs">
          <span className="text-xs uppercase font-bold text-[#6B6B6B] tracking-wider">Accumulated Towards Goals</span>
          <div className="text-2xl font-extrabold text-emerald-800 mt-1.5">
            {loading ? '...' : formatZAR(totalSaved)}
          </div>
          <span className="text-[11px] text-[#6B6B6B] mt-1 block">Current contributions across {goals.length} goals</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#D9D9D9] shadow-xs">
          <span className="text-xs uppercase font-bold text-[#6B6B6B] tracking-wider">Total Target Capital</span>
          <div className="text-2xl font-extrabold text-[#111111] mt-1.5">
            {loading ? '...' : formatZAR(totalTarget)}
          </div>
          <span className="text-[11px] text-[#6B6B6B] mt-1 block">Total nominal wealth target required</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#D9D9D9] shadow-xs">
          <span className="text-xs uppercase font-bold text-[#6B6B6B] tracking-wider">Overall Progress</span>
          <div className="text-2xl font-extrabold text-[#C62828] mt-1.5">
            {loading ? '...' : `${overallProgress}%`}
          </div>
          <div className="mt-2">
            <ProgressBar value={overallProgress} showPercentage={false} size="sm" />
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-white border border-[#D9D9D9] rounded-lg animate-pulse p-6" />
          ))}
        </div>
      ) : goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const pct = goal.progressPercentage || Math.round((goal.currentAmount / goal.targetAmount) * 100);
            const shortfall = Math.max(0, goal.targetAmount - goal.currentAmount);

            return (
              <Card
                key={goal.id}
                title={
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#111111]">{goal.title}</span>
                  </div>
                }
                headerAction={
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={goal.status} size="sm" />
                    <button
                      onClick={() => handleOpenEditModal(goal)}
                      className="p-1 text-[#6B6B6B] hover:text-[#111111] rounded hover:bg-[#F2F2F2] cursor-pointer"
                      title="Edit goal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-1 text-[#6B6B6B] hover:text-red-700 rounded hover:bg-red-50 cursor-pointer"
                      title="Delete goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                }
              >
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-xs text-[#6B6B6B]">Contribution Progress</span>
                      <span className="text-sm font-bold text-[#111111] font-mono">
                        {formatZAR(goal.currentAmount)} / {formatZAR(goal.targetAmount)}
                      </span>
                    </div>
                    <ProgressBar
                      value={pct}
                      showPercentage={true}
                      size="md"
                      color={pct >= 100 ? 'emerald' : 'primary'}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-[#D9D9D9]">
                    <div>
                      <span className="text-[#6B6B6B] block">Category</span>
                      <strong className="text-[#111111] font-medium">{goal.category}</strong>
                    </div>
                    <div>
                      <span className="text-[#6B6B6B] block">Target Date</span>
                      <strong className="text-[#111111] font-medium">
                        {new Date(goal.targetDate).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[#6B6B6B] block">Monthly Debit Order</span>
                      <strong className="text-[#111111] font-medium">
                        {goal.monthlyContribution ? `${formatZAR(goal.monthlyContribution)} / mo` : 'Discretionary'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[#6B6B6B] block">Capital Shortfall</span>
                      <strong className="text-red-700 font-medium">{formatZAR(shortfall)}</strong>
                    </div>
                  </div>

                  {goal.notes && (
                    <div className="p-2.5 bg-[#F8F9FA] rounded text-xs text-[#6B6B6B] border border-[#D9D9D9]">
                      {goal.notes}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No wealth goals recorded"
          description="Build structured goals for your retirement, offshore allocations, emergency buffers, or property deposits."
          actionLabel="Create First Goal"
          onAction={handleOpenCreateModal}
        />
      )}

      {/* Goal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGoalId ? 'Edit Wealth Goal' : 'Define Strategic Wealth Goal'}
        subtitle="Specify target capital, completion timeline, and contribution schedule"
      >
        <form onSubmit={handleSaveGoal} className="space-y-4">
          <Input
            label="Goal Objective Title"
            placeholder="e.g. Early Retirement Fund (Age 55) or Primary Residence Bond Settlement"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Goal Classification"
              value={category}
              onChange={(e) => setCategory(e.target.value as GoalCategory)}
              options={[
                { label: 'Retirement (Regulation 28 / RA)', value: 'Retirement' },
                { label: 'Emergency Fund (Liquid Buffer)', value: 'Emergency Fund' },
                { label: 'Education (School / University Trust)', value: 'Education' },
                { label: 'Property (Deposit / Outright Purchase)', value: 'Property' },
                { label: 'Vehicle (Upgrade / Cash Settlement)', value: 'Vehicle' },
                { label: 'Investment (Offshore / Growth)', value: 'Investment' },
              ]}
            />
            <DatePicker
              label="Target Completion Date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Target Amount (ZAR)"
              type="number"
              prefixText="R"
              placeholder="e.g. 5000000"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              required
            />
            <Input
              label="Current Accumulated Capital (ZAR)"
              type="number"
              prefixText="R"
              placeholder="e.g. 1200000"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
            />
          </div>

          <Input
            label="Monthly Contribution Commitment (ZAR)"
            type="number"
            prefixText="R"
            placeholder="e.g. 15000"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-[#1F1F1F] mb-1.5 uppercase tracking-wider">
              Strategic Notes / Adviser Advice
            </label>
            <textarea
              className="w-full px-3 py-2 text-sm text-[#111111] bg-white border border-[#D9D9D9] rounded-md focus:outline-none focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828]"
              rows={3}
              placeholder="Notes on asset allocation, tax efficiency (Section 10C), or underlying funds..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
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
              {editingGoalId ? 'Update Goal' : 'Save Goal'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
