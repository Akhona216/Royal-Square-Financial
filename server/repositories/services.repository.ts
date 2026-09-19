import { ServiceRequest, ServiceRequestType } from './types.js';

export interface IServicesRepository {
  getServiceRequests(filter?: { clientId?: string; status?: string; type?: string }): Promise<ServiceRequest[]>;
  getServiceRequestById(id: string): Promise<ServiceRequest | null>;
  createServiceRequest(data: Omit<ServiceRequest, 'id' | 'referenceNumber' | 'createdAt' | 'updatedAt'>): Promise<ServiceRequest>;
  updateServiceRequest(id: string, updates: Partial<ServiceRequest>): Promise<ServiceRequest | null>;
}

const mockServiceRequests: ServiceRequest[] = [
  {
    id: 'req_001',
    referenceNumber: 'RSF-SRQ-2026-401',
    clientId: 'usr_client_001',
    clientName: 'Sipho Dlamini',
    type: 'Border Letter',
    details: 'Requesting Cross-Border Insurer Letter for Santam comprehensive vehicle policy. Traveling to Botswana (Gaborone & Chobe) from 15 Dec 2026 to 28 Dec 2026. Vehicle Reg: JM 42 DL GP.',
    urgency: 'Medium',
    status: 'In Review',
    supportingDocuments: ['Border_Letter_Application_Draft.pdf'],
    assignedAdviser: 'Johan van der Merwe, CFP®',
    adviserNotes: 'Drafted border letter template. Awaiting Santam Underwriting cross-border endorsement.',
    createdAt: '2026-09-12T11:20:00Z',
    updatedAt: '2026-09-13T09:10:00Z',
  },
  {
    id: 'req_002',
    referenceNumber: 'RSF-SRQ-2026-388',
    clientId: 'usr_client_001',
    clientName: 'Sipho Dlamini',
    type: 'IRP5 request',
    details: 'Need 2025/2026 IT3b / IT3c and Retirement Annuity tax certificates for SARS eFiling submission deadline.',
    urgency: 'High',
    status: 'Completed',
    supportingDocuments: ['AllanGray_IT3b_TaxCertificate.pdf', 'OldMutual_RA_Tax_2026.pdf'],
    assignedAdviser: 'Johan van der Merwe, CFP®',
    adviserNotes: 'Uploaded consolidated tax packet to Document Vault.',
    createdAt: '2026-09-02T14:00:00Z',
    updatedAt: '2026-09-04T10:15:00Z',
  },
  {
    id: 'req_003',
    referenceNumber: 'RSF-SRQ-2026-419',
    clientId: 'usr_client_001',
    clientName: 'Sipho Dlamini',
    type: 'Consultation',
    details: 'Annual estate planning and family trust structuring review with Johan van der Merwe.',
    urgency: 'Low',
    status: 'Approved',
    assignedAdviser: 'Johan van der Merwe, CFP®',
    adviserNotes: 'Scheduled for 25 Sept 2026 at 10:00 AM in Sandton Boardroom.',
    createdAt: '2026-09-15T08:45:00Z',
    updatedAt: '2026-09-16T14:30:00Z',
  },
  {
    id: 'req_004',
    referenceNumber: 'RSF-SRQ-2026-422',
    clientId: 'usr_client_002',
    clientName: 'Thandiwe Sithole',
    type: 'Address change',
    details: 'Relocated from Morningside to Waterfall City. Need proof of address updated across all Santam and Discovery policies.',
    urgency: 'Medium',
    status: 'Submitted',
    assignedAdviser: 'Johan van der Merwe, CFP®',
    createdAt: '2026-09-18T16:00:00Z',
    updatedAt: '2026-09-18T16:00:00Z',
  },
];

export class ServicesRepository implements IServicesRepository {
  async getServiceRequests(filter?: { clientId?: string; status?: string; type?: string }): Promise<ServiceRequest[]> {
    let list = [...mockServiceRequests];
    if (filter?.clientId) {
      list = list.filter(r => r.clientId === filter.clientId);
    }
    if (filter?.status) {
      list = list.filter(r => r.status === filter.status);
    }
    if (filter?.type) {
      list = list.filter(r => r.type === filter.type);
    }
    return list;
  }

  async getServiceRequestById(id: string): Promise<ServiceRequest | null> {
    const item = mockServiceRequests.find(r => r.id === id || r.referenceNumber === id);
    return item ? { ...item } : null;
  }

  async createServiceRequest(data: Omit<ServiceRequest, 'id' | 'referenceNumber' | 'createdAt' | 'updatedAt'>): Promise<ServiceRequest> {
    const num = Math.floor(100 + Math.random() * 900);
    const newReq: ServiceRequest = {
      id: `req_${Date.now()}_${num}`,
      referenceNumber: `RSF-SRQ-2026-${num}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockServiceRequests.unshift(newReq);
    return { ...newReq };
  }

  async updateServiceRequest(id: string, updates: Partial<ServiceRequest>): Promise<ServiceRequest | null> {
    const item = mockServiceRequests.find(r => r.id === id || r.referenceNumber === id);
    if (!item) return null;
    Object.assign(item, updates, { updatedAt: new Date().toISOString() });
    return { ...item };
  }
}

export const servicesRepository = new ServicesRepository();
