import React, { useState, useEffect, useRef } from 'react';
import {
  Dumbbell,
  Lock,
  Unlock,
  AlertTriangle,
  Sparkles,
  Play,
  Timer,
  Flame,
  Star,
  Activity,
  Shield,
  MessageSquare,
  RefreshCw,
  Send,
  Target,
  CheckCircle2,
  Heart,
  Sliders,
  FileText,
  Download,
  Copy,
  Check,
  X,
  ListChecks,
  ShieldAlert,
  Bone,
  Zap,
} from 'lucide-react';
import {
  AstronautProfile,
  SpaceExercise,
  FitnessAIAnalysis,
  ExerciseCategory,
  WorkoutSessionLog,
} from '../types/astronaut.ts';
import { WorkoutSessionModal } from './WorkoutSessionModal.tsx';
import { ProtocolAdherenceChart } from './ProtocolAdherenceChart.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';

// ─── Props ───────────────────────────────────────────────────────────────────
interface FitnessPageProps {
  profile: AstronautProfile;
}

// ─── Category tab config ─────────────────────────────────────────────────────
const CATEGORY_TABS: { label: string; value: ExerciseCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Upper Body', value: 'Upper Body' },
  { label: 'Lower Body', value: 'Lower Body' },
  { label: 'Core', value: 'Core' },
  { label: 'Full Body', value: 'Full Body' },
];

// ─── Intensity badge colours ─────────────────────────────────────────────────
const INTENSITY_COLOURS: Record<string, string> = {
  Low: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
  Moderate: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
  High: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
};

