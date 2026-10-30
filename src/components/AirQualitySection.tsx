import React from 'react';
import { Wind, ShieldAlert, HeartPulse, Info, Sparkles } from 'lucide-react';
import { AirQualityData } from '../types/weather';

interface AirQualitySectionProps {
  airQuality?: AirQualityData;
}

export const AirQualitySection: React.FC<AirQualitySectionProps> = ({ airQuality }) => {
  if (!airQuality) {
    return (
      <section className="rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl p-6 shadow-xl text-center space-y-2">
        <Wind className="w-8 h-8 text-slate-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-200">Air Quality Telemetry Loading</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Atmospheric aerosol sensors are retrieving current particulate indices for this coordinate.
        </p>
      </section>
    );
  }

  const { europeanAqi, usAqi, pm25, pm10, no2, o3, so2, co, category } = airQuality;

  return (
    <section className="rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl p-5 sm:p-6 shadow-xl space-y-6">
      
      {/* Title & Scale Identifier */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">
              Air Quality & Atmospheric Composition
            </h2>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
              Open-Meteo AQI
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time pollutant concentrations and particulate health indicators (WHO & EPA standards)
          </p>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Scale: European EAQI & US EPA</span>
        </div>
      </div>

      {/* Main AQI Status Card */}
      <div className={`p-5 rounded-xl border ${category.bgClass} ${category.borderClass} space-y-3`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center justify-center shrink-0">
              <span className="text-2xl font-black font-mono tabular-nums text-white">
                {europeanAqi ?? usAqi ?? '--'}
              </span>
              <span className="text-[9px] uppercase font-mono text-slate-400">Index</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xl font-extrabold ${category.colorClass}`}>
                  {category.label}
                </span>
                <HeartPulse className={`w-4 h-4 ${category.colorClass}`} />
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {category.description}
              </p>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-400 sm:text-right shrink-0">
            {usAqi !== undefined && (
              <div>US AQI: <strong className="text-slate-100">{usAqi} / 500</strong></div>
            )}
            {europeanAqi !== undefined && (
              <div>European AQI: <strong className="text-slate-100">{europeanAqi} / 100</strong></div>
            )}
          </div>
        </div>
      </div>

      {/* Individual Pollutants Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* PM2.5 */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">PM2.5</span>
            <span className="text-[10px] text-slate-500">Fine Dust</span>
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-white">
            {pm25 !== undefined ? Math.round(pm25 * 10) / 10 : '--'}
            <span className="text-[10px] font-normal text-slate-400 ml-1">μg/m³</span>
          </div>
          <div className="text-[10px] text-slate-500">
            {pm25 && pm25 < 15 ? 'Safe level' : 'Elevated'}
          </div>
        </div>

        {/* PM10 */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">PM10</span>
            <span className="text-[10px] text-slate-500">Inhalable</span>
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-white">
            {pm10 !== undefined ? Math.round(pm10 * 10) / 10 : '--'}
            <span className="text-[10px] font-normal text-slate-400 ml-1">μg/m³</span>
          </div>
          <div className="text-[10px] text-slate-500">
            {pm10 && pm10 < 45 ? 'Clean' : 'Moderate'}
          </div>
        </div>

        {/* Nitrogen Dioxide NO2 */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">NO₂</span>
            <span className="text-[10px] text-slate-500">Vehicle gas</span>
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-white">
            {no2 !== undefined ? Math.round(no2 * 10) / 10 : '--'}
            <span className="text-[10px] font-normal text-slate-400 ml-1">μg/m³</span>
          </div>
          <div className="text-[10px] text-slate-500">Traffic exhaust</div>
        </div>

        {/* Ozone O3 */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">O₃</span>
            <span className="text-[10px] text-slate-500">Surface</span>
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-white">
            {o3 !== undefined ? Math.round(o3 * 10) / 10 : '--'}
            <span className="text-[10px] font-normal text-slate-400 ml-1">μg/m³</span>
          </div>
          <div className="text-[10px] text-slate-500">Photochemical</div>
        </div>

        {/* Sulphur Dioxide SO2 */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">SO₂</span>
            <span className="text-[10px] text-slate-500">Industrial</span>
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-white">
            {so2 !== undefined ? Math.round(so2 * 10) / 10 : '--'}
            <span className="text-[10px] font-normal text-slate-400 ml-1">μg/m³</span>
          </div>
          <div className="text-[10px] text-slate-500">Fossil emissions</div>
        </div>

        {/* Carbon Monoxide CO */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">CO</span>
            <span className="text-[10px] text-slate-500">Combustion</span>
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-white">
            {co !== undefined ? Math.round(co) : '--'}
            <span className="text-[10px] font-normal text-slate-400 ml-1">μg/m³</span>
          </div>
          <div className="text-[10px] text-slate-500">Combustion gas</div>
        </div>

      </div>

      {/* Health Advice Footer Note */}
      <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-start gap-3 text-xs text-slate-400">
        <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200">Health Recommendation: </span>
          {category.label.includes('Good') || category.label.includes('Fair')
            ? 'Air quality is great for all standard outdoor physical activities, running, cycling, and natural ventilation.'
            : 'Consider wearing a protective mask or closing windows if sensitive to particulate matter or respiratory irritants.'}
        </div>
      </div>

    </section>
  );
};
