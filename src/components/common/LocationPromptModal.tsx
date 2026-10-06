import React from 'react';
import { AgroShieldLogo } from '../brand/AgroShieldLogo';
import { MapPin, ShieldAlert, Sparkles, Navigation } from 'lucide-react';

interface LocationPromptModalProps {
  isOpen: boolean;
  status: 'prompting' | 'denied' | 'error';
  errorMessage?: string;
  onRequestPermission: () => void;
  onUseDemoLocation: () => void;
  onClose: () => void;
}

export const LocationPromptModal: React.FC<LocationPromptModalProps> = ({
  isOpen,
  status,
  errorMessage,
  onRequestPermission,
  onUseDemoLocation,
  onClose,
}) => {
  if (!isOpen) return null;

  const isDenied = status === 'denied' || status === 'error';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 text-center">
        <div className="flex justify-center mb-4">
          <AgroShieldLogo size="md" variant="mark" />
        </div>

        {!isDenied ? (
          <>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-2">
              Enable Device GPS Location
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              &ldquo;AgroShield uses your location to show your field, local weather and field-specific agricultural insights.&rdquo;
            </p>

            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200/80 mb-6 text-left text-xs text-emerald-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <Sparkles className="h-4 w-4 text-emerald-700" />
                <span>How AgroShield uses your GPS:</span>
              </div>
              <ul className="space-y-1 text-emerald-900">
                <li>• Pinpoints exact field boundary coordinates</li>
                <li>• Delivers live microclimate precipitation forecasts</li>
                <li>• Computes real-time slope and runoff risk vectors</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={onRequestPermission}
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Navigation className="h-4 w-4" />
                <span>Allow GPS Location</span>
              </button>

              <button
                type="button"
                onClick={onUseDemoLocation}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Use Demo Location (Mandya Basin)
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="h-6 w-6" />
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 mb-2">
              Location Access Needed
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              {errorMessage ||
                'Location access is needed for field-specific weather and live map features.'}
            </p>

            <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 mb-6 text-xs text-amber-900 text-left">
              <strong>Notice:</strong> If you proceed with Demo Location, the app will clearly display
              <span className="font-bold text-amber-950"> &lsquo;DEMO LOCATION&rsquo;</span> and simulate regional data.
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={onRequestPermission}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors"
              >
                Try Again
              </button>

              <button
                type="button"
                onClick={onUseDemoLocation}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
              >
                Use Demo Location (Mandya)
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
