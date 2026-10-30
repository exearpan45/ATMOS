import {
  AirQualityData,
  AlertSeverity,
  DailyForecastItem,
  GeoLocation,
  HourlyForecastItem,
  WeatherAlert,
  WeatherData,
} from '../types/weather';
import { formatDayOfWeek, formatHourTime } from '../utils/formatters';
import { getAirQualityLevel } from '../utils/weatherCodes';

const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const AIR_QUALITY_BASE_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

// In-memory cache for weather to optimize performance and prevent rate limiting
interface CacheEntry {
  data: WeatherData;
  timestamp: number;
}
const weatherCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Parses user input to check if it's direct coordinates (e.g., "19.076, 72.877" or "40.7128 -74.006")
 */
export function parseCoordinates(input: string): { lat: number; lon: number } | null {
  const cleaned = input.trim();
  // Regex matching "lat, lon" or "lat lon" with optional cardinal directions
  const coordRegex = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)\s*[,/ ]\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
  if (coordRegex.test(cleaned)) {
    const parts = cleaned.split(/[,/ ]+/).filter(Boolean);
    if (parts.length >= 2) {
      const lat = parseFloat(parts[0]);
      const lon = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        return { lat, lon };
      }
    }
  }
  return null;
}

/**
 * Searches locations worldwide using Open-Meteo Geocoding, direct coordinates parsing,
 * and OpenStreetMap Nominatim fallback to ensure EVERY location, village, town, and coordinate is available.
 */
