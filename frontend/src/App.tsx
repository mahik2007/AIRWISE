import React, { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { LandingPage } from './pages/LandingPage';
import { AirDashboard } from './components/dashboard/AirDashboard';
import { AIAssistant } from './components/assistant/AIAssistant';
import { DailyPlanner } from './components/planner/DailyPlanner';
import { IndoorAirGuardian } from './components/indoor/IndoorAirGuardian';
import { GreenChoiceEngine } from './components/greenchoice/GreenChoiceEngine';
import { MyImpact } from './components/impact/MyImpact';
import { getAirQuality } from './services/api';
import { AirQualityPayload, GeocodingResult, SavedActivity } from './types';
import { Loader2, AlertCircle } from 'lucide-react';

const DEFAULT_CITY: GeocodingResult = {
  id: 1273294,
  name: 'Delhi',
  latitude: 28.65195,
  longitude: 77.23149,
  country: 'India',
  admin1: 'Delhi',
};

export const App: React.FC = () => {
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
      return stored ? JSON.parse(stored) : [
        {
          id: 'sample-1',
          date: new Date().toISOString(),
          title: 'Switched car to Metro commute (10 km)',
          category: 'commute',
          co2SavedGrams: 1650,
          pmAvoidedGrams: 0.29,
        },
      ];
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
    } catch (err: any) {
      console.error(err);
      setError('Unable to fetch live air quality data. Please check your internet or retry.');
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
      <div>
        <Navbar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          selectedCity={currentCity.name}
        />

        {error && (
          <div className="max-w-7xl mx-auto px-4 mt-4">
            <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => loadAirData(currentCity)}
                className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 text-[11px] font-semibold"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <main className="transition-opacity duration-200">
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
                <p className="text-xs text-slate-400">Loading atmospheric sensors for {currentCity.name}...</p>
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
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default App;
