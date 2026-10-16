import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import multer from 'multer';
import crypto from 'crypto';
import {
  Branch,
  Staff,
  Customer,
  Lead,
  Policy,
  Renewal,
  Claim,
  FollowUp,
  Activity,
  Commission,
} from './src/types/crm';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory file storage for documents
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// Seed data store
const branches: Branch[] = [
  {
    id: 'br_metro_central_04',
    name: 'Metro Central Branch',
    code: 'BR-NYC-01',
    region: 'Eastern District Headquarters',
    territory: 'Northeast Division (NYC)',
    managerUsername: 'metro_admin',
    managerPassword: 'password',
    phone: '(212) 555-0198',
    email: 'metro@unitedins.com',
    address: '450 Lexington Ave, New York, NY',
    active: true,
    staffCount: 24,
    regionalVolume: '$18.4M',
    createdAt: '2023-01-15T09:00:00Z',
  },
  {
    id: 'br_chicago_04',
    name: 'Chicago Loop Branch',
    code: 'BR-CHI-04',
    region: 'Midwest Regional Office',
    territory: 'Midwest Division (CHI)',
    managerUsername: 'chicago_admin',
    managerPassword: 'password',
    phone: '(312) 555-0142',
    email: 'chicago@unitedins.com',
    address: '200 S Michigan Ave, Chicago, IL',
    active: true,
    staffCount: 18,
    regionalVolume: '$11.2M',
    createdAt: '2023-03-20T09:00:00Z',
  },
  {
    id: 'br_sfo_07',
    name: 'West Coast Hub',
    code: 'BR-SFO-07',
    region: 'Pacific Commercial Division',
    territory: 'Pacific Division (SFO)',
    managerUsername: 'sfo_admin',
    managerPassword: 'password',
    phone: '(415) 555-0177',
    email: 'sfo@unitedins.com',
    address: '555 California St, San Francisco, CA',
    active: true,
    staffCount: 15,
    regionalVolume: '$9.6M',
    createdAt: '2023-06-10T09:00:00Z',
  },
  {
    id: 'br_dal_02',
    name: 'Dallas North Branch',
    code: 'BR-DAL-02',
    region: 'South Central Operations',
    territory: 'Southwest Division (DAL)',
    managerUsername: 'dallas_admin',
    managerPassword: 'password',
    phone: '(214) 555-0133',
    email: 'dallas@unitedins.com',
    address: '1717 McKinney Ave, Dallas, TX',
    active: true,
    staffCount: 12,
    regionalVolume: '$3.6M',
    createdAt: '2023-09-01T09:00:00Z',
  },
];

const staffList: Staff[] = [
  {
    id: 'stf_01',
    branchId: 'br_metro_central_04',
    name: 'Julian Thorne',
    phone: '+1 (212) 555-0199',
    email: 'julian.thorne@unitedins.com',
    designation: 'Lead Field Adjuster - Property & Marine',
    status: 'ACTIVE',
    joiningDate: '2021-04-12',
    createdAt: '2021-04-12T00:00:00Z',
  },
  {
    id: 'stf_02',
    branchId: 'br_metro_central_04',
    name: 'Elena Cruz',
    phone: '+1 (212) 555-0245',
    email: 'elena.cruz@unitedins.com',
    designation: 'Claims Specialist - Auto Collision',
    status: 'ACTIVE',
    joiningDate: '2022-02-15',
    createdAt: '2022-02-15T00:00:00Z',
  },
  {
    id: 'stf_03',
    branchId: 'br_metro_central_04',
    name: 'Marcus Sterling',
    phone: '+1 (212) 555-0310',
    email: 'marcus.sterling@unitedins.com',
    designation: 'Senior Underwriter',
    status: 'ACTIVE',
    joiningDate: '2020-08-01',
    createdAt: '2020-08-01T00:00:00Z',
  },
  {
    id: 'stf_04',
    branchId: 'br_metro_central_04',
    name: 'Eleanor Vance',
    phone: '+1 (212) 555-0100',
    email: 'eleanor.vance@unitedins.com',
    designation: 'Branch Director / Admin',
    status: 'ACTIVE',
    joiningDate: '2019-01-10',
    createdAt: '2019-01-10T00:00:00Z',
  },
];

const customers: Customer[] = [
  {
    id: 'cust_88120',
    branchId: 'br_metro_central_04',
    customerNumber: 'CUST-88120',
    name: 'Katherine Miller',
    phone: '+1 (212) 555-8812',
    email: 'kmiller@millertech.com',
    dob: '1985-06-14',
    gender: 'FEMALE',
    address: '742 Park Ave, New York, NY 10021',
    status: 'ACTIVE',
    staffId: 'stf_03',
    assignedStaffName: 'Marcus Sterling',
    createdAt: '2023-01-10T10:00:00Z',
  },
  {
    id: 'cust_77401',
    branchId: 'br_metro_central_04',
    customerNumber: 'CUST-77401',
    name: 'Robert Henderson',
    phone: '+1 (212) 555-7740',
    email: 'r.henderson@hendersoncorp.com',
    dob: '1978-11-22',
    gender: 'MALE',
    address: '120 Broadway, Suite 1400, New York, NY 10271',
    status: 'ACTIVE',
    staffId: 'stf_03',
    assignedStaffName: 'Marcus Sterling',
    createdAt: '2023-01-12T11:00:00Z',
  },
  {
    id: 'cust_31092',
    branchId: 'br_metro_central_04',
    customerNumber: 'CUST-31092',
    name: 'David Chen',
    phone: '+1 (415) 555-3109',
    email: 'david.chen@chenadvisors.io',
    dob: '1990-03-05',
    gender: 'MALE',
    address: '88 Market St, San Francisco, CA 94105',
    status: 'ACTIVE',
    staffId: 'stf_01',
    assignedStaffName: 'Julian Thorne',
    createdAt: '2021-02-28T09:00:00Z',
  },
  {
    id: 'cust_19400',
    branchId: 'br_metro_central_04',
    customerNumber: 'CUST-19400',
    name: 'Apex Logistics Inc',
    phone: '+1 (718) 555-9340',
    email: 'fleet@apexlogistics.com',
    address: '400 Terminal Way, Elizabeth, NJ 07201',
    status: 'ACTIVE',
    staffId: 'stf_03',
    assignedStaffName: 'Marcus Sterling',
    createdAt: '2022-08-15T14:30:00Z',
  },
  {
    id: 'cust_61502',
    branchId: 'br_metro_central_04',
    customerNumber: 'CUST-61502',
    name: 'Sophia Martinez',
    phone: '+1 (305) 555-6150',
    email: 'smartinez@miamidesign.com',
    dob: '1993-09-18',
    gender: 'FEMALE',
    address: '1100 Brickell Bay Dr, Miami, FL 33131',
    status: 'ACTIVE',
    staffId: 'stf_02',
    assignedStaffName: 'Elena Cruz',
    createdAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'cust_90112',
    branchId: 'br_metro_central_04',
    customerNumber: 'CUST-90112',
    name: 'Vanguard Tech Group',
    phone: '+1 (212) 555-9011',
    email: 'admin@vanguardtech.dev',
    address: '350 5th Ave, 59th Floor, New York, NY 10118',
    status: 'ACTIVE',
    staffId: 'stf_03',
    assignedStaffName: 'Marcus Sterling',
    createdAt: '2023-11-01T15:00:00Z',
  },
  {
    id: 'cust_44189',
    branchId: 'br_metro_central_04',
    customerNumber: 'CUST-44189',
    name: 'Ethan Bradley',
    phone: '+1 (203) 555-4418',
    email: 'ebradley@bradleycapital.com',
    dob: '1982-12-04',
    gender: 'MALE',
    address: '55 Old Post Rd, Greenwich, CT 06830',
    status: 'ACTIVE',
    staffId: 'stf_01',
    assignedStaffName: 'Julian Thorne',
    createdAt: '2023-05-10T12:00:00Z',
  },
  {
    id: 'cust_80211',
    branchId: 'br_metro_central_04',
    customerNumber: 'CUST-80211',
    name: 'Global Logistics LLC',
    phone: '+1 (312) 555-8021',
    email: 'operations@globallogistics.us',
    address: '333 W Wacker Dr, Chicago, IL 60606',
    status: 'ACTIVE',
    staffId: 'stf_03',
    assignedStaffName: 'Marcus Sterling',
    createdAt: '2023-11-25T11:00:00Z',
  },
  {
    id: 'cust_10492',
    branchId: 'br_metro_central_04',
    customerNumber: 'CUST-10492',
    name: 'Marcus Sterling',
    phone: '+1 (212) 555-1049',
    email: 'marcus.personal@sterling.me',
    dob: '1987-04-19',
    gender: 'MALE',
    address: '15 Central Park West, New York, NY 10023',
    status: 'ACTIVE',
    staffId: 'stf_02',
    assignedStaffName: 'Elena Cruz',
    createdAt: '2023-06-01T10:00:00Z',
  },
  {
    id: 'cust_39912',
    branchId: 'br_metro_central_04',
    customerNumber: 'CUST-39912',
    name: 'Clara Washington',
    phone: '+1 (202) 555-3991',
    email: 'clara.wash@dclegal.org',
    dob: '1989-08-30',
    gender: 'FEMALE',
    address: '1600 K Street NW, Washington, DC 20006',
    status: 'ACTIVE',
    staffId: 'stf_01',
    assignedStaffName: 'Julian Thorne',
    createdAt: '2023-08-10T13:00:00Z',
  },
  {
    id: 'cust_0194',
    branchId: 'br_metro_central_04',
    customerNumber: 'CUST-0194',
    name: 'Sarah Jenkins',
    phone: '+1 (212) 555-0194',
    email: 'sarah.jenkins@brooklynart.org',
    dob: '1991-01-15',
    gender: 'FEMALE',
    address: '200 Dumbo Water St, Brooklyn, NY 11201',
    status: 'ACTIVE',
    staffId: 'stf_02',
    assignedStaffName: 'Elena Cruz',
    createdAt: '2023-10-01T10:00:00Z',
  },
];

