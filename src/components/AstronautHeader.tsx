import React, { useRef } from 'react';
import { Camera, CheckCircle2, RefreshCw, Upload, Shield, Sparkles } from 'lucide-react';
import { AstronautProfile } from '../types/astronaut.js';

interface AstronautHeaderProps {
  profile: AstronautProfile;
  isEditing: boolean;
  onToggleEdit: () => void;
  onSave: () => void;
  onReset: () => void;
  onPhotoUpload: (photoDataUrl: string) => void;
  isSaving?: boolean;
}

export const AstronautHeader: React.FC<AstronautHeaderProps> = ({
  profile,
  isEditing,
  onToggleEdit,
  onSave,
  onReset,
  onPhotoUpload,
  isSaving = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onPhotoUpload(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 relative overflow-hidden border border-[#00E5FF]/35 shadow-[0_0_35px_rgba(0,229,255,0.2),0_12px_45px_rgba(0,0,0,0.8)]">
      {/* Background ambient lighting */}
      <div className="absolute -top-12 -left-12 w-64 h-64 bg-[#00E5FF]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-[#FF8C00]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Header Content */}
      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 lg:gap-8">
        {/* Astronaut Photo Frame with Corner HUD Reticles & Upload Button */}
        <div className="relative shrink-0 group">
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden border-2 border-[#00E5FF]/60 shadow-[0_0_30px_rgba(0,229,255,0.35)] bg-[#0A1020]">
            <img
              src={profile.photoUrl}
              alt={profile.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />

            {/* Futuristic HUD corner marks */}
            <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-[#00E5FF] pointer-events-none shadow-[0_0_8px_#00E5FF]" />
            <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-[#00E5FF] pointer-events-none shadow-[0_0_8px_#00E5FF]" />
            <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-[#00E5FF] pointer-events-none shadow-[0_0_8px_#00E5FF]" />
            <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-[#00E5FF] pointer-events-none shadow-[0_0_8px_#00E5FF]" />

            {/* Hover Replace Overlay */}
            <button
              onClick={triggerUpload}
              type="button"
              className="absolute inset-0 bg-[#050810]/75 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1.5 text-white font-mono cursor-pointer"
              title="Upload New Astronaut Profile Photo"
            >
              <Camera className="w-7 h-7 text-[#00E5FF]" />
              <span className="font-bold text-xs text-[#00E5FF] tracking-wider">CHANGE PHOTO</span>
              <span className="text-[10px] text-slate-200">JPG, PNG, WEBP</span>
            </button>
          </div>

          {/* Quick upload button underneath with prominent high contrast */}
          <button
            onClick={triggerUpload}
            type="button"
            className="mt-3 w-full py-2 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-[#00E5FF]/45 text-xs font-mono font-bold text-[#00E5FF] flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(0,229,255,0.2)] hover:shadow-[0_0_20px_rgba(0,229,255,0.4)]"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload New Photo</span>
          </button>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Astronaut Core Info (Enhanced Typography) */}
        <div className="flex-1 text-center md:text-left space-y-4">
          {/* Top Tagline */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-xs sm:text-sm font-mono">
            <span className="px-3 py-1 rounded-lg bg-[#00E5FF]/15 border border-[#00E5FF]/40 text-[#00E5FF] font-bold shadow-[0_0_10px_rgba(0,229,255,0.2)]">
              CREW ID: {profile.id}
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-200 uppercase tracking-wide">CALLSIGN:</span>
            <span className="text-white font-black tracking-wider text-sm bg-slate-900/80 px-2.5 py-0.5 rounded border border-slate-700">
              "{profile.callsign.toUpperCase()}"
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-200 uppercase tracking-wide">AGE:</span>
            <span className="text-white font-bold">{profile.age} YRS</span>
          </div>

          {/* H1 Name & Primary Role */}
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-wide font-['Chakra_Petch',sans-serif] text-balance">
              {profile.name}
            </h1>
            <p className="mt-1.5 text-lg sm:text-xl text-[#00E5FF] font-bold font-sans tracking-wide">
              {profile.role}
            </p>
          </div>

          {/* Health Status & Mission Badges */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
            {/* Green Health Status Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-mono text-xs sm:text-sm font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>HEALTH STATUS: NOMINAL (FLIGHT READY)</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 font-mono text-xs sm:text-sm">
              <Shield className="w-4 h-4 text-[#00E5FF]" />
              <span className="font-semibold text-white">{profile.missionId}</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 font-mono text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-[#FF8C00]" />
              <span>SPINE DELTA: <strong className="text-[#FF8C00]">+{profile.spineElongation.toFixed(1)} cm</strong></span>
            </div>
          </div>
        </div>

        {/* Action Controls: Edit, Save, Reset */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-center gap-3 shrink-0 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={onSave}
                disabled={isSaving}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-extrabold text-xs sm:text-sm font-mono tracking-wider transition-all shadow-[0_0_25px_rgba(0,229,255,0.5)] flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>SAVING TO DB...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>SAVE PROFILE</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onToggleEdit}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-mono transition-colors"
              >
                CANCEL
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onToggleEdit}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 border border-[#00E5FF]/60 text-[#00E5FF] font-bold text-xs sm:text-sm font-mono tracking-wider transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] flex items-center justify-center gap-2"
              >
                <span>EDIT PROFILE</span>
              </button>

              <button
                type="button"
                onClick={onReset}
                title="Reset to NASA baseline values"
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Baseline</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
