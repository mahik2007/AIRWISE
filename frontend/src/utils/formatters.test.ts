import { describe, it, expect } from 'vitest';
import { getAqiColor, formatTime, formatDate } from './formatters';

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

  it('formats dates and times gracefully', () => {
    const iso = '2026-11-18T08:30:00Z';
    const timeStr = formatTime(iso);
    const dateStr = formatDate(iso);
    expect(typeof timeStr).toBe('string');
    expect(typeof dateStr).toBe('string');
  });
});

