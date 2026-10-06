import React, { useState } from 'react';
import {
  FieldData,
  CurrentWeather,
  HourlyForecastItem,
  RunoffCalculation,
  SoilTestReport,
  GeoCoordinates,
} from '../../types';
import { AgroShieldLogo } from '../brand/AgroShieldLogo';
import { DataStatusBadge } from '../common/DataStatusBadge';
import { RunoffRiskClock } from './RunoffRiskClock';
import { BeforeYouApply } from './BeforeYouApply';
import { AgroShieldMap } from '../map/AgroShieldMap';
import {
  MapPin,
  CloudRain,
  Compass,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Mic,
  Droplets,
  Sprout,
  CheckCircle,
  HelpCircle,
  Navigation,
} from 'lucide-react';

interface FarmerDashboardProps {
  field: FieldData;
  coords: GeoCoordinates;
  weather: CurrentWeather;
  hourly: HourlyForecastItem[];
  runoff: RunoffCalculation;
  soilReport: SoilTestReport;
  onOpenVoiceAssistant: () => void;
  onOpenPrivacyModal: () => void;
  onNavigateToTab: (tabId: string) => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  field,
  coords,
  weather,
  hourly,
  runoff,
  soilReport,
  onOpenVoiceAssistant,
  onOpenPrivacyModal,
  onNavigateToTab,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const riskBadgeStyle = {
    LOW: 'text-emerald-800 bg-emerald-100 border-emerald-300',
    MODERATE: 'text-amber-800 bg-amber-100 border-amber-300',
    HIGH: 'text-orange-900 bg-orange-100 border-orange-300',
    VERY_HIGH: 'text-rose-900 bg-rose-100 border-rose-300',
  }[runoff.overallRisk];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Field Intelligence Bar (Section 14) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-500">{getGreeting()},</span>
              <span className="text-sm font-bold text-slate-900">{field.farmerName}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Your field intelligence for today
            </h1>
            <p className="text-xs md:text-sm text-slate-600">
              Monitoring <strong className="text-slate-800">{field.name}</strong> ({field.crop}, {field.areaAcres} acres)
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <div>
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <span>{coords.locality || 'Field Zone'}</span>
                  <DataStatusBadge
                    status={coords.isLive ? 'LIVE' : 'DEMO_LOCATION'}
                    text={coords.isLive ? 'LIVE GPS' : 'DEMO GPS'}
                  />
                </div>
                <span className="text-[11px] text-slate-500">
                  {coords.district || 'Mandya'}, {coords.state || 'Karnataka'} (±{coords.accuracy}m)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenVoiceAssistant}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-all hover:scale-102"
            >
              <Mic className="h-4 w-4" />
              <span>Ask AgroShield</span>
            </button>
          </div>
        </div>

        {/* TODAY'S FIELD STATUS (Section 14) */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              TODAY&apos;S FIELD STATUS
            </span>
            <span className="text-xs text-slate-500">
              Updated {Math.round((Date.now() - weather.timestamp) / 60000)}m ago
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {/* Weather status */}
            <div
              onClick={() => onNavigateToTab('weather')}
              className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Weather</span>
                <DataStatusBadge status={weather.isLive ? 'LIVE' : 'DEMO_DATA'} />
              </div>
              <div className="text-xl md:text-2xl font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                {weather.temperature}°C
              </div>
              <span className="text-xs font-medium text-slate-600 block mt-0.5 truncate">
                {weather.condition}
              </span>
            </div>

            {/* Rainfall probability */}
            <div
              onClick={() => onNavigateToTab('weather')}
              className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Precipitation</span>
                <CloudRain className="h-3.5 w-3.5 text-sky-600" />
              </div>
              <div className="text-xl md:text-2xl font-extrabold text-slate-900 group-hover:text-sky-700 transition-colors">
                {weather.rainProbability}%
              </div>
              <span className="text-xs font-medium text-slate-600 block mt-0.5 truncate">
                {weather.precipitation > 0 ? `${weather.precipitation.toFixed(1)} mm forecast` : 'Dry current window'}
              </span>
            </div>

            {/* Runoff Risk status */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 transition-all">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Runoff Risk</span>
                <span className="text-[10px] text-slate-400">Score {runoff.riskScore}/100</span>
              </div>
              <div className={`text-lg md:text-xl font-black inline-block px-2 py-0.5 rounded-md border ${riskBadgeStyle}`}>
                {runoff.overallRisk}
              </div>
              <span className="text-xs font-medium text-slate-600 block mt-1 truncate">
                Slope {field.slopePercentage}% · {field.soilType.split(' ')[0]}
              </span>
            </div>

            {/* Field Condition */}
            <div
              onClick={() => onNavigateToTab('field')}
              className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Field Condition</span>
                <Sprout className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <div className="text-base md:text-lg font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                {field.crop.split(' ')[0]}
              </div>
              <span className="text-xs font-medium text-emerald-700 block mt-0.5 truncate">
                Moisture: {field.estimatedSoilMoisturePercent}% Saturation
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* WHAT SHOULD I KNOW TODAY? (Section 14) */}
      <div className="bg-amber-50/70 rounded-2xl border border-amber-200 p-5 md:p-6 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
              WHAT SHOULD I KNOW TODAY?
            </span>
            <p className="text-sm md:text-base font-bold text-amber-950 leading-snug">
              Rain expected later today. Runoff risk may increase between 1 PM – 4 PM.
            </p>
            <p className="text-xs md:text-sm text-amber-900 leading-relaxed font-medium">
              Review planned field activities during this high-risk window. Avoid foliar chemical sprays or surface
              urea top-dressing to prevent active chemical leaching into {field.connectedWaterBody}.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigateToTab('before_apply')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-950 underline hover:text-black"
              >
                <span>Check planned spray in &apos;Before You Apply&apos;</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SIGNATURE FEATURE: DYNAMIC RUNOFF RISK CLOCK (Section 7 & 14) */}
      <RunoffRiskClock hourlyForecast={hourly} isLive={weather.isLive} />

      {/* BEFORE YOU APPLY (Section 8) */}
      <BeforeYouApply
        field={field}
        hourlyForecast={hourly}
        currentWeather={weather}
      />

      {/* LIVE LOCATION CARD (Section 15) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-base md:text-lg font-bold text-slate-900">
                YOUR CURRENT LOCATION
              </h3>
              <DataStatusBadge
                status={coords.isLive ? 'LIVE_GPS' : 'DEMO_LOCATION'}
                text={coords.isLive ? 'LIVE' : 'DEMO'}
              />
            </div>
            <p className="text-xs text-slate-500">
              Real device satellite positioning & precision plot mapping
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
            >
              <span>Open in Google Maps</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Embedded Map */}
        <AgroShieldMap
          coordinates={coords}
          field={field}
          height="340px"
          showFollowToggle={true}
        />

        {/* Location Details Footer Strip */}
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Locality</span>
            <span className="font-bold text-slate-800">{coords.locality || 'Catchment Area'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">District & State</span>
            <span className="font-bold text-slate-800">
              {coords.district || 'Mandya'}, {coords.state || 'Karnataka'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">GPS Accuracy</span>
            <span className="font-bold text-emerald-700">± {coords.accuracy} meters</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Last GPS Fix</span>
            <span className="font-medium text-slate-600">Continuous background sync</span>
          </div>
        </div>
      </div>

      {/* TODAY'S RECOMMENDATIONS (Section 14) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs">
        <h3 className="text-base md:text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-emerald-700" />
          <span>Today&apos;s Agronomic Field Recommendations</span>
        </h3>

        <div className="space-y-3">
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-start gap-3">
            <span className="h-2 w-2 rounded-full bg-emerald-600 mt-2 shrink-0"></span>
            <div className="text-xs md:text-sm">
              <strong className="text-slate-900 block mb-0.5">
                Delay Afternoon Top-Dressing
              </strong>
              <p className="text-slate-700 font-medium">
                Due to forecast afternoon precipitation (82% probability), retain nitrogen applications until tomorrow morning when soil drainage stabilizes.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
            <span className="h-2 w-2 rounded-full bg-slate-500 mt-2 shrink-0"></span>
            <div className="text-xs md:text-sm">
              <strong className="text-slate-900 block mb-0.5">
                Maintain Vegetative Riparian Strip
              </strong>
              <p className="text-slate-700 font-medium">
                Ensure field outlet bunds remain intact along the 65m slope gradient toward {field.connectedWaterBody} to naturally trap sediments.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/60 flex items-start gap-3">
            <span className="h-2 w-2 rounded-full bg-blue-600 mt-2 shrink-0"></span>
            <div className="text-xs md:text-sm">
              <strong className="text-slate-900 block mb-0.5">
                Verified Soil Health Action (Report #{soilReport.sampleId})
              </strong>
              <p className="text-slate-700 font-medium">
                Lab results show available nitrogen at {soilReport.verifiedNitrogenKgPerHa} kg/ha. Incorporate well-decomposed organic manure at next weeding.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
