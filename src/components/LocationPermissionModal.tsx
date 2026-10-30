import React from 'react';
import { Navigation, ShieldCheck, MapPin, X, Sparkles } from 'lucide-react';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onRequestLocation: () => void;
  onDismiss: () => void;
  isLocating: boolean;
}

export const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  isOpen,
  onRequestLocation,
  onDismiss,
  isLocating,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-7 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Icon with pulse */}
        <div className="flex items-start justify-between">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/20">
              <Navigation className="w-6 h-6 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>

          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close location prompt"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Text Copy */}
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Pinpoint Hyper-Local Weather
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            ATMOS uses precision GPS telemetry to calculate hyper-local forecasts, precipitation alerts, and air quality down to your exact neighborhood.
          </p>
        </div>

        {/* Feature bullets */}
        <div className="space-y-2.5 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Pinpoint GPS accuracy down to street and district</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Zero tracking: coordinates processed locally in your browser</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={onRequestLocation}
            disabled={isLocating}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 hover:from-cyan-300 hover:to-indigo-300 transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Acquiring GPS Fix...' : 'Enable Precise Location'}</span>
          </button>

          <button
            onClick={onDismiss}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            Choose City Manually
          </button>
        </div>
      </div>
    </div>
  );
};
