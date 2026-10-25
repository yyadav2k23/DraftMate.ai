import React, { useState, useEffect, useRef } from 'react';
import { VoiceAssistantService, VoiceCapabilities } from '../../services/voiceAssistant';
import { VoiceAssistantMessage } from '../../types';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  ShieldAlert,
  Info,
  Scale,
  RotateCcw,
} from 'lucide-react';

const INITIAL_MESSAGES: VoiceAssistantMessage[] = [
  {
    id: 'msg-welcome',
    sender: 'ASSISTANT',
    text: 'Hello! I am your DraftMate Legal Information Assistant. You can speak or type legal queries regarding Indian contract law, statutory demand conventions, evidence admissibility under BSA 2023, and citation verification.',
    timestamp: 'Just now',
    citationsReferenced: ['Indian Legal Framework (Central Statutes)'],
  },
];

export const VoiceAssistantView: React.FC = () => {
  const [messages, setMessages] = useState<VoiceAssistantMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [capabilities, setCapabilities] = useState<VoiceCapabilities>({
    hasSpeechRecognition: false,
    hasSpeechSynthesis: false,
    speechRecognitionEngine: 'Checking...',
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const caps = VoiceAssistantService.getCapabilities();
    setCapabilities(caps);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg: VoiceAssistantMessage = {
      id: `usr-${Date.now()}`,
      sender: 'USER',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Generate response
    setTimeout(() => {
      const response = VoiceAssistantService.generateAssistantResponse(query);
      setMessages((prev) => [...prev, response]);

      // If speech synthesis enabled and supported
      if (capabilities.hasSpeechSynthesis) {
        setIsSpeaking(true);
        VoiceAssistantService.speakText(response.text, () => {
          setIsSpeaking(false);
        });
      }
    }, 400);
  };

  const toggleListening = () => {
    if (isListening) {
      VoiceAssistantService.stopListening();
      setIsListening(false);
    } else {
      setSpeechError(null);
      const started = VoiceAssistantService.startListening(
        (transcript, isFinal) => {
          setInputText(transcript);
          if (isFinal) {
            handleSendMessage(transcript);
            VoiceAssistantService.stopListening();
            setIsListening(false);
          }
        },
        (error) => {
          setSpeechError(error);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );
      if (started) {
        setIsListening(true);
      }
    }
  };

  const toggleSpeaking = () => {
    if (isSpeaking) {
      VoiceAssistantService.stopSpeaking();
      setIsSpeaking(false);
    }
  };

  const quickQuestions = [
    'Is there a universal statutory 15-day notice period in India?',
    'What does Section 73 of the Indian Contract Act cover?',
    'Does Order XXXVII CPC apply automatically to all debt recovery?',
    'How does BSA 2023 affect electronic evidence certificates?',
    'Explain the Aster vs Northstar payment contradiction.',
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 shadow-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Voice & Conversational Intelligence
          </span>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Audio Processing:</span>
            <span className="text-emerald-400">Local Browser / Device</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          Voice Legal Information Assistant
        </h1>
        <p className="text-xs text-slate-400">
          Inquire into Indian statutory provisions, recovery timelines, and case evidence rules using voice speech or text.
        </p>
      </div>

      {/* Honest Capability & Privacy Notice */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            Mic Support:{' '}
            <strong className="text-slate-200">
              {capabilities.hasSpeechRecognition ? 'Web Speech Active (en-IN)' : 'Unsupported in Browser (Text Chat Active)'}
            </strong>
          </span>
        </div>
        <div className="text-[11px] text-slate-500">
          Audio stream is never stored on external servers.
        </div>
      </div>

      {speechError && (
        <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center justify-between">
          <span>{speechError}</span>
          <button
            onClick={() => setSpeechError(null)}
            className="text-xs text-red-300 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Chat Messages Container */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 min-h-[420px] flex flex-col justify-between">
        <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2">
          {messages.map((msg) => {
            const isUser = msg.sender === 'USER';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed space-y-2 shadow-md ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Citations referenced badge */}
                  {msg.citationsReferenced && msg.citationsReferenced.length > 0 && (
                    <div className="pt-2 border-t border-slate-700/60 flex flex-wrap gap-1.5 text-[10px]">
                      {msg.citationsReferenced.map((c, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-slate-900 text-indigo-300 border border-indigo-500/30 font-mono"
                        >
                          § {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 px-1 font-mono">
                  {msg.timestamp}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Quick Inquiries:
          </div>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar with Mic Control */}
        <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
          {/* Microphone toggle button */}
          <button
            onClick={toggleListening}
            className={`p-3 rounded-xl border transition-all ${
              isListening
                ? 'bg-red-600 border-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            title={isListening ? 'Stop recording audio' : 'Speak via microphone (Web Speech API)'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={
              isListening
                ? 'Listening to your speech in en-IN...'
                : 'Ask a legal question or discuss document facts...'
            }
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />

          {/* Speaker stop button if audio speaking */}
          {isSpeaking && (
            <button
              onClick={toggleSpeaking}
              className="p-3 rounded-xl bg-purple-900/60 border border-purple-500/40 text-purple-200 hover:bg-purple-800 transition-colors"
              title="Stop voice readout"
            >
              <VolumeX className="w-4 h-4" />
            </button>
          )}

          {/* Send text button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim()}
            className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-colors shadow-md"
            title="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Statutory Legal Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-200/90 leading-relaxed">
          <strong>Mandatory Notice: </strong>
          The Voice Assistant provides legal information and research context only, not legal representation. It is not an attorney and does not create an attorney-client relationship. All formal notices and court filings must be reviewed by an advocate licensed under the Advocates Act, 1961.
        </div>
      </div>
    </div>
  );
};
