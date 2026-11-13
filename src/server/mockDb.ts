import type { 
  AstronautProfile, 
  UpdateProfileInput, 
  VitalsData, 
  SymptomReport, 
  DailyCheckIn, 
  TimelineEvent,
  SpaceExercise,
  ExerciseCategory,
  WorkoutSessionLog,
  MedicalRestriction,
  DoctorNote,
  MedicalMessage,
  MedicalConversation,
  MedicalTeamMember,
  CrewMemberSummary,
  MedicalAlert,
  ExchangedMedicalReport,
  ReportReviewResponse,
  ExchangedReportAttachment,
  ForwardHistoryEntry,
  MedicalAssistantMessage,
  MedicalAssistantContext,
  VitalSignEvaluation,
  VitalThresholdStatus,
  AssistantTriageLevel,
  DoctorAvailabilityStatus,
  DoctorTimeoutSeconds,
  CommunicationChannel,
  DoctorResponseTimerState,
  EmergencyTriageState,
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
  photoUrl: '/images/astronaut_salma_portrait.jpg',
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

// ─── Fitness / Space Exercise Data ──────────────────────────────────────────

const spaceExercises: SpaceExercise[] = [
  // ── Upper Body ──
  {
    id: 'ex-ared-bench-press',
    name: 'ARED Bench Press',
    description: 'Resistive bench press using the Advanced Resistive Exercise Device with vacuum cylinder loading up to 600 lbs.',
    category: 'Upper Body',
    equipment: 'ARED',
    durationMinutes: 15,
    caloriesBurned: 120,
    targetMuscles: ['Pectoralis Major', 'Anterior Deltoid', 'Triceps Brachii'],
    contraindications: ['Cephalic Fluid Shift', 'Intracranial Pressure Elevation'],
    videoUrl: '/videos/ared-bench-press.mp4',
    thumbnailUrl: '/videos/thumbnails/ared-bench-press.jpg',
    intensity: 'High',
    status: 'available',
  },
  {
    id: 'ex-ared-shoulder-press',
    name: 'ARED Shoulder Press',
    description: 'Overhead resistive press targeting shoulder girdle stabilizers critical for EVA suit mobility.',
    category: 'Upper Body',
    equipment: 'ARED',
    durationMinutes: 12,
    caloriesBurned: 100,
    targetMuscles: ['Deltoids', 'Trapezius', 'Triceps Brachii'],
    contraindications: ['Spinal Elongation', 'Cervical Disc Decompression'],
    videoUrl: '/videos/ared-shoulder-press.mp4',
    thumbnailUrl: '/videos/thumbnails/ared-shoulder-press.jpg',
    intensity: 'High',
    status: 'available',
  },
  {
    id: 'ex-ared-bent-over-row',
    name: 'ARED Bent-Over Row',
    description: 'Resistive rowing movement to counteract postural kyphosis caused by microgravity spinal unloading.',
    category: 'Upper Body',
    equipment: 'ARED',
    durationMinutes: 12,
    caloriesBurned: 95,
    targetMuscles: ['Latissimus Dorsi', 'Rhomboids', 'Posterior Deltoid', 'Biceps Brachii'],
    contraindications: ['Spinal Elongation', 'Lumbar Disc Herniation'],
    videoUrl: '/videos/ared-bent-over-row.mp4',
    thumbnailUrl: '/videos/thumbnails/ared-bent-over-row.jpg',
    intensity: 'Moderate',
    status: 'available',
  },

  // ── Lower Body ──
  {
    id: 'ex-ared-squat',
    name: 'ARED Squat',
    description: 'Loaded axial squat protocol to preserve lower-limb bone mineral density and counter osteopenia.',
    category: 'Lower Body',
    equipment: 'ARED',
    durationMinutes: 20,
    caloriesBurned: 180,
    targetMuscles: ['Quadriceps', 'Gluteus Maximus', 'Hamstrings', 'Erector Spinae'],
    contraindications: ['Spinal Elongation', 'Lumbar Disc Herniation', 'Lower Extremity Venous Congestion'],
    videoUrl: '/videos/ared-squat.mp4',
    thumbnailUrl: '/videos/thumbnails/ared-squat.jpg',
    intensity: 'High',
    status: 'available',
  },
  {
    id: 'ex-ared-deadlift',
    name: 'ARED Deadlift',
    description: 'Resistive hip-hinge movement targeting posterior chain and axial loading for spinal bone density.',
    category: 'Lower Body',
    equipment: 'ARED',
    durationMinutes: 18,
    caloriesBurned: 170,
    targetMuscles: ['Hamstrings', 'Gluteus Maximus', 'Erector Spinae', 'Trapezius'],
    contraindications: ['Spinal Elongation', 'Lumbar Disc Herniation'],
    videoUrl: '/videos/ared-deadlift.mp4',
    thumbnailUrl: '/videos/thumbnails/ared-deadlift.jpg',
    intensity: 'High',
    status: 'available',
  },
  {
    id: 'ex-ared-heel-raise',
    name: 'ARED Heel Raise',
    description: 'Calf isolation exercise under resistive load to preserve Achilles tendon and plantar bone density.',
    category: 'Lower Body',
    equipment: 'ARED',
    durationMinutes: 10,
    caloriesBurned: 60,
    targetMuscles: ['Gastrocnemius', 'Soleus'],
    contraindications: ['Lower Extremity Venous Congestion'],
    videoUrl: '/videos/ared-heel-raise.mp4',
    thumbnailUrl: '/videos/thumbnails/ared-heel-raise.jpg',
    intensity: 'Low',
    status: 'available',
  },

  // ── Core ──
  {
    id: 'ex-core-stabilization',
    name: 'Microgravity Core Stabilization',
    description: 'Free-floating isometric core holds and anti-rotation drills to maintain trunk control without gravity cues.',
    category: 'Core',
    equipment: 'None',
    durationMinutes: 15,
    caloriesBurned: 80,
    targetMuscles: ['Transverse Abdominis', 'Internal Obliques', 'Multifidus'],
    contraindications: [],
    videoUrl: '/videos/core-stabilization.mp4',
    thumbnailUrl: '/videos/thumbnails/core-stabilization.jpg',
    intensity: 'Moderate',
    status: 'available',
  },

  // ── Full Body ──
  {
    id: 'ex-t2-treadmill',
    name: 'T2 Treadmill Running',
    description: 'Harness-loaded treadmill running on the Combined Operational Load-Bearing External Resistance Treadmill (T2/COLBERT).',
    category: 'Full Body',
    equipment: 'T2 Treadmill',
    durationMinutes: 30,
    caloriesBurned: 300,
    targetMuscles: ['Quadriceps', 'Hamstrings', 'Calves', 'Hip Flexors', 'Cardiovascular System'],
    contraindications: ['Spinal Elongation', 'Lower Extremity Venous Congestion', 'Orthostatic Intolerance'],
    videoUrl: '/videos/t2-treadmill.mp4',
    thumbnailUrl: '/videos/thumbnails/t2-treadmill.jpg',
    intensity: 'High',
    status: 'available',
  },
  {
    id: 'ex-resistive-band-circuit',
    name: 'Resistive Band Full-Body Circuit',
    description: 'Portable resistance band circuit combining upper-body pulls, lower-body squats, and rotational core patterns.',
    category: 'Full Body',
    equipment: 'Resistance Bands',
    durationMinutes: 25,
    caloriesBurned: 200,
    targetMuscles: ['Deltoids', 'Biceps', 'Quadriceps', 'Gluteus Medius', 'Core'],
    contraindications: [],
    videoUrl: '/videos/resistive-band-circuit.mp4',
    thumbnailUrl: '/videos/thumbnails/resistive-band-circuit.jpg',
    intensity: 'Moderate',
    status: 'available',
  },
];

export const getExercises = (): SpaceExercise[] => {
  return spaceExercises.map((e) => ({ ...e }));
};

export const getExercisesByCategory = (category: ExerciseCategory): SpaceExercise[] => {
  return spaceExercises.filter((e) => e.category === category).map((e) => ({ ...e }));
};

export const evaluateExercisesForAstronaut = (): {
  exercises: SpaceExercise[];
  restricted: { exerciseId: string; reason: string }[];
} => {
  const profile = getProfile();
  const symptoms = getSymptoms();

  // Collect all active condition/symptom keywords for matching
  const activeConditionKeys: string[] = [];
  for (const cond of profile.conditions) {
    if (cond.toLowerCase().includes('spinal elongation')) activeConditionKeys.push('Spinal Elongation');
    if (cond.toLowerCase().includes('cephalic fluid shift')) activeConditionKeys.push('Cephalic Fluid Shift');
    if (cond.toLowerCase().includes('intracranial pressure')) activeConditionKeys.push('Intracranial Pressure Elevation');
    if (cond.toLowerCase().includes('cardiac') || cond.toLowerCase().includes('arrhythmia')) activeConditionKeys.push('Cardiac Arrhythmia');
    if (cond.toLowerCase().includes('orthostatic')) activeConditionKeys.push('Orthostatic Intolerance');
    if (cond.toLowerCase().includes('venous congestion')) activeConditionKeys.push('Lower Extremity Venous Congestion');
    if (cond.toLowerCase().includes('lumbar disc') || cond.toLowerCase().includes('disc herniation')) activeConditionKeys.push('Lumbar Disc Herniation');
    if (cond.toLowerCase().includes('cervical disc')) activeConditionKeys.push('Cervical Disc Decompression');
  }

  // Also check active symptoms for relevant conditions
  for (const sym of symptoms) {
    if (sym.status === 'resolved') continue;
    const lower = (sym.bodyPart + ' ' + sym.notes).toLowerCase();
    if (lower.includes('spine') || lower.includes('lumbar') || lower.includes('elongation')) {
      if (!activeConditionKeys.includes('Spinal Elongation')) activeConditionKeys.push('Spinal Elongation');
    }
    if (lower.includes('cephalic') || lower.includes('fluid shift') || lower.includes('sinus')) {
      if (!activeConditionKeys.includes('Cephalic Fluid Shift')) activeConditionKeys.push('Cephalic Fluid Shift');
    }
    if (lower.includes('intracranial')) {
      if (!activeConditionKeys.includes('Intracranial Pressure Elevation')) activeConditionKeys.push('Intracranial Pressure Elevation');
    }
  }

  // If spine elongation > 3cm, always flag spinal elongation
  if (profile.spineElongation > 3 && !activeConditionKeys.includes('Spinal Elongation')) {
    activeConditionKeys.push('Spinal Elongation');
  }

  const restricted: { exerciseId: string; reason: string }[] = [];
  const exercises: SpaceExercise[] = spaceExercises.map((ex) => {
    const matchingContraindications = ex.contraindications.filter((ci) =>
      activeConditionKeys.includes(ci)
    );

    if (matchingContraindications.length > 0) {
      const reason = `Contraindicated due to: ${matchingContraindications.join(', ')}`;
      restricted.push({ exerciseId: ex.id, reason });
      return {
        ...ex,
        status: 'restricted' as const,
        warningMessage: `⚠ ${reason}. Consult Flight Surgeon before performing this exercise.`,
      };
    }

    // High-value safe countermeasures get recommended status
    if (
      ex.id === 'ex-resistive-band-circuit' ||
      ex.id === 'ex-core-stabilization' ||
      ex.id === 'ex-ared-heel-raise'
    ) {
      return { ...ex, status: 'recommended' as const };
    }

    return { ...ex };
  });

  return { exercises, restricted };
};

// ─── Completed Workout Sessions Log ─────────────────────────────────────────
export let completedWorkoutSessions: WorkoutSessionLog[] = [
  {
    id: 'WKT-84-01',
    exerciseId: 'ex-resistive-band-circuit',
    exerciseName: 'Resistive Band Full-Body Circuit',
    category: 'Full Body',
    equipment: 'Resistance Bands',
    durationMinutes: 25,
    actualDurationSeconds: 1500,
    caloriesBurned: 200,
    avgHeartRate: 122,
    peakHeartRate: 136,
    notes: 'Morning full-body resistance band conditioning protocol. Zero axial spinal compression reported.',
    completedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
];

export const getWorkoutSessions = (): WorkoutSessionLog[] => {
  return completedWorkoutSessions;
};

export const logWorkoutSession = (
  session: Omit<WorkoutSessionLog, 'id' | 'completedAt'>
): WorkoutSessionLog => {
  const newSession: WorkoutSessionLog = {
    ...session,
    id: `WKT-84-${String(completedWorkoutSessions.length + 1).padStart(2, '0')}`,
    completedAt: new Date().toISOString(),
  };

  completedWorkoutSessions = [newSession, ...completedWorkoutSessions];

  // Synchronize with Unified Medical & Telemetry Timeline
  addTimelineEvent({
    type: 'exercise_eva',
    title: `Countermeasure Completed: ${newSession.exerciseName}`,
    summary: `Equipment: ${newSession.equipment} · Duration: ${newSession.durationMinutes} min · Energy Output: ${newSession.caloriesBurned} kcal · Avg HR: ${newSession.avgHeartRate} bpm (Peak ${newSession.peakHeartRate} bpm)`,
    details: {
      exerciseId: newSession.exerciseId,
      equipment: newSession.equipment,
      durationMinutes: newSession.durationMinutes,
      caloriesBurned: newSession.caloriesBurned,
      avgHeartRate: newSession.avgHeartRate,
      peakHeartRate: newSession.peakHeartRate,
      notes: newSession.notes,
    },
    severity: 'nominal',
    badge: 'EXERCISE',
  });

  return newSession;
};

// ─── Flight Surgeon Crew Registry ───────────────────────────────────────────

export let currentCrewMembers: CrewMemberSummary[] = [
  {
    id: 'ASTRO-74-SJ',
    name: 'Dr. Salma Johnson',
    callsign: 'Nova',
    role: 'Mission Specialist / Payload Bio-Engineer',
    missionId: 'EXP-74 / ARTEMIS BIO-LAB',
    photoUrl: '/images/astronaut_salma_portrait.jpg',
    healthStatus: 'monitoring',
    heartRate: 72,
    bloodPressure: '118/76',
    spO2: 99,
    temperature: 36.8,
    latestSymptom: 'Lumbar Spine (L3-L5) Dull Ache (4/10)',
    activeRestrictionsCount: 3,
    lastMeasurementTime: '12m ago',
    bloodType: 'O-Positive (O+)',
    spineElongation: 4.2,
    evaHours: 28.5,
  },
  {
    id: 'ASTRO-74-AR',
    name: 'Cmdr. Alex Reid',
    callsign: 'Apex',
    role: 'Station Commander / Flight Pilot',
    missionId: 'EXP-74 / USOS COMMAND',
    photoUrl: '',
    healthStatus: 'nominal',
    heartRate: 64,
    bloodPressure: '120/78',
    spO2: 99,
    temperature: 36.7,
    latestSymptom: 'None Reported',
    activeRestrictionsCount: 0,
    lastMeasurementTime: '18m ago',
    bloodType: 'A-Positive (A+)',
    spineElongation: 1.8,
    evaHours: 42.0,
  },
  {
    id: 'ASTRO-74-ER',
    name: 'Lt. Elena Rostova',
    callsign: 'Valkyrie',
    role: 'Lead Flight Engineer / EVA Specialist',
    missionId: 'EXP-74 / COLUMBUS MODULE',
    photoUrl: '',
    healthStatus: 'nominal',
    heartRate: 61,
    bloodPressure: '116/74',
    spO2: 98,
    temperature: 36.9,
    latestSymptom: 'Resolved EVA Forearm Fatigue',
    activeRestrictionsCount: 0,
    lastMeasurementTime: '24m ago',
    bloodType: 'B-Positive (B+)',
    spineElongation: 2.1,
    evaHours: 36.5,
  },
  {
    id: 'ASTRO-74-KS',
    name: 'Dr. Kenji Sato',
    callsign: 'Ronin',
    role: 'Science Officer / Robotics Specialist',
    missionId: 'EXP-74 / JEM KIBO LAB',
    photoUrl: '',
    healthStatus: 'nominal',
    heartRate: 66,
    bloodPressure: '122/80',
    spO2: 99,
    temperature: 36.6,
    latestSymptom: 'None Reported',
    activeRestrictionsCount: 0,
    lastMeasurementTime: '31m ago',
    bloodType: 'O-Negative (O-)',
    spineElongation: 1.5,
    evaHours: 18.0,
  },
];

export const getCrewMembers = (): CrewMemberSummary[] => {
  // Sync Dr. Salma with live vitals and profile state
  const profile = getProfile();
  const vitals = getVitals();
  const symptoms = getSymptoms();
  const activeSymptoms = symptoms.filter((s) => s.status !== 'resolved');
  const activeRestrictions = currentMedicalRestrictions.filter(
    (r) => r.astronautId === profile.id && r.status === 'Active'
  );

  return currentCrewMembers.map((member) => {
    if (member.id === profile.id) {
      return {
        ...member,
        name: profile.name,
        callsign: profile.callsign,
        role: profile.role,
        photoUrl: profile.photoUrl,
        healthStatus: profile.healthStatus === 'nominal' && activeRestrictions.length > 0 ? 'monitoring' : profile.healthStatus,
        heartRate: vitals.heartRate,
        bloodPressure: `${vitals.bloodPressureSys}/${vitals.bloodPressureDia}`,
        spO2: vitals.spO2,
        temperature: vitals.temperature,
        latestSymptom: activeSymptoms.length > 0 ? `${activeSymptoms[0].bodyPart} (${activeSymptoms[0].intensity}/10)` : 'None Reported',
        activeRestrictionsCount: activeRestrictions.length,
        spineElongation: profile.spineElongation,
        evaHours: profile.totalEvaHours,
      };
    }
    return member;
  });
};

// ─── Medical Restrictions Store ─────────────────────────────────────────────

export let currentMedicalRestrictions: MedicalRestriction[] = [
  {
    id: 'RES-74-01',
    astronautId: 'ASTRO-74-SJ',
    astronautName: 'Dr. Salma Johnson',
    name: 'Axial Spinal Compression Hold',
    description: 'Suspension of loaded spinal column exercises due to +4.2 cm microgravity disc expansion and lumbar ache.',
    affectedRegion: 'Lumbar Spine (L3-L5)',
    restrictedExercises: ['ARED Squat', 'ARED Deadlift'],
    severity: 'High',
    effectiveDate: 'MET D+82 (Nov 08)',
    status: 'Active',
    prescribedBy: 'Dr. Marcus Vance, M.D., FACEP (Lead Flight Surgeon)',
    clinicalRationale: 'Intervertebral disc decompression of +4.2 cm poses an acute risk of disc bulge under >1.5x bodyweight axial compressive load.',
  },
  {
    id: 'RES-74-02',
    astronautId: 'ASTRO-74-SJ',
    astronautName: 'Dr. Salma Johnson',
    name: 'Impact Running Restriction (T2 Treadmill)',
    description: 'Prohibit high-cadence bungee-loaded treadmill running until lumbar paraspinous tension normalizes.',
    affectedRegion: 'Lumbar & Thoracic Spine',
    restrictedExercises: ['T2 Treadmill Running'],
    severity: 'Moderate',
    effectiveDate: 'MET D+83 (Nov 09)',
    status: 'Active',
    prescribedBy: 'Dr. Marcus Vance, M.D., FACEP (Lead Flight Surgeon)',
    clinicalRationale: 'Repetitive ground reaction force transmits axial shockwaves along the unloaded spine. Substitute with CEVIS cycle ergometer.',
  },
  {
    id: 'RES-74-03',
    astronautId: 'ASTRO-74-SJ',
    astronautName: 'Dr. Salma Johnson',
    name: 'Overhead Resistive Load Limitation',
    description: 'Limit overhead resistive pressing to <40 lbs equivalent vacuum load.',
    affectedRegion: 'Cervical / Thoracic Spine',
    restrictedExercises: ['ARED Shoulder Press', 'ARED Bent-Over Row'],
    severity: 'Moderate',
    effectiveDate: 'MET D+83 (Nov 09)',
    status: 'Active',
    prescribedBy: 'Dr. Marcus Vance, M.D., FACEP (Lead Flight Surgeon)',
    clinicalRationale: 'Prevent compensatory cervical hyperextension during microgravity upper torso workouts.',
  },
];

export const getRestrictions = (astronautId?: string): MedicalRestriction[] => {
  if (astronautId) {
    return currentMedicalRestrictions.filter((r) => r.astronautId === astronautId);
  }
  return currentMedicalRestrictions;
};

export const addRestriction = (
  restriction: Omit<MedicalRestriction, 'id'>
): MedicalRestriction => {
  const newRes: MedicalRestriction = {
    ...restriction,
    id: `RES-74-${String(currentMedicalRestrictions.length + 1).padStart(2, '0')}`,
  };
  currentMedicalRestrictions = [newRes, ...currentMedicalRestrictions];

  // Log to medical timeline
  addTimelineEvent({
    type: 'restriction',
    title: `Medical Restriction Issued: ${newRes.name}`,
    summary: `${newRes.astronautName} · ${newRes.description} (${newRes.restrictedExercises.join(', ')})`,
    severity: newRes.severity === 'High' ? 'alert' : 'warning',
    badge: 'RESTRICTION',
    details: { ...newRes },
  });

  return newRes;
};

export const updateRestriction = (
  id: string,
  updates: Partial<MedicalRestriction>
): MedicalRestriction | null => {
  const index = currentMedicalRestrictions.findIndex((r) => r.id === id);
  if (index === -1) return null;

  currentMedicalRestrictions[index] = {
    ...currentMedicalRestrictions[index],
    ...updates,
  };

  if (updates.status === 'Lifted') {
    addTimelineEvent({
      type: 'restriction',
      title: `Medical Restriction Lifted: ${currentMedicalRestrictions[index].name}`,
      summary: `Flight Surgeon lifted restriction for ${currentMedicalRestrictions[index].astronautName}`,
      severity: 'nominal',
      badge: 'RESTRICTION CLEARED',
    });
  }

  return currentMedicalRestrictions[index];
};

export const deleteRestriction = (id: string): boolean => {
  const prevLen = currentMedicalRestrictions.length;
  currentMedicalRestrictions = currentMedicalRestrictions.filter((r) => r.id !== id);
  return currentMedicalRestrictions.length < prevLen;
};

// ─── Doctor Notes Store ─────────────────────────────────────────────────────

export let currentDoctorNotes: DoctorNote[] = [
  {
    id: 'NOTE-74-01',
    astronautId: 'ASTRO-74-SJ',
    astronautName: 'Dr. Salma Johnson',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    author: 'Dr. Marcus Vance, M.D., FACEP (Lead Flight Surgeon)',
    category: 'Adaptation Review',
    title: 'Microgravity Spinal Elongation & Lumbar Tension Evaluation',
    content: 'Reviewed morning ultrasound bio-telemetry. Intervertebral spaces between L2-L5 exhibit +4.2 cm total spinal column expansion, common in long-duration microgravity. Astronaut reports 4/10 dull muscular ache post-ARED session. Prescribed 15-minute hamstring and hip flexor decompression protocol. Autonomic tone remains stable with resting HR at 72 bpm (baseline 58 bpm), likely compounded by fragmented 5.9h sleep. Maintain restriction on axial loading.',
    relatedSymptoms: ['Lumbar Spine (L3-L5)'],
    vitalsSnapshot: { hr: 72, bp: '118/76', spo2: 99, temp: 36.8 },
    status: 'Finalized',
  },
  {
    id: 'NOTE-74-02',
    astronautId: 'ASTRO-74-SJ',
    astronautName: 'Dr. Salma Johnson',
    timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
    author: 'Dr. Marcus Vance, M.D., FACEP (Lead Flight Surgeon)',
    category: 'Countermeasure Directive',
    title: 'Cephalic Fluid Shift Mitigation & CEVIS Prescription',
    content: 'Evaluated sub-clinical Grade I cephalic fluid redistribution noted upon wake-up. Sinus fullness resolved completely after 30 minutes on CEVIS ergometer at 75% VO2 max. Recommend astronaut maintain sleep station head elevation at +4 degrees and ensure daily electrolyte replenishment exceeds 2.2 Liters.',
    relatedSymptoms: ['Cranial / Sinus (Frontal)'],
    vitalsSnapshot: { hr: 70, bp: '120/78', spo2: 99, temp: 36.7 },
    status: 'Finalized',
  },
  {
    id: 'NOTE-74-03',
    astronautId: 'ASTRO-74-SJ',
    astronautName: 'Dr. Salma Johnson',
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
    author: 'Dr. Marcus Vance, M.D., FACEP (Lead Flight Surgeon)',
    category: 'Pre-EVA Medical Clearance',
    title: 'Mid-Mission EVA-2 Preliminary Medical Clearance',
    content: 'Cardiopulmonary reserve is excellent. No signs of space motion sickness (resolved MET D+03). Metabolic index optimal. Cleared for intra-vehicular robotics lead on EVA-2. Exterior translation on airlock tether held pending spinal symptom stability.',
    relatedSymptoms: [],
    vitalsSnapshot: { hr: 64, bp: '116/74', spo2: 99, temp: 36.6 },
    status: 'Finalized',
  },
];

export const getDoctorNotes = (astronautId?: string): DoctorNote[] => {
  if (astronautId) {
    return currentDoctorNotes.filter((n) => n.astronautId === astronautId);
  }
  return currentDoctorNotes;
};

export const addDoctorNote = (note: Omit<DoctorNote, 'id' | 'timestamp'>): DoctorNote => {
  const newNote: DoctorNote = {
    ...note,
    id: `NOTE-74-${String(currentDoctorNotes.length + 1).padStart(2, '0')}`,
    timestamp: new Date().toISOString(),
  };
  currentDoctorNotes = [newNote, ...currentDoctorNotes];

  // Log to medical timeline
  addTimelineEvent({
    type: 'doctor_note',
    title: `Flight Surgeon Clinical Note: ${newNote.title}`,
    summary: `${newNote.category} · ${newNote.content.slice(0, 100)}...`,
    severity: 'info',
    badge: 'DOCTOR NOTE',
    details: { ...newNote },
  });

  return newNote;
};

export const updateDoctorNote = (id: string, updates: Partial<DoctorNote>): DoctorNote | null => {
  const index = currentDoctorNotes.findIndex((n) => n.id === id);
  if (index === -1) return null;
  currentDoctorNotes[index] = {
    ...currentDoctorNotes[index],
    ...updates,
  };
  return currentDoctorNotes[index];
};

// ─── ASTRA Medical Communications Store ──────────────────────────────────────

export const MEDICAL_TEAM_MEMBERS: MedicalTeamMember[] = [
  {
    id: 'user-fs-vance',
    name: 'Dr. Marcus Vance, M.D., FACEP',
    role: 'Lead Flight Surgeon (JSC)',
    location: 'MCC-Houston / Flight Medicine Console',
    callsign: 'MedCom-1',
    status: 'online',
    frequency: '248.500 MHz (SAT-UPLINK)',
  },
  {
    id: 'user-astro-salma',
    name: 'Dr. Salma Johnson',
    role: 'Mission Specialist / Payload Bio-Engineer',
    location: 'ISS Node 2 / Artemis Bio-Lab',
    callsign: 'Nova',
    status: 'online',
    frequency: 'ISS VHF-1 / S-Band Space-to-Ground 2',
  },
  {
    id: 'user-bme-reed',
    name: 'Dr. Evelyn Reed',
    role: 'Lead Biomedical Engineer (BME)',
    location: 'MCC-Houston / Bio-Telemetry Console',
    callsign: 'BME-Houston',
    status: 'online',
    frequency: 'BME Intercom Loop 3',
  },
  {
    id: 'user-flight-dir',
    name: 'Gene Kranz Room — MCC Flight Director',
    role: 'Mission Operations Directorate',
    location: 'JSC Mission Control Center',
    callsign: 'Flight',
    status: 'online',
    frequency: 'Flight Director Primary Loop',
  },
  {
    id: 'user-cardio-thorne',
    name: 'Dr. Alan Thorne',
    role: 'Aerospace Cardiologist',
    location: 'JSC Cardiovascular Laboratory',
    callsign: 'Cardio-Consult',
    status: 'standby',
    frequency: 'Consult Loop B',
  },
];

export let currentConversations: MedicalConversation[] = [
  {
    id: 'conv-med-team',
    title: 'Medical Team (Ground Control)',
    isGroup: true,
    description: 'JSC Mission Control Center Houston — Flight Medicine & Bio-Astronautics Tactical Relay',
    channelFrequency: 'MedCom Alpha · 248.500 MHz TDRS SAT-Uplink',
    unreadCount: 1,
    lastMessage: 'Surgeon, EVA-2 prep briefing is scheduled for 16:00 UTC. Need clearance status.',
    lastTimestamp: new Date(Date.now() - 3600000 * 0.5).toISOString(),
    participants: MEDICAL_TEAM_MEMBERS,
  },
  {
    id: 'conv-astro-salma',
    title: 'Dr. Salma Johnson (Astronaut)',
    isGroup: false,
    description: 'Private Secure Clinical Uplink — Expedition 74 Crew Telemedicine',
    channelFrequency: 'Private Bio-Link Delta · 414.200 MHz',
    unreadCount: 0,
    lastMessage: 'Copy Dr. Vance. Following the hamstring stretches now. No acute pain.',
    lastTimestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    participants: [
      MEDICAL_TEAM_MEMBERS[0],
      MEDICAL_TEAM_MEMBERS[1],
    ],
  },
  {
    id: 'conv-bme-reed',
    title: 'Dr. Evelyn Reed (BME)',
    isGroup: false,
    description: 'Direct Telemetry Channel — Biomedical Engineering Support',
    channelFrequency: 'MCC BME Tactical Loop',
    unreadCount: 0,
    lastMessage: 'Continuous bio-sensor impedance across Node 2 is 99.4% nominal.',
    lastTimestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
    participants: [
      MEDICAL_TEAM_MEMBERS[0],
      MEDICAL_TEAM_MEMBERS[2],
    ],
  },
  {
    id: 'conv-flight-dir',
    title: 'MCC Flight Director',
    isGroup: false,
    description: 'Executive Mission Directorate Channel',
    channelFrequency: 'Flight Loop Alpha (Houston)',
    unreadCount: 0,
    lastMessage: 'Acknowledged Surgeon. Scheduling medical briefing into MET timeline.',
    lastTimestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    participants: [
      MEDICAL_TEAM_MEMBERS[0],
      MEDICAL_TEAM_MEMBERS[3],
    ],
  },
];

export let currentMessages: Record<string, MedicalMessage[]> = {
  'conv-med-team': [
    {
      id: 'msg-01',
      conversationId: 'conv-med-team',
      senderId: 'user-bme-reed',
      senderName: 'Dr. Evelyn Reed (BME)',
      senderRole: 'Lead Biomedical Engineer',
      content: 'Flight Surgeon, telemetry downlink from EXP-74 Node 2 confirms Dr. Johnson completed her 30m CEVIS aerobic block. Her SpO2 remained steady at 99%, HR peaked at 134 bpm without autonomic irregularity.',
      timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(),
      isSurgeon: false,
      messageType: 'telemetry_alert',
      priority: 'normal',
    },
    {
      id: 'msg-02',
      conversationId: 'conv-med-team',
      senderId: 'user-astro-salma',
      senderName: 'Dr. Salma Johnson',
      senderRole: 'Mission Specialist / Bio-Engineer',
      content: 'Morning Ground Medical. Lumbar decompression feels significantly relieved after the hamstring stretches. No sharp pain reported, just typical microG elongation stiffness upon wake-up.',
      timestamp: new Date(Date.now() - 3600000 * 2.1).toISOString(),
      isSurgeon: false,
      messageType: 'routine',
      priority: 'normal',
    },
    {
      id: 'msg-03',
      conversationId: 'conv-med-team',
      senderId: 'user-fs-vance',
      senderName: 'Dr. Marcus Vance, M.D. (You)',
      senderRole: 'Lead Flight Surgeon',
      content: 'Understood, Salma. We are maintaining the active hold on heavy ARED axial squats and deadlifts until tomorrow morning\'s ultrasound of the L3-L5 disc space. Keep hydration above 2.2 Liters.',
      timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString(),
      isSurgeon: true,
      messageType: 'clinical_directive',
      priority: 'urgent',
    },
    {
      id: 'msg-04',
      conversationId: 'conv-med-team',
      senderId: 'user-flight-dir',
      senderName: 'MCC Flight Director',
      senderRole: 'Mission Operations Directorate',
      content: 'Surgeon, EVA-2 prep briefing is scheduled for 16:00 UTC. Need your medical clearance status on Johnson and Rostova by 15:30.',
      timestamp: new Date(Date.now() - 3600000 * 0.5).toISOString(),
      isSurgeon: false,
      messageType: 'clearance',
      priority: 'urgent',
    },
  ],
  'conv-astro-salma': [
    {
      id: 'msg-salma-01',
      conversationId: 'conv-astro-salma',
      senderId: 'user-fs-vance',
      senderName: 'Dr. Marcus Vance, M.D. (You)',
      senderRole: 'Lead Flight Surgeon',
      content: 'Salma, noting your morning HR at 72 bpm vs 58 bpm baseline. Correlating with 5.9h fragmented sleep. How is the acoustic noise level in your crew quarter?',
      timestamp: new Date(Date.now() - 3600000 * 3.5).toISOString(),
      isSurgeon: true,
      messageType: 'routine',
      priority: 'normal',
    },
    {
      id: 'msg-salma-02',
      conversationId: 'conv-astro-salma',
      senderId: 'user-astro-salma',
      senderName: 'Dr. Salma Johnson',
      senderRole: 'Mission Specialist / Bio-Engineer',
      content: 'Copy Dr. Vance. ECLSS ventilation fan harmonic was audible through the bulkhead around 03:00 MET. Using noise attenuating earplugs tonight. Following the hamstring stretches now. No acute pain.',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      isSurgeon: false,
      messageType: 'routine',
      priority: 'normal',
    },
  ],
  'conv-bme-reed': [
    {
      id: 'msg-bme-01',
      conversationId: 'conv-bme-reed',
      senderId: 'user-bme-reed',
      senderName: 'Dr. Evelyn Reed (BME)',
      senderRole: 'Lead Biomedical Engineer',
      content: 'Continuous bio-sensor impedance across Node 2 is 99.4% nominal. Calibration on the pulse oximeter telemetry array completed.',
      timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
      isSurgeon: false,
      messageType: 'telemetry_alert',
      priority: 'normal',
    },
  ],
  'conv-flight-dir': [
    {
      id: 'msg-fd-01',
      conversationId: 'conv-flight-dir',
      senderId: 'user-flight-dir',
      senderName: 'MCC Flight Director',
      senderRole: 'Mission Operations Directorate',
      content: 'Acknowledged Surgeon. Scheduling medical briefing into MET timeline.',
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
      isSurgeon: false,
      messageType: 'routine',
      priority: 'normal',
    },
  ],
};

export const getConversations = (): MedicalConversation[] => {
  return currentConversations;
};

export const getMessages = (conversationId: string): MedicalMessage[] => {
  return currentMessages[conversationId] || [];
};

export const sendMedicalMessage = (
  conversationId: string,
  content: string,
  messageType: 'clinical_directive' | 'telemetry_alert' | 'routine' | 'clearance' = 'routine',
  priority: 'normal' | 'urgent' | 'priority' = 'normal'
): MedicalMessage => {
  const newMsg: MedicalMessage = {
    id: `msg-${Date.now()}`,
    conversationId,
    senderId: 'user-fs-vance',
    senderName: 'Dr. Marcus Vance, M.D. (You)',
    senderRole: 'Lead Flight Surgeon',
    content: content.trim(),
    timestamp: new Date().toISOString(),
    isSurgeon: true,
    messageType,
    priority,
  };

  if (!currentMessages[conversationId]) {
    currentMessages[conversationId] = [];
  }
  currentMessages[conversationId].push(newMsg);

  // Update conversation last message
  const conv = currentConversations.find((c) => c.id === conversationId);
  if (conv) {
    conv.lastMessage = newMsg.content;
    conv.lastTimestamp = newMsg.timestamp;
  }

  // Sync direct Flight Surgeon replies in Communications with Doctor Chat & reset wait timer
  if (conversationId === 'conv-astro-salma' && messageType !== 'telemetry_alert') {
    recordSurgeonReplyToDoctorChat('ASTRO-74-SJ', newMsg.content, 'Dr. Marcus Vance, M.D. (Flight Surgeon)', true);
  }

  return newMsg;
};

// ─── Medical Alerts Store ───────────────────────────────────────────────────

export let currentMedicalAlerts: MedicalAlert[] = [
  {
    id: 'ALT-01',
    astronautId: 'ASTRO-74-SJ',
    astronautName: 'Dr. Salma Johnson',
    astronautCallsign: 'Nova',
    photoUrl: '/images/astronaut_salma_portrait.jpg',
    title: 'Microgravity Spinal Elongation Delta (+4.2 cm)',
    description: 'Ultrasonic bio-telemetry confirms +4.2 cm total intervertebral disc decompression exceeding 3.0 cm mission threshold. High acute disc herniation risk under axial loading.',
    severity: 'critical',
    category: 'Spinal Adaptation',
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    isAcknowledged: false,
    recommendedAction: 'Maintain immediate suspension on ARED squats and deadlifts; schedule L3-L5 disc ultrasound.',
  },
  {
    id: 'ALT-02',
    astronautId: 'ASTRO-74-SJ',
    astronautName: 'Dr. Salma Johnson',
    astronautCallsign: 'Nova',
    photoUrl: '/images/astronaut_salma_portrait.jpg',
    title: 'Active Musculoskeletal Symptom: Lumbar Spine L3-L5',
    description: 'Astronaut logged dull lumbar ache (Intensity 4/10) following 90m ARED countermeasure block.',
    severity: 'warning',
    category: 'Symptom',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    isAcknowledged: true,
    reviewedBy: 'Dr. Marcus Vance, M.D.',
    recommendedAction: 'Prescribe 15-min hamstring decompression stretches and verify neuro-motor reflex.',
  },
  {
    id: 'ALT-03',
    astronautId: 'ASTRO-74-SJ',
    astronautName: 'Dr. Salma Johnson',
    astronautCallsign: 'Nova',
    photoUrl: '/images/astronaut_salma_portrait.jpg',
    title: 'Resting Heart Rate Elevation (+14 bpm over baseline)',
    description: 'Resting heart rate telemetry reached 72 bpm compared to 58 bpm flight baseline, correlated with 5.9h fragmented sleep in Node 2.',
    severity: 'warning',
    category: 'Biometrics',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    isAcknowledged: false,
    recommendedAction: 'Prescribe 45-min active recovery, 500 mL electrolytic rehydration, defer high-cadence treadmill.',
  },
  {
    id: 'ALT-04',
    astronautId: 'ASTRO-74-SJ',
    astronautName: 'Dr. Salma Johnson',
    astronautCallsign: 'Nova',
    photoUrl: '/images/astronaut_salma_portrait.jpg',
    title: 'Cephalic Fluid Shift Grade I (Frontal Sinus Fullness)',
    description: 'Sub-clinical microgravity headward fluid redistribution noted upon orbital wake-up. Cleared after 30 mins upright CEVIS cycling.',
    severity: 'info',
    category: 'Sleep & Recovery',
    timestamp: new Date(Date.now() - 3600000 * 22).toISOString(),
    isAcknowledged: true,
    reviewedBy: 'Dr. Marcus Vance, M.D.',
    recommendedAction: 'Maintain sleep station head elevation at +4 degrees and CEVIS morning warm-up.',
  },
  {
    id: 'ALT-05',
    astronautId: 'ASTRO-74-ER',
    astronautName: 'Lt. Elena Rostova',
    astronautCallsign: 'Valkyrie',
    photoUrl: '',
    title: 'Post-EVA Forearm Muscle Fatigue (Resolved)',
    description: 'Pre-EVA clearance check shows nominal grip strength recovery. SpO2 98%, HR 61 bpm.',
    severity: 'info',
    category: 'Biometrics',
    timestamp: new Date(Date.now() - 3600000 * 28).toISOString(),
    isAcknowledged: true,
    reviewedBy: 'Dr. Marcus Vance, M.D.',
    recommendedAction: 'Cleared for EVA-2 airlock ingress and robotic arm operation.',
  },
  {
    id: 'ALT-06',
    astronautId: 'ASTRO-74-AR',
    astronautName: 'Cmdr. Alex Reid',
    astronautCallsign: 'Apex',
    photoUrl: '',
    title: 'Routine Biometric Downlink Nominal',
    description: 'Autonomic cardiovascular parameters completely stable (HR 64 bpm, BP 120/78 mmHg, SpO2 99%).',
    severity: 'info',
    category: 'Biometrics',
    timestamp: new Date(Date.now() - 3600000 * 32).toISOString(),
    isAcknowledged: true,
    reviewedBy: 'Dr. Marcus Vance, M.D.',
    recommendedAction: 'Continue nominal flight schedule.',
  },
];

export const getMedicalAlerts = (): MedicalAlert[] => {
  return currentMedicalAlerts;
};

export const acknowledgeAlert = (id: string, surgeonName = 'Dr. Marcus Vance, M.D.'): MedicalAlert | null => {
  const alert = currentMedicalAlerts.find((a) => a.id === id);
  if (alert) {
    alert.isAcknowledged = true;
    alert.reviewedBy = surgeonName;
    // Clear linked persistent emergency override once acknowledged by authorized medical personnel
    const session = currentEmergencySessions[alert.astronautId];
    if (session && session.alertId === id) {
      session.acknowledged = true;
      session.isActive = false;
    }
  }
  return alert || null;
};

export const resolveAlert = (id: string): boolean => {
  const target = currentMedicalAlerts.find((a) => a.id === id);
  if (target) {
    const session = currentEmergencySessions[target.astronautId];
    if (session && session.alertId === id) {
      session.acknowledged = true;
      session.isActive = false;
    }
  }
  const prevLen = currentMedicalAlerts.length;
  currentMedicalAlerts = currentMedicalAlerts.filter((a) => a.id !== id);
  return currentMedicalAlerts.length < prevLen;
};

// ─── Exchanged Medical Reports & Referrals Store ───────────────────────────

export let currentExchangedReports: ExchangedMedicalReport[] = [
  {
    id: 'REP-01',
    reportNumber: 'NASA-MED-2026-084-LUMBAR',
    title: 'Secondary Orthopedic Assessment: Microgravity Spinal Decompression (+4.2 cm)',
    documentType: 'Clinical Specialist Referral',
    astronautId: 'ASTRO-74-SJ',
    astronautName: 'Dr. Salma Johnson',
    astronautCallsign: 'Nova',
    authorId: 'user-fs-vance',
    authorName: 'Dr. Marcus Vance, M.D., FACEP',
    authorRole: 'Lead Flight Surgeon (MCC Houston / JSC)',
    recipientDoctorId: 'doc-sarah',
    recipientDoctorName: 'Dr. Sarah Chen, M.D.',
    recipientDoctorRole: 'Lead Space Spine & Orthopedic Consultant (JSC Flight Medicine)',
    urgency: 'urgent',
    status: 'reviewed',
    createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    transmissionTimestamp: new Date(Date.now() - 3600000 * 13).toISOString(),
    clinicalSummary: 'Ultrasonic sagittal scans confirm +4.2 cm longitudinal spinal column elongation with progressive dull ache at L3-L5 (VAS 4/10). ARED axial countermeasure loads suspended pending sub-specialist evaluation.',
    findings: [
      'Sagittal ultrasound displays intervertebral disc height widening (+4.2 cm overall delta vs ground baseline).',
      'Preserved lumbar lordosis; no radiculopathy or sensory deficits down lower extremities.',
      'Active muscle guarding along erector spinae post-90 min resistance block.',
    ],
    referralQuestion: 'Requesting orthopedic sub-specialty evaluation on axial loading thresholds and clearance for resuming low-resistance CEVIS cycling and passive traction harness.',
    vitalsSnapshot: {
      hr: 72,
      bp: '118/76',
      spo2: 99,
      temp: 36.8,
      spineDelta: '+4.2 cm',
    },
    attachments: [
      { name: 'ultrasound_L3L5_sagittal_decompression.dicom', sizeKb: 4210, type: 'ultrasound_dicom' },
      { name: 'ared_axial_loading_telemetry.csv', sizeKb: 340, type: 'telemetry_csv' },
    ],
    reviews: [
      {
        id: 'REV-01',
        reviewerId: 'doc-sarah',
        reviewerName: 'Dr. Sarah Chen, M.D.',
        reviewerRole: 'Lead Space Spine & Orthopedic Consultant (JSC)',
        timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
        action: 'endorsed',
        feedbackNotes: 'Reviewed DICOM ultrasound. Disc height expansion is consistent with intervertebral hydration under microgravity. Full concurrence with Dr. Vance: maintain absolute hold on ARED axial compression (deadlifts/squats). Cleared for zero-load hamstring stretching, 100 Hz TENS therapy, and CEVIS ergometry with neutral lumbar backrest.',
        recommendedModifications: [
          'Re-measure disc height via ultrasound in 48 hours.',
          'Introduce 20-min daily prone elongation in crew quarters.',
          'ARED squats locked until delta decreases below +3.0 cm.',
        ],
        signatureCredential: 'NASA-SMO-BOARD-ORTHO-4419',
      },
    ],
    forwardHistory: [],
  },
  {
    id: 'REP-02',
    reportNumber: 'NASA-MED-2026-081-EVA2',
    title: 'Pre-EVA-2 Medical Clearance Dossier: Forearm Flexor Readiness',
    documentType: 'Pre-EVA Mission Clearance',
    astronautId: 'ASTRO-74-ER',
    astronautName: 'Lt. Elena Rostova',
    astronautCallsign: 'Valkyrie',
    authorId: 'doc-elena',
    authorName: 'Lt. Elena Rostova, M.D.',
    authorRole: 'Station Medical Officer (ISS Node 2 / Orbit)',
    recipientDoctorId: 'user-fs-vance',
    recipientDoctorName: 'Dr. Marcus Vance, M.D.',
    recipientDoctorRole: 'Lead Flight Surgeon (MCC Houston / JSC)',
    urgency: 'urgent',
    status: 'transmitted',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    transmissionTimestamp: new Date(Date.now() - 3600000 * 3.8).toISOString(),
    clinicalSummary: 'Post-EVA-1 forearm flexor fatigue evaluation following 6h 40m spacewalk. Grip strength dynamometer restored to 48 kg (100% of flight baseline). Autonomic recovery nominal.',
    findings: [
      'Grip dynamometer test: 48 kg bilateral (100% of pre-flight baseline).',
      'Zero fingertip paresthesia or subungual hematomas under pressurized EMU gloves.',
      'SpO2 stable at 98%, resting HR 61 bpm, blood pressure 116/74 mmHg.',
    ],
    referralQuestion: 'Requesting Lead Flight Surgeon final medical sign-off and flight clearance for EVA-2 airlock Quest egress scheduled for MET D+86.',
    vitalsSnapshot: {
      hr: 61,
      bp: '116/74',
      spo2: 98,
      temp: 36.6,
    },
    attachments: [
      { name: 'grip_dynamometer_recovery_curve.pdf', sizeKb: 890, type: 'pdf' },
      { name: 'emu_glove_pressure_telemetry.csv', sizeKb: 210, type: 'telemetry_csv' },
    ],
    reviews: [],
    forwardHistory: [],
  },
  {
    id: 'REP-03',
    reportNumber: 'NASA-MED-2026-082-CARDIO',
    title: 'Cardiovascular Autonomic Drift & Elevated Resting HR Surveillance',
    documentType: 'Cardiovascular Stress Panel',
    astronautId: 'ASTRO-74-SJ',
    astronautName: 'Dr. Salma Johnson',
    astronautCallsign: 'Nova',
    authorId: 'user-fs-vance',
    authorName: 'Dr. Marcus Vance, M.D., FACEP',
    authorRole: 'Lead Flight Surgeon (MCC Houston / JSC)',
    recipientDoctorId: 'doc-amira',
    recipientDoctorName: 'Dr. Amira Patel, M.D., FACC',
    recipientDoctorRole: 'Autonomic & Cardiovascular Flight Surgeon (DLR / EAC)',
    urgency: 'routine',
    status: 'under_review',
    createdAt: new Date(Date.now() - 3600000 * 9).toISOString(),
    transmissionTimestamp: new Date(Date.now() - 3600000 * 8.5).toISOString(),
    clinicalSummary: 'Dr. Salma Johnson resting heart rate has trended up to 72 bpm (baseline 58 bpm). Correlated with 5.9h fragmented sleep and sub-clinical cephalic fluid shift.',
    findings: [
      'Resting HR baseline: 58 bpm -> current telemetry: 72 bpm (+14 bpm delta).',
      'Heart Rate Variability (HRV) rMSSD: 64 ms (mild parasympathetic withdrawal).',
      'Normal QTc interval (412 ms) on 12-lead Holter patch downlink.',
    ],
    referralQuestion: 'Please review Holter ECG downlink and advise on electrolytic rehydration protocol and whether CEVIS cardiovascular target wattage should be capped.',
    vitalsSnapshot: {
      hr: 72,
      bp: '118/76',
      spo2: 99,
      temp: 36.8,
    },
    attachments: [
      { name: '12_lead_ecg_telemetry_trace.pdf', sizeKb: 1540, type: 'pdf' },
    ],
    reviews: [],
    forwardHistory: [],
  },
  {
    id: 'REP-04',
    reportNumber: 'NASA-MED-2026-079-VESTIB',
    title: 'Neuro-Vestibular Otolith Adaptation Review Post-SMAS',
    documentType: 'Microgravity Adaptation Audit',
    astronautId: 'ASTRO-74-SJ',
    astronautName: 'Dr. Salma Johnson',
    astronautCallsign: 'Nova',
    authorId: 'doc-kenji',
    authorName: 'Dr. Kenji Sato, M.D., Ph.D.',
    authorRole: 'Aerospace Neuro-Vestibular Specialist (JAXA / Tsukuba)',
    recipientDoctorId: 'user-fs-vance',
    recipientDoctorName: 'Dr. Marcus Vance, M.D.',
    recipientDoctorRole: 'Lead Flight Surgeon',
    urgency: 'routine',
    status: 'reviewed',
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    transmissionTimestamp: new Date(Date.now() - 3600000 * 35).toISOString(),
    clinicalSummary: 'Follow-up on Space Motion Adaptation Syndrome (SMAS) resolved on MET D+03. Video-oculography assessment shows complete central vestibular recalibration.',
    findings: [
      'Vestibulo-ocular reflex (VOR) suppression completely normal.',
      'Zero motion-induced nausea or spatial disorientation during module translation.',
      'Sleep architecture returning to stable REM cycles.',
    ],
    referralQuestion: 'Forwarding formal documentation of vestibular adaptation clearance for astronaut medical records.',
    vitalsSnapshot: {
      hr: 58,
      bp: '114/72',
      spo2: 99,
      temp: 36.7,
    },
    attachments: [
      { name: 'video_oculography_vestibular_trace.pdf', sizeKb: 2180, type: 'pdf' },
    ],
    reviews: [
      {
        id: 'REV-02',
        reviewerId: 'user-fs-vance',
        reviewerName: 'Dr. Marcus Vance, M.D.',
        reviewerRole: 'Lead Flight Surgeon',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        action: 'cleared',
        feedbackNotes: 'Acknowledged and endorsed. Astronaut Dr. Salma Johnson is cleared of all neuro-vestibular restrictions. SMAS listed as fully resolved in mission record.',
        signatureCredential: 'NASA-FS-9842-JSC',
      },
    ],
    forwardHistory: [],
  },
];

export const getExchangedReports = (): ExchangedMedicalReport[] => {
  return currentExchangedReports;
};

export const getExchangedReportById = (id: string): ExchangedMedicalReport | null => {
  return currentExchangedReports.find((r) => r.id === id) || null;
};

export const createExchangedReport = (
  report: Omit<ExchangedMedicalReport, 'id' | 'reportNumber' | 'createdAt' | 'transmissionTimestamp' | 'reviews' | 'forwardHistory'> & {
    attachments?: ExchangedReportAttachment[];
  }
): ExchangedMedicalReport => {
  const count = currentExchangedReports.length + 1;
  const newReport: ExchangedMedicalReport = {
    ...report,
    id: `REP-${Date.now()}`,
    reportNumber: `NASA-MED-2026-${String(count).padStart(3, '0')}-${report.astronautCallsign.toUpperCase()}`,
    createdAt: new Date().toISOString(),
    transmissionTimestamp: new Date().toISOString(),
    reviews: [],
    forwardHistory: [],
    attachments: report.attachments || [
      { name: `telemetry_summary_${report.astronautId.toLowerCase()}.pdf`, sizeKb: 920, type: 'pdf' },
    ],
  };

  currentExchangedReports.unshift(newReport);
  return newReport;
};

export const reviewExchangedReport = (
  id: string,
  review: {
    reviewerId?: string;
    reviewerName?: string;
    reviewerRole?: string;
    action: 'endorsed' | 'countermeasure_requested' | 'forwarded' | 'cleared';
    feedbackNotes: string;
    recommendedModifications?: string[];
    signatureCredential?: string;
  }
): ExchangedMedicalReport | null => {
  const report = currentExchangedReports.find((r) => r.id === id);
  if (!report) return null;

  const newReview: ReportReviewResponse = {
    id: `REV-${Date.now()}`,
    reviewerId: review.reviewerId || 'user-fs-vance',
    reviewerName: review.reviewerName || 'Dr. Marcus Vance, M.D.',
    reviewerRole: review.reviewerRole || 'Lead Flight Surgeon (MCC Houston / JSC)',
    timestamp: new Date().toISOString(),
    action: review.action,
    feedbackNotes: review.feedbackNotes,
    recommendedModifications: review.recommendedModifications || [],
    signatureCredential: review.signatureCredential || 'NASA-FS-9842-BOARD-CERT',
  };

  report.reviews.push(newReview);
  report.status = 'reviewed';
  return report;
};

export const forwardExchangedReport = (
  id: string,
  forwardData: {
    toDoctorId: string;
    toDoctorName: string;
    toDoctorRole: string;
    fromDoctorName?: string;
    reason: string;
  }
): ExchangedMedicalReport | null => {
  const report = currentExchangedReports.find((r) => r.id === id);
  if (!report) return null;

  const forwardEntry: ForwardHistoryEntry = {
    fromDoctor: forwardData.fromDoctorName || report.recipientDoctorName,
    toDoctor: `${forwardData.toDoctorName} (${forwardData.toDoctorRole})`,
    reason: forwardData.reason,
    timestamp: new Date().toISOString(),
  };

  if (!report.forwardHistory) {
    report.forwardHistory = [];
  }
  report.forwardHistory.push(forwardEntry);

  report.recipientDoctorId = forwardData.toDoctorId;
  report.recipientDoctorName = forwardData.toDoctorName;
  report.recipientDoctorRole = forwardData.toDoctorRole;
  report.status = 'forwarded';

  return report;
};

export const deleteExchangedReport = (id: string): boolean => {
  const prevLen = currentExchangedReports.length;
  currentExchangedReports = currentExchangedReports.filter((r) => r.id !== id);
  return currentExchangedReports.length < prevLen;
};

// ─── AI Medical Assistant & Doctor Availability Store (Separated Channels) ───

export let currentDoctorAvailability: DoctorAvailabilityStatus = 'available';
export let currentDoctorTimeoutSeconds: DoctorTimeoutSeconds = 7200;

export const formatTimeoutDurationText = (seconds: DoctorTimeoutSeconds): string => {
  if (seconds === 15) return '15 seconds';
  if (seconds === 10800) return '3 hours';
  return '2 hours';
};

export const formatTimeoutShortBadge = (seconds: DoctorTimeoutSeconds): string => {
  if (seconds === 15) return '15S';
  if (seconds === 10800) return '3H';
  return '2H';
};

export let currentDoctorChannelHistories: Record<string, MedicalAssistantMessage[]> = {
  'ASTRO-74-SJ': [
    {
      id: 'DOC-INIT-01',
      astronautId: 'ASTRO-74-SJ',
      channel: 'doctor',
      sender: 'flight_surgeon',
      senderId: 'user-fs-vance',
      senderName: 'Dr. Marcus Vance, M.D. (Flight Surgeon)',
      senderRole: 'Lead Flight Surgeon · MEDCOM-1',
      content:
        'Good copy, Nova. Telemetry downlink shows +4.2 cm spinal elongation and mild lumbar ache. Continue CEVIS cycling and report here directly if symptoms change.',
      timestamp: new Date(Date.now() - 3600000 * 1.2).toISOString(),
      triageLevel: 'low_risk',
    },
  ],
};

export let currentAiChannelHistories: Record<string, MedicalAssistantMessage[]> = {
  'ASTRO-74-SJ': [
    {
      id: 'AI-INIT-01',
      astronautId: 'ASTRO-74-SJ',
      channel: 'ai',
      sender: 'ai_assistant',
      senderId: 'astra-ai-medical',
      senderName: 'ASTRA AI Medical Assistant',
      senderRole: 'Temporary Medical Support System',
      content:
        'ASTRA AI Medical Assistant standby synchronized with your orbital bio-telemetry. When Dr. Marcus Vance is unavailable or does not respond within the configured SLA window, I provide temporary medical guidance and vital sign explanations.',
      timestamp: new Date(Date.now() - 3600000 * 0.4).toISOString(),
      triageLevel: 'attention_required',
      protocolBasis: 'ISS Expedition 74 Flight Medicine Triage Protocol — Baseline Telemetry Sync',
      verifiedRecordsUsed: [
        'Verified Telemetry: HR 72 bpm (Personal Flight Baseline: 58 bpm), BP 118/76 mmHg, SpO2 99%, Temp 36.8°C, RR 14 breaths/min, Sleep 5.9 hrs.',
        'Verified Medical Record: +4.2 cm spinal elongation; active restriction on axial spinal loading.',
      ],
      vitalObservations: [
        'AI Observation: Resting Heart Rate (72 bpm) is +14 bpm above recorded 58 bpm baseline alongside 5.9 hrs recorded sleep.',
        'AI Observation: SpO2 (99%), BP (118/76 mmHg), Core Temperature (36.8°C), and Respiratory Rate (14 breaths/min) are within standard reference ranges; note that normal vitals alone do not rule out clinical symptoms.',
      ],
      disclaimer:
        'Temporary medical support only — ASTRA AI is not a doctor, does not make diagnoses, and never prescribes medications or dosages.',
      source: 'astra-system-sync',
    },
  ],
};

export interface InternalDoctorTimerRecord extends DoctorResponseTimerState {
  triggerMessageId?: string;
  triggerMessageContent?: string;
  notifiedTimeoutTakeover?: boolean;
}

export let currentDoctorTimers: Record<string, InternalDoctorTimerRecord> = {};
export let currentEmergencySessions: Record<string, EmergencyTriageState> = {};

export const evaluateVitalSigns = (
  hr: number,
  bpSys: number,
  bpDia: number,
  spo2: number,
  temp: number,
  rr: number | null,
  restingBaseline: number | null
): VitalSignEvaluation[] => {
  const hrDelta = restingBaseline !== null ? hr - restingBaseline : null;

  let hrStatus: VitalThresholdStatus = 'normal';
  let hrNote =
    hrDelta !== null && restingBaseline !== null
      ? `Within standard range (${hrDelta >= 0 ? `+${hrDelta}` : hrDelta} bpm vs recorded ${restingBaseline} bpm baseline).`
      : 'Within standard resting adult range (50–100 bpm); personal flight baseline not recorded.';
  if (hr < 45 || hr > 120) {
    hrStatus = 'critical';
    hrNote = hr > 120 ? 'Critically elevated tachycardia threshold (>120 bpm).' : 'Critically low bradycardia threshold (<45 bpm).';
  } else if (hr > 100 || hr < 50 || (hrDelta !== null && hrDelta >= 12)) {
    hrStatus = 'unusual';
    hrNote =
      hrDelta !== null && hrDelta >= 12 && restingBaseline !== null
        ? `Elevated +${hrDelta} bpm above recorded ${restingBaseline} bpm flight baseline.`
        : 'Outside standard resting adult range (50–100 bpm).';
  }

  let bpStatus: VitalThresholdStatus = 'normal';
  let bpNote = 'Normotensive perfusion reading.';
  if (bpSys >= 180 || bpDia >= 110 || bpSys < 85 || bpDia < 55) {
    bpStatus = 'critical';
    bpNote = bpSys >= 180 || bpDia >= 110 ? 'Hypertensive crisis range (>=180/110 mmHg).' : 'Hypotensive shock threshold (<85/55 mmHg).';
  } else if (bpSys >= 140 || bpDia >= 90 || bpSys < 90 || bpDia < 60) {
    bpStatus = 'unusual';
    bpNote = 'Mildly outside standard 90–139 / 60–89 mmHg reference range.';
  }

  let spo2Status: VitalThresholdStatus = 'normal';
  let spo2Note = 'Optimal arterial oxygen saturation.';
  if (spo2 < 90) {
    spo2Status = 'critical';
    spo2Note = 'Critical hypoxemia threshold (<90%).';
  } else if (spo2 < 95) {
    spo2Status = 'unusual';
    spo2Note = 'Mildly reduced oxygen saturation (90–94%). Monitor closely.';
  }

  let tempStatus: VitalThresholdStatus = 'normal';
  let tempNote = 'Afebrile normothermic reading.';
  if (temp >= 39.0 || temp <= 35.0) {
    tempStatus = 'critical';
    tempNote = temp >= 39.0 ? 'High fever threshold (>=39.0°C).' : 'Hypothermia threshold (<=35.0°C).';
  } else if (temp >= 37.6 || temp <= 36.0) {
    tempStatus = 'unusual';
    tempNote = temp >= 37.6 ? 'Mildly elevated core temperature (37.6–38.9°C).' : 'Slightly below standard core temperature.';
  }

  let rrStatus: VitalThresholdStatus = 'unavailable';
  let rrNote = 'No respiratory rate measurement recorded in current crew telemetry.';
  if (rr !== null) {
    rrStatus = 'normal';
    rrNote = 'Unlabored normal respiratory cadence.';
    if (rr > 26 || rr < 9) {
      rrStatus = 'critical';
      rrNote = rr > 26 ? 'Severe tachypnea (>26 breaths/min).' : 'Severe bradypnea (<9 breaths/min).';
    } else if (rr > 20 || rr < 12) {
      rrStatus = 'unusual';
      rrNote = 'Outside typical resting respiratory rate (12–20 breaths/min).';
    }
  }

  return [
    { key: 'hr', label: 'Heart Rate', value: `${hr}`, unit: 'bpm', referenceRange: '50–100 bpm', status: hrStatus, note: hrNote },
    { key: 'bp', label: 'Blood Pressure', value: `${bpSys}/${bpDia}`, unit: 'mmHg', referenceRange: '90–139 / 60–89', status: bpStatus, note: bpNote },
    { key: 'spo2', label: 'Oxygen Saturation (SpO2)', value: `${spo2}`, unit: '%', referenceRange: '95–100%', status: spo2Status, note: spo2Note },
    { key: 'temp', label: 'Body Temperature', value: `${temp}`, unit: '°C', referenceRange: '36.1–37.5°C', status: tempStatus, note: tempNote },
    {
      key: 'rr',
      label: 'Respiratory Rate',
      value: rr !== null ? `${rr}` : 'N/A',
      unit: rr !== null ? 'breaths/min' : '',
      referenceRange: '12–20 /min',
      status: rrStatus,
      note: rrNote,
    },
  ];
};

const ensureChannelHistories = (astronautId: string) => {
  const crewMember = currentCrewMembers.find((c) => c.id === astronautId);
  const targetName = crewMember?.name || currentAstronautProfile.name;
  const targetCallsign = crewMember?.callsign || currentAstronautProfile.callsign;

  if (!currentDoctorChannelHistories[astronautId]) {
    currentDoctorChannelHistories[astronautId] = [
      {
        id: `DOC-INIT-${astronautId}`,
        astronautId,
        channel: 'doctor',
        sender: 'flight_surgeon',
        senderId: 'user-fs-vance',
        senderName: 'Dr. Marcus Vance, M.D. (Flight Surgeon)',
        senderRole: 'Lead Flight Surgeon · MEDCOM-1',
        content: `Direct Flight Surgeon channel open for ${targetName} (${targetCallsign}). Send medical updates or questions here when Flight Surgeon status is Available.`,
        timestamp: new Date().toISOString(),
        triageLevel: 'low_risk',
      },
    ];
  }

  if (!currentAiChannelHistories[astronautId]) {
    currentAiChannelHistories[astronautId] = [
      {
        id: `AI-INIT-${astronautId}`,
        astronautId,
        channel: 'ai',
        sender: 'ai_assistant',
        senderId: 'astra-ai-medical',
        senderName: 'ASTRA AI Medical Assistant',
        senderRole: 'Temporary Medical Support System',
        content: `Hello ${targetName} (${targetCallsign}). Your recorded orbital vital signs are synchronized with ASTRA AI Medical Assistant. I provide temporary initial medical guidance whenever the Flight Surgeon is unavailable.`,
        timestamp: new Date().toISOString(),
        triageLevel: 'low_risk',
        disclaimer:
          'Temporary medical support only — ASTRA AI is not a doctor, does not make diagnoses, and never prescribes medications or dosages.',
        source: 'astra-system-sync',
      },
    ];
  }

  if (!currentDoctorTimers[astronautId]) {
    currentDoctorTimers[astronautId] = {
      isWaiting: false,
      timeoutSeconds: currentDoctorTimeoutSeconds,
      aiTakeoverActive: false,
    };
  }
};

export const getActiveChannelForAstronaut = (astronautId: string): CommunicationChannel => {
  ensureChannelHistories(astronautId);
  if (currentDoctorAvailability === 'unavailable') return 'ai';
  if (currentDoctorTimers[astronautId]?.aiTakeoverActive) return 'ai';
  return 'doctor';
};

export const getDoctorAvailabilityConfig = () => ({
  doctorStatus: currentDoctorAvailability,
  timeoutSeconds: currentDoctorTimeoutSeconds,
});

export const setDoctorAvailabilityConfig = (params: {
  doctorStatus?: DoctorAvailabilityStatus;
  timeoutSeconds?: DoctorTimeoutSeconds;
}) => {
  if (params.timeoutSeconds === 15 || params.timeoutSeconds === 7200 || params.timeoutSeconds === 10800) {
    currentDoctorTimeoutSeconds = params.timeoutSeconds;
    for (const id of Object.keys(currentDoctorTimers)) {
      currentDoctorTimers[id].timeoutSeconds = currentDoctorTimeoutSeconds;
    }
  }

  if (params.doctorStatus === 'available' || params.doctorStatus === 'unavailable') {
    currentDoctorAvailability = params.doctorStatus;
    if (params.doctorStatus === 'unavailable') {
      // Stop any pending wait timers since AI is immediately active
      for (const id of Object.keys(currentDoctorTimers)) {
        currentDoctorTimers[id].isWaiting = false;
        currentDoctorTimers[id].startedAt = undefined;
        currentDoctorTimers[id].expiresAt = undefined;
        currentDoctorTimers[id].aiTakeoverActive = false;
        currentDoctorTimers[id].aiTakeoverReason = undefined;
      }
    } else {
      // Doctor became available: return channel to Doctor Chat
      for (const id of Object.keys(currentDoctorTimers)) {
        currentDoctorTimers[id].isWaiting = false;
        currentDoctorTimers[id].startedAt = undefined;
        currentDoctorTimers[id].expiresAt = undefined;
        currentDoctorTimers[id].aiTakeoverActive = false;
        currentDoctorTimers[id].aiTakeoverReason = undefined;
      }
    }
  }

  return getDoctorAvailabilityConfig();
};

export const getMedicalAssistantContext = (astronautId = 'ASTRO-74-SJ'): MedicalAssistantContext => {
  ensureChannelHistories(astronautId);
  const crewMember = currentCrewMembers.find((c) => c.id === astronautId);
  const isPrimary = !crewMember || crewMember.id === currentAstronautProfile.id;

  const restingBaseline: number | null = isPrimary ? currentAstronautProfile.restingHeartRate : null;

  const hr = isPrimary ? currentVitals.heartRate : (crewMember?.heartRate || currentVitals.heartRate);
  const [bpSysRaw, bpDiaRaw] = isPrimary
    ? [currentVitals.bloodPressureSys, currentVitals.bloodPressureDia]
    : (crewMember?.bloodPressure || '118/76').split('/').map((n) => Number(n));
  const bpSys = bpSysRaw || 118;
  const bpDia = bpDiaRaw || 76;
  const spo2 = isPrimary ? currentVitals.spO2 : (crewMember?.spO2 || currentVitals.spO2);
  const temp = isPrimary ? currentVitals.temperature : (crewMember?.temperature || currentVitals.temperature);
  const rr: number | null = isPrimary ? currentVitals.respiratoryRate : null;
  const sleepHours: number | null = isPrimary ? currentVitals.sleepHours : null;
  const timestamp: string | null = isPrimary ? currentVitals.timestamp : null;
  const lastMeasurementLabel = isPrimary
    ? new Date(currentVitals.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : (crewMember?.lastMeasurementTime || 'Unavailable');

  const vitalEvaluations = evaluateVitalSigns(hr, bpSys, bpDia, spo2, temp, rr, restingBaseline);

  const activeSymptoms: SymptomReport[] = isPrimary
    ? currentSymptoms.filter((s) => s.status !== 'resolved')
    : crewMember?.latestSymptom && crewMember.latestSymptom !== 'None reported'
    ? [
        {
          id: `SYM-${crewMember.id}`,
          bodyPart: crewMember.latestSymptom,
          painType: 'Dull',
          intensity: 0,
          notes: `Logged in crew summary (${crewMember.lastMeasurementTime}); numerical severity score not recorded.`,
          timestamp: new Date().toISOString(),
          status: 'monitoring',
        },
      ]
    : [];

  const activeRestrictions = currentMedicalRestrictions.filter(
    (r) => r.astronautId === (crewMember?.id || currentAstronautProfile.id) && r.status === 'Active'
  );

  const activeChannel = getActiveChannelForAstronaut(astronautId);
  const timerRecord = currentDoctorTimers[astronautId];
  const timerState: DoctorResponseTimerState = {
    isWaiting: Boolean(timerRecord?.isWaiting),
    startedAt: timerRecord?.startedAt,
    expiresAt: timerRecord?.expiresAt,
    timeoutSeconds: currentDoctorTimeoutSeconds,
    aiTakeoverActive: Boolean(timerRecord?.aiTakeoverActive),
    aiTakeoverReason: timerRecord?.aiTakeoverReason,
    aiTakeoverAt: timerRecord?.aiTakeoverAt,
  };

  const emergencySession = currentEmergencySessions[astronautId];
  const emergencyState: EmergencyTriageState | null =
    emergencySession && emergencySession.isActive && !emergencySession.acknowledged
      ? emergencySession
      : null;

  const activeHistory =
    activeChannel === 'doctor'
      ? currentDoctorChannelHistories[astronautId]
      : currentAiChannelHistories[astronautId];

  return {
    astronaut: {
      id: crewMember?.id || currentAstronautProfile.id,
      name: crewMember?.name || currentAstronautProfile.name,
      callsign: crewMember?.callsign || currentAstronautProfile.callsign,
      role: crewMember?.role || currentAstronautProfile.role,
      missionId: crewMember?.missionId || currentAstronautProfile.missionId,
      healthStatus: crewMember?.healthStatus || currentAstronautProfile.healthStatus,
      restingHeartRate: restingBaseline,
      spineElongation: isPrimary
        ? currentAstronautProfile.spineElongation
        : (crewMember?.spineElongation ?? null),
      allergies: isPrimary ? currentAstronautProfile.allergies : [],
      allergiesRecorded: isPrimary,
      conditions: isPrimary
        ? currentAstronautProfile.conditions
        : crewMember?.latestSymptom && crewMember.latestSymptom !== 'None reported'
        ? [crewMember.latestSymptom]
        : [],
    },
    vitalsSnapshot: {
      heartRate: hr,
      bloodPressure: `${bpSys}/${bpDia}`,
      bloodPressureSys: bpSys,
      bloodPressureDia: bpDia,
      spO2: spo2,
      temperature: temp,
      respiratoryRate: rr,
      sleepHours,
      timestamp,
      lastMeasurementLabel,
    },
    vitalEvaluations,
    activeSymptoms,
    activeRestrictions,
    doctorStatus: currentDoctorAvailability,
    timeoutSeconds: currentDoctorTimeoutSeconds,
    activeChannel,
    timerState,
    emergencyState,
    history: activeHistory,
    aiHistoryCount: currentAiChannelHistories[astronautId].length,
    doctorHistoryCount: currentDoctorChannelHistories[astronautId].length,
  };
};

export const addChannelMessage = (
  astronautId: string,
  channel: CommunicationChannel,
  message: Omit<MedicalAssistantMessage, 'id' | 'timestamp' | 'astronautId' | 'channel'>
): MedicalAssistantMessage => {
  ensureChannelHistories(astronautId);

  const newMsg: MedicalAssistantMessage = {
    ...message,
    id: `${channel === 'doctor' ? 'DOC' : 'AI'}-MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    astronautId,
    channel,
    timestamp: new Date().toISOString(),
  };

  if (channel === 'doctor') {
    currentDoctorChannelHistories[astronautId].push(newMsg);
  } else {
    currentAiChannelHistories[astronautId].push(newMsg);
  }
  return newMsg;
};

export const getAuthorizedAiHistory = (astronautId: string): MedicalAssistantMessage[] => {
  ensureChannelHistories(astronautId);
  return currentAiChannelHistories[astronautId];
};

export const getDoctorHistory = (astronautId: string): MedicalAssistantMessage[] => {
  ensureChannelHistories(astronautId);
  return currentDoctorChannelHistories[astronautId];
};

export const clearChannelHistory = (astronautId: string, channel?: CommunicationChannel): MedicalAssistantMessage[] => {
  if (!channel || channel === 'doctor') {
    delete currentDoctorChannelHistories[astronautId];
    if (currentDoctorTimers[astronautId]) {
      currentDoctorTimers[astronautId].isWaiting = false;
      currentDoctorTimers[astronautId].startedAt = undefined;
      currentDoctorTimers[astronautId].expiresAt = undefined;
      currentDoctorTimers[astronautId].aiTakeoverActive = false;
      currentDoctorTimers[astronautId].aiTakeoverReason = undefined;
    }
  }
  if (!channel || channel === 'ai') {
    delete currentAiChannelHistories[astronautId];
  }
  return getMedicalAssistantContext(astronautId).history;
};

export const startOrPreserveDoctorWaitTimer = (
  astronautId: string,
  triggerMessageId: string,
  triggerMessageContent: string
): InternalDoctorTimerRecord => {
  ensureChannelHistories(astronautId);
  const existing = currentDoctorTimers[astronautId];

  // If already waiting on an unanswered doctor message, keep the original SLA deadline so follow-ups don't reset the clock
  if (existing && existing.isWaiting && existing.expiresAt && Date.parse(existing.expiresAt) > Date.now()) {
    existing.triggerMessageId = triggerMessageId;
    existing.triggerMessageContent = triggerMessageContent;
    return existing;
  }

  const startedAtMs = Date.now();
  const durationMs = currentDoctorTimeoutSeconds * 1000;
  const expiresAtMs = startedAtMs + durationMs;

  currentDoctorTimers[astronautId] = {
    isWaiting: true,
    startedAt: new Date(startedAtMs).toISOString(),
    expiresAt: new Date(expiresAtMs).toISOString(),
    timeoutSeconds: currentDoctorTimeoutSeconds,
    aiTakeoverActive: false,
    triggerMessageId,
    triggerMessageContent,
    notifiedTimeoutTakeover: false,
  };

  return currentDoctorTimers[astronautId];
};

export const resetDoctorWaitTimer = (astronautId: string) => {
  ensureChannelHistories(astronautId);
  currentDoctorTimers[astronautId] = {
    isWaiting: false,
    startedAt: undefined,
    expiresAt: undefined,
    timeoutSeconds: currentDoctorTimeoutSeconds,
    aiTakeoverActive: false,
    aiTakeoverReason: undefined,
    aiTakeoverAt: undefined,
    notifiedTimeoutTakeover: false,
  };
};

export const recordSurgeonReplyToDoctorChat = (
  astronautId: string,
  replyText: string,
  surgeonName = 'Dr. Marcus Vance, M.D. (Flight Surgeon)',
  skipCommunicationsMirror = false
): MedicalAssistantMessage => {
  ensureChannelHistories(astronautId);
  resetDoctorWaitTimer(astronautId);

  const surgeonMsg = addChannelMessage(astronautId, 'doctor', {
    sender: 'flight_surgeon',
    senderId: 'user-fs-vance',
    senderName: surgeonName,
    senderRole: 'Lead Flight Surgeon · MEDCOM-1',
    content: replyText.trim(),
    triageLevel: 'low_risk',
  });

  if (!skipCommunicationsMirror) {
    const convId = 'conv-astro-salma';
    const commMsg: MedicalMessage = {
      id: `msg-fs-${Date.now()}`,
      conversationId: convId,
      senderId: 'user-fs-vance',
      senderName: 'Dr. Marcus Vance, M.D. (You)',
      senderRole: 'Lead Flight Surgeon',
      content: replyText.trim(),
      timestamp: surgeonMsg.timestamp,
      isSurgeon: true,
      messageType: 'clinical_directive',
      priority: 'normal',
    };
    if (!currentMessages[convId]) currentMessages[convId] = [];
    currentMessages[convId].push(commMsg);
    const conv = currentConversations.find((c) => c.id === convId);
    if (conv) {
      conv.lastMessage = commMsg.content;
      conv.lastTimestamp = commMsg.timestamp;
    }
  }

  return surgeonMsg;
};

export const activateEmergencySession = (params: {
  astronautId: string;
  alertId: string;
  reason: string;
  instructions: string[];
}): EmergencyTriageState => {
  const { astronautId, alertId, reason, instructions } = params;
  // Emergency overrides wait timer immediately (never wait 2 or 3 hours)
  if (currentDoctorTimers[astronautId]) {
    currentDoctorTimers[astronautId].isWaiting = false;
    currentDoctorTimers[astronautId].startedAt = undefined;
    currentDoctorTimers[astronautId].expiresAt = undefined;
  }

  const session: EmergencyTriageState = {
    isActive: true,
    alertId,
    severity: 'critical',
    reason,
    triggeredAt: new Date().toISOString(),
    instructions,
    acknowledged: false,
  };
  currentEmergencySessions[astronautId] = session;
  return session;
};

export const acknowledgeEmergencySession = (
  astronautId: string,
  surgeonName = 'Dr. Marcus Vance, M.D.'
): EmergencyTriageState | null => {
  const session = currentEmergencySessions[astronautId];
  if (!session) return null;

  session.acknowledged = true;
  session.isActive = false;
  if (session.alertId) {
    acknowledgeAlert(session.alertId, surgeonName);
  }
  return session;
};

export const notifySurgeonOfAiTakeover = (astronautId: string, timeoutSeconds: DoctorTimeoutSeconds, triggerMessage?: string) => {
  const ctx = getMedicalAssistantContext(astronautId);
  const now = new Date().toISOString();
  const label = formatTimeoutDurationText(timeoutSeconds);
  const shortBadge = formatTimeoutShortBadge(timeoutSeconds);
  const noticeContent = `⏱️ [AI TAKEOVER NOTICE — ${shortBadge} SLA EXCEEDED] Flight Surgeon did not respond to ${ctx.astronaut.name} (${ctx.astronaut.callsign}) within ${label}. ASTRA AI Medical Assistant has temporarily taken over to provide initial guidance${triggerMessage ? ` regarding: "${triggerMessage.slice(0, 120)}"` : ''}. Please review AI conversation history when available.`;

  const medTeamMsg: MedicalMessage = {
    id: `msg-takeover-${Date.now()}`,
    conversationId: 'conv-med-team',
    senderId: 'astra-availability-monitor',
    senderName: 'ASTRA Availability Monitor',
    senderRole: 'Automated Flight Medicine SLA Relay',
    content: noticeContent,
    timestamp: now,
    isSurgeon: false,
    messageType: 'telemetry_alert',
    priority: 'priority',
  };

  if (!currentMessages['conv-med-team']) currentMessages['conv-med-team'] = [];
  currentMessages['conv-med-team'].push(medTeamMsg);
  const medTeamConv = currentConversations.find((c) => c.id === 'conv-med-team');
  if (medTeamConv) {
    medTeamConv.lastMessage = medTeamMsg.content;
    medTeamConv.lastTimestamp = now;
    medTeamConv.unreadCount = (medTeamConv.unreadCount || 0) + 1;
  }

  // Also add an alert for the Flight Surgeon so it appears in Medical Alerts
  const alert: MedicalAlert = {
    id: `ALT-TAKEOVER-${Date.now()}`,
    astronautId: ctx.astronaut.id,
    astronautName: ctx.astronaut.name,
    astronautCallsign: ctx.astronaut.callsign,
    photoUrl: ctx.astronaut.id === currentAstronautProfile.id ? currentAstronautProfile.photoUrl : '',
    title: `AI Assistant Takeover (${label} Timeout): ${ctx.astronaut.name}`,
    description: noticeContent,
    severity: 'warning',
    category: 'Biometrics',
    timestamp: now,
    isAcknowledged: false,
    recommendedAction: 'Review saved AI Medical Assistant transcript and respond directly in Doctor Chat.',
  };
  currentMedicalAlerts = [alert, ...currentMedicalAlerts];

  addTimelineEvent({
    type: 'ai_insight',
    title: `AI Temporary Takeover (${ctx.astronaut.callsign})`,
    summary: `Flight Surgeon response timeout (${label}) elapsed. AI Medical Assistant activated.`,
    severity: 'warning',
    badge: 'SLA TAKEOVER',
  });
};

export const detectEmergencyAndConcerningVitals = (
  message: string,
  context: MedicalAssistantContext
): {
  triageLevel: AssistantTriageLevel;
  protocolBasis: string;
  redFlags: string[];
  urgentFlags: string[];
  attentionFlags: string[];
  criticalVitals: VitalSignEvaluation[];
  unusualVitals: VitalSignEvaluation[];
  needsFollowUpQuestions: boolean;
} => {
  const rawLower = message.toLowerCase();
  // Exclude negated symptom clauses (e.g. "without chest pain or shortness of breath", "no fainting")
  // while stopping at punctuation/contrast conjunctions so real symptoms are never masked.
  const lower = rawLower.replace(
    /\b(?:without(?:\s+any)?|no(?:\s+signs?\s+of|\s+symptoms?\s+of|\s+any)?|not\s+(?:having|experiencing|feeling)|don'?t\s+have|do\s+not\s+have|didn'?t|haven'?t\s+had|denies|deny)\s+(?!i\s+(?:have|feel|am)\b)[^.,;!?\n]+?(?=(?:[.,;!?\n]|\b(?:but|however|though|actually|yet|instead)\b|$))/gi,
    ' '
  );

  // Level 4: Potentially life-threatening emergency red flags ONLY
  const emergencyKeywords: Array<{ pattern: RegExp; label: string }> = [
    { pattern: /\b(chest pain|chest tightness|chest pressure|heart attack|crushing pain|angina)\b/i, label: 'Acute chest pain or pressure' },
    { pattern: /\b(shortness of breath|can'?t breathe|cannot breathe|difficulty breathing|trouble breathing|severe breathlessness|suffocat\w*|gasping|hypoxia)\b/i, label: 'Acute respiratory distress / breathing difficulty' },
    { pattern: /\b(severe bleeding|hemorrhage|bleeding heavily|won'?t stop bleeding|coughing blood|vomiting blood)\b/i, label: 'Uncontrolled bleeding / hemorrhage' },
    { pattern: /\b(faint|fainted|fainting|pass(?:ed)? out|unconscious|loss of consciousness|syncope|blackout|blacked out)\b/i, label: 'Syncope or loss of consciousness' },
    { pattern: /\b(slurred speech|acute confusion|severely disoriented|stroke|facial droop|one side weak|weakness on one side|arm numbness.*weak|paralysis|seizure|convulsion)\b/i, label: 'Acute focal neurological deficit or seizure' },
    { pattern: /\b(anaphylaxis|throat swelling|swollen tongue|allergic airway|hives and breathing)\b/i, label: 'Possible anaphylaxis / airway compromise' },
    { pattern: /\b(decompression sickness|the bends|dcs symptoms|severe joint pain.*eva)\b/i, label: 'Suspected decompression sickness (DCS)' },
    { pattern: /\b(sudden vision loss|lost vision|chemical in eye|toxic leak|ammonia exposure|co2 poisoning)\b/i, label: 'Sudden vision loss or toxic cabin exposure' },
    { pattern: /\b(electric shock|electrocution|severe burn|severe head injury|head trauma)\b/i, label: 'Acute major trauma, burn, or electrical injury' },
    { pattern: /\b(unbearable pain|10\/10|9\/10|mayday|medical emergency)\b/i, label: 'Critical acute distress or explicit emergency declaration' },
  ];

  // Level 3: Urgent clinical symptoms requiring prompt medical evaluation (NOT immediately life-threatening)
  const urgentKeywords: Array<{ pattern: RegExp; label: string }> = [
    { pattern: /\b(getting worse|worsening|progressively worse|much worse|rapidly)\b/i, label: 'Progressive worsening of symptoms' },
    { pattern: /\b(can'?t stand|cannot stand|unable to walk|severe dizziness|spinning vertigo|room spinning)\b/i, label: 'Severe balance impairment or vertigo' },
    { pattern: /\b(persistent vomiting|keep fluids down|vomiting repeatedly)\b/i, label: 'Persistent vomiting / dehydration risk' },
    { pattern: /\b(high fever|fever.*chills|rigors|7\/10|8\/10|severe headache|severe pain|radiating pain)\b/i, label: 'High pain severity (7-8/10) or systemic fever' },
    { pattern: /\b(near[- ]fainting|almost passed out|presyncope|palpitations.*dizzy|blurred vision)\b/i, label: 'Presyncope, visual disturbance, or symptomatic palpitations' },
  ];

  // Level 2: Persistent, moderate, or multi-symptom patterns requiring Flight Surgeon medical review
  const persistenceOrModerateMarkers: Array<{ pattern: RegExp; label: string }> = [
    { pattern: /\b(persistent|keeps coming back|won'?t go away|for days|several days|past few days|all day|since yesterday|more than 24|chronic|waking me up)\b/i, label: 'Persistent or prolonged symptom duration' },
    { pattern: /\b(moderate|4\/10|5\/10|6\/10)\b/i, label: 'Moderate symptom intensity (4-6/10)' },
    { pattern: /\b(lumbar|spine|spinal|lower back)\b/i, label: 'Symptom involving monitored lumbar spinal adaptation' },
  ];

  // Count distinct mild/non-emergency symptoms mentioned
  const mildSymptomClusters: Array<{ pattern: RegExp; label: string }> = [
    { pattern: /\b(dizzy|dizziness|lightheaded|light-headed)\b/i, label: 'dizziness/lightheadedness' },
    { pattern: /\b(fatigue|tired|exhausted|low energy|lethargy|sleepy)\b/i, label: 'fatigue' },
    { pattern: /\b(concentrat\w*|focus\w*|brain fog|memory|attention)\b/i, label: 'difficulty concentrating' },
    { pattern: /\b(headache|sinus|pressure in head)\b/i, label: 'headache/sinus fullness' },
    { pattern: /\b(nausea|queasy|upset stomach)\b/i, label: 'mild nausea' },
    { pattern: /\b(ache|sore|soreness|stiff|stiffness|pain|discomfort)\b/i, label: 'localized discomfort' },
  ];

  const redFlags = emergencyKeywords.filter((i) => i.pattern.test(lower)).map((i) => i.label);
  const urgentFlags = urgentKeywords.filter((i) => i.pattern.test(lower)).map((i) => i.label);
  const attentionMarkers = persistenceOrModerateMarkers.filter((i) => i.pattern.test(lower)).map((i) => i.label);
  const detectedMildClusters = mildSymptomClusters.filter((i) => i.pattern.test(lower)).map((i) => i.label);

  const criticalVitals = context.vitalEvaluations.filter((v) => v.status === 'critical');
  const unusualVitals = context.vitalEvaluations.filter((v) => v.status === 'unusual');

  // Check if severity, onset, or duration is missing/unclear in the astronaut message
  const hasDurationInfo = /\b(hour|hours|hr|hrs|minute|minutes|min|day|days|since|started|today|yesterday|week|just now|ago)\b/i.test(lower);
  const hasSeverityInfo = /\b(mild|slight|minor|moderate|severe|intense|\/10|little|bit)\b/i.test(lower);
  const needsFollowUpQuestions = !hasDurationInfo || !hasSeverityInfo || detectedMildClusters.length >= 2;

  const attentionFlags: string[] = [...attentionMarkers];
  if (detectedMildClusters.length >= 2) {
    attentionFlags.push(`Combined symptoms reported (${detectedMildClusters.join(', ')})`);
  }
  if (unusualVitals.length > 0 && detectedMildClusters.length > 0) {
    attentionFlags.push(`Concurrent vital deviation (${unusualVitals.map((v) => `${v.label} ${v.value}${v.unit}`).join(', ')})`);
  }

  let triageLevel: AssistantTriageLevel = 'low_risk';
  let protocolBasis = 'ASTRA Mission Triage Protocol — Level 1 (Low Risk): Mild or isolated query without warning signs.';

  if (redFlags.length > 0 || criticalVitals.length > 0) {
    triageLevel = 'emergency';
    protocolBasis = 'ASTRA Mission Triage Protocol — Level 4 (Emergency): Critical warning signs or critical vital thresholds require immediate escalation.';
  } else if (
    urgentFlags.length > 0 ||
    (unusualVitals.length >= 2 && detectedMildClusters.length >= 1)
  ) {
    triageLevel = 'urgent';
    protocolBasis = 'ASTRA Mission Triage Protocol — Level 3 (Urgent): Concerning symptom progression or systemic severity requires prompt medical team evaluation.';
  } else if (
    attentionFlags.length > 0 ||
    unusualVitals.length > 0 && detectedMildClusters.length > 0
  ) {
    triageLevel = 'attention_required';
    protocolBasis = 'ASTRA Mission Triage Protocol — Level 2 (Attention Required): Persistent, multi-symptom, or baseline-deviating presentation requiring Flight Surgeon review.';
  }

  return {
    triageLevel,
    protocolBasis,
    redFlags,
    urgentFlags,
    attentionFlags,
    criticalVitals,
    unusualVitals,
    needsFollowUpQuestions,
  };
};

export const escalateMedicalIssueToTeam = (params: {
  context: MedicalAssistantContext;
  triageLevel: AssistantTriageLevel;
  reasonSummary: string;
  reportedSymptomText: string;
}): MedicalAlert => {
  const { context, triageLevel, reasonSummary, reportedSymptomText } = params;
  const isEmergency = triageLevel === 'emergency';
  const isUrgent = triageLevel === 'urgent';

  const rrText = context.vitalsSnapshot.respiratoryRate !== null
    ? `${context.vitalsSnapshot.respiratoryRate}/min`
    : 'Not recorded';

  const newAlert: MedicalAlert = {
    id: `ALT-AI-${Date.now()}`,
    astronautId: context.astronaut.id,
    astronautName: context.astronaut.name,
    astronautCallsign: context.astronaut.callsign,
    photoUrl: context.astronaut.id === currentAstronautProfile.id ? currentAstronautProfile.photoUrl : '',
    title: isEmergency
      ? `EMERGENCY ESCALATION: ${context.astronaut.name} (${reasonSummary})`
      : isUrgent
      ? `URGENT EVALUATION: ${context.astronaut.name} (${reasonSummary})`
      : `Medical Review Requested: ${context.astronaut.name} (${reasonSummary})`,
    description: `Classified as ${triageLevel.replace('_', ' ').toUpperCase()} via ASTRA Triage Protocol. Astronaut report: "${reportedSymptomText.slice(0, 180)}". Recorded vitals: HR ${context.vitalsSnapshot.heartRate} bpm, BP ${context.vitalsSnapshot.bloodPressure} mmHg, SpO2 ${context.vitalsSnapshot.spO2}%, Temp ${context.vitalsSnapshot.temperature}°C, RR ${rrText}.`,
    severity: isEmergency ? 'critical' : isUrgent ? 'warning' : 'info',
    category: 'Biometrics',
    timestamp: new Date().toISOString(),
    isAcknowledged: false,
    recommendedAction: isEmergency
      ? 'IMMEDIATE FLIGHT SURGEON INTERVENTION REQUIRED. Establish live voice/video medical loop, verify ECLSS O2 levels, and initiate orbital emergency medical kit protocol.'
      : isUrgent
      ? 'Prompt Medical Team evaluation recommended. Contact astronaut via Doctor Chat to assess symptom progression and perform clinical exam.'
      : 'Flight Surgeon medical review requested. Assess follow-up responses, hydration/sleep context, and symptom trajectory.',
  };

  currentMedicalAlerts = [newAlert, ...currentMedicalAlerts];

  if (isEmergency) {
    const member = currentCrewMembers.find((c) => c.id === context.astronaut.id);
    if (member) {
      member.healthStatus = 'critical';
      member.latestSymptom = reasonSummary;
      member.lastMeasurementTime = 'Just now (EMERGENCY)';
    }
  } else if (isUrgent) {
    const member = currentCrewMembers.find((c) => c.id === context.astronaut.id);
    if (member && member.healthStatus === 'nominal') {
      member.healthStatus = 'monitoring';
      member.latestSymptom = reasonSummary;
      member.lastMeasurementTime = 'Just now (URGENT REVIEW)';
    }
  }

  const teamMsg: MedicalMessage = {
    id: `msg-esc-${Date.now()}`,
    conversationId: 'conv-med-team',
    senderId: 'astra-ai-triage',
    senderName: isEmergency ? 'ASTRA Emergency Triage Relay' : 'ASTRA Triage Notification Relay',
    senderRole: 'Automated Orbital Medical Relay',
    content: `${
      isEmergency
        ? '🚨 [LEVEL 4 — EMERGENCY]'
        : isUrgent
        ? '⚠️ [LEVEL 3 — URGENT EVALUATION]'
        : '📋 [LEVEL 2 — ATTENTION REQUIRED / REVIEW REQUEST]'
    } ${context.astronaut.name} (${context.astronaut.callsign}): ${reasonSummary}. Reported: "${reportedSymptomText.slice(0, 140)}". Vitals: HR ${context.vitalsSnapshot.heartRate} bpm | BP ${context.vitalsSnapshot.bloodPressure} | SpO2 ${context.vitalsSnapshot.spO2}% | Temp ${context.vitalsSnapshot.temperature}°C | RR ${rrText}.`,
    timestamp: new Date().toISOString(),
    isSurgeon: false,
    messageType: 'telemetry_alert',
    priority: isEmergency ? 'urgent' : isUrgent ? 'priority' : 'normal',
  };

  if (!currentMessages['conv-med-team']) currentMessages['conv-med-team'] = [];
  currentMessages['conv-med-team'].push(teamMsg);
  const medTeamConv = currentConversations.find((c) => c.id === 'conv-med-team');
  if (medTeamConv) {
    medTeamConv.lastMessage = teamMsg.content;
    medTeamConv.lastTimestamp = teamMsg.timestamp;
    medTeamConv.unreadCount = (medTeamConv.unreadCount || 0) + 1;
  }

  addTimelineEvent({
    type: 'ai_insight',
    title: isEmergency
      ? `Emergency Escalation Triggered (${context.astronaut.callsign})`
      : isUrgent
      ? `Urgent Medical Evaluation Requested (${context.astronaut.callsign})`
      : `Medical Review Requested (${context.astronaut.callsign})`,
    summary: `${reasonSummary} — ${
      isEmergency ? 'Immediate Emergency Alert dispatched.' : isUrgent ? 'Escalated to Medical Team.' : 'Flight Surgeon notified for review.'
    }`,
    severity: isEmergency ? 'alert' : isUrgent ? 'warning' : 'info',
    badge: isEmergency ? 'EMERGENCY' : isUrgent ? 'URGENT' : 'REVIEW REQ',
  });

  return newAlert;
};

export const postAstronautDirectToSurgeon = (astronautId: string, content: string): MedicalMessage => {
  const ctx = getMedicalAssistantContext(astronautId);
  const targetConvId = 'conv-astro-salma';

  const msg: MedicalMessage = {
    id: `msg-astro-${Date.now()}`,
    conversationId: targetConvId,
    senderId: ctx.astronaut.id,
    senderName: ctx.astronaut.name,
    senderRole: ctx.astronaut.role,
    content: content.trim(),
    timestamp: new Date().toISOString(),
    isSurgeon: false,
    messageType: 'routine',
    priority: 'normal',
  };

  if (!currentMessages[targetConvId]) currentMessages[targetConvId] = [];
  currentMessages[targetConvId].push(msg);

  const conv = currentConversations.find((c) => c.id === targetConvId);
  if (conv) {
    conv.lastMessage = msg.content;
    conv.lastTimestamp = msg.timestamp;
    conv.unreadCount = (conv.unreadCount || 0) + 1;
  }

  return msg;
};



