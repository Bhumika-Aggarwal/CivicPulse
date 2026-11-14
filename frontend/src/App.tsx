import { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Database, Radio, CheckCircle2, AlertCircle } from 'lucide-react';

interface HealthData {
  status: string;
  service: string;
  timestamp: string;
  uptime: number;
  database: string;
}

export function App() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
            Phase 1 Foundation
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Platform Infrastructure Status</h2>
          <p className="text-sm text-slate-600 mb-6">
            Phase 1 establishes the verified monorepo foundation under the strict 3-file root constraint with Neon PostgreSQL, PostGIS spatial extensions, and Express REST/WebSocket gateway.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
              <div className="flex items-center space-x-2 text-slate-600 mb-2">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-semibold uppercase tracking-wider">Frontend SPA</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="font-medium text-sm">Vite + React 18 + Tailwind</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
              <div className="flex items-center space-x-2 text-slate-600 mb-2">
                <Radio className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-semibold uppercase tracking-wider">Backend Gateway</span>
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
                <span className="text-xs font-semibold uppercase tracking-wider">Neon DB & PostGIS</span>
              </div>
              <div className="flex items-center space-x-2">
                {health?.database === 'connected' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="font-medium text-sm">Connected</span>
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
    </div>
  );
}

export default App;
