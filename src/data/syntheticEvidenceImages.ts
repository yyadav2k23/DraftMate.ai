/**
 * DraftMate.ai — Synthetic Evidence Image Generation
 * 
 * Provides crisp, self-contained SVG image data URIs for all demonstration cases.
 * Strictly labelled with prominent "FICTIONAL DEMO EVIDENCE" banners.
 */

function svgToDataUri(svgString: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}

/* =========================================================================
   CASE 1: COMMERCIAL PAYMENT RECEIPT (STAMPED SLIP)
   ========================================================================= */
export const DEMO_IMG_CASE_1_RECEIPT = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <defs>
    <linearGradient id="paperBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f4f6fa"/>
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.15"/>
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="800" height="500" fill="#0b1120"/>

  <!-- Fictional Demo Banner -->
  <rect x="20" y="15" width="760" height="32" rx="6" fill="#b45309" fill-opacity="0.2" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="400" y="36" fill="#fbbf24" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle" letter-spacing="1">
    ⚠️ FICTIONAL DEMO EVIDENCE — NOT A REAL DOCUMENT — FOR BENCHMARK TESTING ONLY
  </text>

  <!-- Document Paper Sheet -->
  <rect x="40" y="60" width="720" height="410" rx="12" fill="url(#paperBg)" stroke="#cbd5e1" stroke-width="2" filter="url(#shadow)"/>

  <!-- Header -->
  <rect x="40" y="60" width="720" height="60" rx="12" fill="#1e293b"/>
  <text x="65" y="96" fill="#f8fafc" font-family="sans-serif" font-size="16" font-weight="bold">
    NORTHSTAR RETAIL — GOODS RECEIVING &amp; SETTLEMENT ACKNOWLEDGMENT
  </text>
  <text x="735" y="96" fill="#94a3b8" font-family="monospace" font-size="12" text-anchor="end">
    GRN-2026-9914
  </text>

  <!-- Details Table -->
  <text x="65" y="150" fill="#64748b" font-family="sans-serif" font-size="11" font-weight="bold" text-transform="uppercase">Consignor (Supplier):</text>
  <text x="65" y="170" fill="#0f172a" font-family="sans-serif" font-size="13" font-weight="600">Aster Supplies Private Limited (DEMO-ASTER-001)</text>

  <text x="420" y="150" fill="#64748b" font-family="sans-serif" font-size="11" font-weight="bold" text-transform="uppercase">Receiving Entity:</text>
  <text x="420" y="170" fill="#0f172a" font-family="sans-serif" font-size="13" font-weight="600">Northstar Retail Hub, Kanpur, Uttar Pradesh</text>

  <line x1="65" y1="190" x2="735" y2="190" stroke="#e2e8f0" stroke-width="1.5"/>

  <!-- Particulars Grid -->
  <text x="65" y="220" fill="#475569" font-family="sans-serif" font-size="12">Invoice Reference:</text>
  <text x="220" y="220" fill="#0f172a" font-family="monospace" font-size="13" font-weight="bold">INV-2026-104</text>

  <text x="65" y="250" fill="#475569" font-family="sans-serif" font-size="12">Invoice Face Value:</text>
  <text x="220" y="250" fill="#047857" font-family="monospace" font-size="14" font-weight="bold">₹50,000/- (Fifty Thousand INR)</text>

  <text x="65" y="280" fill="#475569" font-family="sans-serif" font-size="12">Receipt Date:</text>
  <text x="220" y="280" fill="#0f172a" font-family="sans-serif" font-size="13">25 August 2026</text>

  <text x="65" y="310" fill="#475569" font-family="sans-serif" font-size="12">Transaction Reference:</text>
  <text x="220" y="310" fill="#1d4ed8" font-family="monospace" font-size="14" font-weight="bold">TXN123</text>

  <!-- Red Physical Stamp Graphic -->
  <g transform="translate(540, 260) rotate(-12)">
    <circle cx="70" cy="70" r="65" fill="none" stroke="#dc2626" stroke-width="3" stroke-dasharray="8 4"/>
    <circle cx="70" cy="70" r="55" fill="#fef2f2" fill-opacity="0.85" stroke="#ef4444" stroke-width="1.5"/>
    <text x="70" y="55" fill="#b91c1c" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">NORTHSTAR ACCOUNTS</text>
    <text x="70" y="74" fill="#dc2626" font-family="sans-serif" font-size="14" font-weight="900" text-anchor="middle">RECEIVED / PAID</text>
    <text x="70" y="90" fill="#991b1b" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">DATE: 25-AUG-2026</text>
    <text x="70" y="105" fill="#b91c1c" font-family="monospace" font-size="9" text-anchor="middle">REF: TXN123</text>
  </g>

  <!-- Evidentiary Limitation Warning -->
  <rect x="65" y="380" width="460" height="60" rx="8" fill="#fffbeb" stroke="#fcd34d" stroke-width="1"/>
  <text x="80" y="402" fill="#92400e" font-family="sans-serif" font-size="11" font-weight="bold">
    Evidentiary Audit Note:
  </text>
  <text x="80" y="422" fill="#78350f" font-family="sans-serif" font-size="10">
    Physical stamp asserts payment settlement, but underlying primary bank statement is not attached.
  </text>
