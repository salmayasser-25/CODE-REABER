import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { UpdateProfileSchema } from './src/types/astronaut.js';
import { getProfile, updateProfile } from './src/server/mockDb.js';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

// Support JSON payloads including base64 image previews
app.use(express.json({ limit: '15mb' }));

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    system: 'ASTROCARE Health Intelligence Core',
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
