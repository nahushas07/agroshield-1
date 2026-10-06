export type DataStatus = 'LIVE' | 'UPDATED_RECENTLY' | 'LAST_VERIFIED' | 'DEMO_DATA' | 'UNAVAILABLE';

export type UserRole = 'farmer' | 'officer' | 'field_visitor' | 'soil_lab';

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';

export type SuitabilityStatus = 'SUITABLE' | 'CAUTION' | 'HIGH_CAUTION';

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number; // in meters
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
  locality?: string;
  district?: string;
  state?: string;
  isLive: boolean;
}

export interface CurrentWeather {
  temperature: number; // °C
  feelsLike: number; // °C
  condition: string;
  weatherCode: number;
  rainProbability: number; // %
  precipitation: number; // mm
  recentRainfall24h: number; // mm
  humidity: number; // %
  windSpeed: number; // km/h
  windDirection: number; // degrees
  uvIndex: number;
  thunderstormProb: number; // %
  timestamp: number;
  locality: string;
  isLive: boolean;
}

export interface HourlyForecastItem {
  time: string; // ISO or '10 AM'
  hour: number;
  timestamp: number;
  temperature: number;
  precipitationProbability: number;
  precipitation: number; // mm
  condition: string;
  weatherCode: number;
  windSpeed: number;
  runoffRisk: RiskLevel;
  runoffReason: string;
}

export interface DailyForecastItem {
  date: string;
  dayName: string;
  tempMax: number;
  tempMin: number;
  precipitationProbability: number;
  precipitationSum: number; // mm
  condition: string;
  weatherCode: number;
  runoffRisk: RiskLevel;
}

export interface FieldBoundaryPoint {
  lat: number;
  lng: number;
}

export interface WaterBody {
  id: string;
  name: string;
  type: 'river' | 'canal' | 'lake' | 'drainage_stream';
  distanceMeters: number;
  points: FieldBoundaryPoint[];
}

export interface FieldData {
  id: string;
  name: string;
  farmerName: string;
  center: { lat: number; lng: number };
  boundary: FieldBoundaryPoint[];
  areaAcres: number;
  crop: string;
  sowingDate: string;
  soilType: string;
  slopePercentage: number;
  slopeDirection: string;
  estimatedSoilMoisturePercent: number;
  drainageClass: 'Good' | 'Moderate' | 'Poor';
  connectedWaterBody: string;
  distanceToWaterBodyMeters: number;
  lastSoilVerificationDate: string;
}

export interface RunoffCalculation {
  overallRisk: RiskLevel;
  riskScore: number; // 0 - 100
  reasons: string[];
  factors: {
    rainfallProbability: number;
    forecastPrecipitationMm: number;
    recentRainfallMm: number;
    soilMoisturePercent: number;
    slopeScore: number;
    watershedProximityScore: number;
  };
  recommendation: string;
  calculatedAt: number;
  isLive: boolean;
}

export interface SoilTestReport {
  id: string;
  sampleId: string;
  fieldId: string;
  fieldName: string;
  farmerName: string;
  status: 'REQUESTED' | 'ASSIGNED' | 'COLLECTED' | 'PROCESSING' | 'VERIFIED' | 'PUBLISHED';
  
  // Field collected data
  collectionGps: { lat: number; lng: number; accuracy: number };
  collectionTimestamp: string;
  collectorName: string;
  collectorDesignation: string;
  collectionDepthCm: number;
  fieldObservations: string;
  photoUrl?: string;

  // Lab verified data
  labName: string;
  technicianName: string;
  verificationTimestamp?: string;
  verifiedNitrogenKgPerHa?: number; // target: 280-560
  verifiedPhosphorusKgPerHa?: number; // target: 23-56
  verifiedPotassiumKgPerHa?: number; // target: 140-280
  verifiedSoilPh?: number; // target: 6.5-7.5
  verifiedOrganicCarbonPercent?: number; // target: 0.5-0.75
  verifiedElectricalConductivityDsPerM?: number; // target: < 1.0
  labRecommendation?: string;
  certificateNumber?: string;
}

export interface PlannedActivityCheck {
  activityType: 'fertilizer' | 'pesticide' | 'irrigation' | 'tillage';
  plannedTimestamp: number;
  plannedDateTimeString: string;
  suitability: SuitabilityStatus;
  headline: string;
  reasons: string[];
  alternativeWindow?: string;
  disclaimer: string;
}

export interface VoiceMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  language: 'en' | 'kn' | 'hi';
  timestamp: number;
  toolCallName?: string;
  toolOutputSnippet?: string;
}

export interface WatershedBasinInfo {
  basinName: string;
  subBasinCode: string;
  majorRiver: string;
  drainageDensity: string;
  upstreamCatchmentKm2: number;
  bufferZoneMeters: number;
  monitoredFieldsCount: number;
  highRiskFieldsCount: number;
}
