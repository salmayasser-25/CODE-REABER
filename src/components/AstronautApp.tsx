import React, { useState } from 'react';
import { SpaceBackground } from './SpaceBackground.tsx';
import { TopNav } from './TopNav.tsx';
import { Sidebar } from './Sidebar.tsx';
import { VitalSignsPage } from './VitalSignsPage.tsx';
import { MentalWellnessPage } from './MentalWellnessPage.tsx';
import { InteractiveBodyPage } from './InteractiveBodyPage.tsx';
import { FitnessPage } from './FitnessPage.tsx';
import { DailyCheckinPage } from './DailyCheckinPage.tsx';
import { UnifiedTimelinePage } from './UnifiedTimelinePage.tsx';
import { AuthUser } from './AuthPage.tsx';
import { AstronautProfile } from '../types/astronaut.ts';
import { Rocket, LogOut, UserCircle, ShieldCheck, Radio } from 'lucide-react';

// ── Default Astronaut Profile ──────────────────────────────────────────────────
const DEFAULT_ASTRO_PROFILE: AstronautProfile = {
  id: 'ASTRO-74-SJ',
  name: 'Dr. Salma Johnson',
  callsign: 'Nova',
  age: 21,
  role: 'Mission Specialist / Payload Bio-Engineer',
  missionId: 'EXP-74 / ARTEMIS BIO-LAB',
  healthStatus: 'nominal',
  photoUrl: '/src/assets/images/astronaut_salma_portrait_1794328380973.jpg',
  totalEvaHours: 28.5,
  bloodType: 'O-Positive (O+)',
  spineElongation: 4.2,
  allergies: ['Penicillin', 'Sulfa-based Antiseptics'],
  conditions: [
    'Microgravity Spinal Elongation (+4.2 cm observed)',
    'Cephalic Fluid Shift (Sub-clinical / Grade I)',
    'Space Motion Adaptation Syndrome (Resolved MET D+03)',
  ],
  assignedSurgeon: {
    name: 'Dr. Marcus Vance, M.D., FACEP',
    credentialId: 'NASA-FS-9842',
    certificationStatus: 'Active Board Certified Aerospace Medicine (JSC/DOD-ST)',
    callsignOrFreq: 'MCC-Houston / MedCom Alpha (248.500 MHz SAT-Uplink)',
    contactDirective: 'Immediate Secure Telemedicine Patch via TDRS-East Relay',
  },
  heightCm: 168.0,
  weightKg: 59.2,
  restingHeartRate: 58,
  spO2Baseline: 99,
  radiationDoseMsv: 14.8,
  missionElapsedDays: 84,
  updatedAt: new Date().toISOString(),
};

// ── Props ──────────────────────────────────────────────────────────────────────
interface AstronautAppProps {
  user: AuthUser;
  onLogout: () => void;
}

