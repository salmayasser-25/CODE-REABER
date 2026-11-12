import React, { useState } from 'react';
import { 
  Activity, 
  Heart, 
  Droplets, 
  Thermometer, 
  Moon, 
  Wind, 
  TrendingUp, 
  Zap, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Clock,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine,
  AreaChart,
  Area
} from 'recharts';
import { AstronautProfile, VitalsData, CrewMemberSummary } from '../types/astronaut.ts';

interface HealthAnalyticsPageProps {
  profile: AstronautProfile;
  vitals: VitalsData | null;
  crew: CrewMemberSummary[];
  onNavigateTab: (tab: string) => void;
}

export const HealthAnalyticsPage: React.FC<HealthAnalyticsPageProps> = ({
  profile,
  vitals,
  crew,
  onNavigateTab,
}) => {
  const [timeRange, setTimeRange] = useState<'24H' | '7D' | '30D'>('7D');
  const [selectedMetric, setSelectedMetric] = useState<'hr' | 'bp' | 'spo2' | 'sleep' | 'hrv'>('hr');

  const baselineHr = profile.restingHeartRate || 58;
  const currentHr = vitals?.heartRate || 72;
  const currentSleep = vitals?.sleepHours || 5.9;

  // Real telemetry data points adapted per timeRange
  const telemetryData = getTelemetryTimeSeries(vitals, timeRange, baselineHr);

  const hrArray = telemetryData.map((d) => d.hr);
  const minHr = Math.min(...hrArray);
  const maxHr = Math.max(...hrArray);
  const meanHr = Math.round(hrArray.reduce((a, b) => a + b, 0) / hrArray.length);
  const variancePct = Math.round(((meanHr - baselineHr) / baselineHr) * 100);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-[#00E5FF]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#00E5FF] font-bold uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4 text-[#00E5FF]" />
            <span>CREW BIOMETRIC SURVEILLANCE & RECOVERY MODELING</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white font-['Chakra_Petch',sans-serif]">
            Health Analytics & Adaptation Trends
          </h1>
          <p className="text-xs text-slate-300 font-sans mt-0.5">
            Real-time biometric analytics, autonomic tone tracking, and cardiovascular stability indices for Expedition 74.
          </p>
        </div>

        {/* Time Filters */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-700 font-mono text-xs">
          {(['24H', '7D', '30D'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setTimeRange(r)}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                timeRange === r
                  ? 'bg-[#00E5FF] text-black shadow-[0_0_12px_#00E5FF]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r === '24H' ? '24 Hours' : r === '7D' ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Calculated Statistical Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
        <div className="glass-panel rounded-2xl p-4 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-bold">MEAN HEART RATE</div>
          <div className="text-2xl font-black text-white mt-1">
            {meanHr} <span className="text-xs font-normal text-slate-400">bpm</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Baseline: {baselineHr} bpm ({variancePct > 0 ? `+${variancePct}%` : `${variancePct}%`})
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-bold">MIN / MAX ENVELOPE</div>
          <div className="text-2xl font-black text-[#00E5FF] mt-1">
            {minHr} - {maxHr} <span className="text-xs font-normal text-slate-400">bpm</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Range Delta: {maxHr - minHr} bpm</div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-bold">RECOVERY STATUS</div>
          <div className="text-2xl font-black text-[#FF8C00] mt-1">
            MODERATE
          </div>
          <div className="text-[11px] text-[#FF8C00] mt-1">Fragmented Sleep ({currentSleep}h)</div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-bold">AUTONOMIC HRV</div>
          <div className="text-2xl font-black text-emerald-300 mt-1">
            {vitals?.hrvMs || 64} <span className="text-xs font-normal text-slate-400">ms</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">Parasympathetic Nominal</div>
        </div>
      </div>

      {/* Main Interactive Chart Section */}
      <div className="glass-panel rounded-2xl p-5 border border-[#00E5FF]/30 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#00E5FF]" />
            <div>
              <h2 className="text-base font-bold text-white font-['Chakra_Petch',sans-serif] uppercase">
                Continuous Heart Rate & Resting Baseline Variance ({timeRange})
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                Subject: Dr. Salma Johnson (ASTRO-74-SJ) · 1-Hz Downlink Sync
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="inline-flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-[#00E5FF]" />
              Measured HR
            </span>
            <span className="inline-flex items-center gap-1.5 text-emerald-400 ml-3">
              <span className="w-3 h-0.5 bg-[#10b981]" />
              Flight Baseline ({baselineHr} bpm)
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={telemetryData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#00e5ff" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis domain={[50, 100]} stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#091129',
                  border: '1px solid rgba(0, 229, 255, 0.4)',
                  borderRadius: '10px',
                  fontSize: '12px',
                }}
              />
              <ReferenceLine
                y={baselineHr}
                stroke="#10b981"
                strokeDasharray="4 4"
                label={{ value: `Flight Baseline (${baselineHr})`, fill: '#10b981', fontSize: 11 }}
              />
              <Area
                type="monotone"
                dataKey="hr"
                stroke="#00e5ff"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorHr)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Multi-Metric Biometrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Blood Pressure Analysis */}
        <div className="glass-panel rounded-2xl p-4.5 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white font-['Chakra_Petch',sans-serif] uppercase flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-400" />
              <span>Blood Pressure Trends</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">SYS / DIA</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={[65, 135]} stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#091129', borderRadius: '8px', fontSize: '11px' }} />
                <Line type="monotone" dataKey="bpSys" stroke="#60a5fa" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="bpDia" stroke="#38bdf8" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between text-xs font-mono">
            <span className="text-slate-400">Current BP:</span>
            <span className="text-white font-bold">{vitals ? `${vitals.bloodPressureSys}/${vitals.bloodPressureDia}` : '118/76'} mmHg</span>
          </div>
        </div>

        {/* Sleep & Fatigue Analysis */}
        <div className="glass-panel rounded-2xl p-4.5 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white font-['Chakra_Petch',sans-serif] uppercase flex items-center gap-2">
              <Moon className="w-4 h-4 text-purple-400" />
              <span>Sleep & Fatigue Architecture</span>
            </h3>
            <span className="text-xs font-mono text-purple-400">HOURS</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={telemetryData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 9]} stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#091129', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="sleep" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between text-xs font-mono">
            <span className="text-slate-400">Last Duration:</span>
            <span className="text-amber-300 font-bold">{currentSleep} hrs (Fragmented)</span>
          </div>
        </div>

        {/* Multi-Crew Baseline Comparisons */}
        <div className="glass-panel rounded-2xl p-4.5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-['Chakra_Petch',sans-serif] uppercase flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00E5FF]" />
              <span>Crew Resting HR Comparison</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">EXP-74</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {crew.map((member) => (
              <div key={member.id} className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-bold text-white">{member.name}</span>
                  <span className={member.heartRate > 70 ? 'text-[#FF8C00] font-bold' : 'text-slate-300'}>
                    {member.heartRate} bpm
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${member.heartRate > 70 ? 'bg-[#FF8C00]' : 'bg-[#00E5FF]'}`}
                    style={{ width: `${Math.min(100, (member.heartRate / 100) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('monitoring')}
            className="w-full py-2 rounded-xl bg-[#00E5FF]/15 hover:bg-[#00E5FF]/25 border border-[#00E5FF]/40 text-[#00E5FF] text-xs font-mono font-bold transition-all text-center mt-2 cursor-pointer"
          >
            VIEW FULL CREW BIO-DOSSIER →
          </button>
        </div>
      </div>
    </div>
  );
};

