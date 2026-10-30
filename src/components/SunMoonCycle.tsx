import React from 'react';
import { Sunrise, Sunset, Clock, Sun, Moon } from 'lucide-react';
import { DailyForecastItem } from '../types/weather';
import { formatDaylight, formatHourTime } from '../utils/formatters';

interface SunMoonCycleProps {
  todayDaily?: DailyForecastItem;
  timezone: string;
  isDay: boolean;
}

export const SunMoonCycle: React.FC<SunMoonCycleProps> = ({
  todayDaily,
  timezone,
  isDay,
}) => {
  if (!todayDaily || !todayDaily.sunrise || !todayDaily.sunset) {
    return null;
  }

  const sunriseTimeFormatted = formatHourTime(todayDaily.sunrise, timezone);
  const sunsetTimeFormatted = formatHourTime(todayDaily.sunset, timezone);

  // Calculate solar position percentage along arc
  let solarProgress = 0;
  try {
    const sunriseDate = new Date(todayDaily.sunrise).getTime();
    const sunsetDate = new Date(todayDaily.sunset).getTime();
    const now = Date.now();

    if (now <= sunriseDate) {
      solarProgress = 0;
    } else if (now >= sunsetDate) {
      solarProgress = 100;
    } else {
      solarProgress = Math.round(((now - sunriseDate) / (sunsetDate - sunriseDate)) * 100);
    }
  } catch {
    solarProgress = isDay ? 50 : 100;
  }

  // Calculate arc coordinates (semicircle from left to right)
  // angle from 180 deg to 0 deg
  const angleRad = Math.PI - (solarProgress / 100) * Math.PI;
  const radius = 100;
  const cx = 130;
  const cy = 110;
  const sunX = cx + radius * Math.cos(angleRad);
  const sunY = cy - radius * Math.sin(angleRad);

  return (
    <section className="rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl p-5 sm:p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100 tracking-tight">
            Solar Ephemeris & Daylight
          </h2>
          <p className="text-xs text-slate-400">
            Diurnal solar path and daylight duration for local horizon
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Daylight: <strong className="text-slate-200">{formatDaylight(todayDaily.daylightDuration)}</strong></span>
        </div>
      </div>

      {/* SVG Solar Arc graphic */}
      <div className="relative flex flex-col items-center justify-center pt-2">
        <svg viewBox="0 0 260 130" className="w-full max-w-xs h-32 overflow-visible">
          {/* Base horizon baseline */}
          <line x1="10" y1="110" x2="250" y2="110" stroke="#334155" strokeWidth="2" strokeDasharray="3 3" />

          {/* Dotted arc track */}
          <path
            d="M 30 110 A 100 100 0 0 1 230 110"
            fill="none"
            stroke="#1e293b"
            strokeWidth="3"
            strokeDasharray="4 4"
          />

          {/* Traveled arc highlighting */}
          {solarProgress > 0 && (
            <path
              d={`M 30 110 A 100 100 0 0 1 ${sunX} ${sunY}`}
              fill="none"
              stroke="url(#solarGradient)"
              strokeWidth="3.5"
            />
          )}

          <defs>
            <linearGradient id="solarGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>

          {/* Current Sun / Moon marker */}
          <g transform={`translate(${sunX}, ${sunY})`}>
            <circle r="9" fill={isDay ? '#fbbf24' : '#818cf8'} className="drop-shadow-md shadow-amber-400" />
            <circle r="14" fill={isDay ? '#fbbf24' : '#818cf8'} opacity="0.25" className="animate-ping" />
          </g>
        </svg>

        {/* Sunrise & Sunset Timestamps */}
        <div className="w-full max-w-sm flex items-center justify-between px-2 pt-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sunrise className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Dawn / Sunrise</div>
              <div className="font-mono font-bold text-slate-100 text-sm">{sunriseTimeFormatted}</div>
            </div>
          </div>

          <div className="text-center font-mono text-[11px] text-slate-400">
            {isDay ? (
              <span className="text-amber-300 flex items-center gap-1 justify-center">
                <Sun className="w-3 h-3" /> Sun Tracking {solarProgress}%
              </span>
            ) : (
              <span className="text-indigo-300 flex items-center gap-1 justify-center">
                <Moon className="w-3 h-3" /> Nocturnal Phase
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-right">
            <div>
              <div className="text-[11px] text-slate-400">Dusk / Sunset</div>
              <div className="font-mono font-bold text-slate-100 text-sm">{sunsetTimeFormatted}</div>
            </div>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sunset className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
