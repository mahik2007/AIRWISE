import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Wind, Clock, ShieldCheck, 
  TrendingUp, Calendar, ChevronRight, Info, AlertTriangle,
  RefreshCw, CheckCircle2, Compass, Layers, ShieldAlert, Sparkles, HelpCircle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine 
} from 'recharts';
import { AirQualityPayload } from '../../types';
import { 
  getAqiColor, 
  getEuropeanAqiBadge, 
  formatTime, 
  formatDate, 
  formatCoordinates, 
  evaluateWhoGuideline 
} from '../../utils/formatters';

interface AirDashboardProps {
  data: AirQualityPayload;
  onRefresh: () => void;
  onAskAI: (initialQuery?: string) => void;
}

export const AirDashboard: React.FC<AirDashboardProps> = ({ data, onRefresh, onAskAI }) => {
  const { t, i18n } = useTranslation();
  const [activeChartMetric, setActiveChartMetric] = useState<'aqi' | 'pm25'>('aqi');
  const current = data.current;
  const aqiStyle = getAqiColor(current.usAqi);
  const eurAqiBadge = current.europeanAqi !== undefined ? getEuropeanAqiBadge(current.europeanAqi) : null;

  // Pollutant scientific matrix with strict WHO 2021 guidelines & averaging-period compatibility check
  const pollutantMatrix = [
    {
      key: 'pm2_5' as const,
      code: 'PM2.5',
      name: 'Fine Inhalable Particles',
      val: current.pm2_5.value,
      unit: current.pm2_5.unit,
      period: t('dashboard.pollutantMatrix.oneHourReading', '1-hr reading'),
      impact: t('dashboard.pollutantMatrix.pm25Desc'),
    },
    {
      key: 'pm10' as const,
      code: 'PM10',
      name: 'Coarse Particulates',
      val: current.pm10.value,
      unit: current.pm10.unit,
      period: t('dashboard.pollutantMatrix.oneHourReading', '1-hr reading'),
      impact: t('dashboard.pollutantMatrix.pm10Desc'),
    },
    {
      key: 'nitrogenDioxide' as const,
      code: 'NO₂',
      name: 'Nitrogen Dioxide',
      val: current.nitrogenDioxide.value,
      unit: current.nitrogenDioxide.unit,
      period: t('dashboard.pollutantMatrix.oneHourReading', '1-hr reading'),
      impact: t('dashboard.pollutantMatrix.no2Desc'),
    },
    {
      key: 'ozone' as const,
      code: 'O₃',
      name: 'Ground-Level Ozone',
      val: current.ozone.value,
      unit: current.ozone.unit,
      period: t('dashboard.pollutantMatrix.oneHourReading', '1-hr reading'),
      impact: t('dashboard.pollutantMatrix.o3Desc'),
    },
    {
      key: 'sulphurDioxide' as const,
      code: 'SO₂',
      name: 'Sulphur Dioxide',
      val: current.sulphurDioxide.value,
      unit: current.sulphurDioxide.unit,
      period: t('dashboard.pollutantMatrix.oneHourReading', '1-hr reading'),
      impact: t('dashboard.pollutantMatrix.so2Desc'),
    },
    {
      key: 'carbonMonoxide' as const,
      code: 'CO',
      name: 'Carbon Monoxide',
      // Format CO consistently: if value > 1000 µg/m³, provide equivalent mg/m³ for clean scientific comparability
      val: current.carbonMonoxide.unit === 'µg/m³' ? (current.carbonMonoxide.value / 1000).toFixed(2) : current.carbonMonoxide.value,
      rawVal: current.carbonMonoxide.value,
      unit: current.carbonMonoxide.unit === 'µg/m³' ? 'mg/m³' : current.carbonMonoxide.unit,
      rawUnit: current.carbonMonoxide.unit,
      period: t('dashboard.pollutantMatrix.oneHourReading', '1-hr reading'),
      impact: t('dashboard.pollutantMatrix.coDesc'),
    },
  ];

  // Evaluate each pollutant against WHO 2021 guideline
  const evaluatedPollutants = pollutantMatrix.map((item) => {
    const evaluation = evaluateWhoGuideline(
      item.key,
      item.rawVal !== undefined ? item.rawVal : Number(item.val),
      item.rawUnit || item.unit,
      item.period
    );
    return {
      ...item,
      evaluation,
    };
  });

  // Chart data formatting with sanitized numbers
  const chartData = data.hourly.map((pt) => ({
    time: formatTime(pt.time),
    aqi: pt.usAqi,
    pm25: pt.pm2_5,
    pm10: pt.pm10,
    no2: pt.nitrogenDioxide,
  }));

  const maxForecastAqi = Math.max(...chartData.map((d) => d.aqi || 0));
  const maxForecastPm25 = Math.max(...chartData.map((d) => d.pm25 || 0));

  // Determine protocol states based on AQI severity
  const isSevere = current.usAqi > 200;
  const isElevated = current.usAqi > 100;

  // Health Guidance Status Badges - accurately communicating evidence-based recommendation levels
  const maskBadge = isSevere 
    ? { text: t('dashboard.protocolStatus.stronglyRecommended', 'Strongly Advised'), style: 'bg-red-950 text-red-300 border border-red-800/40' }
    : isElevated 
    ? { text: t('dashboard.protocolStatus.recommended', 'Recommended'), style: 'bg-amber-950 text-amber-300 border border-amber-800/40' }
    : { text: t('dashboard.protocolStatus.normal', 'Normal'), style: 'bg-emerald-950 text-emerald-300 border border-emerald-800/40' };

  const ventBadge = isSevere
    ? { text: t('dashboard.protocolStatus.restricted', 'Restricted'), style: 'bg-red-950 text-red-300 border border-red-800/40' }
    : isElevated
    ? { text: t('dashboard.protocolStatus.advisory', 'Advisory'), style: 'bg-teal-950 text-teal-300 border border-teal-800/40' }
    : { text: t('dashboard.protocolStatus.favorable', 'Favorable'), style: 'bg-emerald-950 text-emerald-300 border border-emerald-800/40' };

  // Real data provenance verification: only label as Ground Station if explicitly verified
  const isActualGroundStation = Boolean(current.isObservedStation && current.stationName);
  const dataProvenanceLabel = isActualGroundStation
    ? t('dashboard.observedStation', 'Ground Station Observation')
    : t('dashboard.modelCams', 'Atmospheric Dispersion Model');
  const dataProvenanceDetail = isActualGroundStation
    ? current.stationName!
    : 'Copernicus Atmospheric Model (CAMS) & Open-Meteo';

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans">
      {/* ========================================================================= */}
      {/* SECTION A: OBSERVATION HEADER & PROVENANCE CONTROL BAR */}
      {/* ========================================================================= */}
      <header className="rounded-2xl bg-[#090f0c] border border-emerald-950/80 p-5 shadow-2xl relative overflow-hidden">
        {/* Subtle top edge glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Station / Model Identity and Location Coordinates */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono uppercase tracking-wider font-semibold border ${
                isActualGroundStation
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700/50'
                  : 'bg-slate-900/80 text-slate-300 border-slate-700/40'
              }`}>
                <Compass className="w-3 h-3 text-emerald-400" />
                {dataProvenanceLabel}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#0d1612] text-slate-400 border border-emerald-950">
                {formatCoordinates(data.location.latitude, data.location.longitude)}
              </span>
              {data.location.country && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#0d1612] text-slate-300 border border-emerald-950">
                  {[data.location.admin1, data.location.country].filter(Boolean).join(', ')}
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
                {data.location.name}
              </h1>
              <span className="text-xs font-mono text-emerald-500/80 hidden sm:inline">
                {isActualGroundStation ? t('dashboard.stationTelemetry') : t('dashboard.modelAnalysis')}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 pt-0.5">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-emerald-500/70" />
                <span>{t('dashboard.lastUpdated')}: <strong className="text-slate-200 font-mono">{formatDate(current.timestamp)} {t('dashboard.at')} {formatTime(current.timestamp)}</strong></span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 font-mono text-[11px]">
                {t('dashboard.dataProvenance')}: <span className="text-slate-200">{dataProvenanceDetail}</span>
              </span>
            </div>
          </div>

          {/* Provenance Badge & Refresh Action */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-[#0d1612] border border-emerald-900/30 text-xs flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block leading-none">{t('dashboard.telemetryEngine')}</span>
                <span className="text-slate-200 font-medium text-[11px]">{data.attribution.dataProvider}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onRefresh}
              aria-label={t('dashboard.refreshBtn', 'Refresh telemetry data')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 active:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold tracking-wide transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('dashboard.refreshBtn')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* SECTION B: PRIMARY EXPOSURE AREA (ASYMMETRIC COMMAND CORE) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Core Primary Exposure Card (7 cols) */}
        <section 
          aria-label="Current Air Quality Index Overview" 
          className={`lg:col-span-7 p-6 sm:p-7 rounded-2xl border ${aqiStyle.border} ${aqiStyle.bg} flex flex-col justify-between relative overflow-hidden backdrop-blur-md shadow-2xl`}
        >
          <div>
            {/* Header tags: US EPA AQI standard specification */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 mb-5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-300 uppercase bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-700/40">
                  {t('dashboard.scaleUsaqi')}
                </span>
                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">{t('dashboard.scaleIndexRange')}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${aqiStyle.badge}`}>
                {current.usAqiCategory}
              </span>
            </div>

            {/* Dominant Numerical Readout */}
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 my-3">
              <span 
                className={`text-7xl sm:text-8xl font-black font-mono tracking-tighter tabular-nums ${aqiStyle.text}`} 
                aria-label={`US Air Quality Index ${current.usAqi}, Category: ${current.usAqiCategory}`}
              >
                {current.usAqi}
              </span>
              <div className="space-y-1">
                <div className="text-xs uppercase font-mono tracking-wider font-semibold text-slate-300">
                  {t('dashboard.calculatedAqi')}
                </div>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  {t('dashboard.epaStandardDesc')}
                </p>
              </div>
            </div>

            {/* Current Air Quality Health Advisory */}
            <div className="mt-5 p-4 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-slate-200">
                <ShieldAlert className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{t('dashboard.currentHealthDirective')}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {current.usAqi > 150
                  ? t('dashboard.advisoryHigh')
                  : current.usAqi > 80
                  ? t('dashboard.advisoryModerate')
                  : t('dashboard.advisoryLow')}
              </p>
            </div>
          </div>

          {/* Secondary Scales Distinction & Quick Ask AI action */}
          <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              {current.europeanAqi !== undefined && eurAqiBadge && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono text-[10px] uppercase">{t('dashboard.scaleEuaqi')}:</span>
                  <span className="font-mono font-bold text-slate-200">{current.europeanAqi}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${eurAqiBadge.badge}`}>
                    {eurAqiBadge.category}
                  </span>
                </div>
              )}

              {current.cpcbAqi !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono text-[10px] uppercase">{t('dashboard.scaleCpcb')}:</span>
                  <span className="font-mono font-bold text-emerald-300">{current.cpcbAqi}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded border bg-emerald-950/60 text-emerald-300 border-emerald-800/40">
                    {current.cpcbAqiCategory || 'Station'}
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => onAskAI(`What precautions should I take in ${data.location.name} with US AQI at ${current.usAqi}?`)}
              aria-label={`Ask AI what precautions to take in ${data.location.name}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-emerald-200 hover:underline transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('dashboard.consultAi')}</span>
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </section>

        {/* Actionable Exposure Protocols Card (5 cols) */}
        <section 
          aria-label="Actionable Protection Protocols"
          className="lg:col-span-5 p-6 rounded-2xl bg-[#090f0c] border border-emerald-950/80 flex flex-col justify-between shadow-2xl relative"
        >
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-emerald-950">
              <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-emerald-400 font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{t('dashboard.actionableProtocols')}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{t('dashboard.currentReadingsContext')}</span>
            </div>

            <div className="mt-4 space-y-3">
              {/* Protocol 1: Respiratory Protection */}
              <div className="p-3.5 rounded-xl bg-[#0d1612] border border-emerald-900/30 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-950/70 text-emerald-400 border border-emerald-800/40 flex-shrink-0 mt-0.5">
                  <Wind className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-200">
                      {isSevere 
                        ? t('dashboard.protocols.maskSevereTitle') 
                        : isElevated 
                        ? t('dashboard.protocols.maskElevatedTitle') 
                        : t('dashboard.protocols.maskNormalTitle')}
                    </h4>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${maskBadge.style}`}>
                      {maskBadge.text}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {isSevere
                      ? t('dashboard.protocols.maskSevereDesc')
                      : isElevated
                      ? t('dashboard.protocols.maskElevatedDesc')
                      : t('dashboard.protocols.maskNormalDesc')}
                  </p>
                </div>
              </div>

              {/* Protocol 2: Ventilation Management */}
              <div className="p-3.5 rounded-xl bg-[#0d1612] border border-emerald-900/30 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-950/70 text-emerald-400 border border-emerald-800/40 flex-shrink-0 mt-0.5">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-200">
                      {isSevere 
                        ? t('dashboard.protocols.ventSevereTitle') 
                        : isElevated 
                        ? t('dashboard.protocols.ventElevatedTitle') 
                        : t('dashboard.protocols.ventNormalTitle')}
                    </h4>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${ventBadge.style}`}>
                      {ventBadge.text}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {isSevere
                      ? t('dashboard.protocols.ventSevereDesc')
                      : isElevated
                      ? t('dashboard.protocols.ventElevatedDesc')
                      : t('dashboard.protocols.ventNormalDesc')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Contextual Inquiry Prompts */}
          <div className="mt-5 pt-4 border-t border-emerald-950 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              {t('dashboard.groundedGuidance')}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onAskAI(`Should I wear an N95 mask outdoors today in ${data.location.name}?`)}
                className="text-left px-3 py-2 rounded-lg bg-[#0d1612] hover:bg-[#121f19] border border-emerald-950 hover:border-emerald-800/50 text-[11px] text-slate-300 flex items-center justify-between transition-colors group"
              >
                <span className="truncate">{t('dashboard.askMask')}</span>
                <ChevronRight className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                type="button"
                onClick={() => onAskAI(`When is the best time to ventilate my home today in ${data.location.name}?`)}
                className="text-left px-3 py-2 rounded-lg bg-[#0d1612] hover:bg-[#121f19] border border-emerald-950 hover:border-emerald-800/50 text-[11px] text-slate-300 flex items-center justify-between transition-colors group"
              >
                <span className="truncate">{t('dashboard.askVentilate')}</span>
                <ChevronRight className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ========================================================================= */}
      {/* SECTION C: POLLUTANT CONCENTRATION MATRIX (SCIENTIFIC TABLE) */}
      {/* ========================================================================= */}
      <section 
        aria-label="Critical Pollutant Concentrations and WHO Guideline Comparison" 
        className="rounded-2xl bg-[#090f0c] border border-emerald-950/80 p-5 sm:p-6 shadow-2xl"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-emerald-950">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>{t('dashboard.pollutantMatrix.title')}</span>
              <span className="text-xs text-slate-400 font-normal">({current.pm2_5.unit})</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('dashboard.pollutantMatrix.subtitle')}
            </p>
          </div>
          <span className="text-[11px] font-mono text-emerald-400/80 hidden sm:inline-flex items-center gap-1.5 self-start sm:self-center px-2.5 py-1 rounded bg-[#0d1612] border border-emerald-950">
            <Info className="w-3 h-3 text-emerald-400" />
            <span>{t('dashboard.pollutantMatrix.refContextBadge')}</span>
          </span>
        </div>

        {/* 1. Desktop & Tablet Horizontally Scrollable Matrix View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-emerald-950/80 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-2.5 px-3 font-semibold">{t('dashboard.pollutantMatrix.thParameter')}</th>
                <th className="py-2.5 px-3 font-semibold">{t('dashboard.pollutantMatrix.thMeasurement')}</th>
                <th className="py-2.5 px-3 font-semibold">{t('dashboard.pollutantMatrix.thAveraging')}</th>
                <th className="py-2.5 px-3 font-semibold">{t('dashboard.pollutantMatrix.thWhoRef')}</th>
                <th className="py-2.5 px-3 font-semibold">{t('dashboard.pollutantMatrix.thComparison')}</th>
                <th className="py-2.5 px-3 font-semibold hidden lg:table-cell">{t('dashboard.pollutantMatrix.thImpact')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/60 text-xs">
              {evaluatedPollutants.map((item) => {
                const evalRes = item.evaluation;
                return (
                  <tr 
                    key={item.code} 
                    className="hover:bg-emerald-950/20 transition-colors"
                  >
                    {/* Pollutant Name & Code */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-100">{item.code}</span>
                        <span className="text-slate-400 text-[11px]">({item.name})</span>
                      </div>
                    </td>

                    {/* Measured Value & Consistent Unit */}
                    <td className="py-3 px-3 font-mono tabular-nums">
                      <span className="text-sm font-bold text-slate-100">{item.val}</span>{' '}
                      <span className="text-[10px] text-slate-400 font-normal">{item.unit}</span>
                    </td>

                    {/* Averaging Period */}
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                      {item.period}
                    </td>

                    {/* WHO Guideline Threshold & Averaging Period */}
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-300">
                      {evalRes.whoSpec.label}
                    </td>

                    {/* Exceedance / Reference Context Badge */}
                    <td className="py-3 px-3">
                      {evalRes.isCompatible ? (
                        evalRes.exceedsGuideline ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/60 text-amber-300 border border-amber-800/40">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            <span>{evalRes.ratioDisplay}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>{t('dashboard.pollutantMatrix.withinRef')}</span>
                          </span>
                        )
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-700/60 w-fit">
                            <HelpCircle className="w-3 h-3 text-slate-400" />
                            <span>{t('dashboard.pollutantMatrix.referenceOnly')}</span>
                          </span>
                          <span className="text-[9px] text-slate-400 max-w-[210px] leading-tight">
                            {t('dashboard.pollutantMatrix.periodMismatch', { period: evalRes.whoSpec.averagingPeriod })}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Health Impact */}
                    <td className="py-3 px-3 text-[11px] text-slate-400 max-w-xs truncate hidden lg:table-cell">
                      {item.impact}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 2. Mobile Structured Presentation (Designed specifically for 320px–390px viewports) */}
        <div className="md:hidden space-y-3">
          {evaluatedPollutants.map((item) => {
            const evalRes = item.evaluation;
            return (
              <div 
                key={item.code}
                className="p-3.5 rounded-xl bg-[#0c1511] border border-emerald-950/80 space-y-2.5"
              >
                {/* Header: Pollutant Code & Measured Value */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-slate-100">{item.code}</span>
                    <span className="text-xs text-slate-400">({item.name})</span>
                  </div>
                  <div className="font-mono tabular-nums text-right">
                    <span className="text-base font-extrabold text-slate-100">{item.val}</span>{' '}
                    <span className="text-xs text-slate-400 font-normal">{item.unit}</span>
                  </div>
                </div>

                {/* Sub-grid: Averaging Window & WHO 2021 Reference */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1.5 border-t border-emerald-950/60 text-slate-400">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider block text-slate-400">{t('dashboard.pollutantMatrix.thAveraging')}</span>
                    <span className="text-slate-300 font-semibold">{item.period}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider block text-slate-400">{t('dashboard.pollutantMatrix.thWhoRef')}</span>
                    <span className="text-slate-300 font-semibold">{evalRes.whoSpec.label}</span>
                  </div>
                </div>

                {/* Guideline Comparison Status Banner */}
                <div className="pt-1.5 border-t border-emerald-950/60 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">{t('dashboard.pollutantMatrix.thComparison')}:</span>
                  {evalRes.isCompatible ? (
                    evalRes.exceedsGuideline ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/60 text-amber-300 border border-amber-800/40">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        <span>{evalRes.ratioDisplay}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>{t('dashboard.pollutantMatrix.withinRef')}</span>
                      </span>
                    )
                  ) : (
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-700/60">
                        <HelpCircle className="w-3 h-3 text-slate-400" />
                        <span>{t('dashboard.pollutantMatrix.referenceOnly')}</span>
                      </span>
                    </div>
                  )}
                </div>
                {!evalRes.isCompatible && (
                  <p className="text-[10px] text-slate-400 leading-tight">
                    {t('dashboard.pollutantMatrix.periodMismatch', { period: evalRes.whoSpec.averagingPeriod })}
                  </p>
                )}
                {/* Physiological Impact Note */}
                <p className="text-[10px] text-slate-400 leading-tight italic pt-0.5">
                  {item.impact}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION D: 24-HOUR DIURNAL FORECAST INTELLIGENCE (SCIENTIFIC CHART) */}
      {/* ========================================================================= */}
      <section 
        aria-label="Hourly Air Pollution Forecast Chart and Data" 
        className="rounded-2xl bg-[#090f0c] border border-emerald-950/80 p-5 sm:p-6 shadow-2xl"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-emerald-950">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <h3 className="text-base font-bold text-slate-100">
                {t('dashboard.forecast.chartTitle')}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('dashboard.forecast.chartSubtitle')}
            </p>
          </div>

          {/* Metric Selector Toggle */}
          <div className="flex items-center gap-2 self-start sm:self-center bg-[#0d1612] p-1 rounded-xl border border-emerald-950">
            <button
              type="button"
              onClick={() => setActiveChartMetric('aqi')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                activeChartMetric === 'aqi'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('dashboard.forecast.toggleAqi')}
            </button>
            <button
              type="button"
              onClick={() => setActiveChartMetric('pm25')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                activeChartMetric === 'pm25'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('dashboard.forecast.togglePm25')}
            </button>
          </div>
        </div>

        {/* Screen-reader accessible data summary */}
        <p className="sr-only">
          Hourly forecast shows peak predicted US AQI of {maxForecastAqi} and peak PM2.5 of {maxForecastPm25} micrograms per cubic meter over the next 24 to 36 hours.
        </p>

        {/* Recharts Visualization - key includes i18n.language and metric to force clean SVG repainting on locale or mode switch */}
        <div className="w-full h-72 sm:h-80" aria-hidden="true">
          <ResponsiveContainer 
            key={`chart-container-${i18n.language}-${activeChartMetric}`}
            width="100%" 
            height="100%"
          >
            <AreaChart 
              key={`chart-${i18n.language}-${activeChartMetric}`}
              data={chartData} 
              margin={{ top: 15, right: 15, left: -15, bottom: 5 }}
            >
              <defs>
                <linearGradient id={`aqiGrad-${i18n.language}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id={`pmGrad-${i18n.language}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#13231a" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#475569" 
                tick={{ fontSize: 11, fill: '#94a3b8' }} 
                interval={2} 
              />
              <YAxis 
                stroke="#475569" 
                tick={{ fontSize: 11, fill: '#94a3b8' }} 
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090f0c',
                  borderColor: '#1e3828',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#f8fafc',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.7)',
                }}
                labelStyle={{ color: '#10b981', fontWeight: 600, fontFamily: 'monospace' }}
              />
              {activeChartMetric === 'pm25' && (
                <ReferenceLine 
                  y={15} 
                  stroke="#f59e0b" 
                  strokeDasharray="4 4" 
                  label={{ value: t('dashboard.forecast.whoRefLine'), position: 'insideTopRight', fill: '#fbbf24', fontSize: 10 }} 
                />
              )}
              {activeChartMetric === 'aqi' ? (
                <Area 
                  type="monotone" 
                  dataKey="aqi" 
                  stroke="#10b981" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill={`url(#aqiGrad-${i18n.language})`} 
                  name="US AQI" 
                  isAnimationActive={false}
                />
              ) : (
                <Area 
                  type="monotone" 
                  dataKey="pm25" 
                  stroke="#2dd4bf" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill={`url(#pmGrad-${i18n.language})`} 
                  name="PM2.5 (µg/m³)" 
                  isAnimationActive={false}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Interpretation Footer */}
        <div className="mt-3 pt-3 border-t border-emerald-950 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>{t('dashboard.forecast.peakAqi')} <strong className="text-slate-200">{maxForecastAqi}</strong></span>
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-300" />
              <span>{t('dashboard.forecast.peakPm25')} <strong className="text-slate-200">{maxForecastPm25} µg/m³</strong></span>
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {t('dashboard.forecast.modelProvenance')}
          </span>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION E: MULTI-DAY ATMOSPHERIC OUTLOOK STRIP */}
      {/* ========================================================================= */}
      <section 
        aria-label="Multi-Day Atmospheric Outlook" 
        className="rounded-2xl bg-[#090f0c] border border-emerald-950/80 p-5 sm:p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-emerald-950">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-bold text-slate-100">{t('dashboard.outlook.title')}</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            {t('dashboard.outlook.subtitle')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {data.dailyForecast.map((day) => {
            const dayAqiStyle = getAqiColor(day.maxUsAqi);
            return (
              <div
                key={day.date}
                className={`p-4 rounded-xl border ${dayAqiStyle.border} bg-[#0b1410] flex flex-col justify-between hover:border-emerald-500/40 transition-all`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">{formatDate(day.date)}</span>
                  </div>

                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className={`text-3xl font-extrabold font-mono tabular-nums ${dayAqiStyle.text}`}>
                      {day.maxUsAqi}
                    </span>
                    <span className="text-[10px] uppercase font-mono text-slate-400">{t('dashboard.outlook.peakAqi')}</span>
                  </div>

                  <div className="mt-2">
                    <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded border ${dayAqiStyle.badge}`}>
                      {day.conditionSummary}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-2.5 border-t border-emerald-950/80 text-[11px] text-slate-400 font-mono flex items-center justify-between">
                  <span>{t('dashboard.outlook.avgPm25')}</span>
                  <span className="text-slate-200 font-bold">{day.avgPm2_5} µg/m³</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION F: SCALE DISTINCTION & REGULATORY INTEGRITY FOOTNOTE */}
      {/* ========================================================================= */}
      <footer className="p-4 rounded-xl bg-[#090f0c] border border-emerald-950/60 text-xs text-slate-400 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-400 leading-relaxed">
            <strong className="text-slate-300">{t('dashboard.methodology.label')}</strong> {t('dashboard.methodology.text')}
          </p>
        </div>
        <div className="text-[10px] font-mono text-slate-400 flex-shrink-0">
          {t('dashboard.methodology.license')} • {data.attribution.license}
        </div>
      </footer>
    </div>
  );
};
