// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { AirDashboard } from './AirDashboard';
import i18n from '../../i18n/config';
import { AirQualityPayload } from '../../types';

const mockPayload: AirQualityPayload = {
  location: {
    name: 'Delhi',
    latitude: 28.65,
    longitude: 77.23,
    country: 'India',
    admin1: 'Delhi',
  },
  current: {
    usAqi: 240,
    usAqiCategory: 'Very Unhealthy',
    europeanAqi: 85,
    europeanAqiCategory: 'Very Poor',
    pm2_5: { value: 120.5, unit: 'µg/m³' },
    pm10: { value: 210.0, unit: 'µg/m³' },
    nitrogenDioxide: { value: 35.2, unit: 'µg/m³' },
    ozone: { value: 18.0, unit: 'µg/m³' },
    sulphurDioxide: { value: 12.0, unit: 'µg/m³' },
    carbonMonoxide: { value: 1450, unit: 'µg/m³' },
    timestamp: '2026-11-25T12:00:00Z',
    dataSource: 'Copernicus Atmospheric Model',
    isObservedStation: false,
  },
  hourly: [
    { time: '2026-11-25T00:00:00Z', usAqi: 220, pm2_5: 110, pm10: 190, ozone: 15, nitrogenDioxide: 30 },
    { time: '2026-11-25T06:00:00Z', usAqi: 280, pm2_5: 150, pm10: 260, ozone: 10, nitrogenDioxide: 45 },
    { time: '2026-11-25T12:00:00Z', usAqi: 190, pm2_5: 95, pm10: 170, ozone: 22, nitrogenDioxide: 25 },
  ],
  dailyForecast: [
    { date: '2026-11-25', maxUsAqi: 260, avgPm2_5: 130, dominantPollutant: 'pm2_5', conditionSummary: 'Severe Smog' },
    { date: '2026-11-26', maxUsAqi: 210, avgPm2_5: 105, dominantPollutant: 'pm2_5', conditionSummary: 'Unhealthy' },
  ],
  attribution: {
    dataProvider: 'Open-Meteo & Copernicus CAMS',
    modelInfo: 'High-resolution atmospheric model',
    license: 'Open Data',
    cpcbStatus: 'Modelled atmospheric data',
  },
};

describe('AirDashboard Accessibility & Rendering', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
    document.body.innerHTML = '';
  });

  it('renders location title, telemetry badges and accessible AQI section', () => {
    render(
      <AirDashboard
        data={mockPayload}
        onRefresh={() => {}}
        onAskAI={() => {}}
      />
    );

    expect(screen.getByRole('heading', { level: 1, name: /Delhi/i })).toBeDefined();

    const overview = screen.getByRole('region', { name: /Current Air Quality Index Overview/i });
    expect(overview).toBeDefined();

    // Check accessible gauge label
    const gauge = screen.getByLabelText(/US Air Quality Index 240, Category: Very Unhealthy/i);
    expect(gauge).toBeDefined();
  });

  it('renders pollutant metric cards with readable text numbers and WHO guidance limits', () => {
    render(
      <AirDashboard
        data={mockPayload}
        onRefresh={() => {}}
        onAskAI={() => {}}
      />
    );

    expect(screen.getByText('PM2.5')).toBeDefined();
    expect(screen.getByText('PM10')).toBeDefined();
    expect(screen.getByText('NO₂')).toBeDefined();
    expect(screen.getByText('120.5')).toBeDefined();
  });

  it('provides screen-reader accessible summary of the forecast trend', () => {
    render(
      <AirDashboard
        data={mockPayload}
        onRefresh={() => {}}
        onAskAI={() => {}}
      />
    );

    const summary = screen.getByText(/Hourly forecast shows peak predicted US AQI of 280 and peak PM2.5 of 150/i);
    expect(summary).toBeDefined();
    expect(summary.className).toContain('sr-only');
  });
});
