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
