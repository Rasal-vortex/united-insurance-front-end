export type PolicyStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
export type ClaimStatus = 'REPORTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'SETTLED';
export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';
export type FollowUpStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';
export type CommissionStatus = 'PENDING' | 'PAID' | 'CANCELLED';
export type EntityStatus = 'ACTIVE' | 'INACTIVE';

export interface Branch {
  id: string;
  name: string;
  code: string;
  region?: string;
  territory?: string;
  managerUsername: string;
  managerPassword?: string;
  phone: string;
  email: string;
  address: string;
  active: boolean;
  staffCount?: number;
  regionalVolume?: string;
  createdAt: string;
}

export interface Staff {
  id: string;
  branchId: string;
  name: string;
  phone: string;
  email?: string;
  designation?: string;
  status?: EntityStatus;
  joiningDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Customer {
  id: string;
  branchId: string;
  customerNumber: string; // e.g. CUST-88120
  name: string;
  phone: string;
  email?: string;
  dob?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: string;
  notes?: string;
  status?: EntityStatus;
  staffId?: string;
  assignedStaffName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Lead {
  id: string;
  branchId: string;
  name: string;
  phone: string;
  email?: string;
  source?: string;
  interest?: string;
  status?: LeadStatus;
  nextFollowUpAt?: string;
  notes?: string;
  staffId?: string;
  assignedStaffName?: string;
  createdAt: string;
  convertedCustomerId?: string;
}

export interface Policy {
  id: string;
  branchId: string;
  policyNumber: string; // e.g. POL-9021
  customerId: string;
  customerName?: string;
  customerNumber?: string;
  insurer: string; // e.g. Allianz Global, Travelers, Prudential Mutual
  product: string; // e.g. Comprehensive Auto, Commercial Property
  policyType: 'Individual' | 'Commercial' | 'Group';
  premium: number; // e.g. 1850.00
  startDate: string;
  expiryDate: string;
  status: PolicyStatus;
  staffId?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Renewal {
  id: string;
  branchId: string;
  policyId: string;
  policyNumber?: string;
  customerId: string;
  customerName?: string;
  expiryDate: string;
  dueDate: string;
  status: 'PENDING' | 'RENEWED' | 'LAPSED';
  previousPremium: number;
  renewalPremium: number;
  notes?: string;
  updatedAt?: string;
}

export interface Claim {
  id: string;
  branchId: string;
  claimNumber: string; // e.g. CLM-2024-881
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  policyId?: string;
  policyNumber?: string;
  policyProduct?: string;
  claimDate: string;
  status: ClaimStatus;
  amount: number;
  deductibleMet?: boolean;
  deductibleAmount?: number;
  adjudicationTier?: string;
  adjusterName?: string;
  notes?: string;
  auditHistory?: Array<{
    title: string;
    timestamp: string;
    description: string;
    icon?: string;
  }>;
  createdAt: string;
  updatedAt?: string;
}

export interface FollowUp {
  id: string;
  branchId: string;
  title: string;
  dueAt: string;
  customerId?: string;
  customerName?: string;
  leadId?: string;
  leadName?: string;
  staffId?: string;
  staffName?: string;
  status: FollowUpStatus;
  notes?: string;
  completedAt?: string;
  createdAt: string;
}

export interface CrmDocument {
  id: string;
  branchId: string;
  name: string;
  type: string; // e.g. Policy Schedule, Incident Photo, ID Proof
  fileUrl: string;
  size: number;
  mimeType: string;
  customerId?: string;
  customerName?: string;
  policyId?: string;
  claimId?: string;
  uploadedAt: string;
}

export interface Activity {
  id: string;
  branchId: string;
  type: 'POLICY_RENEWED' | 'CLAIM_SUBMITTED' | 'LEAD_CONVERTED' | 'FOLLOWUP_COMPLETED' | 'BRANCH_SYNC' | 'POLICY_CREATED';
  title: string;
  description: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  entityType?: string;
  entityId?: string;
}

export interface Commission {
  id: string;
  branchId: string;
  amount: number;
  policyId?: string;
  policyNumber?: string;
  customerId?: string;
  customerName?: string;
  status: CommissionStatus;
  earnedAt?: string;
  paidAt?: string;
  createdAt: string;
}

export interface DashboardData {
  metrics: {
    totalCustomers: { value: number; changePct: number; period: string };
    activePolicies: { value: number; retentionRate: number };
    openClaims: { value: number; urgentCount: number };
    upcomingRenewals: { value: number; timeframeDays: number };
  };
  policyDistribution: {
    active: number;
    expired: number;
    cancelled: number;
    total: number;
    segments: Array<{
      category: string;
      count: number;
      percentage: number;
      volume: string;
      color: string;
    }>;
    grossWrittenPremiumYtd: string;
  };
  recentActivities: Activity[];
}

export interface ReportSummary {
  period: string;
  grossWrittenPremium: number;
  activePoliciesCount: number;
  claimsCount: number;
  claimPayoutTotal: number;
  conversionRate: number;
  lapseRate: number;
  branchesPerformance: Array<{
    branchName: string;
    code: string;
    activePolicies: number;
    gwp: number;
    claims: number;
  }>;
}
