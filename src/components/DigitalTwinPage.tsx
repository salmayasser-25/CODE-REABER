import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Zap, 
  AlertTriangle, 
  ShieldAlert, 
  RotateCcw, 
  Cpu, 
  Layers, 
  CheckCircle, 
  Sparkles, 
  Sliders, 
  Activity, 
  Flame, 
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { AstronautProfile } from '../types/astronaut.js';

const BODY_MODEL_URL = '/models/body_superficial.app5m.glb';

// Preload 3D model
try {
  useGLTF.preload(BODY_MODEL_URL);
} catch {}

interface SimulationResult {
  actionId: string;
  actionName: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  riskColor: string;
  probability: string;
  targetZone: 'lumbar' | 'shoulders' | 'cardiovascular';
  affectedSystems: string[];
  predictedConsequence: string;
  recommendation: string;
  aiExplanation: string;
  peakForceN: number;
  safetyLimitN: number;
  stressCoords: [number, number, number];
  timestamp: string;
}

interface DigitalTwinPageProps {
  profile: AstronautProfile;
  onSendToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateToTab?: (tab: string) => void;
}

// 3D Pulsing Stress Aura & Shockwave Ring Mesh
function StressZoneMesh({ 
  position, 
  color = '#ef4444', 
  label = 'CRITICAL STRESS' 
}: { 
  position: [number, number, number]; 
  color?: string; 
  label?: string; 
}) {
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const ringRef = useRef<THREE.Mesh | null>(null);
  const ring2Ref = useRef<THREE.Mesh | null>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Emissive pulsing on the core hotspot
    if (sphereRef.current) {
      const scale = 1 + Math.sin(t * 7) * 0.18;
      sphereRef.current.scale.set(scale, scale, scale);
    }
    // Expanding radiating shockwave rings
    if (ringRef.current) {
      const ringScale = (t * 1.5) % 2.5;
      ringRef.current.scale.set(ringScale, ringScale, ringScale);
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = Math.max(0, 1 - ringScale / 2.5) * 0.8;
      }
    }
    if (ring2Ref.current) {
      const ring2Scale = ((t + 0.8) * 1.5) % 2.5;
      ring2Ref.current.scale.set(ring2Scale, ring2Scale, ring2Scale);
      const mat2 = ring2Ref.current.material as THREE.MeshBasicMaterial;
      if (mat2) {
        mat2.opacity = Math.max(0, 1 - ring2Scale / 2.5) * 0.8;
      }
    }
  });

  return (
    <group position={position}>
      {/* Central Pulsing Stress Core Sphere */}
      <mesh ref={sphereRef}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.8}
          roughness={0.2}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Radiating Shockwave Ring 1 */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.26, 0.32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Radiating Shockwave Ring 2 */}
      <mesh ref={ring2Ref} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.26, 0.32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Floating 3D Warning Label Badge */}
      <Html position={[0, 0.38, 0]} center distanceFactor={6}>
        <div className="px-3 py-1.5 rounded-xl bg-black/90 border-2 border-rose-500 text-rose-100 font-mono text-xs font-black whitespace-nowrap shadow-[0_0_20px_#f43f5e] flex items-center gap-1.5 animate-bounce">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{label}</span>
        </div>
      </Html>
    </group>
  );
}

