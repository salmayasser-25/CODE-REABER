import React, { useState, useEffect, useCallback } from 'react';
import {
  Zap, Droplets, Package, AlertTriangle, CheckCircle2,
  TrendingUp, ChefHat, Pill, Apple, Moon, Brain,
  ShieldCheck, RefreshCw, Plus, Info, Star, Clock
} from 'lucide-react';
import { AstronautProfile } from '../types/astronaut.ts';
import type { NutrientItem, DailyNutritionLog, NutrientCategory } from '../types/nutrition.ts';

interface NutriLogPageProps {
  profile: AstronautProfile;
}

// ── Category meta ──────────────────────────────────────────────────────────────
const CATEGORY_META: Record<NutrientCategory, { label: string; icon: React.ElementType; color: string; border: string; glow: string }> = {
  'radiation-shield': { label: 'Radiation Shield', icon: ShieldCheck, color: 'text-rose-400',   border: 'border-rose-500/40',   glow: 'shadow-[0_0_18px_rgba(244,63,94,0.25)]' },
  'bone-muscle':      { label: 'Bone & Muscle',    icon: Zap,          color: 'text-sky-400',    border: 'border-sky-500/40',    glow: 'shadow-[0_0_18px_rgba(14,165,233,0.25)]' },
  'hydration':        { label: 'Hydration',         icon: Droplets,     color: 'text-cyan-400',   border: 'border-cyan-500/40',   glow: 'shadow-[0_0_18px_rgba(6,182,212,0.25)]' },
  'sleep-recovery':   { label: 'Sleep & Recovery',  icon: Moon,         color: 'text-indigo-400', border: 'border-indigo-500/40', glow: 'shadow-[0_0_18px_rgba(99,102,241,0.25)]' },
  'cognitive':        { label: 'Cognitive',          icon: Brain,        color: 'text-violet-400', border: 'border-violet-500/40', glow: 'shadow-[0_0_18px_rgba(139,92,246,0.25)]' },
  'general':          { label: 'General Nutrition',  icon: Apple,        color: 'text-emerald-400',border: 'border-emerald-500/40',glow: 'shadow-[0_0_18px_rgba(16,185,129,0.25)]' },
};

const HYDRATION_CUPS = [150, 200, 250, 350, 500]; // mL presets

// ── Colour token → Tailwind class maps ────────────────────────────────────────
function colorBg(c: string)     { return `bg-${c}-500/15`; }
function colorBorder(c: string) { return `border-${c}-500/40`; }
function colorText(c: string)   { return `text-${c}-400`; }
function colorBtn(c: string)    { return `bg-${c}-500 hover:bg-${c}-400`; }

function inventoryStatus(item: NutrientItem): 'full' | 'adequate' | 'low' | 'critical' {
  const pct = item.currentStock / item.initialStock;
  if (pct > 0.5)  return 'full';
  if (pct > 0.25) return 'adequate';
  if (pct > 0.10) return 'low';
  return 'critical';
}

const STATUS_PILL: Record<string, string> = {
  full:     'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  adequate: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  low:      'bg-amber-500/20 text-amber-300 border-amber-500/40',
  critical: 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse',
};

