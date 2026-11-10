import React, { useState } from 'react';
import { X, Save, RefreshCw, Plus, Trash2, AlertCircle } from 'lucide-react';
import { AstronautProfile, FlightSurgeon } from '../types/astronaut.js';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: AstronautProfile;
  onSave: (updated: Partial<AstronautProfile>) => Promise<void>;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<AstronautProfile>({ ...profile });
  const [newAllergyInput, setNewAllergyInput] = useState('');
  const [newConditionInput, setNewConditionInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFieldChange = (field: keyof AstronautProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSurgeonChange = (field: keyof FlightSurgeon, value: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedSurgeon: {
        ...prev.assignedSurgeon,
        [field]: value,
      },
    }));
  };

  const handleAddAllergy = () => {
    if (newAllergyInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        allergies: [...prev.allergies, newAllergyInput.trim()],
      }));
      setNewAllergyInput('');
    }
  };

  const handleRemoveAllergy = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index),
    }));
  };

  const handleAddCondition = () => {
    if (newConditionInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        conditions: [...prev.conditions, newConditionInput.trim()],
      }));
      setNewConditionInput('');
    }
  };

  const handleRemoveCondition = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update astronaut profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#080e22] border border-[#00E5FF]/45 shadow-[0_0_50px_rgba(0,229,255,0.25)] p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-['Chakra_Petch',sans-serif] tracking-wide flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF]" />
              EDIT ASTRONAUT PROFILE & CLINICAL TELEMETRY
            </h2>
            <p className="text-xs sm:text-sm text-[#00E5FF] font-mono mt-0.5">
              Expedition-74 Autonomous Bio-Registry Update
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs sm:text-sm font-mono flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* 1. Crew Dossier Fields */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-mono font-bold tracking-wider text-[#00E5FF] uppercase">
              1. Crew Dossier & Flight Role
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-mono text-slate-200 uppercase mb-1 font-semibold">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className="w-full bg-[#070e24] border border-slate-700 rounded-lg px-3.5 py-2.5 text-base text-white focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-mono text-slate-200 uppercase mb-1 font-semibold">
                  Mission Callsign
                </label>
                <input
                  type="text"
                  required
                  value={formData.callsign}
                  onChange={(e) => handleFieldChange('callsign', e.target.value)}
                  className="w-full bg-[#070e24] border border-slate-700 rounded-lg px-3.5 py-2.5 text-base text-[#00E5FF] font-mono font-bold focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-mono text-slate-200 uppercase mb-1 font-semibold">
                  Age (Years Earth-Relative)
                </label>
                <input
                  type="number"
                  required
                  min="18"
                  max="90"
                  value={formData.age}
                  onChange={(e) => handleFieldChange('age', parseInt(e.target.value, 10) || 21)}
                  className="w-full bg-[#070e24] border border-slate-700 rounded-lg px-3.5 py-2.5 text-base text-white font-mono focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-mono text-slate-200 uppercase mb-1 font-semibold">
                  Total EVA Duration (Hours)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.totalEvaHours}
                  onChange={(e) => handleFieldChange('totalEvaHours', parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#070e24] border border-slate-700 rounded-lg px-3.5 py-2.5 text-base text-white font-mono focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-mono text-slate-200 uppercase mb-1 font-semibold">
                  Mission Role / Payload Specialization
                </label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) => handleFieldChange('role', e.target.value)}
                  className="w-full bg-[#070e24] border border-slate-700 rounded-lg px-3.5 py-2.5 text-base text-white focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]"
                />
              </div>
            </div>
          </div>

          {/* 2. Clinical Conditions & Adaptations */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-mono font-bold tracking-wider text-[#FF8C00] uppercase">
              2. Clinical Adaptations & Biometrics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-mono text-slate-200 uppercase mb-1 font-semibold">
                  Spine Elongation Delta (+cm)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="8"
                    step="0.1"
                    value={formData.spineElongation}
                    onChange={(e) => handleFieldChange('spineElongation', parseFloat(e.target.value) || 0)}
                    className="flex-1 accent-[#FF8C00] h-2.5"
                  />
                  <span className="font-mono text-base font-black text-[#FF8C00] w-20 text-right glow-text-orange">
                    +{formData.spineElongation.toFixed(1)} cm
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-mono text-slate-200 uppercase mb-1 font-semibold">
                  Blood Group & Rh
                </label>
                <select
                  value={formData.bloodType}
                  onChange={(e) => handleFieldChange('bloodType', e.target.value)}
                  className="w-full bg-[#070e24] border border-slate-700 rounded-lg px-3.5 py-2.5 text-base text-white font-mono focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]"
                >
                  <option value="O-Positive (O+)">O-Positive (O+)</option>
                  <option value="O-Negative (O-)">O-Negative (O-)</option>
                  <option value="A-Positive (A+)">A-Positive (A+)</option>
                  <option value="A-Negative (A-)">A-Negative (A-)</option>
                  <option value="B-Positive (B+)">B-Positive (B+)</option>
                  <option value="B-Negative (B-)">B-Negative (B-)</option>
                  <option value="AB-Positive (AB+)">AB-Positive (AB+)</option>
                  <option value="AB-Negative (AB-)">AB-Negative (AB-)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-mono text-slate-200 uppercase mb-1 font-semibold">
                  Current Body Mass (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weightKg}
                  onChange={(e) => handleFieldChange('weightKg', parseFloat(e.target.value) || 60)}
                  className="w-full bg-[#070e24] border border-slate-700 rounded-lg px-3.5 py-2.5 text-base text-white font-mono focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-mono text-slate-200 uppercase mb-1 font-semibold">
                  Resting Heart Rate (bpm)
                </label>
                <input
                  type="number"
                  value={formData.restingHeartRate}
                  onChange={(e) => handleFieldChange('restingHeartRate', parseInt(e.target.value, 10) || 60)}
                  className="w-full bg-[#070e24] border border-slate-700 rounded-lg px-3.5 py-2.5 text-base text-white font-mono focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]"
                />
              </div>
            </div>

            {/* Allergies list editor */}
            <div className="mt-4 pt-2 border-t border-slate-800">
              <label className="block text-xs sm:text-sm font-mono text-slate-200 uppercase mb-2 font-semibold">
                Known Allergies
              </label>
              <div className="flex flex-wrap gap-2.5 mb-3">
                {formData.allergies.map((allergy, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FF8C00]/20 border border-[#FF8C00]/50 text-[#FFB347] text-xs sm:text-sm font-mono font-bold"
                  >
                    {allergy}
                    <button
                      type="button"
                      onClick={() => handleRemoveAllergy(i)}
                      className="hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New allergy (e.g. Latex)..."
                  value={newAllergyInput}
                  onChange={(e) => setNewAllergyInput(e.target.value)}
                  className="flex-1 bg-[#070e24] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
                <button
                  type="button"
                  onClick={handleAddAllergy}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-[#FF8C00] font-bold text-xs sm:text-sm font-mono rounded-lg border border-[#FF8C00]/40"
                >
                  Add Allergy
                </button>
              </div>
            </div>

            {/* Medical conditions list editor */}
            <div className="mt-4 pt-2 border-t border-slate-800">
              <label className="block text-xs sm:text-sm font-mono text-slate-200 uppercase mb-2 font-semibold">
                Active Medical Conditions & Space Adaptations
              </label>
              <div className="space-y-2 mb-3">
                {formData.conditions.map((condition, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#070e24] border border-slate-800 text-xs sm:text-sm font-mono text-white"
                  >
                    <span>{condition}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCondition(i)}
                      className="text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New adaptation/condition..."
                  value={newConditionInput}
                  onChange={(e) => setNewConditionInput(e.target.value)}
                  className="flex-1 bg-[#070e24] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
                <button
                  type="button"
                  onClick={handleAddCondition}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-[#00E5FF] font-bold text-xs sm:text-sm font-mono rounded-lg border border-[#00E5FF]/40"
                >
                  Add Adaptation
                </button>
              </div>
            </div>
          </div>

          {/* 3. Ground Flight Surgeon Link */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-mono font-bold tracking-wider text-[#00E5FF] uppercase">
              3. Ground Flight Surgeon Assignment
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-mono text-slate-200 uppercase mb-1 font-semibold">
                  Surgeon Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.assignedSurgeon.name}
                  onChange={(e) => handleSurgeonChange('name', e.target.value)}
                  className="w-full bg-[#070e24] border border-slate-700 rounded-lg px-3.5 py-2.5 text-base text-white focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-mono text-slate-200 uppercase mb-1 font-semibold">
                  Surgeon Credential ID
                </label>
                <input
                  type="text"
                  required
                  value={formData.assignedSurgeon.credentialId}
                  onChange={(e) => handleSurgeonChange('credentialId', e.target.value)}
                  className="w-full bg-[#070e24] border border-slate-700 rounded-lg px-3.5 py-2.5 text-base text-[#00E5FF] font-mono font-bold focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-mono text-slate-200 uppercase mb-1 font-semibold">
                  Certification Status
                </label>
                <input
                  type="text"
                  required
                  value={formData.assignedSurgeon.certificationStatus}
                  onChange={(e) => handleSurgeonChange('certificationStatus', e.target.value)}
                  className="w-full bg-[#070e24] border border-slate-700 rounded-lg px-3.5 py-2.5 text-base text-white focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-extrabold text-sm font-mono tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.45)]"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>SAVING...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>SAVE CHANGES</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