</svg>
`);

/* =========================================================================
   CASE 2: EMPLOYMENT PAYROLL NOTIFICATION SCREENSHOT
   ========================================================================= */
export const DEMO_IMG_CASE_2_PAYROLL_NOTIFICATION = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <rect width="800" height="500" fill="#080e1a"/>

  <!-- Fictional Demo Banner -->
  <rect x="20" y="15" width="760" height="32" rx="6" fill="#b45309" fill-opacity="0.2" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="400" y="36" fill="#fbbf24" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">
    ⚠️ FICTIONAL DEMO EVIDENCE — MOBILE HR PORTAL SCREENSHOT
  </text>

  <!-- Mobile Screen Frame -->
  <rect x="220" y="60" width="360" height="420" rx="28" fill="#0f172a" stroke="#334155" stroke-width="4"/>
  
  <!-- Notch & Header -->
  <rect x="330" y="68" width="140" height="16" rx="8" fill="#1e293b"/>
  <text x="250" y="112" fill="#94a3b8" font-family="sans-serif" font-size="11">Meridian Pulse HR Portal</text>
  <text x="540" y="112" fill="#10b981" font-family="monospace" font-size="10" text-anchor="end">● Online</text>

  <!-- Notification Card -->
  <rect x="240" y="130" width="320" height="270" rx="16" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
  <circle cx="270" cy="165" r="16" fill="#3b82f6" fill-opacity="0.2"/>
  <text x="270" y="170" fill="#60a5fa" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">₹</text>

  <text x="298" y="160" fill="#f8fafc" font-family="sans-serif" font-size="13" font-weight="bold">Disbursement Advice</text>
  <text x="298" y="176" fill="#94a3b8" font-family="sans-serif" font-size="10">August 2026 Compensation</text>

  <rect x="255" y="200" width="290" height="65" rx="10" fill="#0f172a" stroke="#334155" stroke-width="1"/>
  <text x="270" y="222" fill="#64748b" font-family="sans-serif" font-size="10">EMPLOYEE NAME</text>
  <text x="270" y="244" fill="#f1f5f9" font-family="sans-serif" font-size="12" font-weight="bold">Priya Sharma (DEMO-EMP-002)</text>

  <text x="440" y="222" fill="#64748b" font-family="sans-serif" font-size="10">MONTHLY SALARY</text>
  <text x="440" y="244" fill="#34d399" font-family="monospace" font-size="13" font-weight="bold">₹35,000</text>

  <text x="255" y="295" fill="#94a3b8" font-family="sans-serif" font-size="11">Batch Processing Date:</text>
  <text x="545" y="295" fill="#fbbf24" font-family="monospace" font-size="11" font-weight="bold" text-anchor="end">05-SEP-2026</text>

  <text x="255" y="325" fill="#94a3b8" font-family="sans-serif" font-size="11">Internal Batch Status:</text>
  <text x="545" y="325" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="end">BATCH TRANSMITTED</text>

  <rect x="255" y="345" width="290" height="42" rx="6" fill="#451a03" fill-opacity="0.6" stroke="#b45309" stroke-width="1"/>
  <text x="400" y="365" fill="#fcd34d" font-family="sans-serif" font-size="9" text-anchor="middle" font-weight="bold">
    Notice: Internal dispatch. Does NOT verify bank credit.
  </text>
  <text x="400" y="378" fill="#fcd34d" font-family="sans-serif" font-size="8" text-anchor="middle">
    UTR number pending clearing bank confirmation.
  </text>
</svg>
`);

