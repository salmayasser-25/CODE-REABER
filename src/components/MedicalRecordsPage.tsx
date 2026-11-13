import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  Stethoscope, 
  AlertTriangle, 
  CheckCircle2, 
  Edit3, 
  User, 
  Calendar,
  Save,
  X
} from 'lucide-react';
import { 
  DoctorNote, 
  SymptomReport, 
  CrewMemberSummary, 
  AstronautProfile, 
  VitalsData 
} from '../types/astronaut.ts';

interface MedicalRecordsPageProps {
  notes: DoctorNote[];
  symptoms: SymptomReport[];
  crew: CrewMemberSummary[];
  currentProfile: AstronautProfile;
  vitals: VitalsData | null;
  onSaveNote: (note: Omit<DoctorNote, 'id' | 'timestamp'>) => void;
  onUpdateNote: (id: string, updates: Partial<DoctorNote>) => void;
  onUpdateSymptomStatus: (symptomId: string, status: 'active' | 'monitoring' | 'resolved') => void;
}

export const MedicalRecordsPage: React.FC<MedicalRecordsPageProps> = ({
  notes,
  symptoms,
  crew,
  currentProfile,
  vitals,
  onSaveNote,
  onUpdateNote,
  onUpdateSymptomStatus,
}) => {
  const [selectedAstronautId, setSelectedAstronautId] = useState<string>(currentProfile.id);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isCreatingNote, setIsCreatingNote] = useState<boolean>(false);

  // New Note Form State
  const [newTitle, setNewTitle] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [newCategory, setNewCategory] = useState<DoctorNote['category']>('Routine Assessment');
  const [selectedSymptom, setSelectedSymptom] = useState<string>('Lumbar Spine (L3-L5)');

  const selectedCrewMember = crew.find((c) => c.id === selectedAstronautId) || crew[0];

  const handleCreateNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    onSaveNote({
      astronautId: selectedAstronautId,
      astronautName: selectedCrewMember.name,
      author: 'Dr. Marcus Vance, M.D., FACEP (Lead Flight Surgeon)',
      category: newCategory,
      title: newTitle.trim(),
      content: newContent.trim(),
      relatedSymptoms: selectedSymptom ? [selectedSymptom] : [],
      vitalsSnapshot: vitals ? {
        hr: vitals.heartRate,
        bp: `${vitals.bloodPressureSys}/${vitals.bloodPressureDia}`,
        spo2: vitals.spO2,
        temp: vitals.temperature,
      } : undefined,
      status: 'Finalized',
    });

    setNewTitle('');
    setNewContent('');
    setIsCreatingNote(false);
  };

  const filteredNotes = notes.filter((note) => {
    const matchesAstro = !selectedAstronautId || note.astronautId === selectedAstronautId;
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || note.category === categoryFilter;
    return matchesAstro && matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-[#00E5FF]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#00E5FF] font-bold uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4 text-[#00E5FF]" />
            <span>FLIGHT SURGEON CLINICAL DOCUMENTATION</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white font-['Chakra_Petch',sans-serif]">
            Medical Records & Doctor Notes System
          </h1>
          <p className="text-xs text-slate-300 font-sans mt-0.5">
            Formal medical records, clinical assessments, spaceflight adaptation reviews, and pre-EVA clearances.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreatingNote(!isCreatingNote)}
          className="px-4 py-2 rounded-xl bg-[#00E5FF] text-black font-mono font-bold text-xs hover:bg-[#00E5FF]/90 transition-all flex items-center gap-1.5 shadow-[0_0_15px_#00E5FF] cursor-pointer"
        >
          {isCreatingNote ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{isCreatingNote ? 'CLOSE NOTE FORM' : 'COMPOSE CLINICAL NOTE'}</span>
        </button>
      </div>

      {/* Note Creation Editor (Requirement 5) */}
      {isCreatingNote && (
        <form
          onSubmit={handleCreateNoteSubmit}
          className="glass-panel rounded-2xl p-5 border border-[#00E5FF]/50 space-y-4 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-sm font-bold text-white font-['Chakra_Petch',sans-serif]">
              <Edit3 className="w-4 h-4 text-[#00E5FF]" />
              <span>Compose Official Flight Medicine Clinical Note</span>
            </div>
            <span className="text-xs font-mono text-[#00E5FF]">
              AUTHOR: Dr. Marcus Vance, M.D., FACEP (Lead Flight Surgeon)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">ASTRONAUT SUBJECT</label>
              <select
                value={selectedAstronautId}
                onChange={(e) => setSelectedAstronautId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:border-[#00E5FF] focus:outline-none"
              >
                {crew.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">CLINICAL CATEGORY</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:border-[#00E5FF] focus:outline-none"
              >
                <option value="Routine Assessment">Routine Assessment</option>
                <option value="Adaptation Review">Adaptation Review (Spinal / Fluid Shift)</option>
                <option value="Countermeasure Directive">Countermeasure Directive (ARED / CEVIS)</option>
                <option value="Pre-EVA Medical Clearance">Pre-EVA Medical Clearance</option>
                <option value="Clinical Anomaly">Clinical Anomaly</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">RELATED SYMPTOM</label>
              <select
                value={selectedSymptom}
                onChange={(e) => setSelectedSymptom(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:border-[#00E5FF] focus:outline-none"
              >
                <option value="Lumbar Spine (L3-L5)">Lumbar Spine (L3-L5)</option>
                <option value="Cranial / Sinus (Frontal)">Cranial / Sinus (Frontal)</option>
                <option value="None">None / General Protocol</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">NOTE TITLE</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g., Evaluation of L3-L5 Spinal Elongation and ARED Loading Hold"
              className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm font-mono focus:border-[#00E5FF] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">CLINICAL OBSERVATION & DIRECTIVE</label>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={4}
              placeholder="Detail medical observations, ultrasound biometric correlations, countermeasure adjustments, and clearance status..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm font-sans focus:border-[#00E5FF] focus:outline-none"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-mono text-slate-400">
              Note will be committed to the permanent flight medical timeline.
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsCreatingNote(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono font-bold hover:bg-slate-800"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#00E5FF] text-black text-xs font-mono font-black hover:bg-[#00E5FF]/90 flex items-center gap-1.5 shadow-[0_0_15px_#00E5FF]"
              >
                <Save className="w-4 h-4" />
                <span>SIGN & RECORD NOTE</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Control Bar: Astronaut Filter, Search & Category */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Astronaut Selector */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <User className="w-4 h-4 text-[#00E5FF]" />
          <span className="text-slate-400">SUBJECT:</span>
          <select
            value={selectedAstronautId}
            onChange={(e) => setSelectedAstronautId(e.target.value)}
            className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl text-white font-bold cursor-pointer"
          >
            {crew.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.id})
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by keyword..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs font-mono focus:border-[#00E5FF] focus:outline-none"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl text-white font-bold cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="Routine Assessment">Routine Assessment</option>
            <option value="Adaptation Review">Adaptation Review</option>
            <option value="Countermeasure Directive">Countermeasure Directive</option>
            <option value="Pre-EVA Medical Clearance">Pre-EVA Medical Clearance</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Notes History & Symptoms Review Registry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Doctor Notes Stream */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white font-['Chakra_Petch',sans-serif] uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#00E5FF]" />
              <span>Flight Surgeon Clinical Notes ({filteredNotes.length})</span>
            </h2>
          </div>

          <div className="space-y-4">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 uppercase">
                      {note.category}
                    </span>
                    <h3 className="text-base font-bold text-white font-['Chakra_Petch',sans-serif]">
                      {note.title}
                    </h3>
                  </div>

                  <span className="text-xs font-mono text-slate-400">
                    {new Date(note.timestamp).toLocaleString()}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed">
                  {note.content}
                </p>

                {/* Vitals Snapshot at Time of Note */}
                {note.vitalsSnapshot && (
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 grid grid-cols-4 gap-2 text-center text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase">HR</span>
                      <div className="font-bold text-white">{note.vitalsSnapshot.hr} bpm</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase">BP</span>
                      <div className="font-bold text-white">{note.vitalsSnapshot.bp}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase">SPO2</span>
                      <div className="font-bold text-emerald-400">{note.vitalsSnapshot.spo2}%</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase">TEMP</span>
                      <div className="font-bold text-white">{note.vitalsSnapshot.temp}°C</div>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-mono text-slate-400 gap-2">
                  <div>
                    Signed: <strong className="text-white">{note.author}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      {note.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {filteredNotes.length === 0 && (
              <div className="glass-panel rounded-2xl p-8 text-center text-slate-400 font-mono text-xs">
                No clinical notes found for the current search/category criteria.
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Active Symptoms & Review Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white font-['Chakra_Petch',sans-serif] uppercase tracking-wider flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-[#FF8C00]" />
              <span>Symptom Review Queue</span>
            </h2>
          </div>

          <div className="space-y-3">
            {symptoms.map((sym) => (
              <div
                key={sym.id}
                className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-2 text-xs font-mono"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{sym.bodyPart}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      sym.status === 'active'
                        ? 'bg-[#FF8C00]/20 text-[#FF8C00] border border-[#FF8C00]/40'
                        : sym.status === 'monitoring'
                        ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {sym.status}
                  </span>
                </div>

                <div className="text-slate-300 font-sans">
                  {sym.notes}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                  <span className="text-slate-400">
                    Intensity: <strong className="text-white">{sym.intensity}/10</strong> ({sym.painType})
                  </span>

                  {sym.status !== 'resolved' && (
                    <button
                      type="button"
                      onClick={() => onUpdateSymptomStatus(sym.id, 'resolved')}
                      className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-bold border border-emerald-500/40 cursor-pointer"
                    >
                      MARK RESOLVED
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
