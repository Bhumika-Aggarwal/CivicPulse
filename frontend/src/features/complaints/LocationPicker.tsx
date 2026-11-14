import React, { useState } from 'react';
import { MapPin, Navigation, Crosshair } from 'lucide-react';

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

  // Quick preset landmarks
  const presets = [
    { name: 'City Center / MG Road', lat: 12.9752, lng: 77.6083 },
    { name: 'Tech Park / Ring Road', lat: 12.9352, lng: 77.6946 },
    { name: 'Railway Station Hub', lat: 12.9774, lng: 77.5686 },
    { name: 'Residential Zone / Indiranagar', lat: 12.9784, lng: 77.6408 },
  ];

  return (
    <div className="space-y-4 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-600">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Incident Geo-Coordinates
            </label>
            <p className="text-[11px] text-slate-500">Pick live GPS coordinates or select a common city district</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={locating}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-sky-200 text-sky-700 shadow-sm hover:bg-sky-50 hover:border-sky-300 transition-all disabled:opacity-50"
        >
          <Crosshair className={`w-3.5 h-3.5 ${locating ? 'animate-spin text-sky-500' : 'text-sky-600'}`} />
          <span>{locating ? 'Detecting GPS...' : 'Use My Exact Location'}</span>
        </button>
      </div>

      {/* Coordinate Input Fields */}
      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Latitude</span>
          <input
            type="number"
            step="0.000001"
            required
            value={latitude}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0, longitude)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono text-slate-800 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none transition-all shadow-sm"
          />
        </div>
        <div className="relative">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Longitude</span>
          <input
            type="number"
            step="0.000001"
            required
            value={longitude}
            onChange={(e) => onChange(latitude, parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono text-slate-800 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Presets Bar */}
      <div>
        <span className="text-[11px] font-medium text-slate-500 block mb-1.5">Quick Location Presets:</span>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => onChange(preset.lat, preset.lng)}
              className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-600 hover:border-sky-300 hover:text-sky-700 hover:bg-sky-50/50 transition-colors shadow-2xs"
            >
              📍 {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Visual GPS readout badge */}
      <div className="p-3 bg-gradient-to-r from-sky-50 via-indigo-50/30 to-blue-50 border border-sky-100 rounded-lg flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 text-sky-900">
          <Navigation className="w-3.5 h-3.5 text-sky-600" />
          <span>Active Coordinate Pin:</span>
          <span className="font-mono font-bold text-sky-800">{latitude.toFixed(6)}, {longitude.toFixed(6)}</span>
        </div>
        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-full">
          GPS Ready
        </span>
      </div>
    </div>
  );
};
