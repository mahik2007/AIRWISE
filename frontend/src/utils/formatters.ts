export function getAqiColor(aqi: number): {
  bg: string;
  text: string;
  border: string;
  badge: string;
  category: string;
} {
  if (aqi <= 50) {
    return {
      bg: 'bg-emerald-950/40',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      category: 'Good',
    };
  } else if (aqi <= 100) {
    return {
      bg: 'bg-amber-950/40',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      category: 'Moderate',
    };
  } else if (aqi <= 150) {
    return {
      bg: 'bg-orange-950/40',
      text: 'text-orange-400',
      border: 'border-orange-500/30',
      badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      category: 'Unhealthy for Sensitive Groups',
    };
  } else if (aqi <= 200) {
    return {
      bg: 'bg-red-950/40',
      text: 'text-red-400',
      border: 'border-red-500/30',
      badge: 'bg-red-500/20 text-red-300 border-red-500/40',
      category: 'Unhealthy',
    };
  } else if (aqi <= 300) {
    return {
      bg: 'bg-purple-950/40',
      text: 'text-purple-400',
      border: 'border-purple-500/30',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      category: 'Very Unhealthy',
    };
  } else {
    return {
      bg: 'bg-rose-950/60',
      text: 'text-rose-400',
      border: 'border-rose-500/40',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
      category: 'Hazardous',
    };
  }
}

export function getEuropeanAqiBadge(aqi: number): {
  category: string;
  badge: string;
} {
  if (aqi <= 20) {
    return { category: 'Good', badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40' };
  } else if (aqi <= 40) {
    return { category: 'Fair', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
  } else if (aqi <= 60) {
    return { category: 'Moderate', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
  } else if (aqi <= 80) {
    return { category: 'Poor', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40' };
  } else if (aqi <= 100) {
    return { category: 'Very Poor', badge: 'bg-red-500/20 text-red-300 border-red-500/40' };
  } else {
    return { category: 'Extremely Poor', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
  }
}

// Indian CPCB National Air Quality Index (NAQI) Breakpoints (0-50 Good, 51-100 Satisfactory, 101-200 Moderate, 201-300 Poor, 301-400 Very Poor, 401-500 Severe)
export function getCpcbAqiCategory(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Satisfactory';
  if (aqi <= 200) return 'Moderate';
  if (aqi <= 300) return 'Poor';
  if (aqi <= 400) return 'Very Poor';
  return 'Severe';
}

export function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return isoString;
  }
}

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return isoString;
  }
}

/**
 * Format geographic coordinates with directional hemisphere notation (N/S and E/W).
 * Properly handles positive, negative, and zero coordinates.
 */
export function formatCoordinates(lat: number, lon: number): string {
  if (typeof lat !== 'number' || typeof lon !== 'number' || isNaN(lat) || isNaN(lon)) {
    return 'Coordinates Unavailable';
  }
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lon).toFixed(4)}°${lonDir}`;
}

export interface WhoGuidelineSpec {
  value: number; // numeric value in standard target units
  unit: string;
  averagingPeriod: string; // e.g. '24-hour', '8-hour peak'
  label: string; // e.g. '15 µg/m³ (24-h)'
}

export interface WhoComparisonResult {
  whoSpec: WhoGuidelineSpec;
  isCompatible: boolean;
  exceedsGuideline: boolean | null;
  ratio: number | null;
  ratioDisplay: string;
  statusBadge: 'within' | 'exceeds' | 'reference_only';
  reasonWhyUnavailable?: string;
}

/**
 * Evaluates a measured pollutant concentration against WHO 2021 Air Quality Guidelines.
 *
 * Requirements:
 * - PM2.5: 15 µg/m³, 24-hour
 * - PM10: 45 µg/m³, 24-hour
 * - NO2: 25 µg/m³, 24-hour
 * - O3: 100 µg/m³, 8-hour daily maximum
 * - SO2: 40 µg/m³, 24-hour
 * - CO: 4 mg/m³ (or 4000 µg/m³), 24-hour
 *
 * Strict Rule: Do not calculate or display an exceedance ratio when the source
 * measurement averaging period does not match the WHO reference period.
 * In that case, display WHO value as reference context with an explicit explanation.
 */
export function evaluateWhoGuideline(
  pollutant: 'pm2_5' | 'pm10' | 'nitrogenDioxide' | 'ozone' | 'sulphurDioxide' | 'carbonMonoxide',
  measuredValue: number,
  measuredUnit: string,
  measuredAveragingPeriod: string // e.g. '1-hour instantaneous/model', '24-hour'
): WhoComparisonResult {
  const specs: Record<string, WhoGuidelineSpec> = {
    pm2_5: { value: 15, unit: 'µg/m³', averagingPeriod: '24-hour', label: '15 µg/m³ (24-h)' },
    pm10: { value: 45, unit: 'µg/m³', averagingPeriod: '24-hour', label: '45 µg/m³ (24-h)' },
    nitrogenDioxide: { value: 25, unit: 'µg/m³', averagingPeriod: '24-hour', label: '25 µg/m³ (24-h)' },
    ozone: { value: 100, unit: 'µg/m³', averagingPeriod: '8-hour daily maximum', label: '100 µg/m³ (8-h max)' },
    sulphurDioxide: { value: 40, unit: 'µg/m³', averagingPeriod: '24-hour', label: '40 µg/m³ (24-h)' },
    carbonMonoxide: { value: 4, unit: 'mg/m³', averagingPeriod: '24-hour', label: '4 mg/m³ (24-h)' },
  };

  const spec = specs[pollutant];
  if (!spec) {
    throw new Error(`Unknown pollutant: ${pollutant}`);
  }

  // Normalize units for CO if measurement is µg/m³ and guideline is mg/m³
  let normalizedMeasured = measuredValue;
  if (pollutant === 'carbonMonoxide') {
    if (measuredUnit === 'µg/m³') {
      normalizedMeasured = measuredValue / 1000; // convert µg/m³ to mg/m³ for direct unit consistency
    }
  }

  // Averaging period compatibility check:
  // WHO guidelines are 24-hour averages (or 8-hour daily max for O3).
  // Real-time telemetry/model outputs are typically 1-hour hourly values.
  const is24hMatch = spec.averagingPeriod.includes('24-hour') && measuredAveragingPeriod.toLowerCase().includes('24-h');
  const is8hMatch = spec.averagingPeriod.includes('8-hour') && measuredAveragingPeriod.toLowerCase().includes('8-h');
  const isCompatible = is24hMatch || is8hMatch;

  if (!isCompatible) {
    return {
      whoSpec: spec,
      isCompatible: false,
      exceedsGuideline: null,
      ratio: null,
      ratioDisplay: 'Reference Context Only',
      statusBadge: 'reference_only',
      reasonWhyUnavailable: `Current reading is a ${measuredAveragingPeriod}. Direct ratio unavailable because WHO 2021 guideline specifies a ${spec.averagingPeriod} average.`,
    };
  }

  const ratio = Number((normalizedMeasured / spec.value).toFixed(1));
  const exceeds = normalizedMeasured > spec.value;

  return {
    whoSpec: spec,
    isCompatible: true,
    exceedsGuideline: exceeds,
    ratio,
    ratioDisplay: `${ratio}x WHO ref`,
    statusBadge: exceeds ? 'exceeds' : 'within',
  };
}