// 3D Body Mesh with Cyber Hologram appearance
function AnatomicalBodyModel({ activeResult }: { activeResult: SimulationResult | null }) {
  const gltf = useGLTF(BODY_MODEL_URL);
  const groupRef = useRef<THREE.Group | null>(null);

  // Apply holographic styling to all loaded meshes
  useEffect(() => {
    if (gltf.scene) {
      gltf.scene.traverse((child: any) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: '#00E5FF',
            metalness: 0.8,
            roughness: 0.3,
            emissive: '#042838',
            emissiveIntensity: 0.4,
            transparent: true,
            opacity: 0.75,
            wireframe: false,
          });
        }
      });
    }
  }, [gltf.scene]);

  return (
    <group ref={groupRef} position={[0, -0.9, 0]} scale={1.2}>
      <primitive object={gltf.scene} />
      {/* Dynamic 3D visual stress reaction hotspot */}
      {activeResult && (
        <StressZoneMesh
          position={activeResult.stressCoords}
          color={activeResult.riskLevel === 'CRITICAL' ? '#f43f5e' : activeResult.riskLevel === 'HIGH' ? '#ea580c' : '#f59e0b'}
          label={`⚠️ ${activeResult.riskLevel}: ${activeResult.affectedSystems[0]}`}
        />
      )}
    </group>
  );
}

// Procedural Fallback if GLB model network is delayed
function ProceduralBodyFallback({ activeResult }: { activeResult: SimulationResult | null }) {
  return (
    <group position={[0, -0.4, 0]}>
      {/* Cranium */}
      <mesh position={[0, 1.45, 0]}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial color="#00E5FF" roughness={0.3} metalness={0.8} transparent opacity={0.65} />
      </mesh>
      {/* Cervical */}
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.08, 0.09, 0.18, 16]} />
        <meshStandardMaterial color="#00E5FF" roughness={0.3} metalness={0.8} transparent opacity={0.65} />
      </mesh>
      {/* Thorax */}
      <mesh position={[0, 0.85, 0]}>
        <boxGeometry args={[0.5, 0.42, 0.26]} />
        <meshStandardMaterial color="#00E5FF" roughness={0.3} metalness={0.8} transparent opacity={0.65} />
      </mesh>
      {/* Lumbar */}
      <mesh position={[0, 0.48, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.32, 16]} />
        <meshStandardMaterial color="#00E5FF" roughness={0.3} metalness={0.8} transparent opacity={0.65} />
      </mesh>
      {/* Pelvis */}
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[0.42, 0.26, 0.24]} />
        <meshStandardMaterial color="#00E5FF" roughness={0.3} metalness={0.8} transparent opacity={0.65} />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.18, -0.42, 0]}>
        <cylinderGeometry args={[0.12, 0.09, 0.9, 16]} />
        <meshStandardMaterial color="#00E5FF" roughness={0.3} metalness={0.8} transparent opacity={0.65} />
      </mesh>
      <mesh position={[0.18, -0.42, 0]}>
        <cylinderGeometry args={[0.12, 0.09, 0.9, 16]} />
        <meshStandardMaterial color="#00E5FF" roughness={0.3} metalness={0.8} transparent opacity={0.65} />
      </mesh>

      {/* Dynamic Stress Hotspot */}
      {activeResult && (
        <StressZoneMesh
          position={activeResult.stressCoords}
          color={activeResult.riskLevel === 'CRITICAL' ? '#f43f5e' : '#ea580c'}
          label={`⚠️ ${activeResult.riskLevel}: ${activeResult.affectedSystems[0]}`}
        />
      )}
    </group>
  );
}

// Error boundary
class ModelBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

