import React, { useState, useEffect } from 'react';
import { SpaceBackground } from './components/SpaceBackground.js';
import { TopNav } from './components/TopNav.js';
import { Sidebar } from './components/Sidebar.js';
import { AstronautHeader } from './components/AstronautHeader.js';
import { CrewDossierCard } from './components/CrewDossierCard.js';
import { ClinicalAdaptationsCard } from './components/ClinicalAdaptationsCard.js';
import { SurgeonLinkCard } from './components/SurgeonLinkCard.js';
import { EditProfileModal } from './components/EditProfileModal.js';
import { ClinicalContextModal } from './components/ClinicalContextModal.js';
import { RoleModal } from './components/RoleModal.js';
import { AstronautProfile, FlightSurgeon } from './types/astronaut.js';
import { 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  Sliders,
  Edit3,
  BookOpen
} from 'lucide-react';

const DEFAULT_INITIAL_PROFILE: AstronautProfile = {
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

export default function App() {
  const [profile, setProfile] = useState<AstronautProfile>(DEFAULT_INITIAL_PROFILE);
  const [isEditingInline, setIsEditingInline] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isContextModalOpen, setIsContextModalOpen] = useState<boolean>(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Auto-dismissing toast notifications
  const triggerToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  // 1. Fetch astronaut profile from backend GET /api/profile
  const loadProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          setProfile(json.data);
        }
      }
    } catch (error) {
      console.warn('Using client-side fallback baseline:', error);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // 2. Save profile updates via PATCH /api/profile
  const handleSaveProfile = async (updatesToSave?: Partial<AstronautProfile>) => {
    setIsSaving(true);
    const dataToSend = updatesToSave || profile;

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setProfile(result.data);
        setIsEditingInline(false);
        triggerToast('Astronaut dossier synchronized to Ground Telemetry DB', 'success');
      } else {
        throw new Error(result.error || 'Server validation rejected updates');
      }
    } catch (error: any) {
      setProfile((prev) => ({ ...prev, ...(updatesToSave || {}) }));
      setIsEditingInline(false);
      triggerToast('Local changes updated (Offline fallback active)', 'info');
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Reset profile back to baseline
  const handleResetProfile = async () => {
    if (!window.confirm('Reset astronaut dossier back to Dr. Salma Johnson NASA baseline?')) {
      return;
    }

    try {
      const response = await fetch('/api/profile/reset', { method: 'POST' });
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setProfile(result.data);
        }
      } else {
        setProfile(DEFAULT_INITIAL_PROFILE);
      }
      setIsEditingInline(false);
      triggerToast('Profile successfully reset to Expedition-74 baseline', 'info');
    } catch (e) {
      setProfile(DEFAULT_INITIAL_PROFILE);
      setIsEditingInline(false);
      triggerToast('Profile baseline reset locally', 'info');
    }
  };

  // In-line field changes
  const handleFieldChange = (field: keyof AstronautProfile, value: any) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSurgeonChange = (field: keyof FlightSurgeon, value: string) => {
    setProfile((prev) => ({
      ...prev,
      assignedSurgeon: {
        ...prev.assignedSurgeon,
        [field]: value,
      },
    }));
  };

  const handleAddAllergy = (allergy: string) => {
    if (!profile.allergies.includes(allergy)) {
      setProfile((prev) => ({
        ...prev,
        allergies: [...prev.allergies, allergy],
      }));
      triggerToast(`Registered allergy: ${allergy}`, 'info');
    }
  };

  const handleRemoveAllergy = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index),
    }));
  };

  const handleAddCondition = (condition: string) => {
    if (!profile.conditions.includes(condition)) {
      setProfile((prev) => ({
        ...prev,
        conditions: [...prev.conditions, condition],
      }));
      triggerToast(`Added adaptation tracking: ${condition}`, 'info');
    }
  };

  const handleRemoveCondition = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index),
    }));
  };

  const handlePhotoUpload = (photoDataUrl: string) => {
    setProfile((prev) => ({ ...prev, photoUrl: photoDataUrl }));
    triggerToast('New astronaut photo preview loaded', 'success');
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
      {/* 45% Dark Overlay (rgba(5, 8, 16, 0.45)) to showcase the vibrant Earth and glowing Nebula */}
      <div
        className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-300"
        style={{ backgroundColor: 'rgba(5, 8, 16, 0.45)' }}
      />

      {/* Dynamic Animated Canvas Space Background with Stars & Shooting Stars */}
      <SpaceBackground />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Navigation Bar with Simulated Data Alert & Role Switcher */}
        <TopNav
          isEditing={isEditingInline}
          onToggleEdit={() => setIsEditingInline((prev) => !prev)}
          onOpenRoleModal={() => setIsRoleModalOpen(true)}
        />

        {/* Content Layout: Left Sidebar + Main Content */}
        <div className="flex-1 flex flex-row">
          <Sidebar
            currentTab="profile"
            astronautName={profile.name}
            callsign={profile.callsign}
          />

          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-7 max-w-7xl mx-auto w-full space-y-7">
            {/* Inline Edit Mode Warning Strip */}
            {isEditingInline && (
              <div className="p-4 rounded-xl bg-[#FF8C00]/20 border border-[#FF8C00]/50 text-[#FFB347] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_25px_rgba(255,140,0,0.3)] backdrop-blur-md">
                <div className="flex items-center gap-3 text-sm font-mono">
                  <Sliders className="w-5 h-5 text-[#FF8C00] shrink-0" />
                  <span className="text-white">
                    <strong className="text-[#FF8C00]">INLINE EDIT MODE ENGAGED:</strong> Adjust sliders, type new values, or add allergies directly.
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleSaveProfile()}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-lg bg-[#FF8C00] text-black font-mono font-extrabold text-xs sm:text-sm hover:bg-[#FF8C00]/90 transition-colors shadow-md"
                  >
                    {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
                  </button>
                  <button
                    onClick={() => setIsEditingInline(false)}
                    className="px-4 py-2 rounded-lg bg-slate-900 text-slate-200 font-mono text-xs sm:text-sm hover:bg-slate-800 transition-colors border border-slate-700"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}

            {/* Astronaut Header Section with High-Contrast Typography & Glow */}
            <AstronautHeader
              profile={profile}
              isEditing={isEditingInline}
              onToggleEdit={() => setIsEditingInline((prev) => !prev)}
              onSave={() => handleSaveProfile()}
              onReset={handleResetProfile}
              onPhotoUpload={handlePhotoUpload}
              isSaving={isSaving}
            />

            {/* Sub-toolbar for quick modal launch and status metadata */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-2 text-xs sm:text-sm font-mono text-slate-200">
              <div className="flex items-center gap-3">
                <span className="text-[#00E5FF] font-bold">PAGE: ASTRONAUT PROFILE (PHASE 1)</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-200">TELEMETRY: 1-HZ REALTIME</span>
                <span className="text-slate-500 hidden md:inline">·</span>
                <span className="text-slate-300 hidden md:inline">LAST SYNC: {new Date(profile.updatedAt || Date.now()).toLocaleTimeString()}</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsContextModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#00E5FF]/15 hover:bg-[#00E5FF]/25 border border-[#00E5FF]/45 text-[#00E5FF] flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(0,229,255,0.2)] text-xs font-bold"
                >
                  <BookOpen className="w-4 h-4 text-[#00E5FF]" />
                  <span>Clinical Briefing</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-[#00E5FF]/45 text-white flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(0,229,255,0.2)] text-xs font-bold"
                >
                  <Edit3 className="w-4 h-4 text-[#00E5FF]" />
                  <span>Full Edit Dialog</span>
                </button>
              </div>
            </div>

            {/* Section 1: Crew Dossier Card */}
            <CrewDossierCard
              profile={profile}
              isEditing={isEditingInline}
              onChange={handleFieldChange}
            />

            {/* Section 2: Clinical Conditions & Adaptations (Spine Elongation, Blood, Allergies) */}
            <ClinicalAdaptationsCard
              profile={profile}
              isEditing={isEditingInline}
              onSpineChange={(val) => handleFieldChange('spineElongation', val)}
              onBloodTypeChange={(val) => handleFieldChange('bloodType', val)}
              onAddAllergy={handleAddAllergy}
              onRemoveAllergy={handleRemoveAllergy}
              onAddCondition={handleAddCondition}
              onRemoveCondition={handleRemoveCondition}
              onOpenContextModal={() => setIsContextModalOpen(true)}
            />

            {/* Section 3: Ground Flight Surgeon Link (with Send Bio-metric Ping action) */}
            <SurgeonLinkCard
              surgeon={profile.assignedSurgeon}
              isEditing={isEditingInline}
              onSurgeonChange={handleSurgeonChange}
              onSendPingToast={(msg) => triggerToast(msg, 'success')}
            />

            {/* Footer with NASA Space Apps Challenge Accreditation */}
            <footer className="pt-8 pb-12 border-t border-slate-800/80 text-xs sm:text-sm font-mono text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF]" />
                <span className="text-white font-bold">ASTROCARE // NASA SPACE APPS CHALLENGE</span>
                <span>— Phase 1: Astronaut Health Foundation</span>
              </div>
              <div className="flex items-center gap-4 text-slate-300">
                <span className="text-[#FF8C00] font-semibold">SIMULATED DEMONSTRATION DATA</span>
                <span>·</span>
                <span className="text-white">JSC FLIGHT MEDICINE REGISTRY</span>
              </div>
            </footer>
          </main>
        </div>
      </div>

      {/* Full Edit Profile Dialog */}
      <EditProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />

      {/* Clinical Context Medical Explanation Modal (Requirement 4) */}
      <ClinicalContextModal
        isOpen={isContextModalOpen}
        onClose={() => setIsContextModalOpen(false)}
        spineElongation={profile.spineElongation}
      />

      {/* Role-Based Access Placeholder Modal (Requirement 7) */}
      <RoleModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />

      {/* Floating Sci-Fi HUD Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl bg-[#080e22]/95 border-2 border-[#00E5FF]/60 text-white shadow-[0_0_35px_rgba(0,229,255,0.45)] backdrop-blur-xl font-mono text-xs sm:text-sm font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toastMessage.type === 'success' && <CheckCircle className="w-5 h-5 text-[#10b981] shrink-0" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
          {toastMessage.type === 'info' && <Sparkles className="w-5 h-5 text-[#00E5FF] shrink-0" />}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}
