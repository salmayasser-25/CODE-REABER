import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Radio, 
  Bell, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ChevronDown,
  X,
  Shield,
  Stethoscope,
  ExternalLink
} from 'lucide-react';
import { AstronautProfile, MedicalTeamMember } from '../types/astronaut.ts';

interface FlightSurgeonHeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  profile: AstronautProfile;
  unreadCount?: number;
  onOpenNotifications?: () => void;
  onLogout?: () => void;
}

export const FlightSurgeonHeader: React.FC<FlightSurgeonHeaderProps> = ({
  currentTab,
  onSelectTab,
  profile,
  unreadCount = 2,
  onLogout,
}) => {
  const [missionTime, setMissionTime] = useState<string>('MET T+84:14:22:18');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);

  // Dynamic Mission Elapsed Time Clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const hours = String((now.getHours() + 14) % 24).padStart(2, '0');
      setMissionTime(`MET T+84:${hours}:${minutes}:${seconds}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#00E5FF]/25 bg-[#050810]/85 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.85)]">
      {/* Flight Medicine Telemetry Alert Strip */}
      <div className="w-full bg-[#FF8C00]/15 border-b border-[#FF8C00]/30 px-4 sm:px-6 py-1 text-xs text-[#FFB347] flex items-center justify-between font-mono shadow-[0_0_15px_rgba(255,140,0,0.1)]">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-3.5 h-3.5 text-[#FF8C00] shrink-0" />
          <span className="font-bold tracking-wider uppercase text-[11px] sm:text-xs text-white">
            SIMULATED DEMONSTRATION DATA
          </span>
          <span className="text-slate-500 hidden sm:inline" aria-hidden="true">·</span>
          <span className="text-slate-300 hidden sm:inline text-xs">
            NASA Space Apps Challenge — ASTRA (Astronaut Smart Health Monitoring System)
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300 hidden md:flex font-semibold">
            <Radio className="w-3 h-3 text-[#00E5FF] animate-pulse" />
            <span>TDRS-EAST RELAY:</span>
            <span className="text-[#10b981] font-bold">248.500 MHz (LOCKED)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 hidden sm:inline">CONSOLE:</span>
            <span className="text-[#00E5FF] font-bold">SURGEON-1 ALPHA</span>
          </div>
        </div>
      </div>

      {/* Main Mission Control Header Bar */}
      <div className="px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand / Logo Zone */}
        <div className="flex items-center gap-3.5 shrink-0">
          <button 
            type="button"
            onClick={() => onSelectTab('overview')}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
          >
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-[#00E5FF]/20 to-slate-900 border border-[#00E5FF]/50 text-[#00E5FF] shadow-[0_0_22px_rgba(0,229,255,0.35)] group-hover:border-[#00E5FF] transition-all">
              <Stethoscope className="w-5 h-5 text-[#00E5FF]" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#10b981] border-2 border-[#050810]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-widest text-xl sm:text-2xl text-white font-['Chakra_Petch',sans-serif]">
                  ASTRA
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-[#00E5FF]/40 text-[#00E5FF] bg-[#00E5FF]/10 shadow-[0_0_10px_rgba(0,229,255,0.2)]">
                  EXP-74
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-300 tracking-wider uppercase flex items-center gap-1.5">
                <span className="text-[#00E5FF] font-semibold">FLIGHT SURGEON</span> DASHBOARD
              </div>
            </div>
          </button>
        </div>

        {/* Center Zone: Mission Day & Orbital Status Indicators */}
        <div className="hidden lg:flex items-center gap-6 text-xs font-mono">
          {/* Mission Time Clock */}
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/80 shadow-inner">
            <Clock className="w-4 h-4 text-[#00E5FF]" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold tracking-wider">MISSION ELAPSED TIME</div>
              <div className="text-sm font-bold text-white tracking-widest text-shadow-sm font-mono">
                {missionTime}
              </div>
            </div>
          </div>

          {/* Mission Health Status */}
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-[#10b981]/10 border border-[#10b981]/40">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-ping" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold tracking-wider">CREW HEALTH STATUS</div>
              <div className="text-xs font-bold text-[#10b981] tracking-wider uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                ACTIVE BIO-TELEMETRY NOMINAL
              </div>
            </div>
          </div>
        </div>

        {/* Right Zone: Doctor Profile, Notifications, Quick Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Notifications Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white hover:border-[#00E5FF]/50 hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
              title="Clinical Telemetry Notifications"
            >
              <Bell className="w-4 h-4 text-slate-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FF8C00] text-black font-bold text-[10px] flex items-center justify-center font-mono shadow-[0_0_10px_#FF8C00]">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-[#091129] border border-[#00E5FF]/40 shadow-[0_0_40px_rgba(0,229,255,0.25)] p-4 text-slate-100 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#00E5FF]" />
                    <span className="font-bold text-sm text-white font-['Chakra_Petch',sans-serif]">
                      Clinical Alerts & Telemetry
                    </span>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1 rounded text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  <div 
                    onClick={() => {
                      onSelectTab('restrictions');
                      setShowNotifications(false);
                    }}
                    className="p-3 rounded-xl bg-[#FF8C00]/15 border border-[#FF8C00]/40 cursor-pointer hover:bg-[#FF8C00]/25 transition-all text-xs"
                  >
                    <div className="flex items-center justify-between font-bold text-white mb-1">
                      <span className="text-[#FF8C00] flex items-center gap-1.5 font-mono">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        ACTIVE RESTRICTION
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">12m ago</span>
                    </div>
                    <div className="text-slate-200">
                      Dr. Salma Johnson: Axial load locked due to +4.2 cm spinal disc expansion and L3-L5 tension.
                    </div>
                  </div>

                  <div 
                    onClick={() => {
                      onSelectTab('communications');
                      setShowNotifications(false);
                    }}
                    className="p-3 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 cursor-pointer hover:bg-[#00E5FF]/20 transition-all text-xs"
                  >
                    <div className="flex items-center justify-between font-bold text-white mb-1">
                      <span className="text-[#00E5FF] flex items-center gap-1.5 font-mono">
                        <Radio className="w-3.5 h-3.5" />
                        GROUND TEAM MESSAGE
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">30m ago</span>
                    </div>
                    <div className="text-slate-200">
                      Dr. Evelyn Reed (BME): CEVIS aerobic workout completed with steady 99% SpO2.
                    </div>
                  </div>

                  <div 
                    onClick={() => {
                      onSelectTab('analytics');
                      setShowNotifications(false);
                    }}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:bg-slate-800 transition-all text-xs"
                  >
                    <div className="flex items-center justify-between font-bold text-white mb-1">
                      <span className="text-emerald-400 flex items-center gap-1.5 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        BIO-METRIC SYNC
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">1h ago</span>
                    </div>
                    <div className="text-slate-300">
                      Daily bio-telemetry synchronized for Expedition 74 crew.
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('alerts');
                      setShowNotifications(false);
                    }}
                    className="text-xs font-mono text-rose-400 hover:text-rose-300 hover:underline font-bold"
                  >
                    OPEN MEDICAL ALERTS CENTER →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Doctor Profile Card */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-[#00E5FF]/50 transition-all text-left cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#00E5FF] to-blue-700 text-black flex items-center justify-center font-black text-sm font-['Chakra_Petch',sans-serif] shadow-[0_0_12px_rgba(0,229,255,0.3)] shrink-0">
                MV
              </div>
              <div className="hidden sm:block text-xs">
                <div className="font-bold text-white font-['Chakra_Petch',sans-serif] group-hover:text-[#00E5FF] transition-colors truncate max-w-[140px]">
                  Dr. Marcus Vance
                </div>
                <div className="text-[10px] font-mono text-[#00E5FF] font-semibold tracking-wider">
                  LEAD FLIGHT SURGEON
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
            </button>

            {/* Doctor Profile Flyout */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-[#091129] border border-[#00E5FF]/40 shadow-[0_0_40px_rgba(0,229,255,0.25)] p-4 text-slate-100 z-50 animate-in fade-in zoom-in-95 duration-150 font-mono text-xs">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                  <div className="w-12 h-12 rounded-xl bg-[#00E5FF]/20 border border-[#00E5FF]/50 flex items-center justify-center font-bold text-lg text-[#00E5FF] font-['Chakra_Petch',sans-serif]">
                    MV
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm font-['Chakra_Petch',sans-serif]">
                      Dr. Marcus Vance, M.D., FACEP
                    </div>
                    <div className="text-[#00E5FF] text-[11px] font-semibold">
                      NASA Flight Medicine Director
                    </div>
                    <div className="text-slate-400 text-[10px]">
                      ID: NASA-FS-9842 · JSC / DOD-ST
                    </div>
                  </div>
                </div>

                <div className="py-3 space-y-2 text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Board Status:</span>
                    <span className="text-emerald-400 font-bold">Aerospace Medicine Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Security Clearance:</span>
                    <span className="text-[#00E5FF] font-bold">BIO-MED ALPHA-7</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Uplink Frequency:</span>
                    <span className="text-white">248.500 MHz (SAT-Uplink)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned Crew:</span>
                    <span className="text-white font-bold">Expedition 74 (4 Astronauts)</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('communications');
                      setShowProfileMenu(false);
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-[#00E5FF]/15 hover:bg-[#00E5FF]/25 border border-[#00E5FF]/40 text-[#00E5FF] font-bold text-center block transition-all"
                  >
                    OPEN MEDICAL TEAM COMMS
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('reports');
                      setShowProfileMenu(false);
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-center block transition-all"
                  >
                    GENERATE FLIGHT REPORT
                  </button>
                  {onLogout && (
                    <button
                      type="button"
                      onClick={() => { onLogout(); setShowProfileMenu(false); }}
                      className="w-full py-2 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-center block transition-all flex items-center justify-center gap-2"
                    >
                      SIGN OUT / SWITCH ROLE
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
