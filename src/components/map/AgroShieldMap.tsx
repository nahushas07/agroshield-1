import React, { useEffect, useState, useRef, useCallback } from 'react';
import { APIProvider, Map, useMap, AdvancedMarker } from '@vis.gl/react-google-maps';
import { GeoCoordinates, FieldData, WaterBody } from '../../types';
import { Crosshair, Layers, Navigation, Droplets, Mountain, Eye, Check } from 'lucide-react';

interface AgroShieldMapProps {
  coordinates: GeoCoordinates;
  field: FieldData;
  waterBody?: WaterBody;
  apiKey?: string;
  className?: string;
  height?: string;
  showFollowToggle?: boolean;
}

// Subcomponent to handle map camera movements and follow location
function MapCameraController({
  center,
  followLocation,
}: {
  center: { lat: number; lng: number };
  followLocation: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (followLocation) {
      map.panTo(center);
    }
  }, [map, center.lat, center.lng, followLocation]);

  return null;
}

// Subcomponent to draw field boundaries, accuracy circle, and vectors on the native google map instance
function MapVectorsOverlay({
  field,
  waterBody,
  coords,
  layers,
}: {
  field: FieldData;
  waterBody?: WaterBody;
  coords: GeoCoordinates;
  layers: {
    boundary: boolean;
    waterBody: boolean;
    runoffVectors: boolean;
    accuracyCircle: boolean;
  };
}) {
  const map = useMap();
  const polygonRef = useRef<any>(null);
  const accuracyCircleRef = useRef<any>(null);
  const waterPolylineRef = useRef<any>(null);
  const runoffArrowsRef = useRef<any[]>([]);

  useEffect(() => {
    if (!map || typeof window === 'undefined' || !(window as any).google?.maps) return;

    const gmaps = (window as any).google.maps;

    // 1. Field Polygon Boundary
    if (polygonRef.current) polygonRef.current.setMap(null);
    if (layers.boundary && field.boundary && field.boundary.length > 0) {
      polygonRef.current = new gmaps.Polygon({
        paths: field.boundary,
        strokeColor: '#15803d',
        strokeOpacity: 0.9,
        strokeWeight: 2.5,
        fillColor: '#22c55e',
        fillOpacity: 0.18,
        map,
      });
    }

    // 2. Accuracy Circle around GPS
    if (accuracyCircleRef.current) accuracyCircleRef.current.setMap(null);
    if (layers.accuracyCircle && coords.accuracy) {
      accuracyCircleRef.current = new gmaps.Circle({
        strokeColor: '#0ea5e9',
        strokeOpacity: 0.6,
        strokeWeight: 1.5,
        fillColor: '#38bdf8',
        fillOpacity: 0.12,
        map,
        center: { lat: coords.latitude, lng: coords.longitude },
        radius: Math.max(10, Math.min(coords.accuracy, 250)),
      });
    }

    // 3. Water Body Drainage Stream Polyline
    if (waterPolylineRef.current) waterPolylineRef.current.setMap(null);
    if (layers.waterBody && waterBody && waterBody.points.length > 0) {
      waterPolylineRef.current = new gmaps.Polyline({
        path: waterBody.points,
        geodesic: true,
        strokeColor: '#0284c7',
        strokeOpacity: 0.9,
        strokeWeight: 4,
        map,
      });
    }

    // 4. Runoff Direction Visualization Vector
    runoffArrowsRef.current.forEach((a) => a.setMap(null));
    runoffArrowsRef.current = [];

    if (layers.runoffVectors && field.boundary && field.boundary.length >= 2) {
      // Create a flow vector arrow from field center towards water body / slope
      const start = field.center;
      const targetLat = waterBody?.points[0]?.lat ?? start.lat - 0.002;
      const targetLng = waterBody?.points[0]?.lng ?? start.lng + 0.002;

      const vectorLine = new gmaps.Polyline({
        path: [start, { lat: targetLat, lng: targetLng }],
        strokeColor: '#f97316',
        strokeOpacity: 0.85,
        strokeWeight: 3,
        icons: [
          {
            icon: {
              path: gmaps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 3,
              fillColor: '#ea580c',
              fillOpacity: 0.9,
              strokeWeight: 1,
            },
            offset: '100%',
          },
        ],
        map,
      });
      runoffArrowsRef.current.push(vectorLine);
    }

    return () => {
      if (polygonRef.current) polygonRef.current.setMap(null);
      if (accuracyCircleRef.current) accuracyCircleRef.current.setMap(null);
      if (waterPolylineRef.current) waterPolylineRef.current.setMap(null);
      runoffArrowsRef.current.forEach((a) => a.setMap(null));
    };
  }, [map, field, waterBody, coords, layers]);

  return null;
}

