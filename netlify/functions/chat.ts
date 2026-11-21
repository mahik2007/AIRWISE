import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { ChatRecommendationResponse } from './types/airQuality.js';

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
});

const SYSTEM_PROMPT = `You are AIRWISE, an expert Urban Air Quality and Sustainable Living AI Assistant developed for Hack2Skill PromptWars Challenge 6.
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
  const role = body.lifestyle?.userRole || 'general';

  // If actual AQI readings are unavailable, provide cautious baseline precautions without fabricating numbers
  if (aqi === undefined) {
    return {
      recommendation: `Live air quality telemetry is currently unavailable for ${location}. Exercise standard urban smog precautions until verified local readings are restored.`,
      whyItMatters: `Without active continuous air quality monitoring data, local particulate concentrations (PM2.5/PM10) cannot be confirmed. Ambient urban exposure can vary significantly based on traffic density and weather conditions.`,
      practicalSteps: [
        `Check local municipal air quality station reports or weather bulletins for real-time smog advisories.`,
        `Wear a certified N95 or FFP2 respirator during high-traffic commute hours as a precautionary measure.`,
        `Keep living spaces ventilated during midday solar hours (12:00 PM – 3:00 PM) rather than early dawn or late evening.`,
        role === 'caregiver'
          ? `Ensure vulnerable seniors and children have access to well-filtered indoor rooms and monitor for respiratory symptoms.`
          : `Opt for public transit, electric rail, or shared commuting to minimize exposure and personal vehicle emissions.`
      ],
      expectedBenefit: `Prevents unmonitored particulate exposure while promoting baseline protective respiratory health.`,
      relevantLimitations: `[Rule-Based Fallback Advisory] Live atmospheric measurements are unavailable; recommendations are general precautions and not a clinical assessment.`,
    };
  }

  if (aqi > 200) {
    return {
      recommendation: `High pollution alert for ${location} (US AQI: ${aqi}). Strictly curtail strenuous outdoor activities and protect indoor air.`,
      whyItMatters: `At US AQI ${aqi}, severe winter smog creates elevated concentrations of PM2.5 particles that trigger bronchial inflammation and systemic oxidative stress across all age groups.`,
      practicalSteps: [
        `Reschedule early morning workouts or walks indoors; morning temperature inversions trap heavy surface particulate matter.`,
        `Equip family members with fitted N95/FFP2 respirators if stepping outside; ordinary cloth or surgical masks do not filter sub-micron particles.`,
        `Seal window drafts, run an air purifier if available, and avoid dry dusting or frying foods without exhaust ventilation.`,
        role === 'caregiver'
          ? `Keep elderly individuals and young children in closed rooms with clean air filtration and monitor for cough or wheezing.`
          : `Opt for public metro or carpool options rather than open two-wheelers.`
      ],
      expectedBenefit: `Minimizes acute particulate inhalation by up to 75-85% compared to unprotected outdoor exposure.`,
      relevantLimitations: `[Rule-Based Fallback Advisory] Guidance based on atmospheric model data for ${location}. Not a substitute for clinical medical evaluation.`,
    };
  } else if (aqi > 100) {
    return {
      recommendation: `Moderate to sensitive air quality in ${location} (US AQI: ${aqi}). Sensitive groups should take precautions during peak rush hours.`,
      whyItMatters: `Particulate matter is elevated above standard baseline levels, which can cause throat irritation and fatigue in sensitive individuals.`,
      practicalSteps: [
        `Ventilate living spaces between 12:00 PM and 4:00 PM when solar warming dilutes surface pollution.`,
        `Plan outdoor sports or jogging for the afternoon rather than dawn or late dusk.`,
        `Use public transit or share rides to avoid contributing to peak vehicle idle emissions.`,
        `Keep indoor spaces damp-mopped rather than dry-swept to prevent resuspending settled dust.`
      ],
      expectedBenefit: `Lowers personal exposure during daily commute and prevents avoidable urban tailpipe emissions.`,
      relevantLimitations: `[Rule-Based Fallback Advisory] Advisory utilizes Open-Meteo atmospheric forecast; check local observed stations if available.`,
    };
  } else {
    return {
      recommendation: `Air quality in ${location} is currently within acceptable ranges (US AQI: ${aqi}). Ideal for normal daily routines.`,
      whyItMatters: `Low atmospheric particulate levels allow comfortable outdoor ventilation and cardiovascular activity without significant pollution burden.`,
      practicalSteps: [
        `Open windows across rooms during morning hours for natural cross-ventilation.`,
        `Encourage active commuting such as walking or cycling for short trips under 3 km.`,
        `Maintain regular car servicing and tire pressure to preserve fuel efficiency and low emissions.`
      ],
      expectedBenefit: `Promotes cardiovascular health while sustaining clean ambient air quality through low-emission choices.`,
      relevantLimitations: `[Rule-Based Fallback Advisory] Local micro-climates near busy intersections may experience localized spikes in vehicle exhaust.`,
    };
  }
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
    console.error('Gemini API call failed in function, falling back to rule-based engine:', error?.message || error);
    const fallback = generateRuleBasedFallback(parsedBody);
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(fallback),
    };
  }
}