/* =========================================================================
   CASE 3: TENANCY MOVE-OUT DEDUCTION INSPECTION SHEET
   ========================================================================= */
export const DEMO_IMG_CASE_3_DEDUCTION_SHEET = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <rect width="800" height="500" fill="#0a0f1d"/>

  <!-- Fictional Demo Banner -->
  <rect x="20" y="15" width="760" height="32" rx="6" fill="#b45309" fill-opacity="0.2" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="400" y="36" fill="#fbbf24" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">
    ⚠️ FICTIONAL DEMO EVIDENCE — HANDOVER DEDUCTIONS CHECKLIST
  </text>

  <!-- Sheet Layout -->
  <rect x="50" y="60" width="700" height="410" rx="10" fill="#f8fafc" stroke="#94a3b8" stroke-width="2"/>
  
  <rect x="50" y="60" width="700" height="50" rx="10" fill="#0f172a"/>
  <text x="75" y="92" fill="#ffffff" font-family="sans-serif" font-size="15" font-weight="bold">
    GREENVIEW PROPERTIES — VACATION &amp; DEPOSIT RECONCILIATION SCHEDULE
  </text>
  
  <text x="75" y="140" fill="#475569" font-family="sans-serif" font-size="11">Premises: Flat 4B, Sample Apartments, Lucknow | Tenant: Rahul Verma</text>
  <text x="75" y="160" fill="#475569" font-family="sans-serif" font-size="11">Security Deposit Paid at Inception (01-Feb-2026):</text>
  <text x="480" y="160" fill="#0f172a" font-family="monospace" font-size="13" font-weight="bold">₹30,000/-</text>

  <line x1="75" y1="180" x2="725" y2="180" stroke="#cbd5e1" stroke-width="1.5"/>

  <!-- Deduction Items -->
  <text x="75" y="210" fill="#b91c1c" font-family="sans-serif" font-size="12" font-weight="bold">Claimed Deductions (No Invoices Attached):</text>

  <rect x="75" y="225" width="650" height="35" fill="#f1f5f9" rx="6"/>
  <text x="90" y="248" fill="#334155" font-family="sans-serif" font-size="12">1. Deep Cleaning Charges</text>
  <text x="690" y="248" fill="#b91c1c" font-family="monospace" font-size="13" font-weight="bold" text-anchor="end">- ₹2,000/-</text>

  <rect x="75" y="270" width="650" height="35" fill="#f1f5f9" rx="6"/>
  <text x="90" y="293" fill="#334155" font-family="sans-serif" font-size="12">2. Wall Painting &amp; Plaster Touch-up</text>
  <text x="690" y="293" fill="#b91c1c" font-family="monospace" font-size="13" font-weight="bold" text-anchor="end">- ₹3,000/-</text>

  <line x1="75" y1="320" x2="725" y2="320" stroke="#94a3b8" stroke-width="1.5"/>

  <!-- Arithmetic Net -->
  <text x="75" y="345" fill="#0f172a" font-family="sans-serif" font-size="12" font-weight="bold">Calculated Net Balance (₹30,000 - ₹2,000 - ₹3,000):</text>
  <text x="690" y="345" fill="#047857" font-family="monospace" font-size="15" font-weight="bold" text-anchor="end">₹25,000/-</text>

  <!-- Landlord Arbitrary Deduction Warning -->
  <rect x="75" y="375" width="650" height="75" rx="8" fill="#fef2f2" stroke="#f87171" stroke-width="1.5"/>
  <text x="95" y="400" fill="#991b1b" font-family="sans-serif" font-size="11" font-weight="bold">
    Discrepancy Note Against Landlord Message:
  </text>
  <text x="95" y="420" fill="#7f1d1d" font-family="sans-serif" font-size="10">
    Landlord WhatsApp message dated 03-Sep-2026 asserts refund will only be ₹20,000/-, creating an unexplained ₹5,000 variance.
  </text>
  <text x="95" y="438" fill="#b91c1c" font-family="monospace" font-size="9">
    Missing: Third-party painting contractor invoice, cleaning tax receipt, move-in/move-out photographs.
  </text>
