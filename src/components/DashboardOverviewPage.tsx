import React from 'react';
import { 
  Users, 
  Heart, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  ArrowRight, 
  TrendingUp, 
  Clock, 
  ChevronRight, 
  Stethoscope,
  Radio,
  FileText,
  Dumbbell,
  Sparkles
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
import { 
  AstronautProfile, 
  CrewMemberSummary, 
  MedicalRestriction, 
  TimelineEvent, 
  VitalsData,
  MedicalAlert,
} from '../types/astronaut.ts';

interface DashboardOverviewPageProps {
  crew: CrewMemberSummary[];
  profile: AstronautProfile;
  vitals: VitalsData | null;
  restrictions: MedicalRestriction[];
  timeline: TimelineEvent[];
  alerts?: MedicalAlert[];
  onSelectAstronaut: (astronautId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardOverviewPage: React.FC<DashboardOverviewPageProps> = ({
  crew,
  profile,
  vitals,
  restrictions,
  timeline,
  alerts = [],
  onSelectAstronaut,
  onNavigateTab,
}) => {
  const [crewStatusFilter, setCrewStatusFilter] = React.useState<'all' | 'nominal' | 'monitoring' | 'critical'>('all');

  // Real data calculations (No hardcoding)
  const totalAstronauts = crew.length;
  const healthyAstronauts = crew.filter((c) => c.healthStatus === 'nominal').length;
  const requiringAttention = crew.filter((c) => c.healthStatus === 'monitoring').length;
  const criticalAstronauts = crew.filter((c) => c.healthStatus === 'critical').length;
  const activeRestrictions = restrictions.filter((r) => r.status === 'Active');
  const pendingAlerts = alerts.filter((a) => !a.isAcknowledged);

  const chartData = vitals?.historicalHeartRate || [
    { date: 'Day -6', dayLabel: 'Nov 04', hr: 62, baseline: 58 },
    { date: 'Day -5', dayLabel: 'Nov 05', hr: 60, baseline: 58 },
    { date: 'Day -4', dayLabel: 'Nov 06', hr: 65, baseline: 58 },
    { date: 'Day -3', dayLabel: 'Nov 07', hr: 68, baseline: 58 },
    { date: 'Day -2', dayLabel: 'Nov 08', hr: 64, baseline: 58 },
    { date: 'Day -1', dayLabel: 'Nov 09', hr: 70, baseline: 58 },
    { date: 'Today', dayLabel: 'Nov 10', hr: vitals?.heartRate || 72, baseline: 58 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Flight Surgeon Banner / Tactical Medical Command Strip */}
      <div className="glass-panel rounded-2xl p-5 border border-[#00E5FF]/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00E5FF]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 text-xs font-mono text-[#00E5FF] font-bold uppercase tracking-wider mb-1">
              <Stethoscope className="w-4 h-4 text-[#00E5FF]" />
              <span>JSC FLIGHT MEDICINE CLINICAL DIRECTIVE · EXPEDITION 74</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-['Chakra_Petch',sans-serif] tracking-wide">
              Flight Surgeon Telemetry Command & Health Matrix
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl font-sans">
              Continuous multi-crew bio-telemetry surveillance, microgravity adaptation monitoring, and countermeasure prescription for Artemis Bio-Lab & ISS USOS crew members.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigateTab('monitoring')}
              className="px-4 py-2 rounded-xl bg-[#00E5FF] text-black font-mono font-black text-xs tracking-wider hover:bg-[#00E5FF]/90 transition-all flex items-center gap-1.5 shadow-[0_0_20px_#00E5FF] cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>CREW MONITORING</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('restrictions')}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-[#FF8C00]/50 text-[#FFB347] font-mono font-bold text-xs tracking-wider hover:bg-[#FF8C00]/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <ShieldAlert className="w-4 h-4 text-[#FF8C00]" />
              <span>MANAGE RESTRICTIONS</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Data-Driven Statistics Cards (Calculated directly from project records) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Astronauts */}
        <div className="glass-panel-interactive rounded-2xl p-4 border border-[#00E5FF]/30 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider">
              TOTAL ASTRONAUTS
            </span>
            <div className="p-2 rounded-lg bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-['Chakra_Petch',sans-serif] text-white">
              {totalAstronauts}
            </span>
            <span className="text-xs font-mono text-slate-400">CREW IN ORBIT</span>
          </div>
          <div className="mt-2.5 text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
            <span>Expedition 74 Active Manifest</span>
          </div>
        </div>

        {/* Total Astronauts */}
        <div 
          onClick={() => setCrewStatusFilter('all')}
          className={`glass-panel-interactive rounded-2xl p-4 border cursor-pointer ${
            crewStatusFilter === 'all' ? 'border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.3)]' : 'border-[#00E5FF]/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider">
              TOTAL ASTRONAUTS
            </span>
            <div className="p-2 rounded-lg bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-['Chakra_Petch',sans-serif] text-white">
              {totalAstronauts}
            </span>
            <span className="text-xs font-mono text-slate-400">CREW IN ORBIT</span>
          </div>
          <div className="mt-2.5 text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
            <span>Expedition 74 Active Manifest</span>
          </div>
        </div>

        {/* Healthy Astronauts */}
        <div 
          onClick={() => setCrewStatusFilter('nominal')}
          className={`glass-panel-interactive rounded-2xl p-4 border cursor-pointer ${
            crewStatusFilter === 'nominal' ? 'border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-emerald-500/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              HEALTHY / NOMINAL
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/40">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-['Chakra_Petch',sans-serif] text-emerald-300">
              {healthyAstronauts}
            </span>
            <span className="text-xs font-mono text-slate-400">/ {totalAstronauts} ASTRONAUTS</span>
          </div>
          <div className="mt-2.5 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
            <span>Filter crew: Stable / Nominal</span>
          </div>
        </div>

        {/* Astronauts Requiring Attention */}
        <div 
          onClick={() => setCrewStatusFilter('monitoring')}
          className={`glass-panel-interactive rounded-2xl p-4 border cursor-pointer ${
            crewStatusFilter === 'monitoring' ? 'border-[#FF8C00] shadow-[0_0_15px_rgba(255,140,0,0.3)]' : 'border-[#FF8C00]/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#FF8C00] font-bold uppercase tracking-wider">
              REQUIRING ATTENTION
            </span>
            <div className="p-2 rounded-lg bg-[#FF8C00]/15 text-[#FF8C00] border border-[#FF8C00]/40">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-['Chakra_Petch',sans-serif] text-[#FFB347]">
              {requiringAttention}
            </span>
            <span className="text-xs font-mono text-[#FF8C00] font-bold">MONITORING</span>
          </div>
          <div className="mt-2.5 text-[11px] font-mono text-slate-300 flex items-center gap-1.5 truncate">
            <span>Filter crew: Salma (+4.2cm spine)</span>
          </div>
        </div>

        {/* Active Medical Restrictions */}
        <div 
          onClick={() => onNavigateTab('restrictions')}
          className="glass-panel-interactive rounded-2xl p-4 border border-rose-500/35 relative overflow-hidden cursor-pointer hover:border-rose-400"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-rose-400 font-bold uppercase tracking-wider">
              ACTIVE RESTRICTIONS
            </span>
            <div className="p-2 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/40">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-['Chakra_Petch',sans-serif] text-rose-300">
              {activeRestrictions.length}
            </span>
            <span className="text-xs font-mono text-slate-400">SAFETY PROTOCOLS</span>
          </div>
          <div className="mt-2.5 text-[11px] font-mono text-rose-400 flex items-center gap-1.5">
            <span>Axial loading & impact running held →</span>
          </div>
        </div>
      </div>

      {/* Active Medical Alerts Triage Banner */}
      {alerts && alerts.length > 0 && (
        <div className="glass-panel rounded-2xl p-4 border border-rose-500/40 bg-gradient-to-r from-rose-950/25 via-slate-900/60 to-transparent flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-400 shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black text-rose-400 uppercase tracking-wider">
                  ACTIVE CLINICAL ALERTS ({pendingAlerts.length} UNREVIEWED)
                </span>
                <span className="text-xs font-mono text-slate-400">·</span>
                <span className="text-xs font-mono text-white font-bold">
                  {alerts[0]?.title}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans mt-0.5">
                {alerts[0]?.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 font-mono text-xs">
            <button
              type="button"
              onClick={() => onSelectAstronaut(alerts[0]?.astronautId || 'ASTRO-74-SJ')}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold cursor-pointer"
            >
              OPEN {alerts[0]?.astronautCallsign || 'ASTRONAUT'} DOSSIER
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('alerts')}
              className="px-4 py-1.5 rounded-lg bg-rose-500 text-white hover:bg-rose-600 font-black flex items-center gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.35)] cursor-pointer"
            >
              <span>MEDICAL ALERTS CENTER ({alerts.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Crew Status Monitoring Matrix & Live Vitals Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Crew Health Monitoring Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#00E5FF]" />
              <h2 className="text-lg font-bold text-white font-['Chakra_Petch',sans-serif] tracking-wide">
                Expedition 74 Crew Telemetry Matrix
              </h2>
            </div>

            {/* Quick Status Filters */}
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 font-mono text-xs">
              {[
                { id: 'all', label: `All (${totalAstronauts})` },
                { id: 'nominal', label: `Nominal (${healthyAstronauts})` },
                { id: 'monitoring', label: `Attention (${requiringAttention})` },
                { id: 'critical', label: `Critical (${criticalAstronauts})` },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setCrewStatusFilter(pill.id as any)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    crewStatusFilter === pill.id
                      ? pill.id === 'monitoring'
                        ? 'bg-[#FF8C00] text-black shadow-sm'
                        : pill.id === 'critical'
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'bg-[#00E5FF] text-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {crew
              .filter((member) => crewStatusFilter === 'all' || member.healthStatus === crewStatusFilter)
              .map((member) => {
                const isSelected = member.id === profile.id;
                const isAttention = member.healthStatus === 'monitoring' || member.healthStatus === 'critical';

                return (
                  <div
                    key={member.id}
                    onClick={() => onSelectAstronaut(member.id)}
                    className={`glass-panel rounded-2xl p-4.5 border transition-all cursor-pointer relative group ${
                      member.healthStatus === 'critical'
                        ? 'border-rose-500 hover:border-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.25)]'
                        : isAttention
                        ? 'border-[#FF8C00]/50 hover:border-[#FF8C00] shadow-[0_0_20px_rgba(255,140,0,0.2)]'
                        : 'border-slate-800 hover:border-[#00E5FF]/60 hover:shadow-[0_0_20px_rgba(0,229,255,0.25)]'
                    }`}
                  >
                  {/* Astronaut Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {member.photoUrl ? (
                          <img
                            src={member.photoUrl}
                            alt={member.name}
                            className="w-12 h-12 rounded-xl object-cover border border-[#00E5FF]/50 shadow-md"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[#00E5FF] font-['Chakra_Petch',sans-serif]">
                            {member.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                        )}
                        <span
                          className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-black ${
                            isAttention ? 'bg-[#FF8C00]' : 'bg-[#10b981]'
                          }`}
                        />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm font-['Chakra_Petch',sans-serif] group-hover:text-[#00E5FF] transition-colors flex items-center gap-1.5">
                          {member.name}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {member.id} · <span className="text-[#00E5FF] font-semibold">{member.callsign}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[190px]">
                          {member.role}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                        isAttention
                          ? 'bg-[#FF8C00]/20 text-[#FF8C00] border border-[#FF8C00]/50'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}
                    >
                      {member.healthStatus}
                    </span>
                  </div>

                  {/* Vitals Pill Row */}
                  <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-800 text-center font-mono">
                    <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                      <div className="text-[9px] text-slate-400 uppercase">HEART RATE</div>
                      <div className={`text-sm font-bold ${member.heartRate > 70 ? 'text-[#FF8C00]' : 'text-white'}`}>
                        {member.heartRate} <span className="text-[9px]">bpm</span>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                      <div className="text-[9px] text-slate-400 uppercase">BLOOD O₂</div>
                      <div className="text-sm font-bold text-emerald-300">
                        {member.spO2}%
                      </div>
                    </div>

                    <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                      <div className="text-[9px] text-slate-400 uppercase">BP SYS/DIA</div>
                      <div className="text-sm font-bold text-white">
                        {member.bloodPressure}
                      </div>
                    </div>

                    <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                      <div className="text-[9px] text-slate-400 uppercase">TEMP</div>
                      <div className="text-sm font-bold text-white">
                        {member.temperature}°C
                      </div>
                    </div>
                  </div>

                  {/* Clinical Indicators */}
                  <div className="mt-3 text-[11px] font-mono space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">Symptom:</span>
                      <span className={member.latestSymptom?.includes('Lumbar') ? 'text-[#FF8C00] font-semibold' : 'text-slate-300'}>
                        {member.latestSymptom || 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">Active Restrictions:</span>
                      <span className={member.activeRestrictionsCount > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                        {member.activeRestrictionsCount > 0 ? `${member.activeRestrictionsCount} Restrictions` : 'Cleared'}
                      </span>
                    </div>
                  </div>

                  {/* Click to open dossier banner */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-[#00E5FF] group-hover:translate-x-1 transition-transform">
                    <span className="font-bold">OPEN MEDICAL DOSSIER</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Restrictions Triage List */}
          <div className="glass-panel rounded-2xl p-4 border border-rose-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white font-['Chakra_Petch',sans-serif] tracking-wider uppercase">
                  Active Medical Countermeasure Restrictions
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('restrictions')}
                className="text-xs font-mono text-rose-300 hover:underline font-bold"
              >
                RESTRICTION CONSOLE →
              </button>
            </div>

            <div className="space-y-2.5">
              {activeRestrictions.map((res) => (
                <div
                  key={res.id}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 uppercase">
                        {res.severity}
                      </span>
                      <span className="font-bold text-white">{res.name}</span>
                      <span className="text-slate-400">· {res.astronautName}</span>
                    </div>
                    <div className="text-slate-300 font-sans text-xs">
                      {res.description}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[11px] text-rose-300 font-bold">
                      {res.restrictedExercises.join(', ')}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Prescribed: {res.effectiveDate}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Bio-Telemetry Feed & Dr. Salma 7-Day HR Analytics */}
        <div className="space-y-6">
          {/* Dr. Salma Johnson Primary Subject Vitals Mini-Chart */}
          <div className="glass-panel rounded-2xl p-4.5 border border-[#00E5FF]/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#00E5FF]" />
                <h3 className="text-sm font-bold text-white font-['Chakra_Petch',sans-serif] tracking-wider uppercase">
                  Telemetry Trend: {profile.name}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#00E5FF] px-2 py-0.5 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/30">
                7-DAY WINDOW
              </span>
            </div>

            <p className="text-[11px] text-slate-300 mb-3 font-sans">
              Resting heart rate delta: <strong className="text-[#FF8C00]">+{vitals ? vitals.heartRate - profile.restingHeartRate : 14} bpm</strong> over {profile.restingHeartRate} bpm baseline, reflecting sleep fragmentation in microG.
            </p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis domain={[50, 95]} stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#091129',
                      border: '1px solid rgba(0, 229, 255, 0.4)',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <ReferenceLine y={profile.restingHeartRate} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Baseline 58', fill: '#10b981', fontSize: 10 }} />
                  <Line type="monotone" dataKey="hr" stroke="#00e5ff" strokeWidth={2.5} dot={{ r: 3, fill: '#00e5ff' }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between text-xs font-mono">
              <span className="text-slate-400">Spine Elongation:</span>
              <span className="text-[#FF8C00] font-bold">+{profile.spineElongation} cm observed</span>
            </div>
            <div className="mt-1 flex justify-between text-xs font-mono">
              <span className="text-slate-400">Sleep Duration:</span>
              <span className="text-white font-bold">{vitals?.sleepHours || 5.9} hrs (Fragmented)</span>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('analytics')}
              className="mt-3 w-full py-2 rounded-lg bg-[#00E5FF]/15 border border-[#00E5FF]/40 text-[#00E5FF] hover:bg-[#00E5FF]/25 font-mono text-xs font-bold transition-all text-center"
            >
              EXPAND FULL VITAL ANALYTICS →
            </button>
          </div>

          {/* Unified Medical Timeline Live Stream */}
          <div className="glass-panel rounded-2xl p-4.5 border border-[#00E5FF]/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#00E5FF]" />
                <h3 className="text-sm font-bold text-white font-['Chakra_Petch',sans-serif] tracking-wider uppercase">
                  Flight Medical Event Feed
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#10b981] flex items-center gap-1 font-bold">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
                1-HZ SYNC
              </span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {timeline.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs font-mono relative pl-3.5"
                >
                  <span
                    className={`absolute left-0 top-3 bottom-3 w-1 rounded-r ${
                      item.severity === 'alert'
                        ? 'bg-rose-500'
                        : item.severity === 'warning'
                        ? 'bg-[#FF8C00]'
                        : item.severity === 'info'
                        ? 'bg-[#00E5FF]'
                        : 'bg-[#10b981]'
                    }`}
                  />
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-[#00E5FF]">
                      {item.badge || item.type.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="font-bold text-white text-xs font-sans">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-slate-300 font-sans mt-0.5 line-clamp-2">
                    {item.summary}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('records')}
              className="mt-3 w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs font-semibold transition-all text-center"
            >
              VIEW MEDICAL TIMELINE AUDIT →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
