import React from 'react';
import { Audit } from '../../lib/db';

interface AuditDetailsFormProps {
  audit: Audit;
  setAudit: React.Dispatch<React.SetStateAction<Audit>>;
  setHasChanges: (val: boolean) => void;
  setIsSaved: (val: boolean) => void;
  isLoading?: boolean;
  readOnly?: boolean;
}

export function AuditDetailsForm({ audit, setAudit, setHasChanges, setIsSaved, isLoading, readOnly }: AuditDetailsFormProps) {
  const handleChange = (field: keyof Audit, value: string) => {
    if (readOnly) return;
    setAudit(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setIsSaved(false);
  };

  return (
    <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
      <h2 className="section-title">{readOnly ? 'Audit Summary' : 'Audit Details'}</h2>
      
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="input-label">Date</label>
          <input 
            type="date" 
            value={audit.date}
            disabled={isLoading || readOnly}
            onChange={e => handleChange('date', e.target.value)}
            className="input-field disabled:opacity-50 disabled:bg-gray-200"
          />
        </div>
        <div className="w-24">
          <label className="input-label">Quarter</label>
          <select 
            value={audit.quarter}
            disabled={isLoading || readOnly}
            onChange={e => handleChange('quarter', e.target.value)}
            className="input-field disabled:opacity-50 disabled:bg-gray-200"
          >
            <option>Q1</option>
            <option>Q2</option>
            <option>Q3</option>
            <option>Q4</option>
          </select>
        </div>
      </div>

      <div>
        <label className="input-label">Facility Location</label>
        <input 
          type="text" 
          value={audit.facilityLocation}
          disabled={isLoading || readOnly}
          onChange={e => handleChange('facilityLocation', e.target.value)}
          placeholder="e.g. Jumeirah Islands"
          className="input-field disabled:opacity-50 disabled:bg-gray-200"
        />
      </div>

      <div>
        <label className="input-label">Auditor Name</label>
        <input 
          type="text" 
          value={audit.auditorName}
          disabled={isLoading || readOnly}
          onChange={e => handleChange('auditorName', e.target.value)}
          placeholder="Your name"
          className="input-field disabled:opacity-50 disabled:bg-gray-200"
        />
      </div>
    </div>
  );
}
