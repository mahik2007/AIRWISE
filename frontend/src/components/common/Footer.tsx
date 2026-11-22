import React from 'react';
import { useTranslation } from 'react-i18next';
import { Wind, ShieldCheck, Database, HeartHandshake } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#08100c] border-t border-[#18291f] text-slate-400 py-10 mt-16 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Purpose */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <Wind className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="font-bold text-slate-100 tracking-wider">AIRWISE</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              {t('footer.tagline')}
            </p>
            <div className="inline-flex items-center space-x-1.5 px-2 py-1 rounded bg-[#102017] border border-[#1b3425] text-[11px] text-emerald-300">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>{t('footer.independent')}</span>
            </div>
          </div>

          {/* Col 2: Scientific Data Sources */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-slate-200 flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('footer.attributionTitle')}</span>
            </h4>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li>
                <strong className="text-slate-300">Open-Meteo Air Quality:</strong> {t('footer.attribution1')}
              </li>
              <li>
                <strong className="text-slate-300">Copernicus CAMS / ECMWF:</strong> {t('footer.attribution2')}
              </li>
              <li>
                <strong className="text-slate-300">CPCB / data.gov.in:</strong> {t('footer.attribution3')}
              </li>
              <li>
                <strong className="text-slate-300">Open-Meteo Geocoding:</strong> {t('footer.attribution4')}
              </li>
            </ul>
          </div>

          {/* Col 3: Scientific Scale Integrity */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-slate-200 flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('footer.integrityTitle')}</span>
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {t('footer.integrityText')}
            </p>
            <p className="text-[11px] text-slate-400">
              {t('footer.integrityVehicle')}
            </p>
          </div>

          {/* Col 4: Safety & Disclaimer */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-slate-200">{t('footer.healthTitle')}</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {t('footer.healthText')}
            </p>
            <p className="text-[10px] text-slate-500 pt-1">
              {t('footer.techBadge')}
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-[#15241b] flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} {t('footer.copyright')}</p>
          <p className="mt-2 sm:mt-0">{t('footer.poweredBy')}</p>
        </div>
      </div>
    </footer>
  );
};

