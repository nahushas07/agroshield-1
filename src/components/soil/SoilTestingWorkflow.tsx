import React, { useState } from 'react';
import { SoilTestReport, UserRole } from '../../types';
import { DataStatusBadge } from '../common/DataStatusBadge';
import {
  FileCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Camera,
  TestTube2,
  Microscope,
  Award,
  PlusCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface SoilTestingWorkflowProps {
  reports: SoilTestReport[];
  userRole: UserRole;
  onRequestNewTest?: (fieldName: string) => void;
}

export const SoilTestingWorkflow: React.FC<SoilTestingWorkflowProps> = ({
  reports,
  userRole,
  onRequestNewTest,
}) => {
  const [selectedReportId, setSelectedReportId] = useState<string>(reports[0]?.id || '');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestField, setRequestField] = useState('North Canal Paddy Plot 4B');

  const selectedReport = reports.find((r) => r.id === selectedReportId) || reports[0];

  const steps = [
    { key: 'REQUESTED', label: 'Farmer Request', icon: PlusCircle },
    { key: 'ASSIGNED', label: 'Visitor Assigned', icon: Clock },
    { key: 'COLLECTED', label: 'Sample Collected', icon: MapPin },
    { key: 'PROCESSING', label: 'Lab Processing', icon: TestTube2 },
    { key: 'VERIFIED', label: 'Scientist Verification', icon: Microscope },
    { key: 'PUBLISHED', label: 'Report Published', icon: Award },
  ];

  const statusOrder = ['REQUESTED', 'ASSIGNED', 'COLLECTED', 'PROCESSING', 'VERIFIED', 'PUBLISHED'];
  const currentStepIdx = selectedReport ? statusOrder.indexOf(selectedReport.status) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-800">
              AGRONOMIC QUALITY ASSURANCE
            </span>
            <span className="text-slate-300">·</span>
            <DataStatusBadge status="LAST_VERIFIED" text="LAB VERIFIED SAMPLES" />
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900">
            Soil Testing & Lab Certification Workflow
          </h2>
          <p className="text-xs text-slate-500">
            End-to-end sample chain of custody from in-field geotagged core extraction to accredited lab verification.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowRequestModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors flex items-center gap-1.5"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Request Soil Test</span>
        </button>
      </div>

      {/* Report Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {reports.map((rep) => {
          const isSelected = rep.id === selectedReport?.id;
          return (
            <button
              key={rep.id}
              type="button"
              onClick={() => setSelectedReportId(rep.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all shrink-0 text-left ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>Sample #{rep.sampleId}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                    rep.status === 'PUBLISHED'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {rep.status}
                </span>
              </div>
              <span className="text-[11px] font-normal opacity-80 block truncate max-w-[180px]">
                {rep.fieldName}
              </span>
            </button>
          );
        })}
      </div>

      {selectedReport && (
        <>
          {/* Status Progression Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-5">
              Sample Chain-of-Custody Timeline
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div
                    key={step.key}
                    className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                      isCurrent
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/30'
                        : isCompleted
                        ? 'border-slate-300 bg-slate-50/80'
                        : 'border-slate-200/60 bg-slate-50/30 opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon
                        className={`h-4 w-4 ${
                          isCurrent
                            ? 'text-emerald-700'
                            : isCompleted
                            ? 'text-slate-700'
                            : 'text-slate-400'
                        }`}
                      />
                      {isCompleted && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-800 leading-tight">
                      {step.label}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1">
                      {idx === 0 ? 'Day 1' : idx === 2 ? 'Day 3' : idx === 5 ? 'Verified' : 'In Transit'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TWO CLEARLY SEPARATED SECTIONS: FIELD-COLLECTED vs LAB-VERIFIED */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. FIELD-COLLECTED INFORMATION */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-700" />
                    <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">
                      FIELD-COLLECTED INFORMATION
                    </h3>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Geotagged Core
                  </span>
                </div>

                <div className="space-y-3 text-xs md:text-sm">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Sample Identifier</span>
                    <span className="font-mono font-bold text-slate-900">{selectedReport.sampleId}</span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Field Plot & Farmer</span>
                    <span className="font-semibold text-slate-800">
                      {selectedReport.fieldName} ({selectedReport.farmerName})
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Collection GPS Coordinates</span>
                    <span className="font-mono text-slate-800">
                      {selectedReport.collectionGps.lat.toFixed(4)}°N, {selectedReport.collectionGps.lng.toFixed(4)}°E (±{selectedReport.collectionGps.accuracy}m)
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Collection Timestamp</span>
                    <span className="font-medium text-slate-800">{selectedReport.collectionTimestamp}</span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Field Scout / Collector</span>
                    <span className="font-semibold text-slate-800">
                      {selectedReport.collectorName} ({selectedReport.collectorDesignation})
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Core Sampling Depth</span>
                    <span className="font-bold text-slate-800">{selectedReport.collectionDepthCm} cm depth</span>
                  </div>

                  <div className="py-2">
                    <span className="text-slate-500 block mb-1">Field Observations</span>
                    <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 leading-relaxed">
                      {selectedReport.fieldObservations}
                    </p>
                  </div>
                </div>
              </div>

              {selectedReport.photoUrl && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                    <Camera className="h-3.5 w-3.5 text-slate-500" />
                    <span>Geotagged Core Sample Photo</span>
                  </span>
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 h-36 bg-slate-100">
                    <img
                      src={selectedReport.photoUrl}
                      alt="Field soil sample"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-xs font-mono">
                      GPS: {selectedReport.collectionGps.lat.toFixed(4)}°, {selectedReport.collectionGps.lng.toFixed(4)}°
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. LAB-VERIFIED RESULTS */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Microscope className="h-4 w-4 text-blue-700" />
                    <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">
                      LAB-VERIFIED SCIENTIFIC RESULTS
                    </h3>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Accredited Lab
                  </span>
                </div>

                <div className="mb-4">
                  <span className="text-xs font-bold text-slate-800 block">{selectedReport.labName}</span>
                  <span className="text-[11px] text-slate-500 block">
                    Certified Lead Analyst: {selectedReport.technicianName}
                  </span>
                  {selectedReport.certificateNumber && (
                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-1 inline-block">
                      Certificate: {selectedReport.certificateNumber}
                    </span>
                  )}
                </div>

                {selectedReport.verifiedSoilPh !== undefined ? (
                  <div className="space-y-3">
                    {/* Nutrient Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-center">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Soil pH</span>
                        <span className="text-base font-extrabold text-slate-900">
                          {selectedReport.verifiedSoilPh}
                        </span>
                        <span className="text-[10px] text-emerald-700 block font-semibold">Optimal Neutral</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Available N</span>
                        <span className="text-base font-extrabold text-slate-900">
                          {selectedReport.verifiedNitrogenKgPerHa} <span className="text-xs font-normal">kg/ha</span>
                        </span>
                        <span className="text-[10px] text-amber-700 block font-semibold">Slightly Deficient</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Available P</span>
                        <span className="text-base font-extrabold text-slate-900">
                          {selectedReport.verifiedPhosphorusKgPerHa} <span className="text-xs font-normal">kg/ha</span>
                        </span>
                        <span className="text-[10px] text-emerald-700 block font-semibold">Adequate</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Available K</span>
                        <span className="text-base font-extrabold text-slate-900">
                          {selectedReport.verifiedPotassiumKgPerHa} <span className="text-xs font-normal">kg/ha</span>
                        </span>
                        <span className="text-[10px] text-emerald-700 block font-semibold">Good</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Organic Carbon</span>
                        <span className="text-base font-extrabold text-slate-900">
                          {selectedReport.verifiedOrganicCarbonPercent}%
                        </span>
                        <span className="text-[10px] text-emerald-700 block font-semibold">Medium</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Salinity (EC)</span>
                        <span className="text-base font-extrabold text-slate-900">
                          {selectedReport.verifiedElectricalConductivityDsPerM} <span className="text-xs font-normal">dS/m</span>
                        </span>
                        <span className="text-[10px] text-emerald-700 block font-semibold">Normal</span>
                      </div>
                    </div>

                    {/* Scientist Recommendation */}
                    <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 mt-3">
                      <span className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider block mb-1">
                        Agronomic Lab Prescription
                      </span>
                      <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                        {selectedReport.labRecommendation}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-xl bg-amber-50 border border-amber-200 text-center text-amber-900">
                    <Clock className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                    <span className="font-bold text-sm block">Sample Currently Under Spectrometric Analysis</span>
                    <p className="text-xs text-amber-800 mt-1 max-w-sm mx-auto">
                      Lab technicians are processing chemical digestions and ICP-OES elemental analysis. Verified results will appear here upon scientist sign-off.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Verified: {selectedReport.verificationTimestamp || 'In progress'}</span>
                <span className="text-slate-400">ISO/IEC 17025 Accredited Calibration</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Request Soil Sample Collection</h3>
            <p className="text-xs text-slate-500 mb-4">
              A certified field visitor will be assigned to collect geotagged soil core samples from your plot.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Select Field Plot
              </label>
              <select
                value={requestField}
                onChange={(e) => setRequestField(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
              >
                <option value="North Canal Paddy Plot 4B">North Canal Paddy Plot 4B (3.4 Acres)</option>
                <option value="Tungabhadra Left Bank Plot 12">Tungabhadra Left Bank Plot 12 (5.2 Acres)</option>
                <option value="Godavari Terrace Vineyard 8">Godavari Terrace Vineyard 8 (2.8 Acres)</option>
              </select>
            </div>

            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 mb-5">
              Testing includes complete N-P-K nutrient profile, micronutrients, soil pH, organic carbon, and watershed runoff vulnerability assessment.
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onRequestNewTest?.(requestField);
                  setShowRequestModal(false);
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
