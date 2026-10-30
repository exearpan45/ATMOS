import React from 'react';
import { Droplets, Wind, Sun } from 'lucide-react';
import { DailyForecastItem, TemperatureUnit } from '../types/weather';
import { formatTemperature } from '../utils/formatters';
import { getWeatherCondition } from '../utils/weatherCodes';
import { WeatherIcon } from './WeatherIcon';

interface DailyForecastProps {
  daily: DailyForecastItem[];
  tempUnit: TemperatureUnit;
}

export const DailyForecast: React.FC<DailyForecastProps> = ({ daily, tempUnit }) => {
  if (!daily || daily.length === 0) return null;

  // Calculate absolute min and max of the entire 7-day period for calibration of range bars
  const weekMin = Math.min(...daily.map((d) => d.tempMin));
  const weekMax = Math.max(...daily.map((d) => d.tempMax));
  const tempSpread = Math.max(weekMax - weekMin, 1);

  return (
    <section className="rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl p-5 sm:p-6 shadow-xl space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-100 tracking-tight">
          7-Day Extended Forecast
        </h2>
        <p className="text-xs text-slate-400">
          Weekly atmospheric trajectory with calibrated high/low thermal spectrums
        </p>
      </div>

      <div className="divide-y divide-slate-800/80">
        {daily.map((day, idx) => {
          const condition = getWeatherCondition(day.weatherCode, true);
          
          // Calculate percentage offsets for visual temperature bar
          const leftPercent = Math.max(0, Math.min(100, ((day.tempMin - weekMin) / tempSpread) * 100));
          const widthPercent = Math.max(8, Math.min(100 - leftPercent, ((day.tempMax - day.tempMin) / tempSpread) * 100));

          return (
            <div
              key={`daily-${day.date}-${idx}`}
              className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
            >
              {/* Day Name and Date */}
              <div className="w-28 shrink-0">
                <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                  <span>{day.dayName}</span>
                  {idx === 0 && (
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                      Now
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400">{day.formattedDate}</div>
              </div>

              {/* Weather Condition & Icon */}
              <div className="flex items-center gap-2.5 sm:w-44 shrink-0">
                <WeatherIcon code={day.weatherCode} isDay={true} date={day.date} className="w-5 h-5 shrink-0" />
                <span className="text-xs sm:text-sm text-slate-300 truncate">
                  {condition.title}
                </span>
              </div>

              {/* Precipitation & Wind snippet */}
              <div className="flex items-center gap-3 sm:w-28 shrink-0 text-xs font-mono tabular-nums text-slate-400">
                {day.precipitationProbabilityMax > 0 ? (
                  <span className="flex items-center gap-1 text-cyan-400 font-medium">
                    <Droplets className="w-3.5 h-3.5" />
                    {day.precipitationProbabilityMax}%
                  </span>
                ) : (
                  <span className="text-slate-600 flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5" />
                    0%
                  </span>
                )}
                {day.uvIndexMax > 0 && (
                  <span className="hidden md:flex items-center gap-0.5 text-amber-400/80" title={`Max UV: ${day.uvIndexMax}`}>
                    <Sun className="w-3 h-3" />
                    {Math.round(day.uvIndexMax)}
                  </span>
                )}
              </div>

              {/* Temperature Bar & High / Low Readings */}
              <div className="flex items-center gap-3 flex-1 min-w-[160px] justify-end">
                <span className="text-xs font-mono font-semibold text-cyan-400 tabular-nums w-10 text-right">
                  {formatTemperature(day.tempMin, tempUnit)}
                </span>

                {/* Range bar */}
                <div className="relative flex-1 h-2 bg-slate-800 rounded-full overflow-hidden max-w-[140px] sm:max-w-none">
                  <div
                    className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-rose-400"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                  />
                </div>

                <span className="text-xs font-mono font-semibold text-rose-400 tabular-nums w-10 text-left">
                  {formatTemperature(day.tempMax, tempUnit)}
                </span>
              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
};
