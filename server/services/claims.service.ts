import { claimsRepository, CANONICAL_STAGES, normalizeStage } from '../repositories/claims.repository.js';
import { notificationsService } from './notifications.service.js';
import { auditRepository } from '../repositories/audit.repository.js';
import { Claim, ClaimTimelineEvent, ClaimTimelineStage } from '../repositories/types.js';

export interface ProviderRepairUpdatePayload {
  stage: string;
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

export class ClaimsService {
  async getClaims(filter?: { clientId?: string; status?: string; insurer?: string }): Promise<Claim[]> {
    return claimsRepository.getClaims(filter);
  }

  async getClaimById(id: string): Promise<Claim | null> {
    return claimsRepository.getClaimById(id);
  }

  async submitMotorClaim(data: {
    clientId: string;
    policyNumber: string;
    insurer: string;
    incidentDate: string;
    incidentLocation: string;
    description: string;
    weatherConditions?: string;
    evidence: {
      driverLicenseUploaded: boolean;
      damagePhotosCount: number;
      dashcamAvailable: boolean;
      scenePhotosCount: number;
      policeReportUploaded: boolean;
    };
    policeInfo?: {
      stationName: string;
      caseNumber: string;
      officerName: string;
      reportedDate: string;
    };
    thirdParty?: {
      involved: boolean;
      name?: string;
      contactNumber?: string;
      vehicleReg?: string;
      vehicleMake?: string;
      insuranceCompany?: string;
    };
    estimatedAmount?: number;
  }): Promise<Claim> {
    if (!data.incidentDate || !data.incidentLocation || !data.description) {
      throw new Error('Incident date, location, and description are required for motor claim submission');
    }

    const now = new Date().toISOString();
    const initialTimeline: ClaimTimelineEvent[] = [
      {
        stage: 'Submitted',
        date: now,
        status: 'completed',
        notes: `Claim lodged electronically with ${data.insurer || 'Santam'} Claims Operations via Client Portal`,
      },
      {
        stage: 'Received',
        date: now,
        status: 'in_progress',
        notes: 'Awaiting insurer systems automated reference generation and panel assignation',
      },
      { stage: 'Assessed', date: '', status: 'pending' },
      { stage: 'Authorised', date: '', status: 'pending' },
      { stage: 'In Progress', date: '', status: 'pending' },
      { stage: 'Completed', date: '', status: 'pending' },
      { stage: 'Ready for Collection', date: '', status: 'pending' },
    ];

    return claimsRepository.createClaim({
      clientId: data.clientId,
      policyNumber: data.policyNumber || 'SAN-AUTO-491028',
      insurer: data.insurer || 'Santam',
      type: 'Motor',
      incidentDate: data.incidentDate,
      incidentLocation: data.incidentLocation,
      description: data.description,
      weatherConditions: data.weatherConditions,
      evidence: data.evidence,
      policeInfo: data.policeInfo,
      thirdParty: data.thirdParty,
      estimatedAmount: data.estimatedAmount ? Number(data.estimatedAmount) : 45000,
      currentStage: 'Received',
      timeline: initialTimeline,
      status: 'Pending',
    });
  }

  async updateClaimStatus(
    id: string,
    status: Claim['status'],
    stage?: ClaimTimelineStage,
    eventNote?: string
  ): Promise<Claim | null> {
    return claimsRepository.updateClaimStatus(id, status, stage, eventNote);
  }

  /**
   * Complete workflow for receiving insurer vehicle repair updates:
   * 1. Validate update
   * 2. Identify claim
   * 3. Update status
   * 4. Save
   * 5. Notify client
   * 6. Update timeline
   * 7. Notify adviser
   * 8. Audit log
   */
  async processProviderRepairUpdate(
    provider: string,
    claimNumber: string,
    payload: ProviderRepairUpdatePayload
  ): Promise<{
    claim: Claim;
    notifications: { clientNotif: any; adviserNotif: any };
    auditEntry: any;
  }> {
    // Step 1: Validate update
    const validProviders = ['santam', 'discovery', 'sanlam', 'oldmutual', 'allangray', 'liberty'];
    const cleanProvider = (provider || '').trim().toLowerCase();
    if (!cleanProvider) {
      throw new Error('Provider code is required (e.g., santam, discovery, sanlam)');
    }
    if (!claimNumber || !claimNumber.trim()) {
      throw new Error('Claim number is required');
    }
    if (!payload.stage && !payload.status && !payload.notes) {
      throw new Error('At least one update property (stage, status, notes) must be supplied');
    }

    const stage = normalizeStage(payload.stage || 'In Progress');

    // Step 2: Identify claim
    const existingClaim = await claimsRepository.getClaimById(claimNumber.trim());
    if (!existingClaim) {
      const err: any = new Error(`Claim with reference '${claimNumber}' could not be found`);
      err.statusCode = 404;
      throw err;
    }

    // Step 3, 4, 6: Update status, repairer info, and advance timeline; Save
    const updatedClaim = await claimsRepository.applyProviderRepairUpdate(existingClaim.id, {
      stage,
      status: payload.status,
      notes: payload.notes,
      repairer: payload.repairer,
      estimatedCompletionDate: payload.estimatedCompletionDate,
      partsStatus: payload.partsStatus,
      authorizedAmount: payload.authorizedAmount,
      excessPayable: payload.excessPayable,
    });

    if (!updatedClaim) {
      throw new Error(`Failed to apply repair update to claim ${claimNumber}`);
    }

    // Step 5 & 7: Notify client and notify adviser
    const notifications = notificationsService.notifyClaimUpdate({
      claim: updatedClaim,
      provider: cleanProvider,
      stage,
      notes: payload.notes,
      repairerName: updatedClaim.repairerInfo?.name,
    });

    // Step 8: Audit log
    const auditEntry = await auditRepository.log({
      userId: updatedClaim.clientId,
      userName: `${cleanProvider.toUpperCase()} Claims Gateway`,
      userRole: 'provider',
      action: 'INSURER_REPAIR_UPDATE',
      category: 'claims',
      entityId: updatedClaim.id,
      entityType: 'claim',
      description: `Vehicle repair telemetry received from ${cleanProvider.toUpperCase()}: Stage advanced to "${stage}". Status: ${updatedClaim.status}. ${payload.notes ? `Notes: "${payload.notes}"` : ''}`,
      changes: [
        {
          field: 'currentStage',
          label: 'Claim Timeline Stage',
          oldValue: existingClaim.currentStage,
          newValue: stage,
        },
        {
          field: 'status',
          label: 'Claim Status',
          oldValue: existingClaim.status,
          newValue: updatedClaim.status,
        },
        ...(payload.repairer
          ? [
              {
                field: 'repairerInfo',
                label: 'Assigned Repairer',
                oldValue: existingClaim.repairerInfo?.name || 'Unassigned',
                newValue: payload.repairer.name,
              },
            ]
          : []),
      ],
      status: 'SUCCESS',
    });

    return {
      claim: updatedClaim,
      notifications,
      auditEntry,
    };
  }
}

export const claimsService = new ClaimsService();
