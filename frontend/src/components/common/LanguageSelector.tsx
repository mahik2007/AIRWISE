import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

interface LanguageSelectorProps {
  className?: string;
  compact?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = '', compact = false }) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language?.startsWith('hi') ? 'hi' : 'en';

  const handleLanguageChange = (lng: 'en' | 'hi') => {
    if (lng !== currentLanguage) {
      i18n.changeLanguage(lng);
      // Announce language change to screen readers
      const announcer = document.getElementById('a11y-announcements');
      if (announcer) {
        announcer.textContent = lng === 'hi' ? 'भाषा बदलकर हिन्दी कर दी गई है।' : 'Language switched to English.';
      }
    }
  };

  return (
    <div 
      role="group" 
      aria-label="Language selection" 
      className={`flex items-center space-x-1 bg-[#122218] p-1 rounded-xl border border-[#1f3727] text-xs ${className}`}
    >
      {!compact && <Languages className="w-3.5 h-3.5 text-emerald-400 ml-1.5 mr-0.5 flex-shrink-0" aria-hidden="true" />}
      <button
        type="button"
        onClick={() => handleLanguageChange('en')}
        aria-label="Switch to English"
        aria-pressed={currentLanguage === 'en'}
        className={`px-2 py-1 rounded-lg font-medium transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
          currentLanguage === 'en'
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-xs'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => handleLanguageChange('hi')}
        aria-label="हिन्दी में बदलें (Switch to Hindi)"
        aria-pressed={currentLanguage === 'hi'}
        className={`px-2 py-1 rounded-lg font-medium transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
          currentLanguage === 'hi'
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-xs'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        हिन्दी
      </button>
    </div>
  );
};
