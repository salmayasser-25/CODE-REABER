import { z } from 'zod';

export const FlightSurgeonSchema = z.object({
  name: z.string().min(2, 'Surgeon name is required'),
  credentialId: z.string().min(2, 'Credential ID is required'),
  certificationStatus: z.string().min(2, 'Certification status is required'),
  callsignOrFreq: z.string().optional(),
  contactDirective: z.string().optional(),
});

export const AstronautProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2, 'Full name is required'),
  callsign: z.string().min(1, 'Callsign is required'),
  age: z.number().int().min(18).max(90),
  role: z.string().min(2, 'Mission role is required'),
  missionId: z.string().min(2, 'Mission ID is required'),
  healthStatus: z.enum(['nominal', 'monitoring', 'critical']),
  photoUrl: z.string(),
  totalEvaHours: z.number().min(0),
  bloodType: z.string().min(1, 'Blood type is required'),
  spineElongation: z.number().min(0).max(15), // Spine elongation delta in cm
  allergies: z.array(z.string()),
  conditions: z.array(z.string()),
  assignedSurgeon: FlightSurgeonSchema,
  heightCm: z.number().min(100).max(250),
  weightKg: z.number().min(30).max(200),
  restingHeartRate: z.number().min(30).max(180),
  spO2Baseline: z.number().min(80).max(100),
  radiationDoseMsv: z.number().min(0),
  missionElapsedDays: z.number().min(0),
  updatedAt: z.string().optional(),
});

export type FlightSurgeon = z.infer<typeof FlightSurgeonSchema>;
export type AstronautProfile = z.infer<typeof AstronautProfileSchema>;

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  callsign: z.string().min(1).optional(),
  age: z.number().int().min(18).max(90).optional(),
  role: z.string().min(2).optional(),
  missionId: z.string().min(2).optional(),
  healthStatus: z.enum(['nominal', 'monitoring', 'critical']).optional(),
  photoUrl: z.string().optional(),
  totalEvaHours: z.number().min(0).optional(),
  bloodType: z.string().min(1).optional(),
  spineElongation: z.number().min(0).max(15).optional(),
  allergies: z.array(z.string()).optional(),
  conditions: z.array(z.string()).optional(),
  assignedSurgeon: FlightSurgeonSchema.partial().optional(),
  heightCm: z.number().min(100).max(250).optional(),
  weightKg: z.number().min(30).max(200).optional(),
  restingHeartRate: z.number().min(30).max(180).optional(),
  spO2Baseline: z.number().min(80).max(100).optional(),
  radiationDoseMsv: z.number().min(0).optional(),
  missionElapsedDays: z.number().min(0).optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

export interface HistoricalHeartRatePoint {
  date: string;
  dayLabel: string;
  hr: number;
  baseline: number;
  min: number;
  max: number;
}

export interface VitalsData {
  heartRate: number; // bpm
  bloodPressureSys: number; // mmHg
  bloodPressureDia: number; // mmHg
  spO2: number; // %
  temperature: number; // °C
  respiratoryRate: number; // breaths/min
  sleepHours: number; // hours
  weightKg?: number; // kg
  hrvMs: number; // Heart Rate Variability (ms)
  timestamp: string;
  historicalHeartRate: HistoricalHeartRatePoint[];
}

