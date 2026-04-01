import React from 'react';
import { Calendar, MapPin, User, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Audit } from '../../lib/db';
import { getOverallScore, getCategoryScore } from '../../lib/score';
import { CHECKLIST_CATEGORIES } from '../../lib/checklist';

interface AuditCardProps {
  audit: Audit;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onOpenAudit: (id: string) => void;
}

export function AuditCard({ audit, isExpanded, onToggleExpand, onDelete, onOpenAudit }: AuditCardProps) {
  return (
    <div 
      onClick={onToggleExpand}
      className="card card-hover flex flex-col"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-brand" />
            <span className="font-medium text-gray-900">{audit.date}</span>
            <span className="text-xs font-bold text-gray-400">[{audit.quarter}]</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-brand" />
            <span className="truncate">{audit.facilityLocation}</span>
          </div>
          {audit.auditorName && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4 text-brand" />
              <span className="truncate">{audit.auditorName}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <span className="tag-score">{getOverallScore(audit)}%</span>
            <button 
              onClick={(e) => onDelete(e, audit.id)}
              className="btn-danger"
              title="Delete Audit"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2 text-gray-400">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-2">
            {CHECKLIST_CATEGORIES.map(category => (
              <div key={category.id} className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded">
                <span className="text-gray-600 truncate mr-2" title={category.title}>{category.title}</span>
                <span className="font-bold text-gray-900">{getCategoryScore(audit, category.id).percentage}%</span>
              </div>
            ))}
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onOpenAudit(audit.id);
            }}
            className="w-full mt-4 bg-black text-white font-heading font-bold py-3 rounded-lg shadow-sm hover:bg-gray-900 transition-colors"
          >
            Open Audit
          </button>
        </div>
      )}
    </div>
  );
}
