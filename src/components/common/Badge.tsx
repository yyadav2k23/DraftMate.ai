import React from 'react';
import { FindingSeverity, CitationVerificationStatus } from '../../types';

interface SeverityBadgeProps {
  severity: FindingSeverity;
  size?: 'sm' | 'md';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  if (severity === 'CRITICAL') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md bg-red-950/80 text-red-300 border border-red-500/40 uppercase tracking-wider ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
        Critical
      </span>
    );
  }
  if (severity === 'WARNING') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md bg-amber-950/80 text-amber-300 border border-amber-500/40 uppercase tracking-wider ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        Warning
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700 uppercase tracking-wider ${sizeClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      Advisory
    </span>
  );
};

export const CitationStatusBadge: React.FC<{ status: CitationVerificationStatus }> = ({ status }) => {
  switch (status) {
    case 'VERIFIED_OFFICIAL_SOURCE':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Verified Official Source
        </span>
      );
    case 'LOCAL_DB_MATCH':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-500/40">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          Local Database Match
        </span>
      );
    case 'SOURCE_DOES_NOT_SUPPORT':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-red-950/80 text-red-300 border border-red-500/40">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
          Source Does Not Support Claim
        </span>
      );
    case 'NOT_INDEPENDENTLY_VERIFIED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-950/80 text-amber-300 border border-amber-500/40">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          Not Independently Verified
        </span>
      );
    case 'HUMAN_REVIEW_REQUIRED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-950/80 text-purple-300 border border-purple-500/40">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          Human Legal Review Required
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
          Source Unavailable
        </span>
      );
  }
};
