import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { LandingPage } from './pages/LandingPage';
import { getAirQuality } from './services/api';
import { AirQualityPayload, GeocodingResult, SavedActivity } from './types';
import { Loader2, AlertCircle } from 'lucide-react';

// Code-split heavy interactive screens via React.lazy
const AirDashboard = lazy(() => import('./components/dashboard/AirDashboard').then(m => ({ default: m.AirDashboard })));
const AIAssistant = lazy(() => import('./components/assistant/AIAssistant').then(m => ({ default: m.AIAssistant })));
const DailyPlanner = lazy(() => import('./components/planner/DailyPlanner').then(m => ({ default: m.DailyPlanner })));
const IndoorAirGuardian = lazy(() => import('./components/indoor/IndoorAirGuardian').then(m => ({ default: m.IndoorAirGuardian })));
const GreenChoiceEngine = lazy(() => import('./components/greenchoice/GreenChoiceEngine').then(m => ({ default: m.GreenChoiceEngine })));
const MyImpact = lazy(() => import('./components/impact/MyImpact').then(m => ({ default: m.MyImpact })));

// Loading skeleton for lazy screens
const ScreenLoadingFallback: React.FC = () => (
  <div className="py-24 flex flex-col items-center justify-center space-y-3 min-h-[50vh]">
    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
    <p className="text-xs text-slate-400 font-medium">Loading module...</p>
  </div>
);

const DEFAULT_CITY: GeocodingResult = {
  id: 1273294,
  name: 'Delhi',
  latitude: 28.65195,
  longitude: 77.23149,
  country: 'India',
  admin1: 'Delhi',
};

export const App: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [currentCity, setCurrentCity] = useState<GeocodingResult>(DEFAULT_CITY);
  const [airQualityData, setAirQualityData] = useState<AirQualityPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [initialAssistantQuery, setInitialAssistantQuery] = useState<string | undefined>(undefined);

  // Local storage persisted activities for MyImpact
  const [activities, setActivities] = useState<SavedActivity[]>(() => {
    try {
      const stored = localStorage.getItem('airwise_impact_activities');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('airwise_impact_activities', JSON.stringify(activities));
    } catch (e) {
      console.warn('Failed saving activities to localStorage', e);
    }
  }, [activities]);

  const loadAirData = async (loc: GeocodingResult) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAirQuality(loc.latitude, loc.longitude, loc.name, loc.country, loc.admin1);
      setAirQualityData(data);
    } catch (err: unknown) {
      console.error(err);
      setError(`${t('common.unableRetrieve')} ${loc.name}. ${t('common.checkConnection')}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAirData(currentCity);
  }, [currentCity]);

  const handleSelectCity = (city: GeocodingResult) => {
    setCurrentCity(city);
  };

  const handleAddActivity = (
    title: string,
    category: 'commute' | 'indoor' | 'energy' | 'waste',
    co2Grams: number,
    pmGrams: number
  ) => {
    const newAct: SavedActivity = {
      id: `act-${Date.now()}`,
      date: new Date().toISOString(),
      title,
      category,
      co2SavedGrams: co2Grams,
      pmAvoidedGrams: pmGrams,
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  const handleDeleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  const handleClearActivities = () => {
    setActivities([]);
  };

  const handleAskAIFromDashboard = (query?: string) => {
    setInitialAssistantQuery(query);
    setActiveTab('assistant');
  };

  return (
    <div className="min-h-screen bg-[#09120d] text-slate-100 flex flex-col justify-between selection:bg-emerald-500/30 selection:text-white">
      {/* Accessible Skip Link for Keyboard Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:bg-emerald-500 focus:text-slate-950 focus:font-bold focus:rounded-lg focus:shadow-xl focus:outline-none"
      >
        {t('common.skipToMain', 'Skip to main content')}
      </a>

      {/* Live Region for Screen Reader Announcements (AQI and Language Updates) */}
      <div
        id="a11y-announcements"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {airQualityData ? `Selected location ${airQualityData.location.name}. Air quality index is ${airQualityData.current.usAqi}, ${airQualityData.current.usAqiCategory}.` : ''}
      </div>

      <div>
        <Navbar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          selectedCity={currentCity.name}
          onSelectCity={handleSelectCity}
        />

        {error && (
          <div className="max-w-7xl mx-auto px-4 mt-4" role="alert" aria-live="assertive">
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => loadAirData(currentCity)}
                className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-semibold transition-colors focus:ring-2 focus:ring-red-400 focus:outline-none"
              >
                {t('common.retry')}
              </button>
            </div>
          </div>
        )}

        <main id="main-content" tabIndex={-1} className="transition-opacity duration-200 focus:outline-none">
          <Suspense fallback={<ScreenLoadingFallback />}>
            {activeTab === 'landing' && (
              <LandingPage
                onSelectCity={handleSelectCity}
                onExploreDashboard={() => setActiveTab('dashboard')}
                onOpenAssistant={() => setActiveTab('assistant')}
              />
            )}

            {activeTab === 'dashboard' && (
              loading && !airQualityData ? (
                <div className="py-24 flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                  <p className="text-xs text-slate-400 font-medium">
                    {t('common.connecting')} <span className="text-emerald-300">{currentCity.name}</span>...
                  </p>
                  <p className="text-[11px] text-slate-500">{t('common.queryingModels')}</p>
                </div>
              ) : airQualityData ? (
                <AirDashboard
                  data={airQualityData}
                  onRefresh={() => loadAirData(currentCity)}
                  onAskAI={handleAskAIFromDashboard}
                />
              ) : null
            )}

            {activeTab === 'assistant' && (
              <AIAssistant
                airQualityData={airQualityData || undefined}
                defaultPrompt={initialAssistantQuery}
              />
            )}

            {activeTab === 'planner' && (
              <DailyPlanner
                airQualityData={airQualityData || undefined}
                onLogImpact={handleAddActivity}
              />
            )}

            {activeTab === 'indoor' && (
              <IndoorAirGuardian airQualityData={airQualityData || undefined} />
            )}

            {activeTab === 'greenchoice' && (
              <GreenChoiceEngine onLogImpact={handleAddActivity} />
            )}

            {activeTab === 'impact' && (
              <MyImpact
                activities={activities}
                onAddActivity={handleAddActivity}
                onDeleteActivity={handleDeleteActivity}
                onClearAll={handleClearActivities}
              />
            )}
          </Suspense>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default App;
