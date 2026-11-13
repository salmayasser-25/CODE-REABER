import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import Groq from 'groq-sdk';
import { UpdateProfileSchema } from './src/types/astronaut.ts';
import type {
  ExerciseCategory,
  FitnessAIAnalysis,
  MedicalAssistantContext,
  AssistantTriageLevel,
} from './src/types/astronaut.ts';
import { 
  getProfile, 
  updateProfile,
  getVitals,
  updateVitals,
  logDailyVitals,
  getSymptoms,
  addSymptom,
  deleteSymptom,
  getCheckIns,
  addCheckIn,
  getTimelineEvents,
  getExercises,
  getExercisesByCategory,
  evaluateExercisesForAstronaut,
  getCrewMembers,
  getRestrictions,
  addRestriction,
  updateRestriction,
  deleteRestriction,
  getDoctorNotes,
  addDoctorNote,
  updateDoctorNote,
  getConversations,
  getMessages,
  sendMedicalMessage,
  getMedicalAlerts,
  acknowledgeAlert,
  resolveAlert,
  getExchangedReports,
  getExchangedReportById,
  createExchangedReport,
  reviewExchangedReport,
  forwardExchangedReport,
  deleteExchangedReport,
  getMedicalAssistantContext,
  getActiveChannelForAstronaut,
  getDoctorAvailabilityConfig,
  setDoctorAvailabilityConfig,
  addChannelMessage,
  getAuthorizedAiHistory,
  getDoctorHistory,
  clearChannelHistory,
  startOrPreserveDoctorWaitTimer,
  recordSurgeonReplyToDoctorChat,
  activateEmergencySession,
  acknowledgeEmergencySession,
  notifySurgeonOfAiTakeover,
  formatTimeoutDurationText,
  currentDoctorTimers,
  currentDoctorAvailability,
  detectEmergencyAndConcerningVitals,
  escalateMedicalIssueToTeam,
  postAstronautDirectToSurgeon,
} from './src/server/mockDb.ts';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

// Initialize Groq AI Client (Primary fast & generous chat provider)
let cachedGroqModel: string | null = null;
let lastGroqModelCheck = 0;

function getGroqClient(): Groq | null {
  const key = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || '';
  if (!key) return null;
  return new Groq({ apiKey: key });
}

async function resolveGroqModel(groq: Groq): Promise<string> {
  const now = Date.now();
  if (cachedGroqModel && now - lastGroqModelCheck < 1000 * 60 * 30) {
    return cachedGroqModel;
  }
  try {
    const list = await groq.models.list();
    const availableIds = list.data.map((m: any) => m.id);
    const candidatePreferences = [
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'qwen/qwen3.8-27b',
      'openai/gpt-oss-20b',
      'openai/gpt-oss-120b',
      'allam-2-7b',
    ];
    const match = candidatePreferences.find((id) => availableIds.includes(id));
    if (match) {
      cachedGroqModel = match;
      lastGroqModelCheck = now;
      return match;
    }
    const fallbackTextModel = availableIds.find((id) => !id.includes('whisper') && !id.includes('guard'));
    if (fallbackTextModel) {
      cachedGroqModel = fallbackTextModel;
      lastGroqModelCheck = now;
      return fallbackTextModel;
    }
  } catch (err: any) {
    console.warn('[Groq Model Discovery Warning]:', err?.message);
  }
  return 'qwen/qwen3.8-27b';
}


// Initialize Gemini SDK with User-Agent header telemetry
function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
  if (!key) return null;
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}



// Support JSON payloads including base64 image previews
app.use(express.json({ limit: '15mb' }));

// Serve 3D GLB model assets statically
app.use('/models', express.static('public/models', {
  setHeaders: (res, path) => {
    if (path.endsWith('.glb')) {
      res.setHeader('Content-Type', 'model/gltf-binary');
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  }
}));

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    system: 'ASTROCARE Health Intelligence Core',
    groqEnabled: Boolean(getGroqClient()),
    openRouterEnabled: Boolean(process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY),
    geminiEnabled: Boolean(getGeminiClient()),
    timestamp: new Date().toISOString(),
  });
});



// GET /api/profile — Fetch astronaut profile
app.get('/api/profile', (_req: Request, res: Response) => {
  try {
    const profile = getProfile();
    res.json({ success: true, data: profile });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to fetch astronaut profile' });
  }
});

// PATCH /api/profile — Update astronaut profile with Zod validation
app.patch('/api/profile', (req: Request, res: Response) => {
  try {
    const parseResult = UpdateProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: parseResult.error.flatten(),
      });
    }

    const updated = updateProfile(parseResult.data);
    res.json({ success: true, data: updated, message: 'Astronaut dossier successfully updated' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to update astronaut profile' });
  }
});

// POST /api/profile/reset — Reset back to default Dr. Salma Johnson mock state
app.post('/api/profile/reset', (_req: Request, res: Response) => {
  try {
    const resetProfile = updateProfile({
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
    });
    res.json({ success: true, data: resetProfile, message: 'Profile reset to flight baseline' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to reset profile' });
  }
});

// GET /api/vitals — Fetch real-time vitals and historical telemetry
app.get('/api/vitals', (_req: Request, res: Response) => {
  try {
    const vitals = getVitals();
    res.json({ success: true, data: vitals });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to fetch vitals' });
  }
});

// PATCH /api/vitals — Update vitals
app.patch('/api/vitals', (req: Request, res: Response) => {
  try {
    const updated = updateVitals(req.body);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to update vitals' });
  }
});

// POST /api/vitals/log — Log daily vitals from modal form
app.post('/api/vitals/log', (req: Request, res: Response) => {
  try {
    const { heartRate, bloodPressureSys, bloodPressureDia, spO2, temperature, sleepHours, weightKg } = req.body;
    if (heartRate === undefined || bloodPressureSys === undefined || bloodPressureDia === undefined || spO2 === undefined || temperature === undefined || sleepHours === undefined) {
      return res.status(400).json({ success: false, error: 'All core vital signs (HR, BP, SpO2, Temp, Sleep) are required.' });
    }

    const updated = logDailyVitals({
      heartRate: Number(heartRate),
      bloodPressureSys: Number(bloodPressureSys),
      bloodPressureDia: Number(bloodPressureDia),
      spO2: Number(spO2),
      temperature: Number(temperature),
      sleepHours: Number(sleepHours),
      weightKg: weightKg ? Number(weightKg) : undefined,
    });

    res.status(201).json({
      success: true,
      data: updated,
      message: 'Daily vital signs successfully logged to Ground Telemetry & Timeline',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to log daily vitals' });
  }
});

// GET /api/checkins — Fetch daily health check-in entries
app.get('/api/checkins', (_req: Request, res: Response) => {
  try {
    const checkIns = getCheckIns();
    res.json({ success: true, data: checkIns });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to fetch check-ins' });
  }
});

// POST /api/checkin — Submit a daily health check-in
app.post('/api/checkin', (req: Request, res: Response) => {
  try {
    const { astronautId, missionDay, mood, energyLevel, sleepQuality, sleepHours, hydrationLiters, spaceAdaptationSymptoms, notes } = req.body;
    if (!mood || energyLevel === undefined || !sleepQuality) {
      return res.status(400).json({ success: false, error: 'Mood, Energy Level, and Sleep Quality are required.' });
    }

    const newCheckIn = addCheckIn({
      astronautId: astronautId || 'ASTRO-74-SJ',
      missionDay: Number(missionDay) || 84,
      mood,
      energyLevel: Number(energyLevel),
      sleepQuality,
      sleepHours: Number(sleepHours) || 6,
      hydrationLiters: Number(hydrationLiters) || 2.0,
      spaceAdaptationSymptoms: Array.isArray(spaceAdaptationSymptoms) ? spaceAdaptationSymptoms : [],
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      data: newCheckIn,
      message: 'Daily health check-in logged and synchronized with Ground Control',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to log check-in' });
  }
});

// GET /api/timeline — Fetch unified medical and telemetry timeline
app.get('/api/timeline', (_req: Request, res: Response) => {
  try {
    const events = getTimelineEvents();
    res.json({ success: true, data: events });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to fetch timeline events' });
  }
});

// GET /api/symptoms — Fetch logged symptoms
app.get('/api/symptoms', (_req: Request, res: Response) => {
  try {
    const symptoms = getSymptoms();
    res.json({ success: true, data: symptoms });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to fetch symptoms' });
  }
});

// POST /api/symptoms — Log a new symptom report
app.post('/api/symptoms', (req: Request, res: Response) => {
  try {
    const { bodyPart, meshId, painType, intensity, notes, status } = req.body;
    if (!bodyPart) {
      return res.status(400).json({ success: false, error: 'bodyPart is required' });
    }
    const created = addSymptom({
      bodyPart,
      meshId,
      painType: painType || 'Dull',
      intensity: typeof intensity === 'number' ? intensity : 5,
      notes: notes || '',
      status: status || 'active',
    });
    res.status(201).json({ success: true, data: created, message: 'Symptom logged to clinical registry' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to log symptom' });
  }
});

// DELETE /api/symptoms/:id — Delete or resolve a symptom
app.delete('/api/symptoms/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = deleteSymptom(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Symptom report not found' });
    }
    res.json({ success: true, message: 'Symptom report removed from active tracking' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to delete symptom' });
  }
});

// GET /api/crew — Expedition 74 Crew Health Overview
app.get('/api/crew', (_req: Request, res: Response) => {
  try {
    const crew = getCrewMembers();
    res.json({ success: true, data: crew });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to fetch crew members' });
  }
});

// GET /api/alerts — Medical Alerts Registry
app.get('/api/alerts', (_req: Request, res: Response) => {
  try {
    const alerts = getMedicalAlerts();
    res.json({ success: true, data: alerts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to fetch medical alerts' });
  }
});

// POST /api/alerts/:id/acknowledge — Acknowledge Alert by Flight Surgeon
app.post('/api/alerts/:id/acknowledge', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { surgeonName } = req.body;
    const updated = acknowledgeAlert(id, surgeonName || 'Dr. Marcus Vance, M.D.');
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    res.json({ success: true, data: updated, message: 'Medical alert acknowledged by Flight Surgeon' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to acknowledge alert' });
  }
});

// DELETE /api/alerts/:id — Dismiss or Resolve Alert
app.delete('/api/alerts/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = resolveAlert(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    res.json({ success: true, message: 'Medical alert cleared from active queue' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to clear alert' });
  }
});

// GET /api/restrictions — Medical Restrictions List
app.get('/api/restrictions', (req: Request, res: Response) => {
  try {
    const astronautId = req.query.astronautId as string | undefined;
    const restrictions = getRestrictions(astronautId);
    res.json({ success: true, data: restrictions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to fetch restrictions' });
  }
});

// POST /api/restrictions — Prescribe new Medical Restriction
app.post('/api/restrictions', (req: Request, res: Response) => {
  try {
    const { astronautId, astronautName, name, description, affectedRegion, restrictedExercises, severity, effectiveDate, status, prescribedBy, clinicalRationale } = req.body;
    if (!name || !description || !affectedRegion) {
      return res.status(400).json({ success: false, error: 'Name, description, and affectedRegion are required' });
    }
    const created = addRestriction({
      astronautId: astronautId || 'ASTRO-74-SJ',
      astronautName: astronautName || 'Dr. Salma Johnson',
      name,
      description,
      affectedRegion,
      restrictedExercises: Array.isArray(restrictedExercises) ? restrictedExercises : [],
      severity: severity || 'Moderate',
      effectiveDate: effectiveDate || `MET D+84 (${new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' })})`,
      status: status || 'Active',
      prescribedBy: prescribedBy || 'Dr. Marcus Vance, M.D., FACEP (Lead Flight Surgeon)',
      clinicalRationale: clinicalRationale || 'Flight Medicine Countermeasure Safety Directive',
    });
    res.status(201).json({ success: true, data: created, message: 'Medical restriction successfully prescribed' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to create restriction' });
  }
});

// PATCH /api/restrictions/:id — Update or lift Medical Restriction
app.patch('/api/restrictions/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = updateRestriction(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Medical restriction not found' });
    }
    res.json({ success: true, data: updated, message: 'Medical restriction updated' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to update restriction' });
  }
});

// DELETE /api/restrictions/:id — Remove restriction
app.delete('/api/restrictions/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = deleteRestriction(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Medical restriction not found' });
    }
    res.json({ success: true, message: 'Medical restriction deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to delete restriction' });
  }
});

