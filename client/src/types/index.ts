export type UserRole = 'client' | 'adviser';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  idNumber?: string;
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
  currentValue: number;
  accountNumber?: string;
  currency: string;
  lastUpdated: string;
}

export interface Liability {
  id: string;
  name: string;
  category: LiabilityCategory;
  institution: string;
  outstandingBalance: number;
  monthlyPayment: number;
  interestRate?: number;
  currency: string;
  lastUpdated: string;
}

export interface FinancialCalculationSummary {
  clientId: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  debtToAssetRatio: number;
  totalMonthlyDebtPayment: number;
  assetsByCategory: Record<AssetCategory, { total: number; count: number; items: Asset[] }>;
  liabilitiesByCategory: Record<LiabilityCategory, { total: number; count: number; items: Liability[] }>;
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
  progressPercentage: number;
  shortfall: number;
  monthsRemaining: number;
  createdAt: string;
}

export type ClaimTimelineStage = 
  | 'Submitted'
  | 'Received'
  | 'Assessed'
  | 'Authorised'
  | 'In Progress'
  | 'Completed'
  | 'Ready for Collection'
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
  updatedBy?: string;
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
  repairerInfo?: {
    name?: string;
    contact?: string;
    assessorName?: string;
    workshopAddress?: string;
  };
  partsStatus?: string;
  estimatedCompletionDate?: string;
  authorizedAmount?: number;
  excessPayable?: number;
  currentStage: ClaimTimelineStage;
  timeline: ClaimTimelineEvent[];
  status: 'Pending' | 'In Review' | 'Authorized' | 'Repairing' | 'Completed' | 'Ready for Collection' | 'Settled' | 'Rejected';
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

export type NotificationType = 'service_request' | 'birthday' | 'policy_renewal' | 'claim_update';
export type NotificationPriority = 'high' | 'medium' | 'low';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: NotificationPriority;
  targetRole: 'client' | 'adviser' | 'all';
  clientId?: string;
  clientName?: string;
  referenceId?: string;
  link?: string;
  actionLabel?: string;
  metadata?: {
    birthdayDate?: string;
    formattedBirthday?: string;
    birthYear?: number;
    ageTurning?: number;
    daysRemaining?: number;
    idNumber?: string;
    policyNumber?: string;
    provider?: string;
    renewalDate?: string;
    premium?: number;
    coverageAmount?: number;
    requestType?: string;
    requestStatus?: string;
    urgency?: string;
    greetingSent?: boolean;
    greetingDate?: string;
    claimNumber?: string;
    stage?: string;
    repairerName?: string;
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  serviceRequests: number;
  birthdays: number;
  renewals: number;
  claims?: number;
}

export interface AddressDetails {
  street: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface PostalAddressDetails {
  sameAsResidential: boolean;
  street?: string;
  suburb?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  alternativePhone?: string;
  email?: string;
}

export interface BankingDetails {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  accountType: 'Cheque / Current' | 'Savings' | 'Transmission';
  branchCode: string;
  verificationStatus: 'verified' | 'pending_verification' | 'unverified';
  verifiedAt?: string;
  verificationRequiredNote?: string;
}

export interface ClientProfile extends User {
  residentialAddress: AddressDetails;
  postalAddress: PostalAddressDetails;
  emergencyContact: EmergencyContact;
  bankingDetails: BankingDetails;
  maritalStatus?: string;
  occupation?: string;
  employer?: string;
  preferredCommunication?: 'Email' | 'SMS' | 'Phone' | 'WhatsApp';
  preferredLanguage?: string;
  lastUpdated: string;
}

export interface AuditLogChange {
  field: string;
  label: string;
  oldValue: any;
  newValue: any;
  sensitive?: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: 'client' | 'adviser' | 'system' | 'provider';
  action: string;
  category: 'profile' | 'claims' | 'banking' | 'security' | 'integration';
  entityId: string;
  entityType: 'user' | 'claim' | 'service_request' | 'integration';
  description: string;
  changes?: AuditLogChange[];
  status: 'SUCCESS' | 'FLAGGED_FOR_VERIFICATION' | 'REJECTED';
  ipAddress?: string;
}


