import { useState, useEffect, useRef } from 'react';
import { Audit, saveAudit, getAudit, Score, generateId } from '../lib/db';
import { CHECKLIST_CATEGORIES } from '../lib/checklist';
import { ImageCropper } from './ImageCropper';
import { Save, Download, Loader2 } from 'lucide-react';
import { auth } from '../firebase';
import { AuditDetailsForm } from './audit-form/AuditDetailsForm';
import { CategorySection } from './audit-form/CategorySection';
import { DownloadModal } from './audit-form/DownloadModal';
import { Header } from './layout/Header';

export function AuditForm({ auditId, onBack, selectedUnit }: { auditId: string | null, onBack: () => void, selectedUnit?: string }) {
  const [audit, setAudit] = useState<Audit>({
    id: generateId(),
    userId: auth.currentUser?.uid || '',
    date: new Date().toISOString().split('T')[0],
    quarter: `Q${Math.floor(new Date().getMonth() / 3) + 1}`,
    facilityLocation: selectedUnit && selectedUnit !== 'Coming Soon' ? `Reset Fitness ${selectedUnit}` : '',
    auditorName: auth.currentUser?.displayName || '',
    items: {},
    itemComments: {},
    itemImages: {},
    comments: '',
    lastSavedAt: Date.now()
  });
  const [isSaved, setIsSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState('Download JSON');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isProcessingImageId, setIsProcessingImageId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [croppingItemId, setCroppingItemId] = useState<string | null>(null);
  const [croppingImageSrc, setCroppingImageSrc] = useState<string | null>(null);

  useEffect(() => {
    if (auditId) {
      getAudit(auditId).then(data => {
        if (data) {
          setAudit(data);
          setIsSaved(true);
        }
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
    if (hasChanges) {
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
    setHasChanges(true);
  };

  const handleItemCommentChange = (itemId: string, comment: string) => {
    setAudit(prev => ({
      ...prev,
      itemComments: { ...(prev.itemComments || {}), [itemId]: comment }
    }));
    setIsSaved(false);
    setHasChanges(true);
  };

  const handleImageUploadClick = (itemId: string) => {
    setCroppingItemId(itemId);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && croppingItemId) {
      setIsProcessingImageId(croppingItemId);
      const reader = new FileReader();
      reader.onload = async () => {
        await new Promise(r => setTimeout(r, 400));
        setCroppingImageSrc(reader.result as string);
        setIsProcessingImageId(null);
      };
      reader.readAsDataURL(file);
    } else {
      setCroppingItemId(null);
    }
  };

  const handleCropComplete = async (base64: string) => {
    if (croppingItemId) {
      const currentId = croppingItemId;
      setIsProcessingImageId(currentId);
      setCroppingImageSrc(null);
      setCroppingItemId(null);
      
      await new Promise(r => setTimeout(r, 400));
      
      setAudit(prev => {
        const currentImages = prev.itemImages?.[currentId] || [];
        return {
          ...prev,
          itemImages: {
            ...(prev.itemImages || {}),
            [currentId]: [...currentImages, base64]
          }
        };
      });
      setIsSaved(false);
      setHasChanges(true);
      setIsProcessingImageId(null);
    } else {
      setCroppingImageSrc(null);
      setCroppingItemId(null);
    }
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
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const updatedAudit = { ...audit, lastSavedAt: Date.now() };
    await saveAudit(updatedAudit);
    setAudit(updatedAudit);
    setIsSaved(true);
    setHasChanges(false);
    setIsSaving(false);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadStatus('Downloading...');

    // Simulate slight delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 500));

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
          score: audit.items[item.id] === 'FAIL' 
            ? 'Requires Urgent Attention' 
            : audit.items[item.id] === 'NEEDS_ATTENTION' 
              ? 'Needs Attention' 
              : (audit.items[item.id] || 'Not Answered'),
          ...( (audit.items[item.id] === 'FAIL' || audit.items[item.id] === 'NEEDS_ATTENTION') && audit.itemComments?.[item.id] ? { reason: audit.itemComments[item.id] } : {}),
          ...( (audit.items[item.id] === 'FAIL' || audit.items[item.id] === 'NEEDS_ATTENTION') && audit.itemImages?.[item.id] && audit.itemImages[item.id].length > 0 ? { images: audit.itemImages[item.id] } : {})
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

    setDownloadStatus('Successfully Downloaded');
    setTimeout(() => {
      setDownloadStatus('Download JSON');
      setIsDownloading(false);
      setShowDownloadModal(false);
    }, 2000);
  };

  return (
    <div className="page-container pb-24">
      <Header 
        onBack={handleBackWithGuard} 
        subtitle={hasChanges ? <span className="text-brand font-bold animate-pulse">Unsaved Changes</span> : "Brand Compliance Audits"} 
      />

      <div className="p-4 space-y-6">
        <AuditDetailsForm 
          audit={audit} 
          setAudit={setAudit} 
          isLoading={isLoading} 
          setIsSaved={setIsSaved} 
          setHasChanges={setHasChanges} 
        />

        {isLoading ? (
          <div className="space-y-8 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-3">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                {[1, 2, 3].map(j => (
                  <div key={j} className="h-16 bg-gray-100 rounded-lg border border-gray-200"></div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-8">
              {CHECKLIST_CATEGORIES.map(category => (
                <CategorySection
                  key={category.id}
                  category={category}
                  audit={audit}
                  onItemChange={handleItemChange}
                  onItemCommentChange={handleItemCommentChange}
                  onImageUploadClick={handleImageUploadClick}
                  onRemoveImage={handleDeleteImage}
                  isProcessingImageId={isProcessingImageId}
                />
              ))}
            </div>

            <div className="space-y-2 pt-4">
              <label className="input-label">Additional Comments</label>
              <textarea 
                value={audit.comments}
                onChange={e => { setAudit({...audit, comments: e.target.value}); setIsSaved(false); setHasChanges(true); }}
                rows={4}
                className="input-field"
                placeholder="Any additional observations..."
              />
            </div>
          </>
        )}
      </div>

      {!isLoading && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex gap-3 max-w-3xl mx-auto z-10">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`btn-primary flex-1 ${isSaving ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 text-brand animate-spin" />
            ) : (
              <Save className="w-5 h-5 text-brand" />
            )}
            {isSaving ? 'Saving...' : isSaved && !hasChanges ? 'Saved!' : 'Save Progress'}
          </button>
          
          {isSaved && (
            <button 
              onClick={() => setShowDownloadModal(true)}
              className="btn-secondary flex-1"
            >
              <Download className="w-5 h-5 text-brand" />
              Download
            </button>
          )}
        </div>
      )}

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
        <DownloadModal 
          audit={audit} 
          onClose={() => setShowDownloadModal(false)} 
          onDownloadJson={handleDownload} 
          isDownloading={isDownloading} 
          downloadStatus={downloadStatus} 
        />
      )}
    </div>
  );
}