// ── Component ──────────────────────────────────────────────────────────────────
export const AstronautApp: React.FC<AstronautAppProps> = ({ user, onLogout }) => {
  const [currentTab, setCurrentTab] = useState<string>('profile');
  const [showLogoutMenu, setShowLogoutMenu] = useState<boolean>(false);

  // Merge auth user name into profile if available
  const profile: AstronautProfile = {
    ...DEFAULT_ASTRO_PROFILE,
    name: user.name || DEFAULT_ASTRO_PROFILE.name,
    callsign: user.callsign || DEFAULT_ASTRO_PROFILE.callsign,
  };

  return (
    <div
      className="min-h-screen text-slate-100 relative selection:bg-[#00E5FF]/30 selection:text-[#00E5FF]"
      style={{
        backgroundImage: "url('/assets/aistudio/3d-rendering-dark-earth-space_2c80c4c8.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#050810',
      }}
    >
      {/* Dark overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ backgroundColor: 'rgba(5, 8, 16, 0.42)' }}
      />

      {/* Animated star-field */}
      <SpaceBackground />

      {/* ── Layout ── */}
      <div className="relative z-10 flex flex-col min-h-screen">

        {/* ── Top Nav (Astronaut) ── */}
        <TopNav
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenRoleModal={() => setShowLogoutMenu((v) => !v)}
        />

        {/* ── Logout / Role flyout ── */}
        {showLogoutMenu && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowLogoutMenu(false)}
          >
            <div
              className="absolute top-16 right-6 w-72 rounded-2xl border border-[#00E5FF]/30 bg-[#060d1f]/95 backdrop-blur-xl shadow-[0_0_40px_rgba(0,229,255,0.2)] p-4 space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              {/* User pill */}
              <div className="flex items-center gap-3 pb-3 border-b border-slate-700/60">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00E5FF]/30 to-[#00E5FF]/10 flex items-center justify-center border border-[#00E5FF]/40">
                  <UserCircle className="w-6 h-6 text-[#00E5FF]" />
                </div>
                <div>
                  <p className="text-white text-xs font-bold font-['Chakra_Petch',sans-serif]">
                    {user.name}
                  </p>
                  <p className="text-slate-400 text-[10px] font-mono">
                    {user.callsign ? `CALLSIGN: ${user.callsign}` : user.email}
                  </p>
                </div>
              </div>

              {/* Role badge */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/20">
                <Rocket className="w-4 h-4 text-[#00E5FF]" />
                <span className="text-[#00E5FF] text-[11px] font-bold font-mono tracking-widest">
                  ASTRONAUT — EXP-74
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-[10px] font-mono">CLEARANCE: ACTIVE</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1">
                <Radio className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-400 text-[10px] font-mono">MET T+84 · NOMINAL</span>
              </div>

              {/* Logout button */}
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 mt-2 px-4 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold text-xs font-mono hover:bg-rose-500/25 hover:border-rose-400/50 transition-all"
              >
                <LogOut className="w-4 h-4" />
                SIGN OUT / SWITCH ROLE
              </button>
            </div>
          </div>
        )}

        {/* ── Content: Sidebar + Main ── */}
        <div className="flex-1 flex flex-row">
          <Sidebar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            astronautName={profile.name}
            callsign={profile.callsign}
          />

          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full space-y-6">

            {/* Profile / Crew Dossier */}
            {currentTab === 'profile' && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-[#00E5FF]/20 bg-[#060d1f]/80 backdrop-blur-xl p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00E5FF]/20 to-transparent border border-[#00E5FF]/30 flex items-center justify-center overflow-hidden">
                      {profile.photoUrl ? (
                        <img src={profile.photoUrl} alt={profile.name} className="w-full h-full object-cover" />
                      ) : (
                        <UserCircle className="w-10 h-10 text-[#00E5FF]" />
                      )}
                    </div>
                    <div>
                      <h1 className="text-xl font-extrabold text-white font-['Chakra_Petch',sans-serif] tracking-wide">
                        {profile.name}
                      </h1>
                      <p className="text-[#00E5FF] font-mono text-xs mt-0.5 tracking-widest">
                        CALLSIGN: {profile.callsign} · {profile.missionId}
                      </p>
                      <p className="text-slate-400 text-xs mt-0.5">{profile.role}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold font-mono tracking-widest">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {profile.healthStatus?.toUpperCase() ?? 'NOMINAL'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'MISSION DAY', value: `D+${profile.missionElapsedDays}` },
                      { label: 'BLOOD TYPE', value: profile.bloodType },
                      { label: 'SPINE Δ', value: `+${profile.spineElongation} cm` },
                      { label: 'EVA HOURS', value: `${profile.totalEvaHours} h` },
                      { label: 'RESTING HR', value: `${profile.restingHeartRate} bpm` },
                      { label: 'SpO₂ BASE', value: `${profile.spO2Baseline}%` },
                      { label: 'RADIATION', value: `${profile.radiationDoseMsv} mSv` },
                      { label: 'WEIGHT', value: `${profile.weightKg} kg` },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl bg-slate-900/60 border border-slate-700/40 p-3">
                        <p className="text-slate-500 text-[9px] font-mono tracking-widest mb-1">{item.label}</p>
                        <p className="text-white text-sm font-bold font-['Chakra_Petch',sans-serif]">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Conditions */}
                  {profile.conditions && profile.conditions.length > 0 && (
                    <div className="mt-5">
                      <p className="text-slate-500 text-[9px] font-mono tracking-widest mb-2">ACTIVE CONDITIONS</p>
                      <div className="space-y-1.5">
                        {profile.conditions.map((c, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-slate-300 font-mono">
                            <span className="text-amber-400 mt-0.5">▸</span>
                            {c}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assigned Surgeon */}
                  {profile.assignedSurgeon && (
                    <div className="mt-5 rounded-xl border border-[#00E5FF]/15 bg-[#00E5FF]/5 p-4">
                      <p className="text-[#00E5FF] text-[9px] font-mono tracking-widest mb-2">ASSIGNED FLIGHT SURGEON</p>
                      <p className="text-white text-sm font-bold font-['Chakra_Petch',sans-serif]">
                        {profile.assignedSurgeon.name}
                      </p>
                      <p className="text-slate-400 text-[11px] font-mono mt-0.5">
                        {profile.assignedSurgeon.certificationStatus}
                      </p>
                      <p className="text-slate-500 text-[10px] font-mono mt-0.5">
                        {profile.assignedSurgeon.callsignOrFreq}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Vital Signs */}
            {currentTab === 'vitals' && (
              <VitalSignsPage
                profile={profile}
                onNavigateToCheckin={() => setCurrentTab('checkin')}
              />
            )}

            {/* Daily Check-in */}
            {currentTab === 'checkin' && (
              <DailyCheckinPage
                profile={profile}
                onNavigateToTimeline={() => setCurrentTab('timeline')}
              />
            )}

            {/* Mental Wellness */}
            {currentTab === 'mental' && (
              <MentalWellnessPage profile={profile} />
            )}

            {/* Interactive 3D Body */}
            {currentTab === 'body3d' && (
              <InteractiveBodyPage profile={profile} />
            )}

            {/* Fitness */}
            {currentTab === 'fitness' && (
              <FitnessPage profile={profile} />
            )}

            {/* Timeline */}
            {currentTab === 'timeline' && (
              <UnifiedTimelinePage
                profile={profile}
                onNavigateToTab={setCurrentTab}
              />
            )}

          </main>
        </div>
      </div>
    </div>
  );
};

export default AstronautApp;

