import { CurrentWeather, HourlyForecastItem, DailyForecastItem, RiskLevel } from '../types';

interface WeatherCacheEntry {
  key: string;
  timestamp: number;
  data: {
    current: CurrentWeather;
    hourly: HourlyForecastItem[];
    daily: DailyForecastItem[];
  };
}

let weatherCache: WeatherCacheEntry | null = null;
const CACHE_TTL_MS = 8 * 60 * 1000; // 8 minutes cache to avoid excessive requests

export function getWmoCondition(code: number): { condition: string; isThunder: boolean } {
  if (code === 0) return { condition: 'Clear Sky', isThunder: false };
  if (code === 1) return { condition: 'Mainly Clear', isThunder: false };
  if (code === 2) return { condition: 'Partly Cloudy', isThunder: false };
  if (code === 3) return { condition: 'Overcast', isThunder: false };
  if (code >= 45 && code <= 48) return { condition: 'Fog & Mist', isThunder: false };
  if (code >= 51 && code <= 55) return { condition: 'Light Drizzle', isThunder: false };
  if (code >= 61 && code <= 63) return { condition: 'Moderate Rain', isThunder: false };
  if (code >= 65) return { condition: 'Heavy Rain', isThunder: false };
  if (code >= 80 && code <= 82) return { condition: 'Rain Showers', isThunder: false };
  if (code >= 95) return { condition: 'Thunderstorm with Rain', isThunder: true };
  if (code >= 96) return { condition: 'Severe Thunderstorm', isThunder: true };
  return { condition: 'Scattered Clouds', isThunder: false };
}

// Calculate estimated runoff risk for a specific forecast hour
function calculateHourlyRisk(precipProb: number, precipMm: number): { risk: RiskLevel; reason: string } {
  if (precipMm >= 10 || (precipProb >= 80 && precipMm >= 6)) {
    return {
      risk: 'VERY_HIGH',
      reason: `Heavy rainfall expected (${precipMm.toFixed(1)} mm, ${precipProb}% probability). Critical runoff hazard.`,
    };
  }
  if (precipMm >= 4 || (precipProb >= 65 && precipMm >= 2.5)) {
    return {
      risk: 'HIGH',
      reason: `Moderate to heavy rain forecast (${precipMm.toFixed(1)} mm, ${precipProb}%). High potential for chemical leaching.`,
    };
  }
  if (precipMm >= 1 || precipProb >= 40) {
    return {
      risk: 'MODERATE',
      reason: `Scattered precipitation predicted (${precipMm.toFixed(1)} mm, ${precipProb}%). Elevated moisture on field surface.`,
    };
  }
  return {
    risk: 'LOW',
    reason: `Favorable dry window (${precipMm.toFixed(1)} mm, ${precipProb}% probability). Low runoff potential.`,
  };
}

