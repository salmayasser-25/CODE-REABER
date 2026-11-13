import React, { useState } from 'react';
import { 
  MessagesSquare, 
  Send, 
  Search, 
  Users, 
  Radio, 
  ShieldCheck, 
  Lock, 
  Clock, 
  Sparkles, 
  AlertCircle,
  FileText,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { 
  MedicalConversation, 
  MedicalMessage, 
  MedicalTeamMember 
} from '../types/astronaut.ts';

interface MedicalCommunicationsPageProps {
  conversations: MedicalConversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  messages: MedicalMessage[];
  onSendMessage: (conversationId: string, content: string, type?: any, priority?: any) => void;
  isSending?: boolean;
}

export const MedicalCommunicationsPage: React.FC<MedicalCommunicationsPageProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  messages,
  onSendMessage,
  isSending = false,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inputText, setInputText] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const activeConv = conversations.find((c) => c.id === activeConversationId) || conversations[0];

  // Quick Clinical Templates for Flight Surgeon
  const QUICK_TEMPLATES = [
    { label: 'Hold Axial Loads', text: 'Directive: Maintain hold on ARED heavy deadlifts/squats until tomorrow morning disc ultrasound.' },
    { label: 'Hydration Protocol', text: 'Prescription: Increase electrolyte hydration by 500 mL following microgravity CEVIS cycle.' },
    { label: 'EVA Robotics Clearance', text: 'Medical Clearance: Cleared for intra-vehicular robotics lead on EVA-2; exterior translation held.' },
    { label: 'Vitals Re-check', text: 'Telemetry Request: Requesting 1-hour resting heart rate and blood pressure check in crew quarters.' },
  ];

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeConv) return;
    onSendMessage(activeConv.id, inputText.trim(), 'routine', 'normal');
    setInputText('');
  };

  const handleSelectTemplate = (text: string) => {
    setInputText(text);
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="glass-panel rounded-2xl p-4.5 border border-[#00E5FF]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#00E5FF] font-bold uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 text-[#00E5FF] animate-pulse" />
            <span>ASTRA SECURE TELEMEDICINE COMMS NETWORK</span>
          </div>
          <h1 className="text-xl font-black text-white font-['Chakra_Petch',sans-serif]">
            Flight Medicine Internal Communications System
          </h1>
          <p className="text-xs text-slate-300 font-sans mt-0.5">
            Operational telemedicine and ground telemetry relay connecting Flight Surgeons, Astronauts, Biomedical Engineers, and Flight Directors.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/40 px-3 py-1.5 rounded-xl font-semibold">
          <ShieldCheck className="w-4 h-4 text-[#10b981]" />
          <span>TDRS-4 / 256-BIT ENCRYPTED</span>
        </div>
      </div>

      {/* 3-Panel Messaging Architecture (Requirement 4.C) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-16rem)] min-h-[580px]">
        {/* Left Panel: Conversation List (3.5 cols on lg) */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col justify-between overflow-hidden">
          <div className="space-y-3 flex-1 flex flex-col min-h-0">
            {/* Conversation Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medical channels..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs font-mono focus:border-[#00E5FF] focus:outline-none"
              />
            </div>

            {/* Channels Header */}
            <div className="text-[10px] font-mono tracking-wider uppercase text-slate-400 font-bold px-1">
              OPERATIONAL TELEMEDICINE CHANNELS
            </div>

            {/* List */}
            <div className="space-y-2 overflow-y-auto flex-1 pr-1">
              {filteredConversations.map((conv) => {
                const isCurrent = conv.id === activeConv?.id;
                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => onSelectConversation(conv.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-[#00E5FF]/15 border-[#00E5FF]/60 text-white shadow-[0_0_18px_rgba(0,229,255,0.25)]'
                        : 'bg-slate-900/50 border-slate-800/80 text-slate-300 hover:bg-slate-800/70 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            conv.isGroup
                              ? 'bg-[#00E5FF] text-black shadow-[0_0_10px_#00E5FF]'
                              : 'bg-slate-800 text-[#00E5FF] border border-slate-700'
                          }`}
                        >
                          {conv.isGroup ? <Users className="w-4 h-4" /> : <Radio className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-white truncate font-['Chakra_Petch',sans-serif]">
                            {conv.title}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate font-sans">
                            {conv.lastMessage || conv.description}
                          </div>
                        </div>
                      </div>

                      {conv.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-[#FF8C00] text-black font-mono font-bold text-[10px] flex items-center justify-center shrink-0 shadow-[0_0_8px_#FF8C00]">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 text-[10px] font-mono text-slate-400 flex justify-between">
                      <span className="truncate max-w-[150px]">{conv.channelFrequency}</span>
                      <span>{new Date(conv.lastTimestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>NETWORK: MCC-HOUSTON RELAY</span>
            <span className="text-[#10b981] font-bold">ONLINE</span>
          </div>
        </div>

        {/* Center Panel: Active Conversation & Composer (5.5 cols on lg) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col justify-between overflow-hidden">
          {/* Conversation Header */}
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm text-white font-['Chakra_Petch',sans-serif]">
                  {activeConv?.title}
                </h2>
                {activeConv?.isGroup && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#00E5FF]/20 text-[#00E5FF] font-bold">
                    GROUP CHANNEL
                  </span>
                )}
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                {activeConv?.channelFrequency} · {activeConv?.participants.length} Active Participants
              </div>
            </div>

            <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
              <span>MCC SYNCED</span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto py-3 space-y-3.5 pr-1">
            {messages.map((msg) => {
              const isSurgeon = msg.isSurgeon;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isSurgeon ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1 text-[10px] font-mono text-slate-400">
                    <span className="font-bold text-white">{msg.senderName}</span>
                    <span>·</span>
                    <span className="text-[#00E5FF]">{msg.senderRole}</span>
                    <span>·</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs font-sans leading-relaxed ${
                      isSurgeon
                        ? 'bg-[#00E5FF]/20 border border-[#00E5FF]/50 text-white rounded-tr-sm shadow-[0_0_20px_rgba(0,229,255,0.2)]'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm'
                    }`}
                  >
                    {msg.messageType === 'clinical_directive' && (
                      <div className="text-[10px] font-mono font-bold text-[#FF8C00] uppercase tracking-wider mb-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        CLINICAL DIRECTIVE
                      </div>
                    )}
                    {msg.messageType === 'clearance' && (
                      <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        FLIGHT CLEARANCE
                      </div>
                    )}
                    {msg.content}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Action Templates Bar */}
          <div className="pt-2 pb-1 border-t border-slate-800 overflow-x-auto flex items-center gap-2 text-xs font-mono">
            <span className="text-[10px] text-slate-500 shrink-0 uppercase">TEMPLATES:</span>
            {QUICK_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectTemplate(tmpl.text)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[10px] whitespace-nowrap cursor-pointer"
              >
                {tmpl.label}
              </button>
            ))}
          </div>

          {/* Composer Form */}
          <form onSubmit={handleSend} className="pt-2 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Transmit message or clinical directive to Medical Team..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-xs font-mono focus:border-[#00E5FF] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="px-4 py-2.5 rounded-xl bg-[#00E5FF] text-black font-mono font-bold text-xs hover:bg-[#00E5FF]/90 transition-all flex items-center gap-1.5 shadow-[0_0_15px_#00E5FF] disabled:opacity-50 cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>TRANSMIT</span>
            </button>
          </form>
        </div>

        {/* Right Panel: Group Info & Participant Details (2.5 cols on lg) */}
        <div className="lg:col-span-3 glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div>
              <div className="text-[10px] font-mono tracking-wider uppercase text-slate-400 font-bold">
                CHANNEL INFORMATION
              </div>
              <h3 className="font-bold text-sm text-white font-['Chakra_Petch',sans-serif] mt-1">
                {activeConv?.title}
              </h3>
              <p className="text-xs text-slate-300 font-sans mt-1">
                {activeConv?.description}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Security:</span>
                <span className="text-emerald-400 font-bold">Encrypted 256-bit</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Uplink Loop:</span>
                <span className="text-white">MedCom Alpha</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ground Station:</span>
                <span className="text-slate-200">White Sands / JSC</span>
              </div>
            </div>

            {/* Member List */}
            <div>
              <div className="text-[10px] font-mono tracking-wider uppercase text-slate-400 font-bold mb-2">
                ACTIVE PARTICIPANTS ({activeConv?.participants.length})
              </div>

              <div className="space-y-2">
                {activeConv?.participants.map((member) => (
                  <div
                    key={member.id}
                    className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs font-mono flex items-start gap-2.5"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-[#00E5FF] flex items-center justify-center font-bold text-[10px] shrink-0">
                      {member.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-white text-xs truncate">
                        {member.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {member.role}
                      </div>
                      <div className="text-[9px] text-[#00E5FF] truncate mt-0.5">
                        {member.location}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[10px] font-mono text-slate-500 text-center">
            NASA Flight Medicine Telecommunications Standard (NASA-STD-3001)
          </div>
        </div>
      </div>
    </div>
  );
};
