import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';
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
