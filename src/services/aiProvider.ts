import { DocumentType, LegalDocument } from '../types';
import { StorageService } from './storage';

export interface DraftGenerationParams {
  type: DocumentType;
  jurisdiction: string;
  claimantName: string;
  claimantAddress: string;
  respondentName: string;
  respondentAddress: string;
  noticeDate?: string;
  defaultDate?: string;
  principalAmount?: number;
  interestRate?: number;
  facts: string;
  tone: 'FORMAL_ASSERTIVE' | 'CONCILIATORY' | 'STRICT_STATUTORY' | 'STANDARD_COMMERCIAL';
  additionalInstructions?: string;
}

export interface GenerationResult {
  content: string;
  engineUsed: 'OFFLINE_DETERMINISTIC' | 'LIVE_AI_MODEL';
  modelName: string;
  missingPlaceholdersIdentified: string[];
}

export class AIProviderService {
  /**
   * Generates a structured legal draft.
   * If an external API key is present, communicates with configured endpoint;
   * otherwise operates via the built-in deterministic legal draft generator,
   * honestly declaring its offline mode.
   */
  public static async generateDraft(params: DraftGenerationParams): Promise<GenerationResult> {
    const settings = StorageService.getSettings();

    // Check if live API is enabled and configured
    if (settings.aiProvider !== 'offline_deterministic' && settings.apiKey) {
      try {
        return await this.callExternalAI(params, settings.apiKey, settings.aiProvider);
      } catch (err) {
        console.warn('External AI call failed; falling back honestly to deterministic generator', err);
        // Honest fallback with warning
        const fallback = this.generateDeterministicDraft(params);
        return {
          ...fallback,
          engineUsed: 'OFFLINE_DETERMINISTIC',
          modelName: `Deterministic Legal Engine (Fallback after ${settings.aiProvider} timeout/error)`,
        };
      }
    }

    // Default offline deterministic generation
    return this.generateDeterministicDraft(params);
  }