// GET /api/doctor-notes — Flight Surgeon Clinical Notes
app.get('/api/doctor-notes', (req: Request, res: Response) => {
  try {
    const astronautId = req.query.astronautId as string | undefined;
    const notes = getDoctorNotes(astronautId);
    res.json({ success: true, data: notes });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to fetch doctor notes' });
  }
});

// POST /api/doctor-notes — Add new Clinical Note
app.post('/api/doctor-notes', (req: Request, res: Response) => {
  try {
    const { astronautId, astronautName, category, title, content, relatedSymptoms, vitalsSnapshot, status, author } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Title and content are required' });
    }
    const created = addDoctorNote({
      astronautId: astronautId || 'ASTRO-74-SJ',
      astronautName: astronautName || 'Dr. Salma Johnson',
      author: author || 'Dr. Marcus Vance, M.D., FACEP (Lead Flight Surgeon)',
      category: category || 'Routine Assessment',
      title,
      content,
      relatedSymptoms: Array.isArray(relatedSymptoms) ? relatedSymptoms : [],
      vitalsSnapshot,
      status: status || 'Finalized',
    });
    res.status(201).json({ success: true, data: created, message: 'Clinical note recorded to medical registry' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to record doctor note' });
  }
});

// PATCH /api/doctor-notes/:id — Update Clinical Note
app.patch('/api/doctor-notes/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = updateDoctorNote(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Doctor note not found' });
    }
    res.json({ success: true, data: updated, message: 'Clinical note updated' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to update doctor note' });
  }
});

// GET /api/communications/conversations — Medical Communications Channels
app.get('/api/communications/conversations', (_req: Request, res: Response) => {
  try {
    const conversations = getConversations();
    res.json({ success: true, data: conversations });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to fetch conversations' });
  }
});

// GET /api/communications/messages/:conversationId — Conversation Messages
app.get('/api/communications/messages/:conversationId', (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const messages = getMessages(conversationId);
    res.json({ success: true, data: messages });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to fetch messages' });
  }
});

// POST /api/communications/messages — Send Message in Telemedicine Network
app.post('/api/communications/messages', (req: Request, res: Response) => {
  try {
    const { conversationId, content, messageType, priority } = req.body;
    if (!conversationId || !content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'conversationId and content are required' });
    }
    const message = sendMedicalMessage(conversationId, content, messageType, priority);
    if (conversationId === 'conv-astro-salma') {
      clearServerTimeoutHandle('ASTRO-74-SJ');
    }
    res.status(201).json({ success: true, data: message, message: 'Message transmitted via Ground Control Relay' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to send message' });
  }
});

// ─── Exchanged Medical Reports & Referrals Endpoints ─────────────────────────

// GET /api/reports/exchanged — Fetch all exchanged medical documents & referrals
app.get('/api/reports/exchanged', (_req: Request, res: Response) => {
  try {
    const reports = getExchangedReports();
    res.json({ success: true, data: reports });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to fetch exchanged reports' });
  }
});

// GET /api/reports/exchanged/:id — Fetch single report
app.get('/api/reports/exchanged/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const report = getExchangedReportById(id);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Medical report not found' });
    }
    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to fetch medical report' });
  }
});

