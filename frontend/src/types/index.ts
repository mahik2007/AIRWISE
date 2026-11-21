export interface PollutantMeasurement {
  value: number;
  unit: string;
}

export interface AirQualityCurrent {
  usAqi: number;
  usAqiCategory: string;
  europeanAqi?: number;
  europeanAqiCategory?: string;
  cpcbAqi?: number;
  cpcbAqiCategory?: string;
  pm2_5: PollutantMeasurement;
  pm10: PollutantMeasurement;
  nitrogenDioxide: PollutantMeasurement;
  sulphurDioxide: PollutantMeasurement;
  ozone: PollutantMeasurement;
  carbonMonoxide: PollutantMeasurement;
  timestamp: string;
  dataSource: string;
  isObservedStation: boolean;
  stationName?: string;
}

export interface HourlyForecastPoint {
  time: string;
  usAqi: number;
  pm2_5: number;
  pm10: number;
  ozone: number;
  nitrogenDioxide: number;
}

export interface DailyForecastPoint {
  date: string;
  maxUsAqi: number;
  avgPm2_5: number;
  dominantPollutant: string;
  conditionSummary: string;
}

export interface AirQualityPayload {
  location: {
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    admin1?: string;
  };
  current: AirQualityCurrent;
  hourly: HourlyForecastPoint[];
  dailyForecast: DailyForecastPoint[];
  attribution: {
    dataProvider: string;
    modelInfo: string;
    license: string;
    cpcbStatus: string;
  };
}

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  countryCode?: string;
  admin1?: string;
}

export interface ChatRecommendationResponse {
  recommendation: string;
  whyItMatters: string;
  practicalSteps: string[];
  expectedBenefit: string;
  relevantLimitations: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content?: string;
  recommendation?: ChatRecommendationResponse;
  timestamp: string;
}

export interface TransportComparison {
  distanceKm: number;
  modeA: string;
  modeB: string;
  co2SavedGrams: number;
  pm25SavedGrams: number;
  explanation: string;
  assumptions: string;
}

export interface SavedActivity {
  id: string;
  date: string;
  title: string;
  category: 'commute' | 'indoor' | 'energy' | 'waste';
  co2SavedGrams: number;
  pmAvoidedGrams: number;
}

