import React from 'react';
import { CalendarCheck, CloudRain, Sun, Wind, Umbrella, CheckCircle2, AlertTriangle } from 'lucide-react';
import { CurrentWeatherState, DailyForecastItem, HourlyForecastItem, GeoLocation, TemperatureUnit } from '../types/weather';
import { formatTemperature } from '../utils/formatters';

interface WeatherPlannerProps {
  location: GeoLocation;
  current: CurrentWeatherState;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  tempUnit: TemperatureUnit;
}

export const WeatherPlanner: React.FC<WeatherPlannerProps> = ({
  location,
  current,
  hourly,
  daily,
  tempUnit,
}) => {
  const nextHours = hourly.slice(0, 12);
  const peakRain = nextHours.reduce((max, hour) => Math.max(max, hour.precipitationProbability), 0);
  const currentUv = nextHours[0]?.uvIndex ?? daily[0]?.uvIndexMax ?? 0;
  const currentWind = current.windSpeed;
  const temperature = current.temperature;

  let score = 100;
  if (peakRain > 70) score -= 30;
  else if (peakRain > 40) score -= 18;
  else if (peakRain > 20) score -= 8;
  if (temperature < 5 || temperature > 35) score -= 20;
  else if (temperature < 10 || temperature > 32) score -= 10;
  if (currentWind > 40) score -= 20;
  else if (currentWind > 25) score -= 10;
  if (currentUv > 8) score -= 15;
  else if (currentUv > 5) score -= 8;
  score = Math.max(0, Math.min(100, score));

  const scoreLabel = score >= 80 ? 'Great conditions' : score >= 60 ? 'Fair conditions' : score >= 40 ? 'Take precautions' : 'Better to stay flexible';
  const scoreColor = score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-cyan-400' : score >= 40 ? 'text-amber-400' : 'text-rose-400';

  const bestWindow = nextHours.find((hour) =>
    hour.precipitationProbability <= 30 &&
    hour.temperature >= 12 &&
    hour.temperature <= 32 &&
    hour.windSpeed <= 25
  );

  const tips: string[] = [];
  if (peakRain > 40) tips.push('Keep an umbrella or rain jacket handy.');
  else tips.push('Rain risk looks low over the next few hours.');
  if (currentUv > 6) tips.push('Use sun protection during brighter hours.');
  if (currentWind > 25) tips.push('Expect breezy conditions in exposed areas.');
  if (temperature > 32) tips.push('Plan breaks in the shade and stay hydrated.');
  if (temperature < 10) tips.push('A warm outer layer may be useful.');
  if (tips.length < 2) tips.push('Conditions look comfortable for everyday outdoor plans.');

  return (
    <section className="rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl p-5 sm:p-6 shadow-xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-100">Weather Planner</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">A quick guide for making outdoor plans in {location.name}</p>
        </div>
        <div className="rounded-xl border border-slate-700/70 bg-slate-950/60 px-4 py-2 text-right">
          <div className="text-[10px] uppercase tracking-wider text-slate-400">Outdoor score</div>
          <div className={`text-2xl font-black tabular-nums ${scoreColor}`}>{score}<span className="text-xs text-slate-500">/100</span></div>
          <div className={`text-[11px] font-semibold ${scoreColor}`}>{scoreLabel}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
          <div className="flex items-center gap-2 text-xs text-slate-400"><CloudRain className="w-4 h-4 text-cyan-400" /> Rain chance</div>
          <div className="mt-2 text-2xl font-bold text-white tabular-nums">{peakRain}%</div>
          <p className="text-[11px] text-slate-500 mt-1">Highest in the next 12 hours</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
          <div className="flex items-center gap-2 text-xs text-slate-400"><Sun className="w-4 h-4 text-amber-400" /> UV index</div>
          <div className="mt-2 text-2xl font-bold text-white tabular-nums">{Math.round(currentUv)}</div>
          <p className="text-[11px] text-slate-500 mt-1">Current forecast reading</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
          <div className="flex items-center gap-2 text-xs text-slate-400"><Wind className="w-4 h-4 text-indigo-400" /> Wind</div>
          <div className="mt-2 text-2xl font-bold text-white tabular-nums">{Math.round(currentWind)} <span className="text-xs font-medium text-slate-400">km/h</span></div>
          <p className="text-[11px] text-slate-500 mt-1">Current sustained wind</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Best outdoor window
          </div>
          {bestWindow ? (
            <p className="text-sm text-slate-300">
              Around <strong className="text-cyan-300">{bestWindow.formattedTime}</strong>, with {formatTemperature(bestWindow.temperature, tempUnit)} and {bestWindow.precipitationProbability}% rain chance.
            </p>
          ) : (
            <p className="text-sm text-slate-400">No especially clear window stands out in the next 12 hours. Check the hourly forecast before heading out.</p>
          )}
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
            <Umbrella className="w-4 h-4 text-cyan-400" /> Quick tips
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {tips.map((tip) => <li key={tip} className="flex gap-2"><span className="text-cyan-400">•</span><span>{tip}</span></li>)}
          </ul>
        </div>
      </div>
      <p className="flex items-start gap-2 text-[10px] text-slate-500">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        This score is a simple planning guide based on forecast conditions, not an official safety warning.
      </p>
    </section>
  );
};