// POST /api/reports/exchanged — Upload / Transmit new Medical Report to another doctor
app.post('/api/reports/exchanged', (req: Request, res: Response) => {
  try {
    const {
      title,
      documentType,
      astronautId,
      astronautName,
      astronautCallsign,
      authorId,
      authorName,
      authorRole,
      recipientDoctorId,
      recipientDoctorName,
      recipientDoctorRole,
      urgency,
      clinicalSummary,
      findings,
      referralQuestion,
      vitalsSnapshot,
      attachments,
    } = req.body;

    if (!title || !recipientDoctorId || !clinicalSummary) {
      return res.status(400).json({
        success: false,
        error: 'Title, recipientDoctorId, and clinicalSummary are required to transmit a medical report.',
      });
    }

    const created = createExchangedReport({
      title,
      documentType: documentType || 'Clinical Specialist Referral',
      astronautId: astronautId || 'ASTRO-74-SJ',
      astronautName: astronautName || 'Dr. Salma Johnson',
      astronautCallsign: astronautCallsign || 'Nova',
      authorId: authorId || 'user-fs-vance',
      authorName: authorName || 'Dr. Marcus Vance, M.D., FACEP',
      authorRole: authorRole || 'Lead Flight Surgeon (MCC Houston / JSC)',
      recipientDoctorId,
      recipientDoctorName: recipientDoctorName || 'Consulting Specialist',
      recipientDoctorRole: recipientDoctorRole || 'Flight Medicine Specialist',
      urgency: urgency || 'routine',
      status: 'transmitted',
      clinicalSummary,
      findings: Array.isArray(findings) ? findings : [],
      referralQuestion: referralQuestion || 'Requesting clinical review and evaluation.',
      vitalsSnapshot,
      attachments,
    });

    res.status(201).json({
      success: true,
      data: created,
      message: `Medical report "${created.reportNumber}" transmitted to ${created.recipientDoctorName} via TDRS relay`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to create medical report' });
  }
});

// POST /api/reports/exchanged/:id/review — Review and reply with Clinical Endorsement
app.post('/api/reports/exchanged/:id/review', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      reviewerId,
      reviewerName,
      reviewerRole,
      action,
      feedbackNotes,
      recommendedModifications,
      signatureCredential,
    } = req.body;

    if (!feedbackNotes) {
      return res.status(400).json({ success: false, error: 'feedbackNotes is required for clinical review' });
    }

    const updated = reviewExchangedReport(id, {
      reviewerId,
      reviewerName,
      reviewerRole,
      action: action || 'endorsed',
      feedbackNotes,
      recommendedModifications,
      signatureCredential,
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    res.json({
      success: true,
      data: updated,
      message: 'Clinical endorsement and review notes logged to document registry',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to submit review' });
  }
});

// POST /api/reports/exchanged/:id/forward — Forward / Refer Report to another doctor
app.post('/api/reports/exchanged/:id/forward', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { toDoctorId, toDoctorName, toDoctorRole, fromDoctorName, reason } = req.body;

    if (!toDoctorId || !toDoctorName || !reason) {
      return res.status(400).json({
        success: false,
        error: 'toDoctorId, toDoctorName, and forwarding reason are required',
      });
    }

    const updated = forwardExchangedReport(id, {
      toDoctorId,
      toDoctorName,
      toDoctorRole: toDoctorRole || 'Flight Medicine Specialist',
      fromDoctorName,
      reason,
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    res.json({
      success: true,
      data: updated,
      message: `Medical report referred and forwarded to ${toDoctorName}`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to forward report' });
  }
});

// DELETE /api/reports/exchanged/:id — Remove or Archive report
app.delete('/api/reports/exchanged/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = deleteExchangedReport(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }
    res.json({ success: true, message: 'Medical document archived from active exchange' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to delete report' });
  }
});

// ─── AI Medical Assistant & Doctor Availability Engine ───────────────────────

const MEDICAL_SAFETY_DISCLAIMER =
  'IMPORTANT MEDICAL SAFETY NOTICE: ASTRA AI Medical Assistant provides temporary support only and is NOT a replacement for a qualified Flight Surgeon or physician. It does not provide definitive medical diagnoses and never prescribes medications or dosages.';

const serverTimeoutHandles = new Map<string, ReturnType<typeof setTimeout>>();
const timeoutExecutionLocks = new Set<string>();

function clearServerTimeoutHandle(astronautId: string) {
  const existing = serverTimeoutHandles.get(astronautId);
  if (existing) {
    clearTimeout(existing);
    serverTimeoutHandles.delete(astronautId);
  }
}

function isAuthorizedMedicalPersonnel(req: Request): boolean {
  const cred = String(req.headers['x-surgeon-credential'] || '').trim();
  const role = String(req.headers['x-user-role'] || '').trim();
  return cred === 'NASA-FS-9842' || role === 'flight_surgeon' || role === 'medical_team';
}

function buildVerifiedRecordsList(context: MedicalAssistantContext): string[] {
  const { astronaut, vitalsSnapshot, activeSymptoms, activeRestrictions } = context;
  const records: string[] = [
    `Verified Telemetry — Heart Rate: ${vitalsSnapshot.heartRate} bpm (${
      astronaut.restingHeartRate !== null
        ? `Recorded Flight Baseline: ${astronaut.restingHeartRate} bpm`
        : 'Personal resting HR baseline: Not recorded in crew summary'
    })`,
    `Verified Telemetry — Blood Pressure: ${vitalsSnapshot.bloodPressure} mmHg`,
    `Verified Telemetry — Oxygen Saturation (SpO2): ${vitalsSnapshot.spO2}%`,
    `Verified Telemetry — Body Temperature: ${vitalsSnapshot.temperature}°C`,
    `Verified Telemetry — Respiratory Rate: ${
      vitalsSnapshot.respiratoryRate !== null
        ? `${vitalsSnapshot.respiratoryRate} breaths/min`
        : 'Not recorded in telemetry summary'
    }`,
    `Verified Telemetry — Recent Sleep: ${
      vitalsSnapshot.sleepHours !== null
        ? `${vitalsSnapshot.sleepHours} hours`
        : 'Not recorded in telemetry summary'
    }`,
  ];

  if (astronaut.spineElongation !== null) {
    records.push(`Verified Bio-Record — Spine Elongation: +${astronaut.spineElongation} cm`);
  }

  records.push(
    `Verified Medical History — Allergies: ${
      astronaut.allergiesRecorded
        ? astronaut.allergies.length > 0
          ? astronaut.allergies.join(', ')
          : 'None recorded'
        : 'Not recorded in crew summary'
    }`
  );

  records.push(
    `Verified Medical History — Conditions: ${
      astronaut.conditions.length > 0 ? astronaut.conditions.join('; ') : 'None recorded in summary'
    }`
  );

  records.push(
    `Verified Symptom Log: ${
      activeSymptoms.length > 0
        ? activeSymptoms
            .map(
              (s) =>
                `${s.bodyPart} (${s.painType}${s.intensity > 0 ? `, ${s.intensity}/10` : ', numerical severity not scored'})`
            )
            .join('; ')
        : 'No active symptoms logged'
    }`
  );

  records.push(
    `Verified Restrictions: ${
      activeRestrictions.length > 0
        ? activeRestrictions.map((r) => `${r.name} [${r.status}]`).join('; ')
        : 'None active in record'
    }`
  );

  return records;
}

function buildFollowUpQuestions(
  message: string,
  triage: ReturnType<typeof detectEmergencyAndConcerningVitals>
): string[] {
  if (triage.triageLevel === 'emergency') return [];

  const lower = message.toLowerCase();
  const questions: string[] = [];

  const hasDuration = /\b(hour|hours|hr|hrs|minute|minutes|min|day|days|since|started|today|yesterday|week|just now|ago)\b/i.test(lower);
  const hasSeverity = /\b(mild|slight|minor|moderate|severe|intense|\/10|little|bit)\b/i.test(lower);
  const hasProgression = /\b(better|worse|worsening|same|steady|stable|improving|chang)\b/i.test(lower);

  if (!hasDuration) {
    questions.push('When did these symptoms start, and have they been continuous or coming and going?');
  }
  if (!hasSeverity || !hasProgression) {
    questions.push('On a 1–10 scale, how intense do they feel right now, and are they staying steady or getting worse?');
  }

  if (/\b(dizzy|dizziness|lightheaded|vertigo|concentrat|focus|fatigue|tired|headache)\b/i.test(lower)) {
    questions.push(
      'Do symptoms change when shifting posture/head position or after fluids/food, and have you noticed any vision changes, fever, chest discomfort, or shortness of breath?'
    );
  } else if (/\b(back|lumbar|spine|neck|muscle|joint|ache|pain)\b/i.test(lower)) {
    questions.push(
      'Does the discomfort stay in one spot, or does it radiate with numbness, tingling, or weakness?'
    );
  } else if (questions.length < 2 && triage.needsFollowUpQuestions) {
    questions.push('Have you noticed any new warning signs such as fever, nausea, vision changes, or breathing difficulty?');
  }

  return questions.slice(0, 3);
}

async function generateMedicalAssistantGuidance(params: {
  message: string;
  context: MedicalAssistantContext;
  doctorStatus: string;
  triggerReason: string;
  extraContextMessages?: Array<{ sender: string; content: string }>;
}) {
  const { message, context, doctorStatus, triggerReason, extraContextMessages = [] } = params;
  const triage = detectEmergencyAndConcerningVitals(message, context);
  const {
    triageLevel,
    protocolBasis,
    redFlags,
    urgentFlags,
    attentionFlags,
    criticalVitals,
    unusualVitals,
  } = triage;

  const isEmergency = triageLevel === 'emergency';
  const isUrgent = triageLevel === 'urgent';
  const isAttention = triageLevel === 'attention_required';
  const verifiedRecordsUsed = buildVerifiedRecordsList(context);
  const defaultFollowUps = buildFollowUpQuestions(message, triage);

  let escalationTriggered = false;
  let escalatedAlertId: string | undefined;

  if (isEmergency) {
    const reason =
      [...redFlags, ...criticalVitals.map((v) => `${v.label}: ${v.value} ${v.unit}`)]
        .slice(0, 2)
        .join(' / ') || 'Critical physiological red flag';

    const alert = escalateMedicalIssueToTeam({
      context,
      triageLevel: 'emergency',
      reasonSummary: reason,
      reportedSymptomText: message,
    });
    escalationTriggered = true;
    escalatedAlertId = alert.id;
  } else if (isUrgent) {
    const reason =
      [...urgentFlags, ...unusualVitals.map((v) => `${v.label} ${v.value}${v.unit}`)]
        .slice(0, 2)
        .join(' / ') || 'Concerning symptom progression requiring prompt evaluation';

    const alert = escalateMedicalIssueToTeam({
      context,
      triageLevel: 'urgent',
      reasonSummary: reason,
      reportedSymptomText: message,
    });
    escalationTriggered = true;
    escalatedAlertId = alert.id;
  } else if (isAttention) {
    const reason =
      [...attentionFlags, ...unusualVitals.map((v) => `${v.label} ${v.value}${v.unit}`)]
        .slice(0, 2)
        .join(' / ') || 'Persistent or multi-symptom clinical presentation';

    const alert = escalateMedicalIssueToTeam({
      context,
      triageLevel: 'attention_required',
      reasonSummary: reason,
      reportedSymptomText: message,
    });
    escalationTriggered = true;
    escalatedAlertId = alert.id;
  }

  const systemInstruction = `You are the ASTRA AI Medical Assistant integrated into the NASA Expedition 74 Astronaut Health Monitoring System.
You are speaking directly with Astronaut ${context.astronaut.name} (Callsign: ${context.astronaut.callsign}, Role: ${context.astronaut.role}).
Doctor Availability Context: Flight Surgeon status is "${doctorStatus}". Trigger: "${triggerReason}".

VERIFIED MEDICAL & TELEMETRY RECORDS (STRICTLY AUTHORITATIVE — NEVER INVENT MISSING VALUES):
${verifiedRecordsUsed.map((r) => `- ${r}`).join('\n')}

APPROVED 4-LEVEL MISSION TRIAGE PROTOCOL CLASSIFICATION:
- Assigned Triage Level: ${triageLevel.toUpperCase()}
- Protocol Basis: ${protocolBasis}
${redFlags.length > 0 ? `- Level 4 Emergency Warning Signs: ${redFlags.join('; ')}` : ''}
${urgentFlags.length > 0 ? `- Level 3 Urgent Flags: ${urgentFlags.join('; ')}` : ''}
${attentionFlags.length > 0 ? `- Level 2 Attention Factors: ${attentionFlags.join('; ')}` : ''}

CRITICAL CLINICAL & SAFETY RULES (NON-NEGOTIABLE):
1. You provide temporary medical support ONLY. You are NOT a replacement for a qualified Flight Surgeon.
2. NEVER provide definitive medical diagnoses. NEVER prescribe medications or dosages.
3. FOUR-TIER CLASSIFICATION DISCIPLINE:
   - Level 1 (LOW RISK): Mild isolated symptoms/questions without warning signs -> provide supportive initial guidance and monitor.
   - Level 2 (ATTENTION REQUIRED): Persistent, moderate, or multi-symptom presentations (e.g., mild dizziness, fatigue, and difficulty concentrating without red flags) -> DO NOT treat as a life-threatening emergency; perform structured follow-up questioning and note that a non-emergency Flight Surgeon review request has been logged.
   - Level 3 (URGENT): Progressive worsening, severe vertigo/inability to stand, persistent vomiting, high fever/pain (7-8/10), or presyncope -> state that the case has been escalated promptly to the Medical Team for evaluation.
   - Level 4 (EMERGENCY): Life-threatening red flags or critical vitals -> state that immediate Emergency Escalation has ALREADY bypassed wait timers.
4. NEVER assume that normal vital signs rule out a serious medical condition; explicitly note this caution when vitals are within reference limits alongside symptoms.
5. NEVER invent patient data, sleep hours, resting HR baselines, allergies, or medical restrictions. If a record says "Not recorded", treat it as unknown and do not fabricate a number.
6. CLEARLY SEPARATE AI-generated observations from verified medical records. Start each vital observation with "AI Observation:".
7. Ask relevant follow-up questions in "followUpQuestions" whenever severity, onset, duration, or progression is unclear.`;

  const combinedHistory = [
    ...extraContextMessages.slice(-4),
    ...context.history.slice(-6).map((h) => ({ sender: h.sender, content: h.content })),
  ];

  const geminiPrompt = `Previous Conversation Context (most recent turns):
${combinedHistory.map((h) => `${h.sender.toUpperCase()}: ${h.content}`).join('\n')}

CURRENT ASTRONAUT MESSAGE:
"${message}"

Respond in valid JSON matching the required schema.`;

  const ai = getGeminiClient();
  if (ai) {
    try {
      const response = await Promise.race([
        ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: geminiPrompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                reply: {
                  type: Type.STRING,
                  description:
                    'Clear, calm, non-diagnostic clinical guidance matched to the 4-level triage classification without inventing unrecorded data or prescribing medications.',
                },
                vitalObservations: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description:
                    '1 to 3 AI-generated observations (prefixed with "AI Observation:") interpreting recorded vitals while noting if normal vitals do not rule out clinical causes.',
                },
                followUpQuestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description:
                    '1 to 3 targeted clinical follow-up questions about onset, duration, severity, progression, or warning signs when needed (empty array for immediate Level 4 emergency).',
                },
                firstAidSteps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description:
                    'Safe, non-pharmacological initial care or monitoring steps (never medication dosages).',
                },
                emergencyInstructions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description:
                    'Immediate life-safety emergency action steps ONLY if triageLevel is emergency, otherwise empty array.',
                },
              },
              required: [
                'reply',
                'vitalObservations',
                'followUpQuestions',
                'firstAidSteps',
                'emergencyInstructions',
              ],
            },
          },
        }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Gemini timeout')), 9000)),
      ]);

      const rawText = response.text?.trim();
      if (rawText) {
        const parsed = JSON.parse(rawText);
        const guaranteedEmergencySteps =
          isEmergency && (!Array.isArray(parsed.emergencyInstructions) || parsed.emergencyInstructions.length === 0)
            ? [
                'Stop all physical exertion or EVA/ARED activity immediately and stabilize yourself in a crew restraint.',
                'Check cabin atmospheric O2 / CO2 readouts and apply supplemental emergency oxygen mask if breathing feels labored.',
                'Keep your medical telemetry sensors attached — an urgent HIGH-PRIORITY alert has already been transmitted to the Flight Surgeon and Ground Medical Team.',
                'Request immediate voice loop assistance from a crewmate aboard ISS Node 2 while MCC Flight Medicine connects.',
              ]
            : isEmergency
            ? parsed.emergencyInstructions || []
            : [];

        const followUpQuestions = isEmergency
          ? []
          : Array.isArray(parsed.followUpQuestions) && parsed.followUpQuestions.length > 0
          ? parsed.followUpQuestions
          : defaultFollowUps;

        return {
          triageLevel: triageLevel as AssistantTriageLevel,
          protocolBasis,
          verifiedRecordsUsed,
          reply: parsed.reply,
          vitalObservations: Array.isArray(parsed.vitalObservations) ? parsed.vitalObservations : [],
          followUpQuestions,
          firstAidSteps: Array.isArray(parsed.firstAidSteps) ? parsed.firstAidSteps : [],
          emergencyInstructions: guaranteedEmergencySteps,
          escalationTriggered,
          escalatedAlertId,
          disclaimer: MEDICAL_SAFETY_DISCLAIMER,
          source: 'gemini-4-hydrogen',
        };
      }
    } catch (geminiErr: any) {
      console.warn('[AI Medical Assistant Gemini Warning]:', geminiErr?.message);
    }
  }

  // Clinical Safety Protocol Rule Engine Fallback (Zero fabrication, 4-tier strict separation)
  const lower = message.toLowerCase();
  const obs: string[] = context.vitalEvaluations
    .filter((v) => v.status === 'critical' || v.status === 'unusual')
    .map((v) => `AI Observation: ${v.label} is ${v.value}${v.unit ? ` ${v.unit}` : ''} (${v.note})`);

  const recordedSummaryParts = [
    `HR ${context.vitalsSnapshot.heartRate} bpm`,
    `BP ${context.vitalsSnapshot.bloodPressure} mmHg`,
    `SpO2 ${context.vitalsSnapshot.spO2}%`,
    `Temp ${context.vitalsSnapshot.temperature}°C`,
  ];
  if (context.vitalsSnapshot.respiratoryRate !== null) {
    recordedSummaryParts.push(`RR ${context.vitalsSnapshot.respiratoryRate} breaths/min`);
  }

  if (obs.length === 0) {
    obs.push(
      `AI Observation: Recorded core telemetry (${recordedSummaryParts.join(', ')}) falls within standard reference intervals; however, normal vital signs alone do not rule out an underlying medical condition or evolving symptoms.`
    );
  } else {
    obs.push(
      `AI Observation: Other recorded readings (${recordedSummaryParts.join(', ')}) are within reference ranges; normal individual values do not exclude medical evaluation when symptoms persist.`
    );
  }

  if (context.vitalsSnapshot.respiratoryRate === null || context.vitalsSnapshot.sleepHours === null || context.astronaut.restingHeartRate === null) {
    const missingFields: string[] = [];
    if (context.vitalsSnapshot.respiratoryRate === null) missingFields.push('respiratory rate');
    if (context.vitalsSnapshot.sleepHours === null) missingFields.push('sleep duration');
    if (context.astronaut.restingHeartRate === null) missingFields.push('personal resting HR baseline');
    obs.push(
      `AI Observation: Note that ${missingFields.join(', ')} ${missingFields.length === 1 ? 'is' : 'are'} not recorded in this crew telemetry summary and therefore not assumed.`
    );
  }

  if (isEmergency) {
    return {
      triageLevel: 'emergency' as const,
      protocolBasis,
      verifiedRecordsUsed,
      reply: `LEVEL 4 EMERGENCY ESCALATION (${context.astronaut.callsign}): Based on the critical warning signs reported${redFlags.length ? ` (${redFlags.join(', ')})` : ''} and synchronized telemetry, this requires immediate Flight Surgeon intervention. I have bypassed all wait timers and dispatched a high-priority emergency alert to Dr. Marcus Vance and the Ground Medical Team.`,
      vitalObservations: obs,
      followUpQuestions: [],
      firstAidSteps: [],
      emergencyInstructions: [
        'Halt all operational tasks immediately and secure yourself in a stable, resting posture.',
        'Monitor breathing and check local cabin O2 / CO2 sensors; deploy supplemental oxygen from the Crew Medical Restraint System if short of breath.',
        'Alert the nearest crewmate to retrieve the ISS Crew Health Care System (CHeCS) emergency medical kit and stand by on the voice loop.',
        'Do not take unprescribed medications. Keep bio-telemetry patches attached while the Flight Surgeon establishes emergency uplink.',
      ],
      escalationTriggered,
      escalatedAlertId,
      disclaimer: MEDICAL_SAFETY_DISCLAIMER,
      source: 'astra-clinical-safety-engine',
    };
  }

  if (isUrgent) {
    return {
      triageLevel: 'urgent' as const,
      protocolBasis,
      verifiedRecordsUsed,
      reply: `LEVEL 3 URGENT ASSESSMENT (${context.astronaut.callsign}): Your message indicates concerning features (${urgentFlags.join(', ') || 'worsening/high-severity symptoms'}) that require prompt medical evaluation. Because this is not currently classified as an immediate life-threatening emergency unless red flags develop, I have escalated a priority evaluation request to the Medical Team rather than triggering a critical emergency override. Please stabilize your position and answer the follow-up questions below.`,
      vitalObservations: obs,
      followUpQuestions: defaultFollowUps,
      firstAidSteps: [
        'Pause physical exertion, EVA prep, or resistive exercise and remain anchored in a stable resting position.',
        'Check cabin CO2 and airflow readouts on your module console and take slow, steady breaths.',
        'Avoid rapid head movements or unassisted module translation while dizzy or unsteady.',
        'Trigger an immediate emergency alert or notify a crewmate right away if you develop chest pain, fainting, breathing difficulty, slurred speech, or sudden vision loss.',
      ],
      escalationTriggered,
      escalatedAlertId,
      disclaimer: MEDICAL_SAFETY_DISCLAIMER,
      source: 'astra-clinical-safety-engine',
    };
  }

  const firstAidSteps: string[] = [];
  let reply = '';

  if (isAttention) {
    const factorsText = attentionFlags.length > 0 ? attentionFlags.join('; ') : 'combined or persistent symptoms';
    reply = `LEVEL 2 ATTENTION REQUIRED (${context.astronaut.callsign}): I have reviewed your reported symptoms alongside your verified telemetry (${recordedSummaryParts.join(', ')}). Because you described ${factorsText} without critical red-flag warning signs, this is classified as Attention Required for Flight Surgeon medical review — NOT a critical emergency. Normal or stable vital signs do not rule out an underlying cause, so I have logged a review notice for Dr. Marcus Vance and listed clarifying questions below to refine your clinical picture.`;
  } else {
    reply = `LEVEL 1 LOW RISK (${context.astronaut.callsign}): Based on your message and verified telemetry (${recordedSummaryParts.join(', ')}), there are currently no warning signs requiring escalation. I cannot diagnose medical conditions or prescribe medications, and remember that normal vitals alone never rule out evolving symptoms — please monitor how you feel and answer the follow-up questions if anything remains unclear.`;
  }

  if (lower.includes('dizzy') || lower.includes('dizziness') || lower.includes('concentrat') || lower.includes('focus') || lower.includes('brain fog')) {
    if (!isAttention) {
      reply += ' Mild lightheadedness or reduced focus in orbit can be associated with hydration status, sleep quality, cabin CO2 pockets, or fluid shifts, though persistent symptoms merit clinician review.';
    }
    firstAidSteps.push(
      'Check module ventilation airflow and cabin partial-pressure CO2 readouts at your workstation.',
      'Hydrate gradually with water or an approved mission electrolyte drink and rest in a supported posture for 15–20 minutes.',
      'Defer precision robotics or strenuous tasks until symptoms clear, and seek urgent help immediately if dizziness turns into spinning vertigo, fainting, chest pain, or vision changes.'
    );
  } else if (lower.includes('back') || lower.includes('lumbar') || lower.includes('spine') || lower.includes('ache')) {
    const spineNote =
      context.astronaut.spineElongation !== null
        ? ` Verified records show +${context.astronaut.spineElongation} cm spinal elongation.`
        : '';
    reply += `${spineNote} Mild musculoskeletal discomfort in microgravity warrants careful observation and adherence to active exercise restrictions until reviewed by the Flight Surgeon.`;
    firstAidSteps.push(
      'Pause any axial-loading resistance exercises (such as squats or deadlifts) and avoid sudden spinal twisting during module translation.',
      'Perform gentle, unloaded stretching only if it does not increase discomfort, or apply a warm compress pack for 15 minutes.',
      'Report immediately if pain intensifies sharply or radiates with numbness or tingling down your legs.'
    );
  } else if (lower.includes('heart') || lower.includes('hr') || lower.includes('pulse') || lower.includes('sleep') || lower.includes('tired') || lower.includes('fatigue')) {
    const baselineText =
      context.astronaut.restingHeartRate !== null
        ? ` compared to your recorded ${context.astronaut.restingHeartRate} bpm baseline`
        : ' (personal resting baseline not recorded in summary)';
    const sleepText =
      context.vitalsSnapshot.sleepHours !== null
        ? ` alongside ${context.vitalsSnapshot.sleepHours} hrs recorded sleep`
        : '';
    reply += ` Your current recorded heart rate is ${context.vitalsSnapshot.heartRate} bpm${baselineText}${sleepText}.`;
    firstAidSteps.push(
      'Hydrate slowly with 300–500 mL of water or an approved electrolyte beverage.',
      'Rest quietly for 20–30 minutes using slow, steady breathing (4-second inhale / 6-second exhale).',
      'Defer high-intensity physical tasks and monitor whether fatigue resolves or persists.'
    );
  } else if (lower.includes('headache') || lower.includes('sinus') || lower.includes('fluid')) {
    firstAidSteps.push(
      'Verify cabin ventilation airflow around your workstation and check CO2 levels on your module console.',
      'Maintain steady hydration and avoid rapid head movements while translating between modules.',
      'Alert the medical team promptly if headache becomes severe or is accompanied by fever, neck stiffness, or blurred vision.'
    );
  } else {
    firstAidSteps.push(
      'Maintain steady hydration and avoid strenuous tasks while monitoring your symptoms.',
      'Keep wearable telemetry sensors attached so the Flight Surgeon has continuous readings.',
      'Reply with answers to the follow-up questions above or report right away if any new or worsening symptoms develop.'
    );
  }

  return {
    triageLevel: triageLevel as AssistantTriageLevel,
    protocolBasis,
    verifiedRecordsUsed,
    reply,
    vitalObservations: obs,
    followUpQuestions: defaultFollowUps,
    firstAidSteps,
    emergencyInstructions: [],
    escalationTriggered,
    escalatedAlertId,
    disclaimer: MEDICAL_SAFETY_DISCLAIMER,
    source: 'astra-clinical-safety-engine',
  };
}

