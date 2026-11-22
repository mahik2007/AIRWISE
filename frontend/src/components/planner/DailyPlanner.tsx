import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, Sun, Briefcase, Sunset, Moon, ShieldAlert, 
  CheckCircle, ArrowRight, Clock, UserCheck, AlertTriangle 
} from 'lucide-react';
import { AirQualityPayload } from '../../types';

interface DailyPlannerProps {
  airQualityData?: AirQualityPayload;
  onLogImpact?: (title: string, category: 'commute' | 'indoor' | 'energy' | 'waste', co2Grams: number, pmGrams: number) => void;
}

type PersonaType = 'student' | 'working_professional' | 'homemaker' | 'caregiver';

export const DailyPlanner: React.FC<DailyPlannerProps> = ({ airQualityData, onLogImpact }) => {
  const { t, i18n } = useTranslation();
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>('working_professional');
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  const currentAqi = airQualityData?.current?.usAqi;
  const isAqiAvailable = typeof currentAqi === 'number' && !isNaN(currentAqi);
  const isHighPollution = isAqiAvailable && currentAqi > 150;
  const cityName = airQualityData?.location?.name || (i18n.language === 'hi' ? 'आपका शहर' : 'your city');

  const toggleStep = (stepId: string, title: string, co2 = 120, pm = 0.02) => {
    const isNowDone = !completedSteps[stepId];
    setCompletedSteps((prev) => ({ ...prev, [stepId]: isNowDone }));
    if (isNowDone && onLogImpact) {
      onLogImpact(title, 'commute', co2, pm);
    }
  };

  const personas = [
    { id: 'student', title: t('planner.student'), desc: t('planner.studentDesc') },
    { id: 'working_professional', title: t('planner.working_professional'), desc: t('planner.working_professionalDesc') },
    { id: 'homemaker', title: t('planner.homemaker'), desc: t('planner.homemakerDesc') },
    { id: 'caregiver', title: t('planner.caregiver'), desc: t('planner.caregiverDesc') },
  ];

  // Persona routines grounded in pollution condition
  const getRoutineForPersona = (persona: PersonaType) => {
    switch (persona) {
      case 'student':
        return [
          {
            id: 'st-1',
            time: '06:30 AM - 08:00 AM',
            title: 'Morning Campus Commute',
            icon: Sun,
            recommendation: isHighPollution
              ? 'Wear an N95 respirator during morning transit. Heavy ground-level thermal smog is peaked.'
              : 'Active commuting feasible; walk or cycle short distances.',
            practicalStep: 'Avoid open auto-rickshaws if AQI > 200; opt for metro or closed bus.',
            savings: { co2: 300, pm: 0.05 },
          },
          {
            id: 'st-2',
            time: '11:00 AM - 01:00 PM',
            title: 'Study & Library Session',
            icon: Briefcase,
            recommendation: 'Choose air-conditioned or filtered library reading rooms to minimize particulate exposure.',
            practicalStep: 'Hydrate frequently to support mucosal airway clearance.',
            savings: { co2: 50, pm: 0.01 },
          },
          {
            id: 'st-3',
            time: '04:30 PM - 06:00 PM',
            title: 'Sports & Extracurriculars',
            icon: Sunset,
            recommendation: isHighPollution
              ? 'Strictly shift sports indoors. Avoid strenuous high-ventilation workouts on outdoor fields.'
              : 'Outdoor games permitted while sun is still warming surface layers.',
            practicalStep: 'Replace outdoor football/running with indoor badminton or gym workout if AQI > 150.',
            savings: { co2: 100, pm: 0.02 },
          },
          {
            id: 'st-4',
            time: '08:00 PM - 10:00 PM',
            title: 'Evening Study & Rest',
            icon: Moon,
            recommendation: 'Keep dormitory or bedroom windows closed against night smog inversion.',
            practicalStep: 'Damp-mop study desk instead of dry dusting.',
            savings: { co2: 0, pm: 0.01 },
          },
        ];

      case 'working_professional':
        return [
          {
            id: 'wp-1',
            time: '07:30 AM - 09:30 AM',
            title: 'Peak Morning Commute',
            icon: Sun,
            recommendation: isHighPollution
              ? 'Avoid open two-wheelers. Utilize electric metro rail or shared cab with recirculated AC air.'
              : 'Standard commute. Carpool or ride public transit to prevent congestion emissions.',
            practicalStep: 'Set vehicle ventilation to internal recirculation mode when passing through major traffic corridors.',
            savings: { co2: 850, pm: 0.12 },
          },
          {
            id: 'wp-2',
            time: '12:30 PM - 02:00 PM',
            title: 'Lunch Break & Errands',
            icon: Briefcase,
            recommendation: 'Check current hourly AQI before planning outdoor errands; avoid exposure during active smog peaks.',
            practicalStep: 'Consolidate multiple short trips into a single walk or shared ride when air quality permits.',
            savings: { co2: 200, pm: 0.03 },
          },
          {
            id: 'wp-3',
            time: '06:00 PM - 08:00 PM',
            title: 'Evening Return Commute',
            icon: Sunset,
            recommendation: isHighPollution
              ? 'Evening rush hour coincides with smog accumulation. Wear N95 respirator if walking or waiting at bus stops.'
              : 'Smooth commute; consider staggered departure to avoid bottleneck idling.',
            practicalStep: 'Avoid idling engine during extended traffic lights (>30 seconds).',
            savings: { co2: 400, pm: 0.06 },
          },
          {
            id: 'wp-4',
            time: '09:00 PM - 11:00 PM',
            title: 'Home Wind-Down',
            icon: Moon,
            recommendation: 'Seal balcony and exterior doors. Run air filtration unit on sleep mode.',
            practicalStep: 'Turn off unnecessary standby electronics to lower collective grid power emissions.',
            savings: { co2: 150, pm: 0.01 },
          },
        ];

      case 'homemaker':
        return [
          {
            id: 'hm-1',
            time: '07:00 AM - 09:00 AM',
            title: 'Kitchen & Morning Prep',
            icon: Sun,
            recommendation: 'Keep exterior windows latched during morning hours when outdoor smog concentrations typically peak.',
            practicalStep: 'Turn on kitchen range hood or exhaust fan 1 minute before lighting gas burner to avoid NO2 buildup.',
            savings: { co2: 50, pm: 0.02 },
          },
          {
            id: 'hm-2',
            time: '12:00 PM - 03:00 PM',
            title: 'Ventilation & Housekeeping Window',
            icon: Briefcase,
            recommendation: 'Before opening windows, check current hourly outdoor AQI. If outdoor air quality is elevated or unverified, keep windows sealed. (Indoor sensors unmonitored).',
            practicalStep: 'Use microfiber damp mops instead of traditional broomsticks to trap fine dust rather than resuspending it.',
            savings: { co2: 120, pm: 0.04 },
          },
          {
            id: 'hm-3',
            time: '05:00 PM - 07:00 PM',
            title: 'Evening Cooking & Children Return',
            icon: Sunset,
            recommendation: 'Cover pans during frying and simmer operations to cut ultrafine oil aerosol dispersion.',
            practicalStep: 'Wipe kitchen surfaces with warm water rather than aerosolized chemical air fresheners.',
            savings: { co2: 80, pm: 0.02 },
          },
          {
            id: 'hm-4',
            time: '08:30 PM - 10:30 PM',
            title: 'Night Air Quality Lock',
            icon: Moon,
            recommendation: 'Secure door gaps with rolled towels or draft stoppers if outside air smells of smoke.',
            practicalStep: 'Run HEPA purifier in the bedroom 30 minutes before sleep.',
            savings: { co2: 50, pm: 0.01 },
          },
        ];

      case 'caregiver':
        return [
          {
            id: 'cg-1',
            time: '06:00 AM - 08:30 AM',
            title: 'Elderly & Child Vulnerability Shield',
            icon: Sun,
            recommendation: isHighPollution
              ? 'CRITICAL ALERT: Strictly cancel morning outdoor walks for elderly individuals or asthmatic children.'
              : 'Gentle garden strolls safe, but dress warmly to prevent cold-air airway hypersensitivity.',
            practicalStep: 'Substitute outdoor walks with indoor stretching or seated chair yoga.',
            savings: { co2: 50, pm: 0.02 },
          },
          {
            id: 'cg-2',
            time: '11:00 AM - 01:30 PM',
            title: 'Sunlight Exposure & Medication Checks',
            icon: Briefcase,
            recommendation: 'Allow seniors to sit in sunny glass-enclosed balconies where sunlight is received without direct smog drafts.',
            practicalStep: 'Check pulse-oximeter and ensure quick-relief inhalers are within reach.',
            savings: { co2: 0, pm: 0.01 },
          },
          {
            id: 'cg-3',
            time: '04:00 PM - 06:00 PM',
            title: 'Controlled Afternoon Activity',
            icon: Sunset,
            recommendation: 'If taking children out, keep duration under 30 minutes and avoid traffic-congested roads.',
            practicalStep: 'Fitted pediatric/small N95 respirators required if AQI > 150.',
            savings: { co2: 100, pm: 0.03 },
          },
          {
            id: 'cg-4',
            time: '08:00 PM - 10:00 PM',
            title: 'Night Respiratory Comfort',
            icon: Moon,
            recommendation: 'Ensure clean air bedroom buffer. Maintain comfortable 40-50% relative indoor humidity.',
            practicalStep: 'Avoid lighting incense sticks, mosquito coils, or scented candles in bedrooms.',
            savings: { co2: 60, pm: 0.03 },
          },
        ];
    }
  };

  const routine = getRoutineForPersona(selectedPersona);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[#0f1d16] border border-[#1e3828] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-slate-100">{t('planner.title')}</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isAqiAvailable ? (
              <>
                {t('planner.dynamicSchedule')} <strong className="text-emerald-300">{cityName}</strong>{' '}
                (Current US AQI: <span className="font-bold text-slate-200">{currentAqi}</span>)
              </>
            ) : (
              <>
                {t('planner.baselineSchedule')} <strong className="text-emerald-300">{cityName}</strong>{' '}
                <span className="text-amber-400/90 font-medium">({t('planner.liveUnavailable')})</span>
              </>
            )}
          </p>
        </div>

        {isHighPollution && (
          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{t('planner.highSmogActive')}</span>
          </div>
        )}

        {!isAqiAvailable && (
          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-300 text-xs font-medium">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-400" />
            <span>{t('planner.liveUnavailable')}</span>
          </div>
        )}
      </div>

      {/* Persona Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {personas.map((p) => {
          const isSelected = selectedPersona === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPersona(p.id as PersonaType)}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-950/40'
                  : 'bg-[#101e16] border-[#1e3828] text-slate-400 hover:text-slate-200 hover:bg-[#14261c]'
              }`}
            >
              <div className="font-bold text-sm text-slate-100">{p.title}</div>
              <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">{p.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Timeline Routine */}
      <div className="space-y-4">
        {routine.map((item, index) => {
          const Icon = item.icon;
          const isDone = !!completedSteps[item.id];

          return (
            <div
              key={item.id}
              className={`p-5 rounded-3xl border transition-all ${
                isDone
                  ? 'bg-[#0a1610] border-emerald-500/30 opacity-90'
                  : 'bg-[#0f1d16] border-[#1e3828] hover:border-emerald-500/30'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-emerald-400/90 font-semibold">{item.time}</span>
                    <h3 className="text-sm font-bold text-slate-100">{item.title}</h3>
                  </div>
                </div>

                <button
                  onClick={() => toggleStep(item.id, item.title, item.savings.co2, item.savings.pm)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isDone
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'bg-[#162a1f] text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-300 border border-[#234331]'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{isDone ? t('planner.completedLogged') : t('planner.markDone')}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-[#14261c] border border-[#203c2a] space-y-2 text-xs">
                <p className="text-slate-200 leading-relaxed font-medium">
                  {item.recommendation}
                </p>
                <div className="text-[11px] text-slate-400 flex items-start space-x-1.5">
                  <strong className="text-emerald-400">{t('planner.action')}</strong>
                  <span>{item.practicalStep}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>{t('planner.avoidsExposure')} ~{item.savings.co2}g CO₂</span>
                <span className="text-emerald-400 font-mono">~{item.savings.pm}g PM {t('planner.avoided')}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

