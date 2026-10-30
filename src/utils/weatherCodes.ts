import { WeatherConditionInfo } from '../types/weather';

/**
 * Maps WMO Weather interpretation codes (0-99) to clean condition metadata,
 * icons, and background mood gradients.
 */
export function getWeatherCondition(code: number, isDay: boolean = true): WeatherConditionInfo {
  switch (code) {
    case 0:
      return {
        code,
        title: isDay ? 'Clear Sky' : 'Clear Night',
        description: isDay ? 'Sun shining with zero cloud obstruction' : 'Starlit and unobstructed clear skies',
        iconName: isDay ? 'Sun' : 'Moon',
        backgroundGradient: isDay
          ? 'from-sky-500/20 via-blue-600/10 to-indigo-950/40'
          : 'from-slate-900 via-indigo-950/50 to-slate-950',
        badgeColor: 'text-amber-400',
        isPrecipitating: false,
      };

    case 1:
      return {
        code,
        title: isDay ? 'Mainly Sunny' : 'Mainly Clear',
        description: 'Vast open skies with occasional wisps of clouds',
        iconName: isDay ? 'SunMedium' : 'MoonStar',
        backgroundGradient: isDay
          ? 'from-sky-500/20 via-cyan-600/10 to-slate-900/40'
          : 'from-slate-900 via-slate-950 to-slate-950',
        badgeColor: 'text-amber-300',
        isPrecipitating: false,
      };

    case 2:
      return {
        code,
        title: 'Partly Cloudy',
        description: 'Sun and clouds interchanging throughout the day',
        iconName: isDay ? 'CloudSun' : 'CloudMoon',
        backgroundGradient: isDay
          ? 'from-blue-600/20 via-slate-700/10 to-slate-900/40'
          : 'from-slate-900 via-indigo-950/40 to-slate-950',
        badgeColor: 'text-sky-300',
        isPrecipitating: false,
      };

    case 3:
      return {
        code,
        title: 'Overcast',
        description: 'Dense cloud ceiling blocking direct sunlight',
        iconName: 'Cloud',
        backgroundGradient: 'from-slate-700/25 via-slate-800/20 to-slate-950',
        badgeColor: 'text-slate-300',
        isPrecipitating: false,
      };

    case 45:
    case 48:
      return {
        code,
        title: code === 48 ? 'Rime Fog' : 'Dense Fog',
        description: 'Reduced atmospheric visibility due to low-level condensation',
        iconName: 'CloudFog',
        backgroundGradient: 'from-teal-800/20 via-slate-800/30 to-slate-950',
        badgeColor: 'text-teal-300',
        isPrecipitating: false,
      };

    case 51:
    case 53:
    case 55:
      return {
        code,
        title: code === 51 ? 'Light Drizzle' : code === 53 ? 'Moderate Drizzle' : 'Heavy Drizzle',
        description: 'Gentle fine mist and light water droplets',
        iconName: 'CloudDrizzle',
        backgroundGradient: 'from-cyan-800/25 via-slate-800/30 to-slate-950',
        badgeColor: 'text-cyan-300',
        isPrecipitating: true,
      };

    case 56:
    case 57:
      return {
        code,
        title: 'Freezing Drizzle',
        description: 'Sub-zero drizzle freezing upon ground impact',
        iconName: 'CloudSnow',
        backgroundGradient: 'from-cyan-900/30 via-slate-900 to-slate-950',
        badgeColor: 'text-cyan-200',
        isPrecipitating: true,
      };

    case 61:
      return {
        code,
        title: 'Light Rain',
        description: 'Mild scattered rainfall',
        iconName: 'CloudRain',
        backgroundGradient: 'from-blue-800/25 via-slate-800/20 to-slate-950',
        badgeColor: 'text-blue-300',
        isPrecipitating: true,
      };

    case 63:
      return {
        code,
        title: 'Moderate Rain',
        description: 'Steady consistent downpour across the region',
        iconName: 'CloudRain',
        backgroundGradient: 'from-blue-900/30 via-slate-900 to-slate-950',
        badgeColor: 'text-blue-400',
        isPrecipitating: true,
      };

    case 65:
      return {
        code,
        title: 'Heavy Rain',
        description: 'Intense torrential rainfall with high precipitation rate',
        iconName: 'CloudRainWind',
        backgroundGradient: 'from-indigo-950/40 via-blue-950/40 to-slate-950',
        badgeColor: 'text-blue-400',
        isPrecipitating: true,
      };

    case 66:
    case 67:
      return {
        code,
        title: 'Freezing Rain',
        description: 'Hazardous supercooled liquid rain freezing instantly',
        iconName: 'CloudHail',
        backgroundGradient: 'from-cyan-950/30 via-slate-900 to-slate-950',
        badgeColor: 'text-cyan-300',
        isPrecipitating: true,
      };

    case 71:
      return {
        code,
        title: 'Slight Snowfall',
        description: 'Delicate scattered snow flurries',
        iconName: 'Snowflake',
        backgroundGradient: 'from-slate-700/30 via-blue-950/30 to-slate-950',
        badgeColor: 'text-slate-100',
        isPrecipitating: true,
      };

    case 73:
    case 75:
      return {
        code,
        title: code === 75 ? 'Heavy Snow' : 'Moderate Snow',
        description: 'Sustained snowfall accumulating on ground surfaces',
        iconName: 'Snowflake',
        backgroundGradient: 'from-blue-900/30 via-slate-800/40 to-slate-950',
        badgeColor: 'text-white',
        isPrecipitating: true,
      };

    case 77:
      return {
        code,
        title: 'Snow Grains',
        description: 'Very small white opaque grains of ice',
        iconName: 'Snowflake',
        backgroundGradient: 'from-slate-800/30 via-slate-900 to-slate-950',
        badgeColor: 'text-slate-200',
        isPrecipitating: true,
      };

    case 80:
    case 81:
    case 82:
      return {
        code,
        title: code === 82 ? 'Violent Showers' : code === 81 ? 'Moderate Showers' : 'Passing Showers',
        description: 'Sudden intermittent rain showers with shifting cloud cover',
        iconName: 'CloudRain',
        backgroundGradient: 'from-blue-800/30 via-sky-950/30 to-slate-950',
        badgeColor: 'text-sky-300',
        isPrecipitating: true,
      };

    case 85:
    case 86:
      return {
        code,
        title: 'Snow Showers',
        description: 'Periodic brisk snow bursts',
        iconName: 'Snowflake',
        backgroundGradient: 'from-cyan-900/25 via-slate-900 to-slate-950',
        badgeColor: 'text-sky-200',
        isPrecipitating: true,
      };

    case 95:
      return {
        code,
        title: 'Thunderstorm',
        description: 'Atmospheric instability with lightning discharges and thunder',
        iconName: 'CloudLightning',
        backgroundGradient: 'from-purple-950/40 via-indigo-950/40 to-slate-950',
        badgeColor: 'text-purple-400',
        isPrecipitating: true,
      };

    case 96:
    case 99:
      return {
        code,
        title: 'Severe Hail Thunderstorm',
        description: 'Violent squall lines with hail stones and severe lightning',
        iconName: 'CloudLightning',
        backgroundGradient: 'from-violet-950/50 via-slate-950 to-black',
        badgeColor: 'text-violet-400',
        isPrecipitating: true,
      };

    default:
      return {
        code,
        title: 'Atmospheric Conditions',
        description: 'Variable meteorological conditions reported',
        iconName: 'Cloud',
        backgroundGradient: 'from-slate-800/20 via-slate-900 to-slate-950',
        badgeColor: 'text-slate-400',
        isPrecipitating: false,
      };
  }
}

