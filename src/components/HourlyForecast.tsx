import React, { useState, useEffect, useRef } from 'react';
import { CloudRain, Wind, Droplets, LineChart, LayoutGrid } from 'lucide-react';
import { Chart, registerables } from 'chart.js';
import { HourlyForecastItem, TemperatureUnit } from '../types/weather';
import { convertTemp, formatTemperature, formatWindSpeed } from '../utils/formatters';
import { WeatherIcon } from './WeatherIcon';

// Register Chart.js components
Chart.register(...registerables);

interface HourlyForecastProps {
  hourly: HourlyForecastItem[];
  tempUnit: TemperatureUnit;
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({ hourly, tempUnit }) => {
  const [viewMode, setViewMode] = useState<'cards' | 'chart'>('cards');
  const [selectedHour, setSelectedHour] = useState<number>(0);
  const chartCanvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  // Initialize or update Chart.js when in chart mode
  useEffect(() => {
    if (viewMode !== 'chart' || !chartCanvasRef.current || hourly.length === 0) {
      return;
    }

    const ctx = chartCanvasRef.current.getContext('2d');
    if (!ctx) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const labels = hourly.map((item) => item.formattedTime);
    const temps = hourly.map((item) => convertTemp(item.temperature, tempUnit));
    const precipProb = hourly.map((item) => item.precipitationProbability);

    const gradient = ctx.createLinearGradient(0, 0, 0, 240);
    gradient.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
    gradient.addColorStop(1, 'rgba(6, 182, 212, 0.0)');

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: `Temperature (${tempUnit === 'celsius' ? '°C' : '°F'})`,
            data: temps,
            borderColor: '#38bdf8',
            backgroundColor: gradient,
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#38bdf8',
            pointBorderColor: '#0f172a',
            pointBorderWidth: 2,
            pointRadius: 3.5,
            pointHoverRadius: 6,
            yAxisID: 'y',
          },
          {
            label: 'Precipitation Chance (%)',
            data: precipProb,
            borderColor: 'rgba(99, 102, 241, 0.6)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            borderWidth: 1.5,
            borderDash: [4, 4],
            fill: false,
            tension: 0.2,
            pointRadius: 2,
            pointHoverRadius: 5,
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: true,
            labels: {
              color: '#94a3b8',
              font: {
                family: 'Plus Jakarta Sans',
                size: 11,
              },
              boxWidth: 12,
            },
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#f8fafc',
            bodyColor: '#cbd5e1',
            borderColor: '#334155',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
          },
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(51, 65, 85, 0.3)',
            },
            ticks: {
              color: '#94a3b8',
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 8,
              font: {
                family: 'JetBrains Mono',
                size: 10,
              },
            },
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            grid: {
              color: 'rgba(51, 65, 85, 0.3)',
            },
            ticks: {
              color: '#38bdf8',
              font: {
                family: 'JetBrains Mono',
                size: 10,
              },
              callback: (val) => `${val}°`,
            },
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: {
              drawOnChartArea: false,
            },
            min: 0,
            max: 100,
            ticks: {
              color: '#818cf8',
              font: {
                family: 'JetBrains Mono',
                size: 10,
              },
              callback: (val) => `${val}%`,
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [viewMode, hourly, tempUnit]);

  if (!hourly || hourly.length === 0) {
    return null;
  }

  const activeHourData = hourly[selectedHour] || hourly[0];

  return (
    <section className="rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl p-5 sm:p-6 shadow-xl space-y-4">
      {/* Header and View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-100 tracking-tight">
            24-Hour Hourly Forecast
          </h2>
          <p className="text-xs text-slate-400">
            Real-time hourly meteorological progression and precipitation likelihood
          </p>
        </div>

        {/* View mode segmented switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-lg border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              viewMode === 'cards'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Cards</span>
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              viewMode === 'chart'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Telemetry Graph</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'cards' ? (
        <div className="space-y-4">
          {/* Horizontally scrollable 24-hour card rail */}
          <div className="flex items-stretch gap-2.5 overflow-x-auto pb-2 pt-1 scroll-smooth">
            {hourly.map((hour, idx) => {
              const isSelected = idx === selectedHour;
              return (
                <button
                  key={`hour-${hour.time}-${idx}`}
                  onClick={() => setSelectedHour(idx)}
                  className={`flex flex-col items-center justify-between min-w-[76px] p-3 rounded-xl border transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/50 border-cyan-500/70 shadow-lg shadow-cyan-950/40 scale-[1.02]'
                      : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/30 text-slate-300'
                  }`}
                >
                  <span className="text-xs font-mono text-slate-400 font-medium">
                    {idx === 0 ? 'Now' : hour.formattedTime}
                  </span>

                  <div className="my-2.5">
                    <WeatherIcon code={hour.weatherCode} isDay={hour.isDay} date={hour.time} className="w-6 h-6" />
                  </div>

                  <span className="text-base font-bold text-white font-mono tabular-nums">
                    {formatTemperature(hour.temperature, tempUnit)}
                  </span>

                  {/* Precipitation percentage indicator */}
                  <div className="mt-2 flex items-center gap-1 text-[11px] font-mono tabular-nums">
                    {hour.precipitationProbability > 0 ? (
                      <span className="text-cyan-400 flex items-center gap-0.5">
                        <Droplets className="w-2.5 h-2.5" />
                        {hour.precipitationProbability}%
                      </span>
                    ) : (
                      <span className="text-slate-600">0%</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Hour Detailed Deep Dive Banner */}
          {activeHourData && (
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-cyan-300">
                  {selectedHour === 0 ? 'Current Hour Conditions' : `Forecast for ${activeHourData.formattedTime}`}
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-300">
                  Feels like <strong className="text-white font-mono">{formatTemperature(activeHourData.apparentTemperature, tempUnit)}</strong>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-slate-400">
                <div className="flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5 text-sky-400" />
                  <span>Wind: <strong className="text-slate-200 font-mono">{formatWindSpeed(activeHourData.windSpeed, 'kmh')}</strong></span>
                </div>
                <div className="flex items-center gap-1">
                  <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Rain: <strong className="text-slate-200 font-mono">{activeHourData.precipitation} mm</strong></span>
                </div>
                <div>
                  UV: <strong className="text-slate-200 font-mono">{activeHourData.uvIndex}</strong>
                </div>
                <div>
                  Cloud: <strong className="text-slate-200 font-mono">{activeHourData.cloudCover}%</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Chart.js view */
        <div className="h-64 sm:h-72 w-full pt-2">
          <canvas ref={chartCanvasRef} />
        </div>
      )}
    </section>
  );
};
