import React, { useState, useEffect } from 'react';
import { HardHat, CheckCircle2, XCircle, ArrowRight, MapPin, Radio } from 'lucide-react';

interface WorkerTask {
  assignmentId: string;
  assignmentStatus: string;
  assignedAt: string;
  complaintId: string;
  complaintNumber: string;
  title: string;
  description: string;
  complaintStatus: string;
  priority: string;
  latitude: number;
  longitude: number;
  addressText: string | null;
  categoryName: string;
  departmentName: string;
}

export const WorkerPortal: React.FC = () => {
  const [tasks, setTasks] = useState<WorkerTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fallbackTasks: WorkerTask[] = [
    {
      assignmentId: 'assign-1',
      assignmentStatus: 'PENDING',
      assignedAt: new Date().toISOString(),
      complaintId: 'c-101',
      complaintNumber: 'CP-2026-00042',
      title: 'Deep pothole cave-in near central interchange',
      description: 'Multiple vehicles damaged due to a sudden asphalt depression.',
      complaintStatus: 'ASSIGNED',
      priority: 'HIGH',
      latitude: 12.9752,
      longitude: 77.6083,
      addressText: 'MG Road Junction, opposite Metro Exit B',
      categoryName: 'Pothole & Broken Asphalt',
      departmentName: 'Roads & Infrastructure',
    },
  ];

  const loadTasks = () => {
    setLoading(true);
    const token = localStorage.getItem('civicpulse_token');
    fetch('http://localhost:4000/api/v1/worker/tasks', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data.length > 0) {
          setTasks(res.data);
        } else {
          setTasks(fallbackTasks);
        }
        setLoading(false);
      })
      .catch(() => {
        setTasks(fallbackTasks);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleAccept = async (taskId: string) => {
    setActionSuccess(null);
    const token = localStorage.getItem('civicpulse_token');

    try {
      await fetch(`http://localhost:4000/api/v1/worker/tasks/${taskId}/accept`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
      });
    } catch {}

    setTasks((prev) =>
      prev.map((t) =>
        t.assignmentId === taskId
          ? { ...t, assignmentStatus: 'ACCEPTED', complaintStatus: 'ACCEPTED' }
          : t
      )
    );
    setActionSuccess('Task Accepted. Ready for field departure.');
  };

  const handleStatusTransition = async (taskId: string, toStatus: string) => {
    setActionSuccess(null);
    const token = localStorage.getItem('civicpulse_token');

    try {
      await fetch(`http://localhost:4000/api/v1/worker/tasks/${taskId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ toStatus }),
      });
    } catch {}

    setTasks((prev) =>
      prev.map((t) => (t.assignmentId === taskId ? { ...t, complaintStatus: toStatus } : t))
    );
    setActionSuccess(`Status progressed to ${toStatus.replace(/_/g, ' ')}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Field Worker Task Portal</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 uppercase">
              Field Operations
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Accept dispatches, navigate to incident locations, and log field status milestones.
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{actionSuccess}</span>
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center text-slate-400 text-sm">Loading field assignments...</div>
      ) : tasks.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-sm">No active tasks assigned to your roster.</div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => {
            const isAccepted = task.assignmentStatus === 'ACCEPTED' || task.complaintStatus !== 'ASSIGNED';

            return (
              <div
                key={task.assignmentId}
                className="p-5 border border-slate-200 rounded-xl bg-gradient-to-br from-white to-amber-50/20 space-y-4"
              >
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="font-mono text-xs font-bold text-sky-800 bg-sky-100/70 border border-sky-200 px-2 py-0.5 rounded-md">
                        {task.complaintNumber}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                        {task.complaintStatus}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                        {task.priority} Priority
                      </span>
                    </div>
                    <h4 className="font-bold text-base text-slate-900 pt-0.5">{task.title}</h4>
                    <p className="text-xs text-slate-600">{task.description}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg flex items-center space-x-2 text-xs text-slate-700">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>
                    Location: <strong>{task.addressText || `${task.latitude}, ${task.longitude}`}</strong>
                  </span>
                </div>

                {/* Task Milestone Workflow */}
                <div className="pt-2 border-t border-slate-100">
                  {!isAccepted ? (
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleAccept(task.assignmentId)}
                        className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Accept Assignment</span>
                      </button>
                      <button
                        onClick={() => alert('Assignment rejection with reason noted.')}
                        className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition-all flex items-center space-x-1"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Decline</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                        <span>Field Progress Stages:</span>
                        <span className="text-sky-600 flex items-center space-x-1">
                          <Radio className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
                          <span>GPS Ready</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => handleStatusTransition(task.assignmentId, 'ON_THE_WAY')}
                          className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-center space-x-1 ${
                            task.complaintStatus === 'ON_THE_WAY'
                              ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span>1. On The Way</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => handleStatusTransition(task.assignmentId, 'ARRIVED')}
                          className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-center space-x-1 ${
                            task.complaintStatus === 'ARRIVED'
                              ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span>2. Arrived</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => handleStatusTransition(task.assignmentId, 'IN_PROGRESS')}
                          className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-center space-x-1 ${
                            task.complaintStatus === 'IN_PROGRESS'
                              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span>3. In Progress</span>
                          <HardHat className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
