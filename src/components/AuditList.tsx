import { useState, useEffect } from 'react';
import { Audit, getAudits, deleteAudit } from '../lib/db';
import { Plus, FileText, Trash2, Calendar, MapPin, User } from 'lucide-react';

export function AuditList({ onOpenAudit, onNewAudit }: { onOpenAudit: (id: string) => void, onNewAudit: () => void }) {
  const [audits, setAudits] = useState<Audit[]>([]);

  const loadAudits = () => {
    getAudits().then(setAudits);
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

  return (
    <div className="max-w-3xl mx-auto min-h-screen bg-gray-50 font-sans pb-12">
      <div className="bg-black text-white p-6 shadow-md">
        <h1 className="font-heading font-bold text-2xl tracking-wider uppercase text-center">Reset Fitness</h1>
        <p className="text-center text-gray-400 text-sm mt-1">Brand Compliance Audits</p>
      </div>

      <div className="p-4 space-y-4">
        <button 
          onClick={onNewAudit}
          className="w-full bg-black text-white font-heading font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5" />
          Start New Audit
        </button>

        <div className="mt-8">
          <h2 className="font-heading font-semibold text-lg text-gray-900 mb-4">Saved Audits</h2>
          
          {audits.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No saved audits found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {audits.map(audit => (
                <div 
                  key={audit.id}
                  onClick={() => onOpenAudit(audit.id)}
                  className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:border-black transition-colors flex items-center justify-between"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium text-gray-900">{audit.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{audit.facilityLocation}</span>
                    </div>
                    {audit.auditorName && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span className="truncate">{audit.auditorName}</span>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={(e) => handleDelete(e, audit.id)}
                    className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
