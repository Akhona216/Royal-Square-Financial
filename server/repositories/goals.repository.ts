import { Goal } from './types.js';

export interface IGoalsRepository {
  getGoals(clientId: string): Promise<Goal[]>;
  getGoalById(id: string): Promise<Goal | null>;
  createGoal(clientId: string, goalData: Omit<Goal, 'id' | 'clientId' | 'createdAt'>): Promise<Goal>;
  updateGoal(clientId: string, id: string, updates: Partial<Goal>): Promise<Goal | null>;
  deleteGoal(clientId: string, id: string): Promise<boolean>;
}

const mockGoals: Goal[] = [
  {
    id: 'goal_001',
    clientId: 'usr_client_001',
    title: 'Comfortable Retirement Fund (Age 60)',
    category: 'Retirement',
    targetAmount: 15000000,
    currentAmount: 8250000,
    monthlyContribution: 18500,
    targetDate: '2038-06-30',
    notes: 'Maximizing Section 10C and Regulation 28 compliant offshore allowance via Allan Gray and Old Mutual.',
    status: 'on_track',
    createdAt: '2024-01-15T09:00:00Z',
  },
  {
    id: 'goal_002',
    clientId: 'usr_client_001',
    title: 'Emergency Reserve (6 Months Expenses)',
    category: 'Emergency Fund',
    targetAmount: 350000,
    currentAmount: 340000,
    monthlyContribution: 5000,
    targetDate: '2026-12-31',
    notes: 'Parked in Standard Bank 32-Day Notice deposit earning prime-linked yield.',
    status: 'on_track',
    createdAt: '2024-03-10T10:30:00Z',
  },
  {
    id: 'goal_003',
    clientId: 'usr_client_001',
    title: "Children's University Trust (St. Stithians / UCT)",
    category: 'Education',
    targetAmount: 1200000,
    currentAmount: 520000,
    monthlyContribution: 6500,
    targetDate: '2031-01-15',
    notes: 'Equities-weighted unit trust portfolio.',
    status: 'lagging',
    createdAt: '2024-04-20T14:15:00Z',
  },
  {
    id: 'goal_004',
    clientId: 'usr_client_001',
    title: 'Western Cape Coastal Property Deposit',
    category: 'Property',
    targetAmount: 1800000,
    currentAmount: 450000,
    monthlyContribution: 12000,
    targetDate: '2028-11-30',
    notes: 'Targeting holiday home / dual-living investment property in Hermanus.',
    status: 'on_track',
    createdAt: '2024-06-01T11:00:00Z',
  },
];

export class GoalsRepository implements IGoalsRepository {
  async getGoals(clientId: string): Promise<Goal[]> {
    return mockGoals.filter(g => g.clientId === clientId);
  }

  async getGoalById(id: string): Promise<Goal | null> {
    const goal = mockGoals.find(g => g.id === id);
    return goal ? { ...goal } : null;
  }

  async createGoal(clientId: string, goalData: Omit<Goal, 'id' | 'clientId' | 'createdAt'>): Promise<Goal> {
    const newGoal: Goal = {
      id: `goal_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      clientId,
      ...goalData,
      createdAt: new Date().toISOString(),
    };
    mockGoals.push(newGoal);
    return { ...newGoal };
  }

  async updateGoal(clientId: string, id: string, updates: Partial<Goal>): Promise<Goal | null> {
    const index = mockGoals.findIndex(g => g.id === id && g.clientId === clientId);
    if (index === -1) return null;
    mockGoals[index] = { ...mockGoals[index], ...updates };
    return { ...mockGoals[index] };
  }

  async deleteGoal(clientId: string, id: string): Promise<boolean> {
    const initialLen = mockGoals.length;
    const filtered = mockGoals.filter(g => !(g.id === id && g.clientId === clientId));
    if (filtered.length < initialLen) {
      mockGoals.length = 0;
      mockGoals.push(...filtered);
      return true;
    }
    return false;
  }
}

export const goalsRepository = new GoalsRepository();
