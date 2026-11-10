import React from 'react';
import { UserCheck, Award, Clock, Heart, Radiation, Calendar, Flame } from 'lucide-react';
import { AstronautProfile } from '../types/astronaut.js';
import { SimulatedDataTooltip } from './SimulatedDataTooltip.js';

interface CrewDossierCardProps {
  profile: AstronautProfile;
  isEditing?: boolean;
  onChange?: (field: keyof AstronautProfile, value: any) => void;
}

export const CrewDossierCard: React.FC<CrewDossierCardProps> = ({
  profile,
  isEditing = false,
  onChange,
}) => {
  return (
    <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden border border-[#00E5FF]/30 shadow-[0_0_30px_rgba(0,229,255,0.15)] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/40 text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.3)]">
            <UserCheck className="w-6 h-6 text-[#00E5FF]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-['Chakra_Petch',sans-serif] tracking-wide">
              Crew Dossier & Flight Credentials
            </h2>
            <p className="text-sm font-sans text-slate-300">
              NASA Astronaut Corps · Active Expedition Bio-Registry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold text-[#00E5FF] px-3 py-1.5 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/35">
          <Award className="w-4 h-4" />
          <span>CLASS OF 2024 · ARTEMIS CADRE</span>
        </div>
      </div>

      {/* Grid of primary crew dossier fields (Numbers in text-2xl/text-3xl bold glowing) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Full Name */}
        <div className="p-5 rounded-xl bg-[#09112a] border border-slate-700/80 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="text-xs sm:text-sm font-mono uppercase tracking-wider text-slate-200 font-semibold">
            FULL LEGAL NAME
          </div>
          {isEditing ? (
            <input
              type="text"
              value={profile.name}
              onChange={(e) => onChange?.('name', e.target.value)}
              aria-label="Astronaut Full Legal Name"
              className="mt-2 w-full bg-slate-900 text-white font-bold text-base px-3 py-2 rounded-lg border border-[#00E5FF]/50 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
            />
          ) : (
            <div className="mt-2 text-lg sm:text-xl font-bold text-white font-['Chakra_Petch',sans-serif] truncate">
              {profile.name}
            </div>
          )}
          <div className="text-xs text-slate-300 mt-1 font-sans">Payload Specialist & Bio-Engineer</div>
        </div>

        {/* Mission Callsign */}
        <div className="p-5 rounded-xl bg-[#09112a] border border-slate-700/80 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="text-xs sm:text-sm font-mono uppercase tracking-wider text-slate-200 font-semibold">
            MISSION CALLSIGN
          </div>
          {isEditing ? (
            <input
              type="text"
              value={profile.callsign}
              onChange={(e) => onChange?.('callsign', e.target.value)}
              aria-label="Mission Callsign"
              className="mt-2 w-full bg-slate-900 text-[#00E5FF] font-mono font-bold text-base px-3 py-2 rounded-lg border border-[#00E5FF]/50 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
            />
          ) : (
            <div className="mt-2 text-xl sm:text-2xl font-bold font-mono text-[#00E5FF] glow-text-cyan tracking-wider flex items-center gap-1.5">
              <span>"{profile.callsign.toUpperCase()}"</span>
            </div>
          )}
          <div className="text-xs text-slate-300 mt-1 font-sans">Tactical Space-Ground Voice Tag</div>
        </div>

        {/* Age & Chrono Status */}
        <div className="p-5 rounded-xl bg-[#09112a] border border-slate-700/80 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="text-xs sm:text-sm font-mono uppercase tracking-wider text-slate-200 font-semibold">
            AGE / CHRONOLOGY
          </div>
          {isEditing ? (
            <input
              type="number"
              min="18"
              max="90"
              value={profile.age}
              onChange={(e) => onChange?.('age', parseInt(e.target.value, 10) || 21)}
              aria-label="Age"
              className="mt-2 w-full bg-slate-900 text-white font-mono font-bold text-base px-3 py-2 rounded-lg border border-[#00E5FF]/50 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
            />
          ) : (
            <div className="mt-2 text-xl sm:text-2xl font-bold font-mono text-white tracking-wide">
              {profile.age} <span className="text-sm text-slate-300 font-sans font-normal">Years Earth-Relative</span>
            </div>
          )}
          <div className="text-xs text-slate-300 mt-1 font-sans">Tier-1 Optimal Physical Flight Rating</div>
        </div>

        {/* Total EVA Hours with Info Tooltip */}
        <div className="p-5 rounded-xl bg-[#09112a] border border-slate-700/80 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="text-xs sm:text-sm font-mono uppercase tracking-wider text-slate-200 font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span>TOTAL EVA DURATION</span>
              <SimulatedDataTooltip />
            </span>
            <Clock className="w-4 h-4 text-[#00E5FF]" />
          </div>
          {isEditing ? (
            <input
              type="number"
              step="0.5"
              min="0"
              value={profile.totalEvaHours}
              onChange={(e) => onChange?.('totalEvaHours', parseFloat(e.target.value) || 0)}
              aria-label="Total EVA Duration"
              className="mt-2 w-full bg-slate-900 text-[#00E5FF] font-mono font-bold text-base px-3 py-2 rounded-lg border border-[#00E5FF]/50 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
            />
          ) : (
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono text-[#00E5FF] glow-text-cyan flex items-baseline gap-1.5">
              <span className="tabular-nums">{profile.totalEvaHours.toFixed(1)}</span>
              <span className="text-xs sm:text-sm text-slate-200 uppercase font-sans font-normal">Hours (4 Sorties)</span>
            </div>
          )}
          <div className="text-xs text-slate-300 mt-1 font-sans">xEMU Microgravity Certified</div>
        </div>
      </div>

      {/* Role & Mission Assignment Strip */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#070e24] border border-[#00E5FF]/25 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 flex-1">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
            FLIGHT ASSIGNMENT & SPECIALIZATION
          </div>
          {isEditing ? (
            <input
              type="text"
              value={profile.role}
              onChange={(e) => onChange?.('role', e.target.value)}
              aria-label="Mission Role"
              className="w-full bg-slate-900 text-white font-semibold text-base px-3 py-2 rounded-lg border border-[#00E5FF]/50 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
            />
          ) : (
            <div className="text-base sm:text-lg font-bold text-white font-['Chakra_Petch',sans-serif]">
              {profile.role}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm font-mono shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-200">
            <Calendar className="w-4 h-4 text-[#00E5FF]" />
            <span className="text-slate-300">EXPEDITION:</span>
            <span className="text-white font-bold">{profile.missionId}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-[#FF8C00]/40 text-slate-200">
            <Flame className="w-4 h-4 text-[#FF8C00]" />
            <span className="text-slate-300">MET:</span>
            <span className="text-[#FF8C00] font-bold">DAY {profile.missionElapsedDays}</span>
          </div>
        </div>
      </div>

      {/* Anthropometric & Telemetric Baselines with Large Glowing Numbers & Tooltips */}
      <div>
        <div className="text-xs sm:text-sm font-mono tracking-wider uppercase text-slate-200 font-bold mb-3 flex items-center justify-between">
          <span>FLIGHT BIOMETRIC BASELINES</span>
          <span className="text-[#00E5FF] text-xs font-mono">CONTINUOUS TELEMETRY PROBES ACTIVE</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm font-mono">
          {/* Height */}
          <div className="p-4 rounded-xl bg-[#09112a] border border-slate-700/80 shadow-[0_4px_15px_rgba(0,0,0,0.4)] space-y-1">
            <div className="text-slate-300 text-xs font-semibold uppercase flex items-center justify-between">
              <span>CURRENT HEIGHT</span>
              <SimulatedDataTooltip />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white mt-1 tabular-nums glow-text-cyan">
              {(profile.heightCm + profile.spineElongation).toFixed(1)} cm
            </div>
            <div className="text-xs text-[#FF8C00] font-semibold">
              +{profile.spineElongation.toFixed(1)} cm microG elongation
            </div>
          </div>

          {/* Mass */}
          <div className="p-4 rounded-xl bg-[#09112a] border border-slate-700/80 shadow-[0_4px_15px_rgba(0,0,0,0.4)] space-y-1">
            <div className="text-slate-300 text-xs font-semibold uppercase flex items-center justify-between">
              <span>CURRENT MASS</span>
              <SimulatedDataTooltip />
            </div>
            {isEditing ? (
              <input
                type="number"
                step="0.1"
                value={profile.weightKg}
                onChange={(e) => onChange?.('weightKg', parseFloat(e.target.value) || 60)}
                aria-label="Weight in Kilograms"
                className="w-full bg-slate-900 text-white font-mono text-sm px-2 py-1 rounded border border-[#00E5FF]/50 mt-1"
              />
            ) : (
              <div className="text-xl sm:text-2xl font-bold text-white mt-1 tabular-nums">
                {profile.weightKg.toFixed(1)} kg
              </div>
            )}
            <div className="text-xs text-slate-300 font-sans">SLAM-MD inertial calibration</div>
          </div>

          {/* Resting Pulse */}
          <div className="p-4 rounded-xl bg-[#09112a] border border-slate-700/80 shadow-[0_4px_15px_rgba(0,0,0,0.4)] space-y-1">
            <div className="text-slate-300 text-xs font-semibold uppercase flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span>RESTING PULSE</span>
                <SimulatedDataTooltip />
              </span>
              <Heart className="w-4 h-4 text-rose-400" />
            </div>
            {isEditing ? (
              <input
                type="number"
                value={profile.restingHeartRate}
                onChange={(e) => onChange?.('restingHeartRate', parseInt(e.target.value, 10) || 60)}
                aria-label="Resting Pulse Rate"
                className="w-full bg-slate-900 text-white font-mono text-sm px-2 py-1 rounded border border-[#00E5FF]/50 mt-1"
              />
            ) : (
              <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1 tabular-nums glow-text-emerald">
                {profile.restingHeartRate} <span className="text-xs font-sans text-slate-200">bpm</span>
              </div>
            )}
            <div className="text-xs text-emerald-400 font-semibold">Aerobic baseline nominal</div>
          </div>

          {/* Radiation Accrual */}
          <div className="p-4 rounded-xl bg-[#09112a] border border-slate-700/80 shadow-[0_4px_15px_rgba(0,0,0,0.4)] space-y-1">
            <div className="text-slate-300 text-xs font-semibold uppercase flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span>RADIATION ACCRUAL</span>
                <SimulatedDataTooltip />
              </span>
              <Radiation className="w-4 h-4 text-[#FF8C00]" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#FF8C00] mt-1 tabular-nums glow-text-orange">
              {profile.radiationDoseMsv.toFixed(1)} <span className="text-xs font-sans text-slate-200">mSv</span>
            </div>
            <div className="text-xs text-slate-300 font-sans">Well within 100 mSv annual limit</div>
          </div>
        </div>
      </div>
    </div>
  );
};
