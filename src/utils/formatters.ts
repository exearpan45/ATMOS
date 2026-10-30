import { TemperatureUnit, WindSpeedUnit } from '../types/weather';

/**
 * Converts Celsius to Fahrenheit if selected
 */
export function formatTemperature(celsius: number, unit: TemperatureUnit): string {
  if (celsius === undefined || celsius === null || isNaN(celsius)) return '--';
  if (unit === 'fahrenheit') {
    const f = (celsius * 9) / 5 + 32;
    return `${Math.round(f)}°`;
  }
  return `${Math.round(celsius)}°`;
}

/**
 * Returns exact value for tooltips or calculations
 */
export function convertTemp(celsius: number, unit: TemperatureUnit): number {
  if (unit === 'fahrenheit') {
    return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
  }
  return Math.round(celsius * 10) / 10;
}

/**
 * Formats wind speed based on user preference
 */
export function formatWindSpeed(kmh: number, unit: WindSpeedUnit = 'kmh'): string {
  if (kmh === undefined || kmh === null || isNaN(kmh)) return '--';
  if (unit === 'mph') {
    const mph = kmh * 0.621371;
    return `${Math.round(mph)} mph`;
  }
  if (unit === 'ms') {
    const ms = kmh / 3.6;
    return `${Math.round(ms * 10) / 10} m/s`;
  }
  return `${Math.round(kmh)} km/h`;
}

/**
 * Formats time string (ISO 8601) into clean local time (e.g., "14:00" or "2:00 PM")
 */
export function formatHourTime(isoString: string, timezone?: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone,
    }).format(date);
  } catch {
    // fallback extraction from YYYY-MM-DDTHH:MM
    const parts = isoString.split('T');
    if (parts.length > 1) {
      return parts[1].substring(0, 5);
    }
    return isoString;
  }
}

/**
 * Formats daily date to short day of week ("Mon", "Tue", etc.) and month/day
 */
export function formatDayOfWeek(dateString: string, timezone?: string): { dayName: string; formattedDate: string; isToday: boolean } {
  try {
    const date = new Date(dateString + 'T12:00:00');
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    const dayName = isToday ? 'Today' : new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: timezone }).format(date);
    const formattedDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: timezone }).format(date);

    return { dayName, formattedDate, isToday };
  } catch {
    return { dayName: dateString, formattedDate: dateString, isToday: false };
  }
}

/**
 * Formats ISO timestamp to full time and date
 */
export function formatFullTimestamp(isoString: string, timezone?: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: timezone,
    }).format(date);
  } catch {
    return isoString;
  }
}

/**
 * Formats daylight duration (seconds to "12h 45m")
 */
export function formatDaylight(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '--';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}
