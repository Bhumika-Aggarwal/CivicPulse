import { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Database, Radio, CheckCircle2, AlertCircle, LogIn, LogOut, User, PlusCircle, List } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { AuthModal } from './features/auth/AuthModal';
import { ComplaintForm } from './features/complaints/ComplaintForm';
import { ComplaintList } from './features/complaints/ComplaintList';

interface HealthData {
  status: string;
  service: string;
  timestamp: string;
  uptime: number;
  database: string;
}

export function App() {
  const { user, logout } = useAuth();
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'submit' | 'list'>('submit');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetch('http://localhost:4000/api/v1/health')
      .then((res) => {
        if (!res.ok && res.status !== 503) throw new Error('API probe failed');
        return res.json();
      })
      .then((data) => {
        setHealth(data.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-sky-600 text-white rounded-lg shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">CivicPulse</h1>
              <p className="text-xs text-slate-500">Smart City Operations Platform</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-slate-100 py-1.5 px-3 rounded-lg text-xs">
                  <User className="w-3.5 h-3.5 text-sky-600" />
                  <span className="font-medium text-slate-700">{user.fullName}</span>
                  <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Register</span>
              </button>
            )}
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Phase 3 Active
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex space-x-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('submit')}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              activeTab === 'submit'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>File Complaint</span>
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              activeTab === 'list'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <List className="w-4 h-4" />
            <span>My Complaints</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'submit' ? (
          <ComplaintForm onSuccess={() => { setRefreshTrigger((prev) => prev + 1); setActiveTab('list'); }} />
        ) : (
          <ComplaintList refreshTrigger={refreshTrigger} />
        )}

        {/* Platform Status Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">System Health & Verification</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <div className="flex items-center space-x-2 text-slate-600 mb-1">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-semibold">RBAC & Lifecycle</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-slate-700">Citizen Reporting Active</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <div className="flex items-center space-x-2 text-slate-600 mb-1">
                <Radio className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-semibold">Express REST & Sockets</span>
              </div>
              <div className="flex items-center space-x-1.5">
                {loading ? (
                  <span className="text-xs text-slate-400">Probing...</span>
                ) : error ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span className="text-xs text-amber-700">Offline / Standby</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs text-slate-700">Online (:4000)</span>
                  </>
                )}
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <div className="flex items-center space-x-2 text-slate-600 mb-1">
                <Database className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-semibold">Neon DB Persistence</span>
              </div>
              <div className="flex items-center space-x-1.5">
                {health?.database === 'connected' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs text-slate-700">Connected & Seeded</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-600">{health ? health.database : 'Awaiting Config'}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}

export default App;
