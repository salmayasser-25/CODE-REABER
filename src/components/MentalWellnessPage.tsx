import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Heart, 
  Wind, 
  Smile, 
  Headphones, 
  ShieldCheck,
  RefreshCw,
  Compass
} from 'lucide-react';
import { ChatMessage, AstronautProfile } from '../types/astronaut.ts';



// 3D Sketchfab Astronaut Avatar Embed
function AvatarViewer() {
  return (
    <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden bg-gradient-to-b from-[#140b2e]/80 to-[#070514]/90 border border-purple-500/40 shadow-[0_0_35px_rgba(168,85,247,0.25)]">
      {/* Floating 3D HUD Reticle */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-950/80 border border-purple-500/40 text-purple-300 font-mono text-xs font-bold shadow-[0_0_12px_rgba(168,85,247,0.3)]">
        <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
        <span>ASTRO AVATAR // IDLE SYNTHESIS</span>
      </div>

      <div className="absolute bottom-3 right-3 z-10 text-[11px] font-mono text-purple-300/80 bg-purple-950/70 px-2.5 py-1 rounded border border-purple-800">
        DRAG TO ROTATE &middot; SCROLL TO ZOOM
      </div>

      <iframe
        title="Astronaut head woman"
        className="w-full h-full border-0"
        allow="autoplay; fullscreen; xr-spatial-tracking"
        src="https://sketchfab.com/models/6738004b11b54a57b74765950375d0f2/embed?preload=1&transparent=1&ui_theme=dark"
      />
    </div>
  );
}
// 4-4-4-4 Box Breathing Widget
function BreathingExerciseWidget() {
  const [phase, setPhase] = useState<'Inhale' | 'Hold (Full)' | 'Exhale' | 'Hold (Empty)'>('Inhale');
  const [secondsLeft, setSecondsLeft] = useState<number>(4);
  const [cyclesCompleted, setCyclesCompleted] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false); // Requirement: START/STOP only when user clicks button. Do not auto-start.
  const [isAudioGuided, setIsAudioGuided] = useState<boolean>(true);

  // Audio Guidance using Web Speech API
  const speakInstruction = (text: string) => {
    if (!isAudioGuided || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 0.95;
      utterance.rate = 0.85; // Slow, soothing cadence
      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech synthesis error catch
    }
  };

  // Trigger speech on phase changes when active
  const advancePhase = () => {
    setPhase((current) => {
      let next: 'Inhale' | 'Hold (Full)' | 'Exhale' | 'Hold (Empty)';
      let speechWord = 'Inhale';

      if (current === 'Inhale') {
        next = 'Hold (Full)';
        speechWord = 'Hold';
      } else if (current === 'Hold (Full)') {
        next = 'Exhale';
        speechWord = 'Exhale';
      } else if (current === 'Exhale') {
        next = 'Hold (Empty)';
        speechWord = 'Hold';
      } else {
        setCyclesCompleted((c) => c + 1);
        next = 'Inhale';
        speechWord = 'Inhale';
      }

      speakInstruction(speechWord);
      return next;
    });
  };

  useEffect(() => {
    if (!isActive) return;

    // Speak initial phase when exercise starts
    speakInstruction(phase === 'Inhale' ? 'Inhale' : phase.startsWith('Hold') ? 'Hold' : 'Exhale');

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          advancePhase();
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isActive]);

  const toggleExercise = () => {
    if (isActive) {
      setIsActive(false);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } else {
      setIsActive(true);
      setSecondsLeft(4);
      setPhase('Inhale');
    }
  };

  const isExpanding = phase === 'Inhale' || phase === 'Hold (Full)';

  return (
    <div className="glass-panel glass-panel-glow-purple p-6 rounded-2xl border border-purple-500/40 shadow-[0_0_35px_rgba(168,85,247,0.22)] space-y-4">
      {/* Widget Header */}
      <div className="flex items-center justify-between pb-3 border-b border-purple-900/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40">
            <Wind className="w-5 h-5 text-purple-300" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-['Chakra_Petch',sans-serif] tracking-wide">
              Neuro-Regulative Box Breathing
            </h3>
            <p className="text-xs text-purple-200">
              4-4-4-4 Autonomic Nervous System Pacer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Guidance Toggle */}
          <button
            type="button"
            onClick={() => setIsAudioGuided((prev) => !prev)}
            title={isAudioGuided ? 'Voice guidance active' : 'Voice guidance muted'}
            className={`p-1.5 rounded-lg border text-xs font-mono transition-colors ${
              isAudioGuided
                ? 'bg-purple-600/30 text-purple-200 border-purple-400/50'
                : 'bg-purple-950/40 text-purple-400 border-purple-900/50'
            }`}
          >
            {isAudioGuided ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Explicit START / STOP button (Requirement: Do not auto-start) */}
          <button
            type="button"
            onClick={toggleExercise}
            className={`px-4 py-1.5 rounded-xl text-xs font-mono font-extrabold tracking-wider transition-all cursor-pointer shadow-md ${
              isActive
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]'
            }`}
          >
            {isActive ? 'STOP EXERCISE' : 'START EXERCISE'}
          </button>
        </div>
      </div>

      {/* Required Note Banner */}
      <div className="px-3.5 py-2 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-200 text-xs font-sans flex items-center gap-2 shadow-inner">
        <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
        <span>
          <strong className="text-white">Clinical Note:</strong> Use this during moments of high stress or before sleep.
        </span>
      </div>

      {/* Visual Expanding / Contracting Breathing Circle synced with Audio */}
      <div className="flex flex-col items-center justify-center py-5">
        <div className="relative flex items-center justify-center w-48 h-48 sm:w-56 sm:h-56">
          {/* Outer glowing pulsing corona */}
          <div
            className={`absolute rounded-full transition-all duration-[3800ms] ease-in-out border border-purple-400/40 ${
              isActive && isExpanding
                ? 'w-48 h-48 sm:w-56 sm:h-56 bg-purple-600/25 shadow-[0_0_45px_rgba(168,85,247,0.5)] scale-100'
                : isActive
                ? 'w-24 h-24 sm:w-28 sm:h-28 bg-purple-600/10 shadow-[0_0_20px_rgba(168,85,247,0.25)] scale-90'
                : 'w-32 h-32 bg-purple-900/10 border-purple-800/40 scale-95 opacity-50'
            }`}
          />

          {/* Inner core circle */}
          <div
            className={`relative z-10 flex flex-col items-center justify-center rounded-full transition-all duration-[3800ms] ease-in-out border-2 border-purple-300 bg-gradient-to-br from-purple-900/90 to-[#140b2e]/95 text-white shadow-xl ${
              isActive && isExpanding ? 'w-36 h-36 sm:w-44 sm:h-44' : 'w-26 h-26 sm:w-30 sm:h-30'
            }`}
          >
            <span className="text-sm sm:text-base font-bold font-mono tracking-wider text-purple-200 uppercase text-center px-2">
              {isActive ? phase : 'READY'}
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-white mt-1 tabular-nums">
              {isActive ? `${secondsLeft}s` : '4-4-4-4'}
            </span>
          </div>
        </div>

        <div className="mt-4 text-xs font-mono text-purple-300 text-center space-y-1">
          <div>
            {isActive ? (
              <>
                Cycles Completed: <strong className="text-white">{cyclesCompleted}</strong> · Parasympathetic Coherence
              </>
            ) : (
              <span className="text-purple-300">Click START EXERCISE to begin audio-guided box breathing</span>
            )}
          </div>
          <div className="text-purple-400 text-[11px]">
            Inhale (4s) → Hold (4s) → Exhale (4s) → Hold (4s)
          </div>
        </div>
      </div>
    </div>
  );
}

