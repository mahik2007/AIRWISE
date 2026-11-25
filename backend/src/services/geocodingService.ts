import axios from 'axios';
import { GeocodingResult } from '../types/airQuality.js';

export async function searchCities(query: string, count: number = 5): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=${count}&language=en&format=json`;
    const response = await axios.get(url, { timeout: 6000 });

    if (!response.data || !response.data.results) {
      return [];
    }

    interface OpenMeteoGeoItem {
      id: number;
      name: string;
      latitude: number;
      longitude: number;
      country?: string;
      country_code?: string;
      admin1?: string;
    }

    return response.data.results.map((item: OpenMeteoGeoItem) => ({
      id: item.id,
      name: item.name,
      latitude: item.latitude,
      longitude: item.longitude,
      country: item.country || '',
      countryCode: item.country_code,
      admin1: item.admin1 || '',
    }));
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Error fetching geocoding results:', errorMsg);
    throw new Error('Unable to retrieve location coordinates. Please try again.');
  }
}

