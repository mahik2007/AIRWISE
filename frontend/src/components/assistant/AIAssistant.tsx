import React, { useState } from 'react';
import { 
  Bot, Send, User, Sparkles, AlertCircle, CheckCircle2, 
  HelpCircle, ShieldAlert, CornerDownRight, Loader2 
} from 'lucide-react';
import { sendChatMessage } from '../../services/api';
import { AirQualityPayload, ChatMessage, ChatRecommendationResponse } from '../../types';

interface AIAssistantProps {
  airQualityData?: AirQualityPayload;
  defaultPrompt?: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ airQualityData, defaultPrompt }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      recommendation: {
        recommendation: `Hello! I am your AIRWISE urban air quality and sustainable routine guide. I am actively grounded in live atmospheric conditions for ${airQualityData?.location.name || 'your area'}.`,
        whyItMatters: 'Fine particulate pollution (PM2.5) directly correlates with cardiovascular strain and respiratory airway inflammation during high-smog periods.',
        practicalSteps: [
          'Ask me about the best hours for outdoor exercise.',
          'Get indoor air purification and ventilation hacks.',
          'Explore low-emission transit alternatives for your daily commute.',
        ],
        expectedBenefit: 'Informed daily behavioral adjustments can reduce personal smog exposure by up to 60-80%.',
        relevantLimitations: 'Guidance is informational and protective. Please consult medical doctors for clinical health treatments.',
      },
      timestamp: new Date().toISOString(),
    },
  ]);

  const [input, setInput] = useState(defaultPrompt || '');
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<'student' | 'working_professional' | 'homemaker' | 'caregiver' | 'general'>('general');

  const suggestedPrompts = [
    'Is it safe to go for a morning run today?',
    'How can I protect my children during severe winter smog?',
    'What is the best time to ventilate my home today?',
    'Suggest a low-emission commute to work.',
    'Do indoor plants actually remove PM2.5 or should I get a HEPA filter?',
  ];

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendChatMessage({
        message: userMsg.content || '',
        location: airQualityData ? {
          name: airQualityData.location.name,
          latitude: airQualityData.location.latitude,
          longitude: airQualityData.location.longitude,
          country: airQualityData.location.country,
        } : undefined,
        airQuality: airQualityData ? {
          usAqi: airQualityData.current.usAqi,
          usAqiCategory: airQualityData.current.usAqiCategory,
          europeanAqi: airQualityData.current.europeanAqi,
          pm2_5: airQualityData.current.pm2_5.value,
          pm10: airQualityData.current.pm10.value,
          nitrogenDioxide: airQualityData.current.nitrogenDioxide.value,
          dataSource: airQualityData.current.dataSource,
          isObservedStation: airQualityData.current.isObservedStation,
        } : undefined,
        lifestyle: {
          userRole,
          hasVulnerableFamilyMembers: userRole === 'caregiver',
          indoorPurifierAvailable: true,
        },
      });

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        recommendation: response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      const fallbackMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'Unable to connect to the assistant service right now. Please check your network or backend connection.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-3xl bg-[#0f1d16] border border-[#1e3828] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-100">AIRWISE Intelligence Assistant</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Grounded in active data for{' '}
            <strong className="text-emerald-300">
              {airQualityData?.location.name || 'Selected City'} (US AQI: {airQualityData?.current.usAqi ?? 'N/A'})
            </strong>
          </p>
        </div>

        {/* Persona Switcher */}
        <div className="flex items-center space-x-2 bg-[#14261c] p-1.5 rounded-xl border border-[#213e2c]">
          <span className="text-[11px] text-slate-400 pl-2">Tailor for:</span>
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value as any)}
            className="bg-[#0b140f] text-xs text-emerald-300 font-medium py-1 px-2.5 rounded-lg border border-[#1c3525] focus:outline-none"
          >
            <option value="general">General Citizen</option>
            <option value="student">Student</option>
            <option value="working_professional">Working Professional</option>
            <option value="homemaker">Homemaker</option>
            <option value="caregiver">Caregiver (Elderly/Kids)</option>
          </select>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="space-y-4 min-h-[400px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-4 sm:p-5 text-sm ${
                msg.role === 'user'
                  ? 'bg-emerald-600/30 border border-emerald-500/40 text-slate-100'
                  : 'bg-[#101e16] border border-[#1e3828] text-slate-200'
              }`}
            >
              {msg.content && <p className="leading-relaxed">{msg.content}</p>}

              {msg.recommendation && (
                <div className="space-y-3.5">
                  {/* Primary Recommendation */}
                  <div className="flex items-start space-x-2 text-emerald-300 font-semibold text-sm leading-snug">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{msg.recommendation.recommendation}</span>
                  </div>

                  {/* Why it Matters */}
                  <div className="p-3 rounded-xl bg-[#14261c] border border-[#213c2c] text-xs text-slate-300 leading-relaxed">
                    <strong className="text-slate-100 block mb-1">Scientific & Atmospheric Rationale:</strong>
                    {msg.recommendation.whyItMatters}
                  </div>

                  {/* Practical Steps */}
                  {msg.recommendation.practicalSteps.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-xs font-bold text-slate-200 block">Practical Steps:</span>
                      <ul className="space-y-1.5">
                        {msg.recommendation.practicalSteps.map((step, idx) => (
                          <li key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                            <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-mono flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Expected Benefit */}
                  <div className="text-xs text-teal-300 bg-teal-950/20 p-2.5 rounded-lg border border-teal-500/20">
                    <strong className="text-teal-200">Expected Environmental / Exposure Benefit: </strong>
                    {msg.recommendation.expectedBenefit}
                  </div>

                  {/* Relevant Limitations */}
                  <div className="text-[11px] text-slate-400 flex items-start space-x-1.5 pt-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-300">Scope & Limitations: </strong>
                      {msg.recommendation.relevantLimitations}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-700/40 border border-slate-600 text-slate-200 flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-[#101e16] border border-[#1e3828] text-xs text-slate-400 flex items-center space-x-2">
              <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
              <span>Analyzing atmospheric context with Gemini 2.5...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="space-y-1.5">
        <span className="text-[11px] text-slate-500 block">Suggested queries:</span>
        <div className="flex flex-wrap gap-2">
          {suggestedPrompts.map((p) => (
            <button
              key={p}
              onClick={() => handleSend(p)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-xl bg-[#122218] hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-[#203728] transition-all text-left"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="relative">
        <textarea
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask a question about smog protection, daily routines, or low-emission choices..."
          className="w-full p-3.5 pr-20 rounded-2xl bg-[#0f1d16] border border-[#1f3a29] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all resize-none"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="absolute right-3 bottom-3.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

