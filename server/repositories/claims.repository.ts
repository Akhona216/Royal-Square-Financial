import { Claim, ClaimTimelineEvent, ClaimTimelineStage } from './types.js';

export interface IClaimsRepository {
  getClaims(filter?: { clientId?: string; status?: string; insurer?: string }): Promise<Claim[]>;
  getClaimById(id: string): Promise<Claim | null>;
  createClaim(claimData: Omit<Claim, 'id' | 'claimNumber' | 'createdAt' | 'updatedAt'>): Promise<Claim>;
  updateClaimStatus(id: string, status: Claim['status'], stage?: ClaimTimelineStage, eventNote?: string): Promise<Claim | null>;
  addTimelineEvent(id: string, event: ClaimTimelineEvent): Promise<Claim | null>;
}

const mockClaims: Claim[] = [
  {
    id: 'clm_001',
    claimNumber: 'RSF-CLM-2026-0841',
    clientId: 'usr_client_001',
    policyNumber: 'SAN-AUTO-491028',
    insurer: 'Santam',
    type: 'Motor',
    incidentDate: '2026-09-08T17:45:00Z',
    incidentLocation: 'Rivonia Rd & Sandton Dr, Sandton, Johannesburg',
    description: 'Rear-ended at traffic intersection while stationary at amber light during peak evening traffic.',
    weatherConditions: 'Clear, dry road surface',
    evidence: {
      driverLicenseUploaded: true,
      damagePhotosCount: 4,
      dashcamAvailable: true,
      scenePhotosCount: 3,
      policeReportUploaded: true,
    },
    policeInfo: {
      stationName: 'Sandton Police Station (SAPS)',
      caseNumber: 'CAS-142/09/2026',
      officerName: 'Constable N. Khumalo',
      reportedDate: '2026-09-08',
    },
    thirdParty: {
      involved: true,
      name: 'Gareth Evans',
      contactNumber: '+27 82 819 3302',
      vehicleReg: 'ND 849-210',
      vehicleMake: 'Toyota Hilux 2.8 GD-6',
      insuranceCompany: 'Discovery Insure',
    },
    estimatedAmount: 68500,
    settlementAmount: 68500,
    currentStage: 'Authorisation',
    status: 'Authorized',
    timeline: [
      { stage: 'Accident Reported', date: '2026-09-08T18:30:00Z', status: 'completed', notes: 'Accident recorded and logged via Client Portal' },
      { stage: 'Claim Submitted', date: '2026-09-09T08:15:00Z', status: 'completed', notes: 'Submitted to Santam B2B Claims Gateway' },
      { stage: 'Claim Number Received', date: '2026-09-09T10:45:00Z', status: 'completed', notes: 'Santam internal reference #ST-99410 assigned' },
      { stage: 'Assessment', date: '2026-09-11T14:00:00Z', status: 'completed', notes: 'Independent assessor completed digital inspection at Approved Auto Body' },
      { stage: 'Authorisation', date: '2026-09-14T09:30:00Z', status: 'in_progress', notes: 'Parts sourcing and repair quote R68,500 authorized by Santam' },
      { stage: 'Repair', date: '2026-09-16T08:00:00Z', status: 'pending', notes: 'Scheduled check-in with Precision Panelbeaters' },
      { stage: 'Closed', date: '', status: 'pending', notes: 'Vehicle collection and final excess reconciliation' },
    ],
    createdAt: '2026-09-08T18:30:00Z',
    updatedAt: '2026-09-14T09:30:00Z',
  },
  {
    id: 'clm_002',
    claimNumber: 'RSF-CLM-2026-0612',
    clientId: 'usr_client_001',
    policyNumber: 'DISC-HOME-20911',
    insurer: 'Discovery',
    type: 'Property',
    incidentDate: '2026-07-21T03:30:00Z',
    incidentLocation: 'Primary Residence, Bryanston',
    description: 'High-voltage lightning surge damage to inverter and gate motor following severe Highveld thunderstorm.',
    evidence: {
      driverLicenseUploaded: false,
      damagePhotosCount: 3,
      dashcamAvailable: false,
      scenePhotosCount: 2,
      policeReportUploaded: false,
    },
    estimatedAmount: 42000,
    settlementAmount: 42000,
    currentStage: 'Closed',
    status: 'Settled',
    timeline: [
      { stage: 'Accident Reported', date: '2026-07-21T07:00:00Z', status: 'completed' },
      { stage: 'Claim Submitted', date: '2026-07-21T09:30:00Z', status: 'completed' },
      { stage: 'Claim Number Received', date: '2026-07-21T11:00:00Z', status: 'completed' },
      { stage: 'Assessment', date: '2026-07-23T15:00:00Z', status: 'completed' },
      { stage: 'Authorisation', date: '2026-07-25T10:00:00Z', status: 'completed' },
      { stage: 'Repair', date: '2026-07-28T12:00:00Z', status: 'completed' },
      { stage: 'Closed', date: '2026-08-01T16:00:00Z', status: 'completed', notes: 'Settlement disbursed directly to client account.' },
    ],
    createdAt: '2026-07-21T07:00:00Z',
    updatedAt: '2026-08-01T16:00:00Z',
  },
  {
    id: 'clm_003',
    claimNumber: 'RSF-CLM-2026-0902',
    clientId: 'usr_client_002',
    policyNumber: 'SAN-AUTO-331092',
    insurer: 'Santam',
    type: 'Motor',
    incidentDate: '2026-09-17T12:15:00Z',
    incidentLocation: 'N1 North near Allandale Offramp, Midrand',
    description: 'Windscreen cracked from flying road gravel thrown by a tipper truck.',
    evidence: {
      driverLicenseUploaded: true,
      damagePhotosCount: 2,
      dashcamAvailable: false,
      scenePhotosCount: 1,
      policeReportUploaded: false,
    },
    estimatedAmount: 11500,
    currentStage: 'Claim Number Received',
    status: 'In Review',
    timeline: [
      { stage: 'Accident Reported', date: '2026-09-17T13:00:00Z', status: 'completed' },
      { stage: 'Claim Submitted', date: '2026-09-17T14:30:00Z', status: 'completed' },
      { stage: 'Claim Number Received', date: '2026-09-18T09:00:00Z', status: 'in_progress', notes: 'PG Glass replacement referral issued' },
      { stage: 'Assessment', date: '', status: 'pending' },
      { stage: 'Authorisation', date: '', status: 'pending' },
      { stage: 'Repair', date: '', status: 'pending' },
      { stage: 'Closed', date: '', status: 'pending' },
    ],
    createdAt: '2026-09-17T13:00:00Z',
    updatedAt: '2026-09-18T09:00:00Z',
  }
];

