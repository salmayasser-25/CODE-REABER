// ─── NutriLog: Space Nutrition & Hydration System ─────────────────────────────
// Types for the Bio-Kitchen & Dispensary Module
// NASA Space Apps Challenge – AstroCare / CODE-REAPER1

export type NutrientCategory = 'radiation-shield' | 'bone-muscle' | 'hydration' | 'sleep-recovery' | 'cognitive' | 'general';
export type InventoryStatus = 'full' | 'adequate' | 'low' | 'critical';

export interface NutrientItem {
  id: string;
  name: string;
  emoji: string;
  category: NutrientCategory;
  description: string;
  unit: string;                  // e.g. "pouch", "tablet", "bag"
  dosePerDay: number;            // recommended dose per mission day
  currentStock: number;          // remaining units
  initialStock: number;          // stock at mission start
  calories?: number;             // kcal per unit
  keyNutrients: string[];        // e.g. ["Vitamin D3", "Calcium"]
  healthTrigger?: {              // when to flag this item as PRIORITY
    metric: 'radiation' | 'bone' | 'sleep' | 'heartRate' | 'spO2';
    threshold: number;
    direction: 'above' | 'below';
  };
  lastTakenAt?: string;          // ISO timestamp
  color: string;                 // Tailwind color token for card accent
  glowColor: string;             // CSS rgba for card glow
}

export interface DailyNutritionLog {
  id: string;
  missionDay: number;
  date: string;                  // ISO timestamp
  consumedItems: Array<{
    itemId: string;
    name: string;
    qty: number;
    takenAt: string;
  }>;
  totalCalories: number;
  hydrationLiters: number;
  hydrationGoalLiters: number;   // 2.5 L recommended for spaceflight
  hydrationSessions: Array<{     // each drink event
    amount: number;              // in mL
    takenAt: string;
  }>;
  nutritionScore: number;        // 0–100 composite score
  surgeonFlagged: boolean;       // flag for Flight Surgeon dashboard
  notes?: string;
}

export interface NutritionInventoryAlertPayload {
  itemId: string;
  itemName: string;
  currentStock: number;
  daysRemaining: number;
  severity: 'low' | 'critical';
}