const policies: Policy[] = [
  {
    id: 'pol_9021',
    branchId: 'br_metro_central_04',
    policyNumber: 'POL-9021',
    customerId: 'cust_88120',
    customerName: 'Katherine Miller',
    customerNumber: 'CUST-88120',
    insurer: 'Allianz Global',
    product: 'Comprehensive Auto',
    policyType: 'Individual',
    premium: 1850.0,
    startDate: '2023-10-12',
    expiryDate: '2024-10-11',
    status: 'ACTIVE',
    createdAt: '2023-10-12T00:00:00Z',
  },
  {
    id: 'pol_8842',
    branchId: 'br_metro_central_04',
    policyNumber: 'POL-8842',
    customerId: 'cust_77401',
    customerName: 'Robert Henderson',
    customerNumber: 'CUST-77401',
    insurer: 'Travelers',
    product: 'Commercial Property',
    policyType: 'Commercial',
    premium: 6420.0,
    startDate: '2023-01-15',
    expiryDate: '2025-01-14',
    status: 'ACTIVE',
    createdAt: '2023-01-15T00:00:00Z',
  },
  {
    id: 'pol_7731',
    branchId: 'br_metro_central_04',
    policyNumber: 'POL-7731',
    customerId: 'cust_31092',
    customerName: 'David Chen',
    customerNumber: 'CUST-31092',
    insurer: 'Prudential Mutual',
    product: 'Term Life 30Y',
    policyType: 'Individual',
    premium: 980.0,
    startDate: '2021-03-04',
    expiryDate: '2051-03-03',
    status: 'ACTIVE',
    createdAt: '2021-03-04T00:00:00Z',
  },
  {
    id: 'pol_6619',
    branchId: 'br_metro_central_04',
    policyNumber: 'POL-6619',
    customerId: 'cust_19400',
    customerName: 'Apex Logistics Inc',
    customerNumber: 'CUST-19400',
    insurer: 'Liberty Mutual',
    product: 'Inland Marine Cargo',
    policyType: 'Commercial',
    premium: 4150.0,
    startDate: '2022-09-01',
    expiryDate: '2023-08-31',
    status: 'EXPIRED',
    createdAt: '2022-09-01T00:00:00Z',
  },
  {
    id: 'pol_5502',
    branchId: 'br_metro_central_04',
    policyNumber: 'POL-5502',
    customerId: 'cust_61502',
    customerName: 'Sophia Martinez',
    customerNumber: 'CUST-61502',
    insurer: 'United Underwriters',
    product: 'Health HMO Plus',
    policyType: 'Individual',
    premium: 540.0,
    startDate: '2024-02-01',
    expiryDate: '2024-05-12',
    status: 'CANCELLED',
    createdAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 'pol_4890',
    branchId: 'br_metro_central_04',
    policyNumber: 'POL-4890',
    customerId: 'cust_90112',
    customerName: 'Vanguard Tech Group',
    customerNumber: 'CUST-90112',
    insurer: 'Allianz Global',
    product: 'Cyber Liability Umbrella',
    policyType: 'Group',
    premium: 12500.0,
    startDate: '2023-11-10',
    expiryDate: '2024-11-09',
    status: 'ACTIVE',
    createdAt: '2023-11-10T00:00:00Z',
  },
  {
    id: 'pol_4100',
    branchId: 'br_metro_central_04',
    policyNumber: 'POL-4100',
    customerId: 'cust_44189',
    customerName: 'Ethan Bradley',
    customerNumber: 'CUST-44189',
    insurer: 'Travelers',
    product: 'Homeowners HO-3',
    policyType: 'Individual',
    premium: 1420.0,
    startDate: '2023-05-20',
    expiryDate: '2024-05-19',
    status: 'ACTIVE',
    createdAt: '2023-05-20T00:00:00Z',
  },
  {
    id: 'pol_3951',
    branchId: 'br_metro_central_04',
    policyNumber: 'POL-3951',
    customerId: 'cust_80211',
    customerName: 'Global Logistics LLC',
    customerNumber: 'CUST-80211',
    insurer: 'Prudential Mutual',
    product: 'Workers Compensation',
    policyType: 'Commercial',
    premium: 8900.0,
    startDate: '2023-12-01',
    expiryDate: '2024-11-30',
    status: 'ACTIVE',
    createdAt: '2023-12-01T00:00:00Z',
  },
  {
    id: 'pol_2980',
    branchId: 'br_metro_central_04',
    policyNumber: 'POL-2980',
    customerId: 'cust_10492',
    customerName: 'Marcus Sterling',
    customerNumber: 'CUST-10492',
    insurer: 'United Underwriters',
    product: 'Motor Comprehensive',
    policyType: 'Individual',
    premium: 2110.0,
    startDate: '2023-06-10',
    expiryDate: '2024-06-09',
    status: 'ACTIVE',
    createdAt: '2023-06-10T00:00:00Z',
  },
  {
    id: 'pol_1120',
    branchId: 'br_metro_central_04',
    policyNumber: 'POL-1120',
    customerId: 'cust_39912',
    customerName: 'Clara Washington',
    customerNumber: 'CUST-39912',
    insurer: 'Liberty Mutual',
    product: 'Condo Unit (HO-6)',
    policyType: 'Individual',
    premium: 860.0,
    startDate: '2023-08-19',
    expiryDate: '2024-08-18',
    status: 'ACTIVE',
    createdAt: '2023-08-19T00:00:00Z',
  },
];

