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
  Plus,
  Filter,
  ArrowRight,
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
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [clientFilter, setClientFilter] = useState<string>('All');

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

  const allActions = (data?.actions || []) as any[];
  const dashboardTasks = (data?.tasks || data?.todayTasks || []) as any[];
  const dashboardCalendar = (data?.calendar || data?.nextAppointments || []) as any[];
  const dashboardClaims = (data?.claims || data?.recentClaims || []) as any[];
  const visibleActions = allActions.filter((action) => {
    const matchesPriority = priorityFilter === 'All' || action.priority === priorityFilter;
    const matchesType = typeFilter === 'All' || action.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || action.status === statusFilter;
    const matchesClient = clientFilter === 'All' || action.clientName === clientFilter;
    return matchesPriority && matchesType && matchesStatus && matchesClient;
  });
  const clientOptions = Array.from(new Set(allActions.map((a) => a.clientName))).filter(Boolean);
  const priorityOptions = ['All', 'Urgent', 'High', 'Medium', 'Low'];
  const typeOptions = ['All', ...new Set(allActions.map((a) => a.type))];
  const statusOptions = ['All', 'New', 'In Progress', 'Waiting', 'Completed'];

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
    <div className="flex flex-col space-y-6">
      {/* Top Banner */}
      <div className="order-1 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9D9D9] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] tracking-tight">Adviser Executive Command Center</h1>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Royal Square Financial (Pty) Ltd • Key Individual Workspace • Johan van der Merwe, CFP®
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
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
        <div className="order-2 p-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-800 flex items-center justify-between">
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={loadDashboard}>
            Retry
          </Button>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="order-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total AUM */}
        <div className="bg-[#111111] text-white p-5 rounded-lg border border-[#1F1F1F] shadow-sm">
          <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">Total AUM Under Advice</span>
          <div className="text-2xl font-extrabold text-white mt-2">
            {loading ? '...' : formatZAR(data?.summary?.totalAum || data?.totalAum || 48500000)}
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
            {loading ? '...' : `${data?.summary?.totalClients || data?.clientCount || 32} Clients`}
          </div>
          <span className="text-[11px] text-[#6B6B6B] mt-1 block">Private Wealth & Executive Tiers</span>
        </div>

        {/* Pending Claims */}
        <div className="bg-white p-5 rounded-lg border border-[#D9D9D9] shadow-xs">
          <span className="text-xs uppercase font-bold text-[#6B6B6B] tracking-wider">Active Claims Queue</span>
          <div className="text-2xl font-extrabold text-[#C62828] mt-2 flex items-center justify-between">
            <span>{loading ? '...' : `${data?.summary?.activeClaimsCount || data?.activeClaimsRequiringAttention || dashboardClaims.length || 0} Open`}</span>
            <CarFront className="w-5 h-5 text-[#C62828] opacity-80" />
          </div>
          <span className="text-[11px] text-[#6B6B6B] mt-1 block">Motor & property loss authorizations</span>
        </div>

        {/* Pending Service Requests */}
        <div className="bg-white p-5 rounded-lg border border-[#D9D9D9] shadow-xs">
          <span className="text-xs uppercase font-bold text-[#6B6B6B] tracking-wider">Pending Service Tickets</span>
          <div className="text-2xl font-extrabold text-amber-700 mt-2 flex items-center justify-between">
            <span>{loading ? '...' : `${data?.summary?.pendingServiceRequestsCount || data?.pendingServiceRequests || 0} Tasks`}</span>
            <ClipboardList className="w-5 h-5 text-amber-700 opacity-80" />
          </div>
          <span className="text-[11px] text-[#6B6B6B] mt-1 block">Border letters, bank details & IRP5s</span>
        </div>
      </div>

      {/* Main Grid: Urgent Tasks & Claims Overview */}
      <div className="order-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              All Tasks ({dashboardTasks.length}) →
            </Button>
          }
        >
          {loading ? (
            <div className="h-44 bg-gray-50 animate-pulse rounded" />
          ) : dashboardTasks.length > 0 ? (
            <div className="divide-y divide-[#D9D9D9]">
              {dashboardTasks.slice(0, 4).map((task: any) => {
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
          ) : dashboardCalendar.length > 0 ? (
            <div className="divide-y divide-[#D9D9D9]">
              {dashboardCalendar.map((apt: any) => (
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
        className="order-3"
        title="Insurance Claims Requiring Underwriter Dispatch"
        subtitle="Review incident statements, coordinate authorisations with Santam and Discovery, and clear related adviser actions from one queue."
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
        <div className="space-y-6">
          <div className="space-y-4 border-b border-[#D9D9D9] pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-[#111111]">Adviser actions linked to dispatch</h2>
                <p className="text-xs text-[#6B6B6B] mt-1">Filter and resolve claims, service requests, documents and review work without leaving this queue.</p>
              </div>
              <span className="self-start sm:self-auto rounded-md border border-[#D9D9D9] bg-[#F8F9FA] px-3 py-2 text-sm font-semibold text-[#111111]">
                Showing {Math.min(visibleActions.length, 3)} of {visibleActions.length} items
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
              <div className="relative">
                <Filter className="w-3.5 h-3.5 absolute left-3 top-3 text-[#6B6B6B]" />
                <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="w-full pl-8 pr-3 py-2 text-sm border border-[#D9D9D9] rounded-md bg-white text-[#111111]">
                  {priorityOptions.map((option) => <option key={option} value={option}>{option === 'All' ? 'All priorities' : option}</option>)}
                </select>
              </div>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D9D9D9] rounded-md bg-white text-[#111111]">
                {typeOptions.map((option) => <option key={option} value={option}>{option === 'All' ? 'All types' : option}</option>)}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D9D9D9] rounded-md bg-white text-[#111111]">
                {statusOptions.map((option) => <option key={option} value={option}>{option === 'All' ? 'All statuses' : option}</option>)}
              </select>
              <select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D9D9D9] rounded-md bg-white text-[#111111]">
                <option value="All">All clients</option>
                {clientOptions.map((client) => <option key={client} value={client}>{client}</option>)}
              </select>
            </div>

            {loading ? (
              <div className="h-32 bg-gray-50 animate-pulse rounded" />
            ) : visibleActions.length > 0 ? (
              <div className="space-y-3">
                {visibleActions.slice(0, 3).map((action: any) => (
                  <div key={action.id} className="border border-[#E5E5E5] rounded-lg p-4 bg-[#F8F9FA] hover:bg-white transition-colors">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-[#FFF3F2] text-[#C62828] border-red-200">{action.priority}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-gray-100 text-[#1F1F1F] border-[#D9D9D9]">{action.type}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-emerald-50 text-emerald-700 border-emerald-200">{action.status}</span>
                        </div>
                        <h3 className="text-base font-bold text-[#111111] break-words">{action.title}</h3>
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 text-xs text-[#6B6B6B]">
                          <div><span className="font-semibold text-[#111111]">Client:</span> {action.clientName}</div>
                          <div><span className="font-semibold text-[#111111]">Claim:</span> {action.claimNumber || '—'}</div>
                          <div><span className="font-semibold text-[#111111]">Date:</span> {new Date(action.dateTime).toLocaleString('en-ZA', { dateStyle: 'short', timeStyle: 'short' })}</div>
                          <div><span className="font-semibold text-[#111111]">Action:</span> {action.requiredAction}</div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                        <Button variant="outline" size="sm" onClick={() => navigate(action.link)}>Open Record</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No actions requiring attention" description="All client activity is up to date for the current adviser queue." />
            )}
          </div>

        </div>
      </Card>
    </div>
  );
};
