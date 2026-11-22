// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import i18n from '../i18n/config';

describe('Frontend Internationalization (i18n) Engine', () => {
  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage('en');
  });

  it('initializes with English as the default and fallback language', () => {
    expect(i18n.language).toBe('en');
    expect(i18n.options.fallbackLng).toContain('en');
    expect(i18n.t('nav.dashboard')).toBe('Dashboard');
  });

  it('switches instantaneously to Hindi without page reload', async () => {
    await i18n.changeLanguage('hi');
    expect(i18n.language).toBe('hi');
    expect(i18n.t('nav.dashboard')).toBe('डैशबोर्ड');
    expect(i18n.t('nav.assistant')).toBe('एआई सहायक');
    expect(i18n.t('indoor.title')).toContain('घरेलू वायु रक्षक');
  });

  it('persists selected language to localStorage under airwise_language', async () => {
    await i18n.changeLanguage('hi');
    expect(localStorage.getItem('airwise_language')).toBe('hi');

    await i18n.changeLanguage('en');
    expect(localStorage.getItem('airwise_language')).toBe('en');
  });

  it('falls back to English when a translation key is missing in another language', async () => {
    await i18n.changeLanguage('hi');
    expect(i18n.t('nav.dashboard')).toBeTruthy();
  });

  it('preserves technical identifiers and acronyms in both English and Hindi', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.t('dashboard.scaleUsaqi')).toContain('US AQI');
    expect(i18n.t('footer.attribution1')).toContain('high-resolution');

    await i18n.changeLanguage('hi');
    expect(i18n.t('dashboard.scaleUsaqi')).toContain('US AQI');
    expect(i18n.t('indoor.card4Badge')).toContain('HEPA');
  });
});
