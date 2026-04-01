import { useState, useEffect } from 'react';
import { AuditList } from './components/AuditList';
import { AuditForm } from './components/AuditForm';
import { auth, logOut } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { LogOut } from 'lucide-react';
import { LoginScreen } from './components/auth/LoginScreen';
import { LocationSelection } from './components/location/LocationSelection';

export default function App() {
  const [view, setView] = useState<'location' | 'list' | 'form'>('location');
  const [currentAuditId, setCurrentAuditId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [country, setCountry] = useState('United Arab Emirates');
  const [unit, setUnit] = useState('Jumeirah Islands');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (country === 'Saudi Arabia') {
      setUnit('Coming Soon');
    } else if (country === 'United Arab Emirates') {
      setUnit('Jumeirah Islands');
    }
  }, [country]);

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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-sans">Loading...</div>;
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="font-sans text-gray-900 antialiased selection:bg-black selection:text-white">
      {(view === 'list' || view === 'location') && (
        <div className="max-w-3xl mx-auto flex justify-between items-center p-4 bg-gray-50">
          <div className="text-sm text-gray-600">Signed in as {user.displayName || user.email}</div>
          <button onClick={logOut} className="text-gray-500 hover:text-brand flex items-center gap-1 text-sm">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      )}
      
      {view === 'location' ? (
        <LocationSelection 
          country={country} 
          setCountry={setCountry} 
          unit={unit} 
          setUnit={setUnit} 
          onNext={() => setView('list')} 
          onOpenAudit={handleOpenAudit}
        />
      ) : view === 'list' ? (
        <AuditList unit={unit} onOpenAudit={handleOpenAudit} onNewAudit={handleNewAudit} onBackToLocation={() => setView('location')} />
      ) : (
        <AuditForm auditId={currentAuditId} onBack={handleBack} selectedUnit={unit} />
      )}
    </div>
  );
}
