import type { 
  AstronautProfile, 
  UpdateProfileInput, 
  VitalsData, 
  SymptomReport, 
  DailyCheckIn, 
  TimelineEvent,
  SpaceExercise,
  ExerciseCategory,
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
  {
    id: 'ex-ared-trunk-rotation',
    name: 'ARED Trunk Rotation',
    description: 'Resisted rotational movement for oblique strengthening and spinal disc hydration cycling.',
    category: 'Core',
    equipment: 'ARED',
    durationMinutes: 10,
    caloriesBurned: 70,
    targetMuscles: ['External Obliques', 'Internal Obliques', 'Erector Spinae'],
    contraindications: ['Spinal Elongation', 'Lumbar Disc Herniation', 'Cervical Disc Decompression'],
    videoUrl: '/videos/ared-trunk-rotation.mp4',
    thumbnailUrl: '/videos/thumbnails/ared-trunk-rotation.jpg',
    intensity: 'Moderate',
    status: 'available',
  },
  {
    id: 'ex-bungee-crunch',
    name: 'Bungee-Cord Crunch',
    description: 'Abdominal crunch using bungee cord resistance to simulate gravitational loading on rectus abdominis.',
    category: 'Core',
    equipment: 'Bungee Cord System',
    durationMinutes: 10,
    caloriesBurned: 65,
    targetMuscles: ['Rectus Abdominis', 'Hip Flexors'],
    contraindications: ['Cephalic Fluid Shift', 'Intracranial Pressure Elevation'],
    videoUrl: '/videos/bungee-crunch.mp4',
    thumbnailUrl: '/videos/thumbnails/bungee-crunch.jpg',
    intensity: 'Low',
    status: 'available',
  },

  // ── Full Body ──
  {
    id: 'ex-cevis-cycling',
    name: 'CEVIS Ergometer Cycling',
    description: 'Continuous aerobic cycling on the Cycle Ergometer with Vibration Isolation System for cardiovascular conditioning.',
    category: 'Full Body',
    equipment: 'CEVIS',
    durationMinutes: 30,
    caloriesBurned: 250,
    targetMuscles: ['Quadriceps', 'Hamstrings', 'Gastrocnemius', 'Cardiovascular System'],
    contraindications: ['Cardiac Arrhythmia', 'Orthostatic Intolerance'],
    videoUrl: '/videos/cevis-cycling.mp4',
    thumbnailUrl: '/videos/thumbnails/cevis-cycling.jpg',
    intensity: 'Moderate',
    status: 'available',
  },
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
    if (ex.id === 'ex-cevis-cycling' || ex.id === 'ex-core-stabilization' || ex.id === 'ex-ared-heel-raise') {
      return { ...ex, status: 'recommended' as const };
    }

    return { ...ex };
  });

  return { exercises, restricted };
};

// ─── Flight Surgeon Crew Registry ───────────────────────────────────────────

export let currentCrewMembers: CrewMemberSummary[] = [
  {
    id: 'ASTRO-74-SJ',
    name: 'Dr. Salma Johnson',
    callsign: 'Nova',
    role: 'Mission Specialist / Payload Bio-Engineer',
    missionId: 'EXP-74 / ARTEMIS BIO-LAB',
    photoUrl: '/src/assets/images/astronaut_salma_portrait_1794328380973.jpg',
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

  return newMsg;
};

// ─── Medical Alerts Store ───────────────────────────────────────────────────

export let currentMedicalAlerts: MedicalAlert[] = [
  {
    id: 'ALT-01',
    astronautId: 'ASTRO-74-SJ',
    astronautName: 'Dr. Salma Johnson',
    astronautCallsign: 'Nova',
    photoUrl: '/src/assets/images/astronaut_salma_portrait_1794328380973.jpg',
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
    photoUrl: '/src/assets/images/astronaut_salma_portrait_1794328380973.jpg',
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
    photoUrl: '/src/assets/images/astronaut_salma_portrait_1794328380973.jpg',
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
    photoUrl: '/src/assets/images/astronaut_salma_portrait_1794328380973.jpg',
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
  }
  return alert || null;
};

export const resolveAlert = (id: string): boolean => {
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


