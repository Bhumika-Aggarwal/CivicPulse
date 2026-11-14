import { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Database, Radio, CheckCircle2, AlertCircle, LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { AuthModal } from './features/auth/AuthModal';

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
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-sky-600 text-white rounded-lg">
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
              Phase 2 Active
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Phase 2: Authentication & RBAC Engine</h2>
          <p className="text-sm text-slate-600 mb-6">
            RBAC protection active for 4 core personas: <span className="font-semibold text-slate-700">CITIZEN</span>, <span className="font-semibold text-slate-700">WORKER</span>, <span className="font-semibold text-slate-700">SUPERVISOR</span>, and <span className="font-semibold text-slate-700">ADMIN</span>. Access tokens rotate every 15 minutes with HttpOnly refresh tokens.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
              <div className="flex items-center space-x-2 text-slate-600 mb-2">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-semibold uppercase tracking-wider">Auth & RBAC</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="font-medium text-sm">JWT + Bcrypt + Refresh</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
              <div className="flex items-center space-x-2 text-slate-600 mb-2">
                <Radio className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-semibold uppercase tracking-wider">Gateway Status</span>
              </div>
              <div className="flex items-center space-x-2">
                {loading ? (
                  <span className="text-xs text-slate-400">Probing backend...</span>
                ) : error ? (
                  <>
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    <span className="font-medium text-sm text-amber-700">Offline / Standby</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="font-medium text-sm">Online (:4000)</span>
                  </>
                )}
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
              <div className="flex items-center space-x-2 text-slate-600 mb-2">
                <Database className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-semibold uppercase tracking-wider">Neon DB & Seeds</span>
              </div>
              <div className="flex items-center space-x-2">
                {health?.database === 'connected' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="font-medium text-sm">Connected & Seeded</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-slate-400" />
                    <span className="font-medium text-sm text-slate-600">
                      {health ? health.database : 'Awaiting Config'}
                    </span>
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
