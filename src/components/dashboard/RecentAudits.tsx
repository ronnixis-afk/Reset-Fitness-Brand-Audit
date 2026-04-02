import React from 'react';
import { Audit } from '../../lib/db';
import { AuditCard } from '../audit-list/AuditCard';
import { FileText } from 'lucide-react';

interface RecentAuditsProps {
  audits: Audit[];
  onOpenAudit: (id: string) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  expandedAuditId: string | null;
  setExpandedAuditId: (id: string | null) => void;
}

export function RecentAudits({ audits, onOpenAudit, onDelete, expandedAuditId, setExpandedAuditId }: RecentAuditsProps) {
  if (audits.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="brand-subtitle mb-4 !text-left">Recent Audits</h2>
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
          <FileText className="w-12 h-12 text-brand mx-auto mb-3 opacity-50" />
          <p className="text-gray-500">No recent audits found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="brand-subtitle mb-4 !text-left">Recent Audits</h2>
      <div className="space-y-4">
        {audits.map(audit => (
          <AuditCard
            key={audit.id}
            audit={audit}
            isExpanded={expandedAuditId === audit.id}
            onToggleExpand={() => setExpandedAuditId(expandedAuditId === audit.id ? null : audit.id)}
            onDelete={onDelete}
            onOpenAudit={onOpenAudit}
          />
        ))}
      </div>
    </div>
  );
}
