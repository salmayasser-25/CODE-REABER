import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Heart, 
  Activity, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Thermometer, 
  Droplets,
  Clock,
  Sparkles,
  Stethoscope
} from 'lucide-react';
import { CrewMemberSummary, AstronautProfile } from '../types/astronaut.ts';

interface AstronautMonitoringPageProps {
  crew: CrewMemberSummary[];
  currentProfile: AstronautProfile;
  onSelectAstronaut: (astronautId: string) => void;
  onOpenDetailedProfile: (astronautId: string) => void;
}

export const AstronautMonitoringPage: React.FC<AstronautMonitoringPageProps> = ({
  crew,
  currentProfile,
  onSelectAstronaut,
  onOpenDetailedProfile,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'nominal' | 'monitoring' | 'critical'>('all');
  const [sortBy, setSortBy] = useState<'status' | 'hr' | 'spo2' | 'name'>('status');

  // Filtered & Sorted Crew members
  const filteredCrew = useMemo(() => {
    let result = [...crew];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.callsign.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q) ||
          m.role.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((m) => m.healthStatus === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'status') {
        const order = { critical: 0, monitoring: 1, nominal: 2 };
        return order[a.healthStatus] - order[b.healthStatus];
      }
      if (sortBy === 'hr') {
        return b.heartRate - a.heartRate;
      }
      if (sortBy === 'spo2') {
        return a.spO2 - b.spO2;
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return result;
  }, [crew, searchQuery, statusFilter, sortBy]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-[#00E5FF]/40 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#00E5FF] font-bold uppercase tracking-wider mb-1">
              <Users className="w-4 h-4 text-[#00E5FF]" />
              <span>EXPEDITION 74 CREW HEALTH SURVEILLANCE</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-['Chakra_Petch',sans-serif]">
              Astronaut Telemetry & Clinical Monitoring Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 font-sans">
              Continuous bio-telemetry feeds, autonomic indices, and clinical adaptation tracking across all expedition personnel.
            </p>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-ping" />
            <span>4 / 4 CREW DOWNLINK SYNCHRONIZED</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Status Filter Pills, Sort Dropdown */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search astronaut by name, callsign, or ID..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm font-mono focus:border-[#00E5FF] focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-mono"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Health Status Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            {(['all', 'nominal', 'monitoring', 'critical'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer uppercase ${
                  statusFilter === status
                    ? status === 'monitoring'
                      ? 'bg-[#FF8C00] text-black shadow-[0_0_12px_#FF8C00]'
                      : status === 'critical'
                      ? 'bg-rose-500 text-white shadow-[0_0_12px_#f43f5e]'
                      : 'bg-[#00E5FF] text-black shadow-[0_0_12px_#00E5FF]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">SORT:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="status" className="bg-[#091129]">Health Status</option>
              <option value="hr" className="bg-[#091129]">Heart Rate (High → Low)</option>
              <option value="spo2" className="bg-[#091129]">SpO2 (Low → High)</option>
              <option value="name" className="bg-[#091129]">Name (A → Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Astronaut Cards Grid (Requirements 2.3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCrew.map((member) => {
          const isSelected = member.id === currentProfile.id;
          const isAttention = member.healthStatus === 'monitoring' || member.healthStatus === 'critical';

          return (
            <div
              key={member.id}
              className={`glass-panel rounded-2xl p-5 border transition-all relative overflow-hidden ${
                isAttention
                  ? 'border-[#FF8C00]/50 hover:border-[#FF8C00] shadow-[0_0_25px_rgba(255,140,0,0.22)]'
                  : 'border-slate-800/90 hover:border-[#00E5FF]/60 hover:shadow-[0_0_25px_rgba(0,229,255,0.2)]'
              }`}
            >
              {/* Top Row: Avatar, ID, Status */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    {member.photoUrl ? (
                      <img
                        src={member.photoUrl}
                        alt={member.name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-[#00E5FF]/50 shadow-md"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center font-black text-lg text-[#00E5FF] font-['Chakra_Petch',sans-serif] shadow-md">
                        {member.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                    )}
                    <span
                      className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-black ${
                        isAttention ? 'bg-[#FF8C00] animate-pulse' : 'bg-[#10b981]'
                      }`}
                    />
                  </div>

                  <div>
                    <div className="font-extrabold text-base text-white font-['Chakra_Petch',sans-serif] flex items-center gap-2">
                      {member.name}
                    </div>
                    <div className="text-xs font-mono text-slate-300">
                      ID: <span className="text-white font-bold">{member.id}</span> · CALLSIGN:{' '}
                      <span className="text-[#00E5FF] font-black">{member.callsign}</span>
                    </div>
                    <div className="text-xs text-slate-400 font-sans mt-0.5">
                      {member.role}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block text-[11px] font-mono px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider ${
                      isAttention
                        ? 'bg-[#FF8C00]/20 text-[#FF8C00] border border-[#FF8C00]/50 shadow-[0_0_10px_rgba(255,140,0,0.2)]'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}
                  >
                    {member.healthStatus}
                  </span>
                  <div className="text-[10px] font-mono text-slate-500 mt-1 flex items-center justify-end gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{member.lastMeasurementTime}</span>
                  </div>
                </div>
              </div>

              {/* Vitals Telemetry Box */}
              <div className="grid grid-cols-4 gap-2.5 mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center font-mono">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase flex items-center justify-center gap-1">
                    <Heart className="w-3 h-3 text-rose-400" />
                    <span>HEART RATE</span>
                  </div>
                  <div className={`text-base font-black mt-0.5 ${member.heartRate > 70 ? 'text-[#FF8C00]' : 'text-white'}`}>
                    {member.heartRate} <span className="text-[10px] font-normal text-slate-400">bpm</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase flex items-center justify-center gap-1">
                    <Activity className="w-3 h-3 text-[#00E5FF]" />
                    <span>SPO2</span>
                  </div>
                  <div className="text-base font-black text-emerald-300 mt-0.5">
                    {member.spO2}%
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase flex items-center justify-center gap-1">
                    <Droplets className="w-3 h-3 text-blue-400" />
                    <span>BP (SYS/DIA)</span>
                  </div>
                  <div className="text-base font-black text-white mt-0.5">
                    {member.bloodPressure}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase flex items-center justify-center gap-1">
                    <Thermometer className="w-3 h-3 text-amber-400" />
                    <span>TEMP</span>
                  </div>
                  <div className="text-base font-black text-white mt-0.5">
                    {member.temperature}°C
                  </div>
                </div>
              </div>

              {/* Clinical Symptoms & Active Restrictions Badges */}
              <div className="mt-3.5 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/40 border border-slate-800/80">
                  <span className="text-slate-400 font-semibold">LATEST SYMPTOM:</span>
                  <span className={member.latestSymptom?.includes('Lumbar') ? 'text-[#FF8C00] font-bold' : 'text-slate-300'}>
                    {member.latestSymptom || 'None Reported'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/40 border border-slate-800/80">
                  <span className="text-slate-400 font-semibold">ACTIVE RESTRICTIONS:</span>
                  <span className={member.activeRestrictionsCount > 0 ? 'text-rose-400 font-black' : 'text-emerald-400 font-bold'}>
                    {member.activeRestrictionsCount > 0 ? `${member.activeRestrictionsCount} Active Restrictions` : 'None (Fully Cleared)'}
                  </span>
                </div>
              </div>

              {/* Navigation Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onSelectAstronaut(member.id)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>VIEW VITALS</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenDetailedProfile(member.id)}
                  className="px-4 py-2 rounded-xl bg-[#00E5FF]/15 hover:bg-[#00E5FF]/25 border border-[#00E5FF]/50 text-[#00E5FF] text-xs font-mono font-black transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,229,255,0.2)] hover:shadow-[0_0_20px_rgba(0,229,255,0.35)] cursor-pointer"
                >
                  <span>FULL MEDICAL DOSSIER</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCrew.length === 0 && (
        <div className="glass-panel rounded-2xl p-8 text-center border border-slate-800 text-slate-400 font-mono text-xs">
          No astronauts matched the filter criteria. Try clearing search or status filters.
        </div>
      )}
    </div>
  );
};
