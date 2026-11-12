import React, { useState, useEffect } from 'react';
import { SpaceBackground } from './components/SpaceBackground.tsx';
import { FlightSurgeonHeader } from './components/FlightSurgeonHeader.tsx';
import { FlightSurgeonSidebar } from './components/FlightSurgeonSidebar.tsx';
import { DashboardOverviewPage } from './components/DashboardOverviewPage.tsx';
import { AstronautMonitoringPage } from './components/AstronautMonitoringPage.tsx';
import { IndividualAstronautProfile } from './components/IndividualAstronautProfile.tsx';
import { HealthAnalyticsPage } from './components/HealthAnalyticsPage.tsx';
import { MedicalRecordsPage } from './components/MedicalRecordsPage.tsx';
import { ExerciseMonitoringPage } from './components/ExerciseMonitoringPage.tsx';
import { MedicalRestrictionsPage } from './components/MedicalRestrictionsPage.tsx';
import { MedicalReportsPage } from './components/MedicalReportsPage.tsx';
import { MedicalCommunicationsPage } from './components/MedicalCommunicationsPage.tsx';
import { MedicalAlertsPage } from './components/MedicalAlertsPage.tsx';
import { EditProfileModal } from './components/EditProfileModal.tsx';
import { ClinicalContextModal } from './components/ClinicalContextModal.tsx';
import { 
  AstronautProfile, 
  FlightSurgeon, 
  VitalsData, 
  SymptomReport, 
  MedicalRestriction, 
  DoctorNote, 
  MedicalConversation, 
  MedicalMessage, 
  CrewMemberSummary, 
  SpaceExercise, 
  TimelineEvent,
  MedicalAlert,
} from './types/astronaut.ts';
import { 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  ShieldAlert, 
  Plus, 
  X, 
  Save 
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
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [selectedAstronautId, setSelectedAstronautId] = useState<string>('ASTRO-74-SJ');

  // Application Data Stores
  const [crew, setCrew] = useState<CrewMemberSummary[]>([]);
  const [vitals, setVitals] = useState<VitalsData | null>(null);
  const [symptoms, setSymptoms] = useState<SymptomReport[]>([]);
  const [restrictions, setRestrictions] = useState<MedicalRestriction[]>([]);
  const [notes, setNotes] = useState<DoctorNote[]>([]);
  const [conversations, setConversations] = useState<MedicalConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>('conv-med-team');
  const [messages, setMessages] = useState<MedicalMessage[]>([]);
  const [exercises, setExercises] = useState<SpaceExercise[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [alerts, setAlerts] = useState<MedicalAlert[]>([]);

  // Modals & UI Controls
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState<boolean>(false);
  const [isClinicalContextOpen, setIsClinicalContextOpen] = useState<boolean>(false);
  const [isQuickRestrictionOpen, setIsQuickRestrictionOpen] = useState<boolean>(false);
  const [isQuickNoteOpen, setIsQuickNoteOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Quick Restriction Form State
  const [quickResName, setQuickResName] = useState<string>('');
  const [quickResDesc, setQuickResDesc] = useState<string>('');
  const [quickResRegion, setQuickResRegion] = useState<string>('Lumbar Spine (L3-L5)');
  const [quickResSeverity, setQuickResSeverity] = useState<'High' | 'Moderate' | 'Low'>('High');
  const [quickResExercises, setQuickResExercises] = useState<string>('ARED Deadlift, ARED Squat');

  // Quick Note Form State
  const [quickNoteTitle, setQuickNoteTitle] = useState<string>('');
  const [quickNoteContent, setQuickNoteContent] = useState<string>('');
  const [quickNoteCategory, setQuickNoteCategory] = useState<DoctorNote['category']>('Routine Assessment');

  const triggerToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // 1. Initial Data Fetching from Backend REST APIs
  const fetchAllInitialData = async () => {
    try {
      // Profile
      const pRes = await fetch('/api/profile');
      if (pRes.ok) {
        const json = await pRes.json();
        if (json.success && json.data) setProfile(json.data);
      }

      // Crew
      const cRes = await fetch('/api/crew');
      if (cRes.ok) {
        const json = await cRes.json();
        if (json.success && json.data) setCrew(json.data);
      }

      // Vitals
      const vRes = await fetch('/api/vitals');
      if (vRes.ok) {
        const json = await vRes.json();
        if (json.success && json.data) setVitals(json.data);
      }

      // Symptoms
      const sRes = await fetch('/api/symptoms');
      if (sRes.ok) {
        const json = await sRes.json();
        if (json.success && json.data) setSymptoms(json.data);
      }

      // Restrictions
      const rRes = await fetch('/api/restrictions');
      if (rRes.ok) {
        const json = await rRes.json();
        if (json.success && json.data) setRestrictions(json.data);
      }

      // Doctor Notes
      const nRes = await fetch('/api/doctor-notes');
      if (nRes.ok) {
        const json = await nRes.json();
        if (json.success && json.data) setNotes(json.data);
      }

      // Conversations
      const convRes = await fetch('/api/communications/conversations');
      if (convRes.ok) {
        const json = await convRes.json();
        if (json.success && json.data) {
          setConversations(json.data);
          if (json.data.length > 0 && !activeConversationId) {
            setActiveConversationId(json.data[0].id);
          }
        }
      }

      // Timeline
      const tRes = await fetch('/api/timeline');
      if (tRes.ok) {
        const json = await tRes.json();
        if (json.success && json.data) setTimeline(json.data);
      }

      // Exercises
      const eRes = await fetch('/api/fitness/exercises');
      if (eRes.ok) {
        const json = await eRes.json();
        if (json.success && json.data) setExercises(json.data);
      }

      // Medical Alerts
      const aRes = await fetch('/api/alerts');
      if (aRes.ok) {
        const json = await aRes.json();
        if (json.success && json.data) setAlerts(json.data);
      }
    } catch (err) {
      console.warn('[ASTRA Telemetry Init Error]:', err);
    }
  };

  useEffect(() => {
    fetchAllInitialData();
  }, []);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConversationId) return;
    const fetchActiveMessages = async () => {
      try {
        const res = await fetch(`/api/communications/messages/${activeConversationId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setMessages(json.data);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch messages for', activeConversationId, err);
      }
    };
    fetchActiveMessages();
  }, [activeConversationId]);

  // Handler: Select an astronaut and navigate to detailed individual profile
  const handleSelectAstronaut = (astroId: string) => {
    setSelectedAstronautId(astroId);
    setCurrentTab('individual');
    triggerToast(`Loaded clinical dossier for astronaut ${astroId}`, 'info');
  };

  // Handler: Add Medical Restriction
  const handleAddRestriction = async (newRes: Omit<MedicalRestriction, 'id'>) => {
    try {
      const res = await fetch('/api/restrictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRes),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setRestrictions((prev) => [json.data, ...prev]);
        triggerToast(`Medical restriction registered: ${newRes.name}`, 'success');
        // Refresh crew and timeline
        const cRes = await fetch('/api/crew');
        if (cRes.ok) {
          const cJson = await cRes.json();
          if (cJson.success) setCrew(cJson.data);
        }
        const tRes = await fetch('/api/timeline');
        if (tRes.ok) {
          const tJson = await tRes.json();
          if (tJson.success) setTimeline(tJson.data);
        }
      }
    } catch (e) {
      // Local fallback
      const localRes: MedicalRestriction = {
        ...newRes,
        id: `RES-${Date.now()}`,
      };
      setRestrictions((prev) => [localRes, ...prev]);
      triggerToast(`Restriction saved locally: ${newRes.name}`, 'info');
    }
  };

  // Handler: Update / Lift Medical Restriction
  const handleUpdateRestriction = async (id: string, updates: Partial<MedicalRestriction>) => {
    try {
      const res = await fetch(`/api/restrictions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setRestrictions((prev) => prev.map((r) => (r.id === id ? json.data : r)));
        triggerToast(
          updates.status === 'Lifted'
            ? 'Medical restriction cleared and signed off by Flight Surgeon'
            : 'Medical restriction updated',
          'success'
        );
      }
    } catch (e) {
      setRestrictions((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
      );
      triggerToast('Restriction status updated locally', 'info');
    }
  };

  // Handler: Delete Medical Restriction
  const handleDeleteRestriction = async (id: string) => {
    try {
      await fetch(`/api/restrictions/${id}`, { method: 'DELETE' });
      setRestrictions((prev) => prev.filter((r) => r.id !== id));
      triggerToast('Restriction removed from active database', 'info');
    } catch (e) {
      setRestrictions((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // Handler: Add Doctor Note
  const handleAddDoctorNote = async (newNote: Omit<DoctorNote, 'id' | 'timestamp'>) => {
    try {
      const res = await fetch('/api/doctor-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setNotes((prev) => [json.data, ...prev]);
        triggerToast(`Clinical note recorded: "${newNote.title}"`, 'success');
        const tRes = await fetch('/api/timeline');
        if (tRes.ok) {
          const tJson = await tRes.json();
          if (tJson.success) setTimeline(tJson.data);
        }
      }
    } catch (e) {
      const localNote: DoctorNote = {
        ...newNote,
        id: `NOTE-${Date.now()}`,
        timestamp: new Date().toISOString(),
      };
      setNotes((prev) => [localNote, ...prev]);
      triggerToast('Clinical note recorded locally', 'info');
    }
  };

  // Handler: Update Doctor Note
  const handleUpdateDoctorNote = async (id: string, updates: Partial<DoctorNote>) => {
    try {
      const res = await fetch(`/api/doctor-notes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setNotes((prev) => prev.map((n) => (n.id === id ? json.data : n)));
        triggerToast('Doctor note updated', 'success');
      }
    } catch (e) {
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)));
    }
  };

  // Handler: Update Symptom Review Status
  const handleUpdateSymptomStatus = async (symptomId: string, status: 'active' | 'monitoring' | 'resolved') => {
    setSymptoms((prev) =>
      prev.map((s) => (s.id === symptomId ? { ...s, status } : s))
    );
    triggerToast(`Symptom ${symptomId} review status set to ${status.toUpperCase()}`, 'info');
  };

  // Handler: Send Message in Medical Communications
  const handleSendMessage = async (
    conversationId: string,
    content: string,
    messageType: 'clinical_directive' | 'telemetry_alert' | 'routine' | 'clearance' = 'routine',
    priority: 'normal' | 'urgent' | 'priority' = 'normal'
  ) => {
    try {
      const res = await fetch('/api/communications/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, content, messageType, priority }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setMessages((prev) => [...prev, json.data]);
        // Update conversation last message preview
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? { ...c, lastMessage: content, lastTimestamp: json.data.timestamp }
              : c
          )
        );
        triggerToast('Message transmitted via Ground Control Relay', 'success');
      }
    } catch (e) {
      // Local fallback
      const localMsg: MedicalMessage = {
        id: `msg-${Date.now()}`,
        conversationId,
        senderId: 'user-fs-vance',
        senderName: 'Dr. Marcus Vance, M.D. (You)',
        senderRole: 'Lead Flight Surgeon',
        content,
        timestamp: new Date().toISOString(),
        isSurgeon: true,
        messageType,
        priority,
      };
      setMessages((prev) => [...prev, localMsg]);
      triggerToast('Message sent (Local telemetry cache)', 'info');
    }
  };

  // Handler: Acknowledge Medical Alert
  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const res = await fetch(`/api/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surgeonName: 'Dr. Marcus Vance, M.D.' }),
      });
      if (res.ok) {
        setAlerts((prev) =>
          prev.map((a) =>
            a.id === alertId
              ? { ...a, isAcknowledged: true, reviewedBy: 'Dr. Marcus Vance, M.D.' }
              : a
          )
        );
        triggerToast('Medical alert acknowledged and recorded in flight log', 'success');
      }
    } catch (e) {
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId
            ? { ...a, isAcknowledged: true, reviewedBy: 'Dr. Marcus Vance, M.D.' }
            : a
        )
      );
      triggerToast('Alert marked reviewed locally', 'info');
    }
  };

  // Handler: Dismiss / Resolve Alert
  const handleDismissAlert = async (alertId: string) => {
    try {
      await fetch(`/api/alerts/${alertId}`, { method: 'DELETE' });
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      triggerToast('Medical alert cleared from active monitoring queue', 'info');
    } catch (e) {
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    }
  };

  // Quick Restriction Submit
  const handleQuickRestrictionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickResName.trim()) return;
    handleAddRestriction({
      astronautId: profile.id,
      astronautName: profile.name,
      name: quickResName.trim(),
      description: quickResDesc.trim() || 'Flight Surgeon safety limitation.',
      affectedRegion: quickResRegion,
      restrictedExercises: quickResExercises.split(',').map((s) => s.trim()),
      severity: quickResSeverity,
      effectiveDate: `MET D+84 (${new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' })})`,
      status: 'Active',
      prescribedBy: 'Dr. Marcus Vance, M.D., FACEP (Lead Flight Surgeon)',
      clinicalRationale: 'Spinal column unloading preservation.',
    });
    setQuickResName('');
    setQuickResDesc('');
    setIsQuickRestrictionOpen(false);
  };

  // Quick Note Submit
  const handleQuickNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNoteTitle.trim() || !quickNoteContent.trim()) return;
    handleAddDoctorNote({
      astronautId: profile.id,
      astronautName: profile.name,
      author: 'Dr. Marcus Vance, M.D., FACEP (Lead Flight Surgeon)',
      category: quickNoteCategory,
      title: quickNoteTitle.trim(),
      content: quickNoteContent.trim(),
      relatedSymptoms: ['Lumbar Spine (L3-L5)'],
      vitalsSnapshot: vitals ? {
        hr: vitals.heartRate,
        bp: `${vitals.bloodPressureSys}/${vitals.bloodPressureDia}`,
        spo2: vitals.spO2,
        temp: vitals.temperature,
      } : undefined,
      status: 'Finalized',
    });
    setQuickNoteTitle('');
    setQuickNoteContent('');
    setIsQuickNoteOpen(false);
  };

  const activeRestrictionsCount = restrictions.filter((r) => r.status === 'Active').length;
  const unreadCommsCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

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
      {/* Dark Translucent Backdrop Filter */}
      <div
        className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-300"
        style={{ backgroundColor: 'rgba(5, 8, 16, 0.40)' }}
      />

      {/* Dynamic Animated Canvas Space Background */}
      <SpaceBackground />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Flight Surgeon Mission Control Header */}
        <FlightSurgeonHeader
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          profile={profile}
          unreadCount={unreadCommsCount}
        />

        {/* Content Layout: Left Sidebar + Main Content */}
        <div className="flex-1 flex flex-row">
          <FlightSurgeonSidebar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            activeRestrictionsCount={activeRestrictionsCount}
            unreadCommsCount={unreadCommsCount}
            pendingAlertsCount={alerts.filter((a) => !a.isAcknowledged).length}
          />

          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full space-y-6">
            {/* View 1: Mission Overview (Main Dashboard) */}
            {currentTab === 'overview' && (
              <DashboardOverviewPage
                crew={crew}
                profile={profile}
                vitals={vitals}
                restrictions={restrictions}
                timeline={timeline}
                alerts={alerts}
                onSelectAstronaut={handleSelectAstronaut}
                onNavigateTab={setCurrentTab}
              />
            )}

            {/* View 2: Astronaut Monitoring Matrix */}
            {currentTab === 'monitoring' && (
              <AstronautMonitoringPage
                crew={crew}
                currentProfile={profile}
                onSelectAstronaut={handleSelectAstronaut}
                onOpenDetailedProfile={handleSelectAstronaut}
              />
            )}

            {/* View 3: Individual Astronaut Medical Profile (6-Tab Deep Medical Profile) */}
            {(currentTab === 'individual' || currentTab === 'profile') && (
              <IndividualAstronautProfile
                profile={profile}
                vitals={vitals}
                symptoms={symptoms}
                restrictions={restrictions}
                timeline={timeline}
                exercises={exercises}
                notes={notes}
                onBackToCrew={() => setCurrentTab('monitoring')}
                onOpenRestrictionModal={() => setIsQuickRestrictionOpen(true)}
                onOpenNoteModal={() => setIsQuickNoteOpen(true)}
                onUpdateSymptomStatus={handleUpdateSymptomStatus}
                onLiftRestriction={(id) => handleUpdateRestriction(id, { status: 'Lifted' })}
                onNavigateTab={setCurrentTab}
              />
            )}

            {/* View 4: Health Analytics */}
            {currentTab === 'analytics' && (
              <HealthAnalyticsPage
                profile={profile}
                vitals={vitals}
                crew={crew}
                onNavigateTab={setCurrentTab}
              />
            )}

            {/* View 5: Medical Records & Doctor Notes */}
            {currentTab === 'records' && (
              <MedicalRecordsPage
                notes={notes}
                symptoms={symptoms}
                crew={crew}
                currentProfile={profile}
                vitals={vitals}
                onSaveNote={handleAddDoctorNote}
                onUpdateNote={handleUpdateDoctorNote}
                onUpdateSymptomStatus={handleUpdateSymptomStatus}
              />
            )}

            {/* View 6: Exercise Monitoring */}
            {currentTab === 'exercise' && (
              <ExerciseMonitoringPage
                exercises={exercises}
                profile={profile}
                onNavigateToRestrictions={() => setCurrentTab('restrictions')}
              />
            )}

            {/* View 7: Medical Restrictions */}
            {currentTab === 'restrictions' && (
              <MedicalRestrictionsPage
                restrictions={restrictions}
                crew={crew}
                exercises={exercises}
                onAddRestriction={handleAddRestriction}
                onUpdateRestriction={handleUpdateRestriction}
                onDeleteRestriction={handleDeleteRestriction}
              />
            )}

            {/* View 8: Medical Reports */}
            {currentTab === 'reports' && (
              <MedicalReportsPage
                crew={crew}
                profile={profile}
                vitals={vitals}
                symptoms={symptoms}
                restrictions={restrictions}
                notes={notes}
                onNavigateToAstronaut={handleSelectAstronaut}
              />
            )}

            {/* View 9: Medical Communications (3-Panel Traditional Messaging System) */}
            {currentTab === 'communications' && (
              <MedicalCommunicationsPage
                conversations={conversations}
                activeConversationId={activeConversationId}
                onSelectConversation={setActiveConversationId}
                messages={messages}
                onSendMessage={handleSendMessage}
              />
            )}

            {/* View 10: Medical Alerts Center */}
            {currentTab === 'alerts' && (
              <MedicalAlertsPage
                alerts={alerts}
                crew={crew}
                onAcknowledgeAlert={handleAcknowledgeAlert}
                onDismissAlert={handleDismissAlert}
                onNavigateToAstronaut={handleSelectAstronaut}
                onNavigateToRestrictions={() => setCurrentTab('restrictions')}
              />
            )}

            {/* Mission Control Footer */}
            <footer className="pt-8 pb-12 border-t border-slate-800/80 text-xs font-mono text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF]" />
                <span className="text-white font-bold">ASTRA // NASA SPACE APPS CHALLENGE</span>
                <span>— Astronaut Smart Health Monitoring System</span>
              </div>
              <div className="flex items-center gap-4 text-slate-300">
                <span className="text-[#FF8C00] font-semibold">SIMULATED DEMONSTRATION DATA</span>
                <span>·</span>
                <span className="text-white">JSC FLIGHT MEDICINE REGISTRY · EXP-74</span>
              </div>
            </footer>
          </main>
        </div>
      </div>

      {/* Quick Restriction Dialog */}
      {isQuickRestrictionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#091129] border border-[#FF8C00]/50 shadow-[0_0_50px_rgba(255,140,0,0.3)] p-6 text-slate-100 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#FF8C00]" />
                <h3 className="text-sm font-bold text-white font-['Chakra_Petch',sans-serif]">
                  Prescribe Countermeasure Restriction ({profile.callsign})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickRestrictionOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickRestrictionSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-slate-400 mb-1">RESTRICTION NAME</label>
                <input
                  type="text"
                  value={quickResName}
                  onChange={(e) => setQuickResName(e.target.value)}
                  placeholder="e.g. Axial Spinal Loading Restriction"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-[#FF8C00] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">AFFECTED REGION</label>
                  <input
                    type="text"
                    value={quickResRegion}
                    onChange={(e) => setQuickResRegion(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-[#FF8C00] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">SEVERITY</label>
                  <select
                    value={quickResSeverity}
                    onChange={(e) => setQuickResSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold focus:border-[#FF8C00] focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">PROHIBITED EXERCISES (COMMA SEPARATED)</label>
                <input
                  type="text"
                  value={quickResExercises}
                  onChange={(e) => setQuickResExercises(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-[#FF8C00] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">DESCRIPTION</label>
                <textarea
                  value={quickResDesc}
                  onChange={(e) => setQuickResDesc(e.target.value)}
                  rows={2}
                  placeholder="Hold parameters..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-sans focus:border-[#FF8C00] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickRestrictionOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 font-bold hover:bg-slate-800"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#FF8C00] text-black font-extrabold hover:bg-[#FF8C00]/90"
                >
                  SIGN & PRESCRIBE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Note Dialog */}
      {isQuickNoteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#091129] border border-[#00E5FF]/50 shadow-[0_0_50px_rgba(0,229,255,0.3)] p-6 text-slate-100 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#00E5FF]" />
                <h3 className="text-sm font-bold text-white font-['Chakra_Petch',sans-serif]">
                  Record Clinical Note ({profile.name})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickNoteOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickNoteSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-slate-400 mb-1">NOTE TITLE</label>
                <input
                  type="text"
                  value={quickNoteTitle}
                  onChange={(e) => setQuickNoteTitle(e.target.value)}
                  placeholder="e.g. Lumbar Ache Assessment & CEVIS Clearance"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-[#00E5FF] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">CATEGORY</label>
                <select
                  value={quickNoteCategory}
                  onChange={(e) => setQuickNoteCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold focus:border-[#00E5FF] focus:outline-none"
                >
                  <option value="Routine Assessment">Routine Assessment</option>
                  <option value="Adaptation Review">Adaptation Review</option>
                  <option value="Countermeasure Directive">Countermeasure Directive</option>
                  <option value="Pre-EVA Medical Clearance">Pre-EVA Medical Clearance</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">CLINICAL OBSERVATION</label>
                <textarea
                  value={quickNoteContent}
                  onChange={(e) => setQuickNoteContent(e.target.value)}
                  rows={3}
                  placeholder="State clinical observations, vitals correlations, and guidance..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-sans focus:border-[#00E5FF] focus:outline-none"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickNoteOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 font-bold hover:bg-slate-800"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#00E5FF] text-black font-extrabold hover:bg-[#00E5FF]/90"
                >
                  COMMIT NOTE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating HUD Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl bg-[#080e22]/95 border-2 border-[#00E5FF]/60 text-white shadow-[0_0_35px_rgba(0,229,255,0.45)] backdrop-blur-xl font-mono text-xs sm:text-sm font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toastMessage.type === 'success' && <CheckCircle className="w-4 h-4 text-[#10b981] shrink-0" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          {toastMessage.type === 'info' && <Sparkles className="w-4 h-4 text-[#00E5FF] shrink-0" />}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}
