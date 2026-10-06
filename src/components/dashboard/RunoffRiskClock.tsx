import React, { useState } from 'react';
import { HourlyForecastItem, RiskLevel } from '../../types';
import { Clock, CloudRain, AlertTriangle, ChevronRight, Info } from 'lucide-react';

interface RunoffRiskClockProps {
  hourlyForecast: HourlyForecastItem[];
  isLive: boolean;
}

const RISK_COLOR_MAP: Record<
  RiskLevel,
  { bg: string; text: string; dot: string; border: string; bar: string }
> = {
  LOW: {
    bg: 'bg-emerald-50 hover:bg-emerald-100/80',
    text: 'text-emerald-800',
    dot: 'bg-emerald-500',
    border: 'border-emerald-200',
    bar: 'bg-emerald-500',
  },
  MODERATE: {
    bg: 'bg-amber-50 hover:bg-amber-100/80',
    text: 'text-amber-800',
    dot: 'bg-amber-500',
    border: 'border-amber-200',
    bar: 'bg-amber-500',
  },
  HIGH: {
    bg: 'bg-orange-50 hover:bg-orange-100/80',
    text: 'text-orange-900',
    dot: 'bg-orange-500',
    border: 'border-orange-300',
    bar: 'bg-orange-500',
  },
  VERY_HIGH: {
    bg: 'bg-rose-50 hover:bg-rose-100/80',
    text: 'text-rose-900',
    dot: 'bg-rose-600',
    border: 'border-rose-300',
    bar: 'bg-rose-600',
  },
};

export const RunoffRiskClock: React.FC<RunoffRiskClockProps> = ({
  hourlyForecast,
  isLive,
}) => {
  // Take next 12 hours
  const next12Hours = hourlyForecast.slice(0, 12);
  const [selectedHourIndex, setSelectedHourIndex] = useState(0);

  const selectedHour = next12Hours[selectedHourIndex] || next12Hours[0];

  if (!selectedHour) return null;

  const style = RISK_COLOR_MAP[selectedHour.runoffRisk];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-emerald-700" />
          <h3 className="text-base md:text-lg font-bold text-slate-900">
            Dynamic Runoff Risk Clock
          </h3>
          <span className="text-xs text-slate-500 font-medium ml-1">· Next 12 Hours</span>
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <span
            className={`h-2 w-2 rounded-full ${
              isLive ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          ></span>
          <span>{isLive ? 'Continuous forecast calculation' : 'Modelled timetable'}</span>
        </div>
      </div>

      <p className="text-xs md:text-sm text-slate-600 mb-5">
        Hourly runoff risk model dynamically integrates precipitation probability, forecasted intensity,
        antecedent soil saturation, and field slope gradient. Tap any hour to examine contributing factors.
      </p>

      {/* Horizontal Scrollable 12-Hour Timeline Strip */}
      <div className="overflow-x-auto pb-3 -mx-2 px-2 scrollbar-none">
        <div className="flex items-stretch gap-2 min-w-max">
          {next12Hours.map((h, idx) => {
            const isSelected = idx === selectedHourIndex;
            const itemStyle = RISK_COLOR_MAP[h.runoffRisk];

            return (
              <button
                key={`${h.time}-${idx}`}
                type="button"
                onClick={() => setSelectedHourIndex(idx)}
                className={`flex flex-col items-center justify-between p-3 rounded-xl border text-center transition-all w-20 md:w-24 shrink-0 ${
                  isSelected
                    ? `${itemStyle.bg} ${itemStyle.border} ring-2 ring-emerald-600 shadow-sm scale-102`
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <span className="text-xs font-bold text-slate-800">{h.time}</span>

                <div className="my-2 flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
                    <CloudRain className="h-3 w-3 text-sky-600" />
                    <span>{h.precipitationProbability}%</span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {h.precipitation > 0 ? `${h.precipitation.toFixed(1)}mm` : '0mm'}
                  </span>
                </div>

                <div className="w-full pt-1.5 border-t border-slate-200/60 flex items-center justify-center gap-1">
                  <span className={`h-1.5 w-1.5 rounded-full ${itemStyle.dot}`}></span>
                  <span className={`text-[10px] font-extrabold tracking-tight ${itemStyle.text}`}>
                    {h.runoffRisk}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Hour Detailed Reason Card */}
      <div
        className={`mt-4 rounded-xl border p-4 md:p-5 transition-all ${style.bg} ${style.border}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg md:text-xl font-extrabold text-slate-900">
              {selectedHour.time}
            </span>
            <span className="text-slate-400">/</span>
            <span className={`text-sm md:text-base font-extrabold ${style.text}`}>
              {selectedHour.runoffRisk} RUNOFF RISK
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1">
              <CloudRain className="h-4 w-4 text-sky-600" />
              <span>Rain Probability: {selectedHour.precipitationProbability}%</span>
            </span>
            <span>Estimated Rain: {selectedHour.precipitation.toFixed(1)} mm</span>
            <span>Wind: {selectedHour.windSpeed} km/h</span>
          </div>
        </div>

        <div className="bg-white/80 rounded-lg p-3 border border-white/60">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-slate-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-0.5">
                Why this risk rating?
              </span>
              <p className="text-xs md:text-sm text-slate-800 leading-relaxed font-medium">
                {selectedHour.runoffReason}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
