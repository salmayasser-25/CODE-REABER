import { AstronautProfile, UpdateProfileInput } from '../types/astronaut.js';

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
