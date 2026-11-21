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
  const query = (body.message || body.userMessage || '').toLowerCase();

  const aqiStr = aqi !== undefined ? `(US AQI: ${aqi})` : '(Live telemetry unavailable)';
  const isSevere = aqi !== undefined && aqi > 200;
  const isModerateOrElevated = aqi !== undefined && aqi > 100;

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
    return {
      recommendation: isSevere
        ? `High pollution alert for ${location} ${aqiStr}. Strictly protect children and vulnerable individuals by suspending outdoor exposure and sealing clean indoor air zones.`
        : `Protective air quality guidance for children and sensitive individuals in ${location} ${aqiStr}.`,
      whyItMatters: `Children inhale more air per unit of body weight than adults, and elderly or asthmatic airways experience acute bronchial constriction when exposed to elevated PM2.5 concentrations.`,
      practicalSteps: [
        `Keep children indoors during early morning and late evening thermal smog peaks; substitute outdoor sports with indoor active play.`,
        `Equip school-going children and seniors with pediatric- or small-sized certified N95 respirators if transit through traffic is unavoidable.`,
        `Maintain a designated clean-air bedroom using an air purifier, and keep quick-relief inhalers easily accessible for asthmatic dependents.`,
        `Maintain balanced indoor humidity and avoid burning incense, mosquito coils, or unvented gas heaters around children.`
      ],
      expectedBenefit: `Substantially reduces pediatric and respiratory particulate exposure during peak pollution hours.`,
      relevantLimitations: `[Rule-Based Fallback Advisory] Guidance is grounded in atmospheric data for ${location}. Not a substitute for clinical pediatric or pulmonary consultation.`
    };
  }

  // Priority 2: Outdoor Exercise, Jogging, Sports, Running (Requires exercise action + outdoor/env context)
  if (isExerciseAction && isOutdoorContext) {
    return {
      recommendation: isSevere
        ? `Outdoor exercise is NOT recommended in ${location} ${aqiStr}. Heavy particulate levels pose significant cardiovascular and pulmonary strain during high-ventilation workouts.`
        : isModerateOrElevated
        ? `Adjust workout intensity and location in ${location} ${aqiStr}. Consider shifting strenuous morning runs indoors, and check hourly local AQI before any outdoor activity.`
        : `Air quality in ${location} ${aqiStr} is favorable for normal outdoor workouts and cardiovascular activities.`,
      whyItMatters: `Heavy aerobic respiration increases deep lung particulate deposition compared to rest, causing airway and systemic vascular strain during elevated smog.`,
      practicalSteps: [
        isSevere
          ? `Replace outdoor running with indoor bodyweight training, treadmill routines, or gym workouts.`
          : `Avoid dawn and dusk routes alongside congested arterial roadways where vehicle exhaust stagnates.`,
        `Check real-time hourly local pollution readings before exercising outdoors, as atmospheric conditions can change rapidly throughout the day.`,
        `Wear an N95 respirator if brisk walking is necessary, but avoid heavy breathless exertion while wearing tight-fitting respirators.`,
        `Hydrate thoroughly before and after sessions to maintain protective airway mucosal clearance.`
      ],
      expectedBenefit: `Helps prevent deep alveolar particulate accumulation and reduces exercise-induced airway irritation.`,
      relevantLimitations: `[Rule-Based Fallback Advisory] Exercise recommendations reflect ambient PM2.5 levels in ${location}; individuals with underlying heart or lung conditions should follow medical advice.`
    };
  }

  // Priority 3: Masks & Personal Protective Equipment
  if (isMaskQuery) {
    return {
      recommendation: `Respirator guidance for ${location} ${aqiStr}: Use certified N95, KN95, or FFP2 respirators for particulate protection; standard cloth or surgical masks do not block sub-micron PM2.5.`,
      whyItMatters: `Ambient PM2.5 particles are under 2.5 microns in aerodynamic diameter. Loose-fitting cloth and surgical masks allow unfiltered bypass around facial edges and lack electrostatic particulate filtration layers.`,
      practicalSteps: [
        `Select an N95 or FFP2 respirator with an adjustable nose clip and verify an airtight seal around nose, cheeks, and chin.`,
        `Avoid exhalation valves if protecting others in crowded indoor spaces; inspect respirators before each use and replace them if damaged, soiled, deformed, or when breathing resistance increases, following manufacturer instructions.`,
        `Ensure pediatric masks specifically fit smaller faces without perimeter air gaps for maximum efficacy.`,
        `Store clean respirators in breathable paper bags between uses; do not wash with soap or water as moisture ruins electrostatic filter media.`
      ],
      expectedBenefit: `Filters up to 95% of airborne particulate matter (PM2.5) when properly fitted and sealed according to standard certification tests.`,
      relevantLimitations: `[Rule-Based Fallback Advisory] Respirators mitigate ambient particulate exposure but do not filter hazardous gases (e.g., carbon monoxide or nitrogen dioxide).`
    };
  }

  // Priority 4: Indoor Air Quality, Dusting, Cleaning & Ventilation (Requires indoor term + clean/air context)
  if (isIndoorTerm && isIndoorContext) {
    return {
      recommendation: isSevere
        ? `Indoor air containment protocol for ${location} ${aqiStr}: Keep exterior windows sealed against smog penetration and operate air filtration in high-use rooms.`
        : `Indoor ventilation strategy for ${location} ${aqiStr}: Ventilate cautiously when outdoor readings drop, and maintain wet-cleaning routines to prevent dust resuspension.`,
      whyItMatters: `Indoor particulate concentrations can reach a significant fraction of outdoor smog levels if windows remain open during thermal inversions, while indoor cooking and dry dusting further compound particulate hazard.`,
      practicalSteps: [
        isSevere
          ? `Seal perimeter window cracks with draft tape or rolled damp towels during night and early morning inversion hours.`
          : `Check local hourly AQI before airing rooms, and open opposite windows briefly when ambient pollution is at its daily minimum.`,
        `Use damp microfiber mopping rather than dry sweeping to trap settled particulate matter without resuspending it into the breathing zone.`,
        `Run kitchen exhaust fans during cooking and keep lids on pans to minimize aerosolized oil droplet dispersion.`,
        `Position HEPA purifiers centrally in bedrooms away from open doors, and note that household plants have negligible PM2.5 filtration capacity compared to mechanical HEPA filters.`
      ],
      expectedBenefit: `Helps reduce indoor PM2.5 concentrations relative to unmitigated outdoor ambient levels.`,
      relevantLimitations: `[Rule-Based Fallback Advisory] Air filtration guidance based on atmospheric model data for ${location}. Regular filter maintenance is essential.`
    };
  }

  // Priority 5: Commute, Transportation & Low Emissions (Requires transit context)
  if ((isCommuteTerm && isTravelEnv) || isBikeTransit || isTravelCommute) {
    return {
      recommendation: `Commute and transit advisory for ${location} ${aqiStr}: Minimize roadside exposure and tailpipe emissions by switching to closed public rail or carpools with AC recirculation.`,
      whyItMatters: `In-cabin and roadside commute corridors represent frequent daily acute PM2.5 and NO2 exposure spikes for urban commuters.`,
      practicalSteps: [
        `Opt for electric metro rail or enclosed public buses over open two-wheelers and auto-rickshaws during peak morning rush.`,
        `Set vehicle ventilation systems to internal recirculation mode when idling or navigating dense traffic corridors.`,
        `Wear an N95 respirator when waiting on exposed bus platforms or walking along busy roads.`,
        `Consolidate multiple short vehicle trips or share rides to eliminate cold-start engine emissions.`
      ],
      expectedBenefit: `Lowers personal commute particulate exposure while preventing personal vehicle carbon and particulate emissions.`,
      relevantLimitations: `[Rule-Based Fallback Advisory] Advisory utilizes atmospheric modeling for ${location}. Micro-climate hotspots along busy expressways may exhibit higher localized concentrations.`
    };
  }

  // General Baseline Fallback (Missing AQI or Uncategorized Query)
  if (aqi === undefined) {
    return {
      recommendation: `Live air quality telemetry is currently unavailable for ${location}. Exercise standard urban smog precautions until verified local readings are restored.`,
      whyItMatters: `Without active continuous air quality monitoring data, local particulate concentrations (PM2.5/PM10) cannot be confirmed. Ambient urban exposure can vary significantly based on traffic density and weather conditions.`,
      practicalSteps: [
        `Check local municipal air quality station reports or weather bulletins for real-time smog advisories.`,
        `Wear a certified N95 or FFP2 respirator during high-traffic commute hours as a precautionary measure.`,
        `Check current local air quality readings before opening windows to ventilate living spaces.`,
        `Opt for public transit, electric rail, or shared commuting to minimize exposure and personal vehicle emissions.`
      ],
      expectedBenefit: `Prevents unmonitored particulate exposure while promoting baseline protective respiratory health.`,
      relevantLimitations: `[Rule-Based Fallback Advisory] Live atmospheric measurements are unavailable; recommendations are general precautions and not a clinical assessment.`
    };
  }

  if (isSevere) {
    return {
      recommendation: `High pollution alert for ${location} (US AQI: ${aqi}). Strictly curtail strenuous outdoor activities and protect indoor air.`,
      whyItMatters: `At US AQI ${aqi}, severe winter smog creates elevated concentrations of PM2.5 particles that trigger bronchial inflammation and systemic oxidative stress across all age groups.`,
      practicalSteps: [
        `Reschedule early morning workouts or walks indoors; morning temperature inversions trap heavy surface particulate matter.`,
        `Equip family members with fitted N95/FFP2 respirators if stepping outside; ordinary cloth or surgical masks do not filter sub-micron particles.`,
        `Seal window drafts, run an air purifier if available, and avoid dry dusting or frying foods without exhaust ventilation.`,
        `Opt for public metro or carpool options rather than open two-wheelers.`
      ],
      expectedBenefit: `Substantially reduces acute particulate inhalation compared to unprotected outdoor exposure.`,
      relevantLimitations: `[Rule-Based Fallback Advisory] Guidance based on atmospheric model data for ${location}. Not a substitute for clinical medical evaluation.`
    };
  } else if (isModerateOrElevated) {
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

