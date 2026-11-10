import React from 'react';
import { 
  UserCheck, 
  Activity, 
  Stethoscope, 
  Dna, 
  Cpu, 
  Orbit,
  Lock
} from 'lucide-react';

interface SidebarProps {
  currentTab?: string;
  onSelectTab?: (tab: string) => void;
  astronautName?: string;
  callsign?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab = 'profile',
  astronautName = 'Dr. Salma Johnson',
  callsign = 'Nova',
}) => {
  const navItems = [
    {
      id: 'profile',
      label: 'Astronaut Profile',
      sublabel: 'Crew Dossier & Adaptations',
      icon: UserCheck,
      active: true,
      phase: 'Phase 1 Active',
    },
    {
      id: 'vitals',
      label: 'Biometric Telemetry',
      sublabel: 'ECG, SpO2 & Hemodynamics',
      icon: Activity,
      active: false,
      phase: 'Phase 2',
    },
    {
      id: 'symptoms',
      label: 'Diagnostic Matrix',
      sublabel: 'SANS & Decompression Analysis',
      icon: Stethoscope,
      active: false,
      phase: 'Phase 3',
    },
    {
      id: 'countermeasures',
      label: 'Countermeasures',
      sublabel: 'ARED Protocols & SkinSuit',
      icon: Dna,
      active: false,
      phase: 'Phase 4',
    },
    {
      id: 'surgeon-link',
      label: 'Surgeon Direct Uplink',
      sublabel: 'Telemedicine Ground Control',
      icon: Cpu,
      active: false,
      phase: 'Phase 5',
    },
  ];

  return (
    <aside className="w-64 lg:w-72 shrink-0 border-r border-[#00E5FF]/25 bg-[#050810]/75 backdrop-blur-xl flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem-25px)]">
      {/* Navigation section */}
      <div className="p-4 space-y-6">
        <div>
          <div className="px-2 py-1 text-xs font-mono tracking-widest uppercase text-slate-300 font-bold">
            HEALTH INTELLIGENCE MODULES
          </div>
          <nav className="mt-3 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isCurrent = item.id === currentTab;

              return (
                <div
                  key={item.id}
                  className={`w-full text-left rounded-xl p-3.5 transition-all duration-200 border ${
                    isCurrent
                      ? 'bg-[#00E5FF]/15 border-[#00E5FF]/60 text-white shadow-[0_0_20px_rgba(0,229,255,0.25)] cursor-pointer'
                      : 'border-slate-800/80 bg-slate-900/30 text-slate-300 hover:text-white hover:bg-slate-800/60 cursor-not-allowed opacity-85'
                  }`}
                  title={isCurrent ? item.label : `${item.label} (Scheduled for ${item.phase})`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isCurrent
                            ? 'bg-[#00E5FF] text-black shadow-[0_0_12px_#00E5FF]'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold tracking-wide font-['Chakra_Petch',sans-serif] flex items-center gap-1.5 text-white">
                          {item.label}
                          {!isCurrent && (
                            <Lock className="w-3.5 h-3.5 text-slate-400 inline-block" />
                          )}
                        </div>
                        <div className="text-xs text-slate-300 font-sans line-clamp-1 mt-0.5">
                          {item.sublabel}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-xs font-mono">
                    <span
                      className={
                        isCurrent ? 'text-[#00E5FF] font-bold' : 'text-slate-400'
                      }
                    >
                      {item.phase}
                    </span>
                    {isCurrent && (
                      <span className="inline-flex items-center gap-1.5 text-[#10b981] font-bold">
                        <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
                        ENGAGED
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Space Mission Details Box with High-Contrast Text */}
        <div className="rounded-xl p-4 border border-[#00E5FF]/25 bg-[#09112a] shadow-[0_4px_15px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2 text-xs font-mono text-[#00E5FF] font-bold mb-3 uppercase tracking-wider">
            <Orbit className="w-4 h-4 text-[#00E5FF]" />
            <span>ORBITAL ENVIRONMENT</span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-300">Station Altitude:</span>
              <span className="text-white font-bold">418.2 km (LEO)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Microgravity:</span>
              <span className="text-emerald-300 font-bold">10⁻⁶ g (μG Nominal)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Cabin Pressure:</span>
              <span className="text-white font-bold">101.3 kPa (1.0 atm)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Cabin O₂ / CO₂:</span>
              <span className="text-white font-bold">20.9% / 0.28%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Crew Dossier Anchor */}
      <div className="p-4 border-t border-slate-800 bg-[#070d1e]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl border border-[#00E5FF]/50 bg-[#00E5FF]/15 flex items-center justify-center font-black text-[#00E5FF] text-base font-['Chakra_Petch',sans-serif] shadow-[0_0_15px_rgba(0,229,255,0.25)]">
              SJ
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#10b981] border-2 border-black" />
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-bold text-white truncate font-['Chakra_Petch',sans-serif]">
              {astronautName}
            </div>
            <div className="text-xs font-mono text-[#00E5FF] flex items-center gap-1">
              <span className="text-slate-300">CALLSIGN:</span>
              <span className="font-black uppercase tracking-wider glow-text-cyan">{callsign}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
