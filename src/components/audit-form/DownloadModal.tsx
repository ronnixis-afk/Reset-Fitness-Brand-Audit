import { FileText, FileJson, Share2, Check } from 'lucide-react';
import { useState } from 'react';
import { Audit } from '../../lib/db';
import { generatePDF } from '../../lib/pdf';

interface DownloadModalProps {
  audit: Audit;
  onClose: () => void;
  onDownloadJson: () => void;
  isDownloading: boolean;
  downloadStatus: string;
}

export function DownloadModal({ audit, onClose, onDownloadJson, isDownloading, downloadStatus }: DownloadModalProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'copied'>('idle');

  const handleShareLink = async () => {
    setCopyStatus('copying');
    const publicUrl = `${window.location.origin}/public/audit/${audit.id}`;
    
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      setCopyStatus('idle');
      alert('Failed to copy link to clipboard. Please copy it manually: ' + publicUrl);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-xl">
        <h3 className="font-heading font-bold text-xl text-center">Share Audit</h3>
        <p className="text-sm text-gray-500 text-center mb-6">Choose how you want to share this audit</p>
        
        <button 
          onClick={handleShareLink}
          className="w-full bg-black text-white font-heading font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          {copyStatus === 'copied' ? <Check className="w-5 h-5 text-green-400" /> : <Share2 className="w-5 h-5" />}
          {copyStatus === 'copied' ? 'Link Copied!' : 'Copy Public Link'}
        </button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-white text-gray-400 uppercase tracking-widest">Downloads</span>
          </div>
        </div>

        <button 
          onClick={() => { generatePDF(audit); onClose(); }}
          className="w-full bg-brand text-white font-heading font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <FileText className="w-5 h-5" />
          Download PDF (Mobile Size)
        </button>
        
        <button 
          onClick={onDownloadJson}
          disabled={isDownloading}
          className={`w-full bg-gray-100 text-black font-heading font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-transform ${isDownloading ? 'opacity-75 cursor-not-allowed' : 'active:scale-95'}`}
        >
          <FileJson className={`w-5 h-5 ${isDownloading ? 'animate-pulse text-gray-400' : ''}`} />
          {downloadStatus}
        </button>
        
        <button 
          onClick={onClose}
          className="w-full bg-white text-gray-500 font-heading font-bold py-3 rounded-xl border border-gray-200 mt-2 active:scale-95 transition-transform"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
