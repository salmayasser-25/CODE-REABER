import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Activity, AlertTriangle, Stethoscope, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';

interface TopNavProps {
  onRefresh?: () => void;
  isEditing?: boolean;
  onToggleEdit?: () => void;
  onOpenRoleModal?: () => void;
}

const NAV_TABS = [
  { id: 'profile', path: '/profile', label: 'Profile' },
  { id: 'vitals', path: '/vitals', label: 'Vitals & AI' },
  { id: 'checkin', path: '/checkin', label: 'Daily Check-in' },
  { id: 'fitness', path: '/fitness', label: 'Fitness' },
  { id: 'mental', path: '/mental-wellness', label: 'Mental Wellness' },
  { id: 'body3d', path: '/3d-body', label: '3D Body Map' },
  { id: 'twin', path: '/digital-twin', label: 'Digital Twin' },
  { id: 'timeline', path: '/timeline', label: 'Timeline' },
  { id: 'comms', path: '/comms', label: 'Comms' },
  { id: 'reports', path: '/reports', label: 'Reports' },
  { id: 'environment', path: '/environment', label: 'Environment' },
];

export const TopNav: React.FC<TopNavProps> = ({
  isEditing = false,
  onToggleEdit,
  onOpenRoleModal,
}) => {
  const { role, logout } = useAuth();
  const navigate = useNavigate();
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
          <span className="text-slate-300 hidden md:inline font-semibold">{missionTime}</span>
          <span className="text-slate-500 hidden md:inline">·</span>
          <span className="text-slate-300 hidden md:inline font-semibold">ROLE:</span>
          <span className={`font-bold uppercase ${role === 'surgeon' ? 'text-[#FFB347]' : 'text-[#00E5FF]'}`}>
            {role === 'surgeon' ? 'FLIGHT SURGEON' : 'ASTRONAUT'}
          </span>
        </div>
      </div>

      {/* Main Top Bar */}
      <div className="px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
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
          {NAV_TABS.map((tab) => (
            <NavLink
              key={tab.id}
              to={tab.path}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#00E5FF] text-black shadow-[0_0_15px_#00E5FF]'
                    : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/80'
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>

        {/* Zone 3: Actions & Role-Based Access */}
        <div className="flex items-center gap-2.5 shrink-0">
          {onOpenRoleModal && (
            <button
              type="button"
              onClick={onOpenRoleModal}
              className="px-3 py-2 text-xs font-mono font-bold rounded-lg border border-[#FF8C00]/50 bg-[#FF8C00]/15 text-[#FFB347] hover:bg-[#FF8C00]/25 transition-all duration-200 flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,140,0,0.2)] hover:shadow-[0_0_20px_rgba(255,140,0,0.35)] cursor-pointer"
            >
              <Stethoscope className="w-4 h-4 text-[#FF8C00]" />
              <span className="hidden xl:inline">SWITCH TO</span> FLIGHT SURGEON VIEW
            </button>
          )}

          {onToggleEdit && (
            <button
              type="button"
              onClick={onToggleEdit}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all duration-200 font-mono tracking-wide flex items-center gap-1.5 cursor-pointer ${
                isEditing
                  ? 'bg-[#FF8C00] text-black hover:bg-[#FF8C00]/90 shadow-[0_0_20px_rgba(255,140,0,0.5)]'
                  : 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/50 hover:bg-[#00E5FF]/25 shadow-[0_0_18px_rgba(0,229,255,0.25)]'
              }`}
            >
              {isEditing ? 'EXIT EDIT MODE' : 'EDIT PROFILE'}
            </button>
          )}

          <button
            type="button"
            onClick={handleLogout}
            title="Switch Role / Log Out"
            className="px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-700 bg-slate-900/90 text-slate-300 hover:text-white hover:border-slate-500 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">SWITCH ROLE</span>
          </button>
        </div>
      </div>
    </header>
  );
};
