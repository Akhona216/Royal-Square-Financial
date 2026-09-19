import { financeRepository } from '../repositories/finance.repository.js';
import { Asset, Liability, AssetCategory, LiabilityCategory } from '../repositories/types.js';

export interface FinancialCalculationSummary {
  clientId: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number; // Total Assets - Total Liabilities
  debtToAssetRatio: number; // Percentage
  totalMonthlyDebtPayment: number;
  assetsByCategory: Record<AssetCategory, { total: number; count: number; items: Asset[] }>;
  liabilitiesByCategory: Record<LiabilityCategory, { total: number; count: number; items: Liability[] }>;
  assets: Asset[];
  liabilities: Liability[];
  lastValuationDate: string;
}

export class FinanceService {
  async getFinancialPositionSummary(clientId: string): Promise<FinancialCalculationSummary> {
    const rawPosition = await financeRepository.getFinancialPosition(clientId);

    const assetCategories: AssetCategory[] = ['Investments', 'Property', 'Savings', 'Retirement', 'Other'];
    const liabilityCategories: LiabilityCategory[] = ['Home Loan', 'Vehicle Finance', 'Personal Loans', 'Credit', 'Other'];

    const assetsByCategory: Record<AssetCategory, { total: number; count: number; items: Asset[] }> = {
      Investments: { total: 0, count: 0, items: [] },
      Property: { total: 0, count: 0, items: [] },
      Savings: { total: 0, count: 0, items: [] },
      Retirement: { total: 0, count: 0, items: [] },
      Other: { total: 0, count: 0, items: [] },
    };

    const liabilitiesByCategory: Record<LiabilityCategory, { total: number; count: number; items: Liability[] }> = {
      'Home Loan': { total: 0, count: 0, items: [] },
      'Vehicle Finance': { total: 0, count: 0, items: [] },
      'Personal Loans': { total: 0, count: 0, items: [] },
      Credit: { total: 0, count: 0, items: [] },
      Other: { total: 0, count: 0, items: [] },
    };

    let totalAssets = 0;
    for (const asset of rawPosition.assets) {
      totalAssets += Number(asset.currentValue || 0);
      const cat = asset.category || 'Other';
      if (!assetsByCategory[cat]) {
        assetsByCategory[cat] = { total: 0, count: 0, items: [] };
      }
      assetsByCategory[cat].total += Number(asset.currentValue || 0);
      assetsByCategory[cat].count += 1;
      assetsByCategory[cat].items.push(asset);
    }

    let totalLiabilities = 0;
    let totalMonthlyDebtPayment = 0;
    for (const liability of rawPosition.liabilities) {
      totalLiabilities += Number(liability.outstandingBalance || 0);
      totalMonthlyDebtPayment += Number(liability.monthlyPayment || 0);
      const cat = liability.category || 'Other';
      if (!liabilitiesByCategory[cat]) {
        liabilitiesByCategory[cat] = { total: 0, count: 0, items: [] };
      }
      liabilitiesByCategory[cat].total += Number(liability.outstandingBalance || 0);
      liabilitiesByCategory[cat].count += 1;
      liabilitiesByCategory[cat].items.push(liability);
    }

    const netWorth = totalAssets - totalLiabilities;
    const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

    return {
      clientId,
      totalAssets,
      totalLiabilities,
      netWorth,
      debtToAssetRatio: Number(debtToAssetRatio.toFixed(1)),
      totalMonthlyDebtPayment,
      assetsByCategory,
      liabilitiesByCategory,
      assets: rawPosition.assets,
      liabilities: rawPosition.liabilities,
      lastValuationDate: rawPosition.lastValuationDate,
    };
  }

  async addAsset(clientId: string, data: Omit<Asset, 'id' | 'lastUpdated'>): Promise<Asset> {
    if (!data.name || !data.category || data.currentValue === undefined) {
      throw new Error('Asset name, category, and current value are required');
    }
    return financeRepository.addAsset(clientId, {
      ...data,
      currentValue: Number(data.currentValue),
      currency: data.currency || 'ZAR',
    });
  }

  async addLiability(clientId: string, data: Omit<Liability, 'id' | 'lastUpdated'>): Promise<Liability> {
    if (!data.name || !data.category || data.outstandingBalance === undefined) {
      throw new Error('Liability name, category, and outstanding balance are required');
    }
    return financeRepository.addLiability(clientId, {
      ...data,
      outstandingBalance: Number(data.outstandingBalance),
      monthlyPayment: Number(data.monthlyPayment || 0),
      interestRate: data.interestRate ? Number(data.interestRate) : undefined,
      currency: data.currency || 'ZAR',
    });
  }

  async deleteAsset(clientId: string, assetId: string): Promise<boolean> {
    return financeRepository.deleteAsset(clientId, assetId);
  }

  async deleteLiability(clientId: string, liabilityId: string): Promise<boolean> {
    return financeRepository.deleteLiability(clientId, liabilityId);
  }
}

export const financeService = new FinanceService();
