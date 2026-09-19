import { Asset, Liability, FinancialPosition } from './types.js';

/**
 * Finance Repository Interface
 * Database-agnostic data-access functions for managing client assets, liabilities, and balance sheet valuations.
 */
export interface IFinanceRepository {
  getFinancialPosition(clientId: string): Promise<FinancialPosition>;
  addAsset(clientId: string, asset: Omit<Asset, 'id' | 'lastUpdated'>): Promise<Asset>;
  addLiability(clientId: string, liability: Omit<Liability, 'id' | 'lastUpdated'>): Promise<Liability>;
  deleteAsset(clientId: string, assetId: string): Promise<boolean>;
  deleteLiability(clientId: string, liabilityId: string): Promise<boolean>;
  updateAsset(clientId: string, assetId: string, updates: Partial<Asset>): Promise<Asset | null>;
  updateLiability(clientId: string, liabilityId: string, updates: Partial<Liability>): Promise<Liability | null>;
}

// In-Memory baseline store
const financialPositionsStore: Record<string, FinancialPosition> = {
  usr_client_001: {
    clientId: 'usr_client_001',
    lastValuationDate: new Date().toISOString(),
    assets: [
      {
        id: 'ast_001',
        name: 'Allan Gray Balanced Fund',
        category: 'Investments',
        institution: 'Allan Gray',
        currentValue: 1250000,
        accountNumber: 'AG-984210',
        currency: 'ZAR',
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'ast_002',
        name: 'Primary Residence (Bryanston, Sandton)',
        category: 'Property',
        institution: 'Private Property Registry',
        currentValue: 4200000,
        accountNumber: 'ERF-4912',
        currency: 'ZAR',
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'ast_003',
        name: 'Standard Bank 32-Day Notice Deposit',
        category: 'Savings',
        institution: 'Standard Bank of South Africa',
        currentValue: 340000,
        accountNumber: 'SB-09214491',
        currency: 'ZAR',
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'ast_004',
        name: 'Old Mutual SuperFund Preservation Pension',
        category: 'Retirement',
        institution: 'Old Mutual',
        currentValue: 1850000,
        accountNumber: 'OM-RET-7712',
        currency: 'ZAR',
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'ast_005',
        name: 'BMW 330i M-Sport (2023)',
        category: 'Other',
        institution: 'Asset Register',
        currentValue: 720000,
        currency: 'ZAR',
        lastUpdated: new Date().toISOString(),
      },
    ],
    liabilities: [
      {
        id: 'lia_001',
        name: 'Standard Bank Home Loan',
        category: 'Home Loan',
        institution: 'Standard Bank',
        outstandingBalance: 2450000,
        monthlyPayment: 26800,
        interestRate: 11.75,
        currency: 'ZAR',
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'lia_002',
        name: 'WesBank Vehicle Finance',
        category: 'Vehicle Finance',
        institution: 'WesBank / FirstRand',
        outstandingBalance: 380000,
        monthlyPayment: 9200,
        interestRate: 12.25,
        currency: 'ZAR',
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'lia_003',
        name: 'Investec Private Bank Credit Facility',
        category: 'Credit',
        institution: 'Investec',
        outstandingBalance: 65000,
        monthlyPayment: 4500,
        interestRate: 11.5,
        currency: 'ZAR',
        lastUpdated: new Date().toISOString(),
      },
    ],
  },
};

export class FinanceRepository implements IFinanceRepository {
  async getFinancialPosition(clientId: string): Promise<FinancialPosition> {
    if (!financialPositionsStore[clientId]) {
      // Return empty structure for clients without records
      financialPositionsStore[clientId] = {
        clientId,
        assets: [],
        liabilities: [],
        lastValuationDate: new Date().toISOString(),
      };
    }
    return JSON.parse(JSON.stringify(financialPositionsStore[clientId]));
  }

  async addAsset(clientId: string, asset: Omit<Asset, 'id' | 'lastUpdated'>): Promise<Asset> {
    const position = await this.getFinancialPosition(clientId);
    const newAsset: Asset = {
      ...asset,
      id: `ast_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      lastUpdated: new Date().toISOString(),
    };
    financialPositionsStore[clientId].assets.push(newAsset);
    financialPositionsStore[clientId].lastValuationDate = new Date().toISOString();
    return { ...newAsset };
  }

  async addLiability(clientId: string, liability: Omit<Liability, 'id' | 'lastUpdated'>): Promise<Liability> {
    const position = await this.getFinancialPosition(clientId);
    const newLiability: Liability = {
      ...liability,
      id: `lia_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      lastUpdated: new Date().toISOString(),
    };
    financialPositionsStore[clientId].liabilities.push(newLiability);
    financialPositionsStore[clientId].lastValuationDate = new Date().toISOString();
    return { ...newLiability };
  }

  async deleteAsset(clientId: string, assetId: string): Promise<boolean> {
    if (!financialPositionsStore[clientId]) return false;
    const initialLen = financialPositionsStore[clientId].assets.length;
    financialPositionsStore[clientId].assets = financialPositionsStore[clientId].assets.filter(a => a.id !== assetId);
    return financialPositionsStore[clientId].assets.length < initialLen;
  }

  async deleteLiability(clientId: string, liabilityId: string): Promise<boolean> {
    if (!financialPositionsStore[clientId]) return false;
    const initialLen = financialPositionsStore[clientId].liabilities.length;
    financialPositionsStore[clientId].liabilities = financialPositionsStore[clientId].liabilities.filter(l => l.id !== liabilityId);
    return financialPositionsStore[clientId].liabilities.length < initialLen;
  }

  async updateAsset(clientId: string, assetId: string, updates: Partial<Asset>): Promise<Asset | null> {
    if (!financialPositionsStore[clientId]) return null;
    const item = financialPositionsStore[clientId].assets.find(a => a.id === assetId);
    if (!item) return null;
    Object.assign(item, updates, { lastUpdated: new Date().toISOString() });
    return { ...item };
  }

  async updateLiability(clientId: string, liabilityId: string, updates: Partial<Liability>): Promise<Liability | null> {
    if (!financialPositionsStore[clientId]) return null;
    const item = financialPositionsStore[clientId].liabilities.find(l => l.id === liabilityId);
    if (!item) return null;
    Object.assign(item, updates, { lastUpdated: new Date().toISOString() });
    return { ...item };
  }
}

export const financeRepository = new FinanceRepository();
