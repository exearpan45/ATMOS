export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindSpeedUnit = 'kmh' | 'mph' | 'ms';
export type ThemeMode = 'dark' | 'light';

export interface GeoLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  country_code?: string;
  country?: string;
  admin1?: string; // State or province
  admin2?: string;
  timezone: string;
  population?: number;
  accuracyMeters?: number; // Pinpoint GPS accuracy in meters
  locality?: string;
  suburb?: string;
  addressLine?: string;
  isGpsLocated?: boolean;
}

export interface CurrentWeatherState {
  time: string;
  temperature: number;
  apparentTemperature: number;
  isDay: boolean;
  precipitation: number;
  rain: number;
  showers: number;
  snowfall: number;
  weatherCode: number;
  cloudCover: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  relativeHumidity: number;
}

export interface HourlyForecastItem {
  time: string; // ISO string
  formattedTime: string;
  temperature: number;
  apparentTemperature: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  pressure: number;
  cloudCover: number;
  visibility: number; // in meters
  windSpeed: number;
  windDirection: number;
  uvIndex: number;
  isDay: boolean;
}

export interface DailyForecastItem {
  date: string;
  dayName: string;
  formattedDate: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  apparentTempMax: number;
  apparentTempMin: number;
  sunrise: string;
  sunset: string;
  daylightDuration: number; // in seconds
  uvIndexMax: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  windSpeedMax: number;
  windGustsMax: number;
  windDirectionDominant: number;
}

export interface AirQualityData {
  europeanAqi?: number;
  usAqi?: number;
  pm25?: number;
  pm10?: number;
  no2?: number;
  o3?: number;
  so2?: number;
  co?: number;
  category: {
    label: string;
    description: string;
    colorClass: string;
    bgClass: string;
    borderClass: string;
  };
}

export type AlertSeverity = 'extreme' | 'severe' | 'moderate' | 'minor';

export interface WeatherAlert {
  id: string;
  headline: string;
  event: string;
  severity: AlertSeverity;
  urgency: 'Immediate' | 'Expected' | 'Future';
  description: string;
  instruction?: string;
  source: string;
  effective: string;
  expires: string;
}

export interface WeatherData {
  location: GeoLocation;
  current: CurrentWeatherState;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  airQuality?: AirQualityData;
  alerts?: WeatherAlert[];
  timezone: string;
  utcOffsetSeconds: number;
  lastUpdated: string;
}

export interface WeatherConditionInfo {
  code: number;
  title: string;
  description: string;
  iconName: string;
  backgroundGradient: string;
  badgeColor: string;
  isPrecipitating: boolean;
}
