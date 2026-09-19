/**
 * Shared Type Definitions for Royal Square Financial (Pty) Ltd Repositories
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'adviser';
  phone?: string;
  idNumber?: string; // South African ID (13 digits)
  taxNumber?: string;
  adviserId?: string;
  avatarUrl?: string;
  twoFactorEnabled?: boolean;
}

export type AssetCategory = 'Investments' | 'Property' | 'Savings' | 'Retirement' | 'Other';
export type LiabilityCategory = 'Home Loan' | 'Vehicle Finance' | 'Personal Loans' | 'Credit' | 'Other';

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  institution: string;
  currentValue: number; // in ZAR
  accountNumber?: string;
  currency: string;
  lastUpdated: string;
}

export interface Liability {
  id: string;
  name: string;
  category: LiabilityCategory;
  institution: string;
  outstandingBalance: number; // in ZAR
  monthlyPayment: number;
  interestRate?: number;
  currency: string;
  lastUpdated: string;
}

export interface FinancialPosition {
  clientId: string;
  assets: Asset[];
  liabilities: Liability[];
  lastValuationDate: string;
}

export type GoalCategory = 'Retirement' | 'Emergency Fund' | 'Education' | 'Property' | 'Vehicle' | 'Investment';

export interface Goal {
  id: string;
  clientId: string;
  title: string;
  category: GoalCategory;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  targetDate: string;
  notes?: string;
  status: 'on_track' | 'lagging' | 'completed';
  createdAt: string;
}

export type ClaimTimelineStage = 
  | 'Accident Reported' 
  | 'Claim Submitted' 
  | 'Claim Number Received' 
  | 'Assessment' 
  | 'Authorisation' 
  | 'Repair' 
  | 'Closed';

export interface ClaimTimelineEvent {
  stage: ClaimTimelineStage;
  date: string;
  status: 'completed' | 'in_progress' | 'pending';
  notes?: string;
}

export interface Claim {
  id: string;
  claimNumber: string;
  clientId: string;
  policyNumber: string;
  insurer: string;
  type: 'Motor' | 'Property' | 'Life' | 'Commercial';
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
  settlementAmount?: number;
  currentStage: ClaimTimelineStage;
  timeline: ClaimTimelineEvent[];
  status: 'Pending' | 'In Review' | 'Authorized' | 'Repairing' | 'Settled' | 'Rejected';
  createdAt: string;
  updatedAt: string;
}

export type ServiceRequestType = 
  | 'Address change' 
  | 'Bank details' 
  | 'Border Letter' 
  | 'IRP5 request' 
  | 'Balance Sheet update' 
  | 'Consultation';

export interface ServiceRequest {
  id: string;
  referenceNumber: string;
  clientId: string;
  clientName: string;
  type: ServiceRequestType;
  details: string;
  urgency: 'Low' | 'Medium' | 'High';
  status: 'Submitted' | 'In Review' | 'Approved' | 'Completed' | 'Rejected';
  supportingDocuments?: string[];
  assignedAdviser?: string;
  adviserNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Policy {
  id: string;
  policyNumber: string;
  clientId: string;
  provider: 'Santam' | 'Sanlam' | 'Old Mutual' | 'Discovery' | 'Allan Gray' | 'Liberty';
  type: string;
  coverageAmount: number;
  premium: number;
  frequency: 'Monthly' | 'Annually';
  startDate: string;
  renewalDate: string;
  status: 'Active' | 'Pending Renewal' | 'Lapsed' | 'Cancelled';
}

export interface DocumentItem {
  id: string;
  clientId: string;
  name: string;
  category: 'ID' | 'Proof of Address' | 'Policy' | 'Tax' | 'Statement';
  fileSize: string;
  uploadDate: string;
  fileType: string;
  verified: boolean;
}

export interface TaskItem {
  id: string;
  adviserId: string;
  clientId?: string;
  clientName?: string;
  title: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Pending' | 'Completed';
  category: 'Compliance' | 'Review' | 'Claim Follow-up' | 'Quote' | 'Service Request';
}

export interface CalendarAppointment {
  id: string;
  adviserId: string;
  clientId: string;
  clientName: string;
  title: string;
  type: 'Financial Review' | 'Client Consultation' | 'Policy Renewal' | 'Claim Follow-up';
  date: string;
  time: string;
  durationMinutes: number;
  location: string;
  notes?: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export type IntegrationStatus = 'Not Connected' | 'Connected' | 'Syncing' | 'Error';

export interface InsurerIntegration {
  id: string;
  providerId: 'santam' | 'sanlam' | 'oldmutual' | 'discovery' | 'allangray' | 'liberty';
  name: string;
  logo: string;
  category: 'Short-Term' | 'Long-Term' | 'Asset Management' | 'Health & Life';
  status: IntegrationStatus;
  lastSync?: string;
  policiesCount: number;
  claimsCount: number;
  endpointUrl: string;
  apiHealth: 'Healthy' | 'Degraded' | 'Offline';
}