export const NutriLogPage: React.FC<NutriLogPageProps> = ({ profile }) => {
  const [inventory, setInventory]           = useState<NutrientItem[]>([]);
  const [dailyLog, setDailyLog]             = useState<DailyNutritionLog | null>(null);
  const [alerts, setAlerts]                 = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<NutrientCategory | 'all'>('all');
  const [takenIds, setTakenIds]             = useState<Set<string>>(new Set());
  const [loadingId, setLoadingId]           = useState<string | null>(null);
  const [toast, setToast]                   = useState<{ text: string; type: 'success' | 'warn' | 'error' } | null>(null);
  const [hydAmt, setHydAmt]                 = useState<number>(250);
  const [loggingHyd, setLoggingHyd]         = useState(false);
  const [expandedId, setExpandedId]         = useState<string | null>(null);
  const [aiPlan, setAiPlan]                 = useState<string>('');
  const [planLoading, setPlanLoading]       = useState(false);

  const showToast = (text: string, type: 'success' | 'warn' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Fetch inventory + daily log from API ────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const [invRes, logRes, alertRes] = await Promise.all([
        fetch('/api/nutrition/inventory'),
        fetch('/api/nutrition/daily-log'),
        fetch('/api/nutrition/alerts'),
      ]);
      if (invRes.ok)   { const j = await invRes.json();   if (j.success) setInventory(j.data); }
      if (logRes.ok)   { const j = await logRes.json();   if (j.success) setDailyLog(j.data); }
      if (alertRes.ok) { const j = await alertRes.json(); if (j.success) setAlerts(j.data); }
    } catch {
      // offline fallback – leave state empty
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Regenerate AI Meal Plan ─────────────────────────────────────────────────
  const generateAiPlan = async () => {
    setPlanLoading(true);
    try {
      const res = await fetch('/api/nutrition/ai-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });
      if (res.ok) {
        const j = await res.json();
        if (j.success) setAiPlan(j.plan);
      }
    } catch {
      // Rule-based local fallback
      const lines: string[] = [];
      if (profile.radiationDoseMsv > 15)  lines.push('⚡ Radiation elevated → prioritise Lycopene Pouch + Vitamin E & C tablet today.');
      if (profile.spineElongation > 3)    lines.push('🦴 Spinal elongation active → Calcium-D3 Yogurt + Collagen Pack are essential.');
      lines.push('💧 Target 2.5 L hydration before 20:00 UTC.');
      lines.push('😴 Sleep < 6 h last night → take Magnesium Glycinate + Chamomile Infusion 1 h before sleep.');
      lines.push('🧠 Cognitive support → Omega-3 DHA/EPA softgels with breakfast pouch.');
      setAiPlan(lines.join('\n'));
    } finally {
      setPlanLoading(false);
    }
  };

  useEffect(() => { generateAiPlan(); }, []); // auto-generate on mount

  // ── Take a nutrient item ────────────────────────────────────────────────────
  const handleTake = async (itemId: string) => {
    if (takenIds.has(itemId)) { showToast('Already taken today – dose logged ✓', 'warn'); return; }
    setLoadingId(itemId);
    try {
      const res = await fetch('/api/nutrition/take', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, qty: 1 }),
      });
      if (res.ok) {
        const j = await res.json();
        if (j.success) {
          setTakenIds((prev) => new Set([...prev, itemId]));
          setInventory((prev) => prev.map((it) => it.id === itemId ? { ...it, currentStock: it.currentStock - 1, lastTakenAt: new Date().toISOString() } : it));
          if (j.log) setDailyLog(j.log);
          showToast(`${j.item?.emoji ?? '✅'} ${j.item?.name} taken – inventory updated!`);
        }
      } else {
        showToast('Could not deduct from inventory.', 'error');
      }
    } catch {
      // offline optimistic update
      setTakenIds((prev) => new Set([...prev, itemId]));
      setInventory((prev) => prev.map((it) => it.id === itemId ? { ...it, currentStock: Math.max(0, it.currentStock - 1) } : it));
      showToast('Logged locally (offline mode) ✓');
    } finally {
      setLoadingId(null);
    }
  };

  // ── Log hydration ───────────────────────────────────────────────────────────
  const handleLogHydration = async () => {
    setLoggingHyd(true);
    try {
      const res = await fetch('/api/nutrition/hydration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountMl: hydAmt }),
      });
      if (res.ok) {
        const j = await res.json();
        if (j.success && j.log) setDailyLog(j.log);
      } else {
        // offline
        setDailyLog((prev) => prev ? { ...prev, hydrationLiters: Math.round((prev.hydrationLiters + hydAmt / 1000) * 100) / 100 } : prev);
      }
    } catch {
      setDailyLog((prev) => prev ? { ...prev, hydrationLiters: Math.round((prev.hydrationLiters + hydAmt / 1000) * 100) / 100 } : prev);
    } finally {
      setLoggingHyd(false);
      showToast(`💧 +${hydAmt} mL logged! Keep hydrating, Commander.`);
    }
  };

  // ── Derived display values ──────────────────────────────────────────────────
  const hydLiters   = dailyLog?.hydrationLiters ?? 0;
  const hydGoal     = dailyLog?.hydrationGoalLiters ?? 2.5;
  const hydPct      = Math.min(100, Math.round((hydLiters / hydGoal) * 100));
  const nutriScore  = dailyLog?.nutritionScore ?? 0;
  const totalCal    = dailyLog?.totalCalories ?? 0;
  const consumed    = dailyLog?.consumedItems ?? [];

  const displayed = activeCategory === 'all'
    ? inventory
    : inventory.filter((i) => i.category === activeCategory);

  // Priority items (triggered by current profile vitals)
  const priorityIds = new Set(
    inventory
      .filter((item) => {
        if (!item.healthTrigger) return false;
        const { metric, threshold, direction } = item.healthTrigger;
        const val: Record<string, number> = {
          radiation: profile.radiationDoseMsv,
          bone:      100,
          sleep:     6,
          heartRate: profile.restingHeartRate,
          spO2:      profile.spO2Baseline,
        };
        const v = val[metric] ?? 0;
        return direction === 'above' ? v > threshold : v < threshold;
      })
      .map((i) => i.id)
  );

  return (
    <div className="space-y-6 pb-12">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#00E5FF] font-bold mb-1">
            <ChefHat className="w-4 h-4" />
            <span>GALLEY MODULE — DECK 4</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Bio-Kitchen & Smart NutriLog
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Adaptive space nutrition engine — meals, supplements & hydration synced to your vitals.
          </p>
        </div>
        <button
          onClick={generateAiPlan}
          disabled={planLoading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00E5FF]/15 hover:bg-[#00E5FF]/25 border border-[#00E5FF]/40 text-[#00E5FF] font-bold text-xs transition-all shadow-[0_0_15px_rgba(0,229,255,0.2)]"
        >
          <RefreshCw className={`w-4 h-4 ${planLoading ? 'animate-spin' : ''}`} />
          {planLoading ? 'Generating Plan…' : 'Regenerate AI Meal Plan'}
        </button>
      </div>

      {/* ── Inventory Alerts Strip ───────────────────────────────────────────── */}
      {alerts.length > 0 && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 flex flex-wrap gap-2 items-center">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-xs font-bold text-amber-300 font-mono">LOW STOCK ALERTS:</span>
          {alerts.map((a: any) => (
            <span key={a.itemId} className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${a.severity === 'critical' ? 'bg-rose-500/20 text-rose-300 border-rose-500/50' : 'bg-amber-500/20 text-amber-300 border-amber-500/50'}`}>
              {a.itemName}: {a.daysRemaining}d left
            </span>
          ))}
        </div>
      )}

      {/* ── Top 3-col Stats Row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Nutrition Score Dial */}
        <div className="bg-[#080e22]/80 border border-[#00E5FF]/25 rounded-2xl p-5 backdrop-blur-xl flex flex-col items-center shadow-[0_0_20px_rgba(0,229,255,0.1)]">
          <span className="text-xs font-mono text-slate-400 mb-2">DAILY NUTRITION SCORE</span>
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e293b" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#00E5FF" strokeWidth="3"
                strokeDasharray={`${nutriScore} ${100 - nutriScore}`} strokeLinecap="round" />
            </svg>
            <span className="text-2xl font-extrabold text-[#00E5FF] font-mono z-10">{nutriScore}</span>
          </div>
          <span className={`text-xs font-bold mt-2 ${nutriScore >= 70 ? 'text-emerald-400' : nutriScore >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>
            {nutriScore >= 70 ? 'OPTIMAL' : nutriScore >= 40 ? 'IMPROVING' : 'LOG MORE'}
          </span>
        </div>

        {/* Hydration Ring */}
        <div className="bg-[#080e22]/80 border border-cyan-500/25 rounded-2xl p-5 backdrop-blur-xl flex flex-col items-center shadow-[0_0_20px_rgba(6,182,212,0.1)]">
          <span className="text-xs font-mono text-slate-400 mb-2">HYDRATION TRACKER</span>
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#164e63" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#06b6d4" strokeWidth="3"
                strokeDasharray={`${hydPct} ${100 - hydPct}`} strokeLinecap="round" />
            </svg>
            <div className="text-center z-10">
              <span className="text-lg font-extrabold text-cyan-400 font-mono block">{hydLiters.toFixed(1)}L</span>
              <span className="text-[10px] text-slate-400">/ {hydGoal}L</span>
            </div>
          </div>
          <span className={`text-xs font-bold mt-2 ${hydPct >= 80 ? 'text-emerald-400' : hydPct >= 50 ? 'text-cyan-400' : 'text-rose-400 animate-pulse'}`}>
            {hydPct >= 80 ? 'WELL HYDRATED' : hydPct >= 50 ? `${hydPct}% — KEEP GOING` : '⚠ LOW — DRINK NOW'}
          </span>
        </div>

        {/* Calories & Consumed */}
        <div className="bg-[#080e22]/80 border border-emerald-500/25 rounded-2xl p-5 backdrop-blur-xl flex flex-col justify-between shadow-[0_0_20px_rgba(16,185,129,0.1)]">
          <span className="text-xs font-mono text-slate-400 mb-2">CALORIES & INTAKE</span>
          <div className="flex flex-col gap-2 flex-1 justify-center">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">Total Calories</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">{totalCal} kcal</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">Items Consumed</span>
              <span className="text-sm font-bold text-white font-mono">{consumed.length} items</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">Priority Items Taken</span>
              <span className={`text-sm font-bold font-mono ${[...priorityIds].filter(id => takenIds.has(id)).length === priorityIds.size ? 'text-emerald-400' : 'text-amber-400'}`}>
                {[...priorityIds].filter(id => takenIds.has(id)).length}/{priorityIds.size}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── AI Daily Meal Plan ───────────────────────────────────────────────── */}
      {aiPlan && (
        <div className="bg-[#080e22]/80 border border-[#00E5FF]/30 rounded-2xl p-5 backdrop-blur-xl shadow-[0_0_20px_rgba(0,229,255,0.1)]">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-[#00E5FF]" />
            <span className="text-xs font-mono font-bold text-[#00E5FF]">AI-GENERATED PERSONALIZED MEAL PLAN — MET DAY {profile.missionElapsedDays}</span>
          </div>
          <div className="space-y-1.5">
            {aiPlan.split('\n').map((line, i) => (
              <p key={i} className="text-sm text-slate-200 leading-relaxed">{line}</p>
            ))}
          </div>
        </div>
      )}

      {/* ── Hydration Logger ─────────────────────────────────────────────────── */}
      <div className="bg-[#080e22]/80 border border-cyan-500/25 rounded-2xl p-5 backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-4">
          <Droplets className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold text-white">Log Hydration Session</h2>
          <span className="ml-auto text-xs font-mono text-slate-400">{dailyLog?.hydrationSessions?.length ?? 0} sessions today</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick presets */}
          {HYDRATION_CUPS.map((ml) => (
            <button key={ml} onClick={() => setHydAmt(ml)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono border transition-all ${hydAmt === ml ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300' : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:border-cyan-500 hover:text-cyan-300'}`}>
              {ml} mL
            </button>
          ))}
          <input type="number" value={hydAmt} min={50} max={2000} step={50}
            onChange={(e) => setHydAmt(Number(e.target.value))}
            className="w-24 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:border-cyan-400 focus:outline-none" />
          <button onClick={handleLogHydration} disabled={loggingHyd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition-all shadow-md">
            <Plus className="w-4 h-4" />
            {loggingHyd ? 'Logging…' : `Log ${hydAmt} mL`}
          </button>
        </div>
      </div>

      {/* ── Category Filter Tabs ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${activeCategory === 'all' ? 'bg-[#00E5FF]/20 border-[#00E5FF]/60 text-[#00E5FF]' : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'}`}>
          All Items ({inventory.length})
        </button>
        {(Object.entries(CATEGORY_META) as [NutrientCategory, typeof CATEGORY_META[NutrientCategory]][]).map(([key, meta]) => {
          const Icon = meta.icon;
          const count = inventory.filter(i => i.category === key).length;
          return (
            <button key={key} onClick={() => setActiveCategory(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${activeCategory === key ? `${meta.color} ${meta.border} bg-slate-800` : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'}`}>
              <Icon className="w-3.5 h-3.5" />{meta.label} ({count})
            </button>
          );
        })}
      </div>

      {/* ── Inventory Grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayed.map((item) => {
          const status    = inventoryStatus(item);
          const isTaken   = takenIds.has(item.id);
          const isLoading = loadingId === item.id;
          const isPriority = priorityIds.has(item.id);
          const pctStock   = Math.round((item.currentStock / item.initialStock) * 100);
          const catMeta    = CATEGORY_META[item.category];
          const isExpanded = expandedId === item.id;

          return (
            <div key={item.id}
              style={{ boxShadow: isPriority ? item.glowColor.replace('rgba', 'drop-shadow').replace('0.3', '0.5') : undefined }}
              className={`bg-[#080e22]/90 border-2 ${isPriority ? `border-${item.color}-400` : colorBorder(item.color)} rounded-2xl p-4 backdrop-blur-xl transition-all duration-200 hover:scale-[1.01] ${isPriority ? item.glowColor.includes('rose') ? 'shadow-[0_0_20px_rgba(244,63,94,0.3)]' : 'shadow-[0_0_20px_rgba(6,182,212,0.2)]' : ''}`}>

              {/* Card Top Row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl ${colorBg(item.color)} border ${colorBorder(item.color)} flex items-center justify-center text-2xl`}>
                    {item.emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-sm font-bold text-white leading-tight">{item.name}</h3>
                      {isPriority && (
                        <span className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                          PRIORITY
                        </span>
                      )}
                    </div>
                    <div className={`text-[11px] font-mono ${colorText(item.color)} flex items-center gap-1 mt-0.5`}>
                      <catMeta.icon className="w-3 h-3" /> {catMeta.label}
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${STATUS_PILL[status]}`}>
                  {status.toUpperCase()}
                </span>
              </div>

              {/* Stock Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>Stock: {item.currentStock} / {item.initialStock} {item.unit}s</span>
                  <span>{pctStock}% remaining</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${pctStock > 50 ? 'bg-emerald-500' : pctStock > 25 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    style={{ width: `${pctStock}%` }} />
                </div>
              </div>

              {/* Key Nutrients Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {item.keyNutrients.slice(0, 3).map((n) => (
                  <span key={n} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">{n}</span>
                ))}
              </div>

              {/* Expandable Description */}
              {isExpanded && (
                <p className="text-xs text-slate-300 leading-relaxed mb-3 bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60">
                  {item.description}
                </p>
              )}

              {/* Dose & Last Taken info */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-3">
                <span>Dose: {item.dosePerDay}× / day  •  {item.calories ?? 0} kcal/{item.unit}</span>
                {item.lastTakenAt && (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Clock className="w-3 h-3" />
                    {new Date(item.lastTakenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button onClick={() => handleTake(item.id)} disabled={isLoading || item.currentStock === 0}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-extrabold text-xs transition-all shadow-md ${
                    isTaken
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                      : item.currentStock === 0
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : `${colorBtn(item.color)} text-black`
                  }`}>
                  {isLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : isTaken ? (
                    <><CheckCircle2 className="w-3.5 h-3.5" /> Taken Today</>
                  ) : item.currentStock === 0 ? (
                    'OUT OF STOCK'
                  ) : (
                    <><Pill className="w-3.5 h-3.5" /> Take {item.unit}</>
                  )}
                </button>
                <button onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 transition-all">
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Today's Consumed Log ─────────────────────────────────────────────── */}
      {consumed.length > 0 && (
        <div className="bg-[#080e22]/80 border border-emerald-500/25 rounded-2xl p-5 backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Today's Consumption Log</h2>
            <span className="ml-auto text-xs font-mono text-emerald-400 font-bold">{totalCal} kcal total</span>
          </div>
          <div className="space-y-2">
            {consumed.map((c, i) => (
              <div key={i} className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-sm text-white font-medium">{c.name}</span>
                  {c.qty > 1 && <span className="text-xs font-mono text-emerald-300 bg-emerald-500/20 px-1.5 rounded">×{c.qty}</span>}
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {new Date(c.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Toast ────────────────────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border-2 font-mono text-sm font-semibold backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200
          ${toast.type === 'success' ? 'bg-[#080e22]/95 border-[#00E5FF]/60 text-white shadow-[0_0_30px_rgba(0,229,255,0.4)]'
          : toast.type === 'warn'    ? 'bg-[#1a1200]/95 border-amber-500/60 text-amber-200'
          : 'bg-[#1a0808]/95 border-rose-500/60 text-rose-200'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
           : toast.type === 'warn'  ? <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
           : <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />}
          <span>{toast.text}</span>
        </div>
      )}
    </div>
  );
};

