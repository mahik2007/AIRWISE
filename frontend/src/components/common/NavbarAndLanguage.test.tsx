// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Navbar } from './Navbar';
import { LanguageSelector } from './LanguageSelector';
import i18n from '../../i18n/config';

describe('Navbar Component Accessibility & Navigation', () => {
  const mockSetActiveTab = vi.fn();
  const mockSelectCity = vi.fn();

  beforeEach(async () => {
    mockSetActiveTab.mockClear();
    mockSelectCity.mockClear();
    await i18n.changeLanguage('en');
    document.body.innerHTML = '';
  });

  it('renders brand heading and navigates to landing on click', () => {
    render(
      <Navbar
        activeTab="dashboard"
        setActiveTab={mockSetActiveTab}
        selectedCity="Delhi"
        onSelectCity={mockSelectCity}
      />
    );

    const homeBtn = screen.getByRole('button', { name: /AIRWISE Home/i });
    expect(homeBtn).toBeDefined();
    fireEvent.click(homeBtn);
    expect(mockSetActiveTab).toHaveBeenCalledWith('landing');
  });

  it('renders all main navigation items with proper accessible attributes', () => {
    render(
      <Navbar
        activeTab="dashboard"
        setActiveTab={mockSetActiveTab}
        selectedCity="Delhi"
      />
    );

    const dashboardBtn = screen.getByRole('button', { name: /Dashboard/i });
    expect(dashboardBtn.getAttribute('aria-current')).toBe('page');

    const assistantBtn = screen.getByRole('button', { name: /AI Assistant/i });
    expect(assistantBtn.getAttribute('aria-current')).toBeNull();

    fireEvent.click(assistantBtn);
    expect(mockSetActiveTab).toHaveBeenCalledWith('assistant');
  });

  it('opens and closes location search dialog when clicking city button', () => {
    render(
      <Navbar
        activeTab="dashboard"
        setActiveTab={mockSetActiveTab}
        selectedCity="Delhi"
        onSelectCity={mockSelectCity}
      />
    );

    const cityBtn = screen.getByTitle(/Click to change city/i);
    expect(cityBtn.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(cityBtn);
    expect(cityBtn.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('dialog', { name: /Location search dialog/i })).toBeDefined();

    fireEvent.click(cityBtn);
    expect(cityBtn.getAttribute('aria-expanded')).toBe('false');
  });

  it('toggles mobile navigation menu on hamburger click', () => {
    render(
      <Navbar
        activeTab="dashboard"
        setActiveTab={mockSetActiveTab}
        selectedCity="Delhi"
      />
    );

    const menuBtn = screen.getByRole('button', { name: /Open mobile menu/i });
    expect(menuBtn.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(menuBtn);
    expect(screen.getByRole('navigation', { name: /Mobile Navigation/i })).toBeDefined();
  });
});

describe('LanguageSelector Accessibility & Screen Reader Announcements', () => {
  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage('en');
    document.body.innerHTML = '<div id="a11y-announcements" role="status"></div>';
  });

  it('renders English and Hindi toggles with correct aria-pressed state', () => {
    render(<LanguageSelector />);

    const enBtn = screen.getByRole('button', { name: /^Switch to English$/i });
    const hiBtn = screen.getByRole('button', { name: /Switch to Hindi/i });

    expect(enBtn.getAttribute('aria-pressed')).toBe('true');
    expect(hiBtn.getAttribute('aria-pressed')).toBe('false');
  });

  it('switches to Hindi on click and updates aria-pressed and announcement live region', async () => {
    render(<LanguageSelector />);

    const hiBtn = screen.getByRole('button', { name: /Switch to Hindi/i });
    fireEvent.click(hiBtn);

    expect(hiBtn.getAttribute('aria-pressed')).toBe('true');
    expect(localStorage.getItem('airwise_language')).toBe('hi');

    const announcer = document.getElementById('a11y-announcements');
    expect(announcer?.textContent).toContain('भाषा बदलकर हिन्दी कर दी गई है।');
  });
});
