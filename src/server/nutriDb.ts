// ─── NutriLog Mock Database ───────────────────────────────────────────────────
// In-memory data store for nutrition inventory, daily logs, and alerts
// NASA Space Apps Challenge – AstroCare / CODE-REAPER1

import type { NutrientItem, DailyNutritionLog, NutritionInventoryAlertPayload } from '../types/nutrition.ts';

// ── INVENTORY: 17 curated Space Food & Supplement items ───────────────────────
export let nutritionInventory: NutrientItem[] = [
  // ── RADIATION SHIELD ─────────────────────────────────────────────────────
  {
    id: 'RAD-01',
    name: 'Lycopene Antioxidant Pouch',
    emoji: '🍅',
    category: 'radiation-shield',
    description: 'Lycopene-concentrated tomato extract neutralizes free radicals from cosmic ionizing radiation. Clinically validated in NASA GeneLab murine studies.',
    unit: 'pouch',
    dosePerDay: 1,
    currentStock: 24,
    initialStock: 180,
    calories: 15,
    keyNutrients: ['Lycopene 20mg', 'Vitamin C 200mg', 'Selenium 55mcg'],
    healthTrigger: { metric: 'radiation', threshold: 1.0, direction: 'above' },
    color: 'rose',
    glowColor: 'rgba(244,63,94,0.3)',
  },
  {
    id: 'RAD-02',
    name: 'Vitamin E & C Shield Tablet',
    emoji: '💊',
    category: 'radiation-shield',
    description: 'Fat-soluble antioxidants (α-tocopherol + ascorbic acid) form a dual-layer cellular membrane defense against space radiation DNA strand breaks.',
    unit: 'tablet',
    dosePerDay: 2,
    currentStock: 48,
    initialStock: 360,
    calories: 5,
    keyNutrients: ['Vitamin E 400 IU', 'Vitamin C 1000mg'],
    healthTrigger: { metric: 'radiation', threshold: 1.0, direction: 'above' },
    color: 'amber',
    glowColor: 'rgba(245,158,11,0.3)',
  },
  {
    id: 'RAD-03',
    name: 'Spirulina Space Bar',
    emoji: '🌿',
    category: 'radiation-shield',
    description: 'Phycocyanin-rich cyanobacteria superfood proven to reduce radiation-induced oxidative stress. High protein (71% by weight) for tissue repair.',
    unit: 'bar',
    dosePerDay: 1,
    currentStock: 30,
    initialStock: 180,
    calories: 110,
    keyNutrients: ['Spirulina 5g', 'Phycocyanin 200mg', 'Iron 2mg', 'B12 4mcg'],
    healthTrigger: { metric: 'radiation', threshold: 0.5, direction: 'above' },
    color: 'emerald',
    glowColor: 'rgba(16,185,129,0.3)',
  },

  // ── BONE & MUSCLE ─────────────────────────────────────────────────────────
  {
    id: 'BONE-01',
    name: 'Calcium-D3 Space Yogurt Pouch',
    emoji: '🫙',
    category: 'bone-muscle',
    description: 'Specially formulated with hydroxyapatite calcium (95% bioavailability) + D3 for weight-bearing bone maintenance under microgravity demineralization.',
    unit: 'pouch',
    dosePerDay: 1,
    currentStock: 18,
    initialStock: 180,
    calories: 95,
    keyNutrients: ['Calcium 1200mg', 'Vitamin D3 2000 IU', 'Magnesium 400mg'],
    healthTrigger: { metric: 'bone', threshold: 90, direction: 'below' },
    color: 'sky',
    glowColor: 'rgba(14,165,233,0.3)',
  },
  {
    id: 'BONE-02',
    name: 'Collagen-Peptide Protein Pack',
    emoji: '💪',
    category: 'bone-muscle',
    description: 'Hydrolyzed Type-I collagen stimulates osteoblastic bone formation and maintains tendon integrity under ARED resistance loading protocols.',
    unit: 'pack',
    dosePerDay: 1,
    currentStock: 22,
    initialStock: 180,
    calories: 55,
    keyNutrients: ['Collagen Peptides 15g', 'Glycine 1200mg', 'Proline 900mg'],
    healthTrigger: { metric: 'bone', threshold: 90, direction: 'below' },
    color: 'orange',
    glowColor: 'rgba(249,115,22,0.3)',
  },

  // ── HYDRATION ─────────────────────────────────────────────────────────────
  {
    id: 'HYD-01',
    name: 'Electrolyte Rehydration Sachet',
    emoji: '💧',
    category: 'hydration',
    description: 'Isotonic blend of sodium, potassium, and magnesium calibrated to spacecraft atmosphere humidity (~40% RH). Counteracts cephalic fluid shift dehydration.',
    unit: 'sachet',
    dosePerDay: 2,
    currentStock: 55,
    initialStock: 360,
    calories: 25,
    keyNutrients: ['Sodium 460mg', 'Potassium 200mg', 'Magnesium 80mg'],
    healthTrigger: { metric: 'heartRate', threshold: 85, direction: 'above' },
    color: 'cyan',
    glowColor: 'rgba(6,182,212,0.3)',
  },
  {
    id: 'HYD-02',
    name: 'Coconut Water Pouch',
    emoji: '🥥',
    category: 'hydration',
    description: 'Natural electrolytes with low osmolarity for rapid cellular rehydration. High potassium prevents hypokalemia in prolonged microgravity fluid redistribution.',
    unit: 'pouch',
    dosePerDay: 1,
    currentStock: 28,
    initialStock: 180,
    calories: 45,
    keyNutrients: ['Potassium 600mg', 'Natural Sugars 11g', 'Cytokinin antioxidants'],
    color: 'teal',
    glowColor: 'rgba(20,184,166,0.3)',
  },

  // ── SLEEP & RECOVERY ─────────────────────────────────────────────────────
  {
    id: 'SLEEP-01',
    name: 'Magnesium Glycinate Capsule',
    emoji: '😴',
    category: 'sleep-recovery',
    description: 'Highly bioavailable magnesium chelate promotes GABA-mediated neurological relaxation, correcting microgravity-disrupted sleep architecture and circadian rhythm.',
    unit: 'capsule',
    dosePerDay: 2,
    currentStock: 60,
    initialStock: 360,
    calories: 0,
    keyNutrients: ['Magnesium Glycinate 400mg'],
    healthTrigger: { metric: 'sleep', threshold: 6, direction: 'below' },
    color: 'indigo',
    glowColor: 'rgba(99,102,241,0.3)',
  },
  {
    id: 'SLEEP-02',
    name: 'Chamomile Infusion Bag',
    emoji: '🫖',
    category: 'sleep-recovery',
    description: 'Apigenin-rich botanical (0.3mg flavonoid/bag) binds GABA-A receptors, reducing pre-sleep anxiety. Warmed water also supports circadian temperature phase shift.',
    unit: 'bag',
    dosePerDay: 1,
    currentStock: 42,
    initialStock: 252,
    calories: 2,
    keyNutrients: ['Apigenin 0.3mg', 'Bisabolol 0.1mg'],
    healthTrigger: { metric: 'sleep', threshold: 6, direction: 'below' },
    color: 'yellow',
    glowColor: 'rgba(234,179,8,0.3)',
  },
  {
    id: 'SLEEP-03',
    name: 'Melatonin 0.5mg Micro-Tablet',
    emoji: '🌙',
    category: 'sleep-recovery',
    description: 'Low-dose melatonin (physiological range) synchronizes circadian phase in 16-sunrise/day orbital environment. NASA HERA study approved protocol.',
    unit: 'micro-tablet',
    dosePerDay: 1,
    currentStock: 35,
    initialStock: 180,
    calories: 0,
    keyNutrients: ['Melatonin 0.5mg'],
    healthTrigger: { metric: 'sleep', threshold: 6, direction: 'below' },
    color: 'purple',
    glowColor: 'rgba(168,85,247,0.3)',
  },

  // ── COGNITIVE ─────────────────────────────────────────────────────────────
  {
    id: 'COG-01',
    name: 'Omega-3 DHA/EPA Softgel',
    emoji: '🧠',
    category: 'cognitive',
    description: 'Marine-sourced DHA (1200mg) maintains neuronal membrane fluidity and reduces neuroinflammation from cosmic radiation cognitive load.',
    unit: 'softgel',
    dosePerDay: 2,
    currentStock: 50,
    initialStock: 360,
    calories: 15,
    keyNutrients: ['DHA 1200mg', 'EPA 600mg', 'Astaxanthin 2mg'],
    color: 'blue',
    glowColor: 'rgba(59,130,246,0.3)',
  },
  {
    id: 'COG-02',
    name: 'Adaptogen Focus Pouch',
    emoji: '⚡',
    category: 'cognitive',
    description: 'Ashwagandha + Rhodiola Rosea blend reduces cortisol accumulation and maintains hypothalamic-pituitary axis resilience during prolonged isolation.',
    unit: 'pouch',
    dosePerDay: 1,
    currentStock: 20,
    initialStock: 180,
    calories: 10,
    keyNutrients: ['Ashwagandha KSM-66 600mg', 'Rhodiola 200mg', 'L-Theanine 100mg'],
    color: 'violet',
    glowColor: 'rgba(139,92,246,0.3)',
  },

  // ── GENERAL NUTRITION ─────────────────────────────────────────────────────
  {
    id: 'GEN-01',
    name: 'Space Chicken Tikka Masala Pouch',
    emoji: '🍲',
    category: 'general',
    description: 'Thermostabilized high-calorie main meal (480 kcal). Protein-enriched for muscle protein synthesis and appetite satisfaction during mission day.',
    unit: 'pouch',
    dosePerDay: 1,
    currentStock: 15,
    initialStock: 180,
    calories: 480,
    keyNutrients: ['Protein 32g', 'Carbs 48g', 'Fat 12g', 'Iron 4mg'],
    color: 'orange',
    glowColor: 'rgba(249,115,22,0.3)',
  },
  {
    id: 'GEN-02',
    name: 'Freeze-Dried Fruit Mix',
    emoji: '🍓',
    category: 'general',
    description: 'Strawberry, mango & blueberry blend. Preserves polyphenol antioxidants and provides natural fructose for sustained cognitive energy without blood sugar spike.',
    unit: 'pack',
    dosePerDay: 1,
    currentStock: 25,
    initialStock: 252,
    calories: 65,
    keyNutrients: ['Polyphenols 350mg', 'Vitamin C 50mg', 'Fiber 4g'],
    color: 'pink',
    glowColor: 'rgba(236,72,153,0.3)',
  },
  {
    id: 'GEN-03',
    name: 'High-Protein Almond Space Bar',
    emoji: '🌰',
    category: 'general',
    description: 'Compact 25g protein snack bar for between-EVA recovery windows. BCAA-enriched to prevent catabolism during 6-hour extravehicular activity.',
    unit: 'bar',
    dosePerDay: 1,
    currentStock: 32,
    initialStock: 252,
    calories: 220,
    keyNutrients: ['Protein 25g', 'BCAAs 5g', 'Healthy Fats 10g'],
    color: 'amber',
    glowColor: 'rgba(245,158,11,0.3)',
  },
];

