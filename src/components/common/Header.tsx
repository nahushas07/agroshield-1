import React from 'react';
import { UserRole, GeoCoordinates } from '../../types';
import { AgroShieldLogo } from '../brand/AgroShieldLogo';
import { DataStatusBadge } from './DataStatusBadge';
import { DEMO_PRESETS } from '../../data/mockData';
import {
  MapPin,
  Mic,
  Shield,
  Layers,
  ChevronDown,
  Info,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  coords: GeoCoordinates | null;
  isDemoMode: boolean;
  selectedDemoPresetId: string;
  onSelectDemoPreset: (presetId: string) => void;
  onToggleDemoMode: () => void;
  onOpenVoiceAssistant: () => void;
  onOpenPrivacyModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  coords,
  isDemoMode,
  selectedDemoPresetId,
  onSelectDemoPreset,
  onToggleDemoMode,
  onOpenVoiceAssistant,
  onOpenPrivacyModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      {/* Top Demo Banner for Judges (Section 31) */}
      {isDemoMode && (
        <div className="bg-amber-600 text-white text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-extrabold uppercase tracking-wider text-[11px] bg-amber-800 px-1.5 py-0.5 rounded">
              DEMO MODE
            </span>
            <span className="font-medium text-[11px] sm:text-xs">
              Simulating watershed telemetry. Live GPS & weather remain live where permitted.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-amber-100">Basin Preset:</span>
            <select
              value={selectedDemoPresetId}
              onChange={(e) => onSelectDemoPreset(e.target.value)}
              className="bg-amber-700 hover:bg-amber-800 text-white text-[11px] font-bold rounded px-2 py-0.5 border border-amber-500/80 outline-none"
            >
              {DEMO_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={onToggleDemoMode}
              className="underline text-[11px] font-bold text-amber-100 hover:text-white ml-2"
            >
              Switch to Live Device GPS
            </button>
          </div>
        </div>
      )}

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo (Section 1 & 32) */}
        <div className="flex items-center gap-4">
          <AgroShieldLogo size="md" variant="full" />
        </div>

        {/* Center / Right Control Panel */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live GPS location pill */}
          {coords && (
            <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-medium">
              <MapPin className="h-3.5 w-3.5 text-emerald-600" />
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-800">
                  {coords.locality || 'Field Zone'}
                </span>
                <span className="text-slate-400">·</span>
                <DataStatusBadge
                  status={coords.isLive ? 'LIVE' : 'DEMO_LOCATION'}
                  text={coords.isLive ? 'LIVE GPS' : 'DEMO GPS'}
                />
              </div>
            </div>
          )}

          {/* Ask AgroShield Voice Button (Section 11) */}
          <button
            type="button"
            onClick={onOpenVoiceAssistant}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors"
          >
            <Mic className="h-4 w-4" />
            <span className="hidden sm:inline">Ask AgroShield</span>
          </button>

          {/* Role Switcher (Farmer / Officer / Visitor / Lab) */}
          <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-xl p-1 text-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase px-1.5 hidden md:inline">
              Role:
            </span>
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-white text-slate-800 font-bold rounded-lg px-2 py-1 border border-slate-200 text-xs outline-none"
            >
              <option value="farmer">Farmer Dashboard</option>
              <option value="officer">Agricultural Officer</option>
              <option value="field_visitor">Field Visitor Scout</option>
              <option value="soil_lab">Soil Testing Lab</option>
            </select>
          </div>

          {/* Privacy & Consent Button */}
          <button
            type="button"
            onClick={onOpenPrivacyModal}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="Privacy, Permissions & Agronomic Disclaimers"
          >
            <Shield className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
