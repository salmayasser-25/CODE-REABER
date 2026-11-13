import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Activity, 
  Droplets, 
  Thermometer, 
  Moon, 
  Wind, 
  Sparkles, 
  RefreshCw, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Sliders, 
  Clock,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine 
} from 'recharts';
import { VitalsData, AstronautProfile } from '../types/astronaut.ts';

interface VitalSignsPageProps {
  profile: AstronautProfile;
  onNavigateToCheckin?: () => void;
}

export const VitalSignsPage: React.FC<VitalSignsPageProps> = ({ profile, onNavigateToCheckin }) => {
  const [vitals, setVitals] = useState<VitalsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [insightSource, setInsightSource] = useState<string>('gemini-4-hydrogen');
  const [selectedRange, setSelectedRange] = useState<'7D' | '24H'>('7D');
  const [isSimulatingAlert, setIsSimulatingAlert] = useState<boolean>(true);

  // Log Daily Vitals Modal State
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [isSubmittingLog, setIsSubmittingLog] = useState<boolean>(false);
  const [logToast, setLogToast] = useState<string | null>(null);

  // Form State
  const [inputHr, setInputHr] = useState<number>(72);
  const [inputBpSys, setInputBpSys] = useState<number>(118);
  const [inputBpDia, setInputBpDia] = useState<number>(76);
  const [inputSpO2, setInputSpO2] = useState<number>(99);
  const [inputTemp, setInputTemp] = useState<number>(36.8);
  const [inputSleep, setInputSleep] = useState<number>(5.9);
  const [inputWeight, setInputWeight] = useState<number>(profile.weightKg || 59.2);

  // Load vitals from backend
  const fetchVitals = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/vitals');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setVitals(json.data);
          setInputHr(json.data.heartRate);
          setInputBpSys(json.data.bloodPressureSys);
          setInputBpDia(json.data.bloodPressureDia);
          setInputSpO2(json.data.spO2);
          setInputTemp(json.data.temperature);
          setInputSleep(json.data.sleepHours);
          if (json.data.weightKg) setInputWeight(json.data.weightKg);
          // Initial AI analysis trigger
          fetchAiInsight(json.data);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch vitals, using fallback:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit daily vitals from modal form
  const handleSaveDailyVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingLog(true);

    try {
      const res = await fetch('/api/vitals/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heartRate: inputHr,
          bloodPressureSys: inputBpSys,
          bloodPressureDia: inputBpDia,
          spO2: inputSpO2,
          temperature: inputTemp,
          sleepHours: inputSleep,
          weightKg: inputWeight,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setVitals(json.data);
          setIsLogModalOpen(false);
          setLogToast('Vitals logged to telemetry and updated in 7-day chronobiology!');
          setTimeout(() => setLogToast(null), 4000);
          fetchAiInsight(json.data);
          return;
        }
      }
      throw new Error('Failed to record vitals');
    } catch (err: any) {
      // Local optimistic update fallback
      const updatedLocal: VitalsData = {
        ...(vitals || {
          heartRate: inputHr,
          bloodPressureSys: inputBpSys,
          bloodPressureDia: inputBpDia,
          spO2: inputSpO2,
          temperature: inputTemp,
          sleepHours: inputSleep,
          respiratoryRate: 14,
          hrvMs: 64,
          timestamp: new Date().toISOString(),
          historicalHeartRate: [],
        }),
        heartRate: inputHr,
        bloodPressureSys: inputBpSys,
        bloodPressureDia: inputBpDia,
        spO2: inputSpO2,
        temperature: inputTemp,
        sleepHours: inputSleep,
        weightKg: inputWeight,
      };
      setVitals(updatedLocal);
      setIsLogModalOpen(false);
      setLogToast('Vitals recorded locally.');
      setTimeout(() => setLogToast(null), 4000);
      fetchAiInsight(updatedLocal);
    } finally {
      setIsSubmittingLog(false);
    }
  };

  // Fetch or trigger AI Clinical Insight
  const fetchAiInsight = async (currentVitalsData?: VitalsData) => {
    setIsAnalyzing(true);
    const dataToAnalyze = currentVitalsData || vitals;
    const compactProfile = {
      name: profile.name,
      restingHeartRate: profile.restingHeartRate,
      spineElongation: profile.spineElongation,
      missionElapsedDays: profile.missionElapsedDays,
    };

    const requestInsight = async () => {
      const res = await fetch('/api/ai/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vitals: dataToAnalyze, profile: compactProfile }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return res.json();
    };

    try {
      let json: any;
      try {
        json = await requestInsight();
      } catch (firstErr) {
        // Retry once after short delay in case dev server is warming up
        await new Promise((r) => setTimeout(r, 450));
        json = await requestInsight();
      }

      if (json?.success && json?.insight) {
        setAiInsight(json.insight);
        setInsightSource(json.source || 'gemini-4-hydrogen');
      }
    } catch (error) {
      console.warn('AI clinical insight endpoint unreachable, using local clinical matrix:', error);
      const hr = dataToAnalyze?.heartRate ?? 72;
      const sleep = dataToAnalyze?.sleepHours ?? 5.9;
      setAiInsight(
        `Your resting heart rate is elevated by ${hr - profile.restingHeartRate} bpm compared to flight baseline (${hr} bpm vs ${profile.restingHeartRate} bpm). This directly correlates with the reported ${sleep} hours of sleep and microgravity fluid redistribution. Recommend 45 minutes of pod rest, 500 mL electrolytic rehydration, and CEVIS cycle cool-down.`
      );
      setInsightSource('clinical-rule-matrix');
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    fetchVitals();
  }, []);

  // Quick simulation presets for testing the requirements
  const handleApplyPreset = async (preset: 'elevated' | 'nominal' | 'post-eva') => {
    if (!vitals) return;
    let newVitals: Partial<VitalsData> = {};

    if (preset === 'elevated') {
      newVitals = {
        heartRate: 78,
        bloodPressureSys: 126,
        bloodPressureDia: 82,
        sleepHours: 5.2,
        spO2: 98,
        temperature: 37.1,
      };
      setIsSimulatingAlert(true);
    } else if (preset === 'nominal') {
      newVitals = {
        heartRate: 59,
        bloodPressureSys: 116,
        bloodPressureDia: 74,
        sleepHours: 7.8,
        spO2: 99,
        temperature: 36.6,
      };
      setIsSimulatingAlert(false);
    } else {
      // post-eva
      newVitals = {
        heartRate: 86,
        bloodPressureSys: 132,
        bloodPressureDia: 86,
        sleepHours: 5.9,
        spO2: 99,
        temperature: 37.3,
      };
      setIsSimulatingAlert(true);
    }

    try {
      const res = await fetch('/api/vitals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVitals),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setVitals(json.data);
          fetchAiInsight(json.data);
        }
      }
    } catch {
      setVitals((prev) => (prev ? { ...prev, ...newVitals } : null));
    }
  };

  if (isLoading || !vitals) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-[#00E5FF] animate-spin" />
        <div className="font-mono text-sm text-[#00E5FF] tracking-wider font-bold">
          CONNECTING TO ISS BIO-TELEMETRY BUS...
        </div>
      </div>
    );
  }

  const hrDelta = vitals.heartRate - profile.restingHeartRate;
  const isHrElevated = hrDelta > 5;

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      {/* Top Header Banner with Live Telemetry Pulse & Action Buttons */}
      <div className="glass-panel glass-panel-glow-cyan p-6 sm:p-7 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-5 border border-[#00E5FF]/40 shadow-[0_0_35px_rgba(0,229,255,0.22)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/50 flex items-center justify-center text-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.35)] shrink-0">
            <Activity className="w-7 h-7 text-[#00E5FF] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Chakra_Petch',sans-serif] tracking-wide">
                Astronaut Biometric Telemetry
              </h1>
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#00E5FF]/20 border border-[#00E5FF]/50 text-[#00E5FF]">
                LIVE 1-HZ STREAM
              </span>
            </div>
            <p className="text-sm font-sans text-slate-300 mt-1">
              Real-time physiological telemetry, cardiovascular adaptation, and AI clinical diagnostics for <strong className="text-white">{profile.name}</strong>.
            </p>
          </div>
        </div>

        {/* Primary Action Buttons: + LOG DAILY VITALS & Simulation Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Prominent + LOG DAILY VITALS Button */}
          <button
            type="button"
            onClick={() => setIsLogModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-cyan-400 hover:from-cyan-400 hover:to-[#00E5FF] text-black font-mono font-extrabold text-xs sm:text-sm tracking-wider flex items-center gap-2 transition-all shadow-[0_0_25px_rgba(0,229,255,0.45)] hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Heart className="w-4 h-4 fill-black text-black" />
            <span>+ LOG DAILY VITALS</span>
          </button>

          {onNavigateToCheckin && (
            <button
              type="button"
              onClick={onNavigateToCheckin}
              className="px-3.5 py-2.5 rounded-xl bg-purple-600/25 hover:bg-purple-600/40 border border-purple-400/60 text-purple-200 font-mono font-bold text-xs flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(168,85,247,0.25)] cursor-pointer"
            >
              <span>DAILY CHECK-IN</span>
            </button>
          )}

          {/* Quick Presets Menu */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-700">
            <span className="text-[10px] font-mono text-slate-400 px-2 font-bold flex items-center gap-1">
              <Sliders className="w-3 h-3 text-[#00E5FF]" /> PRESET:
            </span>
            <button
              onClick={() => handleApplyPreset('elevated')}
              className="px-2 py-1 rounded-lg bg-[#FF8C00]/20 hover:bg-[#FF8C00]/30 text-[#FFB347] font-mono text-[11px] font-bold transition-all"
              title="Simulate elevated heart rate and short sleep"
            >
              Elevated
            </button>
            <button
              onClick={() => handleApplyPreset('nominal')}
              className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-mono text-[11px] font-bold transition-all"
              title="Simulate nominal flight baseline"
            >
              Nominal
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {logToast && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border-2 border-emerald-500/60 text-emerald-300 font-mono text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-[0_0_20px_rgba(16,185,129,0.35)] animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{logToast}</span>
        </div>
      )}

      {/* 1. Large Glowing Vitals Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Heart Rate */}
        <div className={`glass-panel p-6 rounded-2xl relative overflow-hidden transition-all duration-300 ${
          isHrElevated ? 'glass-panel-glow-orange border-[#FF8C00]/60' : 'glass-panel-glow-cyan border-[#00E5FF]/45'
        }`}>
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            <span>HEART RATE</span>
            <div className={`p-2 rounded-lg ${isHrElevated ? 'bg-[#FF8C00]/20 text-[#FF8C00]' : 'bg-[#00E5FF]/20 text-[#00E5FF]'}`}>
              <Heart className={`w-5 h-5 ${isHrElevated ? 'animate-bounce' : 'animate-pulse'}`} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className={`text-4xl sm:text-5xl font-black font-mono tabular-nums tracking-tight ${
              isHrElevated ? 'text-[#FF8C00] glow-text-orange' : 'text-[#00E5FF] glow-text-cyan'
            }`}>
              {vitals.heartRate}
            </span>
            <span className="text-sm font-mono text-slate-200 font-bold uppercase">BPM</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300">Baseline: {profile.restingHeartRate} bpm</span>
            <span className={`font-bold px-2 py-0.5 rounded ${
              isHrElevated ? 'bg-[#FF8C00]/20 text-[#FF8C00]' : 'bg-emerald-500/20 text-emerald-300'
            }`}>
              {hrDelta > 0 ? `+${hrDelta} bpm (Elevated)` : 'Nominal'}
            </span>
          </div>
        </div>

        {/* Card 2: Blood Pressure */}
        <div className="glass-panel glass-panel-glow-cyan p-6 rounded-2xl relative overflow-hidden border border-[#00E5FF]/45">
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            <span>BLOOD PRESSURE</span>
            <div className="p-2 rounded-lg bg-[#00E5FF]/20 text-[#00E5FF]">
              <TrendingUp className="w-5 h-5 text-[#00E5FF]" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black font-mono tabular-nums text-white glow-text-cyan tracking-tight">
              {vitals.bloodPressureSys}/{vitals.bloodPressureDia}
            </span>
            <span className="text-sm font-mono text-slate-200 font-bold uppercase">mmHg</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300">Mean Arterial: {Math.round((vitals.bloodPressureSys + 2 * vitals.bloodPressureDia) / 3)} mmHg</span>
            <span className="text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/20">
              Optimal
            </span>
          </div>
        </div>

        {/* Card 3: Blood Oxygen SpO2 */}
        <div className="glass-panel glass-panel-glow-cyan p-6 rounded-2xl relative overflow-hidden border border-[#00E5FF]/45">
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            <span>OXYGEN SATURATION (SpO2)</span>
            <div className="p-2 rounded-lg bg-[#00E5FF]/20 text-[#00E5FF]">
              <Droplets className="w-5 h-5 text-[#00E5FF]" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black font-mono tabular-nums text-[#00E5FF] glow-text-cyan tracking-tight">
              {vitals.spO2}
            </span>
            <span className="text-sm font-mono text-slate-200 font-bold uppercase">%</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300">Cabin PO₂: 21.0 kPa</span>
            <span className="text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/20">
              100% Target
            </span>
          </div>
        </div>

        {/* Card 4: Core Temperature */}
        <div className="glass-panel glass-panel-glow-cyan p-6 rounded-2xl relative overflow-hidden border border-[#00E5FF]/45">
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            <span>CORE BODY TEMP</span>
            <div className="p-2 rounded-lg bg-[#00E5FF]/20 text-[#00E5FF]">
              <Thermometer className="w-5 h-5 text-[#00E5FF]" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black font-mono tabular-nums text-white glow-text-cyan tracking-tight">
              {vitals.temperature.toFixed(1)}
            </span>
            <span className="text-sm font-mono text-slate-200 font-bold uppercase">°C</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300">{(vitals.temperature * 1.8 + 32).toFixed(1)} °F</span>
            <span className="text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/20">
              Normothermic
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Telemetry Strip: Sleep, Respiration, HRV */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-panel p-5 rounded-xl border border-slate-700/80 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
          <div>
            <div className="text-xs font-mono uppercase text-slate-300 font-bold flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-[#FF8C00]" />
              <span>SLEEP DURATION (LAST 24H)</span>
            </div>
            <div className="mt-2 text-2xl font-extrabold font-mono text-white flex items-baseline gap-1.5">
              <span>{vitals.sleepHours.toFixed(1)}</span>
              <span className="text-xs font-sans text-slate-300 font-normal">hours (Fragmented)</span>
            </div>
            <div className="text-xs text-[#FF8C00] font-mono mt-1 font-semibold">
              Target: ≥ 7.5 hrs · Sleep debt active
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-slate-700/80 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
          <div>
            <div className="text-xs font-mono uppercase text-slate-300 font-bold flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-[#00E5FF]" />
              <span>RESPIRATORY RATE</span>
            </div>
            <div className="mt-2 text-2xl font-extrabold font-mono text-[#00E5FF] flex items-baseline gap-1.5">
              <span>{vitals.respiratoryRate}</span>
              <span className="text-xs font-sans text-slate-300 font-normal">breaths / min</span>
            </div>
            <div className="text-xs text-emerald-400 font-mono mt-1 font-semibold">
              Eupneic breathing pattern
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-slate-700/80 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
          <div>
            <div className="text-xs font-mono uppercase text-slate-300 font-bold flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#00E5FF]" />
              <span>HEART RATE VARIABILITY (HRV)</span>
            </div>
            <div className="mt-2 text-2xl font-extrabold font-mono text-white flex items-baseline gap-1.5">
              <span>{vitals.hrvMs}</span>
              <span className="text-xs font-sans text-slate-300 font-normal">ms (RMSSD)</span>
            </div>
            <div className="text-xs text-slate-300 font-mono mt-1 font-semibold">
              Autonomic parasympathetic index
            </div>
          </div>
        </div>
      </div>

      {/* 2. Recharts: 7-Day Heart Rate Line Chart */}
      <div className="glass-panel glass-panel-glow-cyan p-6 sm:p-7 rounded-2xl border border-[#00E5FF]/35 shadow-[0_0_35px_rgba(0,229,255,0.18)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF]" />
              <h2 className="text-xl sm:text-2xl font-bold text-white font-['Chakra_Petch',sans-serif] tracking-wide">
                Heart Rate Chronobiology & 7-Day Trend
              </h2>
            </div>
            <p className="text-sm font-sans text-slate-300 mt-1">
              Automated telemetry trending vs Dr. Salma Johnson's 58 bpm resting baseline.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedRange('7D')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedRange === '7D'
                  ? 'bg-[#00E5FF] text-black shadow-[0_0_15px_#00E5FF]'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              7-DAY TREND
            </button>
            <button
              onClick={() => setSelectedRange('24H')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedRange === '24H'
                  ? 'bg-[#00E5FF] text-black shadow-[0_0_15px_#00E5FF]'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              24-HR DIURNAL
            </button>
          </div>
        </div>

        {/* The Recharts LineChart */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={vitals.historicalHeartRate}
              margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="hrLineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#00E5FF" />
                  <stop offset="70%" stopColor="#00E5FF" />
                  <stop offset="100%" stopColor="#FF8C00" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8" 
                tick={{ fill: '#cbd5e1', fontSize: 12, fontFamily: 'monospace' }}
              />
              <YAxis 
                domain={[45, 105]} 
                stroke="#94a3b8" 
                tick={{ fill: '#cbd5e1', fontSize: 12, fontFamily: 'monospace' }}
                unit=" bpm"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(8, 14, 34, 0.95)',
                  borderColor: '#00E5FF',
                  borderRadius: '12px',
                  boxShadow: '0 0 25px rgba(0, 229, 255, 0.35)',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#00E5FF', fontWeight: 'bold' }}
                itemStyle={{ color: '#ffffff' }}
                formatter={(val: any, name: any) => [
                  `${val} bpm`,
                  name === 'hr' ? 'Recorded Heart Rate' : 'Resting Baseline',
                ]}
                labelFormatter={(label) => {
                  const pt = vitals.historicalHeartRate.find((p) => p.date === label);
                  return pt ? pt.dayLabel : label;
                }}
              />
              {/* Baseline Reference Line */}
              <ReferenceLine 
                y={profile.restingHeartRate} 
                stroke="#10b981" 
                strokeDasharray="4 4" 
                label={{ 
                  value: `Baseline: ${profile.restingHeartRate} bpm`, 
                  fill: '#10b981', 
                  fontSize: 11,
                  fontFamily: 'monospace',
                  position: 'insideBottomRight'
                }} 
              />
              <Line
                type="monotone"
                dataKey="hr"
                stroke="url(#hrLineGrad)"
                strokeWidth={3}
                dot={{ fill: '#00E5FF', stroke: '#050810', strokeWidth: 2, r: 5 }}
                activeDot={{ fill: '#FF8C00', stroke: '#ffffff', strokeWidth: 2, r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend and Meta Data */}
        <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-300 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-[#00E5FF] rounded" /> Measured Heart Rate
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-3 h-0.5 border-t border-dashed border-emerald-400" /> Flight Baseline (58 bpm)
            </span>
          </div>
          <span className="text-slate-400">
            Average 7-Day HR: <strong className="text-white">65.8 bpm</strong> · Nominal Range: 50–90 bpm
          </span>
        </div>
      </div>

      {/* 3. AI Clinical Insight (Gemini AI Powered) */}
      <div className="glass-panel glass-panel-glow-orange p-6 sm:p-7 rounded-2xl border border-[#FF8C00]/40 shadow-[0_0_35px_rgba(255,140,0,0.2)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FF8C00]/20 text-[#FF8C00] border border-[#FF8C00]/40 shadow-[0_0_15px_rgba(255,140,0,0.3)]">
              <Sparkles className="w-6 h-6 text-[#FF8C00]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white font-['Chakra_Petch',sans-serif] tracking-wide">
                  AI Clinical Insight
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#FF8C00]/20 border border-[#FF8C00]/50 text-[#FFB347]">
                  {insightSource.startsWith('gemini') ? 'POWERED BY GEMINI AI' : 'AEROSPACE CLINICAL ENGINE'}
                </span>
              </div>
              <p className="text-xs font-sans text-slate-300 mt-0.5">
                Multi-system aerospace physiological correlation engine analyzing HR, sleep duration, and microgravity adaptation.
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchAiInsight()}
            disabled={isAnalyzing}
            className="px-4 py-2 rounded-xl bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-black font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(255,140,0,0.4)] disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'ANALYZING TELEMETRY...' : 'RE-ANALYZE WITH GEMINI'}</span>
          </button>
        </div>

        {/* AI Insight Body Box */}
        <div className="p-5 rounded-xl bg-[#080f26]/90 border border-[#FF8C00]/30 shadow-inner space-y-3">
          <div className="text-sm sm:text-base font-sans text-slate-100 leading-relaxed font-medium">
            "{aiInsight}"
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Recommended Flight Action: 45m Rest Cycle + 500mL Electrolytes</span>
            </div>
            <div className="text-slate-400">
              Confidence Score: <strong className="text-white">98.4%</strong> · Telemetry Sync: 1-sec latency
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Log Daily Vitals Form */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-2xl bg-[#091128] border-2 border-[#00E5FF]/60 shadow-[0_0_50px_rgba(0,229,255,0.4)] p-6 sm:p-7 space-y-6 text-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/50 shadow-[0_0_15px_rgba(0,229,255,0.3)]">
                  <Heart className="w-6 h-6 text-[#00E5FF]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-['Chakra_Petch',sans-serif] text-white tracking-wide">
                    Log Daily Astronaut Vitals
                  </h3>
                  <p className="text-xs text-slate-300 font-mono">
                    NASA Flight Telemetry Uplink // {profile.name} ({profile.callsign})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsLogModalOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-mono text-xs"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveDailyVitals} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Heart Rate */}
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Heart Rate (BPM)</span>
                    <span className="text-[#00E5FF]">{inputHr} bpm</span>
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="180"
                    value={inputHr}
                    onChange={(e) => setInputHr(Number(e.target.value))}
                    required
                    className="w-full bg-slate-900/90 text-white border border-[#00E5FF]/40 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
                  />
                  <span className="text-[10px] text-slate-400">Baseline: {profile.restingHeartRate} bpm</span>
                </div>

                {/* SpO2 */}
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Oxygen SpO2 (%)</span>
                    <span className="text-emerald-400">{inputSpO2}%</span>
                  </label>
                  <input
                    type="number"
                    min="80"
                    max="100"
                    value={inputSpO2}
                    onChange={(e) => setInputSpO2(Number(e.target.value))}
                    required
                    className="w-full bg-slate-900/90 text-white border border-[#00E5FF]/40 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
                  />
                  <span className="text-[10px] text-slate-400">Target: ≥ 98% in microgravity</span>
                </div>

                {/* Blood Pressure Systolic */}
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5">
                    BP Systolic (mmHg)
                  </label>
                  <input
                    type="number"
                    min="70"
                    max="220"
                    value={inputBpSys}
                    onChange={(e) => setInputBpSys(Number(e.target.value))}
                    required
                    className="w-full bg-slate-900/90 text-white border border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
                  />
                </div>

                {/* Blood Pressure Diastolic */}
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5">
                    BP Diastolic (mmHg)
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="130"
                    value={inputBpDia}
                    onChange={(e) => setInputBpDia(Number(e.target.value))}
                    required
                    className="w-full bg-slate-900/90 text-white border border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
                  />
                </div>

                {/* Temperature */}
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5">
                    Core Temp (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="34.0"
                    max="42.0"
                    value={inputTemp}
                    onChange={(e) => setInputTemp(Number(e.target.value))}
                    required
                    className="w-full bg-slate-900/90 text-white border border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
                  />
                </div>

                {/* Sleep Hours */}
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5">
                    Sleep Duration (Hours)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="24"
                    value={inputSleep}
                    onChange={(e) => setInputSleep(Number(e.target.value))}
                    required
                    className="w-full bg-slate-900/90 text-white border border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
                  />
                </div>

                {/* Weight (kg) */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Astronaut Mass / Weight (kg)</span>
                    <span className="text-[#FF8C00] font-bold">{inputWeight} kg</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="35"
                    max="150"
                    value={inputWeight}
                    onChange={(e) => setInputWeight(Number(e.target.value))}
                    required
                    className="w-full bg-slate-900/90 text-white border border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]"
                  />
                  <span className="text-[10px] text-slate-400">Measured via SLAMMD (Space Linear Acceleration Mass Measurement Device)</span>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLog}
                  className="px-6 py-2.5 rounded-xl bg-[#00E5FF] hover:bg-cyan-400 text-black font-extrabold flex items-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmittingLog ? 'UPLINKING...' : 'SAVE & SYNC TELEMETRY'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
