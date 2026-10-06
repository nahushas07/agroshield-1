import { GeoCoordinates } from '../types';

export type LocationErrorCode =
  | 'PERMISSION_DENIED'
  | 'POSITION_UNAVAILABLE'
  | 'TIMEOUT'
  | 'NOT_SUPPORTED'
  | 'UNKNOWN';

export interface LocationState {
  coords: GeoCoordinates | null;
  status: 'idle' | 'prompting' | 'active' | 'denied' | 'error' | 'fallback_demo';
  error: { code: LocationErrorCode; message: string } | null;
  isWatching: boolean;
  lastUpdated: number | null;
}

// Reverse geocoding helper (uses Google Geocoder if available, or Nominatim/cached)
export async function reverseGeocodeCoordinates(
  lat: number,
  lng: number,
  apiKey?: string
): Promise<{ locality: string; district: string; state: string }> {
  try {
    // 1. If Google Maps window.google is loaded, use its Geocoder
    if (typeof window !== 'undefined' && (window as any).google?.maps?.Geocoder) {
      const geocoder = new (window as any).google.maps.Geocoder();
      const response = await new Promise<any>((resolve, reject) => {
        geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
          if (status === 'OK' && results && results[0]) {
            resolve(results);
          } else {
            reject(new Error(status));
          }
        });
      });

      if (response && response[0]) {
        let locality = '';
        let district = '';
        let state = '';
        for (const comp of response[0].address_components) {
          if (comp.types.includes('sublocality') || comp.types.includes('locality')) {
            locality = locality || comp.long_name;
          }
          if (comp.types.includes('administrative_area_level_2')) {
            district = comp.long_name;
          }
          if (comp.types.includes('administrative_area_level_1')) {
            state = comp.long_name;
          }
        }
        return {
          locality: locality || district || 'Local Catchment Area',
          district: district || 'Agricultural District',
          state: state || 'State',
        };
      }
    }

    // 2. Fallback to OpenStreetMap reverse geocoding with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
      {
        headers: { 'Accept-Language': 'en' },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const locality =
        addr.village || addr.suburb || addr.town || addr.city || addr.hamlet || 'Field Zone';
      const district = addr.county || addr.state_district || addr.district || 'Rural Catchment';
      const state = addr.state || 'Region';
      return { locality, district, state };
    }
  } catch (e) {
    // Graceful fallback
  }

  // Fallback estimation by latitude/longitude approximation
  return {
    locality: `Plot (${lat.toFixed(3)}°, ${lng.toFixed(3)}°)`,
    district: 'Watershed Sub-Catchment',
    state: 'Agronomic Region',
  };
}

class LocationTracker {
  private watchId: number | null = null;
  private subscribers: Array<(state: LocationState) => void> = [];
  private lastDispatchTime = 0;
  private readonly THROTTLE_MS = 2500; // sensible throttling to avoid battery & API waste

  private state: LocationState = {
    coords: null,
    status: 'idle',
    error: null,
    isWatching: false,
    lastUpdated: null,
  };

  public getState(): LocationState {
    return this.state;
  }

  public subscribe(cb: (state: LocationState) => void): () => void {
    this.subscribers.push(cb);
    cb(this.state);
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== cb);
    };
  }

  private notify() {
    this.subscribers.forEach((cb) => cb(this.state));
  }

  public async startTracking(onPermissionRequired?: () => void): Promise<boolean> {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      this.state = {
        ...this.state,
        status: 'error',
        error: {
          code: 'NOT_SUPPORTED',
          message: 'Browser does not support GPS geolocation.',
        },
      };
      this.notify();
      return false;
    }

    if (this.watchId !== null) {
      return true; // Already watching
    }

    this.state = { ...this.state, status: 'prompting', error: null };
    this.notify();

    return new Promise((resolve) => {
      try {
        this.watchId = navigator.geolocation.watchPosition(
          async (pos) => {
            const now = Date.now();
            if (now - this.lastDispatchTime < this.THROTTLE_MS && this.state.coords) {
              return; // Throttled
            }
            this.lastDispatchTime = now;

            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;

            let locality = this.state.coords?.locality;
            let district = this.state.coords?.district;
            let state = this.state.coords?.state;

            // Only reverse geocode if moved > 500m or first time
            const needsGeocode =
              !locality ||
              !this.state.coords ||
              Math.hypot(lat - this.state.coords.latitude, lng - this.state.coords.longitude) >
                0.005;

            if (needsGeocode) {
              const geo = await reverseGeocodeCoordinates(lat, lng);
              locality = geo.locality;
              district = geo.district;
              state = geo.state;
            }

            const updatedCoords: GeoCoordinates = {
              latitude: lat,
              longitude: lng,
              accuracy: Math.round(pos.coords.accuracy),
              heading: pos.coords.heading,
              speed: pos.coords.speed,
              timestamp: pos.timestamp,
              locality,
              district,
              state,
              isLive: true,
            };

            this.state = {
              coords: updatedCoords,
              status: 'active',
              error: null,
              isWatching: true,
              lastUpdated: now,
            };
            this.notify();
            resolve(true);
          },
          (err) => {
            let code: LocationErrorCode = 'UNKNOWN';
            let message = 'Unable to determine device location.';

            if (err.code === err.PERMISSION_DENIED) {
              code = 'PERMISSION_DENIED';
              message =
                'Location access was declined. AgroShield needs GPS permission for field-specific weather, maps and runoff alerts.';
            } else if (err.code === err.POSITION_UNAVAILABLE) {
              code = 'POSITION_UNAVAILABLE';
              message = 'Location signal currently unavailable. Check device GPS settings.';
            } else if (err.code === err.TIMEOUT) {
              code = 'TIMEOUT';
              message = 'GPS location request timed out.';
            }

            this.state = {
              ...this.state,
              status: 'denied',
              error: { code, message },
              isWatching: false,
            };
            this.notify();
            resolve(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 5000,
          }
        );
      } catch (err) {
        this.state = {
          ...this.state,
          status: 'error',
          error: { code: 'UNKNOWN', message: 'Failed to initialize GPS.' },
          isWatching: false,
        };
        this.notify();
        resolve(false);
      }
    });
  }

  public stopTracking() {
    if (this.watchId !== null && typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.state = {
      ...this.state,
      isWatching: false,
    };
    this.notify();
  }

  public setDemoLocation(lat: number, lng: number, locality: string, district: string, state: string) {
    this.stopTracking();
    this.state = {
      coords: {
        latitude: lat,
        longitude: lng,
        accuracy: 12,
        heading: null,
        speed: null,
        timestamp: Date.now(),
        locality,
        district,
        state,
        isLive: false,
      },
      status: 'fallback_demo',
      error: null,
      isWatching: false,
      lastUpdated: Date.now(),
    };
    this.notify();
  }
}

export const locationTracker = new LocationTracker();
