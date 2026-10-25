import { CaseDocument, LegalCase, LegalDocument } from '../types';
import { extractCaseFacts } from '../engine/factExtractor';
import { detectCrossDocumentContradictions } from '../engine/crossDocumentContradiction';
import {
  DEMO_IMG_CASE_1_RECEIPT,
  DEMO_IMG_CASE_2_PAYROLL_NOTIFICATION,
  DEMO_IMG_CASE_3_DEDUCTION_SHEET,
  DEMO_IMG_CASE_4_CRACKED_LAPTOP,
  DEMO_IMG_CASE_4_SELLER_CHAT,
  DEMO_IMG_CASE_5_BANK_TRANSFER,
  DEMO_IMG_CASE_6_DAMAGED_CARTONS,
} from './syntheticEvidenceImages';

/* =========================================================================
   CASE 1: COMMERCIAL PAYMENT DISPUTE (DM-DEMO-001)
   Aster Supplies Private Limited v. Northstar Retail Private Limited
   ========================================================================= */

const CASE_1_DOCUMENTS: CaseDocument[] = [
  {
    id: 'doc-demo-c1-receipt',
    caseId: 'case-demo-001',
    originalFilename: 'Document_A_Payment_Receipt_TXN123.pdf',
    fileSize: 48200,
    mimeType: 'application/pdf',
    uploadedAt: '2026-08-25T14:30:00Z',
    status: 'EXTRACTED',
    documentCategory: 'PRIMARY_DOCUMENT',
    reviewStatus: 'UNREVIEWED',
    sourceProvenance: 'Consignee Warehouse Inward Receiving Register',
    extractedText: `COMMERCIAL GOODS DELIVERY & SETTLEMENT RECEIPT
Ref No: GRN-2026-9914
Date: 25 August 2026
Receiving Station: Northstar Receiving Hub, Kanpur, Uttar Pradesh

CONSIGNOR:
Aster Supplies Private Limited
101 Sample Business Park, Lucknow, Uttar Pradesh, 226001
Internal ID: DEMO-ASTER-001 (Fictional internal test identifier, not a valid CIN)

CONSIGNEE:
Northstar Retail Private Limited
202 Sample Trade Centre, Kanpur, Uttar Pradesh, 208001
Internal ID: DEMO-NORTHSTAR-002 (Fictional internal test identifier, not a valid CIN)

PARTICULARS OF SUPPLY:
Invoice Reference: INV-2026-104
Invoice Due Date: 25 August 2026
Consignment: 100 units Commercial Switchgear Hardware
Invoice Face Value: ₹50,000/- (Rupees Fifty Thousand only)

SETTLEMENT ENDORSEMENT:
Payment Status: Invoice INV-2026-104 was fully paid on 25 August 2026 via transaction reference TXN123.
Settlement Mode: Direct Electronic Transfer
Authorized Receiving Officer Stamp & Signature affixed.`,
    pageCount: 1,
    paragraphs: [
      { index: 1, text: 'COMMERCIAL GOODS DELIVERY & SETTLEMENT RECEIPT Ref No: GRN-2026-9914' },
      { index: 2, text: 'CONSIGNOR: Aster Supplies Private Limited, Lucknow. CONSIGNEE: Northstar Retail Private Limited, Kanpur.' },
      { index: 3, text: 'Invoice Reference: INV-2026-104, Face Value: ₹50,000, Due Date: 25 August 2026.' },
      { index: 4, text: 'Payment Status: Invoice INV-2026-104 was fully paid on 25 August 2026 via transaction reference TXN123.' },
    ],
    ocrApplied: false,
    securityValidation: {
      isValidSignature: true,
      detectedType: 'application/pdf',
      fileSizeOk: true,
      sanitized: true,
    },
  },
  {
    id: 'doc-demo-c1-statement',
    caseId: 'case-demo-001',
    originalFilename: 'Document_B_Accounts_Receivable_Statement.pdf',
    fileSize: 52400,
    mimeType: 'application/pdf',
    uploadedAt: '2026-08-30T10:15:00Z',
    status: 'EXTRACTED',
    documentCategory: 'PRIMARY_DOCUMENT',
    reviewStatus: 'UNREVIEWED',
    sourceProvenance: 'Aster Supplies Central Accounting Ledger Export',
    extractedText: `ASTER SUPPLIES PRIVATE LIMITED
ACCOUNTS RECEIVABLE & DEBTOR AUDIT STATEMENT
Audit Date: 30 August 2026
Account Code: AST-UP-204
Proposed Venue: Lucknow, Uttar Pradesh (Jurisdiction not legally established)

DEBTOR PARTICULARS:
M/s Northstar Retail Private Limited
202 Sample Trade Centre, Kanpur, Uttar Pradesh, 208001
Identifier: DEMO-NORTHSTAR-002

LEDGER SCHEDULE OF OVERDUE INVOICES:
Invoice Number: INV-2026-104
Invoice Date: 25 July 2026
Payment Deadline: 25 August 2026
Principal Amount Overdue: ₹50,000/- (Rupees Fifty Thousand only)

ACCOUNT STATUS REMARK:
Payment Status: Invoice INV-2026-104 remains pending and unpaid as of 30 August 2026.
Zero credits received against Invoice INV-2026-104. Debtor reminder notice issued.
The underlying bank records and authenticity of both documents have not been independently verified.`,
    pageCount: 1,
    paragraphs: [
      { index: 1, text: 'ASTER SUPPLIES PRIVATE LIMITED ACCOUNTS RECEIVABLE AUDIT STATEMENT Date: 30 August 2026' },
      { index: 2, text: 'Debtor: Northstar Retail Private Limited, Kanpur.' },
      { index: 3, text: 'Invoice Number: INV-2026-104, Deadline: 25 August 2026, Amount Overdue: ₹50,000.' },
      { index: 4, text: 'Payment Status: Invoice INV-2026-104 remains pending and unpaid as of 30 August 2026. Zero credits received.' },
    ],
    ocrApplied: false,
    securityValidation: {
      isValidSignature: true,
      detectedType: 'application/pdf',
      fileSizeOk: true,
      sanitized: true,
    },
  },
  {
    id: 'doc-demo-c1-dock-receipt-scan',
    caseId: 'case-demo-001',
    originalFilename: 'Document_C_Consignee_Stamped_Receipt.png',
    fileSize: 64200,
    mimeType: 'image/png',
    uploadedAt: '2026-08-31T09:00:00Z',
    status: 'EXTRACTED',
    documentCategory: 'IMAGE_EVIDENCE',
    reviewStatus: 'UNREVIEWED',
    sourceProvenance: 'Northstar Receiving Hub Stamped Physical Docket Scan',
    isImage: true,
    imageDataUri: DEMO_IMG_CASE_1_RECEIPT,
    imageMetadata: {
      format: 'png',
      width: 800,
      height: 500,
      ocrEngine: 'Deterministic Optical Parser v2.1',
      extractionConfidence: 98,
      colorSpace: 'sRGB',
      hasExif: false,
    },
    extractedText: `COMMERCIAL GOODS DELIVERY & SETTLEMENT RECEIPT
Ref No: GRN-2026-9914 | Date: 25 August 2026
Consignee: Northstar Retail Hub, Kanpur
Invoice Reference: INV-2026-104 | Amount: ₹50,000
Payment Status: Invoice INV-2026-104 was fully paid on 25 August 2026 via transaction reference TXN123.
Authorized Receiving Officer Stamp & Signature Affixed.`,
    pageCount: 1,
    paragraphs: [
      { index: 1, text: 'COMMERCIAL GOODS DELIVERY & SETTLEMENT RECEIPT Date: 25 August 2026' },
      { index: 2, text: 'Invoice INV-2026-104 fully paid on 25 August 2026 via TXN123.' },
    ],
    ocrApplied: true,
    ocrConfidence: 98,
    securityValidation: {
      isValidSignature: true,
      detectedType: 'image/png',
      fileSizeOk: true,
      sanitized: true,
    },
  },
];

/* =========================================================================
   CASE 2: EMPLOYMENT AND SALARY DISPUTE (DM-DEMO-002)
   Priya Sharma v. Meridian Digital Services Private Limited
   ========================================================================= */

