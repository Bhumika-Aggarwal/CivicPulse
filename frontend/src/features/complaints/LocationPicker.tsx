import React, { useState } from 'react';
import { MapPin, Crosshair } from 'lucide-react';

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({ latitude, longitude, onChange }) => {
  const [locating, setLocating] = useState(false);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(Number(pos.coords.latitude.toFixed(6)), Number(pos.coords.longitude.toFixed(6)));
        setLocating(false);
      },
      () => {
        alert('Could not retrieve your location. Please check browser permissions.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Incident Coordinates
        </label>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={locating}
          className="flex items-center space-x-1 text-xs text-sky-600 font-medium hover:text-sky-700 disabled:opacity-50"
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>{locating ? 'Detecting...' : 'Use My GPS'}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="text-[11px] text-slate-500 font-medium">Latitude</span>
          <input
            type="number"
            step="0.000001"
            required
            value={latitude}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0, longitude)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>
        <div>
          <span className="text-[11px] text-slate-500 font-medium">Longitude</span>
          <input
            type="number"
            step="0.000001"
            required
            value={longitude}
            onChange={(e) => onChange(latitude, parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-lg flex items-center space-x-2 text-xs text-sky-800">
        <MapPin className="w-4 h-4 shrink-0 text-sky-600" />
        <span>Selected Location: <strong>{latitude}</strong>, <strong>{longitude}</strong></span>
      </div>
    </div>
  );
};
