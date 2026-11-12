import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  RefreshCw, 
  ShieldCheck, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Award, 
  Activity, 
  Calendar, 
  Download, 
  Copy, 
  ExternalLink,
  Heart,
  Stethoscope,
  Sparkles
} from 'lucide-react';
import { AstronautProfile } from '../types/astronaut.js';

interface MedicalReportsPageProps {
  profile: AstronautProfile;
  onSendToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const MedicalReportsPage: React.FC<MedicalReportsPageProps> = ({ profile, onSendToast }) => {
  const [reportId, setReportId] = useState<string>('NASA-JSC-MED-2026-84A');
  const [reportDate, setReportDate] = useState<string>(new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }));
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Live vitals snapshot state
  const [vitalsSnapshot, setVitalsSnapshot] = useState({
    hr: profile.restingHeartRate || 58,
    bp: '118/76 mmHg',
    spo2: profile.spO2Baseline || 99,
    temp: '36.8°C',
    spineDelta: profile.spineElongation || 4.2,
    radiation: profile.radiationDoseMsv || 14.8,
    weight: profile.weightKg || 59.2,
    height: profile.heightCm || 168.0,
    sleepAvg: '6.4 hrs/night',
    status: 'EVA CLEARED',
    aiInsight: 'Autonomic cardiovascular indices and parasympathetic recovery metrics remain optimal, confirming flight readiness and complete adaptation for ongoing Expedition 74 orbital bio-payload tasks.',
  });

  // Regenerate Report Data (Mock Refresh)
  const handleRegenerateData = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      setReportId(`NASA-JSC-MED-2026-84${String.fromCharCode(65 + Math.floor(Math.random() * 6))}${randomSuffix}`);
      setReportDate(new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }));

      // Slightly fluctuate vitals within nominal flight boundaries
      const newHr = 57 + Math.floor(Math.random() * 4);
      const newSpo2 = 98 + Math.floor(Math.random() * 2);
      const newSpine = Number((profile.spineElongation + (Math.random() * 0.2 - 0.1)).toFixed(1));

      const insightsPool = [
        'Autonomic cardiovascular indices and parasympathetic recovery metrics remain optimal, confirming flight readiness and complete adaptation for ongoing Expedition 74 orbital bio-payload tasks.',
        'Resting heart rate correlates positively with current rest cycles; cephalic fluid shifts stabilized at Grade I sub-clinical with zero cognitive impairment.',
        'Aerobic and resistive countermeasure adherence exceeds JSC target by 104%; bone mineral density protection index verified nominal.',
        'Spinal elongation stabilized at microgravity equilibrium with negative radicular signs; astronaut cleared without restriction for scheduled EVA operations.',
      ];

      setVitalsSnapshot((prev) => ({
        ...prev,
        hr: newHr,
        spo2: newSpo2,
        spineDelta: newSpine,
        aiInsight: insightsPool[Math.floor(Math.random() * insightsPool.length)],
      }));

      setIsRegenerating(false);
      if (onSendToast) {
        onSendToast('Medical dossier & clearance data re-evaluated and synchronized', 'success');
      }
    }, 600);
  };

  // Trigger browser print dialog for printable card
  const handlePrint = () => {
    window.print();
  };

  // Copy formal report text to clipboard
  const handleCopyText = () => {
    const textToCopy = `
NASA FLIGHT SURGEON CLINICAL MISSION DOSSIER & CLEARANCE REPORT
Document ID: ${reportId}
Date: ${reportDate}
Astronaut: ${profile.name} (Callsign: ${profile.callsign})
ID: ${profile.id} | Age: ${profile.age} | Blood Type: ${profile.bloodType}
Role: ${profile.role} | Mission: ${profile.missionId}

CLEARANCE STATUS: ${vitalsSnapshot.status}
Assigned Flight Surgeon: ${profile.assignedSurgeon?.name || 'Dr. Marcus Vance, M.D., FACEP'}

BIOMETRIC SNAPSHOT:
- Heart Rate: ${vitalsSnapshot.hr} bpm (Resting Nominal)
- Blood Pressure: ${vitalsSnapshot.bp}
- SpO2: ${vitalsSnapshot.spo2}%
- Body Temp: ${vitalsSnapshot.temp}
- Spine Elongation: +${vitalsSnapshot.spineDelta} cm
- Cumulative Radiation: ${vitalsSnapshot.radiation} mSv

CLINICAL SUMMARY & AI INSIGHT:
${vitalsSnapshot.aiInsight}

Validated by NASA JSC Space Medicine Telemetry Desk.
    `.trim();

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    if (onSendToast) {
      onSendToast('Medical report summary copied to clipboard', 'info');
    }
  };

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      {/* Print-specific CSS injected to hide all chrome and display only the formal report cleanly */}
      <style>{`
        @media print {
          body, html {
            background: #ffffff !important;
            color: #000000 !important;
          }
          /* Hide non-report chrome */
          header, aside, footer, nav, .glass-panel-glow, button, .no-print {
            display: none !important;
          }
          /* Make printable container full page white */
          #printable-medical-report {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 15mm 20mm !important;
            background: #ffffff !important;
            color: #111827 !important;
            box-shadow: none !important;
            border: 2px solid #000000 !important;
            border-radius: 0 !important;
          }
          #printable-medical-report * {
            color: #111827 !important;
            border-color: #d1d5db !important;
          }
          #printable-medical-report .print-bg-dark {
            background-color: #f3f4f6 !important;
          }
          #printable-medical-report .print-badge-green {
            background-color: #dcfce7 !important;
            color: #166534 !important;
            border-color: #22c55e !important;
          }
        }
      `}</style>

      {/* Top Banner: Medical Reports Header & Controls */}
      <div className="glass-panel glass-panel-glow p-6 sm:p-7 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border border-[#00E5FF]/30 bg-[#070b1c]/90 shadow-[0_0_35px_rgba(0,229,255,0.18)] no-print">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/50 flex items-center justify-center text-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.3)] shrink-0">
            <FileText className="w-6 h-6 text-[#00E5FF]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Chakra_Petch',sans-serif] tracking-wide">
                Flight Surgeon Clinical Mission Dossier & Clearance Report
              </h1>
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#10b981]/20 border border-[#10b981]/50 text-[#10b981] flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#10b981]" />
                EVA CLEARED // FLIGHT READY
              </span>
            </div>
            <p className="text-xs sm:text-sm font-sans text-slate-300 mt-1">
              Official NASA JSC Space Medicine Division physical evaluation and microgravity adaptation audit for <strong className="text-white">{profile.name}</strong>.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 flex-wrap no-print">
          {/* Regenerate Data Button (Requirement 3) */}
          <button
            type="button"
            onClick={handleRegenerateData}
            disabled={isRegenerating}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
            title="Re-evaluate and mock refresh medical clearance telemetry"
          >
            <RefreshCw className={`w-4 h-4 text-[#00E5FF] ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>{isRegenerating ? 'EVALUATING...' : 'REGENERATE DATA'}</span>
          </button>

          {/* Copy Text Button */}
          <button
            type="button"
            onClick={handleCopyText}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
            title="Copy plain text summary of clinical report"
          >
            <Copy className="w-4 h-4 text-cyan-400" />
            <span>{copied ? 'COPIED!' : 'COPY SUMMARY'}</span>
          </button>

          {/* Print / Export PDF Button (Requirement 3) */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-mono font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-[0_0_25px_rgba(0,229,255,0.45)] hover:shadow-[0_0_35px_rgba(0,229,255,0.65)] cursor-pointer"
          >
            <Printer className="w-4 h-4 text-black" />
            <span>PRINT / EXPORT PDF</span>
          </button>
        </div>
      </div>

      {/* Main Container: NASA Document View (Requirement 4: Official NASA Document Look) */}
      <div className="flex justify-center">
        <div
          id="printable-medical-report"
          className="w-full max-w-4xl bg-white text-slate-900 rounded-2xl p-8 sm:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.85)] border-4 border-slate-300 font-sans space-y-8 relative overflow-hidden"
        >
          {/* Top Decorative Document Header Strip */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-slate-900">
            <div className="flex items-center gap-4">
              {/* NASA Aerospace Medicine Seal Mock */}
              <div className="w-16 h-16 rounded-full bg-[#0b3d91] text-white flex flex-col items-center justify-center font-bold font-mono text-xs shadow-md border-2 border-[#fc3d21] shrink-0">
                <span className="text-[13px] font-black tracking-widest text-[#fc3d21]">NASA</span>
                <span className="text-[8px] uppercase tracking-tighter text-slate-200">JSC MED</span>
              </div>
              <div>
                <div className="text-xs font-mono font-black text-[#0b3d91] tracking-widest uppercase">
                  NATIONAL AERONAUTICS AND SPACE ADMINISTRATION
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 font-['Chakra_Petch',sans-serif] tracking-tight">
                  FLIGHT SURGEON CLINICAL MISSION REPORT
                </h2>
                <div className="text-xs text-slate-600 font-mono mt-0.5">
                  Lyndon B. Johnson Space Center · Space Medicine Operations Division (SD4)
                </div>
              </div>
            </div>

            {/* Document Tracking Barcode & Status Stamp */}
            <div className="text-right font-mono space-y-1 sm:shrink-0">
              <div className="text-xs text-slate-500 font-bold uppercase">DOC REF: {reportId}</div>
              <div className="text-xs text-slate-700">DATE ISSUED: {reportDate}</div>
              <div className="inline-block px-3 py-1 rounded bg-emerald-100 border border-emerald-500 text-emerald-800 text-xs font-black tracking-wider uppercase shadow-sm">
                STATUS: {vitalsSnapshot.status}
              </div>
            </div>
          </div>

          {/* Section 1: Crew Member Demographics (Requirement 2) */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#0b3d91] flex items-center gap-2 border-b border-slate-200 pb-1">
              <span className="w-2 h-2 bg-[#0b3d91] rounded-full" />
              <span>Section I · Crew Member Demographics & Mission Assignment</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono">
              <div>
                <span className="text-slate-500 block">ASTRONAUT NAME:</span>
                <strong className="text-slate-950 text-sm font-sans">{profile.name}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">CALLSIGN:</span>
                <strong className="text-[#0b3d91] text-sm uppercase font-mono">{profile.callsign}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">ASTRONAUT ID:</span>
                <strong className="text-slate-950 text-sm font-mono">{profile.id}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">CHRONOLOGICAL AGE:</span>
                <strong className="text-slate-950 text-sm font-mono">{profile.age} Earth Years</strong>
              </div>
              <div>
                <span className="text-slate-500 block">BLOOD TYPE:</span>
                <strong className="text-rose-700 text-sm font-mono">{profile.bloodType}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">MISSION ID:</span>
                <strong className="text-slate-950 text-sm font-mono">{profile.missionId}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">MISSION DURATION:</span>
                <strong className="text-slate-950 text-sm font-mono">MET Day {profile.missionElapsedDays} (LEO)</strong>
              </div>
              <div>
                <span className="text-slate-500 block">TOTAL EVA TIME:</span>
                <strong className="text-slate-950 text-sm font-mono">{profile.totalEvaHours} Hours</strong>
              </div>
            </div>
          </div>

          {/* Section 2: Biometric & Physiological Snapshot (Requirement 2) */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#0b3d91] flex items-center gap-2 border-b border-slate-200 pb-1">
              <span className="w-2 h-2 bg-[#0b3d91] rounded-full" />
              <span>Section II · 1-Hz Biometric Baseline & Physiological Adaptation Snapshot</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-slate-500 block text-[11px]">RESTING HEART RATE</span>
                <div className="text-xl font-black text-slate-900 mt-1">{vitalsSnapshot.hr} <span className="text-xs font-normal text-slate-600">bpm</span></div>
                <span className="text-emerald-700 text-[10px] font-bold">● Nominal Baseline</span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-slate-500 block text-[11px]">BLOOD PRESSURE</span>
                <div className="text-xl font-black text-slate-900 mt-1">{vitalsSnapshot.bp}</div>
                <span className="text-emerald-700 text-[10px] font-bold">● Normotensive</span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-slate-500 block text-[11px]">SpO2 SATURATION</span>
                <div className="text-xl font-black text-slate-900 mt-1">{vitalsSnapshot.spo2}%</div>
                <span className="text-emerald-700 text-[10px] font-bold">● 1.0 ATM O2 Normal</span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-slate-500 block text-[11px]">CORE TEMPERATURE</span>
                <div className="text-xl font-black text-slate-900 mt-1">{vitalsSnapshot.temp}</div>
                <span className="text-emerald-700 text-[10px] font-bold">● Afebrile</span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-slate-500 block text-[11px]">SPINE ELONGATION</span>
                <div className="text-xl font-black text-amber-700 mt-1">+{vitalsSnapshot.spineDelta} <span className="text-xs font-normal text-slate-600">cm</span></div>
                <span className="text-amber-700 text-[10px] font-bold">▲ Expected μG Adaptation</span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-slate-500 block text-[11px]">CUMULATIVE RADIATION</span>
                <div className="text-xl font-black text-slate-900 mt-1">{vitalsSnapshot.radiation} <span className="text-xs font-normal text-slate-600">mSv</span></div>
                <span className="text-emerald-700 text-[10px] font-bold">● Far Below Career Limit</span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-slate-500 block text-[11px]">WEIGHT / HEIGHT</span>
                <div className="text-sm font-black text-slate-900 mt-1.5">{vitalsSnapshot.weight} kg / {vitalsSnapshot.height} cm</div>
                <span className="text-slate-600 text-[10px]">BMI: 21.0 (Optimal)</span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-slate-500 block text-[11px]">SLEEP DURATION (AVG)</span>
                <div className="text-sm font-black text-slate-900 mt-1.5">{vitalsSnapshot.sleepAvg}</div>
                <span className="text-slate-600 text-[10px]">Actigraphy Monitored</span>
              </div>
            </div>
          </div>

          {/* Section 3: Symptom History & Clinical Adaptation Notes (Requirement 2) */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#0b3d91] flex items-center gap-2 border-b border-slate-200 pb-1">
              <span className="w-2 h-2 bg-[#0b3d91] rounded-full" />
              <span>Section III · Active Clinical Adaptations & Symptom History</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
                <div>
                  <strong className="text-slate-900 block text-sm font-sans font-bold">
                    1. Microgravity Spinal Elongation (+4.2 cm observed)
                  </strong>
                  <p className="text-slate-600 mt-0.5 text-xs font-sans">
                    Reviewed by Lead Flight Surgeon. Transient lower back muscle tightness managed via ARED resistive exercise countermeasure and passive flexion rack positioning. No neurological deficits.
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold shrink-0">
                  MANAGED / STABLE
                </span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
                <div>
                  <strong className="text-slate-900 block text-sm font-sans font-bold">
                    2. Cephalic Fluid Shift (Grade I Sub-clinical)
                  </strong>
                  <p className="text-slate-600 mt-0.5 text-xs font-sans">
                    Normal fluid redistribution in microgravity. Fundoscopic exam shows zero optic disc edema (SANS Grade 0). Intraocular pressure normal at 14 mmHg OU.
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold shrink-0">
                  NOMINAL
                </span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
                <div>
                  <strong className="text-slate-900 block text-sm font-sans font-bold">
                    3. Space Motion Adaptation Syndrome (Resolved MET D+03)
                  </strong>
                  <p className="text-slate-600 mt-0.5 text-xs font-sans">
                    Vestibular neuro-vestibular adaptation achieved on flight day 3. Zero active symptoms or antiemetic requirement.
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[11px] font-bold shrink-0">
                  RESOLVED
                </span>
              </div>

              <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/60 flex items-start justify-between gap-4 text-rose-900">
                <div>
                  <strong className="block text-sm font-sans font-bold text-rose-950">
                    4. Medical Countermeasure Alerts & Allergies
                  </strong>
                  <p className="mt-0.5 text-xs font-sans text-rose-800">
                    Confirmed allergies: Penicillin, Sulfa-based antiseptics. Emergency medical kits A & B aboard station stocked with safe alternative cephalosporins and quinolones.
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-rose-200 text-rose-900 text-[11px] font-bold shrink-0">
                  FLAGGED IN KIT
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: AI Insights & Clinical Recommendation (Requirement 2) */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#0b3d91] flex items-center gap-2 border-b border-slate-200 pb-1">
              <Sparkles className="w-4 h-4 text-[#0b3d91]" />
              <span>Section IV · AI Autonomous Clinical Synthesis & Countermeasure Guidance</span>
            </div>

            <div className="p-4 rounded-xl border-l-4 border-l-[#0b3d91] bg-slate-50 border border-slate-200 text-slate-800 text-sm font-sans leading-relaxed">
              <p className="font-semibold text-slate-950">
                "{vitalsSnapshot.aiInsight}"
              </p>
              <div className="mt-2 text-xs font-mono text-slate-500">
                Generated via ASTRO Neural Flight Medicine Co-Pilot · Certified for Ground Telemetry Synchronization
              </div>
            </div>
          </div>

          {/* Section 5: Official Signatures & NASA Certification Stamp */}
          <div className="pt-6 border-t-2 border-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
            <div className="space-y-2">
              <div className="text-xs font-mono text-slate-500 uppercase">OFFICIAL FLIGHT CLEARANCE ENDORSEMENT:</div>
              <div className="p-3 rounded-xl border-2 border-emerald-600 bg-emerald-50 text-emerald-950 text-xs font-mono space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>FLIGHT SURGEON EVA CLEARANCE: ISSUED</span>
                </div>
                <p className="text-slate-700 text-[11px]">
                  Crew member is physically certified for extravehicular activity (EVA) and high-load microgravity laboratory operations.
                </p>
              </div>
            </div>

            {/* Flight Surgeon Signature Block */}
            <div className="text-right space-y-1 font-mono text-xs">
              <div className="text-slate-500 text-[11px]">ELECTRONICALLY VALIDATED BY:</div>
              <div className="text-lg font-bold text-slate-950 font-serif italic">
                Dr. Marcus Vance, M.D., FACEP
              </div>
              <div className="text-slate-700 text-[11px]">
                Lead Flight Surgeon · NASA JSC Aerospace Medicine (Code SD4)
              </div>
              <div className="text-slate-500 text-[10px]">
                Credential ID: NASA-FS-9842 · Security Sig: SHA256:{reportId.slice(0, 12)}
              </div>
            </div>
          </div>

          {/* Footer Official Confidentiality Bar */}
          <div className="pt-4 border-t border-slate-200 text-center text-[10px] font-mono text-slate-500">
            CONFIDENTIAL MEDICAL RECORD · PROTECTED BY FEDERAL PRIVACY ACT OF 1974 & NASA AEROSPACE MEDICINE REGULATIONS
          </div>
        </div>
      </div>
    </div>
  );
};
