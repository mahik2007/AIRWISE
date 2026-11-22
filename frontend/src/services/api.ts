import { AirQualityPayload, GeocodingResult, ChatRecommendationResponse, TransportComparison } from '../types';

const BASE_URL = '/api';

export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  const res = await fetch(`${BASE_URL}/geocode?q=${encodeURIComponent(query)}`);
  if (!res.ok) {
    throw new Error('Failed to search locations');
  }
  const data = await res.json();
  return data.results || [];
}

export async function getAirQuality(
  lat: number,
  lon: number,
  name: string,
  country: string = '',
  admin1?: string
): Promise<AirQualityPayload> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    name,
    country,
  });
  if (admin1) params.append('admin1', admin1);

  const res = await fetch(`${BASE_URL}/air-quality?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch air quality data');
  }
  return res.json();
}

export async function sendChatMessage(payload: {
  message: string;
  location?: { name: string; latitude?: number; longitude?: number; country?: string };
  airQuality?: {
    usAqi?: number;
    usAqiCategory?: string;
    europeanAqi?: number;
    pm2_5?: number;
    pm10?: number;
    nitrogenDioxide?: number;
    dataSource?: string;
    isObservedStation?: boolean;
  };
  lifestyle?: {
    userRole?: 'student' | 'working_professional' | 'homemaker' | 'caregiver' | 'general';
    hasVulnerableFamilyMembers?: boolean;
    commutePreference?: string;
    indoorPurifierAvailable?: boolean;
  };
  locale?: 'en' | 'hi';
}): Promise<ChatRecommendationResponse> {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to communicate with AIRWISE AI');
  }

  return res.json();
}

export async function calculateTransportSavings(
  baselineMode: string,
  alternativeMode: string,
  distanceKm: number
): Promise<TransportComparison> {
  const res = await fetch(`${BASE_URL}/calculator/transport`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ baselineMode, alternativeMode, distanceKm }),
  });

  if (!res.ok) {
    throw new Error('Calculation request failed');
  }

  return res.json();
}

