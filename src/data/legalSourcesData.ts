import type { CitationRecord, LegalSourceCategory } from '../types';

export interface LegalSourceRegistryItem {
  id: string;
  actTitle: string;
  shortTitle: string;
  provision: string;
  subject: string;
  jurisdiction: string;
  officialSourceUrl: string;
  officialSourceOrganization: string;
  isOfficialSource: boolean;
  statutoryText: string;
  summaryOfLaw: string;
  scopeAndLimitations: string;
  commonMisconceptions: string[];
  enactmentYear: number;
  commencedDate: string;
  lastVerifiedAt: string;
  status: 'CURRENT_ENACTED' | 'REPEALED' | 'AMENDED' | 'SECONDARY_COMMENTARY' | 'UNVERIFIED_AUTHORITY';
  category: LegalSourceCategory;
  sourcePublication?: string;
  isCurrentLaw: boolean;
  importMethod?: 'CURATED_OFFICIAL_GAZETTE' | 'MANUAL_OFFICIAL_IMPORT' | 'AUTOMATED_LIVE_PROBE';
}

export const CURATED_LEGAL_SOURCES: LegalSourceRegistryItem[] = [
  // ==========================================
  // THE CONSTITUTION OF INDIA (Legislative Department Official Text)
  // https://www.legislative.gov.in/documents
  // ==========================================
  {
    id: 'src-const-art-14',
    actTitle: 'The Constitution of India',
    shortTitle: 'Constitution of India',
    provision: 'Article 14',
    subject: 'Equality before law and equal protection of the laws',
    jurisdiction: 'India (Constitutional / Supreme Court & High Courts)',
    officialSourceUrl: 'https://www.legislative.gov.in/constitution-of-india/',
    officialSourceOrganization: 'Legislative Department, Ministry of Law and Justice, Government of India',
    isOfficialSource: true,
    category: 'CONSTITUTION',
    sourcePublication: 'Official Gazette of India / Legislative Department Published Text',
    isCurrentLaw: true,
    statutoryText:
      'The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India.',
    summaryOfLaw:
      'Guarantees equality before the law and prohibits unreasonable discrimination or arbitrary state action in administrative, contractual, and regulatory dealings by "the State" under Article 12.',
    scopeAndLimitations:
      'Enforceable primarily against the State and its instrumentalities (Article 12). Does not create a direct private civil cause of action against purely private commercial entities without state nexus.',
    commonMisconceptions: [
      'Misconception: Article 14 applies directly to purely private commercial contractual defaults between two private companies (False: Private contracts are governed by the Indian Contract Act, not Article 14 writ petitions).',
    ],
    enactmentYear: 1950,
    commencedDate: '1950-01-26',
    lastVerifiedAt: '2026-10-25T00:00:00Z',
    status: 'CURRENT_ENACTED',
  },
  {
    id: 'src-const-art-19-1-g',
    actTitle: 'The Constitution of India',
    shortTitle: 'Constitution of India',
    provision: 'Article 19(1)(g)',
    subject: 'Freedom to practice any profession, or to carry on any occupation, trade or business',
    jurisdiction: 'India (Constitutional)',
    officialSourceUrl: 'https://www.legislative.gov.in/constitution-of-india/',
    officialSourceOrganization: 'Legislative Department, Ministry of Law and Justice, Government of India',
    isOfficialSource: true,
    category: 'CONSTITUTION',
    sourcePublication: 'Official Gazette of India / Legislative Department',
    isCurrentLaw: true,
    statutoryText:
      'All citizens shall have the right to practise any profession, or to carry on any occupation, trade or business, subject to reasonable restrictions under clause (6).',
    summaryOfLaw:
      'Protects citizens against unreasonable or arbitrary state-imposed restrictions on commercial activity, trade, and professions.',
    scopeAndLimitations:
      'Available only to citizens of India (not corporations or foreign entities, though shareholder rights may be considered). Subject to reasonable restrictions under Article 19(6).',
    commonMisconceptions: [],
    enactmentYear: 1950,
    commencedDate: '1950-01-26',
    lastVerifiedAt: '2026-10-25T00:00:00Z',
    status: 'CURRENT_ENACTED',
  },
  {
    id: 'src-const-art-21',
    actTitle: 'The Constitution of India',
    shortTitle: 'Constitution of India',
    provision: 'Article 21',
    subject: 'Protection of life and personal liberty; fair, just and reasonable procedure',
    jurisdiction: 'India (Constitutional)',
    officialSourceUrl: 'https://www.legislative.gov.in/constitution-of-india/',
    officialSourceOrganization: 'Legislative Department, Ministry of Law and Justice, Government of India',
    isOfficialSource: true,
    category: 'CONSTITUTION',
    sourcePublication: 'Official Gazette of India / Legislative Department',
    isCurrentLaw: true,
    statutoryText:
      'No person shall be deprived of his life or personal liberty except according to procedure established by law.',
    summaryOfLaw:
      'Core fundamental right ensuring that any state deprivation of liberty or livelihood must adhere to just, fair, and reasonable legal procedure (Maneka Gandhi doctrine).',
    scopeAndLimitations:
      'Applies to all persons (citizens and non-citizens). Does not substitute ordinary civil commercial recovery dispute procedures.',
    commonMisconceptions: [],
    enactmentYear: 1950,
    commencedDate: '1950-01-26',
    lastVerifiedAt: '2026-10-25T00:00:00Z',
    status: 'CURRENT_ENACTED',
  },
  {
    id: 'src-const-art-226',
    actTitle: 'The Constitution of India',
    shortTitle: 'Constitution of India',
    provision: 'Article 226',
    subject: 'Power of High Courts to issue certain writs',
    jurisdiction: 'India (High Courts Jurisdiction)',
    officialSourceUrl: 'https://www.legislative.gov.in/constitution-of-india/',
    officialSourceOrganization: 'Legislative Department, Ministry of Law and Justice, Government of India',
    isOfficialSource: true,
    category: 'CONSTITUTION',
    sourcePublication: 'Official Gazette of India / Legislative Department',
    isCurrentLaw: true,
    statutoryText:
      'Notwithstanding anything in article 32, every High Court shall have power... to issue to any person or authority, including in appropriate cases, any Government... directions, orders or writs... for the enforcement of any of the rights conferred by Part III and for any other purpose.',
    summaryOfLaw:
      'Grants extraordinary constitutional writ jurisdiction to High Courts for enforcing Fundamental Rights or correcting state arbitrariness/statutory violations.',
    scopeAndLimitations:
      'Discretionary remedy. High Courts ordinarily decline writ petitions where an efficacious alternative statutory remedy exists (e.g. standard civil recovery suit or arbitration under Commercial Courts Act).',
    commonMisconceptions: [
      'Misconception: A party can file an Article 226 writ petition for pure money recovery arising out of a private commercial invoice (False: Supreme Court has consistently held ordinary contractual recovery must follow civil court or arbitration remedies).',
    ],
    enactmentYear: 1950,
    commencedDate: '1950-01-26',
    lastVerifiedAt: '2026-10-25T00:00:00Z',
    status: 'CURRENT_ENACTED',
  },
  {
    id: 'src-const-art-299',
    actTitle: 'The Constitution of India',
    shortTitle: 'Constitution of India',
    provision: 'Article 299',
    subject: 'Contracts made in exercise of executive power of the Union or of a State',
    jurisdiction: 'India (Constitutional / Government Contracting)',
    officialSourceUrl: 'https://www.legislative.gov.in/constitution-of-india/',
    officialSourceOrganization: 'Legislative Department, Ministry of Law and Justice, Government of India',
    isOfficialSource: true,
    category: 'CONSTITUTION',
    sourcePublication: 'Official Gazette of India / Legislative Department',
    isCurrentLaw: true,
    statutoryText:
      'All contracts made in the exercise of the executive power of the Union or of a State shall be expressed to be made by the President, or by the Governor of the State... and all such contracts and all assurances of property made in the exercise of that power shall be executed on behalf of the President or the Governor by such persons and in such manner as he may direct or authorise.',
    summaryOfLaw:
      'Mandatory formal requirements for government commercial contracts. Oral or informal contracts with government departments that do not comply with Article 299 are void and unenforceable.',
    scopeAndLimitations:
      'Applies strictly to contracts with Union or State governments. Does not apply to contracts between private corporations or statutory autonomous corporations with separate legal personality.',
    commonMisconceptions: [],
    enactmentYear: 1950,
    commencedDate: '1950-01-26',
    lastVerifiedAt: '2026-10-25T00:00:00Z',
    status: 'CURRENT_ENACTED',
  },
  {
    id: 'src-const-art-300a',
    actTitle: 'The Constitution of India',
    shortTitle: 'Constitution of India',
    provision: 'Article 300A',
    subject: 'Persons not to be deprived of property save by authority of law',
    jurisdiction: 'India (Constitutional)',
    officialSourceUrl: 'https://www.legislative.gov.in/constitution-of-india/',
    officialSourceOrganization: 'Legislative Department, Ministry of Law and Justice, Government of India',
    isOfficialSource: true,
    category: 'CONSTITUTION',
    sourcePublication: 'Official Gazette of India / Legislative Department',
    isCurrentLaw: true,
    statutoryText:
      'No person shall be deprived of his property save by authority of law.',
    summaryOfLaw:
      'Constitutional right protecting individuals and legal entities against arbitrary deprivation of property or monetary receivables without statutory backing.',
    scopeAndLimitations:
      'Constitutional right (not Fundamental Right post-44th Amendment). Protects against unlawful state expropriation.',
    commonMisconceptions: [],
    enactmentYear: 1950,
    commencedDate: '1950-01-26',
    lastVerifiedAt: '2026-10-25T00:00:00Z',
    status: 'CURRENT_ENACTED',
  },

  // ==========================================
  // CENTRAL ACTS & PROCEDURAL CODES (India Code)
  // https://www.indiacode.nic.in/
  // ==========================================
  {
    id: 'src-ica-73',
    actTitle: 'The Indian Contract Act, 1872 (Act No. 9 of 1872)',
    shortTitle: 'Indian Contract Act, 1872',
    provision: 'Section 73',
    subject: 'Compensation for loss or damage caused by breach of contract',
    jurisdiction: 'India (Central)',
    officialSourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2187',
    officialSourceOrganization: 'Legislative Department, Ministry of Law and Justice, Government of India (India Code)',
    isOfficialSource: true,
    category: 'CENTRAL_ACT',
    sourcePublication: 'India Code / Central Enactment',
    isCurrentLaw: true,
    statutoryText:
      'When a contract has been broken, the party who suffers by such breach is entitled to receive, from the party who has broken the contract, compensation for any loss or damage caused to him thereby, which naturally arose in the usual course of things from such breach, or which the parties knew, when they made the contract, to be likely to result from the breach of it. Such compensation is not to be given for any remote and indirect loss or damage sustained by reason of the breach.',
    summaryOfLaw:
      'Provides civil remedy for actual loss or damage naturally arising from breach of contract. Requires claimant to establish breach, causation, and quantifiable loss. Specifically bars remote, speculative, or indirect damages.',
    scopeAndLimitations:
      'Applies to civil breach of contractual obligations. Does not authorize arbitrary penalty claims, punitive damages, or criminal proceedings. Does not prescribe a mandatory notice response timeline.',
    commonMisconceptions: [
      'Misconception: Section 73 imposes a mandatory statutory 15-day cure period (False: Cure periods arise from contract terms or practice, not statutory compulsion in s.73).',
      'Misconception: Section 73 awards penalty interest automatically (False: Interest is governed by contract terms or Interest Act, 1978).',
    ],
    enactmentYear: 1872,
    commencedDate: '1872-09-01',
    lastVerifiedAt: '2026-10-25T00:00:00Z',
    status: 'CURRENT_ENACTED',
  },
  {
    id: 'src-ica-74',
    actTitle: 'The Indian Contract Act, 1872 (Act No. 9 of 1872)',
    shortTitle: 'Indian Contract Act, 1872',
    provision: 'Section 74',
    subject: 'Compensation for breach of contract where penalty stipulated for',
    jurisdiction: 'India (Central)',
    officialSourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2187',
    officialSourceOrganization: 'India Code / Ministry of Law and Justice',
    isOfficialSource: true,
    category: 'CENTRAL_ACT',
    sourcePublication: 'India Code',
    isCurrentLaw: true,
    statutoryText:
      'When a contract has been broken, if a sum is named in the contract as the amount to be paid in case of such breach, or if the contract contains any other stipulation by way of penalty, the party complaining of the breach is entitled, whether or not actual damage or loss is proved to have been caused thereby, to receive from the party who has broken the contract reasonable compensation not exceeding the amount so named or, as the case may be, the penalty stipulated for.',
    summaryOfLaw:
      'Liquidated damages rule in Indian law (Kailash Nath Associates v. DDA, 2015). Even if a fixed penalty is written in the agreement, courts award only reasonable compensation up to that ceiling.',
    scopeAndLimitations:
      'Parties cannot claim arbitrary penalty windfalls. Proof of reasonable loss is still required unless loss is impossible to quantify.',
    commonMisconceptions: [],
    enactmentYear: 1872,
    commencedDate: '1872-09-01',
    lastVerifiedAt: '2026-10-25T00:00:00Z',
    status: 'CURRENT_ENACTED',
  },
  {
    id: 'src-cpc-order-37',
    actTitle: 'The Code of Civil Procedure, 1908 (Act No. 5 of 1908)',
    shortTitle: 'Code of Civil Procedure, 1908',
    provision: 'Order XXXVII (Rules 1 to 7)',
    subject: 'Summary Procedure for recovery of debts and liquidated demands',
    jurisdiction: 'India (Central)',
    officialSourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2191',
    officialSourceOrganization: 'Legislative Department, Ministry of Law and Justice, Government of India (India Code)',
    isOfficialSource: true,
    category: 'PROCEDURAL_CODE',
    sourcePublication: 'India Code',
    isCurrentLaw: true,
    statutoryText:
      'Order XXXVII applies to high courts, city civil courts, and courts of small causes... upon bills of exchange, hundis and promissory notes, or suits in which the plaintiff seeks only to recover a debt or liquidated demand in money payable by the defendant, with or without interest, arising on a written contract or on an enactment...',
    summaryOfLaw:
      'Provides an expedited summary civil litigation procedure where defendant must apply for leave to defend within 10 days of summons. Confined to specified courts and specific liquidated written instruments.',
    scopeAndLimitations:
      'Does not automatically apply to every ordinary commercial debt dispute or unliquidated damage claim. Pre-institution mediation under Commercial Courts Act 2015 s.12A may also be required unless urgent interim relief is sought.',
    commonMisconceptions: [
      'Misconception: Order XXXVII allows a creditor to seize assets without court summons (False: It is a court litigation procedure, not a unilateral recovery mechanism).',
      'Misconception: Order XXXVII applies to any verbal or disputed commercial claim (False: Requires clear written agreement or negotiable instrument).',
    ],
    enactmentYear: 1908,
    commencedDate: '1909-01-01',
    lastVerifiedAt: '2026-10-25T00:00:00Z',
    status: 'CURRENT_ENACTED',
  },
  {
    id: 'src-nia-138',
    actTitle: 'The Negotiable Instruments Act, 1881 (Act No. 26 of 1881)',
    shortTitle: 'Negotiable Instruments Act, 1881',
    provision: 'Section 138',
    subject: 'Dishonour of cheque for insufficiency, etc., of funds in the account',
    jurisdiction: 'India (Central)',
    officialSourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2202',
    officialSourceOrganization: 'India Code / Ministry of Law and Justice',
    isOfficialSource: true,
    category: 'SPECIAL_STATUTE',
    sourcePublication: 'India Code',
    isCurrentLaw: true,
    statutoryText:
      'Where any cheque drawn by a person on an account maintained by him with a banker for payment of any amount of money to another person... is returned by the bank unpaid... such person shall be deemed to have committed an offence... Provided that the payee or holder makes a demand for the payment of the said amount of money by giving a notice in writing, within thirty days of the receipt of information by him from the bank regarding the return of the cheque as unpaid, and the drawer of such cheque fails to make the payment... within fifteen days of the receipt of the said notice.',
    summaryOfLaw:
      'Creates quasi-criminal liability for dishonoured cheques issued in discharge of legally enforceable debt. Strict statutory timeline: 30 days to send notice from cheque return, 15 days for drawer to make payment upon receipt before cause of action arises.',
    scopeAndLimitations:
      'Confined strictly to dishonoured cheques. Does NOT apply to bank transfers (NEFT/RTGS), debit memos, or general invoices without a bounced physical/electronic cheque.',
    commonMisconceptions: [
      'Misconception: The 15-day statutory payment demand from Section 138 applies to regular invoice notices (False: Only applies to cheque bounce notices under NIA Section 138).',
    ],
    enactmentYear: 1881,
    commencedDate: '1882-03-01',
    lastVerifiedAt: '2026-10-25T00:00:00Z',
    status: 'CURRENT_ENACTED',
  },
  {
    id: 'src-cca-12a',
    actTitle: 'The Commercial Courts Act, 2015 (Act No. 4 of 2016)',
    shortTitle: 'Commercial Courts Act, 2015',
    provision: 'Section 12A',
    subject: 'Pre-Institution Mediation and Settlement in Commercial Disputes',
    jurisdiction: 'India (Central)',
    officialSourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2163',
    officialSourceOrganization: 'Legislative Department, Ministry of Law and Justice, Government of India (India Code)',
    isOfficialSource: true,
    category: 'PROCEDURAL_CODE',
    sourcePublication: 'India Code',
    isCurrentLaw: true,
    statutoryText:
      'A suit, which does not contemplate any urgent interim relief under this Act, shall not be instituted unless the plaintiff exhausts the remedy of pre-institution mediation in accordance with such manner and procedure as may be prescribed by rules made by the Central Government.',
    summaryOfLaw:
      'Mandatory pre-litigation mediation procedure for commercial disputes of specified value before approaching Commercial Courts, held mandatory by Supreme Court in Patil Automation (2022).',
    scopeAndLimitations:
      'Applies to suits of commercial dispute defined under Section 2(1)(c) where no urgent interim relief is prayed.',
    commonMisconceptions: [],
    enactmentYear: 2015,
    commencedDate: '2015-10-23',
    lastVerifiedAt: '2026-10-25T00:00:00Z',
    status: 'CURRENT_ENACTED',
  },
  {
    id: 'src-bsa-63',
    actTitle: 'Bharatiya Sakshya Adhiniyam, 2023 (Act No. 47 of 2023)',
    shortTitle: 'Bharatiya Sakshya Adhiniyam, 2023 (BSA)',
    provision: 'Section 63',
    subject: 'Admissibility of electronic records (replaces Section 65B of Indian Evidence Act, 1872)',
    jurisdiction: 'India (Central)',
    officialSourceUrl: 'https://www.indiacode.nic.in/handle/123456789/21235',
    officialSourceOrganization: 'Ministry of Law and Justice / Official Gazette of India',
    isOfficialSource: true,
    category: 'PROCEDURAL_CODE',
    sourcePublication: 'Official Gazette of India (Extraordinary)',
    isCurrentLaw: true,
    statutoryText:
      'Any information contained in an electronic record which is printed on a paper, stored, recorded or copied in optical or magnetic media or cloud... shall be deemed to be also a document... and shall be admissible in any proceedings, without further proof or production of the original, if the conditions mentioned in this section are satisfied... accompanied by a certificate as specified in the Schedule.',
    summaryOfLaw:
      'Regulates admissibility of electronic records, computer outputs, server logs, emails, and database records in Indian legal proceedings. Replaces Section 65B of Indian Evidence Act 1872 from 1 July 2024.',
    scopeAndLimitations:
      'Crucial distinction: Claims regarding digital evidence in proceedings after July 1, 2024 should refer to Section 63 of Bharatiya Sakshya Adhiniyam, 2023, while historical disputes initiated under IEA Section 65B remain governed by legacy transition principles.',
    commonMisconceptions: [
      'Misconception: Section 65B of Evidence Act 1872 remains the active provision for all new post-2024 proceedings (False: BSA 2023 has replaced it).',
    ],
    enactmentYear: 2023,
    commencedDate: '2024-07-01',
    lastVerifiedAt: '2026-10-25T00:00:00Z',
    status: 'CURRENT_ENACTED',
  },
  {
    id: 'src-iea-65b-legacy',
    actTitle: 'The Indian Evidence Act, 1872 (Repealed)',
    shortTitle: 'Indian Evidence Act, 1872 (Legacy)',
    provision: 'Section 65B',
    subject: 'Admissibility of electronic records (Legacy / Pre-July 2024)',
    jurisdiction: 'India (Central)',
    officialSourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2188',
    officialSourceOrganization: 'Legislative Department, Ministry of Law and Justice (Archived)',
    isOfficialSource: true,
    category: 'PROCEDURAL_CODE',
    sourcePublication: 'Archived India Code',
    isCurrentLaw: false,
    statutoryText:
      'Special provisions as to evidence relating to electronic record. Repealed by Bharatiya Sakshya Adhiniyam, 2023 with effect from 1st July, 2024.',
    summaryOfLaw:
      'Legacy evidentiary provision for electronic certificates (Arjun Panditrao Khotkar v. Kailash Kushanrao Gorantyal 2020). Replaced by Section 63 BSA 2023 for newly instituted matters.',
    scopeAndLimitations: 'Repealed statute. Use BSA 2023 for new filings.',
    commonMisconceptions: [],
    enactmentYear: 1872,
    commencedDate: '1872-09-01',
    lastVerifiedAt: '2026-10-25T00:00:00Z',
    status: 'REPEALED',
  },
  {
    id: 'src-limitation-3',
    actTitle: 'The Limitation Act, 1963 (Act No. 36 of 1963)',
    shortTitle: 'Limitation Act, 1963',
    provision: 'Section 3 & Schedule (Articles 15, 18)',
    subject: 'Bar of limitation for recovery of price of goods and debt claims',
    jurisdiction: 'India (Central)',
    officialSourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2189',
    officialSourceOrganization: 'India Code / Legislative Department',
    isOfficialSource: true,
    category: 'PROCEDURAL_CODE',
    sourcePublication: 'India Code',
    isCurrentLaw: true,
    statutoryText:
      'Subject to the provisions contained in sections 4 to 24 (inclusive), every suit instituted, appeal preferred, and application made after the prescribed period shall be dismissed, although limitation has not been set up as a defence.',
    summaryOfLaw:
      'Prescribes that civil suits for debt or unpaid goods delivered must generally be instituted within 3 years from the date when the goods were to be delivered or invoice became payable.',
    scopeAndLimitations: 'Mandatory statutory bar on late legal actions.',
    commonMisconceptions: [],
    enactmentYear: 1963,
    commencedDate: '1964-01-01',
    lastVerifiedAt: '2026-10-25T00:00:00Z',
    status: 'CURRENT_ENACTED',
  },

  // ==========================================
  // DELEGATED LEGISLATION (Rules, Notifications, Statutory Orders)
  // https://www.indiacode.nic.in/ & Official Gazette
  // ==========================================
  {
    id: 'src-del-leg-cc-mediation-rules',
    actTitle: 'Commercial Courts (Pre-Institution Mediation and Settlement) Rules, 2018 (G.S.R. 611(E))',
    shortTitle: 'Commercial Courts Mediation Rules, 2018',
    provision: 'Rule 3',
    subject: 'Procedure for initiating pre-institution mediation through District Legal Services Authority (DLSA)',
    jurisdiction: 'India (Central / Commercial Courts)',
    officialSourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2163',
    officialSourceOrganization: 'Department of Legal Affairs, Ministry of Law and Justice (Official Gazette)',
    isOfficialSource: true,
    category: 'DELEGATED_LEGISLATION',
    sourcePublication: 'The Gazette of India: Extraordinary, Part II, Sec. 3(i)',
    isCurrentLaw: true,
    statutoryText:
      'A party to a commercial dispute may make an application to the Authority as per Form-1 specifying the details of the party and opposite party with the dispute value... The Authority shall issue notice to the opposite party to appear and give consent to participate in mediation within 10 days of receipt of notice.',
    summaryOfLaw:
      'Subordinate delegated legislation governing the detailed operational procedure, forms, fees, and timelines for statutory mediation under Section 12A of the Commercial Courts Act, 2015.',
    scopeAndLimitations: 'Delegated procedural rules. Must be read harmoniously with parent Act.',
    commonMisconceptions: [],
    enactmentYear: 2018,
    commencedDate: '2018-07-03',
    lastVerifiedAt: '2026-10-25T00:00:00Z',
    status: 'CURRENT_ENACTED',
  },
  {
    id: 'src-del-leg-it-security-rules',
    actTitle: 'Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 (G.S.R. 313(E))',
    shortTitle: 'IT Security & SPDI Rules, 2011',
    provision: 'Rule 5',
    subject: 'Retention, consent, and protection of electronic commercial records and digital data',
    jurisdiction: 'India (Central)',
    officialSourceUrl: 'https://www.indiacode.nic.in/handle/123456789/1999',
    officialSourceOrganization: 'Ministry of Electronics and Information Technology, Government of India',
    isOfficialSource: true,
    category: 'DELEGATED_LEGISLATION',
    sourcePublication: 'The Gazette of India, Extraordinary, Part II, Sec. 3(i)',
    isCurrentLaw: true,
    statutoryText:
      'Body corporate or any person holding sensitive personal data or information on its behalf shall not retain that information for longer than is required for the purposes for which the information may lawfully be used or is otherwise required under any other law for the time being in force.',
    summaryOfLaw:
      'Delegated rules specifying retention limits and confidentiality safeguards for digital transaction documents and commercial data.',
    scopeAndLimitations: 'Applies to electronic data collection and digital transaction evidence retention in India.',
    commonMisconceptions: [],
    enactmentYear: 2011,
    commencedDate: '2011-04-11',
    lastVerifiedAt: '2026-10-25T00:00:00Z',
    status: 'CURRENT_ENACTED',
  },

  // ==========================================
  // JUDGMENTS & PRECEDENTS (Supreme Court of India & High Courts)
  // https://main.sci.gov.in/ & https://judgments.ecourts.gov.in/
  // ==========================================
  {
    id: 'src-sc-radhakrishna-1977',
    actTitle: 'Radhakrishna Agarwal & Ors. v. State of Bihar & Ors., (1977) 3 SCC 457',
    shortTitle: 'Radhakrishna Agarwal v. State of Bihar (1977)',
    provision: 'Paragraphs 10–14 (Supreme Court 3-Judge Bench)',
    subject: 'Inapplicability of Article 226 Writ Petitions to Pure Contractual Money Disputes',
    jurisdiction: 'Supreme Court of India (Appellate Civil Jurisdiction)',
    officialSourceUrl: 'https://www.sci.gov.in/',
    officialSourceOrganization: 'Supreme Court of India (Official Judgments Registry)',
    isOfficialSource: true,
    category: 'JUDGMENT',
    sourcePublication: 'Supreme Court Reports / SCC (1977) 3 SCC 457',
    isCurrentLaw: true,
    statutoryText:
      'At the stage where the State enters into a contract with a private person, the contract is governed by the terms of the contract and no question of Article 14 or writ jurisdiction under Article 226 arises. Disputes relating to pure contractual obligations, damages, or money recovery cannot be agitated by way of a petition under Article 226 of the Constitution; the appropriate remedy is a civil suit or arbitration.',
    summaryOfLaw:
      'Landmark Supreme Court ratio: When a dispute arises solely out of a commercial contract, the remedy is a civil suit or arbitration, not an Article 226 constitutional writ petition.',
    scopeAndLimitations:
      'Applies to commercial contracts without statutory infringement or public law duties. Confirms that money claims cannot bypass civil remedies.',
    commonMisconceptions: [
      'Misconception: A vendor can file a High Court writ petition to recover commercial dues against a private firm or government buyer (False: Contractual defaults must follow standard civil recovery or arbitration).',
    ],
    enactmentYear: 1977,
    commencedDate: '1977-04-18',
    lastVerifiedAt: '2026-10-25T00:00:00Z',
    status: 'CURRENT_ENACTED',
  },
  {
    id: 'src-sc-kailash-nath-2015',
    actTitle: 'Kailash Nath Associates v. Delhi Development Authority & Anr., (2015) 4 SCC 136',
    shortTitle: 'Kailash Nath Associates v. DDA (2015)',
    provision: 'Paragraphs 43–44 (Supreme Court Division Bench)',
    subject: 'Section 74 Contract Act: Proof of Actual Loss Required for Liquidated Damages',
    jurisdiction: 'Supreme Court of India',
    officialSourceUrl: 'https://www.sci.gov.in/',
    officialSourceOrganization: 'Supreme Court of India',
    isOfficialSource: true,
    category: 'JUDGMENT',
    sourcePublication: 'Supreme Court Reports / (2015) 4 SCC 136',
    isCurrentLaw: true,
    statutoryText:
      'Compensation can only be given for damage or loss suffered. Where damage or loss is difficult or impossible to prove, the liquidated sum named in the contract can be awarded if it is a genuine pre-estimate of loss. But where loss in terms of money can be determined, the party claiming breach must prove the loss suffered; forfeiture of money without proof of loss constitutes an illegal penalty under Section 74.',
    summaryOfLaw:
      'Establishes that naming a penalty or forfeiture clause in a commercial contract does not grant automatic entitlement to retain or claim that sum without establishing reasonable damage.',
    scopeAndLimitations:
      'Governs liquidated damages disputes under Section 74 of the Indian Contract Act. Rejects punitive forfeiture in commercial contracts.',
    commonMisconceptions: [],
    enactmentYear: 2015,
    commencedDate: '2015-01-09',
    lastVerifiedAt: '2026-10-25T00:00:00Z',
    status: 'CURRENT_ENACTED',
  },
  {
    id: 'src-sc-patil-automation-2022',
    actTitle: 'Patil Automation Pvt. Ltd. & Ors. v. Rakheja Engineers Pvt. Ltd., (2022) 10 SCC 1',
    shortTitle: 'Patil Automation v. Rakheja Engineers (2022)',
    provision: 'Paragraphs 84–92 (Supreme Court 2-Judge Bench)',
    subject: 'Mandatory Nature of Section 12A Commercial Courts Act Pre-Institution Mediation',
    jurisdiction: 'Supreme Court of India',
    officialSourceUrl: 'https://www.sci.gov.in/',
    officialSourceOrganization: 'Supreme Court of India',
    isOfficialSource: true,
    category: 'JUDGMENT',
    sourcePublication: 'Supreme Court Reports / (2022) 10 SCC 1',
    isCurrentLaw: true,
    statutoryText:
      'We declare that Section 12A of the Commercial Courts Act, 2015 is mandatory and that any commercial suit instituted violating the mandate of Section 12A must be visited with rejection of the plaint under Order VII Rule 11 of the Code of Civil Procedure.',
    summaryOfLaw:
      'Declares Section 12A mediation strictly mandatory for all commercial suits not seeking urgent interim relief. Plaints filed without exhausting mediation must be rejected.',
    scopeAndLimitations: 'Mandatory for commercial suits filed after 20 August 2022.',
    commonMisconceptions: [],
    enactmentYear: 2022,
    commencedDate: '2022-08-17',
    lastVerifiedAt: '2026-10-25T00:00:00Z',
    status: 'CURRENT_ENACTED',
  },
  // ==========================================
  // CONSUMER PROTECTION ACT, 2019 (India Code)
  // https://www.indiacode.nic.in/handle/123456789/15256
  // ==========================================
  {
    id: 'src-cpa-35',
    actTitle: 'The Consumer Protection Act, 2019 (Act No. 35 of 2019)',
    shortTitle: 'Consumer Protection Act, 2019',
    provision: 'Section 35',
    subject: 'Manner in which complaint shall be made before District Commission',
    jurisdiction: 'India (Central / Consumer Disputes Redressal Commissions)',
    officialSourceUrl: 'https://www.indiacode.nic.in/handle/123456789/15256',
    officialSourceOrganization: 'Ministry of Law and Justice, Government of India (India Code)',
    isOfficialSource: true,
    category: 'CENTRAL_ACT',
    sourcePublication: 'The Gazette of India, Extraordinary, Part II, Section 1',
    isCurrentLaw: true,
    statutoryText:
      'A complaint, in relation to any goods sold or delivered or agreed to be sold or delivered or any service provided or agreed to be provided, may be filed with a District Commission by— (a) the consumer— (i) to whom such goods are sold or delivered or agreed to be sold or delivered or such service is provided or agreed to be provided; or (ii) who alleges defect in goods or deficiency in services.',
    summaryOfLaw:
      'Governs the initiation of consumer complaints alleging defective goods or deficient services before District Consumer Disputes Redressal Commissions.',
    scopeAndLimitations:
      'Applies strictly to transactions where goods are purchased for personal use and not for commercial resale. Requires proof of defect or deficiency.',
    commonMisconceptions: [
      'Misconception: Signing a courier delivery receipt (POD) forfeits all consumer remedies for internal product defects (False: Latent defect or damaged contents can be established through unboxing evidence, photographs, and service center inspection reports under Section 38).',
    ],
    enactmentYear: 2019,
    commencedDate: '2020-07-20',
    lastVerifiedAt: '2026-10-25T00:00:00Z',
    status: 'CURRENT_ENACTED',
  },
  {
    id: 'src-cpa-83',
    actTitle: 'The Consumer Protection Act, 2019 (Act No. 35 of 2019)',
    shortTitle: 'Consumer Protection Act, 2019',
    provision: 'Section 83 & Section 84',
    subject: 'Product Liability Action for Defective Goods & Manufacturer / Seller Liability',
    jurisdiction: 'India (Central / Consumer Protection)',
    officialSourceUrl: 'https://www.indiacode.nic.in/handle/123456789/15256',
    officialSourceOrganization: 'Ministry of Law and Justice, Government of India (India Code)',
    isOfficialSource: true,
    category: 'CENTRAL_ACT',
    sourcePublication: 'The Gazette of India, Extraordinary, Part II, Section 1',
    isCurrentLaw: true,
    statutoryText:
      'A product liability action may be brought by a complainant against a product manufacturer or a product service provider or a product seller, as the case may be, for any harm caused to him on account of a defective product. A product manufacturer shall be liable in a product liability action, if— (a) the product contains a manufacturing defect; or (b) the product is defective in design; or (c) there is a deviation from manufacturing specifications.',
    summaryOfLaw:
      'Establishes strict product liability framework holding manufacturers and e-commerce product sellers accountable for defective goods causing loss or damage.',
    scopeAndLimitations:
      'Requires establishing that the defect existed in the product or occurred during transit for which seller/carrier is responsible.',
    commonMisconceptions: [],
    enactmentYear: 2019,
    commencedDate: '2020-07-20',
    lastVerifiedAt: '2026-10-25T00:00:00Z',
    status: 'CURRENT_ENACTED',
  },
  // ==========================================
  // THE SALE OF GOODS ACT, 1930 (India Code)
  // https://www.indiacode.nic.in/handle/123456789/2390
  // ==========================================
  {
    id: 'src-sga-37',
    actTitle: 'The Sale of Goods Act, 1930 (Act No. 3 of 1930)',
    shortTitle: 'Sale of Goods Act, 1930',
    provision: 'Section 37',
    subject: 'Delivery of wrong quantity (Short delivery / Excess delivery)',
    jurisdiction: 'India (Central / Commercial)',
    officialSourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2390',
    officialSourceOrganization: 'Ministry of Law and Justice, Government of India (India Code)',
    isOfficialSource: true,
    category: 'CENTRAL_ACT',
    sourcePublication: 'India Code / Central Legislation',
    isCurrentLaw: true,
    statutoryText:
      '(1) Where the seller delivers to the buyer a quantity of goods less than he contracted to sell, the buyer may reject them, but if the buyer accepts the goods so delivered he shall pay for them at the contract rate. (2) Where the seller delivers to the buyer a quantity of goods larger than he contracted to sell, the buyer may accept the goods included in the contract and reject the rest, or he may reject the whole.',
    summaryOfLaw:
      'Governs delivery quantity discrepancies in commercial sales. Buyers receiving short quantity may reject or accept the delivered portion and pay pro-rata at the contract rate.',
    scopeAndLimitations:
      'Requires prompt notification to seller. Shortfall must be evidenced by joint inspection or carrier exception receipt before unilateral debit adjustments.',
    commonMisconceptions: [
      'Misconception: A buyer who receives a partial delivery can unilaterally cancel the entire contract and forfeit supplier payments without notice (False: Section 37 obligates payment at contract rate for accepted goods).',
    ],
    enactmentYear: 1930,
    commencedDate: '1930-07-01',
    lastVerifiedAt: '2026-10-25T00:00:00Z',
    status: 'CURRENT_ENACTED',
  },
  {
    id: 'src-sga-42',
    actTitle: 'The Sale of Goods Act, 1930 (Act No. 3 of 1930)',
    shortTitle: 'Sale of Goods Act, 1930',
    provision: 'Section 42',
    subject: 'Acceptance of goods and reasonable opportunity of examination',
    jurisdiction: 'India (Central / Commercial)',
    officialSourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2390',
    officialSourceOrganization: 'Ministry of Law and Justice, Government of India (India Code)',
    isOfficialSource: true,
    category: 'CENTRAL_ACT',
    sourcePublication: 'India Code / Central Legislation',
    isCurrentLaw: true,
    statutoryText:
      'The buyer is deemed to have accepted the goods when he intimateth to the seller that he has accepted them, or when the goods have been delivered to him and he does any act in relation to them which is inconsistent with the ownership of the seller, or when, after the lapse of a reasonable time, he retains the goods without intimating to the seller that he has rejected them.',
    summaryOfLaw:
      'Defines when acceptance of commercial goods occurs and establishes buyer duty to examine and report rejection within reasonable time.',
    scopeAndLimitations: 'Requires buyer to grant reasonable opportunity for inspection.',
    commonMisconceptions: [],
    enactmentYear: 1930,
    commencedDate: '1930-07-01',
    lastVerifiedAt: '2026-10-25T00:00:00Z',
    status: 'CURRENT_ENACTED',
  },
  // ==========================================
  // BHARATIYA SAKSHYA ADHINIYAM, 2023 / EVIDENCE ACT
  // https://www.indiacode.nic.in/
  // ==========================================
  {
    id: 'src-bsa-63',
    actTitle: 'The Bharatiya Sakshya Adhiniyam, 2023 (Act No. 47 of 2023)',
    shortTitle: 'Bharatiya Sakshya Adhiniyam, 2023 (BSA)',
    provision: 'Section 63',
    subject: 'Admissibility of electronic records and mandatory certificate requirement',
    jurisdiction: 'India (Central / Law of Evidence & Judicial Proceedings)',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceOrganization: 'Legislative Department, Ministry of Law and Justice, Government of India',
    isOfficialSource: true,
    category: 'CENTRAL_ACT',
    sourcePublication: 'The Gazette of India, Extraordinary, Part II, Section 1',
    isCurrentLaw: true,
    statutoryText:
      'Any information contained in an electronic record which is printed on a paper, stored, recorded or copied in optical or magnetic media or electronic device... shall be deemed to be also a document... and shall be admissible in any proceedings, without further proof or production of the original, if the conditions mentioned in this section are satisfied in relation to the information and device in question... (4) In any proceedings where it is desired to give a statement in evidence by virtue of this section, a certificate doing any of the following things shall be submitted, namely: (a) identifying the electronic record containing the statement and describing the manner in which it was produced; (b) giving such particulars of any device involved in the production of that electronic record...',
    summaryOfLaw:
      'Successor provision to Section 65B of the Indian Evidence Act, 1872. Mandates that secondary electronic evidence (screenshots, WhatsApp chats, emails, electronic statements) must be accompanied by a formal statutory certificate verifying device custody and hash integrity.',
    scopeAndLimitations:
      'Applies to all Indian judicial and quasi-judicial proceedings where electronic evidence is tendered.',
    commonMisconceptions: [
      'Misconception: A simple printout or phone screenshot of a chat message or UPI transfer is automatically admissible without a certificate (False: Under Section 63 BSA 2023 / Section 65B IEA, electronic printouts are inadmissible without the mandatory statutory certificate).',
    ],
    enactmentYear: 2023,
    commencedDate: '2024-07-01',
    lastVerifiedAt: '2026-10-25T00:00:00Z',
    status: 'CURRENT_ENACTED',
  },
  {
    id: 'src-iea-65b',
    actTitle: 'The Indian Evidence Act, 1872 (Act No. 1 of 1872)',
    shortTitle: 'Indian Evidence Act, 1872',
    provision: 'Section 65B',
    subject: 'Admissibility of electronic records (Pre-BSA 2023 Enactment)',
    jurisdiction: 'India (Historical / Pre-July 2024 Evidence Law)',
    officialSourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2188',
    officialSourceOrganization: 'Legislative Department, Ministry of Law and Justice, Government of India (India Code)',
    isOfficialSource: true,
    category: 'CENTRAL_ACT',
    sourcePublication: 'India Code / Central Enactment',
    isCurrentLaw: false,
    statutoryText:
      'Notwithstanding anything contained in this Act, any information contained in an electronic record which is printed on a paper, stored, recorded or copied in optical or magnetic media produced by a computer... shall be deemed to be also a document... and shall be admissible in any proceedings, without further proof or production of the original, if the conditions mentioned in this section are satisfied.',
    summaryOfLaw:
      'Historical statutory framework for electronic records admissibility established in Arjun Khotkar v. Kailash Kushanrao Gorantyal (2020) 7 SCC 1. Succeeded by Section 63 of BSA 2023 from 1 July 2024.',
    scopeAndLimitations: 'Governs proceedings initiated under the Indian Evidence Act, 1872 prior to 1 July 2024.',
    commonMisconceptions: [],
    enactmentYear: 1872,
    commencedDate: '1872-09-01',
    lastVerifiedAt: '2026-10-25T00:00:00Z',
    status: 'REPEALED',
  },
];
