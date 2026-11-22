import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import hi from './locales/hi.json';

const LANGUAGE_KEY = 'airwise_language';

// Retrieve saved language from localStorage, default to 'en'
const getInitialLanguage = (): string => {
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (saved && (saved === 'en' || saved === 'hi')) {
      return saved;
    }
  } catch {
    // ignore localStorage errors in sandboxed environments
  }
  return 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
    },
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

// Listen to language change and persist in localStorage
i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem(LANGUAGE_KEY, lng);
    document.documentElement.lang = lng;
  } catch {
    // ignore localStorage errors
  }
});

// Set initial document language
if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.language || 'en';
}

export default i18n;
export { LANGUAGE_KEY };