</svg>
`);

/* =========================================================================
   CASE 4: DEFECTIVE LAPTOP WITH CRACKED SCREEN PHOTOGRAPH
   ========================================================================= */
export const DEMO_IMG_CASE_4_CRACKED_LAPTOP = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="520" viewBox="0 0 800 520">
  <rect width="800" height="520" fill="#050811"/>

  <!-- Fictional Demo Banner -->
  <rect x="20" y="12" width="760" height="30" rx="6" fill="#b45309" fill-opacity="0.25" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="400" y="32" fill="#fbbf24" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">
    ⚠️ FICTIONAL DEMO EVIDENCE — BUYER SUBMITTED PHOTOGRAPH OF DEFECTIVE PRODUCT
  </text>

  <!-- Desk Surface -->
  <rect x="40" y="55" width="720" height="445" rx="14" fill="#1e2230" stroke="#334155" stroke-width="2"/>
  
  <!-- Laptop Base Chassis -->
  <polygon points="120,440 680,440 640,320 160,320" fill="#2d3748" stroke="#4a5568" stroke-width="2"/>
  <!-- Touchpad -->
  <rect x="350" y="380" width="100" height="50" rx="4" fill="#1a202c" stroke="#4a5568" stroke-width="1"/>
  <!-- Keyboard area -->
  <rect x="180" y="330" width="440" height="42" rx="4" fill="#1a202c" stroke="#4a5568" stroke-width="1"/>
  <text x="400" y="355" fill="#4a5568" font-family="monospace" font-size="10" text-anchor="middle">KEYBOARD MATRIX</text>

  <!-- Laptop Display Screen (Tilted Up) -->
  <rect x="160" y="90" width="480" height="230" rx="8" fill="#090d16" stroke="#4a5568" stroke-width="4"/>
  <rect x="175" y="105" width="450" height="200" rx="4" fill="#020617"/>

  <!-- Realistic Glass Fracture Spiderweb Lines -->
  <path d="M 190,120 L 280,180 L 390,210 L 480,200 L 590,260" stroke="#93c5fd" stroke-width="3" fill="none" opacity="0.95"/>
  <path d="M 280,180 L 240,240 L 320,290" stroke="#60a5fa" stroke-width="2" fill="none" opacity="0.85"/>
  <path d="M 280,180 L 340,140 L 450,130" stroke="#38bdf8" stroke-width="2" fill="none" opacity="0.8"/>
  <path d="M 390,210 L 410,280 L 470,300" stroke="#93c5fd" stroke-width="1.8" fill="none" opacity="0.85"/>
  <path d="M 390,210 L 360,110" stroke="#bfdbfe" stroke-width="1.5" fill="none" opacity="0.75"/>
  <path d="M 480,200 L 520,150 L 580,140" stroke="#93c5fd" stroke-width="2" fill="none" opacity="0.85"/>

  <!-- LCD Bleed Artifacts -->
  <ellipse cx="280" cy="180" rx="30" ry="20" fill="#3b82f6" fill-opacity="0.35"/>
  <ellipse cx="390" cy="210" rx="25" ry="15" fill="#a855f7" fill-opacity="0.3"/>
  <circle cx="280" cy="180" r="6" fill="#f8fafc"/>

  <!-- Delivery Courier Label on Desk -->
  <rect x="60" y="100" width="90" height="110" rx="4" fill="#fef3c7" stroke="#d97706" stroke-width="1"/>
  <text x="105" y="120" fill="#78350f" font-family="sans-serif" font-size="8" font-weight="bold" text-anchor="middle">BrightCart</text>
  <text x="105" y="135" fill="#92400e" font-family="monospace" font-size="7" text-anchor="middle">ORD-BC-88912</text>
  <text x="105" y="150" fill="#78350f" font-family="sans-serif" font-size="7" text-anchor="middle">Del: 12-Sep-2026</text>
  <text x="105" y="165" fill="#b45309" font-family="sans-serif" font-size="6" text-anchor="middle">Laptop Pro 15"</text>
  <text x="105" y="185" fill="#92400e" font-family="monospace" font-size="7" font-weight="bold" text-anchor="middle">₹60,000</text>

  <!-- Legal Evidentiary Limitation Tag -->
  <rect x="80" y="445" width="640" height="45" rx="6" fill="#0f172a" fill-opacity="0.9" stroke="#eab308" stroke-width="1"/>
  <text x="400" y="462" fill="#fde047" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">
    IMAGE EVIDENTIARY LIMITATION: Visible fracture confirmed on display screen.
  </text>
  <text x="400" y="478" fill="#cbd5e1" font-family="sans-serif" font-size="9" text-anchor="middle">
    Photograph metadata, time of capture, and transit chain-of-custody are NOT independently authenticated. Requires technical report.
  </text>
</svg>
`);

