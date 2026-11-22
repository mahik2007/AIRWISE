import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Home, Wind, Flame, Sparkles, CheckCircle2, AlertTriangle, 
  Layers, ShieldAlert, ThermometerSnowflake, Droplets, ArrowUpRight 
} from 'lucide-react';
import { AirQualityPayload } from '../../types';

interface IndoorAirGuardianProps {
  airQualityData?: AirQualityPayload;
}

export const IndoorAirGuardian: React.FC<IndoorAirGuardianProps> = ({ airQualityData }) => {
  const { t } = useTranslation();
  const [selectedRoom, setSelectedRoom] = useState<'living' | 'bedroom' | 'kitchen'>('living');
  const currentAqi = airQualityData?.current.usAqi ?? 130;

  const guidanceCards = [
    {
      title: t('indoor.card1Title'),
      icon: Wind,
      badge: currentAqi > 180 ? t('indoor.card1BadgeSeal') : t('indoor.card1BadgeCheck'),
      badgeColor: currentAqi > 180 ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300',
      summary: t('indoor.card1Summary'),
      details: [
        t('indoor.card1Step1'),
        t('indoor.card1Step2'),
        t('indoor.card1Step3'),
      ],
      scientificWhy: t('indoor.card1Why'),
    },
    {
      title: t('indoor.card2Title'),
      icon: Flame,
      badge: t('indoor.card2Badge'),
      badgeColor: 'bg-amber-500/20 text-amber-300',
      summary: t('indoor.card2Summary'),
      details: [
        t('indoor.card2Step1'),
        t('indoor.card2Step2'),
        t('indoor.card2Step3'),
        t('indoor.card2Step4'),
      ],
      scientificWhy: t('indoor.card2Why'),
    },
    {
      title: t('indoor.card3Title'),
      icon: Layers,
      badge: t('indoor.card3Badge'),
      badgeColor: 'bg-teal-500/20 text-teal-300',
      summary: t('indoor.card3Summary'),
      details: [
        t('indoor.card3Step1'),
        t('indoor.card3Step2'),
        t('indoor.card3Step3'),
      ],
      scientificWhy: t('indoor.card3Why'),
    },
    {
      title: t('indoor.card4Title'),
      icon: Sparkles,
      badge: t('indoor.card4Badge'),
      badgeColor: 'bg-purple-500/20 text-purple-300',
      summary: t('indoor.card4Summary'),
      details: [
        t('indoor.card4Step1'),
        t('indoor.card4Step2'),
        t('indoor.card4Step3'),
        t('indoor.card4Step4'),
      ],
      scientificWhy: t('indoor.card4Why'),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-[#0f1d16] border border-[#1e3828] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Home className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-slate-100">{t('indoor.title')}</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t('indoor.subtitle')}
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="p-2.5 rounded-xl bg-[#14261c] border border-[#213d2c]">
            <span className="text-slate-400 block text-[10px]">{t('indoor.outdoorAqi')}</span>
            <span className="font-bold text-emerald-300">{currentAqi} US AQI</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#14261c] border border-[#213d2c]">
            <span className="text-slate-400 block text-[10px]">{t('indoor.targetIndoor')}</span>
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
                  <span className="text-xs font-semibold text-slate-200 block">{t('indoor.actionChecklist')}</span>
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
                <strong className="text-emerald-300 block mb-0.5">{t('indoor.scientificPrinciple')}</strong>
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
            <span>{t('indoor.cadrGuideTitle')}</span>
          </h3>
          <p className="text-xs text-slate-300 mb-4 leading-relaxed">
            {t('indoor.cadrGuideDesc')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#0b140f] border border-[#1e3828]">
              <span className="text-slate-400 block text-[10px]">{t('indoor.cadrRoom1')}</span>
              <strong className="text-slate-100 text-sm">CADR: 120–150 m³/h</strong>
            </div>
            <div className="p-3 rounded-xl bg-[#0b140f] border border-[#1e3828]">
              <span className="text-slate-400 block text-[10px]">{t('indoor.cadrRoom2')}</span>
              <strong className="text-slate-100 text-sm">CADR: 200–250 m³/h</strong>
            </div>
            <div className="p-3 rounded-xl bg-[#0b140f] border border-[#1e3828]">
              <span className="text-slate-400 block text-[10px]">{t('indoor.cadrRoom3')}</span>
              <strong className="text-slate-100 text-sm">CADR: 350–450 m³/h</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

