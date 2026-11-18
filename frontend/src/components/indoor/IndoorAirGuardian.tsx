import React, { useState } from 'react';
import { 
  Home, Wind, Flame, Sparkles, CheckCircle2, AlertTriangle, 
  Layers, ShieldAlert, ThermometerSnowflake, Droplets, ArrowUpRight 
} from 'lucide-react';
import { AirQualityPayload } from '../../types';

interface IndoorAirGuardianProps {
  airQualityData?: AirQualityPayload;
}

export const IndoorAirGuardian: React.FC<IndoorAirGuardianProps> = ({ airQualityData }) => {
  const [selectedRoom, setSelectedRoom] = useState<'living' | 'bedroom' | 'kitchen'>('living');
  const currentAqi = airQualityData?.current.usAqi ?? 130;

  const guidanceCards = [
    {
      title: 'Optimal Ventilation Timing',
      icon: Wind,
      badge: currentAqi > 180 ? 'Seal Windows' : 'Afternoon Window 12-3 PM',
      badgeColor: currentAqi > 180 ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300',
      summary: 'Never open windows between 6:00 AM and 9:00 AM during winter. Thermal inversion traps surface exhaust and toxic PM2.5.',
      details: [
        'Ventilate only during peak solar irradiance (12:00 PM – 3:30 PM) when thermal vertical updrafts disperse stagnant surface pollutants.',
        'Create cross-ventilation by opening two opposite windows for 15 minutes, then latch tightly.',
        'Use draft-stopper seals or rolled towels beneath front door gaps facing shared corridors.',
      ],
      scientificWhy: 'Thermal temperature inversion occurs when cold surface air is trapped beneath warmer air aloft, compressing particulate matter close to breathing height.',
    },
    {
      title: 'Kitchen Cooking Smog Management',
      icon: Flame,
      badge: 'High PM2.5 Source',
      badgeColor: 'bg-amber-500/20 text-amber-300',
      summary: 'High-heat oil frying, deep tempering, and unvented gas stoves can cause indoor PM2.5 spikes up to 400 µg/m³ within 15 minutes.',
      details: [
        'Turn on kitchen chimney/exhaust fan at least 60 seconds BEFORE igniting stove burners.',
        'Keep the kitchen door closed from living rooms and bedrooms while cooking.',
        'Cover pans during boiling and shallow frying to prevent aerosolized lipid droplets from escaping into room air.',
        'Never rely on chemical aerosol room fresheners or citrus sprays—they react with ozone to form formaldehyde and secondary particulates.',
      ],
      scientificWhy: 'Incomplete LPG combustion emits nitrogen dioxide (NO2) and carbon monoxide, while vaporized cooking oils condense into ultrafine respirable aerosol particles.',
    },
    {
      title: 'Safe Dust & Cleaning Practices',
      icon: Layers,
      badge: 'Zero-Resuspension Protocol',
      badgeColor: 'bg-teal-500/20 text-teal-300',
      summary: 'Traditional dry broom sweeping and feather dusters fling settled heavy and fine particulates back into breathing suspension.',
      details: [
        'Strictly switch to damp microfiber mopping and microfiber electrostatic cloths.',
        'Vacuum exclusively with sealed HEPA-grade exhaust filters; ordinary bag vacuums blow fine particles right back into the room.',
        'Wash bed linens and curtains in warm water (60°C) bi-weekly to neutralize dust-mite allergens and trapped exterior soot.',
      ],
      scientificWhy: 'Mechanical dry sweeping resuspends PM10 and PM2.5 for up to 2 to 4 hours in stagnant indoor air.',
    },
    {
      title: 'Air Purifier & Filtration Science',
      icon: Sparkles,
      badge: 'HEPA vs Plants Truth',
      badgeColor: 'bg-purple-500/20 text-purple-300',
      summary: 'Understand true particulate filtration capabilities versus common marketing myths.',
      details: [
        'True HEPA H13 filters capture 99.97% of particles down to 0.3 microns. Verify genuine H13 certification.',
        'Place air purifiers centrally away from walls and at least 3 feet off the floor for optimal laminar airflow circulation.',
        'Myth check: Indoor plants (snake plant, spider plant) have ZERO measurable effect on clearing high-concentration particulate smog (PM2.5). They absorb trace VOCs under high laboratory conditions but cannot replace mechanical filtration.',
        'Clean or vacuum pre-filters every 2 weeks to extend true HEPA lifespan and reduce motor resistance.',
      ],
      scientificWhy: 'Particulate capture requires high-volume volumetric air exchanges per hour (ACH 4–5x), which passive botanical surfaces physically cannot provide.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-[#0f1d16] border border-[#1e3828] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Home className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-slate-100">Indoor Air Guardian</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Science-backed indoor air quality protocol for winter smog periods.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="p-2.5 rounded-xl bg-[#14261c] border border-[#213d2c]">
            <span className="text-slate-400 block text-[10px]">Ambient Outdoor AQI:</span>
            <span className="font-bold text-emerald-300">{currentAqi} US AQI</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#14261c] border border-[#213d2c]">
            <span className="text-slate-400 block text-[10px]">Target Indoor AQI:</span>
            <span className="font-bold text-emerald-400">&lt; 50 US AQI</span>
          </div>
        </div>
      </div>

      {/* Grid of 4 Core Indoor Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guidanceCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="p-6 rounded-3xl bg-[#0f1d16] border border-[#1e3828] hover:border-emerald-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-slate-100 text-sm">{card.title}</h3>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {card.summary}
                </p>

                <div className="space-y-2 pt-2 border-t border-[#182f21]">
                  <span className="text-xs font-semibold text-slate-200 block">Action Checklist:</span>
                  <ul className="space-y-1.5">
                    {card.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-5 p-3 rounded-xl bg-[#14261c] border border-[#203c2a] text-[11px] text-slate-400 leading-relaxed">
                <strong className="text-emerald-300 block mb-0.5">Atmospheric Science Principle:</strong>
                {card.scientificWhy}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Air Purifier CADR Calculator Widget */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0d1a13] to-[#12241a] border border-[#1e3828]">
        <div className="max-w-2xl">
          <h3 className="text-base font-bold text-slate-100 mb-1 flex items-center space-x-2">
            <ThermometerSnowflake className="w-4 h-4 text-emerald-400" />
            <span>Air Purifier Sizing Guide (CADR Rule)</span>
          </h3>
          <p className="text-xs text-slate-300 mb-4 leading-relaxed">
            Never buy an air purifier based on room square footage claims alone. Match Clean Air Delivery Rate (CADR) to achieve 4 to 5 complete air changes per hour (ACH).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#0b140f] border border-[#1e3828]">
              <span className="text-slate-400 block text-[10px]">Small Bedroom (150 sq ft)</span>
              <strong className="text-slate-100 text-sm">CADR: 120–150 m³/h</strong>
            </div>
            <div className="p-3 rounded-xl bg-[#0b140f] border border-[#1e3828]">
              <span className="text-slate-400 block text-[10px]">Master Bedroom (250 sq ft)</span>
              <strong className="text-slate-100 text-sm">CADR: 200–250 m³/h</strong>
            </div>
            <div className="p-3 rounded-xl bg-[#0b140f] border border-[#1e3828]">
              <span className="text-slate-400 block text-[10px]">Living Hall (400+ sq ft)</span>
              <strong className="text-slate-100 text-sm">CADR: 350–450 m³/h</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