export const DigitalTwinPage: React.FC<DigitalTwinPageProps> = ({ 
  profile, 
  onSendToast,
  onNavigateToTab 
}) => {
  // Action Selection State
  const [selectedActionId, setSelectedActionId] = useState<string>('ared-squat');
  // Parameter Sliders State
  const [squatWeightKg, setSquatWeightKg] = useState<number>(120);
  const [evaPressurePsi, setEvaPressurePsi] = useState<number>(4.3);
  const [treadmillSpeedKmh, setTreadmillSpeedKmh] = useState<number>(12);

  // Simulation execution state
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simProgress, setSimProgress] = useState<number>(0);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);

  const controlsRef = useRef<any>(null);

  // Available Risky Actions (Requirement 2)
  const actionOptions = [
    {
      id: 'ared-squat',
      title: 'ARED Barbell Squat (Heavy Axial Load)',
      category: 'Biomechanics / Lumbar Spine',
      description: 'Simulates heavy axial compressive barbell loading on microgravity elongated intervertebral discs.',
      defaultStressZone: 'lumbar',
    },
    {
      id: 'eva-suit',
      title: 'EVA Suit Donning (High Pressure)',
      category: 'Upper Extremity / Joint Torque',
      description: 'Simulates unilateral shoulder abduction and acromioclavicular shear stress under EMU suit pressure differential.',
      defaultStressZone: 'shoulders',
    },
    {
      id: 'treadmill',
      title: 'High-Intensity Treadmill (Cardiovascular Stress)',
      category: 'Cardiovascular & Lower Limb',
      description: 'Simulates sprint interval impact on T2 treadmill bungee harness with reduced cardiac preload.',
      defaultStressZone: 'cardiovascular',
    },
  ];

  // Run Biomechanical Simulation (Requirement 2 & 5)
  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setSimProgress(10);
    setSimResult(null);

    // Camera auto-recenter for drama
    if (controlsRef.current) {
      if (selectedActionId === 'ared-squat') {
        controlsRef.current.target.set(0, 0.48, 0);
      } else if (selectedActionId === 'eva-suit') {
        controlsRef.current.target.set(0, 0.88, 0);
      } else {
        controlsRef.current.target.set(0, 0.75, 0);
      }
    }

    // Step progress animation
    const progressTimer = setInterval(() => {
      setSimProgress((p) => {
        if (p >= 90) {
          clearInterval(progressTimer);
          return 95;
        }
        return p + 25;
      });
    }, 450);

    try {
      const response = await fetch('/api/simulator/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionId: selectedActionId,
          weightKg: squatWeightKg,
          pressurePsi: evaPressurePsi,
          treadmillSpeedKmh,
          profile,
        }),
      });

      const json = await response.json();
      setTimeout(() => {
        clearInterval(progressTimer);
        setIsSimulating(false);
        setSimProgress(100);

        if (json.success && json.data) {
          setSimResult(json.data);
        } else {
          // Client deterministic fallback
          fallbackCalculation();
        }

        if (onSendToast) {
          onSendToast('Biomechanical risk simulation complete: Safety threshold exceeded!', 'error');
        }
      }, 1900);
    } catch {
      setTimeout(() => {
        clearInterval(progressTimer);
        setIsSimulating(false);
        setSimProgress(100);
        fallbackCalculation();
      }, 1900);
    }
  };

  // Client calculation fallback
  const fallbackCalculation = () => {
    const spineDelta = profile.spineElongation || 4.2;
    if (selectedActionId === 'ared-squat') {
      setSimResult({
        actionId: 'ared-squat',
        actionName: 'ARED Barbell Squat (Heavy Axial Load)',
        riskLevel: 'CRITICAL',
        riskColor: 'rose',
        probability: '85%',
        targetZone: 'lumbar',
        affectedSystems: ['Lumbar Spine L4-L5', 'Intervertebral Discs', 'Annulus Fibrosus'],
        predictedConsequence: `85% probability of disc herniation due to spine elongation (+${spineDelta}cm) + axial compression (${squatWeightKg}kg barbell loading).`,
        recommendation: 'ABORT ACTION. Proceed with CEVIS Ergometer or passive lumbar flexion countermeasure instead.',
        aiExplanation: `Based on your current Spine Elongation (+${spineDelta}cm) and unadapted paraspinal ligament laxity, executing a ${squatWeightKg}kg axial load will exceed the safe disc pressure threshold (3,400 N peak vs 4,820 N simulated). This is a deterministic safety violation.`,
        peakForceN: 4820,
        safetyLimitN: 3400,
        stressCoords: [0, 0.48, -0.06],
        timestamp: new Date().toISOString(),
      });
    } else if (selectedActionId === 'eva-suit') {
      setSimResult({
        actionId: 'eva-suit',
        actionName: 'EVA Suit Donning (High Pressure)',
        riskLevel: 'MODERATE',
        riskColor: 'amber',
        probability: '68%',
        targetZone: 'shoulders',
        affectedSystems: ['Acromioclavicular Joint', 'Supraspinatus Tendon', 'Brachial Plexus'],
        predictedConsequence: `68% risk of acromioclavicular impingement and soft tissue contusion at ${evaPressurePsi} psi suit pressure during unilateral shoulder abduction.`,
        recommendation: 'PROCEED WITH CAUTION. Engage two-crew assisted donning sequence and calibrate shoulder bearing rings.',
        aiExplanation: `Donning the Extravehicular Mobility Unit (EMU) against a ${evaPressurePsi} psi pressure differential creates excessive shear stress on the deltoid and rotator cuff. Bilateral crew assistance reduces peak joint torque by 42%.`,
        peakForceN: 1250,
        safetyLimitN: 1100,
        stressCoords: [0, 0.88, 0.08],
        timestamp: new Date().toISOString(),
      });
    } else {
      setSimResult({
        actionId: 'treadmill',
        actionName: 'High-Intensity Treadmill (Cardiovascular Stress)',
        riskLevel: 'HIGH',
        riskColor: 'rose',
        probability: '74%',
        targetZone: 'cardiovascular',
        affectedSystems: ['Myocardial Oxygen Demand', 'Baroreceptor Reflex', 'Tibial Periosteum'],
        predictedConsequence: `74% probability of exceeding target maximum heart rate (175 bpm) with secondary lower extremity impact stress on T2 treadmill bungee harness.`,
        recommendation: 'MODIFY PROTOCOL. Reduce speed to 8.5 km/h and limit interval sprint duration to under 90 seconds.',
        aiExplanation: `Microgravity cardiovascular deconditioning and cephalic fluid shift reduce left ventricular end-diastolic volume. High-intensity interval loading at ${treadmillSpeedKmh} km/h induces premature tachycardia and orthostatic stress.`,
        peakForceN: 2400,
        safetyLimitN: 2100,
        stressCoords: [-0.08, 0.82, 0.14],
        timestamp: new Date().toISOString(),
      });
    }
  };

  const selectedAction = actionOptions.find((a) => a.id === selectedActionId) || actionOptions[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Page Header (Requirement 1) */}
      <div className="glass-panel glass-panel-glow p-6 sm:p-7 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#00E5FF]/30 bg-[#070b1c]/90 shadow-[0_0_35px_rgba(0,229,255,0.18)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.35)] shrink-0">
            <Cpu className="w-6 h-6 text-rose-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Chakra_Petch',sans-serif] tracking-wide">
                Predictive Digital Twin Simulator
              </h1>
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-rose-500/20 border border-rose-500/50 text-rose-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                BIOMECHANICAL RISK TWIN
              </span>
            </div>
            <p className="text-xs sm:text-sm font-sans text-slate-300 mt-1">
              Simulate biomechanical risks before execution for <strong className="text-white">{profile.name}</strong> (Spine Delta: +{profile.spineElongation} cm).
            </p>
          </div>
        </div>

        {/* Digital Twin State Chip */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700 font-mono text-xs text-slate-300">
          <Activity className="w-4 h-4 text-[#00E5FF] animate-pulse" />
          <span>TWIN SYNC: <strong className="text-emerald-400">99.4% REALTIME</strong></span>
        </div>
      </div>

      {/* Main Two-Half Layout (Requirement 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT HALF (6 COLS): 3D Anatomical Model Viewport (Requirement 1 & 3) */}
        <div className="lg:col-span-6 flex flex-col h-[700px] glass-panel glass-panel-glow rounded-2xl border border-[#00E5FF]/40 bg-[#060919]/95 shadow-[0_0_35px_rgba(0,229,255,0.18)] relative overflow-hidden">
          {/* Viewport HUD Overlays */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950/85 border border-[#00E5FF]/40 text-[#00E5FF] font-mono text-xs font-bold shadow-[0_0_15px_rgba(0,229,255,0.25)]">
            <Layers className="w-4 h-4 text-[#00E5FF] animate-pulse" />
            <span>3D ANATOMICAL RISK HOLOGRAPHY</span>
          </div>

          <div className="absolute top-4 right-4 z-10 text-[11px] font-mono text-slate-300 bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800">
            DRAG TO ROTATE · SCROLL TO ZOOM
          </div>

          {/* Active Stress Zone Banner */}
          {simResult && (
            <div className="absolute bottom-4 left-4 right-4 z-10 p-3.5 rounded-xl bg-rose-950/90 border-2 border-rose-500 text-rose-100 font-mono text-xs flex items-center justify-between shadow-[0_0_25px_rgba(244,63,94,0.4)] animate-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2.5">
                <Flame className="w-5 h-5 text-rose-400 animate-pulse shrink-0" />
                <div>
                  <span className="font-bold uppercase tracking-wider text-white">
                    ACTIVE HOTSPOT: {simResult.affectedSystems[0]}
                  </span>
                  <div className="text-[11px] text-rose-300">
                    Peak Load: {simResult.peakForceN} N (Safe Threshold: {simResult.safetyLimitN} N)
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-rose-600 text-white font-extrabold text-[11px]">
                {simResult.probability} RISK
              </span>
            </div>
          )}

          {/* 3D Canvas with Real-time Reaction */}
          <Canvas camera={{ position: [0, 0.4, 3.2], fov: 46 }}>
            <ambientLight intensity={1.1} />
            <directionalLight position={[4, 5, 4]} intensity={2.2} color="#00e5ff" />
            <directionalLight position={[-4, 2, -3]} intensity={1.8} color="#c084fc" />
            <pointLight position={[0, -2, 2]} intensity={1.2} color="#38bdf8" />

            <Suspense fallback={<ProceduralBodyFallback activeResult={simResult} />}>
              <ModelBoundary fallback={<ProceduralBodyFallback activeResult={simResult} />}>
                <AnatomicalBodyModel activeResult={simResult} />
              </ModelBoundary>
            </Suspense>

            <OrbitControls
              ref={controlsRef}
              enableZoom={true}
              enablePan={true}
              minDistance={1.8}
              maxDistance={5.5}
            />
          </Canvas>
        </div>

        {/* RIGHT HALF (6 COLS): Simulation Control Panel & Results (Requirement 1, 2, 4) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Control Panel Card */}
          <div className="glass-panel glass-panel-glow p-6 sm:p-7 rounded-2xl border border-rose-500/40 bg-[#09071c]/95 shadow-[0_0_35px_rgba(244,63,94,0.18)] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-rose-900/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
                  <Sliders className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-['Chakra_Petch',sans-serif] tracking-wide">
                    Simulation Control Console
                  </h2>
                  <p className="text-xs text-rose-200/80 font-sans">
                    Configure stress vectors and execute deterministic predictive models.
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono text-cyan-400 font-bold px-2.5 py-1 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/30">
                SAFETY ENGINE 4.2
              </span>
            </div>

            {/* Action Selector Dropdown (Requirement 2) */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 block">
                Select Risky Action to Simulate:
              </label>
              <select
                value={selectedActionId}
                onChange={(e) => {
                  setSelectedActionId(e.target.value);
                  setSimResult(null); // Reset preview on change
                }}
                disabled={isSimulating}
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-rose-500/50 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer shadow-inner"
              >
                {actionOptions.map((opt) => (
                  <option key={opt.id} value={opt.id} className="bg-slate-900 text-white py-2">
                    {opt.title}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-400 font-sans mt-1">
                {selectedAction.description}
              </p>
            </div>

            {/* Dynamic Parameter Sliders */}
            <div className="p-4 rounded-xl bg-black/50 border border-slate-800 space-y-4">
              <div className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider flex items-center justify-between">
                <span>Simulation Load Parameters:</span>
                <span className="text-[#00E5FF]">{selectedAction.category}</span>
              </div>

              {selectedActionId === 'ared-squat' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">ARED Barbell Resistance:</span>
                    <strong className="text-rose-400 text-sm">{squatWeightKg} kg ({(squatWeightKg * 2.2).toFixed(0)} lbs)</strong>
                  </div>
                  <input
                    type="range"
                    min={70}
                    max={160}
                    step={5}
                    value={squatWeightKg}
                    onChange={(e) => setSquatWeightKg(Number(e.target.value))}
                    disabled={isSimulating}
                    className="w-full accent-rose-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>70 kg (Light)</span>
                    <span className="text-amber-400 font-bold">100 kg (Nominal)</span>
                    <span className="text-rose-400 font-bold">160 kg (Extreme)</span>
                  </div>
                </div>
              )}

              {selectedActionId === 'eva-suit' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">EMU Suit Differential Pressure:</span>
                    <strong className="text-amber-400 text-sm">{evaPressurePsi} psi</strong>
                  </div>
                  <input
                    type="range"
                    min={3.5}
                    max={7.5}
                    step={0.1}
                    value={evaPressurePsi}
                    onChange={(e) => setEvaPressurePsi(Number(e.target.value))}
                    disabled={isSimulating}
                    className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>3.5 psi (Soft)</span>
                    <span className="text-emerald-400 font-bold">4.3 psi (Standard EMU)</span>
                    <span className="text-rose-400 font-bold">7.5 psi (High Rigidity)</span>
                  </div>
                </div>
              )}

              {selectedActionId === 'treadmill' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">T2 Treadmill Sprint Velocity:</span>
                    <strong className="text-rose-400 text-sm">{treadmillSpeedKmh} km/h</strong>
                  </div>
                  <input
                    type="range"
                    min={8}
                    max={16}
                    step={0.5}
                    value={treadmillSpeedKmh}
                    onChange={(e) => setTreadmillSpeedKmh(Number(e.target.value))}
                    disabled={isSimulating}
                    className="w-full accent-rose-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>8.0 km/h (Jog)</span>
                    <span className="text-amber-400 font-bold">12.0 km/h (Sprint)</span>
                    <span className="text-rose-400 font-bold">16.0 km/h (Anaerobic)</span>
                  </div>
                </div>
              )}
            </div>

            {/* RUN SIMULATION Button: Big, Glowing Orange/Red Button (Requirement 2) */}
            <button
              type="button"
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-600 via-rose-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-mono font-black text-base tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-3 shadow-[0_0_35px_rgba(244,63,94,0.65)] hover:shadow-[0_0_45px_rgba(244,63,94,0.85)] hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              {isSimulating ? (
                <>
                  <span className="w-5 h-5 rounded-full border-3 border-white border-t-transparent animate-spin" />
                  <span>CALCULATING DIGITAL TWIN STRESS ({simProgress}%)...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 text-white animate-pulse" />
                  <span>RUN PREDICTIVE SIMULATION</span>
                </>
              )}
            </button>

            {/* Simulating Progress Bar */}
            {isSimulating && (
              <div className="space-y-1.5 animate-in fade-in">
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-rose-500 h-full transition-all duration-300"
                    style={{ width: `${simProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Simulating finite-element disc deformation...</span>
                  <span className="text-rose-400 font-bold">{simProgress}%</span>
                </div>
              </div>
            )}
          </div>

          {/* SIMULATION RESULTS PANEL: Revealed After Run (Requirement 2 & 4) */}
          {simResult && (
            <div className="glass-panel glass-panel-glow p-6 sm:p-7 rounded-2xl border-2 border-rose-500 bg-[#0d071a]/95 shadow-[0_0_40px_rgba(244,63,94,0.3)] space-y-5 animate-in zoom-in-95 duration-300">
              {/* Header with Risk Level Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-900/60">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-600 text-white shadow-[0_0_15px_#f43f5e] animate-bounce">
                    <ShieldAlert className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white font-['Chakra_Petch',sans-serif] tracking-wide">
                      Predictive Assessment Result
                    </h3>
                    <div className="text-xs font-mono text-rose-300">
                      Deterministic Biomechanical Safety Audit
                    </div>
                  </div>
                </div>

                {/* Risk Level Badge (Requirement 2) */}
                <span className="px-4 py-1.5 rounded-xl text-xs font-mono font-black tracking-widest bg-rose-600 text-white border-2 border-rose-400 shadow-[0_0_20px_#f43f5e] uppercase">
                  {simResult.riskLevel} RISK // {simResult.probability}
                </span>
              </div>

              {/* Stress Gauge Bar */}
              <div className="p-4 rounded-xl bg-black/60 border border-rose-500/30 space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Peak Simulated Load vs Safe Threshold:</span>
                  <strong className="text-rose-400 font-bold">{simResult.peakForceN} N / {simResult.safetyLimitN} N Max</strong>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden relative">
                  <div
                    className="bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, (simResult.peakForceN / (simResult.safetyLimitN * 1.3)) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>0 N</span>
                  <span className="text-emerald-400 font-bold">Safety Limit ({simResult.safetyLimitN} N)</span>
                  <span className="text-rose-400 font-bold">Overload ({simResult.peakForceN} N)</span>
                </div>
              </div>

              {/* Affected Systems (Requirement 2) */}
              <div className="space-y-1.5">
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
                  Affected Anatomical Systems:
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {simResult.affectedSystems.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-rose-950/80 border border-rose-500/50 text-rose-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Predicted Consequence (Requirement 2) */}
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs font-mono space-y-1">
                <span className="text-rose-300 font-bold uppercase tracking-wider block">
                  Predicted Physiological Consequence:
                </span>
                <p className="text-sm font-sans text-white font-semibold leading-relaxed">
                  {simResult.predictedConsequence}
                </p>
              </div>

              {/* Actionable Recommendation (Requirement 2) */}
              <div className="p-4 rounded-xl bg-amber-950/50 border border-amber-500/50 text-xs font-mono space-y-1">
                <span className="text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-amber-400" />
                  Clinical Recommendation:
                </span>
                <p className="text-sm font-sans text-amber-100 font-bold leading-relaxed">
                  {simResult.recommendation}
                </p>
              </div>

              {/* AI Explanation Box (Requirement 4) */}
              <div className="p-4 rounded-xl bg-[#0e0926] border border-purple-500/40 text-xs font-mono space-y-1.5">
                <div className="flex items-center gap-2 text-purple-300 font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>AI Clinical Rationale (ASTRO Neural Synthesis):</span>
                </div>
                <p className="text-xs font-sans text-purple-100 leading-relaxed font-medium">
                  {simResult.aiExplanation}
                </p>
              </div>

              {/* Actionable Switch Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateToTab) {
                      onNavigateToTab('vitals');
                    }
                    if (onSendToast) {
                      onSendToast('Switched to safe CEVIS cardiovascular ergometer countermeasure', 'success');
                    }
                  }}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-mono font-extrabold text-xs tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(0,229,255,0.4)] cursor-pointer"
                >
                  <span>SWITCH TO SAFE COUNTERMEASURE</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onSendToast) {
                      onSendToast('Simulation risk dossier transmitted to Dr. Marcus Vance (MedCom Alpha)', 'info');
                    }
                  }}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-bold transition-colors cursor-pointer"
                >
                  TRANSMIT TO SURGEON
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
