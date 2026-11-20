import { describe, it, expect } from 'vitest';
import { handler as geocodeHandler } from '../netlify/functions/geocode.js';
import { handler as airQualityHandler } from '../netlify/functions/air-quality.js';
import { handler as chatHandler } from '../netlify/functions/chat.js';
import { handler as transportHandler } from '../netlify/functions/calculator-transport.js';

describe('Netlify Functions Verification', () => {
  it('geocode function handles valid query', async () => {
    const res = await geocodeHandler({
      httpMethod: 'GET',
      queryStringParameters: { q: 'Delhi', count: '3' }
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.results).toBeDefined();
    expect(body.results.length).toBeGreaterThan(0);
    expect(body.results[0].name).toContain('Delhi');
  });

  it('geocode function rejects short queries', async () => {
    const res = await geocodeHandler({
      httpMethod: 'GET',
      queryStringParameters: { q: 'a' }
    });
    expect(res.statusCode).toBe(400);
  });

  it('air-quality function handles valid coordinates', async () => {
    const res = await airQualityHandler({
      httpMethod: 'GET',
      queryStringParameters: {
        lat: '28.65195',
        lon: '77.23149',
        name: 'Delhi',
        country: 'India'
      }
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.current.usAqi).toBeDefined();
    expect(body.current.usAqiCategory).toBeDefined();
    expect(body.hourly.length).toBeGreaterThan(0);
    expect(body.dailyForecast.length).toBeGreaterThan(0);
  });

  it('chat function generates structured recommendation with fallback', async () => {
    const res = await chatHandler({
      httpMethod: 'POST',
      body: JSON.stringify({
        message: 'Is it safe to run outdoors in severe smog?',
        location: { name: 'Delhi' },
        airQuality: { usAqi: 220, pm2_5: 145 },
        lifestyle: { userRole: 'student' }
      })
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.recommendation).toBeDefined();
    expect(body.whyItMatters).toBeDefined();
    expect(Array.isArray(body.practicalSteps)).toBe(true);
    expect(body.expectedBenefit).toBeDefined();
    expect(body.relevantLimitations).toBeDefined();
  });

  it('calculator-transport function calculates correct ARAI/DEFRA savings', async () => {
    const res = await transportHandler({
      httpMethod: 'POST',
      body: JSON.stringify({
        baselineMode: 'car_solo',
        alternativeMode: 'metro',
        distanceKm: 10
      })
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.co2SavedGrams).toBe(1650);
    expect(body.pm25SavedGrams).toBeGreaterThan(0);
  });
});
