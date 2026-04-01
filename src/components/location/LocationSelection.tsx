import { useState, useEffect } from 'react';
import { Header } from '../layout/Header';
import { FloatingActionBar } from '../layout/FloatingActionBar';
import { ScoreChart, ChartData } from '../dashboard/ScoreChart';
import { RecentAudits } from '../dashboard/RecentAudits';
import { Audit, getAudits, deleteAudit } from '../../lib/db';
import { getOverallScore } from '../../lib/score';

interface LocationSelectionProps {
  country: string;
  setCountry: (country: string) => void;
  unit: string;
  setUnit: (unit: string) => void;
  onNext: () => void;
  onOpenAudit: (id: string) => void;
}

export function LocationSelection({ country, setCountry, unit, setUnit, onNext, onOpenAudit }: LocationSelectionProps) {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [expandedAuditId, setExpandedAuditId] = useState<string | null>(null);

  const loadAudits = async () => {
    const data = await getAudits();
    setAudits(data);
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

  // Calculate country scores
  const uaeAudits = audits.filter(a => a.facilityLocation.includes('United Arab Emirates') || a.facilityLocation.includes('Jumeirah Islands'));
  const uaeScore = uaeAudits.length > 0 
    ? Math.round(uaeAudits.reduce((acc, audit) => acc + getOverallScore(audit), 0) / uaeAudits.length)
    : 0;

  const chartData: ChartData[] = [
    { name: 'UAE', score: uaeScore },
    { name: 'KSA', score: 0, isPlaceholder: true }
  ];

  const recentAudits = audits.slice(0, 3);

  return (
    <div className="page-container min-h-[calc(100vh-60px)]">
      <Header />
      
      <div className="flex-1 p-4 flex flex-col pb-24">
        <ScoreChart data={chartData} title="Overall Score by Country" />

        <RecentAudits 
          audits={recentAudits} 
          onOpenAudit={onOpenAudit} 
          onDelete={handleDelete}
          expandedAuditId={expandedAuditId}
          setExpandedAuditId={setExpandedAuditId}
        />

        <div className="card space-y-6 p-6 mt-8">
          <h2 className="section-title text-center">Where are you auditing today?</h2>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="input-label">Country</label>
              <select 
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="input-field"
              >
                <option value="United Arab Emirates">United Arab Emirates</option>
                <option value="Saudi Arabia">Saudi Arabia</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="input-label">Unit</label>
              <select 
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                disabled={country === 'Saudi Arabia'}
                className="input-field"
              >
                {country === 'United Arab Emirates' ? (
                  <option value="Jumeirah Islands">Jumeirah Islands</option>
                ) : (
                  <option value="Coming Soon">Coming Soon</option>
                )}
              </select>
            </div>
          </div>
        </div>
      </div>

      <FloatingActionBar>
        <button 
          onClick={onNext}
          disabled={country === 'Saudi Arabia'}
          className="btn-primary"
        >
          Next
        </button>
      </FloatingActionBar>
    </div>
  );
}
