import React, { useState, useEffect, useRef } from 'react';
import { Audit, saveAudit, getAudit, Score, generateId } from '../lib/db';
import { CHECKLIST_CATEGORIES } from '../lib/checklist';
import { getCategoryScore } from '../lib/score';
import { generatePDF } from '../lib/pdf';
import { ScoreButton } from './ScoreButton';
import { ImageCropper } from './ImageCropper';
import { ArrowLeft, Save, Download, FileText, FileJson, Camera, X } from 'lucide-react';
import { auth } from '../firebase';

export function AuditForm({ auditId, onBack }: { auditId: string | null, onBack: () => void }) {
  const [audit, setAudit] = useState<Audit>({
    id: generateId(),
    userId: auth.currentUser?.uid || '',
    date: new Date().toISOString().split('T')[0],
    quarter: `Q${Math.floor(new Date().getMonth() / 3) + 1}`,
    facilityLocation: 'Reset Fitness Jumeirah Islands',
    auditorName: auth.currentUser?.displayName || '',
    items: {},
    itemComments: {},
    itemImages: {},
    comments: '',
    lastSavedAt: Date.now()
  });
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [croppingItemId, setCroppingItemId] = useState<string | null>(null);
  const [croppingImageSrc, setCroppingImageSrc] = useState<string | null>(null);

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

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isSaved) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSaved]);

  const handleBackWithGuard = () => {
    if (!isSaved) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        onBack();
      }
    } else {
      onBack();
    }
  };

  const handleItemChange = (itemId: string, score: Score) => {
    setAudit(prev => ({
      ...prev,
      items: { ...prev.items, [itemId]: score }
    }));
    setIsSaved(false);
  };

  const handleItemCommentChange = (itemId: string, comment: string) => {
    setAudit(prev => ({
      ...prev,
      itemComments: { ...(prev.itemComments || {}), [itemId]: comment }
    }));
    setIsSaved(false);
  };

  const handleImageUploadClick = (itemId: string) => {
    setCroppingItemId(itemId);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCroppingImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setCroppingItemId(null);
    }
  };

  const handleCropComplete = (base64: string) => {
    if (croppingItemId) {
      setAudit(prev => {
        const currentImages = prev.itemImages?.[croppingItemId] || [];
        return {
          ...prev,
          itemImages: {
            ...(prev.itemImages || {}),
            [croppingItemId]: [...currentImages, base64]
          }
        };
      });
      setIsSaved(false);
    }
    setCroppingImageSrc(null);
    setCroppingItemId(null);
  };

  const handleDeleteImage = (itemId: string, index: number) => {
    setAudit(prev => {
      const currentImages = prev.itemImages?.[itemId] || [];
      const newImages = [...currentImages];
      newImages.splice(index, 1);
      return {
        ...prev,
        itemImages: {
          ...(prev.itemImages || {}),
          [itemId]: newImages
        }
      };
    });
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
      quarter: audit.quarter,
      facilityLocation: audit.facilityLocation,
      auditorName: audit.auditorName,
      comments: audit.comments,
      results: CHECKLIST_CATEGORIES.map(cat => ({
        category: cat.title,
        items: cat.items.map(item => ({
          task: item.text,
          score: audit.items[item.id] === 'FAIL' ? 'Requires Urgent Attention' : (audit.items[item.id] || 'Not Answered'),
          ...(audit.items[item.id] === 'FAIL' && audit.itemComments?.[item.id] ? { reason: audit.itemComments[item.id] } : {}),
          ...(audit.items[item.id] === 'FAIL' && audit.itemImages?.[item.id] && audit.itemImages[item.id].length > 0 ? { images: audit.itemImages[item.id] } : {})
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
        <button onClick={handleBackWithGuard} className="p-2 -ml-2 hover:bg-gray-800 rounded-full transition-colors text-brand">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="font-heading font-bold text-lg tracking-wider">Reset Fitness</h1>
          {!isSaved && <span className="text-[10px] text-brand font-bold animate-pulse">Unsaved Changes</span>}
        </div>
        <div className="w-10"></div>
      </div>

      <div className="p-4 space-y-6">
        <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <h2 className="font-heading font-semibold text-xl text-gray-900">Audit Details</h2>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input 
                type="date" 
                value={audit.date}
                onChange={e => { setAudit({...audit, date: e.target.value}); setIsSaved(false); }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              />
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-gray-700 mb-1">Quarter</label>
              <select 
                value={audit.quarter}
                onChange={e => { setAudit({...audit, quarter: e.target.value}); setIsSaved(false); }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black bg-white"
              >
                <option value="Q1">Q1</option>
                <option value="Q2">Q2</option>
                <option value="Q3">Q3</option>
                <option value="Q4">Q4</option>
              </select>
            </div>
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
                    <div key={item.id} className="flex flex-col p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1 pr-4 gap-2">
                          <span className="text-gray-800 text-sm">{item.text}</span>
                          {audit.items[item.id] === 'FAIL' && (
                            <button 
                              onClick={() => handleImageUploadClick(item.id)}
                              className="p-1.5 text-gray-400 hover:text-brand bg-gray-50 hover:bg-red-50 rounded-full transition-colors shrink-0"
                              title="Add Image Evidence"
                            >
                              <Camera className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <ScoreButton 
                          score={audit.items[item.id] || null} 
                          onChange={(score) => handleItemChange(item.id, score)} 
                        />
                      </div>
                      {audit.items[item.id] === 'FAIL' && (
                        <div className="mt-3 space-y-3">
                          <input
                            type="text"
                            placeholder="Reason for urgent attention..."
                            value={audit.itemComments?.[item.id] || ''}
                            onChange={(e) => handleItemCommentChange(item.id, e.target.value)}
                            className="w-full p-2 text-sm border border-red-200 rounded-md focus:ring-1 focus:ring-brand focus:border-brand bg-red-50 placeholder-red-300 text-red-900"
                          />
                          
                          {audit.itemImages?.[item.id] && audit.itemImages[item.id].length > 0 && (
                            <div className="grid grid-cols-2 gap-2">
                              {audit.itemImages[item.id].map((img, idx) => (
                                <div key={idx} className="relative group">
                                  <img src={img} alt="Evidence" className="w-full aspect-square object-cover rounded-lg border border-gray-200" />
                                  <button 
                                    onClick={() => handleDeleteImage(item.id, idx)}
                                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
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

      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />

      {croppingImageSrc && croppingItemId && (
        <ImageCropper
          imageSrc={croppingImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setCroppingImageSrc(null);
            setCroppingItemId(null);
          }}
        />
      )}

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
