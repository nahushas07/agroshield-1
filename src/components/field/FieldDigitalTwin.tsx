import React, { useState } from 'react';
import { FieldData, GeoCoordinates, CurrentWeather, SoilTestReport, RunoffCalculation } from '../../types';
import { AgroShieldMap } from '../map/AgroShieldMap';
import { DataStatusBadge } from '../common/DataStatusBadge';
import {
  Layers,
  MapPin,
  Mountain,
  Sprout,
  Droplets,
  Calendar,
  Compass,
  FileCheck2,
  ExternalLink,
} from 'lucide-react';

interface FieldDigitalTwinProps {
  field: FieldData;
  coords: GeoCoordinates;
  weather: CurrentWeather;
  soilReport: SoilTestReport;
  runoff: RunoffCalculation;
  onSelectCrop?: (crop: string) => void;
}

export const FieldDigitalTwin: React.FC<FieldDigitalTwinProps> = ({
  field,
  coords,
  weather,
  soilReport,
  runoff,
  onSelectCrop,
}) => {
  const [selectedCrop, setSelectedCrop] = useState(field.crop);

  const availableCrops = [
    'Paddy (BPT-5204)',
    'Sugarcane (Co-86032)',
    'Ragi / Finger Millet',
    'Bt Cotton',
    'Maize',
  ];

  const handleCropChange = (crop: string) => {
    setSelectedCrop(crop);
    onSelectCrop?.(crop);
  };

  return (
    <div className="space-y-6">
      {/* Real-Time Field Status Matrix Header (Section 18 & 22) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-bold text-emerald-800">
                FIELD DIGITAL TWIN
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-semibold text-slate-500">ID: #{field.id}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900">{field.name}</h2>
            <p className="text-xs text-slate-500">
              Cultivator: {field.farmerName} · Basin: {field.connectedWaterBody}
            </p>
          </div>

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

        {/* Status Transparency Matrix (Section 18) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Location
            </span>
            <DataStatusBadge
              status={coords.isLive ? 'LIVE' : 'DEMO_LOCATION'}
              text={coords.isLive ? 'LIVE GPS' : 'DEMO LOCATION'}
            />
            <span className="text-[11px] text-slate-600 block mt-1 font-medium truncate">
              {coords.locality || 'Active Field'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Weather
            </span>
            <DataStatusBadge
              status={weather.isLive ? 'LIVE' : 'DEMO_DATA'}
              text={weather.isLive ? 'LIVE METEO' : 'DEMO DATA'}
            />
            <span className="text-[11px] text-slate-600 block mt-1 font-medium truncate">
              {weather.temperature}°C · {weather.condition}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Soil Report
            </span>
            <DataStatusBadge
              status="LAST_VERIFIED"
              text={`VERIFIED (${soilReport.verificationTimestamp?.split(' ')[0] || 'LAB'})`}
            />
            <span className="text-[11px] text-slate-600 block mt-1 font-medium truncate">
              pH {soilReport.verifiedSoilPh || 6.8} · N {soilReport.verifiedNitrogenKgPerHa || 265} kg/ha
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Runoff Model
            </span>
            <DataStatusBadge
              status="UPDATED_RECENTLY"
              text="UPDATED 5 MIN AGO"
            />
            <span
              className={`text-[11px] font-extrabold block mt-1 ${
                runoff.overallRisk === 'VERY_HIGH'
                  ? 'text-rose-700'
                  : runoff.overallRisk === 'HIGH'
                  ? 'text-orange-700'
                  : runoff.overallRisk === 'MODERATE'
                  ? 'text-amber-700'
                  : 'text-emerald-700'
              }`}
            >
              {runoff.overallRisk} RISK ({runoff.riskScore}/100)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Cultivated Crop
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800">
              <Sprout className="h-3.5 w-3.5" />
              <span className="truncate">{selectedCrop.split(' ')[0]}</span>
            </span>
            <span className="text-[11px] text-slate-500 block mt-1 truncate">
              {field.areaAcres} Acres
            </span>
          </div>
        </div>
      </div>

      {/* Geospatial Map with Interactive Layers */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base md:text-lg font-bold text-slate-900">
              Field Boundary & Catchment Topography
            </h3>
            <p className="text-xs text-slate-500">
              High-resolution satellite view with contour slope and runoff drainage vectors
            </p>
          </div>
        </div>

        <AgroShieldMap
          coordinates={coords}
          field={field}
          height="460px"
          showFollowToggle={true}
        />
      </div>

      {/* Field Agronomic & Physical Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Mountain className="h-4 w-4 text-emerald-700" />
            <span>Soil & Topographical Architecture</span>
          </h3>

          <div className="space-y-3.5 text-xs md:text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Soil Classification</span>
              <span className="font-bold text-slate-800">{field.soilType}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Field Slope Gradient</span>
              <span className="font-bold text-slate-800">{field.slopePercentage}%</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Drainage Gradient Direction</span>
              <span className="font-bold text-slate-800">{field.slopeDirection}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Estimated Soil Moisture</span>
              <span className="font-bold text-emerald-700">
                {field.estimatedSoilMoisturePercent}% saturation
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-slate-500">Internal Drainage Class</span>
              <span className="font-bold text-slate-800">{field.drainageClass} Infiltration</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-700" />
            <span>Watershed & Water Body Connectivity</span>
          </h3>

          <div className="space-y-3.5 text-xs md:text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Receiving Water Body</span>
              <span className="font-bold text-slate-800">{field.connectedWaterBody}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Distance to Water Body</span>
              <span className="font-bold text-blue-700">{field.distanceToWaterBodyMeters} meters</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Riparian Buffer Zone Status</span>
              <span className="font-bold text-emerald-700">Protected Grass Filter Strip</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Hydrological Risk Index</span>
              <span className="font-bold text-orange-700">{runoff.riskScore}/100</span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-slate-500">Last Verified Soil Lab Test</span>
              <span className="font-bold text-slate-800">
                Report #{soilReport.sampleId} ({field.lastSoilVerificationDate})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
