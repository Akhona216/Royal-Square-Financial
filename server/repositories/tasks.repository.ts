import { TaskItem } from './types.js';

export class TasksRepository {
  private tasks: TaskItem[] = [
    {
      id: 'tsk_001',
      adviserId: 'usr_adv_001',
      clientId: 'usr_client_001',
      clientName: 'Sipho Dlamini',
      title: 'Review Santam Motor Claim Authorization for BMW repair',
      dueDate: '2026-09-19',
      priority: 'Urgent',
      status: 'Pending',
      category: 'Claim Follow-up',
    },
    {
      id: 'tsk_002',
      adviserId: 'usr_adv_001',
      clientId: 'usr_client_001',
      clientName: 'Sipho Dlamini',
      title: 'Issue Santam SADC Cross-Border vehicle travel letter',
      dueDate: '2026-09-20',
      priority: 'High',
      status: 'Pending',
      category: 'Service Request',
    },
    {
      id: 'tsk_003',
      adviserId: 'usr_adv_001',
      clientId: 'usr_client_002',
      clientName: 'Thandiwe Sithole',
      title: 'Process FICA updated proof of address in Waterfall City',
      dueDate: '2026-09-19',
      priority: 'Medium',
      status: 'Pending',
      category: 'Compliance',
    },
    {
      id: 'tsk_004',
      adviserId: 'usr_adv_001',
      clientId: 'usr_client_003',
      clientName: 'Pieter Erasmus',
      title: 'Prepare Q3 Offshore Portfolio Rebalancing Recommendation',
      dueDate: '2026-09-24',
      priority: 'High',
      status: 'Pending',
      category: 'Review',
    },
    {
      id: 'tsk_005',
      adviserId: 'usr_adv_001',
      clientId: 'usr_client_005',
      clientName: 'Mark Fourie',
      title: 'Old Mutual Key Person Life Assurance Policy Renewal check',
      dueDate: '2026-09-15',
      priority: 'Urgent',
      status: 'Pending',
      category: 'Quote',
    },
    {
      id: 'tsk_006',
      adviserId: 'usr_adv_001',
      clientId: 'usr_client_004',
      clientName: 'Kavitha Naidoo',
      title: 'Signed Section 14 Transfer form submission to Discovery Life',
      dueDate: '2026-09-10',
      priority: 'Low',
      status: 'Completed',
      category: 'Compliance',
    },
  ];

  async getTasks(adviserId: string): Promise<TaskItem[]> {
    return [...this.tasks];
  }

  async createTask(data: Omit<TaskItem, 'id'>): Promise<TaskItem> {
    const newTask: TaskItem = {
      id: `tsk_${Date.now()}`,
      ...data,
    };
    this.tasks.unshift(newTask);
    return { ...newTask };
  }

  async updateTask(id: string, updates: Partial<TaskItem>): Promise<TaskItem | null> {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return null;
    Object.assign(task, updates);
    return { ...task };
  }

  async upsertClaimFollowUp(data: Omit<TaskItem, 'id'>): Promise<TaskItem> {
    const existing = this.tasks.find((task) => task.claimId === data.claimId && task.status === 'Pending');
    if (existing) {
      Object.assign(existing, data);
      return { ...existing };
    }
    return this.createTask(data);
  }

  async completeClaimFollowUps(claimId: string): Promise<void> {
    this.tasks.forEach((task) => {
      if (task.claimId === claimId && task.status === 'Pending') {
        task.status = 'Completed';
      }
    });
  }

  async deleteTask(id: string): Promise<boolean> {
    const initialLen = this.tasks.length;
    this.tasks = this.tasks.filter(t => t.id !== id);
    return this.tasks.length < initialLen;
  }
}

export const tasksRepository = new TasksRepository();