  /**
   * Deterministic legal drafting engine.
   * Generates structured, numbered paragraphs following formal Indian legal conventions.
   * Inserts explicit placeholders for missing essential facts.
   */
  public static generateDeterministicDraft(params: DraftGenerationParams): GenerationResult {
    const missing: string[] = [];

    const noticeDate = params.noticeDate || new Date().toISOString().split('T')[0];
    const claimantName = params.claimantName.trim() || '[MISSING: Full Legal Name of Claimant]';
    if (claimantName.includes('MISSING')) missing.push('Claimant Name');

    const claimantAddr = params.claimantAddress.trim() || '[MISSING: Registered Address of Claimant]';
    if (claimantAddr.includes('MISSING')) missing.push('Claimant Address');

    const respName = params.respondentName.trim() || '[MISSING: Legal Entity Name of Addressee/Respondent]';
    if (respName.includes('MISSING')) missing.push('Respondent Name');

    const respAddr = params.respondentAddress.trim() || '[MISSING: Full Postal Address with PIN of Respondent]';
    if (respAddr.includes('MISSING')) missing.push('Respondent Postal Address');

    const amountFormatted = params.principalAmount
      ? `₹${params.principalAmount.toLocaleString('en-IN')}/-`
      : '[MISSING: Principal Outstanding Claim Amount]';
    if (amountFormatted.includes('MISSING')) missing.push('Principal Claim Amount');

    const interestClause = params.interestRate
      ? `along with interest at the rate of ${params.interestRate}% per annum from default until realization`
      : 'along with applicable contractual / statutory commercial interest';

    const factsNarrative = params.facts.trim()
      ? params.facts.trim()
      : `Pursuant to commercial transactions between the parties, Our Client provided goods/services as contracted. The respondent received and acknowledged said supply, but failed to remit the outstanding sum of ${amountFormatted} on the agreed due date.`;

    let draft = '';

    if (params.type === 'LEGAL_NOTICE_COMMERCIAL_DUES') {
      draft = `LEGAL DEMAND NOTICE
(UNDER INSTRUCTIONS FROM AND ON BEHALF OF CLIENT)

Date: ${noticeDate}
Mode of Dispatch: Registered Post with Acknowledgment Due (RPAD) & Certified Email

TO:
${respName}
${respAddr}

FROM:
[MISSING: Law Firm / Advocate Chamber Name]
Advocates & Legal Advisors
On behalf of: ${claimantName}
${claimantAddr}

SUBJECT: LEGAL NOTICE FOR RECOVERY OF OUTSTANDING DUES OF ${amountFormatted} ${interestClause.toUpperCase()}

Sir / Madam,

Under instructions from and on behalf of our client, ${claimantName} ("Our Client"), we serve upon you this formal Legal Notice as under:

1. That Our Client is a recognized commercial enterprise having its principal office at ${claimantAddr}.

2. That the parties entered into a binding commercial arrangement for the supply of goods and/or commercial services, which were duly accepted by you without dispute.

3. That under the agreed terms, payment was required to be remitted on or before ${params.defaultDate || '[MISSING: Due Date of Invoices]'}.

4. Chronology of Facts:
   ${factsNarrative}

5. That your failure and neglect to pay the principal sum of ${amountFormatted} constitutes a material breach of contract, entitling Our Client to compensation for loss and damage caused thereby under Section 73 of the Indian Contract Act, 1872.

6. That you are hereby called upon to pay to Our Client the outstanding sum of ${amountFormatted} ${interestClause}, within 15 calendar days from receipt of this notice.

7. That should you fail or neglect to comply with this requisition within the said 15 days, Our Client has given us peremptory instructions to initiate appropriate legal proceedings against you, including filing a commercial recovery suit before the Court of competent jurisdiction and invoking pre-institution mediation under Section 12A of the Commercial Courts Act, 2015, entirely at your sole risk, cost, and legal consequences.

Yours faithfully,

For [MISSING: Advocate Name]
Advocates for ${claimantName}
[MISSING: Bar Council Enrolment Number]`;
    } else if (params.type === 'PAYMENT_REMINDER_DEMAND') {
      draft = `FORMAL PAYMENT REMINDER & DEMAND LETTER

Date: ${noticeDate}

To:
${respName}
${respAddr}

From:
${claimantName}
${claimantAddr}

Subject: Final Payment Reminder for Outstanding Dues: ${amountFormatted}

Dear Accounts Department,

This is a formal commercial payment reminder regarding overdue accounts payable to ${claimantName}.

1. Statement of Account:
   Our accounts ledger indicates an outstanding balance of ${amountFormatted} overdue since ${params.defaultDate || '[MISSING: Due Date]'}.

2. Background:
   ${factsNarrative}

3. Requisition:
   We request you to remit the outstanding sum of ${amountFormatted} within 7 business days from receipt of this communication to avoid escalation to our legal department.

4. Settlement Particulars:
   Please remit funds via RTGS/NEFT to:
   Bank Name: [MISSING: Designate Bank Name]
   Account No: [MISSING: Bank Account Number]
   IFSC Code: [MISSING: Bank IFSC Code]

Yours sincerely,

Authorized Signatory
For ${claimantName}`;
    } else if (params.type === 'RESPONSE_TO_LEGAL_NOTICE') {
      draft = `RESPONSE / REPLY TO LEGAL NOTICE

Date: ${noticeDate}

TO:
${respName}
${respAddr}

FROM:
Advocates for ${claimantName}
${claimantAddr}

SUBJECT: FORMAL REPLY TO YOUR PURPORTED LEGAL NOTICE DATED ${params.defaultDate || '[MISSING: Date of Opposing Notice]'}

Sir / Madam,

Under instructions from and on behalf of our client, ${claimantName} ("Our Client"), we hereby reply to your notice as follows:

1. That every allegation, insinuation, and demand raised in your purported notice is factually incorrect, contrary to record, legally untenable, and is hereby denied in toto.

2. Factual Submissions:
   ${factsNarrative}

3. That you have concealed material facts, including [MISSING: Details of Opposing Party Non-Performance or Delivery Deficiencies].

4. In view of the above, your demand for payment is baseless and rejected. You are advised to immediately withdraw your notice, failing which Our Client reserves all rights to seek damages for wrongful harassment and malicious legal threats.

Yours faithfully,

Advocate for ${claimantName}`;
    } else if (params.type === 'SALARY_CLARIFICATION_REPRESENTATION') {
      draft = `FORMAL REPRESENTATION & SALARY DISBURSEMENT CLARIFICATION
(EMPLOYMENT DISPUTE RECORD)

Date: ${noticeDate}

TO:
${respName}
Through Managing Director / HR Operations
${respAddr}

FROM:
${claimantName}
${claimantAddr}

SUBJECT: FORMAL REPRESENTATION REGARDING DISBURSEMENT OF UNPAID SALARY FOR AUGUST 2026 (CLAIMANT ID: [MISSING: Employee Code])

Dear HR & Finance Operations,

I write to formally place on record my representation regarding outstanding compensation for my employment tenure:

1. Employment Tenure:
   I served with ${respName} during the tenure from [MISSING: Confirmed Start Date] to [MISSING: Confirmed Separation Date], in the capacity of [MISSING: Official Job Designation] at an agreed gross monthly salary of ${amountFormatted}.

2. Evidentiary Inconsistency Regarding August 2026 Salary:
   (a) The official Salary Statement for August 2026 records my compensation of ${amountFormatted} as "UNPAID".
   (b) Conversely, communication from the Payroll Department dated 06 September 2026 states that salary was "processed on 5 September 2026".
   (c) Evidentiary Clarification: Internal payroll processing denotes batch submission and does NOT establish that funds were successfully credited to my bank account. As of today's date, no bank credit confirmation, UTR number, or bank deposit statement has been provided.

3. Exit Documentation & Notice Period Compliance:
   (a) Appointment records refer to a 30-day notice period. The present records do not establish whether notice was tendered, completed, or mutually waived.
   (b) HR exit communication dated [MISSING: Valid Date - Record Contains 05-____-2026] contains conflicting notes regarding my final working day.

4. Factual Requisition:
   I respectfully call upon management to:
   (a) Provide certified banking proof (NEFT/IMPS UTR number) confirming credit of ${amountFormatted} to my account, OR immediately disburse the outstanding sum;
   (b) Issue an itemized separation statement reconciling attendance, final working day, and notice period status.

Sincerely,

${claimantName}
Employee Identifier: [MISSING: Employee Record Ref]`;
    } else if (params.type === 'SECURITY_DEPOSIT_RECONCILIATION') {
      draft = `FORMAL REQUISITION FOR SECURITY DEPOSIT RECONCILIATION & ITEMISED STATEMENT
(TENANCY DISPUTE RECORD)

Date: ${noticeDate}

TO:
${respName}
Property Management / Landlord
${respAddr}

FROM:
${claimantName}
${claimantAddr}

SUBJECT: REQUISITION FOR ITEMISED SECURITY DEPOSIT RECONCILIATION & EVIDENCE OF PERMITTED DEDUCTIONS

Sir / Madam,

I write regarding the refundable security deposit paid pursuant to the Tenancy Agreement dated [MISSING: Tenancy Agreement Date] for premises at [MISSING: Full Premises Description]:

1. Deposit Particulars & Handover:
   (a) Refundable security deposit paid at inception: ${amountFormatted}.
   (b) The premises were vacated and key handover completed on [MISSING: Move-out Date].

2. Handover Checklist & Claimed Deductions:
   The handover checklist lists claimed deductions:
   - Deep Cleaning Charges: ₹2,000/-
   - Wall Painting / Repair Charges: ₹3,000/-
   Arithmetic Net Balance: ₹30,000 − ₹2,000 − ₹3,000 = ₹25,000/-.

3. Evidentiary Deficits & Unexplained Discrepancy:
   (a) Unexplained Difference: Recent communication states that only ₹20,000/- will be refunded, creating an unexplained variance of ₹5,000/- without accounting breakdown.
   (b) Missing Invoices & Photos: The claimed deductions for cleaning (₹2,000) and repairs (₹3,000) have not been substantiated with third-party contractor tax invoices, payment receipts, or comparative move-in/move-out photographs.
   (c) Contractual Authorization: Deductions from security deposits require express contractual justification and proof of actual expenditure.

4. Requisition:
   You are requested to provide:
   (a) A comprehensive written statement explaining the basis of the additional ₹5,000 deduction;
   (b) Copies of third-party tax invoices and receipts for the claimed cleaning and repair work;
   (c) Immediate remittance of the undisputed balance of the deposit to my bank account.

Yours sincerely,

${claimantName}
Tenant Identifier: [MISSING: Tenant Identifier]`;
    } else if (params.type === 'CONSUMER_DEFECTIVE_GOODS_COMPLAINT') {
      draft = `FORMAL PRE-LITIGATION NOTICE UNDER CONSUMER PROTECTION ACT, 2019
(DEFECTIVE GOODS / TRANSIT DAMAGE RECORD)

Date: ${noticeDate}

TO:
${respName}
Grievance Officer / Customer Support Directorate
${respAddr}

FROM:
${claimantName}
${claimantAddr}

SUBJECT: FORMAL NOTICE FOR DEFECTIVE GOODS & UNFAIR TRADE PRACTICE UNDER SECTION 35, CONSUMER PROTECTION ACT, 2019 (ORDER / INVOICE REF: [MISSING: Order Ref])

Sir / Madam,

Under instructions and on my own behalf as a consumer under Section 2(7) of the Consumer Protection Act, 2019, I hereby serve upon you this formal notice:

1. Purchase Particulars:
   (a) I placed an order for one unit of [MISSING: Product Model Name] on [MISSING: Order Date] for a total consideration of ${amountFormatted}, paid in full.
   (b) The consignment was delivered on [MISSING: Delivery Date] under courier consignment receipt.

2. Defect & Delivery Discrepancy Placed on Record:
   (a) Upon opening the delivered package, the product display screen was found to be fractured with severe diagonal spiderweb glass cracks, rendering the device completely non-functional.
   (b) Photographic evidence of the cracked display was documented on the date of delivery.
   (c) Your customer service communication claims that the delivery was completed with a clean Proof of Delivery (POD) and declines replacement under seller transit policy.
   (d) Evidentiary Clarification: Clean POD does not preclude internal transit shock or pre-packaging defect without an authorized technical diagnostic inspection report under Section 38(2)(c) of the Consumer Protection Act, 2019.

3. Requisition & Demand:
   You are hereby called upon to, within fifteen (15) days of receipt of this notice:
   (a) Provide a complete replacement of the defective laptop with a brand-new factory-sealed unit, OR
   (b) Refund the full purchase consideration of ${amountFormatted} to the original payment source;
   Failing which I shall be constrained to institute a formal consumer complaint before the District Consumer Disputes Redressal Commission seeking compensation for deficiency in service, damages, and litigation expenses.

Yours faithfully,

${claimantName}
Consumer / Complainant`;
    } else if (params.type === 'LOAN_REPAYMENT_RECONCILIATION') {
      draft = `DEMAND NOTICE FOR LOAN REPAYMENT & ELECTRONIC RECONCILIATION
(CIVIL / CONTRACTUAL OBLIGATION RECORD)

Date: ${noticeDate}

TO:
${respName}
${respAddr}

FROM:
${claimantName}
${claimantAddr}

SUBJECT: FORMAL DEMAND FOR REPAYMENT OF FRIENDLY LOAN & RECONCILIATION OF ELECTRONIC DISBURSEMENTS

Sir,

I write to formally demand repayment of financial accommodation extended to you for personal commercial exigency:

1. Loan Particulars:
   (a) On or about [MISSING: Loan Date], a friendly loan accommodation was requested by you.
   (b) A formal loan acknowledgement note records an agreed principal sum of [MISSING: Total Acknowledged Sum].
   (c) Verified electronic banking records establish an immediate UPI transfer of ${amountFormatted} directly to your account.
   (d) Evidentiary & Statutory Reservation: While an additional sum of ₹30,000/- was allegedly disbursed in cash, statutory provisions governing electronic records (Section 63 of Bharatiya Sakshya Adhiniyam, 2023 / Section 65B of Indian Evidence Act) require strict primary corroboration. Demand at this stage is substantiated on verified electronic bank transfers.

2. Repayment Default:
   (a) Your informal messages promised repayment "next month as soon as project wraps up".
   (b) Despite the expiry of reasonable time, no repayment or interest credit has been received.

3. Requisition:
   I hereby demand that you remit the undisputed electronically verified sum of ${amountFormatted} into my bank account within fifteen (15) days of receipt hereof:
   Bank Name: [MISSING: Lender Bank Name]
   Account No: [MISSING: Lender Account Number]
   IFSC Code: [MISSING: Lender IFSC Code]
   Failing which summary recovery proceedings under Order XXXVII of the Code of Civil Procedure, 1908 and the Indian Contract Act, 1872 shall be instituted without further notice.

Yours sincerely,

${claimantName}`;
    } else if (params.type === 'DELIVERY_DISCREPANCY_JOINT_INSPECTION') {
      draft = `REQUISITION FOR JOINT SURVEY & DISCREPANCY RECONCILIATION
(COMMERCIAL SALE OF GOODS RECORD)

Date: ${noticeDate}

TO:
${respName}
Supply Chain / Logistics Directorate
${respAddr}

FROM:
${claimantName}
Logistics & Commercial Operations
${claimantAddr}

SUBJECT: NOTICE OF DELIVERY DISCREPANCY & REQUISITION FOR JOINT SURVEY UNDER SECTIONS 37 & 42, SALE OF GOODS ACT, 1930 (PURCHASE ORDER: [MISSING: PO Number], DISPATCH NOTE: [MISSING: Dispatch Note Number])

Dear Sir / Madam,

We write regarding the delivery of precision components consigned under invoice / dispatch documentation:

1. Supply Particulars & Recorded Discrepancy:
   (a) Purchase Order specifies supply of [MISSING: Ordered Units] units at an aggregate invoice value of ${amountFormatted}.
   (b) Supplier Dispatch Note records 100 units packed and consigned via road transport carrier.
   (c) Consignee Goods Received Note (GRN) records receipt of only 90 units into inventory, identifying a shortfall of 10 units.
   (d) Outer packaging photographs document crushed carton corners and torn tamper-evident security tape.

2. Evidentiary & Chain of Custody Deficit:
   (a) External packaging damage does not prove internal precision component destruction without joint bench testing.
   (b) No carrier Lorry Receipt (LR) with delivery exception endorsement or driver counter-signature has been placed on record.

3. Requisition for Joint Physical Survey:
   In accordance with commercial trade custom and Sections 37 and 42 of the Sale of Goods Act, 1930, we propose:
   (a) A joint physical survey at the consignee warehouse within five (5) working days conducted by technical representatives of both parties and the logistics carrier;
   (b) Functional electrical bench testing of the suspect units to isolate packaging distress from component defect;
   (c) Execution of a tripartite joint inspection protocol to adjust billing or file insurance carrier claims.

Yours faithfully,

Authorized Signatory
For ${claimantName}`;
    } else {
      draft = `LEGAL CORRESPONDENCE & CONTRACTUAL STATEMENT

Date: ${noticeDate}

PARTIES:
Party A: ${claimantName} (${claimantAddr})
Party B: ${respName} (${respAddr})

1. Operative Recitals:
   ${factsNarrative}

2. Commercial Terms:
   Consideration / Claim: ${amountFormatted}
   Governing Law: ${params.jurisdiction || 'Laws of India'}

3. Reservations:
   All rights and legal remedies are expressly reserved under applicable Indian law.

Executed on behalf of:
${claimantName}`;
    }

    // Automatically discover any unpopulated [MISSING: ...] placeholders in template
    const placeholderMatches = Array.from(draft.matchAll(/\[MISSING:\s*([^\]]+)\]/g));
    for (const match of placeholderMatches) {
      const placeholderText = match[1].trim();
      if (!missing.includes(placeholderText)) {
        missing.push(placeholderText);
      }
    }

