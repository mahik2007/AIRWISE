import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Award, TrendingUp, CheckCircle2, Trash2, Calendar, 
  Leaf, Zap, Plus, ArrowUpRight, ShieldCheck 
} from 'lucide-react';
import { SavedActivity } from '../../types';
import { formatDate } from '../../utils/formatters';

interface MyImpactProps {
  activities: SavedActivity[];
  onAddActivity: (title: string, category: 'commute' | 'indoor' | 'energy' | 'waste', co2Grams: number, pmGrams: number) => void;
  onDeleteActivity: (id: string) => void;
  onClearAll: () => void;
}

export const MyImpact: React.FC<MyImpactProps> = ({
  activities,
  onAddActivity,
  onDeleteActivity,
  onClearAll,
}) => {
  const { t } = useTranslation();
  const [customTitle, setCustomTitle] = useState('');
  const [customCategory, setCustomCategory] = useState<'commute' | 'indoor' | 'energy' | 'waste'>('commute');
  const [customDistance, setCustomDistance] = useState(10);

  // Compute cumulative savings
  const totalCo2Grams = activities.reduce((sum, item) => sum + item.co2SavedGrams, 0);
  const totalPmGrams = activities.reduce((sum, item) => sum + item.pmAvoidedGrams, 0);

  const handleQuickAdd = (actionTitle: string, category: 'commute' | 'indoor' | 'energy' | 'waste', co2: number, pm: number) => {
    onAddActivity(actionTitle, category, co2, pm);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    // Realistic calculation based on category
    let co2 = 250;
    let pm = 0.04;
    if (customCategory === 'commute') {
      co2 = Math.round(customDistance * 165); // approx car to transit switch
      pm = Math.round(customDistance * 0.025 * 1000) / 1000;
    } else if (customCategory === 'indoor') {
      co2 = 60;
      pm = 0.05;
    } else if (customCategory === 'energy') {
      co2 = 300;
      pm = 0.01;
    }

    onAddActivity(customTitle.trim(), customCategory, co2, pm);
    setCustomTitle('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[#0f1d16] border border-[#1e3828]">
        <div className="flex items-center space-x-2 mb-2">
          <Award className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-bold text-slate-100">{t('impact.title')}</h2>
        </div>
        <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
          {t('impact.subtitle')}
        </p>
      </div>

      {/* Aggregate Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-[#0f1d16] border border-[#1e3828]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>{t('impact.totalCo2')}</span>
            <Leaf className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">
            {(totalCo2Grams / 1000).toFixed(2)}{' '}
            <span className="text-sm font-normal text-slate-400">kg CO₂</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block">
            Equal to ~{Math.round(totalCo2Grams / 180)} km of solo car travel eliminated
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-[#0f1d16] border border-[#1e3828]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>{t('impact.totalPm')}</span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-extrabold text-teal-400">
            {totalPmGrams.toFixed(3)}{' '}
            <span className="text-sm font-normal text-slate-400">grams</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block">
            Direct airborne particulates kept out of roadside neighborhoods
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-[#0f1d16] border border-[#1e3828]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>{t('impact.completedActions')}</span>
            <CheckCircle2 className="w-4 h-4 text-lime-400" />
          </div>
          <div className="text-3xl font-extrabold text-lime-400">
            {activities.length}{' '}
            <span className="text-sm font-normal text-slate-400">{t('impact.actionsCount')}</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block">
            {activities.length > 5 ? t('impact.streakLvl2') : t('impact.streakKeep')}
          </span>
        </div>
      </div>

      {/* Quick Action Logger */}
      <div className="p-6 rounded-3xl bg-[#0f1d16] border border-[#1e3828] space-y-4">
        <h3 className="text-sm font-bold text-slate-100">{t('impact.logHabitTitle')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => handleQuickAdd('Switched car to Metro commute (10 km)', 'commute', 1650, 0.29)}
            className="p-3 rounded-2xl bg-[#14261c] hover:bg-emerald-500/20 border border-[#213e2d] text-left transition-all group"
          >
            <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-300">{t('impact.quick1Title')}</div>
            <div className="text-[11px] text-slate-400 mt-1">{t('impact.quick1Sub')}</div>
          </button>

          <button
            onClick={() => handleQuickAdd('Carpool with 2 colleagues to office', 'commute', 1150, 0.18)}
            className="p-3 rounded-2xl bg-[#14261c] hover:bg-emerald-500/20 border border-[#213e2d] text-left transition-all group"
          >
            <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-300">{t('impact.quick2Title')}</div>
            <div className="text-[11px] text-slate-400 mt-1">{t('impact.quick2Sub')}</div>
          </button>

          <button
            onClick={() => handleQuickAdd('Damp mopped room instead of dry sweeping', 'indoor', 50, 0.05)}
            className="p-3 rounded-2xl bg-[#14261c] hover:bg-emerald-500/20 border border-[#213e2d] text-left transition-all group"
          >
            <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-300">{t('impact.quick3Title')}</div>
            <div className="text-[11px] text-slate-400 mt-1">{t('impact.quick3Sub')}</div>
          </button>

          <button
            onClick={() => handleQuickAdd('Preheated chimney & covered pans during cooking', 'indoor', 80, 0.03)}
            className="p-3 rounded-2xl bg-[#14261c] hover:bg-emerald-500/20 border border-[#213e2d] text-left transition-all group"
          >
            <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-300">{t('impact.quick4Title')}</div>
            <div className="text-[11px] text-slate-400 mt-1">{t('impact.quick4Sub')}</div>
          </button>
        </div>

        {/* Custom entry form */}
        <form onSubmit={handleCustomSubmit} className="pt-4 border-t border-[#193222] flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder={t('impact.customPlaceholder')}
            className="flex-1 bg-[#14261c] border border-[#213e2d] rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <select
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value as any)}
            className="bg-[#14261c] border border-[#213e2d] rounded-xl px-3 py-2 text-xs text-emerald-300 focus:outline-none"
          >
            <option value="commute">{t('impact.catCommute')}</option>
            <option value="indoor">{t('impact.catIndoor')}</option>
            <option value="energy">{t('impact.catEnergy')}</option>
            <option value="waste">{t('impact.catWaste')}</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('impact.btnAddAction')}</span>
          </button>
        </form>
      </div>

      {/* History Log */}
      <div className="p-6 rounded-3xl bg-[#0f1d16] border border-[#1e3828]">
        <div className="flex items-center justify-between pb-3 border-b border-[#1b3425] mb-4">
          <h3 className="text-sm font-bold text-slate-100">{t('impact.historyHeading')}</h3>
          {activities.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center space-x-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>{t('impact.resetHistory')}</span>
            </button>
          )}
        </div>

        {activities.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            {t('impact.emptyState')}
          </div>
        ) : (
          <div className="space-y-2">
            {activities.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-[#14261c] border border-[#203c2a] flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-200">{item.title}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {formatDate(item.date)} • Category: <span className="capitalize">{item.category}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="text-emerald-400 font-mono font-bold block">
                      +{item.co2SavedGrams}g CO₂
                    </span>
                    <span className="text-slate-400 text-[10px] font-mono">
                      {item.pmAvoidedGrams}g PM
                    </span>
                  </div>
                  <button
                    onClick={() => onDeleteActivity(item.id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