const CASE_2_DOCUMENTS: CaseDocument[] = [
  {
    id: 'doc-demo-c2-salary-statement',
    caseId: 'case-demo-002',
    originalFilename: 'Document_A_Employee_Salary_Statement_August_2026.docx',
    fileSize: 31200,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    uploadedAt: '2026-09-02T11:00:00Z',
    status: 'EXTRACTED',
    documentCategory: 'PRIMARY_DOCUMENT',
    reviewStatus: 'UNREVIEWED',
    sourceProvenance: 'Meridian Monthly Employee Statement',
    extractedText: `MERIDIAN DIGITAL SERVICES PRIVATE LIMITED
EMPLOYEE MONTHLY PAYROLL STATEMENT
Period: 01 August 2026 to 31 August 2026
Statement Date: 02 September 2026

EMPLOYEE DETAILS:
Name: Priya Sharma
Role: Software Associate
Address: 14 Sample Residency, Lucknow, Uttar Pradesh, 226001
Internal ID: DEMO-EMPLOYEE-002 (Fictional internal identifier; not government-issued ID)
Employment Tenure: 1 January 2026 to 31 August 2026

SALARY SUMMARY:
Designated Monthly Salary: ₹35,000/- (Rupees Thirty Five Thousand only)
Pay Days in Month: 31 Days
Deductions: Nil

DISBURSEMENT STATUS:
Payment Status: Salary for August 2026 is unpaid as of 02 September 2026.
Payment Mode: Bank Account Direct Credit (Pending Authorization)`,
    pageCount: 1,
    paragraphs: [
      { index: 1, text: 'MERIDIAN DIGITAL SERVICES PRIVATE LIMITED - MONTHLY PAYROLL STATEMENT' },
      { index: 2, text: 'Employee: Priya Sharma, 14 Sample Residency, Lucknow, UP. Tenure: 1 January 2026 to 31 August 2026.' },
      { index: 3, text: 'Designated Monthly Salary: ₹35,000/-.' },
      { index: 4, text: 'Payment Status: Salary for August 2026 is unpaid as of 02 September 2026.' },
    ],
    ocrApplied: false,
    securityValidation: {
      isValidSignature: true,
      detectedType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileSizeOk: true,
      sanitized: true,
    },
  },
  {
    id: 'doc-demo-c2-payroll-email',
    caseId: 'case-demo-002',
    originalFilename: 'Document_B_Payroll_Department_Notification_Email.docx',
    fileSize: 28400,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    uploadedAt: '2026-09-06T15:20:00Z',
    status: 'EXTRACTED',
    documentCategory: 'CORRESPONDENCE',
    reviewStatus: 'UNREVIEWED',
    sourceProvenance: 'Employer Payroll Broadcast System',
    extractedText: `FROM: payroll@meridiandigital.com
TO: priya.sharma@samplemail.com
DATE: 06 September 2026
SUBJECT: Salary Advice for August 2026

Dear Priya Sharma,

This communication is to notify you regarding your monthly compensation:
Designated Monthly Salary: ₹35,000/-
Status: Salary was processed on 5 September 2026 through the central payroll batch.

EVIDENTIARY LIMITATION NOTE:
No bank statement or payment confirmation has been supplied.
Payroll processing denotes batch execution and does not prove that funds were credited to the recipient's bank account.`,
    pageCount: 1,
    paragraphs: [
      { index: 1, text: 'From: payroll@meridiandigital.com To: priya.sharma@samplemail.com Date: 06 September 2026' },
      { index: 2, text: 'Monthly Salary: ₹35,000. Status: Salary was processed on 5 September 2026 through the central payroll batch.' },
      { index: 3, text: 'No bank statement or payment confirmation has been supplied.' },
    ],
    ocrApplied: false,
    securityValidation: {
      isValidSignature: true,
      detectedType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileSizeOk: true,
      sanitized: true,
    },
  },
  {
    id: 'doc-demo-c2-appointment-letter',
    caseId: 'case-demo-002',
    originalFilename: 'Document_C_Appointment_Letter_Clause_Extract.pdf',
    fileSize: 45000,
    mimeType: 'application/pdf',
    uploadedAt: '2026-01-01T09:00:00Z',
    status: 'EXTRACTED',
    documentCategory: 'PRIMARY_DOCUMENT',
    reviewStatus: 'UNREVIEWED',
    sourceProvenance: 'Original Employment Contract',
    extractedText: `MERIDIAN DIGITAL SERVICES PRIVATE LIMITED
303 Sample Corporate Plaza, Noida, Uttar Pradesh, 201301
Internal ID: DEMO-EMPLOYER-002 (Fictional internal test identifier, not a valid CIN)

APPOINTMENT LETTER
Date of Issue: 1 January 2026
To: Ms. Priya Sharma, Lucknow, Uttar Pradesh

Clause 3: Compensation
Your gross monthly salary shall be ₹35,000/- (Rupees Thirty Five Thousand only) payable at the end of each calendar month.

Clause 6: Separation & Notice Period
Either party may terminate the employment engagement by providing a 30-day notice period in writing or gross salary in lieu thereof.

EVIDENTIARY GAP:
The supplied documents do not establish whether notice was given, waived, or completed.`,
    pageCount: 1,
    paragraphs: [
      { index: 1, text: 'MERIDIAN DIGITAL SERVICES PRIVATE LIMITED - APPOINTMENT LETTER Date: 1 January 2026' },
      { index: 2, text: 'Clause 3: Monthly salary ₹35,000/-.' },
      { index: 3, text: 'Clause 6: 30-day notice period in writing or gross salary in lieu thereof.' },
      { index: 4, text: 'The supplied documents do not establish whether notice was given, waived, or completed.' },
    ],
    ocrApplied: false,
    securityValidation: {
      isValidSignature: true,
      detectedType: 'application/pdf',
      fileSizeOk: true,
      sanitized: true,
    },
  },
  {
    id: 'doc-demo-c2-hr-email',
    caseId: 'case-demo-002',
    originalFilename: 'Document_D_HR_Exit_Coordination_Email.docx',
    fileSize: 26500,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    uploadedAt: '2026-09-08T16:00:00Z',
    status: 'EXTRACTED',
    documentCategory: 'CORRESPONDENCE',
    reviewStatus: 'UNREVIEWED',
    sourceProvenance: 'HR Operations Email Thread',
    extractedText: `FROM: hr.operations@meridiandigital.com
TO: priya.sharma@samplemail.com
DATE: 05-____-2026
SUBJECT: Exit Clearance & Timeline Review

Dear Priya,

Regarding your separation from Meridian Digital Services:
1. Incomplete Record Date: Date: 05-____-2026.
2. Timeline Discrepancy: Internal clearance form records employee final working day: 15 August 2026, whereas salary ledger records tenure until 31 August 2026.
3. Handover verification remains open pending clarification of the 30-day notice period compliance.`,
    pageCount: 1,
    paragraphs: [
      { index: 1, text: 'Exit Clearance & Timeline Review. Date: 05-____-2026.' },
      { index: 2, text: 'Timeline Discrepancy: Internal clearance form records final working day: 15 August 2026.' },
      { index: 3, text: 'Handover verification remains open pending clarification of the 30-day notice period compliance.' },
    ],
    ocrApplied: false,
    securityValidation: {
      isValidSignature: true,
      detectedType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileSizeOk: true,
      sanitized: true,
    },
  },
  {
    id: 'doc-demo-c2-mobile-screenshot',
    caseId: 'case-demo-002',
    originalFilename: 'Document_E_Payroll_Mobile_Notification.png',
    fileSize: 69200,
    mimeType: 'image/png',
    uploadedAt: '2026-09-09T09:30:00Z',
    status: 'EXTRACTED',
    documentCategory: 'IMAGE_EVIDENCE',
    reviewStatus: 'UNREVIEWED',
    sourceProvenance: 'Meridian Pulse Mobile HR App Screenshot',
    isImage: true,
    imageDataUri: DEMO_IMG_CASE_2_PAYROLL_NOTIFICATION,
    imageMetadata: {
      format: 'png',
      width: 780,
      height: 480,
      ocrEngine: 'Deterministic Optical Parser v2.1',
      extractionConfidence: 96,
      colorSpace: 'sRGB',
      hasExif: false,
    },
    extractedText: `MERIDIAN HR PULSE - PAYROLL STATUS
Employee: Priya Sharma (DEMO-EMP-002)
Month: August 2026 | Amount: ₹35,000/-
Status: Batch Processed on 05-Sep-2026.
Notice: Processing signifies batch dispatch; recipient bank credit confirmation not yet verified.`,
    pageCount: 1,
    paragraphs: [
      { index: 1, text: 'MERIDIAN HR PULSE Employee: Priya Sharma Month: August 2026 Amount: ₹35,000' },
      { index: 2, text: 'Status: Batch Processed on 05-Sep-2026. Bank credit unverified.' },
    ],
    ocrApplied: true,
    ocrConfidence: 96,
    securityValidation: {
      isValidSignature: true,
      detectedType: 'image/png',
      fileSizeOk: true,
      sanitized: true,
    },
  },
];

/* =========================================================================
   CASE 3: RENTAL SECURITY DEPOSIT DISPUTE (DM-DEMO-003)
   Rahul Verma v. Greenview Properties
   ========================================================================= */

const CASE_3_DOCUMENTS: CaseDocument[] = [
  {
    id: 'doc-demo-c3-checklist',
    caseId: 'case-demo-003',
    originalFilename: 'Document_A_MoveOut_Email_Handover_Checklist.pdf',
    fileSize: 42100,
    mimeType: 'application/pdf',
    uploadedAt: '2026-08-31T17:00:00Z',
    status: 'EXTRACTED',
    documentCategory: 'PRIMARY_DOCUMENT',
    reviewStatus: 'UNREVIEWED',
    sourceProvenance: 'Apartment Move-out Handover Form',
    extractedText: `TENANCY VACATION & KEY HANDOVER ACKNOWLEDGMENT
Property: Flat 4B, Sample Apartments, Lucknow, Uttar Pradesh, 226001
Move-out Date: 31 August 2026

TENANT:
Rahul Verma
Internal ID: DEMO-TENANT-003 (Fictional internal identifier; not government-issued ID)

PROPERTY MANAGER / LANDLORD:
Greenview Properties
404 Sample Commercial Complex, Lucknow, Uttar Pradesh, 226001
Internal ID: DEMO-LANDLORD-003 (Fictional internal identifier; not a registered company number)

RECORD OF HANDOVER:
Tenant Rahul Verma returned the keys on 31 August 2026 upon vacating the premises.
The rental agreement dated 1 February 2026 mentions that refundable security deposit is subject to permitted deductions.

HANDOVER CHECKLIST CLAIMED DEDUCTIONS:
1. Deep Cleaning Charges: ₹2,000/-
2. Wall Painting & Touch-up Repair Charges: ₹3,000/-

EVIDENTIARY LIMITATION NOTE:
No supporting contractor invoices or move-out photographs have been supplied for cleaning or repairs.`,
    pageCount: 1,
    paragraphs: [
      { index: 1, text: 'TENANCY VACATION ACKNOWLEDGMENT Move-out Date: 31 August 2026 Property: Flat 4B, Sample Apartments, Lucknow.' },
      { index: 2, text: 'Tenant: Rahul Verma. Landlord: Greenview Properties.' },
      { index: 3, text: 'Cleaning charges: ₹2,000/-. Repair charges: ₹3,000/-.' },
      { index: 4, text: 'No supporting contractor invoices or move-out photographs have been supplied.' },
    ],
    ocrApplied: false,
    securityValidation: {
      isValidSignature: true,
      detectedType: 'application/pdf',
      fileSizeOk: true,
      sanitized: true,
    },
  },
  {
    id: 'doc-demo-c3-settlement',
    caseId: 'case-demo-003',
    originalFilename: 'Document_B_Draft_Security_Deposit_Settlement_Statement.docx',
    fileSize: 34000,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    uploadedAt: '2026-09-02T12:30:00Z',
    status: 'EXTRACTED',
    documentCategory: 'PRIMARY_DOCUMENT',
    reviewStatus: 'UNREVIEWED',
    sourceProvenance: 'Greenview Draft Accounting Schedule',
    extractedText: `GREENVIEW PROPERTIES - DRAFT SECURITY DEPOSIT SETTLEMENT
Date: 02 September 2026
Tenant Name: Rahul Verma
Tenancy Agreement Date: 1 February 2026
Premises: Flat 4B, Sample Apartments, Lucknow, Uttar Pradesh, 226001

ARITHMETIC RECONCILIATION SCHEDULE:
1. Initial Security Deposit Paid: ₹30,000/-
2. Less: Cleaning Charges: ₹2,000/-
3. Less: Repair Charges: ₹3,000/-

CALCULATED PROPOSED REFUND:
₹30,000 − ₹2,000 − ₹3,000 = Proposed refund: ₹25,000/- (Rupees Twenty Five Thousand only).

NOTE:
Arithmetic consistency is verified, but contractual basis and actual expenditure for deductions remain unverified.`,
    pageCount: 1,
    paragraphs: [
      { index: 1, text: 'GREENVIEW PROPERTIES - DRAFT SECURITY DEPOSIT SETTLEMENT Date: 02 September 2026' },
      { index: 2, text: 'Agreement Date: 1 February 2026. Security Deposit: ₹30,000.' },
      { index: 3, text: 'Cleaning charges: ₹2,000. Repair charges: ₹3,000.' },
      { index: 4, text: 'Proposed refund: ₹25,000. (Calculation: 30,000 - 2,000 - 3,000 = 25,000).' },
    ],
    ocrApplied: false,
    securityValidation: {
      isValidSignature: true,
      detectedType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileSizeOk: true,
      sanitized: true,
    },
  },
  {
    id: 'doc-demo-c3-landlord-msg',
    caseId: 'case-demo-003',
    originalFilename: 'Document_C_Handover_Deductions_Sheet.png',
    fileSize: 71200,
    mimeType: 'image/png',
    uploadedAt: '2026-09-04T09:45:00Z',
    status: 'EXTRACTED',
    documentCategory: 'IMAGE_EVIDENCE',
    reviewStatus: 'UNREVIEWED',
    sourceProvenance: 'Greenview Properties Move-Out Inspection Schedule Image',
    isImage: true,
    imageDataUri: DEMO_IMG_CASE_3_DEDUCTION_SHEET,
    imageMetadata: {
      format: 'png',
      width: 800,
      height: 500,
      ocrEngine: 'Deterministic Optical Parser v2.1',
      extractionConfidence: 97,
      colorSpace: 'sRGB',
      hasExif: false,
    },
    extractedText: `GREENVIEW MOVE-OUT DEDUCTION SCHEDULE
Premises: Flat 4B, Sample Apartments | Move-out: 31-Aug-2026
Base Deposit Paid: ₹30,000
Cleaning Deductions: ₹2,000 | Repair Deductions: ₹3,000
Arithmetic Balance: ₹25,000
Management Override Note: Only ₹20,000 will be returned as refund. Remittance scheduled shortly.
Evidentiary Deficit: Additional ₹5,000 deduction lacks contractor invoices or move-out photos.`,
    pageCount: 1,
    paragraphs: [
      { index: 1, text: 'GREENVIEW MOVE-OUT DEDUCTION SCHEDULE Premises: Flat 4B Base Deposit: ₹30,000' },
      { index: 2, text: 'Cleaning: ₹2,000. Repairs: ₹3,000. Calculated Refund: ₹25,000.' },
      { index: 3, text: 'Only ₹20,000 will be returned as refund. No supporting contractor invoices provided.' },
    ],
    ocrApplied: true,
    ocrConfidence: 97,
    securityValidation: {
      isValidSignature: true,
      detectedType: 'image/png',
      fileSizeOk: true,
      sanitized: true,
    },
  },
];

/* =========================================================================
   CASE 4: CONSUMER DEFECTIVE GOODS & TRANSIT DAMAGE DISPUTE (DM-DEMO-004)
   Ananya Mehta v. BrightCart Electronics Private Limited
   ========================================================================= */

