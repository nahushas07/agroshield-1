import React, { useState, useMemo } from 'react';
import { REGIONAL_OFFICER_FIELDS } from '../../data/mockData';
import { RiskLevel } from '../../types';
import { DataStatusBadge } from '../common/DataStatusBadge';
import {
  ShieldAlert,
  MapPin,
  Filter,
  Search,
  Building2,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  Compass,
  CheckCircle,
} from 'lucide-react';

interface AgriculturalOfficerDashboardProps {
  apiKey?: string;
}

export const AgriculturalOfficerDashboard: React.FC<AgriculturalOfficerDashboardProps> = () => {
  const [districtFilter, setDistrictFilter] = useState('All');
  const [talukFilter, setTalukFilter] = useState('All');
  const [cropFilter, setCropFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState<'All' | RiskLevel>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFields = useMemo(() => {
    return REGIONAL_OFFICER_FIELDS.filter((f) => {
      if (districtFilter !== 'All' && f.district !== districtFilter) return false;
      if (talukFilter !== 'All' && f.taluk !== talukFilter) return false;
      if (cropFilter !== 'All' && f.crop !== cropFilter) return false;
      if (riskFilter !== 'All' && f.currentRisk !== riskFilter) return false;
      if (
        searchQuery &&
        !f.farmer.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !f.village.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !f.id.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [districtFilter, talukFilter, cropFilter, riskFilter, searchQuery]);

  const stats = useMemo(() => {
    const totalFields = filteredFields.length;
    const totalHectares = filteredFields.reduce((acc, f) => acc + f.areaHa, 0);
    const highOrVeryHigh = filteredFields.filter(
      (f) => f.currentRisk === 'HIGH' || f.currentRisk === 'VERY_HIGH'
    ).length;
    const avgSlope =
      filteredFields.reduce((acc, f) => acc + f.slope, 0) / (totalFields || 1);

    return {
      totalFields,
      totalHectares: totalHectares.toFixed(1),
      highRiskCount: highOrVeryHigh,
      avgSlope: avgSlope.toFixed(1),
    };
  }, [filteredFields]);

  return (
    <div className="space-y-6">
      {/* Command Center Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
                DISTRICT WATERSHED COMMAND CENTER
              </span>
              <span className="text-slate-500">·</span>
              <DataStatusBadge
                status="LIVE"
                text="CONTINUOUS HYDROMETRIC MONITORING"
                className="text-white"
              />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              Agricultural Officer Basin Oversight
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1">
              Regional command center: real-time spatial runoff hazard estimation and riparian buffer compliance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                alert('Exporting district runoff compliance report (CSV/GeoJSON)');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Basin Summary</span>
            </button>
          </div>
        </div>

        {/* Aggregate KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/60">
            <span className="text-xs font-semibold text-slate-400 block mb-1">
              Monitored Farmland
            </span>
            <div className="text-2xl font-black text-white">{stats.totalHectares} Ha</div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Across {stats.totalFields} registered field parcels
            </span>
          </div>

          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/60">
            <span className="text-xs font-semibold text-rose-300 block mb-1">
              Elevated Runoff Hazard
            </span>
            <div className="text-2xl font-black text-rose-400">{stats.highRiskCount} Plots</div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              High / Very High precipitation vulnerability
            </span>
          </div>

          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/60">
            <span className="text-xs font-semibold text-slate-400 block mb-1">
              Mean Basin Slope
            </span>
            <div className="text-2xl font-black text-white">{stats.avgSlope}%</div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Average overland drainage velocity gradient
            </span>
          </div>

          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/60">
            <span className="text-xs font-semibold text-emerald-400 block mb-1">
              Water Body Buffer Health
            </span>
            <div className="text-2xl font-black text-emerald-400">92.4%</div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Fields compliant with riparian setbacks
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar (Section 20: District, Taluk, Village, Crop, Risk) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 shadow-xs">
        <div className="flex items-center gap-2 font-bold text-xs text-slate-800 uppercase tracking-wider mb-3">
          <Filter className="h-4 w-4 text-emerald-700" />
          <span>Regional Geospatial Filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Search Farmer / ID
            </label>
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Name or Plot ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-emerald-600"
              />
            </div>
          </div>

          {/* District */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              District
            </label>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white"
            >
              <option value="All">All Districts (Mandya)</option>
              <option value="Mandya">Mandya</option>
            </select>
          </div>

          {/* Taluk */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Taluk
            </label>
            <select
              value={talukFilter}
              onChange={(e) => setTalukFilter(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white"
            >
              <option value="All">All Taluks</option>
              <option value="Pandavapura">Pandavapura</option>
              <option value="Srirangapatna">Srirangapatna</option>
            </select>
          </div>

          {/* Crop */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Crop
            </label>
            <select
              value={cropFilter}
              onChange={(e) => setCropFilter(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white"
            >
              <option value="All">All Crops</option>
              <option value="Paddy">Paddy</option>
              <option value="Sugarcane">Sugarcane</option>
              <option value="Ragi & Pulses">Ragi & Pulses</option>
            </select>
          </div>

          {/* Risk Level */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Runoff Risk Level
            </label>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as any)}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white"
            >
              <option value="All">All Risk Levels</option>
              <option value="VERY_HIGH">VERY HIGH</option>
              <option value="HIGH">HIGH</option>
              <option value="MODERATE">MODERATE</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
        </div>
      </div>

      {/* Field Parcels Risk Registry Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Active Regional Field Risk Directory
            </h3>
            <p className="text-xs text-slate-500">
              Real-time hydrological vulnerability rankings across agricultural sub-basins
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
            Showing {filteredFields.length} of {REGIONAL_OFFICER_FIELDS.length} fields
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Plot ID & Farmer</th>
                <th className="py-3 px-4">Village / Taluk</th>
                <th className="py-3 px-4">Crop & Area</th>
                <th className="py-3 px-4">Slope</th>
                <th className="py-3 px-4">Stream Distance</th>
                <th className="py-3 px-4">Forecast Rain</th>
                <th className="py-3 px-4">Runoff Risk</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFields.map((f) => {
                const isVeryHigh = f.currentRisk === 'VERY_HIGH';
                const isHigh = f.currentRisk === 'HIGH';
                const isModerate = f.currentRisk === 'MODERATE';

                return (
                  <tr key={f.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{f.farmer}</div>
                      <span className="text-[10px] font-mono text-slate-400">#{f.id}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-700">{f.village}</div>
                      <span className="text-[10px] text-slate-400">{f.taluk}, {f.district}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{f.crop}</div>
                      <span className="text-[11px] text-slate-500">{f.areaHa} Hectares</span>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {f.slope}% gradient
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`font-semibold ${
                          f.distanceToStreamM <= 50 ? 'text-rose-700' : 'text-slate-700'
                        }`}
                      >
                        {f.distanceToStreamM}m
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {f.forecastRainfallMm} mm next 6h
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[11px] font-extrabold px-2 py-0.5 rounded ${
                          isVeryHigh
                            ? 'bg-rose-100 text-rose-900'
                            : isHigh
                            ? 'bg-orange-100 text-orange-900'
                            : isModerate
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {f.currentRisk}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {f.lastUpdate}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
