import { Claim, ClaimTimelineEvent, ClaimTimelineStage } from './types.js';

export interface IClaimsRepository {
  getClaims(filter?: { clientId?: string; status?: string; insurer?: string }): Promise<Claim[]>;
  getClaimById(id: string): Promise<Claim | null>;
  createClaim(claimData: Omit<Claim, 'id' | 'claimNumber' | 'createdAt' | 'updatedAt'>): Promise<Claim>;
  updateClaimStatus(id: string, status: Claim['status'], stage?: ClaimTimelineStage, eventNote?: string): Promise<Claim | null>;
  applyProviderRepairUpdate(
    claimIdentifier: string,
    updateData: {
      stage: ClaimTimelineStage;
      status?: Claim['status'];
      notes?: string;
      repairer?: {
        name?: string;
        contact?: string;
        assessorName?: string;
        workshopAddress?: string;
      };
      estimatedCompletionDate?: string;
      partsStatus?: string;
      authorizedAmount?: number;
      excessPayable?: number;
    }
  ): Promise<Claim | null>;
  addTimelineEvent(id: string, event: ClaimTimelineEvent): Promise<Claim | null>;
}

export const CANONICAL_STAGES: ClaimTimelineStage[] = [
  'Submitted',
  'Received',
  'Assessed',
  'Authorised',
  'In Progress',
  'Completed',
  'Ready for Collection',
];

export function normalizeStage(rawStage: string): ClaimTimelineStage {
  const s = (rawStage || '').trim().toLowerCase();
  if (s.includes('submit') || s.includes('accident') || s.includes('report')) return 'Submitted';
  if (s.includes('receiv') || s.includes('number')) return 'Received';
  if (s.includes('assess')) return 'Assessed';
  if (s.includes('authoris') || s.includes('authoriz')) return 'Authorised';
  if (s.includes('progress') || s.includes('repair') || s.includes('panelbeat') || s.includes('paint')) return 'In Progress';
  if (s.includes('complet') || s.includes('done') || s.includes('quality') || s.includes('inspect')) return 'Completed';
  if (s.includes('ready') || s.includes('collect') || s.includes('handover') || s.includes('close') || s.includes('settle')) return 'Ready for Collection';
  return 'In Progress';
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
    repairerInfo: {
      name: 'Precision Panelbeaters Sandton',
      contact: '+27 11 883 4000',
      assessorName: 'Markus van Zyl',
      workshopAddress: '45 5th Street, Wynberg, Sandton',
    },
    partsStatus: 'OEM rear bumper and tailgate assembly dispatched from Toyota SA',
    estimatedCompletionDate: '2026-09-26',
    authorizedAmount: 68500,
    excessPayable: 2500,
    currentStage: 'In Progress',
    status: 'Repairing',
    timeline: [
      { stage: 'Submitted', date: '2026-09-08T18:30:00Z', status: 'completed', notes: 'Accident recorded and logged via Royal Square Client Portal' },
      { stage: 'Received', date: '2026-09-09T10:45:00Z', status: 'completed', notes: 'Santam internal reference #ST-99410 generated and assigned' },
      { stage: 'Assessed', date: '2026-09-11T14:00:00Z', status: 'completed', notes: 'Digital assessor Markus van Zyl completed damage assessment at Approved Auto Body' },
      { stage: 'Authorised', date: '2026-09-14T09:30:00Z', status: 'completed', notes: 'Repair authorization R68,500 issued by Santam short-term underwriting team' },
      { stage: 'In Progress', date: '2026-09-16T08:00:00Z', status: 'in_progress', notes: 'Precision Panelbeaters: Chassis aligned, replacement parts fitted, currently in spray booth' },
      { stage: 'Completed', date: '', status: 'pending', notes: 'Paint bake cure, mechanical safety check, and final QC inspection' },
      { stage: 'Ready for Collection', date: '', status: 'pending', notes: 'Vehicle collection and excess clearance certificate' },
    ],
    createdAt: '2026-09-08T18:30:00Z',
    updatedAt: '2026-09-16T08:00:00Z',
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
    currentStage: 'Ready for Collection',
    status: 'Settled',
    timeline: [
      { stage: 'Submitted', date: '2026-07-21T07:00:00Z', status: 'completed' },
      { stage: 'Received', date: '2026-07-21T11:00:00Z', status: 'completed' },
      { stage: 'Assessed', date: '2026-07-23T15:00:00Z', status: 'completed' },
      { stage: 'Authorised', date: '2026-07-25T10:00:00Z', status: 'completed' },
      { stage: 'In Progress', date: '2026-07-28T12:00:00Z', status: 'completed' },
      { stage: 'Completed', date: '2026-07-31T14:00:00Z', status: 'completed' },
      { stage: 'Ready for Collection', date: '2026-08-01T16:00:00Z', status: 'completed', notes: 'Settlement disbursed directly to client Standard Bank account.' },
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
    currentStage: 'Assessed',
    status: 'In Review',
    repairerInfo: {
      name: 'PG Glass Midrand',
      contact: '+27 11 315 2200',
    },
    timeline: [
      { stage: 'Submitted', date: '2026-09-17T13:00:00Z', status: 'completed' },
      { stage: 'Received', date: '2026-09-18T09:00:00Z', status: 'completed', notes: 'PG Glass replacement referral issued' },
      { stage: 'Assessed', date: '2026-09-18T14:00:00Z', status: 'in_progress', notes: 'Glass crack size assessed: Replacement windscreen ordered' },
      { stage: 'Authorised', date: '', status: 'pending' },
      { stage: 'In Progress', date: '', status: 'pending' },
      { stage: 'Completed', date: '', status: 'pending' },
      { stage: 'Ready for Collection', date: '', status: 'pending' },
    ],
    createdAt: '2026-09-17T13:00:00Z',
    updatedAt: '2026-09-18T14:00:00Z',
  },
];