// ── DAILY NUTRITION LOG ───────────────────────────────────────────────────────
export let currentDailyNutritionLog: DailyNutritionLog = {
  id: 'NUTRI-84-01',
  missionDay: 84,
  date: new Date().toISOString(),
  consumedItems: [],
  totalCalories: 0,
  hydrationLiters: 0.6,
  hydrationGoalLiters: 2.5,
  hydrationSessions: [
    { amount: 350, takenAt: new Date(Date.now() - 3600000 * 4).toISOString() },
    { amount: 250, takenAt: new Date(Date.now() - 3600000 * 2).toISOString() },
  ],
  nutritionScore: 0,
  surgeonFlagged: false,
};

// ── CRUD HELPERS ──────────────────────────────────────────────────────────────
export const getNutritionInventory = (): NutrientItem[] => nutritionInventory;

export const getDailyNutritionLog = (): DailyNutritionLog => currentDailyNutritionLog;

export const takeNutrientItem = (itemId: string, qty: number = 1): { item: NutrientItem; log: DailyNutritionLog } | null => {
  const idx = nutritionInventory.findIndex((i) => i.id === itemId);
  if (idx === -1 || nutritionInventory[idx].currentStock < qty) return null;

  // Deduct from inventory
  nutritionInventory[idx] = {
    ...nutritionInventory[idx],
    currentStock: nutritionInventory[idx].currentStock - qty,
    lastTakenAt: new Date().toISOString(),
  };

  const item = nutritionInventory[idx];

  // Update today's log
  const existing = currentDailyNutritionLog.consumedItems.findIndex((c) => c.itemId === itemId);
  if (existing >= 0) {
    currentDailyNutritionLog.consumedItems[existing].qty += qty;
  } else {
    currentDailyNutritionLog.consumedItems.push({
      itemId,
      name: item.name,
      qty,
      takenAt: new Date().toISOString(),
    });
  }

  currentDailyNutritionLog.totalCalories += (item.calories || 0) * qty;
  currentDailyNutritionLog.nutritionScore = computeNutritionScore();

  return { item, log: currentDailyNutritionLog };
};

