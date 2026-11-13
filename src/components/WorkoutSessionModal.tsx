import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Flame,
  Heart,
  Timer,
  Dumbbell,
  Volume2,
  VolumeX,
  FastForward,
  Activity,
  ShieldCheck,
  Gauge,
  SkipForward,
  Layers,
  Plus,
  Coffee,
  ListChecks,
} from 'lucide-react';
import {
  AstronautProfile,
  SpaceExercise,
  WorkoutSessionLog,
} from '../types/astronaut.ts';

interface WorkoutSessionModalProps {
  exercise: SpaceExercise;
  profile: AstronautProfile;
  playlist?: SpaceExercise[];
  playlistIndex?: number;
  onSelectPlaylistIndex?: (index: number) => void;
  onClose: () => void;
  onComplete: (loggedSession: WorkoutSessionLog, advanceToNext?: boolean) => void;
}

export const WorkoutSessionModal: React.FC<WorkoutSessionModalProps> = ({
  exercise,
  profile,
  playlist,
  playlistIndex = 0,
  onSelectPlaylistIndex,
  onClose,
  onComplete,
}) => {
  const totalSeconds = exercise.durationMinutes * 60;
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 15>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [loopCount, setLoopCount] = useState<number>(1);

  // Sets, Reps & Microgravity Rest Interval State
  const totalSets =
    exercise.intensity === 'High' ? 4 : exercise.intensity === 'Moderate' ? 3 : 3;
  const targetReps =
    exercise.category === 'Core' || exercise.id.includes('heel')
      ? 15
      : exercise.category === 'Full Body'
      ? 12
      : 10;

  const [currentSet, setCurrentSet] = useState<number>(1);
  const [currentRep, setCurrentRep] = useState<number>(1);
  const [restSecondsLeft, setRestSecondsLeft] = useState<number>(0);

  // Live Simulated Bio-Telemetry
  const baseHr = profile.restingHeartRate || 58;
  const targetHr =
    exercise.intensity === 'High'
      ? 148
      : exercise.intensity === 'Moderate'
      ? 126
      : 106;

  const [currentHr, setCurrentHr] = useState<number>(baseHr + 12);
  const [peakHr, setPeakHr] = useState<number>(baseHr + 12);
  const [hrSamples, setHrSamples] = useState<number[]>([baseHr + 12]);
  const [spO2, setSpO2] = useState<number>(profile.spO2Baseline || 99);
  const [crewNotes, setCrewNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const isPlaylistMode = Array.isArray(playlist) && playlist.length > 1;
  const hasNextInPlaylist = isPlaylistMode && playlistIndex < playlist.length - 1;
  const nextExercise = hasNextInPlaylist ? playlist[playlistIndex + 1] : null;

  // Reset session state when switching exercise in playlist
  useEffect(() => {
    setElapsedSeconds(0);
    setIsRunning(true);
    setLoopCount(1);
    setCurrentSet(1);
    setCurrentRep(1);
    setRestSecondsLeft(0);
    setCrewNotes('');
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [exercise.id]);

  // Synthesize NASA telemetry audio cue via Web Audio API
  const playTelemetryBeep = (freq = 880, durationMs = 120, type: OscillatorType = 'sine') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch {
      // Ignore audio context restrictions
    }
  };

  // Sync video playback with timer state
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (isRunning && elapsedSeconds < totalSeconds && restSecondsLeft === 0) {
      vid.loop = true;
      vid.play().catch(() => {});
    } else {
      vid.pause();
    }
  }, [isRunning, elapsedSeconds, totalSeconds, restSecondsLeft]);

  // Active Timer, Sets/Reps Cadence & Bio-Telemetry Loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      // Handle Microgravity Inter-Set Rest Countdown
      if (restSecondsLeft > 0) {
        setRestSecondsLeft((prev) => {
          if (prev <= 1) {
            playTelemetryBeep(880, 140, 'sine');
            return 0;
          }
          return prev - 1;
        });
        return;
      }

      // Ensure video stays playing & looping while timer is active
      const vid = videoRef.current;
      if (vid && (vid.paused || vid.ended)) {
        if (vid.ended || (vid.duration > 0 && vid.currentTime >= vid.duration - 0.15)) {
          vid.currentTime = 0;
        }
        vid.play().catch(() => {});
      }

      setElapsedSeconds((prev) => {
        const next = Math.min(totalSeconds, prev + speedMultiplier);
        if (next >= totalSeconds && prev < totalSeconds) {
          setIsRunning(false);
          if (videoRef.current) {
            videoRef.current.pause();
          }
          playTelemetryBeep(1046.5, 350, 'triangle');
        } else if (Math.floor(next / 60) > Math.floor(prev / 60)) {
          playTelemetryBeep(660, 70, 'sine');
        }

        // Advance reps every ~4 seconds of elapsed protocol time
        if (next < totalSeconds && next % 4 === 0) {
          setCurrentRep((prevRep) => {
            if (prevRep >= targetReps) {
              setCurrentSet((prevSet) => {
                if (prevSet < totalSets) {
                  playTelemetryBeep(587.33, 180, 'triangle');
                  setRestSecondsLeft(15);
                  return prevSet + 1;
                }
                return 1;
              });
              return 1;
            }
            return prevRep + 1;
          });
        }

        return next;
      });

      // Update live heart rate and SpO2
      setCurrentHr((prevHr) => {
        const jitter = Math.floor(Math.random() * 5) - 2;
        const step = prevHr < targetHr ? 2 : 0;
        const nextHr = Math.max(baseHr + 8, Math.min(168, prevHr + step + jitter));
        setPeakHr((prevPeak) => Math.max(prevPeak, nextHr));
        setHrSamples((samples) => [...samples.slice(-40), nextHr]);
        return nextHr;
      });

      setSpO2(() => {
        const base = profile.spO2Baseline || 99;
        return Math.random() > 0.75 ? base - 1 : base;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    isRunning,
    restSecondsLeft,
    speedMultiplier,
    totalSeconds,
    targetHr,
    baseHr,
    profile.spO2Baseline,
    targetReps,
    totalSets,
  ]);

  // Gradual HR recovery when paused or resting
  useEffect(() => {
    if (isRunning && restSecondsLeft === 0) return;
    const recovery = setInterval(() => {
      setCurrentHr((prev) => (prev > baseHr + 12 ? prev - 1 : prev));
    }, 2000);
    return () => clearInterval(recovery);
  }, [isRunning, restSecondsLeft, baseHr]);

  const progressRatio = totalSeconds > 0 ? Math.min(1, elapsedSeconds / totalSeconds) : 0;
  const progressPercent = Math.round(progressRatio * 100);
  const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const liveCalories = Math.max(
    elapsedSeconds > 0 ? 1 : 0,
    Math.round(exercise.caloriesBurned * progressRatio)
  );

  const avgHr =
    hrSamples.length > 0
      ? Math.round(hrSamples.reduce((a, b) => a + b, 0) / hrSamples.length)
      : currentHr;

  // Determine current protocol phase
  const currentPhase =
    progressPercent < 15
      ? {
          name: 'PHASE 1: WARM-UP & HARNESS CALIBRATION',
          desc: 'Isolating microgravity vibration & stabilizing posture restraints',
          color: 'text-[#00E5FF]',
        }
      : progressPercent < 85
      ? {
          name: 'PHASE 2: PRIMARY COUNTERMEASURE LOAD',
          desc: `Maintaining target ${exercise.equipment} resistance & osteogenic loading`,
          color: 'text-emerald-400',
        }
      : {
          name: 'PHASE 3: COOL-DOWN & FLUID EQUILIBRATION',
          desc: 'Gradual autonomic heart rate recovery & controlled breathing',
          color: 'text-amber-300',
        };

  const handleTogglePlay = () => {
    if (elapsedSeconds >= totalSeconds) {
      setElapsedSeconds(0);
      setLoopCount(1);
      setCurrentSet(1);
      setCurrentRep(1);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }
    }
    const nextState = !isRunning;
    setIsRunning(nextState);
    playTelemetryBeep(nextState ? 880 : 520, 100);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
    setLoopCount(1);
    setCurrentSet(1);
    setCurrentRep(1);
    setRestSecondsLeft(0);
    setCurrentHr(baseHr + 12);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    playTelemetryBeep(440, 120);
  };

  const handleManualRepIncrement = () => {
    playTelemetryBeep(740, 60, 'sine');
    setCurrentRep((prevRep) => {
      if (prevRep >= targetReps) {
        setCurrentSet((prevSet) => (prevSet < totalSets ? prevSet + 1 : 1));
        return 1;
      }
      return prevRep + 1;
    });
  };

  const handleManualNextSet = () => {
    playTelemetryBeep(587.33, 140, 'triangle');
    setCurrentRep(1);
    setCurrentSet((prevSet) => (prevSet < totalSets ? prevSet + 1 : 1));
    setRestSecondsLeft(15);
  };

  const handleCompleteWorkout = async (advanceToNext = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setIsRunning(false);

    const effectiveMinutes =
      elapsedSeconds >= 60
        ? Math.max(1, Math.round(elapsedSeconds / 60))
        : exercise.durationMinutes;

    const effectiveCalories =
      liveCalories > 5 ? liveCalories : exercise.caloriesBurned;

    try {
      const res = await fetch('/api/fitness/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          category: exercise.category,
          equipment: exercise.equipment,
          durationMinutes: effectiveMinutes,
          actualDurationSeconds: elapsedSeconds > 0 ? elapsedSeconds : totalSeconds,
          caloriesBurned: effectiveCalories,
          avgHeartRate: avgHr,
          peakHeartRate: peakHr,
          notes:
            crewNotes.trim() ||
            `Completed ${exercise.name} (${currentSet}/${totalSets} sets) aboard ${profile.missionId}.`,
        }),
      });

      if (!res.ok) throw new Error('Failed to log workout session');
      const json = await res.json();
      playTelemetryBeep(1174.66, 280, 'triangle');
      onComplete(json.data, advanceToNext);
    } catch {
      onComplete(
        {
          id: `WKT-LOCAL-${Date.now()}`,
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          category: exercise.category,
          equipment: exercise.equipment,
          durationMinutes: effectiveMinutes,
          actualDurationSeconds: elapsedSeconds > 0 ? elapsedSeconds : totalSeconds,
          caloriesBurned: effectiveCalories,
          avgHeartRate: avgHr,
          peakHeartRate: peakHr,
          notes: crewNotes.trim() || `Completed ${exercise.name} countermeasure protocol.`,
          completedAt: new Date().toISOString(),
        },
        advanceToNext
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="glass-panel glass-panel-glow-cyan w-full max-w-5xl rounded-2xl border border-[#00E5FF]/50 shadow-[0_0_50px_rgba(0,229,255,0.28)] overflow-hidden my-auto">
        {/* ─── Top Modal Header ─── */}
        <div className="px-6 py-4 bg-[#071026] border-b border-[#00E5FF]/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 font-bold">
                  ACTIVE COUNTERMEASURE HUD
                </span>
                {isPlaylistMode && (
                  <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#FF8C00]/20 text-[#FFB347] border border-[#FF8C00]/40 font-bold">
                    DAILY PROTOCOL QUEUE · {playlistIndex + 1} OF {playlist.length}
                  </span>
                )}
                <span className="text-xs font-mono text-slate-400">
                  {exercise.category} · {exercise.equipment}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white font-['Chakra_Petch',sans-serif] tracking-wide mt-0.5">
                {exercise.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled((s) => !s)}
              title={soundEnabled ? 'Mute Telemetry Audio Cues' : 'Enable Telemetry Audio Cues'}
              className="p-2 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-[#00E5FF] hover:border-[#00E5FF]/50 transition-colors cursor-pointer"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#00E5FF]" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-rose-400 hover:border-rose-500/50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ─── Daily Protocol Playlist Stepper (if Playlist Mode is active) ─── */}
        {isPlaylistMode && (
          <div className="px-6 py-3 bg-[#050b1c] border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#FFB347] shrink-0 mr-2">
              <ListChecks className="w-4 h-4" />
              PROTOCOL PLAYLIST:
            </div>
            {playlist.map((item, idx) => {
              const isCurrent = idx === playlistIndex;
              const isDone = idx < playlistIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectPlaylistIndex && onSelectPlaylistIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer border ${
                    isCurrent
                      ? 'bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]/60 shadow-[0_0_12px_rgba(0,229,255,0.25)]'
                      : isDone
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center bg-black/40">
                    {isDone ? '✓' : idx + 1}
                  </span>
                  <span>{item.name}</span>
                  <span className="text-[10px] opacity-75">({item.durationMinutes}m)</span>
                </button>
              );
            })}
          </div>
        )}

        {/* ─── Body Content ─── */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Embedded Video & Visual Cadence HUD (7 cols) */}
            <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-[#050b1a] border border-[#00E5FF]/35 shadow-inner">
                {exercise.videoUrl && (
                  <video
                    ref={videoRef}
                    src={exercise.videoUrl}
                    preload="auto"
                    autoPlay
                    loop={elapsedSeconds < totalSeconds}
                    muted
                    playsInline
                    controls
                    className="w-full h-full object-cover"
                    onPlay={() => {
                      if (!isRunning && elapsedSeconds < totalSeconds) {
                        setIsRunning(true);
                      }
                    }}
                    onTimeUpdate={(e) => {
                      const vid = e.currentTarget;
                      if (
                        isRunning &&
                        elapsedSeconds < totalSeconds &&
                        vid.duration > 0 &&
                        vid.currentTime >= vid.duration - 0.12
                      ) {
                        vid.currentTime = 0;
                        setLoopCount((c) => c + 1);
                        vid.play().catch(() => {});
                      }
                    }}
                    onEnded={(e) => {
                      const vid = e.currentTarget;
                      if (elapsedSeconds < totalSeconds) {
                        vid.currentTime = 0;
                        setLoopCount((c) => c + 1);
                        vid.play().catch(() => {});
                      } else {
                        vid.pause();
                      }
                    }}
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const fallback = target.parentElement?.querySelector(
                        '.session-video-fallback'
                      ) as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                )}

                {/* Microgravity Rest Interval Overlay */}
                {restSecondsLeft > 0 && (
                  <div className="absolute inset-0 z-20 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
                    <Coffee className="w-10 h-10 text-[#00E5FF] mb-2 animate-bounce" />
                    <div className="text-xs font-mono text-[#00E5FF] uppercase tracking-widest font-bold">
                      MICROGRAVITY INTER-SET RECOVERY
                    </div>
                    <div className="text-4xl font-mono font-extrabold text-white my-2">
                      00:{String(restSecondsLeft).padStart(2, '0')}
                    </div>
                    <p className="text-xs font-sans text-slate-300 max-w-xs mb-4">
                      Decompress spine, maintain controlled breathing, and prepare for{' '}
                      <strong className="text-white">Set {currentSet} of {totalSets}</strong>.
                    </p>
                    <button
                      type="button"
                      onClick={() => setRestSecondsLeft(0)}
                      className="px-4 py-2 rounded-xl bg-[#00E5FF] text-slate-950 font-mono font-bold text-xs uppercase tracking-wider cursor-pointer hover:bg-[#00E5FF]/90"
                    >
                      SKIP REST & RESUME SET {currentSet}
                    </button>
                  </div>
                )}

                {/* Video Fallback */}
                <div
                  className={`session-video-fallback ${
                    exercise.videoUrl ? 'hidden' : 'flex'
                  } absolute inset-0 flex-col items-center justify-center bg-gradient-to-br from-[#07132c] via-[#040917] to-[#091936] p-6 text-center`}
                >
                  <div className="w-20 h-20 rounded-full border-2 border-[#00E5FF]/50 flex items-center justify-center mb-3">
                    <Dumbbell className="w-9 h-9 text-[#00E5FF]" />
                  </div>
                  <div className="text-sm font-mono font-bold text-white tracking-wider uppercase">
                    {exercise.name} — {isRunning ? 'TELEMETRY STREAM ACTIVE' : 'READY FOR EXECUTION'}
                  </div>
                  <p className="text-xs font-sans text-slate-300 max-w-md mt-1.5 leading-relaxed">
                    {exercise.description}
                  </p>
                </div>

                {/* Live Recording / Status Overlay Pill */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[#050a18]/90 border border-slate-700 flex items-center gap-2 z-10">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isRunning
                        ? 'bg-emerald-400'
                        : elapsedSeconds >= totalSeconds
                        ? 'bg-[#00E5FF]'
                        : 'bg-amber-400'
                    }`}
                  />
                  <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">
                    {isRunning
                      ? `LIVE LOOP · CYCLE #${loopCount}`
                      : elapsedSeconds >= totalSeconds
                      ? 'PROTOCOL TARGET REACHED'
                      : elapsedSeconds > 0
                      ? 'SESSION PAUSED'
                      : 'STANDBY'}
                  </span>
                </div>

                {/* Speed Mode Indicator */}
                <div className="absolute top-3 right-3 z-10">
                  <button
                    type="button"
                    onClick={() => setSpeedMultiplier((prev) => (prev === 1 ? 15 : 1))}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border flex items-center gap-1 cursor-pointer transition-all ${
                      speedMultiplier === 15
                        ? 'bg-[#FF8C00]/25 text-[#FFB347] border-[#FF8C00]'
                        : 'bg-[#050a18]/90 text-slate-300 border-slate-700 hover:border-[#00E5FF]/50'
                    }`}
                    title="Toggle between real-time 1x and 15x fast simulation speed"
                  >
                    <FastForward className="w-3 h-3" />
                    {speedMultiplier}x SPEED
                  </button>
                </div>
              </div>

              {/* Live Sets & Reps Counter HUD */}
              <div className="p-4 rounded-xl bg-[#071026] border border-[#00E5FF]/35 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      COUNTERMEASURE CADENCE · SETS & REPS
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-lg font-mono font-extrabold text-white">
                        SET <span className="text-[#00E5FF]">{currentSet}</span> OF {totalSets}
                      </span>
                      <span className="text-slate-600">|</span>
                      <span className="text-lg font-mono font-extrabold text-emerald-400">
                        REP {currentRep} / {targetReps}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleManualRepIncrement}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[#00E5FF] border border-[#00E5FF]/40 font-mono text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> +1 REP
                  </button>
                  <button
                    type="button"
                    onClick={handleManualNextSet}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-mono text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <SkipForward className="w-3.5 h-3.5" /> NEXT SET (15s REST)
                  </button>
                </div>
              </div>

              {/* Phase Indicator & Progress Bar */}
              <div className="p-4 rounded-xl bg-[#071026]/90 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-mono font-bold tracking-wider ${currentPhase.color}`}>
                    {currentPhase.name}
                  </span>
                  <span className="text-xs font-mono font-bold text-white">
                    {progressPercent}% COMPLETE
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-[#00E5FF] via-emerald-400 to-[#FF8C00] transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-xs font-sans text-slate-400">{currentPhase.desc}</p>
              </div>
            </div>

            {/* Right Column: Interactive Countdown Timer & Live Bio-Telemetry (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              {/* Digital Mission Countdown Display */}
              <div className="p-5 rounded-xl bg-[#071026] border border-[#00E5FF]/40 text-center space-y-3 shadow-[0_0_25px_rgba(0,229,255,0.12)]">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                  <Timer className="w-3.5 h-3.5 text-[#00E5FF]" />
                  REMAINING PROTOCOL TIME
                </div>
                <div className="text-4xl sm:text-5xl font-mono font-extrabold text-white tracking-widest glow-text-cyan">
                  {formatTime(remainingSeconds)}
                </div>
                <div className="text-xs font-mono text-slate-400">
                  ELAPSED: <span className="text-[#00E5FF] font-bold">{formatTime(elapsedSeconds)}</span> /{' '}
                  {formatTime(totalSeconds)}
                </div>

                {/* Timer Control Buttons */}
                <div className="flex items-center justify-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className={`flex-1 py-2.5 px-4 rounded-xl font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      isRunning
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-400/60 hover:bg-amber-500/30'
                        : 'bg-[#00E5FF] text-slate-950 hover:bg-[#00E5FF]/90 shadow-[0_0_20px_rgba(0,229,255,0.4)]'
                    }`}
                  >
                    {isRunning ? (
                      <>
                        <Pause className="w-4 h-4 fill-current" /> PAUSE SESSION
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />{' '}
                        {elapsedSeconds > 0 && elapsedSeconds < totalSeconds
                          ? 'RESUME'
                          : 'START TIMER'}
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    title="Reset Timer"
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Real-Time Bio-Telemetry Cards */}
              <div className="grid grid-cols-2 gap-3">
                {/* Live Heart Rate */}
                <div className="p-3.5 rounded-xl bg-[#071026]/90 border border-rose-500/35 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">HEART RATE</span>
                    <Heart className={`w-4 h-4 text-rose-400 ${isRunning ? 'animate-ping' : ''}`} />
                  </div>
                  <div className="text-2xl font-mono font-extrabold text-white">
                    {currentHr} <span className="text-xs font-normal text-rose-300">bpm</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    PEAK: <span className="text-rose-300 font-bold">{peakHr} bpm</span> · TARGET: {targetHr}
                  </div>
                </div>

                {/* Live Calories Burned */}
                <div className="p-3.5 rounded-xl bg-[#071026]/90 border border-[#FF8C00]/35 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">ACTIVE BURN</span>
                    <Flame className="w-4 h-4 text-[#FF8C00]" />
                  </div>
                  <div className="text-2xl font-mono font-extrabold text-[#FFB347]">
                    {liveCalories} <span className="text-xs font-normal text-slate-300">kcal</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    TARGET: <span className="text-white font-bold">{exercise.caloriesBurned} kcal</span>
                  </div>
                </div>

                {/* SpO2 Saturation */}
                <div className="p-3.5 rounded-xl bg-[#071026]/90 border border-[#00E5FF]/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">SpO2 LEVEL</span>
                    <Activity className="w-4 h-4 text-[#00E5FF]" />
                  </div>
                  <div className="text-xl font-mono font-extrabold text-[#00E5FF]">{spO2}%</div>
                  <div className="text-[10px] font-mono text-emerald-400">NOMINAL CABIN O2</div>
                </div>

                {/* Equipment Telemetry */}
                <div className="p-3.5 rounded-xl bg-[#071026]/90 border border-emerald-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">LOAD / INTENSITY</span>
                    <Gauge className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-xl font-mono font-extrabold text-emerald-300">
                    {exercise.intensity}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 truncate">
                    {exercise.equipment}
                  </div>
                </div>
              </div>

              {/* Target Muscle Groups */}
              <div className="p-3.5 rounded-xl bg-[#071026]/60 border border-slate-800 space-y-2">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  TARGETED MUSCLE GROUPS & COUNTERMEASURES
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {exercise.targetMuscles.map((m) => (
                    <span
                      key={m}
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ─── Post-Session Telemetry Notes & Completion Action ─── */}
          <div className="p-4 rounded-xl bg-[#071026]/90 border border-[#00E5FF]/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-mono font-bold text-[#00E5FF] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                CREW SESSION TELEMETRY NOTES (OPTIONAL)
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                Synchronizes directly with Ground Control & Unified Medical Timeline
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={crewNotes}
                onChange={(e) => setCrewNotes(e.target.value)}
                placeholder={`Log observations for ${exercise.name} (e.g., harness comfort, spinal feedback, RPE)...`}
                className="flex-1 bg-slate-950/90 border border-slate-700 focus:border-[#00E5FF] rounded-xl px-4 py-2.5 text-sm font-sans text-white placeholder:text-slate-500 outline-none transition-colors"
              />
              {hasNextInPlaylist && nextExercise ? (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCompleteWorkout(false)}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono font-bold text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50"
                  >
                    FINISH & EXIT
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCompleteWorkout(true)}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all cursor-pointer disabled:opacity-50"
                  >
                    <SkipForward className="w-4 h-4" />
                    {isSubmitting ? 'SAVING...' : `LOG & NEXT: ${nextExercise.name}`}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleCompleteWorkout(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isSubmitting ? 'SYNCHRONIZING...' : 'COMPLETE & LOG WORKOUT'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
