/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AuditList } from './components/AuditList';
import { AuditForm } from './components/AuditForm';

export default function App() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [currentAuditId, setCurrentAuditId] = useState<string | null>(null);

  const handleOpenAudit = (id: string) => {
    setCurrentAuditId(id);
    setView('form');
  };

  const handleNewAudit = () => {
    setCurrentAuditId(null);
    setView('form');
  };

  const handleBack = () => {
    setView('list');
  };

  return (
    <div className="font-sans text-gray-900 antialiased selection:bg-black selection:text-white">
      {view === 'list' ? (
        <AuditList onOpenAudit={handleOpenAudit} onNewAudit={handleNewAudit} />
      ) : (
        <AuditForm auditId={currentAuditId} onBack={handleBack} />
      )}
    </div>
  );
}
