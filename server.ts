import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';
import { UpdateProfileSchema } from './src/types/astronaut.ts';
import type { ExerciseCategory, FitnessAIAnalysis } from './src/types/astronaut.ts';
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
  addTimelineEvent,
} from './src/server/mockDb.ts';
import {
  getNutritionInventory,
  getDailyNutritionLog,
  takeNutrientItem,
  logHydration,
  getInventoryAlerts,
} from './src/server/nutriDb.ts';

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

// ─── NutriLog & Bio-Kitchen API Endpoints ─────────────────────────────────────

app.get('/api/nutrition/inventory', (_req: Request, res: Response) => {
  try {
    const inventory = getNutritionInventory();
    res.json({ success: true, data: inventory });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to fetch inventory' });
  }
});

app.get('/api/nutrition/daily-log', (_req: Request, res: Response) => {
  try {
    const log = getDailyNutritionLog();
    res.json({ success: true, data: log });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to fetch daily nutrition log' });
  }
});

app.get('/api/nutrition/alerts', (_req: Request, res: Response) => {
  try {
    const alerts = getInventoryAlerts();
    res.json({ success: true, data: alerts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to fetch inventory alerts' });
  }
});

app.post('/api/nutrition/take', (req: Request, res: Response) => {
  try {
    const { itemId, qty = 1 } = req.body;
    if (!itemId) {
      return res.status(400).json({ success: false, error: 'itemId is required' });
    }

    const result = takeNutrientItem(itemId, Number(qty));
    if (!result) {
      return res.status(404).json({ success: false, error: 'Item not found or insufficient stock' });
    }

    addTimelineEvent({
      type: 'vitals',
      title: `Nutrition Intake: ${result.item.name}`,
      summary: `Administered ${qty}x ${result.item.unit} (${result.item.category}). Calories: +${(result.item.calories || 0) * qty} kcal. Key nutrients: ${result.item.keyNutrients.join(', ')}`,
      severity: 'nominal',
      badge: 'NUTRILOG',
      details: {
        itemId: result.item.id,
        category: result.item.category,
        remainingStock: result.item.currentStock,
      },
    });

    res.json({
      success: true,
      item: result.item,
      log: result.log,
      message: `${result.item.name} recorded and inventory synchronized.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to log nutrient consumption' });
  }
});

app.post('/api/nutrition/hydration', (req: Request, res: Response) => {
  try {
    const { amountMl } = req.body;
    if (!amountMl || typeof amountMl !== 'number') {
      return res.status(400).json({ success: false, error: 'Valid amountMl number is required' });
    }

    const log = logHydration(amountMl);

    if (log.hydrationLiters >= 2.0 && log.hydrationLiters - (amountMl / 1000) < 2.0) {
      addTimelineEvent({
        type: 'vitals',
        title: 'Daily Hydration Milestone Reached',
        summary: `Current intake: ${log.hydrationLiters} L / 2.5 L goal. Counteracting cephalic fluid shift and renal calculus risk.`,
        severity: 'nominal',
        badge: 'HYDRATION',
      });
    }

    res.json({ success: true, log, message: `+${amountMl} mL hydration logged.` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to log hydration' });
  }
});

app.post('/api/nutrition/ai-plan', async (req: Request, res: Response) => {
  try {
    const { profile } = req.body;
    const radDose = profile?.radiationDoseMsv ?? 14.8;
    const spineDelta = profile?.spineElongation ?? 4.2;
    const hr = profile?.restingHeartRate ?? 58;
    const missionDay = profile?.missionElapsedDays ?? 84;

    const ai = getGeminiClient();
    if (ai) {
      try {
        const prompt = `You are the NASA Flight Surgeon & Space Nutrition Lead aboard the Artemis / ISS Expedition.
Generate a concise, 4 to 5 bullet point Daily Space Nutrition & Countermeasure Protocol for Astronaut Dr. Salma Johnson (MET Day ${missionDay}):
- Cumulative Ionizing Radiation Dose: ${radDose} mSv
- Microgravity Spine Elongation: +${spineDelta} cm
- Resting Baseline HR: ${hr} bpm

Requirements:
- Specify exact NASA dietary countermeasures (e.g. Lycopene/Vitamin E for radiation DNA protection, Calcium/D3 & Collagen for microgravity bone demineralization, Electrolytes for fluid shift).
- Tone: Professional aerospace clinical protocol. Bullet points starting with emojis.`;

        const response: any = await Promise.race([
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
          }),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('AI request timeout')), 5000)),
        ]);

        const text = response.text?.trim();
        if (text) {
          return res.json({ success: true, plan: text, source: 'gemini-3.8-flash' });
        }
      } catch (geminiError: any) {
        console.warn('[Gemini Nutri Plan fallback]:', geminiError?.message);
      }
    }

    const fallbackLines = [
      `🍅 Radiation Protocol: Cumulative dose at ${radDose} mSv. Prioritize 1x Lycopene Pouch + 2x Vitamin E & C Shield Tablets to quench ionizing free radicals.`,
      `🦴 Musculoskeletal Countermeasure: +${spineDelta} cm spinal elongation detected. Take Calcium-D3 Yogurt Pouch + Collagen Pack post-ARED resistance workout.`,
      `💧 Electrolyte & Fluid Balance: Drink minimum 2.5 L treated water with 1x Electrolyte Sachet to prevent orthostatic intolerance.`,
      `😴 Circadian & Recovery: Take Magnesium Glycinate + Chamomile Infusion 45 minutes before sleep pod light dimming.`,
      `🧠 Neuro-Cognitive Defense: 2x Omega-3 DHA/EPA softgels with lunch to preserve neuronal membranes against cosmic ray micro-trauma.`,
    ];

    res.json({
      success: true,
      plan: fallbackLines.join('\n'),
      source: 'aerospace-clinical-matrix',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to generate meal plan' });
  }
});


// Mount Vite or static server
async function startServer() {
  const fs = await import('fs');
  const path = await import('path');

  // 1. Serve public static assets (images, icons, 3D models)
  app.use(express.static(path.resolve(process.cwd(), 'public')));

  // 2. Check for built production bundle in dist/
  const distPath = path.resolve(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.resolve(distPath, 'index.html'));

  if (isProd || hasDist) {
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response, next) => {
      if (req.originalUrl.startsWith('/api')) return next();
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    // 3. Vite development SPA middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ASTROCARE] Server running on http://0.0.0.0:${PORT}`);
  });
}

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ASTROCARE] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
