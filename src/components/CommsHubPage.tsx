import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Send, 
  Mic, 
  MicOff, 
  AlertTriangle, 
  ShieldCheck, 
  Users, 
  Bot, 
  HeartHandshake, 
  Paperclip, 
  CheckCheck, 
  Globe, 
  Wifi, 
  WifiOff, 
  Sparkles, 
  Stethoscope, 
  PhoneCall, 
  Play, 
  Pause, 
  ChevronRight,
  Info,
  Activity,
  X,
  Volume2
} from 'lucide-react';
import { AstronautProfile } from '../types/astronaut.js';

interface CommsHubPageProps {
  profile: AstronautProfile;
  onSendToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

interface Message {
  id: string;
  sender: 'astronaut' | 'surgeon' | 'team' | 'family' | 'ai' | 'system';
  senderName: string;
  senderRole?: string;
  content: string;
  timestamp: string;
  isEmergency?: boolean;
  hasTelemetry?: boolean;
  telemetryData?: {
    hr: number;
    bp: string;
    spO2: number;
    spineDelta: number;
  };
  isAudio?: boolean;
  audioDuration?: string;
  translation?: {
    originalLang: string;
    translatedText: string;
  };
}

interface Channel {
  id: string;
  type: 'direct' | 'channel' | 'system';
  name: string;
  role: string;
  status: 'online' | 'members' | 'offline' | 'ready';
  statusText: string;
  avatarIcon: any;
  avatarBg: string;
  avatarBorder: string;
  unreadCount?: number;
  freqBadge: string;
}

export const CommsHubPage: React.FC<CommsHubPageProps> = ({ profile, onSendToast }) => {
  // Available channels / contacts
  const channels: Channel[] = [
    {
      id: 'dr-vance',
      type: 'direct',
      name: 'Dr. Marcus Vance, M.D.',
      role: 'Assigned Lead Flight Surgeon (JSC)',
      status: 'online',
      statusText: 'Online // Low-Latency Relay',
      avatarIcon: Stethoscope,
      avatarBg: 'bg-[#00E5FF]/20 text-[#00E5FF]',
      avatarBorder: 'border-[#00E5FF]/60',
      unreadCount: 0,
      freqBadge: 'MEDCOM-ALPHA · 248.50 MHz',
    },
    {
      id: 'medical-team',
      type: 'channel',
      name: 'Medical Team (Ground Control)',
      role: 'Mission Operations Multidisciplinary Panel',
      status: 'members',
      statusText: '3 flight surgeons online',
      avatarIcon: Users,
      avatarBg: 'bg-emerald-500/20 text-emerald-300',
      avatarBorder: 'border-emerald-500/50',
      unreadCount: 1,
      freqBadge: 'MCC-HOUSTON · CH-4',
    },
    {
      id: 'crew-support',
      type: 'channel',
      name: 'Crew Support (Family Uplink)',
      role: 'Private Crew Habitat Family Channel',
      status: 'offline',
      statusText: 'Offline · Next pass T+42m',
      avatarIcon: HeartHandshake,
      avatarBg: 'bg-rose-500/20 text-rose-300',
      avatarBorder: 'border-rose-500/50',
      unreadCount: 0,
      freqBadge: 'TDRS-WEST BUFFER',
    },
    {
      id: 'ai-astro',
      type: 'system',
      name: 'AI Health Assistant (ASTRO)',
      role: 'Autonomous Cognitive & Clinical Co-Pilot',
      status: 'ready',
      statusText: 'Ready // Neural Core Active',
      avatarIcon: Bot,
      avatarBg: 'bg-purple-500/20 text-purple-300',
      avatarBorder: 'border-purple-500/50',
      unreadCount: 0,
      freqBadge: 'ONBOARD BUS · 0ms',
    },
  ];

  const [activeChannelId, setActiveChannelId] = useState<string>('dr-vance');
  const [inputText, setInputText] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [hasSpeechRec, setHasSpeechRec] = useState<boolean>(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [isAutoTranslateOn, setIsAutoTranslateOn] = useState<boolean>(true);
  const [targetLanguage, setTargetLanguage] = useState<string>('English');
  const [isSimulatingTyping, setIsSimulatingTyping] = useState<boolean>(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initial mock message histories for each channel
  const [channelMessages, setChannelMessages] = useState<Record<string, Message[]>>({
    'dr-vance': [
      {
        id: 'vance-1',
        sender: 'surgeon',
        senderName: 'Dr. Marcus Vance, M.D.',
        senderRole: 'Lead Flight Surgeon',
        content: `Good morning, Dr. Salma. Your morning vitals pass through the TDRS satellite looked solid. Resting HR at ${profile.restingHeartRate || 58} bpm and SpO2 at ${profile.spO2Baseline || 99}%. How is the microgravity spine adaptation feeling after yesterday's ARED workout?`,
        timestamp: '08:42 MET',
      },
      {
        id: 'salma-1',
        sender: 'astronaut',
        senderName: profile.name,
        senderRole: profile.callsign,
        content: `Morning Dr. Vance. Spinal elongation is holding around +${profile.spineElongation} cm. Some mild lower lumbar tightness during sleep rack repositioning, but no acute radiculopathy. Doing the recommended stretching countermeasure.`,
        timestamp: '08:45 MET',
      },
      {
        id: 'vance-2',
        sender: 'surgeon',
        senderName: 'Dr. Marcus Vance, M.D.',
        senderRole: 'Lead Flight Surgeon',
        content: `Understood. Keep the CEVIS cycle cool-down at 60% load and maintain hydration at 2.5L daily. MedCom is monitoring your live telemetry on telemetry rack 4. Ping me directly if pain passes 3/10.`,
        timestamp: '08:48 MET',
      },
    ],
    'medical-team': [
      {
        id: 'team-1',
        sender: 'team',
        senderName: 'Bio-Telemetry Desk (JSC)',
        senderRole: 'Flight Medicine Ops',
        content: 'Expedition 74 Crew Bio-telemetry stream synchronized. Environmental radiation sensors register nominal 14.8 mSv cumulative dose. ECLSS atmosphere nominal.',
        timestamp: '07:15 MET',
      },
      {
        id: 'team-2',
        sender: 'team',
        senderName: 'Physical Countermeasures Desk',
        senderRole: 'Exercise Specialist',
        content: 'Salma, your cycle ergometer wattage target for today is 165W for 35 minutes. Pre-breathing protocol verified.',
        timestamp: '07:30 MET',
      },
    ],
    'crew-support': [
      {
        id: 'family-1',
        sender: 'family',
        senderName: 'Johnson Family Earth Terminal',
        senderRole: 'Houston Uplink',
        content: 'Hi Salma! We saw the ISS flyover right over Texas last night—it looked like a brilliant star. Everyone is so proud of you. Maya sent a short audio clip from school!',
        timestamp: 'Yesterday 21:10',
      },
      {
        id: 'family-2',
        sender: 'family',
        senderName: 'Johnson Family Earth Terminal',
        senderRole: 'Houston Uplink',
        content: 'Voice note attached: "Good luck on the bio-lab experiments today, Mom!"',
        timestamp: 'Yesterday 21:12',
        isAudio: true,
        audioDuration: '0:14',
      },
    ],
    'ai-astro': [
      {
        id: 'ai-1',
        sender: 'ai',
        senderName: 'ASTRO Intelligence',
        senderRole: 'Autonomous Onboard Companion',
        content: `Telemetry bus connected. I am tracking your autonomic stress indexes and sleep cycles. Feel free to use this channel for confidential debriefs or stress regulation pacer sessions.`,
        timestamp: '06:00 MET',
      },
    ],
  });

  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0];
  const currentMessages = channelMessages[activeChannelId] || [];

  // Check Web Speech API speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setHasSpeechRec(Boolean(SpeechRec));
    }
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages, isSimulatingTyping, activeChannelId]);

  // Handle Speech-to-Text Dictation
  const startRecording = () => {
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
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputText(transcript);
        }
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Send message handler
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    if (isRecording) {
      stopRecording();
    }

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'astronaut',
      senderName: profile.name,
      senderRole: profile.callsign,
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' MET',
      translation: isAutoTranslateOn && targetLanguage !== 'English' ? {
        originalLang: 'English',
        translatedText: `[Auto-Translated to ${targetLanguage}]: ${text}`,
      } : undefined,
    };

    setChannelMessages((prev) => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] || []), newMsg],
    }));

    setInputText('');

    // Simulate reply after 2 seconds
    setIsSimulatingTyping(true);
    setTimeout(() => {
      setIsSimulatingTyping(false);
      generateSimulatedReply(text, activeChannelId);
    }, 2000);
  };

  // Simulate realistic aerospace reply based on active partner
  const generateSimulatedReply = (userText: string, channelId: string) => {
    let replyText = '';
    let sender: Message['sender'] = 'surgeon';
    let senderName = 'Dr. Marcus Vance, M.D.';
    let senderRole = 'Lead Flight Surgeon';

    if (channelId === 'dr-vance') {
      const lower = userText.toLowerCase();
      if (lower.includes('pain') || lower.includes('spine') || lower.includes('hurt') || lower.includes('back')) {
        replyText = `Copy that, Dr. Salma. Logging symptoms in MedCom. Spine elongation of +${profile.spineElongation} cm can compress intervertebral disks when shifting posture. Please apply the thermal lumbar wrap for 20 minutes and report back.`;
      } else if (lower.includes('vitals') || lower.includes('heart') || lower.includes('bp') || lower.includes('sleep')) {
        replyText = `Received. Your biometric telemetry telemetry confirms resting HR ${profile.restingHeartRate || 58} bpm with SpO2 ${profile.spO2Baseline || 99}%. Flight surgeons at JSC MedCom Alpha have cleared you for today's EVA payload bio-runs.`;
      } else {
        replyText = `Received Dr. Salma. Reviewing your latest vitals and flight status now. Telemetry link is solid on 248.50 MHz SAT-Uplink. Continue flight protocol.`;
      }
    } else if (channelId === 'medical-team') {
      sender = 'team';
      senderName = 'Ground Control MedCom';
      senderRole = 'Flight Medicine Console';
      replyText = `Message acknowledged by MCC-Houston Medical Team. Biomedical engineering has flagged your note for the shift handover log. Next orbital telecon in 90 minutes.`;
    } else if (channelId === 'crew-support') {
      sender = 'family';
      senderName = 'Johnson Family Relay';
      senderRole = 'Buffered Ground Terminal';
      replyText = `[Ground Uplink Buffer]: Your message was safely recorded at White Sands ground terminal. It will be delivered to your family's home portal during the next high-gain S-band pass.`;
    } else if (channelId === 'ai-astro') {
      sender = 'ai';
      senderName = 'ASTRO Intelligence';
      senderRole = 'Autonomous Copilot';
      replyText = `ASTRO here: I've processed your telemetry note. Autonomic tone and cognitive focus index are within nominal ranges for MET Day 84. Let me know if you would like to run a guided parasympathetic reset.`;
    }

    const replyMsg: Message = {
      id: `reply-${Date.now()}`,
      sender,
      senderName,
      senderRole,
      content: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' MET',
    };

    setChannelMessages((prev) => ({
      ...prev,
      [channelId]: [...(prev[channelId] || []), replyMsg],
    }));

    if (onSendToast) {
      onSendToast(`New incoming transmission from ${senderName}`, 'info');
    }
  };

  // Trigger Emergency Bio-Ping
  const handleConfirmEmergencyPing = () => {
    setIsEmergencyModalOpen(false);

    const emergencyMsg: Message = {
      id: `emergency-${Date.now()}`,
      sender: 'system',
      senderName: 'ASTROCARE EMERGENCY BEACON',
      content: `🚨 EMERGENCY BIO-PING TRANSMITTED // Telemetry attached: HR: ${profile.restingHeartRate || 58} bpm | BP: 118/76 mmHg | SpO2: ${profile.spO2Baseline || 99}% | Spine: +${profile.spineElongation} cm | Rad: ${profile.radiationDoseMsv} mSv | MET Day: ${profile.missionElapsedDays} | Priority: CRITICAL ALPHA`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' MET',
      isEmergency: true,
      hasTelemetry: true,
      telemetryData: {
        hr: profile.restingHeartRate || 58,
        bp: '118/76 mmHg',
        spO2: profile.spO2Baseline || 99,
        spineDelta: profile.spineElongation,
      },
    };

    // Add to Dr. Vance's channel and active channel
    setChannelMessages((prev) => ({
      ...prev,
      'dr-vance': [...(prev['dr-vance'] || []), emergencyMsg],
      ...(activeChannelId !== 'dr-vance' ? { [activeChannelId]: [...(prev[activeChannelId] || []), emergencyMsg] } : {}),
    }));

    if (onSendToast) {
      onSendToast('EMERGENCY BIO-PING SENT: Telemetry dispatched to MCC-Houston Flight Surgeon!', 'error');
    }

    // Immediate Flight Surgeon urgent response
    setTimeout(() => {
      const surgeonAlertReply: Message = {
        id: `vance-urgent-${Date.now()}`,
        sender: 'surgeon',
        senderName: 'Dr. Marcus Vance, M.D.',
        senderRole: 'Lead Flight Surgeon · URGENT OVERRIDE',
        content: `Dr. Salma! This is Dr. Vance at JSC MedCom Alpha. Emergency bio-ping received with 1-Hz telemetry payload. Telemetry shows SpO2 ${profile.spO2Baseline || 99}% and HR ${profile.restingHeartRate || 58}. I am holding emergency audio override open on 248.500 MHz. What is your immediate physical status?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' MET',
        isEmergency: true,
      };

      setChannelMessages((prev) => ({
        ...prev,
        'dr-vance': [...(prev['dr-vance'] || []), surgeonAlertReply],
      }));

      // Switch to Dr. Vance channel so user sees it right away
      setActiveChannelId('dr-vance');
    }, 1800);
  };

  // Toggle mock audio play
  const togglePlayAudio = (msgId: string) => {
    if (playingAudioId === msgId) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(msgId);
      setTimeout(() => {
        setPlayingAudioId(null);
      }, 4000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner: Comms Hub Header & Emergency Bio-Ping Button */}
      <div className="glass-panel glass-panel-glow p-5 sm:p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#00E5FF]/30 bg-[#070b1c]/90 shadow-[0_0_35px_rgba(0,229,255,0.18)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/50 flex items-center justify-center text-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.3)] shrink-0">
            <Radio className="w-6 h-6 text-[#00E5FF] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Chakra_Petch',sans-serif] tracking-wide">
                Community & Comms Hub
              </h1>
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#00E5FF]/15 border border-[#00E5FF]/40 text-[#00E5FF] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
                TELEMEDICINE UPLINK ACTIVE
              </span>
            </div>
            <p className="text-xs sm:text-sm font-sans text-slate-300 mt-1">
              Encrypted space-to-ground voice, telemetry messaging, and multidisciplinary clinical consult for <strong className="text-white">{profile.name}</strong>.
            </p>
          </div>
        </div>

        {/* Prominent Red Emergency Bio-Ping Button (Requirement 4) */}
        <button
          type="button"
          onClick={() => setIsEmergencyModalOpen(true)}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-rose-600 via-rose-700 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-mono font-extrabold text-xs sm:text-sm tracking-wider flex items-center gap-2.5 shadow-[0_0_30px_rgba(244,63,94,0.55)] border-2 border-rose-400 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shrink-0 animate-pulse"
        >
          <AlertTriangle className="w-5 h-5 text-white animate-bounce" />
          <span>🚨 SEND EMERGENCY BIO-PING</span>
        </button>
      </div>

      {/* Main Grid: Left/Center Chat Area (7 or 8 Cols) + Right Sidebar (4 or 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Chat Area (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col h-[700px] glass-panel glass-panel-glow rounded-2xl border border-[#00E5FF]/30 bg-[#060919]/95 shadow-[0_0_30px_rgba(0,229,255,0.12)] overflow-hidden">
          {/* Main Chat Header (Requirement 3) */}
          <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-[#090f28]/90 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center font-bold text-sm ${activeChannel.avatarBg} ${activeChannel.avatarBorder}`}>
                  <activeChannel.avatarIcon className="w-5 h-5" />
                </div>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-black ${
                    activeChannel.status === 'online' || activeChannel.status === 'members'
                      ? 'bg-[#10b981] shadow-[0_0_8px_#10b981]'
                      : activeChannel.status === 'ready'
                      ? 'bg-purple-400 shadow-[0_0_8px_#c084fc]'
                      : 'bg-slate-500'
                  }`}
                />
              </div>

              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-base sm:text-lg font-bold text-white font-['Chakra_Petch',sans-serif] tracking-wide">
                    {activeChannel.name}
                  </h2>
                  {/* Secure Uplink Badge */}
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40 flex items-center gap-1 shadow-[0_0_8px_rgba(0,229,255,0.25)]">
                    <ShieldCheck className="w-3 h-3 text-[#00E5FF]" />
                    SECURE UPLINK
                  </span>
                </div>
                <div className="text-xs text-slate-300 font-mono mt-0.5 flex items-center gap-2">
                  <span>{activeChannel.role}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-cyan-400 text-[11px] font-semibold">{activeChannel.freqBadge}</span>
                </div>
              </div>
            </div>

            {/* Link Telemetry indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
              <Wifi className="w-3.5 h-3.5 text-[#10b981]" />
              <span>TDRS-EAST RELAY: 99.8%</span>
            </div>
          </div>

          {/* Active Auto-Translation Banner */}
          {isAutoTranslateOn && (
            <div className="px-4 py-1.5 bg-[#00E5FF]/10 border-b border-[#00E5FF]/20 flex items-center justify-between text-[11px] font-mono text-[#00E5FF] shrink-0">
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>AI AUTO-TRANSLATION ENGAGED: Multi-language crew relay active</span>
              </div>
              <span className="text-slate-400 text-[10px]">EN · ES · FR · AR · JA supported</span>
            </div>
          )}

          {/* Message List - Scrollable (Requirement 3) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {currentMessages.map((msg) => {
              const isAstronaut = msg.sender === 'astronaut';
              const isSystem = msg.sender === 'system' || msg.isEmergency;

              // System / Emergency Alert Banner Bubble
              if (isSystem) {
                return (
                  <div
                    key={msg.id}
                    className="p-4 rounded-xl border-2 border-rose-500 bg-rose-950/70 text-rose-100 shadow-[0_0_25px_rgba(244,63,94,0.35)] space-y-2 animate-in zoom-in-95 duration-200"
                  >
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-rose-300">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
                        <span className="uppercase tracking-widest">{msg.senderName}</span>
                      </div>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p className="text-sm font-mono font-semibold text-white whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </p>

                    {/* Attached Telemetry Block */}
                    {msg.telemetryData && (
                      <div className="mt-2.5 p-3 rounded-lg bg-black/60 border border-rose-500/40 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                        <div>
                          <span className="text-slate-400">HEART RATE:</span>
                          <div className="text-emerald-400 font-bold text-sm">{msg.telemetryData.hr} bpm</div>
                        </div>
                        <div>
                          <span className="text-slate-400">BLOOD PRESSURE:</span>
                          <div className="text-cyan-300 font-bold text-sm">{msg.telemetryData.bp}</div>
                        </div>
                        <div>
                          <span className="text-slate-400">SpO2 LEVEL:</span>
                          <div className="text-emerald-400 font-bold text-sm">{msg.telemetryData.spO2}%</div>
                        </div>
                        <div>
                          <span className="text-slate-400">SPINE DELTA:</span>
                          <div className="text-amber-400 font-bold text-sm">+{msg.telemetryData.spineDelta} cm</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              // Normal User vs Partner Bubble
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isAstronaut ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Sender Avatar */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                      isAstronaut
                        ? 'bg-[#00E5FF] text-black shadow-[0_0_12px_#00E5FF]'
                        : msg.sender === 'surgeon'
                        ? 'bg-[#FF8C00] text-black shadow-[0_0_12px_rgba(255,140,0,0.5)]'
                        : msg.sender === 'ai'
                        ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                        : msg.sender === 'team'
                        ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                        : 'bg-rose-600 text-white shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                    }`}
                  >
                    {isAstronaut ? 'SJ' : msg.sender === 'surgeon' ? 'MV' : msg.sender === 'ai' ? 'AI' : msg.sender === 'team' ? 'MC' : 'FM'}
                  </div>

                  {/* Message Bubble Container */}
                  <div
                    className={`max-w-[82%] rounded-2xl p-4 text-sm font-sans leading-relaxed ${
                      isAstronaut
                        ? 'bg-[#00E5FF]/15 border border-[#00E5FF]/50 text-white shadow-[0_0_20px_rgba(0,229,255,0.15)] rounded-tr-none'
                        : 'bg-slate-900/90 border border-slate-700/80 text-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.5)] rounded-tl-none'
                    }`}
                  >
                    {/* Header sender info */}
                    <div className="flex items-center justify-between gap-3 text-xs font-mono mb-1.5 pb-1 border-b border-slate-800">
                      <span className={`font-bold ${isAstronaut ? 'text-[#00E5FF]' : 'text-[#FF8C00]'}`}>
                        {msg.senderName} {msg.senderRole && `(${msg.senderRole})`}
                      </span>
                      <span className="text-slate-400 text-[11px]">{msg.timestamp}</span>
                    </div>

                    {/* Text content */}
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Audio Note Widget if message is audio */}
                    {msg.isAudio && (
                      <div className="mt-3 p-3 rounded-xl bg-black/50 border border-slate-700 flex items-center justify-between gap-3 font-mono text-xs">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => togglePlayAudio(msg.id)}
                            className="w-8 h-8 rounded-full bg-[#00E5FF] text-black flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
                          >
                            {playingAudioId === msg.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                          </button>
                          <div>
                            <div className="text-white font-bold">Voice Uplink Note</div>
                            <div className="text-slate-400 text-[11px]">Duration: {msg.audioDuration} · 24-bit PCM</div>
                          </div>
                        </div>

                        {/* Animated waveform visualizer */}
                        <div className="flex items-center gap-1 h-5">
                          {[3, 8, 5, 10, 6, 9, 4, 7, 10, 5, 3].map((h, idx) => (
                            <span
                              key={idx}
                              style={{ height: playingAudioId === msg.id ? `${h * 2}px` : '4px' }}
                              className="w-1 rounded-full bg-[#00E5FF] transition-all duration-150"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Auto-translation pill if enabled */}
                    {msg.translation && (
                      <div className="mt-2.5 pt-2 border-t border-[#00E5FF]/20 text-[11px] font-mono text-cyan-300 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{msg.translation.translatedText}</span>
                      </div>
                    )}

                    {/* Delivery checkmark */}
                    <div className="mt-2 flex items-center justify-end gap-1 text-[10px] font-mono text-slate-400">
                      <span>TDRS RELAY DELIVERED</span>
                      <CheckCheck className="w-3.5 h-3.5 text-[#10b981]" />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Simulating Typing Indicator */}
            {isSimulatingTyping && (
              <div className="flex items-center gap-3 animate-in fade-in duration-200">
                <div className="w-9 h-9 rounded-xl bg-[#FF8C00]/30 border border-[#FF8C00]/50 text-[#FF8C00] flex items-center justify-center font-mono text-xs font-bold">
                  MV
                </div>
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF8C00] animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF8C00] animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF8C00] animate-bounce" />
                  </div>
                  <span>Dr. Vance is typing uplink reply...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Active Voice Dictation Banner */}
          {isRecording && (
            <div className="px-4 py-2 bg-rose-950/80 border-t border-rose-500/50 flex items-center justify-between text-xs font-mono text-rose-200 shrink-0 animate-in fade-in">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="font-bold">MICROPHONE LISTENING (VOICE UPLINK)...</span>
                <span className="text-rose-300 text-[11px] hidden sm:inline">Speak clearly into headset</span>
              </div>
              <button
                type="button"
                onClick={stopRecording}
                className="px-2.5 py-0.5 rounded bg-rose-900/60 hover:bg-rose-800 text-white font-bold text-[10px] border border-rose-400/50 cursor-pointer"
              >
                ATTACH AUDIO NOTE
              </button>
            </div>
          )}

          {/* Input Bar (Requirement 3) */}
          <div className="p-4 border-t border-slate-800 bg-[#080d22] shrink-0">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2.5">
              {/* Paperclip quick telemetry attach */}
              <button
                type="button"
                onClick={() => {
                  setInputText(`[TELEMETRY ATTACHMENT]: HR: ${profile.restingHeartRate || 58} bpm | SpO2: ${profile.spO2Baseline || 99}% | Spine: +${profile.spineElongation} cm. Requesting medical review.`);
                }}
                className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Attach current physiological telemetry snapshot"
              >
                <Paperclip className="w-4 h-4 text-[#00E5FF]" />
              </button>

              {/* Microphone Voice Button (Requirement 3) */}
              {hasSpeechRec ? (
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isRecording
                      ? 'bg-rose-600 text-white border-rose-400 animate-pulse ring-4 ring-rose-500/50 shadow-[0_0_20px_#f43f5e]'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white hover:border-[#00E5FF]'
                  }`}
                  title={isRecording ? 'Listening... Click to stop' : 'Record voice note (Speech-to-Text)'}
                >
                  {isRecording ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4" />}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setInputText('[Voice Note Mock: "Dr. Vance, logging my post-EVA vitals now."]');
                  }}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Voice note simulator"
                >
                  <Mic className="w-4 h-4" />
                </button>
              )}

              {/* Text Input Field */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Transmitting secure uplink to ${activeChannel.name}...`}
                className="flex-1 bg-slate-950/90 border border-slate-700/80 text-white placeholder-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent font-sans"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-5 py-3 rounded-xl bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-mono font-extrabold text-sm flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(0,229,255,0.4)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">SEND UPLINK</span>
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar: Channels & Contacts (Requirement 2 & 5) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Channels List Box */}
          <div className="glass-panel glass-panel-glow p-5 rounded-2xl border border-[#00E5FF]/30 bg-[#060919]/95 shadow-[0_0_30px_rgba(0,229,255,0.12)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#00E5FF] font-bold">
                <Radio className="w-4 h-4 text-[#00E5FF]" />
                <span>CHANNELS & CONTACTS</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">4 CHANNELS READY</span>
            </div>

            {/* List of Channels/Contacts (Requirement 2) */}
            <div className="space-y-2.5">
              {channels.map((chan) => {
                const Icon = chan.avatarIcon;
                const isSelected = chan.id === activeChannelId;

                return (
                  <button
                    key={chan.id}
                    type="button"
                    onClick={() => setActiveChannelId(chan.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#00E5FF]/15 border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.25)] text-white'
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/70 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {/* Avatar with Status Dot */}
                      <div className="relative shrink-0">
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${chan.avatarBg} ${chan.avatarBorder}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-black ${
                            chan.status === 'online' || chan.status === 'members'
                              ? 'bg-[#10b981] shadow-[0_0_6px_#10b981]'
                              : chan.status === 'ready'
                              ? 'bg-purple-400 shadow-[0_0_6px_#c084fc]'
                              : 'bg-slate-500'
                          }`}
                        />
                      </div>

                      <div className="overflow-hidden">
                        <div className="text-sm font-bold font-['Chakra_Petch',sans-serif] text-white truncate">
                          {chan.name}
                        </div>
                        <div className="text-xs text-slate-400 font-sans truncate mt-0.5">
                          {chan.statusText}
                        </div>
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-[#00E5FF] translate-x-1' : 'text-slate-600'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ground Control Telemetry Link Card */}
          <div className="p-4 rounded-xl border border-slate-800 bg-[#070d20] space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                TELEMETRY FEED
              </span>
              <span className="text-[#10b981] font-bold">1-HZ REALTIME</span>
            </div>
            <div className="space-y-1 text-slate-400 text-[11px]">
              <div className="flex justify-between">
                <span>Direct Uplink:</span>
                <span className="text-white font-bold">{profile.assignedSurgeon?.callsignOrFreq || 'MedCom Alpha 248.5 MHz'}</span>
              </div>
              <div className="flex justify-between">
                <span>Relay Path:</span>
                <span className="text-white font-bold">{profile.assignedSurgeon?.contactDirective || 'TDRS-East Satellite'}</span>
              </div>
              <div className="flex justify-between">
                <span>Credential:</span>
                <span className="text-white font-bold">{profile.assignedSurgeon?.credentialId || 'NASA-FS-9842'}</span>
              </div>
            </div>
          </div>

          {/* AI Auto-Translation Toggle Box (Requirement 5) */}
          <div className="glass-panel glass-panel-glow p-4 rounded-xl border border-purple-500/30 bg-[#0d0922]/90 shadow-[0_0_20px_rgba(168,85,247,0.15)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  AI Auto-Translation
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAutoTranslateOn((prev) => !prev)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-extrabold transition-colors cursor-pointer border ${
                  isAutoTranslateOn
                    ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_12px_#9333ea]'
                    : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
              >
                {isAutoTranslateOn ? 'ON' : 'OFF'}
              </button>
            </div>

            <p className="text-xs text-purple-200/90 font-sans leading-relaxed">
              Real-time neural language translation for international spaceflight partners (NASA, ESA, JAXA).
            </p>

            {isAutoTranslateOn && (
              <div className="flex items-center gap-2 pt-2 border-t border-purple-900/60 text-xs font-mono">
                <span className="text-purple-300">Target:</span>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="bg-purple-950 border border-purple-700/60 text-white text-xs rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-400"
                >
                  <option value="English">English (US)</option>
                  <option value="Spanish">Spanish (ES)</option>
                  <option value="French">French (CNES)</option>
                  <option value="German">German (ESA)</option>
                  <option value="Japanese">Japanese (JAXA)</option>
                  <option value="Arabic">Arabic (SA)</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Bio-Ping Confirmation Modal (Requirement 4) */}
      {isEmergencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-[#0d0716] border-2 border-rose-500 p-6 sm:p-7 shadow-[0_0_50px_rgba(244,63,94,0.6)] space-y-5 animate-in zoom-in-95 duration-200 text-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-rose-900/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-600/30 border border-rose-400 text-rose-300 animate-pulse">
                  <AlertTriangle className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white font-['Chakra_Petch',sans-serif] tracking-wide">
                    EMERGENCY BIO-PING ALERT
                  </h3>
                  <div className="text-xs font-mono text-rose-300">
                    MCC-HOUSTON MEDCOM PRIORITY OVERRIDE
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEmergencyModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Prompt exact confirmation text */}
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-sm font-sans text-rose-100 leading-relaxed space-y-2">
              <p className="font-bold text-white text-base">
                Are you sure you want to alert the Flight Surgeon?
              </p>
              <p className="text-xs font-mono text-rose-200">
                This will send your current telemetry (HR: {profile.restingHeartRate || 58} bpm, BP: 118/76, SpO2: {profile.spO2Baseline || 99}%, Spine: +{profile.spineElongation} cm) and awaken the ground medical response desk immediately.
              </p>
            </div>

            {/* Live Telemetry Payload Preview */}
            <div className="p-3.5 rounded-xl bg-black/60 border border-slate-800 text-xs font-mono space-y-2">
              <div className="text-slate-400 font-bold uppercase tracking-wider">Payload Snapshot to be Dispatched:</div>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>• Astronaut: <strong className="text-white">{profile.name}</strong></div>
                <div>• Callsign: <strong className="text-cyan-300">{profile.callsign}</strong></div>
                <div>• Mission MET: <strong className="text-white">Day {profile.missionElapsedDays} (LEO)</strong></div>
                <div>• Direct Surgeon: <strong className="text-[#FF8C00]">{profile.assignedSurgeon?.name || 'Dr. Vance'}</strong></div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEmergencyModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono font-bold transition-colors cursor-pointer"
              >
                STAND DOWN / CANCEL
              </button>

              <button
                type="button"
                onClick={handleConfirmEmergencyPing}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-extrabold tracking-wider transition-all shadow-[0_0_25px_rgba(244,63,94,0.6)] cursor-pointer"
              >
                CONFIRM & TRANSMIT BIO-PING
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
