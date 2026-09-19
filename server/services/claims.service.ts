import { claimsRepository } from '../repositories/claims.repository.js';
import { Claim, ClaimTimelineEvent, ClaimTimelineStage } from '../repositories/types.js';

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
        stage: 'Accident Reported',
        date: data.incidentDate,
        status: 'completed',
        notes: 'Incident recorded via Royal Square Financial Portal',
      },
      {
        stage: 'Claim Submitted',
        date: now,
        status: 'completed',
        notes: `Claim lodged electronically with ${data.insurer || 'Santam'} Claims Operations`,
      },
      {
        stage: 'Claim Number Received',
        date: '',
        status: 'in_progress',
        notes: 'Awaiting insurer systems automated reference generation',
      },
      { stage: 'Assessment', date: '', status: 'pending' },
      { stage: 'Authorisation', date: '', status: 'pending' },
      { stage: 'Repair', date: '', status: 'pending' },
      { stage: 'Closed', date: '', status: 'pending' },
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
      currentStage: 'Claim Number Received',
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
}

export const claimsService = new ClaimsService();
