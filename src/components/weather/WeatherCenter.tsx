import React from 'react';
import { CurrentWeather, HourlyForecastItem, DailyForecastItem, FieldData } from '../../types';
import { DataStatusBadge } from '../common/DataStatusBadge';
import {
  CloudRain,
  Wind,
  Droplets,
  Sun,
  Compass,
  Zap,
  TrendingUp,
  AlertTriangle,
  Info,
  Calendar,
} from 'lucide-react';

interface WeatherCenterProps {
  weather: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  field: FieldData;
  localityText: string;
  isLive: boolean;
  onRefresh?: () => void;
}

export const WeatherCenter: React.FC<WeatherCenterProps> = ({
  weather,
  hourly,
  daily,
  field,
  localityText,
  isLive,
  onRefresh,
}) => {
  const next6Hours = hourly.slice(0, 6);
  const maxRainNext6 = Math.max(...next6Hours.map((h) => h.precipitationProbability));
  const totalRainNext6 = next6Hours.reduce((acc, h) => acc + h.precipitation, 0);

  return (
    <div className="space-y-6">
      {/* Hero Weather Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-300">
                Weather Near You
              </span>
              <span className="text-slate-500">·</span>
              <DataStatusBadge
                status={isLive ? 'LIVE' : 'DEMO_DATA'}
                text={isLive ? 'LIVE METEOROLOGICAL DATA' : 'DEMO WEATHER'}
                className="text-white"
              />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">
              {localityText || weather.locality}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Agricultural micro-climate monitoring for {field.name}
            </p>
          </div>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
            >
              Refresh Weather
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Main Temperature & Condition */}
          <div className="md:col-span-5 flex items-center gap-6">
            <div className="flex items-baseline">
              <span className="text-5xl md:text-6xl font-extrabold tracking-tight">
                {weather.temperature}
              </span>
              <span className="text-2xl font-light text-slate-300 ml-1">°C</span>
            </div>

            <div>
              <div className="text-base md:text-lg font-bold text-white leading-tight">
                {weather.condition}
              </div>
              <div className="text-xs text-slate-300 mt-1">
                Feels like {weather.feelsLike}°C · UV Index: {weather.uvIndex}
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/10 rounded-xl p-4 backdrop-blur-xs border border-white/10">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-1">
                <CloudRain className="h-3.5 w-3.5 text-sky-400" />
                <span>Rain Chance</span>
              </div>
              <div className="text-base font-bold text-white">{weather.rainProbability}%</div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-1">
                <Droplets className="h-3.5 w-3.5 text-blue-400" />
                <span>Precipitation</span>
              </div>
              <div className="text-base font-bold text-white">
                {weather.precipitation.toFixed(1)} mm
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-1">
                <Wind className="h-3.5 w-3.5 text-teal-400" />
                <span>Wind Speed</span>
              </div>
              <div className="text-base font-bold text-white">{weather.windSpeed} km/h</div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-1">
                <Compass className="h-3.5 w-3.5 text-amber-400" />
                <span>Humidity</span>
              </div>
              <div className="text-base font-bold text-white">{weather.humidity}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* RAIN IN THE NEXT 6 HOURS — Elegant Precipitation Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
              <CloudRain className="h-5 w-5 text-sky-600" />
              <span>Rain in the Next 6 Hours</span>
            </h3>
            <p className="text-xs text-slate-500">
              Immediate precipitation window for spray and fertilizer planning
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <span>Peak probability: {maxRainNext6}%</span>
            <span className="text-slate-300">·</span>
            <span>Estimated total: {totalRainNext6.toFixed(1)} mm</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {next6Hours.map((h, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl border text-center transition-all ${
                h.precipitationProbability >= 60
                  ? 'bg-sky-50/80 border-sky-300 text-sky-950'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <span className="text-xs font-bold block mb-1 text-slate-700">{h.time}</span>
              <div className="my-1.5">
                <span className="text-lg font-extrabold block text-slate-900">
                  {h.precipitationProbability}%
                </span>
                <span className="text-[11px] text-slate-500 block">
                  {h.precipitation > 0 ? `${h.precipitation.toFixed(1)} mm` : '0 mm'}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-slate-600 block truncate">
                {h.condition}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* HOURLY FORECAST (Next 24 Hours) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs">
        <h3 className="text-base md:text-lg font-bold text-slate-900 mb-1">
          24-Hour Microclimate Forecast
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Hourly temperature, wind speed, and rain probability trends
        </p>

        <div className="overflow-x-auto pb-3 -mx-2 px-2 scrollbar-none">
          <div className="flex items-stretch gap-2.5 min-w-max">
            {hourly.map((h, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 w-24 shrink-0 text-center"
              >
                <span className="text-xs font-semibold text-slate-600">{h.time}</span>
                <span className="text-base font-extrabold text-slate-900 my-1">
                  {h.temperature}°
                </span>
                <div className="text-[11px] font-bold text-sky-700 flex items-center gap-1 my-1">
                  <CloudRain className="h-3 w-3" />
                  <span>{h.precipitationProbability}%</span>
                </div>
                <span className="text-[10px] text-slate-500">{h.windSpeed} km/h wind</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 10-DAY EXTENDED FORECAST */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-emerald-700" />
          <div>
            <h3 className="text-base md:text-lg font-bold text-slate-900">
              10-Day Agronomic Forecast
            </h3>
            <p className="text-xs text-slate-500">
              Longer-range planning for sowing, weeding, and irrigation scheduling
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {daily.map((d, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors"
            >
              <div className="w-24">
                <span className="text-xs font-bold text-slate-800">{d.dayName}</span>
                <span className="text-[10px] text-slate-400 block">{d.date}</span>
              </div>

              <div className="flex items-center gap-2 flex-1 max-w-xs">
                <span className="text-xs font-medium text-slate-700 truncate">{d.condition}</span>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1 text-sky-700 w-20">
                  <CloudRain className="h-3.5 w-3.5" />
                  <span>{d.precipitationProbability}%</span>
                  <span className="text-slate-400 text-[10px]">({d.precipitationSum.toFixed(1)}mm)</span>
                </div>

                <div className="text-right w-20">
                  <span className="font-bold text-slate-900">{d.tempMax}°</span>
                  <span className="text-slate-400 ml-1.5">{d.tempMin}°</span>
                </div>

                <div className="w-20 text-right">
                  <span
                    className={`text-[10px] font-bold ${
                      d.runoffRisk === 'VERY_HIGH'
                        ? 'text-rose-700'
                        : d.runoffRisk === 'HIGH'
                        ? 'text-orange-700'
                        : d.runoffRisk === 'MODERATE'
                        ? 'text-amber-700'
                        : 'text-emerald-700'
                    }`}
                  >
                    {d.runoffRisk} RISK
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WEATHER → RUNOFF IMPACT SECTION */}
      <div className="bg-emerald-50/70 rounded-2xl border border-emerald-200 p-5 md:p-6 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-emerald-950 mb-1">
              Weather → Runoff Hydrological Impact
            </h3>
            <p className="text-xs md:text-sm text-emerald-900 leading-relaxed font-medium mb-3">
              How today&apos;s weather influences {field.name}&apos;s water movement and chemical leaching:
            </p>

            <ul className="space-y-2 text-xs md:text-sm text-emerald-950">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-700 mt-2 shrink-0"></span>
                <span>
                  <strong>Rainfall Intensity vs. Infiltration Rate:</strong> Intense rainfall bursts
                  exceed the soil&apos;s natural infiltration capacity ({field.soilType}), leading to immediate
                  overland sheet flow towards {field.connectedWaterBody}.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-700 mt-2 shrink-0"></span>
                <span>
                  <strong>Antecedent Saturation:</strong> Recent rainfall has pre-moistened the root
                  zone. Saturated soil loses water holding capacity, accelerating nutrient runoff.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-700 mt-2 shrink-0"></span>
                <span>
                  <strong>Wind Spray Drift:</strong> Spraying during wind &gt; 15 km/h causes
                  aerosol drift to neighboring non-target crops and open drainage ditches.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
