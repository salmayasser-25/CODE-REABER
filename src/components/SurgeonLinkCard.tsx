import React, { useState } from 'react';
import { Shield, Radio, CheckCircle, Send, Check, Stethoscope } from 'lucide-react';
import { FlightSurgeon } from '../types/astronaut.js';

interface SurgeonLinkCardProps {
  surgeon: FlightSurgeon;
  isEditing?: boolean;
  onSurgeonChange?: (field: keyof FlightSurgeon, val: string) => void;
  onSendPingToast?: (msg: string) => void;
}

export const SurgeonLinkCard: React.FC<SurgeonLinkCardProps> = ({
  surgeon,
  isEditing = false,
  onSurgeonChange,
  onSendPingToast,
}) => {
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [lastPingTime, setLastPingTime] = useState<string | null>(null);

  const handleSendPing = () => {
    setIsTransmitting(true);
    setTimeout(() => {
      setIsTransmitting(false);
      const timeStr = new Date().toLocaleTimeString();
      setLastPingTime(timeStr);
      onSendPingToast?.('Encrypted Bio-metric Ping sent to Dr. Marcus Vance. Awaiting response.');
    }, 600);
  };

  return (
    <div
      className="glass-panel p-6 sm:p-7 rounded-2xl relative overflow-hidden border border-[#00E5FF]/30 shadow-[0_0_25px_rgba(0,229,255,0.15)] bg-[#0a1128]"
      style={{ backgroundColor: '#0a1128' }}
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#00E5FF]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/40 text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.3)]">
            <Shield className="w-6 h-6 text-[#00E5FF]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-['Chakra_Petch',sans-serif] tracking-wide">
              Ground Flight Surgeon Link
            </h2>
            <p className="text-sm font-sans text-slate-300">
              NASA JSC Mission Control Center · Space Medicine Telemetry Uplink
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold border border-emerald-400/50 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>DIRECT TELEMEDICINE ONLINE</span>
        </div>
      </div>

      {/* Surgeon Credentials Grid (Typography enhanced to text-xl/text-sm with pure white contrast) */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Surgeon Name */}
        <div className="p-5 rounded-xl bg-[#09112a] border border-slate-700/80 shadow-[0_4px_20px_rgba(0,0,0,0.5)] space-y-2">
          <div className="text-xs sm:text-sm font-mono text-slate-200 uppercase tracking-wider font-semibold">
            ASSIGNED FLIGHT SURGEON
          </div>
          {isEditing ? (
            <input
              type="text"
              value={surgeon.name}
              onChange={(e) => onSurgeonChange?.('name', e.target.value)}
              aria-label="Flight Surgeon Name"
              className="w-full bg-slate-900 text-white font-bold text-base px-3 py-2 rounded-lg border border-[#00E5FF]/50 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
            />
          ) : (
            <div className="text-lg sm:text-xl font-bold text-white font-['Chakra_Petch',sans-serif] tracking-wide">
              {surgeon.name}
            </div>
          )}
          <div className="text-xs text-slate-300 font-sans">
            NASA Astronaut Office · JSC Lead Physician
          </div>
        </div>

        {/* Credential ID */}
        <div className="p-5 rounded-xl bg-[#09112a] border border-slate-700/80 shadow-[0_4px_20px_rgba(0,0,0,0.5)] space-y-2">
          <div className="text-xs sm:text-sm font-mono text-slate-200 uppercase tracking-wider font-semibold">
            CREDENTIAL & BADGE ID
          </div>
          {isEditing ? (
            <input
              type="text"
              value={surgeon.credentialId}
              onChange={(e) => onSurgeonChange?.('credentialId', e.target.value)}
              aria-label="Credential ID"
              className="w-full bg-slate-900 text-[#00E5FF] font-mono font-bold text-base px-3 py-2 rounded-lg border border-[#00E5FF]/50 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
            />
          ) : (
            <div className="text-lg sm:text-xl font-bold font-mono text-[#00E5FF] glow-text-cyan tracking-wider">
              {surgeon.credentialId}
            </div>
          )}
          <div className="text-xs text-slate-300 font-sans">
            Active Flight Clearance Level 5
          </div>
        </div>

        {/* Certification Status */}
        <div className="p-5 rounded-xl bg-[#09112a] border border-slate-700/80 shadow-[0_4px_20px_rgba(0,0,0,0.5)] space-y-2">
          <div className="text-xs sm:text-sm font-mono text-slate-200 uppercase tracking-wider font-semibold">
            CERTIFICATION STATUS
          </div>
          {isEditing ? (
            <input
              type="text"
              value={surgeon.certificationStatus}
              onChange={(e) => onSurgeonChange?.('certificationStatus', e.target.value)}
              aria-label="Certification Status"
              className="w-full bg-slate-900 text-white font-medium text-xs px-3 py-2 rounded-lg border border-[#00E5FF]/50 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
            />
          ) : (
            <div className="text-sm sm:text-base font-bold text-emerald-400 font-mono">
              {surgeon.certificationStatus}
            </div>
          )}
          <div className="text-xs text-slate-300 font-sans">
            Aerospace Medicine Board Certified
          </div>
        </div>
      </div>

      {/* Telemetry Channel & Primary Bio-Metric Ping Action (Requirement 5) */}
      <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-slate-200">
            <Radio className="w-4 h-4 text-[#00E5FF] animate-pulse" />
            <span className="text-slate-300 font-semibold uppercase">UPLINK CHANNEL:</span>
            <span className="text-[#00E5FF] font-bold">{surgeon.callsignOrFreq || 'MCC-Houston MedCom Alpha (248.500 MHz SAT-Uplink)'}</span>
          </div>
          <div className="text-xs text-slate-300 font-mono">
            Direct AES-256 Telemedicine Relay · Round-Trip Latency: 0.8s
            {lastPingTime && (
              <span className="text-emerald-400 ml-2 font-bold">
                (Last ping ACK at {lastPingTime})
              </span>
            )}
          </div>
        </div>

        {/* Primary Action Button: Send Bio-metric Ping to Surgeon */}
        <button
          type="button"
          onClick={handleSendPing}
          disabled={isTransmitting}
          className="w-full md:w-auto px-6 py-3 rounded-xl bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-bold text-sm font-mono tracking-wider transition-all duration-200 flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(0,229,255,0.45)] hover:shadow-[0_0_35px_rgba(0,229,255,0.65)] hover:-translate-y-0.5 active:translate-y-0"
        >
          {isTransmitting ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
              <span>TRANSMITTING ENCRYPTED TELEMETRY...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 text-black" />
              <span>SEND BIO-METRIC PING TO SURGEON</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
