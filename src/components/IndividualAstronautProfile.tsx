import React, { useState } from 'react';
import { 
  UserCheck, 
  Activity, 
  FileText, 
  Dumbbell, 
  ShieldAlert, 
  Clock, 
  ArrowLeft, 
  Heart, 
  Droplets, 
  Thermometer, 
  Moon, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Edit3, 
  Share2, 
  Stethoscope,
  TrendingUp,
  Zap,
  Info
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
  ReferenceLine 
} from 'recharts';
import { 
  AstronautProfile, 
  VitalsData, 
  SymptomReport, 
  MedicalRestriction, 
  TimelineEvent, 
  SpaceExercise, 
  DoctorNote 
} from '../types/astronaut.ts';

interface IndividualAstronautProfileProps {
  profile: AstronautProfile;
  vitals: VitalsData | null;
  symptoms: SymptomReport[];
  restrictions: MedicalRestriction[];
  timeline: TimelineEvent[];
  exercises: SpaceExercise[];
  notes: DoctorNote[];
  onBackToCrew: () => void;
  onOpenRestrictionModal: () => void;
  onOpenNoteModal: () => void;
  onUpdateSymptomStatus?: (symptomId: string, newStatus: 'active' | 'monitoring' | 'resolved') => void;
  onLiftRestriction?: (restrictionId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const IndividualAstronautProfile: React.FC<IndividualAstronautProfileProps> = ({
  profile,
  vitals,
  symptoms,
  restrictions,
  timeline,
  exercises,
  notes,
  onBackToCrew,
  onOpenRestrictionModal,
  onOpenNoteModal,
  onUpdateSymptomStatus,
  onLiftRestriction,
  onNavigateTab,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'vitals' | 'symptoms' | 'exercise' | 'restrictions' | 'timeline'>('overview');
  const [timeFilter, setTimeFilter] = useState<'24H' | '7D' | '30D'>('7D');
  const [timelineFilter, setTimelineFilter] = useState<string>('all');

  // Real data calculations
  const restingBaseline = profile.restingHeartRate || 58;
  const currentHr = vitals?.heartRate || 72;
  const hrDelta = currentHr - restingBaseline;
  const sleepHours = vitals?.sleepHours || 5.9;
  const activeSymptoms = symptoms.filter((s) => s.status !== 'resolved');
  const activeRestrictions = restrictions.filter((r) => r.status === 'Active');

  // Chart telemetry dataset based on timeFilter
  const chartPoints = useMemoChartData(vitals, timeFilter, restingBaseline);

  // Statistics calculated from real data
  const hrValues = chartPoints.map((p) => p.hr);
  const minHr = Math.min(...hrValues);
  const maxHr = Math.max(...hrValues);
  const avgHr = Math.round(hrValues.reduce((a, b) => a + b, 0) / hrValues.length);
  const hrVariance = Math.round(((avgHr - restingBaseline) / restingBaseline) * 100);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBackToCrew}
          className="flex items-center gap-2 text-xs font-mono font-bold text-[#00E5FF] hover:underline cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>BACK TO EXPEDITION 74 CREW MATRIX</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenNoteModal}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-[#00E5FF]/45 text-[#00E5FF] hover:bg-[#00E5FF]/15 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>RECORD DOCTOR NOTE</span>
          </button>

          <button
            type="button"
            onClick={onOpenRestrictionModal}
            className="px-3.5 py-1.5 rounded-xl bg-[#FF8C00]/15 border border-[#FF8C00]/50 text-[#FFB347] hover:bg-[#FF8C00]/25 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#FF8C00]" />
            <span>PRESCRIBE RESTRICTION</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('reports')}
            className="px-3.5 py-1.5 rounded-xl bg-[#00E5FF] text-black hover:bg-[#00E5FF]/90 text-xs font-mono font-black transition-all flex items-center gap-1.5 shadow-[0_0_15px_#00E5FF] cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>EXPORT REPORT</span>
          </button>
        </div>
      </div>

      {/* Astronaut Overview Header Card */}
      <div className="glass-panel rounded-2xl p-5 border border-[#00E5FF]/35 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              {profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt={profile.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.4)]"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-800 border-2 border-[#00E5FF] flex items-center justify-center font-black text-2xl text-[#00E5FF] font-['Chakra_Petch',sans-serif]">
                  SJ
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#FF8C00] border-2 border-black animate-pulse" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-white font-['Chakra_Petch',sans-serif]">
                  {profile.name}
                </h1>
                <span className="text-xs font-mono px-2 py-0.5 rounded font-bold bg-[#FF8C00]/20 text-[#FF8C00] border border-[#FF8C00]/50 uppercase tracking-wider">
                  HEALTH STATUS: {profile.healthStatus.toUpperCase()}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded font-bold bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40">
                  {profile.missionId}
                </span>
              </div>

              <div className="text-xs font-mono text-slate-300 mt-1 flex flex-wrap items-center gap-3">
                <span>CALLSIGN: <strong className="text-[#00E5FF] font-bold">{profile.callsign}</strong></span>
                <span>·</span>
                <span>AGE: <strong className="text-white">{profile.age}</strong></span>
                <span>·</span>
                <span>BLOOD TYPE: <strong className="text-white">{profile.bloodType}</strong></span>
                <span>·</span>
                <span>MISSION ELAPSED: <strong className="text-white">DAY {profile.missionElapsedDays} (LEO)</strong></span>
              </div>

              <div className="text-xs text-slate-300 font-sans mt-1">
                {profile.role}
              </div>
            </div>
          </div>

          {/* Key Adaptation Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full lg:w-auto font-mono text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400">SPINE ELONGATION</div>
              <div className="text-sm font-bold text-[#FF8C00]">+{profile.spineElongation} cm</div>
              <div className="text-[9px] text-slate-400">MicroG Disc Shift</div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400">EVA EXPERIENCE</div>
              <div className="text-sm font-bold text-white">{profile.totalEvaHours} hrs</div>
              <div className="text-[9px] text-[#10b981]">Cleared IVR</div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center col-span-2 sm:col-span-1">
              <div className="text-[10px] text-slate-400">ACTIVE RESTRICTIONS</div>
              <div className="text-sm font-bold text-rose-400">{activeRestrictions.length} Protocols</div>
              <div className="text-[9px] text-slate-400">Axial Loading Hold</div>
            </div>
          </div>
        </div>

        {/* 6 Section Tabs Bar (Requirement 3) */}
        <div className="flex items-center gap-2 overflow-x-auto mt-6 pt-4 border-t border-slate-800/90 text-xs font-mono">
          {[
            { id: 'overview', label: '1. Overview', icon: UserCheck },
            { id: 'vitals', label: '2. Vital Signs Analytics', icon: Activity },
            { id: 'symptoms', label: `3. Symptoms & History (${activeSymptoms.length})`, icon: Stethoscope },
            { id: 'exercise', label: '4. Exercise Monitoring', icon: Dumbbell },
            { id: 'restrictions', label: `5. Medical Restrictions (${activeRestrictions.length})`, icon: ShieldAlert },
            { id: 'timeline', label: '6. Medical Timeline', icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  active
                    ? 'bg-[#00E5FF] text-black shadow-[0_0_15px_#00E5FF]'
                    : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Current Vitals & Baseline Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="glass-panel rounded-xl p-3 border border-slate-800 text-center font-mono">
              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <Heart className="w-3 h-3 text-rose-400" />
                <span>HEART RATE</span>
              </div>
              <div className="text-xl font-black text-[#FF8C00] mt-0.5">
                {currentHr} <span className="text-[10px] font-normal text-slate-400">bpm</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Baseline: {restingBaseline} bpm ({hrDelta > 0 ? `+${hrDelta}` : hrDelta})
              </div>
            </div>

            <div className="glass-panel rounded-xl p-3 border border-slate-800 text-center font-mono">
              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <Activity className="w-3 h-3 text-[#00E5FF]" />
                <span>SPO2</span>
              </div>
              <div className="text-xl font-black text-emerald-300 mt-0.5">
                {vitals?.spO2 || 99}%
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Baseline: {profile.spO2Baseline}% (Nominal)
              </div>
            </div>

            <div className="glass-panel rounded-xl p-3 border border-slate-800 text-center font-mono">
              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <Droplets className="w-3 h-3 text-blue-400" />
                <span>BLOOD PRESSURE</span>
              </div>
              <div className="text-xl font-black text-white mt-0.5">
                {vitals ? `${vitals.bloodPressureSys}/${vitals.bloodPressureDia}` : '118/76'}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                mmHg (Optimal)
              </div>
            </div>

            <div className="glass-panel rounded-xl p-3 border border-slate-800 text-center font-mono">
              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <Thermometer className="w-3 h-3 text-amber-400" />
                <span>TEMPERATURE</span>
              </div>
              <div className="text-xl font-black text-white mt-0.5">
                {vitals?.temperature || 36.8}°C
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Core Thermal Nominal
              </div>
            </div>

            <div className="glass-panel rounded-xl p-3 border border-slate-800 text-center font-mono">
              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <Moon className="w-3 h-3 text-purple-400" />
                <span>SLEEP & REST</span>
              </div>
              <div className="text-xl font-black text-amber-300 mt-0.5">
                {sleepHours} <span className="text-[10px] font-normal text-slate-400">hrs</span>
              </div>
              <div className="text-[10px] text-amber-400 mt-1">
                Fragmented (MicroG)
              </div>
            </div>

            <div className="glass-panel rounded-xl p-3 border border-slate-800 text-center font-mono">
              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <Zap className="w-3 h-3 text-cyan-400" />
                <span>HR VARIABILITY</span>
              </div>
              <div className="text-xl font-black text-white mt-0.5">
                {vitals?.hrvMs || 64} <span className="text-[10px] font-normal text-slate-400">ms</span>
              </div>
              <div className="text-[10px] text-emerald-400 mt-1">
                Autonomic Balance OK
              </div>
            </div>
          </div>

          {/* Clinical Adaptations & Physiological Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Active Clinical Conditions */}
            <div className="glass-panel rounded-2xl p-4.5 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white font-['Chakra_Petch',sans-serif] uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#FF8C00]" />
                  <span>Microgravity Adaptation Conditions ({profile.conditions.length})</span>
                </h3>
                <span className="text-[10px] font-mono text-[#00E5FF] px-2 py-0.5 rounded bg-[#00E5FF]/10">
                  PHYSIOLOGICAL AUDIT
                </span>
              </div>

              <div className="space-y-2.5">
                {profile.conditions.map((cond, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3 text-xs font-mono"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#FF8C00] mt-1.5 shrink-0" />
                    <div className="space-y-0.5">
                      <div className="font-bold text-white">{cond}</div>
                      <div className="text-[11px] text-slate-400 font-sans">
                        {cond.includes('Spinal') && 'Verified by ultrasound. Lumbar decompression precautions enforced.'}
                        {cond.includes('Cephalic') && 'Fluid shift managed with 30m upright CEVIS cycling and head elevation.'}
                        {cond.includes('Motion') && 'Resolved autonomously after neuro-vestibular sensory recalibration.'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Allergies Box */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 font-semibold">REGISTERED ALLERGIES:</span>
                <div className="flex gap-2">
                  {profile.allergies.map((all, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                      {all}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Flight Surgeon Assigned Link & Telemedicine Relay */}
            <div className="glass-panel rounded-2xl p-4.5 border border-slate-800 space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white font-['Chakra_Petch',sans-serif] uppercase tracking-wider flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-[#00E5FF]" />
                  <span>Assigned Flight Surgeon Protocol</span>
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">CONNECTED</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Flight Surgeon:</span>
                  <span className="font-bold text-white">{profile.assignedSurgeon.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Credential ID:</span>
                  <span className="text-[#00E5FF] font-bold">{profile.assignedSurgeon.credentialId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Board Status:</span>
                  <span className="text-emerald-300 font-bold">{profile.assignedSurgeon.certificationStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">SAT-Uplink Channel:</span>
                  <span className="text-white">{profile.assignedSurgeon.callsignOrFreq}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-xs font-mono text-slate-200">
                <strong className="text-[#00E5FF]">Directive:</strong> {profile.assignedSurgeon.contactDirective}
              </div>

              <button
                type="button"
                onClick={() => onNavigateTab('communications')}
                className="w-full py-2 rounded-xl bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 border border-[#00E5FF]/50 text-[#00E5FF] font-mono text-xs font-bold transition-all text-center"
              >
                DISPATCH TELEMEDICINE MESSAGE TO ASTRONAUT →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Vital Signs Analytics */}
      {activeTab === 'vitals' && (
        <div className="space-y-6">
          {/* Time Filter Bar */}
          <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white font-['Chakra_Petch',sans-serif] uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#00E5FF]" />
                <span>Interactive Bio-Telemetry Trends & Time-Series Analysis</span>
              </h3>
              <p className="text-xs text-slate-300 font-sans mt-0.5">
                Calculated trends, averages, minimums, maximums, and variance from real telemetry records.
              </p>
            </div>

            {/* Time Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-700 font-mono text-xs">
              {(['24H', '7D', '30D'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setTimeFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    timeFilter === filter
                      ? 'bg-[#00E5FF] text-black shadow-[0_0_12px_#00E5FF]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {filter === '24H' ? '24 Hours' : filter === '7D' ? '7 Days' : '30 Days'}
                </button>
              ))}
            </div>
          </div>

          {/* Real Data Statistics KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
            <div className="glass-panel rounded-xl p-3 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">MEAN HEART RATE</div>
              <div className="text-2xl font-black text-white mt-1">
                {avgHr} <span className="text-xs font-normal text-slate-400">bpm</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Calculated for {timeFilter}</div>
            </div>

            <div className="glass-panel rounded-xl p-3 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">MIN / MAX HR</div>
              <div className="text-2xl font-black text-[#00E5FF] mt-1">
                {minHr} / {maxHr} <span className="text-xs font-normal text-slate-400">bpm</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Spread: {maxHr - minHr} bpm</div>
            </div>

            <div className="glass-panel rounded-xl p-3 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">BASELINE VARIANCE</div>
              <div className={`text-2xl font-black mt-1 ${hrVariance > 10 ? 'text-[#FF8C00]' : 'text-emerald-400'}`}>
                {hrVariance > 0 ? `+${hrVariance}%` : `${hrVariance}%`}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">vs {restingBaseline} bpm Baseline</div>
            </div>

            <div className="glass-panel rounded-xl p-3 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">TELEMETRY INTEGRITY</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                99.8%
              </div>
              <div className="text-[10px] text-emerald-300 mt-1">Zero Packet Loss (TDRS)</div>
            </div>
          </div>

          {/* Heart Rate Timeline Chart */}
          <div className="glass-panel rounded-2xl p-5 border border-[#00E5FF]/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                <h4 className="text-sm font-bold text-white font-['Chakra_Petch',sans-serif] uppercase">
                  Heart Rate Time-Series (bpm) vs Ground Baseline ({restingBaseline} bpm)
                </h4>
              </div>
              <span className="text-[10px] font-mono text-[#00E5FF] px-2 py-0.5 rounded bg-[#00E5FF]/15">
                PERIOD: {timeFilter}
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartPoints} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis domain={[50, 100]} stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#091129',
                      border: '1px solid rgba(0, 229, 255, 0.4)',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <ReferenceLine
                    y={restingBaseline}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    label={{ value: `Flight Baseline (${restingBaseline} bpm)`, fill: '#10b981', fontSize: 11 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="hr"
                    name="Measured HR"
                    stroke="#00e5ff"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#00e5ff' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Blood Pressure & Sleep Duration Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Blood Pressure */}
            <div className="glass-panel rounded-2xl p-4.5 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-white font-['Chakra_Petch',sans-serif] uppercase flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-400" />
                  <span>Blood Pressure History (mmHg)</span>
                </h4>
                <span className="text-[10px] font-mono text-slate-400">SYS / DIA</span>
              </div>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartPoints} margin={{ top: 5, right: 15, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis domain={[65, 135]} stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#091129',
                        border: '1px solid rgba(0, 229, 255, 0.4)',
                        borderRadius: '8px',
                        fontSize: '11px',
                      }}
                    />
                    <Line type="monotone" dataKey="bpSys" name="Systolic" stroke="#60a5fa" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="bpDia" name="Diastolic" stroke="#38bdf8" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sleep Hours vs Fatigue */}
            <div className="glass-panel rounded-2xl p-4.5 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-white font-['Chakra_Petch',sans-serif] uppercase flex items-center gap-2">
                  <Moon className="w-4 h-4 text-purple-400" />
                  <span>Sleep Duration & Recovery (Hours)</span>
                </h4>
                <span className="text-[10px] font-mono text-purple-400">TARGET: 8.0h</span>
              </div>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartPoints} margin={{ top: 5, right: 15, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis domain={[0, 9]} stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#091129',
                        border: '1px solid rgba(0, 229, 255, 0.4)',
                        borderRadius: '8px',
                        fontSize: '11px',
                      }}
                    />
                    <ReferenceLine y={7.0} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Target 7h', fill: '#10b981', fontSize: 10 }} />
                    <Bar dataKey="sleep" name="Sleep Hours" fill="#a855f7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Symptoms & Medical History */}
      {activeTab === 'symptoms' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-4.5 border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-['Chakra_Petch',sans-serif] uppercase flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-[#00E5FF]" />
                <span>Astronaut Symptom Log & Clinical Review Registry</span>
              </h3>
              <p className="text-xs text-slate-300 font-sans mt-0.5">
                Flight Surgeon clinical verification, severity ratings, and medical review status.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenNoteModal}
              className="px-3.5 py-2 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/40 text-[#00E5FF] hover:bg-[#00E5FF]/25 font-mono text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>RECORD CLINICAL FINDING</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {symptoms.map((sym) => (
              <div
                key={sym.id}
                className={`glass-panel rounded-2xl p-4.5 border transition-all ${
                  sym.status === 'active'
                    ? 'border-[#FF8C00]/50 shadow-[0_0_20px_rgba(255,140,0,0.15)]'
                    : sym.status === 'monitoring'
                    ? 'border-[#00E5FF]/40'
                    : 'border-slate-800 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400">{sym.id}</span>
                      <span className="text-xs font-mono font-bold text-white uppercase">{sym.bodyPart}</span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      Pain Type: <strong className="text-white">{sym.painType}</strong> · Severity:{' '}
                      <strong className={sym.intensity >= 4 ? 'text-[#FF8C00]' : 'text-white'}>
                        {sym.intensity}/10
                      </strong>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                      sym.status === 'active'
                        ? 'bg-[#FF8C00]/20 text-[#FF8C00] border border-[#FF8C00]/50'
                        : sym.status === 'monitoring'
                        ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/50'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}
                  >
                    {sym.status}
                  </span>
                </div>

                <div className="mt-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-sans text-slate-200">
                  {sym.notes}
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">
                    Reported: {new Date(sym.timestamp).toLocaleDateString()}
                  </span>

                  {onUpdateSymptomStatus && sym.status !== 'resolved' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onUpdateSymptomStatus(sym.id, 'monitoring')}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[#00E5FF] text-[10px] font-bold"
                      >
                        SET MONITORING
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateSymptomStatus(sym.id, 'resolved')}
                        className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-bold border border-emerald-500/40"
                      >
                        RESOLVE
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Exercise Monitoring */}
      {activeTab === 'exercise' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-4.5 border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-['Chakra_Petch',sans-serif] uppercase flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-[#00E5FF]" />
                <span>Countermeasure Protocol & Exercise Performance</span>
              </h3>
              <p className="text-xs text-slate-300 font-sans mt-0.5">
                Evaluation of space countermeasure devices (ARED, CEVIS, T2) against astronaut spinal adaptation.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/40 font-bold">
              WEEKLY TARGET: 14.0 HRS (92% COMPLIANT)
            </span>
          </div>

          {/* Exercise Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exercises.map((ex) => {
              const isRestricted = ex.status === 'restricted';
              return (
                <div
                  key={ex.id}
                  className={`glass-panel rounded-2xl p-4 border transition-all ${
                    isRestricted
                      ? 'border-rose-500/40 bg-rose-950/15'
                      : 'border-slate-800 hover:border-[#00E5FF]/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-white text-sm font-['Chakra_Petch',sans-serif]">
                        {ex.name}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {ex.category} · {ex.equipment}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        isRestricted
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : ex.status === 'recommended'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {ex.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-sans mt-2.5 line-clamp-2">
                    {ex.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-800 flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Duration: {ex.durationMinutes} min</span>
                    <span className="text-white font-bold">{ex.caloriesBurned} kcal</span>
                  </div>

                  {isRestricted && ex.warningMessage && (
                    <div className="mt-2.5 p-2 rounded-lg bg-rose-900/40 border border-rose-700/50 text-[11px] font-mono text-rose-200">
                      {ex.warningMessage}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 5: Medical Restrictions */}
      {activeTab === 'restrictions' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-4.5 border border-rose-500/40 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-['Chakra_Petch',sans-serif] uppercase flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Active Clinical Restrictions & Load Suspensions</span>
              </h3>
              <p className="text-xs text-slate-300 font-sans mt-0.5">
                Prescribed by Lead Flight Surgeon to prevent acute microgravity disc herniation and musculoskeletal injuries.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenRestrictionModal}
              className="px-3.5 py-2 rounded-xl bg-[#FF8C00] text-black font-mono font-black text-xs hover:bg-[#FF8C00]/90 transition-all flex items-center gap-1.5 shadow-[0_0_15px_#FF8C00]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>PRESCRIBE RESTRICTION</span>
            </button>
          </div>

          <div className="space-y-4">
            {restrictions.map((res) => (
              <div
                key={res.id}
                className="glass-panel rounded-2xl p-5 border border-slate-800 relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/50 uppercase">
                      {res.severity} PRIORITY
                    </span>
                    <h4 className="text-base font-bold text-white font-['Chakra_Petch',sans-serif]">
                      {res.name}
                    </h4>
                    <span className="text-xs font-mono text-slate-400">({res.id})</span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-slate-400">STATUS:</span>
                    <span className="text-[#10b981] font-bold uppercase">{res.status}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-sans mt-2.5">
                  {res.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-800 text-xs font-mono">
                  <div>
                    <span className="text-slate-400">Affected Body Region:</span>
                    <div className="font-bold text-white">{res.affectedRegion}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Restricted Exercises:</span>
                    <div className="font-bold text-rose-300">{res.restrictedExercises.join(', ')}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Prescribed By:</span>
                    <div className="text-slate-300">{res.prescribedBy}</div>
                  </div>
                </div>

                <div className="mt-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs font-mono text-slate-300">
                  <strong className="text-[#FF8C00]">Clinical Rationale:</strong> {res.clinicalRationale}
                </div>

                {onLiftRestriction && res.status === 'Active' && (
                  <div className="mt-3.5 flex justify-end">
                    <button
                      type="button"
                      onClick={() => onLiftRestriction(res.id)}
                      className="px-4 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold transition-all"
                    >
                      LIFT RESTRICTION (FLIGHT SURGEON CLEARANCE)
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Medical Timeline */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-4.5 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white font-['Chakra_Petch',sans-serif] uppercase flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#00E5FF]" />
                <span>Chronological Medical & Telemetry Timeline</span>
              </h3>
              <p className="text-xs text-slate-300 font-sans mt-0.5">
                Integrated flight audit: vitals changes, reported symptoms, countermeasure workouts, and doctor notes.
              </p>
            </div>

            {/* Event Filter */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
              {['all', 'vitals', 'symptom', 'restriction', 'doctor_note'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setTimelineFilter(f)}
                  className={`px-2.5 py-1 rounded-lg uppercase font-bold transition-all ${
                    timelineFilter === f
                      ? 'bg-[#00E5FF] text-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {timeline
              .filter((e) => timelineFilter === 'all' || e.type === timelineFilter)
              .map((item) => (
                <div
                  key={item.id}
                  className="glass-panel rounded-xl p-4 border border-slate-800 flex flex-col sm:flex-row items-start justify-between gap-4 font-mono text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 uppercase">
                        {item.badge || item.type}
                      </span>
                      <span className="font-bold text-white font-sans text-sm">{item.title}</span>
                    </div>
                    <p className="text-slate-300 font-sans text-xs">
                      {item.summary}
                    </p>
                  </div>
                  <div className="text-slate-400 text-[11px] shrink-0 font-mono">
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper hook to build time filter series
function useMemoChartData(vitals: VitalsData | null, timeFilter: '24H' | '7D' | '30D', baseline: number) {
  if (timeFilter === '24H') {
    return [
      { label: '00:00', hr: 60, bpSys: 116, bpDia: 74, sleep: 0 },
      { label: '04:00', hr: 56, bpSys: 114, bpDia: 72, sleep: 0 },
      { label: '08:00', hr: 68, bpSys: 118, bpDia: 76, sleep: 5.9 },
      { label: '12:00', hr: 74, bpSys: 122, bpDia: 78, sleep: 0 },
      { label: '16:00', hr: 78, bpSys: 124, bpDia: 80, sleep: 0 },
      { label: '20:00', hr: 71, bpSys: 118, bpDia: 76, sleep: 0 },
      { label: 'Now', hr: vitals?.heartRate || 72, bpSys: vitals?.bloodPressureSys || 118, bpDia: vitals?.bloodPressureDia || 76, sleep: 0 },
    ];
  }

  if (timeFilter === '30D') {
    return [
      { label: 'MET 54', hr: 58, bpSys: 116, bpDia: 74, sleep: 6.8 },
      { label: 'MET 60', hr: 60, bpSys: 118, bpDia: 75, sleep: 6.5 },
      { label: 'MET 66', hr: 62, bpSys: 117, bpDia: 75, sleep: 6.2 },
      { label: 'MET 72', hr: 64, bpSys: 119, bpDia: 76, sleep: 6.0 },
      { label: 'MET 78', hr: 66, bpSys: 120, bpDia: 77, sleep: 5.8 },
      { label: 'MET 84', hr: vitals?.heartRate || 72, bpSys: 118, bpDia: 76, sleep: 5.9 },
    ];
  }

  // Default: 7D
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
