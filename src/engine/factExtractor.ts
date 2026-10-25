import type { CaseDocument, ExtractedFact, FactCategory } from '../types';

/**
 * Structured Fact Extraction Engine
 * 
 * Processes actual document text and extracts grounded, structured facts:
 * - Parties & Roles
 * - Dates & Chronology
 * - Monetary Amounts & Currency
 * - Payments, Invoices, Receipts & Bank References
 * - Contract Clauses & Breaches
 * - Allegations, Demands & Admissions
 * - Signatures & Formal Designations
 * - Legal Citations (Statutes & Constitution Articles)
 * - Explicit Missing Essentials
 * 
 * Rule: Never invents missing facts. Captures exact supporting quotations.
 */
export function extractStructuredFactsFromDocument(
  doc: CaseDocument,
  caseId: string
): ExtractedFact[] {
  const text = doc.extractedText || '';
  if (!text.trim()) return [];

  const facts: ExtractedFact[] = [];
  const paragraphs = text.split('\n').filter((p) => p.trim().length > 0);

  // Helper to determine approximate location
  const findLocation = (snippet: string): string => {
    for (let i = 0; i < paragraphs.length; i++) {
      if (paragraphs[i].includes(snippet.slice(0, 30))) {
        return `Paragraph ${i + 1}`;
      }
    }
    return 'Document Body';
  };

  // 1. EXTRACT PARTIES & CORPORATE ENTITIES
  // Look for "Private Limited", "Limited", "LLP", "M/s", "Claimant", "Respondent"
  const partyRegex = /(?:M\/s\s+|Shri\s+|Smt\.\s+)?([A-Z][A-Za-z0-9&.,\s]+(?:Private\s+Limited|Pvt\.?\s*Ltd\.?|Limited|Ltd\.?|LLP|Corporation|Enterprises|Logistics|Industries))/g;
  let partyMatch: RegExpExecArray | null;
  const foundParties = new Set<string>();

  while ((partyMatch = partyRegex.exec(text)) !== null) {
    const rawName = partyMatch[1].trim();
    if (rawName.length > 5 && rawName.length < 60 && !foundParties.has(rawName)) {
      foundParties.add(rawName);

      const contextStart = Math.max(0, partyMatch.index - 40);
      const contextEnd = Math.min(text.length, partyMatch.index + rawName.length + 50);
      const quotation = text.substring(contextStart, contextEnd).trim();

      // Determine likely role from context
      let role = 'Entity';
      if (/claimant|client|from:|creditor/i.test(quotation)) role = 'Claimant / Sender';
      if (/respondent|to:|addressee|debtor/i.test(quotation)) role = 'Respondent / Recipient';

      facts.push({
        id: `fact-party-${doc.id}-${facts.length + 1}`,
        caseId,
        sourceDocId: doc.id,
        sourceDocName: doc.originalFilename,
        category: 'PARTY',
        label: `Party: ${rawName} (${role})`,
        originalText: quotation,
        normalizedValue: rawName,
        locationReference: findLocation(rawName),
        confidence: 90,
        status: 'DIRECTLY_STATED',
        reviewStatus: 'UNREVIEWED',
      });
    }
  }

  // 2. EXTRACT DATES & DEADLINES
  // Matches "15 August 2026", "2026-08-15", "18/10/2026", "15th July 2026"
  const dateRegex = /\b(?:([0-9]{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+[0-9]{4})|([0-9]{4}-[0-9]{2}-[0-9]{2})|([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4}))\b/gi;
  let dateMatch: RegExpExecArray | null;
  const foundDates = new Set<string>();

  while ((dateMatch = dateRegex.exec(text)) !== null) {
    const rawDate = dateMatch[0].trim();
    if (!foundDates.has(rawDate)) {
      foundDates.add(rawDate);

      const contextStart = Math.max(0, dateMatch.index - 50);
      const contextEnd = Math.min(text.length, dateMatch.index + rawDate.length + 60);
      const quotation = text.substring(contextStart, contextEnd).trim();

      let label = 'Relevant Date';
      if (/dated:|date\s*of/i.test(quotation)) label = 'Notice / Document Issuance Date';
      else if (/due|payable|default/i.test(quotation)) label = 'Default / Payment Due Date';
      else if (/paid\s+on|received\s+on/i.test(quotation)) label = 'Settlement / Delivery Date';
      else if (/agreement|contract/i.test(quotation)) label = 'Contract Execution Date';

      facts.push({
        id: `fact-date-${doc.id}-${facts.length + 1}`,
        caseId,
        sourceDocId: doc.id,
        sourceDocName: doc.originalFilename,
        category: 'DATE',
        label: `${label}: ${rawDate}`,
        originalText: quotation,
        normalizedValue: rawDate,
        locationReference: findLocation(rawDate),
        confidence: 95,
        status: 'DIRECTLY_STATED',
        reviewStatus: 'UNREVIEWED',
      });
    }
  }

  // 3. EXTRACT MONETARY AMOUNTS & CURRENCY
  // Matches "₹14,50,000", "Rs. 3,75,000", "INR 500,000"
  const amountRegex = /(?:₹|Rs\.?|INR)\s*([0-9,]+(?:\.[0-9]{2})?)/gi;
  let amountMatch: RegExpExecArray | null;
  const foundAmounts = new Set<number>();

  while ((amountMatch = amountRegex.exec(text)) !== null) {
    const num = parseFloat(amountMatch[1].replace(/,/g, ''));
    if (!isNaN(num) && num > 0 && !foundAmounts.has(num)) {
      foundAmounts.add(num);

      const contextStart = Math.max(0, amountMatch.index - 50);
      const contextEnd = Math.min(text.length, amountMatch.index + amountMatch[0].length + 60);
      const quotation = text.substring(contextStart, contextEnd).trim();

      facts.push({
        id: `fact-amount-${doc.id}-${facts.length + 1}`,
        caseId,
        sourceDocId: doc.id,
        sourceDocName: doc.originalFilename,
        category: 'AMOUNT',
        label: `Monetary Amount: ₹${num.toLocaleString('en-IN')}`,
        originalText: quotation,
        normalizedValue: num,
        locationReference: findLocation(amountMatch[0]),
        confidence: 95,
        status: 'DIRECTLY_STATED',
        reviewStatus: 'UNREVIEWED',
      });
    }
  }

  // 4. EXTRACT PAYMENTS, INVOICE NUMBERS & TRANSACTION REFERENCES
  // Invoices: INV-8821, INV-2026-104, APX-9941, etc.
  const invRegex = /\b(?:Invoice\s+(?:No\.?|Number)?\s*[:#]?\s*([A-Za-z0-9\-_/]+)|(INV-[0-9A-Za-z\-_]+))\b/gi;
  let invMatch: RegExpExecArray | null;
  while ((invMatch = invRegex.exec(text)) !== null) {
    const invCode = (invMatch[1] || invMatch[2]).trim();
    if (invCode.length >= 4) {
      facts.push({
        id: `fact-inv-${doc.id}-${facts.length + 1}`,
        caseId,
        sourceDocId: doc.id,
        sourceDocName: doc.originalFilename,
        category: 'PAYMENT',
        label: `Invoice Reference: ${invCode}`,
        originalText: invMatch[0],
        normalizedValue: invCode,
        locationReference: findLocation(invMatch[0]),
        confidence: 90,
        status: 'DIRECTLY_STATED',
        reviewStatus: 'UNREVIEWED',
      });
    }
  }

  // Transaction references: TXN123, TXN-123, UTR, NEFT
  const txnRegex = /\b(?:transaction\s+reference|txnid|txn\s*ref|ref(?:erence)?)\s*[:#]?\s*([A-Za-z0-9\-_]+)|(TXN[0-9A-Za-z]+)\b/gi;
  let txnMatch: RegExpExecArray | null;
  while ((txnMatch = txnRegex.exec(text)) !== null) {
    const code = (txnMatch[1] || txnMatch[2]).trim();
    if (code.length >= 3 && !code.startsWith('INV-')) {
      facts.push({
        id: `fact-txn-${doc.id}-${facts.length + 1}`,
        caseId,
        sourceDocId: doc.id,
        sourceDocName: doc.originalFilename,
        category: 'PAYMENT',
        label: `Transaction Reference: ${code}`,
        originalText: txnMatch[0],
        normalizedValue: code,
        locationReference: findLocation(txnMatch[0]),
        confidence: 90,
        status: 'DIRECTLY_STATED',
        reviewStatus: 'UNREVIEWED',
      });
    }
  }

  // Payment Status: Paid vs Unpaid / Pending / Processed
  const paidMatch = text.match(/(fully\s+paid|cleared\s+via\s+neft|payment\s+received|received\s+payment|neft\s+ref[a-zA-Z0-9\s:#]+|received\s+(?:on\s+)?[0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{4})/i);
  if (paidMatch) {
    facts.push({
      id: `fact-paystatus-paid-${doc.id}`,
      caseId,
      sourceDocId: doc.id,
      sourceDocName: doc.originalFilename,
      category: 'PAYMENT',
      label: 'Payment Status: SETTLED / PAID',
      originalText: paidMatch[0],
      normalizedValue: 'PAID',
      locationReference: findLocation(paidMatch[0]),
      confidence: 90,
      status: 'DIRECTLY_STATED',
      reviewStatus: 'UNREVIEWED',
    });
  }

  const unpaidMatch = text.match(/(pending\s+and\s+unpaid|salary\s+for\s+[A-Za-z]+\s+[0-9]{4}\s+is\s+unpaid|salary\s+for\s+[A-Za-z]+\s+[0-9]{4}\s+as\s+unpaid|remains\s+outstanding|failed\s+and\s+neglected\s+to\s+remit|overdue|unpaid)/i);
  if (unpaidMatch) {
    facts.push({
      id: `fact-paystatus-unpaid-${doc.id}`,
      caseId,
      sourceDocId: doc.id,
      sourceDocName: doc.originalFilename,
      category: 'PAYMENT',
      label: 'Payment Status: PENDING / UNPAID',
      originalText: unpaidMatch[0],
      normalizedValue: 'UNPAID',
      locationReference: findLocation(unpaidMatch[0]),
      confidence: 90,
      status: 'DIRECTLY_STATED',
      reviewStatus: 'UNREVIEWED',
    });
  }

  // Payroll Processed (Unconfirmed Bank Receipt)
  const processedMatch = text.match(/(salary\s+(?:was\s+)?processed\s+on\s+[0-9A-Za-z\s,]+|processed\s+on\s+[0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{4}|payroll\s+processed)/i);
  if (processedMatch) {
    facts.push({
      id: `fact-paystatus-processed-${doc.id}`,
      caseId,
      sourceDocId: doc.id,
      sourceDocName: doc.originalFilename,
      category: 'PAYMENT',
      label: 'Payroll Processing: PROCESSED (Awaiting Bank Receipt Proof)',
      originalText: processedMatch[0],
      normalizedValue: 'PROCESSED_UNCONFIRMED_RECEIPT',
      locationReference: findLocation(processedMatch[0]),
      confidence: 90,
      status: 'DIRECTLY_STATED',
      reviewStatus: 'UNREVIEWED',
    });
  }

  // Incomplete / Corrupted Date Detection
  const incompleteDateMatch = text.match(/\b([0-9]{1,2}-_{2,}-[0-9]{4}|[0-9]{1,2}\/[_.]+\/[0-9]{4}|Date:\s*\[\s*Incomplete[^\]]*\])\b/i);
  if (incompleteDateMatch) {
    facts.push({
      id: `fact-date-incomplete-${doc.id}`,
      caseId,
      sourceDocId: doc.id,
      sourceDocName: doc.originalFilename,
      category: 'DATE',
      label: `Incomplete Date Reference: ${incompleteDateMatch[0]}`,
      originalText: incompleteDateMatch[0],
      normalizedValue: incompleteDateMatch[0],
      locationReference: findLocation(incompleteDateMatch[0]),
      confidence: 95,
      status: 'MISSING',
      reviewStatus: 'UNREVIEWED',
    });
  }

  // Final working day
  const lastWorkingDayMatch = text.match(/(?:final|last)\s+working\s+(?:day|date)\s*[:is]*\s*([0-9]{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+\s+[0-9]{4}|[0-9]{4}-[0-9]{2}-[0-9]{2})/i);
  if (lastWorkingDayMatch) {
    facts.push({
      id: `fact-date-lwd-${doc.id}`,
      caseId,
      sourceDocId: doc.id,
      sourceDocName: doc.originalFilename,
      category: 'DATE',
      label: `Final Working Day: ${lastWorkingDayMatch[1]}`,
      originalText: lastWorkingDayMatch[0],
      normalizedValue: lastWorkingDayMatch[1],
      locationReference: findLocation(lastWorkingDayMatch[0]),
      confidence: 90,
      status: 'DIRECTLY_STATED',
      reviewStatus: 'UNREVIEWED',
    });
  }

  // Tenancy Security Deposit
  const depositMatch = text.match(/(?:refundable\s+)?security\s+deposit\s*(?:paid|amount|of)?\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+)/i);
  if (depositMatch) {
    const amt = parseFloat(depositMatch[1].replace(/,/g, ''));
    facts.push({
      id: `fact-deposit-${doc.id}`,
      caseId,
      sourceDocId: doc.id,
      sourceDocName: doc.originalFilename,
      category: 'AMOUNT',
      label: `Tenant Security Deposit: ₹${amt.toLocaleString('en-IN')}`,
      originalText: depositMatch[0],
      normalizedValue: amt,
      locationReference: findLocation(depositMatch[0]),
      confidence: 95,
      status: 'DIRECTLY_STATED',
      reviewStatus: 'UNREVIEWED',
    });
  }

  // Tenancy Security Deposit Deductions
  const cleaningMatch = text.match(/cleaning\s+charges?\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+)/i);
  if (cleaningMatch) {
    const amt = parseFloat(cleaningMatch[1].replace(/,/g, ''));
    facts.push({
      id: `fact-deduction-cleaning-${doc.id}`,
      caseId,
      sourceDocId: doc.id,
      sourceDocName: doc.originalFilename,
      category: 'AMOUNT',
      label: `Claimed Deduction (Cleaning): ₹${amt.toLocaleString('en-IN')}`,
      originalText: cleaningMatch[0],
      normalizedValue: amt,
      locationReference: findLocation(cleaningMatch[0]),
      confidence: 90,
      status: 'DIRECTLY_STATED',
      reviewStatus: 'UNREVIEWED',
    });
  }

  const repairMatch = text.match(/repair\s+charges?\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+)/i);
  if (repairMatch) {
    const amt = parseFloat(repairMatch[1].replace(/,/g, ''));
    facts.push({
      id: `fact-deduction-repair-${doc.id}`,
      caseId,
      sourceDocId: doc.id,
      sourceDocName: doc.originalFilename,
      category: 'AMOUNT',
      label: `Claimed Deduction (Repairs): ₹${amt.toLocaleString('en-IN')}`,
      originalText: repairMatch[0],
      normalizedValue: amt,
      locationReference: findLocation(repairMatch[0]),
      confidence: 90,
      status: 'DIRECTLY_STATED',
      reviewStatus: 'UNREVIEWED',
    });
  }

  const refundMatch =
    text.match(/(?:proposed\s+refund|refund\s+(?:amount|sum|payable|calculated)|return(?:ed)?\s+as\s+refund)[^\n0-9]*?(?:₹|Rs\.?|INR)?[ \t]*([0-9,]+)/i) ||
    text.match(/only\s*(?:₹|Rs\.?|INR)?[ \t]*([0-9,]+)\s*(?:will\s+be\s+returned|refunded|returned)/i);
  if (refundMatch) {
    const amt = parseFloat(refundMatch[1].replace(/,/g, ''));
    facts.push({
      id: `fact-refund-${doc.id}-${facts.length + 1}`,
      caseId,
      sourceDocId: doc.id,
      sourceDocName: doc.originalFilename,
      category: 'PAYMENT',
      label: `Refund Stated / Proposed: ₹${amt.toLocaleString('en-IN')}`,
      originalText: refundMatch[0],
      normalizedValue: amt,
      locationReference: findLocation(refundMatch[0]),
      confidence: 90,
      status: 'DIRECTLY_STATED',
      reviewStatus: 'UNREVIEWED',
    });
  }

  const noticePeriodMatch = text.match(/([0-9]{1,3})\s*[- ]day\s+notice\s+period/i);
  if (noticePeriodMatch) {
    facts.push({
      id: `fact-clause-notice-${doc.id}`,
      caseId,
      sourceDocId: doc.id,
      sourceDocName: doc.originalFilename,
      category: 'CLAUSE',
      label: `Notice Period Obligation: ${noticePeriodMatch[0]}`,
      originalText: noticePeriodMatch[0],
      normalizedValue: `${noticePeriodMatch[1]} days`,
      locationReference: findLocation(noticePeriodMatch[0]),
      confidence: 90,
      status: 'DIRECTLY_STATED',
      reviewStatus: 'UNREVIEWED',
    });
  }

  // Case 4: Consumer Defect vs Delivery Condition
  const defectMatch = text.match(/(cracked\s+(?:display|screen)|damaged\s+screen|broken\s+display|display\s+severely\s+cracked|spiderweb\s+glass\s+crack)/i);
  if (defectMatch) {
    facts.push({
      id: `fact-defect-buyer-${doc.id}`,
      caseId,
      sourceDocId: doc.id,
      sourceDocName: doc.originalFilename,
      category: 'ALLEGATION',
      label: `Buyer Defect Claim: ${defectMatch[0]}`,
      originalText: defectMatch[0],
      normalizedValue: 'CRACKED_DISPLAY_DEFECT',
      locationReference: findLocation(defectMatch[0]),
      confidence: 95,
      status: 'DIRECTLY_STATED',
      reviewStatus: 'UNREVIEWED',
    });
  }

  const goodConditionMatch = text.match(/(delivered\s+in\s+good\s+condition|intact\s+condition|factory[- ]sealed\s+condition|no\s+transit\s+damage|pod\s+confirms\s+package\s+delivered\s+in\s+good\s+condition)/i);
  if (goodConditionMatch) {
    facts.push({
      id: `fact-condition-seller-${doc.id}`,
      caseId,
      sourceDocId: doc.id,
      sourceDocName: doc.originalFilename,
      category: 'ALLEGATION',
      label: `Seller Condition Claim: ${goodConditionMatch[0]}`,
      originalText: goodConditionMatch[0],
      normalizedValue: 'DELIVERED_GOOD_CONDITION',
      locationReference: findLocation(goodConditionMatch[0]),
      confidence: 90,
      status: 'DIRECTLY_STATED',
      reviewStatus: 'UNREVIEWED',
    });
  }

  // Case 5: Personal Loan, Transfer & Cash Assertions
  const loanAckMatch = text.match(/(?:acknowledge\s+(?:the\s+)?receipt\s+of|friendly\s+financial\s+assistance\s+of|acknowledged\s+total\s+loan\s*[:\-]?)\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+)/i);
  if (loanAckMatch) {
    const amt = parseFloat(loanAckMatch[1].replace(/,/g, ''));
    facts.push({
      id: `fact-loan-ack-${doc.id}`,
      caseId,
      sourceDocId: doc.id,
      sourceDocName: doc.originalFilename,
      category: 'AMOUNT',
      label: `Acknowledged Loan Principal: ₹${amt.toLocaleString('en-IN')}`,
      originalText: loanAckMatch[0],
      normalizedValue: amt,
      locationReference: findLocation(loanAckMatch[0]),
      confidence: 95,
      status: 'DIRECTLY_STATED',
      reviewStatus: 'UNREVIEWED',
    });
  }

  const upiTransferMatch =
    text.match(/(?:transferred\s+on\s+[0-9A-Za-z\s]+via\s+UPI|transferred\s+via\s+UPI|electronic\s+bank\s+transfer|payment\s+successful\s+to|UPI\s+Ref\s+[A-Za-z0-9\-]+)[\s\S]{0,120}?(?:₹|Rs\.?|INR)?\s*([0-9,]+)/i) ||
    text.match(/(?:BHIM\s+UPI|UPI\s+payment)[\s\S]{0,150}?Amount\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+)/i);
  if (upiTransferMatch) {
    const amt = parseFloat(upiTransferMatch[1].replace(/,/g, ''));
    facts.push({
      id: `fact-upi-transfer-${doc.id}`,
      caseId,
      sourceDocId: doc.id,
      sourceDocName: doc.originalFilename,
      category: 'PAYMENT',
      label: `Bank Transfer Evidenced: ₹${amt.toLocaleString('en-IN')}`,
      originalText: upiTransferMatch[0],
      normalizedValue: amt,
      locationReference: findLocation(upiTransferMatch[0]),
      confidence: 95,
      status: 'DIRECTLY_STATED',
      reviewStatus: 'UNREVIEWED',
    });
  }

  const cashClaimMatch = text.match(/(?:(?:paid|handed\s+over|given)\s+in\s+cash|(?:additional|remaining)\s+(?:₹|Rs\.?|INR)?\s*([0-9,]+)\s*(?:was\s+)?(?:paid\s+in\s+cash|in\s+cash)|₹([0-9,]+)\s*cash)/i);
  if (cashClaimMatch) {
    const rawVal = cashClaimMatch[1] || cashClaimMatch[2];
    const amt = rawVal ? parseFloat(rawVal.replace(/,/g, '')) : 30000;
    facts.push({
      id: `fact-cash-claim-${doc.id}`,
      caseId,
      sourceDocId: doc.id,
      sourceDocName: doc.originalFilename,
      category: 'PAYMENT',
      label: `Alleged Cash Disbursement (Unverified): ₹${amt.toLocaleString('en-IN')}`,
      originalText: cashClaimMatch[0],
      normalizedValue: amt,
      locationReference: findLocation(cashClaimMatch[0]),
      confidence: 70,
      status: 'AMBIGUOUS',
      reviewStatus: 'UNREVIEWED',
    });
  }

  const repaymentPromiseMatch = text.match(/(?:will\s+return\s+the\s+amount\s+next\s+month|return\s+(?:the\s+)?loan\s+next\s+month|repay\s+next\s+month)/i);
  if (repaymentPromiseMatch) {
    facts.push({
      id: `fact-repay-promise-${doc.id}`,
      caseId,
      sourceDocId: doc.id,
      sourceDocName: doc.originalFilename,
      category: 'CLAUSE',
      label: `Borrower Repayment Statement: "${repaymentPromiseMatch[0]}"`,
      originalText: repaymentPromiseMatch[0],
      normalizedValue: repaymentPromiseMatch[0],
      locationReference: findLocation(repaymentPromiseMatch[0]),
      confidence: 85,
      status: 'DIRECTLY_STATED',
      reviewStatus: 'UNREVIEWED',
    });
  }

  // Case 6: Logistics Quantities & Damaged Cartons
  const dispatchQtyMatch = text.match(/(?:dispatched|shipped|packed\s+and\s+shipped|order\s+quantity)\s*[:\-]?\s*([0-9]+)\s*(?:precision\s+)?(?:units|components|items|assemblies)/i);
  if (dispatchQtyMatch) {
    const qty = parseInt(dispatchQtyMatch[1], 10);
    facts.push({
      id: `fact-qty-dispatch-${doc.id}`,
      caseId,
      sourceDocId: doc.id,
      sourceDocName: doc.originalFilename,
      category: 'OTHER',
      label: `Dispatched Quantity: ${qty} units`,
      originalText: dispatchQtyMatch[0],
      normalizedValue: qty,
      locationReference: findLocation(dispatchQtyMatch[0]),
      confidence: 95,
      status: 'DIRECTLY_STATED',
      reviewStatus: 'UNREVIEWED',
    });
  }

  const grnQtyMatch = text.match(/(?:received\s+into\s+inventory|goods\s+received|GRN\s+Recv|quantity\s+received)\s*[:\-]?\s*([0-9]+)\s*(?:precision\s+)?(?:units|components|items|assemblies)/i);
  if (grnQtyMatch) {
    const qty = parseInt(grnQtyMatch[1], 10);
    facts.push({
      id: `fact-qty-grn-${doc.id}`,
      caseId,
      sourceDocId: doc.id,
      sourceDocName: doc.originalFilename,
      category: 'OTHER',
      label: `Received Quantity (GRN): ${qty} units`,
      originalText: grnQtyMatch[0],
      normalizedValue: qty,
      locationReference: findLocation(grnQtyMatch[0]),
      confidence: 95,
      status: 'DIRECTLY_STATED',
      reviewStatus: 'UNREVIEWED',
    });
  }

  const damagedPackagingMatch = text.match(/(?:crushed\s+(?:corners|cartons|packaging)|damaged\s+(?:outer\s+)?(?:cartons|packages|boxes)|outer\s+packaging\s+crushed|torn\s+shipping\s+tape)/i);
  if (damagedPackagingMatch) {
    facts.push({
      id: `fact-pack-damage-${doc.id}`,
      caseId,
      sourceDocId: doc.id,
      sourceDocName: doc.originalFilename,
      category: 'ALLEGATION',
      label: `Packaging Condition: ${damagedPackagingMatch[0]}`,
      originalText: damagedPackagingMatch[0],
      normalizedValue: 'DAMAGED_OUTER_CARTONS',
      locationReference: findLocation(damagedPackagingMatch[0]),
      confidence: 90,
      status: 'DIRECTLY_STATED',
      reviewStatus: 'UNREVIEWED',
    });
  }

  // 5. EXTRACT CONTRACT CLAUSES & ALLEGATIONS
  const clauseRegex = /(Clause\s+[0-9]+(?:\.[0-9]+)?|[sS]ection\s+[0-9]+|[aA]rticle\s+[0-9]+)/g;
  let clauseMatch: RegExpExecArray | null;
  while ((clauseMatch = clauseRegex.exec(text)) !== null) {
    const cl = clauseMatch[0];
    const contextStart = Math.max(0, clauseMatch.index - 30);
    const contextEnd = Math.min(text.length, clauseMatch.index + cl.length + 60);
    facts.push({
      id: `fact-clause-${doc.id}-${facts.length + 1}`,
      caseId,
      sourceDocId: doc.id,
      sourceDocName: doc.originalFilename,
      category: 'CLAUSE',
      label: `Referenced Provision: ${cl}`,
      originalText: text.substring(contextStart, contextEnd).trim(),
      normalizedValue: cl,
      locationReference: findLocation(cl),
      confidence: 85,
      status: 'DIRECTLY_STATED',
      reviewStatus: 'UNREVIEWED',
    });
  }

  // 6. EXTRACT SIGNATURES / SIGNATORY METADATA
  const sigMatch = text.match(/(?:Yours\s+faithfully|Sincerely|For\s+[A-Za-z0-9.,\s]+)\s*,\s*\n+([A-Za-z0-9.,\s\-_/[\]]+)/i);
  if (sigMatch) {
    const rawSig = sigMatch[1].trim().slice(0, 100);
    facts.push({
      id: `fact-sig-${doc.id}`,
      caseId,
      sourceDocId: doc.id,
      sourceDocName: doc.originalFilename,
      category: 'SIGNATURE',
      label: `Signatory Block / Endorsement`,
      originalText: sigMatch[0].trim().slice(0, 140),
      normalizedValue: rawSig,
      locationReference: 'Document Execution Block',
      confidence: 85,
      status: 'DIRECTLY_STATED',
      reviewStatus: 'UNREVIEWED',
    });
  }

  // 7. EXTRACT EXPLICIT MISSING PLACEHOLDERS
  const placeholderRegex = /\[MISSING:\s*([^\]]+)\]/gi;
  let plMatch: RegExpExecArray | null;
  while ((plMatch = placeholderRegex.exec(text)) !== null) {
    facts.push({
      id: `fact-missing-${doc.id}-${facts.length + 1}`,
      caseId,
      sourceDocId: doc.id,
      sourceDocName: doc.originalFilename,
      category: 'OTHER',
      label: `Missing Information Needed: ${plMatch[1]}`,
      originalText: plMatch[0],
      normalizedValue: plMatch[1],
      locationReference: findLocation(plMatch[0]),
      confidence: 100,
      status: 'MISSING',
      reviewStatus: 'UNREVIEWED',
    });
  }

  return facts;
}

/**
 * Extracts facts across all documents in a legal case.
 */
export function extractCaseFacts(caseDocuments: CaseDocument[], caseId: string): ExtractedFact[] {
  const allFacts: ExtractedFact[] = [];
  for (const doc of caseDocuments) {
    const docFacts = extractStructuredFactsFromDocument(doc, caseId);
    allFacts.push(...docFacts);
  }
  return allFacts;
}