const claims: Claim[] = [
  {
    id: 'clm_881',
    branchId: 'br_metro_central_04',
    claimNumber: 'CLM-2024-881',
    customerId: 'cust_0194',
    customerName: 'Sarah Jenkins',
    customerPhone: '+1 (212) 555-0194',
    policyId: 'pol_8842',
    policyNumber: 'POL-8942',
    policyProduct: 'Comprehensive Auto',
    claimDate: '2024-11-04',
    status: 'APPROVED',
    amount: 3200.0,
    deductibleMet: true,
    deductibleAmount: 500.0,
    adjudicationTier: 'Tier 1 FastTrack',
    adjusterName: 'Julian Thorne',
    notes: 'Parts breakdown uploaded ($2,450 parts, $750 labor). Estimate in range with authorized repair network.',
    auditHistory: [
      {
        title: 'Incident Report Logged via App',
        timestamp: 'Nov 04, 2024 - 09:14 AM',
        description: 'Police incident #NY-4891 filed. 2-vehicle rear collision in wet roadway conditions.',
      },
      {
        title: 'Independent Estimator Appraisal',
        timestamp: 'Nov 05, 2024 - 14:22 PM',
        description: 'Parts breakdown verified with authorized repair network.',
      },
    ],
    createdAt: '2024-11-04T09:14:00Z',
  },
  {
    id: 'clm_879',
    branchId: 'br_metro_central_04',
    claimNumber: 'CLM-2024-879',
    customerId: 'cust_44189',
    customerName: 'Marcus Vance',
    customerPhone: '+1 (312) 555-0812',
    policyId: 'pol_4100',
    policyNumber: 'POL-7104',
    policyProduct: 'Homeowner Hazard',
    claimDate: '2024-11-03',
    status: 'UNDER_REVIEW',
    amount: 14850.0,
    deductibleMet: true,
    deductibleAmount: 1000.0,
    adjudicationTier: 'Tier 2 Structural Loss',
    adjusterName: 'Julian Thorne',
    notes: 'Water pipe rupture on second floor causing ceiling drywall saturation.',
    createdAt: '2024-11-03T11:00:00Z',
  },
  {
    id: 'clm_875',
    branchId: 'br_metro_central_04',
    claimNumber: 'CLM-2024-875',
    customerId: 'cust_19400',
    customerName: 'Apex Logistics Group',
    customerPhone: '+1 (718) 555-9340',
    policyId: 'pol_6619',
    policyNumber: 'POL-4419',
    policyProduct: 'Commercial Fleet Inland',
    claimDate: '2024-11-02',
    status: 'REPORTED',
    amount: 6700.0,
    deductibleMet: false,
    adjusterName: 'Elena Cruz',
    notes: 'Cargo trailer side-swipe in warehouse loading dock.',
    createdAt: '2024-11-02T16:20:00Z',
  },
  {
    id: 'clm_862',
    branchId: 'br_metro_central_04',
    claimNumber: 'CLM-2024-862',
    customerId: 'cust_31092',
    customerName: 'David Henderson',
    customerPhone: '+1 (415) 555-4421',
    policyId: 'pol_7731',
    policyNumber: 'POL-9102',
    policyProduct: 'Comprehensive Auto',
    claimDate: '2024-10-28',
    status: 'SETTLED',
    amount: 2150.0,
    deductibleMet: true,
    adjusterName: 'Elena Cruz',
    notes: 'Windshield stone damage and hood scratch. Direct electronic disbursement cleared.',
    createdAt: '2024-10-28T14:00:00Z',
  },
  {
    id: 'clm_854',
    branchId: 'br_metro_central_04',
    claimNumber: 'CLM-2024-854',
    customerId: 'cust_61502',
    customerName: 'Rachel Sterling',
    customerPhone: '+1 (617) 555-7798',
    policyId: 'pol_5502',
    policyNumber: 'POL-3321',
    policyProduct: 'Dwelling Structural Loss',
    claimDate: '2024-10-26',
    status: 'REJECTED',
    amount: 11400.0,
    deductibleMet: false,
    adjusterName: 'Julian Thorne',
    notes: 'Excluded peril: Gradual wear and termite foundation deterioration without acute casualty event.',
    createdAt: '2024-10-26T10:15:00Z',
  },
  {
    id: 'clm_849',
    branchId: 'br_metro_central_04',
    claimNumber: 'CLM-2024-849',
    customerId: 'cust_88120',
    customerName: 'Nathan Prescott',
    customerPhone: '+1 (305) 555-8123',
    policyId: 'pol_9021',
    policyNumber: 'POL-1088',
    policyProduct: 'Marine Yacht & Vessel',
    claimDate: '2024-10-25',
    status: 'APPROVED',
    amount: 5400.0,
    deductibleMet: true,
    adjusterName: 'Julian Thorne',
    notes: 'Dock piling collision during gust winds. Marine surveyor survey approved.',
    createdAt: '2024-10-25T13:40:00Z',
  },
  {
    id: 'clm_841',
    branchId: 'br_metro_central_04',
    claimNumber: 'CLM-2024-841',
    customerId: 'cust_90112',
    customerName: 'Horizon MedTech',
    customerPhone: '+1 (206) 555-1102',
    policyId: 'pol_4890',
    policyNumber: 'POL-6612',
    policyProduct: 'Commercial Equipment Risk',
    claimDate: '2024-10-22',
    status: 'UNDER_REVIEW',
    amount: 28000.0,
    deductibleMet: true,
    adjusterName: 'Julian Thorne',
    notes: 'Cleanroom power surge causing diagnostic laser circuitry overload.',
    createdAt: '2024-10-22T08:30:00Z',
  },
];

const leads: Lead[] = [
  {
    id: 'ld_01',
    branchId: 'br_metro_central_04',
    name: 'David Rodriguez',
    phone: '+1 (212) 555-4890',
    email: 'drodriguez@metroconsult.com',
    source: 'Website Referral',
    interest: 'Commercial Liability & Cyber',
    status: 'CONVERTED',
    nextFollowUpAt: '2024-11-15T10:00:00Z',
    notes: 'Looking for $5M aggregate coverage for tech consulting firm.',
    staffId: 'stf_03',
    assignedStaffName: 'Marcus Sterling',
    createdAt: '2024-10-01T10:00:00Z',
  },
  {
    id: 'ld_02',
    branchId: 'br_metro_central_04',
    name: 'Amanda Thorne',
    phone: '+1 (203) 555-1122',
    email: 'athorne@luxuryproperties.net',
    source: 'Broker Inbound',
    interest: 'High-Value Homeowners HO-5',
    status: 'QUALIFIED',
    nextFollowUpAt: '2024-11-20T14:00:00Z',
    notes: 'Coastal property appraisal underway ($3.2M dwelling value).',
    staffId: 'stf_01',
    assignedStaffName: 'Julian Thorne',
    createdAt: '2024-10-15T11:00:00Z',
  },
  {
    id: 'ld_03',
    branchId: 'br_metro_central_04',
    name: 'Sterling BioLabs Corp',
    phone: '+1 (617) 555-9080',
    email: 'procurement@sterlingbiolabs.com',
    source: 'Trade Conference',
    interest: 'Clinical Trials & Product Liability',
    status: 'CONTACTED',
    nextFollowUpAt: '2024-11-18T16:00:00Z',
    notes: 'Phase 2 trial starting Q1 2025. Requested underwriter spec packet.',
    staffId: 'stf_03',
    assignedStaffName: 'Marcus Sterling',
    createdAt: '2024-10-20T09:30:00Z',
  },
  {
    id: 'ld_04',
    branchId: 'br_metro_central_04',
    name: 'Apex Freightways East',
    phone: '+1 (718) 555-2244',
    email: 'ops@apexeast.com',
    source: 'Direct Inbound',
    interest: 'Commercial Auto Fleet (24 Units)',
    status: 'NEW',
    nextFollowUpAt: '2024-11-14T11:00:00Z',
    notes: 'Seeking replacement for existing Travelers carrier expiring in 60 days.',
    staffId: 'stf_02',
    assignedStaffName: 'Elena Cruz',
    createdAt: '2024-11-01T08:00:00Z',
  },
];

