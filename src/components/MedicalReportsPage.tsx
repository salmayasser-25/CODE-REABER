import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Printer, 
  Download, 
  Calendar, 
  User, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  Stethoscope, 
  AlertTriangle,
  FileText,
  Clock,
  Sparkles,
  Info,
  Send,
  Inbox,
  ArrowUpRight,
  Share2,
  Forward,
  CheckCircle,
  Plus,
  Search,
  Filter,
  Paperclip,
  Eye,
  X,
  ChevronRight,
  ArrowRight,
  Lock,
  Radio,
  FileDown
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { 
  AstronautProfile, 
  CrewMemberSummary, 
  VitalsData, 
  SymptomReport, 
  MedicalRestriction, 
  DoctorNote,
  ExchangedMedicalReport,
  ReportReviewResponse
} from '../types/astronaut.ts';

interface MedicalReportsPageProps {
  crew: CrewMemberSummary[];
  profile: AstronautProfile;
  vitals: VitalsData | null;
  symptoms: SymptomReport[];
  restrictions: MedicalRestriction[];
  notes: DoctorNote[];
  onNavigateToAstronaut?: (astronautId: string) => void;
}

const CONSULTING_DOCTORS = [
  { id: 'doc-sarah', name: 'Dr. Sarah Chen, M.D.', role: 'Lead Space Spine & Orthopedic Consultant (JSC)', location: 'MCC Houston / JSC Flight Medicine' },
  { id: 'doc-amira', name: 'Dr. Amira Patel, M.D., FACC', role: 'Autonomic & Cardiovascular Flight Surgeon', location: 'DLR / EAC Cologne' },
  { id: 'doc-kenji', name: 'Dr. Kenji Sato, M.D., Ph.D.', role: 'Aerospace Neuro-Vestibular Specialist', location: 'JAXA / Tsukuba Space Center' },
  { id: 'doc-elena', name: 'Lt. Elena Rostova, M.D.', role: 'On-Orbit Station Medical Officer', location: 'ISS Node 2 / Orbit' },
  { id: 'doc-robert', name: 'Dr. Robert Hayes, M.D.', role: 'EVA Physiological Readiness Lead', location: 'MCC Houston / JSC' },
];

