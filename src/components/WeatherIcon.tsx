import React, { useMemo } from 'react';
import { calculateMoonPhase, MoonPhaseKey } from '../utils/moonPhase';
import { getWeatherCondition } from '../utils/weatherCodes';

interface WeatherIconProps {
  code: number;
  isDay?: boolean;
  date?: string | Date;
  className?: string;
  size?: number;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  code,
  isDay = true,
  date,
  className = 'w-6 h-6',
  size,
}) => {
  const condition = getWeatherCondition(code, isDay);
  const moonPhase = useMemo(() => calculateMoonPhase(date || new Date()), [date]);

  // Dimensions
  const dimension = size || 32;

  // Render Moon Phase SVG Disc
  const renderMoonPhase = (phaseKey: MoonPhaseKey) => {
    switch (phaseKey) {
      case 'new':
        return (
          <g>
            <circle cx="16" cy="16" r="10" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <circle cx="16" cy="16" r="10" fill="none" stroke="#6366f1" strokeWidth="0.75" opacity="0.3" />
          </g>
        );

      case 'waxing_crescent':
        return (
          <g>
            <circle cx="16" cy="16" r="10" fill="#1e293b" />
            <path
              d="M 16 6 A 10 10 0 0 1 26 16 A 10 10 0 0 1 16 26 A 6 10 0 0 0 16 6 Z"
              fill="url(#moonSilverGrad)"
            />
          </g>
        );

      case 'first_quarter':
        return (
          <g>
            <circle cx="16" cy="16" r="10" fill="#1e293b" />
            <path
              d="M 16 6 A 10 10 0 0 1 16 26 Z"
              fill="url(#moonSilverGrad)"
            />
          </g>
        );

      case 'waxing_gibbous':
        return (
          <g>
            <circle cx="16" cy="16" r="10" fill="url(#moonSilverGrad)" />
            <path
              d="M 16 6 A 6 10 0 0 1 16 26 A 10 10 0 0 1 6 16 A 10 10 0 0 1 16 6 Z"
              fill="#1e293b"
            />
          </g>
        );

      case 'full':
        return (
          <g>
            <circle cx="16" cy="16" r="10" fill="url(#moonSilverGrad)" />
            {/* Subtle lunar maria crater texture */}
            <circle cx="13" cy="13" r="2.2" fill="#cbd5e1" opacity="0.45" />
            <circle cx="19" cy="17" r="1.6" fill="#cbd5e1" opacity="0.35" />
            <circle cx="14" cy="19" r="1.2" fill="#cbd5e1" opacity="0.35" />
          </g>
        );

      case 'waning_gibbous':
        return (
          <g>
            <circle cx="16" cy="16" r="10" fill="url(#moonSilverGrad)" />
            <path
              d="M 16 6 A 6 10 0 0 0 16 26 A 10 10 0 0 0 26 16 A 10 10 0 0 0 16 6 Z"
              fill="#1e293b"
            />
          </g>
        );

      case 'last_quarter':
        return (
          <g>
            <circle cx="16" cy="16" r="10" fill="#1e293b" />
            <path
              d="M 16 6 A 10 10 0 0 0 16 26 Z"
              fill="url(#moonSilverGrad)"
            />
          </g>
        );

      case 'waning_crescent':
      default:
        return (
          <g>
            <circle cx="16" cy="16" r="10" fill="#1e293b" />
            <path
              d="M 16 6 A 10 10 0 0 0 6 16 A 10 10 0 0 0 16 26 A 6 10 0 0 1 16 6 Z"
              fill="url(#moonSilverGrad)"
            />
          </g>
        );
    }
  };

  // Select dynamic animated SVG based on condition code & day/night
  const renderDynamicSvg = () => {
    // 1. Clear Sky
    if (code === 0 || code === 1) {
      if (isDay) {
        return (
          <svg viewBox="0 0 32 32" className="w-full h-full animate-sun-pulse overflow-visible">
            <defs>
              <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="60%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            {/* Slow rotating solar rays */}
            <g className="animate-slow-spin origin-center" stroke="#fbbf24" strokeWidth="1.75" strokeLinecap="round">
              <line x1="16" y1="3" x2="16" y2="6" />
              <line x1="16" y1="26" x2="16" y2="29" />
              <line x1="3" y1="16" x2="6" y2="16" />
              <line x1="26" y1="16" x2="29" y2="16" />
              <line x1="6.8" y1="6.8" x2="8.9" y2="8.9" />
              <line x1="23.1" y1="23.1" x2="25.2" y2="25.2" />
              <line x1="6.8" y1="25.2" x2="8.9" y2="23.1" />
              <line x1="23.1" y1="8.9" x2="25.2" y2="6.8" />
            </g>
            <circle cx="16" cy="16" r="7.5" fill="url(#sunGrad)" />
          </svg>
        );
      } else {
        // Clear Night with dynamic moon phase
        return (
          <svg viewBox="0 0 32 32" className="w-full h-full animate-moon-glow overflow-visible">
            <defs>
              <linearGradient id="moonSilverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#e0e7ff" />
                <stop offset="100%" stopColor="#c7d2fe" />
              </linearGradient>
            </defs>
            {/* Stars */}
            <circle cx="6" cy="8" r="0.75" fill="#e0e7ff" opacity="0.8" />
            <circle cx="26" cy="7" r="1" fill="#e0e7ff" opacity="0.9" />
            <circle cx="27" cy="23" r="0.75" fill="#e0e7ff" opacity="0.6" />
            {renderMoonPhase(moonPhase.key)}
          </svg>
        );
      }
    }

    // 2. Partly Cloudy
    if (code === 2) {
      if (isDay) {
        return (
          <svg viewBox="0 0 32 32" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="sunGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
              <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>
            </defs>
            {/* Background Sun */}
            <g className="animate-sun-pulse origin-top-left">
              <circle cx="11" cy="11" r="6" fill="url(#sunGrad2)" />
            </g>
            {/* Foreground Drifting Cloud */}
            <path
              className="animate-cloud-drift"
              d="M10 24c-2.8 0-5-2.2-5-5 0-2.5 1.8-4.5 4.2-4.9.7-3 3.3-5.1 6.3-5.1 3.2 0 5.9 2.3 6.4 5.5 2.3.4 4.1 2.4 4.1 4.7 0 2.6-2.1 4.8-4.8 4.8H10z"
              fill="url(#cloudGrad)"
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
            />
          </svg>
        );
      } else {
        // Partly Cloudy Night (Moon Phase + Cloud)
        return (
          <svg viewBox="0 0 32 32" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="moonSilverGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#c7d2fe" />
              </linearGradient>
              <linearGradient id="nightCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
            </defs>
            {/* Background Moon */}
            <g transform="translate(-3, -3) scale(0.85)" className="animate-moon-glow">
              {renderMoonPhase(moonPhase.key)}
            </g>
            {/* Foreground Cloud */}
            <path
              className="animate-cloud-drift"
              d="M10 24c-2.8 0-5-2.2-5-5 0-2.5 1.8-4.5 4.2-4.9.7-3 3.3-5.1 6.3-5.1 3.2 0 5.9 2.3 6.4 5.5 2.3.4 4.1 2.4 4.1 4.7 0 2.6-2.1 4.8-4.8 4.8H10z"
              fill="url(#nightCloudGrad)"
              filter="drop-shadow(0 2px 6px rgba(15,23,42,0.4))"
            />
          </svg>
        );
      }
    }

    // 3. Overcast
    if (code === 3) {
      return (
        <svg viewBox="0 0 32 32" className="w-full h-full animate-cloud-drift overflow-visible">
          <defs>
            <linearGradient id="overcastGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
          </defs>
          <path
            d="M8 23c-3 0-5-2.2-5-5 0-2.5 1.8-4.6 4.3-4.9.8-3.1 3.5-5.1 6.7-5.1 3.4 0 6.3 2.3 6.8 5.6 2.5.4 4.2 2.5 4.2 5 0 2.8-2.2 4.9-5.1 4.9H8z"
            fill="url(#overcastGrad)"
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
          />
        </svg>
      );
    }

    // 4. Fog / Rime Fog (45, 48)
    if (code === 45 || code === 48) {
      return (
        <svg viewBox="0 0 32 32" className="w-full h-full overflow-visible">
          <g stroke="#2dd4bf" strokeWidth="2" strokeLinecap="round" className="animate-mist">
            <line x1="6" y1="12" x2="26" y2="12" opacity="0.85" />
            <line x1="4" y1="17" x2="28" y2="17" opacity="0.95" />
            <line x1="7" y1="22" x2="25" y2="22" opacity="0.75" />
          </g>
        </svg>
      );
    }

    // 5. Rain & Drizzle (51-67, 80-82)
    if (
      (code >= 51 && code <= 67) ||
      (code >= 80 && code <= 82)
    ) {
      return (
        <svg viewBox="0 0 32 32" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="rainCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
          </defs>
          {/* Cloud Base */}
          <path
            className="animate-cloud-drift"
            d="M8 20c-2.8 0-5-2-5-4.5 0-2.3 1.6-4.2 3.9-4.5.7-2.8 3.1-4.7 6.1-4.7 3.1 0 5.7 2.1 6.2 5.1 2.3.4 3.8 2.3 3.8 4.6 0 2.5-2 4.5-4.6 4.5H8z"
            fill="url(#rainCloudGrad)"
          />
          {/* Animated Falling Droplets */}
          <g stroke="#38bdf8" strokeWidth="1.75" strokeLinecap="round">
            <line x1="10" y1="23" x2="8" y2="28" className="animate-rain-1" />
            <line x1="16" y1="23" x2="14" y2="28" className="animate-rain-2" />
            <line x1="22" y1="23" x2="20" y2="28" className="animate-rain-3" />
          </g>
        </svg>
      );
    }

    // 6. Snow & Snow Showers (71-77, 85, 86)
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
      return (
        <svg viewBox="0 0 32 32" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="snowCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
          </defs>
          <path
            className="animate-cloud-drift"
            d="M8 20c-2.8 0-5-2-5-4.5 0-2.3 1.6-4.2 3.9-4.5.7-2.8 3.1-4.7 6.1-4.7 3.1 0 5.7 2.1 6.2 5.1 2.3.4 3.8 2.3 3.8 4.6 0 2.5-2 4.5-4.6 4.5H8z"
            fill="url(#snowCloudGrad)"
          />
          {/* Animated Snowflakes */}
          <g fill="#e0f2fe">
            <circle cx="10" cy="24" r="1.5" className="animate-snow-1" />
            <circle cx="16" cy="24" r="1.5" className="animate-snow-2" />
            <circle cx="22" cy="24" r="1.5" className="animate-snow-3" />
          </g>
        </svg>
      );
    }

    // 7. Thunderstorms (95, 96, 99)
    if (code >= 95) {
      return (
        <svg viewBox="0 0 32 32" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="thunderCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1e1b4b" />
            </linearGradient>
          </defs>
          {/* Cloud Base */}
          <path
            className="animate-cloud-drift"
            d="M8 19c-2.8 0-5-2-5-4.5 0-2.3 1.6-4.2 3.9-4.5.7-2.8 3.1-4.7 6.1-4.7 3.1 0 5.7 2.1 6.2 5.1 2.3.4 3.8 2.3 3.8 4.6 0 2.5-2 4.5-4.6 4.5H8z"
            fill="url(#thunderCloudGrad)"
          />
          {/* Lightning Flash Bolt */}
          <polygon
            points="16,17 12,23 15,23 13,29 20,21 16,21"
            fill="#c084fc"
            className="animate-lightning"
          />
        </svg>
      );
    }

    // Default Fallback
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full animate-cloud-drift">
        <path
          d="M8 22c-2.8 0-5-2.2-5-5 0-2.5 1.8-4.5 4.2-4.9.7-3 3.3-5.1 6.3-5.1 3.2 0 5.9 2.3 6.4 5.5 2.3.4 4.1 2.4 4.1 4.7 0 2.6-2.1 4.8-4.8 4.8H8z"
          fill="#94a3b8"
        />
      </svg>
    );
  };

  const titleDescription = !isDay && (code === 0 || code === 1 || code === 2)
    ? `${condition.title} (${moonPhase.name}, ${moonPhase.illuminationPct}% illuminated)`
    : condition.title;

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 animate-icon-entry transition-transform duration-200 ${className}`}
      style={{ width: dimension, height: dimension }}
      title={titleDescription}
      aria-label={titleDescription}
    >
      {renderDynamicSvg()}
    </span>
  );
};
