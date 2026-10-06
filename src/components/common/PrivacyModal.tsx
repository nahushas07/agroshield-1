import React, { useState } from 'react';
import { AgroShieldLogo } from '../brand/AgroShieldLogo';
import { Shield, MapPin, Mic, Camera, Lock, X, CheckCircle } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'privacy' | 'terms' | 'permissions';
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'permissions',
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'permissions'>(defaultTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <AgroShieldLogo size="sm" showSubtitle={false} />
            <span className="text-xs font-bold text-slate-700">Governance & Consent</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-slate-200 px-5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('permissions')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'permissions'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Device Permissions
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'privacy'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Privacy Policy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'terms'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Terms of Use
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs md:text-sm text-slate-700 leading-relaxed">
          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70">
                <div className="flex items-center gap-2 font-bold text-emerald-900 mb-1">
                  <MapPin className="h-4 w-4 text-emerald-700" />
                  <span>GPS Location Permission</span>
                </div>
                <p className="text-xs text-emerald-950">
                  AgroShield uses your continuous browser location solely to center the high-resolution field map,
                  retrieve microclimate weather forecasts, and compute plot-specific runoff velocity vectors. We do not
                  track you in the background when the application tab is closed.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/70">
                <div className="flex items-center gap-2 font-bold text-blue-900 mb-1">
                  <Mic className="h-4 w-4 text-blue-700" />
                  <span>Microphone Permission</span>
                </div>
                <p className="text-xs text-blue-950">
                  Used exclusively for the &ldquo;Ask AgroShield&rdquo; voice assistant to transcribe spoken agronomic queries
                  in English, Kannada, and Hindi. Audio is processed only while the microphone button is actively triggered.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                  <Camera className="h-4 w-4 text-slate-700" />
                  <span>Camera Permission</span>
                </div>
                <p className="text-xs text-slate-600">
                  Optional for agricultural field scouts to attach geotagged core sample photographs during in-situ soil testing collection.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">AgroShield Data Privacy Policy</h4>
              <p>
                AgroShield is designed with strict data minimization principles for agrarian communities.
                All telemetry data (coordinates, weather observations, and soil reports) is stored securely
                to support sustainable irrigation, nutrient stewardship, and watershed protection.
              </p>
              <h5 className="font-bold text-slate-900">Third-Party Geospatial Services</h5>
              <p>
                Map tiles and reverse geocoding are powered by Google Maps Platform in accordance with
                Google&apos;s Privacy Policy (google.com/policies/privacy). Weather forecasts are ingested via verified meteorological feeds.
              </p>
              <p>
                We do not sell, rent, or monetize individual farmer telemetry to advertising brokers.
              </p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Terms & Agronomic Disclaimer</h4>
              <p>
                AgroShield provides algorithmic hydrological runoff risk estimations based on forecasted
                precipitation, terrain gradient, and soil saturation models.
              </p>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900">
                AgroShield does not prescribe chemical application dosages. Always adhere to manufacturer product label
                instructions, statutory safety guidelines, and registered state agricultural department advisories.
              </div>
              <p>
                By using AgroShield, you acknowledge that weather forecasts are probabilistic predictions and
                farmers should exercise independent visual inspection of their field plots before commencing spray activities.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
