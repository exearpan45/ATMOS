import React from 'react';
import {
  Droplets,
  Wind,
  Gauge,
  Eye,
  Sun,
  Cloud,
  Compass,
  ArrowUpRight,
  ThermometerSnowflake,
} from 'lucide-react';
import { CurrentWeatherState, TemperatureUnit, WindSpeedUnit } from '../types/weather';
import { formatTemperature, formatWindSpeed } from '../utils/formatters';
import { getUvCategory, getWindDirectionCardinal } from '../utils/weatherCodes';

interface WeatherDetailsProps {
  current: CurrentWeatherState;
  uvIndex?: number;
  visibilityMeters?: number;
  dewPoint?: number;
  tempUnit: TemperatureUnit;
}

export const WeatherDetails: React.FC<WeatherDetailsProps> = ({
  current,
  uvIndex = 0,
  visibilityMeters = 10000,
  dewPoint,
  tempUnit,
}) => {
  const uvCategory = getUvCategory(uvIndex);
  const visibilityKm = Math.round((visibilityMeters / 1000) * 10) / 10;
  const visibilityMiles = Math.round((visibilityMeters / 1609.34) * 10) / 10;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-100 tracking-tight">
          Comprehensive Atmospheric Metrics
        </h2>
        <p className="text-xs text-slate-400">
          Sensor telemetry and physical environmental diagnostics
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* 1. Wind & Gusts */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-lg space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Wind Velocity</span>
            <Wind className="w-4 h-4 text-sky-400" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
              {formatWindSpeed(current.windSpeed, 'kmh')}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              {/* Rotating compass needle */}
              <div
                className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center transition-transform duration-500"
                style={{ transform: `rotate(${current.windDirection}deg)` }}
                title={`Wind direction: ${current.windDirection}°`}
              >
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <span className="font-semibold text-slate-200">
                {getWindDirectionCardinal(current.windDirection)} ({current.windDirection}°)
              </span>
            </div>

            <span className="font-mono tabular-nums">
              Gusts: <strong className="text-slate-200">{formatWindSpeed(current.windGusts, 'kmh')}</strong>
            </span>
          </div>
        </div>

        {/* 2. Humidity & Dew Point */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-lg space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Moisture & Humidity</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
              {current.relativeHumidity}%
            </span>
          </div>

          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <span>
              {current.relativeHumidity > 70
                ? 'High humidity / sticky'
                : current.relativeHumidity < 35
                ? 'Dry ambient air'
                : 'Comfortable moisture'}
            </span>
            {dewPoint !== undefined && (
              <span className="font-mono tabular-nums">
                Dew point: <strong className="text-slate-200">{formatTemperature(dewPoint, tempUnit)}</strong>
              </span>
            )}
          </div>
        </div>

        {/* 3. UV Radiation Index */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-lg space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Solar UV Index</span>
            <Sun className="w-4 h-4 text-amber-400" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
              {Math.round(uvIndex * 10) / 10}
            </span>
            <span className={`text-xs font-semibold ${uvCategory.colorClass}`}>
              ({uvCategory.label})
            </span>
          </div>

          <div className="pt-2 border-t border-slate-800/60 text-xs text-slate-400">
            {uvCategory.advice}
          </div>
        </div>

        {/* 4. Atmospheric Pressure */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-lg space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Atmospheric Pressure</span>
            <Gauge className="w-4 h-4 text-indigo-400" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
              {Math.round(current.pressure)}
            </span>
            <span className="text-xs font-mono text-slate-400">hPa (MSL)</span>
          </div>

          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <span>
              {current.pressure >= 1020
                ? 'High barometric pressure'
                : current.pressure <= 1005
                ? 'Low barometric depression'
                : 'Standard sea-level range'}
            </span>
            <span className="font-mono tabular-nums">
              {(current.pressure * 0.02953).toFixed(2)} inHg
            </span>
          </div>
        </div>

        {/* 5. Visibility */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-lg space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Visibility Horizon</span>
            <Eye className="w-4 h-4 text-teal-400" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
              {visibilityKm}
            </span>
            <span className="text-xs font-mono text-slate-400">km</span>
          </div>

          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <span>
              {visibilityKm >= 10
                ? 'Clear optical horizon'
                : visibilityKm >= 5
                ? 'Mild atmospheric haze'
                : 'Impaired visibility'}
            </span>
            <span className="font-mono tabular-nums">{visibilityMiles} miles</span>
          </div>
        </div>

        {/* 6. Cloud Cover & Rain Rate */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-lg space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Cloud & Precipitation</span>
            <Cloud className="w-4 h-4 text-slate-300" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
              {current.cloudCover}%
            </span>
            <span className="text-xs text-slate-400">sky coverage</span>
          </div>

          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <span>
              {current.precipitation > 0 ? (
                <span className="text-cyan-300 font-semibold">Active precipitation</span>
              ) : (
                'No current rainfall'
              )}
            </span>
            <span className="font-mono tabular-nums text-slate-200">
              {current.precipitation} mm/h
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};
