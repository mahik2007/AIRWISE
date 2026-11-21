export interface PollutantMeasurement {
  value: number;
  unit: string;
  subIndex?: number;
  status?: 'good' | 'moderate' | 'unhealthy_sensitive' | 'unhealthy' | 'very_unhealthy' | 'hazardous';
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

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRecommendationResponse {
  recommendation: string;
  whyItMatters: string;
  practicalSteps: string[];
  expectedBenefit: string;
  relevantLimitations: string;
}

