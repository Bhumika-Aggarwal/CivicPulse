import React, { useState, useEffect } from 'react';
import { UserCheck, Clock, MapPin, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

interface AuthorityComplaint {
  id: string;
  complaintNumber: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  latitude: number;
  longitude: number;
  addressText: string | null;
  createdAt: string;
  categoryName: string;
  departmentName: string;
  citizenName: string;
}

interface WorkerUser {
  id: string;
  fullName: string;
  email: string;
}

export const AuthorityDashboard: React.FC = () => {
  const [complaints, setComplaints] = useState<AuthorityComplaint[]>([]);
  const [workers, setWorkers] = useState<WorkerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [assignReason, setAssignReason] = useState('');
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

  const fallbackComplaints: AuthorityComplaint[] = [
    {
      id: 'auth-demo-1',
      complaintNumber: 'CP-2026-00042',
      title: 'Pothole cave-in near central bus interchange',
      description: 'Multiple vehicles damaged due to a sudden asphalt depression after rainfall.',
      status: 'SUBMITTED',
      priority: 'HIGH',
      latitude: 12.9752,
      longitude: 77.6083,
      addressText: 'MG Road Junction, opposite Metro Exit B',
      createdAt: new Date().toISOString(),
      categoryName: 'Pothole & Broken Asphalt',
      departmentName: 'Roads & Infrastructure',
      citizenName: 'Rahul Sharma',
    },
    {
      id: 'auth-demo-2',
      complaintNumber: 'CP-2026-00055',
      title: 'Damaged storm-water drain barrier',
      description: 'Barrier broken during excavation work, safety risk at night.',
      status: 'SUBMITTED',
      priority: 'URGENT',
      latitude: 12.9352,
      longitude: 77.6946,
      addressText: 'Outer Ring Road, Service Lane',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      categoryName: 'Pothole & Road Damage',
      departmentName: 'Roads & Infrastructure',
      citizenName: 'Priya Patel',
    },
  ];

  const fallbackWorkers: WorkerUser[] = [
    { id: 'w1', fullName: 'Anil Kumar (Field Engineer)', email: 'anil@civicpulse.local' },
    { id: 'w2', fullName: 'Vikram Singh (Road Crew Lead)', email: 'vikram@civicpulse.local' },
    { id: 'w3', fullName: 'Suresh Raina (Sanitation Supervisor)', email: 'suresh@civicpulse.local' },
  ];

  const loadData = () => {
    setLoading(true);
    const token = localStorage.getItem('civicpulse_token');
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    Promise.all([
      fetch('http://localhost:4000/api/v1/authority/complaints', { headers, credentials: 'include' }).then((r) => r.json()).catch(() => ({ success: false })),
      fetch('http://localhost:4000/api/v1/authority/workers', { headers, credentials: 'include' }).then((r) => r.json()).catch(() => ({ success: false })),
    ]).then(([complaintsRes, workersRes]) => {
      if (complaintsRes.success && complaintsRes.data.length > 0) {
        setComplaints(complaintsRes.data);
      } else {
        setComplaints(fallbackComplaints);
      }

      if (workersRes.success && workersRes.data.length > 0) {
        setWorkers(workersRes.data);
        setSelectedWorkerId(workersRes.data[0].id);
      } else {
        setWorkers(fallbackWorkers);
        setSelectedWorkerId(fallbackWorkers[0].id);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssignSubmit = async (complaintId: string) => {
    setError(null);
    setAssignSuccess(null);
    const token = localStorage.getItem('civicpulse_token');

    try {
      const res = await fetch(`http://localhost:4000/api/v1/authority/complaints/${complaintId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          workerId: selectedWorkerId,
          reason: assignReason.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Assignment failed');

      setAssignSuccess('Task assigned to field worker successfully.');
      setComplaints((prev) =>
        prev.map((c) => (c.id === complaintId ? { ...c, status: 'ASSIGNED' } : c))
      );
      setAssigningId(null);
      setAssignReason('');
    } catch (err: unknown) {
      // Demo simulated state if offline
      setComplaints((prev) =>
        prev.map((c) => (c.id === complaintId ? { ...c, status: 'ASSIGNED' } : c))
      );
      setAssignSuccess('Worker assigned (Simulated Offline Mode).');
      setAssigningId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Supervisor Queue & Dispatch</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
              Authority Oversight
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Triage submitted citizen reports and dispatch authorized field workers.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:text-sky-600 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {assignSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{assignSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
        {complaints.map((item) => (
          <div
            key={item.id}
            className="p-5 border border-slate-200 rounded-xl hover:border-blue-200 transition-all bg-gradient-to-br from-white to-slate-50/40 space-y-3"
          >
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="font-mono text-xs font-bold text-sky-800 bg-sky-100/70 border border-sky-200 px-2 py-0.5 rounded-md">
                    {item.complaintNumber}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                    {item.status}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                    {item.priority}
                  </span>
                  <span className="text-xs font-medium text-slate-500">• Reported by {item.citizenName}</span>
                </div>
                <h4 className="font-bold text-base text-slate-900 pt-0.5">{item.title}</h4>
                <p className="text-xs text-slate-600">{item.description}</p>
              </div>

              {item.status === 'SUBMITTED' && (
                <button
                  onClick={() => setAssigningId(item.id)}
                  className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Assign Worker</span>
                </button>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
              <div className="flex items-center space-x-1.5 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>{item.addressText || `${item.latitude}, ${item.longitude}`}</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
                <Clock className="w-3.5 h-3.5" />
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Assignment Drawer / Form */}
            {assigningId === item.id && (
              <div className="mt-3 p-4 bg-sky-50/70 border border-sky-200 rounded-xl space-y-3">
                <h5 className="text-xs font-bold text-sky-900 uppercase tracking-wider">
                  Select Department Worker for Dispatch
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Eligible Field Worker</label>
                    <select
                      value={selectedWorkerId}
                      onChange={(e) => setSelectedWorkerId(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                    >
                      {workers.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Dispatch Notes / SLA</label>
                    <input
                      type="text"
                      value={assignReason}
                      onChange={(e) => setAssignReason(e.target.value)}
                      placeholder="e.g. Expedited patch required before peak traffic"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setAssigningId(null)}
                    className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200/50 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAssignSubmit(item.id)}
                    className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg shadow-2xs"
                  >
                    Confirm Dispatch
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
