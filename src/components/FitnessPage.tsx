import React, { useState, useEffect, useRef } from 'react';
import {
  Dumbbell,
  Lock,
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
  ChevronDown,
  Target,
} from 'lucide-react';
import {
  AstronautProfile,
  SpaceExercise,
  FitnessAIAnalysis,
  ExerciseCategory,
} from '../types/astronaut.ts';

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

  const chatInputRef = useRef<HTMLInputElement | null>(null);

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
      console.error('Error fetching exercises:', err);
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
      console.error('AI analysis error:', err);
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
    } catch (err: any) {
      console.error('Chat error:', err);
      setChatResponse('Communication telemetry link momentarily disrupted. Flight Surgeon protocol: Defer heavy axial spinal loading.');
    } finally {
      setIsChatting(false);
    }
  };

  // ── Initial data load ────────────────────────────────────────────────────
  useEffect(() => {
    fetchExercises();
    fetchAIAnalysis();
  }, []);

  // ── Re-fetch exercises when category changes ─────────────────────────────
  useEffect(() => {
    fetchExercises(selectedCategory);
  }, [selectedCategory]);

  // ── Derived stats ────────────────────────────────────────────────────────
  const totalExercises = exercises.length;
  const restrictedCount = exercises.filter((e) => e.status === 'restricted').length;
  const availableCount = totalExercises - restrictedCount;
  const estimatedDailyCalories = exercises
    .filter((e) => e.status !== 'restricted')
    .reduce((sum, e) => sum + e.caloriesBurned, 0);
  const fitnessReadiness =
    totalExercises > 0 ? Math.round((availableCount / totalExercises) * 100) : 0;

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      {/* ═══════════════════════════════════════════════════════════════════
          1. TOP HEADER BANNER
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="glass-panel glass-panel-glow-cyan p-6 sm:p-7 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-5 border border-[#00E5FF]/40 shadow-[0_0_35px_rgba(0,229,255,0.22)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/50 flex items-center justify-center text-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.35)] shrink-0">
            <Dumbbell className="w-7 h-7 text-[#00E5FF]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Chakra_Petch',sans-serif] tracking-wide">
                Astronaut Fitness Protocol
              </h1>
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#00E5FF]/20 border border-[#00E5FF]/50 text-[#00E5FF]">
                EXERCISE RX
              </span>
            </div>
            <p className="text-sm font-sans text-slate-300 mt-1">
              Micro-gravity exercise prescription, countermeasure protocols, and AI fitness planning for{' '}
              <strong className="text-white">{profile.name}</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          2. AI FITNESS ASSESSMENT PANEL
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="glass-panel glass-panel-glow-orange p-6 sm:p-7 rounded-2xl border border-[#FF8C00]/40 shadow-[0_0_35px_rgba(255,140,0,0.2)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FF8C00]/20 text-[#FF8C00] border border-[#FF8C00]/40 shadow-[0_0_15px_rgba(255,140,0,0.3)]">
              <Sparkles className="w-6 h-6 text-[#FF8C00]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
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

          <button
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

        {/* AI Body */}
        {isLoadingAI && !aiAnalysis ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-2 border-[#FF8C00]/30 animate-ping" />
              <div className="absolute inset-2 rounded-full border-2 border-[#FF8C00]/50 animate-spin" />
              <div className="absolute inset-4 rounded-full border-2 border-t-[#FF8C00] border-r-transparent border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '0.6s' }} />
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
              <div className="text-xs font-mono text-[#FFB347] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5" /> DAILY EXERCISE PLAN
              </div>
              <p className="text-sm font-sans text-slate-200 leading-relaxed">
                {aiAnalysis.dailyPlan}
              </p>
            </div>

            {/* Cautions */}
            {aiAnalysis.cautions && aiAnalysis.cautions.length > 0 && (
              <div>
                <div className="text-xs font-mono text-rose-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> CAUTIONS
                </div>
                <ul className="space-y-1.5">
                  {aiAnalysis.cautions.map((c, i) => (
                    <li key={i} className="text-sm font-sans text-rose-200 flex items-start gap-2">
                      <span className="text-rose-400 mt-0.5">⚠️</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
                {aiAnalysis.recommendations.map((r, i) => (
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
            <div
              className="mt-3 p-4 rounded-xl bg-[#080f26]/90 border border-[#FF8C00]/25 text-sm font-sans text-slate-200 leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-200"
            >
              <div className="flex items-center gap-2 text-xs font-mono text-[#FFB347] font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" /> AI RESPONSE
              </div>
              {chatResponse}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          3. CATEGORY FILTER TABS
      ═══════════════════════════════════════════════════════════════════ */}
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

      {/* ═══════════════════════════════════════════════════════════════════
          4. EXERCISE CARDS GRID
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
      ) : exercises.length === 0 ? (
        <div className="glass-panel p-8 rounded-2xl text-center space-y-3 border border-slate-700">
          <Dumbbell className="w-10 h-10 text-slate-500 mx-auto" />
          <div className="text-sm font-sans text-slate-400">
            No exercises found for this category.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {exercises.map((exercise, index) => {
            const isRestricted = exercise.status === 'restricted';
            const isRecommended = exercise.status === 'recommended';

            return (
              <div
                key={exercise.id}
                className={`glass-panel rounded-2xl overflow-hidden transition-all duration-300 animate-in fade-in ${
                  isRestricted
                    ? 'opacity-40 border-2 border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
                    : isRecommended
                    ? 'border-2 border-emerald-400/60 shadow-[0_0_25px_rgba(16,185,129,0.3)]'
                    : 'border border-[#00E5FF]/35 shadow-[0_0_25px_rgba(0,229,255,0.15)]'
                }`}
              >
                {/* Video / Thumbnail Area */}
                <div className="relative aspect-video bg-slate-900">
                  {isRestricted ? (
                    // Restricted overlay
                    <div className="absolute inset-0 bg-rose-950/75 backdrop-blur-sm flex flex-col items-center justify-center z-10 text-center px-4">
                      <Lock className="w-8 h-8 text-rose-400 mb-2 animate-pulse" />
                      <div className="text-xs font-mono text-rose-300 font-bold uppercase tracking-wider">
                        EXERCISE RESTRICTED / LOCKED
                      </div>
                      {(exercise.warningMessage || exercise.restrictionReason) && (
                        <div className="text-[11px] font-sans text-rose-200 mt-1 max-w-[260px] line-clamp-3">
                          {exercise.warningMessage || exercise.restrictionReason}
                        </div>
                      )}
                    </div>
                  ) : null}

                  {exercise.videoUrl ? (
                    <video
                      src={exercise.videoUrl}
                      poster={exercise.thumbnailUrl}
                      controls={!isRestricted}
                      className="w-full h-full object-cover"
                      preload="metadata"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const fallbackDiv = target.parentElement?.querySelector('.video-fallback') as HTMLElement;
                        if (fallbackDiv) fallbackDiv.style.display = 'flex';
                      }}
                    />
                  ) : null}

                  <div
                    className={`video-fallback ${exercise.videoUrl ? 'hidden' : 'flex'} absolute inset-0 flex-col items-center justify-center bg-gradient-to-b from-[#0a1628] to-[#040814] text-center p-4`}
                  >
                    <Dumbbell className="w-8 h-8 text-[#00E5FF]/60 mb-2" />
                    <span className="text-xs font-mono font-bold text-white tracking-wide">
                      {exercise.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 mt-1">
                      LOCAL VIDEO: {exercise.videoUrl?.replace('/videos/', '') || `${exercise.id}.mp4`}
                    </span>
                  </div>

                  {/* Recommended badge */}
                  {isRecommended && (
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
                  {/* Exercise Name */}
                  <h4 className="text-base font-bold text-white font-['Chakra_Petch',sans-serif] tracking-wide leading-tight">
                    {exercise.name}
                  </h4>

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

                  {/* Status Indicator */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isRestricted
                          ? 'bg-rose-500 shadow-[0_0_6px_#f43f5e]'
                          : isRecommended
                          ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]'
                          : 'bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]'
                      }`}
                    />
                    <span
                      className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
                        isRestricted
                          ? 'text-rose-400'
                          : isRecommended
                          ? 'text-emerald-400'
                          : 'text-[#00E5FF]'
                      }`}
                    >
                      {exercise.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          5. BOTTOM STATS BAR
      ═══════════════════════════════════════════════════════════════════ */}
      {!isLoadingExercises && exercises.length > 0 && (
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
                  <span className="text-xs font-sans text-slate-400 font-normal">
                    available
                  </span>
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
                  <span className="text-xs font-sans text-slate-400 font-normal">
                    kcal burn
                  </span>
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
    </div>
  );
};