export const MedicalReportsPage: React.FC<MedicalReportsPageProps> = ({
  crew,
  profile,
  vitals,
  symptoms,
  restrictions,
  notes,
  onNavigateToAstronaut,
}) => {
  // Page Tab Mode: 'exchange' (Document Exchange & Clinical Referrals) vs 'surveillance' (Automated Telemetry Dossier)
  const [activeTabMode, setActiveTabMode] = useState<'exchange' | 'surveillance'>('exchange');

  // Exchanged Reports Store
  const [reports, setReports] = useState<ExchangedMedicalReport[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'inbox' | 'outbox' | 'pending' | 'reviewed'>('all');
  const [astronautFilter, setAstronautFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');

  // Modals & Active Document State
  const [selectedReport, setSelectedReport] = useState<ExchangedMedicalReport | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);
  const [isForwardOpen, setIsForwardOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Form State: Transmit New Report
  const [newReportTitle, setNewReportTitle] = useState<string>('');
  const [newReportType, setNewReportType] = useState<ExchangedMedicalReport['documentType']>('Clinical Specialist Referral');
  const [newReportAstronautId, setNewReportAstronautId] = useState<string>(profile.id);
  const [newReportDoctorId, setNewReportDoctorId] = useState<string>('doc-sarah');
  const [newReportUrgency, setNewReportUrgency] = useState<ExchangedMedicalReport['urgency']>('urgent');
  const [newReportSummary, setNewReportSummary] = useState<string>('');
  const [newReportFindings, setNewReportFindings] = useState<string>('');
  const [newReportQuestion, setNewReportQuestion] = useState<string>('');
  const [newReportAttachmentType, setNewReportAttachmentType] = useState<string>('ultrasound_dicom');

  // Form State: Review & Reply
  const [reviewAction, setReviewAction] = useState<ReportReviewResponse['action']>('endorsed');
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [reviewRecommendations, setReviewRecommendations] = useState<string>('');

  // Form State: Forward Report
  const [forwardToDoctorId, setForwardToDoctorId] = useState<string>('doc-robert');
  const [forwardReason, setForwardReason] = useState<string>('');

  // Surveillance Sheet Specific State
  const [selectedAstronautId, setSelectedAstronautId] = useState<string>(profile.id);
  const [dateRange, setDateRange] = useState<'24h' | '7d' | '30d' | 'mission'>('7d');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const triggerToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Fetch exchanged medical reports from backend API
  const fetchReports = async () => {
    try {
      setIsLoadingReports(true);
      const res = await fetch('/api/reports/exchanged');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setReports(json.data);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch exchanged reports:', err);
    } finally {
      setIsLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Handle Transmitting New Medical Report
  const handleCreateReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReportTitle.trim() || !newReportSummary.trim()) {
      triggerToast('Report Title and Clinical Summary are required', 'error');
      return;
    }

    const targetAstronaut = crew.find((c) => c.id === newReportAstronautId) || crew[0];
    const targetDoc = CONSULTING_DOCTORS.find((d) => d.id === newReportDoctorId) || CONSULTING_DOCTORS[0];

    const findingsList = newReportFindings
      .split('\n')
      .map((f) => f.replace(/^[-*•]\s*/, '').trim())
      .filter(Boolean);

    const vitalsSnap = targetAstronaut.id === profile.id && vitals ? {
      hr: vitals.heartRate,
      bp: `${vitals.bloodPressureSys}/${vitals.bloodPressureDia}`,
      spo2: vitals.spO2,
      temp: vitals.temperature,
      spineDelta: `+${profile.spineElongation} cm`,
    } : {
      hr: targetAstronaut.heartRate,
      bp: targetAstronaut.bloodPressure,
      spo2: targetAstronaut.spO2,
      temp: targetAstronaut.temperature,
      spineDelta: `+${targetAstronaut.spineElongation} cm`,
    };

    const attachmentName = newReportAttachmentType === 'ultrasound_dicom'
      ? `${targetAstronaut.callsign.toLowerCase()}_sagittal_ultrasound.dicom`
      : newReportAttachmentType === 'telemetry_csv'
      ? `${targetAstronaut.callsign.toLowerCase()}_biometrics_7day.csv`
      : `${targetAstronaut.callsign.toLowerCase()}_clinical_dossier.pdf`;

    const reportPayload = {
      title: newReportTitle.trim(),
      documentType: newReportType,
      astronautId: targetAstronaut.id,
      astronautName: targetAstronaut.name,
      astronautCallsign: targetAstronaut.callsign,
      authorId: 'user-fs-vance',
      authorName: 'Dr. Marcus Vance, M.D., FACEP',
      authorRole: 'Lead Flight Surgeon (MCC Houston / JSC)',
      recipientDoctorId: targetDoc.id,
      recipientDoctorName: targetDoc.name,
      recipientDoctorRole: targetDoc.role,
      urgency: newReportUrgency,
      clinicalSummary: newReportSummary.trim(),
      findings: findingsList.length > 0 ? findingsList : ['Clinical vitals review nominal with adaptation surveillance.'],
      referralQuestion: newReportQuestion.trim() || 'Requesting sub-specialist evaluation and countermeasure concurrence.',
      vitalsSnapshot: vitalsSnap,
      attachments: [
        { name: attachmentName, sizeKb: 3420, type: newReportAttachmentType as any },
      ],
    };

    try {
      const res = await fetch('/api/reports/exchanged', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportPayload),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setReports((prev) => [json.data, ...prev]);
        triggerToast(`Document ${json.data.reportNumber} transmitted to ${targetDoc.name}`, 'success');
        setIsCreateModalOpen(false);
        // Reset form
        setNewReportTitle('');
        setNewReportSummary('');
        setNewReportFindings('');
        setNewReportQuestion('');
      } else {
        triggerToast(json.error || 'Failed to transmit report', 'error');
      }
    } catch (err) {
      console.error(err);
      triggerToast('Error transmitting report via TDRS relay', 'error');
    }
  };

  // Handle Submitting Clinical Review & Feedback
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    if (!reviewNotes.trim()) {
      triggerToast('Please provide clinical feedback notes', 'error');
      return;
    }

    const recsList = reviewRecommendations
      .split('\n')
      .map((r) => r.replace(/^[-*•]\s*/, '').trim())
      .filter(Boolean);

    try {
      const res = await fetch(`/api/reports/exchanged/${selectedReport.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewerId: 'user-fs-vance',
          reviewerName: 'Dr. Marcus Vance, M.D., FACEP',
          reviewerRole: 'Lead Flight Surgeon (MCC Houston / JSC)',
          action: reviewAction,
          feedbackNotes: reviewNotes.trim(),
          recommendedModifications: recsList,
          signatureCredential: 'NASA-FS-9842-BOARD-AEROSPACE',
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setReports((prev) => prev.map((r) => (r.id === selectedReport.id ? json.data : r)));
        setSelectedReport(json.data);
        setIsReviewOpen(false);
        setReviewNotes('');
        setReviewRecommendations('');
        triggerToast('Clinical review signed and transmitted back to referring physician', 'success');
      } else {
        triggerToast(json.error || 'Failed to submit review', 'error');
      }
    } catch (err) {
      console.error(err);
      triggerToast('Error saving review to document', 'error');
    }
  };

  // Handle Forwarding Report to Another Doctor
  const handleForwardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    if (!forwardReason.trim()) {
      triggerToast('Please state a reason for forwarding the report', 'error');
      return;
    }

    const targetDoc = CONSULTING_DOCTORS.find((d) => d.id === forwardToDoctorId) || CONSULTING_DOCTORS[0];

    try {
      const res = await fetch(`/api/reports/exchanged/${selectedReport.id}/forward`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toDoctorId: targetDoc.id,
          toDoctorName: targetDoc.name,
          toDoctorRole: targetDoc.role,
          fromDoctorName: 'Dr. Marcus Vance, M.D. (Lead Flight Surgeon)',
          reason: forwardReason.trim(),
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setReports((prev) => prev.map((r) => (r.id === selectedReport.id ? json.data : r)));
        setSelectedReport(json.data);
        setIsForwardOpen(false);
        setForwardReason('');
        triggerToast(`Document forwarded to ${targetDoc.name}`, 'success');
      } else {
        triggerToast(json.error || 'Failed to forward report', 'error');
      }
    } catch (err) {
      console.error(err);
      triggerToast('Error forwarding document', 'error');
    }
  };

  // Print PDF for Current Document or Surveillance Sheet
  const handlePrintDocument = (report?: ExchangedMedicalReport) => {
    setIsExporting(true);
    triggerToast(
      report ? `Preparing PDF for ${report.reportNumber}...` : 'Preparing NASA Flight Medicine PDF...',
      'info'
    );
    setTimeout(() => {
      window.print();
      setIsExporting(false);
    }, 600);
  };

  // Download JSON snapshot of document
  const handleDownloadReportJson = (report: ExchangedMedicalReport) => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.reportNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast(`Downloaded ${report.reportNumber}.json snapshot`, 'success');
  };

  // Filtering Logic
  const filteredReports = reports.filter((r) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        r.reportNumber.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.astronautName.toLowerCase().includes(q) ||
        r.authorName.toLowerCase().includes(q) ||
        r.recipientDoctorName.toLowerCase().includes(q) ||
        r.clinicalSummary.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Active Tab Filter: inbox vs outbox vs pending vs reviewed
    if (activeFilter === 'inbox') {
      // Received by current user
      if (r.recipientDoctorId !== 'user-fs-vance') return false;
    } else if (activeFilter === 'outbox') {
      // Sent by current user
      if (r.authorId !== 'user-fs-vance') return false;
    } else if (activeFilter === 'pending') {
      if (r.status === 'reviewed') return false;
    } else if (activeFilter === 'reviewed') {
      if (r.status !== 'reviewed') return false;
    }

    // Astronaut filter
    if (astronautFilter !== 'all' && r.astronautId !== astronautFilter) {
      return false;
    }

    // Urgency filter
    if (urgencyFilter !== 'all' && r.urgency !== urgencyFilter) {
      return false;
    }

    return true;
  });

  // Calculate statistics for exchange hub
  const inboxCount = reports.filter((r) => r.recipientDoctorId === 'user-fs-vance').length;
  const outboxCount = reports.filter((r) => r.authorId === 'user-fs-vance').length;
  const pendingCount = reports.filter((r) => r.status !== 'reviewed').length;
  const reviewedCount = reports.filter((r) => r.status === 'reviewed').length;

  // Surveillance Sheet Selected Astronaut
  const selectedAstronaut = crew.find((c) => c.id === selectedAstronautId) || crew[0];
  const isPrimary = selectedAstronaut.id === profile.id;
  const activeRestrictions = restrictions.filter(
    (r) => r.astronautId === selectedAstronaut.id && r.status === 'Active'
  );
  const relevantNotes = notes.filter((n) => n.astronautId === selectedAstronaut.id);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-2xl border text-xs font-mono font-bold flex items-center gap-2.5 transition-all animate-in slide-in-from-bottom duration-300 print:hidden ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
              : toastMessage.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/60 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
              : 'bg-[#00E5FF]/20 border-[#00E5FF]/50 text-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.3)]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Banner (Hidden in print) */}
      <div className="glass-panel rounded-2xl p-5 border border-[#00E5FF]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#00E5FF] font-bold uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 text-[#00E5FF] animate-pulse" />
            <span>NASA FLIGHT SURGEON DOCUMENT EXCHANGE & REFERRAL SYSTEM</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white font-['Chakra_Petch',sans-serif]">
            Medical Reports & Inter-Doctor Document Exchange
          </h1>
          <p className="text-xs text-slate-300 font-sans mt-0.5">
            Ingest, transmit, review, and refer aerospace clinical dossiers between orbital medical officers, flight surgeons, and ground specialists.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Main View Mode Selector Pills */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setActiveTabMode('exchange')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTabMode === 'exchange'
                  ? 'bg-[#00E5FF] text-black shadow-[0_0_12px_#00E5FF]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>DOCUMENT EXCHANGE</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTabMode('surveillance')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTabMode === 'surveillance'
                  ? 'bg-[#00E5FF] text-black shadow-[0_0_12px_#00E5FF]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>TELEMETRY DOSSIER</span>
            </button>
          </div>

          {activeTabMode === 'exchange' && (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00E5FF] to-cyan-400 text-black font-mono font-black text-xs hover:opacity-90 transition-all flex items-center gap-1.5 shadow-[0_0_15px_#00E5FF] cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>TRANSMIT NEW REPORT</span>
            </button>
          )}

          {activeTabMode === 'surveillance' && (
            <button
              type="button"
              onClick={() => handlePrintDocument()}
              disabled={isExporting}
              className="px-4 py-2 rounded-xl bg-[#00E5FF] text-black font-mono font-black text-xs hover:bg-[#00E5FF]/90 transition-all flex items-center gap-1.5 shadow-[0_0_15px_#00E5FF] cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isExporting ? 'GENERATING PDF...' : 'PRINT / EXPORT DOSSIER'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* MODE 1: DOCUMENT EXCHANGE & CLINICAL REFERRALS HUB */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {activeTabMode === 'exchange' && (
        <div className="space-y-6">
          {/* 4 Severity / Queue Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Exchanged */}
            <div
              onClick={() => setActiveFilter('all')}
              className={`glass-panel rounded-2xl p-4 border transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">All Exchanged Documents</span>
                <FileText className="w-4 h-4 text-[#00E5FF]" />
              </div>
              <div className="mt-2 text-2xl font-black text-white font-['Chakra_Petch',sans-serif]">
                {reports.length}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">Full Flight Registry</div>
            </div>

            {/* Inbox / Received */}
            <div
              onClick={() => setActiveFilter('inbox')}
              className={`glass-panel rounded-2xl p-4 border transition-all cursor-pointer ${
                activeFilter === 'inbox'
                  ? 'border-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.2)]'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">Received (Inbox)</span>
                <Inbox className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="mt-2 text-2xl font-black text-indigo-400 font-['Chakra_Petch',sans-serif]">
                {inboxCount}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">Sent to You by Specialists</div>
            </div>

            {/* Outbox / Sent */}
            <div
              onClick={() => setActiveFilter('outbox')}
              className={`glass-panel rounded-2xl p-4 border transition-all cursor-pointer ${
                activeFilter === 'outbox'
                  ? 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">Dispatched (Outbox)</span>
                <Send className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="mt-2 text-2xl font-black text-cyan-400 font-['Chakra_Petch',sans-serif]">
                {outboxCount}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">Transmitted to Consultants</div>
            </div>

            {/* Pending Reviews */}
            <div
              onClick={() => setActiveFilter('pending')}
              className={`glass-panel rounded-2xl p-4 border transition-all cursor-pointer ${
                activeFilter === 'pending'
                  ? 'border-[#FF8C00] shadow-[0_0_15px_rgba(255,140,0,0.2)]'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">Pending Reviews</span>
                <Clock className="w-4 h-4 text-[#FF8C00]" />
              </div>
              <div className="mt-2 text-2xl font-black text-[#FF8C00] font-['Chakra_Petch',sans-serif]">
                {pendingCount}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">{reviewedCount} Completed & Endorsed</div>
            </div>
          </div>

          {/* Filtering & Search Bar */}
          <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search reports by title, document number, astronaut, or consulting doctor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#00E5FF] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Astronaut Filter */}
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="text-slate-400">Crew:</span>
                <select
                  value={astronautFilter}
                  onChange={(e) => setAstronautFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 px-2.5 py-1.5 rounded-xl text-white text-xs font-bold cursor-pointer"
                >
                  <option value="all">All Astronauts</option>
                  {crew.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.callsign})
                    </option>
                  ))}
                </select>
              </div>

              {/* Urgency Filter */}
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="text-slate-400">Urgency:</span>
                <select
                  value={urgencyFilter}
                  onChange={(e) => setUrgencyFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 px-2.5 py-1.5 rounded-xl text-white text-xs font-bold cursor-pointer"
                >
                  <option value="all">All Urgencies</option>
                  <option value="critical_stat">Critical STAT</option>
                  <option value="urgent">Urgent</option>
                  <option value="routine">Routine</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Filter Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
            {[
              { id: 'all', label: 'All Documents', count: reports.length },
              { id: 'inbox', label: '📥 Received (Inbox)', count: inboxCount },
              { id: 'outbox', label: '📤 Transmitted (Outbox)', count: outboxCount },
              { id: 'pending', label: '⏳ Awaiting Review', count: pendingCount },
              { id: 'reviewed', label: '✅ Endorsed / Completed', count: reviewedCount },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-[#00E5FF] text-black shadow-[0_0_10px_#00E5FF]'
                    : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    activeFilter === tab.id ? 'bg-black/30 text-black' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Reports Grid */}
          {isLoadingReports ? (
            <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 font-mono text-xs">
              <Radio className="w-6 h-6 text-[#00E5FF] animate-spin mx-auto mb-3" />
              Decrypting and syncing medical document repository via TDRS-East...
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 border border-slate-800">
              <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <div className="text-white font-bold font-['Chakra_Petch',sans-serif] text-base">
                No Medical Reports Found
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                No exchanged medical dossiers match your current filter criteria. You can transmit a new referral report to another flight doctor at any time.
              </p>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-[#00E5FF] text-black font-mono font-bold text-xs hover:bg-[#00E5FF]/90 transition-all inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Transmit New Report</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReports.map((report) => {
                const isRecipient = report.recipientDoctorId === 'user-fs-vance';
                const isAuthor = report.authorId === 'user-fs-vance';
                const hasReviews = report.reviews && report.reviews.length > 0;
                const isForwarded = report.status === 'forwarded';

                return (
                  <div
                    key={report.id}
                    className={`glass-panel rounded-2xl p-5 border transition-all flex flex-col justify-between group ${
                      report.urgency === 'critical_stat'
                        ? 'border-rose-500/60 hover:border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
                        : report.urgency === 'urgent'
                        ? 'border-[#FF8C00]/50 hover:border-[#FF8C00] shadow-[0_0_15px_rgba(255,140,0,0.1)]'
                        : 'border-slate-800 hover:border-[#00E5FF]/60 hover:shadow-[0_0_20px_rgba(0,229,255,0.15)]'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-[#00E5FF] font-mono text-[10px] font-extrabold tracking-wider">
                            {report.reportNumber}
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase ${
                              report.urgency === 'critical_stat'
                                ? 'bg-rose-500/20 border border-rose-500/50 text-rose-300'
                                : report.urgency === 'urgent'
                                ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {report.urgency.replace('_', ' ')}
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold ${
                              report.status === 'reviewed'
                                ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                                : report.status === 'forwarded'
                                ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300'
                                : report.status === 'under_review'
                                ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300'
                                : 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300'
                            }`}
                          >
                            {report.status === 'reviewed'
                              ? '✓ ENDORSED & REVIEWED'
                              : report.status === 'forwarded'
                              ? '↳ FORWARDED'
                              : report.status === 'under_review'
                              ? '⏳ UNDER REVIEW'
                              : 'TRANSMITTED'}
                          </span>
                        </div>

                        {/* Relative Timestamp */}
                        <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                          {new Date(report.transmissionTimestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-white font-['Chakra_Petch',sans-serif] group-hover:text-[#00E5FF] transition-colors leading-snug">
                        {report.title}
                      </h3>

                      {/* Astronaut Subject & Document Type */}
                      <div className="flex items-center gap-2 mt-2 text-xs font-mono text-slate-400">
                        <span className="text-slate-200 font-bold">{report.astronautName}</span>
                        <span>({report.astronautCallsign})</span>
                        <span>·</span>
                        <span className="text-[#00E5FF]">{report.documentType}</span>
                      </div>

                      {/* Doctor Sender & Recipient Route */}
                      <div className="mt-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-[11px]">SENDER:</span>
                          <span className={`font-bold ${isAuthor ? 'text-[#00E5FF]' : 'text-slate-200'}`}>
                            {report.authorName} {isAuthor && '(You)'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-800/60 pt-1.5">
                          <span className="text-slate-400 text-[11px]">RECIPIENT:</span>
                          <span className={`font-bold ${isRecipient ? 'text-indigo-400' : 'text-slate-200'}`}>
                            {report.recipientDoctorName} {isRecipient && '(You)'}
                          </span>
                        </div>
                      </div>

                      {/* Clinical Summary Snippet */}
                      <p className="mt-3 text-xs text-slate-300 line-clamp-2 font-sans leading-relaxed">
                        {report.clinicalSummary}
                      </p>

                      {/* Referral Query Highlight */}
                      {report.referralQuestion && (
                        <div className="mt-2.5 p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/30 text-[11px] font-mono text-indigo-300">
                          <span className="font-bold text-indigo-200">Query: </span>
                          <span>{report.referralQuestion}</span>
                        </div>
                      )}

                      {/* Meta badges: Attachments & Reviews */}
                      <div className="flex items-center gap-3 mt-3 text-[11px] font-mono text-slate-400">
                        {report.attachments && report.attachments.length > 0 && (
                          <span className="flex items-center gap-1 text-slate-300">
                            <Paperclip className="w-3.5 h-3.5 text-[#00E5FF]" />
                            <span>{report.attachments.length} diagnostic file(s)</span>
                          </span>
                        )}
                        {hasReviews && (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{report.reviews.length} specialist endorsement</span>
                          </span>
                        )}
                        {isForwarded && (
                          <span className="flex items-center gap-1 text-purple-400">
                            <Forward className="w-3.5 h-3.5" />
                            <span>Referred</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReport(report);
                          setIsReviewOpen(false);
                          setIsForwardOpen(false);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-[#00E5FF] text-[#00E5FF] font-mono font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>OPEN DOSSIER</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {/* If this is sent to you and not reviewed, give quick Review button */}
                        {isRecipient && report.status !== 'reviewed' && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedReport(report);
                              setIsReviewOpen(true);
                              setIsForwardOpen(false);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/60 hover:bg-emerald-500 text-emerald-300 hover:text-black font-mono font-bold text-xs transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                          >
                            <Stethoscope className="w-3.5 h-3.5" />
                            <span>REVIEW & REPLY</span>
                          </button>
                        )}

                        {/* Forward button */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedReport(report);
                            setIsForwardOpen(true);
                            setIsReviewOpen(false);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-purple-400 text-slate-300 hover:text-purple-300 font-mono text-xs transition-all flex items-center gap-1 cursor-pointer"
                          title="Forward / Refer to another specialist"
                        >
                          <Forward className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">REFER</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownloadReportJson(report)}
                          className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                          title="Download Document JSON"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* MODE 2: AUTOMATED TELEMETRY SURVEILLANCE DOSSIER SHEET (Printable) */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {activeTabMode === 'surveillance' && (
        <div className="space-y-6">
          {/* Report Controls (Hidden in print) */}
          <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 print:hidden">
            {/* Astronaut Selector */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <User className="w-4 h-4 text-[#00E5FF]" />
              <span className="text-slate-400">SELECT ASTRONAUT:</span>
              <select
                value={selectedAstronautId}
                onChange={(e) => setSelectedAstronautId(e.target.value)}
                className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl text-white font-bold cursor-pointer"
              >
                {crew.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Selector */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <Calendar className="w-4 h-4 text-[#00E5FF]" />
              <span className="text-slate-400">PERIOD:</span>
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                {[
                  { id: '24h', label: '24 Hours' },
                  { id: '7d', label: '7 Days' },
                  { id: '30d', label: '30 Days' },
                  { id: 'mission', label: 'Mission (84 Days)' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setDateRange(p.id as any)}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      dateRange === p.id
                        ? 'bg-[#00E5FF] text-black shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Rendered Official NASA Flight Medicine Report Sheet */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-[#00E5FF]/30 space-y-6 print:border-none print:bg-white print:text-black print:p-0 print:shadow-none">
            {/* Report Top Header */}
            <div className="pb-5 border-b border-slate-800 print:border-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-mono tracking-widest text-[#00E5FF] print:text-black font-extrabold uppercase">
                  NASA JOHNSON SPACE CENTER · FLIGHT MEDICINE CLINIC
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white print:text-black font-['Chakra_Petch',sans-serif] mt-0.5">
                  Astronaut Bio-Telemetry & Adaptation Surveillance Report
                </h2>
                <div className="text-xs font-mono text-slate-400 print:text-gray-600 mt-1">
                  DOCUMENT ID: NASA-MED-EXP74-{selectedAstronaut.id}-{new Date().getFullYear()} · CLASSIFICATION: MEDICAL CONFIDENTIAL
                </div>
              </div>

              <div className="text-right font-mono text-xs">
                <div className="font-bold text-white print:text-black">
                  MET Day {profile.missionElapsedDays} (Orbit Pass)
                </div>
                <div className="text-slate-400 print:text-gray-600 text-[11px]">
                  Reporting Period: {dateRange === '24h' ? '24 Hours' : dateRange === '7d' ? '7 Days' : 'Mission-to-Date'}
                </div>
                <div className="text-emerald-400 print:text-green-700 font-bold text-[11px] mt-0.5">
                  TELEMETRY VALIDATED (TDRS RELAY)
                </div>
              </div>
            </div>

            {/* Astronaut Dossier & Flight Profile */}
            <div className="space-y-2">
              <div className="text-xs font-mono font-bold text-[#00E5FF] uppercase tracking-wider">
                1.0 Crew Member Identification & Baseline Telemetry
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/70 print:bg-gray-100 p-4 rounded-xl border border-slate-800 print:border-gray-300 text-xs font-mono">
                <div>
                  <div className="text-slate-400 print:text-gray-600 text-[11px]">NAME / CALLSIGN:</div>
                  <div className="font-bold text-white print:text-black text-sm">
                    {selectedAstronaut.name} ({selectedAstronaut.callsign})
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 print:text-gray-600 text-[11px]">CREW ID / ROLE:</div>
                  <div className="font-bold text-white print:text-black text-sm">
                    {selectedAstronaut.id}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 print:text-gray-600 text-[11px]">BLOOD TYPE / AGE:</div>
                  <div className="font-bold text-white print:text-black text-sm">
                    {selectedAstronaut.bloodType} · {isPrimary ? profile.age : 34} yrs
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 print:text-gray-600 text-[11px]">HEALTH STATUS:</div>
                  <div
                    className={`font-black uppercase text-sm ${
                      selectedAstronaut.healthStatus === 'nominal'
                        ? 'text-emerald-400 print:text-green-700'
                        : selectedAstronaut.healthStatus === 'monitoring'
                        ? 'text-[#FF8C00] print:text-amber-700'
                        : 'text-rose-400 print:text-rose-700'
                    }`}
                  >
                    {selectedAstronaut.healthStatus}
                  </div>
                </div>
              </div>
            </div>

            {/* Current Vitals Snapshot */}
            <div className="space-y-2">
              <div className="text-xs font-mono font-bold text-[#00E5FF] uppercase tracking-wider">
                2.0 Clinical Biometrics Summary
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/60 print:bg-gray-100 border border-slate-800 print:border-gray-300">
                  <div className="text-[11px] font-mono text-slate-400 print:text-gray-600">HEART RATE</div>
                  <div className="text-lg font-black text-white print:text-black font-['Chakra_Petch',sans-serif]">
                    {isPrimary ? vitals?.heartRate || 72 : selectedAstronaut.heartRate} <span className="text-xs font-mono text-slate-400">bpm</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">Baseline: {isPrimary ? profile.restingHeartRate : 58} bpm</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 print:bg-gray-100 border border-slate-800 print:border-gray-300">
                  <div className="text-[11px] font-mono text-slate-400 print:text-gray-600">BLOOD PRESSURE</div>
                  <div className="text-lg font-black text-white print:text-black font-['Chakra_Petch',sans-serif]">
                    {isPrimary && vitals ? `${vitals.bloodPressureSys}/${vitals.bloodPressureDia}` : selectedAstronaut.bloodPressure} <span className="text-xs font-mono text-slate-400">mmHg</span>
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400 print:text-green-700">Normotensive</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 print:bg-gray-100 border border-slate-800 print:border-gray-300">
                  <div className="text-[11px] font-mono text-slate-400 print:text-gray-600">BLOOD OXYGEN (SPO2)</div>
                  <div className="text-lg font-black text-white print:text-black font-['Chakra_Petch',sans-serif]">
                    {selectedAstronaut.spO2}%
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">Target &gt; 95%</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 print:bg-gray-100 border border-slate-800 print:border-gray-300">
                  <div className="text-[11px] font-mono text-slate-400 print:text-gray-600">BODY TEMP</div>
                  <div className="text-lg font-black text-white print:text-black font-['Chakra_Petch',sans-serif]">
                    {selectedAstronaut.temperature}°C
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400 print:text-green-700">Afebrile</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 print:bg-gray-100 border border-slate-800 print:border-gray-300">
                  <div className="text-[11px] font-mono text-slate-400 print:text-gray-600">SPINE DELTA</div>
                  <div className="text-lg font-black text-[#FF8C00] print:text-amber-700 font-['Chakra_Petch',sans-serif]">
                    +{isPrimary ? profile.spineElongation : selectedAstronaut.spineElongation} cm
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">Microgravity Decompression</div>
                </div>
              </div>
            </div>

            {/* Historical Trend Chart */}
            {vitals?.historicalHeartRate && (
              <div className="space-y-2">
                <div className="text-xs font-mono font-bold text-[#00E5FF] uppercase tracking-wider">
                  3.0 7-Day Heart Rate & Circadian Telemetry
                </div>
                <div className="h-44 w-full bg-slate-900/50 print:bg-gray-50 rounded-xl p-3 border border-slate-800 print:border-gray-300">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={vitals.historicalHeartRate}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} domain={[50, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                      <Line type="monotone" dataKey="hr" stroke="#00E5FF" strokeWidth={2.5} name="Heart Rate (bpm)" />
                      <Line type="monotone" dataKey="baseline" stroke="#64748b" strokeDasharray="5 5" name="Flight Baseline" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Active Medical Restrictions & Prescriptions */}
            <div className="space-y-2">
              <div className="text-xs font-mono font-bold text-[#00E5FF] uppercase tracking-wider">
                4.0 Active Countermeasure Safety Directives
              </div>
              {activeRestrictions.length === 0 ? (
                <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-xs font-mono text-emerald-400">
                  Zero active medical restrictions. Full flight clearance active.
                </div>
              ) : (
                <div className="space-y-2">
                  {activeRestrictions.map((res) => (
                    <div
                      key={res.id}
                      className="p-3 rounded-xl bg-slate-900/80 print:bg-gray-100 border border-slate-800 print:border-gray-300 text-xs font-mono flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                    >
                      <div>
                        <div className="font-bold text-white print:text-black flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-rose-400" />
                          <span>{res.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-extrabold uppercase">
                            {res.severity}
                          </span>
                        </div>
                        <div className="text-slate-400 print:text-gray-600 text-[11px] mt-0.5">
                          Affected Region: {res.affectedRegion} · Locked: {res.restrictedExercises.join(', ')}
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-slate-400">
                        Prescribed By: {res.prescribedBy}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Official Flight Surgeon Sign-Off */}
            <div className="pt-6 border-t border-slate-800 print:border-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs">
              <div>
                <div className="text-slate-400 print:text-gray-600 text-[11px]">FLIGHT SURGEON ENDORSEMENT:</div>
                <div className="font-bold text-white print:text-black">
                  {profile.assignedSurgeon.name}
                </div>
                <div className="text-[11px] text-[#00E5FF] print:text-black font-semibold">
                  {profile.assignedSurgeon.credentialId} · {profile.assignedSurgeon.certificationStatus}
                </div>
              </div>

              <div className="text-right">
                <div className="text-emerald-400 print:text-green-700 font-black">
                  DIGITALLY SIGNED & VERIFIED
                </div>
                <div className="text-slate-400 print:text-gray-600 text-[10px]">
                  TDRS Encrypted SHA-256 Signature Token: #MED-EXP74-SIG-OK
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* MODAL 1: TRANSMIT / UPLOAD NEW MEDICAL REPORT TO SPECIALIST */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-7 border border-[#00E5FF]/60 shadow-[0_0_50px_rgba(0,229,255,0.25)] space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#00E5FF] font-bold uppercase tracking-wider mb-1">
                  <Send className="w-4 h-4 text-[#00E5FF]" />
                  <span>TRANSMIT CLINICAL REFERRAL / REPORT</span>
                </div>
                <h2 className="text-xl font-black text-white font-['Chakra_Petch',sans-serif]">
                  Upload & Dispatch Medical Dossier to Consulting Doctor
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReportSubmit} className="space-y-4">
              {/* Row 1: Target Astronaut & Recipient Doctor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 font-bold mb-1.5">
                    SUBJECT ASTRONAUT:
                  </label>
                  <select
                    value={newReportAstronautId}
                    onChange={(e) => setNewReportAstronautId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white font-bold focus:outline-none focus:border-[#00E5FF]"
                  >
                    {crew.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.id} · {c.callsign})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 font-bold mb-1.5">
                    CONSULTING DOCTOR / RECIPIENT:
                  </label>
                  <select
                    value={newReportDoctorId}
                    onChange={(e) => setNewReportDoctorId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white font-bold focus:outline-none focus:border-[#00E5FF]"
                  >
                    {CONSULTING_DOCTORS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} — {d.role.split('(')[0]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Document Type & Urgency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 font-bold mb-1.5">
                    DOCUMENT / REPORT TYPE:
                  </label>
                  <select
                    value={newReportType}
                    onChange={(e) => setNewReportType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white font-bold focus:outline-none focus:border-[#00E5FF]"
                  >
                    <option value="Clinical Specialist Referral">Clinical Specialist Referral</option>
                    <option value="Spine Ultrasonic Analysis">Spine Ultrasonic Analysis</option>
                    <option value="Cardiovascular Stress Panel">Cardiovascular Stress Panel</option>
                    <option value="Pre-EVA Mission Clearance">Pre-EVA Mission Clearance</option>
                    <option value="Microgravity Adaptation Audit">Microgravity Adaptation Audit</option>
                    <option value="Blood Biomarker Lab">Blood Biomarker Lab</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 font-bold mb-1.5">
                    CLINICAL URGENCY:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'routine', label: 'Routine', color: 'border-slate-700 text-slate-300' },
                      { id: 'urgent', label: 'Urgent', color: 'border-amber-500/70 text-amber-300' },
                      { id: 'critical_stat', label: 'Critical STAT', color: 'border-rose-500/70 text-rose-300' },
                    ].map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => setNewReportUrgency(u.id as any)}
                        className={`py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                          newReportUrgency === u.id
                            ? 'bg-[#00E5FF] text-black border-[#00E5FF] shadow-sm'
                            : `bg-slate-900 ${u.color} hover:border-slate-500`
                        }`}
                      >
                        {u.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Report Title */}
              <div>
                <label className="block text-xs font-mono text-slate-400 font-bold mb-1.5">
                  REPORT TITLE:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lumbar Sagittal Ultrasound Evaluation & Axial Loading Concurrence"
                  value={newReportTitle}
                  onChange={(e) => setNewReportTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#00E5FF]"
                  required
                />
              </div>

              {/* Clinical Summary */}
              <div>
                <label className="block text-xs font-mono text-slate-400 font-bold mb-1.5">
                  CLINICAL SUMMARY & OBSERVATIONS:
                </label>
                <textarea
                  rows={3}
                  placeholder="Summarize the patient presentation, observed symptoms, physiological adaptation context, and vital signs..."
                  value={newReportSummary}
                  onChange={(e) => setNewReportSummary(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#00E5FF]"
                  required
                />
              </div>

              {/* Findings */}
              <div>
                <label className="block text-xs font-mono text-slate-400 font-bold mb-1.5">
                  KEY CLINICAL FINDINGS (One per line):
                </label>
                <textarea
                  rows={2}
                  placeholder="- Ultrasound shows +4.2 cm disc decompression at L3-L5&#10;- Dull ache rated 4/10 after 90m resistance workout&#10;- Zero lower-extremity radiculopathy or motor deficits"
                  value={newReportFindings}
                  onChange={(e) => setNewReportFindings(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              {/* Referral Query */}
              <div>
                <label className="block text-xs font-mono text-indigo-400 font-bold mb-1.5">
                  CONSULTANT DIRECTIVE / SPECIFIC REFERRAL QUERY:
                </label>
                <input
                  type="text"
                  placeholder="What specific evaluation or countermeasure concurrence are you requesting from the specialist?"
                  value={newReportQuestion}
                  onChange={(e) => setNewReportQuestion(e.target.value)}
                  className="w-full bg-slate-900 border border-indigo-500/50 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                />
              </div>

              {/* Attachment Picker */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-bold flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-[#00E5FF]" />
                    ATTACH DIAGNOSTIC TELEMETRY FILE:
                  </span>
                  <span className="text-slate-400 text-[10px]">TDRS Relay Uplink</span>
                </div>
                <select
                  value={newReportAttachmentType}
                  onChange={(e) => setNewReportAttachmentType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-white font-bold"
                >
                  <option value="ultrasound_dicom">Ultrasound DICOM Sagittal Volumetric Scan (.dicom)</option>
                  <option value="telemetry_csv">Biometric Continuous Downlink 7-Day CSV (.csv)</option>
                  <option value="pdf">Complete Flight Surgeon Telemetry Snapshot (.pdf)</option>
                </select>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white font-mono text-xs cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#00E5FF] text-black font-mono font-black text-xs hover:bg-[#00E5FF]/90 transition-all shadow-[0_0_15px_#00E5FF] flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>TRANSMIT VIA TDRS RELAY</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* MODAL 2: OPEN DOCUMENT VIEWER, CLINICAL REVIEW & FORWARDING */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border border-[#00E5FF]/50 shadow-[0_0_60px_rgba(0,229,255,0.25)] space-y-6">
            {/* Modal Top Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#00E5FF] font-bold uppercase tracking-wider mb-1">
                  <FileText className="w-4 h-4 text-[#00E5FF]" />
                  <span>NASA FLIGHT MEDICINE CLINICAL DOSSIER</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-300">{selectedReport.reportNumber}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white font-['Chakra_Petch',sans-serif]">
                  {selectedReport.title}
                </h2>
                <div className="text-xs font-mono text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                  <span>Subject: <strong className="text-white">{selectedReport.astronautName}</strong> ({selectedReport.astronautCallsign})</span>
                  <span>·</span>
                  <span>Type: <span className="text-[#00E5FF]">{selectedReport.documentType}</span></span>
                  <span>·</span>
                  <span className="text-emerald-400 font-bold">TDRS ENCRYPTED RELAY</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintDocument(selectedReport)}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                  title="Print Document"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Transmission Route Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono">
              <div>
                <div className="text-[11px] text-slate-400 uppercase">Referring Author / Surgeon:</div>
                <div className="font-bold text-white text-sm">{selectedReport.authorName}</div>
                <div className="text-[11px] text-slate-400">{selectedReport.authorRole}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400 uppercase">Designated Recipient / Consultant:</div>
                <div className="font-bold text-[#00E5FF] text-sm">{selectedReport.recipientDoctorName}</div>
                <div className="text-[11px] text-slate-400">{selectedReport.recipientDoctorRole}</div>
              </div>
            </div>

            {/* Biometric Snapshot if attached */}
            {selectedReport.vitalsSnapshot && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                  Attached Telemetry Snapshot:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono">
                    <span className="text-slate-400 text-[10px] block">HEART RATE</span>
                    <span className="text-base font-bold text-white">{selectedReport.vitalsSnapshot.hr} bpm</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono">
                    <span className="text-slate-400 text-[10px] block">BLOOD PRESSURE</span>
                    <span className="text-base font-bold text-white">{selectedReport.vitalsSnapshot.bp}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono">
                    <span className="text-slate-400 text-[10px] block">SPO2</span>
                    <span className="text-base font-bold text-white">{selectedReport.vitalsSnapshot.spo2}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono">
                    <span className="text-slate-400 text-[10px] block">CORE TEMP</span>
                    <span className="text-base font-bold text-white">{selectedReport.vitalsSnapshot.temp}°C</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono">
                    <span className="text-slate-400 text-[10px] block">SPINE DELTA</span>
                    <span className="text-base font-bold text-[#FF8C00]">{selectedReport.vitalsSnapshot.spineDelta || '+4.2 cm'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Clinical Summary */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                Clinical Summary:
              </div>
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs font-sans leading-relaxed text-slate-200">
                {selectedReport.clinicalSummary}
              </div>
            </div>

            {/* Clinical Findings */}
            {selectedReport.findings && selectedReport.findings.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                  Diagnostic Findings & Adaptation Parameters:
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 text-xs font-mono space-y-1.5 text-slate-300">
                  {selectedReport.findings.map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[#00E5FF] font-bold">▪</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Referral Query */}
            {selectedReport.referralQuestion && (
              <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/40 text-xs font-mono text-indigo-300 space-y-1">
                <span className="font-bold text-indigo-200 uppercase tracking-wider block text-[11px]">
                  Specialist Consultation Query:
                </span>
                <p className="text-xs">{selectedReport.referralQuestion}</p>
              </div>
            )}

            {/* Attached Files */}
            {selectedReport.attachments && selectedReport.attachments.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                  Diagnostic Attachments ({selectedReport.attachments.length}):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedReport.attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Paperclip className="w-4 h-4 text-[#00E5FF] shrink-0" />
                        <span className="truncate text-white font-bold">{att.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                        {(att.sizeKb / 1024).toFixed(1)} MB
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Forwarding History if present */}
            {selectedReport.forwardHistory && selectedReport.forwardHistory.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Forward className="w-3.5 h-3.5" />
                  <span>Referral Chain of Custody:</span>
                </div>
                <div className="space-y-2">
                  {selectedReport.forwardHistory.map((entry, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs font-mono space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px] text-purple-300 font-bold">
                        <span>From: {entry.fromDoctor} → To: {entry.toDoctor}</span>
                        <span className="text-slate-400">{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="text-slate-300 text-[11px]">Reason: {entry.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Existing Specialist Reviews & Endorsements */}
            {selectedReport.reviews && selectedReport.reviews.length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Completed Clinical Reviews & Specialist Feedback ({selectedReport.reviews.length}):</span>
                </div>
                <div className="space-y-3">
                  {selectedReport.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-xs font-mono space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-white text-sm">{rev.reviewerName}</span>
                          <span className="text-slate-400 text-[11px] block">{rev.reviewerRole}</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-bold uppercase text-[10px]">
                          ✓ {rev.action.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-200 text-xs font-sans leading-relaxed">
                        {rev.feedbackNotes}
                      </div>

                      {rev.recommendedModifications && rev.recommendedModifications.length > 0 && (
                        <div className="pt-2 text-[11px] space-y-1">
                          <span className="text-emerald-400 font-bold">Recommended Protocol Adjustments:</span>
                          {rev.recommendedModifications.map((m, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-slate-300">
                              <span>▪</span>
                              <span>{m}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Board Credential: {rev.signatureCredential}</span>
                        <span>{new Date(rev.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ACTION PANEL 1: Write Review & Reply (Collapsible) */}
            {isReviewOpen ? (
              <form onSubmit={handleReviewSubmit} className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/50 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4" />
                    SUBMIT CLINICAL ENDORSEMENT & FEEDBACK REPLY
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsReviewOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 font-bold mb-1">
                    CLINICAL DIRECTIVE / ACTION:
                  </label>
                  <select
                    value={reviewAction}
                    onChange={(e) => setReviewAction(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-white font-bold"
                  >
                    <option value="endorsed">Endorsed / Concur with Recommendations</option>
                    <option value="countermeasure_requested">Countermeasure Modification Requested</option>
                    <option value="cleared">Full Flight Medical Clearance Granted</option>
                    <option value="forwarded">Observations Noted</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 font-bold mb-1">
                    CLINICAL FEEDBACK NOTES:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter your clinical findings, sub-specialty evaluation, and response to referring physician..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 font-bold mb-1">
                    RECOMMENDED PROTOCOL MODIFICATIONS (One per line):
                  </label>
                  <textarea
                    rows={2}
                    placeholder="- Maintain suspension on ARED squats&#10;- Schedule follow-up ultrasound in 48 hours"
                    value={reviewRecommendations}
                    onChange={(e) => setReviewRecommendations(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReviewOpen(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-400 text-xs font-mono"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-mono font-bold text-xs hover:bg-emerald-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>SIGN & TRANSMIT REVIEW BACK</span>
                  </button>
                </div>
              </form>
            ) : null}

            {/* ACTION PANEL 2: Forward Report (Collapsible) */}
            {isForwardOpen ? (
              <form onSubmit={handleForwardSubmit} className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/50 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-purple-400">
                  <span className="flex items-center gap-1.5">
                    <Forward className="w-4 h-4" />
                    FORWARD / REFER DOSSIER TO ANOTHER SPECIALIST
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsForwardOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 font-bold mb-1">
                    FORWARD TO DOCTOR / SPECIALIST:
                  </label>
                  <select
                    value={forwardToDoctorId}
                    onChange={(e) => setForwardToDoctorId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white font-bold"
                  >
                    {CONSULTING_DOCTORS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} — {d.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 font-bold mb-1">
                    REFERRAL REASON / CLINICAL NOTE:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Forwarding to Orthopedic Lead for structural disc evaluation and surgical contraindication assessment..."
                    value={forwardReason}
                    onChange={(e) => setForwardReason(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForwardOpen(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-400 text-xs font-mono"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-purple-500 text-black font-mono font-bold text-xs hover:bg-purple-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
                  >
                    <Forward className="w-4 h-4" />
                    <span>TRANSMIT REFERRAL</span>
                  </button>
                </div>
              </form>
            ) : null}

            {/* Bottom Modal Actions */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {!isReviewOpen && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsReviewOpen(true);
                      setIsForwardOpen(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-mono font-bold text-xs hover:bg-emerald-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Stethoscope className="w-4 h-4" />
                    <span>REVIEW & REPLY</span>
                  </button>
                )}

                {!isForwardOpen && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsForwardOpen(true);
                      setIsReviewOpen(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/60 hover:bg-purple-500 text-purple-300 hover:text-black font-mono font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Forward className="w-4 h-4" />
                    <span>FORWARD / REFER</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadReportJson(selectedReport)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white font-mono text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>DATA JSON</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-mono text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
