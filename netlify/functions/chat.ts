import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { ChatRecommendationResponse } from './types/airQuality.js';
import {
  getChildProtectionFallback,
  getExerciseFallback,
  getMaskFallback,
  getIndoorFallback,
  getCommuteFallback,
  getGeneralFallback,
} from './utils/fallbackTemplates.js';

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

const SYSTEM_PROMPT = `You are AIRWISE, an expert Urban Air Quality and Sustainable Living AI Assistant.
Your mission is to help families, professionals, students, and caregivers navigate severe winter smog and urban air pollution with actionable routines, indoor safety hacks, and low-emission choices.

CRITICAL OPERATIONAL RULES:
1. GROUNDED IN REAL DATA:
   - Base all advice strictly on the provided air quality context (AQI scale, PM2.5, PM10, etc.) for the user's specific location.
   - If air quality data or location is missing or unavailable, you MUST explicitly state that you do not have live readings for their exact location and provide cautious, baseline urban smog guidance.
   - Never invent or fabricate live pollution readings, station measurements, or arbitrary weather numbers.
   - Accurately label AQI scales: explicitly mention whether referencing US AQI or European AQI. Do NOT refer to Open-Meteo values as official Indian CPCB AQI.

2. MEDICAL SAFETY & SCOPE:
   - NEVER diagnose diseases, prescribe medication, or promise 100% medical protection from smog.
   - Use health-protective, risk-mitigation language (e.g. "helps filter particulate matter", "reduces inhalation exposure", "consult a healthcare professional if experiencing respiratory distress").

3. PRACTICAL & ACTIONABLE:
   - Provide concrete, realistic routines (e.g., peak smog hours to avoid, window sealing tips, wet-mopping vs dry sweeping, N95 mask fitting, kitchen exhaust timing).
   - Balance immediate personal exposure protection with collective sustainable alternatives (e.g., public transit, carpooling, waste segregation).

4. RESPONSE FORMAT:
   You must return clean, structured JSON matching this schema:
   {
     "recommendation": "Concise, direct answer addressing the user's question",
     "whyItMatters": "Clear atmospheric/health explanation explaining the scientific reason",
     "practicalSteps": ["Step 1...", "Step 2...", "Step 3..."],
     "expectedBenefit": "Expected exposure reduction or carbon/emission avoidance",
     "relevantLimitations": "Honest constraints (e.g. cloth masks do not block PM2.5, indoor plants have negligible particulate filtration compared to HEPA)"
   }
   Output ONLY valid JSON. No markdown backticks, no markdown fencing, no leading or trailing conversational chatter.`;