export const logHydration = (amountMl: number): DailyNutritionLog => {
  currentDailyNutritionLog.hydrationSessions.push({
    amount: amountMl,
    takenAt: new Date().toISOString(),
  });
  const totalMl = currentDailyNutritionLog.hydrationSessions.reduce((s, h) => s + h.amount, 0);
  currentDailyNutritionLog.hydrationLiters = Math.round((totalMl / 1000) * 100) / 100;

  // Flag surgeon if hydration is critically low
  const hour = new Date().getHours();
  if (hour >= 15 && currentDailyNutritionLog.hydrationLiters < 1.2) {
    currentDailyNutritionLog.surgeonFlagged = true;
  }

  currentDailyNutritionLog.nutritionScore = computeNutritionScore();
  return currentDailyNutritionLog;
};

export const getInventoryAlerts = (missionDaysRemaining: number = 90): NutritionInventoryAlertPayload[] => {
  return nutritionInventory
    .map((item) => {
      const dailyUse = item.dosePerDay;
      const daysRemaining = dailyUse > 0 ? Math.floor(item.currentStock / dailyUse) : 999;
      if (daysRemaining <= 15) {
        return {
          itemId: item.id,
          itemName: item.name,
          currentStock: item.currentStock,
          daysRemaining,
          severity: (daysRemaining <= 7 ? 'critical' : 'low') as 'low' | 'critical',
        };
      }
      return null;
    })
    .filter(Boolean) as NutritionInventoryAlertPayload[];
};

function computeNutritionScore(): number {
  const categories: NutrientCategory[] = ['radiation-shield', 'bone-muscle', 'hydration', 'sleep-recovery', 'cognitive'];
  let score = 0;

  // Hydration: up to 30 pts
  const hydRatio = Math.min(1, currentDailyNutritionLog.hydrationLiters / 2.5);
  score += Math.round(hydRatio * 30);

  // Consumed category coverage: up to 70 pts
  const consumed = new Set(
    currentDailyNutritionLog.consumedItems
      .map((c) => nutritionInventory.find((i) => i.id === c.itemId)?.category)
      .filter(Boolean)
  );
  for (const cat of categories) {
    if (consumed.has(cat)) score += 14;
  }

  return Math.min(100, score);
}