interface MentalWellnessPageProps {
  profile: AstronautProfile;
}

export const MentalWellnessPage: React.FC<MentalWellnessPageProps> = ({ profile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      role: 'assistant',
      content: `Hello Dr. Salma. I'm ASTRO, your dedicated clinical mental health companion for Expedition 74. We are 84 days into your mission. How are you feeling in the quiet of the station today?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);
  const [hasSpeechRecognition, setHasSpeechRecognition] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Check Web Speech API SpeechRecognition availability on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setHasSpeechRecognition(Boolean(SpeechRec));
    }
  }, []);

  // Cleanup speech synthesis and recognition on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  // Auto-scroll chat on new messages or thinking state
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  // Voice speech synthesis (Text-to-Speech)
  const speakMessage = (text: string) => {
    if (!isVoiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1.05;
      utterance.rate = 0.95; // Gentle, empathetic cadence
      window.speechSynthesis.speak(utterance);
    } catch {
      // SpeechSynthesis error catch
    }
  };

  // Toggle Voice Output ON/OFF
  const handleToggleVoice = () => {
    setIsVoiceEnabled((prev) => {
      const next = !prev;
      if (!next && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return next;
    });
  };

  // Web Speech API Microphone Dictation (Speech-to-Text)
  const startListening = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }

      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        const text = (finalTranscript || interim).trim();
        if (text) {
          setInputMessage(text);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('SpeechRecognition error:', e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Send message to Gemini ASTRO backend API route
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isSending) return;

    // Stop listening if user hits send while mic was on
    if (isListening) {
      stopListening();
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsSending(true);

    // Format chat history for multi-turn Gemini context
    const historyPayload = messages.slice(-8).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await fetch('/api/chat/astro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text,
          history: historyPayload,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success && json.reply) {
        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: json.reply,
          timestamp: new Date().toISOString(),
        };
        // Display AI response text in chat bubble at the same time it is spoken
        setMessages((prev) => [...prev, assistantMsg]);
        speakMessage(json.reply);
        return;
      }
      throw new Error(json.error || 'ASTRO is currently unavailable. Please try again later.');
    } catch (err: any) {
      const errorMsg = 'ASTRO is currently unavailable. Please try again later.';
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: errorMsg,
          timestamp: new Date().toISOString(),
        },
      ]);
      speakMessage(errorMsg);
    } finally {
      setIsSending(false);
    }
  };

  const quickPrompts = [
    'Feeling homesick after 84 days in LEO',
    'Struggling with sleep cycle in microgravity',
    'Guide me through a quick grounding mindfulness exercise',
  ];

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      {/* Top Banner with Violet / Calming Theme */}
      <div className="glass-panel glass-panel-glow-purple p-6 sm:p-7 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-purple-500/40 shadow-[0_0_35px_rgba(168,85,247,0.25)] bg-[#100a26]/85">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/50 flex items-center justify-center text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.35)] shrink-0">
            <Headphones className="w-7 h-7 text-purple-300" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Chakra_Petch',sans-serif] tracking-wide">
                Mental Wellness & Cognitive Resilience
              </h1>
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-purple-500/25 border border-purple-400/50 text-purple-200">
                AI THERAPIST "ASTRO"
              </span>
            </div>
            <p className="text-sm font-sans text-purple-200 mt-1">
              Confidential, empathetic spaceflight psychological companion and autonomic regulation for <strong className="text-white">{profile.name}</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Voice ON/OFF Toggle (Web Speech API Text-to-Speech) */}
          <button
            type="button"
            onClick={handleToggleVoice}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
              isVoiceEnabled
                ? 'bg-purple-600 text-white shadow-[0_0_18px_#9333ea]'
                : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-white'
            }`}
            title="Toggle ASTRO Voice Output (Web Speech API)"
          >
            {isVoiceEnabled ? <Volume2 className="w-4 h-4 text-white" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span>VOICE {isVoiceEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Column (3D Avatar + Box Breathing) & Right Column (AI Chat) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Left Column (5 Cols): 3D Avatar & Breathing Exercise */}
        <div className="lg:col-span-5 space-y-6">
          {/* 3D Avatar Viewer */}
          <AvatarViewer />

          {/* Breathing Exercise Widget */}
          <BreathingExerciseWidget />
        </div>

        {/* Right Column (7 Cols): AI Chat Interface (Gemini Live / Speech) */}
        <div className="lg:col-span-7 flex flex-col h-[650px] glass-panel glass-panel-glow-purple rounded-2xl border border-purple-500/40 shadow-[0_0_35px_rgba(168,85,247,0.22)] overflow-hidden bg-[#0d0920]/90">
          {/* Chat Header */}
          <div className="p-4 sm:p-5 border-b border-purple-900/60 bg-[#130b2c]/80 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-400/60 flex items-center justify-center text-purple-200 font-bold font-mono">
                  AS
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black shadow-[0_0_8px_#10b981]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base font-['Chakra_Petch',sans-serif]">
                    ASTRO Mental Companion
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 border border-purple-500/40">
                    GROQ AI ONLINE
                  </span>


                </div>
                <div className="text-xs text-purple-200 font-sans">
                  Encrypted Astronaut Cabin Channel · Empathetic CBT & Stress Support
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
                setMessages([
                  {
                    id: 'msg-reset',
                    role: 'assistant',
                    content: `Channel refreshed, Dr. Salma. I am right here whenever you'd like to share what's on your mind.`,
                    timestamp: new Date().toISOString(),
                  },
                ]);
              }}
              title="Reset conversation"
              className="p-2 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompts Strip */}
          <div className="px-4 py-2 bg-purple-950/40 border-b border-purple-900/40 flex items-center gap-2 overflow-x-auto text-xs font-mono shrink-0">
            <span className="text-purple-400 font-bold shrink-0">STARTERS:</span>
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                disabled={isSending}
                className="px-2.5 py-1 rounded bg-purple-900/40 hover:bg-purple-800/60 border border-purple-700/60 text-purple-200 shrink-0 transition-colors text-[11px] cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Stream - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                      isUser
                        ? 'bg-[#00E5FF] text-black shadow-[0_0_12px_#00E5FF]'
                        : 'bg-purple-600 text-white shadow-[0_0_12px_#9333ea]'
                    }`}
                  >
                    {isUser ? 'SJ' : 'AI'}
                  </div>

                  <div
                    className={`max-w-[82%] rounded-2xl p-4 text-sm font-sans leading-relaxed ${
                      isUser
                        ? 'bg-[#00E5FF]/15 border border-[#00E5FF]/40 text-white shadow-[0_0_18px_rgba(0,229,255,0.15)] rounded-tr-none'
                        : 'bg-purple-950/70 border border-purple-500/40 text-purple-50 shadow-[0_0_18px_rgba(168,85,247,0.15)] rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <div
                      className={`mt-1.5 text-[10px] font-mono text-right ${
                        isUser ? 'text-cyan-300' : 'text-purple-300'
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Thinking... Indicator (Typing dots) */}
            {isSending && (
              <div className="flex items-start gap-3 flex-row animate-in fade-in duration-200">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 bg-purple-600 text-white shadow-[0_0_12px_#9333ea]">
                  AI
                </div>
                <div className="p-3.5 px-4 rounded-2xl bg-purple-950/70 border border-purple-500/40 text-purple-200 rounded-tl-none shadow-[0_0_18px_rgba(168,85,247,0.15)] flex items-center gap-3">
                  <div className="flex items-center gap-1.5 py-0.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
                  </div>
                  <span className="text-xs font-mono text-purple-200 tracking-wide">ASTRO is thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Active Voice Listening Status Strip */}
          {isListening && (
            <div className="px-4 py-2 bg-rose-950/80 border-t border-rose-500/50 flex items-center justify-between text-xs font-mono text-rose-200 shrink-0 animate-in fade-in">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="font-bold">LISTENING VIA MICROPHONE...</span>
                <span className="text-rose-300 text-[11px] hidden sm:inline">Speak naturally into your device</span>
              </div>
              <button
                type="button"
                onClick={stopListening}
                className="px-2 py-0.5 rounded bg-rose-900/60 hover:bg-rose-800 text-white font-bold text-[10px] border border-rose-400/50"
              >
                DONE SPEAKING
              </button>
            </div>
          )}

          {/* Chat Input Bar - Fixed at Bottom */}
          <div className="p-4 border-t border-purple-900/60 bg-[#130b2c]/90 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2.5"
            >
              {/* Mic Speech-to-Text Button OR Fallback Note */}
              {hasSpeechRecognition ? (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-600 text-white border-rose-400 animate-pulse ring-4 ring-rose-500/50 shadow-[0_0_25px_#f43f5e]'
                      : 'bg-purple-900/40 text-purple-200 border-purple-600/50 hover:bg-purple-800/50'
                  }`}
                  title={isListening ? 'Listening... click to stop' : 'Click to speak via microphone (Speech-to-Text)'}
                >
                  {isListening ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5" />}
                </button>
              ) : (
                <div
                  className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/60 text-purple-400 text-[11px] font-mono hidden sm:flex items-center"
                  title="Voice input is not supported in this browser."
                >
                  Voice input is not supported in this browser.
                </div>
              )}

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={isListening ? 'Listening to your voice...' : 'Type your thoughts or feelings to ASTRO...'}
                disabled={isSending}
                className="flex-1 bg-purple-950/80 border border-purple-500/50 text-white placeholder-purple-300/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-sans"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim() || isSending}
                className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-sm flex items-center gap-1.5 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">SEND</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