const renewals: Renewal[] = [
  {
    id: 'rnw_01',
    branchId: 'br_metro_central_04',
    policyId: 'pol_9021',
    policyNumber: 'POL-9021',
    customerId: 'cust_88120',
    customerName: 'Katherine Miller',
    expiryDate: '2024-10-11',
    dueDate: '2024-10-01',
    status: 'PENDING',
    previousPremium: 1850.0,
    renewalPremium: 1940.0,
    notes: '14 days remaining before expiration window.',
  },
  {
    id: 'rnw_02',
    branchId: 'br_metro_central_04',
    policyId: 'pol_1120',
    policyNumber: 'POL-1120',
    customerId: 'cust_39912',
    customerName: 'Clara Washington',
    expiryDate: '2024-08-18',
    dueDate: '2024-08-01',
    status: 'PENDING',
    previousPremium: 860.0,
    renewalPremium: 890.0,
    notes: '28 days remaining before expiration window.',
  },
  {
    id: 'rnw_03',
    branchId: 'br_metro_central_04',
    policyId: 'pol_4890',
    policyNumber: 'POL-4890',
    customerId: 'cust_90112',
    customerName: 'Vanguard Tech Group',
    expiryDate: '2024-11-09',
    dueDate: '2024-10-25',
    status: 'RENEWED',
    previousPremium: 12500.0,
    renewalPremium: 13200.0,
    notes: 'Endorsement added for cloud breach extension.',
  },
];

const followUps: FollowUp[] = [
  {
    id: 'flw_01',
    branchId: 'br_metro_central_04',
    title: 'Call renewal discussion with Horizon Logistics',
    dueAt: '2024-11-12T14:00:00Z',
    customerId: 'cust_80211',
    customerName: 'Global Logistics LLC',
    staffId: 'stf_03',
    staffName: 'Marcus Sterling',
    status: 'COMPLETED',
    notes: 'Agreed on 5% fleet premium deductible increase.',
    completedAt: '2024-11-10T15:30:00Z',
    createdAt: '2024-11-05T10:00:00Z',
  },
  {
    id: 'flw_02',
    branchId: 'br_metro_central_04',
    title: 'Review police incident report for claim CLM-2024-881',
    dueAt: '2024-11-14T10:00:00Z',
    customerId: 'cust_0194',
    customerName: 'Sarah Jenkins',
    staffId: 'stf_01',
    staffName: 'Julian Thorne',
    status: 'PENDING',
    notes: 'Confirm other party insurance carrier liability waiver.',
    createdAt: '2024-11-04T12:00:00Z',
  },
  {
    id: 'flw_03',
    branchId: 'br_metro_central_04',
    title: 'Send quote binder to Sterling BioLabs Corp',
    dueAt: '2024-11-18T16:00:00Z',
    leadId: 'ld_03',
    leadName: 'Sterling BioLabs Corp',
    staffId: 'stf_03',
    staffName: 'Marcus Sterling',
    status: 'PENDING',
    notes: 'Underwriting team cleared clinical trial liability clause.',
    createdAt: '2024-11-08T09:00:00Z',
  },
];

const activities: Activity[] = [
  {
    id: 'act_01',
    branchId: 'br_metro_central_04',
    type: 'POLICY_RENEWED',
    title: 'Policy #POL-8942 renewed',
    description: 'By Marcus Sterling for Sarah Jenkins ($1,450/yr Auto)',
    timestamp: '12m ago',
    userId: 'usr_eleanor_vance',
    userName: 'Marcus Sterling',
    entityType: 'POLICY',
    entityId: 'pol_8842',
  },
  {
    id: 'act_02',
    branchId: 'br_metro_central_04',
    type: 'CLAIM_SUBMITTED',
    title: 'Claim #CLM-2041 submitted',
    description: '$3,200 (Vehicle collision) under review by Claims Dept',
    timestamp: '45m ago',
    userId: 'usr_eleanor_vance',
    userName: 'Elena Cruz',
    entityType: 'CLAIM',
    entityId: 'clm_881',
  },
  {
    id: 'act_03',
    branchId: 'br_metro_central_04',
    type: 'LEAD_CONVERTED',
    title: 'New qualified lead converted',
    description: 'David Rodriguez (Commercial Liability)',
    timestamp: '2h ago',
    userId: 'usr_eleanor_vance',
    userName: 'Marcus Sterling',
    entityType: 'LEAD',
    entityId: 'ld_01',
  },
  {
    id: 'act_04',
    branchId: 'br_metro_central_04',
    type: 'FOLLOWUP_COMPLETED',
    title: 'Follow-up completed',
    description: 'Call renewal discussion with Horizon Logistics',
    timestamp: '4h ago',
    userId: 'usr_eleanor_vance',
    userName: 'Marcus Sterling',
    entityType: 'FOLLOWUP',
    entityId: 'flw_01',
  },
  {
    id: 'act_05',
    branchId: 'br_metro_central_04',
    type: 'BRANCH_SYNC',
    title: 'Branch Audit sync completed',
    description: 'Executed by Admin (Metro Central #04 compliance checks)',
    timestamp: '6h ago',
    userId: 'usr_eleanor_vance',
    userName: 'Eleanor Vance',
    entityType: 'BRANCH',
    entityId: 'br_metro_central_04',
  },
];

const commissions: Commission[] = [
  {
    id: 'com_01',
    branchId: 'br_metro_central_04',
    amount: 925.0,
    policyId: 'pol_4890',
    policyNumber: 'POL-4890',
    customerId: 'cust_90112',
    customerName: 'Vanguard Tech Group',
    status: 'PAID',
    earnedAt: '2023-11-10T00:00:00Z',
    paidAt: '2023-11-30T00:00:00Z',
    createdAt: '2023-11-10T00:00:00Z',
  },
  {
    id: 'com_02',
    branchId: 'br_metro_central_04',
    amount: 480.0,
    policyId: 'pol_8842',
    policyNumber: 'POL-8842',
    customerId: 'cust_77401',
    customerName: 'Robert Henderson',
    status: 'PAID',
    earnedAt: '2023-01-15T00:00:00Z',
    paidAt: '2023-01-31T00:00:00Z',
    createdAt: '2023-01-15T00:00:00Z',
  },
  {
    id: 'com_03',
    branchId: 'br_metro_central_04',
    amount: 145.0,
    policyId: 'pol_9021',
    policyNumber: 'POL-9021',
    customerId: 'cust_88120',
    customerName: 'Katherine Miller',
    status: 'PENDING',
    earnedAt: '2023-10-12T00:00:00Z',
    createdAt: '2023-10-12T00:00:00Z',
  },
];