// ─── Component ───────────────────────────────────────────────────────────────
export const FitnessPage: React.FC<FitnessPageProps> = ({ profile }) => {
  const { user, role } = useAuth();
  // ── State ────────────────────────────────────────────────────────────────
  const [exercises, setExercises] = useState<SpaceExercise[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'all'>('all');
  const [isLoadingExercises, setIsLoadingExercises] = useState(true);
  const [exercisesError, setExercisesError] = useState<string | null>(null);

  const [aiAnalysis, setAiAnalysis] = useState<FitnessAIAnalysis | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(true);
  const [aiError, setAiError] = useState<string | null>(null);

  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState<string | null>(null);
  const [isChatting, setIsChatting] = useState(false);

  // Workout Session & Playlist Queue State
  const [activeWorkoutExercise, setActiveWorkoutExercise] = useState<SpaceExercise | null>(null);
  const [activePlaylist, setActivePlaylist] = useState<SpaceExercise[]>([]);
  const [playlistIndex, setPlaylistIndex] = useState<number>(0);

  const [completedSessions, setCompletedSessions] = useState<WorkoutSessionLog[]>([]);
  const [sessionToast, setSessionToast] = useState<string | null>(null);

  // Enhancement 1: Flight Surgeon Override & Crew Biometrics Simulator State
  const [globalSurgeonOverride, setGlobalSurgeonOverride] = useState<boolean>(false);
  const [overriddenExerciseIds, setOverriddenExerciseIds] = useState<string[]>([]);
  const [showSimulator, setShowSimulator] = useState<boolean>(false);
  const [simSpineElongation, setSimSpineElongation] = useState<number>(profile.spineElongation || 4.2);
  const [simHeartRate, setSimHeartRate] = useState<number>(72);
  const [simLumbarResolved, setSimLumbarResolved] = useState<boolean>(false);

  // Enhancement 5: Telemetry Report Modal State
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  const chatInputRef = useRef<HTMLInputElement | null>(null);

  // ── Fetch completed workout sessions ─────────────────────────────────────
  const fetchWorkoutSessions = async () => {
    try {
      const res = await fetch('/api/fitness/sessions');
      if (res.ok) {
        const json = await res.json();
        setCompletedSessions(json.data ?? []);
      }
    } catch {
      // Handled gracefully by local state
    }
  };

  // ── Fetch exercises ──────────────────────────────────────────────────────
  const fetchExercises = async (category?: ExerciseCategory | 'all') => {
    setIsLoadingExercises(true);
    setExercisesError(null);
    try {
      const url =
        category && category !== 'all'
          ? `/api/fitness/exercises/${encodeURIComponent(category)}`
          : '/api/fitness/exercises';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load exercises');
      const json = await res.json();
      setExercises(json.data ?? json.exercises ?? json ?? []);
    } catch (err: any) {
      setExercisesError(err.message || 'Unable to load exercises');
    } finally {
      setIsLoadingExercises(false);
    }
  };

  // ── AI analysis ──────────────────────────────────────────────────────────
  const fetchAIAnalysis = async () => {
    setIsLoadingAI(true);
    setAiError(null);
    try {
      const res = await fetch('/api/fitness/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('AI analysis unavailable');
      const json = await res.json();
      const analysis: FitnessAIAnalysis = json.data ?? json.analysis ?? json;
      setAiAnalysis(analysis);
    } catch (err: any) {
      setAiError(err.message || 'AI analysis unavailable');
    } finally {
      setIsLoadingAI(false);
    }
  };

  // ── Chat submit ──────────────────────────────────────────────────────────
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = chatInput.trim();
    if (!q || isChatting) return;
    setIsChatting(true);
    setChatResponse(null);
    setChatInput('');

    try {
      const res = await fetch('/api/fitness/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q }),
      });
      if (!res.ok) throw new Error('Chat service unavailable');
      const json = await res.json();
      setChatResponse(json.reply || 'Commander Vance received your transmission.');
    } catch {
      setChatResponse(
        'Communication telemetry link momentarily disrupted. Flight Surgeon protocol: Defer heavy axial spinal loading.'
      );
    } finally {
      setIsChatting(false);
    }
  };

  // ── Initial data load ────────────────────────────────────────────────────
  useEffect(() => {
    fetchExercises();
    fetchAIAnalysis();
    fetchWorkoutSessions();
  }, []);

  // ── Re-fetch exercises when category changes ─────────────────────────────
  useEffect(() => {
    fetchExercises(selectedCategory);
  }, [selectedCategory]);

  // ── Compute effective exercise status factoring Biometrics Simulator & Surgeon Override ──
  const evaluatedExercises = exercises.map((ex) => {
    const isCardOverridden =
      globalSurgeonOverride || overriddenExerciseIds.includes(ex.id);

    // Dynamic Biometrics Simulation Evaluation
    const hasSpinalRisk = simSpineElongation > 3.0;
    const hasElevatedHrRisk = simHeartRate - (profile.restingHeartRate || 58) > 15;

    let simRestricted = false;
    let simReason = ex.warningMessage || ex.restrictionReason || '';

    if (simLumbarResolved && !hasSpinalRisk && !hasElevatedHrRisk) {
      simRestricted = false;
    } else {
      const ruleText = ex.contraindications.join(' ').toLowerCase();
      if (hasSpinalRisk && (ruleText.includes('spinal') || ruleText.includes('disc') || ruleText.includes('axial'))) {
        simRestricted = true;
        simReason = `Spinal elongation +${simSpineElongation.toFixed(1)} cm exceeds 3.0 cm threshold for axial loading.`;
      } else if (!simLumbarResolved && (ruleText.includes('back') || ruleText.includes('lumbar') || ruleText.includes('fluid'))) {
        simRestricted = ex.status === 'restricted';
      } else if (hasElevatedHrRisk && ex.intensity === 'High') {
        simRestricted = true;
        simReason = `Simulated Heart Rate (${simHeartRate} bpm) exceeds safe high-intensity threshold.`;
      }
    }

    const effectiveRestricted = simRestricted && !isCardOverridden;
    const effectiveStatus: SpaceExercise['status'] = effectiveRestricted
      ? 'restricted'
      : ex.status === 'recommended' || (!simRestricted && ex.intensity !== 'High')
      ? 'recommended'
      : 'available';

    return {
      ...ex,
      effectiveRestricted,
      isCardOverridden: simRestricted && isCardOverridden,
      effectiveStatus,
      effectiveReason: simReason,
    };
  });

  const toggleSingleCardOverride = (exerciseId: string) => {
    setOverriddenExerciseIds((prev) =>
      prev.includes(exerciseId)
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  // ── Launch Full Daily Protocol Playlist ──────────────────────────────────
  const handleLaunchDailyProtocol = () => {
    const clearedList = evaluatedExercises.filter((e) => !e.effectiveRestricted);
    if (clearedList.length === 0) return;
    // Prefer recommended exercises first
    const recommendedFirst = [
      ...clearedList.filter((e) => e.effectiveStatus === 'recommended'),
      ...clearedList.filter((e) => e.effectiveStatus !== 'recommended'),
    ].slice(0, 4);

    setActivePlaylist(recommendedFirst);
    setPlaylistIndex(0);
    setActiveWorkoutExercise(recommendedFirst[0]);
  };

  const handleStartSingleExercise = (exercise: SpaceExercise) => {
    setActivePlaylist([]);
    setPlaylistIndex(0);
    setActiveWorkoutExercise(exercise);
  };

  const handleSessionCompleted = (
    newSession: WorkoutSessionLog,
    advanceToNext = false
  ) => {
    setCompletedSessions((prev) => [newSession, ...prev]);

    if (
      advanceToNext &&
      activePlaylist.length > 1 &&
      playlistIndex < activePlaylist.length - 1
    ) {
      const nextIdx = playlistIndex + 1;
      setPlaylistIndex(nextIdx);
      setActiveWorkoutExercise(activePlaylist[nextIdx]);
      setSessionToast(
        `Logged "${newSession.exerciseName}". Advancing to Protocol Step ${nextIdx + 1}: ${activePlaylist[nextIdx].name}`
      );
      setTimeout(() => setSessionToast(null), 5000);
      return;
    }

    setActiveWorkoutExercise(null);
    setActivePlaylist([]);
    setSessionToast(
      `Workout "${newSession.exerciseName}" (${newSession.durationMinutes} min · ${newSession.caloriesBurned} kcal) synchronized to Ground Telemetry & Medical Timeline.`
    );
    setTimeout(() => setSessionToast(null), 6000);
  };

  // ── Derived stats & Countermeasure Atrophy Shield Indices ────────────────
  const totalExercises = evaluatedExercises.length;
  const restrictedCount = evaluatedExercises.filter((e) => e.effectiveRestricted).length;
  const availableCount = totalExercises - restrictedCount;
  const estimatedDailyCalories = evaluatedExercises
    .filter((e) => !e.effectiveRestricted)
    .reduce((sum, e) => sum + e.caloriesBurned, 0);
  const fitnessReadiness =
    totalExercises > 0 ? Math.round((availableCount / totalExercises) * 100) : 0;

  const totalLoggedMinutes = completedSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalLoggedCalories = completedSessions.reduce((sum, s) => sum + s.caloriesBurned, 0);
  const dailyTargetMinutes = 150; // NASA ISS 2.5-hour daily countermeasure standard
  const protocolProgressPct = Math.min(
    100,
    Math.round((totalLoggedMinutes / dailyTargetMinutes) * 100)
  );

  // Enhancement 3: Bone, Muscle & Cardiovascular Countermeasure Protection Scores
  const lowerAndFullSessions = completedSessions.filter(
    (s) => s.category === 'Lower Body' || s.category === 'Full Body'
  ).length;
  const resistanceMinutes = completedSessions
    .filter((s) => s.equipment.includes('ARED') || s.equipment.includes('Band'))
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  const osteogenicBoneIndex = Math.min(
    100,
    Math.round(58 + lowerAndFullSessions * 14 + totalLoggedMinutes * 0.25)
  );
  const muscleRetentionIndex = Math.min(
    100,
    Math.round(62 + resistanceMinutes * 0.65 + completedSessions.length * 6)
  );
  const cardioOrthostaticIndex = Math.min(
    100,
    Math.round(60 + totalLoggedCalories * 0.08 + totalLoggedMinutes * 0.3)
  );

  // Enhancement 5: Generate Formatted Ground Control Telemetry Report
  const buildTelemetryReportText = () => {
    const lines = [
      '====================================================================',
      'NASA JOHNSON SPACE CENTER — FLIGHT SURGEON COUNTERMEASURE REPORT',
      '====================================================================',
      `TIMESTAMP:          ${new Date().toISOString()}`,
      `CREW MEMBER:        ${profile.name} (${profile.callsign})`,
      `MISSION:            ${profile.missionId} · MET DAY ${profile.missionElapsedDays}`,
      `ACTIVE OPERATOR:    ${user ? `${user.name} (${user.callsignOrCredential})` : profile.name}`,
      `SIMULATED SPINE:    +${simSpineElongation.toFixed(1)} cm (Baseline threshold: 3.0 cm)`,
      `HEART RATE STATUS:  ${simHeartRate} bpm (Resting baseline: ${profile.restingHeartRate} bpm)`,
      `SURGEON OVERRIDE:   ${globalSurgeonOverride ? 'GLOBAL CLEARANCE ACTIVE' : overriddenExerciseIds.length > 0 ? `${overriddenExerciseIds.length} PROTOCOL(S) OVERRIDDEN` : 'STANDARD SAFETY LOCKS'}`,
      '',
      '--- COUNTERMEASURE PROTECTION INDICES ---',
      `• Osteogenic Bone Density Shield (BMD):     ${osteogenicBoneIndex}%`,
      `• Myofibrillar Muscle Retention Shield:     ${muscleRetentionIndex}%`,
      `• Cardiovascular & Orthostatic Tolerance:   ${cardioOrthostaticIndex}%`,
      `• Daily Countermeasure Volume:              ${totalLoggedMinutes} / ${dailyTargetMinutes} min (${totalLoggedCalories} kcal)`,
      '',
      '--- AI FITNESS ASSESSMENT ---',
      aiAnalysis?.overallAssessment || 'Nominal countermeasure evaluation.',
      '',
      '--- DAILY EXERCISE PRESCRIPTION ---',
      aiAnalysis?.dailyPlan || 'Standard microgravity countermeasure sequence.',
      '',
      '--- ACTIVE EXERCISE CATALOG STATUS (9 PROTOCOLS) ---',
      ...evaluatedExercises.map(
        (e) =>
          `[${e.effectiveRestricted ? 'RESTRICTED' : e.isCardOverridden ? 'OVERRIDDEN' : e.effectiveStatus.toUpperCase()}] ${e.name} (${e.category} · ${e.equipment} · ${e.durationMinutes}m · ${e.caloriesBurned} kcal)`
      ),
      '',
      '--- COMPLETED WORKOUT SESSIONS TODAY ---',
      ...completedSessions.map(
        (s) =>
          `• ${s.exerciseName} | ${s.durationMinutes} min | ${s.caloriesBurned} kcal | Avg HR: ${s.avgHeartRate} bpm (Peak ${s.peakHeartRate} bpm)`
      ),
      '====================================================================',
    ];
    return lines.join('\n');
  };

  const handleDownloadTxtReport = () => {
    const content = buildTelemetryReportText();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NASA-Countermeasure-Report-MET${profile.missionElapsedDays}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJsonReport = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      astronaut: {
        name: profile.name,
        callsign: profile.callsign,
        missionId: profile.missionId,
        missionElapsedDays: profile.missionElapsedDays,
        spineElongationCm: simSpineElongation,
        heartRateBpm: simHeartRate,
      },
      countermeasureIndices: {
        osteogenicBoneIndex,
        muscleRetentionIndex,
        cardioOrthostaticIndex,
        totalLoggedMinutes,
        totalLoggedCalories,
      },
      aiAnalysis,
      exercises: evaluatedExercises.map((e) => ({
        id: e.id,
        name: e.name,
        category: e.category,
        status: e.effectiveStatus,
        overridden: e.isCardOverridden,
      })),
      completedSessions,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NASA-Countermeasure-Telemetry-MET${profile.missionElapsedDays}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(buildTelemetryReportText()).catch(() => {});
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Session Logged Toast Notification */}
      {sessionToast && (
        <div className="p-4 rounded-xl bg-emerald-950/90 border border-emerald-400/60 text-emerald-200 font-mono text-xs flex items-center justify-between gap-3 shadow-[0_0_25px_rgba(16,185,129,0.3)] animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{sessionToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSessionToast(null)}
            className="text-emerald-400 hover:text-white font-bold px-2 cursor-pointer"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          1. TOP HEADER BANNER + QUICK ACTIONS
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="glass-panel glass-panel-glow-cyan p-6 sm:p-7 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-5 border border-[#00E5FF]/40 shadow-[0_0_35px_rgba(0,229,255,0.22)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/50 flex items-center justify-center text-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.35)] shrink-0">
            <Dumbbell className="w-7 h-7 text-[#00E5FF]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Chakra_Petch',sans-serif] tracking-wide">
                Astronaut Fitness Protocol
              </h1>
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#00E5FF]/20 border border-[#00E5FF]/50 text-[#00E5FF]">
                EXERCISE RX
              </span>
              {role === 'surgeon' && user && (
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/20 border border-amber-400/50 text-amber-300">
                  SURGEON AUTH: {user.callsignOrCredential}
                </span>
              )}
            </div>
            <p className="text-sm font-sans text-slate-300 mt-1">
              Micro-gravity exercise prescription, countermeasure protocols, and AI fitness planning for{' '}
              <strong className="text-white">{profile.name}</strong>.
            </p>
          </div>
        </div>

        {/* Header Control Actions: Biometrics Simulator, Surgeon Override, Export Report */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setShowSimulator((s) => !s)}
            className={`px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
              showSimulator
                ? 'bg-[#00E5FF] text-slate-950 border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.4)]'
                : 'bg-slate-900/90 text-[#00E5FF] border-[#00E5FF]/40 hover:bg-[#00E5FF]/15'
            }`}
          >
            <Sliders className="w-4 h-4" />
            BIOMETRICS SIMULATOR
          </button>

          <button
            type="button"
            onClick={() => setGlobalSurgeonOverride((prev) => !prev)}
            className={`px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
              globalSurgeonOverride
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.45)]'
                : 'bg-slate-900/90 text-amber-300 border-amber-500/40 hover:bg-amber-500/15'
            }`}
            title="Unlock all restricted exercises with Flight Surgeon Clearance Override"
          >
            {globalSurgeonOverride ? (
              <>
                <Unlock className="w-4 h-4" />
                SURGEON OVERRIDE: ON
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                SURGEON OVERRIDE: OFF
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-[#00E5FF]/50 font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#00E5FF]" />
            TELEMETRY REPORT
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          1B. INTERACTIVE CREW BIOMETRICS & FLIGHT SURGEON SIMULATOR PANEL
      ═══════════════════════════════════════════════════════════════════ */}
      {showSimulator && (
        <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-[#00E5FF]/50 bg-[#061024]/95 space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <Sliders className="w-5 h-5 text-[#00E5FF]" />
              <div>
                <h3 className="text-base font-bold text-white font-['Chakra_Petch',sans-serif] uppercase tracking-wide">
                  Crew Biometrics & Contraindication Simulator
                </h3>
                <p className="text-xs font-sans text-slate-400">
                  Simulate real-time physiological changes to observe dynamic exercise locking and unlocking across the 9 NASA protocols.
                </p>
              </div>
            </div>

            {/* Scenario Preset Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setSimSpineElongation(4.2);
                  setSimHeartRate(72);
                  setSimLumbarResolved(false);
                  setGlobalSurgeonOverride(false);
                  setOverriddenExerciseIds([]);
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-200 font-mono text-[11px] font-bold cursor-pointer hover:bg-rose-500/30"
              >
                MET DAY 84 DEFAULT (+4.2cm SPINE)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSimSpineElongation(1.8);
                  setSimHeartRate(62);
                  setSimLumbarResolved(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 font-mono text-[11px] font-bold cursor-pointer hover:bg-emerald-500/30"
              >
                NOMINAL RECOVERY (ALL 9 UNLOCKED)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Spinal Elongation Slider */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-300 font-bold">
                  SPINAL ELONGATION
                </span>
                <span
                  className={`text-sm font-mono font-extrabold ${
                    simSpineElongation > 3.0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  +{simSpineElongation.toFixed(1)} cm
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.5"
                step="0.1"
                value={simSpineElongation}
                onChange={(e) => setSimSpineElongation(parseFloat(e.target.value))}
                className="w-full accent-[#00E5FF] cursor-pointer"
              />
              <div className="text-[11px] font-mono text-slate-400">
                Safety Threshold: ≤ +3.0 cm for ARED Squat / Deadlift axial loads
              </div>
            </div>

            {/* Simulated Heart Rate Slider */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-300 font-bold">
                  RESTING HEART RATE
                </span>
                <span
                  className={`text-sm font-mono font-extrabold ${
                    simHeartRate > 73 ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {simHeartRate} bpm
                </span>
              </div>
              <input
                type="range"
                min="54"
                max="95"
                step="1"
                value={simHeartRate}
                onChange={(e) => setSimHeartRate(parseInt(e.target.value, 10))}
                className="w-full accent-[#FF8C00] cursor-pointer"
              />
              <div className="text-[11px] font-mono text-slate-400">
                Flight Baseline: {profile.restingHeartRate} bpm (High HR locks High-Intensity)
              </div>
            </div>

            {/* Lumbar & Cephalic Fluid Shift Toggle */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-300 font-bold">
                  LUMBAR & FLUID STATUS
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    simLumbarResolved
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {simLumbarResolved ? 'CLEARED' : 'ACTIVE CAUTION'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSimLumbarResolved((prev) => !prev)}
                className={`w-full py-2 px-3 rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer ${
                  simLumbarResolved
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-[#00E5FF]/50'
                }`}
              >
                {simLumbarResolved
                  ? '✓ LUMBAR PAIN & FLUID SHIFT RESOLVED'
                  : 'RESOLVE LUMBAR PAIN & FLUID SHIFT'}
              </button>
              <div className="text-[11px] font-mono text-slate-400">
                Currently {availableCount} of {totalExercises} exercises unlocked
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          2. BONE & MUSCLE ATROPHY COUNTERMEASURE INDEX (ENHANCEMENT 3)
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Osteogenic Bone Density Shield */}
        <div className="glass-panel p-5 rounded-2xl border border-[#00E5FF]/35 bg-[#071026]/90 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40">
                <Bone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  OSTEOGENIC BMD SHIELD
                </div>
                <div className="text-sm font-bold text-white font-['Chakra_Petch',sans-serif]">
                  Bone Density Preservation
                </div>
              </div>
            </div>
            <span className="text-xl font-mono font-extrabold text-[#00E5FF]">
              {osteogenicBoneIndex}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-[#00E5FF] to-emerald-400 transition-all duration-500"
              style={{ width: `${osteogenicBoneIndex}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>ISS Target: ≥ 80% Osteogenic Load</span>
            <span className={osteogenicBoneIndex >= 80 ? 'text-emerald-400 font-bold' : 'text-amber-300 font-bold'}>
              {osteogenicBoneIndex >= 80 ? 'OPTIMAL SHIELD' : 'NEEDS LOADING'}
            </span>
          </div>
        </div>

        {/* Myofibrillar Muscle Retention Shield */}
        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/35 bg-[#071026]/90 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/40">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  MYOFIBRILLAR SHIELD
                </div>
                <div className="text-sm font-bold text-white font-['Chakra_Petch',sans-serif]">
                  Muscle Atrophy Defense
                </div>
              </div>
            </div>
            <span className="text-xl font-mono font-extrabold text-emerald-400">
              {muscleRetentionIndex}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-[#00E5FF] transition-all duration-500"
              style={{ width: `${muscleRetentionIndex}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>ARED Resistance Volume: {resistanceMinutes}m</span>
            <span className={muscleRetentionIndex >= 80 ? 'text-emerald-400 font-bold' : 'text-amber-300 font-bold'}>
              {muscleRetentionIndex >= 80 ? 'PROTECTED' : 'MODERATE'}
            </span>
          </div>
        </div>

        {/* Cardiovascular & Orthostatic Tolerance */}
        <div className="glass-panel p-5 rounded-2xl border border-[#FF8C00]/35 bg-[#071026]/90 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#FF8C00]/15 text-[#FF8C00] border border-[#FF8C00]/40">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  AEROBIC & ORTHOSTATIC
                </div>
                <div className="text-sm font-bold text-white font-['Chakra_Petch',sans-serif]">
                  Cardiovascular Conditioning
                </div>
              </div>
            </div>
            <span className="text-xl font-mono font-extrabold text-[#FFB347]">
              {cardioOrthostaticIndex}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-[#FF8C00] to-amber-300 transition-all duration-500"
              style={{ width: `${cardioOrthostaticIndex}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Active Burn: {totalLoggedCalories} kcal</span>
            <span className={cardioOrthostaticIndex >= 80 ? 'text-emerald-400 font-bold' : 'text-[#FFB347] font-bold'}>
              {cardioOrthostaticIndex >= 80 ? 'FLIGHT READY' : 'ACTIVE CONDITIONING'}
            </span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          2B. 7-DAY COUNTERMEASURE PROTOCOL ADHERENCE CHART (RECHARTS)
      ═══════════════════════════════════════════════════════════════════ */}
      <ProtocolAdherenceChart
        completedSessions={completedSessions}
        missionElapsedDays={profile.missionElapsedDays || 84}
        astronautCallsign={profile.callsign || 'Nova'}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          3. AI FITNESS ASSESSMENT PANEL + LAUNCH DAILY PROTOCOL PLAYLIST
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="glass-panel glass-panel-glow-orange p-6 sm:p-7 rounded-2xl border border-[#FF8C00]/40 shadow-[0_0_35px_rgba(255,140,0,0.2)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FF8C00]/20 text-[#FF8C00] border border-[#FF8C00]/40 shadow-[0_0_15px_rgba(255,140,0,0.3)]">
              <Sparkles className="w-6 h-6 text-[#FF8C00]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold text-white font-['Chakra_Petch',sans-serif] tracking-wide">
                  AI Fitness Assessment
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#FF8C00]/20 border border-[#FF8C00]/50 text-[#FFB347]">
                  ADAPTIVE AI ENGINE
                </span>
              </div>
              <p className="text-xs font-sans text-slate-300 mt-0.5">
                Personalised exercise analysis factoring microgravity, bone density, and cardiovascular status.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {availableCount > 0 && (
              <button
                type="button"
                onClick={handleLaunchDailyProtocol}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.45)] cursor-pointer"
              >
                <ListChecks className="w-4 h-4" />
                <span>LAUNCH DAILY PROTOCOL ({Math.min(4, availableCount)} EXERCISES)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setIsLoadingAI(true);
                fetchAIAnalysis();
              }}
              disabled={isLoadingAI}
              className="px-4 py-2 rounded-xl bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-black font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(255,140,0,0.4)] disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAI ? 'animate-spin' : ''}`} />
              <span>{isLoadingAI ? 'ANALYZING...' : 'RE-ANALYZE'}</span>
            </button>
          </div>
        </div>

        {/* AI Body */}
        {isLoadingAI && !aiAnalysis ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-2 border-[#FF8C00]/30 animate-ping" />
              <div className="absolute inset-2 rounded-full border-2 border-[#FF8C00]/50 animate-spin" />
              <div
                className="absolute inset-4 rounded-full border-2 border-t-[#FF8C00] border-r-transparent border-b-transparent border-l-transparent animate-spin"
                style={{ animationDuration: '0.6s' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Activity className="w-6 h-6 text-[#FF8C00] animate-pulse" />
              </div>
            </div>
            <div className="font-mono text-sm text-[#FF8C00] tracking-wider font-bold animate-pulse">
              COMPUTING EXERCISE TELEMETRY...
            </div>
            <div className="font-mono text-xs text-slate-400">
              Correlating bone density, muscle atrophy, and cardiovascular data
            </div>
          </div>
        ) : aiError ? (
          <div className="p-5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-sm font-sans flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{aiError}</span>
          </div>
        ) : aiAnalysis ? (
          <div className="p-5 rounded-xl bg-[#080f26]/90 border border-[#FF8C00]/30 shadow-inner space-y-4">
            {/* Overall Assessment */}
            <div>
              <div className="text-xs font-mono text-[#FFB347] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> OVERALL ASSESSMENT
              </div>
              <p className="text-sm sm:text-base font-sans text-slate-100 leading-relaxed">
                {aiAnalysis.overallAssessment}
              </p>
            </div>

            {/* Daily Plan */}
            <div>
              <div className="text-xs font-mono text-[#FFB347] font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5" /> DAILY EXERCISE PLAN
              </div>
              <div className="space-y-2">
                {aiAnalysis.dailyPlan
                  .split('\n')
                  .filter((line) => line.trim().length > 0)
                  .map((step, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm font-sans text-slate-200 flex items-start gap-3 hover:border-[#00E5FF]/40 transition-colors"
                    >
                      <span className="w-6 h-6 rounded-lg bg-[#FF8C00]/20 text-[#FF8C00] font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-[#FF8C00]/30">
                        {idx + 1}
                      </span>
                      <span className="flex-1 leading-relaxed">
                        {step.replace(/^\d+\.\s*/, '')}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Cautions */}
            {aiAnalysis.cautions && aiAnalysis.cautions.length > 0 && (
              <div>
                <div className="text-xs font-mono text-rose-400 font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> CAUTIONS & FLIGHT CONTRAINDICATIONS
                </div>
                <div className="space-y-2">
                  {aiAnalysis.cautions.map((c, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/25 text-sm font-sans text-rose-200 flex items-start gap-2.5"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
                {aiAnalysis.recommendations.map((r: string, i: number) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                  >
                    {r}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {/* Chat Input */}
        <div className="pt-3 border-t border-[#FF8C00]/20">
          <form onSubmit={handleChatSubmit} className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-[#FF8C00]/15 text-[#FF8C00] border border-[#FF8C00]/30">
              <MessageSquare className="w-4 h-4" />
            </div>
            <input
              ref={chatInputRef}
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about your fitness plan, exercises, or restrictions..."
              disabled={isChatting}
              className="flex-1 bg-slate-900/90 text-white border border-[#FF8C00]/30 rounded-xl px-4 py-2.5 text-sm font-sans placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isChatting || !chatInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
            >
              {isChatting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>ASK</span>
            </button>
          </form>

          {/* Chat response */}
          {chatResponse && (
            <div className="mt-3 p-4 rounded-xl bg-[#080f26]/90 border border-[#FF8C00]/25 text-sm font-sans text-slate-200 leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center gap-2 text-xs font-mono text-[#FFB347] font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" /> AI RESPONSE
              </div>
              {chatResponse}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          4. CATEGORY FILTER TABS
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedCategory(tab.value)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === tab.value
                  ? 'bg-[#00E5FF] text-black shadow-[0_0_20px_rgba(0,229,255,0.5)]'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-700 hover:border-[#00E5FF]/50'
              }`}
            >
              {tab.label.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="text-xs font-mono text-slate-400">
          SHOWING <span className="text-white font-bold">{evaluatedExercises.length}</span> NASA PROTOCOLS ·{' '}
          <span className="text-emerald-400 font-bold">{availableCount} CLEARED</span> ·{' '}
          <span className="text-rose-400 font-bold">{restrictedCount} RESTRICTED</span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          5. EXERCISE CARDS GRID
      ═══════════════════════════════════════════════════════════════════ */}
      {isLoadingExercises ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
          <RefreshCw className="w-8 h-8 text-[#00E5FF] animate-spin" />
          <div className="font-mono text-sm text-[#00E5FF] tracking-wider font-bold">
            LOADING EXERCISE PROTOCOLS...
          </div>
        </div>
      ) : exercisesError ? (
        <div className="glass-panel p-8 rounded-2xl text-center space-y-4 border border-rose-500/40">
          <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
          <div className="text-sm font-sans text-rose-300">{exercisesError}</div>
          <button
            onClick={() => fetchExercises(selectedCategory)}
            className="px-4 py-2 rounded-xl bg-[#00E5FF] text-black font-mono font-bold text-xs cursor-pointer"
          >
            RETRY
          </button>
        </div>
      ) : evaluatedExercises.length === 0 ? (
        <div className="glass-panel p-8 rounded-2xl text-center space-y-3 border border-slate-700">
          <Dumbbell className="w-10 h-10 text-slate-500 mx-auto" />
          <div className="text-sm font-sans text-slate-400">
            No exercises found for this category.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {evaluatedExercises.map((exercise) => {
            const isRestricted = exercise.effectiveRestricted;
            const isRecommended = exercise.effectiveStatus === 'recommended';
            const isOverridden = exercise.isCardOverridden;

            return (
              <div
                key={exercise.id}
                className={`glass-panel rounded-2xl overflow-hidden transition-all duration-300 animate-in fade-in ${
                  isRestricted
                    ? 'opacity-40 border-2 border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
                    : isOverridden
                    ? 'border-2 border-amber-400/70 shadow-[0_0_25px_rgba(245,158,11,0.3)]'
                    : isRecommended
                    ? 'border-2 border-emerald-400/60 shadow-[0_0_25px_rgba(16,185,129,0.3)]'
                    : 'border border-[#00E5FF]/35 shadow-[0_0_25px_rgba(0,229,255,0.15)]'
                }`}
              >
                {/* Video / Thumbnail Area */}
                <div className="relative aspect-video bg-slate-900">
                  {isRestricted ? (
                    <div className="absolute inset-0 bg-rose-950/75 backdrop-blur-sm flex flex-col items-center justify-center z-10 text-center px-4">
                      <Lock className="w-8 h-8 text-rose-400 mb-2 animate-pulse" />
                      <div className="text-xs font-mono text-rose-300 font-bold uppercase tracking-wider flex items-center gap-1.5 justify-center">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        RESTRICTED / LOCKED
                      </div>
                      {exercise.effectiveReason && (
                        <div className="text-[11px] font-sans text-rose-200 mt-1 max-w-[260px] line-clamp-3">
                          {exercise.effectiveReason}
                        </div>
                      )}
                    </div>
                  ) : null}

                  {exercise.videoUrl ? (
                    <video
                      src={exercise.videoUrl}
                      controls={!isRestricted}
                      playsInline
                      loop
                      muted
                      className="w-full h-full object-cover"
                      preload="metadata"
                      onLoadedMetadata={(e) => {
                        if (e.currentTarget.paused && e.currentTarget.currentTime === 0) {
                          e.currentTarget.currentTime = 0.5;
                        }
                      }}
                      onEnded={(e) => {
                        const vid = e.currentTarget;
                        vid.currentTime = 0;
                        vid.play().catch(() => {});
                      }}
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const fallbackDiv = target.parentElement?.querySelector(
                          '.video-fallback'
                        ) as HTMLElement;
                        if (fallbackDiv) fallbackDiv.style.display = 'flex';
                      }}
                    />
                  ) : null}

                  <div
                    className={`video-fallback ${
                      exercise.videoUrl ? 'hidden' : 'flex'
                    } absolute inset-0 flex-col items-center justify-center bg-gradient-to-b from-[#0a1628] to-[#040814] text-center p-4`}
                  >
                    <Dumbbell className="w-8 h-8 text-[#00E5FF]/60 mb-2" />
                    <span className="text-xs font-mono font-bold text-white tracking-wide">
                      {exercise.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 mt-1">
                      LOCAL VIDEO: {exercise.videoUrl?.replace('/videos/', '') || `${exercise.id}.mp4`}
                    </span>
                  </div>

                  {/* Surgeon Override Badge */}
                  {isOverridden && (
                    <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-amber-500/25 border border-amber-400/70 text-amber-200 font-mono text-[10px] font-bold flex items-center gap-1 z-10">
                      <ShieldAlert className="w-3 h-3 text-amber-300" />
                      SURGEON OVERRIDE
                    </div>
                  )}

                  {/* Recommended badge */}
                  {isRecommended && !isRestricted && (
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-emerald-500/25 border border-emerald-400/60 text-emerald-300 font-mono text-[10px] font-bold flex items-center gap-1 z-10">
                      <Star className="w-3 h-3 fill-emerald-300" />
                      RECOMMENDED
                    </div>
                  )}

                  {/* Restricted warning badge */}
                  {isRestricted && (
                    <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-rose-500/25 border border-rose-400/60 text-rose-300 font-mono text-[10px] font-bold flex items-center gap-1 z-10">
                      <AlertTriangle className="w-3 h-3" />
                      RESTRICTED
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-3">
                  <h4 className="text-base font-bold text-white font-['Chakra_Petch',sans-serif] tracking-wide leading-tight">
                    {exercise.name}
                  </h4>

                  <p className="text-xs font-sans text-slate-300 leading-relaxed line-clamp-2">
                    {exercise.description}
                  </p>

                  {/* Restricted Reason Banner */}
                  {isRestricted && exercise.effectiveReason && (
                    <div className="p-2 rounded-lg bg-rose-500/15 border border-rose-500/35 text-rose-200 text-[11px] font-mono flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span>{exercise.effectiveReason}</span>
                    </div>
                  )}

                  {/* Equipment */}
                  <div className="text-xs font-mono text-[#00E5FF] flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5" />
                    {exercise.equipment}
                  </div>

                  {/* Duration + Calories + Intensity */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1">
                      <Timer className="w-3 h-3 text-[#00E5FF]" />
                      {exercise.durationMinutes} min
                    </span>
                    <span className="px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-[#FF8C00]" />
                      {exercise.caloriesBurned} cal
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold border ${
                        INTENSITY_COLOURS[exercise.intensity] || INTENSITY_COLOURS['Moderate']
                      }`}
                    >
                      {exercise.intensity}
                    </span>
                  </div>

                  {/* Target Muscles */}
                  {exercise.targetMuscles && exercise.targetMuscles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {exercise.targetMuscles.map((muscle) => (
                        <span
                          key={muscle}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#00E5FF]/10 text-[#00E5FF]/80 border border-[#00E5FF]/20"
                        >
                          {muscle}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Status Indicator + Interactive Workout Session Action */}
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isRestricted
                              ? 'bg-rose-500 shadow-[0_0_6px_#f43f5e]'
                              : isOverridden
                              ? 'bg-amber-400 shadow-[0_0_6px_#f59e0b]'
                              : isRecommended
                              ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]'
                              : 'bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]'
                          }`}
                        />
                        <span
                          className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
                            isRestricted
                              ? 'text-rose-400'
                              : isOverridden
                              ? 'text-amber-300'
                              : isRecommended
                              ? 'text-emerald-400'
                              : 'text-[#00E5FF]'
                          }`}
                        >
                          {isOverridden ? 'SURGEON OVERRIDE' : exercise.effectiveStatus}
                        </span>
                      </div>

                      {completedSessions.some((s) => s.exerciseId === exercise.id) && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-mono text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          LOGGED TODAY
                        </span>
                      )}
                    </div>

                    {isRestricted ? (
                      <div className="space-y-1.5">
                        <button
                          type="button"
                          disabled
                          className="w-full py-2 px-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-not-allowed"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          PROTOCOL LOCKED BY FLIGHT SURGEON
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleSingleCardOverride(exercise.id)}
                          className="w-full py-1.5 px-3 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 font-mono font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Unlock className="w-3 h-3" />
                          GRANT FLIGHT SURGEON OVERRIDE
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <button
                          type="button"
                          onClick={() => handleStartSingleExercise(exercise)}
                          className={`w-full py-2.5 px-4 rounded-xl font-mono font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
                            isOverridden
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                              : isRecommended
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                              : 'bg-[#00E5FF]/20 hover:bg-[#00E5FF] text-[#00E5FF] hover:text-slate-950 border border-[#00E5FF]/50 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                          }`}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          START WORKOUT SESSION
                        </button>
                        {isOverridden && !globalSurgeonOverride && (
                          <button
                            type="button"
                            onClick={() => toggleSingleCardOverride(exercise.id)}
                            className="w-full py-1 px-2 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800 font-mono text-[10px] uppercase tracking-wider cursor-pointer transition-colors"
                          >
                            REVOKE SURGEON OVERRIDE
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          6. BOTTOM STATS BAR
      ═══════════════════════════════════════════════════════════════════ */}
      {!isLoadingExercises && evaluatedExercises.length > 0 && (
        <div className="glass-panel glass-panel-glow-cyan p-5 rounded-2xl border border-[#00E5FF]/35 shadow-[0_0_25px_rgba(0,229,255,0.15)]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Exercises Available vs Restricted */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider">
                  EXERCISES
                </div>
                <div className="text-lg font-extrabold font-mono text-white flex items-baseline gap-1.5">
                  {availableCount}
                  <span className="text-xs font-sans text-slate-400 font-normal">available</span>
                  {restrictedCount > 0 && (
                    <span className="text-xs font-mono text-rose-400 font-bold ml-1">
                      ({restrictedCount} restricted)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Est. Daily Workout Calories */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#FF8C00]/15 text-[#FF8C00] border border-[#FF8C00]/40">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider">
                  EST. DAILY CALORIES
                </div>
                <div className="text-lg font-extrabold font-mono text-[#FF8C00] flex items-baseline gap-1.5">
                  {estimatedDailyCalories}
                  <span className="text-xs font-sans text-slate-400 font-normal">kcal burn</span>
                </div>
              </div>
            </div>

            {/* Fitness Readiness Score */}
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl border ${
                  fitnessReadiness >= 80
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                    : fitnessReadiness >= 50
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/40'
                    : 'bg-rose-500/15 text-rose-400 border-rose-500/40'
                }`}
              >
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider">
                  FITNESS READINESS
                </div>
                <div
                  className={`text-lg font-extrabold font-mono flex items-baseline gap-1.5 ${
                    fitnessReadiness >= 80
                      ? 'text-emerald-400'
                      : fitnessReadiness >= 50
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {fitnessReadiness}%
                  <span className="text-xs font-sans text-slate-400 font-normal">
                    {fitnessReadiness >= 80
                      ? 'Optimal'
                      : fitnessReadiness >= 50
                      ? 'Moderate'
                      : 'Limited'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          7. NASA DAILY COUNTERMEASURE PROGRESS & COMPLETED SESSIONS LOG
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="glass-panel p-6 rounded-2xl border border-[#00E5FF]/35 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base sm:text-lg font-bold text-white font-['Chakra_Petch',sans-serif] tracking-wide uppercase">
                NASA Daily Countermeasure Log & Telemetry History
              </h3>
            </div>
            <p className="text-xs font-sans text-slate-400 mt-0.5">
              Completed interactive workout sessions are automatically synchronized with the Unified Medical Timeline.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#071026] px-4 py-2.5 rounded-xl border border-slate-800">
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">DAILY PROTOCOL TARGET</div>
              <div className="text-sm font-mono font-extrabold text-[#00E5FF]">
                {totalLoggedMinutes} / {dailyTargetMinutes} MIN ({protocolProgressPct}%)
              </div>
            </div>
            <div className="h-7 w-px bg-slate-800" />
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">LOGGED BURN</div>
              <div className="text-sm font-mono font-extrabold text-[#FFB347]">
                {totalLoggedCalories} KCAL
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-[#00E5FF] to-emerald-400 transition-all duration-500"
            style={{ width: `${protocolProgressPct}%` }}
          />
        </div>

        {/* Session List */}
        {completedSessions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {completedSessions.map((session) => (
              <div
                key={session.id}
                className="p-3.5 rounded-xl bg-[#071026]/90 border border-slate-800 hover:border-emerald-500/40 transition-colors flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono text-[10px] font-bold">
                      {session.equipment}
                    </span>
                    <span className="text-sm font-bold text-white font-['Chakra_Petch',sans-serif]">
                      {session.exerciseName}
                    </span>
                  </div>
                  {session.notes && (
                    <p className="text-xs font-sans text-slate-400 line-clamp-2">{session.notes}</p>
                  )}
                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-300 pt-1">
                    <span className="flex items-center gap-1 text-[#00E5FF]">
                      <Timer className="w-3 h-3" /> {session.durationMinutes} min
                    </span>
                    <span className="flex items-center gap-1 text-[#FFB347]">
                      <Flame className="w-3 h-3" /> {session.caloriesBurned} kcal
                    </span>
                    <span className="flex items-center gap-1 text-rose-300">
                      <Heart className="w-3 h-3" /> Avg {session.avgHeartRate} bpm (Peak{' '}
                      {session.peakHeartRate})
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500 shrink-0">
                  {new Date(session.completedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          8. TELEMETRY REPORT MODAL (ENHANCEMENT 5)
      ═══════════════════════════════════════════════════════════════════ */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel glass-panel-glow-cyan w-full max-w-3xl rounded-2xl border border-[#00E5FF]/50 overflow-hidden shadow-[0_0_50px_rgba(0,229,255,0.28)]">
            <div className="px-6 py-4 bg-[#071026] border-b border-[#00E5FF]/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#00E5FF]" />
                <div>
                  <h3 className="text-lg font-bold text-white font-['Chakra_Petch',sans-serif]">
                    Flight Surgeon Countermeasure Telemetry Report
                  </h3>
                  <p className="text-xs font-mono text-slate-400">
                    ISS EXPEDITION 74 · GROUND CONTROL TELEMETRY DISPATCH
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-rose-400 border border-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                {buildTelemetryReportText()}
              </pre>

              <div className="flex items-center justify-end gap-3 flex-wrap pt-2">
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-mono text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  {copiedReport ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      COPIED TO CLIPBOARD
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#00E5FF]" />
                      COPY TELEMETRY TEXT
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadJsonReport}
                  className="px-4 py-2.5 rounded-xl bg-[#FF8C00]/20 hover:bg-[#FF8C00]/30 text-[#FFB347] border border-[#FF8C00]/50 font-mono text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  EXPORT JSON (.JSON)
                </button>

                <button
                  type="button"
                  onClick={handleDownloadTxtReport}
                  className="px-5 py-2.5 rounded-xl bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-slate-950 font-mono text-xs font-extrabold flex items-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.4)] cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  DOWNLOAD OFFICIAL REPORT (.TXT)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Workout Session Modal */}
      {activeWorkoutExercise && (
        <WorkoutSessionModal
          exercise={activeWorkoutExercise}
          profile={profile}
          playlist={activePlaylist}
          playlistIndex={playlistIndex}
          onSelectPlaylistIndex={(idx) => {
            if (activePlaylist[idx]) {
              setPlaylistIndex(idx);
              setActiveWorkoutExercise(activePlaylist[idx]);
            }
          }}
          onClose={() => {
            setActiveWorkoutExercise(null);
            setActivePlaylist([]);
          }}
          onComplete={handleSessionCompleted}
        />
      )}
    </div>
  );
};