export interface SymptomReport {
  id: string;
  bodyPart: string;
  meshId?: string;
  painType: 'Sharp' | 'Dull' | 'Burning';
  intensity: number; // 0 - 10
  notes: string;
  timestamp: string;
  status: 'active' | 'monitoring' | 'resolved';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface DailyCheckIn {
  id: string;
  astronautId: string;
  missionDay: number;
  mood: 'Nominal / Focused' | 'Mild Fatigue' | 'High Stress' | 'Homesick' | 'Optimistic';
  energyLevel: number; // 1 - 10
  sleepQuality: 'Deep & Restorative' | 'Fragmented' | 'Restless / MicroG Noise' | 'Insomnia';
  sleepHours: number;
  hydrationLiters: number;
  spaceAdaptationSymptoms: string[];
  notes: string;
  timestamp: string;
}

export type ExerciseCategory = 'Upper Body' | 'Lower Body' | 'Core' | 'Full Body';
export type ExerciseStatus = 'available' | 'restricted' | 'recommended';

export interface SpaceExercise {
  id: string;
  name: string;
  description: string;
  category: ExerciseCategory;
  equipment: string; // e.g. 'ARED', 'CEVIS', 'T2 Treadmill', 'COLBERT', 'Resistance Bands'
  durationMinutes: number;
  caloriesBurned: number;
  targetMuscles: string[];
  contraindications: string[]; // conditions that make this exercise restricted
  videoUrl: string; // path to local video in public/videos/
  thumbnailUrl: string; // path to thumbnail
  intensity: 'Low' | 'Moderate' | 'High';
  status: ExerciseStatus;
  warningMessage?: string; // shown when restricted
  restrictionReason?: string;
}

export interface FitnessAIAnalysis {
  overallAssessment: string;
  recommendedExercises: string[]; // exercise IDs
  restrictedExercises: { exerciseId: string; reason: string }[];
  dailyPlan: string;
  cautions: string[];
  fitnessScore?: number;
  recommendations?: string[];
  timestamp: string;
}

export type TimelineEventType = 'vitals' | 'symptom' | 'ai_insight' | 'checkin' | 'exercise_eva' | 'restriction' | 'doctor_note';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  summary: string;
  details?: Record<string, any>;
  timestamp: string;
  severity?: 'nominal' | 'warning' | 'alert' | 'info';
  badge?: string;
}

export interface MedicalRestriction {
  id: string;
  astronautId: string;
  astronautName: string;
  name: string;
  description: string;
  affectedRegion: string;
  restrictedExercises: string[];
  severity: 'High' | 'Moderate' | 'Low';
  effectiveDate: string;
  status: 'Active' | 'Under Review' | 'Lifted';
  prescribedBy: string;
  clinicalRationale: string;
}

export interface DoctorNote {
  id: string;
  astronautId: string;
  astronautName: string;
  timestamp: string;
  author: string;
  category: 'Routine Assessment' | 'Adaptation Review' | 'Countermeasure Directive' | 'Pre-EVA Medical Clearance' | 'Clinical Anomaly';
  title: string;
  content: string;
  relatedSymptoms?: string[];
  vitalsSnapshot?: { hr: number; bp: string; spo2: number; temp: number };
  status: 'Finalized' | 'Addendum Added' | 'Draft';
}

export interface MedicalTeamMember {
  id: string;
  name: string;
  role: string;
  location: string;
  avatar?: string;
  callsign?: string;
  status: 'online' | 'busy' | 'orbital_pass' | 'standby';
  frequency?: string;
}

export interface MedicalMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  isSurgeon: boolean;
  messageType?: 'clinical_directive' | 'telemetry_alert' | 'routine' | 'clearance';
  priority?: 'normal' | 'urgent' | 'priority';
}

export interface MedicalConversation {
  id: string;
  title: string;
  isGroup: boolean;
  description?: string;
  participants: MedicalTeamMember[];
  lastMessage?: string;
  lastTimestamp?: string;
  unreadCount: number;
  channelFrequency?: string;
}

export interface CrewMemberSummary {
  id: string;
  name: string;
  callsign: string;
  role: string;
  missionId: string;
  photoUrl: string;
  healthStatus: 'nominal' | 'monitoring' | 'critical';
  heartRate: number;
  bloodPressure: string;
  spO2: number;
  temperature: number;
  latestSymptom?: string;
  activeRestrictionsCount: number;
  lastMeasurementTime: string;
  bloodType: string;
  spineElongation: number;
  evaHours: number;
}

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface MedicalAlert {
  id: string;
  astronautId: string;
  astronautName: string;
  astronautCallsign: string;
  photoUrl?: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  category: 'Biometrics' | 'Spinal Adaptation' | 'Symptom' | 'Restriction' | 'Sleep & Recovery';
  timestamp: string;
  isAcknowledged: boolean;
  reviewedBy?: string;
  recommendedAction: string;
}

export interface ReportReviewResponse {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: string;
  timestamp: string;
  action: 'endorsed' | 'countermeasure_requested' | 'forwarded' | 'cleared';
  feedbackNotes: string;
  recommendedModifications?: string[];
  signatureCredential: string;
}

export interface ExchangedReportAttachment {
  name: string;
  sizeKb: number;
  type: 'pdf' | 'ultrasound_dicom' | 'telemetry_csv' | 'scan_img';
}

export interface ForwardHistoryEntry {
  fromDoctor: string;
  toDoctor: string;
  reason: string;
  timestamp: string;
}

