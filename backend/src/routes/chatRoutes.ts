import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { generateChatRecommendation } from '../services/geminiService.js';
import { calculateTripSavings } from '../utils/emissionModels.js';

const router = Router();

// In-memory sliding window rate limiter for expensive AI endpoint
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();
const CHAT_RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const CHAT_RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute per IP

function isRateLimited(ip: string): boolean {
  if (process.env.NODE_ENV === 'test') {
    return false;
  }
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + CHAT_RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (record.count >= CHAT_RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }
  record.count += 1;
  return false;
}

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000).unref?.();

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
    // Prioritize Netlify/Cloudflare edge IP, then first untrusted client IP in x-forwarded-for, then socket remote address
    const clientIp = (req.headers['x-nf-client-connection-ip'] as string)
      || (req.headers['cf-connecting-ip'] as string)
      || (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim()
      || req.socket.remoteAddress
      || '127.0.0.1';
    if (isRateLimited(clientIp)) {
      res.status(429).json({ error: 'Too many requests. Please wait a moment before sending another message.' });
      return;
    }

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
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Chat endpoint error:', errorMsg);
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
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Transport route calculation error:', errorMsg);
    res.status(500).json({ error: 'Failed to compute transport emission comparison' });
  }
});

export default router;

