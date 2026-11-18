import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { searchCities } from '../services/geocodingService.js';
import { fetchAirQuality } from '../services/airQualityService.js';

const router = Router();

// Geocoding Search Schema
const GeocodeSchema = z.object({
  q: z.string().min(2, 'Search query must be at least 2 characters'),
  count: z.coerce.number().min(1).max(10).optional().default(5),
});

// Air Quality Query Schema
const AirQualitySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  name: z.string().default('Selected Location'),
  country: z.string().optional().default(''),
  admin1: z.string().optional(),
});

// GET /api/geocode?q=delhi
router.get('/geocode', async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = GeocodeSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const results = await searchCities(parsed.data.q, parsed.data.count);
    res.json({ results });
  } catch (error: any) {
    console.error('Geocode route error:', error);
    res.status(500).json({ error: 'Failed to search locations. Please try again.' });
  }
});

// GET /api/air-quality?lat=28.6139&lon=77.2090&name=New%20Delhi&country=India
router.get('/air-quality', async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = AirQualitySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const { lat, lon, name, country, admin1 } = parsed.data;
    const airQualityData = await fetchAirQuality(lat, lon, name, country, admin1);
    res.json(airQualityData);
  } catch (error: any) {
    console.error('Air quality route error:', error);
    res.status(500).json({ error: 'Failed to retrieve air quality data. Please check coordinates and retry.' });
  }
});

export default router;

