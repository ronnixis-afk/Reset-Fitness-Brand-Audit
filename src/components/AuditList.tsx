import React, { useState, useEffect, useRef } from 'react';
import { Audit, getAudits, deleteAudit, saveAudit, generateId, Score } from '../lib/db';
import { CHECKLIST_CATEGORIES } from '../lib/checklist';
import { Plus, FileText, Upload } from 'lucide-react';
import { auth } from '../firebase';
import { Header } from './layout/Header';
import { FloatingActionBar } from './layout/FloatingActionBar';
import { AuditCard } from './audit-list/AuditCard';
import { ScoreChart, ChartData } from './dashboard/ScoreChart';
import { getOverallScore } from '../lib/score';

export function AuditList({ unit, onOpenAudit, onNewAudit, onBackToLocation }: { unit: string, onOpenAudit: (id: string) => void, onNewAudit: () => void, onBackToLocation: () => void }) {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState('Upload Audit');
  const [isUploading, setIsUploading] = useState(false);
  const [expandedAuditId, setExpandedAuditId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAudits = () => {
    if (auth.currentUser) {
      getAudits().then(data => {
        setAudits(data);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
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

    setIsUploading(true);
    setUploadStatus('Uploading...');

    // Simulate slight delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 500));

    const reader = new FileReader();
    reader.onload = async (e) => {
      setUploadStatus('Processing...');
      await new Promise(resolve => setTimeout(resolve, 500));

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
                if (item.score === 'Requires Urgent Attention' || item.score === 'FAIL' || item.score === 'Fail') {
                  items[id] = 'FAIL';
                  if (item.reason) itemComments[id] = item.reason;
                  if (item.images && Array.isArray(item.images)) itemImages[id] = item.images;
                } else if (item.score === 'Not Answered') {
                  items[id] = null;
                } else if (item.score === 'PASS' || item.score === 'Pass') {
                  items[id] = 'PASS';
                } else if (item.score === 'NA' || item.score === 'N/A') {
                  items[id] = 'NA';
                } else {
                  items[id] = null;
                }
              }
            });
          });

          newAudit = {
            id: parsed.id || generateId(),
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
        setUploadStatus('Successfully Added');
      } catch (error) {
        console.error('Error parsing JSON:', error);
        setUploadStatus('Invalid Format');
      }
      
      setTimeout(() => {
        setUploadStatus('Upload Audit');
        setIsUploading(false);
      }, 2000);

      if (event.target) event.target.value = '';
    };
    reader.readAsText(file);
  };

  // Calculate unit score
  const unitAudits = audits.filter(a => a.facilityLocation.includes(unit));
  const unitScore = unitAudits.length > 0 
    ? Math.round(unitAudits.reduce((acc, audit) => acc + getOverallScore(audit), 0) / unitAudits.length)
    : 0;

  const chartData: ChartData[] = [
    { name: unit, score: unitScore }
  ];

  return (
    <div className="page-container">
      <Header onBack={onBackToLocation} />

      <div className="p-4 space-y-4">
        {!isLoading && unitAudits.length > 0 && (
          <ScoreChart data={chartData} title={`Overall Score: ${unit}`} />
        )}

        <div className="mt-4">
          <h2 className="section-title mb-4">Saved Audits</h2>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="card animate-pulse flex flex-col h-[100px]">
                  <div className="flex justify-between mb-3">
                    <div className="space-y-3 w-2/3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : audits.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
              <FileText className="w-12 h-12 text-brand mx-auto mb-3 opacity-50" />
              <p className="text-gray-500">No saved audits found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {audits.map(audit => (
                <AuditCard
                  key={audit.id}
                  audit={audit}
                  isExpanded={expandedAuditId === audit.id}
                  onToggleExpand={() => setExpandedAuditId(expandedAuditId === audit.id ? null : audit.id)}
                  onDelete={handleDelete}
                  onOpenAudit={onOpenAudit}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <FloatingActionBar>
        <button 
          onClick={onNewAudit}
          className="btn-primary flex-1"
        >
          <Plus className="w-5 h-5" />
          Start New Audit
        </button>
        
        <button 
          onClick={() => !isUploading && fileInputRef.current?.click()}
          disabled={isUploading}
          className="btn-secondary flex-1"
        >
          <Upload className={`w-5 h-5 ${isUploading ? 'animate-pulse text-brand' : ''}`} />
          {uploadStatus}
        </button>
      </FloatingActionBar>

      <input 
        type="file" 
        accept=".json" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
      />
    </div>
  );
}
