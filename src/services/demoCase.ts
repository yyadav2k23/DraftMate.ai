import { LegalDocument } from '../types';

export const ASTER_NORTHSTAR_DEMO_CASE: LegalDocument = {
  id: 'doc-demo-aster-northstar',
  title: 'Legal Notice for Recovery of Commercial Dues (Aster Supplies vs Northstar Retail)',
  type: 'LEGAL_NOTICE_COMMERCIAL_DUES',
  jurisdiction: 'India (Commercial Courts Jurisdiction, Mumbai / Bengaluru)',
  parties: [
    {
      name: 'Aster Supplies Private Limited',
      role: 'CLAIMANT',
      entityType: 'COMPANY',
      address: 'Plot 42, MIDC Industrial Area, Andheri East, Mumbai 400093, Maharashtra',
      contact: 'legal@astersupplies.in | +91 22 2847 9000',
    },
    {
      name: 'Northstar Retail Logistics Limited',
      role: 'RESPONDENT',
      entityType: 'COMPANY',
      address: 'Prestige Tech Cloud, 4th Floor, Devanahalli, Bengaluru 562157, Karnataka',
      contact: 'compliance@northstarretail.com',
    },
  ],
  dates: {
    noticeDate: '2026-10-18',
    incidentOrDefaultDate: '2026-08-15',
    agreementDate: '2026-02-10',
    demandDeadlineDays: 15,
    statutoryOrContractualBasis: 'Indian Contract Act, 1872 & Commercial Practice',
  },
  factsAndChronology:
    'Pursuant to Master Supply Agreement dated 10 February 2026, Claimant supplied industrial switchgear and commercial electrical hardware under Tax Invoice INV-8821 dated 15 July 2026 for a total value of ₹14,50,000. Under agreed 30-day commercial terms, payment fell due on 15 August 2026. Claimant accounts team claims no funds were credited. However, delivery acknowledgment from warehouse contains an endorsement stating payment was received on 25 August 2026 via NEFT reference N239842.',
  amounts: {
    principalClaim: 1450000,
    interestRatePercent: 18,
    currency: 'INR',
    paymentReferences: ['INV-8821', 'NEFT-N239842'],
  },
  desiredTone: 'FORMAL_ASSERTIVE',
  supportingEvidence: [
    {
      id: 'ev-warehouse-receipt',
      title: 'Warehouse Goods Delivery & Acknowledgment Receipt (Ref: GRN-9914)',
      documentType: 'Delivery Receipt & Endorsement',
      date: '2026-08-25',
      keyStatements: [
        'Consignment received in intact condition at Northstar Central Hub on 25 August 2026.',
        'Payment Note: Invoice INV-8821 was fully paid on 25 August 2026 via NEFT reference N239842.',
        'Authorized warehouse receiving officer signature and stamp affixed.',
      ],
      fullTextOrSummary:
        'Goods Receipt Note GRN-9914 issued by Northstar Receiving Bay #3. Delivery verified for 120 units switchgear. Crucial notation in settlement box: "Invoice INV-8821 was fully paid on 25 August 2026 via NEFT reference N239842 in accordance with vendor terms."',
    },
    {
      id: 'ev-bank-ledger',
      title: 'Aster Supplies Accounts Receivable & Bank Reconciliation Ledger',
      documentType: 'Accounting Ledger Statement',
      date: '2026-10-15',
      keyStatements: [
        'Ledger audit report generated on 15 October 2026.',
        'Invoice INV-8821 marked pending and unpaid as of 15 October 2026.',
        'Zero inbound settlement credited against debtor Northstar Retail account code AST-BLR-09.',
      ],
      fullTextOrSummary:
        'Certified extract of Aster Supplies Enterprise ERP Ledger. As of 15 October 2026, Account code AST-BLR-09 shows outstanding debit balance of ₹14,50,000. Ledger remark: "Invoice INV-8821 marked pending and unpaid as of 15 October 2026; debtor reminder notices unanswered."',
    },
    {
      id: 'ev-contract-master',
      title: 'Master Commercial Supply Agreement (Clauses 7 & 12)',
      documentType: 'Commercial Contract',
      date: '2026-02-10',
      keyStatements: [
        'Clause 7.2: Net 30 days payment terms upon delivery.',
        'Clause 12.1: In event of default, interest at 18% per annum chargeable after cure notice.',
      ],
      fullTextOrSummary:
        'Executed commercial contract governing supply of industrial electrical equipment between Aster Supplies and Northstar Retail.',
    },
  ],
  additionalInstructions:
    'Demand immediate clearance of ₹14,50,000 along with 18% interest, citing Section 73 of the Indian Contract Act, 1872. Note: verify conflicting warehouse note.',
  content: `LEGAL DEMAND NOTICE
(UNDER INSTRUCTIONS FROM AND ON BEHALF OF CLIENT)

Date: 18 October 2026
Dispatch Mode: Registered Post A.D. & Email

TO:
Northstar Retail Logistics Limited
Through its Managing Director / Authorized Representative
Prestige Tech Cloud, 4th Floor, Devanahalli, Bengaluru 562157, Karnataka
Email: compliance@northstarretail.com

FROM:
M/s LexJuris Associates, Advocates & Legal Consultants
On behalf of: Aster Supplies Private Limited, Andheri East, Mumbai 400093

SUBJECT: LEGAL NOTICE FOR RECOVERY OF OUTSTANDING COMMERCIAL DUES OF ₹14,50,000/- ALONG WITH ACCRUED INTEREST UNDER INVOICE NO. INV-8821

Sir / Madam,

Under instructions from and on behalf of our client, M/s Aster Supplies Private Limited ("Our Client"), having its registered office at Plot 42, MIDC Industrial Area, Andheri East, Mumbai, we hereby serve upon you this formal Legal Notice:

1. That Our Client is a premier manufacturer and distributor of commercial switchgear and industrial electrical hardware throughout India.

2. That pursuant to the Master Supply Agreement dated 10 February 2026, Our Client supplied and delivered 120 units of industrial switchgear under Tax Invoice No. INV-8821 dated 15 July 2026, for a total agreed price of ₹14,50,000/- (Rupees Fourteen Lakhs Fifty Thousand only).

3. That the goods were duly delivered and accepted without demurrer. Under Clause 7.2 of the said Agreement, the entire invoice value was payable within 30 days, falling due on 15 August 2026.

4. That despite repeated reminders, Our Client's accounting ledger confirms that Invoice INV-8821 remains pending and unpaid as of 15 October 2026, and you have failed and neglected to remit the outstanding sum.

5. That your failure to remit the principal sum constitutes a material breach of contract, entitling Our Client to compensation for loss and damage caused thereby under Section 73 of the Indian Contract Act, 1872.

6. That under the Indian Contract Act, 1872, you are subject to a mandatory statutory period of 15 days to liquidate all outstanding dues upon service of this notice.

7. That you are therefore called upon to pay the principal sum of ₹14,50,000/- together with interest at 18% per annum from 15 August 2026 until realization, at the earliest convenience and within 15 days of receipt of this notice, failing which Our Client shall institute civil proceedings under Order XXXVII of the Code of Civil Procedure, 1908 and invoke pre-institution mediation under Section 12A of the Commercial Courts Act, 2015.

Yours faithfully,

For LexJuris Associates
Advocates & Legal Advisors
[MISSING: Counsel Enrolment Number]
Counsel for Aster Supplies Private Limited`,
  createdAt: '2026-10-18T14:30:00Z',
  updatedAt: '2026-10-18T14:30:00Z',
  status: 'DRAFT',
  isDemoCase: true,
};