export interface ExchangedMedicalReport {
  id: string;
  reportNumber: string;
  title: string;
  documentType: 'Clinical Specialist Referral' | 'Spine Ultrasonic Analysis' | 'Cardiovascular Stress Panel' | 'Pre-EVA Mission Clearance' | 'Microgravity Adaptation Audit' | 'Blood Biomarker Lab';
  astronautId: string;
  astronautName: string;
  astronautCallsign: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  recipientDoctorId: string;
  recipientDoctorName: string;
  recipientDoctorRole: string;
  urgency: 'routine' | 'urgent' | 'critical_stat';
  status: 'draft' | 'transmitted' | 'under_review' | 'reviewed' | 'forwarded';
  createdAt: string;
  transmissionTimestamp: string;
  clinicalSummary: string;
  findings: string[];
  referralQuestion: string;
  vitalsSnapshot?: {
    hr: number;
    bp: string;
    spo2: number;
    temp: number;
    spineDelta?: string;
  };
  attachments?: ExchangedReportAttachment[];
  reviews: ReportReviewResponse[];
  forwardHistory?: ForwardHistoryEntry[];
}

export type DoctorAvailabilityStatus = 'available' | 'unavailable';
export type AssistantTriageLevel = 'low_risk' | 'attention_required' | 'urgent' | 'emergency';
export type VitalThresholdStatus = 'normal' | 'unusual' | 'critical' | 'unavailable';
export type CommunicationChannel = 'doctor' | 'ai';
export type DoctorTimeoutSeconds = 15 | 7200 | 10800;

export interface VitalSignEvaluation {
  key: 'hr' | 'bp' | 'spo2' | 'temp' | 'rr';
  label: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: VitalThresholdStatus;
  note: string;
}

export interface MedicalAssistantMessage {
  id: string;
  astronautId: string;
  channel: CommunicationChannel;
  sender: 'astronaut' | 'ai_assistant' | 'flight_surgeon' | 'system';
  senderId: string;
  senderName: string;
  senderRole?: string;
  content: string;
  timestamp: string;
  triageLevel?: AssistantTriageLevel;
  protocolBasis?: string;
  verifiedRecordsUsed?: string[];
  vitalsSnapshot?: {
    heartRate: number;
    bloodPressure: string;
    spO2: number;
    temperature: number;
    respiratoryRate: number | null;
    sleepHours: number | null;
    timestamp: string | null;
  };
  vitalObservations?: string[];
  followUpQuestions?: string[];
  firstAidSteps?: string[];
  emergencyInstructions?: string[];
  escalationTriggered?: boolean;
  escalatedAlertId?: string;
  disclaimer?: string;
  source?: string;
}

export interface DoctorResponseTimerState {
  isWaiting: boolean;
  startedAt?: string;
  expiresAt?: string;
  timeoutSeconds: DoctorTimeoutSeconds;
  aiTakeoverActive: boolean;
  aiTakeoverReason?: string;
  aiTakeoverAt?: string;
}

export interface EmergencyTriageState {
  isActive: boolean;
  alertId: string;
  severity: 'critical';
  reason: string;
  triggeredAt: string;
  instructions: string[];
  acknowledged: boolean;
}

export interface MedicalAssistantContext {
  astronaut: {
    id: string;
    name: string;
    callsign: string;
    role: string;
    missionId: string;
    healthStatus: 'nominal' | 'monitoring' | 'critical';
    restingHeartRate: number | null;
    spineElongation: number | null;
    allergies: string[];
    allergiesRecorded: boolean;
    conditions: string[];
  };
  vitalsSnapshot: {
    heartRate: number;
    bloodPressure: string;
    bloodPressureSys: number;
    bloodPressureDia: number;
    spO2: number;
    temperature: number;
    respiratoryRate: number | null;
    sleepHours: number | null;
    timestamp: string | null;
    lastMeasurementLabel: string;
  };
  vitalEvaluations: VitalSignEvaluation[];
  activeSymptoms: SymptomReport[];
  activeRestrictions: MedicalRestriction[];
  doctorStatus: DoctorAvailabilityStatus;
  timeoutSeconds: DoctorTimeoutSeconds;
  activeChannel: CommunicationChannel;
  timerState: DoctorResponseTimerState;
  emergencyState: EmergencyTriageState | null;
  history: MedicalAssistantMessage[];
  aiHistoryCount: number;
  doctorHistoryCount: number;
}





