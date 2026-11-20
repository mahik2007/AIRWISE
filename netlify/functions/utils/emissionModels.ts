export interface TransportComparison {
  distanceKm: number;
  modeA: string;
  modeB: string;
  co2SavedGrams: number;
  pm25SavedGrams: number;
  explanation: string;
  assumptions: string;
}

const EMISSION_FACTORS: Record<string, { co2PerKm: number; pm25PerKm: number; label: string }> = {
  car_solo: { co2PerKm: 180, pm25PerKm: 0.030, label: 'Solo Private Car' },
  carpool: { co2PerKm: 65, pm25PerKm: 0.010, label: 'Carpool (3 people)' },
  two_wheeler: { co2PerKm: 75, pm25PerKm: 0.015, label: 'Motorbike / Scooter' },
  bus: { co2PerKm: 35, pm25PerKm: 0.005, label: 'City Bus Transit' },
  metro: { co2PerKm: 15, pm25PerKm: 0.001, label: 'Electric Metro Rail' },
  cycle_walk: { co2PerKm: 0, pm25PerKm: 0.000, label: 'Cycle / Walking' },
  wfh: { co2PerKm: 0, pm25PerKm: 0.000, label: 'Remote / WFH (Zero commute)' },
};

export function calculateTripSavings(
  baselineMode: string,
  alternativeMode: string,
  distanceKm: number
): TransportComparison {
  const base = EMISSION_FACTORS[baselineMode] || EMISSION_FACTORS.car_solo;
  const alt = EMISSION_FACTORS[alternativeMode] || EMISSION_FACTORS.metro;

  const co2Base = base.co2PerKm * distanceKm;
  const co2Alt = alt.co2PerKm * distanceKm;
  const co2Saved = Math.max(0, co2Base - co2Alt);

  const pm25Base = base.pm25PerKm * distanceKm;
  const pm25Alt = alt.pm25PerKm * distanceKm;
  const pm25Saved = Math.max(0, pm25Base - pm25Alt);

  return {
    distanceKm,
    modeA: base.label,
    modeB: alt.label,
    co2SavedGrams: Math.round(co2Saved * 10) / 10,
    pm25SavedGrams: Math.round(pm25Saved * 1000) / 1000,
    explanation: `Switching a ${distanceKm} km trip from ${base.label} to ${alt.label} avoids direct tailpipe emissions of approx ${(co2Saved / 1000).toFixed(2)} kg CO2 and ${pm25Saved.toFixed(3)} g particulate PM2.5.`,
    assumptions: 'Calculations assume average urban stop-and-go driving conditions, standard Indian urban vehicle fleet mix, and typical transit occupancy rates based on ARAI/DEFRA transport emission models.'
  };
}