export const SAMPLE_DOCUMENTS: LegalDocument[] = [
  ASTER_NORTHSTAR_DEMO_CASE,
  {
    id: 'doc-sample-payment-reminder',
    title: 'Payment Reminder & Final Demand Notice (Cloud SaaS Agreement)',
    type: 'PAYMENT_REMINDER_DEMAND',
    jurisdiction: 'India (Delhi / National Capital Territory)',
    parties: [
      {
        name: 'Apex Infotech Solutions LLP',
        role: 'CLAIMANT',
        entityType: 'LLP',
        address: 'Tower B, Cyber City, DLF Phase 2, Gurugram 122002, Haryana',
        contact: 'finance@apexinfotech.io',
      },
      {
        name: 'Zenith Logistics Hub Private Limited',
        role: 'RESPONDENT',
        entityType: 'COMPANY',
        address: 'Plot 18, Okhla Industrial Area Phase III, New Delhi 110020',
        contact: 'accounts@zenithhub.co.in',
      },
    ],
    dates: {
      noticeDate: '2026-10-22',
      incidentOrDefaultDate: '2026-09-01',
      demandDeadlineDays: 7,
      statutoryOrContractualBasis: 'Software Services Agreement Clause 9',
    },
    factsAndChronology:
      'Apex Infotech provided cloud infrastructure management services for Q3 2026. Monthly invoice APX-9941 of ₹3,75,000 remains unsettled after 45 days.',
    amounts: {
      principalClaim: 375000,
      interestRatePercent: 12,
      currency: 'INR',
      paymentReferences: ['APX-9941'],
    },
    desiredTone: 'STANDARD_COMMERCIAL',
    supportingEvidence: [
      {
        id: 'ev-saas-inv',
        title: 'Invoice APX-9941 for Enterprise Cloud Hosting',
        documentType: 'Tax Invoice',
        date: '2026-09-01',
        keyStatements: ['Net payable ₹3,75,000 within 15 days.', 'Unpaid status recorded on billing portal.'],
        fullTextOrSummary: 'Monthly recurring SaaS billing for server infrastructure.',
      },
    ],
    additionalInstructions: 'Issue courteous but firm final reminder before initiating formal dispute.',
    content: `FINAL PAYMENT REMINDER & DEMAND LETTER

Date: 22 October 2026

To:
Zenith Logistics Hub Private Limited
Plot 18, Okhla Industrial Area Phase III, New Delhi 110020

From:
Apex Infotech Solutions LLP
Tower B, Cyber City, DLF Phase 2, Gurugram 122002

Subject: Final Payment Reminder for Outstanding Cloud Infrastructure Dues (Invoice APX-9941)

Dear Accounts Team,

This is a formal reminder regarding Invoice No. APX-9941 dated 01 September 2026 for ₹3,75,000/- (Rupees Three Lakhs Seventy Five Thousand only) for enterprise cloud hosting services provided during Q3 2026.

Under Clause 9 of our Software Services Agreement, payment was due on 16 September 2026. Our records indicate that this sum remains unpaid despite prior automated email notifications.

Please remit the outstanding amount of ₹3,75,000/- to our designated HDFC Bank current account within 7 business days of receipt of this letter.

Sincerely,
Authorized Signatory
Apex Infotech Solutions LLP`,
    createdAt: '2026-10-22T09:15:00Z',
    updatedAt: '2026-10-22T09:15:00Z',
    status: 'READY_FOR_LEGAL_COUNSEL',
  },
  {
    id: 'doc-sample-response-notice',
    title: 'Response to Purported Legal Notice of Breach of Contract',
    type: 'RESPONSE_TO_LEGAL_NOTICE',
    jurisdiction: 'India (High Court of Bombay Jurisdiction)',
    parties: [
      {
        name: 'Vanguard Engineering Works',
        role: 'FIRST_PARTY',
        entityType: 'PROPRIETORSHIP',
        address: 'B-12 Industrial Estate, Bhosari, Pune 411026, Maharashtra',
        contact: 'office@vanguardeng.com',
      },
      {
        name: 'Trident Infrastructure Corporation',
        role: 'SECOND_PARTY',
        entityType: 'COMPANY',
        address: 'Nariman Point, Marine Drive, Mumbai 400021, Maharashtra',
        contact: 'legal@tridentinfra.in',
      },
    ],
    dates: {
      noticeDate: '2026-10-12',
      demandDeadlineDays: 14,
      statutoryOrContractualBasis: 'Response on Merits & Indian Contract Act 1872',
    },
    factsAndChronology:
      'Trident Infrastructure issued a notice claiming delay in supplying fabrication parts. Vanguard responded with delivery receipts proving parts were delivered on time but rejected due to site readiness issues by Trident.',
    amounts: {
      principalClaim: 0,
      currency: 'INR',
    },
    desiredTone: 'FORMAL_ASSERTIVE',
    supportingEvidence: [],
    additionalInstructions: 'Deny all unfounded allegations of breach; reserve rights to claim demurrage.',
    content: `REPLY TO NOTICE DATED 02 OCTOBER 2026

Date: 12 October 2026

TO:
M/s Trident Infrastructure Corporation
Through Counsel, Nariman Point, Mumbai 400021

FROM:
Advocates for Vanguard Engineering Works
Pune, Maharashtra

SUBJECT: REPLY TO YOUR NOTICE DATED 02 OCTOBER 2026 REGARDING PURPORTED DELAYS IN FABRICATION SUPPLY

Sir / Madam,

Under instructions from and on behalf of our client, Vanguard Engineering Works ("Our Client"), we place on record our client's response to your purported notice:

1. All allegations of contractual breach, willful delay, or negligence made in your notice are baseless, factually untenable, and vehemently denied in toto.

2. Our Client delivered all fabrication components within the contractual timeline as evidenced by Consignment Notes signed by your site engineers at the Pune Metro project site.

3. Any delay at site was solely attributable to your failure to provide foundation readiness and power supply, which is governed by Section 54 of the Indian Contract Act, 1872.

4. You are hereby called upon to withdraw the said baseless notice within 14 days, failing which Our Client shall initiate appropriate proceedings for recovery of idle equipment damages.

Yours faithfully,
Advocate for Vanguard Engineering Works`,
    createdAt: '2026-10-12T11:00:00Z',
    updatedAt: '2026-10-12T11:00:00Z',
    status: 'AUDITED',
  },
];