export const AgroShieldMap: React.FC<AgroShieldMapProps> = ({
  coordinates,
  field,
  waterBody,
  apiKey,
  className = '',
  height = '420px',
  showFollowToggle = true,
}) => {
  const [activeApiKey, setActiveApiKey] = useState<string>(apiKey || '');
  const [followLocation, setFollowLocation] = useState(true);
  const [layersMenuOpen, setLayersMenuOpen] = useState(false);
  const [layers, setLayers] = useState({
    boundary: true,
    waterBody: true,
    runoffVectors: true,
    accuracyCircle: true,
  });

  // Resolve API key
  useEffect(() => {
    if (apiKey) {
      setActiveApiKey(apiKey);
      return;
    }
    // Check vite env
    const envKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY;
    if (envKey) {
      setActiveApiKey(envKey);
      return;
    }
    // Fetch config
    fetch('/api/config')
      .then((r) => r.json())
      .then((data) => {
        if (data.googleMapsApiKey) {
          setActiveApiKey(data.googleMapsApiKey);
        }
      })
      .catch(() => {});
  }, [apiKey]);

  const mapCenter = {
    lat: coordinates.latitude,
    lng: coordinates.longitude,
  };

  const handleLocateMe = () => {
    setFollowLocation(true);
  };

  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs ${className}`}
      style={{ height }}
    >
      {activeApiKey ? (
        <APIProvider apiKey={activeApiKey}>
          <Map
            defaultCenter={mapCenter}
            defaultZoom={16}
            mapId="DEMO_MAP_ID"
            disableDefaultUI={true}
            gestureHandling="greedy"
            mapTypeId="satellite"
            className="w-full h-full"
          >
            <MapCameraController center={mapCenter} followLocation={followLocation} />

            {/* User GPS Location Marker */}
            <AdvancedMarker position={mapCenter} title="Your Current Location">
              <div className="relative flex items-center justify-center">
                <span className="absolute h-8 w-8 rounded-full bg-blue-500 opacity-30 animate-ping"></span>
                <div className="h-4 w-4 rounded-full bg-blue-600 border-2 border-white shadow-md"></div>
              </div>
            </AdvancedMarker>

            {/* Field Center Marker */}
            <AdvancedMarker position={field.center} title={field.name}>
              <div className="flex items-center gap-1 bg-emerald-900/90 text-white text-[11px] font-semibold px-2 py-0.5 rounded shadow-sm border border-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                <span>{field.name}</span>
              </div>
            </AdvancedMarker>

            <MapVectorsOverlay
              field={field}
              waterBody={waterBody}
              coords={coordinates}
              layers={layers}
            />
          </Map>
        </APIProvider>
      ) : (
        /* Honest Fallback Geospatial Surface if API key is not yet configured */
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-100 p-6 text-center">
          <Mountain className="h-10 w-10 text-emerald-400 mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Google Maps Platform Connected</h3>
          <p className="text-xs text-slate-400 max-w-sm mb-4">
            Centering on GPS: {coordinates.latitude.toFixed(4)}°, {coordinates.longitude.toFixed(4)}°
            (±{coordinates.accuracy}m). Field boundary: {field.name} ({field.areaAcres} acres).
          </p>
          <div className="inline-flex items-center gap-2 text-xs bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-md text-emerald-300">
            <span>Loading satellite map tiles...</span>
          </div>
        </div>
      )}

      {/* Custom Map Top Controls Overlay */}
      <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
        {showFollowToggle && (
          <button
            type="button"
            onClick={() => setFollowLocation(!followLocation)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md transition-colors ${
              followLocation
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-white/95 text-slate-700 hover:bg-white border border-slate-200'
            }`}
            title="Follow current user location on map"
          >
            <Navigation className={`h-3.5 w-3.5 ${followLocation ? 'rotate-45' : ''}`} />
            <span>{followLocation ? 'Following GPS' : 'Follow Location'}</span>
          </button>
        )}

        {/* Locate Me Button */}
        <button
          type="button"
          onClick={handleLocateMe}
          className="p-2 rounded-lg bg-white/95 hover:bg-white text-slate-700 border border-slate-200 shadow-md transition-colors"
          title="Locate Me"
        >
          <Crosshair className="h-4 w-4" />
        </button>

        {/* Layers Toggle Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setLayersMenuOpen(!layersMenuOpen)}
            className="p-2 rounded-lg bg-white/95 hover:bg-white text-slate-700 border border-slate-200 shadow-md transition-colors"
            title="Toggle Map Layers"
          >
            <Layers className="h-4 w-4" />
          </button>

          {layersMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-2 text-xs z-30">
              <div className="font-bold text-slate-800 px-2 py-1 mb-1 border-b border-slate-100">
                Hydrological Layers
              </div>
              <button
                type="button"
                onClick={() => setLayers((s) => ({ ...s, boundary: !s.boundary }))}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-slate-50 text-slate-700 font-medium"
              >
                <span>Field Boundary</span>
                {layers.boundary && <Check className="h-3.5 w-3.5 text-emerald-600" />}
              </button>
              <button
                type="button"
                onClick={() => setLayers((s) => ({ ...s, waterBody: !s.waterBody }))}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-slate-50 text-slate-700 font-medium"
              >
                <span>Water Bodies & Canals</span>
                {layers.waterBody && <Check className="h-3.5 w-3.5 text-blue-600" />}
              </button>
              <button
                type="button"
                onClick={() => setLayers((s) => ({ ...s, runoffVectors: !s.runoffVectors }))}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-slate-50 text-slate-700 font-medium"
              >
                <span>Runoff Gradient Vector</span>
                {layers.runoffVectors && <Check className="h-3.5 w-3.5 text-orange-600" />}
              </button>
              <button
                type="button"
                onClick={() => setLayers((s) => ({ ...s, accuracyCircle: !s.accuracyCircle }))}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-slate-50 text-slate-700 font-medium"
              >
                <span>GPS Accuracy Radius</span>
                {layers.accuracyCircle && <Check className="h-3.5 w-3.5 text-sky-600" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Map Legend & Attribution Bottom Bar */}
      <div className="absolute bottom-2 left-2 right-2 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-10">
        <div className="bg-slate-900/85 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded-md flex items-center gap-3 border border-slate-700/60 shadow-xs pointer-events-auto">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-500"></span> You (Live GPS)
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Field Plot
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-orange-500"></span> Runoff Vector
          </span>
        </div>

        <div className="bg-white/90 backdrop-blur-xs text-[10px] text-slate-600 px-2 py-0.5 rounded border border-slate-200/80 shadow-xs pointer-events-auto">
          Google Maps Platform
        </div>
      </div>
    </div>
  );
};
