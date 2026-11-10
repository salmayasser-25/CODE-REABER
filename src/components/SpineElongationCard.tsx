import React from 'react';
import { Ruler, ArrowUpRight, BookOpen } from 'lucide-react';
import { SimulatedDataTooltip } from './SimulatedDataTooltip.js';

interface SpineElongationCardProps {
  spineElongation: number;
  isEditing?: boolean;
  onSpineChange?: (val: number) => void;
  onOpenContextModal?: () => void;
}

export const SpineElongationCard: React.FC<SpineElongationCardProps> = ({
  spineElongation,
  isEditing = false,
  onSpineChange,
  onOpenContextModal,
}) => {
  // Requirement 6: Dynamic color indicator
  // < +3.0 cm: Green (Nominal)
  // +3.0 to +5.0 cm: Orange / Warning (Moderate Adaptation)
  // > +5.0 cm: Red / Critical (Elevated Risk)
  const isGreen = spineElongation < 3.0;
  const isOrange = spineElongation >= 3.0 && spineElongation <= 5.0;
  const isRed = spineElongation > 5.0;

  const severityLabel = isGreen
    ? 'NOMINAL ADAPTATION (< 3.0 CM)'
    : isOrange
    ? 'MODERATE ADAPTATION (3.0 – 5.0 CM)'
    : 'CRITICAL EXPANSION (> 5.0 CM)';

  const colorStyles = isGreen
    ? {
        text: 'text-emerald-400',
        glowText: 'glow-text-emerald',
        badge: 'text-emerald-300 border-emerald-400/50 bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
        sliderAccent: 'accent-emerald-400',
        trackGrad: 'from-emerald-500 via-emerald-400 to-emerald-300',
        cardBorder: 'border-emerald-500/30',
        iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      }
    : isOrange
    ? {
        text: 'text-[#FF8C00]',
        glowText: 'glow-text-orange',
        badge: 'text-[#FFB347] border-[#FF8C00]/50 bg-[#FF8C00]/20 shadow-[0_0_15px_rgba(255,140,0,0.3)]',
        sliderAccent: 'accent-[#FF8C00]',
        trackGrad: 'from-emerald-500 via-[#FF8C00] to-amber-400',
        cardBorder: 'border-[#FF8C00]/35',
        iconBg: 'bg-[#FF8C00]/20 text-[#FF8C00] border-[#FF8C00]/40',
      }
    : {
        text: 'text-rose-400',
        glowText: 'glow-text-rose',
        badge: 'text-rose-300 border-rose-500/60 bg-rose-500/25 shadow-[0_0_18px_rgba(244,63,94,0.4)]',
        sliderAccent: 'accent-rose-500',
        trackGrad: 'from-[#FF8C00] via-rose-500 to-rose-400',
        cardBorder: 'border-rose-500/40',
        iconBg: 'bg-rose-500/20 text-rose-400 border-rose-500/50',
      };

  const progressPercent = Math.min(Math.max((spineElongation / 8.0) * 100, 4), 100);

  return (
    <div className={`glass-panel p-6 sm:p-7 rounded-2xl relative overflow-hidden border ${colorStyles.cardBorder} transition-all duration-300`}>
      {/* Background radial atmosphere */}
      <div className="absolute top-0 right-0 w-60 h-60 bg-[#00E5FF]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Card Header (Typography refined to text-2xl/text-base with high contrast) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${colorStyles.iconBg}`}>
            <Ruler className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-['Chakra_Petch',sans-serif] tracking-wide">
              Microgravity Spine Elongation Delta
            </h2>
            <p className="text-sm font-sans text-slate-300">
              Intervertebral disc decompression & axial spine telemetry
            </p>
          </div>
        </div>

        {/* Dynamic Warning Indicator Badge */}
        <span className={`self-start sm:self-center px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold border ${colorStyles.badge}`}>
          {severityLabel}
        </span>
      </div>

      {/* Visual Metric Display */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Large Prominent Telemetry Readout */}
        <div className="md:col-span-5 p-5 rounded-xl bg-[#09112a] border border-slate-700/80 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between text-xs sm:text-sm font-mono uppercase tracking-wider text-slate-200">
            <span className="flex items-center gap-1.5">
              <span>TOTAL SPINAL EXPANSION (ΔL)</span>
              <SimulatedDataTooltip />
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${colorStyles.text} ${colorStyles.glowText}`}>
              +{spineElongation.toFixed(1)}
            </span>
            <span className="text-xl font-mono text-slate-200 uppercase font-bold">cm</span>
          </div>

          <div className="mt-3 text-xs sm:text-sm text-slate-200 font-sans flex items-center gap-1.5 pt-2 border-t border-slate-800">
            <ArrowUpRight className={`w-4 h-4 ${colorStyles.text}`} />
            <span>Pre-flight baseline: <strong>168.0 cm</strong> (Stand-up)</span>
          </div>
        </div>

        {/* Dynamic Scale / Slider Controls */}
        <div className="md:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs sm:text-sm font-mono">
            <span className="text-slate-300 uppercase tracking-wider">Flight Range: 0.0 to 8.0 cm</span>
            <span className={`font-bold ${colorStyles.text}`}>
              Current Value: +{spineElongation.toFixed(1)} cm
            </span>
          </div>

          {/* Calibrated slider */}
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="8"
              step="0.1"
              value={spineElongation}
              disabled={!isEditing}
              onChange={(e) => onSpineChange?.(parseFloat(e.target.value))}
              aria-label="Microgravity Spine Elongation Delta Slider"
              className={`w-full h-3 rounded-lg appearance-none cursor-pointer transition-all ${
                isEditing
                  ? `bg-slate-800 ${colorStyles.sliderAccent} ring-2 ring-[#00E5FF]/60 shadow-[0_0_15px_rgba(0,229,255,0.3)]`
                  : `bg-slate-800 ${colorStyles.sliderAccent} opacity-95 cursor-default`
              }`}
            />

            {/* Visual Color-Coded Bar with Dynamic Gradient */}
            <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${colorStyles.trackGrad} rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(0,229,255,0.4)]`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            
            {/* Range markers with clear color cues */}
            <div className="flex justify-between text-xs font-mono font-medium pt-1">
              <span className="text-emerald-400">0.0 cm</span>
              <span className="text-emerald-400">&lt; +3.0 cm (Nominal)</span>
              <span className="text-[#FF8C00]">+3.0 – +5.0 cm (Warning)</span>
              <span className="text-rose-400">&gt; +5.0 cm (Critical)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Simplified Summary with Progressive Disclosure (Requirement 4) */}
      <div className="mt-6 p-4 rounded-xl bg-[#070e24] border border-[#00E5FF]/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="text-xs font-mono text-[#00E5FF] uppercase font-bold tracking-wider">
            Physiological Adaptation Summary
          </div>
          <p className="text-sm text-slate-100 font-sans leading-relaxed">
            Spinal discs expand due to absent gravitational axial load. Active delta of <strong className={colorStyles.text}>+{spineElongation.toFixed(1)} cm</strong> requires daily ARED resistive deadlifts and countermeasure harness monitoring.
          </p>
        </div>

        {onOpenContextModal && (
          <button
            type="button"
            onClick={onOpenContextModal}
            className="shrink-0 px-4 py-2 rounded-lg bg-[#00E5FF]/15 hover:bg-[#00E5FF]/25 border border-[#00E5FF]/50 text-[#00E5FF] text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.2)] hover:shadow-[0_0_20px_rgba(0,229,255,0.4)]"
          >
            <BookOpen className="w-4 h-4 text-[#00E5FF]" />
            <span>LEARN MORE / CLINICAL CONTEXT</span>
          </button>
        )}
      </div>
    </div>
  );
};
