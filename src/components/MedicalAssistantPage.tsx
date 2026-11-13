import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Stethoscope,
  AlertTriangle,
  Activity,
  Heart,
  Droplets,
  Thermometer,
  Wind,
  ShieldAlert,
  Clock,
  CheckCircle2,
  RefreshCw,
  Trash2,
  UserCheck,
  UserX,
  ArrowUpRight,
  Sparkles,
  Info,
  Eye,
  X,
  Lock,
  MessageSquare,
  HelpCircle,
  FileText,
} from 'lucide-react';
import {
  AssistantTriageLevel,
  CrewMemberSummary,
  DoctorAvailabilityStatus,
  DoctorTimeoutSeconds,
  MedicalAssistantContext,
  MedicalAssistantMessage,
  VitalSignEvaluation,
} from '../types/astronaut.ts';

interface MedicalAssistantPageProps {
  crew: CrewMemberSummary[];
  initialAstronautId?: string;
  onDataSyncNeeded: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenAstronautProfile: (astronautId: string) => void;
}

const TIMEOUT_OPTIONS: Array<{ label: string; shortLabel: string; value: DoctorTimeoutSeconds }> = [
  { label: '15 Seconds (Quick Test)', shortLabel: '15s', value: 15 },
  { label: '2 Hours (Standard SLA)', shortLabel: '2h', value: 7200 },
  { label: '3 Hours (Extended SLA)', shortLabel: '3h', value: 10800 },
];

function formatTimeoutHuman(seconds: DoctorTimeoutSeconds): string {
  if (seconds === 15) return '15 seconds';
  if (seconds === 10800) return '3 hours';
  return '2 hours';
}

function formatTimeoutBadge(seconds: DoctorTimeoutSeconds): string {
  if (seconds === 15) return '15S';
  if (seconds === 10800) return '3H';
  return '2H';
}

const SURGEON_AUTH_HEADERS = {
  'Content-Type': 'application/json',
  'x-surgeon-credential': 'NASA-FS-9842',
  'x-user-role': 'flight_surgeon',
};

