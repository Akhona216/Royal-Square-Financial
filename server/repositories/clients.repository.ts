import { User } from './types.js';

export interface ClientProfileSummary extends User {
  tier: 'Private Wealth' | 'Executive Client' | 'Affluent';
  totalAum: number;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  policiesCount: number;
  activeClaimsCount: number;
  pendingRequestsCount: number;
  lastReviewDate: string;
  nextReviewDate: string;
  riskProfile: 'Conservative' | 'Moderate' | 'Moderate Aggressive' | 'Aggressive';
}

const mockClients: ClientProfileSummary[] = [
  {
    id: 'usr_client_001',
    email: 'client@royalsquare.co.za',
    name: 'Sipho Dlamini',
    role: 'client',
    phone: '+27 82 459 8920',
    idNumber: '8809255123088', // 25 September 1988 (Upcoming in 6 days!)
    taxNumber: '9482103492',
    adviserId: 'usr_adv_001',
    tier: 'Private Wealth',
    totalAum: 3100000,
    totalAssets: 8360000,
    totalLiabilities: 2895000,
    netWorth: 5465000,
    policiesCount: 5,
    activeClaimsCount: 1,
    pendingRequestsCount: 1,
    lastReviewDate: '2025-11-14',
    nextReviewDate: '2026-11-14',
    riskProfile: 'Moderate Aggressive',
  },
  {
    id: 'usr_client_002',
    email: 'thandiwe.s@mweb.co.za',
    name: 'Thandiwe Sithole',
    role: 'client',
    phone: '+27 83 719 5541',
    idNumber: '9107220194082',
    taxNumber: '9840192841',
    adviserId: 'usr_adv_001',
    tier: 'Executive Client',
    totalAum: 4850000,
    totalAssets: 9400000,
    totalLiabilities: 3200000,
    netWorth: 6200000,
    policiesCount: 4,
    activeClaimsCount: 1,
    pendingRequestsCount: 1,
    lastReviewDate: '2026-02-10',
    nextReviewDate: '2027-02-10',
    riskProfile: 'Moderate',
  },
  {
    id: 'usr_client_003',
    email: 'pieter.erasmus@erasmuslaw.co.za',
    name: 'Pieter Erasmus',
    role: 'client',
    phone: '+27 82 301 9928',
    idNumber: '7911045091083',
    taxNumber: '9301948271',
    adviserId: 'usr_adv_001',
    tier: 'Private Wealth',
    totalAum: 14200000,
    totalAssets: 22500000,
    totalLiabilities: 4100000,
    netWorth: 18400000,
    policiesCount: 7,
    activeClaimsCount: 0,
    pendingRequestsCount: 0,
    lastReviewDate: '2026-05-20',
    nextReviewDate: '2026-11-20',
    riskProfile: 'Aggressive',
  },
  {
    id: 'usr_client_004',
    email: 'naidoo.k@vodamail.co.za',
    name: 'Kavitha Naidoo',
    role: 'client',
    phone: '+27 84 551 2290',
    idNumber: '8504190184089',
    taxNumber: '9510293847',
    adviserId: 'usr_adv_001',
    tier: 'Affluent',
    totalAum: 1850000,
    totalAssets: 4100000,
    totalLiabilities: 1750000,
    netWorth: 2350000,
    policiesCount: 3,
    activeClaimsCount: 0,
    pendingRequestsCount: 0,
    lastReviewDate: '2026-01-18',
    nextReviewDate: '2027-01-18',
    riskProfile: 'Conservative',
  },
  {
    id: 'usr_client_005',
    email: 'mark.fourie@capewinelands.co.za',
    name: 'Mark Fourie',
    role: 'client',
    phone: '+27 82 884 1029',
    idNumber: '7209145028084', // 14 September 1972
    taxNumber: '9019284716',
    adviserId: 'usr_adv_001',
    tier: 'Private Wealth',
    totalAum: 21500000,
    totalAssets: 38000000,
    totalLiabilities: 5500000,
    netWorth: 32500000,
    policiesCount: 8,
    activeClaimsCount: 0,
    pendingRequestsCount: 1,
    lastReviewDate: '2026-08-05',
    nextReviewDate: '2027-08-05',
    riskProfile: 'Moderate Aggressive',
  },
  {
    id: 'usr_client_006',
    email: 'lerato.moloi@investec.co.za',
    name: 'Lerato Moloi',
    role: 'client',
    phone: '+27 83 490 1120',
    idNumber: '9209235081084', // 23 September 1992 (Upcoming in 4 days!)
    taxNumber: '9620194821',
    adviserId: 'usr_adv_001',
    tier: 'Executive Client',
    totalAum: 5200000,
    totalAssets: 8900000,
    totalLiabilities: 2100000,
    netWorth: 6800000,
    policiesCount: 4,
    activeClaimsCount: 0,
    pendingRequestsCount: 0,
    lastReviewDate: '2026-03-12',
    nextReviewDate: '2027-03-12',
    riskProfile: 'Moderate Aggressive',
  },
  {
    id: 'usr_client_007',
    email: 'hendrik.steyn@steyneng.co.za',
    name: 'Hendrik Steyn',
    role: 'client',
    phone: '+27 82 991 3401',
    idNumber: '8309275192080', // 27 September 1983 (Upcoming in 8 days!)
    taxNumber: '9182049182',
    adviserId: 'usr_adv_001',
    tier: 'Private Wealth',
    totalAum: 11400000,
    totalAssets: 19800000,
    totalLiabilities: 3400000,
    netWorth: 16400000,
    policiesCount: 6,
    activeClaimsCount: 0,
    pendingRequestsCount: 0,
    lastReviewDate: '2026-04-18',
    nextReviewDate: '2027-04-18',
    riskProfile: 'Moderate',
  },
  {
    id: 'usr_client_008',
    email: 'ansuya.pillay@durbanmed.co.za',
    name: 'Dr. Ansuya Pillay',
    role: 'client',
    phone: '+27 84 210 9945',
    idNumber: '7610030182087', // 03 October 1976 (Turns 50 in 14 days!)
    taxNumber: '9284019284',
    adviserId: 'usr_adv_001',
    tier: 'Private Wealth',
    totalAum: 16800000,
    totalAssets: 27500000,
    totalLiabilities: 4200000,
    netWorth: 23300000,
    policiesCount: 7,
    activeClaimsCount: 0,
    pendingRequestsCount: 0,
    lastReviewDate: '2026-06-10',
    nextReviewDate: '2027-06-10',
    riskProfile: 'Moderate Aggressive',
  },
];

export class ClientsRepository {
  async getClients(query?: string): Promise<ClientProfileSummary[]> {
    if (!query) return [...mockClients];
    const q = query.toLowerCase();
    return mockClients.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.email.toLowerCase().includes(q) || 
      c.idNumber?.includes(q)
    );
  }

  async getClientById(id: string): Promise<ClientProfileSummary | null> {
    const client = mockClients.find(c => c.id === id);
    return client ? { ...client } : null;
  }
}

export const clientsRepository = new ClientsRepository();