const documents: Array<{
  id: string;
  branchId: string;
  name: string;
  type: string;
  fileUrl: string;
  size: number;
  mimeType: string;
  customerId?: string;
  policyId?: string;
  claimId?: string;
  buffer?: Buffer;
  uploadedAt: string;
}> = [
  {
    id: 'doc_01',
    branchId: 'br_metro_central_04',
    name: 'Allianz_Policy_Schedule_POL-9021.pdf',
    type: 'Policy Schedule',
    fileUrl: '/api/documents/doc_01/content',
    size: 420000,
    mimeType: 'application/pdf',
    customerId: 'cust_88120',
    policyId: 'pol_9021',
    uploadedAt: '2023-10-12T10:00:00Z',
  },
  {
    id: 'doc_02',
    branchId: 'br_metro_central_04',
    name: 'Police_Report_NY4891_CLM-881.pdf',
    type: 'Incident Report',
    fileUrl: '/api/documents/doc_02/content',
    size: 850000,
    mimeType: 'application/pdf',
    customerId: 'cust_0194',
    claimId: 'clm_881',
    uploadedAt: '2024-11-04T10:30:00Z',
  },
  {
    id: 'doc_03',
    branchId: 'br_metro_central_04',
    name: 'Repair_Shop_Estimate_CLM-881.png',
    type: 'Appraisal Photos',
    fileUrl: '/api/documents/doc_03/content',
    size: 1240000,
    mimeType: 'image/png',
    customerId: 'cust_0194',
    claimId: 'clm_881',
    uploadedAt: '2024-11-05T14:00:00Z',
  },
];

// Helper: Pagination Wrapper
function paginate<T>(items: T[], page: number, limit: number) {
  const pageNum = Math.max(1, page || 1);
  const limitNum = Math.max(1, limit || 10);
  const total = items.length;
  const totalPages = Math.ceil(total / limitNum) || 1;
  const startIndex = (pageNum - 1) * limitNum;
  const data = items.slice(startIndex, startIndex + limitNum);

  return {
    data,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
    },
    syncTimestamp: new Date().toISOString(),
    latencyMs: Math.floor(Math.random() * 20) + 15,
  };
}

// Authentication middleware check (permissive mock that extracts Bearer token or allows preview access)
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    // If not supplied, allow access in demo mode as Eleanor Vance (Admin)
    req.user = {
      id: 'usr_eleanor_vance',
      name: 'Eleanor Vance',
      role: 'ADMIN',
      branchId: 'br_metro_central_04',
      branchName: 'Metro Central Branch #04',
    };
    return next();
  }
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (token === 'admin_token' || token.includes('admin')) {
    req.user = {
      id: 'usr_admin',
      name: 'Eleanor Vance',
      role: 'ADMIN',
      branchId: 'br_metro_central_04',
      branchName: 'Metro Central Branch #04',
    };
  } else {
    req.user = {
      id: 'usr_branch_user',
      name: 'Metro Branch Lead',
      role: 'BRANCH',
      branchId: 'br_metro_central_04',
      branchName: 'Metro Central Branch #04',
    };
  }
  next();
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        role: 'ADMIN' | 'BRANCH';
        branchId?: string;
        branchName?: string;
      };
    }
  }
}

// ======================== API ROUTES ========================

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: 'production-enterprise',
  });
});

// Auth Endpoints
app.post('/api/auth/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'Email and password are required' });
  }
  // Allow admin login
  const token = 'jwt_admin_' + crypto.randomBytes(16).toString('hex');
  res.json({
    token,
    user: {
      id: 'usr_admin_eleanor',
      name: 'Eleanor Vance',
      email: email || 'admin@example.com',
      role: 'ADMIN',
      designation: 'Branch Director / Admin',
      branchId: 'br_metro_central_04',
      branchName: 'Metro Central Branch #04',
      avatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDaaCCDSetpUsgUpaY5QAD6PqqlhKNYNPNUjGth8p4MebIjj3zyLkI63THqiTSvbx1khgXZCAkZmTba78878ZsTsh1GLWblMtMdfYXv7PK3clipwRiL0pT4xoRWgU7483eJkdg3vK-Anw87ZIz0qAwpcWJPMHnzp38Ih8UCrl38lHWLe07YVhaOHqE_A95LQkgfD30WxMssorLfZHW7clStTJSdUTXsJCV0ieU0-jb10bUxYLByq71fmA',
    },
  });
});

app.post('/api/auth/branch/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'Username and password are required' });
  }
  const token = 'jwt_branch_' + crypto.randomBytes(16).toString('hex');
  res.json({
    token,
    user: {
      id: 'usr_branch_metro',
      name: 'Marcus Sterling',
      username: username || 'branch-username',
      role: 'BRANCH',
      designation: 'Senior Underwriter',
      branchId: 'br_metro_central_04',
      branchName: 'Metro Central Branch #04',
    },
  });
});

// Branches: POST /api/branches (Requires ADMIN)
app.post('/api/branches', requireAuth, (req: Request, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'Admin authorization required to provision branches' });
  }
  const { name, code, region, territory, username, phone, email, address, active } = req.body;
  if (!name || !code) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Branch name and branch code are required',
      fieldErrors: {
        name: !name ? 'Branch name is required' : '',
        code: !code ? 'Branch code is required' : '',
      },
    });
  }

  const newBranch = {
    id: `br_${code.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`,
    name,
    code,
    region: region || 'Regional Operations',
    territory: territory || 'Enterprise Division',
    managerUsername: username || `${code.toLowerCase()}_admin`,
    phone: phone || '(555) 000-0000',
    email: email || `${code.toLowerCase()}@unitedins.com`,
    address: address || 'Corporate Headquarters',
    active: active !== false,
    staffCount: 1,
    regionalVolume: '$0.00',
    createdAt: new Date().toISOString(),
  };

  branches.unshift(newBranch);
  res.status(201).json(newBranch);
});

// Staff Endpoints
app.get('/api/staff', requireAuth, (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string || '').toLowerCase();

  let filtered = staffList;
  if (search) {
    filtered = filtered.filter(
      (s) => s.name.toLowerCase().includes(search) || s.phone.includes(search) || s.email?.toLowerCase().includes(search)
    );
  }

  res.json(paginate(filtered, page, limit));
});

app.get('/api/staff/:id', requireAuth, (req: Request, res: Response) => {
  const item = staffList.find((s) => s.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'NOT_FOUND', message: 'Staff member not found' });
  res.json(item);
});

app.post('/api/staff', requireAuth, (req: Request, res: Response) => {
  const { name, phone, email, designation, status, joiningDate } = req.body;
  if (!name || !phone) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Name and phone are required',
      fieldErrors: {
        name: !name ? 'Staff name is required' : '',
        phone: !phone ? 'Phone number is required' : '',
      },
    });
  }

  const newStaff = {
    id: `stf_${Date.now()}`,
    branchId: req.user?.branchId || 'br_metro_central_04',
    name,
    phone,
    email,
    designation: designation || 'Insurance Specialist',
    status: status || 'ACTIVE',
    joiningDate: joiningDate || new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  };

  staffList.unshift(newStaff);
  res.status(201).json(newStaff);
});

