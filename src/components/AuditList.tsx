import React, { useState, useEffect, useRef } from 'react';
import { Audit, getAudits, deleteAudit, saveAudit, generateId, Score } from '../lib/db';
import { CHECKLIST_CATEGORIES } from '../lib/checklist';
import { getCategoryScore, getOverallScore } from '../lib/score';
import { Plus, FileText, Trash2, Calendar, MapPin, User, Upload } from 'lucide-react';
import { auth } from '../firebase';

export function AuditList({ onOpenAudit, onNewAudit }: { onOpenAudit: (id: string) => void, onNewAudit: () => void }) {
  const [audits, setAudits] = useState<Audit[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAudits = () => {
    if (auth.currentUser) {
      getAudits().then(setAudits);
    }
  };

  useEffect(() => {
    loadAudits();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this audit?')) {
      await deleteAudit(id);
      loadAudits();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);

        let newAudit: Audit;

        if (parsed.results) {
          const items: Record<string, Score> = {};
          const itemComments: Record<string, string> = {};
          const itemImages: Record<string, string[]> = {};

          const textToId: Record<string, string> = {};
          CHECKLIST_CATEGORIES.forEach(cat => {
            cat.items.forEach(item => {
              textToId[item.text] = item.id;
            });
          });

          parsed.results.forEach((cat: any) => {
            cat.items.forEach((item: any) => {
              const id = textToId[item.task];
              if (id) {
                if (item.score === 'Requires Urgent Attention') {
                  items[id] = 'FAIL';
                  if (item.reason) itemComments[id] = item.reason;
                  if (item.images && Array.isArray(item.images)) itemImages[id] = item.images;
                } else if (item.score === 'Not Answered') {
                  items[id] = null;
                } else if (item.score === 'PASS' || item.score === 'Pass') {
                  items[id] = 'PASS';
                } else if (item.score === 'NA' || item.score === 'N/A') {
                  items[id] = 'NA';
                } else if (item.score === 'FAIL' || item.score === 'Fail') {
                  items[id] = 'FAIL';
                } else {
                  items[id] = null;
                }
              }
            });
          });

          newAudit = {
            id: generateId(),
            userId: auth.currentUser?.uid || '',
            date: parsed.date || new Date().toISOString().split('T')[0],
            quarter: parsed.quarter || '',
            facilityLocation: parsed.facilityLocation || '',
            auditorName: parsed.auditorName || '',
            items,
            itemComments,
            itemImages,
            comments: parsed.comments || '',
            lastSavedAt: Date.now()
          };
        } else {
          newAudit = {
            ...parsed,
            id: generateId(),
            userId: auth.currentUser?.uid || '',
            lastSavedAt: Date.now()
          };
        }

        await saveAudit(newAudit);
        loadAudits();
        alert('Audit imported successfully!');
      } catch (error) {
        console.error('Error parsing JSON:', error);
        alert('Invalid JSON file format.');
      }
      
      if (event.target) event.target.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-3xl mx-auto min-h-screen bg-gray-50 font-sans pb-12">
      <div className="bg-black text-white p-6 shadow-md">
        <h1 className="font-heading font-bold text-2xl tracking-wider text-center">Reset Fitness</h1>
        <p className="text-center text-gray-400 text-sm mt-1">Brand Compliance Audits</p>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex gap-3">
          <button 
            onClick={onNewAudit}
            className="flex-1 bg-black text-white font-heading font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
          >
            <Plus className="w-5 h-5 text-brand" />
            Start New Audit
          </button>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 bg-white text-black border border-gray-200 font-heading font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform hover:border-brand"
          >
            <Upload className="w-5 h-5 text-brand" />
            Upload Audit
          </button>
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
        </div>

        <div className="mt-8">
          <h2 className="font-heading font-semibold text-lg text-gray-900 mb-4">Saved Audits</h2>
          
          {audits.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
              <FileText className="w-12 h-12 text-brand mx-auto mb-3 opacity-50" />
              <p className="text-gray-500">No saved audits found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {audits.map(audit => (
                <div 
                  key={audit.id}
                  onClick={() => onOpenAudit(audit.id)}
                  className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:border-brand transition-colors flex flex-col"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-brand" />
                        <span className="font-medium text-gray-900">{audit.date}</span>
                        <span className="text-xs font-bold text-gray-400">[{audit.quarter}]</span>
                        <span className="ml-auto font-heading font-bold text-lg text-brand bg-brand/10 px-2 py-0.5 rounded">{getOverallScore(audit)}%</span>
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
                    <button 
                      onClick={(e) => handleDelete(e, audit.id)}
                      className="p-2 ml-2 text-gray-400 hover:text-brand hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="mt-2 pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                    {CHECKLIST_CATEGORIES.map(cat => {
                      const score = getCategoryScore(audit, cat.id);
                      return (
                        <div key={cat.id} className="flex justify-between items-center text-xs">
                          <span className="text-gray-500 truncate pr-2" title={cat.title}>{cat.title.replace(/^\d+\.\s*/, '')}</span>
                          <span className={`font-bold ${score.valid > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
                            {score.valid > 0 ? `${score.percentage}%` : 'N/A'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