export class ClaimsRepository implements IClaimsRepository {
  async getClaims(filter?: { clientId?: string; status?: string; insurer?: string }): Promise<Claim[]> {
    let results = [...mockClaims];
    if (filter?.clientId) {
      results = results.filter((c) => c.clientId === filter.clientId);
    }
    if (filter?.status) {
      results = results.filter((c) => c.status === filter.status);
    }
    if (filter?.insurer) {
      results = results.filter((c) => c.insurer.toLowerCase() === filter.insurer?.toLowerCase());
    }
    return results;
  }

  async getClaimById(id: string): Promise<Claim | null> {
    const cleanId = (id || '').trim().toLowerCase();
    const claim = mockClaims.find(
      (c) => c.id.toLowerCase() === cleanId || c.claimNumber.toLowerCase() === cleanId
    );
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

  async updateClaimStatus(
    id: string,
    status: Claim['status'],
    stage?: ClaimTimelineStage,
    eventNote?: string
  ): Promise<Claim | null> {
    const cleanId = (id || '').trim().toLowerCase();
    const claim = mockClaims.find(
      (c) => c.id.toLowerCase() === cleanId || c.claimNumber.toLowerCase() === cleanId
    );
    if (!claim) return null;

    claim.status = status;
    if (stage) {
      const canonicalStage = normalizeStage(stage);
      claim.currentStage = canonicalStage;

      const targetEvent = claim.timeline.find((t) => normalizeStage(t.stage) === canonicalStage);
      if (targetEvent) {
        targetEvent.status = 'in_progress';
        targetEvent.date = new Date().toISOString();
        if (eventNote) targetEvent.notes = eventNote;
      }

      const currentIndex = CANONICAL_STAGES.indexOf(canonicalStage);
      CANONICAL_STAGES.forEach((s, idx) => {
        const ev = claim.timeline.find((t) => normalizeStage(t.stage) === s);
        if (ev) {
          if (idx < currentIndex) {
            ev.status = 'completed';
          } else if (idx === currentIndex) {
            ev.status =
              status === 'Settled' || status === 'Completed' || status === 'Ready for Collection'
                ? 'completed'
                : 'in_progress';
          }
        }
      });
    }

    claim.updatedAt = new Date().toISOString();
    return { ...claim };
  }

  async applyProviderRepairUpdate(
    claimIdentifier: string,
    updateData: {
      stage: ClaimTimelineStage;
      status?: Claim['status'];
      notes?: string;
      repairer?: {
        name?: string;
        contact?: string;
        assessorName?: string;
        workshopAddress?: string;
      };
      estimatedCompletionDate?: string;
      partsStatus?: string;
      authorizedAmount?: number;
      excessPayable?: number;
    }
  ): Promise<Claim | null> {
    const cleanId = (claimIdentifier || '').trim().toLowerCase();
    const claim = mockClaims.find(
      (c) => c.id.toLowerCase() === cleanId || c.claimNumber.toLowerCase() === cleanId
    );
    if (!claim) return null;

    const canonicalStage = normalizeStage(updateData.stage);
    claim.currentStage = canonicalStage;

    // Determine appropriate status based on stage if not specified
    let nextStatus: Claim['status'] = updateData.status || claim.status;
    if (!updateData.status) {
      if (canonicalStage === 'Submitted') nextStatus = 'Pending';
      else if (canonicalStage === 'Received' || canonicalStage === 'Assessed') nextStatus = 'In Review';
      else if (canonicalStage === 'Authorised') nextStatus = 'Authorized';
      else if (canonicalStage === 'In Progress') nextStatus = 'Repairing';
      else if (canonicalStage === 'Completed') nextStatus = 'Completed';
      else if (canonicalStage === 'Ready for Collection') nextStatus = 'Ready for Collection';
    }
    claim.status = nextStatus;

    if (updateData.repairer) {
      claim.repairerInfo = {
        ...(claim.repairerInfo || {}),
        ...updateData.repairer,
      };
    }
    if (updateData.partsStatus) claim.partsStatus = updateData.partsStatus;
    if (updateData.estimatedCompletionDate) claim.estimatedCompletionDate = updateData.estimatedCompletionDate;
    if (updateData.authorizedAmount) claim.authorizedAmount = Number(updateData.authorizedAmount);
    if (updateData.excessPayable) claim.excessPayable = Number(updateData.excessPayable);

    // Update timeline stages: Mark previous completed, current in_progress/completed
    const now = new Date().toISOString();
    const targetIdx = CANONICAL_STAGES.indexOf(canonicalStage);

    CANONICAL_STAGES.forEach((stageName, idx) => {
      let ev = claim.timeline.find((t) => normalizeStage(t.stage) === stageName);
      if (!ev) {
        ev = {
          stage: stageName,
          date: '',
          status: 'pending',
        };
        claim.timeline.push(ev);
      }

      if (idx < targetIdx) {
        ev.status = 'completed';
        if (!ev.date) ev.date = now;
      } else if (idx === targetIdx) {
        ev.status = canonicalStage === 'Completed' || canonicalStage === 'Ready for Collection' ? 'completed' : 'in_progress';
        ev.date = now;
        if (updateData.notes) ev.notes = updateData.notes;
      } else {
        ev.status = 'pending';
      }
    });

    claim.updatedAt = now;
    return { ...claim };
  }

  async addTimelineEvent(id: string, event: ClaimTimelineEvent): Promise<Claim | null> {
    const claim = mockClaims.find((c) => c.id === id || c.claimNumber === id);
    if (!claim) return null;
    const existingIndex = claim.timeline.findIndex((e) => e.stage === event.stage);
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