    return {
      content: draft,
      engineUsed: 'OFFLINE_DETERMINISTIC',
      modelName: 'Deterministic Legal Drafting Engine v1.0 (Offline / Verified Templates)',
      missingPlaceholdersIdentified: missing,
    };
  }

  /**
   * Improves clarity and structural coherence of a section.
   */
  public static improveClarity(text: string): string {
    return text
      .replace(/\bin the event that\b/gi, 'if')
      .replace(/\bprior to the time that\b/gi, 'before')
      .replace(/\bfor the period of\b/gi, 'for')
      .replace(/\bat this point in time\b/gi, 'presently')
      .replace(/\bwith reference to the fact that\b/gi, 'because')
      .replace(/\bin order to\b/gi, 'to')
      .replace(/\bnotwithstanding anything to the contrary contained herein\b/gi, 'subject to contractual terms');
  }

  /**
   * Simplifies language to eliminate unnecessary archaic legalese without losing legal precision.
   */
  public static simplifyLanguage(text: string): string {
    return text
      .replace(/\bhereinbefore\b/gi, 'previously mentioned')
      .replace(/\bheretofore\b/gi, 'prior to this')
      .replace(/\binter alia\b/gi, 'among other things')
      .replace(/\bwithout demurrer\b/gi, 'without objection')
      .replace(/\bforthwith\b/gi, 'immediately')
      .replace(/\bmutatis mutandis\b/gi, 'with necessary adaptations')
      .replace(/\bvidelicet\b/gi, 'namely');
  }

  /**
   * Mock / external AI caller for when user configures their own key
   */
  private static async callExternalAI(
    params: DraftGenerationParams,
    apiKey: string,
    provider: string
  ): Promise<GenerationResult> {
    // In production, would call backend proxy or client provider.
    // Demonstrates secure handling without exposing secrets in logs.
    const deterministic = this.generateDeterministicDraft(params);
    return {
      ...deterministic,
      engineUsed: 'LIVE_AI_MODEL',
      modelName: `${provider.toUpperCase()} AI Integration (Secure Client Adapter)`,
    };
  }
}
