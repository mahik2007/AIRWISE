import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { handler as geocodeHandler } from '../netlify/functions/geocode.js';
import { handler as airQualityHandler } from '../netlify/functions/air-quality.js';
import { handler as chatHandler } from '../netlify/functions/chat.js';
import { handler as transportHandler } from '../netlify/functions/calculator-transport.js';
import { generateChatRecommendation } from '../services/geminiService.js';

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
    expect(body.relevantLimitations).toContain('[Rule-Based Fallback Advisory]');
  });

  it('chat function handles missing AQI gracefully without inventing numbers', async () => {
    const res = await chatHandler({
      httpMethod: 'POST',
      body: JSON.stringify({
        message: 'What precautions should I take today?',
        location: { name: 'UnknownTown' },
        lifestyle: { userRole: 'general' }
      })
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.recommendation).toContain('telemetry is currently unavailable');
    expect(body.recommendation).not.toMatch(/US AQI: \d+/);
    expect(body.relevantLimitations).toContain('[Rule-Based Fallback Advisory]');
  });

  describe('Chat Topic-Aware Fallback Responses', () => {
    const testCity = { name: 'Delhi' };
    const severeAqi = { usAqi: 240, pm2_5: 165 };

    it('tailors response for child and vulnerable group protection', async () => {
      // Positive 1: severe winter smog
      const res = await chatHandler({
        httpMethod: 'POST',
        body: JSON.stringify({
          message: 'How can I protect my children during severe winter smog?',
          location: testCity,
          airQuality: severeAqi,
        })
      });
      const body = JSON.parse(res.body);
      expect(body.recommendation).toContain('children and vulnerable individuals');
      expect(body.whyItMatters).toContain('Children inhale more air');
      expect(body.practicalSteps[0]).toContain('Keep children indoors');

      // Positive 2: play outside when AQI is severe
      const resAqi = await chatHandler({
        httpMethod: 'POST',
        body: JSON.stringify({
          message: 'Can my child play outside when AQI is severe?',
          location: testCity,
          airQuality: severeAqi,
        })
      });
      const bodyAqi = JSON.parse(resAqi.body);
      expect(bodyAqi.recommendation).toContain('children and vulnerable individuals');

      // Positive 3: outdoor activity safe for children during high pollution
      const resPollution = await chatHandler({
        httpMethod: 'POST',
        body: JSON.stringify({
          message: 'Is outdoor activity safe for children during high pollution?',
          location: testCity,
          airQuality: severeAqi,
        })
      });
      const bodyPollution = JSON.parse(resPollution.body);
      expect(bodyPollution.recommendation).toContain('children and vulnerable individuals');
    });

    it('tailors response for outdoor running and exercise queries', async () => {
      const res = await chatHandler({
        httpMethod: 'POST',
        body: JSON.stringify({
          message: 'Is it safe to go for a morning run today?',
          location: testCity,
          airQuality: severeAqi,
        })
      });
      const body = JSON.parse(res.body);
      expect(body.recommendation).toContain('Outdoor exercise is NOT recommended');
      expect(body.whyItMatters).toContain('aerobic respiration');
      expect(body.practicalSteps[0]).toContain('Replace outdoor running');
    });

    it('tailors response for indoor air quality and ventilation queries', async () => {
      const res = await chatHandler({
        httpMethod: 'POST',
        body: JSON.stringify({
          message: 'What is the best time to ventilate my home today?',
          location: testCity,
          airQuality: severeAqi,
        })
      });
      const body = JSON.parse(res.body);
      expect(body.recommendation).toContain('Indoor air containment protocol');
      expect(body.whyItMatters).toContain('Indoor particulate concentrations');
      expect(body.practicalSteps.some((s: string) => s.includes('mopping'))).toBe(true);
    });

    it('tailors response for mask and respirator guidance', async () => {
      const res = await chatHandler({
        httpMethod: 'POST',
        body: JSON.stringify({
          message: 'What kind of mask should I wear for PM2.5?',
          location: testCity,
          airQuality: severeAqi,
        })
      });
      const body = JSON.parse(res.body);
      expect(body.recommendation).toContain('Respirator guidance');
      expect(body.recommendation).toContain('N95');
      expect(body.whyItMatters).toContain('electrostatic particulate filtration');
    });

    it('tailors response for commute and transit queries', async () => {
      const res = await chatHandler({
        httpMethod: 'POST',
        body: JSON.stringify({
          message: 'Suggest a low-emission commute to work.',
          location: testCity,
          airQuality: severeAqi,
        })
      });
      const body = JSON.parse(res.body);
      expect(body.recommendation).toContain('Commute and transit advisory');
      expect(body.practicalSteps.some((s: string) => s.includes('metro'))).toBe(true);
    });

    it('resolves overlapping keywords using priority rules', async () => {
      // Overlap: Child + Run + Smog/Air context -> Child safety priority takes precedence over exercise
      const resChildRun = await chatHandler({
        httpMethod: 'POST',
        body: JSON.stringify({
          message: 'Can my child go for a run in this severe smog today?',
          location: testCity,
          airQuality: severeAqi,
        })
      });
      const bodyChildRun = JSON.parse(resChildRun.body);
      expect(bodyChildRun.recommendation).toContain('children and vulnerable individuals');

      // Overlap: Mask + Bike commute -> Mask guidance takes precedence
      const resMaskBike = await chatHandler({
        httpMethod: 'POST',
        body: JSON.stringify({
          message: 'Should I wear an N95 mask while commuting by bike?',
          location: testCity,
          airQuality: severeAqi,
        })
      });
      const bodyMaskBike = JSON.parse(resMaskBike.body);
      expect(bodyMaskBike.recommendation).toContain('Respirator guidance');
    });

    it('avoids false positives on ambiguous or non-environmental queries', async () => {
      // 1. Bike repair question (should NOT trigger commute advice)
      const resBike = await chatHandler({
        httpMethod: 'POST',
        body: JSON.stringify({
          message: 'I took my bike to the repair shop yesterday.',
          location: testCity,
          airQuality: severeAqi,
        })
      });
      const bodyBike = JSON.parse(resBike.body);
      expect(bodyBike.recommendation).toContain('High pollution alert for Delhi');
      expect(bodyBike.recommendation).not.toContain('Commute and transit advisory');

      // 2. School pencil purchase (should NOT trigger child health smog protection)
      const resSchool = await chatHandler({
        httpMethod: 'POST',
        body: JSON.stringify({
          message: 'Can I buy a pencil at school?',
          location: testCity,
          airQuality: severeAqi,
        })
      });
      const bodySchool = JSON.parse(resSchool.body);
      expect(bodySchool.recommendation).toContain('High pollution alert for Delhi');
      expect(bodySchool.recommendation).not.toContain('children and vulnerable individuals');

      // 3. Child-related non-environmental question (should NOT trigger child health smog protection)
      const resChildSchool = await chatHandler({
        httpMethod: 'POST',
        body: JSON.stringify({
          message: 'Is my child ready for school?',
          location: testCity,
          airQuality: severeAqi,
        })
      });
      const bodyChildSchool = JSON.parse(resChildSchool.body);
      expect(bodyChildSchool.recommendation).toContain('High pollution alert for Delhi');
      expect(bodyChildSchool.recommendation).not.toContain('children and vulnerable individuals');

      // 4. "Is my child safe?" (generic safety without air/pollution context)
      const resChildSafe = await chatHandler({
        httpMethod: 'POST',
        body: JSON.stringify({
          message: 'Is my child safe?',
          location: testCity,
          airQuality: severeAqi,
        })
      });
      const bodyChildSafe = JSON.parse(resChildSafe.body);
      expect(bodyChildSafe.recommendation).toContain('High pollution alert for Delhi');
      expect(bodyChildSafe.recommendation).not.toContain('children and vulnerable individuals');

      // 5. "How can I protect my child from bullying?" (generic protection without air/pollution context)
      const resChildBully = await chatHandler({
        httpMethod: 'POST',
        body: JSON.stringify({
          message: 'How can I protect my child from bullying?',
          location: testCity,
          airQuality: severeAqi,
        })
      });
      const bodyChildBully = JSON.parse(resChildBully.body);
      expect(bodyChildBully.recommendation).toContain('High pollution alert for Delhi');
      expect(bodyChildBully.recommendation).not.toContain('children and vulnerable individuals');

      // 6. "My child has a cough." (generic health symptom without air/smog context)
      const resChildCough = await chatHandler({
        httpMethod: 'POST',
        body: JSON.stringify({
          message: 'My child has a cough.',
          location: testCity,
          airQuality: severeAqi,
        })
      });
      const bodyChildCough = JSON.parse(resChildCough.body);
      expect(bodyChildCough.recommendation).toContain('High pollution alert for Delhi');
      expect(bodyChildCough.recommendation).not.toContain('children and vulnerable individuals');

      // 7. Child morning run without pollution context (should NOT trigger child protection)
      const resChildRun = await chatHandler({
        httpMethod: 'POST',
        body: JSON.stringify({
          message: 'My child runs every morning.',
          location: testCity,
          airQuality: severeAqi,
        })
      });
      const bodyChildRun = JSON.parse(resChildRun.body);
      expect(bodyChildRun.recommendation).toContain('High pollution alert for Delhi');
      expect(bodyChildRun.recommendation).not.toContain('children and vulnerable individuals');

      // 5. Child park playing without pollution context (should NOT trigger child protection)
      const resChildPark = await chatHandler({
        httpMethod: 'POST',
        body: JSON.stringify({
          message: 'My child likes playing in the park.',
          location: testCity,
          airQuality: severeAqi,
        })
      });
      const bodyChildPark = JSON.parse(resChildPark.body);
      expect(bodyChildPark.recommendation).toContain('High pollution alert for Delhi');
      expect(bodyChildPark.recommendation).not.toContain('children and vulnerable individuals');

      // 6. Child outdoor games without pollution context (should NOT trigger child protection)
      const resChildGames = await chatHandler({
        httpMethod: 'POST',
        body: JSON.stringify({
          message: 'My child enjoys outdoor games.',
          location: testCity,
          airQuality: severeAqi,
        })
      });
      const bodyChildGames = JSON.parse(resChildGames.body);
      expect(bodyChildGames.recommendation).toContain('High pollution alert for Delhi');
      expect(bodyChildGames.recommendation).not.toContain('children and vulnerable individuals');

      // 7. Travel destination question without commute context (should NOT trigger commute advice)
      const resTravelDest = await chatHandler({
        httpMethod: 'POST',
        body: JSON.stringify({
          message: 'What are the top travel destinations in Europe?',
          location: testCity,
          airQuality: severeAqi,
        })
      });
      const bodyTravelDest = JSON.parse(resTravelDest.body);
      expect(bodyTravelDest.recommendation).toContain('High pollution alert for Delhi');
      expect(bodyTravelDest.recommendation).not.toContain('Commute and transit advisory');

      // 5. Holiday travel question (should NOT trigger commute advice)
      const resHoliday = await chatHandler({
        httpMethod: 'POST',
        body: JSON.stringify({
          message: 'I am planning a holiday travel trip with my family.',
          location: testCity,
          airQuality: severeAqi,
        })
      });
      const bodyHoliday = JSON.parse(resHoliday.body);
      expect(bodyHoliday.recommendation).toContain('High pollution alert for Delhi');
      expect(bodyHoliday.recommendation).not.toContain('Commute and transit advisory');

      // 6. Travelling to another city question (should NOT trigger commute advice)
      const resTravellingCity = await chatHandler({
        httpMethod: 'POST',
        body: JSON.stringify({
          message: 'I will be travelling to another city next weekend.',
          location: testCity,
          airQuality: severeAqi,
        })
      });
      const bodyTravellingCity = JSON.parse(resTravellingCity.body);
      expect(bodyTravellingCity.recommendation).toContain('High pollution alert for Delhi');
      expect(bodyTravellingCity.recommendation).not.toContain('Commute and transit advisory');

      // 7. General programming question
      const resProg = await chatHandler({
        httpMethod: 'POST',
        body: JSON.stringify({
          message: 'Tell me a joke about programming',
          location: testCity,
          airQuality: severeAqi,
        })
      });
      const bodyProg = JSON.parse(resProg.body);
      expect(bodyProg.recommendation).toContain('High pollution alert for Delhi');

      // 8. General knowledge question
      const resGen = await chatHandler({
        httpMethod: 'POST',
        body: JSON.stringify({
          message: 'What is the capital of France?',
          location: testCity,
          airQuality: severeAqi,
        })
      });
      const bodyGen = JSON.parse(resGen.body);
      expect(bodyGen.recommendation).toContain('High pollution alert for Delhi');
      expect(bodyGen.recommendation).not.toContain('Respirator guidance');
      expect(bodyGen.recommendation).not.toContain('Outdoor exercise is NOT recommended');
    });

    it('personalizes recommendations by role only after intent is matched, avoiding role false positives', async () => {
      // 1. Caregiver asking an unrelated question (programming joke) -> receives identical general alert
      const resCaregiverUnrelated = await chatHandler({
        httpMethod: 'POST',
        body: JSON.stringify({
          message: 'Tell me a joke about programming',
          lifestyle: { userRole: 'caregiver' },
          location: testCity,
          airQuality: severeAqi,
        })
      });
      const bodyCaregiverUnrelated = JSON.parse(resCaregiverUnrelated.body);
      expect(bodyCaregiverUnrelated.recommendation).toContain('High pollution alert for Delhi');
      expect(bodyCaregiverUnrelated.recommendation).not.toContain('children and vulnerable individuals');

      // 2. Working professional asking an unrelated question (geography) -> receives identical general alert
      const resWorkerUnrelated = await chatHandler({
        httpMethod: 'POST',
        body: JSON.stringify({
          message: 'What is the capital of France?',
          lifestyle: { userRole: 'working_professional' },
          location: testCity,
          airQuality: severeAqi,
        })
      });
      const bodyWorkerUnrelated = JSON.parse(resWorkerUnrelated.body);
      expect(bodyWorkerUnrelated.recommendation).toContain('High pollution alert for Delhi');
      expect(bodyWorkerUnrelated.recommendation).not.toContain('Commute and transit advisory');

      // 3. Both roles receive the identical general fallback steps for unrelated queries
      expect(bodyCaregiverUnrelated.practicalSteps).toEqual(bodyWorkerUnrelated.practicalSteps);

      // 4. Caregiver asking a child pollution question -> child protection advisory
      const resCaregiverChild = await chatHandler({
        httpMethod: 'POST',
        body: JSON.stringify({
          message: 'How can I protect my children from this smog?',
          lifestyle: { userRole: 'caregiver' },
          location: testCity,
          airQuality: severeAqi,
        })
      });
      const bodyCaregiverChild = JSON.parse(resCaregiverChild.body);
      expect(bodyCaregiverChild.recommendation).toContain('children and vulnerable individuals');

      // 5. Working professional asking a commute pollution question -> commute advisory
      const resWorkerCommute = await chatHandler({
        httpMethod: 'POST',
        body: JSON.stringify({
          message: 'How should I travel to work during peak traffic pollution?',
          lifestyle: { userRole: 'working_professional' },
          location: testCity,
          airQuality: severeAqi,
        })
      });
      const bodyWorkerCommute = JSON.parse(resWorkerCommute.body);
      expect(bodyWorkerCommute.recommendation).toContain('Commute and transit advisory');
    });

    it('verifies backend geminiService.generateChatRecommendation parity across all categories and ambiguous queries', async () => {
      // Helper to verify complete 5-field response structure equivalence between Netlify handler and backend geminiService
      const verifyFieldParity = async (message: string) => {
        const netlifyRes = await chatHandler({
          httpMethod: 'POST',
          body: JSON.stringify({
            message,
            location: testCity,
            airQuality: severeAqi,
          })
        });
        const netlifyBody = JSON.parse(netlifyRes.body);
        const backendBody = await generateChatRecommendation({
          userMessage: message,
          location: testCity,
          airQuality: severeAqi,
        });

        expect(backendBody.recommendation).toBe(netlifyBody.recommendation);
        expect(backendBody.whyItMatters).toBe(netlifyBody.whyItMatters);
        expect(backendBody.practicalSteps).toEqual(netlifyBody.practicalSteps);
        expect(backendBody.expectedBenefit).toBe(netlifyBody.expectedBenefit);
        expect(backendBody.relevantLimitations).toBe(netlifyBody.relevantLimitations);
        return backendBody;
      };

      // 1. Child protection category: 5-field match
      const recChild = await verifyFieldParity('How can I protect my children during severe winter smog?');
      expect(recChild.recommendation).toContain('children and vulnerable individuals');

      // 2. Outdoor exercise category: 5-field match
      const recExercise = await verifyFieldParity('Is it safe to go for a morning run today in this smog?');
      expect(recExercise.recommendation).toContain('Outdoor exercise is NOT recommended');

      // 3. Mask guidance category: 5-field match
      const recMask = await verifyFieldParity('What kind of mask should I wear for PM2.5?');
      expect(recMask.recommendation).toContain('Respirator guidance');

      // 4. Indoor ventilation category: 5-field match
      const recIndoor = await verifyFieldParity('What is the best time to ventilate my home today?');
      expect(recIndoor.recommendation).toContain('Indoor air containment protocol');

      // 5. Commute category: 5-field match
      const recCommute = await verifyFieldParity('Suggest a low-emission commute to work in heavy traffic.');
      expect(recCommute.recommendation).toContain('Commute and transit advisory');

      // 6. Ambiguous negative query (bullying): 5-field match
      const recBully = await verifyFieldParity('How can I protect my child from bullying?');
      expect(recBully.recommendation).toContain('High pollution alert for Delhi');
      expect(recBully.recommendation).not.toContain('children and vulnerable individuals');

      // 7. Ambiguous negative query (bike repair): 5-field match
      const recBike = await verifyFieldParity('I took my bike to the repair shop yesterday.');
      expect(recBike.recommendation).toContain('High pollution alert for Delhi');
      expect(recBike.recommendation).not.toContain('Commute and transit advisory');

      // 8. Role parity on unrelated query: 5-field match across roles
      const recCaregiverUnrelated = await generateChatRecommendation({
        userMessage: 'What is the capital of France?',
        lifestyle: { userRole: 'caregiver' },
        location: testCity,
        airQuality: severeAqi,
      });
      const recWorkerUnrelated = await generateChatRecommendation({
        userMessage: 'What is the capital of France?',
        lifestyle: { userRole: 'working_professional' },
        location: testCity,
        airQuality: severeAqi,
      });
      expect(recCaregiverUnrelated.recommendation).toBe(recWorkerUnrelated.recommendation);
      expect(recCaregiverUnrelated.whyItMatters).toBe(recWorkerUnrelated.whyItMatters);
      expect(recCaregiverUnrelated.practicalSteps).toEqual(recWorkerUnrelated.practicalSteps);
      expect(recCaregiverUnrelated.expectedBenefit).toBe(recWorkerUnrelated.expectedBenefit);
      expect(recCaregiverUnrelated.relevantLimitations).toBe(recWorkerUnrelated.relevantLimitations);
    });
  });

  it('production quality: no unsupported numerical exposure percentages in fallback responses', async () => {
    const city = { name: 'Delhi' };
    const severe = { usAqi: 240, pm2_5: 165 };

    const [severeFallback, moderateFallback, lowFallback] = await Promise.all([
      chatHandler({ httpMethod: 'POST', body: JSON.stringify({ message: 'What should I do today?', location: city, airQuality: severe }) }),
      chatHandler({ httpMethod: 'POST', body: JSON.stringify({ message: 'What should I do today?', location: city, airQuality: { usAqi: 130, usAqiCategory: 'Unhealthy for Sensitive Groups' } }) }),
      chatHandler({ httpMethod: 'POST', body: JSON.stringify({ message: 'What should I do today?', location: city, airQuality: { usAqi: 45, usAqiCategory: 'Good' } }) }),
    ]);

    for (const res of [severeFallback, moderateFallback, lowFallback]) {
      const body = JSON.parse(res.body);
      const fullText = JSON.stringify(body);
      expect(fullText).not.toMatch(/\d+[-–]\d+%/);
      expect(fullText).not.toContain('60-80%');
      expect(fullText).not.toContain('75-85%');
      expect(fullText).not.toContain('substantially reduces');
    }

    // Also verify backend geminiService parity
    const [bSevere, bModerate, bLow] = await Promise.all([
      generateChatRecommendation({ userMessage: 'What should I do today?', location: city, airQuality: severe }),
      generateChatRecommendation({ userMessage: 'What should I do today?', location: city, airQuality: { usAqi: 130, usAqiCategory: 'Unhealthy for Sensitive Groups' } }),
      generateChatRecommendation({ userMessage: 'What should I do today?', location: city, airQuality: { usAqi: 45, usAqiCategory: 'Good' } }),
    ]);
    for (const rec of [bSevere, bModerate, bLow]) {
      const fullText = JSON.stringify(rec);
      expect(fullText).not.toMatch(/\d+[-–]\d+%/);
      expect(fullText).not.toContain('60-80%');
      expect(fullText).not.toContain('75-85%');
      expect(fullText).not.toContain('substantially reduces');
    }
  });

  it('production quality: ventilation advice never assumes solar noon is safe — requires hourly AQI check', async () => {
    const city = { name: 'Delhi' };

    const [moderateRes, noAqiRes] = await Promise.all([
      chatHandler({ httpMethod: 'POST', body: JSON.stringify({ message: 'What is the best time to ventilate my home today?', location: city, airQuality: { usAqi: 130, usAqiCategory: 'Unhealthy for Sensitive Groups' } }) }),
      chatHandler({ httpMethod: 'POST', body: JSON.stringify({ message: 'When should I open windows to ventilate?', location: city }) }),
    ]);

    const moderateBody = JSON.parse(moderateRes.body);
    const noAqiBody = JSON.parse(noAqiRes.body);

    // Moderate: must not assert fixed solar noon window; must reference hourly check
    const moderateText = JSON.stringify(moderateBody);
    expect(moderateText).not.toContain('12:00 PM and 4:00 PM');
    expect(moderateText).not.toContain('solar noon');
    expect(moderateText).toContain('hourly');

    // Missing AQI: must not assert fixed time
    const noAqiText = JSON.stringify(noAqiBody);
    expect(noAqiText).not.toContain('12:00 PM and 4:00 PM');
    expect(noAqiText).not.toContain('solar noon');

    // Parity: backend matches netlify for moderate ventilation query
    const backendModerate = await generateChatRecommendation({
      userMessage: 'What is the best time to ventilate my home today?',
      location: city,
      airQuality: { usAqi: 130, usAqiCategory: 'Unhealthy for Sensitive Groups' },
    });
    expect(backendModerate.recommendation).toBe(moderateBody.recommendation);
    expect(backendModerate.practicalSteps).toEqual(moderateBody.practicalSteps);
    expect(JSON.stringify(backendModerate)).not.toContain('12:00 PM and 4:00 PM');
    expect(JSON.stringify(backendModerate)).not.toContain('solar noon');
  });

  it('production quality: indoor telemetry limitation is disclosed in indoor/ventilation fallback', async () => {
    const city = { name: 'Delhi' };
    const severe = { usAqi: 240, pm2_5: 165 };
    const moderate = { usAqi: 130, usAqiCategory: 'Unhealthy for Sensitive Groups' };
    const testCases = [
      { message: 'What is the best time to ventilate my home today?', aqi: severe, expectedType: 'containment' },
      { message: 'How do I keep my indoor air clean during smog?', aqi: severe, expectedType: 'containment' },
      { message: 'Should I open windows or use an air purifier indoors?', aqi: severe, expectedType: 'containment' },
      { message: 'When should I open windows to ventilate the house?', aqi: moderate, expectedType: 'ventilation' },
    ];

    for (const { message, aqi, expectedType } of testCases) {
      const netlifyRes = await chatHandler({
        httpMethod: 'POST',
        body: JSON.stringify({ message, location: city, airQuality: aqi }),
      });
      const netlifyBody = JSON.parse(netlifyRes.body);
      const backendBody = await generateChatRecommendation({ userMessage: message, location: city, airQuality: aqi });

      // 1. Every intended query MUST trigger indoor air quality intent (fails if intent detection missed)
      if (expectedType === 'containment') {
        expect(netlifyBody.recommendation).toContain('Indoor air containment protocol');
        expect(backendBody.recommendation).toContain('Indoor air containment protocol');
      } else {
        expect(netlifyBody.recommendation).toContain('Indoor ventilation strategy');
        expect(backendBody.recommendation).toContain('Indoor ventilation strategy');
      }

      // 2. Both implementations independently must disclose that indoor sensors are unmonitored
      expect(netlifyBody.relevantLimitations).toContain('unmonitored');
      expect(netlifyBody.relevantLimitations).toContain('no connected indoor sensors');
      expect(backendBody.relevantLimitations).toContain('unmonitored');
      expect(backendBody.relevantLimitations).toContain('no connected indoor sensors');

      // 3. Parity: full 5-field equality between Netlify and backend
      expect(netlifyBody.recommendation).toBe(backendBody.recommendation);
      expect(netlifyBody.whyItMatters).toBe(backendBody.whyItMatters);
      expect(netlifyBody.practicalSteps).toEqual(backendBody.practicalSteps);
      expect(netlifyBody.expectedBenefit).toBe(backendBody.expectedBenefit);
      expect(netlifyBody.relevantLimitations).toBe(backendBody.relevantLimitations);
    }
  });

  it('production quality: general AQI fallbacks disclose indoor air is unmonitored', async () => {
    const city = { name: 'Delhi' };

    const [moderateBackend, lowBackend, moderateNetlify, lowNetlify] = await Promise.all([
      generateChatRecommendation({ userMessage: 'What should I do today?', location: city, airQuality: { usAqi: 130, usAqiCategory: 'Unhealthy for Sensitive Groups' } }),
      generateChatRecommendation({ userMessage: 'What should I do today?', location: city, airQuality: { usAqi: 45, usAqiCategory: 'Good' } }),
      chatHandler({ httpMethod: 'POST', body: JSON.stringify({ message: 'What should I do today?', location: city, airQuality: { usAqi: 130, usAqiCategory: 'Unhealthy for Sensitive Groups' } }) }),
      chatHandler({ httpMethod: 'POST', body: JSON.stringify({ message: 'What should I do today?', location: city, airQuality: { usAqi: 45, usAqiCategory: 'Good' } }) }),
    ]);

    for (const rec of [moderateBackend, lowBackend]) {
      expect(rec.relevantLimitations).toContain('unmonitored');
    }
    for (const res of [moderateNetlify, lowNetlify]) {
      const body = JSON.parse(res.body);
      expect(body.relevantLimitations).toContain('unmonitored');
    }

    // First ventilation step must reference AQI check, not a fixed clock time
    expect(moderateBackend.practicalSteps[0]).toContain('hourly');
    expect(lowBackend.practicalSteps[0]).toContain('hourly');
    expect(moderateBackend.practicalSteps[0]).not.toContain('12:00 PM');
    expect(lowBackend.practicalSteps[0]).not.toContain('12:00 PM');
  });

  it('production quality: static marketing copy contains no fixed-time ventilation/pollution claims', () => {
    // Read frontend source files directly to guard against regression of fixed-time claims
    const root = resolve(__dirname, '../../../');
    const landingPage = readFileSync(resolve(root, 'frontend/src/pages/LandingPage.tsx'), 'utf-8');
    const airDashboard = readFileSync(resolve(root, 'frontend/src/components/dashboard/AirDashboard.tsx'), 'utf-8');
    const indoorGuardian = readFileSync(resolve(root, 'frontend/src/components/indoor/IndoorAirGuardian.tsx'), 'utf-8');
    const dailyPlanner = readFileSync(resolve(root, 'frontend/src/components/planner/DailyPlanner.tsx'), 'utf-8');

    const allSources = [
      { name: 'LandingPage.tsx', src: landingPage },
      { name: 'AirDashboard.tsx', src: airDashboard },
      { name: 'IndoorAirGuardian.tsx', src: indoorGuardian },
      { name: 'DailyPlanner.tsx', src: dailyPlanner },
    ];

    for (const { name, src } of allSources) {
      // No fixed "1:00 PM solar warming" claim
      expect(src, `${name}: fixed 1:00 PM solar warming claim`).not.toContain('1:00 PM when solar warming');
      // No "solar noon" ventilation claim
      expect(src, `${name}: solar noon ventilation claim`).not.toContain('solar noon');
      // No "until solar noon" window instruction
      expect(src, `${name}: until solar noon`).not.toContain('until solar noon');
      // No "12:00 PM and 4:00 PM" fixed ventilation window
      expect(src, `${name}: 12:00 PM and 4:00 PM ventilation window`).not.toContain('12:00 PM and 4:00 PM');
      // No "solar warming dilutes" assertion
      expect(src, `${name}: solar warming dilutes`).not.toContain('solar warming dilutes');
    }

    // LandingPage / en.json specific: must contain the corrected guidance
    const enLocale = readFileSync(resolve(root, 'frontend/src/i18n/locales/en.json'), 'utf-8');
    const combinedLandingText = landingPage + enLocale;
    expect(combinedLandingText).toContain('Check current hourly air-quality readings before planning outdoor errands');
    // AirDashboard / en.json specific: must reference hourly AQI check for high pollution window
    const combinedDashboardText = airDashboard + enLocale;
    expect(combinedDashboardText).toContain('Check current hourly AQI before airing rooms');
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

