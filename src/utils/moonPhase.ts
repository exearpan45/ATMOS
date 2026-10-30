/**
 * High-accuracy astronomical lunar phase calculator
 * Synodic month: 29.53058867 days
 * Base astronomical epoch: 2000-01-06 18:14 UTC (Known New Moon)
 */

export type MoonPhaseKey =
  | 'new'
  | 'waxing_crescent'
  | 'first_quarter'
  | 'waxing_gibbous'
  | 'full'
  | 'waning_gibbous'
  | 'last_quarter'
  | 'waning_crescent';

export interface MoonPhaseDetails {
  key: MoonPhaseKey;
  name: string;
  fraction: number; // 0 to 1
  illuminationPct: number; // 0 to 100
  ageDays: number;
}

export function calculateMoonPhase(dateInput: Date | string = new Date()): MoonPhaseDetails {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const time = date.getTime();

  // Reference epoch: Jan 6, 2000, 18:14 UTC (Julian Day 2451549.5)
  const epoch = Date.UTC(2000, 0, 6, 18, 14, 0);
  const synodicMonthMs = 29.53058867 * 86400 * 1000;

  const diffMs = time - epoch;
  const cycles = diffMs / synodicMonthMs;
  const fraction = ((cycles % 1) + 1) % 1; // Normalize to 0..1
  const ageDays = Math.round(fraction * 29.53058867 * 10) / 10;

  // Illumination calculation based on phase angle
  const phaseAngle = fraction * 2 * Math.PI;
  const illuminationPct = Math.round(((1 - Math.cos(phaseAngle)) / 2) * 100);

  let key: MoonPhaseKey;
  let name: string;

  if (fraction < 0.03 || fraction >= 0.97) {
    key = 'new';
    name = 'New Moon';
  } else if (fraction < 0.22) {
    key = 'waxing_crescent';
    name = 'Waxing Crescent';
  } else if (fraction < 0.28) {
    key = 'first_quarter';
    name = 'First Quarter';
  } else if (fraction < 0.47) {
    key = 'waxing_gibbous';
    name = 'Waxing Gibbous';
  } else if (fraction < 0.53) {
    key = 'full';
    name = 'Full Moon';
  } else if (fraction < 0.72) {
    key = 'waning_gibbous';
    name = 'Waning Gibbous';
  } else if (fraction < 0.78) {
    key = 'last_quarter';
    name = 'Last Quarter';
  } else {
    key = 'waning_crescent';
    name = 'Waning Crescent';
  }

  return {
    key,
    name,
    fraction,
    illuminationPct,
    ageDays,
  };
}
