import React, { useState } from 'react';
import { Wind, Activity, Bot, Calendar, Home, ArrowLeftRight, Award, Menu, X } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedCity: string;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, selectedCity }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'assistant', label: 'AI Assistant', icon: Bot },
    { id: 'planner', label: 'Daily Planner', icon: Calendar },
    { id: 'indoor', label: 'Indoor Guardian', icon: Home },
    { id: 'greenchoice', label: 'Green Choice', icon: ArrowLeftRight },
    { id: 'impact', label: 'My Impact', icon: Award },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#0c1611]/90 backdrop-blur-md border-b border-[#1c2e23]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div 
            onClick={() => setActiveTab('landing')}
            className="flex items-center space-x-3 cursor-pointer group"
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
              <p className="text-[10px] text-slate-400 hidden sm:block tracking-tight">Your City. Your Air. Your Everyday Guide.</p>
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

          {/* Active City indicator */}
          <div className="hidden sm:flex items-center space-x-2 bg-[#122218] px-3 py-1.5 rounded-full border border-[#1f3727] text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Location:</span>
            <span className="font-semibold text-slate-200">{selectedCity}</span>
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden">
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
        <div className="md:hidden bg-[#0e1b14] border-b border-[#1c2e23] px-4 pt-2 pb-4 space-y-1">
          <div className="py-2 px-3 text-xs text-slate-400 border-b border-[#1c2e23] mb-2 flex items-center justify-between">
            <span>Location: <strong className="text-emerald-300">{selectedCity}</strong></span>
            <span className="text-[10px] text-slate-500">PromptWars Challenge 6</span>
          </div>
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