async function executeServerTimeoutTakeover(astronautId: string): Promise<boolean> {
  if (timeoutExecutionLocks.has(astronautId)) return false;
  const timer = currentDoctorTimers[astronautId];
  if (!timer || !timer.isWaiting || timer.aiTakeoverActive || currentDoctorAvailability !== 'available') {
    return false;
  }
  if (!timer.expiresAt || Date.now() < Date.parse(timer.expiresAt)) {
    return false;
  }

  timeoutExecutionLocks.add(astronautId);
  clearServerTimeoutHandle(astronautId);

  try {
    // Re-check inside lock to prevent duplicate AI takeover responses
    if (!timer.isWaiting || timer.aiTakeoverActive || currentDoctorAvailability !== 'available') {
      return false;
    }

    const timeoutSeconds = timer.timeoutSeconds;
    const timeoutLabel = formatTimeoutDurationText(timeoutSeconds);
    const triggerText = timer.triggerMessageContent || 'Unanswered astronaut health inquiry';
    const priorDoctorContext = getDoctorHistory(astronautId)
      .slice(-5)
      .map((m) => ({ sender: m.senderName, content: m.content }));

    timer.isWaiting = false;
    timer.aiTakeoverActive = true;
    timer.aiTakeoverAt = new Date().toISOString();
    timer.aiTakeoverReason = `Flight Surgeon did not respond within ${timeoutLabel}. AI Medical Assistant temporarily activated.`;

    // 1. Add system notice to AI channel ONLY (never mixes with Doctor Chat)
    addChannelMessage(astronautId, 'ai', {
      sender: 'system',
      senderId: 'astra-availability-monitor',
      senderName: 'ASTRA Availability Monitor',
      content: `Flight Surgeon Dr. Marcus Vance did not respond within ${timeoutLabel}. ASTRA AI Medical Assistant is now temporarily active to support you with your earlier message: "${triggerText}"`,
      triageLevel: 'attention_required',
    });

    // 2. Preserve context & generate single initial AI guidance in AI channel
    const context = getMedicalAssistantContext(astronautId);
    const guidance = await generateMedicalAssistantGuidance({
      message: triggerText,
      context,
      doctorStatus: 'timeout_takeover',
      triggerReason: `No Flight Surgeon response after ${timeoutLabel} — Temporary AI Takeover`,
      extraContextMessages: priorDoctorContext,
    });

    if (guidance.triageLevel === 'emergency') {
      activateEmergencySession({
        astronautId,
        alertId: guidance.escalatedAlertId || `ALT-EMG-${Date.now()}`,
        reason: 'Emergency detected during timeout review',
        instructions: guidance.emergencyInstructions,
      });
    }

    addChannelMessage(astronautId, 'ai', {
      sender: 'ai_assistant',
      senderId: 'astra-ai-medical',
      senderName: 'ASTRA AI Medical Assistant',
      senderRole: 'Temporary Medical Support System',
      content: guidance.reply,
      triageLevel: guidance.triageLevel,
      protocolBasis: guidance.protocolBasis,
      verifiedRecordsUsed: guidance.verifiedRecordsUsed,
      vitalObservations: guidance.vitalObservations,
      followUpQuestions: guidance.followUpQuestions,
      firstAidSteps: guidance.firstAidSteps,
      emergencyInstructions: guidance.emergencyInstructions,
      escalationTriggered: guidance.escalationTriggered,
      escalatedAlertId: guidance.escalatedAlertId,
      disclaimer: guidance.disclaimer,
      source: guidance.source,
    });

    // 3. Notify the Flight Surgeon & Medical Team
    if (!timer.notifiedTimeoutTakeover) {
      timer.notifiedTimeoutTakeover = true;
      notifySurgeonOfAiTakeover(astronautId, timeoutSeconds, triggerText);
    }

    return true;
  } finally {
    timeoutExecutionLocks.delete(astronautId);
  }
}

