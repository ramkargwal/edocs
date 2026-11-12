import { DocItem, FolderCategory } from '../types';

export const INITIAL_CATEGORIES: FolderCategory[] = [
  {
    id: 'circulars-notices',
    name: 'Circulars & Official Notices',
    description: 'Mandatory public notifications, regulatory directives, and official administrative advisories',
    icon: 'Megaphone',
    color: 'emerald',
    gitHubPath: 'circulars',
  },
  {
    id: 'executive-orders',
    name: 'Executive Orders & Letters',
    description: 'Formal letters, executive memoranda, appointment notifications, and internal directives',
    icon: 'FileText',
    color: 'blue',
    gitHubPath: 'executive-orders',
  },
  {
    id: 'finance-budgets',
    name: 'Finance & Audit Reports',
    description: 'Quarterly financial statements, annual budget allotments, audit queries, and balance sheets',
    icon: 'TrendingUp',
    color: 'amber',
    gitHubPath: 'finance',
  },
  {
    id: 'legal-contracts',
    name: 'Legal & Procurement Tenders',
    description: 'Tender bids, vendor agreements, compliance resolutions, and legal arbitration papers',
    icon: 'Scale',
    color: 'purple',
    gitHubPath: 'legal',
  },
  {
    id: 'minutes-agendas',
    name: 'Board Meeting Minutes',
    description: 'Official proceedings, resolution logs, voting records, and stakeholder assembly notes',
    icon: 'Calendar',
    color: 'indigo',
    gitHubPath: 'minutes',
  },
  {
    id: 'technical-specs',
    name: 'Technical Specs & Guidelines',
    description: 'Engineering standards, IT infrastructure architecture, security protocols, and blueprints',
    icon: 'Cpu',
    color: 'cyan',
    gitHubPath: 'technical',
  },
];