function generateRuleBasedFallback(body: any): ChatRecommendationResponse {
  const hasAqi = typeof body.airQuality?.usAqi === 'number' && !isNaN(body.airQuality.usAqi);
  const aqi = hasAqi ? body.airQuality.usAqi : undefined;
  const location = body.location?.name || 'your area';
  const query = (body.message || body.userMessage || '').toLowerCase();

  const aqiStr = aqi !== undefined ? `(US AQI: ${aqi})` : '(Live telemetry unavailable)';
  const isSevere = aqi !== undefined && aqi > 200;
  const isModerateOrElevated = aqi !== undefined && aqi > 100;
  const locale = body.locale === 'hi' ? 'hi' : 'en';

  const ctx = {
    location,
    aqiStr,
    isSevere,
    isModerateOrElevated,
    aqi,
    locale,
  };

  // Contextual pattern detection to prevent false positives from isolated words
  const isVulnTerm = /\b(child(ren)?|kids?|infants?|bab(y|ies)|pediatric|sons?|daughters?|seniors?|elderly|asthma(tic)?|grandparents?|pregnant)\b/.test(query);
  const isDirectPollution = /\b(smog|pollution|aqi|pm2\.?5|pm10|smoke|exhaust|inversion)\b/.test(query);
  const isAirQualityContext = /\b(air|outside|outdoor|environment)\b/.test(query) && /\b(quality|safe(ty)?|protect(ion)?|breathe|breathing|clean|dirty|bad|hazardous|severe|danger(ous)?|unhealthy|condition)\b/.test(query);
  const isRespiratorySmogContext = /\b(cough|wheez|inhaler|respiratory)\b/.test(query) && /\b(smog|pollution|air|aqi|smoke|haze|outside|outdoor)\b/.test(query);
  const isChildEnvQuery = isVulnTerm && (isDirectPollution || isAirQualityContext || isRespiratorySmogContext);

  const isExerciseAction = /\b(runs?|running|jogs?|jogging|workouts?|exercis(e|ing)|marathon|cardio|sports?|gym)\b/.test(query);
  const isOutdoorContext = /\b(outdoor|outside|air|smog|pollution|today|morning|park|street)\b/.test(query) && /\b(smog|air|pollution|aqi|safe(ty)?|breathe|exhaust|weather|heat)\b/.test(query);

  const isMaskQuery = /\b(masks?|respirators?|n95|kn95|ffp2|face\s?cover(ing)?)\b/.test(query);

  const isIndoorTerm = /\b(indoor|ventilat(e|ion)?|windows?|purifiers?|hepa|damp\s?mop|air\s?out|plants?)\b/.test(query);
  const isIndoorContext = /\b(air|clean|smog|pollution|home|house|room|apartment|dust|filter)\b/.test(query);

  const isCommuteTerm = /\b(commut(e|ing)|transit|metro|carpool(ing)?|public\s?transport|bus(es)?|traffic\s?jam|tailpipe)\b/.test(query);
  const isTravelEnv = /\b(work|office|emission|air|smog|daily|traffic|trip|route|commute|pollution)\b/.test(query);
  const isBikeTransit = /\b(bike|cycling|car|cab|two-wheeler)\b/.test(query) && /\b(commute|transit|traffic|roadside|exhaust|smog|pollution)\b/.test(query);
  const isTravelCommute = /\b(travel(l?ing)?)\b/.test(query) && /\b(work|office|commute|transit|rush\s?hour|traffic\s?pollution|tailpipe)\b/.test(query);

  // Priority 1: Child & Vulnerable Group Protection (Requires vulnerability term + established air-quality/smog context)
  if (isChildEnvQuery) {
    return getChildProtectionFallback(ctx);
  }

  // Priority 2: Outdoor Exercise, Jogging, Sports, Running (Requires exercise action + outdoor/env context)
  if (isExerciseAction && isOutdoorContext) {
    return getExerciseFallback(ctx);
  }

  // Priority 3: Masks & Personal Protective Equipment
  if (isMaskQuery) {
    return getMaskFallback(ctx);
  }

  // Priority 4: Indoor Air Quality, Dusting, Cleaning & Ventilation (Requires indoor term + clean/air context)
  if (isIndoorTerm && isIndoorContext) {
    const isVentilationSpecific = /\b(ventilat(e|ion)?|windows?|air\s?out)\b/.test(query);
    return getIndoorFallback(ctx, isVentilationSpecific);
  }

  // Priority 5: Commute, Transportation & Low Emissions (Requires transit context)
  if ((isCommuteTerm && isTravelEnv) || isBikeTransit || isTravelCommute) {
    return getCommuteFallback(ctx);
  }

  // General Baseline Fallback (Missing AQI or Uncategorized Query)
  return getGeneralFallback(ctx);
}

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
      body: JSON.stringify({ error: 'Request body is required' }),
    };
  }

  let parsedBody: any;
  try {
    const raw = JSON.parse(event.body);
    const validated = ChatInputSchema.safeParse(raw);
    if (!validated.success) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: validated.error.issues[0].message }),
      };
    }
    parsedBody = validated.data;
  } catch {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Invalid JSON request payload' }),
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const fallbackResponse = generateRuleBasedFallback(parsedBody);
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(fallbackResponse),
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    let contextDescription = `User Question: "${parsedBody.message}"\n`;

    if (parsedBody.location?.name) {
      contextDescription += `Location: ${parsedBody.location.name} (${parsedBody.location.country || 'Global'})\n`;
    } else {
      contextDescription += `Location: Unspecified / Unknown\n`;
    }

    if (parsedBody.airQuality && parsedBody.airQuality.usAqi !== undefined) {
      contextDescription += `Current Environmental Readings:
- US AQI: ${parsedBody.airQuality.usAqi} (${parsedBody.airQuality.usAqiCategory || 'Unknown Category'})
- PM2.5: ${parsedBody.airQuality.pm2_5 ?? 'N/A'} µg/m³
- PM10: ${parsedBody.airQuality.pm10 ?? 'N/A'} µg/m³
- NO2: ${parsedBody.airQuality.nitrogenDioxide ?? 'N/A'} µg/m³
- Data Source: ${parsedBody.airQuality.dataSource || 'Open-Meteo Atmospheric Model'}
- Station Type: ${parsedBody.airQuality.isObservedStation ? 'Observed Station' : 'Modelled Atmospheric Forecast'}\n`;
    } else {
      contextDescription += `Current Environmental Readings: [NO REAL-TIME DATA AVAILABLE FOR THIS LOCATION]\n`;
    }

    if (parsedBody.lifestyle) {
      contextDescription += `User Persona & Lifestyle Context:
- Role: ${parsedBody.lifestyle.userRole || 'general citizen'}
- Vulnerable dependents (infants/seniors/asthma): ${parsedBody.lifestyle.hasVulnerableFamilyMembers ? 'Yes' : 'No'}
- Air Purifier Available: ${parsedBody.lifestyle.indoorPurifierAvailable ? 'Yes' : 'No'}
- Commute: ${parsedBody.lifestyle.commutePreference || 'standard'}\n`;
    }

    if (parsedBody.locale === 'hi') {
      contextDescription += `\nLANGUAGE REQUIREMENT: Respond in natural, fluent, easily understandable Hindi (हिन्दी). Preserve technical terms and acronyms (US AQI, PM2.5, PM10, NO2, N95, HEPA, CADR) and explain them clearly in Hindi.\n`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `${SYSTEM_PROMPT}\n\nContext:\n${contextDescription}` }],
        },
      ],
      config: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text?.trim() || '{}';
    const parsed = JSON.parse(responseText);

    const recommendationResult: ChatRecommendationResponse = {
      recommendation: parsed.recommendation || 'Stay informed and reduce prolonged exposure during peak smog intervals.',
      whyItMatters: parsed.whyItMatters || 'Fine particulates (PM2.5) penetrate deep into the respiratory tract and bloodstream.',
      practicalSteps: Array.isArray(parsed.practicalSteps) && parsed.practicalSteps.length > 0
        ? parsed.practicalSteps
        : ['Monitor local air quality hourly.', 'Keep windows shut during early morning temperature inversions.'],
      expectedBenefit: parsed.expectedBenefit || 'Reduces particulate inhalation load and mitigates smog exposure.',
      relevantLimitations: parsed.relevantLimitations || 'General air quality guidance; individual health risks should be evaluated with a doctor.',
    };

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(recommendationResult),
    };
  } catch (error: any) {
    const errorType = error?.name || 'Error';
    const status = error?.status || error?.statusCode || 'UNKNOWN';
    console.warn(`[AI Assistant Fallback] Live inference unavailable (Category: ${errorType}, Code: ${status}). Seamlessly serving grounded deterministic advisory.`);
    const fallback = generateRuleBasedFallback(parsedBody);
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(fallback),
    };
  }
}