export const DEMO_IMG_CASE_4_SELLER_CHAT = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <rect width="800" height="500" fill="#0f172a"/>
  
  <rect x="20" y="15" width="760" height="32" rx="6" fill="#b45309" fill-opacity="0.25" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="400" y="36" fill="#fbbf24" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">
    ⚠️ FICTIONAL DEMO EVIDENCE — BRIGHTCART SELLER SUPPORT CHAT TRANSCRIPT
  </text>

  <rect x="150" y="65" width="500" height="410" rx="16" fill="#1e293b" stroke="#334155" stroke-width="2"/>
  
  <!-- Chat Header -->
  <rect x="150" y="65" width="500" height="50" rx="16" fill="#0f172a"/>
  <text x="180" y="96" fill="#f8fafc" font-family="sans-serif" font-size="13" font-weight="bold">BrightCart Support Case #BC-CR-4410</text>

  <!-- Buyer Message -->
  <rect x="170" y="130" width="360" height="70" rx="12" fill="#3b82f6" fill-opacity="0.2" stroke="#3b82f6" stroke-width="1"/>
  <text x="185" y="150" fill="#93c5fd" font-family="sans-serif" font-size="10" font-weight="bold">Ananya Mehta (Buyer) — 12 Sep 2026, 04:15 PM</text>
  <text x="185" y="170" fill="#f8fafc" font-family="sans-serif" font-size="11">I just opened the package delivered today. The laptop screen is</text>
  <text x="185" y="186" fill="#f8fafc" font-family="sans-serif" font-size="11">severely cracked and unreadable. I request an immediate replacement.</text>

  <!-- Seller Response -->
  <rect x="270" y="220" width="360" height="90" rx="12" fill="#334155" stroke="#475569" stroke-width="1"/>
  <text x="285" y="240" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="bold">BrightCart Claims Desk — 13 Sep 2026, 11:20 AM</text>
  <text x="285" y="260" fill="#f8fafc" font-family="sans-serif" font-size="11">Your order was dispatched in factory-sealed condition with bubble wrap.</text>
  <text x="285" y="276" fill="#f8fafc" font-family="sans-serif" font-size="11">Our courier POD confirms package delivered in good condition.</text>
  <text x="285" y="292" fill="#fca5a5" font-family="sans-serif" font-size="11" font-weight="bold">Claim for damaged screen replacement is rejected as physical damage.</text>

  <!-- Inconsistency Highlight -->
  <rect x="170" y="330" width="460" height="120" rx="10" fill="#450a0a" fill-opacity="0.4" stroke="#ef4444" stroke-width="1.5"/>
  <text x="190" y="355" fill="#f87171" font-family="sans-serif" font-size="11" font-weight="bold">Cross-Document Contradiction Identified:</text>
  <text x="190" y="375" fill="#fca5a5" font-family="sans-serif" font-size="10">• Buyer Assertion: Received with cracked display on 12 Sep 2026.</text>
  <text x="190" y="392" fill="#fca5a5" font-family="sans-serif" font-size="10">• Seller Assertion: Delivered intact without transit damage.</text>
  <text x="190" y="415" fill="#fde047" font-family="sans-serif" font-size="10" font-weight="bold">Missing: Technical inspection report &amp; delivery courier unboxing proof.</text>
