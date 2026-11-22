import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { generateChatRecommendation } from '../services/geminiService.js';
import { calculateTripSavings } from '../utils/emissionModels.js';

const router = Router();

const ChatInputSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(1000, 'Message is too long'),
  location: z.object({
    name: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    country: z.string().optional(),
  }).optional(),
  airQuality: z.object({
    usAqi: z.number().optional(),
    usAqiCategory: z.string().optional(),
    europeanAqi: z.number().optional(),
    pm2_5: z.number().optional(),
    pm10: z.number().optional(),
    nitrogenDioxide: z.number().optional(),
    dataSource: z.string().optional(),
    isObservedStation: z.boolean().optional(),
  }).optional(),
  lifestyle: z.object({
    userRole: z.enum(['student', 'working_professional', 'homemaker', 'caregiver', 'general']).optional(),
    hasVulnerableFamilyMembers: z.boolean().optional(),
    commutePreference: z.string().optional(),
    indoorPurifierAvailable: z.boolean().optional(),
  }).optional(),
  locale: z.enum(['en', 'hi']).optional(),
});

// POST /api/chat
router.post('/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = ChatInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const { message, location, airQuality, lifestyle, locale } = parsed.data;

    const response = await generateChatRecommendation({
      userMessage: message,
      location,
      airQuality,
      lifestyle,
      locale,
    });

    res.json(response);
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ error: 'Internal AI assistant processing error. Please try again.' });
  }
});

// POST /api/calculator/transport
router.post('/calculator/transport', (req: Request, res: Response): void => {
  try {
    const { baselineMode, alternativeMode, distanceKm } = req.body;
    if (!baselineMode || !alternativeMode || typeof distanceKm !== 'number' || distanceKm <= 0) {
      res.status(400).json({ error: 'Invalid transport calculation parameters' });
      return;
    }

    const comparison = calculateTripSavings(baselineMode, alternativeMode, distanceKm);
    res.json(comparison);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to compute transport emission comparison' });
  }
});

export default router;

