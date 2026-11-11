import type { 
  AstronautProfile, 
  UpdateProfileInput, 
  VitalsData, 
  SymptomReport, 
  DailyCheckIn, 
  TimelineEvent 
} from '../types/astronaut.ts';

// Initial Mock Dataset for Dr. Salma Johnson as specified in requirements
export let currentAstronautProfile: AstronautProfile = {
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
  spineElongation: 4.2, // +4.2 cm microgravity spinal adaptation delta
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

export const getProfile = (): AstronautProfile => {
  return currentAstronautProfile;
};

export const updateProfile = (data: UpdateProfileInput): AstronautProfile => {
  currentAstronautProfile = {
    ...currentAstronautProfile,
    ...data,
    // Deep merge assignedSurgeon if provided
    assignedSurgeon: data.assignedSurgeon
      ? { ...currentAstronautProfile.assignedSurgeon, ...data.assignedSurgeon }
      : currentAstronautProfile.assignedSurgeon,
    updatedAt: new Date().toISOString(),
  };
  return currentAstronautProfile;
};

// 7-day Heart Rate and Biometric History
export let currentVitals: VitalsData = {
  heartRate: 72,
  bloodPressureSys: 118,
  bloodPressureDia: 76,
  spO2: 99,
  temperature: 36.8,
  respiratoryRate: 14,
  sleepHours: 5.9,
  weightKg: 59.2,
  hrvMs: 64,
  timestamp: new Date().toISOString(),
  historicalHeartRate: [
    { date: 'Day -6', dayLabel: 'Nov 04 (MET D+78)', hr: 62, baseline: 58, min: 54, max: 74 },
    { date: 'Day -5', dayLabel: 'Nov 05 (MET D+79)', hr: 60, baseline: 58, min: 52, max: 70 },
    { date: 'Day -4', dayLabel: 'Nov 06 (MET D+80)', hr: 65, baseline: 58, min: 55, max: 82 },
    { date: 'Day -3', dayLabel: 'Nov 07 (MET D+81)', hr: 68, baseline: 58, min: 56, max: 88 },
    { date: 'Day -2', dayLabel: 'Nov 08 (MET D+82)', hr: 64, baseline: 58, min: 53, max: 76 },
    { date: 'Day -1', dayLabel: 'Nov 09 (MET D+83)', hr: 70, baseline: 58, min: 58, max: 92 },
    { date: 'Today', dayLabel: 'Nov 10 (MET D+84)', hr: 72, baseline: 58, min: 60, max: 96 },
  ],
};

export const getVitals = (): VitalsData => {
  return currentVitals;
};

export const updateVitals = (data: Partial<VitalsData>): VitalsData => {
  currentVitals = {
    ...currentVitals,
    ...data,
    timestamp: new Date().toISOString(),
  };
  return currentVitals;
};

// Check-ins dataset
export let currentCheckIns: DailyCheckIn[] = [
  {
    id: 'CHK-84-01',
    astronautId: 'ASTRO-74-SJ',
    missionDay: 84,
    mood: 'Nominal / Focused',
    energyLevel: 7,
    sleepQuality: 'Fragmented',
    sleepHours: 5.9,
    hydrationLiters: 2.3,
    spaceAdaptationSymptoms: ['Spinal elongation lumbar ache (+4.2cm)', 'Mild cephalic fluid fullness on wake'],
    notes: 'Completed 90m resistance cycle on ARED. Mild disc expansion soreness managed with hamstring stretches. Mental alertness high.',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'CHK-83-01',
    astronautId: 'ASTRO-74-SJ',
    missionDay: 83,
    mood: 'Mild Fatigue',
    energyLevel: 6,
    sleepQuality: 'Restless / MicroG Noise',
    sleepHours: 5.5,
    hydrationLiters: 2.1,
    spaceAdaptationSymptoms: ['Cephalic fluid shift sensation', 'Minor sinus congestion'],
    notes: 'Ventilation fan harmonics in Node 2 sleep station caused light sleep. Practiced box breathing with ASTRO avatar.',
    timestamp: new Date(Date.now() - 3600000 * 27).toISOString(),
  },
];

export const getCheckIns = (): DailyCheckIn[] => {
  return currentCheckIns;
};

export const addCheckIn = (data: Omit<DailyCheckIn, 'id' | 'timestamp'>): DailyCheckIn => {
  const newCheckIn: DailyCheckIn = {
    ...data,
    id: `CHK-${data.missionDay || 84}-${String(currentCheckIns.length + 1).padStart(2, '0')}`,
    timestamp: new Date().toISOString(),
  };
  currentCheckIns = [newCheckIn, ...currentCheckIns];

  // Also log to timeline
  addTimelineEvent({
    type: 'checkin',
    title: `Daily Health Check-in (Day ${newCheckIn.missionDay})`,
    summary: `Mood: ${newCheckIn.mood} · Energy: ${newCheckIn.energyLevel}/10 · Sleep: ${newCheckIn.sleepHours}h (${newCheckIn.sleepQuality})`,
    details: {
      hydrationLiters: newCheckIn.hydrationLiters,
      symptoms: newCheckIn.spaceAdaptationSymptoms,
      notes: newCheckIn.notes,
    },
    severity: newCheckIn.energyLevel < 5 ? 'warning' : 'nominal',
    badge: 'DAILY LOG',
  });

  return newCheckIn;
};

// Unified Medical Timeline Events
export let currentTimelineEvents: TimelineEvent[] = [
  {
    id: 'EVT-01',
    type: 'vitals',
    title: 'Daily Bio-Telemetry Logged',
    summary: 'Heart Rate: 72 bpm (+14 bpm over baseline) · BP: 118/76 mmHg · SpO2: 99% · Sleep: 5.9 hrs',
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    severity: 'warning',
    badge: 'VITALS',
    details: { hr: 72, bp: '118/76', spo2: 99, temp: 36.8, sleep: 5.9, weight: 59.2 },
  },
  {
    id: 'EVT-02',
    type: 'ai_insight',
    title: 'Gemini AI Telemetry Insight Generated',
    summary: 'Elevated HR of 72 bpm directly correlates with 5.9h fragmented sleep. Advised 45m rest cycle & 500mL electrolytes.',
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    severity: 'info',
    badge: 'AI INSIGHT',
  },
  {
    id: 'EVT-03',
    type: 'checkin',
    title: 'Mission Day 84 Health Check-in Completed',
    summary: 'Status: Nominal / Focused · Energy: 7/10 · Hydration: 2.3 L · Noted spinal disc decompression.',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    severity: 'nominal',
    badge: 'CHECK-IN',
  },
  {
    id: 'EVT-04',
    type: 'symptom',
    title: 'Symptom Registered: Lumbar Spine (L3-L5)',
    summary: 'Dull ache (Intensity 4/10) following 2-hour ARED microgravity resistance protocol.',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    severity: 'warning',
    badge: 'SYMPTOM',
  },
  {
    id: 'EVT-05',
    type: 'exercise_eva',
    title: 'ARED Microgravity Countermeasure Completed',
    summary: '90-minute axial loading protocol completed: Deadlifts, Squats, and Heel Raises. Energy output 420 kcal.',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    severity: 'nominal',
    badge: 'EXERCISE',
  },
  {
    id: 'EVT-06',
    type: 'symptom',
    title: 'Symptom Registered: Cranial / Sinus Frontal',
    summary: 'Grade-I cephalic fluid shift sensation upon wake-up. Cleared after 30 mins upright cycling.',
    timestamp: new Date(Date.now() - 3600000 * 22).toISOString(),
    severity: 'nominal',
    badge: 'SYMPTOM',
  },
];

export const getTimelineEvents = (): TimelineEvent[] => {
  return currentTimelineEvents;
};

export const addTimelineEvent = (event: Omit<TimelineEvent, 'id' | 'timestamp'>): TimelineEvent => {
  const newEvent: TimelineEvent = {
    ...event,
    id: `EVT-${String(currentTimelineEvents.length + 1).padStart(2, '0')}`,
    timestamp: new Date().toISOString(),
  };
  currentTimelineEvents = [newEvent, ...currentTimelineEvents];
  return newEvent;
};

// Log Daily Vitals Form Action
export const logDailyVitals = (data: {
  heartRate: number;
  bloodPressureSys: number;
  bloodPressureDia: number;
  spO2: number;
  temperature: number;
  sleepHours: number;
  weightKg?: number;
}): VitalsData => {
  // 1. Update current vitals
  currentVitals = {
    ...currentVitals,
    heartRate: data.heartRate,
    bloodPressureSys: data.bloodPressureSys,
    bloodPressureDia: data.bloodPressureDia,
    spO2: data.spO2,
    temperature: data.temperature,
    sleepHours: data.sleepHours,
    weightKg: data.weightKg ?? currentVitals.weightKg ?? 59.2,
    timestamp: new Date().toISOString(),
    // Update today's point in historical chart
    historicalHeartRate: currentVitals.historicalHeartRate.map((point) => {
      if (point.date === 'Today') {
        return {
          ...point,
          hr: data.heartRate,
          max: Math.max(point.max, data.heartRate),
          min: Math.min(point.min, data.heartRate),
        };
      }
      return point;
    }),
  };

  // 2. Update astronaut profile weight if provided
  if (data.weightKg) {
    currentAstronautProfile = {
      ...currentAstronautProfile,
      weightKg: data.weightKg,
      updatedAt: new Date().toISOString(),
    };
  }

  // 3. Log event into medical timeline
  const hrDelta = data.heartRate - currentAstronautProfile.restingHeartRate;
  addTimelineEvent({
    type: 'vitals',
    title: 'Daily Bio-Telemetry Logged by Astronaut',
    summary: `HR: ${data.heartRate} bpm (${hrDelta > 0 ? `+${hrDelta}` : hrDelta} vs baseline) · BP: ${data.bloodPressureSys}/${data.bloodPressureDia} mmHg · SpO2: ${data.spO2}% · Sleep: ${data.sleepHours} hrs`,
    details: { ...data },
    severity: hrDelta > 10 || data.spO2 < 96 ? 'warning' : 'nominal',
    badge: 'VITALS',
  });

  return currentVitals;
};

// Symptom Reports (3D Anatomical Body Logging)
export let currentSymptoms: SymptomReport[] = [
  {
    id: 'SYM-84-01',
    bodyPart: 'Lumbar Spine (L3-L5)',
    meshId: 'Spine_Lumbar',
    painType: 'Dull',
    intensity: 4,
    notes: 'Mild axial decompression ache following 2-hour ARED cycle; consistent with +4.2cm microgravity spinal elongation.',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'active',
  },
  {
    id: 'SYM-84-02',
    bodyPart: 'Cranial / Sinus (Frontal)',
    meshId: 'Head_Frontal',
    painType: 'Dull',
    intensity: 3,
    notes: 'Grade-I cephalic fluid shift sensation upon wake-up. Cleared after 30 mins upright cycling.',
    timestamp: new Date(Date.now() - 3600000 * 22).toISOString(),
    status: 'monitoring',
  },
];

export const getSymptoms = (): SymptomReport[] => {
  return currentSymptoms;
};

export const addSymptom = (report: Omit<SymptomReport, 'id' | 'timestamp'>): SymptomReport => {
  const newReport: SymptomReport = {
    ...report,
    id: `SYM-84-${String(currentSymptoms.length + 1).padStart(2, '0')}`,
    timestamp: new Date().toISOString(),
    status: report.status || 'active',
  };
  currentSymptoms = [newReport, ...currentSymptoms];

  // Add timeline event
  addTimelineEvent({
    type: 'symptom',
    title: `Symptom Reported: ${newReport.bodyPart}`,
    summary: `${newReport.painType} pain (Intensity: ${newReport.intensity}/10). Notes: ${newReport.notes || 'No extra notes.'}`,
    severity: newReport.intensity > 5 ? 'alert' : 'warning',
    badge: 'SYMPTOM',
    details: { bodyPart: newReport.bodyPart, intensity: newReport.intensity, painType: newReport.painType },
  });

  return newReport;
};

export const deleteSymptom = (id: string): boolean => {
  const initialLength = currentSymptoms.length;
  currentSymptoms = currentSymptoms.filter((s) => s.id !== id);
  return currentSymptoms.length < initialLength;
};