function scheduleServerWaitTimeout(astronautId: string, expiresAtIso: string) {
  clearServerTimeoutHandle(astronautId);
  const remainingMs = Math.max(0, Date.parse(expiresAtIso) - Date.now());
  // Node timers max safe 32-bit int (~24.8 days); 2-3 hours (7.2e6 - 1.08e7 ms) fits cleanly
  const handle = setTimeout(() => {
    executeServerTimeoutTakeover(astronautId).catch((err) =>
      console.warn('[Server Timeout Takeover Error]:', err?.message)
    );
  }, remainingMs + 50);
  serverTimeoutHandles.set(astronautId, handle);
}

async function sweepExpiredDoctorTimeouts() {
  const astronautIds = Object.keys(currentDoctorTimers);
  for (const id of astronautIds) {
    const t = currentDoctorTimers[id];
    if (t?.isWaiting && t.expiresAt && Date.now() >= Date.parse(t.expiresAt)) {
      await executeServerTimeoutTakeover(id);
    }
  }
}

// GET /api/medical-assistant/availability — Fetch server-authoritative availability & timeout config
app.get('/api/medical-assistant/availability', (_req: Request, res: Response) => {
  res.json({ success: true, data: getDoctorAvailabilityConfig() });
});

// POST /api/medical-assistant/availability — Update Flight Surgeon availability & 15s/2h/3h timeout on server
app.post('/api/medical-assistant/availability', (req: Request, res: Response) => {
  try {
    const { doctorStatus, timeoutSeconds, timeoutHours, astronautId = 'ASTRO-74-SJ' } = req.body;

    if (doctorStatus !== undefined && doctorStatus !== 'available' && doctorStatus !== 'unavailable') {
      return res.status(400).json({ success: false, error: 'doctorStatus must be "available" or "unavailable"' });
    }

    let resolvedTimeoutSeconds = timeoutSeconds;
    if (resolvedTimeoutSeconds === undefined && timeoutHours !== undefined) {
      resolvedTimeoutSeconds = timeoutHours === 2 ? 7200 : timeoutHours === 3 ? 10800 : -1;
    }

    if (
      resolvedTimeoutSeconds !== undefined &&
      resolvedTimeoutSeconds !== 15 &&
      resolvedTimeoutSeconds !== 7200 &&
      resolvedTimeoutSeconds !== 10800
    ) {
      return res.status(400).json({
        success: false,
        error: 'timeoutSeconds must be 15 (15 seconds), 7200 (2 hours), or 10800 (3 hours)',
      });
    }

    const updatedConfig = setDoctorAvailabilityConfig({
      doctorStatus,
      timeoutSeconds: resolvedTimeoutSeconds,
    });

    if (doctorStatus === 'available' || doctorStatus === 'unavailable') {
      for (const id of Array.from(serverTimeoutHandles.keys())) {
        clearServerTimeoutHandle(id);
      }
    }

    res.json({
      success: true,
      config: updatedConfig,
      updatedContext: getMedicalAssistantContext(astronautId),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to update availability config' });
  }
});

// GET /api/medical-assistant/context/:astronautId — Auto-sync astronaut vitals, active channel & server timer
app.get('/api/medical-assistant/context/:astronautId', async (req: Request, res: Response) => {
  try {
    const { astronautId } = req.params;
    await executeServerTimeoutTakeover(astronautId);
    const context = getMedicalAssistantContext(astronautId);
    res.json({ success: true, data: context });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to load medical assistant context' });
  }
});

// POST /api/medical-assistant/doctor-message — Direct message to Flight Surgeon (Doctor Chat ONLY + Emergency Override)
app.post('/api/medical-assistant/doctor-message', async (req: Request, res: Response) => {
  try {
    const { astronautId = 'ASTRO-74-SJ', message } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    await executeServerTimeoutTakeover(astronautId);
    const activeChannel = getActiveChannelForAstronaut(astronautId);
    if (activeChannel !== 'doctor') {
      return res.status(409).json({
        success: false,
        error: 'Doctor Chat is currently inactive because the Flight Surgeon is unavailable or AI takeover is active. Route messages to AI Medical Assistant.',
        activeChannel,
      });
    }

    const preContext = getMedicalAssistantContext(astronautId);
    const trimmed = message.trim();

    // Record astronaut message strictly in Doctor Chat channel + Flight Surgeon Communications
    const astronautMsg = addChannelMessage(astronautId, 'doctor', {
      sender: 'astronaut',
      senderId: preContext.astronaut.id,
      senderName: `${preContext.astronaut.name} (${preContext.astronaut.callsign})`,
      senderRole: preContext.astronaut.role,
      content: trimmed,
      vitalsSnapshot: {
        heartRate: preContext.vitalsSnapshot.heartRate,
        bloodPressure: preContext.vitalsSnapshot.bloodPressure,
        spO2: preContext.vitalsSnapshot.spO2,
        temperature: preContext.vitalsSnapshot.temperature,
        respiratoryRate: preContext.vitalsSnapshot.respiratoryRate,
        sleepHours: preContext.vitalsSnapshot.sleepHours,
        timestamp: preContext.vitalsSnapshot.timestamp,
      },
    });

    postAstronautDirectToSurgeon(astronautId, trimmed);

    // EMERGENCY OVERRIDE — Highest priority, independent of Doctor Availability & 2h/3h timeout
    const triage = detectEmergencyAndConcerningVitals(trimmed, preContext);
    if (triage.triageLevel === 'emergency') {
      clearServerTimeoutHandle(astronautId);

      const guidance = await generateMedicalAssistantGuidance({
        message: trimmed,
        context: getMedicalAssistantContext(astronautId),
        doctorStatus: preContext.doctorStatus,
        triggerReason: 'IMMEDIATE EMERGENCY OVERRIDE (Zero-Wait Escalation)',
      });

      const emergencyReason =
        [...triage.redFlags, ...triage.criticalVitals.map((v) => `${v.label}: ${v.value}${v.unit}`)].join(' / ') ||
        'Critical Emergency Symptoms';

      const emergencyState = activateEmergencySession({
        astronautId,
        alertId: guidance.escalatedAlertId || `ALT-EMG-${Date.now()}`,
        reason: emergencyReason,
        instructions: guidance.emergencyInstructions,
      });

      // Log emergency guidance in AI audit archive only (NEVER mix AI bubbles into Doctor Chat)
      addChannelMessage(astronautId, 'ai', {
        sender: 'ai_assistant',
        senderId: 'astra-emergency-triage',
        senderName: 'ASTRA Emergency Triage System',
        content: guidance.reply,
        triageLevel: 'emergency',
        protocolBasis: guidance.protocolBasis,
        verifiedRecordsUsed: guidance.verifiedRecordsUsed,
        vitalObservations: guidance.vitalObservations,
        followUpQuestions: guidance.followUpQuestions,
        emergencyInstructions: guidance.emergencyInstructions,
        escalationTriggered: true,
        escalatedAlertId: emergencyState.alertId,
        disclaimer: guidance.disclaimer,
        source: guidance.source,
      });

      return res.json({
        success: true,
        immediateEmergency: true,
        astronautMessage: astronautMsg,
        emergencyState,
        updatedContext: getMedicalAssistantContext(astronautId),
      });
    }

    // Start or preserve server-authoritative 2h / 3h response timer
    const timer = startOrPreserveDoctorWaitTimer(astronautId, astronautMsg.id, trimmed);
    if (timer.expiresAt) {
      scheduleServerWaitTimeout(astronautId, timer.expiresAt);
    }

    return res.json({
      success: true,
      immediateEmergency: false,
      astronautMessage: astronautMsg,
      updatedContext: getMedicalAssistantContext(astronautId),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to send message to Flight Surgeon' });
  }
});

// POST /api/medical-assistant/chat — AI Medical Assistant Channel ONLY (Doctor Unavailable or 2h/3h Timeout Takeover)
app.post('/api/medical-assistant/chat', async (req: Request, res: Response) => {
  try {
    const { astronautId = 'ASTRO-74-SJ', message } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    await executeServerTimeoutTakeover(astronautId);
    const activeChannel = getActiveChannelForAstronaut(astronautId);

    // Prevent AI interference while Doctor is Available & responding
    if (activeChannel !== 'ai') {
      return res.status(409).json({
        success: false,
        error: 'Flight Surgeon is currently Available. AI Medical Assistant is hidden and cannot interfere with live doctor communication.',
        activeChannel,
      });
    }

    const trimmed = message.trim();
    const preContext = getMedicalAssistantContext(astronautId);

    // Save astronaut message strictly in AI channel (never mixes with Doctor Chat)
    const astronautMsg = addChannelMessage(astronautId, 'ai', {
      sender: 'astronaut',
      senderId: preContext.astronaut.id,
      senderName: `${preContext.astronaut.name} (${preContext.astronaut.callsign})`,
      senderRole: preContext.astronaut.role,
      content: trimmed,
      vitalsSnapshot: {
        heartRate: preContext.vitalsSnapshot.heartRate,
        bloodPressure: preContext.vitalsSnapshot.bloodPressure,
        spO2: preContext.vitalsSnapshot.spO2,
        temperature: preContext.vitalsSnapshot.temperature,
        respiratoryRate: preContext.vitalsSnapshot.respiratoryRate,
        sleepHours: preContext.vitalsSnapshot.sleepHours,
        timestamp: preContext.vitalsSnapshot.timestamp,
      },
    });

    const triage = detectEmergencyAndConcerningVitals(trimmed, preContext);
    const guidance = await generateMedicalAssistantGuidance({
      message: trimmed,
      context: getMedicalAssistantContext(astronautId),
      doctorStatus: preContext.doctorStatus,
      triggerReason: preContext.timerState.aiTakeoverActive
        ? `Flight Surgeon response timeout (${formatTimeoutDurationText(preContext.timeoutSeconds)})`
        : 'Flight Surgeon Unavailable',
    });

    let emergencyState = null;
    if (guidance.triageLevel === 'emergency') {
      const emergencyReason =
        [...triage.redFlags, ...triage.criticalVitals.map((v) => `${v.label}: ${v.value}${v.unit}`)].join(' / ') ||
        'Critical Emergency Symptoms';

      emergencyState = activateEmergencySession({
        astronautId,
        alertId: guidance.escalatedAlertId || `ALT-EMG-${Date.now()}`,
        reason: emergencyReason,
        instructions: guidance.emergencyInstructions,
      });
    }

    const aiMsg = addChannelMessage(astronautId, 'ai', {
      sender: 'ai_assistant',
      senderId: guidance.triageLevel === 'emergency' ? 'astra-emergency-triage' : 'astra-ai-medical',
      senderName:
        guidance.triageLevel === 'emergency'
          ? 'ASTRA Emergency Triage AI'
          : 'ASTRA AI Medical Assistant',
      senderRole: 'Temporary Medical Support System',
      content: guidance.reply,
      triageLevel: guidance.triageLevel,
      protocolBasis: guidance.protocolBasis,
      verifiedRecordsUsed: guidance.verifiedRecordsUsed,
      vitalObservations: guidance.vitalObservations,
      followUpQuestions: guidance.followUpQuestions,
      firstAidSteps: guidance.firstAidSteps,
      emergencyInstructions: guidance.emergencyInstructions,
      escalationTriggered: guidance.escalationTriggered,
      escalatedAlertId: guidance.escalatedAlertId,
      disclaimer: guidance.disclaimer,
      source: guidance.source,
    });

    res.json({
      success: true,
      astronautMessage: astronautMsg,
      assistantMessage: aiMsg,
      emergencyState,
      updatedContext: getMedicalAssistantContext(astronautId),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'AI Medical Assistant error' });
  }
});

// POST /api/medical-assistant/surgeon-reply — Authorized Flight Surgeon Reply (Resets 2h/3h Timer & Restores Doctor Chat)
app.post('/api/medical-assistant/surgeon-reply', (req: Request, res: Response) => {
  try {
    if (!isAuthorizedMedicalPersonnel(req)) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: Flight Surgeon credentials required to post physician responses.',
      });
    }

    const { astronautId = 'ASTRO-74-SJ', content } = req.body;
    const context = getMedicalAssistantContext(astronautId);

    const replyText =
      content && typeof content === 'string' && content.trim()
        ? content.trim()
        : `This is Dr. Marcus Vance (Flight Surgeon). I have reviewed your latest telemetry (HR ${context.vitalsSnapshot.heartRate} bpm, BP ${context.vitalsSnapshot.bloodPressure}, SpO2 ${context.vitalsSnapshot.spO2}%) and am responding directly in Doctor Chat.`;

    clearServerTimeoutHandle(astronautId);
    // Ensure Doctor status is available when surgeon responds directly
    if (currentDoctorAvailability !== 'available') {
      setDoctorAvailabilityConfig({ doctorStatus: 'available' });
    }
    const surgeonMsg = recordSurgeonReplyToDoctorChat(astronautId, replyText);

    res.json({
      success: true,
      surgeonMessage: surgeonMsg,
      updatedContext: getMedicalAssistantContext(astronautId),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to record Flight Surgeon reply' });
  }
});

// GET /api/medical-assistant/ai-review/:astronautId — Authorized Flight Surgeon Review of Saved AI Conversation History
app.get('/api/medical-assistant/ai-review/:astronautId', (req: Request, res: Response) => {
  try {
    if (!isAuthorizedMedicalPersonnel(req)) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: Flight Surgeon authorization required to review AI medical transcripts.',
      });
    }
    const { astronautId } = req.params;
    const aiHistory = getAuthorizedAiHistory(astronautId);
    res.json({ success: true, data: aiHistory });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to fetch AI review history' });
  }
});

