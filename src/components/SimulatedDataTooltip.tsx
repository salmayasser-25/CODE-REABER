import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface SimulatedDataTooltipProps {
  className?: string;
  text?: string;
  align?: 'left' | 'center' | 'right';
}

export const SimulatedDataTooltip: React.FC<SimulatedDataTooltipProps> = ({
  className = '',
  text = 'Source: Simulated Bio-Suit Telemetry (Not real NASA data)',
  align = 'center',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const alignClasses = {
    left: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    right: 'right-0',
  }[align];

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      <button
        type="button"
        aria-label="Simulated telemetry source info"
        className="p-0.5 text-[#00E5FF]/70 hover:text-[#00E5FF] transition-colors cursor-help rounded focus:outline-none focus:ring-1 focus:ring-[#00E5FF]"
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {isVisible && (
        <div
          role="tooltip"
          className={`absolute bottom-full mb-2 z-50 w-56 p-2.5 rounded-lg bg-[#070d1e] text-slate-100 text-[11px] font-mono leading-tight border border-[#00E5FF]/50 shadow-[0_0_20px_rgba(0,229,255,0.3)] backdrop-blur-md pointer-events-none animate-in fade-in zoom-in-95 duration-150 ${alignClasses}`}
        >
          <div className="flex items-start gap-1.5 text-white">
            <span className="text-[#00E5FF] font-bold">ℹ</span>
            <span>{text}</span>
          </div>
          {/* Tooltip caret */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-[#070d1e]" />
        </div>
      )}
    </div>
  );
};