export const INITIAL_DOCUMENTS: DocItem[] = [
  {
    id: 'doc-001',
    refNo: 'CIR/ADM/2026/042-B',
    letterDate: '2026-03-15',
    subject: 'Public Advisory on Digital Archival and Paperless Governance Mandate',
    category: 'circulars-notices',
    description: 'Comprehensive guidelines establishing cloud-based document accessibility standards for all public-facing departments. Emphasizes open-access repository synchronization, zero-barrier public document downloads, and tamper-evident SHA-256 digital verification hashes.',
    tags: ['E-Governance', 'Open Access', 'Digitization', 'Compliance', 'Public Record'],
    fileName: '2026-03-15_CIR-ADM-042B_Paperless_Mandate.pdf',
    fileSize: 1845000,
    fileType: 'pdf',
    source: 'demo',
    senderDept: 'Department of Public Administration & Records',
    recipient: 'All Zonal Offices, General Public, and Institutional Partners',
    status: 'Official',
    sha256: '8f7a9301e52bc0914da6e9b41804c7df81249b6d8591a4b92c45388e630fd892',
    createdAt: '2026-03-15T09:30:00Z',
    contentPreview: `# OFFICE OF PUBLIC ADMINISTRATION & RECORDS
**REF NO:** CIR/ADM/2026/042-B  
**DATE OF ISSUANCE:** 15th March 2026  
**SUBJECT:** Implementation of Open-Access Public Repository & Zero-Barrier Digital Downloads

To: All Department Heads, Regional Bureaus, and Public Archives  

1. **PURPOSE & SCOPE**  
In pursuant to Section 14 of the Open Information Transparency Accord, this office issues an immediate directive mandating that all public-interest circulars, administrative resolutions, and official gazette letters must be synchronized with verifiable public web repositories.

2. **KEY COMPLIANCE REQUIREMENTS**
- Documents must remain accessible without mandatory login or authentication wall.
- Each document must include a designated Letter Reference Number, Letter Date, Subject Abstract, and verification hash.
- Automated catalog reports in standardized PDF format must be generated and archived quarterly.

3. **ENFORCEMENT DATE**  
This circular takes immediate effect from the date of issuance.

Signed,  
**Dr. Eleanor Vance**  
Chief Information Officer & Registrar`,
  },
  {
    id: 'doc-002',
    refNo: 'LTR/EXE/2026/108-A',
    letterDate: '2026-03-02',
    subject: 'Sanction Order: Annual Capital Grant for Renewable Energy Grid Integration',
    category: 'executive-orders',
    description: 'Official sanction letter authorizing a capital grant allocation of $14.8M for the Phase-IV regional solar-wind hybrid grid enhancement project. Details milestone release schedule, environmental clearance parameters, and engineering oversight committees.',
    tags: ['Sanction Order', 'Grant', 'Renewable Energy', 'Infrastructure', 'Phase-IV'],
    fileName: '2026-03-02_LTR-EXE-108A_Solar_Grant_Sanction.pdf',
    fileSize: 2450000,
    fileType: 'pdf',
    source: 'demo',
    senderDept: 'Executive Council & Energy Infrastructure Bureau',
    recipient: 'Consortium of Clean Energy Providers & Comptroller',
    status: 'Official',
    sha256: '3c8e41bf9087ea527da69622d10c14b987258e727c653bc0a12e879012356ff4',
    createdAt: '2026-03-02T11:15:00Z',
    contentPreview: `# EXECUTIVE COUNCIL OF ENERGY INFRASTRUCTURE
**SANCTION ORDER NUMBER:** LTR/EXE/2026/108-A  
**DISPATCH DATE:** 02 March 2026  
**SUBJECT:** Administrative Approval & Capital Grant Sanction for Phase-IV Grid Enhancement

**MEMORANDUM:**  
The Executive Committee hereby conveys administrative approval for financial grant disbursements totaling USD $14,800,000 for the installation of smart distributed inverters across 12 substation hubs.

- **Tranche 1 (Immediate):** $5,000,000 upon contract execution
- **Tranche 2 (Mid-Term):** $6,500,000 following structural civil works verification
- **Tranche 3 (Retention):** $3,300,000 upon SCADA telemetry commissioning

All expenditures must conform strictly to audited public procurement protocols.

Approved by:  
**Marcus Sterling**  
Director General of Infrastructure`,
  },
  {
    id: 'doc-003',
    refNo: 'AUD/FIN/2026/Q1-09',
    letterDate: '2026-02-28',
    subject: 'Independent Statutory Audit Report - Q1 Financial Review & Compliance Statement',
    category: 'finance-budgets',
    description: 'Unqualified statutory audit opinion covering consolidated revenues, capital operational expenditures (CapEx), treasury reserves, and vendor disbursement reconciliation for the first fiscal quarter of 2026.',
    tags: ['Audit', 'Finance', 'Q1-2026', 'Balance Sheet', 'Statutory Review'],
    fileName: '2026-02-28_AUD-FIN-Q109_Statutory_Audit.xlsx',
    fileSize: 3120000,
    fileType: 'xlsx',
    source: 'demo',
    senderDept: 'Office of the Auditor General & Independent Review Board',
    recipient: 'Public Audit Registry, Stakeholders, and Parliamentary Committee',
    status: 'Official',
    sha256: 'a1290fd38e762c9541a774b9e02315cb8126bca50198de74895fbc990142e011',
    createdAt: '2026-02-28T16:00:00Z',
    contentPreview: `# STATUTORY AUDIT REPORT - FIRST QUARTER 2026
**AUDIT FILE:** AUD/FIN/2026/Q1-09  
**REPORT DATE:** 28 February 2026  

**OPINION:**  
In our opinion, the accompanying financial schedules present fairly, in all material respects, the financial position as of February 28, 2026, and its operational performance in accordance with International Public Sector Accounting Standards (IPSAS).

**SUMMARY FINANCIAL HIGHLIGHTS:**
- Gross Receipts: $42,650,000
- Operational Expenditure: $28,120,000
- Net Capital Reserves: $14,530,000
- Variance to Budget: +2.4% favorable

Lead Auditor:  
**Patricia Chen, CPA, CIA**  
Principal Examiner`,
  },
  {
    id: 'doc-004',
    refNo: 'TND/LGL/2026/RFP-304',
    letterDate: '2026-02-18',
    subject: 'Public Tender Notice: Global Procurement of High-Capacity Fiber Optical Network Hardware',
    category: 'legal-contracts',
    description: 'Invitation for open competitive bids (RFP-304) for the supply, installation, and 5-year SLA maintenance of multi-terabit dark fiber multiplexing transceivers. Includes eligibility criteria, earnest money deposit terms, and submission timeline.',
    tags: ['Tender', 'Procurement', 'Telecom', 'RFP', 'Contract Terms'],
    fileName: '2026-02-18_TND-LGL-RFP304_Fiber_Optics_Tender.pdf',
    fileSize: 4210000,
    fileType: 'pdf',
    source: 'demo',
    senderDept: 'Central Procurement Agency & Legal Advisory Cell',
    recipient: 'Eligible Technology Vendors and OEM Manufacturers',
    status: 'Public Notice',
    sha256: '5d71829aefb44089c1723c10a4023de9801267fce51280962351ab6618d45129',
    createdAt: '2026-02-18T10:00:00Z',
    contentPreview: `# CENTRAL PROCUREMENT AGENCY
**TENDER NOTICE REF:** TND/LGL/2026/RFP-304  
**DATE OF NOTIFICATION:** 18 February 2026  
**SUBMISSION DEADLINE:** 24 April 2026, 17:00 UTC  

**INVITATION FOR BIDS (IFB):**  
Sealed proposals and electronically verified bids are invited from qualified Tier-1 telecom infrastructure providers for supplying Dense Wavelength Division Multiplexing (DWDM) equipment.

**KEY MILESTONES:**
- Pre-bid Conference: 10 March 2026 via Video Broadcast
- Bid Submission Closes: 24 April 2026
- Technical Bid Opening: 28 April 2026

Interested vendors can download the full tender documents free of charge from this public document repository.`,
  },
  {
    id: 'doc-005',
    refNo: 'MIN/BOD/2026/SES-04',
    letterDate: '2026-02-10',
    subject: 'Minutes of the 148th Ordinary Assembly of the Board of Governors',
    category: 'minutes-agendas',
    description: 'Official ratified record of deliberations, unanimous approvals on the FY 2026-2027 Technology Roadmap, risk mitigation committee reports, and appointment confirmations for regional ombudspersons.',
    tags: ['Minutes', 'Board of Governors', 'Governance', 'Resolutions', 'Annual Roadmap'],
    fileName: '2026-02-10_MIN-BOD-SES04_148th_Assembly_Minutes.docx',
    fileSize: 940000,
    fileType: 'docx',
    source: 'demo',
    senderDept: 'Office of the Board Secretary',
    recipient: 'Trustees, Executive Directors, and Public Record Archive',
    status: 'Official',
    sha256: '91bc0192ea68910d54023bc6178efc9134a9b5190623a881907cb5829104fa28',
    createdAt: '2026-02-10T14:45:00Z',
    contentPreview: `# BOARD OF GOVERNORS - 148TH ORDINARY SESSION
**DOCUMENT REF:** MIN/BOD/2026/SES-04  
**CONVENED ON:** 10 February 2026 | 10:00 AM  
**CHAIRPERSON:** Dame Catherine Ross  

**RESOLUTIONS ADOPTED:**
1. **Resolution 2026-44:** Approved unanimously the 5-Year Data Sovereignty and Open Standards Architecture plan.
2. **Resolution 2026-45:** Confirmed the appointment of Ms. Aris Thorne as Chairperson of the Public Grievance Ombudsman.
3. **Resolution 2026-46:** Ratified the Q4-2025 financial disclosures for publication in the public transparency index.

Recorded by:  
**Julian Moreau**  
Secretary to the Board`,
  },
  {
    id: 'doc-006',
    refNo: 'SPEC/TEC/2026/ARCH-12',
    letterDate: '2026-01-24',
    subject: 'Standard Technical Specification: Zero-Trust Identity Federation & API Data Bridges',
    category: 'technical-specs',
    description: 'Definitive technical specification describing architectural protocols for cryptographic signature verification, OAuth 2.1 mTLS bridges, decentralized public document syndication, and rate-limiting safeguards.',
    tags: ['Technical Spec', 'Zero Trust', 'Cybersecurity', 'API Standards', 'mTLS'],
    fileName: '2026-01-24_SPEC-TEC-ARCH12_ZeroTrust_Standards.pdf',
    fileSize: 3820000,
    fileType: 'pdf',
    source: 'demo',
    senderDept: 'Information Systems Security Architecture Group',
    recipient: 'System Engineers, DevOps Leads, and Enterprise Integrators',
    status: 'Active',
    sha256: 'ef1284a91bce095204bc9981267814a09841bbce5510294158490aef9213bc56',
    createdAt: '2026-01-24T08:00:00Z',
    contentPreview: `# TECHNICAL STANDARD: ZERO-TRUST IDENTITY FEDERATION
**SPECIFICATION NO:** SPEC/TEC/2026/ARCH-12  
**REVISION LEVEL:** 3.2.0  
**EFFECTIVE DATE:** 24 January 2026  

1. **ARCHITECTURAL PRINCIPLES**
All distributed service mesh nodes communicating with the central repository must mandate mutual TLS (mTLS) with ephemeral X.509 certificates.
Public artifact feeds remain accessible over HTTPS CDN distribution edges with CORS enabled for open client downloads.

2. **INTEGRITY HASHING**
Every digital release asset must publish a matching SHA-256 digest calculated across the entire binary stream prior to CDN distribution.`,
  },
  {
    id: 'doc-007',
    refNo: 'CIR/HR/2026/014-W',
    letterDate: '2026-01-12',
    subject: 'Workplace Health, Environmental Ergonomics & Hybrid Schedule Policy Directive',
    category: 'circulars-notices',
    description: 'General administrative notification regarding revised remote operational provisions, ergonomic equipment reimbursements, mental health counseling hotlines, and statutory wellness leave allowances.',
    tags: ['HR Policy', 'Wellness', 'Hybrid Work', 'Employee Welfare', 'Guidelines'],
    fileName: '2026-01-12_CIR-HR-014W_Hybrid_Workplace_Policy.pdf',
    fileSize: 1150000,
    fileType: 'pdf',
    source: 'demo',
    senderDept: 'Human Resources Directorate',
    recipient: 'All Personnel and Department Supervisors',
    status: 'Circular',
    sha256: '72bce9041285749021a812e9b048712395a1bc84092109482109bca75920381a',
    createdAt: '2026-01-12T09:00:00Z',
    contentPreview: `# HUMAN RESOURCES DIRECTORATE
**POLICY CIRCULAR:** CIR/HR/2026/014-W  
**DATE:** 12 January 2026  
**APPLICABILITY:** All Active Staff & Contract Affiliates  

**POLICY OVERVIEW:**
The Directorate confirms the formalization of our permanent 3:2 Hybrid Workplace Model. Staff are entitled to up to $600 ergonomic workspace subsidy upon submission of validated invoices.`,
  },
  {
    id: 'doc-008',
    refNo: 'LTR/LEG/2025/MOU-99',
    letterDate: '2025-12-20',
    subject: 'Memorandum of Understanding: Inter-Institutional Open Data Sharing Agreement',
    category: 'legal-contracts',
    description: 'Bilateral partnership accord between public research libraries, universities, and federal record bureaus to co-host mirrored repositories for public domain legal statutes and historical gazettes.',
    tags: ['MOU', 'Open Data', 'Universities', 'Research', 'Bilateral Agreement'],
    fileName: '2025-12-20_LTR-LEG-MOU99_InterInstitutional_Data.pdf',
    fileSize: 2890000,
    fileType: 'pdf',
    source: 'demo',
    senderDept: 'Office of Legal Counsel & Inter-Agency Affairs',
    recipient: 'Partner Universities and State Research Councils',
    status: 'Official',
    sha256: 'bb891a274819024c8104829104bcde748192a0194857b102948cba091482901a',
    createdAt: '2025-12-20T15:20:00Z',
    contentPreview: `# MEMORANDUM OF UNDERSTANDING
**MOU REFERENCE:** LTR/LEG/2025/MOU-99  
**ENTERED ON:** 20 December 2025  

**PARTIES:**  
1. Central Document Repository Authority  
2. Inter-University Academic Research Syndicate  

**OBJECTIVES:**  
To establish resilient distributed mirroring across GitHub, IPFS, and regional university repositories to guarantee permanent public availability of all published legislative instruments.`,
  },
];
