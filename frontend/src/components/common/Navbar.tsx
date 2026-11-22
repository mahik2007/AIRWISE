import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Wind, Activity, Bot, Calendar, Home, ArrowLeftRight, Award, Menu, X, MapPin } from 'lucide-react';
import { LocationSearch } from './LocationSearch';
import { LanguageSelector } from './LanguageSelector';
import { GeocodingResult } from '../../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedCity: string;
  onSelectCity?: (loc: GeocodingResult) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, selectedCity, onSelectCity }) => {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: Activity },
    { id: 'assistant', label: t('nav.assistant'), icon: Bot },
    { id: 'planner', label: t('nav.planner'), icon: Calendar },
    { id: 'indoor', label: t('nav.indoor'), icon: Home },
    { id: 'greenchoice', label: t('nav.greenchoice'), icon: ArrowLeftRight },
    { id: 'impact', label: t('nav.impact'), icon: Award },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#0c1611]/90 backdrop-blur-md border-b border-[#1c2e23]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div 
            onClick={() => setActiveTab('landing')}
            className="flex items-center space-x-3 cursor-pointer group flex-shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950/40 border border-emerald-400/30">
              <Wind className="w-5 h-5 text-[#07130c]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg tracking-wider text-emerald-400">AIR</span>
                <span className="font-extrabold text-lg tracking-wider text-slate-100">WISE</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 ml-1">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block tracking-tight">{t('nav.tagline')}</p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-[#14261c]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active City indicator, Language Selector & Quick Switcher */}
          <div className="hidden sm:flex items-center space-x-2 relative">
            <LanguageSelector />

            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex items-center space-x-2 bg-[#122218] hover:bg-[#183022] px-3 py-1.5 rounded-full border border-[#1f3727] text-xs transition-colors cursor-pointer group"
              title="Click to change city"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400">{t('nav.location')}:</span>
              <span className="font-semibold text-emerald-300 group-hover:text-emerald-200">{selectedCity}</span>
              <span className="text-[10px] text-slate-500 ml-1 underline underline-offset-2">{t('nav.change')}</span>
            </button>

            {searchOpen && onSelectCity && (
              <div className="absolute right-0 top-12 w-80 z-50 p-2 rounded-2xl bg-[#0c1811] border border-[#213e2d] shadow-2xl">
                <LocationSearch
                  onSelectLocation={(loc) => {
                    onSelectCity(loc);
                    setSearchOpen(false);
                  }}
                  currentLocationName={selectedCity}
                />
              </div>
            )}
          </div>

          {/* Mobile hamburger & language */}
          <div className="flex md:hidden items-center space-x-2">
            <LanguageSelector compact={true} />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#14261c]"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0e1b14] border-b border-[#1c2e23] px-4 pt-2 pb-4 space-y-2">
          {onSelectCity && (
            <div className="py-2 border-b border-[#1c2e23] mb-2">
              <span className="text-xs text-slate-400 block mb-1.5">{t('nav.location')}:</span>
              <LocationSearch
                onSelectLocation={(loc) => {
                  onSelectCity(loc);
                  setMobileOpen(false);
                }}
                currentLocationName={selectedCity}
              />
            </div>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-300 hover:bg-[#14261c]'
                }`}
              >
                <Icon className="w-4 h-4 text-emerald-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
};