function formatCountdownMs(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function getTriageBadgeMeta(level?: AssistantTriageLevel): { label: string; classes: string } | null {
  switch (level) {
    case 'low_risk':
      return {
        label: 'LEVEL 1 · LOW RISK',
        classes: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
      };
    case 'attention_required':
      return {
        label: 'LEVEL 2 · ATTENTION REQUIRED',
        classes: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
      };
    case 'urgent':
      return {
        label: 'LEVEL 3 · URGENT',
        classes: 'bg-[#FF8C00]/25 text-[#FF8C00] border-[#FF8C00]/60',
      };
    case 'emergency':
      return {
        label: 'LEVEL 4 · EMERGENCY',
        classes: 'bg-rose-500/25 text-rose-300 border-rose-500/60',
      };
    default:
      return null;
  }
}

export const MedicalAssistantPage: React.FC<MedicalAssistantPageProps> = ({
  crew,
  initialAstronautId = 'ASTRO-74-SJ',
  onDataSyncNeeded,
  onNavigateTab,
  onOpenAstronautProfile,
}) => {
  const [selectedAstronautId, setSelectedAstronautId] = useState<string>(initialAstronautId);
  const [context, setContext] = useState<MedicalAssistantContext | null>(null);
  const [isLoadingContext, setIsLoadingContext] = useState<boolean>(true);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isTypingAI, setIsTypingAI] = useState<boolean>(false);
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [remainingMs, setRemainingMs] = useState<number>(0);

  // Authorized Flight Surgeon Console Controls (Reply + Saved AI History Audit)
  const [surgeonReplyDraft, setSurgeonReplyDraft] = useState<string>('');
  const [isSendingSurgeonReply, setIsSendingSurgeonReply] = useState<boolean>(false);
  const [isAiAuditOpen, setIsAiAuditOpen] = useState<boolean>(false);
  const [auditMessages, setAuditMessages] = useState<MedicalAssistantMessage[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState<boolean>(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const fetchAssistantContext = async (astroId: string, silent = false) => {
    if (!silent) setIsLoadingContext(true);
    try {
      const res = await fetch(`/api/medical-assistant/context/${encodeURIComponent(astroId)}`);
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        setContext(json.data);
        setErrorBanner(null);
      } else if (!silent) {
        setErrorBanner(json.error || 'Failed to sync astronaut telemetry.');
      }
    } catch {
      if (!silent) {
        setErrorBanner('Network error syncing medical telemetry from ASTRA core.');
      }
    } finally {
      if (!silent) setIsLoadingContext(false);
    }
  };

  useEffect(() => {
    fetchAssistantContext(selectedAstronautId);
  }, [selectedAstronautId]);

  // Smooth scroll on new messages or channel switch
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [context?.history?.length, context?.activeChannel, isTypingAI]);

  // Live countdown ticker synced strictly from server timerState.expiresAt
  useEffect(() => {
    if (!context?.timerState?.isWaiting || !context.timerState.expiresAt) {
      setRemainingMs(0);
      return;
    }

    const updateTick = () => {
      const target = Date.parse(context.timerState.expiresAt!);
      const diff = Math.max(0, target - Date.now());
      setRemainingMs(diff);
      if (diff === 0) {
        fetchAssistantContext(selectedAstronautId, true);
        onDataSyncNeeded();
      }
    };

    updateTick();
    const tickInterval = setInterval(updateTick, 1000);
    // Periodic server sync every 15s to catch external doctor replies or server-side SLA transitions
    const serverSyncInterval = setInterval(() => {
      fetchAssistantContext(selectedAstronautId, true);
    }, 15000);

    return () => {
      clearInterval(tickInterval);
      clearInterval(serverSyncInterval);
    };
  }, [context?.timerState?.isWaiting, context?.timerState?.expiresAt, selectedAstronautId]);

  // Server-authoritative availability & timeout toggle
  const handleUpdateAvailability = async (updates: {
    doctorStatus?: DoctorAvailabilityStatus;
    timeoutSeconds?: DoctorTimeoutSeconds;
  }) => {
    if (isUpdatingAvailability) return;
    setIsUpdatingAvailability(true);
    setErrorBanner(null);
    try {
      const res = await fetch('/api/medical-assistant/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          astronautId: selectedAstronautId,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success && json.updatedContext) {
        setContext(json.updatedContext);
      } else {
        setErrorBanner(json.error || 'Failed to update Doctor availability settings.');
      }
    } catch {
      setErrorBanner('Network error updating Flight Surgeon availability.');
    } finally {
      setIsUpdatingAvailability(false);
    }
  };

  // Send Astronaut Message strictly to the ACTIVE separated channel
  const handleSendMessage = async (overrideText?: string) => {
    const text = (overrideText ?? inputMessage).trim();
    if (!text || !context || isSending || isTypingAI) return;

    setIsSending(true);
    setErrorBanner(null);
    if (!overrideText) setInputMessage('');

    const isAiChannel = context.activeChannel === 'ai';
    if (isAiChannel) setIsTypingAI(true);

    try {
      const endpoint = isAiChannel
        ? '/api/medical-assistant/chat'
        : '/api/medical-assistant/doctor-message';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          astronautId: selectedAstronautId,
          message: text,
        }),
      });
      const json = await res.json();

      if (res.ok && json.success && json.updatedContext) {
        setContext(json.updatedContext);
        if (json.immediateEmergency || json.emergencyState || !isAiChannel) {
          onDataSyncNeeded();
        }
      } else {
        // Re-sync context in case server channel transitioned (e.g., SLA expired)
        await fetchAssistantContext(selectedAstronautId, true);
        setErrorBanner(json.error || 'Unable to route message to active channel.');
      }
    } catch {
      setErrorBanner('Communication relay failure sending medical message.');
    } finally {
      setIsSending(false);
      setIsTypingAI(false);
    }
  };

  // Authorized Flight Surgeon direct reply (resets/stops timer & restores Doctor Chat)
  const handleSurgeonReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSendingSurgeonReply) return;
    setIsSendingSurgeonReply(true);
    setErrorBanner(null);

    try {
      const res = await fetch('/api/medical-assistant/surgeon-reply', {
        method: 'POST',
        headers: SURGEON_AUTH_HEADERS,
        body: JSON.stringify({
          astronautId: selectedAstronautId,
          content: surgeonReplyDraft.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success && json.updatedContext) {
        setContext(json.updatedContext);
        setSurgeonReplyDraft('');
        onDataSyncNeeded();
      } else {
        setErrorBanner(json.error || 'Failed to transmit Flight Surgeon reply.');
      }
    } catch {
      setErrorBanner('Network error transmitting Flight Surgeon reply.');
    } finally {
      setIsSendingSurgeonReply(false);
    }
  };

  // Authorized Flight Surgeon Emergency Acknowledgement
  const handleAcknowledgeEmergency = async () => {
    try {
      const res = await fetch(
        `/api/medical-assistant/emergency/acknowledge/${encodeURIComponent(selectedAstronautId)}`,
        {
          method: 'POST',
          headers: SURGEON_AUTH_HEADERS,
          body: JSON.stringify({ surgeonName: 'Dr. Marcus Vance, M.D.' }),
        }
      );
      const json = await res.json();
      if (res.ok && json.success && json.updatedContext) {
        setContext(json.updatedContext);
        onDataSyncNeeded();
      } else {
        setErrorBanner(json.error || 'Failed to acknowledge emergency alert.');
      }
    } catch {
      setErrorBanner('Network error acknowledging emergency alert.');
    }
  };

  // Authorized Flight Surgeon Audit View for Saved AI Conversation History
  const handleOpenAiAuditReview = async () => {
    setIsAiAuditOpen(true);
    setIsLoadingAudit(true);
    try {
      const res = await fetch(
        `/api/medical-assistant/ai-review/${encodeURIComponent(selectedAstronautId)}`,
        { headers: SURGEON_AUTH_HEADERS }
      );
      const json = await res.json();
      if (res.ok && json.success) {
        setAuditMessages(json.data || []);
      }
    } catch {
      setAuditMessages([]);
    } finally {
      setIsLoadingAudit(false);
    }
  };

  const handleClearActiveChannel = async () => {
    if (!context) return;
    try {
      const res = await fetch(
        `/api/medical-assistant/history/${encodeURIComponent(selectedAstronautId)}?channel=${context.activeChannel}`,
        { method: 'DELETE' }
      );
      const json = await res.json();
      if (res.ok && json.success && json.updatedContext) {
        setContext(json.updatedContext);
      }
    } catch {
      setErrorBanner('Failed to reset active channel history.');
    }
  };

  const activeChannel = context?.activeChannel ?? 'doctor';
  const doctorStatus = context?.doctorStatus ?? 'available';
  const timeoutSeconds = context?.timeoutSeconds ?? 7200;
  const timeoutHuman = formatTimeoutHuman(timeoutSeconds);
  const timeoutBadge = formatTimeoutBadge(timeoutSeconds);
  const timerState = context?.timerState;
  const emergencyState = context?.emergencyState;

  const getVitalIcon = (key: VitalSignEvaluation['key']) => {
    switch (key) {
      case 'hr':
        return Heart;
      case 'bp':
        return Activity;
      case 'spo2':
        return Droplets;
      case 'temp':
        return Thermometer;
      case 'rr':
        return Wind;
    }
  };

  const getVitalBadgeClasses = (status: VitalSignEvaluation['status']) => {
    if (status === 'critical') return 'bg-rose-500/20 text-rose-300 border-rose-500/60';
    if (status === 'unusual') return 'bg-[#FF8C00]/20 text-[#FF8C00] border-[#FF8C00]/60';
    if (status === 'unavailable') return 'bg-slate-800 text-slate-400 border-slate-700';
    return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
  };

  const getVitalCardBorder = (status: VitalSignEvaluation['status']) => {
    if (status === 'critical') return 'border-rose-500/60 bg-rose-950/20';
    if (status === 'unusual') return 'border-[#FF8C00]/50 bg-[#FF8C00]/5';
    if (status === 'unavailable') return 'border-slate-800/80 bg-slate-950/60';
    return 'border-slate-800 bg-[#080f24]/90';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Independent Persistent Emergency Status Panel (Highest Priority — Always Independent of Doctor Status/Timeout) */}
      {emergencyState && emergencyState.isActive && !emergencyState.acknowledged && (
        <div className="rounded-2xl border-2 border-rose-500 bg-rose-950/75 backdrop-blur-xl p-5 shadow-[0_0_40px_rgba(244,63,94,0.35)]">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-mono font-black uppercase tracking-wider animate-pulse">
                  <ShieldAlert className="w-4 h-4" />
                  EMERGENCY OVERRIDE ACTIVE
                </span>
                <span className="text-xs font-mono text-rose-200">
                  Alert ID: <strong>{emergencyState.alertId}</strong> · Triggered:{' '}
                  {new Date(emergencyState.triggeredAt).toLocaleTimeString()}
                </span>
              </div>
              <h2 className="text-lg font-black text-white font-['Chakra_Petch',sans-serif]">
                Immediate Medical Escalation: {emergencyState.reason}
              </h2>
              <p className="text-xs text-rose-100">
                Emergency detection bypassed all {timeoutHuman} waiting timers and immediately alerted Flight Surgeon Dr. Marcus Vance and the Ground Medical Team. This emergency status remains active until acknowledged by authorized medical personnel.
              </p>

              {emergencyState.instructions.length > 0 && (
                <div className="mt-2 rounded-xl bg-black/40 border border-rose-500/50 p-3.5 space-y-1.5">
                  <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-300">
                    Approved Astronaut Emergency Instructions
                  </div>
                  <ol className="space-y-1 text-xs text-rose-50 list-decimal list-inside">
                    {emergencyState.instructions.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
              <button
                type="button"
                onClick={handleAcknowledgeEmergency}
                className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-mono font-extrabold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Acknowledge Emergency (Surgeon)
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('alerts')}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-rose-400/50 text-rose-200 hover:bg-slate-800 font-mono font-bold text-xs transition-colors cursor-pointer text-center"
              >
                Open Medical Alerts Queue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Top Command & Server-Backed Doctor Availability Control Bar */}
      <div className="rounded-2xl border border-[#00E5FF]/30 bg-[#070d1e]/90 backdrop-blur-xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.45)]">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`p-3 rounded-xl border shadow-[0_0_20px_rgba(0,229,255,0.2)] shrink-0 ${
                activeChannel === 'doctor'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : 'bg-[#00E5FF]/15 border-[#00E5FF]/40 text-[#00E5FF]'
              }`}
            >
              {activeChannel === 'doctor' ? (
                <Stethoscope className="w-6 h-6" />
              ) : (
                <Bot className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black tracking-wide text-white font-['Chakra_Petch',sans-serif]">
                  ASTRA MEDICAL COMMUNICATIONS & AI TRIAGE
                </h1>
                {activeChannel === 'doctor' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/50">
                    MODE: DOCTOR CHAT ONLY (AI HIDDEN)
                  </span>
                ) : timerState?.aiTakeoverActive ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#FF8C00]/25 text-[#FF8C00] border border-[#FF8C00]/60">
                    MODE: AI TAKEOVER ({timeoutBadge} SLA TIMEOUT)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/50">
                    MODE: AI MEDICAL ASSISTANT (DOCTOR UNAVAILABLE)
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {activeChannel === 'doctor'
                  ? 'Flight Surgeon is Available. Astronaut messages route exclusively to Doctor Chat with server-tracked response SLA and zero AI interference.'
                  : 'ASTRA AI Medical Assistant is active on a separated AI channel. Transcripts are securely archived for authorized Flight Surgeon review.'}
              </p>
            </div>
          </div>

          {/* Controls: Astronaut, Server Doctor Availability, 2h/3h Timeout, Authorized AI Review */}
          <div className="flex flex-wrap items-end gap-3">
            {/* Astronaut Selector */}
            <div className="flex flex-col">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                Active Astronaut
              </label>
              <select
                value={selectedAstronautId}
                onChange={(e) => setSelectedAstronautId(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-white focus:border-[#00E5FF] focus:outline-none"
              >
                {crew.length > 0 ? (
                  crew.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.callsign}) — {member.healthStatus.toUpperCase()}
                    </option>
                  ))
                ) : (
                  <option value="ASTRO-74-SJ">Dr. Salma Johnson (Nova)</option>
                )}
              </select>
            </div>

            {/* Doctor Availability Toggle (Server-Authoritative) */}
            <div className="flex flex-col">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                Flight Surgeon Availability
              </label>
              <div className="inline-flex rounded-xl bg-slate-900/90 border border-slate-700 p-1">
                <button
                  type="button"
                  disabled={isUpdatingAvailability}
                  onClick={() => handleUpdateAvailability({ doctorStatus: 'available' })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    doctorStatus === 'available'
                      ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/50'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Available
                </button>
                <button
                  type="button"
                  disabled={isUpdatingAvailability}
                  onClick={() => handleUpdateAvailability({ doctorStatus: 'unavailable' })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    doctorStatus === 'unavailable'
                      ? 'bg-[#FF8C00]/25 text-[#FF8C00] border border-[#FF8C00]/50'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserX className="w-3.5 h-3.5" />
                  Unavailable
                </button>
              </div>
            </div>

            {/* Configurable Doctor Response Timeout: 2 Hours / 3 Hours ONLY */}
            <div className="flex flex-col">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                Response Timeout SLA
              </label>
              <select
                value={timeoutSeconds}
                disabled={isUpdatingAvailability}
                onChange={(e) =>
                  handleUpdateAvailability({ timeoutSeconds: Number(e.target.value) as DoctorTimeoutSeconds })
                }
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-[#00E5FF] focus:border-[#00E5FF] focus:outline-none"
              >
                {TIMEOUT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Authorized Doctor Review of Saved AI History */}
            <button
              type="button"
              onClick={handleOpenAiAuditReview}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-[#00E5FF]/40 text-xs font-mono font-bold text-[#00E5FF] hover:bg-[#00E5FF]/15 transition-colors cursor-pointer flex items-center gap-1.5"
              title="Authorized Flight Surgeon review of saved AI conversation history"
            >
              <Eye className="w-3.5 h-3.5" />
              Doctor AI Review ({context?.aiHistoryCount ?? 0})
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Auto-Synced Vital Signs & Medical Context */}
        <div className="lg:col-span-4 space-y-5">
          {/* Live Vital Signs Panel */}
          <div className="rounded-2xl border border-[#00E5FF]/25 bg-[#070d1e]/90 backdrop-blur-xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#00E5FF]">
                  <Activity className="w-4 h-4" />
                  <span>Auto-Synced Vital Signs</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Synchronized from telemetry (no manual input needed)
                </p>
              </div>
              <button
                type="button"
                onClick={() => fetchAssistantContext(selectedAstronautId)}
                disabled={isLoadingContext}
                className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-[#00E5FF] hover:border-[#00E5FF]/50 transition-colors cursor-pointer"
                title="Refresh Vital Signs"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isLoadingContext ? 'animate-spin text-[#00E5FF]' : ''}`}
                />
              </button>
            </div>

            {context ? (
              <div className="mt-4 space-y-2.5">
                {context.vitalEvaluations.map((vital) => {
                  const Icon = getVitalIcon(vital.key);
                  return (
                    <div
                      key={vital.key}
                      className={`rounded-xl border p-3 transition-colors ${getVitalCardBorder(vital.status)}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-[#00E5FF]" />
                          <span className="text-xs font-bold text-white">{vital.label}</span>
                        </div>
                        <span
                          className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${getVitalBadgeClasses(vital.status)}`}
                        >
                          {vital.status === 'unavailable' ? 'NOT RECORDED' : vital.status}
                        </span>
                      </div>

                      <div className="mt-1.5 flex items-baseline justify-between">
                        <div className="text-lg font-black font-mono text-white">
                          {vital.value}{' '}
                          <span className="text-xs font-normal text-slate-400">{vital.unit}</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          Ref: {vital.referenceRange}
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{vital.note}</p>
                    </div>
                  );
                })}

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>
                    Sleep:{' '}
                    <strong className="text-white">
                      {context.vitalsSnapshot.sleepHours !== null
                        ? `${context.vitalsSnapshot.sleepHours} hrs`
                        : 'Not recorded'}
                    </strong>
                  </span>
                  <span>
                    Synced:{' '}
                    <strong className="text-slate-200">
                      {context.vitalsSnapshot.lastMeasurementLabel}
                    </strong>
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-xs font-mono text-slate-400">
                Loading biometric telemetry...
              </div>
            )}
          </div>

          {/* Verified Medical Records Context */}
          {context && (
            <div className="rounded-2xl border border-slate-800 bg-[#070d1e]/90 backdrop-blur-xl p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>Verified Medical Records</span>
                </h3>
                <button
                  type="button"
                  onClick={() => onOpenAstronautProfile(context.astronaut.id)}
                  className="text-[11px] font-mono text-[#00E5FF] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Full Profile <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="rounded-lg bg-slate-900/70 border border-slate-800 px-2.5 py-1.5">
                  <span className="text-[10px] text-slate-400 block">Resting HR Baseline</span>
                  <strong className="text-slate-200">
                    {context.astronaut.restingHeartRate !== null
                      ? `${context.astronaut.restingHeartRate} bpm`
                      : 'Not recorded'}
                  </strong>
                </div>
                <div className="rounded-lg bg-slate-900/70 border border-slate-800 px-2.5 py-1.5">
                  <span className="text-[10px] text-slate-400 block">Spine Elongation</span>
                  <strong className="text-slate-200">
                    {context.astronaut.spineElongation !== null
                      ? `+${context.astronaut.spineElongation} cm`
                      : 'Not recorded'}
                  </strong>
                </div>
              </div>

              <div className="text-xs space-y-2">
                <div>
                  <span className="text-slate-400 font-mono text-[10px] uppercase block">
                    Recorded Allergies
                  </span>
                  <p className="text-slate-200 mt-0.5 text-[11px]">
                    {context.astronaut.allergiesRecorded
                      ? context.astronaut.allergies.length > 0
                        ? context.astronaut.allergies.join(', ')
                        : 'None recorded'
                      : 'Not recorded in crew summary'}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-mono text-[10px] uppercase block">
                    Reported Symptoms ({context.activeSymptoms.length})
                  </span>
                  {context.activeSymptoms.length > 0 ? (
                    <ul className="mt-1 space-y-1">
                      {context.activeSymptoms.slice(0, 3).map((sym) => (
                        <li
                          key={sym.id}
                          className="text-slate-200 bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1.5 flex items-center justify-between"
                        >
                          <span className="truncate">
                            {sym.bodyPart} ({sym.painType})
                          </span>
                          <span className="font-mono text-[10px] text-[#FF8C00] shrink-0 ml-2">
                            {sym.intensity > 0 ? `${sym.intensity}/10` : 'Unscored'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-400 mt-0.5">No active symptoms logged.</p>
                  )}
                </div>

                <div>
                  <span className="text-slate-400 font-mono text-[10px] uppercase block">
                    Active Restrictions ({context.activeRestrictions.length})
                  </span>
                  {context.activeRestrictions.length > 0 ? (
                    <ul className="mt-1 space-y-1">
                      {context.activeRestrictions.slice(0, 2).map((res) => (
                        <li
                          key={res.id}
                          className="text-amber-200 bg-[#FF8C00]/10 border border-[#FF8C00]/30 rounded-lg px-2.5 py-1.5 text-[11px]"
                        >
                          {res.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-400 mt-0.5">None active in record.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quick Scenario Prompts */}
          <div className="rounded-2xl border border-slate-800 bg-[#070d1e]/90 backdrop-blur-xl p-5 space-y-2.5">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>Quick Triage Protocol Tests</span>
            </div>
            <button
              type="button"
              onClick={() =>
                handleSendMessage('Can you review my current vital signs and sleep recovery?')
              }
              className="w-full text-left text-xs px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-400/50 text-slate-200 transition-colors cursor-pointer"
            >
              Level 1 (Low Risk): Routine vitals review
            </button>
            <button
              type="button"
              onClick={() =>
                handleSendMessage(
                  'I feel mild dizziness, fatigue, and difficulty concentrating without any chest pain or shortness of breath.'
                )
              }
              className="w-full text-left text-xs px-3 py-2 rounded-xl bg-amber-950/25 border border-amber-500/35 hover:border-amber-400 text-amber-100 transition-colors cursor-pointer"
            >
              Level 2 (Attention): Mild dizziness, fatigue &amp; focus (No emergency)
            </button>
            <button
              type="button"
              onClick={() =>
                handleSendMessage(
                  'My dizziness is getting rapidly worse, the room feels like it is spinning, and I cannot stand steady.'
                )
              }
              className="w-full text-left text-xs px-3 py-2 rounded-xl bg-[#FF8C00]/15 border border-[#FF8C00]/40 hover:border-[#FF8C00] text-amber-100 transition-colors cursor-pointer"
            >
              Level 3 (Urgent): Worsening spinning vertigo
            </button>
            <button
              type="button"
              onClick={() =>
                handleSendMessage(
                  'I am experiencing sudden severe chest pain and shortness of breath right now.'
                )
              }
              className="w-full text-left text-xs px-3 py-2 rounded-xl bg-rose-950/35 border border-rose-500/40 hover:border-rose-400 text-rose-200 transition-colors cursor-pointer flex items-center gap-2"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Level 4 (Emergency): Critical chest pain (Zero-Wait Override)</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Separated Active Communication Channel */}
        <div className="lg:col-span-8 space-y-4">
          <div
            className={`flex flex-col rounded-2xl border bg-[#070d1e]/90 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden min-h-[640px] max-h-[780px] ${
              activeChannel === 'doctor' ? 'border-emerald-500/35' : 'border-[#00E5FF]/35'
            }`}
          >
            {/* Active Channel Header */}
            <div className="px-5 py-4 border-b border-slate-800 bg-[#091129]/90 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
                      activeChannel === 'doctor'
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400'
                        : 'bg-[#00E5FF]/15 border-[#00E5FF]/50 text-[#00E5FF]'
                    }`}
                  >
                    {activeChannel === 'doctor' ? (
                      <Stethoscope className="w-5 h-5" />
                    ) : (
                      <Bot className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#091129] ${
                      activeChannel === 'doctor' ? 'bg-emerald-400' : 'bg-[#00E5FF]'
                    }`}
                  />
                </div>
                <div>
                  <div className="text-sm font-bold text-white font-['Chakra_Petch',sans-serif] flex items-center gap-2">
                    <span>
                      {activeChannel === 'doctor'
                        ? 'DOCTOR CHAT — Direct Flight Surgeon Channel'
                        : 'AI CHAT — ASTRA AI Medical Assistant'}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase ${
                        activeChannel === 'doctor'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40'
                      }`}
                    >
                      {activeChannel === 'doctor' ? 'Physician Only' : 'AI Channel Only'}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    {context
                      ? `Patient: ${context.astronaut.name} (${context.astronaut.id}) · Channel Isolation Enforced`
                      : 'Synchronizing telemetry...'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClearActiveChannel}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-[11px] font-mono text-slate-300 hover:text-white hover:border-slate-500 transition-colors cursor-pointer"
                title="Clear active channel history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Reset {activeChannel === 'doctor' ? 'Doctor' : 'AI'} Thread
              </button>
            </div>

            {/* Channel Status & SLA Countdown Banners */}
            {activeChannel === 'doctor' && !timerState?.isWaiting && (
              <div className="px-5 py-2.5 bg-emerald-950/35 border-b border-emerald-500/30 flex items-center justify-between gap-2 text-xs text-emerald-200">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong>Doctor Available:</strong> Communicating directly with Dr. Marcus Vance. AI Medical Assistant is hidden and will not interfere.
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-300 shrink-0">
                  SLA: {timeoutBadge} WAIT WINDOW
                </span>
              </div>
            )}

            {activeChannel === 'doctor' && timerState?.isWaiting && (
              <div className="px-5 py-3 bg-[#FF8C00]/15 border-b border-[#FF8C00]/45 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs text-amber-100">
                  <Clock className="w-4 h-4 text-[#FF8C00] shrink-0 animate-pulse" />
                  <div>
                    <span className="font-bold text-[#FF8C00]">
                      Awaiting Flight Surgeon Reply — Server SLA Countdown:{' '}
                      <span className="font-mono text-white text-sm ml-1">
                        {formatCountdownMs(remainingMs)}
                      </span>
                    </span>
                    <div className="text-[11px] text-amber-200/80">
                      Configured timeout: {formatTimeoutHuman(timerState.timeoutSeconds)}. If Dr. Vance does not respond before expiration, ASTRA AI Medical Assistant will take over automatically (even if browser is closed).
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeChannel === 'ai' && timerState?.aiTakeoverActive && (
              <div className="px-5 py-3 bg-[#FF8C00]/15 border-b border-[#FF8C00]/50 flex items-center justify-between gap-3 text-xs text-amber-100">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-[#FF8C00] shrink-0" />
                  <div>
                    <strong className="text-[#FF8C00]">AI Temporary Takeover Active:</strong>{' '}
                    Flight Surgeon has not responded within {timeoutHuman}. ASTRA AI Medical Assistant is providing temporary initial support and has notified the Flight Surgeon.
                  </div>
                </div>
              </div>
            )}

            {activeChannel === 'ai' && !timerState?.aiTakeoverActive && (
              <div className="px-5 py-2.5 bg-[#00E5FF]/10 border-b border-[#00E5FF]/30 flex items-center justify-between gap-2 text-xs text-cyan-100">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#00E5FF] shrink-0" />
                  <span>
                    <strong>Doctor Unavailable:</strong> Flight Surgeon is marked Unavailable. Messages route to ASTRA AI Medical Assistant only and are saved for doctor review.
                  </span>
                </div>
              </div>
            )}

            {errorBanner && (
              <div className="px-5 py-2.5 bg-rose-950/60 border-b border-rose-500/40 text-xs text-rose-200 flex items-center justify-between">
                <span>{errorBanner}</span>
                <button
                  type="button"
                  onClick={() => setErrorBanner(null)}
                  className="text-rose-300 hover:text-white font-mono text-[11px] cursor-pointer"
                >
                  DISMISS
                </button>
              </div>
            )}

            {/* Active Channel Message History */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {context?.history?.map((msg: MedicalAssistantMessage) => {
                if (msg.sender === 'system') {
                  return (
                    <div key={msg.id} className="flex justify-center my-2">
                      <div className="px-4 py-2 rounded-xl bg-[#FF8C00]/15 border border-[#FF8C00]/45 text-xs font-mono text-amber-200 text-center max-w-2xl">
                        {msg.content}
                      </div>
                    </div>
                  );
                }

                const isAstronaut = msg.sender === 'astronaut';
                const isSurgeon = msg.sender === 'flight_surgeon';
                const isEmergency = msg.triageLevel === 'emergency';
                const isUrgent = msg.triageLevel === 'urgent';
                const isAttention = msg.triageLevel === 'attention_required';
                const triageBadge = !isAstronaut && !isSurgeon ? getTriageBadgeMeta(msg.triageLevel) : null;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isAstronaut ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl p-4 border shadow-lg ${
                        isAstronaut
                          ? 'bg-[#00E5FF]/15 border-[#00E5FF]/45 text-slate-100 rounded-tr-sm'
                          : isSurgeon
                          ? 'bg-emerald-950/35 border-emerald-500/50 text-slate-100 rounded-tl-sm'
                          : isEmergency
                          ? 'bg-rose-950/45 border-rose-500/70 text-slate-100 rounded-tl-sm'
                          : isUrgent
                          ? 'bg-[#FF8C00]/10 border-[#FF8C00]/60 text-slate-100 rounded-tl-sm'
                          : isAttention
                          ? 'bg-amber-950/25 border-amber-500/50 text-slate-100 rounded-tl-sm'
                          : 'bg-[#0b152f] border-[#00E5FF]/40 text-slate-100 rounded-tl-sm'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {isSurgeon && <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />}
                          {!isAstronaut && !isSurgeon && (
                            <Bot
                              className={`w-3.5 h-3.5 ${
                                isEmergency
                                  ? 'text-rose-400'
                                  : isUrgent
                                  ? 'text-[#FF8C00]'
                                  : isAttention
                                  ? 'text-amber-300'
                                  : 'text-[#00E5FF]'
                              }`}
                            />
                          )}
                          <span
                            className={`text-xs font-mono font-bold ${
                              isAstronaut
                                ? 'text-[#00E5FF]'
                                : isSurgeon
                                ? 'text-emerald-300'
                                : isEmergency
                                ? 'text-rose-300'
                                : isUrgent
                                ? 'text-[#FF8C00]'
                                : isAttention
                                ? 'text-amber-300'
                                : 'text-[#00E5FF]'
                            }`}
                          >
                            {msg.senderName}
                          </span>
                          {triageBadge && (
                            <span
                              className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${triageBadge.classes}`}
                            >
                              {triageBadge.label}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                      </div>

                      {msg.protocolBasis && !isAstronaut && !isSurgeon && (
                        <div className="mb-2 text-[10px] font-mono text-slate-400 bg-slate-950/50 border border-slate-800 rounded-lg px-2.5 py-1">
                          {msg.protocolBasis}
                        </div>
                      )}

                      <p className="text-sm leading-relaxed text-slate-100 whitespace-pre-line">
                        {msg.content}
                      </p>

                      {msg.vitalsSnapshot && (
                        <div className="mt-2.5 pt-2 border-t border-[#00E5FF]/25 flex flex-wrap gap-2 text-[10px] font-mono text-slate-300">
                          <span className="px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700">
                            HR {msg.vitalsSnapshot.heartRate} bpm
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700">
                            BP {msg.vitalsSnapshot.bloodPressure}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700">
                            SpO2 {msg.vitalsSnapshot.spO2}%
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700">
                            Temp {msg.vitalsSnapshot.temperature}°C
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700">
                            RR{' '}
                            {msg.vitalsSnapshot.respiratoryRate !== null
                              ? `${msg.vitalsSnapshot.respiratoryRate}/min`
                              : 'Not recorded'}
                          </span>
                        </div>
                      )}

                      {msg.verifiedRecordsUsed && msg.verifiedRecordsUsed.length > 0 && (
                        <div className="mt-3 rounded-xl bg-slate-950/75 border border-slate-700/80 p-3 space-y-1">
                          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                            <FileText className="w-3 h-3 text-slate-400" />
                            <span>Verified Medical &amp; Telemetry Records Referenced</span>
                          </div>
                          <ul className="space-y-0.5 text-[11px] font-mono text-slate-300 list-disc list-inside">
                            {msg.verifiedRecordsUsed.map((rec, i) => (
                              <li key={i}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {msg.vitalObservations && msg.vitalObservations.length > 0 && (
                        <div className="mt-3 rounded-xl bg-slate-900/75 border border-[#00E5FF]/35 p-3 space-y-1">
                          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#00E5FF]">
                            AI-Generated Clinical Observations (Non-Diagnostic)
                          </div>
                          <ul className="space-y-1 text-xs text-slate-200 list-disc list-inside">
                            {msg.vitalObservations.map((obs, i) => (
                              <li key={i}>{obs}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                        <div className="mt-3 rounded-xl bg-indigo-950/35 border border-indigo-400/40 p-3 space-y-1">
                          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                            <HelpCircle className="w-3 h-3" />
                            <span>Follow-Up Assessment Questions (Please Reply)</span>
                          </div>
                          <ol className="space-y-1 text-xs text-indigo-100 list-decimal list-inside">
                            {msg.followUpQuestions.map((q, i) => (
                              <li key={i}>{q}</li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {msg.emergencyInstructions && msg.emergencyInstructions.length > 0 && (
                        <div className="mt-3 rounded-xl bg-rose-950/45 border border-rose-500/50 p-3 space-y-1">
                          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-300">
                            Immediate Emergency Instructions
                          </div>
                          <ol className="space-y-1 text-xs text-rose-100 list-decimal list-inside">
                            {msg.emergencyInstructions.map((step, i) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {msg.firstAidSteps && msg.firstAidSteps.length > 0 && (
                        <div className="mt-3 rounded-xl bg-emerald-950/35 border border-emerald-500/35 p-3 space-y-1">
                          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300">
                            Safe Initial Guidance &amp; Monitoring Steps
                          </div>
                          <ol className="space-y-1 text-xs text-slate-200 list-decimal list-inside">
                            {msg.firstAidSteps.map((step, i) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {msg.disclaimer && (
                        <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 leading-relaxed">
                          {msg.disclaimer}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isTypingAI && (
                <div className="flex items-start">
                  <div className="rounded-2xl rounded-tl-sm bg-[#0b152f] border border-[#00E5FF]/40 px-4 py-3 flex items-center gap-3 text-xs font-mono text-[#00E5FF]">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-bounce" />
                    </div>
                    <span>ASTRA AI analyzing live telemetry & symptom context...</span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Astronaut Message Composer (Routes strictly to ACTIVE channel only) */}
            <div className="p-4 border-t border-slate-800 bg-[#091129]/95 space-y-2.5">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex flex-col sm:flex-row gap-2.5"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={
                    activeChannel === 'doctor'
                      ? 'Send message directly to Flight Surgeon Dr. Marcus Vance...'
                      : 'Flight Surgeon inactive — message ASTRA AI Medical Assistant...'
                  }
                  disabled={isSending || isTypingAI}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:border-[#00E5FF] focus:outline-none disabled:opacity-60"
                />

                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isSending || isTypingAI}
                  className={`px-5 py-3 rounded-xl font-mono font-extrabold text-xs transition-colors disabled:opacity-45 cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${
                    activeChannel === 'doctor'
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                      : 'bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black'
                  }`}
                >
                  {activeChannel === 'doctor' ? (
                    <>
                      <Stethoscope className="w-4 h-4" />
                      Send to Doctor
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send to AI Assistant
                    </>
                  )}
                </button>
              </form>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
                <span>
                  SAFETY & CHANNEL ISOLATION: Doctor Chat and AI Chat are strictly separated · Emergency detection overrides all timeouts immediately.
                </span>
                <span className="text-[#00E5FF]">SERVER SLA TRACKING: ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Authorized Flight Surgeon Direct Response Console */}
          <div className="rounded-2xl border border-emerald-500/30 bg-[#070d1e]/90 backdrop-blur-xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5" />
                <span>Authorized Flight Surgeon Reply Console (Dr. Marcus Vance · NASA-FS-9842)</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Replying resets/stops the {timeoutHuman} timer & restores Doctor Chat
              </span>
            </div>

            <form onSubmit={handleSurgeonReply} className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={surgeonReplyDraft}
                onChange={(e) => setSurgeonReplyDraft(e.target.value)}
                placeholder="Type official Flight Surgeon response (or leave blank for standard clinical check-in)..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSendingSurgeonReply}
                className="px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30 font-mono font-bold text-xs transition-colors cursor-pointer shrink-0"
              >
                {isSendingSurgeonReply ? 'Transmitting...' : 'Send Doctor Reply'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Authorized Flight Surgeon Modal: Review Saved AI Conversation History */}
      {isAiAuditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl bg-[#091129] border border-[#00E5FF]/50 shadow-[0_0_50px_rgba(0,229,255,0.3)] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-[#00E5FF]" />
                <div>
                  <h3 className="text-sm font-bold text-white font-['Chakra_Petch',sans-serif]">
                    Authorized Flight Surgeon Review — Saved AI Conversation Archive
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400">
                    Astronaut: {context?.astronaut.name} ({selectedAstronautId}) · Separate from Doctor Chat
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAiAuditOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {isLoadingAudit ? (
                <div className="py-10 text-center text-xs font-mono text-slate-400">
                  Verifying credentials & retrieving saved AI transcript...
                </div>
              ) : auditMessages.length === 0 ? (
                <div className="py-10 text-center text-xs font-mono text-slate-400">
                  No AI assistant conversations recorded for this astronaut.
                </div>
              ) : (
                auditMessages.map((m) => {
                  const badge = m.sender === 'ai_assistant' ? getTriageBadgeMeta(m.triageLevel) : null;
                  return (
                    <div
                      key={m.id}
                      className={`rounded-xl border p-3.5 text-xs ${
                        m.sender === 'astronaut'
                          ? 'bg-[#00E5FF]/10 border-[#00E5FF]/35'
                          : m.sender === 'system'
                          ? 'bg-[#FF8C00]/10 border-[#FF8C00]/40 text-amber-200'
                          : 'bg-slate-900/90 border-slate-700'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] text-slate-400 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#00E5FF]">{m.senderName}</span>
                          {badge && (
                            <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold ${badge.classes}`}>
                              {badge.label}
                            </span>
                          )}
                        </div>
                        <span>{new Date(m.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-100 leading-relaxed whitespace-pre-line">{m.content}</p>
                      {m.followUpQuestions && m.followUpQuestions.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-indigo-200">
                          <span className="font-mono text-[10px] text-indigo-300 uppercase">Follow-Up Questions: </span>
                          {m.followUpQuestions.join(' | ')}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
