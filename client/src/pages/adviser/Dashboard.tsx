import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Users,
  CarFront,
  ClipboardList,
  Calendar,
  CheckSquare,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  Clock,
  AlertCircle,
  Network,
  Plus,
} from 'lucide-react';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { api } from '../../services/api.js';

export const AdviserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.adviser.getDashboard();
      setData(res);
    } catch (err: any) {
      console.error('Failed to load adviser dashboard:', err);
      setError(err.message || 'Unable to load adviser executive dashboard');
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

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    try {
      await api.adviser.updateTask(taskId, {
        status: currentStatus === 'Pending' ? 'Completed' : 'Pending',
      });
      loadDashboard();
    } catch (err: any) {
      alert(err.message || 'Failed to update task');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9D9D9] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] tracking-tight">Adviser Executive Command Center</h1>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Royal Square Financial (Pty) Ltd • Key Individual Workspace • Johan van der Merwe, CFP®
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Network className="w-3.5 h-3.5" />}
            onClick={() => navigate('/adviser/integrations')}
          >
            Insurer Feeds
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Users className="w-3.5 h-3.5" />}
            onClick={() => navigate('/adviser/clients')}
          >
            Client Directory
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-800 flex items-center justify-between">
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={loadDashboard}>
            Retry
          </Button>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total AUM */}
        <div className="bg-[#111111] text-white p-5 rounded-lg border border-[#1F1F1F] shadow-sm">
          <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">Total AUM Under Advice</span>
          <div className="text-2xl font-extrabold text-white mt-2">
            {loading ? '...' : formatZAR(data?.summary?.totalAum || 48500000)}
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            +8.4% YoY Growth across portfolios
          </span>
        </div>

        {/* Active Clients */}
        <div className="bg-white p-5 rounded-lg border border-[#D9D9D9] shadow-xs">
          <span className="text-xs uppercase font-bold text-[#6B6B6B] tracking-wider">Active Client Portfolios</span>
          <div className="text-2xl font-extrabold text-[#111111] mt-2">
            {loading ? '...' : `${data?.summary?.totalClients || 32} Clients`}
          </div>
          <span className="text-[11px] text-[#6B6B6B] mt-1 block">Private Wealth & Executive Tiers</span>
        </div>

        {/* Pending Claims */}
        <div className="bg-white p-5 rounded-lg border border-[#D9D9D9] shadow-xs">
          <span className="text-xs uppercase font-bold text-[#6B6B6B] tracking-wider">Active Claims Queue</span>
          <div className="text-2xl font-extrabold text-[#C62828] mt-2 flex items-center justify-between">
            <span>{loading ? '...' : `${data?.summary?.activeClaimsCount || 2} Open`}</span>
            <CarFront className="w-5 h-5 text-[#C62828] opacity-80" />
          </div>
          <span className="text-[11px] text-[#6B6B6B] mt-1 block">Motor & property loss authorizations</span>
        </div>

        {/* Pending Service Requests */}
        <div className="bg-white p-5 rounded-lg border border-[#D9D9D9] shadow-xs">
          <span className="text-xs uppercase font-bold text-[#6B6B6B] tracking-wider">Pending Service Tickets</span>
          <div className="text-2xl font-extrabold text-amber-700 mt-2 flex items-center justify-between">
            <span>{loading ? '...' : `${data?.summary?.pendingServiceRequestsCount || 3} Tasks`}</span>
            <ClipboardList className="w-5 h-5 text-amber-700 opacity-80" />
          </div>
          <span className="text-[11px] text-[#6B6B6B] mt-1 block">Border letters, bank details & IRP5s</span>
        </div>
      </div>

      {/* Main Grid: Urgent Tasks & Claims Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Tasks & Reminders */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#C62828]" />
              <span>Compliance Tasks & Critical Reminders</span>
            </div>
          }
          headerAction={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/adviser/tasks')}
            >
              All Tasks ({data?.tasks?.length || 0}) →
            </Button>
          }
        >
          {loading ? (
            <div className="h-44 bg-gray-50 animate-pulse rounded" />
          ) : data?.tasks && data.tasks.length > 0 ? (
            <div className="divide-y divide-[#D9D9D9]">
              {data.tasks.slice(0, 4).map((task: any) => {
                const isDone = task.status === 'Completed';
                return (
                  <div key={task.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => handleToggleTask(task.id, task.status)}
                        className="mt-0.5 w-4 h-4 text-[#C62828] rounded border-gray-300 focus:ring-[#C62828] cursor-pointer"
                      />
                      <div>
                        <span className={`text-sm font-semibold block ${isDone ? 'line-through text-[#6B6B6B]' : 'text-[#111111]'}`}>
                          {task.title}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-[#6B6B6B]">
                          <span>Client: <strong className="text-[#111111]">{task.clientName || 'General'}</strong></span>
                          <span>• Due: {task.dueDate}</span>
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={task.priority} size="sm" />
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="All tasks completed"
              description="No outstanding compliance or review tasks for today."
            />
          )}
        </Card>

        {/* Today's Client Consultations */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#C62828]" />
              <span>Scheduled Advisory Reviews</span>
            </div>
          }
          headerAction={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/adviser/calendar')}
            >
              Full Calendar →
            </Button>
          }
        >
          {loading ? (
            <div className="h-44 bg-gray-50 animate-pulse rounded" />
          ) : data?.calendar && data.calendar.length > 0 ? (
            <div className="divide-y divide-[#D9D9D9]">
              {data.calendar.map((apt: any) => (
                <div key={apt.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded bg-[#F8F9FA] border border-[#D9D9D9] flex flex-col items-center justify-center font-bold text-xs">
                      <span className="text-[#C62828] leading-none">{apt.time}</span>
                      <span className="text-[10px] text-[#6B6B6B] leading-none mt-1">{apt.durationMinutes}m</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#111111]">{apt.clientName}</h4>
                      <p className="text-xs text-[#6B6B6B]">{apt.type} • {apt.location}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/adviser/clients`)}
                  >
                    Open Client 360
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No appointments scheduled"
              description="Your consultation calendar is clear for today."
            />
          )}
        </Card>
      </div>

      {/* Claims Needing Action */}
      <Card
        title="Insurance Claims Requiring Underwriter Dispatch"
        subtitle="Review incident statements and coordinate authorisations with Santam and Discovery"
        headerAction={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/adviser/claims')}
          >
            Manage Claims Queue →
          </Button>
        }
      >
        {loading ? (
          <div className="h-28 bg-gray-50 animate-pulse rounded" />
        ) : data?.claims && data.claims.length > 0 ? (
          <div className="divide-y divide-[#D9D9D9]">
            {data.claims.map((claim: any) => (
              <div key={claim.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#111111]">{claim.claimNumber}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#F2F2F2] border border-[#D9D9D9]">
                      {claim.insurer}
                    </span>
                    <StatusBadge status={claim.status} size="sm" />
                  </div>
                  <div className="text-sm font-semibold text-[#111111] mt-1">{claim.description}</div>
                  <div className="text-xs text-[#6B6B6B]">
                    Current Stage: <strong className="text-[#C62828] uppercase">{claim.currentStage}</strong> • Policy: {claim.policyNumber}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/adviser/claims')}
                  >
                    Assess & Update Status
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No claims awaiting adviser action"
            description="All active insurance claims have been authorized or settled."
          />
        )}
      </Card>
    </div>
  );
};
