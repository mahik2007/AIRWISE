import React from 'react';
import { 
  Wind, Shield, ArrowRight, Zap, Leaf, CheckCircle2, ChevronRight, Activity, 
  MapPin, Sparkles, AlertCircle, Compass, Users
} from 'lucide-react';
import { LocationSearch } from '../components/common/LocationSearch';
import { GeocodingResult } from '../types';

interface LandingPageProps {
  onSelectCity: (loc: GeocodingResult) => void;
  onExploreDashboard: () => void;
  onOpenAssistant: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSelectCity,
  onExploreDashboard,
  onOpenAssistant,
}) => {
  const popularCities: GeocodingResult[] = [
    { id: 1273294, name: 'Delhi', latitude: 28.65195, longitude: 77.23149, country: 'India', admin1: 'Delhi' },
    { id: 1275339, name: 'Mumbai', latitude: 19.07283, longitude: 72.88261, country: 'India', admin1: 'Maharashtra' },
    { id: 1261481, name: 'New Delhi', latitude: 28.6139, longitude: 77.209, country: 'India', admin1: 'Delhi' },
    { id: 1277333, name: 'Bengaluru', latitude: 12.97194, longitude: 77.59369, country: 'India', admin1: 'Karnataka' },
    { id: 1269843, name: 'Hyderabad', latitude: 17.38405, longitude: 78.45636, country: 'India', admin1: 'Telangana' },
    { id: 1275004, name: 'Kolkata', latitude: 22.56263, longitude: 88.36304, country: 'India', admin1: 'West Bengal' },
  ];

  return (
    <div className="min-h-screen bg-[#09120d] text-slate-100 flex flex-col selection:bg-emerald-500/30">
      {/* Background Subtle Atmospheric Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[550px] bg-gradient-to-b from-emerald-900/20 via-teal-950/10 to-transparent pointer-events-none blur-3xl -z-10" />

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* Challenge & Tech Pill */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#122419] border border-[#23422e] text-xs text-emerald-300 mb-8 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-medium">Urban Air Quality Intelligence</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">Gemini 2.5 + Open-Meteo</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.15] text-slate-100 mb-6 max-w-4xl">
          The air around you matters. <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
            Know what to do next.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 mb-10 max-w-2xl leading-relaxed">
          Navigate severe winter smog, indoor particulate hazards, and urban exposure with hyper-grounded atmospheric intelligence, persona-tailored routines, and verified sustainable choices.
        </p>

        {/* Search Bar on Hero */}
        <div className="w-full max-w-md mb-6 flex flex-col items-center">
          <LocationSearch onSelectLocation={(loc) => { onSelectCity(loc); onExploreDashboard(); }} />
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 text-xs text-slate-400">
            <span className="text-slate-500">Quick select:</span>
            {popularCities.slice(0, 4).map((city) => (
              <button
                key={city.name}
                onClick={() => { onSelectCity(city); onExploreDashboard(); }}
                className="px-2.5 py-0.5 rounded-md bg-[#132219] hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-[#213a2b] transition-all text-[11px]"
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
          <button
            onClick={onExploreDashboard}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-950/60 transition-all hover:scale-[1.02]"
          >
            <Activity className="w-4 h-4" />
            <span>Launch Air Dashboard</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
          <button
            onClick={onOpenAssistant}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-[#122319] hover:bg-[#183022] text-emerald-300 font-semibold text-sm border border-[#23422e] transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Consult AI Assistant</span>
          </button>
        </div>
      </section>

      {/* The 3 Core Questions Section */}
      <section className="py-14 border-t border-b border-[#18291f] bg-[#0c1611]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-2">Architected For Impact</h2>
            <p className="text-2xl font-bold text-slate-100">Three Questions Every Urban Resident Faces</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#101e16] border border-[#1d3526] hover:border-emerald-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                  <Wind className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-100 mb-2">1. What is happening to the air around me?</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Real-time transparent breakdown of US AQI, European AQI, PM2.5, PM10, NO2, and Ozone with hourly pollution curves and 5-day predictive forecasts.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#182d20] flex items-center text-xs text-emerald-400 font-medium">
                <span>Multi-pollutant tracking</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#101e16] border border-[#1d3526] hover:border-emerald-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-4">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-100 mb-2">2. What should I do differently today?</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Contextual daily plans tailored for students, working professionals, homemakers, and caregivers. Smarter commute hours, evidence-based ventilation guidance, and mask advice.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#182d20] flex items-center text-xs text-teal-400 font-medium">
                <span>Persona-based daily routine</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#101e16] border border-[#1d3526] hover:border-emerald-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-lime-500/10 border border-lime-500/20 text-lime-400 flex items-center justify-center mb-4">
                  <Leaf className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-100 mb-2">3. How can my choices help reduce pollution?</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Green Choice Engine with defensible ARAI/DEFRA transport emission models, logging completed micro-actions, and tracking your collective carbon and particulate avoidance.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#182d20] flex items-center text-xs text-lime-400 font-medium">
                <span>Quantifiable emissions impact</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Walkthrough Showcase */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-[#13251a] border border-[#213f2c] text-xs text-emerald-400 font-medium">
              <Zap className="w-3.5 h-3.5" />
              <span>Grounded Artificial Intelligence</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight">
              An AI Assistant that never invents numbers.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              AIRWISE AI is strictly grounded in real-time atmospheric measurements. Powered by Google Gemini 2.5 Flash, it synthesizes current pollution readings, lifestyle constraints, and exposure physics into practical guidance without medical overreach.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300">
                  <strong className="text-slate-100">Transparent Scale Labelling:</strong> Explicitly identifies US AQI vs European AQI and observed station data.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300">
                  <strong className="text-slate-100">Structured Advice:</strong> Always returns actionable recommendation, scientific rationale, steps, and limitations.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300">
                  <strong className="text-slate-100">Offline Resilience:</strong> Deterministic rule-based fallback when network or quotas are offline.
                </p>
              </div>
            </div>
          </div>

          {/* Assistant Preview Card */}
          <div className="rounded-2xl bg-[#0f1b14] border border-[#213a2a] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1b2f22]">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-semibold text-emerald-400">Live Assistant Preview</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Model: Gemini 2.5 Flash</span>
            </div>
            <div className="bg-[#14261c] rounded-xl p-3 text-xs text-slate-200 border border-[#223d2e]">
              <span className="text-emerald-400 font-bold">User:</span> &ldquo;Is it safe to go for a morning run in Delhi right now?&rdquo;
            </div>
            <div className="bg-[#0c1811] rounded-xl p-4 text-xs text-slate-300 border border-[#1b3424] space-y-2.5">
              <div className="flex items-center space-x-1.5 text-amber-400 font-semibold text-xs">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Recommendation: Postpone outdoor jogging indoors.</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <strong className="text-slate-300">Why it matters:</strong> Early morning temperature inversions compress fine particulates (PM2.5) near ground level, tripling inhalation load during strenuous breathing.
              </p>
              <div className="bg-[#122319] p-2.5 rounded-lg border border-[#1e3828] text-[11px]">
                <strong className="text-emerald-300 block mb-1">Practical Actions:</strong>
                <ul className="list-disc pl-4 space-y-0.5 text-slate-300">
                  <li>Switch to indoor stationary cardio or yoga today.</li>
                  <li>Check current hourly air-quality readings before planning outdoor errands. Avoid periods of elevated pollution.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

