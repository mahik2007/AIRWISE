import { describe, it, expect } from 'vitest';
import { 
  getAqiColor, 
  getEuropeanAqiBadge, 
  getCpcbAqiCategory, 
  formatTime, 
  formatDate,
  formatCoordinates,
  evaluateWhoGuideline
} from './formatters';

describe('Frontend Formatters & Color Mappings', () => {
  it('correctly returns styling metadata for Good AQI', () => {
    const res = getAqiColor(40);
    expect(res.category).toBe('Good');
    expect(res.text).toContain('emerald');
  });

  it('correctly returns styling metadata for Unhealthy AQI', () => {
    const res = getAqiColor(170);
    expect(res.category).toBe('Unhealthy');
    expect(res.text).toContain('red');
  });

  it('correctly returns styling metadata for Hazardous AQI', () => {
    const res = getAqiColor(340);
    expect(res.category).toBe('Hazardous');
    expect(res.text).toContain('rose');
  });

  it('correctly maps European AQI badges across all scale tiers', () => {
    expect(getEuropeanAqiBadge(15).category).toBe('Good');
    expect(getEuropeanAqiBadge(55).category).toBe('Moderate');
    expect(getEuropeanAqiBadge(112).category).toBe('Extremely Poor');
  });

  it('correctly categorizes Indian CPCB NAQI categories', () => {
    expect(getCpcbAqiCategory(35)).toBe('Good');
    expect(getCpcbAqiCategory(85)).toBe('Satisfactory');
    expect(getCpcbAqiCategory(160)).toBe('Moderate');
    expect(getCpcbAqiCategory(260)).toBe('Poor');
    expect(getCpcbAqiCategory(360)).toBe('Very Poor');
    expect(getCpcbAqiCategory(460)).toBe('Severe');
  });

  it('formats dates and times gracefully', () => {
    const iso = '2026-11-20T08:30:00Z';
    const timeStr = formatTime(iso);
    const dateStr = formatDate(iso);
    expect(typeof timeStr).toBe('string');
    expect(typeof dateStr).toBe('string');
  });

  it('safely handles non-ISO or malformed time values', () => {
    expect(formatTime('invalid-time')).toBe('invalid-time');
    expect(formatDate('invalid-date')).toBe('invalid-date');
  });

  describe('formatCoordinates Geographic Hemisphere Formatting', () => {
    it('formats positive latitude and longitude as North and East', () => {
      expect(formatCoordinates(28.6139, 77.2090)).toBe('28.6139°N, 77.2090°E');
    });

    it('formats negative latitude and positive longitude as South and East', () => {
      expect(formatCoordinates(-33.8688, 151.2093)).toBe('33.8688°S, 151.2093°E');
    });

    it('formats positive latitude and negative longitude as North and West', () => {
      expect(formatCoordinates(40.7128, -74.0060)).toBe('40.7128°N, 74.0060°W');
    });

    it('formats negative latitude and negative longitude as South and West', () => {
      expect(formatCoordinates(-23.5505, -46.6333)).toBe('23.5505°S, 46.6333°W');
    });

    it('handles zero coordinates gracefully', () => {
      expect(formatCoordinates(0, 0)).toBe('0.0000°N, 0.0000°E');
    });

    it('handles invalid coordinates safely', () => {
      expect(formatCoordinates(NaN, 10)).toBe('Coordinates Unavailable');
    });
  });

  describe('evaluateWhoGuideline Scientific Averaging Compatibility', () => {
    it('provides reference context without exceedance ratio when averaging period mismatches (1-hr vs 24-hr)', () => {
      const res = evaluateWhoGuideline('pm2_5', 120.5, 'µg/m³', '1-hr reading');
      expect(res.isCompatible).toBe(false);
      expect(res.ratio).toBeNull();
      expect(res.statusBadge).toBe('reference_only');
      expect(res.whoSpec.value).toBe(15);
      expect(res.whoSpec.averagingPeriod).toBe('24-hour');
      expect(res.reasonWhyUnavailable).toContain('Direct ratio unavailable');
    });

    it('calculates ratio and exceedance when averaging periods match for PM2.5 (24-hour)', () => {
      const res = evaluateWhoGuideline('pm2_5', 30.0, 'µg/m³', '24-hour average');
      expect(res.isCompatible).toBe(true);
      expect(res.exceedsGuideline).toBe(true);
      expect(res.ratio).toBe(2.0);
      expect(res.statusBadge).toBe('exceeds');
    });

    it('correctly calculates compliant ratio when concentration is within WHO guideline', () => {
      const res = evaluateWhoGuideline('pm2_5', 10.0, 'µg/m³', '24-hour average');
      expect(res.isCompatible).toBe(true);
      expect(res.exceedsGuideline).toBe(false);
      expect(res.ratio).toBe(0.7);
      expect(res.statusBadge).toBe('within');
    });

    it('handles Carbon Monoxide unit normalization from µg/m³ to mg/m³', () => {
      // 4000 µg/m³ = 4 mg/m³, exactly equal to 4 mg/m³ guideline
      const res = evaluateWhoGuideline('carbonMonoxide', 8000, 'µg/m³', '24-hour average');
      expect(res.isCompatible).toBe(true);
      expect(res.whoSpec.unit).toBe('mg/m³');
      expect(res.whoSpec.value).toBe(4);
      expect(res.ratio).toBe(2.0);
      expect(res.exceedsGuideline).toBe(true);
    });

    it('verifies guideline specs across all specified pollutants', () => {
      expect(evaluateWhoGuideline('pm10', 45, 'µg/m³', '24-hour').whoSpec.value).toBe(45);
      expect(evaluateWhoGuideline('nitrogenDioxide', 25, 'µg/m³', '24-hour').whoSpec.value).toBe(25);
      expect(evaluateWhoGuideline('ozone', 100, 'µg/m³', '8-hour daily max').whoSpec.value).toBe(100);
      expect(evaluateWhoGuideline('sulphurDioxide', 40, 'µg/m³', '24-hour').whoSpec.value).toBe(40);
    });
  });
});
