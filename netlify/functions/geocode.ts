import axios from 'axios';
import { GeocodingResult } from './types/airQuality.js';

interface HandlerEvent {
  httpMethod: string;
  queryStringParameters?: Record<string, string | undefined>;
  headers?: Record<string, string | undefined>;
}

interface HandlerResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

export async function handler(event: HandlerEvent): Promise<HandlerResponse> {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  const query = event.queryStringParameters?.q;
  const countParam = event.queryStringParameters?.count;
  const count = countParam ? parseInt(countParam, 10) : 5;

  if (!query || query.trim().length < 2) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Search query must be at least 2 characters' }),
    };
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=${count}&language=en&format=json`;
    const response = await axios.get(url, { timeout: 6000 });

    if (!response.data || !response.data.results) {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ results: [] }),
      };
    }

    const results: GeocodingResult[] = response.data.results.map((item: any) => ({
      id: item.id,
      name: item.name,
      latitude: item.latitude,
      longitude: item.longitude,
      country: item.country || '',
      countryCode: item.country_code,
      admin1: item.admin1 || '',
    }));

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ results }),
    };
  } catch (error: any) {
    console.error('Error in geocode function:', error?.message || error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Failed to search locations. Please try again.' }),
    };
  }
}
