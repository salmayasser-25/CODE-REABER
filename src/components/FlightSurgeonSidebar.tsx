import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Activity, 
  FileText, 
  ShieldAlert, 
  AlertCircle,
  FileCheck, 
  MessagesSquare, 
  Orbit,
  Stethoscope,
  Radio,
  Bot
} from 'lucide-react';

interface FlightSurgeonSidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  activeRestrictionsCount?: number;
  unreadCommsCount?: number;
  pendingAlertsCount?: number;
}

export const FlightSurgeonSidebar: React.FC<FlightSurgeonSidebarProps> = ({
  currentTab,
  onSelectTab,
  activeRestrictionsCount = 3,
  unreadCommsCount = 1,
  pendingAlertsCount = 2,
}) => {
  const navItems = [
    {
      id: 'overview',
      label: 'Mission Overview',
      sublabel: 'Crew Health & Bio-Matrix',
      icon: LayoutDashboard,
      badge: 'EXP-74',
    },
    {
      id: 'monitoring',
      label: 'Astronaut Monitoring',
      sublabel: 'Biometrics & Crew Status',
      icon: Users,
      badge: '4 CREW',
    },
    {
      id: 'alerts',
      label: 'Medical Alerts',
      sublabel: 'Triage, Severity & Reviews',
      icon: AlertCircle,
      badge: pendingAlertsCount > 0 ? `${pendingAlertsCount} ACTIVE` : 'NOMINAL',
      badgeColor: pendingAlertsCount > 0 ? 'bg-rose-500 text-white font-extrabold shadow-[0_0_10px_#f43f5e]' : 'bg-slate-800 text-slate-400',
    },
    {
      id: 'analytics',
      label: 'Health Analytics',
      sublabel: 'Vitals & Adaptation Trends',
      icon: Activity,
      badge: 'REALTIME',
    },
    {
      id: 'records',
      label: 'Medical Records',
      sublabel: 'Symptoms & Doctor Notes',
      icon: FileText,
      badge: 'CLINICAL',
    },
    {
      id: 'restrictions',
      label: 'Medical Restrictions',
      sublabel: 'Safety Protocols & Holds',
      icon: ShieldAlert,
      badge: activeRestrictionsCount > 0 ? `${activeRestrictionsCount} ACTIVE` : 'NONE',
      badgeColor: activeRestrictionsCount > 0 ? 'bg-[#FF8C00] text-black font-extrabold' : 'bg-slate-800 text-slate-400',
    },
    {
      id: 'reports',
      label: 'Medical Reports',
      sublabel: 'Document Exchange & Referrals',
      icon: FileCheck,
      badge: 'EXCHANGE',
    },
    {
      id: 'communications',
      label: 'Communications',
      sublabel: 'Medical Team (Ground Control)',
      icon: MessagesSquare,
      badge: unreadCommsCount > 0 ? `${unreadCommsCount} UNREAD` : 'COMMS',
      badgeColor: unreadCommsCount > 0 ? 'bg-[#00E5FF] text-black font-extrabold shadow-[0_0_10px_#00E5FF]' : 'bg-slate-800 text-slate-400',
    },
    {
      id: 'assistant',
      label: 'AI Medical Assistant',
      sublabel: 'Triage Copilot & Vital Sync',
      icon: Bot,
      badge: 'AI TRIAGE',
      badgeColor: 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/50 font-bold',
    },
  ];

  return (
    <aside className="w-64 lg:w-72 shrink-0 border-r border-[#00E5FF]/25 bg-[#050810]/75 backdrop-blur-xl flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4.5rem-28px)]">
      {/* Top Nav List */}
      <div className="p-4 space-y-5">
        <div>
          <div className="px-2 py-1 text-[11px] font-mono tracking-widest uppercase text-slate-400 font-bold flex items-center justify-between">
            <span>FLIGHT MEDICINE CONSOLE</span>
            <span className="text-[#00E5FF] text-[10px]">v4.8</span>
          </div>

          <nav className="mt-2.5 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isCurrent = currentTab === item.id || (item.id === 'monitoring' && currentTab === 'profile');

              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full text-left rounded-xl p-3 transition-all duration-200 border cursor-pointer group ${
                    isCurrent
                      ? 'bg-[#00E5FF]/15 border-[#00E5FF]/60 text-white shadow-[0_0_24px_rgba(0,229,255,0.28)]'
                      : 'border-slate-800/80 bg-slate-900/30 text-slate-300 hover:text-white hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                  title={item.label}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2 rounded-lg shrink-0 transition-colors ${
                          isCurrent
                            ? 'bg-[#00E5FF] text-black shadow-[0_0_12px_#00E5FF]'
                            : 'bg-slate-800 text-slate-300 group-hover:text-white group-hover:bg-slate-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold tracking-wide font-['Chakra_Petch',sans-serif] text-white truncate">
                          {item.label}
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans truncate">
                          {item.sublabel}
                        </div>
                      </div>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded tracking-wider shrink-0 uppercase ${
                          item.badgeColor || (isCurrent ? 'bg-[#00E5FF]/20 text-[#00E5FF] font-bold border border-[#00E5FF]/40' : 'bg-slate-800/80 text-slate-400 border border-slate-700')
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Space Station Environment Widget */}
        <div className="rounded-xl p-3.5 border border-[#00E5FF]/25 bg-[#09112a] shadow-[0_4px_15px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#00E5FF] font-bold mb-2.5 uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <Orbit className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>STATION ORBITAL STATS</span>
            </div>
            <span className="text-[10px] text-emerald-400">NOMINAL</span>
          </div>
          <div className="space-y-1.5 text-[11px] font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">ISS Altitude:</span>
              <span className="text-white font-bold">418.4 km (LEO)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Microgravity:</span>
              <span className="text-emerald-300 font-bold">10⁻⁶ g (μG)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cabin Pressure:</span>
              <span className="text-white font-bold">101.3 kPa</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">ECLSS O₂ / CO₂:</span>
              <span className="text-white font-bold">20.9% / 0.28%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flight Surgeon Console Identity Card */}
      <div className="p-3.5 border-t border-slate-800 bg-[#070d1e]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl border border-[#00E5FF]/50 bg-[#00E5FF]/15 flex items-center justify-center font-black text-[#00E5FF] text-sm font-['Chakra_Petch',sans-serif] shadow-[0_0_15px_rgba(0,229,255,0.25)]">
              FS
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#10b981] border-2 border-black" />
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold text-white truncate font-['Chakra_Petch',sans-serif]">
              Dr. Marcus Vance, M.D.
            </div>
            <div className="text-[10px] font-mono text-[#00E5FF] flex items-center gap-1">
              <span className="text-slate-400">CALLSIGN:</span>
              <span className="font-bold text-[#00E5FF]">MEDCOM-1</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
