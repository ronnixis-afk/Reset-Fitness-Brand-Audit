import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface HeaderProps {
  onBack?: () => void;
  subtitle?: React.ReactNode;
  status?: React.ReactNode;
}

export function Header({ onBack, subtitle = "Brand Compliance Audits", status }: HeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-white text-black p-6 shadow-md flex items-center justify-between">
      {onBack ? (
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-brand">
          <ArrowLeft className="w-6 h-6" />
        </button>
      ) : (
        <div className="w-10"></div>
      )}
      
      <div className="flex flex-col items-center">
        <h1 className="brand-title">RESET FITNESS</h1>
        {status ? (
          status
        ) : (
          <p className="brand-subtitle">{subtitle}</p>
        )}
      </div>
      
      <div className="w-10"></div>
    </div>
  );
}
