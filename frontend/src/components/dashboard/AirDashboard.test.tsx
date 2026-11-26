// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AirDashboard } from './AirDashboard';
import i18n from '../../i18n/config';
import { AirQualityPayload } from '../../types';

const mockModelPayload: AirQualityPayload = {
  location: {
    name: 'Delhi',
    latitude: 28.65,
    longitude: 77.23,
    country: 'India',
    admin1: 'Delhi',
  },
  current: {
    usAqi: 199,
    usAqiCategory: 'Unhealthy',
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

const mockStationPayload: AirQualityPayload = {
  ...mockModelPayload,
  location: {
    name: 'Sydney Observatory',
    latitude: -33.8599,
    longitude: 151.2048,
    country: 'Australia',
  },
  current: {
    ...mockModelPayload.current,
    isObservedStation: true,
    stationName: 'Sydney Observatory Hill Station #048',
  },
};

describe('AirDashboard Accessibility, Provenance & Scientific Integrity', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
    document.body.innerHTML = '';
  });

  it('renders location title, atmospheric model provenance and formatted N/E coordinates', () => {
    render(
      <AirDashboard
        data={mockModelPayload}
        onRefresh={() => {}}
        onAskAI={() => {}}
      />
    );

    expect(screen.getByRole('heading', { level: 1, name: /Delhi/i })).toBeDefined();

    // Check provenance: model data should be explicitly tagged
    expect(screen.getByText('Atmospheric Dispersion Model')).toBeDefined();
    expect(screen.getByText(/28.6500°N, 77.2300°E/)).toBeDefined();

    const overview = screen.getByRole('region', { name: /Current Air Quality Index Overview/i });
    expect(overview).toBeDefined();

    // Check accessible gauge label
    const gauge = screen.getByLabelText(/US Air Quality Index 199, Category: Unhealthy/i);
    expect(gauge).toBeDefined();
  });

  it('renders Ground Station Observation only when stationName is explicitly provided, with directional S/E coordinates', () => {
    render(
      <AirDashboard
        data={mockStationPayload}
        onRefresh={() => {}}
        onAskAI={() => {}}
      />
    );

    expect(screen.getByText('Ground Station Observation')).toBeDefined();
    expect(screen.getByText(/Sydney Observatory Hill Station #048/)).toBeDefined();
    // Negative latitude formatted as South
    expect(screen.getByText(/33.8599°S, 151.2048°E/)).toBeDefined();
  });

  it('handles WHO guideline averaging period mismatch transparently as Reference Only without misleading exceedance ratios', () => {
    render(
      <AirDashboard
        data={mockModelPayload}
        onRefresh={() => {}}
        onAskAI={() => {}}
      />
    );

    // Pollutant parameters are visible in both desktop table and mobile presentation
    expect(screen.getAllByText('PM2.5').length).toBeGreaterThan(0);
    expect(screen.getAllByText('120.5').length).toBeGreaterThan(0);

    // Reference only badges should appear for hourly readings compared to 24-h WHO guidelines
    const referenceBadges = screen.getAllByText('Reference Only');
    expect(referenceBadges.length).toBeGreaterThan(0);

    // Period mismatch explanation should be rendered
    expect(screen.getAllByText(/Period mismatch: 1-hr reading vs/i).length).toBeGreaterThan(0);
  });

  it('renders accurate protocol status badge (Recommended, not Normal) when AQI is 199 (elevated)', () => {
    render(
      <AirDashboard
        data={mockModelPayload}
        onRefresh={() => {}}
        onAskAI={() => {}}
      />
    );

    // For AQI=199 (Elevated), mask protocol should have Recommended badge, NOT Normal
    const maskHeading = screen.getByText('Mask Recommended for Sensitive Groups');
    expect(maskHeading).toBeDefined();
    
    // Status badge next to mask heading should be Recommended
    expect(screen.getByText('Recommended')).toBeDefined();
    // Ventilation status should be Advisory
    expect(screen.getByText('Advisory')).toBeDefined();
  });

  it('renders evidence-based Strongly Advised badge for AQI > 200 without implying a mandate', () => {
    const severePayload: AirQualityPayload = {
      ...mockModelPayload,
      current: {
        ...mockModelPayload.current,
        usAqi: 240,
        usAqiCategory: 'Very Unhealthy',
      },
    };

    render(
      <AirDashboard
        data={severePayload}
        onRefresh={() => {}}
        onAskAI={() => {}}
      />
    );

    // Verify evidence-based recommendation wording
    expect(screen.getByText('Strongly Advised')).toBeDefined();
    expect(screen.getByText('Restricted')).toBeDefined();
    // Must NOT use legalistic 'Mandatory'
    expect(screen.queryByText('Mandatory')).toBeNull();
  });

  it('re-renders chart and full dashboard in Hindi with verified plotted data curves across metric toggles', async () => {
    const { rerender } = render(
      <AirDashboard
        data={mockModelPayload}
        onRefresh={() => {}}
        onAskAI={() => {}}
      />
    );

    // 1. Initial English Chart check
    expect(screen.getByText('US AQI Curve (0–500)')).toBeDefined();

    // 2. Switch to Hindi
    await act(async () => {
      await i18n.changeLanguage('hi');
    });

    rerender(
      <AirDashboard
        data={mockModelPayload}
        onRefresh={() => {}}
        onAskAI={() => {}}
      />
    );

    // Verify key translated sections in Hindi
    expect(screen.getByText('वायुमंडलीय प्रदूषक सांद्रता मैट्रिक्स')).toBeDefined();
    expect(screen.getByText('कार्रवाई योग्य सुरक्षा प्रोटोकॉल')).toBeDefined();
    expect(screen.getByText('24-घंटे का वायुमंडलीय रुझान और फैलाव पूर्वानुमान')).toBeDefined();
    expect(screen.getByText('5-दिवसीय सिनॉप्टिक वायु गुणवत्ता दृष्टिकोण')).toBeDefined();
    expect(screen.getByText('संवेदनशील समूहों के लिए मास्क अनुशंसित')).toBeDefined();
    expect(screen.getByText('अनुशंसित')).toBeDefined();
    expect(screen.getByText('परामर्श')).toBeDefined();

    // Verify Hindi chart toggle buttons are present
    const hiAqiToggle = screen.getByRole('button', { name: /US AQI वक्र/i });
    const hiPm25Toggle = screen.getByRole('button', { name: /PM2.5 द्रव्यमान/i });
    expect(hiAqiToggle).toBeDefined();
    expect(hiPm25Toggle).toBeDefined();

    // 3. Switch metric to PM2.5 in Hindi
    fireEvent.click(hiPm25Toggle);
    expect(hiPm25Toggle.className).toContain('border-teal-500');

    // 4. Switch metric back to US AQI in Hindi
    fireEvent.click(hiAqiToggle);
    expect(hiAqiToggle.className).toContain('border-emerald-500');

    // 5. Switch back to English to verify clean roundtrip locale behavior
    await act(async () => {
      await i18n.changeLanguage('en');
    });

    rerender(
      <AirDashboard
        data={mockModelPayload}
        onRefresh={() => {}}
        onAskAI={() => {}}
      />
    );
    expect(screen.getByText('US AQI Curve (0–500)')).toBeDefined();
  });

  it('supports toggling chart between US AQI curve and PM2.5 mass curve', () => {
    render(
      <AirDashboard
        data={mockModelPayload}
        onRefresh={() => {}}
        onAskAI={() => {}}
      />
    );

    const pm25Toggle = screen.getByRole('button', { name: /PM2.5 Mass/i });
    expect(pm25Toggle).toBeDefined();

    fireEvent.click(pm25Toggle);
    // After clicking PM2.5, the PM2.5 toggle button should receive active border styling
    expect(pm25Toggle.className).toContain('border-teal-500');

    const aqiToggle = screen.getByRole('button', { name: /US AQI Curve/i });
    fireEvent.click(aqiToggle);
    expect(aqiToggle.className).toContain('border-emerald-500');
  });

  it('provides screen-reader accessible summary of the forecast trend', () => {
    render(
      <AirDashboard
        data={mockModelPayload}
        onRefresh={() => {}}
        onAskAI={() => {}}
      />
    );

    const summary = screen.getByText(/Hourly forecast shows peak predicted US AQI of 280 and peak PM2.5 of 150/i);
    expect(summary).toBeDefined();
    expect(summary.className).toContain('sr-only');
  });
});
