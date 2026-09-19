import { goalsRepository } from '../repositories/goals.repository.js';
import { Goal } from '../repositories/types.js';

export interface EnrichedGoal extends Goal {
  progressPercentage: number;
  shortfall: number;
  monthsRemaining: number;
  projectedCompletionDate: string;
}

export class GoalsService {
  async getClientGoals(clientId: string): Promise<{ goals: EnrichedGoal[]; totalTarget: number; totalSaved: number; overallProgress: number }> {
    const goals = await goalsRepository.getGoals(clientId);

    let totalTarget = 0;
    let totalSaved = 0;

    const enrichedGoals: EnrichedGoal[] = goals.map(goal => {
      totalTarget += Number(goal.targetAmount);
      totalSaved += Number(goal.currentAmount);

      const progress = goal.targetAmount > 0 
        ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) 
        : 0;

      const shortfall = Math.max(0, goal.targetAmount - goal.currentAmount);

      // Months remaining calculation
      const targetDate = new Date(goal.targetDate);
      const now = new Date();
      const monthsRemaining = Math.max(0, Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30.4375)));

      return {
        ...goal,
        progressPercentage: progress,
        shortfall,
        monthsRemaining,
        projectedCompletionDate: goal.targetDate,
      };
    });

    const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

    return {
      goals: enrichedGoals,
      totalTarget,
      totalSaved,
      overallProgress,
    };
  }

  async createGoal(clientId: string, data: Omit<Goal, 'id' | 'clientId' | 'createdAt'>): Promise<Goal> {
    if (!data.title || !data.targetAmount || !data.targetDate) {
      throw new Error('Title, target amount, and target date are required');
    }

    const currentAmount = Number(data.currentAmount || 0);
    const targetAmount = Number(data.targetAmount);
    const status = currentAmount >= targetAmount ? 'completed' : 'on_track';

    return goalsRepository.createGoal(clientId, {
      ...data,
      currentAmount,
      targetAmount,
      monthlyContribution: Number(data.monthlyContribution || 0),
      status: data.status || status,
    });
  }

  async updateGoal(clientId: string, id: string, updates: Partial<Goal>): Promise<Goal | null> {
    return goalsRepository.updateGoal(clientId, id, updates);
  }

  async deleteGoal(clientId: string, id: string): Promise<boolean> {
    return goalsRepository.deleteGoal(clientId, id);
  }
}

export const goalsService = new GoalsService();
