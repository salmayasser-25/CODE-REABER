import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Save, 
  Dumbbell, 
  Lock, 
  Unlock,
  ChevronRight,
  Stethoscope
} from 'lucide-react';
import { 
  MedicalRestriction, 
  CrewMemberSummary, 
  SpaceExercise 
} from '../types/astronaut.ts';

interface MedicalRestrictionsPageProps {
  restrictions: MedicalRestriction[];
  crew: CrewMemberSummary[];
  exercises: SpaceExercise[];
  onAddRestriction: (restriction: Omit<MedicalRestriction, 'id'>) => void;
  onUpdateRestriction: (id: string, updates: Partial<MedicalRestriction>) => void;
  onDeleteRestriction: (id: string) => void;
}

export const MedicalRestrictionsPage: React.FC<MedicalRestrictionsPageProps> = ({
  restrictions,
  crew,
  exercises,
  onAddRestriction,
  onUpdateRestriction,
  onDeleteRestriction,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Under Review' | 'Lifted'>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form State
  const [selectedAstronautId, setSelectedAstronautId] = useState<string>(crew[0]?.id || 'ASTRO-74-SJ');
  const [restrictionName, setRestrictionName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [affectedRegion, setAffectedRegion] = useState<string>('Lumbar Spine (L3-L5)');
  const [severity, setSeverity] = useState<'High' | 'Moderate' | 'Low'>('High');
  const [rationale, setRationale] = useState<string>('');
  const [selectedExercises, setSelectedExercises] = useState<string[]>(['ARED Squat']);

  const selectedAstronaut = crew.find((c) => c.id === selectedAstronautId) || crew[0];

  const handleToggleExercise = (name: string) => {
    setSelectedExercises((prev) =>
      prev.includes(name) ? prev.filter((e) => e !== name) : [...prev, name]
    );
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restrictionName.trim() || !description.trim()) return;

    onAddRestriction({
      astronautId: selectedAstronaut.id,
      astronautName: selectedAstronaut.name,
      name: restrictionName.trim(),
      description: description.trim(),
      affectedRegion,
      restrictedExercises: selectedExercises.length > 0 ? selectedExercises : ['ARED Axial Loading'],
      severity,
      effectiveDate: `MET D+84 (${new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' })})`,
      status: 'Active',
      prescribedBy: 'Dr. Marcus Vance, M.D., FACEP (Lead Flight Surgeon)',
      clinicalRationale: rationale.trim() || 'Precautionary suspension following microgravity spinal adaptation audit.',
    });

    setRestrictionName('');
    setDescription('');
    setRationale('');
    setIsModalOpen(false);
  };

  const filteredRestrictions = restrictions.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.astronautName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.affectedRegion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.restrictedExercises.some((e) => e.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = restrictions.filter((r) => r.status === 'Active').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-rose-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-rose-400 font-bold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>FLIGHT MEDICINE SAFETY DIRECTIVE CONSOLE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white font-['Chakra_Petch',sans-serif]">
            Medical Restrictions & Exercise Safety Holds
          </h1>
          <p className="text-xs text-slate-300 font-sans mt-0.5">
            Active musculoskeletal contraindications, axial spine compression locks, and countermeasure safety clearances.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF8C00] to-rose-500 text-black font-mono font-black text-xs tracking-wider hover:opacity-90 transition-all flex items-center gap-1.5 shadow-[0_0_20px_rgba(255,140,0,0.35)] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>PRESCRIBE NEW RESTRICTION</span>
        </button>
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by restriction, astronaut, or exercise..."
            className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs font-mono focus:border-[#FF8C00] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800 font-mono text-xs">
          {(['all', 'Active', 'Under Review', 'Lifted'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === status
                  ? status === 'Active'
                    ? 'bg-rose-500 text-white shadow-[0_0_12px_#f43f5e]'
                    : status === 'Lifted'
                    ? 'bg-[#10b981] text-black shadow-[0_0_12px_#10b981]'
                    : 'bg-[#FF8C00] text-black shadow-[0_0_12px_#FF8C00]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {status === 'all' ? 'All Records' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Restrictions Cards List */}
      <div className="space-y-4">
        {filteredRestrictions.map((res) => {
          const isActive = res.status === 'Active';
          return (
            <div
              key={res.id}
              className={`glass-panel rounded-2xl p-5 border transition-all ${
                isActive
                  ? 'border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.12)]'
                  : 'border-slate-800/80 opacity-80'
              }`}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      isActive
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                    }`}
                  >
                    {isActive ? <Lock className="w-5 h-5 text-rose-400" /> : <Unlock className="w-5 h-5 text-emerald-400" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-base font-['Chakra_Petch',sans-serif]">
                        {res.name}
                      </span>
                      <span className="text-xs font-mono text-slate-400">({res.id})</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          res.severity === 'High'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
                            : 'bg-[#FF8C00]/20 text-[#FF8C00] border border-[#FF8C00]/50'
                        }`}
                      >
                        {res.severity} SEVERITY
                      </span>
                    </div>
                    <div className="text-xs font-mono text-slate-400 mt-0.5">
                      Subject: <strong className="text-[#00E5FF]">{res.astronautName}</strong> ({res.astronautId}) · Effective: {res.effectiveDate}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs">
                  <span
                    className={`px-3 py-1 rounded-lg font-bold uppercase tracking-wider ${
                      isActive
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    STATUS: {res.status}
                  </span>

                  {isActive ? (
                    <button
                      type="button"
                      onClick={() => onUpdateRestriction(res.id, { status: 'Lifted' })}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold transition-all cursor-pointer"
                    >
                      CLEAR / LIFT RESTRICTION
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onUpdateRestriction(res.id, { status: 'Active' })}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all cursor-pointer"
                    >
                      RE-ACTIVATE HOLD
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-3 text-xs sm:text-sm text-slate-200 font-sans">
                {res.description}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-800 text-xs font-mono">
                <div>
                  <span className="text-slate-400">Target Body Region:</span>
                  <div className="font-bold text-white mt-0.5">{res.affectedRegion}</div>
                </div>

                <div>
                  <span className="text-slate-400">Locked / Prohibited Exercises:</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {res.restrictedExercises.map((ex, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[11px] font-bold">
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400">Flight Surgeon Sign-off:</span>
                  <div className="text-slate-300 mt-0.5">{res.prescribedBy}</div>
                </div>
              </div>

              <div className="mt-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-300">
                <strong className="text-[#FF8C00]">Clinical Rationale:</strong> {res.clinicalRationale}
              </div>
            </div>
          );
        })}

        {filteredRestrictions.length === 0 && (
          <div className="glass-panel rounded-2xl p-8 text-center text-slate-400 font-mono text-xs">
            No medical restrictions found for the selected filter.
          </div>
        )}
      </div>

      {/* Prescribe Medical Restriction Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl rounded-2xl bg-[#091129] border border-[#FF8C00]/50 shadow-[0_0_50px_rgba(255,140,0,0.3)] p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#FF8C00]" />
                <h3 className="text-base font-bold text-white font-['Chakra_Petch',sans-serif]">
                  Prescribe Flight Medical Countermeasure Restriction
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">ASTRONAUT CANDIDATE</label>
                  <select
                    value={selectedAstronautId}
                    onChange={(e) => setSelectedAstronautId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold focus:border-[#FF8C00] focus:outline-none"
                  >
                    {crew.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.id} - {c.callsign})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">SEVERITY PRIORITY</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold focus:border-[#FF8C00] focus:outline-none"
                  >
                    <option value="High">High (Immediate Hold)</option>
                    <option value="Moderate">Moderate (Conditional Loading)</option>
                    <option value="Low">Low (Observation Only)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">RESTRICTION PROTOCOL NAME</label>
                <input
                  type="text"
                  value={restrictionName}
                  onChange={(e) => setRestrictionName(e.target.value)}
                  placeholder="e.g. Axial Spinal Compressive Load Suspension"
                  className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-[#FF8C00] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">AFFECTED ANATOMICAL REGION</label>
                <input
                  type="text"
                  value={affectedRegion}
                  onChange={(e) => setAffectedRegion(e.target.value)}
                  placeholder="e.g. Lumbar Spine (L3-L5)"
                  className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-[#FF8C00] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">PROHIBITED EXERCISES (SELECT ALL APPLICABLE)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {exercises.map((ex) => {
                    const isChecked = selectedExercises.includes(ex.name);
                    return (
                      <button
                        type="button"
                        key={ex.id}
                        onClick={() => handleToggleExercise(ex.name)}
                        className={`p-2 rounded-lg border text-left text-[11px] transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {ex.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">RESTRICTION DESCRIPTION</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="State the operational restriction parameters..."
                  className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-sans focus:border-[#FF8C00] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">CLINICAL RATIONALE</label>
                <textarea
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  rows={2}
                  placeholder="Explain medical reasoning, disc hydration data, or ultrasound findings..."
                  className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-sans focus:border-[#FF8C00] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-bold hover:bg-slate-800"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FF8C00] text-black font-extrabold hover:bg-[#FF8C00]/90 shadow-[0_0_15px_#FF8C00]"
                >
                  SUBMIT RESTRICTION ORDER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
