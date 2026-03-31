import { useState, useEffect } from 'react';
import { AuditList } from './components/AuditList';
import { AuditForm } from './components/AuditForm';
import { auth, signInWithGoogle, logOut } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { LogOut } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [currentAuditId, setCurrentAuditId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6">
          <h1 className="font-heading font-bold text-3xl tracking-wider text-black">Reset Fitness</h1>
          <p className="text-gray-500">Brand Compliance Audits</p>
          <button 
            onClick={signInWithGoogle}
            className="w-full bg-brand text-white font-heading font-bold py-4 rounded-xl shadow-md active:scale-95 transition-transform"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans text-gray-900 antialiased selection:bg-black selection:text-white">
      {view === 'list' && (
        <div className="max-w-3xl mx-auto flex justify-between items-center p-4 bg-gray-50">
          <div className="text-sm text-gray-600">Signed in as {user.displayName}</div>
          <button onClick={logOut} className="text-gray-500 hover:text-brand flex items-center gap-1 text-sm">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      )}
      {view === 'list' ? (
        <AuditList onOpenAudit={handleOpenAudit} onNewAudit={handleNewAudit} />
      ) : (
        <AuditForm auditId={currentAuditId} onBack={handleBack} />
      )}
    </div>
  );
}
