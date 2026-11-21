import { describe, it, expect } from 'vitest';
import { getUsAqiCategory, getEuropeanAqiCategory, getEuropeanAqiBadge, getCpcbAqiCategory } from './aqiCalculators.js';
import { calculateTripSavings } from './emissionModels.js';

describe('AQI Category Calculators & Scale Verification', () => {
  it('correctly categorizes Good US AQI', () => {
    const res = getUsAqiCategory(35);
    expect(res.category).toBe('Good');
    expect(res.color).toBe('#10B981');
  });

  it('correctly categorizes Moderate US AQI', () => {
    const res = getUsAqiCategory(85);
    expect(res.category).toBe('Moderate');
  });

  it('correctly categorizes Unhealthy for Sensitive Groups', () => {
    const res = getUsAqiCategory(135);
    expect(res.category).toBe('Unhealthy for Sensitive Groups');
  });

  it('correctly categorizes Hazardous US AQI', () => {
    const res = getUsAqiCategory(350);
    expect(res.category).toBe('Hazardous');
    expect(res.color).toBe('#7F1D1D');
  });

  it('evaluates European AQI boundaries and badges accurately', () => {
    expect(getEuropeanAqiCategory(15)).toBe('Good');
    expect(getEuropeanAqiCategory(35)).toBe('Fair');
    expect(getEuropeanAqiCategory(50)).toBe('Moderate');
    expect(getEuropeanAqiCategory(75)).toBe('Poor');
    expect(getEuropeanAqiCategory(95)).toBe('Very Poor');
    expect(getEuropeanAqiCategory(115)).toBe('Extremely Poor');

    const badgeGood = getEuropeanAqiBadge(15);
    expect(badgeGood.category).toBe('Good');
    expect(badgeGood.badge).toContain('teal');

    const badgeExtreme = getEuropeanAqiBadge(120);
    expect(badgeExtreme.category).toBe('Extremely Poor');
    expect(badgeExtreme.badge).toContain('purple');
  });

  it('evaluates CPCB NAQI categories correctly', () => {
    expect(getCpcbAqiCategory(30)).toBe('Good');
    expect(getCpcbAqiCategory(80)).toBe('Satisfactory');
    expect(getCpcbAqiCategory(150)).toBe('Moderate');
    expect(getCpcbAqiCategory(250)).toBe('Poor');
    expect(getCpcbAqiCategory(350)).toBe('Very Poor');
    expect(getCpcbAqiCategory(450)).toBe('Severe');
  });
});

describe('Emission Savings Model', () => {
  it('calculates savings when switching solo car to metro rail', () => {
    const distanceKm = 10;
    const result = calculateTripSavings('car_solo', 'metro', distanceKm);
    expect(result.co2SavedGrams).toBe(1650);
    expect(result.pm25SavedGrams).toBeGreaterThan(0);
    expect(result.assumptions).toContain('ARAI/DEFRA');
  });

  it('calculates 0 or positive savings when alternative is identical or cleaner', () => {
    const result = calculateTripSavings('cycle_walk', 'cycle_walk', 5);
    expect(result.co2SavedGrams).toBe(0);
    expect(result.pm25SavedGrams).toBe(0);
  });
});
