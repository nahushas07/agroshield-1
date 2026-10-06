import React from 'react';
import { FieldData, WatershedBasinInfo, WaterBody } from '../../types';
import { DataStatusBadge } from '../common/DataStatusBadge';
import {
  Waves,
  Mountain,
  Compass,
  Shield,
  Layers,
  ArrowRight,
  Info,
  Droplet,
} from 'lucide-react';

interface WatershedViewProps {
  watershed: WatershedBasinInfo;
  field: FieldData;
  waterBody: WaterBody;
}

export const WatershedView: React.FC<WatershedViewProps> = ({
  watershed,
  field,
  waterBody,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-emerald-950 text-white rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-sky-300">
                HYDROLOGICAL DRAINAGE SYSTEM
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-300 font-mono">
                Code: {watershed.subBasinCode}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">
              {watershed.basinName}
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1">
              Sub-catchment drainage network connecting {field.name} to {watershed.majorRiver}.
            </p>
          </div>

          <div className="bg-white/10 rounded-xl px-4 py-2 border border-white/10 text-right">
            <span className="text-[10px] uppercase font-bold text-slate-300 block">
              Upstream Drainage Area
            </span>
            <span className="text-lg font-black text-sky-300">
              {watershed.upstreamCatchmentKm2} km²
            </span>
          </div>
        </div>

        {/* Basin Key Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="bg-white/10 rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-slate-300 block">Drainage Density</span>
            <span className="text-base font-bold text-white">{watershed.drainageDensity}</span>
          </div>

          <div className="bg-white/10 rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-slate-300 block">Riparian Buffer Width</span>
            <span className="text-base font-bold text-emerald-300">
              {watershed.bufferZoneMeters} meters
            </span>
          </div>

          <div className="bg-white/10 rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-slate-300 block">Monitored Basin Fields</span>
            <span className="text-base font-bold text-white">
              {watershed.monitoredFieldsCount} plots
            </span>
          </div>

          <div className="bg-white/10 rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-slate-300 block">High Runoff Watch</span>
            <span className="text-base font-bold text-amber-300">
              {watershed.highRiskFieldsCount} plots
            </span>
          </div>
        </div>
      </div>

      {/* Hydrological Flow Connectivity Diagram (Field -> Drainage -> Stream -> River) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base md:text-lg font-bold text-slate-900">
              Potential Runoff Connectivity Model
            </h3>
            <p className="text-xs text-slate-500">
              Sequential hydrological gradient from field furrow to major aquatic receiver
            </p>
          </div>

          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            Modelled Potential Connectivity
          </span>
        </div>

        {/* Schematic Flow Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 my-6">
          {/* Step 1: Field */}
          <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/70 relative">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
              Source Plot
            </span>
            <h4 className="text-sm font-extrabold text-slate-900 mb-1">{field.name}</h4>
            <div className="text-xs text-slate-600 space-y-0.5">
              <div>Slope: {field.slopePercentage}%</div>
              <div>Crop: {field.crop}</div>
              <div>Infiltration: {field.drainageClass}</div>
            </div>
          </div>

          {/* Step 2: Overland Drainage Slope */}
          <div className="p-4 rounded-xl border border-orange-200 bg-orange-50/70 relative">
            <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider block mb-1">
              Overland Pathway
            </span>
            <h4 className="text-sm font-extrabold text-slate-900 mb-1">
              {field.slopeDirection}
            </h4>
            <div className="text-xs text-slate-600 space-y-0.5">
              <div>Buffer: {field.distanceToWaterBodyMeters}m filter strip</div>
              <div>Velocity: Moderate sheet flow</div>
              <div>Erosion Risk: Low vegetative cover</div>
            </div>
          </div>

          {/* Step 3: Tributary Stream */}
          <div className="p-4 rounded-xl border border-sky-300 bg-sky-50/70 relative">
            <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block mb-1">
              Local Stream / Canal
            </span>
            <h4 className="text-sm font-extrabold text-slate-900 mb-1">{waterBody.name}</h4>
            <div className="text-xs text-slate-600 space-y-0.5">
              <div>Type: {waterBody.type.toUpperCase()}</div>
              <div>Distance: {waterBody.distanceMeters}m from field</div>
              <div>Discharge: Active irrigation flow</div>
            </div>
          </div>

          {/* Step 4: River Basin */}
          <div className="p-4 rounded-xl border border-blue-300 bg-blue-50/70 relative">
            <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block mb-1">
              Catchment Destination
            </span>
            <h4 className="text-sm font-extrabold text-slate-900 mb-1">
              {watershed.majorRiver}
            </h4>
            <div className="text-xs text-slate-600 space-y-0.5">
              <div>Sub-Basin: {watershed.subBasinCode}</div>
              <div>Aquatic Ecosystem: High Protection</div>
              <div>Water Quality Class: A-1</div>
            </div>
          </div>
        </div>

        {/* Scientific Grounding Notice */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
          <Info className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-bold text-slate-800">Hydrological Modeling Clarification: </span>
            This visualization illustrates <strong>potential runoff connectivity</strong> based on digital elevation
            contours and hydrographic network geometry. It is an algorithmic hydrological estimation and does NOT
            represent confirmed chemical movement or contamination.
          </p>
        </div>
      </div>
    </div>
  );
};