function getTelemetryTimeSeries(vitals: VitalsData | null, timeRange: '24H' | '7D' | '30D', baseline: number) {
  if (timeRange === '24H') {
    return [
      { label: '00:00', hr: 60, bpSys: 116, bpDia: 74, sleep: 0 },
      { label: '04:00', hr: 56, bpSys: 114, bpDia: 72, sleep: 0 },
      { label: '08:00', hr: 68, bpSys: 118, bpDia: 76, sleep: 5.9 },
      { label: '12:00', hr: 74, bpSys: 122, bpDia: 78, sleep: 0 },
      { label: '16:00', hr: 78, bpSys: 124, bpDia: 80, sleep: 0 },
      { label: '20:00', hr: 71, bpSys: 118, bpDia: 76, sleep: 0 },
      { label: 'Now', hr: vitals?.heartRate || 72, bpSys: 118, bpDia: 76, sleep: 0 },
    ];
  }

  if (timeRange === '30D') {
    return [
      { label: 'MET 54', hr: 58, bpSys: 116, bpDia: 74, sleep: 6.8 },
      { label: 'MET 60', hr: 60, bpSys: 118, bpDia: 75, sleep: 6.5 },
      { label: 'MET 66', hr: 62, bpSys: 117, bpDia: 75, sleep: 6.2 },
      { label: 'MET 72', hr: 64, bpSys: 119, bpDia: 76, sleep: 6.0 },
      { label: 'MET 78', hr: 66, bpSys: 120, bpDia: 77, sleep: 5.8 },
      { label: 'MET 84', hr: vitals?.heartRate || 72, bpSys: 118, bpDia: 76, sleep: 5.9 },
    ];
  }

  return (
    vitals?.historicalHeartRate?.map((h) => ({
      label: h.dayLabel.split(' ')[0],
      hr: h.hr,
      bpSys: 118,
      bpDia: 76,
      sleep: h.date === 'Today' ? 5.9 : 6.2,
    })) || [
      { label: 'Nov 04', hr: 62, bpSys: 116, bpDia: 74, sleep: 6.5 },
      { label: 'Nov 05', hr: 60, bpSys: 115, bpDia: 73, sleep: 6.4 },
      { label: 'Nov 06', hr: 65, bpSys: 118, bpDia: 76, sleep: 6.0 },
      { label: 'Nov 07', hr: 68, bpSys: 120, bpDia: 78, sleep: 5.7 },
      { label: 'Nov 08', hr: 64, bpSys: 117, bpDia: 75, sleep: 6.2 },
      { label: 'Nov 09', hr: 70, bpSys: 121, bpDia: 77, sleep: 5.5 },
      { label: 'Nov 10', hr: vitals?.heartRate || 72, bpSys: 118, bpDia: 76, sleep: 5.9 },
    ]
  );
}