</svg>
`);

/* =========================================================================
   CASE 5: PERSONAL LOAN BANK TRANSFER SCREENSHOT (₹50,000)
   ========================================================================= */
export const DEMO_IMG_CASE_5_BANK_TRANSFER = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <rect width="800" height="500" fill="#080c14"/>

  <!-- Fictional Demo Banner -->
  <rect x="20" y="15" width="760" height="32" rx="6" fill="#b45309" fill-opacity="0.25" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="400" y="36" fill="#fbbf24" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">
    ⚠️ FICTIONAL DEMO EVIDENCE — MOBILE UPI PAYMENT RECEIPT SCREENSHOT
  </text>

  <!-- Mobile Frame -->
  <rect x="240" y="60" width="320" height="420" rx="24" fill="#0f172a" stroke="#1e293b" stroke-width="3"/>
  <rect x="330" y="68" width="140" height="12" rx="6" fill="#1e293b"/>

  <!-- Green Success Icon -->
  <circle cx="400" cy="140" r="30" fill="#10b981" fill-opacity="0.2" stroke="#10b981" stroke-width="2"/>
  <path d="M 388,140 L 396,148 L 414,130" stroke="#34d399" stroke-width="3.5" fill="none" stroke-linecap="round"/>

  <text x="400" y="195" fill="#f8fafc" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">Payment Successful</text>
  <text x="400" y="215" fill="#94a3b8" font-family="sans-serif" font-size="11" text-anchor="middle">15 August 2026 at 02:45 PM</text>

  <!-- Transferred Amount -->
  <text x="400" y="255" fill="#34d399" font-family="monospace" font-size="28" font-weight="900" text-anchor="middle">₹50,000.00</text>
  
  <!-- Recipient details -->
  <rect x="260" y="280" width="280" height="85" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <text x="275" y="302" fill="#64748b" font-family="sans-serif" font-size="10">PAID TO:</text>
  <text x="275" y="322" fill="#f1f5f9" font-family="sans-serif" font-size="13" font-weight="bold">Karan Sethi (DEMO-BORROWER-005)</text>
  <text x="275" y="340" fill="#94a3b8" font-family="monospace" font-size="10">UPI ID: karansethi@demobank</text>
  <text x="275" y="355" fill="#60a5fa" font-family="monospace" font-size="9">Ref: UPI-2026-990812</text>

  <!-- Discrepancy Tag -->
  <rect x="255" y="380" width="290" height="85" rx="8" fill="#451a03" fill-opacity="0.8" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="400" y="400" fill="#fcd34d" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">
    LOAN SUM DISCREPANCY:
  </text>
  <text x="400" y="418" fill="#fef3c7" font-family="sans-serif" font-size="9" text-anchor="middle">
    Loan acknowledgement asserts total loan of ₹80,000.
  </text>
  <text x="400" y="434" fill="#fef3c7" font-family="sans-serif" font-size="9" text-anchor="middle">
    Screenshot only verifies ₹50,000. Balance ₹30,000 cash is unverified.
  </text>
  <text x="400" y="450" fill="#fbbf24" font-family="monospace" font-size="8" text-anchor="middle">
    Section 65B BSA certificate required for electronic proof.
  </text>
</svg>
`);