export class ClaimsRepository implements IClaimsRepository {
  async getClaims(filter?: { clientId?: string; status?: string; insurer?: string }): Promise<Claim[]> {
    let results = [...mockClaims];
    if (filter?.clientId) {
      results = results.filter(c => c.clientId === filter.clientId);
    }
    if (filter?.status) {
      results = results.filter(c => c.status === filter.status);
    }
    if (filter?.insurer) {
      results = results.filter(c => c.insurer.toLowerCase() === filter.insurer?.toLowerCase());
    }
    return results;
  }

  async getClaimById(id: string): Promise<Claim | null> {
    const claim = mockClaims.find(c => c.id === id || c.claimNumber === id);
    return claim ? { ...claim } : null;
  }

  async createClaim(claimData: Omit<Claim, 'id' | 'claimNumber' | 'createdAt' | 'updatedAt'>): Promise<Claim> {
    const nextNum = Math.floor(1000 + Math.random() * 9000);
    const newClaim: Claim = {
      id: `clm_${Date.now()}_${nextNum}`,
      claimNumber: `RSF-CLM-2026-${nextNum}`,
      ...claimData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockClaims.unshift(newClaim);
    return { ...newClaim };
  }

  async updateClaimStatus(id: string, status: Claim['status'], stage?: ClaimTimelineStage, eventNote?: string): Promise<Claim | null> {
    const claim = mockClaims.find(c => c.id === id || c.claimNumber === id);
    if (!claim) return null;

    claim.status = status;
    if (stage) {
      claim.currentStage = stage;
      const targetEvent = claim.timeline.find(t => t.stage === stage);
      if (targetEvent) {
        targetEvent.status = 'in_progress';
        targetEvent.date = new Date().toISOString();
        if (eventNote) targetEvent.notes = eventNote;
      }
      // mark earlier stages as completed
      const stageOrder: ClaimTimelineStage[] = [
        'Accident Reported', 
        'Claim Submitted', 
        'Claim Number Received', 
        'Assessment', 
        'Authorisation', 
        'Repair', 
        'Closed'
      ];
      const currentIndex = stageOrder.indexOf(stage);
      stageOrder.forEach((s, idx) => {
        const ev = claim.timeline.find(t => t.stage === s);
        if (ev) {
          if (idx < currentIndex) ev.status = 'completed';
          else if (idx === currentIndex) ev.status = status === 'Settled' || status === 'Rejected' ? 'completed' : 'in_progress';
        }
      });
    }
    claim.updatedAt = new Date().toISOString();
    return { ...claim };
  }

  async addTimelineEvent(id: string, event: ClaimTimelineEvent): Promise<Claim | null> {
    const claim = mockClaims.find(c => c.id === id);
    if (!claim) return null;
    const existingIndex = claim.timeline.findIndex(e => e.stage === event.stage);
    if (existingIndex >= 0) {
      claim.timeline[existingIndex] = event;
    } else {
      claim.timeline.push(event);
    }
    claim.updatedAt = new Date().toISOString();
    return { ...claim };
  }
}

export const claimsRepository = new ClaimsRepository();
