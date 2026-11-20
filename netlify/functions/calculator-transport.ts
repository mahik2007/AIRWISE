import { calculateTripSavings } from './utils/emissionModels.js';

interface HandlerEvent {
  httpMethod: string;
  body: string | null;
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
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export async function handler(event: HandlerEvent): Promise<HandlerResponse> {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  if (!event.body) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Missing request body' }),
    };
  }

  try {
    const { baselineMode, alternativeMode, distanceKm } = JSON.parse(event.body);

    if (!baselineMode || !alternativeMode || typeof distanceKm !== 'number' || distanceKm <= 0) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Invalid transport calculation parameters' }),
      };
    }

    const comparison = calculateTripSavings(baselineMode, alternativeMode, distanceKm);

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(comparison),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Failed to compute transport emission comparison' }),
    };
  }
}