/* =========================================================================
   CASE 6: WAREHOUSE DAMAGED PACKAGING PHOTOGRAPH
   ========================================================================= */
export const DEMO_IMG_CASE_6_DAMAGED_CARTONS = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="520" viewBox="0 0 800 520">
  <rect width="800" height="520" fill="#080c16"/>

  <!-- Fictional Demo Banner -->
  <rect x="20" y="12" width="760" height="30" rx="6" fill="#b45309" fill-opacity="0.25" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="400" y="32" fill="#fbbf24" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">
    ⚠️ FICTIONAL DEMO EVIDENCE — WAREHOUSE RECEIVING DOCK PHOTOGRAPH
  </text>

  <!-- Warehouse Concrete Floor -->
  <rect x="40" y="55" width="720" height="445" rx="12" fill="#1f2937" stroke="#374151" stroke-width="2"/>
  <!-- Safety Striping on Dock -->
  <line x1="40" y1="460" x2="760" y2="460" stroke="#f59e0b" stroke-width="12" stroke-dasharray="30 20"/>

  <!-- Wooden Pallet -->
  <rect x="140" y="350" width="520" height="35" rx="4" fill="#78350f" stroke="#451a03" stroke-width="2"/>
  <rect x="180" y="385" width="40" height="20" fill="#451a03"/>
  <rect x="380" y="385" width="40" height="20" fill="#451a03"/>
  <rect x="580" y="385" width="40" height="20" fill="#451a03"/>

  <!-- Cardboard Box 1 (Severely Crushed Corner) -->
  <polygon points="180,350 360,350 370,180 230,160 170,220" fill="#b45309" stroke="#78350f" stroke-width="2"/>
  <!-- Crushed flap & tear -->
  <path d="M 230,160 L 260,210 L 210,230 L 280,270" stroke="#451a03" stroke-width="3" fill="none"/>
  <polygon points="230,160 260,210 210,230" fill="#78350f" opacity="0.6"/>

  <!-- Cardboard Box 2 (Adjacent Carton) -->
  <rect x="390" y="200" width="220" height="150" fill="#d97706" stroke="#92400e" stroke-width="2"/>
  <!-- Damaged Crease Lines -->
  <line x1="410" y1="210" x2="520" y2="330" stroke="#78350f" stroke-width="3"/>
  <line x1="480" y1="205" x2="600" y2="280" stroke="#78350f" stroke-width="2.5"/>

  <!-- Shipping Label on Carton -->
  <rect x="420" y="240" width="130" height="70" rx="4" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
  <text x="430" y="258" fill="#0f172a" font-family="sans-serif" font-size="9" font-weight="bold">CONSIGNMENT SO-2066</text>
  <text x="430" y="272" fill="#475569" font-family="monospace" font-size="8">Qty Stated: 100 Units</text>
  <text x="430" y="286" fill="#b91c1c" font-family="monospace" font-size="9" font-weight="bold">GRN Recv: 90 Units</text>
  <text x="430" y="298" fill="#64748b" font-family="sans-serif" font-size="7">Silverline Components</text>

  <!-- Critical Photographic Limitation Tag -->
  <rect x="80" y="405" width="640" height="45" rx="6" fill="#0f172a" fill-opacity="0.95" stroke="#ef4444" stroke-width="1.5"/>
  <text x="400" y="423" fill="#fca5a5" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">
    DAMAGE AUDIT DISTINCTION: Visible crushing of outer cardboard packaging confirmed.
  </text>
  <text x="400" y="439" fill="#f1f5f9" font-family="sans-serif" font-size="9" text-anchor="middle">
    Outer carton damage does NOT prove damage to internal electronic components. Joint technical survey required.
  </text>
</svg>
`);
