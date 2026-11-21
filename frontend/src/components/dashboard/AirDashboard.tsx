import React from 'react';
import { 
  Wind, Clock, ShieldCheck, 
  TrendingUp, Calendar, ChevronRight, Info, AlertTriangle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { AirQualityPayload } from '../../types';
import { getAqiColor, getEuropeanAqiBadge, formatTime, formatDate } from '../../utils/formatters';

interface AirDashboardProps {
  data: AirQualityPayload;
  onRefresh: () => void;
  onAskAI: (initialQuery?: string) => void;
}

export const AirDashboard: React.FC<AirDashboardProps> = ({ data, onRefresh, onAskAI }) => {
  const current = data.current;
  const aqiStyle = getAqiColor(current.usAqi);
  const eurAqiBadge = current.europeanAqi !== undefined ? getEuropeanAqiBadge(current.europeanAqi) : null;

  const pollutants = [
    { name: 'PM2.5', label: 'Fine Inhalable Particles', val: current.pm2_5.value, unit: current.pm2_5.unit, limit: 15, desc: 'Penetrates deep into lung alveoli and bloodstream.' },
    { name: 'PM10', label: 'Coarse Particulate Matter', val: current.pm10.value, unit: current.pm10.unit, limit: 45, desc: 'Dust, pollen, and debris irritating upper airways.' },
    { name: 'NO₂', label: 'Nitrogen Dioxide', val: current.nitrogenDioxide.value, unit: current.nitrogenDioxide.unit, limit: 25, desc: 'Combustion byproduct from vehicle tailpipes.' },
    { name: 'Ozone', label: 'Ground-Level Ozone', val: current.ozone.value, unit: current.ozone.unit, limit: 100, desc: 'Forms when sunlight reacts with VOCs and NOx.' },
    { name: 'SO₂', label: 'Sulphur Dioxide', val: current.sulphurDioxide.value, unit: current.sulphurDioxide.unit, limit: 40, desc: 'Industrial fossil fuel combustion emissions.' },
    { name: 'CO', label: 'Carbon Monoxide', val: current.carbonMonoxide.value, unit: current.carbonMonoxide.unit, limit: 4000, desc: 'Incomplete combustion in traffic.' },
  ];

  // Chart data formatting with sanitized numbers
  const chartData = data.hourly.map((pt) => ({
    time: formatTime(pt.time),
    aqi: pt.usAqi,
    pm25: pt.pm2_5,
    pm10: pt.pm10,
    no2: pt.nitrogenDioxide,
  }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Banner: Location, Exact Coordinates & Telemetry Provenance */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0f1d16] border border-[#1d3527]">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <Wind className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-100">{data.location.name}</h1>
              {data.location.country && (
                <span className="text-xs px-2.5 py-0.5 rounded-md bg-[#172b20] text-slate-300 border border-[#234231]">
                  {[data.location.admin1, data.location.country].filter(Boolean).join(', ')}
                </span>
              )}
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#122319] text-emerald-400/90 border border-emerald-500/20">
                {data.location.latitude.toFixed(4)}°N, {data.location.longitude.toFixed(4)}°E
              </span>
            </div>
            <p className="text-xs text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Last Updated: {formatDate(current.timestamp)} at {formatTime(current.timestamp)}</span>
              </span>
              <span>•</span>
              <span className="text-emerald-400/90 font-medium">
                {current.isObservedStation ? `Observed Station: ${current.stationName}` : 'Atmospheric Dispersion Model (CAMS)'}
              </span>
            </p>
          </div>
        </div>

        {/* Data Provenance & Refresh */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3 py-1.5 rounded-xl bg-[#14261c] border border-[#213e2d] text-xs">
            <span className="text-slate-400 mr-1.5">Telemetry Provider:</span>
            <span className="text-emerald-300 font-semibold">{current.dataSource}</span>
          </div>
          <button
            onClick={onRefresh}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all hover:scale-[1.02]"
          >
            Refresh Readings
          </button>
        </div>
      </div>

      {/* Main AQI Indicator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core AQI Gauge Card: US AQI Scale Clearly Identified */}
        <div className={`p-6 rounded-3xl border ${aqiStyle.border} ${aqiStyle.bg} flex flex-col justify-between relative overflow-hidden backdrop-blur-md`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold tracking-widest text-emerald-300 uppercase bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                US AQI Scale (EPA Standard)
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${aqiStyle.badge}`}>
                {current.usAqiCategory}
              </span>
            </div>

            <div className="flex items-baseline space-x-3 my-4">
              <span className={`text-6xl sm:text-7xl font-extrabold tracking-tight ${aqiStyle.text}`}>
                {current.usAqi}
              </span>
              <span className="text-xs text-slate-400">US EPA Index points (0–500)</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Calculated using the US EPA standard equation from continuous surface concentrations of PM2.5, PM10, NO₂, and O₃.
            </p>
          </div>

          {/* Secondary Scales: European EAQI & CPCB NAQI (when verified station data exists) */}
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-4">
              {current.europeanAqi !== undefined && eurAqiBadge && (
                <div className="text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-mono tracking-wider">
                    European AQI (EAQI Scale 0–100+):
                  </span>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="font-bold text-slate-200 text-sm">{current.europeanAqi}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${eurAqiBadge.badge}`}>
                      {eurAqiBadge.category}
                    </span>
                  </div>
                </div>
              )}

              {current.cpcbAqi !== undefined && (
                <div className="text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-mono tracking-wider">
                    Indian CPCB NAQI (0–500):
                  </span>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="font-bold text-emerald-300 text-sm">{current.cpcbAqi}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                      {current.cpcbAqiCategory || 'CPCB Station'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => onAskAI(`What precautions should I take in ${data.location.name} with US AQI at ${current.usAqi}?`)}
              className="text-xs font-medium text-emerald-300 hover:text-emerald-200 flex items-center ml-auto"
            >
              <span>Ask AI what to do</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Quick Health & Routine Advice Card */}
        <div className="p-6 rounded-3xl bg-[#101e16] border border-[#1e3828] flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 mb-3">
              <ShieldCheck className="w-4 h-4" />
              <span>Immediate Daily Advisory</span>
            </div>
            <h3 className="text-base font-bold text-slate-100 mb-2">
              {current.usAqi > 200
                ? 'Severe Smog Inversion: Stay Indoors'
                : current.usAqi > 100
                ? 'Elevated Pollution: Sensitive Groups Take Care'
                : 'Favorable Air Quality: Outdoor Activities Safe'}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {current.usAqi > 150
                ? 'High particulate matter suspension. Avoid early morning jogging or vigorous outdoor workouts. Keep windows shut until solar noon.'
                : current.usAqi > 80
                ? 'Particulate density is moderate. Keep indoor spaces clean with damp mopping and opt for public transit or carpooling.'
                : 'Atmospheric dispersion is healthy. Excellent conditions for natural ventilation and outdoor physical exercise.'}
            </p>
          </div>

          <div className="mt-6 space-y-2">
            <button
              onClick={() => onAskAI(`Should I wear a mask outdoors today in ${data.location.name}?`)}
              className="w-full text-left px-3 py-2 rounded-xl bg-[#15271d] hover:bg-[#1a3225] border border-[#213f2d] text-xs text-slate-300 flex items-center justify-between transition-colors"
            >
              <span>Do I need an N95 mask today?</span>
              <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>
            <button
              onClick={() => onAskAI(`When is the best time to ventilate my home today in ${data.location.name}?`)}
              className="w-full text-left px-3 py-2 rounded-xl bg-[#15271d] hover:bg-[#1a3225] border border-[#213f2d] text-xs text-slate-300 flex items-center justify-between transition-colors"
            >
              <span>When should I open my windows?</span>
              <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>
        </div>

        {/* Scientific Scale Transparency & Indian CPCB Integrity Card */}
        <div className="p-6 rounded-3xl bg-[#0f1d16] border border-[#1e3828] flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 mb-3">
              <Info className="w-4 h-4 text-emerald-400" />
              <span>Scale Distinction & Indian CPCB Integrity</span>
            </div>
            <div className="space-y-2.5 text-xs text-slate-400 leading-relaxed">
              <div className="p-3 rounded-xl bg-[#14241b] border border-[#203728]">
                <strong className="text-slate-200 block mb-1">Scale Transparency Policy:</strong>
                This dashboard displays <span className="text-emerald-300 font-semibold">US EPA AQI</span> and <span className="text-teal-300 font-semibold">European EAQI</span>. Indian Central Pollution Control Board (CPCB) NAQI uses distinct national 24-hour sub-index breakpoints and is never substituted or conflated with modelled EPA indices.
              </div>
              <p className="text-[11px] text-slate-400">
                {data.attribution.cpcbStatus}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1a3123] text-[10px] text-slate-500">
            Source: {data.attribution.dataProvider}
          </div>
        </div>
      </div>

      {/* Pollutant Breakdown Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <span>Critical Pollutant Concentrations</span>
            <span className="text-xs text-slate-400 font-normal">({current.pm2_5.unit})</span>
          </h2>
          <span className="text-[11px] text-slate-500 hidden sm:inline">WHO 24-hour guidance limits indicated</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {pollutants.map((pollutant) => {
            const isOverLimit = pollutant.val > pollutant.limit;
            return (
              <div
                key={pollutant.name}
                className="p-4 rounded-2xl bg-[#0e1b14] border border-[#1c3325] hover:border-emerald-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-slate-100">{pollutant.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      isOverLimit ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {isOverLimit ? 'Elevated' : 'Fair'}
                    </span>
                  </div>
                  <div className="text-xl font-extrabold text-slate-100 mt-1">
                    {pollutant.val}{' '}
                    <span className="text-[10px] font-normal text-slate-400">{pollutant.unit}</span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-[#172b1f] text-[10px] text-slate-400 line-clamp-2">
                  {pollutant.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hourly Pollution Trend Chart */}
      <div className="p-6 rounded-3xl bg-[#0f1d16] border border-[#1e3828]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Hourly Air Pollution Forecast (Next 24-36 Hours)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Modelled diurnal fluctuations showing predicted particulate peaks during early morning hours.
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-slate-300">US AQI</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-300" />
              <span className="text-slate-300">PM2.5 (µg/m³)</span>
            </span>
          </div>
        </div>

        <div className="w-full h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="pmGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1b3325" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} interval={3} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0c1811',
                  borderColor: '#243e2e',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#f8fafc',
                }}
              />
              <Area type="monotone" dataKey="aqi" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#aqiGrad)" name="US AQI" />
              <Area type="monotone" dataKey="pm25" stroke="#2dd4bf" strokeWidth={1.5} fillOpacity={1} fill="url(#pmGrad)" name="PM2.5 (µg/m³)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5-Day Forecast Grid */}
      <div className="p-6 rounded-3xl bg-[#0f1d16] border border-[#1e3828]">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <h3 className="text-base font-bold text-slate-100">5-Day Atmospheric Outlook</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {data.dailyForecast.map((day) => {
            const dayAqiStyle = getAqiColor(day.maxUsAqi);
            return (
              <div
                key={day.date}
                className={`p-4 rounded-2xl border ${dayAqiStyle.border} bg-[#0c1811] flex flex-col justify-between`}
              >
                <div>
                  <div className="text-xs font-semibold text-slate-300">{formatDate(day.date)}</div>
                  <div className="text-2xl font-bold text-slate-100 mt-2">
                    {day.maxUsAqi}{' '}
                    <span className="text-xs font-normal text-slate-400">Peak US AQI</span>
                  </div>
                  <div className={`inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${dayAqiStyle.badge}`}>
                    {day.conditionSummary}
                  </div>
                </div>
                <div className="mt-4 pt-2 border-t border-[#172d1f] text-[11px] text-slate-400">
                  Avg PM2.5: <strong className="text-slate-200">{day.avgPm2_5} µg/m³</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
