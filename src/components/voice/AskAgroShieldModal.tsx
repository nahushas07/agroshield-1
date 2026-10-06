import React, { useState, useEffect, useRef } from 'react';
import {
  VoiceMessage,
  FieldData,
  CurrentWeather,
  RunoffCalculation,
  SoilTestReport,
  GeoCoordinates,
} from '../../types';
import { voiceAssistantService } from '../../services/voiceAssistantService';
import { AgroShieldLogo } from '../brand/AgroShieldLogo';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Send,
  Sparkles,
  RotateCcw,
  Languages,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';

interface AskAgroShieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  fieldData: FieldData;
  weatherData: CurrentWeather;
  runoffData: RunoffCalculation;
  soilReport: SoilTestReport;
  locationData: GeoCoordinates | null;
}

export const AskAgroShieldModal: React.FC<AskAgroShieldModalProps> = ({
  isOpen,
  onClose,
  fieldData,
  weatherData,
  runoffData,
  soilReport,
  locationData,
}) => {
  const [messages, setMessages] = useState<VoiceMessage[]>([
    {
      id: 'msg-0',
      sender: 'assistant',
      text: 'Namaskara! I am AgroShield. I monitor your field conditions, weather, and runoff risk in real time. How can I help you today?',
      language: 'en',
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [language, setLanguage] = useState<'en' | 'kn' | 'hi'>('en');
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [interimText, setInterimText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    voiceAssistantService.setLanguage(language);
  }, [language]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, interimText, voiceState]);

  if (!isOpen) return null;

  const quickPrompts = [
    { text: 'Is it going to rain today?', label: 'Rain forecast' },
    { text: 'Is now a good time to apply fertilizer?', label: 'Fertilizer window' },
    { text: 'What is my runoff risk?', label: 'Runoff risk' },
    { text: 'What is my soil pH?', label: 'Soil test pH' },
    { text: 'Where is my field?', label: 'Field location' },
    { text: 'What should I do today?', label: 'Daily advisory' },
  ];

  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim()) return;

    setErrorMsg(null);
    setInterimText('');
    voiceAssistantService.stopListening();
    voiceAssistantService.stopSpeaking();

    const userMsg: VoiceMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: promptText,
      language,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setVoiceState('processing');

    const result = await voiceAssistantService.askAssistant(
      promptText,
      {
        fieldData,
        weatherData,
        runoffData,
        soilReport,
        locationData,
      },
      messages
    );

    const botMsg: VoiceMessage = {
      id: `bot-${Date.now()}`,
      sender: 'assistant',
      text: result.reply,
      language,
      timestamp: Date.now(),
      toolCallName: result.toolUsed,
      toolOutputSnippet: result.grounded ? 'Grounded in AgroShield real field telemetry' : undefined,
    };

    setMessages((prev) => [...prev, botMsg]);

    if (!isAudioMuted) {
      setVoiceState('speaking');
      voiceAssistantService.speakResponse(result.reply, () => {
        setVoiceState('idle');
      });
    } else {
      setVoiceState('idle');
    }
  };

  const handleToggleVoice = () => {
    if (voiceState === 'listening') {
      voiceAssistantService.stopListening();
      setVoiceState('idle');
    } else {
      voiceAssistantService.stopSpeaking();
      setErrorMsg(null);
      setInterimText('');
      voiceAssistantService.startListening(
        (text, isFinal) => {
          setInterimText(text);
          if (isFinal) {
            handleSendPrompt(text);
          }
        },
        (err) => {
          setErrorMsg(err);
          setVoiceState('idle');
        },
        (state) => {
          setVoiceState(state);
        }
      );
    }
  };

  const handleStopSpeech = () => {
    voiceAssistantService.stopSpeaking();
    setVoiceState('idle');
  };

  const stateLabels = {
    idle: 'Tap microphone to speak',
    listening: 'Listening to your voice...',
    processing: 'Checking your field data & runoff model...',
    speaking: 'AgroShield says...',
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl h-[90vh] max-h-[720px] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <AgroShieldLogo size="sm" showSubtitle={false} />
            <span className="text-xs font-bold text-slate-700 bg-emerald-100/80 text-emerald-900 px-2.5 py-0.5 rounded-full">
              Voice Assistant
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded transition-colors ${
                  language === 'en' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('kn')}
                className={`px-2 py-1 rounded transition-colors ${
                  language === 'kn' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ಕನ್ನಡ
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-2 py-1 rounded transition-colors ${
                  language === 'hi' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                हिंदी
              </button>
            </div>

            {/* Mute toggle */}
            <button
              type="button"
              onClick={() => {
                if (!isAudioMuted) voiceAssistantService.stopSpeaking();
                setIsAudioMuted(!isAudioMuted);
              }}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              title={isAudioMuted ? 'Unmute speech output' : 'Mute speech output'}
            >
              {isAudioMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>

            {/* Close modal */}
            <button
              type="button"
              onClick={() => {
                voiceAssistantService.stopListening();
                voiceAssistantService.stopSpeaking();
                onClose();
              }}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Central Voice Action Station */}
        <div className="p-6 bg-gradient-to-b from-slate-50 to-white text-center flex flex-col items-center justify-center border-b border-slate-100">
          <div className="relative mb-3">
            {voiceState === 'listening' && (
              <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-60 animate-ping"></span>
            )}
            {voiceState === 'processing' && (
              <span className="absolute inset-0 rounded-full bg-sky-400 opacity-60 animate-pulse"></span>
            )}
            {voiceState === 'speaking' && (
              <span className="absolute inset-0 rounded-full bg-blue-400 opacity-40 animate-ping"></span>
            )}

            <button
              type="button"
              onClick={handleToggleVoice}
              className={`relative z-10 h-16 w-16 sm:h-20 sm:w-20 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${
                voiceState === 'listening'
                  ? 'bg-rose-600'
                  : voiceState === 'processing'
                  ? 'bg-sky-600'
                  : voiceState === 'speaking'
                  ? 'bg-blue-600'
                  : 'bg-emerald-700 hover:bg-emerald-800'
              }`}
            >
              {voiceState === 'listening' ? (
                <MicOff className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </button>
          </div>

          <div className="text-xs sm:text-sm font-bold text-slate-800">
            {stateLabels[voiceState]}
          </div>

          {interimText && (
            <div className="mt-2 text-xs text-slate-600 italic max-w-md px-4 py-1 bg-white rounded-full border border-slate-200">
              &ldquo;{interimText}&rdquo;
            </div>
          )}

          {voiceState === 'speaking' && (
            <button
              type="button"
              onClick={handleStopSpeech}
              className="mt-2 text-[11px] font-bold text-blue-700 hover:underline"
            >
              Interrupt / Stop Speaking
            </button>
          )}

          {errorMsg && (
            <div className="mt-2 text-xs text-rose-600 font-medium">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Conversation Transcript Area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/40"
        >
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-emerald-700 text-white rounded-br-xs'
                      : 'bg-white text-slate-900 border border-slate-200 shadow-xs rounded-bl-xs'
                  }`}
                >
                  <p>{m.text}</p>

                  {m.toolCallName && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                      <span>Tool: {m.toolCallName}</span>
                      <span className="text-emerald-700">Real Field Telemetry</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="p-3 bg-white border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendPrompt(qp.text)}
                className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Text Input Row */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt(inputText);
            }}
            className="flex items-center gap-2 mt-2"
          >
            <input
              type="text"
              placeholder={
                language === 'kn'
                  ? 'ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ...'
                  : language === 'hi'
                  ? 'प्रश्न यहाँ लिखें...'
                  : 'Ask about weather, soil, runoff risk...'
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-emerald-600"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
