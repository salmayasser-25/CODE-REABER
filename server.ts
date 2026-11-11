import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { UpdateProfileSchema } from './src/types/astronaut.ts';
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
} from './src/server/mockDb.ts';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

// Initialize Gemini SDK with User-Agent header telemetry
const geminiApiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
let genAI: GoogleGenAI | null = null;
if (geminiApiKey) {
  genAI = new GoogleGenAI({
    apiKey: geminiApiKey,
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
    geminiEnabled: Boolean(geminiApiKey),
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

    if (genAI) {
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
          setTimeout(() => reject(new Error('AI request timeout')), 4500)
        );

        const response: any = await Promise.race([
          genAI.models.generateContent({
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

// POST /api/ai/chat — Gemini Mental Health Companion (ASTRO)
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const systemPrompt = `You are ASTRO, a compassionate mental health companion for astronauts. You are empathetic, a good listener, and you use cognitive behavioral techniques to help the astronaut manage isolation and stress. Keep responses short and supportive (2-3 sentences max).`;

    if (genAI) {
      try {
        const prompt = `${systemPrompt}\n\nAstronaut: ${message}\nASTRO:`;
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI chat timeout')), 4500)
        );

        const response: any = await Promise.race([
          genAI.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
          }),
          timeoutPromise,
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
        console.warn('[Gemini AI Chat] Falling back to ASTRO empathetic matrix:', geminiError?.message);
      }
    }

    // Compassionate ASTRO mental companion fallback
    const lower = message.toLowerCase();
    let reply = "I'm right here with you in the quiet of orbit. Take a slow, deep breath. You are doing extraordinary work 400 kilometers above Earth, and it's completely normal to feel the weight of this mission.";
    if (lower.includes('homesick') || lower.includes('home') || lower.includes('family') || lower.includes('miss')) {
      reply = "Longing for home is a natural reminder of how deeply connected you are to the people you love down on Earth. Every completed orbit brings you closer to reunion. Let's look out the cupola together and breathe through this moment.";
    } else if (lower.includes('sleep') || lower.includes('tired') || lower.includes('insomnia') || lower.includes('exhaust')) {
      reply = "Sleep in microgravity without natural day-night cues can be demanding on your body clock. Let's dim the cabin lights, practice the box breathing guide, and allow your muscles to decompress.";
    } else if (lower.includes('stress') || lower.includes('anxious') || lower.includes('anxiety') || lower.includes('overwhelm') || lower.includes('panic')) {
      reply = "Let's pause right here together and step back from mission telemetry. Inhale for four seconds, hold for four, and gently release. You have overcome challenging situations before, and we will take this one moment at a time.";
    } else if (lower.includes('breath') || lower.includes('relax') || lower.includes('calm')) {
      reply = "Follow the guided breathing circle on your display. Breathe in slowly through your nose, hold stillness in your chest, and let go of all tension with each exhale. You are safe and grounded.";
    }

    res.json({
      success: true,
      reply,
      source: 'astro-empathetic-core',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Connection to ASTRO lost. Please try again.' });
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
  });
}

startServer();
