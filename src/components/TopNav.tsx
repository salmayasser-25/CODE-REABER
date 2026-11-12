import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Radio, AlertTriangle, Stethoscope } from 'lucide-react';

interface TopNavProps {
  onRefresh?: () => void;
  isEditing?: boolean;
  onToggleEdit?: () => void;
  onOpenRoleModal?: () => void;
  currentTab?: string;
  onSelectTab?: (tab: string) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  isEditing = false,
  onToggleEdit,
  onOpenRoleModal,
  currentTab = 'profile',
  onSelectTab,
}) => {
  const [missionTime, setMissionTime] = useState<string>('MET T+84:14:22:18');

  // Mission Elapsed Time clock
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
    <header className="sticky top-0 z-40 w-full border-b border-[#00E5FF]/25 bg-[#050810]/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
      {/* Mandatory Simulated Demonstration Data Alert Strip */}
      <div className="w-full bg-[#FF8C00]/20 border-b border-[#FF8C00]/40 px-4 sm:px-6 py-1.5 text-xs text-[#FFB347] flex items-center justify-between font-mono shadow-[0_0_15px_rgba(255,140,0,0.15)]">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-[#FF8C00] shrink-0" />
          <span className="font-bold tracking-wider uppercase text-xs sm:text-sm text-white">
            SIMULATED DEMONSTRATION DATA
          </span>
          <span className="text-slate-400 hidden sm:inline" aria-hidden="true">·</span>
          <span className="text-slate-200 hidden sm:inline text-xs">
            NASA Space Apps Challenge — Autonomous Astronaut Bio-Intelligence Platform
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-300 hidden md:inline font-semibold">SECURITY CLEARANCE:</span>
          <span className="text-[#00E5FF] font-bold">BIO-MED ALPHA-7</span>
        </div>
      </div>

      {/* Main Top Bar */}
      <div className="px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Zone */}
        <div className="flex items-center gap-3.5 shrink-0">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/50 text-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.35)]">
            <Activity className="w-5 h-5 text-[#00E5FF]" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#10b981] border border-black" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-extrabold tracking-wider text-xl sm:text-2xl text-white font-['Chakra_Petch',sans-serif]">
                ASTRO<span className="text-[#00E5FF] glow-text-cyan">CARE</span>
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded border border-[#00E5FF]/40 text-[#00E5FF] bg-[#00E5FF]/10 hidden sm:inline shadow-[0_0_10px_rgba(0,229,255,0.2)]">
                EXPEDITION-74
              </span>
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {[
            { id: 'profile', label: 'Profile' },
            { id: 'vitals', label: 'Vitals & AI' },
            { id: 'checkin', label: 'Daily Check-in' },
            { id: 'mental', label: 'Mental Wellness' },
            { id: 'body3d', label: '3D Body Map' },
            { id: 'fitness', label: 'Fitness & Workout' },
            { id: 'timeline', label: 'Medical Timeline' },
          ].map((tab) => {
            const active = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab?.(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-[#00E5FF] text-black shadow-[0_0_15px_#00E5FF]'
                    : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/80'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Zone 3: Actions & Role-Based Access Placeholder (Requirement 7) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Switch to Flight Surgeon View Button */}
          {onOpenRoleModal && (
            <button
              type="button"
              onClick={onOpenRoleModal}
              className="px-3.5 py-2 text-xs sm:text-sm font-mono font-bold rounded-lg border border-[#FF8C00]/50 bg-[#FF8C00]/15 text-[#FFB347] hover:bg-[#FF8C00]/25 transition-all duration-200 flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,140,0,0.2)] hover:shadow-[0_0_20px_rgba(255,140,0,0.35)]"
            >
              <Stethoscope className="w-4 h-4 text-[#FF8C00]" />
              <span className="hidden sm:inline">SWITCH TO</span> FLIGHT SURGEON VIEW
            </button>
          )}

          {/* Edit Profile Button */}
          {onToggleEdit && (
            <button
              onClick={onToggleEdit}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 font-mono tracking-wide flex items-center gap-1.5 ${
                isEditing
                  ? 'bg-[#FF8C00] text-black hover:bg-[#FF8C00]/90 shadow-[0_0_20px_rgba(255,140,0,0.5)]'
                  : 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/50 hover:bg-[#00E5FF]/25 shadow-[0_0_18px_rgba(0,229,255,0.25)]'
              }`}
            >
              {isEditing ? 'EXIT EDIT MODE' : 'EDIT PROFILE'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
