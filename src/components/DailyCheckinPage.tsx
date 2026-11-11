import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  Smile, 
  BatteryCharging, 
  Moon, 
  Droplets, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Sparkles, 
  Plus, 
  Activity, 
  Zap, 
  Check, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';
import { DailyCheckIn, AstronautProfile } from '../types/astronaut.ts';

interface DailyCheckinPageProps {
  profile: AstronautProfile;
  onNavigateToTimeline?: () => void;
}

export const DailyCheckinPage: React.FC<DailyCheckinPageProps> = ({ profile, onNavigateToTimeline }) => {
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form Fields
  const [mood, setMood] = useState<DailyCheckIn['mood']>('Nominal / Focused');
  const [energyLevel, setEnergyLevel] = useState<number>(7);
  const [sleepQuality, setSleepQuality] = useState<DailyCheckIn['sleepQuality']>('Fragmented');
  const [sleepHours, setSleepHours] = useState<number>(6.5);
  const [hydrationLiters, setHydrationLiters] = useState<number>(2.4);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([
    'Spinal elongation lumbar ache (+4.2cm)',
  ]);
  const [notes, setNotes] = useState<string>('');

  const symptomOptions = [
    'Spinal elongation lumbar ache (+4.2cm)',
    'Cephalic fluid shift / Head congestion',
    'Space motion adaptation / Vestibular illusion',
    'Eye pressure / Visual acuity shift (SANS check)',
    'Muscle soreness post-ARED loading',
    'Skin sensitivity from cabin dry air',
  ];

  const fetchCheckIns = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/checkins');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setCheckIns(json.data);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch check-ins:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckIns();
  }, []);

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      astronautId: profile.id,
      missionDay: profile.missionElapsedDays || 84,
      mood,
      energyLevel,
      sleepQuality,
      sleepHours,
      hydrationLiters,
      spaceAdaptationSymptoms: selectedSymptoms,
      notes: notes.trim() || 'Daily check-in nominal; adapted to flight regime.',
    };

    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setCheckIns((prev) => [json.data, ...prev]);
          setSuccessToast('Mission Day Check-in logged to Flight Medicine Database!');
          setTimeout(() => setSuccessToast(null), 4500);
          setNotes('');
        }
      }
    } catch (err) {
      console.error('Failed to log checkin:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="glass-panel glass-panel-glow-purple p-6 sm:p-7 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-purple-500/40 shadow-[0_0_35px_rgba(168,85,247,0.22)] bg-[#0d0722]/85">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/50 flex items-center justify-center text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.35)] shrink-0">
            <ClipboardCheck className="w-7 h-7 text-purple-300" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Chakra_Petch',sans-serif] tracking-wide">
                Daily Health Check-in
              </h1>
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-purple-500/25 border border-purple-400/50 text-purple-200">
                MET DAY {profile.missionElapsedDays || 84}
              </span>
            </div>
            <p className="text-sm font-sans text-purple-200 mt-1">
              Personal subjective wellbeing, mood status, sleep quality, and minor microgravity adaptation survey for <strong className="text-white">{profile.name}</strong>.
            </p>
          </div>
        </div>

        {onNavigateToTimeline && (
          <button
            type="button"
            onClick={onNavigateToTimeline}
            className="px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-[#00E5FF]/40 text-[#00E5FF] font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,229,255,0.2)] flex items-center gap-2 cursor-pointer"
          >
            <Clock className="w-4 h-4 text-[#00E5FF]" />
            <span>VIEW MEDICAL TIMELINE</span>
          </button>
        )}
      </div>

      {/* Confirmation Toast */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border-2 border-emerald-500/60 text-emerald-300 font-mono text-sm font-bold flex items-center gap-3 shadow-[0_0_25px_rgba(16,185,129,0.4)] animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Grid: Form on Left, History & Metrics on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Form Container (7 Columns) */}
        <div className="lg:col-span-7 glass-panel glass-panel-glow-purple p-6 sm:p-7 rounded-2xl border border-purple-500/40 shadow-[0_0_35px_rgba(168,85,247,0.2)] bg-[#0d0822]/90 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-purple-900/60">
            <h2 className="text-xl font-bold text-white font-['Chakra_Petch',sans-serif] tracking-wide flex items-center gap-2">
              <Smile className="w-5 h-5 text-purple-400" />
              <span>Astronaut Daily Self-Evaluation</span>
            </h2>
            <span className="text-xs font-mono text-purple-300">
              NASA MED-FORM 74-D
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Daily Feelings / Mood Selector */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-purple-200 mb-2">
                1. How are you feeling today in orbit?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(['Nominal / Focused', 'Mild Fatigue', 'High Stress', 'Homesick', 'Optimistic'] as const).map((m) => {
                  const isSelected = mood === m;
                  return (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setMood(m)}
                      className={`p-3 rounded-xl font-mono text-xs font-bold border transition-all text-left flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_18px_rgba(168,85,247,0.5)]'
                          : 'bg-purple-950/40 text-purple-300 border-purple-800/60 hover:bg-purple-900/40'
                      }`}
                    >
                      <span>{m}</span>
                      {isSelected && <Check className="w-4 h-4 text-white shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Energy Level Slider (1 - 10) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-purple-200 flex items-center gap-1.5">
                  <BatteryCharging className="w-4 h-4 text-purple-400" />
                  <span>2. Energy Level (1 - 10)</span>
                </label>
                <span className={`text-sm font-mono font-bold px-3 py-0.5 rounded ${
                  energyLevel < 5 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50' 
                    : 'bg-purple-500/25 text-purple-200 border border-purple-400/50'
                }`}>
                  {energyLevel} / 10 ({energyLevel >= 8 ? 'High Energy' : energyLevel >= 5 ? 'Moderate' : 'Low / Recovery Needed'})
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(Number(e.target.value))}
                className="w-full h-2 bg-purple-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-purple-300/80 mt-1">
                <span>1 (Exhausted)</span>
                <span>5 (Normal Flight Readiness)</span>
                <span>10 (Peak Cognitive Flow)</span>
              </div>
            </div>

            {/* 3. Sleep Quality & Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-purple-200 mb-2 flex items-center gap-1.5">
                  <Moon className="w-4 h-4 text-purple-400" />
                  <span>3. Sleep Quality</span>
                </label>
                <select
                  value={sleepQuality}
                  onChange={(e) => setSleepQuality(e.target.value as any)}
                  className="w-full bg-purple-950/80 text-white border border-purple-600/60 rounded-xl p-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <option value="Deep & Restorative">Deep & Restorative</option>
                  <option value="Fragmented">Fragmented</option>
                  <option value="Restless / MicroG Noise">Restless / MicroG Noise</option>
                  <option value="Insomnia">Insomnia</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-purple-200 mb-2">
                  Sleep Duration (Hours)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="16"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                  required
                  className="w-full bg-purple-950/80 text-white border border-purple-600/60 rounded-xl p-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>

            {/* 4. Hydration Intake */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-purple-200 flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-[#00E5FF]" />
                  <span>4. Water / Hydration Intake (Liters)</span>
                </label>
                <span className="text-xs font-mono text-[#00E5FF] font-bold">
                  {hydrationLiters.toFixed(1)} L (NASA Target: 2.5 L)
                </span>
              </div>
              <input
                type="range"
                step="0.1"
                min="0.5"
                max="4.5"
                value={hydrationLiters}
                onChange={(e) => setHydrationLiters(Number(e.target.value))}
                className="w-full h-2 bg-purple-950 rounded-lg appearance-none cursor-pointer accent-[#00E5FF]"
              />
            </div>

            {/* 5. Minor Space Adaptation Symptoms Checklist */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-purple-200 mb-2">
                5. Minor Microgravity Adaptation Symptoms (Select all observed)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {symptomOptions.map((sym) => {
                  const isChecked = selectedSymptoms.includes(sym);
                  return (
                    <label
                      key={sym}
                      onClick={() => toggleSymptom(sym)}
                      className={`p-2.5 rounded-xl border text-xs font-sans flex items-center gap-2.5 cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-purple-900/60 border-purple-400 text-white shadow-sm'
                          : 'bg-purple-950/30 border-purple-900/60 text-purple-300 hover:border-purple-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded accent-purple-500 w-4 h-4"
                      />
                      <span>{sym}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 6. Notes & Personal Reflections */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-purple-200 mb-2">
                6. Astronaut Personal Notes / Crew Journal
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Log subjective feelings, workload stress, cupola observation reflections, or physical adjustments..."
                className="w-full bg-purple-950/80 text-white placeholder-purple-300/50 border border-purple-600/60 focus:border-purple-400 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-400 font-sans"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-extrabold text-sm tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_rgba(168,85,247,0.4)] disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span>{isSubmitting ? 'TRANSMITTING CHECK-IN...' : 'SUBMIT DAILY HEALTH CHECK-IN'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Historical Check-ins & Guidance (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recent Logs Panel */}
          <div className="glass-panel glass-panel-glow-purple p-6 rounded-2xl border border-purple-500/40 shadow-[0_0_35px_rgba(168,85,247,0.18)] bg-[#0c0820]/90 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/60">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-purple-200">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span>CHECK-IN HISTORY ({checkIns.length})</span>
              </div>
              <span className="text-[10px] font-mono text-purple-300">TELEMEDICINE REPO</span>
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-xs font-mono text-purple-300">
                Loading flight check-ins...
              </div>
            ) : checkIns.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-purple-300">
                No previous check-ins logged. Submit today's check-in to begin tracking!
              </div>
            ) : (
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {checkIns.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-purple-950/40 border border-purple-800/60 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-white text-sm">
                          Day {item.missionDay}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-200 border border-purple-500/40">
                          {item.mood}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-purple-300">
                        {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-purple-200 pt-1 border-t border-purple-900/40">
                      <div>Energy: <strong className="text-white">{item.energyLevel}/10</strong></div>
                      <div>Sleep: <strong className="text-white">{item.sleepHours}h</strong></div>
                      <div>H₂O: <strong className="text-[#00E5FF]">{item.hydrationLiters}L</strong></div>
                    </div>

                    {item.spaceAdaptationSymptoms && item.spaceAdaptationSymptoms.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.spaceAdaptationSymptoms.map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700/50"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {item.notes && (
                      <p className="text-purple-100 font-sans text-xs italic bg-purple-950/60 p-2 rounded-lg border border-purple-900/50">
                        "{item.notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* NASA Guidance Box */}
          <div className="p-5 rounded-2xl bg-[#0a0718] border border-purple-500/30 text-xs font-mono text-purple-200 space-y-2.5">
            <div className="flex items-center gap-2 text-purple-300 font-bold uppercase">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>FLIGHT MEDICINE PROTOCOL</span>
            </div>
            <p className="text-purple-300 font-sans text-xs leading-relaxed">
              Subjective check-ins correlate with autonomic biotelemetry. If sleep quality is marked "Restless" or energy drops below 5/10, your assigned Flight Surgeon (Dr. Marcus Vance) will review countermeasure protocols.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
