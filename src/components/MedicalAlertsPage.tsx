import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  Search, 
  Filter, 
  Clock, 
  User, 
  ArrowRight, 
  ShieldAlert, 
  Stethoscope, 
  Check, 
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { MedicalAlert, AlertSeverity, CrewMemberSummary } from '../types/astronaut.ts';

interface MedicalAlertsPageProps {
  alerts: MedicalAlert[];
  crew: CrewMemberSummary[];
  onAcknowledgeAlert: (alertId: string) => void;
  onDismissAlert: (alertId: string) => void;
  onNavigateToAstronaut: (astronautId: string) => void;
  onNavigateToRestrictions: () => void;
}

export const MedicalAlertsPage: React.FC<MedicalAlertsPageProps> = ({
  alerts,
  crew,
  onAcknowledgeAlert,
  onDismissAlert,
  onNavigateToAstronaut,
  onNavigateToRestrictions,
}) => {
  const [severityFilter, setSeverityFilter] = useState<'all' | AlertSeverity>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed'>('all');
  const [selectedAstronaut, setSelectedAstronaut] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Real statistics computed from alerts
  const totalCount = alerts.length;
  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const warningCount = alerts.filter((a) => a.severity === 'warning').length;
  const infoCount = alerts.filter((a) => a.severity === 'info').length;
  const pendingCount = alerts.filter((a) => !a.isAcknowledged).length;

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'pending' && !alert.isAcknowledged) ||
        (statusFilter === 'reviewed' && alert.isAcknowledged);
      const matchesAstronaut = selectedAstronaut === 'all' || alert.astronautId === selectedAstronaut;
      const matchesSearch =
        alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.astronautName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSeverity && matchesStatus && matchesAstronaut && matchesSearch;
    });
  }, [alerts, severityFilter, statusFilter, selectedAstronaut, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-rose-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-rose-400 font-bold uppercase tracking-wider mb-1">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>EXPEDITION 74 MEDICAL ALERTS & CLINICAL TRIAGE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white font-['Chakra_Petch',sans-serif]">
            Medical Alerts & Telemetry Anomaly Center
          </h1>
          <p className="text-xs text-slate-300 font-sans mt-0.5">
            Centralized flight medicine surveillance: review severity levels, evaluate bio-telemetric contraindications, and jump directly to astronaut clinical dossiers.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <span className="text-slate-400">UNREVIEWED QUEUE:</span>
          <span className={`px-2.5 py-1 rounded-lg font-bold ${pendingCount > 0 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50' : 'bg-emerald-500/20 text-emerald-400'}`}>
            {pendingCount} PENDING
          </span>
        </div>
      </div>

      {/* 4 Severity KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono text-xs">
        {/* Total Alerts */}
        <div 
          onClick={() => { setSeverityFilter('all'); setStatusFilter('all'); }}
          className={`glass-panel-interactive rounded-2xl p-4 border cursor-pointer ${severityFilter === 'all' && statusFilter === 'all' ? 'border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.3)]' : 'border-slate-800'}`}
        >
          <div className="text-[10px] text-slate-400 uppercase font-bold">TOTAL ALERTS</div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">{totalCount}</div>
          <div className="text-slate-400 text-[11px] mt-1">All Recorded Signals</div>
        </div>

        {/* Critical */}
        <div 
          onClick={() => setSeverityFilter('critical')}
          className={`glass-panel-interactive rounded-2xl p-4 border cursor-pointer ${severityFilter === 'critical' ? 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'border-rose-500/30'}`}
        >
          <div className="text-[10px] text-rose-400 uppercase font-bold flex items-center justify-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>CRITICAL (RED)</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-300 mt-1">{criticalCount}</div>
          <div className="text-rose-400 text-[11px] mt-1">Immediate Safety Holds</div>
        </div>

        {/* Warning */}
        <div 
          onClick={() => setSeverityFilter('warning')}
          className={`glass-panel-interactive rounded-2xl p-4 border cursor-pointer ${severityFilter === 'warning' ? 'border-[#FF8C00] shadow-[0_0_15px_rgba(255,140,0,0.3)]' : 'border-[#FF8C00]/30'}`}
        >
          <div className="text-[10px] text-[#FF8C00] uppercase font-bold flex items-center justify-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-[#FF8C00]" />
            <span>WARNING (AMBER)</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#FFB347] mt-1">{warningCount}</div>
          <div className="text-[#FF8C00] text-[11px] mt-1">Close Monitoring Delta</div>
        </div>

        {/* Info */}
        <div 
          onClick={() => setSeverityFilter('info')}
          className={`glass-panel-interactive rounded-2xl p-4 border cursor-pointer ${severityFilter === 'info' ? 'border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.3)]' : 'border-slate-800'}`}
        >
          <div className="text-[10px] text-[#00E5FF] uppercase font-bold flex items-center justify-center gap-1">
            <Info className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>INFORMATIONAL (BLUE)</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">{infoCount}</div>
          <div className="text-[#00E5FF] text-[11px] mt-1">Resolved & Telemetry Log</div>
        </div>
      </div>

      {/* Control Bar: Search, Filters by Severity, Status & Astronaut */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 font-mono text-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts by title, description, or astronaut..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs font-mono focus:border-[#00E5FF] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Astronaut Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedAstronaut}
              onChange={(e) => setSelectedAstronaut(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#091129]">All Astronauts</option>
              {crew.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#091129]">
                  {c.name} ({c.callsign})
                </option>
              ))}
            </select>
          </div>

          {/* Severity Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {(['all', 'critical', 'warning', 'info'] as const).map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded-lg uppercase font-bold transition-all cursor-pointer ${
                  severityFilter === sev
                    ? sev === 'critical'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : sev === 'warning'
                      ? 'bg-[#FF8C00] text-black shadow-sm'
                      : 'bg-[#00E5FF] text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Review Status Pills */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'all', label: 'All Status' },
              { id: 'pending', label: 'Unreviewed' },
              { id: 'reviewed', label: 'Reviewed' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id as any)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === st.id
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts Stream List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => {
          const isCritical = alert.severity === 'critical';
          const isWarning = alert.severity === 'warning';
          const isInfo = alert.severity === 'info';

          return (
            <div
              key={alert.id}
              className={`glass-panel rounded-2xl p-5 border transition-all ${
                isCritical
                  ? 'border-rose-500/60 shadow-[0_0_25px_rgba(244,63,94,0.18)] bg-gradient-to-r from-rose-950/20 to-transparent'
                  : isWarning
                  ? 'border-[#FF8C00]/50 shadow-[0_0_20px_rgba(255,140,0,0.15)] bg-gradient-to-r from-amber-950/15 to-transparent'
                  : 'border-slate-800 bg-slate-900/40'
              }`}
            >
              {/* Alert Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      isCritical
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                        : isWarning
                        ? 'bg-[#FF8C00]/20 text-[#FF8C00] border border-[#FF8C00]/50'
                        : 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40'
                    }`}
                  >
                    {isCritical ? (
                      <AlertCircle className="w-5 h-5 text-rose-400 animate-pulse" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-5 h-5 text-[#FF8C00]" />
                    ) : (
                      <Info className="w-5 h-5 text-[#00E5FF]" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-white font-['Chakra_Petch',sans-serif]">
                        {alert.title}
                      </h3>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                          isCritical
                            ? 'bg-rose-500 text-white shadow-sm'
                            : isWarning
                            ? 'bg-[#FF8C00] text-black font-bold'
                            : 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40'
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {alert.category}
                      </span>
                    </div>

                    <div className="text-xs font-mono text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                      <span>Astronaut: <strong className="text-white">{alert.astronautName}</strong> ({alert.astronautCallsign})</span>
                      <span>·</span>
                      <span>ID: <strong className="text-[#00E5FF]">{alert.astronautId}</strong></span>
                      <span>·</span>
                      <span>{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(alert.timestamp).toLocaleDateString()})</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  {alert.isAcknowledged ? (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      <span>Reviewed: {alert.reviewedBy || 'Dr. Vance'}</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold flex items-center gap-1.5 animate-pulse">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pending Review</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Description Body */}
              <p className="mt-3 text-xs sm:text-sm text-slate-200 font-sans leading-relaxed">
                {alert.description}
              </p>

              {/* Recommended Flight Surgeon Action */}
              <div className="mt-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300 flex items-start gap-2.5">
                <Stethoscope className="w-4 h-4 text-[#00E5FF] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#00E5FF] font-bold uppercase tracking-wide">Flight Surgeon Directive / Countermeasure: </span>
                  <span>{alert.recommendedAction}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-2">
                  {!alert.isAcknowledged ? (
                    <button
                      type="button"
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ACKNOWLEDGE / MARK REVIEWED</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onDismissAlert(alert.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-all cursor-pointer"
                    >
                      CLEAR FROM ACTIVE QUEUE
                    </button>
                  )}

                  {alert.category === 'Spinal Adaptation' && (
                    <button
                      type="button"
                      onClick={onNavigateToRestrictions}
                      className="px-3 py-1.5 rounded-lg bg-[#FF8C00]/15 hover:bg-[#FF8C00]/25 text-[#FFB347] border border-[#FF8C00]/40 font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>CHECK RESTRICTIONS</span>
                    </button>
                  )}
                </div>

                {/* Primary Button to jump straight to the astronaut's full medical profile */}
                <button
                  type="button"
                  onClick={() => onNavigateToAstronaut(alert.astronautId)}
                  className="px-4 py-2 rounded-xl bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 border border-[#00E5FF]/60 text-[#00E5FF] font-black flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,229,255,0.2)] hover:shadow-[0_0_22px_rgba(0,229,255,0.4)] cursor-pointer"
                >
                  <span>OPEN {alert.astronautCallsign}'S MEDICAL PROFILE</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredAlerts.length === 0 && (
          <div className="glass-panel rounded-2xl p-10 text-center text-slate-400 font-mono text-xs border border-slate-800">
            No medical alerts match the selected filters.
          </div>
        )}
      </div>
    </div>
  );
};