// POST /api/medical-assistant/emergency/acknowledge/:astronautId — Authorized Medical Personnel Acknowledge Emergency
app.post('/api/medical-assistant/emergency/acknowledge/:astronautId', (req: Request, res: Response) => {
  try {
    if (!isAuthorizedMedicalPersonnel(req)) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: Only authorized medical personnel may acknowledge an active emergency alert.',
      });
    }
    const { astronautId } = req.params;
    const { surgeonName = 'Dr. Marcus Vance, M.D.' } = req.body || {};
    const acked = acknowledgeEmergencySession(astronautId, surgeonName);
    res.json({
      success: true,
      acknowledgedSession: acked,
      updatedContext: getMedicalAssistantContext(astronautId),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to acknowledge emergency' });
  }
});

// DELETE /api/medical-assistant/history/:astronautId — Clear separated channel history
app.delete('/api/medical-assistant/history/:astronautId', (req: Request, res: Response) => {
  try {
    const { astronautId } = req.params;
    const channelParam = req.query.channel as 'doctor' | 'ai' | 'all' | undefined;
    if (channelParam === 'doctor' || channelParam === 'all' || !channelParam) {
      clearServerTimeoutHandle(astronautId);
    }
    const history = clearChannelHistory(
      astronautId,
      channelParam === 'all' ? undefined : channelParam
    );
    res.json({ success: true, data: history, updatedContext: getMedicalAssistantContext(astronautId) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to clear history' });
  }
});

// POST /api/ai/insight — Gemini AI Clinical Insight for Vitals
app.post('/api/ai/insight', async (req: Request, res: Response) => {
  try {
    const { vitals, profile } = req.body;
    const hr = vitals?.heartRate ?? 72;
    const bpSys = vitals?.bloodPressureSys ?? 118;
    const bpDia = vitals?.bloodPressureDia ?? 76;
    const spo2 = vitals?.spO2 ?? 99;
    const sleep = vitals?.sleepHours ?? 5.9;
    const baselineHr = profile?.restingHeartRate ?? 58;
    const spineDelta = profile?.spineElongation ?? 4.2;

    const ai = getGeminiClient();
    if (ai) {
      try {
        const prompt = `You are the NASA Flight Surgeon Clinical Co-Pilot aboard the ISS / Artemis Expedition 74.
Analyze the following astronaut bio-telemetry:
- Heart Rate: ${hr} bpm (Resting flight baseline: ${baselineHr} bpm)
- Blood Pressure: ${bpSys}/${bpDia} mmHg
- SpO2: ${spo2}%
- Last Sleep Duration: ${sleep} hours
- Microgravity Spinal Elongation: +${spineDelta} cm
- Mission Elapsed Days: 84 (LEO)

Generate exactly 2 to 3 sentences of concise, actionable clinical insight.
Highlight the correlation between elevated heart rate and the reduced ${sleep} hours of sleep, and advise on hydration or rest. Professional flight medicine tone.`;

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI request timeout')), 5000)
        );

        const response: any = await Promise.race([
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
          }),
          timeoutPromise,
        ]);

        const text = response.text?.trim();
        if (text) {
          return res.json({
            success: true,
            insight: text,
            source: 'gemini-3.8-flash',
            timestamp: new Date().toISOString(),
          });
        }
      } catch (geminiError: any) {
        console.warn('[Gemini AI Insight] Falling back to aerospace clinical rule engine:', geminiError?.message);
      }
    }

    // Aerospace Medicine Clinical Rule Engine Fallback
    const hrDelta = hr - baselineHr;
    let insightText = '';
    if (hrDelta >= 10 && sleep <= 6.0) {
      insightText = `Your resting heart rate is elevated by ${hrDelta} bpm compared to flight baseline (${hr} bpm vs ${baselineHr} bpm). This directly correlates with the reported ${sleep} hours of fragmented sleep in microgravity. Recommend 45 minutes of active recovery, 500 mL electrolytic rehydration, and deferring high-intensity EVA duties until tomorrow.`;
    } else if (hrDelta > 0) {
      insightText = `Your resting heart rate is elevated by ${hrDelta} bpm compared to baseline. This correlates with the reported ${sleep} hours of sleep and microgravity cephalic fluid redistribution. Recommend light aerobic cooldown on CEVIS ergometer and scheduled pod rest.`;
    } else {
      insightText = `Autonomic cardiovascular tone is nominal (${hr} bpm, SpO2 ${spo2}%, BP ${bpSys}/${bpDia} mmHg). Telemetric indices indicate stable adaptation at MET Day 84. Continue scheduled ARED resistance countermeasure protocol.`;
    }

    res.json({
      success: true,
      insight: insightText,
      source: 'clinical-aerospace-matrix',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to generate clinical insight' });
  }
});

// POST /api/chat/astro & /api/ai/chat — Mental Health Companion (ASTRO) via Groq / OpenRouter
const handleAstroChat = async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const trimmedMessage = message.trim();
    const systemPrompt = "You are ASTRO, a compassionate mental health companion for astronauts. You are empathetic, a good listener, and you use cognitive behavioral techniques to help the astronaut manage isolation and stress. Keep responses short, supportive, and non-diagnostic. Do not give medical advice.";

    // Format OpenAI / Groq compatible messages array
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    if (Array.isArray(history) && history.length > 0) {
      const recentHistory = history.slice(-8);
      for (const item of recentHistory) {
        if (item && item.content && typeof item.content === 'string' && item.content.trim()) {
          const role = item.role === 'assistant' ? 'assistant' : 'user';
          messages.push({
            role,
            content: item.content.trim(),
          });
        }
      }
    }

    // Append current user message
    messages.push({
      role: 'user',
      content: trimmedMessage,
    });

    // 1. Primary Provider: Groq (Auto-discovered active model with fast fallbacks)
    const groq = getGroqClient();
    if (groq) {
      const activeModel = await resolveGroqModel(groq);
      const groqCandidateModels = Array.from(new Set([
        activeModel,
        'qwen/qwen3.8-27b',
        'openai/gpt-oss-20b',
        'openai/gpt-oss-120b',
        'llama-3.3-70b-versatile',
        'llama-3.1-8b-instant',
      ]));

      for (const modelId of groqCandidateModels) {
        try {
          const completion = await groq.chat.completions.create({
            messages,
            model: modelId,
            max_tokens: 380,
            temperature: 0.7,
          });
          const reply = completion.choices[0]?.message?.content?.trim();
          if (reply) {
            cachedGroqModel = modelId;
            return res.json({
              success: true,
              reply,
              source: `groq/${modelId}`,
            });
          }
        } catch (groqError: any) {
          if (groqError?.status === 404 || groqError?.message?.includes('not exist')) {
            continue;
          }
          console.warn(`[Groq Error with ${modelId}]:`, groqError?.message);
        }
      }
    }

    // 2. Secondary Fallback: OpenRouter (openrouter/free or gemma-4)
    const openRouterKey = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;
    if (openRouterKey) {
      const orCandidates = ['openrouter/free', 'google/gemma-4-31b-it:free', 'deepseek/deepseek-chat:free'];
      for (const orModel of orCandidates) {
        try {
          const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openRouterKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://astrocare.internal',
              'X-Title': 'ASTROCARE Health Intelligence',
            },
            body: JSON.stringify({
              model: orModel,
              messages,
              max_tokens: 350,
            }),
          });
          if (orRes.ok) {
            const orData = await orRes.json();
            const choice = orData.choices?.[0];
            const reply = choice?.message?.content?.trim() || choice?.message?.reasoning?.trim();
            if (reply) {
              return res.json({
                success: true,
                reply,
                source: `openrouter/${orModel}`,
              });
            }
          }
        } catch (orError: any) {
          console.warn(`[OpenRouter ${orModel} Error]:`, orError?.message);
        }
      }
    }

    // 3. Tertiary Fallback: Gemini (if key exists)
    const gemini = getGeminiClient();
    if (gemini) {
      try {
        const geminiContents = messages
          .filter((m) => m.role !== 'system')
          .map((m) => ({
            role: (m.role === 'assistant' ? 'model' : 'user') as 'model' | 'user',
            parts: [{ text: m.content }],
          }));

        while (geminiContents.length > 0 && geminiContents[0].role === 'model') {
          geminiContents.shift();
        }
        if (geminiContents.length === 0) {
          geminiContents.push({ role: 'user', parts: [{ text: trimmedMessage }] });
        }

        const response: any = await Promise.race([
          gemini.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: geminiContents,
            config: { systemInstruction: systemPrompt },
          }),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('AI request timeout')), 5000)),
        ]);
        const text = response.text?.trim();
        if (text) {
          return res.json({
            success: true,
            reply: text,
            source: 'gemini-3.8-flash',
          });
        }
      } catch (geminiError: any) {
        console.warn('[Gemini Fallback Error]:', geminiError?.message);
      }
    }

    // 4. Resilient Aerospace CBT Mental Health Engine (Guarantees zero downtime)
    const lower = trimmedMessage.toLowerCase();
    let localReply = "I'm right here with you, Dr. Salma. Operating in microgravity aboard Expedition 74 places unique psychological demands on every crew member. Let's take a calm, grounding breath. What are you feeling most in your cabin right now?";

    if (lower.includes('sleep') || lower.includes('tired') || lower.includes('insomnia') || lower.includes('wake') || lower.includes('rest')) {
      localReply = "Sleep architecture often fragments in LEO due to 16 daily orbital sunsets and microgravity fluid shifts. I recommend activating our 4-4-4-4 Box Breathing exercise and setting cabin light levels to warm 2700K.";
    } else if (lower.includes('homesick') || lower.includes('home') || lower.includes('family') || lower.includes('earth') || lower.includes('miss')) {
      localReply = "Watching Earth from the station window while feeling so distant from family is a known psychological effect in long-duration missions. Your emotions are completely valid. We can schedule a private family audio uplink during the next ground pass.";
    } else if (lower.includes('stress') || lower.includes('anxious') || lower.includes('anxiety') || lower.includes('overwhelm') || lower.includes('panic')) {
      localReply = "When physiological stress peaks, let's anchor into the physical body. Drop your shoulders away from your ears, relax your jaw, and notice the ambient ventilation hum. We'll take this mission one timeline block at a time.";
    } else if (lower.includes('grounding') || lower.includes('breath') || lower.includes('mindful') || lower.includes('calm')) {
      localReply = "Let's do a quick microgravity sensory check: Notice the secure touch of your foot restraints, feel the fresh airflow from the ECLSS vent, and take four slow seconds to inhale, then four seconds to exhale. You are in control.";
    }

    return res.json({
      success: true,
      reply: localReply,
      source: 'astro-companion-resilience-core',
    });
  } catch (error: any) {
    console.error('[ASTRO Chat Server Error]:', error?.message);
    res.status(500).json({
      success: false,
      error: 'ASTRO is currently unavailable. Please try again later.',
    });
  }
};

