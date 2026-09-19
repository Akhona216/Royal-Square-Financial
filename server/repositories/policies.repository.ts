import { Policy, DocumentItem } from './types.js';

export class PoliciesRepository {
  private policies: Policy[] = [
    {
      id: 'pol_001',
      policyNumber: 'SAN-AUTO-491028',
      clientId: 'usr_client_001',
      provider: 'Santam',
      type: 'Comprehensive Motor Insurance (BMW 330i)',
      coverageAmount: 720000,
      premium: 2450,
      frequency: 'Monthly',
      startDate: '2023-04-01',
      renewalDate: '2027-04-01',
      status: 'Active',
    },
    {
      id: 'pol_002',
      policyNumber: 'DISC-HOME-20911',
      clientId: 'usr_client_001',
      provider: 'Discovery',
      type: 'Classic Building & Household Contents',
      coverageAmount: 5500000,
      premium: 3890,
      frequency: 'Monthly',
      startDate: '2022-09-15',
      renewalDate: '2026-09-15',
      status: 'Pending Renewal',
    },
    {
      id: 'pol_003',
      policyNumber: 'OM-RET-7712',
      clientId: 'usr_client_001',
      provider: 'Old Mutual',
      type: 'SuperFund Preservation Pension',
      coverageAmount: 1850000,
      premium: 0,
      frequency: 'Monthly',
      startDate: '2019-01-10',
      renewalDate: '2038-06-30',
      status: 'Active',
    },
    {
      id: 'pol_004',
      policyNumber: 'AG-984210',
      clientId: 'usr_client_001',
      provider: 'Allan Gray',
      type: 'Tax-Free Investment & Balanced Portfolio',
      coverageAmount: 1250000,
      premium: 5000,
      frequency: 'Monthly',
      startDate: '2021-03-01',
      renewalDate: '2035-12-31',
      status: 'Active',
    },
    {
      id: 'pol_005',
      policyNumber: 'SAN-LIFE-99214',
      clientId: 'usr_client_001',
      provider: 'Sanlam',
      type: 'Matrix Risk Life & Disability Cover',
      coverageAmount: 6000000,
      premium: 1950,
      frequency: 'Monthly',
      startDate: '2020-07-01',
      renewalDate: '2030-07-01',
      status: 'Active',
    },
  ];

  async getPolicies(clientId?: string): Promise<Policy[]> {
    if (!clientId) return [...this.policies];
    return this.policies.filter(p => p.clientId === clientId);
  }

  async getPolicyById(id: string): Promise<Policy | null> {
    const policy = this.policies.find(p => p.id === id || p.policyNumber === id);
    return policy ? { ...policy } : null;
  }
}

export class DocumentsRepository {
  private documents: DocumentItem[] = [
    {
      id: 'doc_001',
      clientId: 'usr_client_001',
      name: 'South African Smart ID Card (Certified Copy).pdf',
      category: 'ID',
      fileSize: '1.8 MB',
      uploadDate: '2026-01-10',
      fileType: 'application/pdf',
      verified: true,
    },
    {
      id: 'doc_002',
      clientId: 'usr_client_001',
      name: 'City of Johannesburg Utility Bill (Proof of Address).pdf',
      category: 'Proof of Address',
      fileSize: '950 KB',
      uploadDate: '2026-08-20',
      fileType: 'application/pdf',
      verified: true,
    },
    {
      id: 'doc_003',
      clientId: 'usr_client_001',
      name: 'Santam Motor Schedule & Policy Endorsement 2026.pdf',
      category: 'Policy',
      fileSize: '3.4 MB',
      uploadDate: '2026-04-02',
      fileType: 'application/pdf',
      verified: true,
    },
    {
      id: 'doc_004',
      clientId: 'usr_client_001',
      name: 'SARS IT3b Consolidated Tax Certificate 2026.pdf',
      category: 'Tax',
      fileSize: '1.2 MB',
      uploadDate: '2026-09-04',
      fileType: 'application/pdf',
      verified: true,
    },
    {
      id: 'doc_005',
      clientId: 'usr_client_001',
      name: 'Allan Gray Q2 Investment Statement.pdf',
      category: 'Statement',
      fileSize: '2.1 MB',
      uploadDate: '2026-07-15',
      fileType: 'application/pdf',
      verified: true,
    },
  ];

  async getDocuments(clientId?: string, category?: string): Promise<DocumentItem[]> {
    let docs = [...this.documents];
    if (clientId) {
      docs = docs.filter(d => d.clientId === clientId);
    }
    if (category && category !== 'All') {
      docs = docs.filter(d => d.category === category);
    }
    return docs;
  }

  async uploadDocument(docData: Omit<DocumentItem, 'id' | 'uploadDate' | 'verified'>): Promise<DocumentItem> {
    const newDoc: DocumentItem = {
      id: `doc_${Date.now()}`,
      ...docData,
      uploadDate: new Date().toISOString().split('T')[0],
      verified: false,
    };
    this.documents.unshift(newDoc);
    return { ...newDoc };
  }
}

export const policiesRepository = new PoliciesRepository();
export const documentsRepository = new DocumentsRepository();
