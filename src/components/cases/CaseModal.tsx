import React, { useState } from 'react';
import { DocumentParty, LegalCase } from '../../types';
import { Modal } from '../common/Modal';
import { Briefcase, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface CaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCase: (newCase: LegalCase) => void;
  initialCase?: LegalCase | null;
}

const MATTER_TYPES = [
  'Commercial Dispute',
  'Contractual Breach',
  'Debt Recovery & Dues',
  'Employment & Services',
  'Property & Tenancy',
  'Arbitration & Conciliation',
  'Constitutional / Writ Petition',
  'General Civil Litigation',
];

const JURISDICTIONS = [
  'India (Commercial Courts Jurisdiction)',
  'High Court of Delhi',
  'High Court of Bombay',
  'High Court of Karnataka',
  'Supreme Court of India',
  'National Company Law Tribunal (NCLT)',
  'Custom / Other Indian Jurisdiction',
];

export const CaseModal: React.FC<CaseModalProps> = ({
  isOpen,
  onClose,
  onSaveCase,
  initialCase,
}) => {
  const [title, setTitle] = useState(initialCase?.title || '');
  const [referenceNumber, setReferenceNumber] = useState(initialCase?.referenceNumber || '');
  const [matterType, setMatterType] = useState(initialCase?.matterType || MATTER_TYPES[0]);
  const [jurisdiction, setJurisdiction] = useState(initialCase?.jurisdiction || JURISDICTIONS[0]);
  const [summary, setSummary] = useState(initialCase?.summary || '');

  const [parties, setParties] = useState<DocumentParty[]>(
    initialCase?.parties || [
      { name: '', role: 'CLAIMANT', entityType: 'COMPANY', address: '', contact: '', identifier: '' },
      { name: '', role: 'RESPONDENT', entityType: 'COMPANY', address: '', contact: '', identifier: '' },
    ]
  );

  const handlePartyChange = (index: number, field: keyof DocumentParty, value: string) => {
    const updated = [...parties];
    updated[index] = { ...updated[index], [field]: value };
    setParties(updated);
  };

  const handleAddParty = () => {
    setParties([
      ...parties,
      { name: '', role: 'OTHER', entityType: 'COMPANY', address: '', contact: '' },
    ]);
  };

  const handleRemoveParty = (index: number) => {
    if (parties.length <= 1) return;
    setParties(parties.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const caseId = initialCase?.id || `case-${Date.now()}`;
    const newCase: LegalCase = {
      id: caseId,
      title: title.trim(),
      referenceNumber: referenceNumber.trim() || undefined,
      matterType,
      jurisdiction,
      parties: parties.filter((p) => p.name.trim().length > 0),
      summary: summary.trim() || undefined,
      createdAt: initialCase?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: initialCase?.status || 'ACTIVE',
      documents: initialCase?.documents || [],
      extractedFacts: initialCase?.extractedFacts || [],
      findings: initialCase?.findings || [],
    };

    onSaveCase(newCase);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialCase ? 'Edit Legal Case' : 'Create New Legal Case'}
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-xs">
        {/* Case Title and Reference Number */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1">
            <label className="text-slate-300 font-medium block">
              Case Title / Matter Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Acme Tech Solutions vs Horizon Logistics"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-medium block">Reference / File No.</label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g. MTR-2026-081"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Matter Type & Jurisdiction */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-slate-300 font-medium block">Matter Classification</label>
            <select
              value={matterType}
              onChange={(e) => setMatterType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              {MATTER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-medium block">Governing Jurisdiction</label>
            <select
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              {JURISDICTIONS.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Parties Section */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
              Parties to the Matter
            </h4>
            <button
              type="button"
              onClick={handleAddParty}
              className="px-2.5 py-1 text-[11px] font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3 h-3" /> Add Party
            </button>
          </div>

          <div className="space-y-3">
            {parties.map((party, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2"
              >
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <div className="sm:col-span-6">
                    <input
                      type="text"
                      placeholder={`Party ${idx + 1} Legal Name`}
                      value={party.name}
                      onChange={(e) => handlePartyChange(idx, 'name', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <select
                      value={party.role}
                      onChange={(e) => handlePartyChange(idx, 'role', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="CLAIMANT">Claimant / Sender</option>
                      <option value="RESPONDENT">Respondent / Addressee</option>
                      <option value="FIRST_PARTY">First Party</option>
                      <option value="SECOND_PARTY">Second Party</option>
                      <option value="COUNSEL">Counsel</option>
                      <option value="OTHER">Other Party</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <select
                      value={party.entityType || 'COMPANY'}
                      onChange={(e) => handlePartyChange(idx, 'entityType', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500 text-[11px]"
                    >
                      <option value="COMPANY">Company</option>
                      <option value="LLP">LLP</option>
                      <option value="PROPRIETORSHIP">Proprietorship</option>
                      <option value="INDIVIDUAL">Individual</option>
                      <option value="GOVERNMENT_BODY">Govt Entity</option>
                    </select>
                  </div>

                  <div className="sm:col-span-1 text-right">
                    {parties.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveParty(idx)}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded transition-colors"
                        title="Remove party"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Registered Office / Postal Address"
                    value={party.address || ''}
                    onChange={(e) => handlePartyChange(idx, 'address', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-300 text-[11px] focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Registration / Identifier (CIN, LLPIN, PAN)"
                    value={party.identifier || ''}
                    onChange={(e) => handlePartyChange(idx, 'identifier', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-300 text-[11px] font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Case Summary */}
        <div className="space-y-1 pt-2 border-t border-slate-800">
          <label className="text-slate-300 font-medium block">
            Optional Case Background & Factual Summary
          </label>
          <textarea
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Briefly state the commercial relationship, underlying contract, or alleged breach..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-lg flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            {initialCase ? 'Update Case' : 'Create Case Workspace'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
