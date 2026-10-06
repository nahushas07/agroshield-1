import React, { useState } from 'react';
import { FieldData, HourlyForecastItem, CurrentWeather, PlannedActivityCheck } from '../../types';
import { evaluateBeforeYouApply } from '../../services/runoffEngine';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Droplet,
  Bug,
  Sprout,
  Tractor,
} from 'lucide-react';

interface BeforeYouApplyProps {
  field: FieldData;
  hourlyForecast: HourlyForecastItem[];
  currentWeather: CurrentWeather;
}

export const BeforeYouApply: React.FC<BeforeYouApplyProps> = ({
  field,
  hourlyForecast,
  currentWeather,
}) => {
  const [activityType, setActivityType] = useState<'fertilizer' | 'pesticide' | 'irrigation' | 'tillage'>('fertilizer');
  const [hourOffset, setHourOffset] = useState<number>(1); // 1 hour ahead by default

  const assessment: PlannedActivityCheck = evaluateBeforeYouApply(
    activityType,
    hourOffset,
    field,
    hourlyForecast,
    currentWeather
  );

  const activities = [
    {
      id: 'fertilizer' as const,
      name: 'Fertilizer Application',
      desc: 'Urea, DAP, NPK granules, top-dressing',
      icon: Sprout,
    },
    {
      id: 'pesticide' as const,
      name: 'Crop Protection Spray',
      desc: 'Insecticides, fungicides, herbicides',
      icon: Bug,
    },
    {
      id: 'irrigation' as const,
      name: 'Field Irrigation',
      desc: 'Canal release, tube well, flood or drip',
      icon: Droplet,
    },
    {
      id: 'tillage' as const,
      name: 'Tractor / Field Work',
      desc: 'Inter-cultivation, weeding, tillage',
      icon: Tractor,
    },
  ];

  const suitabilityStyles = {
    SUITABLE: {
      border: 'border-emerald-300',
      bg: 'bg-emerald-50',
      text: 'text-emerald-900',
      badgeBg: 'bg-emerald-600',
      icon: CheckCircle2,
    },
    CAUTION: {
      border: 'border-amber-300',
      bg: 'bg-amber-50',
      text: 'text-amber-900',
      badgeBg: 'bg-amber-600',
      icon: AlertTriangle,
    },
    HIGH_CAUTION: {
      border: 'border-rose-300',
      bg: 'bg-rose-50',
      text: 'text-rose-900',
      badgeBg: 'bg-rose-600',
      icon: ShieldAlert,
    },
  };

  const currentStyle = suitabilityStyles[assessment.suitability];
  const StatusIcon = currentStyle.icon;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold text-slate-900">
              Before You Apply
            </h3>
            <p className="text-xs text-slate-500">
              Runoff prevention & precision application decision support
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
          Field #{field.id} · {field.name}
        </span>
      </div>

      {/* Step 1: Select Planned Activity */}
      <div className="my-5">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
          Step 1: What field activity are you planning?
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {activities.map((act) => {
            const Icon = act.icon;
            const isSelected = activityType === act.id;
            return (
              <button
                key={act.id}
                type="button"
                onClick={() => setActivityType(act.id)}
                className={`flex flex-col p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-600'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon
                    className={`h-4 w-4 ${
                      isSelected ? 'text-emerald-700' : 'text-slate-600'
                    }`}
                  />
                  <span className="text-xs font-bold">{act.name}</span>
                </div>
                <span className="text-[11px] text-slate-500 leading-tight">
                  {act.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Select When */}
      <div className="my-5">
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-600" />
            <span>Step 2: When do you intend to perform this activity?</span>
          </label>
          <span className="text-xs font-medium text-slate-500">
            Selected: {hourlyForecast[hourOffset]?.time || 'Next Hour'}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {hourlyForecast.slice(0, 8).map((hour, idx) => (
            <button
              key={`${hour.time}-${idx}`}
              type="button"
              onClick={() => setHourOffset(idx)}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 border ${
                hourOffset === idx
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              <span>{idx === 0 ? 'Now' : hour.time}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Assessment Outcome Card */}
      <div
        className={`mt-6 rounded-xl border p-5 transition-all ${currentStyle.bg} ${currentStyle.border}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-black/10">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg text-white ${currentStyle.badgeBg}`}>
              <StatusIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  AgroShield Recommendation
                </span>
                <span className="text-slate-300">·</span>
                <span className={`text-xs font-extrabold tracking-wider ${currentStyle.text}`}>
                  {assessment.suitability.replace('_', ' ')}
                </span>
              </div>
              <h4 className={`text-base md:text-lg font-extrabold ${currentStyle.text}`}>
                {assessment.headline}
              </h4>
            </div>
          </div>

          <div className="text-right text-xs text-slate-600">
            <span className="block font-semibold">Planned: {assessment.plannedDateTimeString}</span>
            <span className="text-[11px] text-slate-500">
              Field Slope: {field.slopePercentage}% · Soil Saturation: {field.estimatedSoilMoisturePercent}%
            </span>
          </div>
        </div>

        {/* Contributing Factors (Why?) */}
        <div className="my-4">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
            Why? Contributing Environmental & Hydrological Factors:
          </span>
          <ul className="space-y-2">
            {assessment.reasons.map((reason, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-xs md:text-sm text-slate-800 font-medium"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-slate-700 mt-2 shrink-0"></span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>

          {assessment.alternativeWindow && (
            <div className="mt-3.5 p-3 rounded-lg bg-white/80 border border-black/10 text-xs font-semibold text-slate-800">
              <span className="text-emerald-800 font-bold block mb-0.5">
                Suggested Alternative Window:
              </span>
              <span>{assessment.alternativeWindow}</span>
            </div>
          )}
        </div>

        {/* Regulatory & Safety Disclaimer */}
        <div className="pt-3 border-t border-black/10 flex items-start gap-2 text-[11px] text-slate-600">
          <Sparkles className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-semibold text-slate-800">Agronomic Notice: </span>
            {assessment.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
};