app.patch('/api/staff/:id', requireAuth, (req: Request, res: Response) => {
  const index = staffList.findIndex((s) => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'NOT_FOUND', message: 'Staff member not found' });

  staffList[index] = { ...staffList[index], ...req.body, updatedAt: new Date().toISOString() };
  res.json(staffList[index]);
});

app.delete('/api/staff/:id', requireAuth, (req: Request, res: Response) => {
  const index = staffList.findIndex((s) => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'NOT_FOUND', message: 'Staff member not found' });

  staffList.splice(index, 1);
  res.json({ success: true, id: req.params.id });
});

// Customers Endpoints
app.get('/api/customers', requireAuth, (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string || '').toLowerCase();

  let filtered = customers;
  if (search) {
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.customerNumber.toLowerCase().includes(search) ||
        c.phone.includes(search) ||
        c.email?.toLowerCase().includes(search)
    );
  }

  res.json(paginate(filtered, page, limit));
});

app.get('/api/customers/:id', requireAuth, (req: Request, res: Response) => {
  const item = customers.find((c) => c.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'NOT_FOUND', message: 'Customer not found' });
  res.json(item);
});

app.post('/api/customers', requireAuth, (req: Request, res: Response) => {
  const { name, phone, email, dob, gender, address, notes, status, staffId } = req.body;
  if (!name || !phone) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Name and phone are required',
      fieldErrors: {
        name: !name ? 'Customer name is required' : '',
        phone: !phone ? 'Phone number is required' : '',
      },
    });
  }

  const newCustNum = `CUST-${Math.floor(10000 + Math.random() * 90000)}`;
  const staffMember = staffList.find((s) => s.id === staffId);

  const newCustomer = {
    id: `cust_${Date.now()}`,
    branchId: req.user?.branchId || 'br_metro_central_04',
    customerNumber: newCustNum,
    name,
    phone,
    email,
    dob,
    gender,
    address,
    notes,
    status: status || 'ACTIVE',
    staffId: staffId || 'stf_03',
    assignedStaffName: staffMember?.name || 'Marcus Sterling',
    createdAt: new Date().toISOString(),
  };

  customers.unshift(newCustomer);
  res.status(201).json(newCustomer);
});

app.patch('/api/customers/:id', requireAuth, (req: Request, res: Response) => {
  const index = customers.findIndex((c) => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'NOT_FOUND', message: 'Customer not found' });

  customers[index] = { ...customers[index], ...req.body, updatedAt: new Date().toISOString() };
  res.json(customers[index]);
});

app.delete('/api/customers/:id', requireAuth, (req: Request, res: Response) => {
  const index = customers.findIndex((c) => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'NOT_FOUND', message: 'Customer not found' });

  customers.splice(index, 1);
  res.json({ success: true, id: req.params.id });
});

// Leads Endpoints
app.get('/api/leads', requireAuth, (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string || '').toLowerCase();
  const status = req.query.status as string;

  let filtered = leads;
  if (status && status !== 'ALL') {
    filtered = filtered.filter((l) => l.status === status);
  }
  if (search) {
    filtered = filtered.filter(
      (l) => l.name.toLowerCase().includes(search) || l.phone.includes(search) || l.interest?.toLowerCase().includes(search)
    );
  }

  res.json(paginate(filtered, page, limit));
});

app.get('/api/leads/:id', requireAuth, (req: Request, res: Response) => {
  const item = leads.find((l) => l.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'NOT_FOUND', message: 'Lead not found' });
  res.json(item);
});

app.post('/api/leads', requireAuth, (req: Request, res: Response) => {
  const { name, phone, email, source, interest, status, nextFollowUpAt, notes, staffId } = req.body;
  if (!name || !phone) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Name and phone are required',
      fieldErrors: {
        name: !name ? 'Lead name is required' : '',
        phone: !phone ? 'Phone number is required' : '',
      },
    });
  }

  const staffMember = staffList.find((s) => s.id === staffId);
  const newLead = {
    id: `ld_${Date.now()}`,
    branchId: req.user?.branchId || 'br_metro_central_04',
    name,
    phone,
    email,
    source: source || 'Direct Inbound',
    interest: interest || 'General Coverage',
    status: status || 'NEW',
    nextFollowUpAt,
    notes,
    staffId: staffId || 'stf_03',
    assignedStaffName: staffMember?.name || 'Marcus Sterling',
    createdAt: new Date().toISOString(),
  };

  leads.unshift(newLead);
  res.status(201).json(newLead);
});

app.patch('/api/leads/:id', requireAuth, (req: Request, res: Response) => {
  const index = leads.findIndex((l) => l.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'NOT_FOUND', message: 'Lead not found' });

  leads[index] = { ...leads[index], ...req.body };
  res.json(leads[index]);
});

app.delete('/api/leads/:id', requireAuth, (req: Request, res: Response) => {
  const index = leads.findIndex((l) => l.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'NOT_FOUND', message: 'Lead not found' });

  leads.splice(index, 1);
  res.json({ success: true, id: req.params.id });
});

app.post('/api/leads/:id/convert', requireAuth, (req: Request, res: Response) => {
  const lead = leads.find((l) => l.id === req.params.id);
  if (!lead) return res.status(404).json({ error: 'NOT_FOUND', message: 'Lead not found' });

  lead.status = 'CONVERTED';
  const newCustomer = {
    id: `cust_${Date.now()}`,
    branchId: lead.branchId,
    customerNumber: `CUST-${Math.floor(10000 + Math.random() * 90000)}`,
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    status: 'ACTIVE' as const,
    staffId: lead.staffId,
    assignedStaffName: lead.assignedStaffName,
    notes: `Converted from lead (${lead.interest})`,
    createdAt: new Date().toISOString(),
  };

  customers.unshift(newCustomer);
  lead.convertedCustomerId = newCustomer.id;

  activities.unshift({
    id: `act_${Date.now()}`,
    branchId: lead.branchId,
    type: 'LEAD_CONVERTED',
    title: 'New qualified lead converted',
    description: `${lead.name} (${lead.interest})`,
    timestamp: 'Just now',
    userName: req.user?.name || 'Marcus Sterling',
    entityType: 'LEAD',
    entityId: lead.id,
  });

  res.json({ success: true, customer: newCustomer, lead });
});

// Policies Endpoints
app.get('/api/policies', requireAuth, (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string || '').toLowerCase();
  const status = req.query.status as string;
  const insurer = (req.query.insurer as string || '').toLowerCase();

  let filtered = policies;
  if (status && status !== 'ALL') {
    filtered = filtered.filter((p) => p.status === status);
  }
  if (insurer) {
    filtered = filtered.filter((p) => p.insurer.toLowerCase().includes(insurer));
  }
  if (search) {
    filtered = filtered.filter(
      (p) =>
        p.policyNumber.toLowerCase().includes(search) ||
        p.customerName?.toLowerCase().includes(search) ||
        p.insurer.toLowerCase().includes(search) ||
        p.product.toLowerCase().includes(search)
    );
  }

  res.json(paginate(filtered, page, limit));
});

app.get('/api/policies/:id', requireAuth, (req: Request, res: Response) => {
  const item = policies.find((p) => p.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'NOT_FOUND', message: 'Policy not found' });
  res.json(item);
});

