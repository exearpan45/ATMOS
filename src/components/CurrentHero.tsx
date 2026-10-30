import React from 'react';
import { Bookmark, BookmarkCheck, ArrowUp, ArrowDown, Droplets, Wind, Gauge, Compass } from 'lucide-react';
import { GeoLocation, TemperatureUnit, WeatherData } from '../types/weather';
import { formatTemperature, formatWindSpeed } from '../utils/formatters';
import { getWeatherCondition, getWindDirectionCardinal } from '../utils/weatherCodes';
import { WeatherIcon } from './WeatherIcon';

interface CurrentHeroProps {
  weather: WeatherData;
  tempUnit: TemperatureUnit;
  isFavorite: boolean;
  onToggleFavorite: (location: GeoLocation) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const CurrentHero: React.FC<CurrentHeroProps> = ({
  weather,
  tempUnit,
  isFavorite,
  onToggleFavorite,
  onRefresh,
  isRefreshing,
}) => {
  const { location, current, daily, timezone } = weather;
  const condition = getWeatherCondition(current.weatherCode, current.isDay);
  const todayDaily = daily[0];

  const formattedUpdate = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
  }).format(new Date(weather.lastUpdated));

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl transition-all duration-300">
      
      {/* Ambient background glow reflecting the weather condition */}
      <div
        className={`absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br ${condition.backgroundGradient} blur-3xl pointer-events-none opacity-40`}
      />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        
        {/* Left Column: Location, metadata & massive temperature */}
        <div className="space-y-4">
          
          {/* Top metadata line with unboxed separators */}
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-400">
            <span className="font-semibold text-slate-200 uppercase tracking-wider">
              {location.country || 'Global Station'}
            </span>
            <span aria-hidden="true">·</span>
            <span>{timezone}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">Updated {formattedUpdate}</span>
            
            {/* Save favorite button */}
            <button
              onClick={() => onToggleFavorite(location)}
              className={`ml-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                isFavorite
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/60'
              }`}
              title={isFavorite ? 'Saved to favorites' : 'Add to favorites'}
            >
              {isFavorite ? <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span>{isFavorite ? 'Saved' : 'Save City'}</span>
            </button>
          </div>

          {/* City Heading & Pinpoint Details */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                {location.name}
              </h1>
              {location.admin1 && (
                <span className="text-base sm:text-2xl text-slate-400 font-medium">
                  {location.admin1}
                </span>
              )}
              {location.accuracyMeters !== undefined && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  GPS Fix ±{Math.round(location.accuracyMeters)}m
                </span>
              )}
            </div>

            {/* Coordinates and elevation telemetry */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
              <span>{location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E</span>
              {location.elevation !== undefined && (
                <>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span>{location.elevation}m ASL</span>
                </>
              )}
              {location.locality && location.locality !== location.name && (
                <>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-slate-300">{location.locality}</span>
                </>
              )}
            </div>
          </div>

          {/* Temperature & Condition hero display */}
          <div className="flex items-center gap-6 pt-2">
            <div className="flex items-baseline">
              <span className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-white font-mono tabular-nums">
                {formatTemperature(current.temperature, tempUnit)}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <WeatherIcon code={current.weatherCode} isDay={current.isDay} date={current.time} size={40} className="w-10 h-10" />
                <span className="text-xl sm:text-2xl font-bold text-slate-100">
                  {condition.title}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm">
                {condition.description}
              </p>
            </div>
          </div>

          {/* Feels like, High/Low, and Day status */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-sm text-slate-300 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Feels like</span>
              <span className="font-mono tabular-nums font-bold text-slate-100">
                {formatTemperature(current.apparentTemperature, tempUnit)}
              </span>
            </div>

            {todayDaily && (
              <>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <div className="flex items-center gap-1 text-rose-400">
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span className="font-mono tabular-nums font-semibold">
                    {formatTemperature(todayDaily.tempMax, tempUnit)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-cyan-400">
                  <ArrowDown className="w-3.5 h-3.5" />
                  <span className="font-mono tabular-nums font-semibold">
                    {formatTemperature(todayDaily.tempMin, tempUnit)}
                  </span>
                </div>
              </>
            )}

            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-xs uppercase tracking-wider text-slate-400">
              {current.isDay ? 'Daytime' : 'Nighttime'}
            </span>
          </div>

        </div>

        {/* Right Column: Key telemetry summary badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 shrink-0 lg:w-72">
          
          {/* Humidity */}
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Humidity</span>
              <Droplets className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xl font-bold text-slate-100 font-mono tabular-nums">
              {current.relativeHumidity}%
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Relative moisture</div>
          </div>

          {/* Wind */}
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Wind</span>
              <Wind className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-xl font-bold text-slate-100 font-mono tabular-nums">
              {formatWindSpeed(current.windSpeed, 'kmh')}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <Compass className="w-3 h-3 text-sky-400" />
              <span>{getWindDirectionCardinal(current.windDirection)} ({current.windDirection}°)</span>
            </div>
          </div>

          {/* Atmospheric Pressure */}
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Pressure</span>
              <Gauge className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-xl font-bold text-slate-100 font-mono tabular-nums">
              {Math.round(current.pressure)} <span className="text-xs font-normal text-slate-400">hPa</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {current.pressure > 1013 ? 'High pressure' : 'Normal / Low'}
            </div>
          </div>

          {/* Cloud Cover */}
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Cloud Cover</span>
              <WeatherIcon code={current.weatherCode} isDay={current.isDay} className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-slate-100 font-mono tabular-nums">
              {current.cloudCover}%
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {current.cloudCover > 70 ? 'Cloudy' : current.cloudCover > 30 ? 'Scattered' : 'Clear'}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