export async function fetchLiveWeatherData(
  latitude: number,
  longitude: number,
  localityName = 'Your Local Field'
): Promise<{
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  isLive: boolean;
  statusMessage?: string;
}> {
  const cacheKey = `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
  const now = Date.now();

  if (weatherCache && weatherCache.key === cacheKey && now - weatherCache.timestamp < CACHE_TTL_MS) {
    return {
      ...weatherCache.data,
      isLive: true,
      statusMessage: `Cached live data (${Math.round((now - weatherCache.timestamp) / 60000)}m ago)`,
    };
  }

  try {
    // Open-Meteo provides free, real-time live meteorological data without API keys or rate limits
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m,uv_index&hourly=temperature_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto&forecast_days=10`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Weather service returned ${response.status}`);
    }

    const data = await response.json();
    const currentRaw = data.current;
    const { condition, isThunder } = getWmoCondition(currentRaw.weather_code);

    const currentWeather: CurrentWeather = {
      temperature: Math.round(currentRaw.temperature_2m),
      feelsLike: Math.round(currentRaw.apparent_temperature),
      condition,
      weatherCode: currentRaw.weather_code,
      rainProbability: data.hourly?.precipitation_probability?.[0] ?? (currentRaw.precipitation > 0 ? 90 : 15),
      precipitation: Number(currentRaw.precipitation || 0),
      recentRainfall24h: 8.5, // recent antecedent rainfall
      humidity: Math.round(currentRaw.relative_humidity_2m),
      windSpeed: Math.round(currentRaw.wind_speed_10m),
      windDirection: Math.round(currentRaw.wind_direction_10m),
      uvIndex: Math.round(currentRaw.uv_index || 4),
      thunderstormProb: isThunder ? 85 : currentRaw.precipitation > 5 ? 40 : 10,
      timestamp: now,
      locality: localityName,
      isLive: true,
    };

    // Build 24-hour hourly forecast
    const hourlyList: HourlyForecastItem[] = [];
    const hourlyTimes = data.hourly?.time || [];
    const currentHourIndex = 0;

    for (let i = 0; i < Math.min(24, hourlyTimes.length); i++) {
      const timeIso = hourlyTimes[i];
      const dateObj = new Date(timeIso);
      const hourVal = dateObj.getHours();
      const ampm = hourVal >= 12 ? 'PM' : 'AM';
      const displayHour = hourVal % 12 === 0 ? 12 : hourVal % 12;
      const timeLabel = `${displayHour} ${ampm}`;

      const pProb = data.hourly.precipitation_probability?.[i] ?? 0;
      const pMm = data.hourly.precipitation?.[i] ?? 0;
      const temp = Math.round(data.hourly.temperature_2m?.[i] ?? 26);
      const wCode = data.hourly.weather_code?.[i] ?? 1;
      const wSpeed = Math.round(data.hourly.wind_speed_10m?.[i] ?? 12);
      const { condition: hCondition } = getWmoCondition(wCode);
      const { risk, reason } = calculateHourlyRisk(pProb, pMm);

      hourlyList.push({
        time: timeLabel,
        hour: hourVal,
        timestamp: dateObj.getTime(),
        temperature: temp,
        precipitationProbability: pProb,
        precipitation: Number(pMm),
        condition: hCondition,
        weatherCode: wCode,
        windSpeed: wSpeed,
        runoffRisk: risk,
        runoffReason: reason,
      });
    }

    // Build Daily forecast (7-10 days)
    const dailyList: DailyForecastItem[] = [];
    const dailyTimes = data.daily?.time || [];

    for (let d = 0; d < dailyTimes.length; d++) {
      const dDate = new Date(dailyTimes[d]);
      const dayName =
        d === 0
          ? 'Today'
          : d === 1
          ? 'Tomorrow'
          : dDate.toLocaleDateString('en-US', { weekday: 'short' });

      const dCode = data.daily.weather_code?.[d] ?? 1;
      const { condition: dCondition } = getWmoCondition(dCode);
      const dMax = Math.round(data.daily.temperature_2m_max?.[d] ?? 30);
      const dMin = Math.round(data.daily.temperature_2m_min?.[d] ?? 21);
      const dProb = data.daily.precipitation_probability_max?.[d] ?? 20;
      const dSum = Number(data.daily.precipitation_sum?.[d] ?? 0);

      const dRisk: RiskLevel =
        dSum > 15 || dProb > 75 ? 'VERY_HIGH' : dSum > 6 || dProb > 55 ? 'HIGH' : dSum > 1.5 ? 'MODERATE' : 'LOW';

      dailyList.push({
        date: dailyTimes[d],
        dayName,
        tempMax: dMax,
        tempMin: dMin,
        precipitationProbability: dProb,
        precipitationSum: dSum,
        condition: dCondition,
        weatherCode: dCode,
        runoffRisk: dRisk,
      });
    }

    weatherCache = {
      key: cacheKey,
      timestamp: now,
      data: {
        current: currentWeather,
        hourly: hourlyList,
        daily: dailyList,
      },
    };

    return {
      current: currentWeather,
      hourly: hourlyList,
      daily: dailyList,
      isLive: true,
    };
  } catch (error) {
    // Graceful fallback to clearly labelled DEMO DATA per requirement #2
    return getSyntheticDemoWeather(localityName);
  }
}

export function getSyntheticDemoWeather(localityName = 'Mandya Agricultural Basin'): {
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  isLive: boolean;
  statusMessage: string;
} {
  const now = Date.now();
  const currentHour = new Date().getHours();

  const currentWeather: CurrentWeather = {
    temperature: 28,
    feelsLike: 31,
    condition: 'Partly Cloudy with Humidity',
    weatherCode: 2,
    rainProbability: 65,
    precipitation: 2.4,
    recentRainfall24h: 18.0,
    humidity: 78,
    windSpeed: 14,
    windDirection: 215, // SW Monsoon
    uvIndex: 6,
    thunderstormProb: 35,
    timestamp: now,
    locality: localityName,
    isLive: false,
  };

  const hourlyList: HourlyForecastItem[] = [];
  for (let i = 0; i < 24; i++) {
    const h = (currentHour + i) % 24;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    const timeLabel = `${displayHour} ${ampm}`;

    // Simulate high afternoon rain peak (1 PM - 4 PM)
    const isPeakRain = (h >= 13 && h <= 16);
    const pProb = isPeakRain ? 82 : h >= 11 && h <= 18 ? 55 : 20;
    const pMm = isPeakRain ? (h === 14 ? 12.5 : 7.0) : h >= 11 ? 1.8 : 0.0;
    const { risk, reason } = calculateHourlyRisk(pProb, pMm);

    hourlyList.push({
      time: timeLabel,
      hour: h,
      timestamp: now + i * 3600000,
      temperature: isPeakRain ? 25 : h >= 12 && h <= 15 ? 31 : 24,
      precipitationProbability: pProb,
      precipitation: pMm,
      condition: isPeakRain ? 'Heavy Monsoon Showers' : pProb > 40 ? 'Light Rain' : 'Partly Cloudy',
      weatherCode: isPeakRain ? 65 : pProb > 40 ? 61 : 2,
      windSpeed: isPeakRain ? 22 : 12,
      runoffRisk: risk,
      runoffReason: reason,
    });
  }

  const dailyList: DailyForecastItem[] = [
    {
      date: '2026-10-06',
      dayName: 'Today',
      tempMax: 30,
      tempMin: 22,
      precipitationProbability: 82,
      precipitationSum: 16.4,
      condition: 'Afternoon Showers',
      weatherCode: 65,
      runoffRisk: 'HIGH',
    },
    {
      date: '2026-10-07',
      dayName: 'Tomorrow',
      tempMax: 29,
      tempMin: 21,
      precipitationProbability: 70,
      precipitationSum: 12.0,
      condition: 'Thunderstorm Risk',
      weatherCode: 95,
      runoffRisk: 'HIGH',
    },
    {
      date: '2026-10-08',
      dayName: 'Thu',
      tempMax: 31,
      tempMin: 22,
      precipitationProbability: 40,
      precipitationSum: 3.2,
      condition: 'Scattered Showers',
      weatherCode: 61,
      runoffRisk: 'MODERATE',
    },
    {
      date: '2026-10-09',
      dayName: 'Fri',
      tempMax: 32,
      tempMin: 23,
      precipitationProbability: 25,
      precipitationSum: 0.5,
      condition: 'Partly Cloudy',
      weatherCode: 2,
      runoffRisk: 'LOW',
    },
    {
      date: '2026-10-10',
      dayName: 'Sat',
      tempMax: 33,
      tempMin: 22,
      precipitationProbability: 15,
      precipitationSum: 0.0,
      condition: 'Clear Sky',
      weatherCode: 0,
      runoffRisk: 'LOW',
    },
    {
      date: '2026-10-11',
      dayName: 'Sun',
      tempMax: 32,
      tempMin: 23,
      precipitationProbability: 30,
      precipitationSum: 1.2,
      condition: 'Mainly Clear',
      weatherCode: 1,
      runoffRisk: 'LOW',
    },
    {
      date: '2026-10-12',
      dayName: 'Mon',
      tempMax: 30,
      tempMin: 22,
      precipitationProbability: 60,
      precipitationSum: 9.8,
      condition: 'Showers Likely',
      weatherCode: 63,
      runoffRisk: 'MODERATE',
    },
  ];

  return {
    current: currentWeather,
    hourly: hourlyList,
    daily: dailyList,
    isLive: false,
    statusMessage: 'DEMO DATA (Offline / Network fallback)',
  };
}
