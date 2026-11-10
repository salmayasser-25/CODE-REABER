import React from 'react';
import { X, ShieldAlert, ArrowRight, Stethoscope } from 'lucide-react';

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleModal: React.FC<RoleModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#091129] border border-[#FF8C00]/40 shadow-[0_0_40px_rgba(255,140,0,0.25)] p-6 sm:p-7 text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#FF8C00]/15 border border-[#FF8C00]/40 text-[#FF8C00]">
              <Stethoscope className="w-5 h-5 text-[#FF8C00]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-['Chakra_Petch',sans-serif]">
                Role-Based Console Access
              </h3>
              <p className="text-xs font-mono text-[#FF8C00]">NASA Flight Medicine Division</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-5 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-[#FF8C00]/30 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-[#FF8C00] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-semibold text-white text-sm">
                Medical Team Dashboard is scheduled for Phase 4.
              </div>
              <div className="text-xs text-slate-300 font-mono">
                Currently in Astronaut View (Dr. Salma Johnson Crew Dossier).
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-300 leading-relaxed font-sans">
            The dedicated <strong>Flight Surgeon Telemedicine Workstation</strong> (including multi-astronaut vitals matrix, prescriptive intervention dispatch, and autonomous diagnostic override) will unlock in Phase 4 of the NASA Space Apps ASTROCARE roadmap.
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-black font-bold text-xs font-mono tracking-wider transition-all shadow-[0_0_15px_rgba(255,140,0,0.4)]"
          >
            RETURN TO ASTRONAUT VIEW
          </button>
        </div>
      </div>
    </div>
  );
};
