import axios from 'axios';
import { AirQualityPayload, HourlyForecastPoint, DailyForecastPoint } from '../types/airQuality.js';
import { getUsAqiCategory, getEuropeanAqiCategory, getCpcbAqiCategory } from '../utils/aqiCalculators.js';

export interface CPCBStationData {
  available: boolean;
  stationName?: string;
  observedAqi?: number;
  lastUpdated?: string;
  sourceNote: string;
}

/**
 * Interface adapter for CPCB / data.gov.in official Indian Air Quality Monitor data.
 * When a verified API key is supplied via DATA_GOV_IN_API_KEY, this adapter connects
 * to the official data.gov.in realtime AQI catalog.
 * When not available or offline, it gracefully falls back to Open-Meteo European/US atmospheric model
 * while clearly stating the distinction.
 */
export async function fetchCPCBStationData(
  latitude: number,
  longitude: number,
  cityName: string
): Promise<CPCBStationData> {
  const apiKey = process.env.DATA_GOV_IN_API_KEY;

  if (!apiKey) {
    return {
      available: false,
      sourceNote: 'No official CPCB data.gov.in API key configured. Utilizing Open-Meteo atmospheric dispersion model.',
    };
  }

  try {
    // Official data.gov.in resource endpoint for Ambient Air Quality
    const endpoint = `https://api.data.gov.in/resource/3b0139f6-17cb-4774-aaf0-1875f34873ce?api-key=${apiKey}&format=json&filters[city]=${encodeURIComponent(cityName)}`;
    const response = await axios.get(endpoint, { timeout: 4000 });
    
    if (response.data && response.data.records && response.data.records.length > 0) {
      interface CpcbRecord {
        aqi?: string | number;
        AQI?: string | number;
        station?: string;
        station_name?: string;
        last_update?: string;
      }
      // Find a record with an explicit, valid non-zero AQI number. Never use pollutant_avg as AQI.
      const validRecord = response.data.records.find((r: CpcbRecord) => {
        const rawAqi = r.aqi ?? r.AQI;
        const num = Number(rawAqi);
        return !isNaN(num) && num > 0;
      });

      if (validRecord) {
        const observedAqi = Number(validRecord.aqi ?? validRecord.AQI);
        return {
          available: true,
          stationName: validRecord.station || validRecord.station_name,
          observedAqi,
          lastUpdated: validRecord.last_update,
          sourceNote: 'Official Central Pollution Control Board (CPCB) continuous monitoring station reading.',
        };
      }
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn('CPCB data adapter query failed, falling back to atmospheric model:', errorMsg);
  }

  return {
    available: false,
    sourceNote: 'No verified real-time CPCB station match found. Displaying high-resolution atmospheric model data.',
  };
}

export async function fetchAirQuality(
  latitude: number,
  longitude: number,
  locationName: string,
  country: string = 'India',
  admin1?: string
): Promise<AirQualityPayload> {
  try {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi,european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&hourly=us_aqi,pm10,pm2_5,nitrogen_dioxide,ozone&timezone=auto&forecast_days=5`;

    const response = await axios.get(url, { timeout: 8000 });
    const data = response.data;

    const currentData = data.current || {};
    const hourlyData = data.hourly || { time: [], us_aqi: [], pm2_5: [], pm10: [], ozone: [], nitrogen_dioxide: [] };

    // Check optional CPCB station adapter
    const cpcbInfo = await fetchCPCBStationData(latitude, longitude, locationName);

    const usAqi = Math.round(currentData.us_aqi ?? 0);
    const usAqiMeta = getUsAqiCategory(usAqi);

    const eurAqi = currentData.european_aqi ? Math.round(currentData.european_aqi) : undefined;
    const eurAqiCategory = eurAqi ? getEuropeanAqiCategory(eurAqi) : undefined;

    // Process hourly points (limit next 24-48 hours for performance & precision)
    const hourlyPoints: HourlyForecastPoint[] = [];
    const maxPoints = Math.min(hourlyData.time.length, 36);

    for (let i = 0; i < maxPoints; i++) {
      hourlyPoints.push({
        time: hourlyData.time[i],
        usAqi: Math.round(hourlyData.us_aqi[i] ?? 0),
        pm2_5: Math.round((hourlyData.pm2_5[i] ?? 0) * 10) / 10,
        pm10: Math.round((hourlyData.pm10[i] ?? 0) * 10) / 10,
        ozone: Math.round((hourlyData.ozone[i] ?? 0) * 10) / 10,
        nitrogenDioxide: Math.round((hourlyData.nitrogen_dioxide[i] ?? 0) * 10) / 10,
      });
    }

    // Synthesize 5-day forecast aggregates from hourly points
    const dailyMap: Record<string, { aqiMax: number; pm25Sum: number; count: number }> = {};
    for (let i = 0; i < hourlyData.time.length; i++) {
      const dateStr = hourlyData.time[i].split('T')[0];
      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = { aqiMax: 0, pm25Sum: 0, count: 0 };
      }
      const aqi = hourlyData.us_aqi[i] ?? 0;
      const pm25 = hourlyData.pm2_5[i] ?? 0;
      dailyMap[dateStr].aqiMax = Math.max(dailyMap[dateStr].aqiMax, aqi);
      dailyMap[dateStr].pm25Sum += pm25;
      dailyMap[dateStr].count += 1;
    }

    const dailyForecast: DailyForecastPoint[] = Object.keys(dailyMap).slice(0, 5).map(dateStr => {
      const item = dailyMap[dateStr];
      const avgPm = Math.round((item.pm25Sum / (item.count || 1)) * 10) / 10;
      const aqiCat = getUsAqiCategory(item.aqiMax);
      return {
        date: dateStr,
        maxUsAqi: Math.round(item.aqiMax),
        avgPm2_5: avgPm,
        dominantPollutant: 'PM2.5',
        conditionSummary: aqiCat.category,
      };
    });

    const cpcbAqi = cpcbInfo.available && cpcbInfo.observedAqi ? cpcbInfo.observedAqi : undefined;
    const cpcbAqiCategory = cpcbAqi !== undefined ? getCpcbAqiCategory(cpcbAqi) : undefined;

    return {
      location: {
        name: locationName,
        latitude,
        longitude,
        country,
        admin1,
      },
      current: {
        usAqi,
        usAqiCategory: usAqiMeta.category,
        europeanAqi: eurAqi,
        europeanAqiCategory: eurAqiCategory,
        cpcbAqi,
        cpcbAqiCategory,
        pm2_5: {
          value: Math.round((currentData.pm2_5 ?? 0) * 10) / 10,
          unit: 'µg/m³',
        },
        pm10: {
          value: Math.round((currentData.pm10 ?? 0) * 10) / 10,
          unit: 'µg/m³',
        },
        nitrogenDioxide: {
          value: Math.round((currentData.nitrogen_dioxide ?? 0) * 10) / 10,
          unit: 'µg/m³',
        },
        sulphurDioxide: {
          value: Math.round((currentData.sulphur_dioxide ?? 0) * 10) / 10,
          unit: 'µg/m³',
        },
        ozone: {
          value: Math.round((currentData.ozone ?? 0) * 10) / 10,
          unit: 'µg/m³',
        },
        carbonMonoxide: {
          value: Math.round((currentData.carbon_monoxide ?? 0) * 10) / 10,
          unit: 'µg/m³',
        },
        timestamp: currentData.time || new Date().toISOString(),
        dataSource: cpcbInfo.available ? 'CPCB Observed Station + Open-Meteo' : 'Open-Meteo European/US Atmospheric Model',
        isObservedStation: cpcbInfo.available,
        stationName: cpcbInfo.stationName,
      },
      hourly: hourlyPoints,
      dailyForecast,
      attribution: {
        dataProvider: 'Open-Meteo Air Quality & Copernicus Atmosphere Monitoring Service (CAMS)',
        modelInfo: 'High-resolution atmospheric chemical transport model (CAMS / ECMWF)',
        license: 'Attribution-NonCommercial 4.0 International / Copernicus Open Data',
        cpcbStatus: cpcbInfo.sourceNote,
      },
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Error fetching air quality data:', errorMsg);
    throw new Error('Unable to retrieve air quality data for the selected coordinates. Please try again.');
  }
}

