import React, { useState, useEffect } from 'react';
import { Clock, MapPin, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react';

interface ComplaintItem {
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
}

export const ComplaintList: React.FC<{ refreshTrigger: number }> = ({ refreshTrigger }) => {
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComplaints = () => {
    setLoading(true);
    const token = localStorage.getItem('civicpulse_token');

    fetch('http://localhost:4000/api/v1/complaints/mine', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load your complaints');
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setComplaints(data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchComplaints();
  }, [refreshTrigger]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">SUBMITTED</span>;
      case 'ASSIGNED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">ASSIGNED</span>;
      case 'IN_PROGRESS':
      case 'ON_THE_WAY':
      case 'ARRIVED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">IN PROGRESS</span>;
      case 'RESOLVED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">RESOLVED</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">My Filed Complaints</h3>
          <p className="text-xs text-slate-500">Track resolution progress and status transitions in real time.</p>
        </div>
        <button
          onClick={fetchComplaints}
          disabled={loading}
          className="p-1.5 text-slate-500 hover:text-sky-600 rounded-lg hover:bg-slate-50 transition-colors"
          title="Refresh List"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : loading ? (
        <div className="py-8 text-center text-slate-400 text-sm">Loading complaints...</div>
      ) : complaints.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-sm border-2 border-dashed border-slate-100 rounded-xl">
          <p className="font-medium text-slate-600">No complaints filed yet.</p>
          <p className="text-xs text-slate-400 mt-1">Use the submission form to report your first civic issue.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map((item) => (
            <div
              key={item.id}
              className="p-4 border border-slate-200 rounded-lg hover:border-sky-300 transition-colors bg-slate-50/30"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
                      {item.complaintNumber}
                    </span>
                    {getStatusBadge(item.status)}
                    <span className="text-xs text-slate-500">• {item.categoryName}</span>
                  </div>
                  <h4 className="font-semibold text-sm text-slate-800 mt-1">{item.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{item.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.addressText || `${item.latitude}, ${item.longitude}`}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