app.post('/api/chat/astro', handleAstroChat);
app.post('/api/ai/chat', handleAstroChat);


// ─── Fitness / Exercise Endpoints ───────────────────────────────────────────

// GET /api/fitness/exercises — All exercises evaluated against current astronaut profile
app.get('/api/fitness/exercises', (_req: Request, res: Response) => {
  try {
    const { exercises, restricted } = evaluateExercisesForAstronaut();
    res.json({ success: true, data: exercises, restricted });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to fetch exercises' });
  }
});

// GET /api/fitness/exercises/:category — Exercises filtered by category
app.get('/api/fitness/exercises/:category', (req: Request, res: Response) => {
  try {
    const rawCategory = req.params.category;
    const validCategories: ExerciseCategory[] = ['Upper Body', 'Lower Body', 'Core', 'Full Body'];
    // Accept URL-friendly formats: "Upper%20Body", "upper-body", "Upper Body"
    const normalized = decodeURIComponent(rawCategory).replace(/-/g, ' ');
    const matched = validCategories.find(
      (c) => c.toLowerCase() === normalized.toLowerCase()
    );

    if (!matched) {
      return res.status(400).json({
        success: false,
        error: `Invalid category "${rawCategory}". Valid categories: ${validCategories.join(', ')}`,
      });
    }

    // Evaluate against astronaut profile then filter by category
    const { exercises, restricted } = evaluateExercisesForAstronaut();
    const filtered = exercises.filter((e) => e.category === matched);
    const filteredRestricted = restricted.filter((r) =>
      filtered.some((e) => e.id === r.exerciseId)
    );

    res.json({ success: true, data: filtered, restricted: filteredRestricted });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to fetch exercises by category' });
  }
});

