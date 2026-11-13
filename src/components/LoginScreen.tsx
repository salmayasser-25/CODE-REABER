import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldCheck, Stethoscope, UserCheck, ArrowRight, AlertTriangle } from 'lucide-react';
import { SpaceBackground } from './SpaceBackground.js';
import { useAuth, UserRole } from '../contexts/AuthContext.tsx';

export const LoginScreen: React.FC = () => {
  const { loginWithRole } = useAuth();
  const navigate = useNavigate();

  const handleSelectRole = (role: UserRole) => {
    loginWithRole(role);
    navigate('/profile', { replace: true });
  };

  return (
    <div
      className="min-h-screen text-slate-100 relative selection:bg-[#00E5FF]/30 selection:text-[#00E5FF] flex flex-col justify-between"
      style={{
        backgroundImage: "url('/assets/aistudio/3d-rendering-dark-earth-space_2c80c4c8.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#050810',
      }}
    >
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ backgroundColor: 'rgba(5, 8, 16, 0.45)' }}
      />
      <SpaceBackground />

      {/* Top Alert Strip */}
      <div className="relative z-10 w-full bg-[#FF8C00]/20 border-b border-[#FF8C00]/40 px-4 sm:px-6 py-2 text-xs text-[#FFB347] flex items-center justify-between font-mono">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#FF8C00] shrink-0" />
          <span className="font-bold tracking-wider uppercase text-white">
            SIMULATED DEMONSTRATION ACCESS
          </span>
          <span className="hidden sm:inline text-slate-300">
            · ASTROCARE Role-Based Authentication Gateway (Firebase Ready)
          </span>
        </div>
        <span className="text-[#00E5FF] font-bold">EXPEDITION-74</span>
      </div>

      {/* Main Auth Panel */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#00E5FF]/15 border border-[#00E5FF]/50 text-[#00E5FF] shadow-[0_0_25px_rgba(0,229,255,0.4)] mb-2">
              <Activity className="w-7 h-7" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-wider text-white font-['Chakra_Petch',sans-serif]">
              ASTRO<span className="text-[#00E5FF] glow-text-cyan">CARE</span>
            </h1>
            <p className="text-sm sm:text-base font-mono text-slate-300 max-w-xl mx-auto">
              Select an operational console role to initialize bio-telemetry session.
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Astronaut Role */}
            <button
              type="button"
              onClick={() => handleSelectRole('astronaut')}
              className="glass-panel-interactive text-left p-6 sm:p-7 rounded-2xl border border-[#00E5FF]/45 bg-[#0a1128]/90 hover:border-[#00E5FF] group cursor-pointer flex flex-col justify-between gap-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/40 text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.3)]">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40">
                    ROLE: ASTRONAUT
                  </span>
                </div>

                <div className="flex items-center gap-3.5 pt-1">
                  <img
                    src="/images/astronaut_salma_portrait.jpg"
                    alt="Dr. Salma Johnson"
                    className="w-14 h-14 rounded-xl object-cover border border-[#00E5FF]/50 shrink-0"
                  />
                  <div>
                    <h2 className="text-xl font-bold text-white font-['Chakra_Petch',sans-serif]">
                      Astronaut Console
                    </h2>
                    <div className="text-xs font-mono text-[#00E5FF]">
                      Dr. Salma Johnson · Callsign: Nova
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  Full crew bio-telemetry suite: vital signs, AI fitness prescriptions, 3D body symptom mapping, digital twin risk simulator, and flight surgeon uplink.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono font-bold text-[#00E5FF]">
                <span>ENTER AS ASTRONAUT</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </button>

            {/* Flight Surgeon Role */}
            <button
              type="button"
              onClick={() => handleSelectRole('surgeon')}
              className="glass-panel-interactive text-left p-6 sm:p-7 rounded-2xl border border-[#FF8C00]/45 bg-[#0a1128]/90 hover:border-[#FF8C00] group cursor-pointer flex flex-col justify-between gap-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-[#FF8C00]/15 border border-[#FF8C00]/40 text-[#FF8C00] shadow-[0_0_15px_rgba(255,140,0,0.3)]">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-[#FF8C00]/15 text-[#FFB347] border border-[#FF8C00]/40">
                    ROLE: SURGEON
                  </span>
                </div>

                <div className="pt-1">
                  <h2 className="text-xl font-bold text-white font-['Chakra_Petch',sans-serif]">
                    Flight Surgeon Console
                  </h2>
                  <div className="text-xs font-mono text-[#FFB347] mt-0.5">
                    Dr. Marcus Vance, M.D. · NASA-FS-9842
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  Ground medical oversight session. Dedicated Surgeon Dashboard will be activated in the next phase; preview crew telemetry and clinical records now.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono font-bold text-[#FFB347]">
                <span>ENTER AS FLIGHT SURGEON</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Demo Role Selector · Prepared for Firebase Authentication Integration</span>
          </div>
        </div>
      </main>
    </div>
  );
};
