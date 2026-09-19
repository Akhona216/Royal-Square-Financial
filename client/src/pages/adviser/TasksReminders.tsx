import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Filter,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  UserCheck,
} from 'lucide-react';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { Modal } from '../../components/common/Modal.js';
import { Input, Select, DatePicker } from '../../components/common/Input.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { api } from '../../services/api.js';
import { TaskItem } from '../../types/index.js';

export const TasksReminders: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('Sipho Dlamini');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('High');
  const [category, setCategory] = useState<'Compliance' | 'Review' | 'Claim Follow-up' | 'Quote' | 'Service Request'>('Compliance');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await api.adviser.getTasks(filter === 'ALL' ? undefined : filter);
      setTasks(data || []);
    } catch (err: any) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
      await api.adviser.updateTask(taskId, { status: newStatus });
      fetchTasks();
    } catch (err: any) {
      alert(err.message || 'Failed to update task');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate) return;
    setSubmitting(true);
    try {
      await api.adviser.createTask({
        title,
        clientName,
        dueDate,
        priority,
        category,
      });
      setIsModalOpen(false);
      setTitle('');
      fetchTasks();
    } catch (err: any) {
      alert(err.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = tasks.filter((t) => t.status === 'Pending').length;
  const urgentCount = tasks.filter((t) => t.priority === 'Urgent' || t.priority === 'High').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9D9D9] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] tracking-tight">Compliance Tasks & Advisory Reminders</h1>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Track statutory FAIS reviews, FICA renewals, claim follow-ups, and underwriter quote requests.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsModalOpen(true)}
        >
          Create Advisory Task
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {[
            { label: 'All Tasks', value: 'ALL' },
            { label: 'Pending', value: 'Pending' },
            { label: 'Completed', value: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                filter === tab.value
                  ? 'bg-[#111111] text-white'
                  : 'bg-white border border-[#D9D9D9] text-[#6B6B6B] hover:text-[#111111]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-[#6B6B6B]">
          <strong className="text-[#C62828] font-bold">{urgentCount}</strong> High / Urgent priority items requiring action
        </div>
      </div>

      {/* Task List */}
      <Card
        title={`Task List (${tasks.length})`}
        subtitle="Check off items once compliance or client consultation is concluded"
      >
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-gray-50 animate-pulse rounded" />
            ))}
          </div>
        ) : tasks.length > 0 ? (
          <div className="divide-y divide-[#D9D9D9]">
            {tasks.map((task) => {
              const isCompleted = task.status === 'Completed';
              return (
                <div
                  key={task.id}
                  className={`py-3.5 px-3 flex items-start justify-between gap-4 transition-colors rounded-md ${
                    isCompleted ? 'bg-gray-50/60 opacity-70' : 'hover:bg-[#F8F9FA]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => handleToggleTask(task.id, task.status)}
                      className="mt-1 w-4 h-4 text-[#C62828] rounded border-gray-300 focus:ring-[#C62828] cursor-pointer"
                    />
                    <div>
                      <h4
                        className={`text-sm font-semibold ${
                          isCompleted ? 'line-through text-[#6B6B6B]' : 'text-[#111111]'
                        }`}
                      >
                        {task.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-[#6B6B6B]">
                        <span>Client: <strong className="text-[#111111]">{task.clientName || 'Practice'}</strong></span>
                        <span>• Category: {task.category}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Due: {task.dueDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={task.priority} size="sm" />
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase ${
                        isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No tasks found"
            description="You have no tasks matching this filter criteria."
            actionLabel="Add Task"
            onAction={() => setIsModalOpen(true)}
          />
        )}
      </Card>

      {/* Create Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Advisory Task / Reminder"
        subtitle="Schedule follow-ups and compliance workflows for client accounts"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Task Summary"
            placeholder="e.g. Conduct annual FAIS Section 8 Review or Request Santam motor assessor report"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Associated Client Name"
              placeholder="e.g. Sipho Dlamini"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
            <DatePicker
              label="Target Due Date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Priority Level"
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              options={[
                { label: 'Urgent (Immediate action required)', value: 'Urgent' },
                { label: 'High Priority', value: 'High' },
                { label: 'Medium Priority', value: 'Medium' },
                { label: 'Low Priority', value: 'Low' },
              ]}
            />
            <Select
              label="Workflow Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              options={[
                { label: 'Statutory Compliance / FICA', value: 'Compliance' },
                { label: 'Annual Portfolio Review', value: 'Review' },
                { label: 'Claim Assessor Follow-up', value: 'Claim Follow-up' },
                { label: 'New Insurer Quote', value: 'Quote' },
                { label: 'Client Service Request', value: 'Service Request' },
              ]}
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
              Save Advisory Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