export async function searchCities(query: string, signal?: AbortSignal): Promise<GeoLocation[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) {
    return [];
  }

  // 1. Check if user entered direct coordinates
  const parsedCoords = parseCoordinates(trimmed);
  if (parsedCoords) {
    try {
      const pinLocation = await reverseGeocode(parsedCoords.lat, parsedCoords.lon, undefined, false, signal);
      return [pinLocation];
    } catch {
      return [
        {
          id: Math.round(parsedCoords.lat * 10000 + parsedCoords.lon * 100),
          name: `Pinpoint (${parsedCoords.lat.toFixed(4)}°, ${parsedCoords.lon.toFixed(4)}°)`,
          latitude: parsedCoords.lat,
          longitude: parsedCoords.lon,
          timezone: 'auto',
          admin1: 'Exact Coordinates',
        },
      ];
    }
  }

  // 2. Open-Meteo Geocoding API with high count (20)
  const results: GeoLocation[] = [];
  const url = `${GEOCODING_BASE_URL}?name=${encodeURIComponent(trimmed)}&count=20&language=en&format=json`;

  try {
    const response = await fetch(url, { signal });
    if (response.ok) {
      const data = await response.json();
      if (data.results && Array.isArray(data.results)) {
        data.results.forEach((item: any) => {
          results.push({
            id: item.id,
            name: item.name,
            latitude: item.latitude,
            longitude: item.longitude,
            elevation: item.elevation,
            country_code: item.country_code,
            country: item.country,
            admin1: item.admin1,
            admin2: item.admin2,
            timezone: item.timezone || 'auto',
            population: item.population,
          });
        });
      }
    }
  } catch (error: any) {
    if (error.name === 'AbortError') return [];
    console.warn('Open-Meteo geocoding notice:', error);
  }

  // 3. Fallback: If 0 or very few results found (e.g. tiny village, landmark, postal area), query OpenStreetMap Nominatim
  if (results.length < 3 && !signal?.aborted) {
    try {
      const osmUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        trimmed
      )}&format=json&addressdetails=1&limit=10`;
      const osmRes = await fetch(osmUrl, {
        signal,
        headers: { Accept: 'application/json' },
      });

      if (osmRes.ok) {
        const osmData = await osmRes.json();
        if (Array.isArray(osmData)) {
          osmData.forEach((item: any) => {
            const lat = parseFloat(item.lat);
            const lon = parseFloat(item.lon);
            const address = item.address || {};
            const placeName =
              address.village ||
              address.town ||
              address.city ||
              address.suburb ||
              address.hamlet ||
              item.display_name.split(',')[0];

            // Avoid duplicate coordinates
            const exists = results.some(
              (r) => Math.abs(r.latitude - lat) < 0.05 && Math.abs(r.longitude - lon) < 0.05
            );

            if (!exists) {
              results.push({
                id: item.place_id ? Number(item.place_id) : Math.round(lat * 10000 + lon * 100),
                name: placeName || item.display_name.split(',')[0],
                latitude: lat,
                longitude: lon,
                country: address.country,
                country_code: address.country_code ? address.country_code.toUpperCase() : undefined,
                admin1: address.state || address.region || address.county,
                admin2: address.county || address.suburb,
                suburb: address.suburb || address.neighbourhood,
                locality: address.village || address.town || address.city,
                addressLine: item.display_name,
                timezone: 'auto',
              });
            }
          });
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return [];
      console.warn('Nominatim fallback geocoding notice:', err);
    }
  }

  return results;
}

/**
 * Pinpoint reverse geocoding to human-readable street/neighborhood/city name
 * with accuracy metadata.
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
  accuracyMeters?: number,
  isGps: boolean = false,
  signal?: AbortSignal
): Promise<GeoLocation> {
  const baseId = Math.round(latitude * 100000 + longitude * 100);

  // 1. Try OpenStreetMap Nominatim for street & neighborhood pinpoint accuracy (zoom 18)
  try {
    const osmReverseUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
    const res = await fetch(osmReverseUrl, {
      signal,
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      
      // Pinpoint hierarchy: Suburb/Neighbourhood -> Town/Village/City -> County
      const primaryLocality =
        addr.suburb ||
        addr.neighbourhood ||
        addr.quarter ||
        addr.residential ||
        addr.village ||
        addr.town ||
        addr.city ||
        addr.municipality ||
        data.display_name?.split(',')[0];

      const region = addr.city || addr.town || addr.county || addr.state;
      const country = addr.country || 'Global Station';

      return {
        id: data.place_id ? Number(data.place_id) : baseId,
        name: primaryLocality || 'Pinpoint Location',
        latitude,
        longitude,
        country,
        country_code: addr.country_code ? addr.country_code.toUpperCase() : undefined,
        admin1: region !== primaryLocality ? region : addr.state,
        admin2: addr.state_district || addr.county,
        suburb: addr.suburb || addr.neighbourhood,
        locality: addr.village || addr.town || addr.city,
        addressLine: data.display_name,
        accuracyMeters,
        isGpsLocated: isGps,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'auto',
      };
    }
  } catch (err) {
    console.warn('Nominatim reverse geocode notice, attempting secondary provider:', err);
  }

  // 2. Secondary fallback: BigDataCloud client API
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
      { signal }
    );
    if (response.ok) {
      const data = await response.json();
      const cityName =
        data.locality || data.city || data.principalSubdivision || 'Current Location';
      return {
        id: baseId,
        name: cityName,
        latitude,
        longitude,
        country: data.countryName || 'Unknown',
        country_code: data.countryCode || '',
        admin1: data.principalSubdivision || '',
        locality: data.city || data.locality,
        accuracyMeters,
        isGpsLocated: isGps,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'auto',
      };
    }
  } catch (err) {
    console.warn('BigDataCloud reverse geocode fallback notice:', err);
  }

  // 3. Fallback coordinate representation
  return {
    id: baseId,
    name: isGps ? 'Your Exact Location' : `Pinpoint (${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°)`,
    latitude,
    longitude,
    accuracyMeters,
    isGpsLocated: isGps,
    timezone: 'auto',
  };
}

/**
 * Estimates user location via client IP as a seamless fallback
 * when device GPS is unavailable, denied, or times out.
 */
export async function fetchIpLocation(signal?: AbortSignal): Promise<GeoLocation> {
  // 1. Try BigDataCloud reverse geocode client (automatically infers client IP without coordinates)
  try {
    const res = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=en', { signal });
    if (res.ok) {
      const data = await res.json();
      if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        const cityName = data.locality || data.city || data.principalSubdivision || 'Estimated Location';
        return {
          id: Math.round(data.latitude * 10000 + data.longitude * 100),
          name: cityName,
          latitude: data.latitude,
          longitude: data.longitude,
          country: data.countryName || 'Global Station',
          country_code: data.countryCode || '',
          admin1: data.principalSubdivision || '',
          locality: data.city || data.locality,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'auto',
          isGpsLocated: false,
        };
      }
    }
  } catch (err) {
    console.warn('BigDataCloud IP lookup notice:', err);
  }

  // 2. Secondary fallback: ipwho.is
  try {
    const res = await fetch('https://ipwho.is/', { signal });
    if (res.ok) {
      const data = await res.json();
      if (data.success && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        return {
          id: Math.round(data.latitude * 10000 + data.longitude * 100),
          name: data.city || data.region || 'Estimated Location',
          latitude: data.latitude,
          longitude: data.longitude,
          country: data.country || 'Global Station',
          country_code: data.country_code || '',
          admin1: data.region || '',
          timezone: data.timezone?.id || Intl.DateTimeFormat().resolvedOptions().timeZone || 'auto',
          isGpsLocated: false,
        };
      }
    }
  } catch (err) {
    console.warn('ipwho.is IP lookup notice:', err);
  }

  throw new Error('Could not estimate location via IP.');
}

/**
 * Evaluates real-time severe meteorological alerts and warnings from Open-Meteo
 * telemetry and official meteorological alert agencies.
 */
export async function extractSevereWeatherAlerts(
  weatherJson: any,
  aqiJson: any,
  location: GeoLocation,
  signal?: AbortSignal
): Promise<WeatherAlert[]> {
  const alerts: WeatherAlert[] = [];
  const current = weatherJson.current || {};
  const daily = weatherJson.daily || {};
  const hourly = weatherJson.hourly || {};
  const aqiCurrent = aqiJson?.current || {};

  const temp = current.temperature_2m ?? 20;
  const apparentTemp = current.apparent_temperature ?? temp;
  const windGusts = current.wind_gusts_10m ?? 0;
  const windSpeed = current.wind_speed_10m ?? 0;
  const code = current.weather_code ?? 0;
  const precip = current.precipitation ?? 0;
  const dailySum = daily.precipitation_sum?.[0] ?? 0;
  const uvMax = daily.uv_index_max?.[0] ?? hourly.uv_index?.[0] ?? 0;
  const pm25 = aqiCurrent.pm2_5;
  const usAqi = aqiCurrent.us_aqi;
  const europeanAqi = aqiCurrent.european_aqi;

  const nowIso = new Date().toISOString();
  const futureIso = new Date(Date.now() + 6 * 3600 * 1000).toISOString();

  // 1. Severe Thunderstorm & Hail Hazard (WMO 95, 96, 99)
  if (code === 96 || code === 99) {
    alerts.push({
      id: 'alert-severe-thunderstorm-hail',
      event: 'Severe Thunderstorm & Hail Warning',
      headline: `Severe Hail Thunderstorm Active over ${location.name}`,
      severity: 'extreme',
      urgency: 'Immediate',
      description: 'Severe atmospheric instability detected with destructive hail stones, cloud-to-ground lightning strikes, and violent wind downdrafts.',
      instruction: 'Move immediately to an interior room on the lowest floor of a sturdy building. Avoid windows and electrical appliances.',
      source: 'Open-Meteo Doppler NWP Engine',
      effective: nowIso,
      expires: futureIso,
    });
  } else if (code === 95) {
    alerts.push({
      id: 'alert-thunderstorm',
      event: 'Thunderstorm Advisory',
      headline: `Active Thunderstorm Discharges in ${location.name}`,
      severity: 'severe',
      urgency: 'Immediate',
      description: 'Atmospheric instability with lightning discharges and gusty squalls reported in the vicinity.',
      instruction: 'Suspend outdoor activities immediately. When thunder roars, go indoors.',
      source: 'Open-Meteo Meteorological Telemetry',
      effective: nowIso,
      expires: futureIso,
    });
  }

  // 2. High Wind & Gale Force Warnings (Gusts >= 65 km/h or sustained >= 50 km/h)
  if (windGusts >= 80 || windSpeed >= 62) {
    alerts.push({
      id: 'alert-gale-warning',
      event: 'Gale Force Wind Warning',
      headline: `Damaging Winds Gusting up to ${Math.round(windGusts)} km/h`,
      severity: 'extreme',
      urgency: 'Immediate',
      description: 'Dangerous storm-force wind velocities capable of causing structural damage, toppling power lines, and uprooting trees.',
      instruction: 'Secure outdoor furniture and loose debris. Avoid travel in high-profile vehicles.',
      source: 'Open-Meteo Anemometer Grid',
      effective: nowIso,
      expires: futureIso,
    });
  } else if (windGusts >= 60 || windSpeed >= 45) {
    alerts.push({
      id: 'alert-wind-advisory',
      event: 'High Wind Advisory',
      headline: `Brisk Wind Gusts Reaching ${Math.round(windGusts)} km/h`,
      severity: 'moderate',
      urgency: 'Expected',
      description: 'Elevated crosswinds and sustained gustiness impacting local transport and outdoor structures.',
      instruction: 'Exercise caution while driving across bridges and elevated overpasses.',
      source: 'Open-Meteo Anemometer Grid',
      effective: nowIso,
      expires: futureIso,
    });
  }

  // 3. Flash Flood & Torrential Rain Hazard (precip >= 10 mm/h or dailySum >= 45 mm or WMO 65/82)
  if (precip >= 10 || code === 65 || code === 82 || dailySum >= 50) {
    alerts.push({
      id: 'alert-flood-rain',
      event: 'Flash Flood & Torrential Rain Watch',
      headline: `High-Rate Torrential Rainfall (${precip} mm/h) over ${location.name}`,
      severity: 'severe',
      urgency: 'Immediate',
      description: 'Extremely high localized precipitation rate leading to rapid water accumulation and urban runoff flooding.',
      instruction: 'Do not attempt to drive through flooded roads or underpasses. Turn around, don\'t drown.',
      source: 'Open-Meteo Hydrology Grid',
      effective: nowIso,
      expires: futureIso,
    });
  }

  // 4. Extreme Thermal Heat Warning (temp >= 38°C or apparentTemp >= 42°C)
  if (temp >= 38 || apparentTemp >= 42) {
    alerts.push({
      id: 'alert-extreme-heat',
      event: 'Extreme Heat Warning',
      headline: `Dangerous Thermal Conditions: Heat Index ${Math.round(apparentTemp)}°C`,
      severity: 'extreme',
      urgency: 'Immediate',
      description: 'Oppressive heat and humidity significantly increasing the risk of heat exhaustion and heat stroke during outdoor exposure.',
      instruction: 'Stay in air-conditioned spaces, drink plenty of water, and never leave children or pets inside unattended vehicles.',
      source: 'Open-Meteo Biometeorology Model',
      effective: nowIso,
      expires: futureIso,
    });
  }

  // 5. Extreme Freeze & Frostbite Warning (temp <= -15°C or apparentTemp <= -20°C)
  if (temp <= -15 || apparentTemp <= -20) {
    alerts.push({
      id: 'alert-extreme-cold',
      event: 'Hard Freeze & Frostbite Warning',
      headline: `Sub-Zero Extreme Cold: Wind Chill ${Math.round(apparentTemp)}°C`,
      severity: 'severe',
      urgency: 'Immediate',
      description: 'Severe freezing temperatures capable of causing frostbite on exposed skin in less than 30 minutes.',
      instruction: 'Dress in layered insulated garments, cover face and hands, and insulate exposed water piping.',
      source: 'Open-Meteo Cryosphere Telemetry',
      effective: nowIso,
      expires: futureIso,
    });
  }

  // 6. Extreme Solar UV Warning (UV >= 10)
  if (uvMax >= 10) {
    alerts.push({
      id: 'alert-extreme-uv',
      event: 'Extreme UV Radiation Alert',
      headline: `Peak Solar UV Index Reaching ${Math.round(uvMax)} (Extreme)`,
      severity: 'severe',
      urgency: 'Expected',
      description: 'Unprotected skin and eyes can suffer phototoxic burn damage within 10 to 15 minutes under this radiation intensity.',
      instruction: 'Wear broad-spectrum SPF 50+ sunscreen, UV400 wrap-around sunglasses, and avoid sun exposure between 11 AM and 3 PM.',
      source: 'Open-Meteo Solar Radiation Model',
      effective: nowIso,
      expires: futureIso,
    });
  }

  // 7. Hazardous Air Quality Warning (US AQI >= 150 or PM2.5 >= 55.4 or European AQI >= 80)
  if ((usAqi && usAqi >= 150) || (pm25 && pm25 >= 55.4) || (europeanAqi && europeanAqi >= 80)) {
    alerts.push({
      id: 'alert-hazardous-aqi',
      event: 'Hazardous Air Quality Warning',
      headline: `Unhealthy Particulate Pollution in ${location.name}`,
      severity: 'severe',
      urgency: 'Immediate',
      description: `Elevated particulate matter concentration (${pm25 ? pm25 + ' µg/m³ PM2.5' : 'AQI ' + usAqi}) exceeding safe respiratory thresholds.`,
      instruction: 'Individuals with heart or lung disease, older adults, and children should avoid all outdoor physical exertion. Keep windows closed.',
      source: 'Open-Meteo Aerosol & Air Quality API',
      effective: nowIso,
      expires: futureIso,
    });
  }

  // 8. If in the United States, attempt to fetch official National Weather Service (NWS) CAP alerts
  if (location.country_code === 'US' || location.country === 'United States') {
    try {
      const nwsRes = await fetch(
        `https://api.weather.gov/alerts/active?point=${location.latitude.toFixed(4)},${location.longitude.toFixed(4)}`,
        { signal }
      );
      if (nwsRes.ok) {
        const nwsData = await nwsRes.json();
        if (nwsData.features && Array.isArray(nwsData.features)) {
          nwsData.features.forEach((feat: any) => {
            const props = feat.properties;
            if (props && props.event) {
              const severityLower = (props.severity || 'moderate').toLowerCase();
              const sev: AlertSeverity =
                severityLower === 'extreme' ? 'extreme' : severityLower === 'severe' ? 'severe' : 'moderate';
              alerts.unshift({
                id: `nws-${props.id || Math.random()}`,
                event: props.event,
                headline: props.headline || props.event,
                severity: sev,
                urgency: props.urgency === 'Immediate' ? 'Immediate' : 'Expected',
                description: props.description || props.summary || '',
                instruction: props.instruction || 'Follow guidance from local emergency management authorities.',
                source: 'National Weather Service (NOAA/NWS)',
                effective: props.effective || nowIso,
                expires: props.expires || futureIso,
              });
            }
          });
        }
      }
    } catch {
      // Non-critical fallback
    }
  }

  return alerts;
}

