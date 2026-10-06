import React, { useState, useEffect, useCallback } from 'react';
import {
  UserRole,
  GeoCoordinates,
  FieldData,
  CurrentWeather,
  HourlyForecastItem,
  DailyForecastItem,
  RunoffCalculation,
  SoilTestReport,
} from './types';
import { DEMO_PRESETS, INITIAL_SOIL_REPORTS, DemoPreset } from './data/mockData';
import { locationTracker, LocationState } from './services/locationService';
import { fetchLiveWeatherData, getSyntheticDemoWeather } from './services/weatherService';
import { calculateFieldRunoffRisk } from './services/runoffEngine';

// Components
import { Header } from './components/common/Header';
import { Navigation } from './components/common/Navigation';
import { FarmerDashboard } from './components/dashboard/FarmerDashboard';
import { WeatherCenter } from './components/weather/WeatherCenter';
import { BeforeYouApply } from './components/dashboard/BeforeYouApply';
import { FieldDigitalTwin } from './components/field/FieldDigitalTwin';
import { SoilTestingWorkflow } from './components/soil/SoilTestingWorkflow';
import { AgriculturalOfficerDashboard } from './components/officer/AgriculturalOfficerDashboard';
import { WatershedView } from './components/watershed/WatershedView';
import { AskAgroShieldModal } from './components/voice/AskAgroShieldModal';
import { PrivacyModal } from './components/common/PrivacyModal';
import { LocationPromptModal } from './components/common/LocationPromptModal';
import { AgroShieldLogo } from './components/brand/AgroShieldLogo';
import { DataStatusBadge } from './components/common/DataStatusBadge';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('farmer');
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Preset & Field selection
  const [selectedPresetId, setSelectedPresetId] = useState<string>('cauvery_mandya');
  const currentPreset: DemoPreset =
    DEMO_PRESETS.find((p) => p.id === selectedPresetId) || DEMO_PRESETS[0];

  const [fieldData, setFieldData] = useState<FieldData>(currentPreset.field);
  const [soilReports, setSoilReports] = useState<SoilTestReport[]>(INITIAL_SOIL_REPORTS);

  // GPS Location State
  const [locationState, setLocationState] = useState<LocationState>({
    coords: null,
    status: 'idle',
    error: null,
    isWatching: false,
    lastUpdated: null,
  });
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState<boolean>(false);

  // Weather State
  const [weatherData, setWeatherData] = useState<CurrentWeather>(
    getSyntheticDemoWeather(currentPreset.region).current
  );
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecastItem[]>(
    getSyntheticDemoWeather(currentPreset.region).hourly
  );
  const [dailyForecast, setDailyForecast] = useState<DailyForecastItem[]>(
    getSyntheticDemoWeather(currentPreset.region).daily
  );
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(false);

  // Calculated Runoff Risk State
  const [runoffCalculation, setRunoffCalculation] = useState<RunoffCalculation>(() =>
    calculateFieldRunoffRisk(
      currentPreset.field,
      getSyntheticDemoWeather(currentPreset.region).current,
      getSyntheticDemoWeather(currentPreset.region).hourly
    )
  );

  // Modals
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);

  // 1. Subscribe to Location Tracker
  useEffect(() => {
    const unsubscribe = locationTracker.subscribe((state) => {
      setLocationState(state);
    });

    // Check if geolocation permission was already granted or prompt
    if (typeof window !== 'undefined' && navigator.geolocation) {
      if ('permissions' in navigator) {
        navigator.permissions
          .query({ name: 'geolocation' as PermissionName })
          .then((result) => {
            if (result.state === 'granted') {
              locationTracker.startTracking();
            } else if (result.state === 'prompt') {
              setShowLocationPrompt(true);
            } else {
              // Denied: fallback to demo
              setIsDemoMode(true);
              locationTracker.setDemoLocation(
                currentPreset.coordinates.latitude,
                currentPreset.coordinates.longitude,
                currentPreset.region,
                'Mandya',
                'Karnataka'
              );
            }
          })
          .catch(() => {
            setShowLocationPrompt(true);
          });
      } else {
        setShowLocationPrompt(true);
      }
    } else {
      setIsDemoMode(true);
      locationTracker.setDemoLocation(
        currentPreset.coordinates.latitude,
        currentPreset.coordinates.longitude,
        currentPreset.region,
        'Mandya',
        'Karnataka'
      );
    }

    return () => {
      unsubscribe();
      locationTracker.stopTracking();
    };
  }, []);

  // 2. Fetch Live Weather when coordinates change
  const activeCoordinates: GeoCoordinates = locationState.coords || {
    latitude: currentPreset.coordinates.latitude,
    longitude: currentPreset.coordinates.longitude,
    accuracy: 15,
    timestamp: Date.now(),
    locality: currentPreset.region,
    district: 'Mandya',
    state: 'Karnataka',
    isLive: false,
  };

  const loadWeather = useCallback(async (lat: number, lng: number, locName: string) => {
    setIsWeatherLoading(true);
    try {
      const res = await fetchLiveWeatherData(lat, lng, locName);
      setWeatherData(res.current);
      setHourlyForecast(res.hourly);
      setDailyForecast(res.daily);

      // Recompute runoff risk
      const calc = calculateFieldRunoffRisk(fieldData, res.current, res.hourly);
      setRunoffCalculation(calc);
    } catch (e) {
      const fallback = getSyntheticDemoWeather(locName);
      setWeatherData(fallback.current);
      setHourlyForecast(fallback.hourly);
      setDailyForecast(fallback.daily);
      const calc = calculateFieldRunoffRisk(fieldData, fallback.current, fallback.hourly);
      setRunoffCalculation(calc);
    } finally {
      setIsWeatherLoading(false);
    }
  }, [fieldData]);

  useEffect(() => {
    if (activeCoordinates.latitude && activeCoordinates.longitude) {
      loadWeather(
        activeCoordinates.latitude,
        activeCoordinates.longitude,
        activeCoordinates.locality || currentPreset.region
      );
    }
  }, [
    activeCoordinates.latitude,
    activeCoordinates.longitude,
    activeCoordinates.locality,
    currentPreset.region,
    loadWeather,
  ]);

  // Handle Preset Selection
  const handleSelectDemoPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const p = DEMO_PRESETS.find((item) => item.id === presetId) || DEMO_PRESETS[0];
    setFieldData(p.field);
    locationTracker.setDemoLocation(
      p.coordinates.latitude,
      p.coordinates.longitude,
      p.region,
      p.watershed.basinName,
      'Region'
    );
    loadWeather(p.coordinates.latitude, p.coordinates.longitude, p.region);
  };

  const handleRequestGpsPermission = async () => {
    setShowLocationPrompt(false);
    const success = await locationTracker.startTracking();
    if (success) {
      setIsDemoMode(false);
    } else {
      setShowLocationPrompt(true);
    }
  };

  const handleUseDemoLocation = () => {
    setShowLocationPrompt(false);
    setIsDemoMode(true);
    locationTracker.setDemoLocation(
      currentPreset.coordinates.latitude,
      currentPreset.coordinates.longitude,
      currentPreset.region,
      'Mandya',
      'Karnataka'
    );
    loadWeather(
      currentPreset.coordinates.latitude,
      currentPreset.coordinates.longitude,
      currentPreset.region
    );
  };

  const handleSwitchToLiveDeviceGps = async () => {
    setIsDemoMode(false);
    await locationTracker.startTracking();
  };

  const handleRequestNewSoilTest = (fName: string) => {
    const newRep: SoilTestReport = {
      id: `REP-${Date.now()}`,
      sampleId: `AGS-REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      fieldId: fieldData.id,
      fieldName: fName,
      farmerName: fieldData.farmerName,
      status: 'REQUESTED',
      collectionGps: {
        lat: activeCoordinates.latitude,
        lng: activeCoordinates.longitude,
        accuracy: activeCoordinates.accuracy,
      },
      collectionTimestamp: 'Pending Assignment',
      collectorName: 'Unassigned',
      collectorDesignation: 'District Agronomy Extension Office',
      collectionDepthCm: 15,
      fieldObservations: 'Farmer requested soil sample collection for seasonal nutrient plan.',
      labName: 'Central Soil Quality Laboratory',
      technicianName: 'To be assigned',
    };
    setSoilReports([newRep, ...soilReports]);
    setActiveTab('soil');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf8] text-slate-900 selection:bg-emerald-200">
      {/* Top Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={(role) => {
          setCurrentRole(role);
          if (role === 'officer') setActiveTab('officer');
          else if (role === 'soil_lab' || role === 'field_visitor') setActiveTab('soil');
          else setActiveTab('dashboard');
        }}
        coords={activeCoordinates}
        isDemoMode={isDemoMode}
        selectedDemoPresetId={selectedPresetId}
        onSelectDemoPreset={handleSelectDemoPreset}
        onToggleDemoMode={handleSwitchToLiveDeviceGps}
        onOpenVoiceAssistant={() => setIsVoiceModalOpen(true)}
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
      />

      {/* Navigation Bars */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentRole={currentRole}
        onOpenVoiceAssistant={() => setIsVoiceModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
        {activeTab === 'dashboard' && (
          <FarmerDashboard
            field={fieldData}
            coords={activeCoordinates}
            weather={weatherData}
            hourly={hourlyForecast}
            runoff={runoffCalculation}
            soilReport={soilReports[0]}
            onOpenVoiceAssistant={() => setIsVoiceModalOpen(true)}
            onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'field' && (
          <FieldDigitalTwin
            field={fieldData}
            coords={activeCoordinates}
            weather={weatherData}
            soilReport={soilReports[0]}
            runoff={runoffCalculation}
            onSelectCrop={(c) => setFieldData((prev) => ({ ...prev, crop: c }))}
          />
        )}

        {activeTab === 'weather' && (
          <WeatherCenter
            weather={weatherData}
            hourly={hourlyForecast}
            daily={dailyForecast}
            field={fieldData}
            localityText={activeCoordinates.locality || currentPreset.region}
            isLive={weatherData.isLive}
            onRefresh={() =>
              loadWeather(
                activeCoordinates.latitude,
                activeCoordinates.longitude,
                activeCoordinates.locality || currentPreset.region
              )
            }
          />
        )}

        {activeTab === 'before_apply' && (
          <BeforeYouApply
            field={fieldData}
            hourlyForecast={hourlyForecast}
            currentWeather={weatherData}
          />
        )}

        {activeTab === 'soil' && (
          <SoilTestingWorkflow
            reports={soilReports}
            userRole={currentRole}
            onRequestNewTest={handleRequestNewSoilTest}
          />
        )}

        {activeTab === 'watershed' && (
          <WatershedView
            watershed={currentPreset.watershed}
            field={fieldData}
            waterBody={currentPreset.waterBody}
          />
        )}

        {activeTab === 'officer' && (
          <AgriculturalOfficerDashboard />
        )}
      </main>

      {/* Footer */}
      <footer className="hidden md:block bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <AgroShieldLogo size="sm" showSubtitle={false} />
            <span>Intelligent Watershed-Level Farming & Runoff Prevention Platform</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsPrivacyModalOpen(true)}
              className="hover:text-slate-800 transition-colors"
            >
              Privacy Policy & Terms
            </button>
            <span>·</span>
            <span>Google Maps Platform & Open Meteorological Integration</span>
            <span>·</span>
            <span>© 2026 AgroShield</span>
          </div>
        </div>
      </footer>

      {/* Voice Assistant Modal */}
      <AskAgroShieldModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        fieldData={fieldData}
        weatherData={weatherData}
        runoffData={runoffCalculation}
        soilReport={soilReports[0]}
        locationData={activeCoordinates}
      />

      {/* Privacy & Agronomic Governance Modal */}
      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      {/* Initial GPS Location Permission Explanation Modal */}
      <LocationPromptModal
        isOpen={showLocationPrompt}
        status={locationState.status === 'denied' || locationState.status === 'error' ? 'denied' : 'prompting'}
        errorMessage={locationState.error?.message}
        onRequestPermission={handleRequestGpsPermission}
        onUseDemoLocation={handleUseDemoLocation}
        onClose={() => setShowLocationPrompt(false)}
      />
    </div>
  );
}