app.post('/api/policies', requireAuth, (req: Request, res: Response) => {
  const { customerId, policyNumber, insurer, product, policyType, premium, startDate, expiryDate, status, notes } =
    req.body;

  if (!customerId || !policyNumber || !insurer || !product || !policyType || !premium || !startDate || !expiryDate) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'All policy fields are required',
      fieldErrors: {
        customerId: !customerId ? 'Customer selection is required' : '',
        policyNumber: !policyNumber ? 'Policy number is required' : '',
        insurer: !insurer ? 'Insurer name is required' : '',
        product: !product ? 'Product type is required' : '',
        policyType: !policyType ? 'Policy type is required' : '',
        premium: !premium ? 'Premium amount is required' : '',
        startDate: !startDate ? 'Start date is required' : '',
        expiryDate: !expiryDate ? 'Expiry date is required' : '',
      },
    });
  }

  const customer = customers.find((c) => c.id === customerId);

  const newPolicy = {
    id: `pol_${Date.now()}`,
    branchId: req.user?.branchId || 'br_metro_central_04',
    policyNumber,
    customerId,
    customerName: customer?.name || 'Insured Client',
    customerNumber: customer?.customerNumber || 'CUST-NEW',
    insurer,
    product,
    policyType,
    premium: Number(premium),
    startDate,
    expiryDate,
    status: (status as 'ACTIVE' | 'EXPIRED' | 'CANCELLED') || 'ACTIVE',
    notes,
    createdAt: new Date().toISOString(),
  };

  policies.unshift(newPolicy);

  // Policy creation automatically creates renewal and activity records according to API documentation
  renewals.unshift({
    id: `rnw_${Date.now()}`,
    branchId: newPolicy.branchId,
    policyId: newPolicy.id,
    policyNumber: newPolicy.policyNumber,
    customerId: newPolicy.customerId,
    customerName: newPolicy.customerName,
    expiryDate: newPolicy.expiryDate,
    dueDate: newPolicy.expiryDate,
    status: 'PENDING',
    previousPremium: newPolicy.premium,
    renewalPremium: Math.round(newPolicy.premium * 1.05),
    notes: 'Auto-generated renewal schedule upon policy creation.',
  });

  activities.unshift({
    id: `act_${Date.now()}`,
    branchId: newPolicy.branchId,
    type: 'POLICY_CREATED',
    title: `Policy #${newPolicy.policyNumber} created`,
    description: `Issued for ${newPolicy.customerName} (${newPolicy.product})`,
    timestamp: 'Just now',
    userName: req.user?.name || 'Eleanor Vance',
    entityType: 'POLICY',
    entityId: newPolicy.id,
  });

  res.status(201).json(newPolicy);
});

app.patch('/api/policies/:id', requireAuth, (req: Request, res: Response) => {
  const index = policies.findIndex((p) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'NOT_FOUND', message: 'Policy not found' });

  policies[index] = { ...policies[index], ...req.body, updatedAt: new Date().toISOString() };
  res.json(policies[index]);
});

// Renewals Endpoints (NO DELETE)
app.get('/api/renewals', requireAuth, (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  res.json(paginate(renewals, page, limit));
});

app.get('/api/renewals/:id', requireAuth, (req: Request, res: Response) => {
  const item = renewals.find((r) => r.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'NOT_FOUND', message: 'Renewal record not found' });
  res.json(item);
});

app.patch('/api/renewals/:id', requireAuth, (req: Request, res: Response) => {
  const index = renewals.findIndex((r) => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'NOT_FOUND', message: 'Renewal not found' });

  renewals[index] = { ...renewals[index], ...req.body, updatedAt: new Date().toISOString() };
  res.json(renewals[index]);
});

// Claims Endpoints (NO DELETE)
app.get('/api/claims', requireAuth, (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string || '').toLowerCase();
  const status = req.query.status as string;

  let filtered = claims;
  if (status && status !== 'ALL') {
    filtered = filtered.filter((c) => c.status === status);
  }
  if (search) {
    filtered = filtered.filter(
      (c) =>
        c.claimNumber.toLowerCase().includes(search) ||
        c.customerName?.toLowerCase().includes(search) ||
        c.policyNumber?.toLowerCase().includes(search)
    );
  }

  res.json(paginate(filtered, page, limit));
});

app.get('/api/claims/:id', requireAuth, (req: Request, res: Response) => {
  const item = claims.find((c) => c.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'NOT_FOUND', message: 'Claim record not found' });
  res.json(item);
});

app.post('/api/claims', requireAuth, (req: Request, res: Response) => {
  const { customerId, claimDate, policyId, claimNumber, status, amount, notes } = req.body;
  if (!customerId || !claimDate) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'CustomerId and claimDate are required',
      fieldErrors: {
        customerId: !customerId ? 'Customer ID is required' : '',
        claimDate: !claimDate ? 'Claim date is required' : '',
      },
    });
  }

  const customer = customers.find((c) => c.id === customerId);
  const policy = policies.find((p) => p.id === policyId);

  const newClaim = {
    id: `clm_${Date.now()}`,
    branchId: req.user?.branchId || 'br_metro_central_04',
    claimNumber: claimNumber || `CLM-2024-${Math.floor(100 + Math.random() * 900)}`,
    customerId,
    customerName: customer?.name || 'Insured Claimant',
    customerPhone: customer?.phone || '+1 (212) 555-0199',
    policyId: policyId || (policies[0] ? policies[0].id : ''),
    policyNumber: policy?.policyNumber || 'POL-8942',
    policyProduct: policy?.product || 'Comprehensive Auto',
    claimDate,
    status: (status as any) || 'REPORTED',
    amount: Number(amount) || 0,
    deductibleMet: true,
    deductibleAmount: 500.0,
    adjudicationTier: 'Tier 1 FastTrack',
    adjusterName: 'Julian Thorne',
    notes,
    createdAt: new Date().toISOString(),
  };

  claims.unshift(newClaim);

  activities.unshift({
    id: `act_${Date.now()}`,
    branchId: newClaim.branchId,
    type: 'CLAIM_SUBMITTED',
    title: `Claim #${newClaim.claimNumber} submitted`,
    description: `$${newClaim.amount.toLocaleString()} filed for ${newClaim.customerName}`,
    timestamp: 'Just now',
    userName: req.user?.name || 'Elena Cruz',
    entityType: 'CLAIM',
    entityId: newClaim.id,
  });

  res.status(201).json(newClaim);
});

app.patch('/api/claims/:id', requireAuth, (req: Request, res: Response) => {
  const index = claims.findIndex((c) => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'NOT_FOUND', message: 'Claim not found' });

  claims[index] = { ...claims[index], ...req.body, updatedAt: new Date().toISOString() };
  res.json(claims[index]);
});

// Follow-ups Endpoints
app.get('/api/follow-ups', requireAuth, (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  res.json(paginate(followUps, page, limit));
});

app.get('/api/follow-ups/:id', requireAuth, (req: Request, res: Response) => {
  const item = followUps.find((f) => f.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'NOT_FOUND', message: 'Follow-up not found' });
  res.json(item);
});

app.post('/api/follow-ups', requireAuth, (req: Request, res: Response) => {
  const { title, dueAt, customerId, leadId, staffId, status, notes } = req.body;
  if (!title || !dueAt) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Title and due date are required',
      fieldErrors: {
        title: !title ? 'Title is required' : '',
        dueAt: !dueAt ? 'Due date is required' : '',
      },
    });
  }

  const customer = customers.find((c) => c.id === customerId);
  const lead = leads.find((l) => l.id === leadId);
  const staff = staffList.find((s) => s.id === staffId);

  const newFollowUp = {
    id: `flw_${Date.now()}`,
    branchId: req.user?.branchId || 'br_metro_central_04',
    title,
    dueAt,
    customerId,
    customerName: customer?.name,
    leadId,
    leadName: lead?.name,
    staffId,
    staffName: staff?.name || 'Marcus Sterling',
    status: status || 'PENDING',
    notes,
    createdAt: new Date().toISOString(),
  };

  followUps.unshift(newFollowUp);
  res.status(201).json(newFollowUp);
});

