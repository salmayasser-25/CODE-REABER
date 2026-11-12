import React, { useState } from 'react';
import { 
  Dumbbell, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Clock, 
  Activity, 
  Filter, 
  Play,
  Heart
} from 'lucide-react';
import { SpaceExercise, AstronautProfile, ExerciseCategory } from '../types/astronaut.ts';

interface ExerciseMonitoringPageProps {
  exercises: SpaceExercise[];
  profile: AstronautProfile;
  onNavigateToRestrictions: () => void;
}

export const ExerciseMonitoringPage: React.FC<ExerciseMonitoringPageProps> = ({
  exercises,
  profile,
  onNavigateToRestrictions,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'available' | 'restricted' | 'recommended'>('all');

  const filteredExercises = exercises.filter((ex) => {
    const matchesCat = selectedCategory === 'all' || ex.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || ex.status === selectedStatus;
    return matchesCat && matchesStatus;
  });

  const restrictedCount = exercises.filter((e) => e.status === 'restricted').length;
  const recommendedCount = exercises.filter((e) => e.status === 'recommended').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-[#00E5FF]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#00E5FF] font-bold uppercase tracking-wider mb-1">
            <Dumbbell className="w-4 h-4 text-[#00E5FF]" />
            <span>COUNTERMEASURE PRESCRIPTION & MUSCULOSKELETAL AUDIT</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white font-['Chakra_Petch',sans-serif]">
            Exercise Monitoring & Countermeasures Protocol
          </h1>
          <p className="text-xs text-slate-300 font-sans mt-0.5">
            Microgravity bone and muscle loss countermeasures evaluated against current spinal elongation (+{profile.spineElongation} cm).
          </p>
        </div>

        <button
          type="button"
          onClick={onNavigateToRestrictions}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-[#FF8C00]/50 text-[#FFB347] font-mono text-xs font-bold hover:bg-[#FF8C00]/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <ShieldAlert className="w-4 h-4 text-[#FF8C00]" />
          <span>VIEW {restrictedCount} LOCKED EXERCISES</span>
        </button>
      </div>

      {/* Countermeasures Compliance & Equipment Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center font-mono text-xs">
        <div className="glass-panel rounded-2xl p-4 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-bold">WEEKLY PROTOCOL COMPLIANCE</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">94.2%</div>
          <div className="text-slate-400 text-[11px] mt-1">13.2 / 14.0 Target Hours</div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-bold">RECOMMENDED DRILLS</div>
          <div className="text-2xl font-black text-[#00E5FF] mt-1">{recommendedCount} Drills</div>
          <div className="text-slate-400 text-[11px] mt-1">CEVIS & Core Stabilization</div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-rose-500/30">
          <div className="text-[10px] text-rose-400 uppercase font-bold">SAFETY RESTRICTIONS</div>
          <div className="text-2xl font-black text-rose-300 mt-1">{restrictedCount} Locked</div>
          <div className="text-rose-400 text-[11px] mt-1">Axial Spine Protection</div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-bold">PRIMARY EQUIPMENT</div>
          <div className="text-xl font-black text-white mt-1">CEVIS / ARED</div>
          <div className="text-slate-400 text-[11px] mt-1">Vibration Isolated Ergometer</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 font-mono text-xs">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'Upper Body', 'Lower Body', 'Core', 'Full Body'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#00E5FF] text-black shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All Muscle Groups' : cat}
            </button>
          ))}
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {(['all', 'available', 'restricted', 'recommended'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setSelectedStatus(status)}
              className={`px-2.5 py-1 rounded-lg uppercase font-bold transition-all cursor-pointer ${
                selectedStatus === status
                  ? status === 'restricted'
                    ? 'bg-rose-500 text-white'
                    : status === 'recommended'
                    ? 'bg-emerald-500 text-black'
                    : 'bg-[#00E5FF] text-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Exercises Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredExercises.map((ex) => {
          const isRestricted = ex.status === 'restricted';
          const isRecommended = ex.status === 'recommended';

          return (
            <div
              key={ex.id}
              className={`glass-panel rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                isRestricted
                  ? 'border-rose-500/40 bg-rose-950/15'
                  : isRecommended
                  ? 'border-emerald-500/40 bg-emerald-950/10'
                  : 'border-slate-800 hover:border-[#00E5FF]/50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white font-['Chakra_Petch',sans-serif]">
                      {ex.name}
                    </h3>
                    <div className="text-xs font-mono text-slate-400 mt-0.5">
                      {ex.category} · <span className="text-[#00E5FF]">{ex.equipment}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      isRestricted
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : isRecommended
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {ex.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-sans mt-3 line-clamp-3">
                  {ex.description}
                </p>

                {/* Target Muscle Groups */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {ex.targetMuscles.map((muscle, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-300"
                    >
                      {muscle}
                    </span>
                  ))}
                </div>

                {isRestricted && ex.warningMessage && (
                  <div className="mt-3 p-2.5 rounded-xl bg-rose-900/40 border border-rose-700/50 text-[11px] font-mono text-rose-200">
                    <strong className="text-rose-400 uppercase">SAFETY LOCK:</strong> {ex.warningMessage}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{ex.durationMinutes} min</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>{ex.caloriesBurned} kcal</span>
                </div>
                <div className="text-[10px] uppercase text-slate-400 font-semibold">
                  {ex.intensity} Intensity
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