const CASE_4_DOCUMENTS: CaseDocument[] = [
  {
    id: 'doc-demo-c4-invoice',
    caseId: 'case-demo-004',
    originalFilename: 'Tax_Invoice_BC_2026_9011.pdf',
    fileSize: 46200,
    mimeType: 'application/pdf',
    uploadedAt: '2026-09-08T10:00:00Z',
    status: 'EXTRACTED',
    documentCategory: 'PRIMARY_DOCUMENT',
    reviewStatus: 'UNREVIEWED',
    sourceProvenance: 'BrightCart Order Confirmation & GST Tax Invoice',
    extractedText: `BRIGHTCART ELECTRONICS PRIVATE LIMITED
GST TAX INVOICE
Invoice No: INV-BC-9011
Date: 08 September 2026
Seller GSTIN: 07AAACB1234F1Z8 (Fictional test GSTIN)
Fulfillment Center: Okhla Industrial Area, New Delhi

BUYER / CONSUMER:
Ananya Mehta
Flat 12B, Metro Enclave, Saket, New Delhi, 110017
Consumer ID: DEMO-CONS-004

ORDER PARTICULARS:
Item Description: UltraBook Pro 15 (16GB RAM / 1TB SSD / 4K IPS Display)
Serial No: UB-2026-X994
Invoice Amount: ₹60,000/- (Rupees Sixty Thousand only)
Delivery Promised: By 12 September 2026
Payment Mode: Prepaid Credit Card (Fully Paid)

WARRANTY & RETURN POLICY:
Standard 1-year manufacturer warranty. Replacement requests must be submitted within 7 days of delivery.
Transit insurance covered by merchant logistics partner.`,
    pageCount: 1,
    paragraphs: [
      { index: 1, text: 'BRIGHTCART ELECTRONICS - TAX INVOICE Invoice No: INV-BC-9011 Date: 08 September 2026' },
      { index: 2, text: 'Buyer: Ananya Mehta, Saket, New Delhi. Consideration: ₹60,000 paid in full.' },
      { index: 3, text: 'Item: UltraBook Pro 15. Serial No: UB-2026-X994.' },
    ],
    ocrApplied: false,
    securityValidation: { isValidSignature: true, detectedType: 'application/pdf', fileSizeOk: true, sanitized: true },
  },
  {
    id: 'doc-demo-c4-pod',
    caseId: 'case-demo-004',
    originalFilename: 'Courier_Delivery_POD_Signoff.pdf',
    fileSize: 38400,
    mimeType: 'application/pdf',
    uploadedAt: '2026-09-12T18:30:00Z',
    status: 'EXTRACTED',
    documentCategory: 'PRIMARY_DOCUMENT',
    reviewStatus: 'UNREVIEWED',
    sourceProvenance: 'Express Logistics Courier Mobile Sign-off Terminal',
    extractedText: `EXPRESS LOGISTICS COURIER RUNSHEET & POD
AWB Tracking No: EXP-DEL-883912
Delivery Date & Time: 12 September 2026, 18:22 IST
Consignee: Ananya Mehta, Saket, New Delhi

DELIVERY STATUS & POD REMARK:
Status: Delivered in Good Condition.
Package Status: POD confirms package delivered in good condition with intact security seal.
Recipient Signature: Digital Stylus Signature captured at doorstep.
Delivery Agent ID: DL-AGENT-441`,
    pageCount: 1,
    paragraphs: [
      { index: 1, text: 'EXPRESS LOGISTICS COURIER POD AWB: EXP-DEL-883912 Date: 12 September 2026, 18:22 IST' },
      { index: 2, text: 'Consignee: Ananya Mehta. Status: Delivered in good condition.' },
      { index: 3, text: 'POD confirms package delivered in good condition with intact security seal.' },
    ],
    ocrApplied: false,
    securityValidation: { isValidSignature: true, detectedType: 'application/pdf', fileSizeOk: true, sanitized: true },
  },
  {
    id: 'doc-demo-c4-chat-doc',
    caseId: 'case-demo-004',
    originalFilename: 'Seller_Support_Chat_Transcript.docx',
    fileSize: 29500,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    uploadedAt: '2026-09-13T10:15:00Z',
    status: 'EXTRACTED',
    documentCategory: 'CORRESPONDENCE',
    reviewStatus: 'UNREVIEWED',
    sourceProvenance: 'BrightCart in-app chat export',
    extractedText: `BRIGHTCART IN-APP CUSTOMER SERVICE TICKET
Ticket Reference: TKT-2026-4402
Date: 13 September 2026
Customer: Ananya Mehta

CHAT LOG:
[12 Sept 19:48] Customer: "I opened the delivery box immediately. The laptop display is completely shattered! Broken display with spiderweb cracks across the screen. I need an immediate replacement."
[13 Sept 09:30] Support Agent: "We reviewed the delivery logs. The courier POD confirms package delivered in good condition with no outer damage reported at delivery. Physical screen damage is excluded from return policy once clean POD is signed."
[13 Sept 09:35] Customer: "The outer carton was not noticeably crushed, but when turned on, the screen is broken display. Please send a technician."
[13 Sept 09:40] Support Agent: "Ticket closed as customer-induced physical damage per policy."`,
    pageCount: 1,
    paragraphs: [
      { index: 1, text: 'BRIGHTCART CUSTOMER SERVICE TICKET TKT-2026-4402 Date: 13 September 2026' },
      { index: 2, text: 'Customer: The laptop display is completely shattered! Broken display with spiderweb cracks across the screen.' },
      { index: 3, text: 'Support: Courier POD confirms package delivered in good condition. Physical screen damage excluded once clean POD signed.' },
    ],
    ocrApplied: false,
    securityValidation: { isValidSignature: true, detectedType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', fileSizeOk: true, sanitized: true },
  },
  {
    id: 'doc-demo-c4-seller-chat-img',
    caseId: 'case-demo-004',
    originalFilename: 'BrightCart_Support_Chat_Screenshot.png',
    fileSize: 72400,
    mimeType: 'image/png',
    uploadedAt: '2026-09-13T11:00:00Z',
    status: 'EXTRACTED',
    documentCategory: 'IMAGE_EVIDENCE',
    reviewStatus: 'UNREVIEWED',
    sourceProvenance: 'Customer Mobile Screenshot of BrightCart In-App Helpdesk',
    isImage: true,
    imageDataUri: DEMO_IMG_CASE_4_SELLER_CHAT,
    imageMetadata: {
      format: 'png',
      width: 780,
      height: 480,
      ocrEngine: 'Deterministic Optical Parser v2.1',
      extractionConfidence: 96,
      colorSpace: 'sRGB',
      hasExif: false,
    },
    extractedText: `BRIGHTCART HELPDESK CHAT TRANSCRIPT
Ticket: TKT-2026-4402 | Date: 13-Sep-2026
Customer: "Laptop display has severe diagonal spiderweb glass cracks straight out of the box."
BrightCart Support: "Clean delivery POD signed on 12-Sep-2026. Delivered in good condition. Damage claims rejected."`,
    pageCount: 1,
    paragraphs: [
      { index: 1, text: 'BRIGHTCART HELPDESK CHAT TRANSCRIPT Ticket: TKT-2026-4402 Date: 13-Sep-2026' },
      { index: 2, text: 'Customer: Laptop display has severe diagonal spiderweb glass cracks straight out of the box.' },
      { index: 3, text: 'BrightCart Support: Clean delivery POD signed. Delivered in good condition. Damage claims rejected.' },
    ],
    ocrApplied: true,
    ocrConfidence: 96,
    securityValidation: { isValidSignature: true, detectedType: 'image/png', fileSizeOk: true, sanitized: true },
  },
  {
    id: 'doc-demo-c4-laptop-photo',
    caseId: 'case-demo-004',
    originalFilename: 'Cracked_Display_Evidence_Photo.jpg',
    fileSize: 84500,
    mimeType: 'image/jpeg',
    uploadedAt: '2026-09-12T19:50:00Z',
    status: 'EXTRACTED',
    documentCategory: 'IMAGE_EVIDENCE',
    reviewStatus: 'UNREVIEWED',
    sourceProvenance: 'Customer Smartphone High-Resolution Capture of Unboxed Laptop',
    isImage: true,
    imageDataUri: DEMO_IMG_CASE_4_CRACKED_LAPTOP,
    imageMetadata: {
      format: 'jpeg',
      width: 800,
      height: 520,
      ocrEngine: 'Deterministic Optical Parser v2.1',
      extractionConfidence: 95,
      colorSpace: 'sRGB',
      hasExif: false,
    },
    extractedText: `EVIDENCE PHOTOGRAPH: CRACKED LAPTOP DISPLAY
Date & Timestamp: 12 September 2026, 19:45:10 IST
Hardware Model: UltraBook Pro 15
Visual Inspection: Display severely cracked with radiating spiderweb glass fractures across lower-right IPS matrix.
Physical condition: Broken display with internal LCD bleed.
Evidentiary Limitation: Photographic evidence proves damage at time of photo, but does not independently establish whether fracture occurred pre-dispatch, in transit, or post-unboxing. No technical inspection report attached.`,
    pageCount: 1,
    paragraphs: [
      { index: 1, text: 'EVIDENCE PHOTOGRAPH: CRACKED LAPTOP DISPLAY Date: 12 September 2026, 19:45:10 IST' },
      { index: 2, text: 'Visual Inspection: Display severely cracked with radiating spiderweb glass fractures. Broken display.' },
      { index: 3, text: 'Evidentiary Limitation: Photograph proves damage at time of photo but does not establish whether damage occurred pre-dispatch, in transit, or post-delivery.' },
    ],
    ocrApplied: true,
    ocrConfidence: 95,
    securityValidation: { isValidSignature: true, detectedType: 'image/jpeg', fileSizeOk: true, sanitized: true },
  },
];

/* =========================================================================
   CASE 5: PERSONAL LOAN & ACCOUNT RECONCILIATION DISPUTE (DM-DEMO-005)
   Arjun Malhotra v. Karan Sethi
   ========================================================================= */

const CASE_5_DOCUMENTS: CaseDocument[] = [
  {
    id: 'doc-demo-c5-loan-ack',
    caseId: 'case-demo-005',
    originalFilename: 'Loan_Acknowledgement_Note.pdf',
    fileSize: 41200,
    mimeType: 'application/pdf',
    uploadedAt: '2026-05-15T11:00:00Z',
    status: 'EXTRACTED',
    documentCategory: 'PRIMARY_DOCUMENT',
    reviewStatus: 'UNREVIEWED',
    sourceProvenance: 'Executed Private Loan Memorandum',
    extractedText: `FRIENDLY FINANCIAL ASSISTANCE ACKNOWLEDGEMENT
Date: 15 May 2026
Place: Gurugram, Haryana

PARTIES:
Lender: Arjun Malhotra, Sector 56, Gurugram, Haryana (DEMO-LENDER-005)
Borrower: Karan Sethi, Greater Kailash-I, New Delhi (DEMO-BORROWER-005)

ACKNOWLEDGEMENT OF INDEBTEDNESS:
I, Karan Sethi, hereby acknowledge the receipt of friendly financial assistance of ₹80,000/- (Rupees Eighty Thousand only) from Arjun Malhotra to meet urgent temporary working capital requirements.

TERMS OF REPAYMENT:
The borrower agrees to repay the acknowledged total loan of ₹80,000/- within a reasonable period.
No contractual interest specified.
Disbursement breakdown: Part transferred electronically, part handed over directly.`,
    pageCount: 1,
    paragraphs: [
      { index: 1, text: 'FRIENDLY FINANCIAL ASSISTANCE ACKNOWLEDGEMENT Date: 15 May 2026 Gurugram' },
      { index: 2, text: 'Lender: Arjun Malhotra. Borrower: Karan Sethi.' },
      { index: 3, text: 'I acknowledge the receipt of friendly financial assistance of ₹80,000/- from Arjun Malhotra.' },
      { index: 4, text: 'Acknowledged total loan of ₹80,000/- within a reasonable period.' },
    ],
    ocrApplied: false,
    securityValidation: { isValidSignature: true, detectedType: 'application/pdf', fileSizeOk: true, sanitized: true },
  },
  {
    id: 'doc-demo-c5-upi-transfer',
    caseId: 'case-demo-005',
    originalFilename: 'Bank_UPI_Transfer_Confirmation.png',
    fileSize: 74200,
    mimeType: 'image/png',
    uploadedAt: '2026-05-15T12:45:00Z',
    status: 'EXTRACTED',
    documentCategory: 'IMAGE_EVIDENCE',
    reviewStatus: 'UNREVIEWED',
    sourceProvenance: 'HDFC Mobile Banking App Payment Receipt Screenshot',
    isImage: true,
    imageDataUri: DEMO_IMG_CASE_5_BANK_TRANSFER,
    imageMetadata: {
      format: 'png',
      width: 780,
      height: 480,
      ocrEngine: 'Deterministic Optical Parser v2.1',
      extractionConfidence: 98,
      colorSpace: 'sRGB',
      hasExif: false,
    },
    extractedText: `BHIM UPI PAYMENT CONFIRMATION
Remitter: Arjun Malhotra (A/c ending 4821)
Beneficiary: Karan Sethi (karan.sethi@okhdfcbank)
Date & Time: 15 May 2026, 12:42:19 IST
UPI Ref: UPI-2026-99482103
Payment Status: Payment successful to Karan Sethi
Amount: ₹50,000/- (Rupees Fifty Thousand only)
Evidentiary Note: Primary electronic banking evidence confirms transfer of ₹50,000. Balance of ₹30,000 is not reflected in electronic bank statement.`,
    pageCount: 1,
    paragraphs: [
      { index: 1, text: 'BHIM UPI PAYMENT CONFIRMATION Date: 15 May 2026, 12:42:19 IST' },
      { index: 2, text: 'Beneficiary: Karan Sethi. UPI Ref: UPI-2026-99482103.' },
      { index: 3, text: 'Payment successful to Karan Sethi. Amount: ₹50,000/-.' },
    ],
    ocrApplied: true,
    ocrConfidence: 98,
    securityValidation: { isValidSignature: true, detectedType: 'image/png', fileSizeOk: true, sanitized: true },
  },
  {
    id: 'doc-demo-c5-chat-log',
    caseId: 'case-demo-005',
    originalFilename: 'Informal_Repayment_Chat_Log.docx',
    fileSize: 31000,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    uploadedAt: '2026-08-10T14:20:00Z',
    status: 'EXTRACTED',
    documentCategory: 'CORRESPONDENCE',
    reviewStatus: 'UNREVIEWED',
    sourceProvenance: 'WhatsApp Messenger chat export',
    extractedText: `WHATSAPP MESSENGER CHAT LOG
Between: Arjun Malhotra & Karan Sethi
Period: 15 May 2026 to 08 August 2026

TRANSCRIPT:
[15 May 14:10] Arjun: "I transferred ₹50,000 via UPI just now. The remaining ₹30,000 was paid in cash when we met at Galleria Market."
[15 May 14:15] Karan: "Got the UPI amount. Thanks brother, really appreciate the help."
[01 July 11:30] Arjun: "Hey Karan, any update on returning the ₹80k loan? It has been over 6 weeks."
[02 July 17:05] Karan: "Hey, stuck in project billing delays. Don't worry, will return the amount next month as soon as client clears milestone 2."
[08 Aug 19:12] Arjun: "August is ending Karan. Please transfer the funds."
[08 Aug 21:00] Karan: "Still awaiting client payment. Need more time."

EVIDENTIARY DEFICIT:
1. Alleged cash disbursement of ₹30,000 has no withdrawal slip, stamped receipt, or revenue stamp.
2. Repayment statement "will return the amount next month" is ambiguous without a fixed calendar maturity date.
3. Chat export lacks statutory certificate under Section 63 BSA 2023 / Section 65B Indian Evidence Act.`,
    pageCount: 1,
    paragraphs: [
      { index: 1, text: 'WHATSAPP MESSENGER CHAT LOG Between: Arjun Malhotra & Karan Sethi' },
      { index: 2, text: 'Arjun: I transferred ₹50,000 via UPI. Remaining ₹30,000 was paid in cash.' },
      { index: 3, text: 'Karan: Will return the amount next month as soon as client clears milestone 2.' },
    ],
    ocrApplied: false,
    securityValidation: { isValidSignature: true, detectedType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', fileSizeOk: true, sanitized: true },
  },
  {
    id: 'doc-demo-c5-ledger',
    caseId: 'case-demo-005',
    originalFilename: 'Lender_Informal_Ledger.pdf',
    fileSize: 37800,
    mimeType: 'application/pdf',
    uploadedAt: '2026-08-15T09:30:00Z',
    status: 'EXTRACTED',
    documentCategory: 'PRIMARY_DOCUMENT',
    reviewStatus: 'UNREVIEWED',
    sourceProvenance: 'Lender Personal Notes & Account Summary',
    extractedText: `MEMORANDUM OF RECEIVABLE
Account: Karan Sethi
Claimed Principal: ₹80,000/-
15-May-2026: UPI Transfer Ref UPI-2026-994821: ₹50,000/-
15-May-2026: Given in cash: ₹30,000/-
Repayment Status: Zero repayments received. Entire ₹80,000 remains outstanding.
Limitation: Unilateral ledger entry. Cash portion lacks counter-signature.`,
    pageCount: 1,
    paragraphs: [
      { index: 1, text: 'MEMORANDUM OF RECEIVABLE Account: Karan Sethi Claimed Principal: ₹80,000/-' },
      { index: 2, text: '15-May-2026: UPI Transfer: ₹50,000/-. Given in cash: ₹30,000/-.' },
      { index: 3, text: 'Limitation: Unilateral ledger entry. Cash portion lacks counter-signature.' },
    ],
    ocrApplied: false,
    securityValidation: { isValidSignature: true, detectedType: 'application/pdf', fileSizeOk: true, sanitized: true },
  },
];

/* =========================================================================
   CASE 6: GOODS DELIVERY SHORTFALL & LOGISTICS DAMAGE (DM-DEMO-006)
   Silverline Components v. Dev Industrial Services Private Limited
   ========================================================================= */

const CASE_6_DOCUMENTS: CaseDocument[] = [
  {
    id: 'doc-demo-c6-po',
    caseId: 'case-demo-006',
    originalFilename: 'Purchase_Order_DIS_PO_8841.pdf',
    fileSize: 44100,
    mimeType: 'application/pdf',
    uploadedAt: '2026-07-10T11:00:00Z',
    status: 'EXTRACTED',
    documentCategory: 'PRIMARY_DOCUMENT',
    reviewStatus: 'UNREVIEWED',
    sourceProvenance: 'Dev Industrial Services Procurement System PO Export',
    extractedText: `DEV INDUSTRIAL SERVICES PRIVATE LIMITED
COMMERCIAL PURCHASE ORDER
PO Number: DIS-PO-8841
Date: 10 July 2026
Consignee Warehouse: Sanand Industrial Estate, Ahmedabad, Gujarat

SUPPLIER:
Silverline Components
Plot 44, Hadapsar Industrial Area, Pune, Maharashtra, 411028 (DEMO-SILVERLINE-006)

SUPPLY SPECIFICATION:
Item: Precision CNC Electronic Relay Assemblies (Part # ER-902)
Order Quantity: 100 units
Unit Rate: ₹1,200/- per unit
Total Order Value: ₹1,20,000/- (Rupees One Lakh Twenty Thousand only)
Delivery Term: Door Delivery to Ahmedabad within 30 days.`,
    pageCount: 1,
    paragraphs: [
      { index: 1, text: 'DEV INDUSTRIAL SERVICES - PURCHASE ORDER DIS-PO-8841 Date: 10 July 2026' },
      { index: 2, text: 'Supplier: Silverline Components, Pune. Consignee: Dev Industrial Services, Ahmedabad.' },
      { index: 3, text: 'Order Quantity: 100 units. Total Order Value: ₹1,20,000/-.' },
    ],
    ocrApplied: false,
    securityValidation: { isValidSignature: true, detectedType: 'application/pdf', fileSizeOk: true, sanitized: true },
  },
  {
    id: 'doc-demo-c6-dispatch',
    caseId: 'case-demo-006',
    originalFilename: 'Dispatch_Note_SO_2066.pdf',
    fileSize: 42300,
    mimeType: 'application/pdf',
    uploadedAt: '2026-08-01T15:00:00Z',
    status: 'EXTRACTED',
    documentCategory: 'PRIMARY_DOCUMENT',
    reviewStatus: 'UNREVIEWED',
    sourceProvenance: 'Silverline Components Dispatch & Logistics Gatepass',
    extractedText: `SILVERLINE COMPONENTS - FACTORY DISPATCH MEMORANDUM
Sales Order / Dispatch Ref: SO-2066
Date of Dispatch: 01 August 2026
Carrier: Western Express Roadlines (Truck No: MH-12-Q-4109)

CONSIGNMENT DETAILS:
Consignee: Dev Industrial Services Private Limited, Ahmedabad
Dispatched: 100 precision units in 10 corrugated master cartons (Carton # 01 to 10).
Quality Clearance: 100% factory bench tested and passed prior to packing.
Factory Packaging: Strapped with heavy-duty plastic ties and tamper-evident security tape.
Invoice Sum: ₹1,20,000/- under Invoice INV-SC-2066.`,
    pageCount: 1,
    paragraphs: [
      { index: 1, text: 'SILVERLINE COMPONENTS - DISPATCH MEMO SO-2066 Date: 01 August 2026' },
      { index: 2, text: 'Dispatched: 100 precision units in 10 corrugated master cartons.' },
      { index: 3, text: 'Carrier: Western Express Roadlines (Truck No: MH-12-Q-4109).' },
    ],
    ocrApplied: false,
    securityValidation: { isValidSignature: true, detectedType: 'application/pdf', fileSizeOk: true, sanitized: true },
  },
  {
    id: 'doc-demo-c6-grn',
    caseId: 'case-demo-006',
    originalFilename: 'Goods_Received_Note_GRN_4402.docx',
    fileSize: 32600,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    uploadedAt: '2026-08-05T16:30:00Z',
    status: 'EXTRACTED',
    documentCategory: 'PRIMARY_DOCUMENT',
    reviewStatus: 'UNREVIEWED',
    sourceProvenance: 'Dev Industrial Warehouse Goods Inward System',
    extractedText: `DEV INDUSTRIAL SERVICES - GOODS RECEIVED NOTE (GRN)
GRN No: GRN-2026-4402
Inward Date: 05 August 2026
Carrier: Western Express Roadlines

WAREHOUSE RECEIVING LOG:
Consignment from: Silverline Components (SO-2066)
Quantity Received into inventory: 90 units (9 cartons received, 1 carton missing / unaccounted).
Shortfall Noted: 10 units not accounted for (Value: ₹12,000/-).
Packaging Condition on Arrival: Damaged outer cartons with crushed corners and torn shipping tape observed on 3 received boxes.
Action Taken: Debit note proposed for ₹12,000 shortfall. Remaining consignment put on hold.`,
    pageCount: 1,
    paragraphs: [
      { index: 1, text: 'DEV INDUSTRIAL SERVICES - GOODS RECEIVED NOTE GRN-2026-4402 Inward Date: 05 August 2026' },
      { index: 2, text: 'Quantity Received into inventory: 90 units. Shortfall: 10 units not accounted for.' },
      { index: 3, text: 'Packaging Condition: Damaged outer cartons with crushed corners and torn shipping tape.' },
    ],
    ocrApplied: false,
    securityValidation: { isValidSignature: true, detectedType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', fileSizeOk: true, sanitized: true },
  },
  {
    id: 'doc-demo-c6-photo',
    caseId: 'case-demo-006',
    originalFilename: 'Warehouse_Dock_Damaged_Cartons.jpg',
    fileSize: 88200,
    mimeType: 'image/jpeg',
    uploadedAt: '2026-08-05T17:00:00Z',
    status: 'EXTRACTED',
    documentCategory: 'IMAGE_EVIDENCE',
    reviewStatus: 'UNREVIEWED',
    sourceProvenance: 'Warehouse Inward Dock Security Camera / Mobile Inspection Photo',
    isImage: true,
    imageDataUri: DEMO_IMG_CASE_6_DAMAGED_CARTONS,
    imageMetadata: {
      format: 'jpeg',
      width: 800,
      height: 520,
      ocrEngine: 'Deterministic Optical Parser v2.1',
      extractionConfidence: 94,
      colorSpace: 'sRGB',
      hasExif: false,
    },
    extractedText: `WAREHOUSE INWARD DOCK INSPECTION PHOTOGRAPH
Consignment SO-2066 / DIS-PO-8841 | Date: 05 August 2026
Dock: Bay 4, Sanand Receiving Warehouse
Visual Condition: Crushed corners and damaged outer cartons. Outer packaging crushed with torn shipping tape.
Evidentiary Distinction: Photograph proves external carton compression distress, but does not prove whether the internal CNC electronic assemblies suffered functional damage or failure without bench electrical testing.
Chain of Custody Limitation: No carrier driver signature or Lorry Receipt (LR) damage endorsement attached.`,
    pageCount: 1,
    paragraphs: [
      { index: 1, text: 'WAREHOUSE INWARD DOCK INSPECTION PHOTOGRAPH Date: 05 August 2026' },
      { index: 2, text: 'Visual Condition: Crushed corners and damaged outer cartons. Outer packaging crushed with torn shipping tape.' },
      { index: 3, text: 'Evidentiary Distinction: Photograph proves external carton damage, but does not prove internal component destruction without bench testing.' },
    ],
    ocrApplied: true,
    ocrConfidence: 94,
    securityValidation: { isValidSignature: true, detectedType: 'image/jpeg', fileSizeOk: true, sanitized: true },
  },
  {
    id: 'doc-demo-c6-survey-req',
    caseId: 'case-demo-006',
    originalFilename: 'Joint_Discrepancy_Survey_Requisition.pdf',
    fileSize: 39100,
    mimeType: 'application/pdf',
    uploadedAt: '2026-08-08T11:00:00Z',
    status: 'EXTRACTED',
    documentCategory: 'CORRESPONDENCE',
    reviewStatus: 'UNREVIEWED',
    sourceProvenance: 'Silverline Commercial Communication',
    extractedText: `SILVERLINE COMPONENTS - COMMERCIAL NOTICE
Date: 08 August 2026
To: Dev Industrial Services Private Limited

SUBJECT: DELIVERY DISCREPANCY REQUISITION UNDER SALE OF GOODS ACT, 1930
1. Dispatched: 100 units under SO-2066 via Western Express Roadlines.
2. We dispute unilateral deduction of ₹12,000 without carrier investigation.
3. Carrier Lorry Receipt (LR) lacks any damage or shortage remark signed at discharge.
4. We formally requisition a joint survey at your warehouse to inspect carton seals and bench-test the components.`,
    pageCount: 1,
    paragraphs: [
      { index: 1, text: 'SILVERLINE COMPONENTS - COMMERCIAL NOTICE Date: 08 August 2026' },
      { index: 2, text: 'Dispatched 100 units under SO-2066. Dispute unilateral deduction without carrier investigation.' },
      { index: 3, text: 'Formally requisition a joint survey to inspect carton seals and bench-test components.' },
    ],
    ocrApplied: false,
    securityValidation: { isValidSignature: true, detectedType: 'application/pdf', fileSizeOk: true, sanitized: true },
  },
];

/* =========================================================================
   CASE BUILDER HELPERS
   ========================================================================= */

export function buildFictionalDemoCase1(): LegalCase {
  const caseId = 'case-demo-001';
  const c: LegalCase = {
    id: caseId,
    title: '[FICTIONAL TEST CASE — NOT A REAL LEGAL MATTER] Aster Supplies Private Limited v. Northstar Retail Private Limited',
    referenceNumber: 'DM-DEMO-001',
    matterType: 'Commercial Dispute → Invoice Payment / Contractual Obligations',
    jurisdiction: 'India; proposed test venue Lucknow, Uttar Pradesh. Court jurisdiction has not been legally established.',
    parties: [
      {
        name: 'Aster Supplies Private Limited',
        role: 'CLAIMANT',
        entityType: 'COMPANY',
        address: 'Fictional, 101 Sample Business Park, Lucknow, Uttar Pradesh, 226001',
        identifier: 'DEMO-ASTER-001 (Fictional internal test identifier, not a valid CIN)',
      },
      {
        name: 'Northstar Retail Private Limited',
        role: 'RESPONDENT',
        entityType: 'COMPANY',
        address: 'Fictional, 202 Sample Trade Centre, Kanpur, Uttar Pradesh, 208001',
        identifier: 'DEMO-NORTHSTAR-002 (Fictional internal test identifier, not a valid CIN)',
      },
    ],
    summary:
      'Aster Supplies alleges that it supplied goods to Northstar Retail under invoice INV-2026-104 for ₹50,000 with a payment deadline of 25 August 2026. Document A (Payment receipt) states ₹50,000 was received on 25 August 2026 through TXN123. Document B (Account statement dated 30 August 2026) states that the same payment remains outstanding. Document C provides photographic evidence of the stamped receipt. The underlying bank records and authenticity of documents have not been independently verified.',
    createdAt: '2026-08-30T10:00:00Z',
    updatedAt: '2026-08-30T10:00:00Z',
    status: 'FLAGGED',
    documents: CASE_1_DOCUMENTS,
    extractedFacts: [],
    findings: [],
    isDemoCase: true,
  };

  c.extractedFacts = extractCaseFacts(c.documents, caseId);
  c.findings = detectCrossDocumentContradictions(c);
  return c;
}

export function buildFictionalDemoCase2(): LegalCase {
  const caseId = 'case-demo-002';
  const c: LegalCase = {
    id: caseId,
    title: '[FICTIONAL TEST CASE — NOT A REAL LEGAL MATTER] Priya Sharma v. Meridian Digital Services Private Limited',
    referenceNumber: 'DM-DEMO-002',
    matterType: 'Employment Dispute → Unpaid Salary / Employment Records',
    jurisdiction: 'India; location and applicable employment law require confirmation.',
    parties: [
      {
        name: 'Priya Sharma',
        role: 'CLAIMANT',
        entityType: 'INDIVIDUAL',
        address: 'Fictional, 14 Sample Residency, Lucknow, Uttar Pradesh, 226001',
        identifier: 'DEMO-EMPLOYEE-002 (Fictional internal identifier; not government-issued ID)',
      },
      {
        name: 'Meridian Digital Services Private Limited',
        role: 'RESPONDENT',
        entityType: 'COMPANY',
        address: 'Fictional, 303 Sample Corporate Plaza, Noida, Uttar Pradesh, 201301',
        identifier: 'DEMO-EMPLOYER-002 (Fictional internal test identifier, not a valid CIN)',
      },
    ],
    summary:
      'Priya states she worked for Meridian Digital Services from 1 January 2026 until 31 August 2026, with a monthly salary of ₹35,000. A salary statement lists August 2026 salary as unpaid. A separate payroll email and mobile app notification indicate August salary was processed on 5 September 2026, but no bank credit confirmation has been supplied. The appointment letter refers to a 30-day notice period, but documents do not establish whether notice was given, waived, or completed. An HR email contains an incomplete date (05-____-2026) and inconsistent final working day.',
    createdAt: '2026-09-08T16:00:00Z',
    updatedAt: '2026-09-08T16:00:00Z',
    status: 'FLAGGED',
    documents: CASE_2_DOCUMENTS,
    extractedFacts: [],
    findings: [],
    isDemoCase: true,
  };

  c.extractedFacts = extractCaseFacts(c.documents, caseId);
  c.findings = detectCrossDocumentContradictions(c);
  return c;
}

export function buildFictionalDemoCase3(): LegalCase {
  const caseId = 'case-demo-003';
  const c: LegalCase = {
    id: caseId,
    title: '[FICTIONAL TEST CASE — NOT A REAL LEGAL MATTER] Rahul Verma v. Greenview Properties',
    referenceNumber: 'DM-DEMO-003',
    matterType: 'Civil Dispute → Tenancy / Security Deposit / Accounting Reconciliation',
    jurisdiction: 'India; fictional rental property in Lucknow, Uttar Pradesh. Applicable local law and forum must be verified rather than assumed.',
    parties: [
      {
        name: 'Rahul Verma',
        role: 'CLAIMANT',
        entityType: 'INDIVIDUAL',
        address: 'Fictional, Flat 4B, Sample Apartments, Lucknow, Uttar Pradesh, 226001',
        identifier: 'DEMO-TENANT-003 (Fictional internal identifier; not government-issued ID)',
      },
      {
        name: 'Greenview Properties',
        role: 'RESPONDENT',
        entityType: 'PROPRIETORSHIP',
        address: 'Fictional, 404 Sample Commercial Complex, Lucknow, Uttar Pradesh, 226001',
        identifier: 'DEMO-LANDLORD-003 (Fictional internal identifier; not a registered company number)',
      },
    ],
    summary:
      'Rahul states that he paid a refundable security deposit of ₹30,000 under a rental agreement dated 1 February 2026. A move-out email dated 31 August 2026 says keys were returned, with handover checklist recording cleaning charges ₹2,000 and repair charges ₹3,000 (no supporting contractor invoices or move-out photos). A draft settlement statement calculates proposed refund as ₹25,000 (₹30,000 − ₹2,000 − ₹3,000). A handover sheet message states only ₹20,000 will be returned, without explaining the additional ₹5,000 deduction.',
    createdAt: '2026-09-04T10:00:00Z',
    updatedAt: '2026-09-04T10:00:00Z',
    status: 'FLAGGED',
    documents: CASE_3_DOCUMENTS,
    extractedFacts: [],
    findings: [],
    isDemoCase: true,
  };

  c.extractedFacts = extractCaseFacts(c.documents, caseId);
  c.findings = detectCrossDocumentContradictions(c);
  return c;
}

export function buildFictionalDemoCase4(): LegalCase {
  const caseId = 'case-demo-004';
  const c: LegalCase = {
    id: caseId,
    title: '[FICTIONAL TEST CASE — NOT A REAL LEGAL MATTER] Ananya Mehta v. BrightCart Electronics Private Limited',
    referenceNumber: 'DM-DEMO-004',
    matterType: 'Consumer Dispute → Defective Goods & E-Commerce Delivery',
    jurisdiction: 'India; National Consumer Disputes Redressal Commission / Delhi State Commission.',
    parties: [
      {
        name: 'Ananya Mehta',
        role: 'CLAIMANT',
        entityType: 'INDIVIDUAL',
        address: 'Flat 12B, Metro Enclave, Saket, New Delhi, 110017',
        identifier: 'DEMO-CONS-004 (Fictional consumer test identifier)',
      },
      {
        name: 'BrightCart Electronics Private Limited',
        role: 'RESPONDENT',
        entityType: 'COMPANY',
        address: 'Fulfillment Center, Okhla Industrial Area, New Delhi, 110020',
        identifier: 'DEMO-BRIGHTCART-004 (Fictional internal test identifier, not a valid CIN)',
      },
    ],
    summary:
      'Ananya Mehta purchased an UltraBook Pro laptop for ₹60,000 on 08 September 2026 from BrightCart Electronics. Courier POD dated 12 September 2026 indicates the package was delivered in good condition with clean recipient sign-off. Buyer documented a photograph on 12 September showing the laptop display severely cracked with radiating spiderweb glass fractures. BrightCart customer support rejected return citing the clean POD. Photographic evidence proves physical screen fracture at capture time, but does not independently establish whether damage occurred pre-dispatch, in transit, or post-unboxing without an authorized technical inspection report.',
    createdAt: '2026-09-13T12:00:00Z',
    updatedAt: '2026-09-13T12:00:00Z',
    status: 'FLAGGED',
    documents: CASE_4_DOCUMENTS,
    extractedFacts: [],
    findings: [],
    isDemoCase: true,
  };

  c.extractedFacts = extractCaseFacts(c.documents, caseId);
  c.findings = detectCrossDocumentContradictions(c);
  return c;
}

export function buildFictionalDemoCase5(): LegalCase {
  const caseId = 'case-demo-005';
  const c: LegalCase = {
    id: caseId,
    title: '[FICTIONAL TEST CASE — NOT A REAL LEGAL MATTER] Arjun Malhotra v. Karan Sethi',
    referenceNumber: 'DM-DEMO-005',
    matterType: 'Civil Dispute → Personal Loan Recovery & Account Reconciliation',
    jurisdiction: 'India; Civil Jurisdiction, Gurugram, Haryana. Electronic evidence compliance required.',
    parties: [
      {
        name: 'Arjun Malhotra',
        role: 'CLAIMANT',
        entityType: 'INDIVIDUAL',
        address: 'Sector 56, Gurugram, Haryana, 122011',
        identifier: 'DEMO-LENDER-005 (Fictional internal test identifier)',
      },
      {
        name: 'Karan Sethi',
        role: 'RESPONDENT',
        entityType: 'INDIVIDUAL',
        address: 'Greater Kailash-I, New Delhi, 110048',
        identifier: 'DEMO-BORROWER-005 (Fictional internal test identifier)',
      },
    ],
    summary:
      'Arjun Malhotra claims a ₹80,000 friendly loan was provided to Karan Sethi on 15 May 2026. A loan acknowledgement note records an agreed principal sum of ₹80,000. However, primary electronic UPI banking confirmation substantiates only ₹50,000 disbursement. The remaining ₹30,000 is claimed as cash handed over without bank withdrawal slip, cash voucher, or signed receipt. WhatsApp chat indicates borrower stated "will return the amount next month", an ambiguous statement without a fixed calendar maturity date. Electronic screenshots require certification under Section 63 BSA 2023 / Section 65B.',
    createdAt: '2026-08-16T10:00:00Z',
    updatedAt: '2026-08-16T10:00:00Z',
    status: 'FLAGGED',
    documents: CASE_5_DOCUMENTS,
    extractedFacts: [],
    findings: [],
    isDemoCase: true,
  };

  c.extractedFacts = extractCaseFacts(c.documents, caseId);
  c.findings = detectCrossDocumentContradictions(c);
  return c;
}

export function buildFictionalDemoCase6(): LegalCase {
  const caseId = 'case-demo-006';
  const c: LegalCase = {
    id: caseId,
    title: '[FICTIONAL TEST CASE — NOT A REAL LEGAL MATTER] Silverline Components v. Dev Industrial Services Private Limited',
    referenceNumber: 'DM-DEMO-006',
    matterType: 'Commercial Dispute → Sale of Goods / Delivery Shortfall & Transit Damage',
    jurisdiction: 'India; Commercial Court, Pune, Maharashtra / Ahmedabad, Gujarat. Sale of Goods Act 1930.',
    parties: [
      {
        name: 'Silverline Components',
        role: 'CLAIMANT',
        entityType: 'PROPRIETORSHIP',
        address: 'Plot 44, Hadapsar Industrial Area, Pune, Maharashtra, 411028',
        identifier: 'DEMO-SILVERLINE-006 (Fictional internal test identifier)',
      },
      {
        name: 'Dev Industrial Services Private Limited',
        role: 'RESPONDENT',
        entityType: 'COMPANY',
        address: 'Sanand Industrial Estate, Ahmedabad, Gujarat, 382170',
        identifier: 'DEMO-DEVIND-006 (Fictional internal test identifier, not a valid CIN)',
      },
    ],
    summary:
      'Dev Industrial issued purchase order DIS-PO-8841 for 100 precision relay units at ₹1,20,000. Silverline Dispatch Note SO-2066 records 100 units packed and shipped via road carrier. Consignee GRN-4402 records receipt of only 90 units into inventory (10-unit shortfall = ₹12,000). Receiving warehouse photographed damaged outer cartons with crushed corners and torn tape. Outer carton distress does not prove functional destruction of internal components without bench electrical testing. Carrier Lorry Receipt lacks exception endorsement, requiring joint survey under Sections 37/42 Sale of Goods Act.',
    createdAt: '2026-08-10T14:00:00Z',
    updatedAt: '2026-08-10T14:00:00Z',
    status: 'FLAGGED',
    documents: CASE_6_DOCUMENTS,
    extractedFacts: [],
    findings: [],
    isDemoCase: true,
  };

  c.extractedFacts = extractCaseFacts(c.documents, caseId);
  c.findings = detectCrossDocumentContradictions(c);
  return c;
}

export function getSixFictionalDemoCases(): LegalCase[] {
  return [
    buildFictionalDemoCase1(),
    buildFictionalDemoCase2(),
    buildFictionalDemoCase3(),
    buildFictionalDemoCase4(),
    buildFictionalDemoCase5(),
    buildFictionalDemoCase6(),
  ];
}

export function getThreeFictionalDemoCases(): LegalCase[] {
  return getSixFictionalDemoCases().slice(0, 3);
}

export function getThreeFictionalDemoDocuments(): LegalDocument[] {
  return getSixFictionalDemoDocuments().slice(0, 3);
}

export function getSixFictionalDemoDocuments(): LegalDocument[] {
  return [
    {
      id: 'doc-demo-draft-001',
      caseId: 'case-demo-001',
      title: '[FICTIONAL TEST CASE] Commercial Legal Notice (INV-2026-104)',
      type: 'LEGAL_NOTICE_COMMERCIAL_DUES',
      jurisdiction: 'India (Commercial Courts Jurisdiction, Uttar Pradesh)',
      parties: [
        {
          name: 'Aster Supplies Private Limited',
          role: 'CLAIMANT',
          entityType: 'COMPANY',
          address: '101 Sample Business Park, Lucknow, Uttar Pradesh, 226001',
          identifier: 'DEMO-ASTER-001',
        },
        {
          name: 'Northstar Retail Private Limited',
          role: 'RESPONDENT',
          entityType: 'COMPANY',
          address: '202 Sample Trade Centre, Kanpur, Uttar Pradesh, 208001',
          identifier: 'DEMO-NORTHSTAR-002',
        },
      ],
      dates: {
        noticeDate: '2026-08-30',
        incidentOrDefaultDate: '2026-08-25',
        demandDeadlineDays: 15,
      },
      amounts: {
        principalClaim: 50000,
        interestRatePercent: 18,
        currency: 'INR',
        paymentReferences: ['INV-2026-104', 'TXN123'],
      },
      desiredTone: 'FORMAL_ASSERTIVE',
      supportingEvidence: [
        {
          id: 'ev-d1',
          title: 'Document A - Payment Receipt TXN123',
          documentType: 'Payment Receipt',
          date: '2026-08-25',
          keyStatements: ['₹50,000 received on 25 August 2026 via TXN123'],
          fullTextOrSummary: 'Payment receipt indicating ₹50,000 received on 25 August 2026 through TXN123',
        },
        {
          id: 'ev-d2',
          title: 'Document B - Account Statement',
          documentType: 'Invoice Statement',
          date: '2026-08-30',
          keyStatements: ['Invoice INV-2026-104 balance pending and unpaid'],
          fullTextOrSummary: 'Account ledger listing ₹50,000 under INV-2026-104 as pending and unpaid',
        },
        {
          id: 'ev-d3',
          title: 'Document C - Consignee Stamped Receipt Image',
          documentType: 'Image Evidence',
          date: '2026-08-25',
          keyStatements: ['Physical stamp verifies TXN123 receipt notation'],
          fullTextOrSummary: 'Scan of physical dock receipt bearing receiving stamp and TXN123 reference',
        },
      ],
      additionalInstructions: 'Note payment conflict: Receipt asserts settlement on 25 Aug 2026; statement asserts unpaid on 30 Aug 2026.',
      factsAndChronology:
        'Aster Supplies issued invoice INV-2026-104 for ₹50,000 with a payment deadline of 25 August 2026. Document A receipt states ₹50,000 was received on 25 August 2026 via TXN123. Document B account statement states payment remains unpaid on 30 August 2026.',
      content: `LEGAL NOTICE FOR RECOVERY OF OUTSTANDING COMMERCIAL DUES

DATE: 30 August 2026

TO:
Northstar Retail Private Limited
202 Sample Trade Centre, Kanpur, Uttar Pradesh, 208001

FROM:
[MISSING: Law Firm / Advocate Chamber Name]
Advocates & Legal Advisors
On behalf of: Aster Supplies Private Limited
101 Sample Business Park, Lucknow, Uttar Pradesh, 226001

SUBJECT: LEGAL NOTICE FOR RECOVERY OF OUTSTANDING DUES OF ₹50,000/- UNDER INVOICE INV-2026-104

Sir / Madam,

Under instructions from and on behalf of our client, Aster Supplies Private Limited ("Our Client"), we serve upon you this formal Legal Notice as under:

1. That Our Client is a commercial entity engaged in the wholesale supply of commercial goods.

2. That pursuant to purchase orders, Our Client supplied goods to you under tax invoice INV-2026-104 dated 10 August 2026 for a total value of ₹50,000/- with a payment deadline of 25 August 2026.

3. Evidentiary Contradiction Placed on Record:
   (a) Document A (Payment Receipt GRN-2026-9914) states that ₹50,000/- was received on 25 August 2026 via transaction reference TXN123.
   (b) Document B (Account Statement dated 30 August 2026) reflects the said invoice balance as unpaid and in default.
   (c) Notice is hereby given to reconcile both accounts with certified primary banking statements prior to further legal escalation.

4. That failing verification or satisfaction of the outstanding sum within 15 calendar days from receipt hereof, Our Client reserves all rights to initiate recovery proceedings under the Commercial Courts Act, 2015 and the Indian Contract Act, 1872.

Yours faithfully,

For [MISSING: Advocate Name]
Advocates for Aster Supplies Private Limited
[MISSING: Bar Council Enrolment Number]`,
      createdAt: '2026-08-30T10:00:00Z',
      updatedAt: '2026-08-30T10:00:00Z',
      status: 'FLAGGED',
      isDemoCase: true,
    },
    {
      id: 'doc-demo-draft-002',
      caseId: 'case-demo-002',
      title: '[FICTIONAL TEST CASE] Representation for Salary Disbursement (August 2026)',
      type: 'SALARY_CLARIFICATION_REPRESENTATION',
      jurisdiction: 'India (Employment Law, Uttar Pradesh)',
      parties: [
        {
          name: 'Priya Sharma',
          role: 'CLAIMANT',
          entityType: 'INDIVIDUAL',
          address: '14 Sample Residency, Lucknow, Uttar Pradesh, 226001',
          identifier: 'DEMO-EMPLOYEE-002',
        },
        {
          name: 'Meridian Digital Services Private Limited',
          role: 'RESPONDENT',
          entityType: 'COMPANY',
          address: '303 Sample Corporate Plaza, Noida, Uttar Pradesh, 201301',
          identifier: 'DEMO-EMPLOYER-002',
        },
      ],
      dates: {
        noticeDate: '2026-09-08',
        incidentOrDefaultDate: '2026-08-31',
        demandDeadlineDays: 7,
      },
      amounts: {
        principalClaim: 35000,
        currency: 'INR',
      },
      desiredTone: 'FORMAL_ASSERTIVE',
      supportingEvidence: [
        {
          id: 'ev-d3',
          title: 'Document A - August 2026 Salary Statement',
          documentType: 'Salary Statement',
          date: '2026-08-31',
          keyStatements: ['August 2026 compensation of ₹35,000 is marked UNPAID'],
          fullTextOrSummary: 'Records compensation of ₹35,000 as UNPAID',
        },
        {
          id: 'ev-d4',
          title: 'Document B - Payroll Advice',
          documentType: 'Email Advice',
          date: '2026-09-06',
          keyStatements: ['Salary was processed on 5 September 2026'],
          fullTextOrSummary: 'States salary was processed on 5 September 2026 without bank credit confirmation',
        },
        {
          id: 'ev-d4b',
          title: 'Document E - HR Pulse Mobile Notification',
          documentType: 'Image Evidence',
          date: '2026-09-05',
          keyStatements: ['Batch processed on 05-Sep-2026 but bank credit unverified'],
          fullTextOrSummary: 'Mobile app screenshot showing batch execution status',
        },
      ],
      additionalInstructions: 'Distinguish employer payroll processing notation from bank credit verification.',
      factsAndChronology:
        'Priya Sharma was employed at ₹35,000 monthly. Salary statement for August 2026 records salary as unpaid. Internal payroll email indicates processing on 5 September 2026 without bank credit advice. Notice period compliance and contradictory exit dates remain unverified.',
      content: `FORMAL REPRESENTATION & SALARY DISBURSEMENT CLARIFICATION
(EMPLOYMENT DISPUTE RECORD)

Date: 08 September 2026

TO:
Meridian Digital Services Private Limited
Through Managing Director / HR Operations
303 Sample Corporate Plaza, Noida, Uttar Pradesh, 201301

FROM:
Priya Sharma
14 Sample Residency, Lucknow, Uttar Pradesh, 226001

SUBJECT: FORMAL REPRESENTATION REGARDING DISBURSEMENT OF UNPAID SALARY FOR AUGUST 2026 (CLAIMANT ID: [MISSING: Employee Code])

Dear HR & Finance Operations,

I write to formally place on record my representation regarding outstanding compensation for my employment tenure:

1. Employment Tenure:
   I served with Meridian Digital Services Private Limited during the tenure from [MISSING: Confirmed Start Date] to [MISSING: Confirmed Separation Date], in the capacity of [MISSING: Official Job Designation] at an agreed gross monthly salary of ₹35,000/-.

2. Evidentiary Inconsistency Regarding August 2026 Salary:
   (a) The official Salary Statement for August 2026 records my compensation of ₹35,000/- as "UNPAID".
   (b) Conversely, communication from the Payroll Department dated 06 September 2026 states that salary was "processed on 5 September 2026".
   (c) Evidentiary Clarification: Internal payroll processing denotes batch submission and does NOT establish that funds were successfully credited to my bank account. As of today's date, no bank credit confirmation, UTR number, or bank deposit statement has been provided.

3. Exit Documentation & Notice Period Compliance:
   (a) Appointment records refer to a 30-day notice period. The present records do not establish whether notice was tendered, completed, or mutually waived.
   (b) HR exit communication dated [MISSING: Valid Date - Record Contains 05-____-2026] contains conflicting notes regarding my final working day (10 September vs 15 September 2026).

4. Factual Requisition:
   I respectfully call upon management to:
   (a) Provide certified banking proof (NEFT/IMPS UTR number) confirming credit of ₹35,000/- to my account, OR immediately disburse the outstanding sum;
   (b) Issue an itemized separation statement reconciling attendance, final working day, and notice period status.

Sincerely,

Priya Sharma
Employee Identifier: DEMO-EMPLOYEE-002`,
      createdAt: '2026-09-08T16:00:00Z',
      updatedAt: '2026-09-08T16:00:00Z',
      status: 'FLAGGED',
      isDemoCase: true,
    },
    {
      id: 'doc-demo-draft-003',
      caseId: 'case-demo-003',
      title: '[FICTIONAL TEST CASE] Requisition for Security Deposit Reconciliation',
      type: 'SECURITY_DEPOSIT_RECONCILIATION',
      jurisdiction: 'India (Tenancy Law, Uttar Pradesh)',
      parties: [
        {
          name: 'Rahul Verma',
          role: 'CLAIMANT',
          entityType: 'INDIVIDUAL',
          address: 'Flat 4B, Sample Apartments, Lucknow, Uttar Pradesh, 226001',
          identifier: 'DEMO-TENANT-003',
        },
        {
          name: 'Greenview Properties',
          role: 'RESPONDENT',
          entityType: 'PROPRIETORSHIP',
          address: '404 Sample Commercial Complex, Lucknow, Uttar Pradesh, 226001',
          identifier: 'DEMO-LANDLORD-003',
        },
      ],
      dates: {
        noticeDate: '2026-09-04',
        incidentOrDefaultDate: '2026-08-31',
        demandDeadlineDays: 7,
      },
      amounts: {
        principalClaim: 30000,
        currency: 'INR',
      },
      desiredTone: 'FORMAL_ASSERTIVE',
      supportingEvidence: [
        {
          id: 'ev-d5',
          title: 'Document A - Move-out Email & Handover Checklist',
          documentType: 'Handover Checklist',
          date: '2026-08-31',
          keyStatements: ['Cleaning ₹2,000 and repairs ₹3,000 recorded without contractor receipts'],
          fullTextOrSummary: 'Handover checklist noting cleaning ₹2,000 and repairs ₹3,000 without tax invoices or photos',
        },
        {
          id: 'ev-d6',
          title: 'Document B - Draft Settlement Statement',
          documentType: 'Settlement Statement',
          date: '2026-09-02',
          keyStatements: ['Calculates net refund as ₹25,000 (₹30,000 - ₹2,000 - ₹3,000)'],
          fullTextOrSummary: 'Calculates net balance as ₹25,000 (₹30,000 − ₹2,000 − ₹3,000)',
        },
        {
          id: 'ev-d7',
          title: 'Document C - Handover Deductions Sheet Image',
          documentType: 'Image Evidence',
          date: '2026-09-04',
          keyStatements: ['Only ₹20,000 will be returned to your bank account'],
          fullTextOrSummary: 'States only ₹20,000 will be refunded, creating an unexplained ₹5,000 discrepancy',
        },
      ],
      additionalInstructions: 'Call for contractor invoices and reconciliation of the unexplained ₹5,000 deduction.',
      factsAndChronology:
        'Security deposit of ₹30,000 paid at inception. Handover checklist notes cleaning ₹2,000 and repairs ₹3,000 (net arithmetic refund ₹25,000). Subsequent message states only ₹20,000 will be returned, leaving ₹5,000 unexplained and unsupported by contractor receipts or condition photos.',
      content: `FORMAL REQUISITION FOR SECURITY DEPOSIT RECONCILIATION & ITEMISED STATEMENT
(TENANCY DISPUTE RECORD)

Date: 04 September 2026

TO:
Greenview Properties
Property Management / Landlord
404 Sample Commercial Complex, Lucknow, Uttar Pradesh, 226001

FROM:
Rahul Verma
Flat 4B, Sample Apartments, Lucknow, Uttar Pradesh, 226001

SUBJECT: REQUISITION FOR ITEMISED SECURITY DEPOSIT RECONCILIATION & EVIDENCE OF PERMITTED DEDUCTIONS

Sir / Madam,

I write regarding the refundable security deposit paid pursuant to the Tenancy Agreement dated [MISSING: Tenancy Agreement Date] for premises at [MISSING: Full Premises Description]:

1. Deposit Particulars & Handover:
   (a) Refundable security deposit paid at inception: ₹30,000/-.
   (b) The premises were vacated and key handover completed on 31 August 2026.

2. Handover Checklist & Claimed Deductions:
   The handover checklist lists claimed deductions:
   - Deep Cleaning Charges: ₹2,000/-
   - Wall Painting / Repair Charges: ₹3,000/-
   Arithmetic Net Balance: ₹30,000 − ₹2,000 − ₹3,000 = ₹25,000/-.

3. Evidentiary Deficits & Unexplained Discrepancy:
   (a) Unexplained Difference: Recent communication dated 03 September 2026 states that only ₹20,000/- will be refunded, creating an unexplained variance of ₹5,000/- without accounting breakdown.
   (b) Missing Invoices & Photos: The claimed deductions for cleaning (₹2,000) and repairs (₹3,000) have not been substantiated with third-party contractor tax invoices, payment receipts, or comparative move-in/move-out photographs.

4. Requisition:
   I hereby request:
   (a) The immediate refund of the undisputed balance of ₹25,000/-;
   (b) A formal itemized written explanation and supporting tax invoices for the additional ₹5,000/- deduction.

Sincerely,

Rahul Verma
Tenant Identifier: DEMO-TENANT-003`,
      createdAt: '2026-09-04T10:00:00Z',
      updatedAt: '2026-09-04T10:00:00Z',
      status: 'FLAGGED',
      isDemoCase: true,
    },
    {
      id: 'doc-demo-draft-004',
      caseId: 'case-demo-004',
      title: '[FICTIONAL TEST CASE] Pre-Litigation Consumer Notice for Defective Laptop (CPA 2019)',
      type: 'CONSUMER_DEFECTIVE_GOODS_COMPLAINT',
      jurisdiction: 'India (Consumer Forum Jurisdiction, Saket, New Delhi)',
      parties: [
        {
          name: 'Ananya Mehta',
          role: 'CLAIMANT',
          entityType: 'INDIVIDUAL',
          address: 'Flat 12B, Metro Enclave, Saket, New Delhi, 110017',
          identifier: 'DEMO-CONS-004',
        },
        {
          name: 'BrightCart Electronics Private Limited',
          role: 'RESPONDENT',
          entityType: 'COMPANY',
          address: 'Fulfillment Center, Okhla Industrial Area, New Delhi, 110020',
          identifier: 'DEMO-BRIGHTCART-004',
        },
      ],
      dates: {
        noticeDate: '2026-09-14',
        incidentOrDefaultDate: '2026-09-12',
        demandDeadlineDays: 15,
      },
      amounts: {
        principalClaim: 60000,
        currency: 'INR',
        paymentReferences: ['INV-BC-9011', 'TKT-2026-4402'],
      },
      desiredTone: 'FORMAL_ASSERTIVE',
      supportingEvidence: [
        {
          id: 'ev-c4-inv',
          title: 'Tax Invoice INV-BC-9011',
          documentType: 'Tax Invoice',
          date: '2026-09-08',
          keyStatements: ['UltraBook Pro 15 consideration ₹60,000 paid in full'],
          fullTextOrSummary: 'Tax invoice confirming purchase and full payment',
        },
        {
          id: 'ev-c4-pod',
          title: 'Delivery POD Signoff',
          documentType: 'Logistics POD',
          date: '2026-09-12',
          keyStatements: ['Delivered in good condition with clean recipient stylus signature'],
          fullTextOrSummary: 'Express Logistics run sheet recording delivery',
        },
        {
          id: 'ev-c4-photo',
          title: 'Cracked Display Photograph',
          documentType: 'Image Evidence',
          date: '2026-09-12',
          keyStatements: ['Display severely cracked with radiating spiderweb glass fractures'],
          fullTextOrSummary: 'High-resolution photo showing physical fracture on unboxed laptop screen',
        },
      ],
      additionalInstructions: 'Call for technician inspection or replacement under Section 35 CPA 2019.',
      factsAndChronology:
        'Ananya Mehta purchased an UltraBook Pro laptop for ₹60,000 on 08 September 2026. Delivery POD indicates delivery in good condition on 12 September. Buyer documented cracked display with spiderweb glass fracture on same evening. Seller support refused return based on clean POD.',
      content: `FORMAL PRE-LITIGATION NOTICE UNDER CONSUMER PROTECTION ACT, 2019
(DEFECTIVE GOODS / TRANSIT DAMAGE RECORD)

Date: 14 September 2026

TO:
BrightCart Electronics Private Limited
Grievance Officer / Customer Support Directorate
Fulfillment Center, Okhla Industrial Area, New Delhi, 110020

FROM:
Ananya Mehta
Flat 12B, Metro Enclave, Saket, New Delhi, 110017

SUBJECT: FORMAL NOTICE FOR DEFECTIVE GOODS & UNFAIR TRADE PRACTICE UNDER SECTION 35, CONSUMER PROTECTION ACT, 2019 (ORDER / INVOICE REF: INV-BC-9011)

Sir / Madam,

Under instructions and on my own behalf as a consumer under Section 2(7) of the Consumer Protection Act, 2019, I hereby serve upon you this formal notice:

1. Purchase Particulars:
   (a) I placed an order for one unit of UltraBook Pro 15 (Serial No: UB-2026-X994) on 08 September 2026 for a total consideration of ₹60,000/-, paid in full under Tax Invoice INV-BC-9011.
   (b) The consignment was delivered on 12 September 2026 under courier AWB EXP-DEL-883912.

2. Defect & Delivery Discrepancy Placed on Record:
   (a) Upon opening the delivered package, the laptop display screen was found to be fractured with severe diagonal spiderweb glass cracks, rendering the device completely non-functional.
   (b) Photographic evidence of the cracked display was documented on the date of delivery (12 September 2026, 19:45 IST).
   (c) Your customer service ticket TKT-2026-4402 rejected my grievance citing that the package was signed as "delivered in good condition".
   (d) Evidentiary Clarification: Doorstep delivery signature does not establish internal screen integrity without an authorized technical diagnostic inspection report under Section 38(2)(c) of the Consumer Protection Act, 2019.

3. Requisition & Demand:
   You are hereby called upon to, within fifteen (15) days of receipt of this notice:
   (a) Provide a complete replacement of the defective laptop with a brand-new factory-sealed unit, OR
   (b) Refund the full purchase consideration of ₹60,000/- to the original payment source;
   Failing which I shall be constrained to institute a formal consumer complaint before the District Consumer Disputes Redressal Commission seeking compensation for deficiency in service, damages, and litigation expenses.

Yours faithfully,

Ananya Mehta
Consumer / Complainant`,
      createdAt: '2026-09-14T10:00:00Z',
      updatedAt: '2026-09-14T10:00:00Z',
      status: 'FLAGGED',
      isDemoCase: true,
    },
    {
      id: 'doc-demo-draft-005',
      caseId: 'case-demo-005',
      title: '[FICTIONAL TEST CASE] Demand for Loan Repayment & Electronic Reconciliation',
      type: 'LOAN_REPAYMENT_RECONCILIATION',
      jurisdiction: 'India (Civil Courts, Gurugram, Haryana; Section 63 BSA 2023)',
      parties: [
        {
          name: 'Arjun Malhotra',
          role: 'CLAIMANT',
          entityType: 'INDIVIDUAL',
          address: 'Sector 56, Gurugram, Haryana, 122011',
          identifier: 'DEMO-LENDER-005',
        },
        {
          name: 'Karan Sethi',
          role: 'RESPONDENT',
          entityType: 'INDIVIDUAL',
          address: 'Greater Kailash-I, New Delhi, 110048',
          identifier: 'DEMO-BORROWER-005',
        },
      ],
      dates: {
        noticeDate: '2026-08-16',
        incidentOrDefaultDate: '2026-05-15',
        demandDeadlineDays: 15,
      },
      amounts: {
        principalClaim: 50000,
        currency: 'INR',
        paymentReferences: ['UPI-2026-99482103'],
      },
      desiredTone: 'FORMAL_ASSERTIVE',
      supportingEvidence: [
        {
          id: 'ev-c5-ack',
          title: 'Loan Acknowledgement Note',
          documentType: 'Loan Memorandum',
          date: '2026-05-15',
          keyStatements: ['Acknowledges receipt of ₹80,000 friendly loan'],
          fullTextOrSummary: 'Signed acknowledgement of financial assistance of ₹80,000',
        },
        {
          id: 'ev-c5-upi',
          title: 'Bank UPI Confirmation Screenshot',
          documentType: 'Image Evidence',
          date: '2026-05-15',
          keyStatements: ['Electronic bank transfer confirms ₹50,000 successful transfer'],
          fullTextOrSummary: 'UPI transfer receipt confirming electronic debit and credit',
        },
        {
          id: 'ev-c5-chat',
          title: 'WhatsApp Chat Log',
          documentType: 'Chat Log',
          date: '2026-07-02',
          keyStatements: ['Borrower promises to return amount next month'],
          fullTextOrSummary: 'Informal message promising repayment without fixed calendar date',
        },
      ],
      additionalInstructions: 'Ground demand on verified ₹50,000 UPI transfer; preserve reservation regarding ₹30,000 cash assertion.',
      factsAndChronology:
        'Arjun Malhotra extended loan accommodation to Karan Sethi on 15 May 2026. Acknowledged sum is ₹80,000, but electronic banking evidence confirms only ₹50,000. Balance ₹30,000 claimed in cash lacks contemporaneous voucher. Repayment promise is ambiguous.',
      content: `DEMAND NOTICE FOR LOAN REPAYMENT & ELECTRONIC RECONCILIATION
(CIVIL / CONTRACTUAL OBLIGATION RECORD)

Date: 16 August 2026

TO:
Karan Sethi
Greater Kailash-I, New Delhi, 110048

FROM:
Arjun Malhotra
Sector 56, Gurugram, Haryana, 122011

SUBJECT: FORMAL DEMAND FOR REPAYMENT OF FRIENDLY LOAN & RECONCILIATION OF ELECTRONIC DISBURSEMENTS

Sir,

I write to formally demand repayment of financial accommodation extended to you for personal commercial exigency:

1. Loan Particulars:
   (a) On 15 May 2026, a friendly loan accommodation was requested by you at Gurugram, Haryana.
   (b) A loan acknowledgement note records an agreed principal sum of ₹80,000/-.
   (c) Verified electronic banking records establish an immediate UPI transfer of ₹50,000/- (UPI Ref: UPI-2026-99482103) directly to your account.
   (d) Evidentiary & Statutory Reservation: While an additional sum of ₹30,000/- was disbursed in cash, statutory provisions governing electronic records (Section 63 of Bharatiya Sakshya Adhiniyam, 2023 / Section 65B of Indian Evidence Act) require strict primary corroboration. Demand at this stage is substantiated on verified electronic bank transfers.

2. Repayment Default:
   (a) Your informal messages promised repayment "next month as soon as client clears milestone 2".
   (b) Despite the expiry of three months, no repayment or interest credit has been received.

3. Requisition:
   I hereby demand that you remit the undisputed electronically verified sum of ₹50,000/- into my bank account within fifteen (15) days of receipt hereof:
   Bank Name: [MISSING: Lender Bank Name]
   Account No: [MISSING: Lender Account Number]
   IFSC Code: [MISSING: Lender IFSC Code]
   Failing which summary recovery proceedings under Order XXXVII of the Code of Civil Procedure, 1908 and the Indian Contract Act, 1872 shall be instituted without further notice.

Yours sincerely,

Arjun Malhotra`,
      createdAt: '2026-08-16T10:00:00Z',
      updatedAt: '2026-08-16T10:00:00Z',
      status: 'FLAGGED',
      isDemoCase: true,
    },
    {
      id: 'doc-demo-draft-006',
      caseId: 'case-demo-006',
      title: '[FICTIONAL TEST CASE] Requisition for Joint Inspection & Delivery Discrepancy (SO-2066)',
      type: 'DELIVERY_DISCREPANCY_JOINT_INSPECTION',
      jurisdiction: 'India (Commercial Court, Pune, Maharashtra / Sale of Goods Act 1930)',
      parties: [
        {
          name: 'Silverline Components',
          role: 'CLAIMANT',
          entityType: 'PROPRIETORSHIP',
          address: 'Plot 44, Hadapsar Industrial Area, Pune, Maharashtra, 411028',
          identifier: 'DEMO-SILVERLINE-006',
        },
        {
          name: 'Dev Industrial Services Private Limited',
          role: 'RESPONDENT',
          entityType: 'COMPANY',
          address: 'Sanand Industrial Estate, Ahmedabad, Gujarat, 382170',
          identifier: 'DEMO-DEVIND-006',
        },
      ],
      dates: {
        noticeDate: '2026-08-12',
        incidentOrDefaultDate: '2026-08-05',
        demandDeadlineDays: 10,
      },
      amounts: {
        principalClaim: 120000,
        currency: 'INR',
        paymentReferences: ['DIS-PO-8841', 'SO-2066', 'GRN-2026-4402'],
      },
      desiredTone: 'FORMAL_ASSERTIVE',
      supportingEvidence: [
        {
          id: 'ev-c6-po',
          title: 'Purchase Order DIS-PO-8841',
          documentType: 'Purchase Order',
          date: '2026-07-10',
          keyStatements: ['Order for 100 precision relay units at ₹1,20,000'],
          fullTextOrSummary: 'Commercial purchase order for 100 units',
        },
        {
          id: 'ev-c6-disp',
          title: 'Dispatch Memorandum SO-2066',
          documentType: 'Dispatch Note',
          date: '2026-08-01',
          keyStatements: ['Dispatched 100 precision units in 10 master cartons'],
          fullTextOrSummary: 'Supplier dispatch gatepass confirming 100 units consigned to carrier',
        },
        {
          id: 'ev-c6-grn',
          title: 'Consignee GRN-4402',
          documentType: 'Goods Received Note',
          date: '2026-08-05',
          keyStatements: ['Quantity received: 90 units; 10 units shortfall noted'],
          fullTextOrSummary: 'Warehouse intake record noting 90 units received and damaged outer cartons',
        },
        {
          id: 'ev-c6-photo',
          title: 'Warehouse Dock Damage Photo',
          documentType: 'Image Evidence',
          date: '2026-08-05',
          keyStatements: ['Crushed corners and torn tape on outer packaging'],
          fullTextOrSummary: 'Photograph of damaged corrugated cartons on receiving bay',
        },
      ],
      additionalInstructions: 'Call for joint physical inspection under Sections 37 & 42 Sale of Goods Act 1930.',
      factsAndChronology:
        'Dev Industrial ordered 100 precision relay units for ₹1,20,000. Silverline dispatched 100 units under SO-2066. Dev Industrial GRN records 90 units received (10-unit shortfall) and damaged outer cartons. Carrier LR lacks delivery exception remarks. External damage does not prove component destruction.',
      content: `REQUISITION FOR JOINT SURVEY & DISCREPANCY RECONCILIATION
(COMMERCIAL SALE OF GOODS RECORD)

Date: 12 August 2026

TO:
Dev Industrial Services Private Limited
Supply Chain / Logistics Directorate
Sanand Industrial Estate, Ahmedabad, Gujarat, 382170

FROM:
Silverline Components
Logistics & Commercial Operations
Plot 44, Hadapsar Industrial Area, Pune, Maharashtra, 411028

SUBJECT: NOTICE OF DELIVERY DISCREPANCY & REQUISITION FOR JOINT SURVEY UNDER SECTIONS 37 & 42, SALE OF GOODS ACT, 1930 (PURCHASE ORDER: DIS-PO-8841, DISPATCH NOTE: SO-2066)

Dear Sir / Madam,

We write regarding the delivery of precision components consigned under invoice / dispatch documentation:

1. Supply Particulars & Recorded Discrepancy:
   (a) Purchase Order DIS-PO-8841 specifies supply of 100 precision units at an aggregate invoice value of ₹1,20,000/-.
   (b) Supplier Dispatch Note SO-2066 records 100 units packed and consigned via road transport carrier (Truck No: MH-12-Q-4109).
   (c) Consignee Goods Received Note (GRN-2026-4402) records receipt of only 90 units into inventory, identifying a shortfall of 10 units (disputed sum: ₹12,000/-).
   (d) Outer packaging photographs document crushed carton corners and torn tamper-evident security tape.

2. Evidentiary & Chain of Custody Deficit:
   (a) External packaging distress does not prove internal precision component destruction without joint electrical bench testing.
   (b) No carrier Lorry Receipt (LR) with delivery exception endorsement or driver counter-signature has been placed on record.

3. Requisition for Joint Physical Survey:
   In accordance with commercial trade custom and Sections 37 and 42 of the Sale of Goods Act, 1930, we propose:
   (a) A joint physical survey at your Sanand warehouse within five (5) working days conducted by technical representatives of both parties and the logistics carrier;
   (b) Functional electrical bench testing of the suspect units to isolate packaging distress from component defect;
   (c) Execution of a tripartite joint inspection protocol to adjust billing or file insurance carrier claims.

Yours faithfully,

Authorized Signatory
For Silverline Components`,
      createdAt: '2026-08-12T10:00:00Z',
      updatedAt: '2026-08-12T10:00:00Z',
      status: 'FLAGGED',
      isDemoCase: true,
    },
  ];
}
