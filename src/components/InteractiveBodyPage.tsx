import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Trash2, 
  Plus, 
  Flame, 
  ShieldAlert, 
  RotateCcw, 
  Layers, 
  Info,
  Sparkles,
  Sliders,
  Check
} from 'lucide-react';
import { SymptomReport, AstronautProfile } from '../types/astronaut.ts';

const BODY_MODEL_URL = '/models/body_superficial.app5m.glb';

// Preload the body model from local static storage
try {
  useGLTF.preload(BODY_MODEL_URL);
} catch {
  // Preload safety catch
}

// React Error Boundary for 3D body mesh loading
class ModelErrorBoundary extends React.Component<
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
  componentDidCatch(err: any) {
    console.warn('3D body model failed to render, switching to procedural anatomical fallback:', err?.message);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Map 3D coordinate heights or mesh names to anatomical clinical space labels
function mapMeshToBodyPart(point: THREE.Vector3, meshName: string): string {
  const y = point.y;
  const x = point.x;
  const z = point.z;

  // Height-based anatomical zones (normalized around standard body height in Three.js)
  if (y > 1.35) {
    return 'Cranial / Sinus (Cephalic Fluid Shift Area)';
  } else if (y > 1.15) {
    return 'Cervical Spine & Trapezius';
  } else if (y > 0.75) {
    if (Math.abs(x) > 0.35) {
      return x > 0 ? 'Right Shoulder / Deltoid' : 'Left Shoulder / Deltoid';
    }
    return z > 0 ? 'Thoracic Chest / Sternum' : 'Thoracic Spine (Intervertebral Decompression)';
  } else if (y > 0.35) {
    if (Math.abs(x) > 0.4) {
      return x > 0 ? 'Right Forearm / Wrist' : 'Left Forearm / Wrist';
    }
    return z > 0 ? 'Abdominal Wall' : 'Lumbar Spine (L1-L5 Microgravity Delta)';
  } else if (y > -0.15) {
    return 'Pelvic / Sacral Region';
  } else if (y > -0.85) {
    return x > 0 ? 'Right Femoral / Quadriceps' : 'Left Femoral / Quadriceps';
  } else {
    return x > 0 ? 'Right Tibia / Lower Ankle' : 'Left Tibia / Lower Ankle';
  }
}

export interface AnatomicalZone {
  id: string;
  label: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  type: 'box' | 'cylinder' | 'sphere';
  args: any[];
}

export const ANATOMICAL_ZONES: AnatomicalZone[] = [
  {
    id: 'cranial',
    label: 'Cranial / Sinus (Cephalic Fluid Shift Area)',
    position: [0, 1.48, 0.02],
    type: 'sphere',
    args: [0.24, 16, 16],
  },
  {
    id: 'cervical',
    label: 'Cervical Spine & Neck',
    position: [0, 1.18, 0],
    type: 'cylinder',
    args: [0.12, 0.13, 0.16, 16],
  },
  {
    id: 'chest',
    label: 'Thoracic Chest & Sternum',
    position: [0, 0.88, 0.08],
    type: 'box',
    args: [0.42, 0.35, 0.22],
  },
  {
    id: 'spine',
    label: 'Lumbar Spine (L1-L5 Microgravity Delta)',
    position: [0, 0.58, -0.09],
    type: 'box',
    args: [0.22, 0.52, 0.16],
  },
  {
    id: 'abdomen',
    label: 'Abdominal Wall',
    position: [0, 0.54, 0.08],
    type: 'box',
    args: [0.38, 0.32, 0.2],
  },
  {
    id: 'pelvis',
    label: 'Pelvic / Sacral Region',
    position: [0, 0.18, 0],
    type: 'box',
    args: [0.42, 0.28, 0.24],
  },
  {
    id: 'left_shoulder',
    label: 'Left Shoulder & Deltoid',
    position: [-0.42, 0.82, 0],
    rotation: [0, 0, -0.15],
    type: 'cylinder',
    args: [0.1, 0.09, 0.38, 16],
  },
  {
    id: 'right_shoulder',
    label: 'Right Shoulder & Deltoid',
    position: [0.42, 0.82, 0],
    rotation: [0, 0, 0.15],
    type: 'cylinder',
    args: [0.1, 0.09, 0.38, 16],
  },
  {
    id: 'left_forearm',
    label: 'Left Forearm & Wrist',
    position: [-0.48, 0.36, 0],
    type: 'cylinder',
    args: [0.08, 0.07, 0.44, 16],
  },
  {
    id: 'right_forearm',
    label: 'Right Forearm & Wrist',
    position: [0.48, 0.36, 0],
    type: 'cylinder',
    args: [0.08, 0.07, 0.44, 16],
  },
  {
    id: 'left_thigh',
    label: 'Left Femoral / Quadriceps',
    position: [-0.18, -0.32, 0],
    type: 'cylinder',
    args: [0.14, 0.11, 0.65, 16],
  },
  {
    id: 'right_thigh',
    label: 'Right Femoral / Quadriceps',
    position: [0.18, -0.32, 0],
    type: 'cylinder',
    args: [0.14, 0.11, 0.65, 16],
  },
  {
    id: 'left_shin',
    label: 'Left Tibia / Calves & Ankle',
    position: [-0.20, -1.02, 0],
    type: 'cylinder',
    args: [0.1, 0.08, 0.7, 16],
  },
  {
    id: 'right_shin',
    label: 'Right Tibia / Calves & Ankle',
    position: [0.20, -1.02, 0],
    type: 'cylinder',
    args: [0.1, 0.08, 0.7, 16],
  },
];

interface BodyModelProps {
  selectedMeshId: string | null;
  onSelectRegion: (bodyPart: string, meshId: string, point: THREE.Vector3) => void;
  hoveredPart: string | null;
  setHoveredPart: (part: string | null) => void;
  hoveredZoneId: string | null;
  setHoveredZoneId: (id: string | null) => void;
  selectedZoneId: string | null;
  setSelectedZoneId: (id: string | null) => void;
}

function BodyModel({
  selectedMeshId,
  onSelectRegion,
  hoveredPart,
  setHoveredPart,
  hoveredZoneId,
  setHoveredZoneId,
  selectedZoneId,
  setSelectedZoneId,
}: BodyModelProps) {
  const gltf = useGLTF(BODY_MODEL_URL);
  const modelRef = useRef<THREE.Group | null>(null);

  // Holographic cybernetic baseline material for the underlying anatomical mesh
  const clonedScene = React.useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshStandardMaterial({
          color: '#00e5ff',
          roughness: 0.2,
          metalness: 0.8,
          wireframe: false,
          transparent: true,
          opacity: 0.65,
          emissive: '#002b40',
          emissiveIntensity: 0.4,
        });
      }
    });
    return clone;
  }, [gltf.scene]);

  // Subtle breathing animation for body
  useFrame((state) => {
    if (modelRef.current) {
      const t = state.clock.getElapsedTime();
      modelRef.current.position.y = -0.65 + Math.sin(t * 1.2) * 0.015;
    }
  });

  return (
    <group ref={modelRef} position={[0, -0.65, 0]} scale={1.35}>
      {/* 1. Underlying High-Tech Translucent Holographic Anatomical Body */}
      <primitive object={clonedScene} />

      {/* 2. Discrete Anatomical Hitboxes with Independent Hover (Orange) and Click (Red) States */}
      {ANATOMICAL_ZONES.map((zone) => {
        const isSelected = selectedZoneId === zone.id || selectedMeshId === zone.id;
        const isHovered = hoveredZoneId === zone.id;

        // Color logic: Selected -> Glowing Crimson Red (#ef4444); Hovered -> Glowing Orange (#ff8c00); Idle -> Transparent Hitbox
        let color = '#00e5ff';
        let emissive = '#000000';
        let emissiveIntensity = 0;
        let opacity = 0.02; // Very subtle so invisible until hovered/clicked
        let wireframe = false;

        if (isSelected) {
          color = '#ef4444';
          emissive = '#dc2626';
          emissiveIntensity = 1.0;
          opacity = 0.75;
        } else if (isHovered) {
          color = '#ff8c00';
          emissive = '#ea580c';
          emissiveIntensity = 0.85;
          opacity = 0.65;
        }

        return (
          <group
            key={zone.id}
            position={zone.position}
            rotation={zone.rotation ? zone.rotation : [0, 0, 0]}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedZoneId(zone.id);
              onSelectRegion(zone.label, zone.id, new THREE.Vector3(...zone.position));
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredZoneId(zone.id);
              setHoveredPart(zone.label);
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setHoveredZoneId(null);
              setHoveredPart(null);
            }}
          >
            <mesh>
              {zone.type === 'sphere' && <sphereGeometry args={zone.args as any} />}
              {zone.type === 'cylinder' && <cylinderGeometry args={zone.args as any} />}
              {zone.type === 'box' && <boxGeometry args={zone.args as any} />}
              <meshStandardMaterial
                color={color}
                emissive={emissive}
                emissiveIntensity={emissiveIntensity}
                transparent={true}
                opacity={opacity}
                roughness={0.2}
                metalness={0.7}
                wireframe={wireframe}
                depthWrite={isSelected || isHovered}
              />
            </mesh>

            {/* Glowing Reticle Target Ring on Selected Zone */}
            {isSelected && (
              <mesh position={[0, 0, 0]}>
                <ringGeometry args={[0.26, 0.30, 32]} />
                <meshBasicMaterial color="#ef4444" transparent opacity={0.9} side={THREE.DoubleSide} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

// Procedural anatomical human fallback
function ProceduralBodyFallback({
  onSelectRegion,
  selectedZoneId,
  setSelectedZoneId,
  setHoveredPart,
}: {
  onSelectRegion: (p: string, id: string, pt: THREE.Vector3) => void;
  selectedZoneId: string | null;
  setSelectedZoneId: (id: string) => void;
  setHoveredPart: (p: string | null) => void;
}) {
  return (
    <group position={[0, -0.5, 0]}>
      {ANATOMICAL_ZONES.map((zone) => {
        const isSelected = selectedZoneId === zone.id;
        return (
          <mesh
            key={zone.id}
            position={zone.position}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedZoneId(zone.id);
              onSelectRegion(zone.label, zone.id, new THREE.Vector3(...zone.position));
            }}
            onPointerOver={() => setHoveredPart(zone.label)}
            onPointerOut={() => setHoveredPart(null)}
          >
            {zone.type === 'sphere' && <sphereGeometry args={zone.args as any} />}
            {zone.type === 'cylinder' && <cylinderGeometry args={zone.args as any} />}
            {zone.type === 'box' && <boxGeometry args={zone.args as any} />}
            <meshStandardMaterial
              color={isSelected ? '#ef4444' : '#00e5ff'}
              emissive={isSelected ? '#dc2626' : '#00364d'}
              emissiveIntensity={isSelected ? 1.0 : 0.3}
              wireframe
            />
          </mesh>
        );
      })}
    </group>
  );
}

interface InteractiveBodyPageProps {
  profile: AstronautProfile;
}

export const InteractiveBodyPage: React.FC<InteractiveBodyPageProps> = ({ profile }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('Lumbar Spine (L1-L5 Microgravity Delta)');
  const [selectedMeshId, setSelectedMeshId] = useState<string | null>('spine');
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>('spine');
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);

  // Form State
  const [painType, setPainType] = useState<'Sharp' | 'Dull' | 'Burning'>('Dull');
  const [intensity, setIntensity] = useState<number>(4);
  const [notes, setNotes] = useState<string>('Microgravity intervertebral disc expansion ache following cycle ergometer exercise.');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showLoggedAlert, setShowLoggedAlert] = useState<boolean>(false);

  // Symptom List
  const [symptoms, setSymptoms] = useState<SymptomReport[]>([]);
  const [isLoadingSymptoms, setIsLoadingSymptoms] = useState<boolean>(true);

  const fetchSymptoms = async () => {
    setIsLoadingSymptoms(true);
    try {
      const res = await fetch('/api/symptoms');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setSymptoms(json.data);
        }
      }
    } catch (e) {
      console.warn('Failed to load symptoms:', e);
    } finally {
      setIsLoadingSymptoms(false);
    }
  };

  useEffect(() => {
    fetchSymptoms();
  }, []);

  const handleSelectRegion = (part: string, meshId: string, _point: THREE.Vector3) => {
    setSelectedRegion(part);
    setSelectedMeshId(meshId);
    setSelectedZoneId(meshId);
  };

  const handleQuickSelect = (zoneId: string, part: string, defaultType: 'Sharp' | 'Dull' | 'Burning', defaultIntensity: number, defaultNotes: string) => {
    setSelectedRegion(part);
    setSelectedMeshId(zoneId);
    setSelectedZoneId(zoneId);
    setPainType(defaultType);
    setIntensity(defaultIntensity);
    setNotes(defaultNotes);
  };

  const handleLogSymptom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRegion) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bodyPart: selectedRegion,
          meshId: selectedMeshId || 'Manual_Raycast',
          painType,
          intensity,
          notes,
          status: 'active',
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setSymptoms((prev) => [json.data, ...prev]);
          setShowLoggedAlert(true);
          setTimeout(() => setShowLoggedAlert(false), 4000);
        }
      }
    } catch (err) {
      console.error('Error logging symptom:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSymptom = async (id: string) => {
    try {
      const res = await fetch(`/api/symptoms/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSymptoms((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete symptom:', err);
    }
  };

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="glass-panel glass-panel-glow-cyan p-6 sm:p-7 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#00E5FF]/40 shadow-[0_0_35px_rgba(0,229,255,0.22)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/50 flex items-center justify-center text-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.35)] shrink-0">
            <Activity className="w-7 h-7 text-[#00E5FF]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Chakra_Petch',sans-serif] tracking-wide">
                Interactive 3D Anatomical Body Map
              </h1>
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#00E5FF]/20 border border-[#00E5FF]/50 text-[#00E5FF]">
                RAYCASTING SENSOR ACTIVE
              </span>
            </div>
            <p className="text-sm font-sans text-slate-300 mt-1">
              Rotate, zoom, and click any anatomical zone to map physiological symptoms, spinal expansion, or cephalic shifts for <strong className="text-white">{profile.name}</strong>.
            </p>
          </div>
        </div>

        {/* Quick Spaceflight Zone Shortcut Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleQuickSelect('spine', 'Lumbar Spine (L1-L5 Microgravity Delta)', 'Dull', 4, 'Microgravity spinal elongation (+4.2cm) intervertebral decompression ache.')}
            className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(255,140,0,0.2)] cursor-pointer ${
              selectedZoneId === 'spine' ? 'bg-[#FF8C00] text-black border-[#FF8C00]' : 'bg-[#FF8C00]/20 hover:bg-[#FF8C00]/30 border-[#FF8C00]/60 text-[#FFB347]'
            }`}
          >
            Spine (+4.2cm)
          </button>
          <button
            onClick={() => handleQuickSelect('cranial', 'Cranial / Sinus (Cephalic Fluid Shift Area)', 'Dull', 3, 'Cephalic fluid shift post-sleep fullness.')}
            className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,229,255,0.2)] cursor-pointer ${
              selectedZoneId === 'cranial' ? 'bg-[#00E5FF] text-black border-[#00E5FF]' : 'bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 border-[#00E5FF]/60 text-[#00E5FF]'
            }`}
          >
            Cephalic Fluid Shift
          </button>
          <button
            onClick={() => handleQuickSelect('right_thigh', 'Right Femoral / Quadriceps', 'Burning', 5, 'Post-ARED squat protocol lactic accumulation.')}
            className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(244,63,94,0.2)] cursor-pointer ${
              selectedZoneId === 'right_thigh' ? 'bg-rose-500 text-white border-rose-500' : 'bg-rose-500/20 hover:bg-rose-500/30 border-rose-500/60 text-rose-300'
            }`}
          >
            Quadriceps Fatigue
          </button>
        </div>
      </div>

      {/* Main Content: Left 3D Viewport & Right Symptom Logging Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Left Column (7 cols): 3D Anatomical Body Viewport */}
        <div className="lg:col-span-7 glass-panel glass-panel-glow-cyan rounded-2xl border border-[#00E5FF]/35 shadow-[0_0_35px_rgba(0,229,255,0.18)] p-4 flex flex-col justify-between h-[640px] relative overflow-hidden bg-[#060b1c]/90">
          {/* Viewport Top HUD Overlay */}
          <div className="relative z-10 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-[#00E5FF]/40 text-[#00E5FF] font-mono text-xs font-bold pointer-events-auto shadow-[0_0_15px_rgba(0,229,255,0.2)]">
              <Sparkles className="w-4 h-4 text-[#00E5FF] animate-pulse" />
              <span>HOLOGRAPHIC ANATOMICAL SCAN</span>
            </div>

            {hoveredPart && (
              <div className="px-3.5 py-1.5 rounded-xl bg-[#FF8C00]/25 border border-[#FF8C00]/70 text-white font-mono text-xs font-bold animate-in fade-in shadow-[0_0_18px_rgba(255,140,0,0.35)]">
                HOVER: <span className="text-[#FFB347]">{hoveredPart}</span>
              </div>
            )}
          </div>

          {/* 3D Canvas Container */}
          <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
            <Canvas camera={{ position: [0, 0, 3.6], fov: 42 }}>
              <ambientLight intensity={1.2} />
              <directionalLight position={[4, 5, 4]} intensity={2.0} color="#e0f2fe" />
              <directionalLight position={[-4, 2, -3]} intensity={1.5} color="#00e5ff" />
              <pointLight position={[0, -2, 2]} intensity={1.2} color="#00e5ff" />

              <Suspense
                fallback={
                  <ProceduralBodyFallback
                    onSelectRegion={handleSelectRegion}
                    selectedZoneId={selectedZoneId}
                    setSelectedZoneId={setSelectedZoneId}
                    setHoveredPart={setHoveredPart}
                  />
                }
              >
                <ModelErrorBoundary
                  fallback={
                    <ProceduralBodyFallback
                      onSelectRegion={handleSelectRegion}
                      selectedZoneId={selectedZoneId}
                      setSelectedZoneId={setSelectedZoneId}
                      setHoveredPart={setHoveredPart}
                    />
                  }
                >
                  <BodyModel
                    selectedMeshId={selectedMeshId}
                    onSelectRegion={handleSelectRegion}
                    hoveredPart={hoveredPart}
                    setHoveredPart={setHoveredPart}
                    hoveredZoneId={hoveredZoneId}
                    setHoveredZoneId={setHoveredZoneId}
                    selectedZoneId={selectedZoneId}
                    setSelectedZoneId={setSelectedZoneId}
                  />
                </ModelErrorBoundary>
              </Suspense>

              <OrbitControls
                enableZoom={true}
                enablePan={true}
                minDistance={1.8}
                maxDistance={5.5}
                maxPolarAngle={Math.PI / 1.6}
                minPolarAngle={Math.PI / 4}
              />
            </Canvas>
          </div>

          {/* Bottom Viewport Instructions */}
          <div className="relative z-10 flex flex-wrap items-center justify-between text-xs font-mono text-slate-300 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
              <span>CLICK TO HIGHLIGHT ANATOMICAL REGION (RED)</span>
            </div>
            <span className="text-slate-400">
              ORBIT: Left-Click · PAN: Right-Click · ZOOM: Scroll
            </span>
          </div>
        </div>

        {/* Right Column (5 cols): Selected Region & Symptom Logging Form */}
        <div className="lg:col-span-5 space-y-6">
          {/* Panel 1: Symptom Form */}
          <div className="glass-panel glass-panel-glow-orange p-6 sm:p-7 rounded-2xl border border-[#FF8C00]/40 shadow-[0_0_35px_rgba(255,140,0,0.2)] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#FF8C00]/20 text-[#FF8C00] border border-[#FF8C00]/40">
                  <Flame className="w-5 h-5 text-[#FF8C00]" />
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                    SELECTED REGION
                  </div>
                  <h3 className="text-xl font-black text-white font-['Chakra_Petch',sans-serif] glow-text-orange tracking-wide">
                    {selectedRegion}
                  </h3>
                </div>
              </div>
            </div>

            <form onSubmit={handleLogSymptom} className="space-y-4">
              {/* 1. Pain Type Selection (Sharp, Dull, Burning) */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-200 mb-2">
                  1. What is the pain type?
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['Sharp', 'Dull', 'Burning'] as const).map((type) => {
                    const isSelected = painType === type;
                    return (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setPainType(type)}
                        className={`py-2.5 px-3 rounded-xl font-mono text-xs sm:text-sm font-bold border transition-all ${
                          isSelected
                            ? 'bg-[#FF8C00] text-black border-[#FF8C00] shadow-[0_0_18px_rgba(255,140,0,0.5)]'
                            : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Pain Intensity Slider (0-10) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                    2. Pain Intensity (0 - 10)
                  </label>
                  <span className={`text-base font-black font-mono px-2.5 py-0.5 rounded ${
                    intensity > 6 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50' : 'bg-[#FF8C00]/20 text-[#FF8C00] border border-[#FF8C00]/50'
                  }`}>
                    {intensity} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={intensity}
                  onChange={(e) => setIntensity(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#FF8C00]"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                  <span>0 (No Pain)</span>
                  <span>5 (Moderate)</span>
                  <span>10 (Severe / Incapacitating)</span>
                </div>
              </div>

              {/* 3. Notes Text Area */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-200 mb-2">
                  3. Notes & Context
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe sensation, relation to EVA/ARED exercise, or cephalic shift..."
                  className="w-full bg-slate-900/90 text-white placeholder-slate-500 border border-slate-700 focus:border-[#FF8C00] rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF8C00] font-sans"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-black font-mono font-extrabold text-sm tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_rgba(255,140,0,0.4)] disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>{isSubmitting ? 'LOGGING SYMPTOM...' : 'LOG SYMPTOM TO TELEMETRY'}</span>
              </button>
            </form>

            {/* Confirmation Banner */}
            {showLoggedAlert && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-mono text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Symptom report successfully logged to Flight Telemetry Registry!</span>
              </div>
            )}
          </div>

          {/* Panel 2: Logged Symptoms List */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-200 font-bold flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#00E5FF]" />
                <span>ACTIVE CLINICAL REPORTS ({symptoms.length})</span>
              </div>
              <span className="text-[11px] font-mono text-[#00E5FF]">JSC TELEMEDICINE SYNCED</span>
            </div>

            {isLoadingSymptoms ? (
              <div className="py-6 text-center text-xs font-mono text-slate-400">Loading symptoms...</div>
            ) : symptoms.length === 0 ? (
              <div className="py-6 text-center text-xs font-mono text-slate-400">
                No active symptoms logged. Click on the 3D body to add one.
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {symptoms.map((sym) => (
                  <div
                    key={sym.id}
                    className="p-3.5 rounded-xl bg-[#091128] border border-slate-700/80 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white font-['Chakra_Petch',sans-serif] text-sm">
                          {sym.bodyPart}
                        </span>
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-[#FF8C00]/20 text-[#FF8C00] border border-[#FF8C00]/40">
                          {sym.painType} ({sym.intensity}/10)
                        </span>
                      </div>
                      <p className="text-slate-300 font-sans line-clamp-2">{sym.notes}</p>
                      <div className="text-[10px] font-mono text-slate-400">
                        {new Date(sym.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {sym.id}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteSymptom(sym.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition-colors"
                      title="Resolve or remove symptom report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
