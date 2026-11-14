import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LocationPicker } from './LocationPicker';
import { Send, Image as ImageIcon, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  code: string;
  description: string;
  departmentName: string;
}

export const ComplaintForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [latitude, setLatitude] = useState(12.971598); // Default city center coords
  const [longitude, setLongitude] = useState(77.594566);
  const [addressText, setAddressText] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:4000/api/v1/complaints/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setCategories(data.data);
          setCategoryId(data.data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      setSuccess(`Complaint filed successfully! Reference ID: ${data.data.complaint.complaintNumber}`);
      setTitle('');
      setDescription('');
      setAddressText('');
      setPhotoUrl('');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-slate-600 mb-2">Please sign in as a citizen to submit a civic complaint.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-slate-800">File a Civic Complaint</h3>
        <p className="text-xs text-slate-500">Report potholes, sanitation issues, water leakage, or electrical faults.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.departmentName})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent (Safety Hazard)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
          Issue Title
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Deep pothole causing two-wheeler skids"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
          Detailed Description
        </label>
        <textarea
          required
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide specific details about the problem, surrounding hazards, and nearest landmark..."
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
        />
      </div>

      <LocationPicker latitude={latitude} longitude={longitude} onChange={(lat, lng) => { setLatitude(lat); setLongitude(lng); }} />

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
          Street Address / Landmark (Optional)
        </label>
        <input
          type="text"
          value={addressText}
          onChange={(e) => setAddressText(e.target.value)}
          placeholder="Opposite Metro Pillar 142, Outer Ring Road"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Evidence Photo URL (Optional)</span>
        </label>
        <input
          type="url"
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          placeholder="https://res.cloudinary.com/demo/image/upload/sample.jpg"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg text-sm flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
      >
        <Send className="w-4 h-4" />
        <span>{loading ? 'Submitting Report...' : 'Submit Complaint'}</span>
      </button>
    </form>
  );
};