// POST /api/fitness/ai-analysis — Gemini AI fitness analysis for current astronaut
app.post('/api/fitness/ai-analysis', async (req: Request, res: Response) => {
  try {
    const profile = getProfile();
    const vitals = getVitals();
    const symptoms = getSymptoms();
    const { exercises, restricted } = evaluateExercisesForAstronaut();

    const ai = getGeminiClient();
    if (ai) {
      try {
        const prompt = `You are the NASA Flight Surgeon Exercise Physiology Co-Pilot aboard Expedition 74.

ASTRONAUT PROFILE:
- Name: ${profile.name}
- Age: ${profile.age}
- Role: ${profile.role}
- Mission Elapsed Days: ${profile.missionElapsedDays}
- Health Status: ${profile.healthStatus}
- Height: ${profile.heightCm} cm, Weight: ${profile.weightKg} kg
- Spine Elongation: +${profile.spineElongation} cm
- Conditions: ${profile.conditions.join('; ')}
- Allergies: ${profile.allergies.join(', ')}

CURRENT VITALS:
- Heart Rate: ${vitals.heartRate} bpm (baseline: ${profile.restingHeartRate} bpm)
- Blood Pressure: ${vitals.bloodPressureSys}/${vitals.bloodPressureDia} mmHg
- SpO2: ${vitals.spO2}%
- Temperature: ${vitals.temperature}°C
- Sleep: ${vitals.sleepHours} hours
- HRV: ${vitals.hrvMs} ms

ACTIVE SYMPTOMS:
${symptoms.filter(s => s.status !== 'resolved').map(s => `- ${s.bodyPart}: ${s.painType} pain, intensity ${s.intensity}/10. ${s.notes}`).join('\n') || 'None reported'}

CURRENTLY RESTRICTED EXERCISES:
${restricted.map(r => `- ${r.exerciseId}: ${r.reason}`).join('\n') || 'None'}

AVAILABLE EXERCISES (IDs):
${exercises.filter(e => e.status !== 'restricted').map(e => `- ${e.id} (${e.name}, ${e.category}, ${e.intensity} intensity, ${e.durationMinutes} min)`).join('\n')}

Based on the astronaut's complete profile, vitals, symptoms, and conditions, generate a fitness analysis as a JSON object with EXACTLY this structure (no markdown, no backticks, just raw JSON):
{
  "overallAssessment": "2-3 sentence overall fitness assessment for this astronaut",
  "recommendedExercises": ["array of exercise IDs that are safe and beneficial"],
  "restrictedExercises": [{"exerciseId": "id", "reason": "why restricted"}],
  "dailyPlan": "A structured daily exercise plan with specific exercises, durations, and order",
  "cautions": ["array of specific cautions based on their conditions"],
  "timestamp": "${new Date().toISOString()}"
}`;

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI request timeout')), 12000)
        );

        const response: any = await Promise.race([
          ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
          }),
          timeoutPromise,
        ]);

        const text = response.text?.trim();
        if (text) {
          try {
            // Strip markdown code fences if present
            const cleaned = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
            const analysis: FitnessAIAnalysis = JSON.parse(cleaned);
            return res.json({
              success: true,
              data: analysis,
              source: 'gemini-2.0-flash',
            });
          } catch {
            // If JSON parsing fails, return as raw assessment
            return res.json({
              success: true,
              data: {
                overallAssessment: text,
                recommendedExercises: exercises.filter(e => e.status !== 'restricted').map(e => e.id),
                restrictedExercises: restricted,
                dailyPlan: 'AI-generated plan could not be parsed. See overall assessment.',
                cautions: ['AI response was non-structured. Review overall assessment manually.'],
                timestamp: new Date().toISOString(),
              } as FitnessAIAnalysis,
              source: 'gemini-2.0-flash-raw',
            });
          }
        }
      } catch (geminiError: any) {
        console.warn('[Gemini Fitness AI] Falling back to rule engine:', geminiError?.message);
      }
    }

    // ── Local Rule-Engine Fallback ──
    const availableExercises = exercises.filter((e) => e.status !== 'restricted');
    const hrDelta = vitals.heartRate - profile.restingHeartRate;
    const isHighHR = hrDelta > 10;
    const isPoorSleep = vitals.sleepHours < 6;
    const hasSpinalIssue = profile.spineElongation > 3;

    const cautions: string[] = [];
    if (isHighHR) cautions.push(`Elevated resting heart rate (+${hrDelta} bpm over baseline). Avoid high-intensity exercises until HR normalizes.`);
    if (isPoorSleep) cautions.push(`Insufficient sleep (${vitals.sleepHours}h). Prioritize low-to-moderate intensity and include recovery periods.`);
    if (hasSpinalIssue) cautions.push(`Spinal elongation of +${profile.spineElongation} cm detected. Axial loading exercises require caution and Flight Surgeon clearance.`);

    // Build recommended list: prefer low/moderate if fatigued
    let recommended = availableExercises;
    if (isHighHR || isPoorSleep) {
      recommended = availableExercises.filter((e) => e.intensity !== 'High');
    }

    const dailyPlanParts: string[] = [];
    dailyPlanParts.push('1. Warm-up: 5 min light CEVIS cycling at low resistance');
    const picked = recommended.slice(0, 5);
    picked.forEach((ex, i) => {
      dailyPlanParts.push(`${i + 2}. ${ex.name} — ${ex.durationMinutes} min (${ex.intensity} intensity)`);
    });
    dailyPlanParts.push(`${picked.length + 2}. Cool-down: 5 min stretching and controlled breathing`);

    const overallLines: string[] = [];
    overallLines.push(`Astronaut ${profile.name} is on MET Day ${profile.missionElapsedDays} with health status: ${profile.healthStatus}.`);
    if (restricted.length > 0) overallLines.push(`${restricted.length} exercise(s) are currently restricted due to active conditions.`);
    if (isHighHR || isPoorSleep) overallLines.push('Reduced-intensity protocol recommended due to elevated HR and/or insufficient sleep.');
    else overallLines.push('Standard countermeasure exercise protocol is recommended.');

    const fallbackAnalysis: FitnessAIAnalysis = {
      overallAssessment: overallLines.join(' '),
      recommendedExercises: recommended.map((e) => e.id),
      restrictedExercises: restricted,
      dailyPlan: dailyPlanParts.join('\n'),
      cautions,
      timestamp: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: fallbackAnalysis,
      source: 'fitness-rule-engine',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to generate fitness AI analysis' });
  }
});

// POST /api/fitness/chat — Interactive chat with NASA Exercise Physiologist Agent
app.post('/api/fitness/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const profile = getProfile();
    const vitals = getVitals();
    const symptoms = getSymptoms();
    const { exercises, restricted } = evaluateExercisesForAstronaut();

    const systemPrompt = `You are Commander Vance, the NASA Lead Exercise Physiologist and Countermeasures Specialist for ISS Expedition 74.
You are directly speaking with Astronaut ${profile.name} (Callsign: ${profile.callsign}).
Her clinical status:
- Microgravity Spinal Elongation: +${profile.spineElongation} cm
- Conditions: ${profile.conditions.join(', ')}
- Current Resting Heart Rate: ${vitals.heartRate} bpm (flight baseline: ${profile.restingHeartRate} bpm)
- Blood Pressure: ${vitals.bloodPressureSys}/${vitals.bloodPressureDia} mmHg, SpO2: ${vitals.spO2}%, Sleep: ${vitals.sleepHours} hrs
- Active Symptoms: ${symptoms.filter(s => s.status !== 'resolved').map(s => `${s.bodyPart} (${s.painType}, intensity ${s.intensity}/10)`).join(', ') || 'None'}
- Currently Restricted Exercises due to safety: ${restricted.map(r => `${r.exerciseId} (${r.reason})`).join('; ')}
- Safe Available Countermeasures: CEVIS cycling, Bench Press, Heel Raises, Core stabilization, Resistive Band circuit.

Instructions:
1. Provide concise, expert NASA aerospace exercise guidance (2 to 4 sentences).
2. Explicitly explain why heavy axial spine compressive loads (like ARED squats/deadlifts or heavy treadmill running) are locked/dangerous if asked, noting her +${profile.spineElongation} cm disc expansion and lumbar ache.
3. Recommend safe alternatives (e.g. CEVIS ergometer, gentle resistance bands, decompression stretches).
4. Keep tone professional, encouraging, and authoritative in spaceflight human physiology.`;

    const ai = getGeminiClient();
    if (ai) {
      try {
        const contents: any[] = [];
        if (Array.isArray(history) && history.length > 0) {
          for (const item of history.slice(-6)) {
            if (item && item.content) {
              contents.push({
                role: item.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: item.content }],
              });
            }
          }
        }
        while (contents.length > 0 && contents[0].role === 'model') {
          contents.shift();
        }
        contents.push({
          role: 'user',
          parts: [{ text: message.trim() }],
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI request timeout')), 8000)
        );

        const response: any = await Promise.race([
          ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents,
            config: { systemInstruction: systemPrompt },
          }),
          timeoutPromise,
        ]);

        const text = response.text?.trim();
        if (text) {
          return res.json({
            success: true,
            reply: text,
            source: 'gemini-2.0-flash',
          });
        }
      } catch (geminiError: any) {
        console.warn('[Fitness Chat Gemini Error]:', geminiError?.message);
      }
    }

    // Local Aerospace Exercise Medicine Rule Engine Fallback
    const lower = message.toLowerCase();
    let reply = `Astronaut ${profile.callsign}, with your current +${profile.spineElongation} cm spinal elongation and lumbar sensitivity, we must strictly preserve disc hydration and avoid heavy axial loading. Focus today on the CEVIS ergometer at 75% VO2 max and light resistance bands.`;

    if (lower.includes('squat') || lower.includes('deadlift') || lower.includes('why locked') || lower.includes('restricted') || lower.includes('spine') || lower.includes('back')) {
      reply = `ARED heavy squats and deadlifts are locked because axial compressive loads pose immediate disc herniation risk under your current +${profile.spineElongation} cm microgravity spinal elongation and active L3-L5 discomfort. Stick to unweighted core stabilization and CEVIS cycling today.`;
    } else if (lower.includes('cardio') || lower.includes('run') || lower.includes('treadmill') || lower.includes('t2')) {
      reply = `T2 Treadmill bungee harness loading creates repetitive shockwaves along the decompressed spinal column. CEVIS cycle ergometer is cleared and recommended today for 30 minutes to maintain cardiovascular endurance without vertebral impact.`;
    } else if (lower.includes('tired') || lower.includes('fatigue') || lower.includes('sleep') || lower.includes('heart')) {
      reply = `Given your ${vitals.sleepHours}h of fragmented sleep and elevated resting heart rate (${vitals.heartRate} bpm vs ${profile.restingHeartRate} baseline), reduce workout intensity by 30%. Limit to 20 minutes on CEVIS followed by hamstring decompression stretching.`;
    } else if (lower.includes('recommend') || lower.includes('what should i do') || lower.includes('routine') || lower.includes('today')) {
      reply = `Today's cleared flight plan: 1) 5 min CEVIS warm-up, 2) ARED Bench Press (3 sets x 10 reps), 3) ARED Heel Raises, 4) 20 min CEVIS aerobic cycle, 5) 10 min microgravity decompression stretches. All spinal loading exercises remain locked.`;
    }

    return res.json({
      success: true,
      reply,
      source: 'fitness-aerospace-matrix',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to process chat message' });
  }
});


// Mount Vite or static server
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ASTROCARE] Server running on http://0.0.0.0:${PORT}`);
    setInterval(() => {
      sweepExpiredDoctorTimeouts().catch((err) =>
        console.warn('[Background SLA Sweep Error]:', err?.message)
      );
    }, 15000);
  });
}

startServer();
