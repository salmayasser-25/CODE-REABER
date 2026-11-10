import React from 'react';
import { X, BookOpen, Ruler, Eye, Activity, ShieldCheck, HeartPulse } from 'lucide-react';

interface ClinicalContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  spineElongation: number;
}

export const ClinicalContextModal: React.FC<ClinicalContextModalProps> = ({
  isOpen,
  onClose,
  spineElongation,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#080e22] border border-[#00E5FF]/45 shadow-[0_0_50px_rgba(0,229,255,0.25)] p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/40 text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.3)]">
              <BookOpen className="w-6 h-6 text-[#00E5FF]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-['Chakra_Petch',sans-serif] tracking-wide">
                Clinical Context & Spaceflight Adaptation Analysis
              </h2>
              <p className="text-sm font-mono text-[#00E5FF]">
                NASA Space Medicine Division · Biomechanical & Microgravity Dossier
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-6 space-y-6 text-slate-200 text-sm leading-relaxed">
          {/* Section 1: Spine Elongation */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-[#00E5FF]/25 space-y-2.5">
            <div className="flex items-center gap-2 text-[#FF8C00] font-mono font-bold text-base">
              <Ruler className="w-5 h-5 text-[#FF8C00]" />
              <span>1. Microgravity Spinal Elongation Delta (+{spineElongation.toFixed(1)} cm)</span>
            </div>
            <p className="text-slate-100 text-sm sm:text-base">
              In prolonged microgravity (10⁻⁶ g), the human body is freed from continuous 1G downward compressive force. As a result, the cartilaginous intervertebral discs absorb interstitial fluid and expand, increasing overall standing height by 2.0 to 7.0 centimeters.
            </p>
            <div className="mt-2 p-3 rounded-lg bg-black/40 border border-slate-800 text-xs font-mono space-y-1 text-slate-300">
              <div className="text-[#00E5FF] font-semibold uppercase">Clinical Implications & Operational Risk:</div>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li><strong className="text-white">Lumbar Back Pain:</strong> Stretching of paraspinal ligaments and postural muscles causes dull to moderate back ache in ~70% of crew during early flight.</li>
                <li><strong className="text-white">EVA Extravehicular Suit Fit:</strong> Space suits (xEMU) must accommodate torso elongation without shoulder pinching or ring impingement.</li>
                <li><strong className="text-white">Re-entry Disc Herniation Risk:</strong> Sudden re-exposure to gravity upon splashdown puts decompressed, hydrated discs at elevated risk of herniation.</li>
              </ul>
            </div>
          </div>

          {/* Section 2: Cephalic Fluid Shift & SANS */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-[#00E5FF]/25 space-y-2.5">
            <div className="flex items-center gap-2 text-[#00E5FF] font-mono font-bold text-base">
              <Eye className="w-5 h-5 text-[#00E5FF]" />
              <span>2. Cephalic Fluid Shift & SANS (Spaceflight Associated Neuro-ocular Syndrome)</span>
            </div>
            <p className="text-slate-100 text-sm sm:text-base">
              Without gravitational pooling of blood in the lower limbs, approximately 1.5 to 2.0 liters of blood and interstitial fluids shift upward toward the chest, neck, and cranium ("puffy-face, bird-leg" syndrome).
            </p>
            <div className="mt-2 p-3 rounded-lg bg-black/40 border border-slate-800 text-xs font-mono space-y-1 text-slate-300">
              <div className="text-[#00E5FF] font-semibold uppercase">Ocular Telemetry & Assessment:</div>
              <p>
                Dr. Salma Johnson is monitored for optic nerve sheath diameter dilation, choroidal folds, and hyperopic refractive shift. Current optic coherence tomography (OCT) baseline remains Grade 0 (no papilledema detected).
              </p>
            </div>
          </div>

          {/* Section 3: Neurovestibular Motion Adaptation */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-[#00E5FF]/25 space-y-2.5">
            <div className="flex items-center gap-2 text-[#10b981] font-mono font-bold text-base">
              <Activity className="w-5 h-5 text-[#10b981]" />
              <span>3. Neurovestibular Adaptation & Space Motion Sickness (SMS)</span>
            </div>
            <p className="text-slate-100 text-sm sm:text-base">
              In weightlessness, gravity sensors in the inner ear (otolith organs) no longer signal up versus down, conflicting with visual cues. Dr. Salma Johnson underwent transient mild spatial disorientation during Flight Days 1–3, successfully resolved with neuro-adaptation and oral antiemetics.
            </p>
          </div>

          {/* Section 4: Countermeasures Protocol */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-[#00E5FF]/25 space-y-2.5">
            <div className="flex items-center gap-2 text-[#00E5FF] font-mono font-bold text-base">
              <ShieldCheck className="w-5 h-5 text-[#00E5FF]" />
              <span>4. Prescribed Countermeasure Schedule (ARED & SkinSuit)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono pt-1">
              <div className="p-3 rounded bg-black/40 border border-slate-800">
                <div className="text-white font-bold mb-1">ARED Resistive Exercise:</div>
                <div className="text-slate-300">2.5 hours daily resistive squats & deadlifts delivering up to 600 lbs of simulated axial load.</div>
              </div>
              <div className="p-3 rounded bg-black/40 border border-slate-800">
                <div className="text-white font-bold mb-1">Gravity Loading SkinSuit:</div>
                <div className="text-slate-300">Tailored elastic garment creating 1G equivalent gradient load from shoulders to feet during sleep cycles.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-bold text-sm font-mono tracking-wider transition-all shadow-[0_0_20px_rgba(0,229,255,0.4)]"
          >
            DISMISS BRIEFING
          </button>
        </div>
      </div>
    </div>
  );
};
