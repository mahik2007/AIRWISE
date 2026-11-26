// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AIAssistant } from './AIAssistant';
import * as api from '../../services/api';
import i18n from '../../i18n/config';

describe('AIAssistant Component Forms & Accessibility', () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    await i18n.changeLanguage('en');
    document.body.innerHTML = '';
  });

  it('renders accessible persona switcher with proper label association', () => {
    render(<AIAssistant />);

    const label = screen.getByText(/Personalize advice for your persona:/i);
    expect(label).toBeDefined();

    const select = screen.getByLabelText(/Personalize advice for your persona:/i);
    expect(select).toBeDefined();
    expect((select as HTMLSelectElement).value).toBe('general');

    fireEvent.change(select, { target: { value: 'student' } });
    expect((select as HTMLSelectElement).value).toBe('student');
  });

  it('submits query form and renders structured 5-field response accessibly', async () => {
    const mockResponse = {
      recommendation: 'Use N95 respirator during commute.',
      whyItMatters: 'Fine PM2.5 levels are elevated.',
      practicalSteps: ['Check AQI before leaving.', 'Ensure snug fit on face.'],
      expectedBenefit: 'Reduces inhaled particle load by 95%.',
      relevantLimitations: 'Does not filter gaseous pollutants like CO.',
    };

    vi.spyOn(api, 'sendChatMessage').mockResolvedValue(mockResponse);

    render(<AIAssistant />);

    const input = screen.getByRole('textbox', { name: /Ask anything about smog protection/i });
    fireEvent.change(input, { target: { value: 'Should I wear a mask today?' } });

    const sendBtn = screen.getByRole('button', { name: /Send/i });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(screen.getByText(/Use N95 respirator during commute/i)).toBeDefined();
      expect(screen.getByText(/Reduces inhaled particle load by 95%/i)).toBeDefined();
    });
  });

  it('handles network failure gracefully and renders accessible error fallback', async () => {
    vi.spyOn(api, 'sendChatMessage').mockRejectedValue(new Error('Network failure'));

    render(<AIAssistant />);

    const input = screen.getByRole('textbox', { name: /Ask anything about smog protection/i });
    fireEvent.change(input, { target: { value: 'Is it safe to run?' } });

    const sendBtn = screen.getByRole('button', { name: /Send/i });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(screen.getByText(/Unable to connect to the assistant service right now/i)).toBeDefined();
    });
  });
});