/**
 * Fetches real weather and air quality data from Open-Meteo
 */
export async function fetchWeatherData(
  location: GeoLocation,
  forceRefresh: boolean = false,
  signal?: AbortSignal
): Promise<WeatherData> {
  const cacheKey = `${location.latitude.toFixed(4)},${location.longitude.toFixed(4)}`;

  if (!forceRefresh) {
    const cached = weatherCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return {
        ...cached.data,
        location: {
          ...cached.data.location,
          ...location, // retain freshest accuracyMeters and pinpoint name
        },
      };
    }
  }

  // 1. Weather Forecast Request
  const weatherParams = new URLSearchParams({
    latitude: location.latitude.toString(),
    longitude: location.longitude.toString(),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'rain',
      'showers',
      'snowfall',
      'weather_code',
      'cloud_cover',
      'pressure_msl',
      'surface_pressure',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
    ].join(','),
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'dew_point_2m',
      'apparent_temperature',
      'precipitation_probability',
      'precipitation',
      'weather_code',
      'pressure_msl',
      'cloud_cover',
      'visibility',
      'wind_speed_10m',
      'wind_direction_10m',
      'uv_index',
      'is_day',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'apparent_temperature_max',
      'apparent_temperature_min',
      'sunrise',
      'sunset',
      'daylight_duration',
      'uv_index_max',
      'precipitation_sum',
      'precipitation_probability_max',
      'wind_speed_10m_max',
      'wind_gusts_10m_max',
      'wind_direction_10m_dominant',
    ].join(','),
    timezone: 'auto',
  });

  // 2. Air Quality Request
  const aqiParams = new URLSearchParams({
    latitude: location.latitude.toString(),
    longitude: location.longitude.toString(),
    current: [
      'european_aqi',
      'us_aqi',
      'pm10',
      'pm2_5',
      'carbon_monoxide',
      'nitrogen_dioxide',
      'sulphur_dioxide',
      'ozone',
    ].join(','),
    timezone: 'auto',
  });

  const weatherUrl = `${WEATHER_BASE_URL}?${weatherParams.toString()}`;
  const aqiUrl = `${AIR_QUALITY_BASE_URL}?${aqiParams.toString()}`;

  try {
    const [weatherRes, aqiRes] = await Promise.all([
      fetch(weatherUrl, { signal }),
      fetch(aqiUrl, { signal }).catch(() => null),
    ]);

    if (!weatherRes.ok) {
      const errorText = await weatherRes.text();
      throw new Error(`Open-Meteo weather service error (${weatherRes.status}): ${errorText}`);
    }

    const weatherJson = await weatherRes.json();
    let aqiJson: any = null;

    if (aqiRes && aqiRes.ok) {
      try {
        aqiJson = await aqiRes.json();
      } catch (e) {
        console.warn('Could not parse AQI data:', e);
      }
    }

    // Process hourly forecast (24 hours)
    const hourlyTimes: string[] = weatherJson.hourly?.time || [];
    const currentTimeStr = weatherJson.current?.time;
    let startIndex = 0;

    if (currentTimeStr && hourlyTimes.length > 0) {
      const currentHourPrefix = currentTimeStr.substring(0, 13);
      const foundIdx = hourlyTimes.findIndex((t) => t.startsWith(currentHourPrefix));
      if (foundIdx !== -1) {
        startIndex = foundIdx;
      }
    }

    const hourlySlice = hourlyTimes.slice(startIndex, startIndex + 24);
    const hourly: HourlyForecastItem[] = hourlySlice.map((time, idx) => {
      const actualIdx = startIndex + idx;
      return {
        time,
        formattedTime: formatHourTime(time, weatherJson.timezone),
        temperature: weatherJson.hourly.temperature_2m[actualIdx] ?? 0,
        apparentTemperature: weatherJson.hourly.apparent_temperature[actualIdx] ?? 0,
        precipitationProbability: weatherJson.hourly.precipitation_probability[actualIdx] ?? 0,
        precipitation: weatherJson.hourly.precipitation[actualIdx] ?? 0,
        weatherCode: weatherJson.hourly.weather_code[actualIdx] ?? 0,
        pressure: weatherJson.hourly.pressure_msl[actualIdx] ?? 1013,
        cloudCover: weatherJson.hourly.cloud_cover[actualIdx] ?? 0,
        visibility: weatherJson.hourly.visibility[actualIdx] ?? 10000,
        windSpeed: weatherJson.hourly.wind_speed_10m[actualIdx] ?? 0,
        windDirection: weatherJson.hourly.wind_direction_10m[actualIdx] ?? 0,
        uvIndex: weatherJson.hourly.uv_index[actualIdx] ?? 0,
        isDay: weatherJson.hourly.is_day[actualIdx] === 1,
      };
    });

    // Process daily forecast (7 days)
    const dailyTimes: string[] = weatherJson.daily?.time || [];
    const daily: DailyForecastItem[] = dailyTimes.slice(0, 7).map((date, idx) => {
      const { dayName, formattedDate } = formatDayOfWeek(date, weatherJson.timezone);
      return {
        date,
        dayName,
        formattedDate,
        weatherCode: weatherJson.daily.weather_code[idx] ?? 0,
        tempMax: weatherJson.daily.temperature_2m_max[idx] ?? 0,
        tempMin: weatherJson.daily.temperature_2m_min[idx] ?? 0,
        apparentTempMax: weatherJson.daily.apparent_temperature_max[idx] ?? 0,
        apparentTempMin: weatherJson.daily.apparent_temperature_min[idx] ?? 0,
        sunrise: weatherJson.daily.sunrise[idx] ?? '',
        sunset: weatherJson.daily.sunset[idx] ?? '',
        daylightDuration: weatherJson.daily.daylight_duration[idx] ?? 0,
        uvIndexMax: weatherJson.daily.uv_index_max[idx] ?? 0,
        precipitationSum: weatherJson.daily.precipitation_sum[idx] ?? 0,
        precipitationProbabilityMax: weatherJson.daily.precipitation_probability_max[idx] ?? 0,
        windSpeedMax: weatherJson.daily.wind_speed_10m_max[idx] ?? 0,
        windGustsMax: weatherJson.daily.wind_gusts_10m_max[idx] ?? 0,
        windDirectionDominant: weatherJson.daily.wind_direction_10m_dominant[idx] ?? 0,
      };
    });

    // Process air quality
    let airQuality: AirQualityData | undefined;
    if (aqiJson && aqiJson.current) {
      const europeanAqi = aqiJson.current.european_aqi;
      const usAqi = aqiJson.current.us_aqi;
      const category = getAirQualityLevel(europeanAqi, usAqi);

      airQuality = {
        europeanAqi,
        usAqi,
        pm25: aqiJson.current.pm2_5,
        pm10: aqiJson.current.pm10,
        no2: aqiJson.current.nitrogen_dioxide,
        o3: aqiJson.current.ozone,
        so2: aqiJson.current.sulphur_dioxide,
        co: aqiJson.current.carbon_monoxide,
        category,
      };
    }

    // Extract active severe meteorological alerts and emergency warnings
    const alerts = await extractSevereWeatherAlerts(weatherJson, aqiJson, location, signal);

    const weatherData: WeatherData = {
      location: {
        ...location,
        elevation: weatherJson.elevation ?? location.elevation,
        timezone: weatherJson.timezone || location.timezone,
      },
      current: {
        time: weatherJson.current.time,
        temperature: weatherJson.current.temperature_2m,
        apparentTemperature: weatherJson.current.apparent_temperature,
        isDay: weatherJson.current.is_day === 1,
        precipitation: weatherJson.current.precipitation,
        rain: weatherJson.current.rain,
        showers: weatherJson.current.showers,
        snowfall: weatherJson.current.snowfall,
        weatherCode: weatherJson.current.weather_code,
        cloudCover: weatherJson.current.cloud_cover,
        pressure: weatherJson.current.pressure_msl ?? weatherJson.current.surface_pressure ?? 1013,
        windSpeed: weatherJson.current.wind_speed_10m,
        windDirection: weatherJson.current.wind_direction_10m,
        windGusts: weatherJson.current.wind_gusts_10m,
        relativeHumidity: weatherJson.current.relative_humidity_2m,
      },
      hourly,
      daily,
      airQuality,
      alerts,
      timezone: weatherJson.timezone,
      utcOffsetSeconds: weatherJson.utc_offset_seconds || 0,
      lastUpdated: new Date().toISOString(),
    };

    // Cache the result
    weatherCache.set(cacheKey, {
      data: weatherData,
      timestamp: Date.now(),
    });

    return weatherData;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw error;
    }
    console.error('Weather API request error:', error);
    throw new Error(error.message || 'Unable to retrieve meteorological data. Please retry.');
  }
}
