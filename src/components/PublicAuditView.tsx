import { useState, useEffect } from 'react';
import { Audit, getAudit } from '../lib/db';
import { CHECKLIST_CATEGORIES } from '../lib/checklist';
import { CategorySection } from './audit-form/CategorySection';
import { AuditDetailsForm } from './audit-form/AuditDetailsForm';
import { Header } from './layout/Header';
import { LoadingScreen } from './ui/LoadingScreen';
import { AlertCircle } from 'lucide-react';

export function PublicAuditView({ auditId }: { auditId: string }) {
  const [audit, setAudit] = useState<Audit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAudit(auditId).then(data => {
      if (data) {
        setAudit(data);
      } else {
        setError('Audit not found or no longer available.');
      }
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setError('An error occurred while loading the audit.');
      setIsLoading(false);
    });
  }, [auditId]);

  if (isLoading) {
    return <LoadingScreen message="Loading Audit Results..." />;
  }

  if (error || !audit) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 font-sans text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Oops!</h2>
        <p className="text-gray-600 max-w-xs mx-auto">{error}</p>
      </div>
    );
  }

  return (
    <div className="page-container pb-12">
      <Header subtitle="Public Audit Report" />

      <div className="p-4 space-y-6">
        <AuditDetailsForm 
          audit={audit} 
          setAudit={() => {}} 
          setHasChanges={() => {}} 
          setIsSaved={() => {}} 
          isLoading={true}
          readOnly={true}
        />

        <div className="space-y-8">
          {CHECKLIST_CATEGORIES.map(category => (
            <CategorySection
              key={category.id}
              category={category}
              audit={audit}
              isProcessingImageId={null}
              onItemChange={() => {}}
              onItemCommentChange={() => {}}
              onImageUploadClick={() => {}}
              onRemoveImage={() => {}}
              readOnly={true}
            />
          ))}
        </div>

        {audit.comments && (
          <div className="space-y-2 pt-4">
            <label className="input-label">Additional Comments</label>
            <div className="p-4 bg-white border border-gray-200 rounded-xl text-gray-800 text-sm italic">
              {audit.comments}
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-8 text-center text-gray-400 text-xs pb-8">
        <p>© {new Date().getFullYear()} Reset Fitness. All rights reserved.</p>
      </div>
    </div>
  );
}
