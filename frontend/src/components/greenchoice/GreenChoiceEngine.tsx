import React, { useState } from 'react';
import { 
  ArrowLeftRight, Car, Bus, Train, Bike, Footprints, 
  Leaf, Info, ShieldCheck, Zap, PlusCircle 
} from 'lucide-react';
import { calculateTransportSavings } from '../../services/api';
import { TransportComparison } from '../../types';

interface GreenChoiceEngineProps {
  onLogImpact?: (title: string, category: 'commute' | 'indoor' | 'energy' | 'waste', co2Grams: number, pmGrams: number) => void;
}

export const GreenChoiceEngine: React.FC<GreenChoiceEngineProps> = ({ onLogImpact }) => {
  const [distanceKm, setDistanceKm] = useState<number>(12);
  const [baseMode, setBaseMode] = useState<string>('car_solo');
  const [altMode, setAltMode] = useState<string>('metro');
  const [comparison, setComparison] = useState<TransportComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const transportModes = [
    { id: 'car_solo', name: 'Solo Private Car', icon: Car, factor: '180 g CO2/km' },
    { id: 'two_wheeler', name: 'Motorbike / Scooter', icon: Bike, factor: '75 g CO2/km' },
    { id: 'carpool', name: 'Carpool (3 People)', icon: Car, factor: '65 g CO2/km' },
    { id: 'bus', name: 'City Bus Transit', icon: Bus, factor: '35 g CO2/km' },
    { id: 'metro', name: 'Electric Metro Rail', icon: Train, factor: '15 g CO2/km' },
    { id: 'cycle_walk', name: 'Bicycle / Walking', icon: Footprints, factor: '0 g CO2/km' },
    { id: 'wfh', name: 'Remote / Work from Home', icon: Zap, factor: '0 g CO2/km' },
  ];

  const handleCalculate = async () => {
    try {
      setLoading(true);
      const res = await calculateTransportSavings(baseMode, altMode, distanceKm);
      setComparison(res);
      setSavedNotice(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordToTracker = () => {
    if (!comparison || !onLogImpact) return;
    onLogImpact(
      `Switched ${comparison.modeA} to ${comparison.modeB} (${comparison.distanceKm} km)`,
      'commute',
      comparison.co2SavedGrams,
      comparison.pm25SavedGrams
    );
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[#0f1d16] border border-[#1e3828]">
        <div className="flex items-center space-x-2 mb-2">
          <ArrowLeftRight className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-bold text-slate-100">Green Choice Engine</h2>
        </div>
        <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
          Compare commute and daily lifestyle options using standardized ARAI & UK DEFRA transport emission metrics. Understand real trade-offs and calculate direct tailpipe emissions avoided.
        </p>
      </div>

      {/* Interactive Commute Evaluator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Card */}
        <div className="lg:col-span-1 p-6 rounded-3xl bg-[#0f1d16] border border-[#1e3828] space-y-5">
          <h3 className="text-sm font-bold text-slate-100">Configure Trip Comparison</h3>

          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Baseline (Current Mode):</label>
            <select
              value={baseMode}
              onChange={(e) => setBaseMode(e.target.value)}
              className="w-full bg-[#14261c] border border-[#203c2a] text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none"
            >
              {transportModes.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.factor})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Sustainable Alternative:</label>
            <select
              value={altMode}
              onChange={(e) => setAltMode(e.target.value)}
              className="w-full bg-[#14261c] border border-[#203c2a] text-emerald-300 text-xs rounded-xl p-2.5 focus:outline-none"
            >
              {transportModes.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.factor})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs text-slate-400 mb-1.5">
              <span>One-way Trip Distance:</span>
              <strong className="text-emerald-300 font-mono">{distanceKm} km</strong>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={distanceKm}
              onChange={(e) => setDistanceKm(Number(e.target.value))}
              className="w-full accent-emerald-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>1 km</span>
              <span>25 km</span>
              <span>50 km</span>
            </div>
          </div>

          <button
            onClick={handleCalculate}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md"
          >
            {loading ? 'Evaluating...' : 'Compute Tailpipe Savings'}
          </button>
        </div>

        {/* Results Card */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#0f1d16] border border-[#1e3828] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#1b3425]">
              <div className="text-xs text-slate-400">
                Evaluating: <strong className="text-slate-200">{distanceKm} km journey</strong>
              </div>
              <span className="text-[10px] text-emerald-400/80 font-mono">ARAI/CPCB Methodology</span>
            </div>

            {comparison ? (
              <div className="py-5 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#14261c] border border-[#203d2b]">
                    <span className="text-[11px] text-slate-400 block mb-1">CO₂ Tailpipe Avoidance:</span>
                    <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                      {(comparison.co2SavedGrams / 1000).toFixed(2)}{' '}
                      <span className="text-xs font-normal text-slate-400">kg CO₂</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Equivalent to {comparison.co2SavedGrams} grams direct carbon offset
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#14261c] border border-[#203d2b]">
                    <span className="text-[11px] text-slate-400 block mb-1">Particulate PM2.5 Prevented:</span>
                    <div className="text-2xl sm:text-3xl font-extrabold text-teal-400">
                      {comparison.pm25SavedGrams}{' '}
                      <span className="text-xs font-normal text-slate-400">grams PM2.5</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Direct exhaust soot not emitted into roadside air
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0c1811] border border-[#1a3323] text-xs text-slate-300 space-y-2">
                  <p className="font-medium text-slate-200">{comparison.explanation}</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed italic">
                    Note on assumptions: {comparison.assumptions}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">
                Click &ldquo;Compute Tailpipe Savings&rdquo; to evaluate the emissions difference for your commute.
              </div>
            )}
          </div>

          {comparison && (
            <div className="pt-4 border-t border-[#1b3425] flex items-center justify-between">
              <span className="text-xs text-slate-400">Make this action count towards your footprint:</span>
              <button
                onClick={handleRecordToTracker}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{savedNotice ? 'Logged to My Impact!' : 'Log to Impact Tracker'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Trade-Off Comparison Matrix */}
      <div className="p-6 rounded-3xl bg-[#0f1d16] border border-[#1e3828]">
        <h3 className="text-sm font-bold text-slate-100 mb-3">Urban Mobility Trade-Off Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-[#1c3626]">
              <tr>
                <th className="py-3 px-3">Mode</th>
                <th className="py-3 px-3">Emissions Profile</th>
                <th className="py-3 px-3">Personal Inhalation Risk in Smog</th>
                <th className="py-3 px-3">Urban Congestion Factor</th>
                <th className="py-3 px-3">Ideal Use Case</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172d20]">
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-100">Electric Metro</td>
                <td className="py-3 px-3 text-emerald-400">Lowest (~15g CO2/km)</td>
                <td className="py-3 px-3 text-emerald-400">Minimal (Air-filtered underground/elevated)</td>
                <td className="py-3 px-3 text-emerald-400">Zero surface road occupancy</td>
                <td className="py-3 px-3">Daily office commuting &gt; 5 km</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-100">Public CNG / Electric Bus</td>
                <td className="py-3 px-3 text-teal-400">Low (~35g CO2/km)</td>
                <td className="py-3 px-3 text-amber-400">Moderate at bus stops (Wear N95)</td>
                <td className="py-3 px-3 text-emerald-400">Replaces 40+ private cars</td>
                <td className="py-3 px-3">Connecting hub corridors</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-100">Carpooling (3 pax)</td>
                <td className="py-3 px-3 text-emerald-400">Moderate (~65g CO2/km)</td>
                <td className="py-3 px-3 text-emerald-400">Low (With AC recirculate)</td>
                <td className="py-3 px-3 text-teal-400">Cuts 2 cars per trip</td>
                <td className="py-3 px-3">Off-metro suburban routes</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-100">Two-Wheeler (Motorbike)</td>
                <td className="py-3 px-3 text-amber-400">Moderate (~75g CO2/km)</td>
                <td className="py-3 px-3 text-rose-400 font-bold">Severe (Direct tailpipe exposure)</td>
                <td className="py-3 px-3 text-amber-400">High stop-and-go idling</td>
                <td className="py-3 px-3">Restrict when US AQI &gt; 150</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-100">Solo Petrol Car</td>
                <td className="py-3 px-3 text-rose-400">Highest (~180g CO2/km)</td>
                <td className="py-3 px-3 text-emerald-400">Low inside cabin</td>
                <td className="py-3 px-3 text-rose-400 font-bold">Major cause of rush hour bottlenecks</td>
                <td className="py-3 px-3">Family emergencies only in smog season</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

