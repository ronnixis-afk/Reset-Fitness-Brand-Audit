import { FileText, FileJson } from 'lucide-react';
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
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-xl">
        <h3 className="font-heading font-bold text-xl text-center">Download Audit</h3>
        <p className="text-sm text-gray-500 text-center mb-6">Choose your preferred format</p>
        
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
