import { useState, useEffect } from 'react';
import {
  Activity,
  ShieldCheck,
  Database,
  Radio,
  CheckCircle2,
  LogIn,
  LogOut,
  PlusCircle,
  List,
  TrendingUp,
  UserCheck,
  HardHat,
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { AuthModal } from './features/auth/AuthModal';
import { ComplaintForm } from './features/complaints/ComplaintForm';
import { ComplaintList } from './features/complaints/ComplaintList';
import { AuthorityDashboard } from './features/authority/AuthorityDashboard';
import { WorkerPortal } from './features/worker/WorkerPortal';

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
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'submit' | 'list' | 'authority' | 'worker'>('submit');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetch('http://localhost:4000/api/v1/health')
      .then((res) => {
        if (!res.ok && res.status !== 503) throw new Error('API probe failed');
        return res.json();
      })
      .then((data) => {
        setHealth(data.data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-sky-900 bg-clip-text text-transparent">
                  CivicPulse
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                  Phase 4 Live
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500">Smart City Operations & Citizen Reporting</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2.5 bg-slate-100/80 border border-slate-200/60 py-1.5 px-3 rounded-xl text-xs shadow-2xs">
                  <div className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {user.fullName.charAt(0)}
                  </div>
                  <span className="font-semibold text-slate-700">{user.fullName}</span>
                  <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border border-sky-200">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center space-x-2 text-xs font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white shadow-sm hover:shadow transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Citizen Sign In / Register</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* City Operations Hero Bar */}
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950 to-blue-900 p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.15),transparent_70%)] pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-sky-400 bg-sky-950/60 border border-sky-800/60 px-2.5 py-1 rounded-full inline-block">
                City Operations Center
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight text-white">
                Multi-Role Civic Workflow & Worker Dispatch
              </h2>
              <p className="text-xs text-slate-300 max-w-xl">
                Citizen reporting, supervisor triage & worker dispatch, and step-by-step field task execution with GPS tracking readiness.
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3 text-center min-w-[90px]">
                <span className="text-xs text-sky-200 block font-medium">Departments</span>
                <span className="text-lg font-bold">5 Active</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3 text-center min-w-[90px]">
                <span className="text-xs text-sky-200 block font-medium">Field Status</span>
                <span className="text-lg font-bold">Live Flow</span>
              </div>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs (Citizen / Supervisor / Worker) */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2 flex-wrap gap-2">
          <div className="flex space-x-2 flex-wrap gap-y-1">
            <button
              onClick={() => setActiveTab('submit')}
              className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'submit'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Issue</span>
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'list'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
              <span>Citizen Tracker</span>
            </button>
            <button
              onClick={() => setActiveTab('authority')}
              className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'authority'
                  ? 'bg-blue-700 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Supervisor Dispatch</span>
            </button>
            <button
              onClick={() => setActiveTab('worker')}
              className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'worker'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200'
              }`}
            >
              <HardHat className="w-4 h-4" />
              <span>Worker Tasks</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-xs font-medium text-slate-500">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>Phase 4 Active</span>
          </div>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'submit' && (
          <ComplaintForm
            onSuccess={() => {
              setRefreshTrigger((prev) => prev + 1);
              setActiveTab('list');
            }}
            onRequireAuth={() => setAuthModalOpen(true)}
          />
        )}

        {activeTab === 'list' && (
          <ComplaintList
            refreshTrigger={refreshTrigger}
            onSwitchToSubmit={() => setActiveTab('submit')}
          />
        )}

        {activeTab === 'authority' && <AuthorityDashboard />}

        {activeTab === 'worker' && <WorkerPortal />}

        {/* System Health Status Footer */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Platform Architecture & Infrastructure Health
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Auto-refreshed</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-slate-100 rounded-xl p-3.5 bg-slate-50/50 flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Supervisor & Worker Modules</span>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 inline" />
                  <span>Dispatch & Workflow Active</span>
                </span>
              </div>
            </div>

            <div className="border border-slate-100 rounded-xl p-3.5 bg-slate-50/50 flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Express Gateway (:4000)</span>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 inline" />
                  <span>REST & Sockets Ready</span>
                </span>
              </div>
            </div>

            <div className="border border-slate-100 rounded-xl p-3.5 bg-slate-50/50 flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Neon DB & PostGIS</span>
                <span className="text-[11px] text-slate-600 font-medium">
                  {health?.database === 'connected' ? 'Connected' : 'Dual Pool Ready'}
                </span>
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
