import { useState, useEffect } from 'react';
import { Audit, saveAudit, getAudit, Score, generateId } from '../lib/db';
import { CHECKLIST_CATEGORIES } from '../lib/checklist';
import { getCategoryScore } from '../lib/score';
import { generatePDF } from '../lib/pdf';
import { ScoreButton } from './ScoreButton';
import { ArrowLeft, Save, Download, FileText, FileJson } from 'lucide-react';

export function AuditForm({ auditId, onBack }: { auditId: string | null, onBack: () => void }) {
  const [audit, setAudit] = useState<Audit>({
    id: generateId(),
    date: new Date().toISOString().split('T')[0],
    facilityLocation: 'Reset Fitness Jumeirah Islands',
    auditorName: '',
    items: {},
    comments: '',
    lastSavedAt: Date.now()
  });
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  useEffect(() => {
    if (auditId) {
      getAudit(auditId).then(data => {
        if (data) setAudit(data);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [auditId]);

  const handleItemChange = (itemId: string, score: Score) => {
    setAudit(prev => ({
      ...prev,
      items: { ...prev.items, [itemId]: score }
    }));
    setIsSaved(false);
  };

  const handleSave = async () => {
    const updatedAudit = { ...audit, lastSavedAt: Date.now() };
    await saveAudit(updatedAudit);
    setAudit(updatedAudit);
    setIsSaved(true);
  };

  const handleDownload = () => {
    const exportData = {
      id: audit.id,
      date: audit.date,
      facilityLocation: audit.facilityLocation,
      auditorName: audit.auditorName,
      comments: audit.comments,
      results: CHECKLIST_CATEGORIES.map(cat => ({
        category: cat.title,
        items: cat.items.map(item => ({
          task: item.text,
          score: audit.items[item.id] || 'Not Answered'
        }))
      }))
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `ResetFitness_Audit_${audit.date}_${audit.facilityLocation.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  if (isLoading) return <div className="p-8 text-center font-sans">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white min-h-screen pb-24 font-sans">
      <div className="sticky top-0 z-10 bg-black text-white p-4 shadow-md flex items-center justify-between">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-800 rounded-full transition-colors text-brand">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-heading font-bold text-lg tracking-wider uppercase">Reset Fitness</h1>
        <div className="w-10"></div>
      </div>

      <div className="p-4 space-y-6">
        <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <h2 className="font-heading font-semibold text-xl text-gray-900">Audit Details</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input 
              type="date" 
              value={audit.date}
              onChange={e => { setAudit({...audit, date: e.target.value}); setIsSaved(false); }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Facility Location</label>
            <input 
              type="text" 
              value={audit.facilityLocation}
              onChange={e => { setAudit({...audit, facilityLocation: e.target.value}); setIsSaved(false); }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Auditor Name</label>
            <input 
              type="text" 
              value={audit.auditorName}
              placeholder="Enter your name"
              onChange={e => { setAudit({...audit, auditorName: e.target.value}); setIsSaved(false); }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            />
          </div>
        </div>

        <div className="space-y-8">
          {CHECKLIST_CATEGORIES.map(category => {
            const score = getCategoryScore(audit, category.id);
            return (
              <div key={category.id} className="space-y-3">
                <div className="flex justify-between items-end border-b-2 border-black pb-2">
                  <h3 className="font-heading font-bold text-lg text-black">
                    {category.title}
                  </h3>
                  <div className="text-sm font-bold text-brand bg-brand/10 px-2 py-1 rounded">
                    {score.valid > 0 ? `${score.percentage}%` : '0%'}
                  </div>
                </div>
                <div className="space-y-2">
                  {category.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <span className="text-gray-800 text-sm pr-4 flex-1">{item.text}</span>
                      <ScoreButton 
                        score={audit.items[item.id] || null} 
                        onChange={(score) => handleItemChange(item.id, score)} 
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-2 pt-4">
          <label className="font-heading font-bold text-lg text-black block">Additional Comments</label>
          <textarea 
            value={audit.comments}
            onChange={e => { setAudit({...audit, comments: e.target.value}); setIsSaved(false); }}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            placeholder="Any additional observations..."
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex gap-3 max-w-3xl mx-auto">
        <button 
          onClick={handleSave}
          className="flex-1 bg-black text-white font-heading font-bold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Save className="w-5 h-5 text-brand" />
          {isSaved ? 'Saved!' : 'Save Progress'}
        </button>
        
        {isSaved && (
          <button 
            onClick={() => setShowDownloadModal(true)}
            className="flex-1 bg-gray-100 text-black border border-gray-300 font-heading font-bold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Download className="w-5 h-5 text-brand" />
            Download
          </button>
        )}
      </div>

      {showDownloadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-xl">
            <h3 className="font-heading font-bold text-xl text-center">Download Audit</h3>
            <p className="text-sm text-gray-500 text-center mb-6">Choose your preferred format</p>
            
            <button 
              onClick={() => { generatePDF(audit); setShowDownloadModal(false); }}
              className="w-full bg-brand text-white font-heading font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <FileText className="w-5 h-5" />
              Download PDF (Mobile Size)
            </button>
            
            <button 
              onClick={() => { handleDownload(); setShowDownloadModal(false); }}
              className="w-full bg-gray-100 text-black font-heading font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <FileJson className="w-5 h-5" />
              Download JSON
            </button>
            
            <button 
              onClick={() => setShowDownloadModal(false)}
              className="w-full bg-white text-gray-500 font-heading font-bold py-3 rounded-xl border border-gray-200 mt-2 active:scale-95 transition-transform"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