/**
 * Calculates Air Quality evaluation and risk category
 */
export function getAirQualityLevel(europeanAqi?: number, usAqi?: number) {
  const aqi = europeanAqi ?? (usAqi ? Math.round(usAqi / 20) : undefined);

  if (aqi === undefined || aqi === null) {
    return {
      label: 'Unavailable',
      description: 'Sensor data currently calculating for this coordinate.',
      colorClass: 'text-slate-400',
      bgClass: 'bg-slate-500/10',
      borderClass: 'border-slate-500/20',
    };
  }

  // European AQI 1-5 (Good, Fair, Moderate, Poor, Very Poor)
  if (aqi <= 20) {
    return {
      label: 'Good (Optimal)',
      description: 'Air quality is pristine with virtually no health risk.',
      colorClass: 'text-emerald-400',
      bgClass: 'bg-emerald-500/10',
      borderClass: 'border-emerald-500/20',
    };
  } else if (aqi <= 40) {
    return {
      label: 'Fair',
      description: 'Air quality is acceptable for outdoor activity and exercise.',
      colorClass: 'text-cyan-400',
      bgClass: 'bg-cyan-500/10',
      borderClass: 'border-cyan-500/20',
    };
  } else if (aqi <= 60) {
    return {
      label: 'Moderate',
      description: 'Acceptable; unusually sensitive individuals may notice mild irritation.',
      colorClass: 'text-amber-400',
      bgClass: 'bg-amber-500/10',
      borderClass: 'border-amber-500/20',
    };
  } else if (aqi <= 80) {
    return {
      label: 'Poor',
      description: 'Sensitive groups should consider limiting prolonged outdoor exertion.',
      colorClass: 'text-orange-400',
      bgClass: 'bg-orange-500/10',
      borderClass: 'border-orange-500/20',
    };
  } else {
    return {
      label: 'Very Poor',
      description: 'Health alert: general public likely to experience adverse effects.',
      colorClass: 'text-rose-400',
      bgClass: 'bg-rose-500/10',
      borderClass: 'border-rose-500/20',
    };
  }
}

/**
 * UV index severity categorization
 */
export function getUvCategory(uvIndex: number) {
  if (uvIndex < 3) {
    return { label: 'Low', advice: 'No special protection needed', colorClass: 'text-emerald-400' };
  } else if (uvIndex < 6) {
    return { label: 'Moderate', advice: 'Seek shade during midday hours', colorClass: 'text-yellow-400' };
  } else if (uvIndex < 8) {
    return { label: 'High', advice: 'Wear hat, sunglasses and SPF 30+', colorClass: 'text-orange-400' };
  } else if (uvIndex < 11) {
    return { label: 'Very High', advice: 'Avoid sun 10 AM to 4 PM', colorClass: 'text-rose-400' };
  } else {
    return { label: 'Extreme', advice: 'Take full protective precautions', colorClass: 'text-purple-400' };
  }
}

/**
 * Formats cardinal wind direction from degrees (0-360)
 */
export function getWindDirectionCardinal(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((degrees % 360) / 22.5) % 16;
  return directions[index];
}
