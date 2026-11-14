import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LocationPicker } from './LocationPicker';
import { Send, Image as ImageIcon, AlertCircle, CheckCircle2, Sparkles, Building2, Flag } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  code: string;
  description: string;
  departmentName: string;
}

export const ComplaintForm: React.FC<{ onSuccess: () => void; onRequireAuth: () => void }> = ({ onSuccess, onRequireAuth }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [latitude, setLatitude] = useState(12.971598);
  const [longitude, setLongitude] = useState(77.594566);
  const [addressText, setAddressText] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fallback categories if backend DB has not seeded yet
  const fallbackCategories: Category[] = [
    { id: 'c1', name: 'Pothole & Broken Asphalt', code: 'CAT_POTHOLE', description: 'Road potholes, cracks, or cave-ins', departmentName: 'Roads & Infrastructure' },
    { id: 'c2', name: 'Garbage Dump Overflow', code: 'CAT_GARBAGE', description: 'Uncollected trash bins or illegal dumping', departmentName: 'Public Health & Sanitation' },
    { id: 'c3', name: 'Water Pipe Leakage / Burst', code: 'CAT_WATER_LEAK', description: 'Drinking water pipe burst or sewage overflow', departmentName: 'Water Supply & Sewerage' },
    { id: 'c4', name: 'Streetlight Failure / Blackout', code: 'CAT_STREETLIGHT', description: 'Broken streetlights or exposed live electrical wires', departmentName: 'Electrical & Lighting' },
    { id: 'c5', name: 'Traffic Signal Non-Functional', code: 'CAT_TRAFFIC_SIGNAL', description: 'Faulty traffic signals causing vehicle congestion', departmentName: 'Traffic & Road Safety' },
  ];

  useEffect(() => {
    fetch('http://localhost:4000/api/v1/complaints/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setCategories(data.data);
          setCategoryId(data.data[0].id);
        } else {
          setCategories(fallbackCategories);
          setCategoryId(fallbackCategories[0].id);
        }
      })
      .catch(() => {
        setCategories(fallbackCategories);
        setCategoryId(fallbackCategories[0].id);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onRequireAuth();
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    const token = localStorage.getItem('civicpulse_token');

    const payload = {
      categoryId,
      title,
      description,
      priority,
      latitude,
      longitude,
      addressText: addressText.trim() || undefined,
      media: photoUrl.trim()
        ? [
            {
              secureUrl: photoUrl.trim(),
              publicId: `upload_${Date.now()}`,
              format: 'jpg',
            },
          ]
        : undefined,
    };

    try {
      const res = await fetch('http://localhost:4000/api/v1/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to submit complaint');
      }

      setSuccess(`Report Registered! Complaint Number: ${data.data.complaint.complaintNumber}`);
      setTitle('');
      setDescription('');
      setAddressText('');
      setPhotoUrl('');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategoryObj = categories.find((c) => c.id === categoryId);

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Report a Civic Issue</h3>
            <span className="inline-flex items-center space-x-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
              <Sparkles className="w-3 h-3 text-sky-500" />
              <span>Smart Routing</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit road, sanitation, water, or electrical issues. Your report will be automatically routed to the responsible municipal department.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50/80 border border-red-200 text-red-700 text-sm rounded-xl flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span className="font-semibold">{success}</span>
        </div>
      )}

      {/* Category & Priority Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
            <Building2 className="w-3.5 h-3.5 text-sky-600" />
            <span>Complaint Category</span>
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none transition-all shadow-2xs"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.departmentName}
              </option>
            ))}
          </select>
          {selectedCategoryObj && (
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center space-x-1">
              <span>Department:</span>
              <strong className="text-sky-700 font-semibold">{selectedCategoryObj.departmentName}</strong>
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
            <Flag className="w-3.5 h-3.5 text-sky-600" />
            <span>Urgency / Priority Level</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const).map((p) => {
              const active = priority === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-2 px-1 text-xs font-bold rounded-xl border text-center transition-all ${
                    active
                      ? p === 'URGENT'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : p === 'HIGH'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-sky-600 text-white border-sky-600 shadow-sm'
                      : 'bg-slate-50/50 text-slate-600 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Issue Title / Subject
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Major water pipe burst creating road sinkhole"
          className="w-full px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none transition-all shadow-2xs"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Detailed Description
        </label>
        <textarea
          required
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the severity of the problem, whether it's blocking traffic, and any hazards to pedestrians..."
          className="w-full px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none transition-all shadow-2xs resize-none"
        />
      </div>

      {/* Location Picker */}
      <LocationPicker
        latitude={latitude}
        longitude={longitude}
        onChange={(lat, lng) => {
          setLatitude(lat);
          setLongitude(lng);
        }}
      />

      {/* Address & Landmark */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Nearest Landmark / Street Address (Optional)
        </label>
        <input
          type="text"
          value={addressText}
          onChange={(e) => setAddressText(e.target.value)}
          placeholder="Opposite Municipal Hospital, Metro Pillar #214"
          className="w-full px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none transition-all shadow-2xs"
        />
      </div>

      {/* Media Evidence URL */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
          <span>Photo Evidence URL (Cloudinary / Image Link)</span>
        </label>
        <input
          type="url"
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          placeholder="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800"
          className="w-full px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none transition-all shadow-2xs font-mono text-xs"
        />
      </div>

      {/* Submit Action */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 bg-gradient-to-r from-sky-600 via-sky-500 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>{loading ? 'Submitting Report...' : user ? 'Submit Civic Complaint' : 'Sign in to Submit Complaint'}</span>
        </button>
      </div>
    </form>
  );
};
