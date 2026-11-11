import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Heart, 
  Activity, 
  Sparkles, 
  ClipboardCheck, 
  Dumbbell, 
  Filter, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Calendar,
  Layers,
  ChevronDown
} from 'lucide-react';
import { TimelineEvent, TimelineEventType, AstronautProfile } from '../types/astronaut.ts';

interface UnifiedTimelinePageProps {
  profile: AstronautProfile;
  onNavigateToTab?: (tab: string) => void;
}

export const UnifiedTimelinePage: React.FC<UnifiedTimelinePageProps> = ({ profile, onNavigateToTab }) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | TimelineEventType>('all');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const fetchTimeline = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/timeline');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setEvents(json.data);
        }
      }
    } catch (e) {
      console.warn('Failed to load timeline events:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, []);

  const filteredEvents = events.filter((evt) => {
    if (selectedFilter === 'all') return true;
    return evt.type === selectedFilter;
  });

  const getEventIcon = (type: TimelineEventType) => {
    switch (type) {
      case 'vitals':
        return <Heart className="w-4 h-4 text-[#00E5FF]" />;
      case 'symptom':
        return <Activity className="w-4 h-4 text-rose-400" />;
      case 'ai_insight':
        return <Sparkles className="w-4 h-4 text-[#FF8C00]" />;
      case 'checkin':
        return <ClipboardCheck className="w-4 h-4 text-purple-400" />;
      case 'exercise_eva':
        return <Dumbbell className="w-4 h-4 text-emerald-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-300" />;
    }
  };

  const getSeverityBadge = (severity?: TimelineEvent['severity']) => {
    switch (severity) {
      case 'alert':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/50">
            ALERT
          </span>
        );
      case 'warning':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FF8C00]/20 text-[#FFB347] border border-[#FF8C00]/50">
            ADAPTATION NOTICE
          </span>
        );
      case 'info':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/50">
            TELEMETRY INSIGHT
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/50">
            NOMINAL
          </span>
        );
    }
  };

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="glass-panel glass-panel-glow-cyan p-6 sm:p-7 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#00E5FF]/40 shadow-[0_0_35px_rgba(0,229,255,0.22)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/50 flex items-center justify-center text-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.35)] shrink-0">
            <Clock className="w-7 h-7 text-[#00E5FF]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Chakra_Petch',sans-serif] tracking-wide">
                Unified Medical & Telemetry Timeline
              </h1>
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#00E5FF]/20 border border-[#00E5FF]/50 text-[#00E5FF]">
                CHRONOBIOLOGY AUDIT
              </span>
            </div>
            <p className="text-sm font-sans text-slate-300 mt-1">
              Synchronized chronological log of vital signs, symptom registrations, AI diagnostic insights, daily check-ins, and microgravity exercise for <strong className="text-white">{profile.name}</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchTimeline}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#00E5FF]' : ''}`} />
            <span>SYNC LOGS</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs Strip */}
      <div className="glass-panel p-3 rounded-2xl border border-slate-800 flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-mono text-slate-400 font-bold px-2 flex items-center gap-1.5 shrink-0">
          <Filter className="w-3.5 h-3.5 text-[#00E5FF]" /> FILTER BY:
        </span>

        {[
          { id: 'all', label: `ALL EVENTS (${events.length})` },
          { id: 'vitals', label: 'VITALS LOGGED' },
          { id: 'symptom', label: 'SYMPTOMS' },
          { id: 'ai_insight', label: 'AI INSIGHTS' },
          { id: 'checkin', label: 'DAILY CHECK-INS' },
          { id: 'exercise_eva', label: 'EXERCISE & EVA' },
        ].map((tab) => {
          const active = selectedFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                active
                  ? 'bg-[#00E5FF] text-black shadow-[0_0_15px_#00E5FF]'
                  : 'bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/80'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Vertical Timeline Stream */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 relative">
        {isLoading ? (
          <div className="py-16 text-center text-xs font-mono text-slate-400 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 text-[#00E5FF] animate-spin" />
            <span>Retrieving Mission Elapsed Time events from telemetry bus...</span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-16 text-center text-xs font-mono text-slate-400">
            No events match the selected filter category.
          </div>
        ) : (
          <div className="relative border-l-2 border-[#00E5FF]/30 ml-4 sm:ml-6 space-y-8">
            {filteredEvents.map((evt, idx) => {
              const isExpanded = expandedEventId === evt.id;
              const dateObj = new Date(evt.timestamp);

              return (
                <div key={evt.id} className="relative pl-6 sm:pl-8 group">
                  {/* Glowing Node Marker on the vertical line */}
                  <div className="absolute -left-[17px] top-1.5 w-8 h-8 rounded-full bg-[#050810] border-2 border-[#00E5FF] flex items-center justify-center shadow-[0_0_15px_#00E5FF] group-hover:scale-110 transition-transform">
                    {getEventIcon(evt.type)}
                  </div>

                  {/* Event Card */}
                  <div className="p-5 rounded-2xl bg-[#091128]/80 hover:bg-[#0c1635]/90 border border-slate-700/80 hover:border-[#00E5FF]/50 transition-all shadow-lg space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-bold text-white text-base sm:text-lg font-['Chakra_Petch',sans-serif] tracking-wide">
                          {evt.title}
                        </span>
                        {getSeverityBadge(evt.severity)}
                        {evt.badge && (
                          <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                            {evt.badge}
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-mono text-slate-300 flex items-center gap-1.5 shrink-0">
                        <Clock className="w-3.5 h-3.5 text-[#00E5FF]" />
                        <span>
                          {dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                          {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm font-sans text-slate-200 leading-relaxed">
                      {evt.summary}
                    </p>

                    {/* Expandable Technical Details */}
                    {evt.details && (
                      <div>
                        <button
                          type="button"
                          onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                          className="text-xs font-mono text-[#00E5FF] hover:underline flex items-center gap-1 mt-1 cursor-pointer"
                        >
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          <span>{isExpanded ? 'Hide Telemetric Details' : 'Show Telemetric Metadata'}</span>
                        </button>

                        {isExpanded && (
                          <div className="mt-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-slate-300 space-y-1 animate-in fade-in">
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">
                              RAW TELEMETRY TELEGRAPH
                            </div>
                            {Object.entries(evt.details).map(([k, v]) => (
                              <div key={k} className="flex justify-between gap-4">
                                <span className="text-slate-400">{k}:</span>
                                <span className="text-white font-bold">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
