import { GeoLocation, TemperatureUnit, ThemeMode, WindSpeedUnit } from '../types/weather';

const STORAGE_KEYS = {
  FAVORITES: 'atmos_favorites_v1',
  HISTORY: 'atmos_search_history_v1',
  TEMP_UNIT: 'atmos_unit_temp_v1',
  WIND_UNIT: 'atmos_unit_wind_v1',
  THEME: 'atmos_theme_mode_v1',
  DEFAULT_CITY: 'atmos_default_location_v1',
};

// Saved village landmark: Pindra Durga Mandir, Hura, Purulia, West Bengal.
// Coordinates match the Google Maps pin saved for the temple (approximate map pin).
export const PINDRA_LOCATION: GeoLocation = {
  id: 23407593,
  name: 'Pindra Durga Mandir',
  latitude: 23.40719,
  longitude: 86.59276,
  country: 'India',
  country_code: 'IN',
  admin1: 'West Bengal',
  admin2: 'Purulia',
  locality: 'Pindra, Hura',
  addressLine: 'Pindra, Hura, Purulia, West Bengal 723147',
  timezone: 'Asia/Kolkata',
};

// Default initial popular cities for user discovery
export const DEFAULT_CITIES: GeoLocation[] = [
  PINDRA_LOCATION,
  {
    id: 1275339,
    name: 'Mumbai',
    latitude: 19.076,
    longitude: 72.8777,
    country: 'India',
    country_code: 'IN',
    admin1: 'Maharashtra',
    timezone: 'Asia/Kolkata',
  },
  {
    id: 5128581,
    name: 'New York',
    latitude: 40.7143,
    longitude: -74.006,
    country: 'United States',
    country_code: 'US',
    admin1: 'New York',
    timezone: 'America/New_York',
  },
  {
    id: 2643743,
    name: 'London',
    latitude: 51.5085,
    longitude: -0.1257,
    country: 'United Kingdom',
    country_code: 'GB',
    admin1: 'England',
    timezone: 'Europe/London',
  },
  {
    id: 1850147,
    name: 'Tokyo',
    latitude: 35.6895,
    longitude: 139.6917,
    country: 'Japan',
    country_code: 'JP',
    admin1: 'Tokyo',
    timezone: 'Asia/Tokyo',
  },
  {
    id: 2988507,
    name: 'Paris',
    latitude: 48.8534,
    longitude: 2.3488,
    country: 'France',
    country_code: 'FR',
    admin1: 'Île-de-France',
    timezone: 'Europe/Paris',
  },
];

export function getStoredFavorites(): GeoLocation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    if (!raw) return [DEFAULT_CITIES[0], DEFAULT_CITIES[1], DEFAULT_CITIES[2]];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => item && typeof item.latitude === 'number' && typeof item.longitude === 'number');
    }
  } catch (err) {
    console.warn('Could not read favorites from localStorage:', err);
  }
  return [DEFAULT_CITIES[0], DEFAULT_CITIES[1]];
}

export function saveFavorite(location: GeoLocation): GeoLocation[] {
  try {
    const current = getStoredFavorites();
    const exists = current.some((item) => item.id === location.id || (item.latitude === location.latitude && item.longitude === location.longitude));
    if (!exists) {
      const updated = [location, ...current];
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
      return updated;
    }
    return current;
  } catch (err) {
    console.warn('Could not save favorite to localStorage:', err);
    return getStoredFavorites();
  }
}

export function removeFavorite(locationId: number): GeoLocation[] {
  try {
    const current = getStoredFavorites();
    const updated = current.filter((item) => item.id !== locationId);
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Could not remove favorite from localStorage:', err);
    return getStoredFavorites();
  }
}

export function getStoredHistory(): GeoLocation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => item && typeof item.latitude === 'number' && typeof item.longitude === 'number');
    }
  } catch (err) {
    console.warn('Could not read history from localStorage:', err);
  }
  return [];
}

export function addToSearchHistory(location: GeoLocation): GeoLocation[] {
  try {
    const current = getStoredHistory().filter((item) => item.id !== location.id);
    const updated = [location, ...current].slice(0, 8); // Keep top 8
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Could not update history:', err);
    return [];
  }
}

export function clearSearchHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  } catch (err) {
    console.warn('Could not clear history:', err);
  }
}

export function getStoredTempUnit(): TemperatureUnit {
  try {
    const unit = localStorage.getItem(STORAGE_KEYS.TEMP_UNIT);
    if (unit === 'fahrenheit') return 'fahrenheit';
  } catch {
    // fallback
  }
  return 'celsius';
}

export function setStoredTempUnit(unit: TemperatureUnit): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TEMP_UNIT, unit);
  } catch (err) {
    console.warn('Could not save temperature unit:', err);
  }
}

export function getStoredTheme(): ThemeMode {
  try {
    const theme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (theme === 'light') return 'light';
  } catch {
    // fallback
  }
  return 'dark';
}

export function setStoredTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (err) {
    console.warn('Could not save theme:', err);
  }
}

export function getStoredDefaultCity(): GeoLocation {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DEFAULT_CITY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.latitude === 'number') return parsed;
    }
  } catch {
    // fallback
  }
  return DEFAULT_CITIES[0]; // Pindra village default for first-time visitors
}

export function setStoredDefaultCity(location: GeoLocation): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DEFAULT_CITY, JSON.stringify(location));
  } catch (err) {
    console.warn('Could not save default city:', err);
  }
}