app.patch('/api/follow-ups/:id', requireAuth, (req: Request, res: Response) => {
  const index = followUps.findIndex((f) => f.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'NOT_FOUND', message: 'Follow-up not found' });

  followUps[index] = { ...followUps[index], ...req.body };
  res.json(followUps[index]);
});

app.delete('/api/follow-ups/:id', requireAuth, (req: Request, res: Response) => {
  const index = followUps.findIndex((f) => f.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'NOT_FOUND', message: 'Follow-up not found' });

  followUps.splice(index, 1);
  res.json({ success: true, id: req.params.id });
});

// Documents Endpoints
app.get('/api/documents', requireAuth, (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  res.json(paginate(documents, page, limit));
});

app.get('/api/documents/:id', requireAuth, (req: Request, res: Response) => {
  const item = documents.find((d) => d.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'NOT_FOUND', message: 'Document not found' });
  res.json(item);
});

app.get('/api/documents/:id/content', requireAuth, (req: Request, res: Response) => {
  const item = documents.find((d) => d.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'NOT_FOUND', message: 'Document not found' });

  if (item.buffer) {
    res.setHeader('Content-Type', item.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${item.name}"`);
    return res.send(item.buffer);
  }

  // Placeholder binary PDF / Image stream
  res.setHeader('Content-Type', item.mimeType);
  res.setHeader('Content-Disposition', `inline; filename="${item.name}"`);
  res.send(`Mock Content for Document ${item.name} (${item.type})`);
});

app.post('/api/documents/upload', requireAuth, upload.single('file'), (req: Request, res: Response) => {
  const file = req.file;
  const { type, customerId, policyId, claimId } = req.body;

  if (!file) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'File is required' });
  }
  if (!type) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Document type is required' });
  }
  if (!customerId && !policyId && !claimId) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'At least one of customerId, policyId, or claimId is required',
    });
  }

  const newDocId = `doc_${Date.now()}`;
  const newDoc = {
    id: newDocId,
    branchId: req.user?.branchId || 'br_metro_central_04',
    name: file.originalname,
    type,
    fileUrl: `/api/documents/${newDocId}/content`,
    size: file.size,
    mimeType: file.mimetype || 'application/octet-stream',
    customerId,
    policyId,
    claimId,
    buffer: file.buffer,
    uploadedAt: new Date().toISOString(),
  };

  documents.unshift(newDoc);
  res.status(201).json(newDoc);
});

app.delete('/api/documents/:id', requireAuth, (req: Request, res: Response) => {
  const index = documents.findIndex((d) => d.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'NOT_FOUND', message: 'Document not found' });

  documents.splice(index, 1);
  res.json({ success: true, id: req.params.id });
});

// Activities Endpoints (NO DELETE)
app.get('/api/activities', requireAuth, (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  res.json(paginate(activities, page, limit));
});

app.get('/api/activities/:id', requireAuth, (req: Request, res: Response) => {
  const item = activities.find((a) => a.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'NOT_FOUND', message: 'Activity not found' });
  res.json(item);
});

// Commissions Endpoints (NO DELETE)
app.get('/api/commissions', requireAuth, (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  res.json(paginate(commissions, page, limit));
});

app.get('/api/commissions/:id', requireAuth, (req: Request, res: Response) => {
  const item = commissions.find((c) => c.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'NOT_FOUND', message: 'Commission record not found' });
  res.json(item);
});

app.post('/api/commissions', requireAuth, (req: Request, res: Response) => {
  const { amount, policyId, customerId, status, earnedAt, paidAt } = req.body;
  if (amount === undefined || amount === null) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Commission amount is required' });
  }

  const policy = policies.find((p) => p.id === policyId);
  const customer = customers.find((c) => c.id === customerId);

  const newComm = {
    id: `com_${Date.now()}`,
    branchId: req.user?.branchId || 'br_metro_central_04',
    amount: Number(amount),
    policyId,
    policyNumber: policy?.policyNumber,
    customerId,
    customerName: customer?.name,
    status: status || 'PENDING',
    earnedAt: earnedAt || new Date().toISOString(),
    paidAt,
    createdAt: new Date().toISOString(),
  };

  commissions.unshift(newComm);
  res.status(201).json(newComm);
});

app.patch('/api/commissions/:id', requireAuth, (req: Request, res: Response) => {
  const index = commissions.findIndex((c) => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'NOT_FOUND', message: 'Commission not found' });

  commissions[index] = { ...commissions[index], ...req.body };
  res.json(commissions[index]);
});

// Dashboard: GET /api/dashboard
app.get('/api/dashboard', requireAuth, (_req: Request, res: Response) => {
  res.json({
    metrics: {
      totalCustomers: { value: 2845, changePct: 12.4, period: 'vs last month' },
      activePolicies: { value: 4120, retentionRate: 88.6 },
      openClaims: { value: 38, urgentCount: 6 },
      upcomingRenewals: { value: 142, timeframeDays: 30 },
    },
    policyDistribution: {
      active: 3650,
      expired: 320,
      cancelled: 150,
      total: 4120,
      segments: [
        { category: 'Auto', count: 1565, percentage: 38, volume: '$2.26M', color: '#17263f' },
        { category: 'Commercial', count: 1071, percentage: 26, volume: '$4.18M', color: '#002c26' },
        { category: 'Property', count: 741, percentage: 18, volume: '$1.45M', color: '#4d5f7b' },
        { category: 'Health', count: 494, percentage: 12, volume: '$890K', color: '#d6e3fc' },
        { category: 'Life', count: 249, percentage: 6, volume: '$620K', color: '#b8c7e7' },
      ],
      grossWrittenPremiumYtd: '$9.40M',
    },
    recentActivities: activities.slice(0, 5),
  });
});

// Reports Endpoints
app.get('/api/reports/summary', requireAuth, (_req: Request, res: Response) => {
  res.json({
    period: 'FY2024 YTD',
    grossWrittenPremium: 9400000,
    activePoliciesCount: 3650,
    claimsCount: 38,
    claimPayoutTotal: 215800,
    conversionRate: 88.6,
    lapseRate: 3.64,
    branchesPerformance: branches.map((b) => ({
      branchName: b.name,
      code: b.code,
      activePolicies: Math.floor(Math.random() * 1200) + 600,
      gwp: Math.floor(Math.random() * 5000000) + 3000000,
      claims: Math.floor(Math.random() * 15) + 5,
    })),
  });
});

app.get('/api/reports/renewals', requireAuth, (_req: Request, res: Response) => {
  res.json({
    period: 'Next 30 Days',
    upcomingCount: 142,
    renewalRate: 91.4,
    projectedVolume: 348000,
  });
});

app.get('/api/reports/commissions', requireAuth, (_req: Request, res: Response) => {
  res.json({
    period: 'Current Quarter Q3',
    paidTotal: 124500,
    pendingTotal: 18400,
    averageRate: 8.5,
  });
});

// Admin Branches listing endpoint helper for the admin UI (supports both GET and POST)
app.get('/api/branches', requireAuth, (req: Request, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'Admin authorization required' });
  }
  res.json({
    data: branches,
    total: branches.length,
    syncTimestamp: new Date().toISOString(),
  });
});

// Mount Vite or static dist
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('.', 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve('.', 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`United Insurance CRM server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
