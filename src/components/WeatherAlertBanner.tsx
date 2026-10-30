import React, { useState } from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  X,
  Clock,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { WeatherAlert } from '../types/weather';

interface WeatherAlertBannerProps {
  alerts?: WeatherAlert[];
}

export const WeatherAlertBanner: React.FC<WeatherAlertBannerProps> = ({ alerts }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeAlertIndex, setActiveAlertIndex] = useState<number>(0);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  if (!alerts || alerts.length === 0 || isDismissed) {
    return null;
  }

  const alert = alerts[activeAlertIndex] || alerts[0];
  const isExtreme = alert.severity === 'extreme';
  const isSevere = alert.severity === 'severe';

  // Formatting timestamps
  const formatTime = (isoString: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(new Date(isoString));
    } catch {
      return isoString;
    }
  };

  const getSeverityStyle = () => {
    if (isExtreme) {
      return {
        container: 'bg-rose-950/90 border-rose-600/90 text-rose-100 shadow-rose-950/50',
        badge: 'bg-rose-600 text-white font-bold',
        icon: <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 animate-pulse" />,
        highlight: 'text-rose-300',
        pulseBorder: 'ring-rose-500/40',
      };
    }
    if (isSevere) {
      return {
        container: 'bg-amber-950/90 border-amber-600/90 text-amber-100 shadow-amber-950/50',
        badge: 'bg-amber-600 text-slate-950 font-bold',
        icon: <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />,
        highlight: 'text-amber-300',
        pulseBorder: 'ring-amber-500/40',
      };
    }
    return {
      container: 'bg-cyan-950/90 border-cyan-700/90 text-cyan-100 shadow-cyan-950/50',
      badge: 'bg-cyan-600 text-white font-bold',
      icon: <AlertTriangle className="w-5 h-5 text-cyan-400 shrink-0" />,
      highlight: 'text-cyan-300',
      pulseBorder: 'ring-cyan-500/40',
    };
  };

  const style = getSeverityStyle();

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`relative w-full rounded-2xl border backdrop-blur-xl shadow-xl transition-all duration-200 overflow-hidden ${style.container} ring-2 ${style.pulseBorder}`}
    >
      {/* Top Banner Ribbon */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Left side: Severity icon, event title & headline */}
        <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
          <div className="p-2 rounded-xl bg-slate-950/50 border border-white/10 shrink-0">
            {style.icon}
          </div>

          <div className="space-y-0.5 truncate flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full ${style.badge}`}>
                {alert.severity} Hazard
              </span>
              <span className="font-bold text-sm sm:text-base tracking-tight text-white truncate">
                {alert.event}
              </span>
              {alerts.length > 1 && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/40 text-slate-300">
                  {activeAlertIndex + 1} of {alerts.length}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm font-medium text-slate-200 truncate">
              {alert.headline}
            </p>
          </div>
        </div>

        {/* Right side: Action controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {/* Multiple alerts switcher */}
          {alerts.length > 1 && (
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10 mr-1">
              <button
                onClick={() =>
                  setActiveAlertIndex((prev) => (prev > 0 ? prev - 1 : alerts.length - 1))
                }
                className="px-2 py-0.5 text-xs text-slate-300 hover:text-white rounded"
                title="Previous alert"
              >
                Prev
              </button>
              <button
                onClick={() =>
                  setActiveAlertIndex((prev) => (prev < alerts.length - 1 ? prev + 1 : 0))
                }
                className="px-2 py-0.5 text-xs text-slate-300 hover:text-white rounded"
                title="Next alert"
              >
                Next
              </button>
            </div>
          )}

          {/* Expand / Collapse Details Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 hover:bg-black/60 border border-white/10 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            <span>{isExpanded ? 'Hide Details' : 'Safety Guidance'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Dismiss Button */}
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 rounded-lg hover:bg-black/40 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Dismiss alert banner"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Expanded Emergency Details & Protective Instructions Drawer */}
      {isExpanded && (
        <div className="px-4 sm:px-6 pb-5 pt-2 border-t border-white/10 bg-black/30 space-y-4 text-xs sm:text-sm animate-in fade-in duration-200">
          
          {/* Description */}
          {alert.description && (
            <div className="space-y-1">
              <div className="text-xs uppercase font-semibold tracking-wider text-slate-400">
                Meteorological Assessment
              </div>
              <p className="text-slate-200 leading-relaxed">
                {alert.description}
              </p>
            </div>
          )}

          {/* Protective Safety Instructions */}
          {alert.instruction && (
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Recommended Safety Action</span>
              </div>
              <p className="text-slate-200 leading-relaxed font-medium">
                {alert.instruction}
              </p>
            </div>
          )}

          {/* Metadata Footer: Source, Effective & Expiration */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-2 border-t border-white/10">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-300">Alert information:</span>
              <span className="font-mono text-slate-200">{alert.source}</span>
            </div>

            <div className="flex items-center gap-4 font-mono text-[11px]">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Active: {formatTime(alert.effective)}</span>
              </span>
              <span>·</span>
              <span>Expires: {formatTime(alert.expires)}</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
