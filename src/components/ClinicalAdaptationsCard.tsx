import React, { useState } from 'react';
import { Droplet, AlertTriangle, Activity, Plus, X, ShieldAlert, HeartPulse, BookOpen } from 'lucide-react';
import { AstronautProfile } from '../types/astronaut.js';
import { SpineElongationCard } from './SpineElongationCard.js';

interface ClinicalAdaptationsCardProps {
  profile: AstronautProfile;
  isEditing?: boolean;
  onSpineChange?: (val: number) => void;
  onBloodTypeChange?: (val: string) => void;
  onAddAllergy?: (allergy: string) => void;
  onRemoveAllergy?: (index: number) => void;
  onAddCondition?: (condition: string) => void;
  onRemoveCondition?: (index: number) => void;
  onOpenContextModal?: () => void;
}

export const ClinicalAdaptationsCard: React.FC<ClinicalAdaptationsCardProps> = ({
  profile,
  isEditing = false,
  onSpineChange,
  onBloodTypeChange,
  onAddAllergy,
  onRemoveAllergy,
  onAddCondition,
  onRemoveCondition,
  onOpenContextModal,
}) => {
  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');

  const handleAddAllergySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAllergy.trim()) {
      onAddAllergy?.(newAllergy.trim());
      setNewAllergy('');
    }
  };

  const handleAddConditionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCondition.trim()) {
      onAddCondition?.(newCondition.trim());
      setNewCondition('');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Spine Elongation Delta Card (With dynamic color indicators & modal trigger) */}
      <SpineElongationCard
        spineElongation={profile.spineElongation}
        isEditing={isEditing}
        onSpineChange={onSpineChange}
        onOpenContextModal={onOpenContextModal}
      />

      {/* 2. Clinical Conditions, Blood Type & Allergies Matrix */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden border border-[#00E5FF]/30 shadow-[0_0_30px_rgba(0,229,255,0.15)] space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/40 text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.3)]">
              <HeartPulse className="w-6 h-6 text-[#00E5FF]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-['Chakra_Petch',sans-serif] tracking-wide">
                Clinical Conditions & Spaceflight Adaptations
              </h2>
              <p className="text-sm font-sans text-slate-300">
                Immune hypersensitivities, blood grouping & microgravity systemic tracking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold text-[#00E5FF] px-3 py-1.5 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/35">
            <Activity className="w-4 h-4" />
            <span>BIO-COMPATIBLE PROFILE</span>
          </div>
        </div>

        {/* Blood Type & Allergies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Blood Type Badge */}
          <div className="md:col-span-5 p-5 rounded-xl bg-[#09112a] border border-slate-700/80 shadow-[0_4px_20px_rgba(0,0,0,0.5)] space-y-3">
            <div className="flex items-center justify-between text-xs sm:text-sm font-mono text-slate-200 uppercase tracking-wider font-semibold">
              <span>BLOOD GROUP & RH FACTOR</span>
              <Droplet className="w-4 h-4 text-rose-400" />
            </div>

            {isEditing ? (
              <select
                value={profile.bloodType}
                onChange={(e) => onBloodTypeChange?.(e.target.value)}
                aria-label="Astronaut Blood Type"
                className="w-full bg-slate-900 text-white font-mono text-base px-3 py-2 rounded-lg border border-[#00E5FF]/50 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
              >
                <option value="O-Positive (O+)">O-Positive (O+)</option>
                <option value="O-Negative (O-)">O-Negative (O-) [Universal Red Cell]</option>
                <option value="A-Positive (A+)">A-Positive (A+)</option>
                <option value="A-Negative (A-)">A-Negative (A-)</option>
                <option value="B-Positive (B+)">B-Positive (B+)</option>
                <option value="B-Negative (B-)">B-Negative (B-)</option>
                <option value="AB-Positive (AB+)">AB-Positive (AB+) [Universal Plasma]</option>
                <option value="AB-Negative (AB-)">AB-Negative (AB-)</option>
              </select>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-rose-400 glow-text-rose">
                  {profile.bloodType}
                </span>
              </div>
            )}

            <div className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed pt-1 border-t border-slate-800">
              Packed RBC units preserved in ISS MedBay Cryo-Reservoir #02. Crossmatch tested and verified.
            </div>
          </div>

          {/* Known Allergies */}
          <div className="md:col-span-7 p-5 rounded-xl bg-[#09112a] border border-slate-700/80 shadow-[0_4px_20px_rgba(0,0,0,0.5)] space-y-3">
            <div className="flex items-center justify-between text-xs sm:text-sm font-mono text-slate-200 uppercase tracking-wider font-semibold">
              <span className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#FF8C00]" />
                <span>KNOWN ALLERGIES & HYPERSENSITIVITIES</span>
              </span>
              <span className="text-[#FF8C00] font-bold">
                {profile.allergies.length} REGISTERED
              </span>
            </div>

            {/* Allergy Chips List */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              {profile.allergies.length === 0 ? (
                <span className="text-xs text-slate-400 font-mono italic">
                  No known pharmacological allergies reported (NKDA)
                </span>
              ) : (
                profile.allergies.map((allergy, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#FF8C00]/20 border border-[#FF8C00]/50 text-[#FFB347] text-xs sm:text-sm font-mono font-bold shadow-[0_0_12px_rgba(255,140,0,0.2)]"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-[#FF8C00] shrink-0" />
                    <span>{allergy}</span>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => onRemoveAllergy?.(idx)}
                        aria-label={`Remove allergy ${allergy}`}
                        className="hover:text-white transition-colors ml-1 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* In-place Allergy Adder in Edit Mode */}
            {isEditing && (
              <form onSubmit={handleAddAllergySubmit} className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add allergy (e.g. Latex, Cephalosporins)..."
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  className="flex-1 bg-slate-900 text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-[#00E5FF]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FF8C00] text-black font-bold text-xs sm:text-sm rounded-lg hover:bg-[#FF8C00]/90 transition-colors flex items-center gap-1.5 font-mono shadow-[0_0_15px_rgba(255,140,0,0.4)]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  ADD
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Simplified Active Spaceflight Medical Conditions & Progressive Disclosure */}
        <div className="p-5 rounded-xl bg-[#09112a] border border-slate-700/80 shadow-[0_4px_20px_rgba(0,0,0,0.5)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm font-mono text-slate-200 uppercase tracking-wider font-semibold">
            <span>ACTIVE SPACEFLIGHT ADAPTATIONS (SUMMARY)</span>
            <div className="flex items-center gap-2">
              <span className="text-[#00E5FF] font-bold">BIO-REGISTRY SYNCED</span>
              {onOpenContextModal && (
                <button
                  type="button"
                  onClick={onOpenContextModal}
                  className="px-3 py-1 rounded bg-[#00E5FF]/15 hover:bg-[#00E5FF]/25 border border-[#00E5FF]/45 text-[#00E5FF] text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(0,229,255,0.2)]"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Learn More / Clinical Context</span>
                </button>
              )}
            </div>
          </div>

          {/* Clean concise bullet summaries */}
          <div className="space-y-2.5">
            {profile.conditions.map((condition, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-[#070e24] border border-slate-800 text-xs sm:text-sm font-mono text-white"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
                  <span className="font-medium">{condition}</span>
                </div>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => onRemoveCondition?.(idx)}
                    aria-label={`Remove condition ${condition}`}
                    className="text-slate-400 hover:text-rose-400 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* In-place Condition Adder in Edit Mode */}
          {isEditing && (
            <form onSubmit={handleAddConditionSubmit} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Add adaptation/condition (e.g. SANS Visual Acuity 20/20)..."
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                className="flex-1 bg-slate-900 text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-[#00E5FF]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#00E5FF] text-black font-bold text-xs sm:text-sm rounded-lg hover:bg-[#00E5FF]/90 transition-colors flex items-center gap-1.5 font-mono shadow-[0_0_15px_rgba(0,229,255,0.4)]"
              >
                <Plus className="w-3.5 h-3.5" />
                ADD ADAPTATION
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
