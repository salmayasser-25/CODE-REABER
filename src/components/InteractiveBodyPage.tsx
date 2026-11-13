import React, { useState, useEffect, useRef, Suspense, useMemo, useCallback } from 'react';
import { Canvas, useThree, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
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
  Check,
  Search,
  Eye,
  Crosshair,
  ChevronRight
} from 'lucide-react';
import { SymptomReport, AstronautProfile } from '../types/astronaut.ts';

const ECORCHE_MODEL_URL = '/models/ecorche-main/model/ecorche.meshopt.glb';

// ─── Aerospace Clinical Knowledge Base ─────────────────────────────────────────
function getAerospaceClinicalInsight(name: string, layer: string, tissue: string): string {
  const n = (name || '').toLowerCase();

  // Spine & Intervertebral Discs
  if (n.includes('vertebra') || n.includes('disc') || n.includes('intervertebral') || n.includes('atlas') || n.includes('axis') || n.includes('sacrum') || n.includes('coccyx')) {
    return 'Microgravity spinal unloading induces 4–7 cm column elongation due to osmotic disc swelling. Intervertebral compression capacity drops by 38%. Axial resistance exercises (ARED Squats/Deadlifts) require gradual warm-up to avert disc herniation.';
  }

  // Paraspinal Postural Stabilizers
  if (n.includes('multifidus') || n.includes('erector') || n.includes('transversospinal') || n.includes('psoas') || n.includes('quadratus lumborum')) {
    return 'Deep postural stabilizers undergo accelerated disuse atrophy in 0G (up to 12% cross-sectional area loss within 60 days). Crew report persistent lumbar dull ache upon waking. Daily resistive band traction and isometric back extensions are mandatory.';
  }

  // Skull, Cranium & Sensory Organs
  if (tissue === 'bone' && (n.includes('skull') || n.includes('frontal') || n.includes('parietal') || n.includes('occipital') || n.includes('temporal') || n.includes('sphenoid'))) {
    return 'Cephalic fluid shift elevates central venous pressure (~2 liters cranial shift), driving intracranial hypertension. Astronauts experience facial edema, nasal congestion, and Spaceflight Associated Neuro-ocular Syndrome (SANS) risks.';
  }
  if (tissue === 'eye' || n.includes('eye') || n.includes('ocular')) {
    return 'SANS Alert: Sustained intracranial pressure induces optic disc edema, posterior globe flattening, and hyperopic refractive shift. Routine monthly ultrasound and optical coherence tomography (OCT) tracking required.';
  }

  // Shoulder Girdle & Rotator Cuff
  if (n.includes('rotator') || n.includes('supraspinatus') || n.includes('infraspinatus') || n.includes('subscapularis') || n.includes('teres')) {
    return 'Critical EVA Hazard: Extravehicular Mobility Unit (EMU) suit donut bearing resistance causes supraspinatus friction and rotator cuff impingement during translation maneuvers. Post-EVA icing and scapular stabilization protocols enforced.';
  }
  if (n.includes('deltoid') || n.includes('clavicle') || n.includes('acromion') || n.includes('scapula') || n.includes('trapezius')) {
    return 'Shoulder girdle structures endure repetitive microtrauma while manipulating 300+ kg orbital payloads and tether locks. Monitored for acromioclavicular subluxation.';
  }

  // Hands & Forearms
  if (n.includes('hand') || n.includes('wrist') || n.includes('carpal') || n.includes('phalanx') || n.includes('finger') || n.includes('flexor digitorum')) {
    return 'EVA spacesuit pressurized gloves (4.3 psi) demand continuous grip exertion, causing severe hand fatigue, nail bed delamination (onycholysis), and carpal tunnel compression.';
  }

  // Cardiovascular & Thoracic Wall
  if (n.includes('heart') || n.includes('cardiac') || n.includes('aorta') || n.includes('rib') || n.includes('sternum') || n.includes('pectoralis')) {
    return 'Cardiovascular deconditioning: Left ventricular myocardial mass decreases ~8–10% on long-duration ISS tours. Daily 2.5-hour countermeasure aerobic protocols on CEVIS bike ergometer mitigate orthostatic intolerance upon planetary re-entry.';
  }

  // Lower Limbs & Calves
  if (n.includes('soleus') || n.includes('gastrocnemius') || n.includes('tibialis') || n.includes('achilles') || n.includes('plantar')) {
    return 'Calf antigravity muscles (soleus) lose motor unit recruitment faster than any other muscle group in zero-gravity. Heel raises and vibration plate training mitigate plantar tendon stiffness and post-landing postural sway.';
  }
  if (n.includes('quadriceps') || n.includes('femur') || n.includes('hamstring') || n.includes('vastus') || n.includes('rectus femoris')) {
    return 'Proximal femoral osteopenia: Bone mineral density decreases 1.0–1.5% monthly at the femoral neck. ARED high-impact resistive loads and bisphosphonate countermeasures defend trabecular microarchitecture.';
  }

  // Default Clinical Overview
  return `Anatomical structure "${name}" [${layer || 'Musculoskeletal'}] monitored under JSC/Expedition-74 aerospace medicine telemetry. Report any pain, strain, or tactile paresthesia to Flight Surgeon console.`;
}

// ─── Camera Controller & Animated Reset ───────────────────────────────────────
function CameraController({
  focusTarget,
  shouldReset,
  onResetDone,
}: {
  focusTarget: THREE.Vector3 | null;
  shouldReset: boolean;
  onResetDone: () => void;
}) {
  const { camera, controls } = useThree();
  const defaultPos = useMemo(() => new THREE.Vector3(0, 0.05, 3.6), []);
  const defaultTarget = useMemo(() => new THREE.Vector3(0, 0.0, 0), []);

  useFrame(() => {
    if (shouldReset) {
      camera.position.lerp(defaultPos, 0.08);
      if (controls && (controls as any).target) {
        (controls as any).target.lerp(defaultTarget, 0.08);
      }
      if (camera.position.distanceTo(defaultPos) < 0.02) {
        onResetDone();
      }
    } else if (focusTarget) {
      const desiredCam = new THREE.Vector3(
        focusTarget.x + 0.35,
        focusTarget.y + 0.15,
        focusTarget.z + 0.85
      );
      camera.position.lerp(desiredCam, 0.06);
      if (controls && (controls as any).target) {
        (controls as any).target.lerp(focusTarget, 0.06);
      }
    }
  });

  return null;
}

// ─── Écorché 3D Model with Raycasting & Layer Materials ────────────────────────
interface EcorcheSceneProps {
  layerMode: 'all' | 'muscles' | 'skeleton';
  xrayOpacity: number;
  selectedMeshUuid: string | null;
  hoveredMeshUuid: string | null;
  onSelectMesh: (mesh: THREE.Mesh, point: THREE.Vector3) => void;
  onHoverMesh: (mesh: THREE.Mesh | null) => void;
}

function EcorcheScene({
  layerMode,
  xrayOpacity,
  selectedMeshUuid,
  hoveredMeshUuid,
  onSelectMesh,
  onHoverMesh,
}: EcorcheSceneProps) {
  const gltf = useLoader(
    GLTFLoader,
    ECORCHE_MODEL_URL,
    (loader) => {
      (loader as any).setMeshoptDecoder(MeshoptDecoder);
    }
  );

  // Clone scene so material changes don't mutate the cached GLTF resource
  const clonedScene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  // Update materials, layers, and highlights reactively
  useEffect(() => {
    if (!clonedScene) return;

    clonedScene.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return;
      const mesh = obj as THREE.Mesh;
      const ud = mesh.userData || {};
      const tissue = (ud.tissue || '').toLowerCase();
      const meshLayer = (ud.layer || '').toLowerCase();

      const isBone = tissue === 'bone' || tissue === 'cartilage' || tissue === 'tooth' || meshLayer.includes('skeleton');

      // Layer Filter
      if (layerMode === 'muscles' && isBone) {
        mesh.visible = false;
        return;
      }
      if (layerMode === 'skeleton' && !isBone) {
        mesh.visible = false;
        return;
      }
      mesh.visible = true;

      // Highlight States
      const isSelected = mesh.uuid === selectedMeshUuid;
      const isHovered = mesh.uuid === hoveredMeshUuid;

      let color = isBone ? '#e2d9c8' : '#be123c'; // Ivory bone vs Crimson muscle
      let emissive = '#000000';
      let emissiveIntensity = 0.0;
      let opacity = isBone ? 0.95 : xrayOpacity;

      if (isHovered) {
        color = '#FF8C00'; // Vibrant aerospace orange hover
        emissive = '#d97706';
        emissiveIntensity = 0.6;
        opacity = 1.0;
      }

      if (isSelected) {
        color = '#00E5FF'; // Cyber cyan selected highlight
        emissive = '#0891b2';
        emissiveIntensity = 0.85;
        opacity = 1.0;
      }

      mesh.material = new THREE.MeshStandardMaterial({
        color,
        emissive,
        emissiveIntensity,
        roughness: isBone ? 0.65 : 0.45,
        metalness: isBone ? 0.1 : 0.05,
        transparent: opacity < 0.98,
        opacity,
        side: THREE.DoubleSide,
        depthWrite: opacity > 0.65,
      });
    });
  }, [clonedScene, layerMode, xrayOpacity, selectedMeshUuid, hoveredMeshUuid]);

  // Raycast Click Handler
  const handleClick = useCallback(
    (e: any) => {
      e.stopPropagation();
      const hit = e.intersections?.[0];
      if (hit && (hit.object as THREE.Mesh).isMesh) {
        onSelectMesh(hit.object as THREE.Mesh, hit.point);
      }
    },
    [onSelectMesh]
  );

  // Raycast Hover Handler
  const handlePointerOver = useCallback(
    (e: any) => {
      e.stopPropagation();
      const hit = e.intersections?.[0];
      if (hit && (hit.object as THREE.Mesh).isMesh) {
        onHoverMesh(hit.object as THREE.Mesh);
        document.body.style.cursor = 'pointer';
      }
    },
    [onHoverMesh]
  );

  const handlePointerOut = useCallback(() => {
    onHoverMesh(null);
    document.body.style.cursor = 'default';
  }, [onHoverMesh]);

  return (
    <group position={[0, -0.9, 0]}>
      <primitive
        object={clonedScene}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />
    </group>
  );
}

// ─── Procedural Anatomical Fallback ───────────────────────────────────────────
function AnatomicalProceduralFallback({ onSelect }: { onSelect: (name: string) => void }) {
  const parts = [
    { name: 'Cranial / Head', pos: [0, 0.72, 0] as [number, number, number], args: [0.15, 24, 24], type: 'sphere' },
    { name: 'Cervical Spine', pos: [0, 0.54, 0] as [number, number, number], args: [0.06, 0.07, 0.14, 16], type: 'cylinder' },
    { name: 'Thorax / Chest', pos: [0, 0.28, 0] as [number, number, number], args: [0.38, 0.44, 0.24], type: 'box' },
    { name: 'Lumbar Spine (L1-L5)', pos: [0, 0.04, 0] as [number, number, number], args: [0.22, 0.24, 0.22], type: 'box' },
    { name: 'Pelvis / Sacrum', pos: [0, -0.16, 0] as [number, number, number], args: [0.36, 0.22, 0.24], type: 'box' },
    { name: 'Left Shoulder', pos: [-0.26, 0.42, 0] as [number, number, number], args: [0.08, 16, 16], type: 'sphere' },
    { name: 'Right Shoulder', pos: [0.26, 0.42, 0] as [number, number, number], args: [0.08, 16, 16], type: 'sphere' },
    { name: 'Left Arm', pos: [-0.34, 0.16, 0] as [number, number, number], args: [0.045, 0.045, 0.42, 12], type: 'cylinder' },
    { name: 'Right Arm', pos: [0.34, 0.16, 0] as [number, number, number], args: [0.045, 0.045, 0.42, 12], type: 'cylinder' },
    { name: 'Left Thigh (Femur)', pos: [-0.11, -0.44, 0] as [number, number, number], args: [0.075, 0.065, 0.46, 14], type: 'cylinder' },
    { name: 'Right Thigh (Femur)', pos: [0.11, -0.44, 0] as [number, number, number], args: [0.075, 0.065, 0.46, 14], type: 'cylinder' },
    { name: 'Left Lower Leg (Tibia)', pos: [-0.11, -0.74, 0] as [number, number, number], args: [0.05, 0.04, 0.42, 14], type: 'cylinder' },
    { name: 'Right Lower Leg (Tibia)', pos: [0.11, -0.74, 0] as [number, number, number], args: [0.05, 0.04, 0.42, 14], type: 'cylinder' },
  ];

  return (
    <group>
      {parts.map((p) => (
        <mesh
          key={p.name}
          position={p.pos}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(p.name);
          }}
        >
          {p.type === 'sphere' && <sphereGeometry args={p.args as any} />}
          {p.type === 'cylinder' && <cylinderGeometry args={p.args as any} />}
          {p.type === 'box' && <boxGeometry args={p.args as any} />}
          <meshStandardMaterial color="#00e5ff" wireframe opacity={0.6} transparent />
        </mesh>
      ))}
    </group>
  );
}

// ─── Error Boundary ───────────────────────────────────────────────────────────
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
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// ─── QUICK ANATOMICAL SELECTION REGIONS ────────────────────────────────────────
const QUICK_REGIONS = [
  { id: 'lumbar', label: 'Lumbar Spine (L1-L5)', painType: 'Dull', intensity: 5, note: 'Microgravity disc elongation and paraspinal muscle tightening.' },
  { id: 'cervical', label: 'Cervical Spine / Neck', painType: 'Stiffness', intensity: 4, note: 'Neutral body posture neck extension fatigue.' },
  { id: 'head', label: 'Cranial / SANS Sinus', painType: 'Ache', intensity: 4, note: 'Cephalic fluid shift sinus fullness and intracranial pressure.' },
  { id: 'r-shoulder', label: 'Right Shoulder Rotator Cuff', painType: 'Sharp', intensity: 6, note: 'EMU suit shoulder bearing friction during translation.' },
  { id: 'l-shoulder', label: 'Left Shoulder / Deltoid', painType: 'Ache', intensity: 3, note: 'Overhead hatch operation strain.' },
  { id: 'chest', label: 'Thoracic Sternum', painType: 'Dull', intensity: 3, note: 'Rib cage expansion under spacesuit 4.3 psi delta.' },
  { id: 'r-femur', label: 'Right Femoral Quadriceps', painType: 'Ache', intensity: 4, note: 'Post-ARED squat eccentric muscle soreness.' },
  { id: 'calves', label: 'Bilateral Soleus / Calves', painType: 'Stiffness', intensity: 5, note: 'Plantar tendon deconditioning and 0G foot-hook strain.' },
  { id: 'hands', label: 'Hands / Metacarpal Grip', painType: 'Burning', intensity: 5, note: 'Pressurized glove repetitive hand flexion fatigue.' },
  { id: 'knees', label: 'Patellar Tendon / Knees', painType: 'Sharp', intensity: 4, note: 'Cycle ergometer CEVIS pedal clip resistance strain.' },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
interface InteractiveBodyPageProps {
  profile: AstronautProfile;
}

export const InteractiveBodyPage: React.FC<InteractiveBodyPageProps> = ({ profile }) => {
  // 3D Selection State
  const [selectedRegion, setSelectedRegion] = useState<string>('Lumbar Spine (L1-L5 Microgravity Delta)');
  const [selectedMeshUuid, setSelectedMeshUuid] = useState<string | null>(null);
  const [selectedStructureMeta, setSelectedStructureMeta] = useState<{
    name: string;
    layer: string;
    tissue: string;
    insight: string;
  }>({
    name: 'Lumbar Spine (L1-L5 Microgravity Delta)',
    layer: 'Skeleton / Intervertebral',
    tissue: 'bone & cartilage',
    insight: 'Microgravity spinal unloading induces 4–7 cm column elongation due to osmotic disc swelling. Intervertebral compression capacity drops by 38%. Axial resistance exercises require gradual warm-up.',
  });

  const [hoveredMeshUuid, setHoveredMeshUuid] = useState<string | null>(null);
  const [hoveredName, setHoveredName] = useState<string | null>(null);

  // Viewport Settings
  const [layerMode, setLayerMode] = useState<'all' | 'muscles' | 'skeleton'>('all');
  const [xrayOpacity, setXrayOpacity] = useState<number>(0.85);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [focusTarget, setFocusTarget] = useState<THREE.Vector3 | null>(null);
  const [shouldResetCamera, setShouldResetCamera] = useState<boolean>(false);

  // Form State
  const [painType, setPainType] = useState<string>('Dull');
  const [intensity, setIntensity] = useState<number>(4);
  const [notes, setNotes] = useState<string>('Microgravity intervertebral disc expansion ache following cycle ergometer exercise.');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showLoggedAlert, setShowLoggedAlert] = useState<boolean>(false);

  // Active Symptoms List
  const [symptoms, setSymptoms] = useState<SymptomReport[]>([]);
  const [isLoadingSymptoms, setIsLoadingSymptoms] = useState<boolean>(true);

  // Fetch telemetry symptoms
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

  // Handle 3D Mesh Click
  const handleSelectMesh = useCallback((mesh: THREE.Mesh, point: THREE.Vector3) => {
    const ud = mesh.userData || {};
    const name = ud.name || mesh.name || 'Anatomical Structure';
    const layer = ud.layer || (ud.tissue === 'bone' ? 'skeleton' : 'muscles');
    const tissue = ud.tissue || 'musculoskeletal';

    setSelectedMeshUuid(mesh.uuid);
    setSelectedRegion(name);
    setSelectedStructureMeta({
      name,
      layer,
      tissue,
      insight: getAerospaceClinicalInsight(name, layer, tissue),
    });
    setFocusTarget(point);
  }, []);

  // Handle 3D Mesh Hover
  const handleHoverMesh = useCallback((mesh: THREE.Mesh | null) => {
    if (!mesh) {
      setHoveredMeshUuid(null);
      setHoveredName(null);
      return;
    }
    const ud = mesh.userData || {};
    const name = ud.name || mesh.name || 'Structure';
    setHoveredMeshUuid(mesh.uuid);
    setHoveredName(name);
  }, []);

  // Handle Procedural Fallback Selection
  const handleProceduralSelect = (name: string) => {
    setSelectedRegion(name);
    setSelectedStructureMeta({
      name,
      layer: 'Standard Anatomical Map',
      tissue: 'musculoskeletal',
      insight: getAerospaceClinicalInsight(name, 'musculoskeletal', 'tissue'),
    });
  };

  // Handle Quick Region Click
  const handleQuickRegionClick = (item: (typeof QUICK_REGIONS)[0]) => {
    setSelectedRegion(item.label);
    setSelectedStructureMeta({
      name: item.label,
      layer: 'Quick Access Anatomical Target',
      tissue: 'clinical group',
      insight: item.note,
    });
    setPainType(item.painType);
    setIntensity(item.intensity);
    setNotes(item.note);
  };

  // Submit Symptom Log
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
          meshId: selectedMeshUuid || 'Ecorche_Structure',
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
          setTimeout(() => setShowLoggedAlert(false), 4500);
        }
      }
    } catch (err) {
      console.error('Error logging symptom:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete / Resolve Symptom
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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── Page Header & HUD Controls ── */}
      <div className="glass-panel glass-panel-glow-cyan p-6 sm:p-7 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 border border-[#00E5FF]/40 shadow-[0_0_35px_rgba(0,229,255,0.2)]">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/50 shadow-[0_0_15px_rgba(0,229,255,0.3)]">
              <Activity className="w-6 h-6 text-[#00E5FF]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white font-['Chakra_Petch',sans-serif] tracking-wider glow-text-cyan">
                INTERACTIVE 3D BODY MAP // ÉCORCHÉ
              </h1>
              <p className="text-xs font-mono text-cyan-200/80 mt-0.5">
                FULL 634-STRUCTURE HUMAN FIGURE · CLICK ANY MUSCLE OR BONE TO REPORT SYMPTOMS
              </p>
            </div>
          </div>
        </div>

        {/* Viewport Control Strip */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Layer Selector */}
          <div className="flex items-center gap-1 bg-[#091128] p-1 rounded-xl border border-slate-700/80">
            <button
              type="button"
              onClick={() => setLayerMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                layerMode === 'all'
                  ? 'bg-[#00E5FF] text-black shadow-[0_0_12px_rgba(0,229,255,0.5)]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              ALL (634)
            </button>
            <button
              type="button"
              onClick={() => setLayerMode('muscles')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                layerMode === 'muscles'
                  ? 'bg-[#00E5FF] text-black shadow-[0_0_12px_rgba(0,229,255,0.5)]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              MUSCLES
            </button>
            <button
              type="button"
              onClick={() => setLayerMode('skeleton')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                layerMode === 'skeleton'
                  ? 'bg-[#00E5FF] text-black shadow-[0_0_12px_rgba(0,229,255,0.5)]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              SKELETON
            </button>
          </div>

          {/* Reset Camera View Button */}
          <button
            type="button"
            onClick={() => {
              setFocusTarget(null);
              setShouldResetCamera(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-mono text-xs font-bold transition-all"
            title="Reset to full body overview"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>RESET VIEW</span>
          </button>
        </div>
      </div>

      {/* ── Main Workspace Grid (7 cols Canvas + 5 cols Clinical Panel) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        
        {/* LEFT COLUMN: 3D Canvas Viewport */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative w-full h-[620px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#050918] via-[#040612] to-[#02030a] border border-[#00E5FF]/30 shadow-[0_0_40px_rgba(0,229,255,0.15)]">
            
            {/* Top Viewport Floating Badges */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-[#00E5FF]/40 text-[#00E5FF] font-mono text-xs font-bold shadow-[0_0_15px_rgba(0,229,255,0.25)]">
                <Crosshair className="w-3.5 h-3.5 text-[#00E5FF] animate-spin" />
                <span>ACTIVE ANATOMY: {hoveredName || selectedRegion}</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-slate-800 w-fit">
                LAYER: {layerMode.toUpperCase()} · X-RAY OPACITY: {(xrayOpacity * 100).toFixed(0)}%
              </div>
            </div>

            {/* Top-Right Quick Legend */}
            <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-slate-800 text-[10px] font-mono text-slate-300 pointer-events-none">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#be123c] inline-block shadow-[0_0_6px_#be123c]" />
                Muscle
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e2d9c8] inline-block shadow-[0_0_6px_#e2d9c8]" />
                Bone
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF8C00] inline-block shadow-[0_0_6px_#FF8C00]" />
                Hover
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] inline-block shadow-[0_0_6px_#00E5FF]" />
                Selected
              </span>
            </div>

            {/* Bottom-Left X-Ray Slider Bar */}
            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-slate-800 text-xs font-mono text-slate-300">
              <Sliders className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span className="text-[10px] text-slate-400 font-bold">X-RAY:</span>
              <input
                type="range"
                min={0.15}
                max={1.0}
                step={0.05}
                value={xrayOpacity}
                onChange={(e) => setXrayOpacity(parseFloat(e.target.value))}
                className="w-24 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#00E5FF]"
                title="Adjust muscle translucency to view internal skeleton"
              />
            </div>

            {/* 3D Canvas */}
            <Canvas
              camera={{ position: [0, 0.05, 3.6], fov: 34, near: 0.01, far: 50 }}
              onPointerMissed={() => {
                setHoveredName(null);
                setHoveredMeshUuid(null);
              }}
            >
              <ambientLight intensity={1.1} />
              <directionalLight position={[3, 5, 4]} intensity={2.2} color="#f8fafc" />
              <directionalLight position={[-3, 2, -3]} intensity={1.5} color="#00e5ff" />
              <pointLight position={[0, -2, 2]} intensity={1.2} color="#38bdf8" />

              <Suspense
                fallback={
                  <Html center>
                    <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-black/85 border border-[#00E5FF]/40 text-[#00E5FF] font-mono text-xs font-bold shadow-[0_0_30px_rgba(0,229,255,0.3)]">
                      <Sparkles className="w-5 h-5 text-[#00E5FF] animate-spin" />
                      <span>INITIALIZING 634-STRUCTURE ÉCORCHÉ MODEL...</span>
                    </div>
                  </Html>
                }
              >
                <ModelErrorBoundary fallback={<AnatomicalProceduralFallback onSelect={handleProceduralSelect} />}>
                  <EcorcheScene
                    layerMode={layerMode}
                    xrayOpacity={xrayOpacity}
                    selectedMeshUuid={selectedMeshUuid}
                    hoveredMeshUuid={hoveredMeshUuid}
                    onSelectMesh={handleSelectMesh}
                    onHoverMesh={handleHoverMesh}
                  />
                </ModelErrorBoundary>
              </Suspense>

              <CameraController
                focusTarget={focusTarget}
                shouldReset={shouldResetCamera}
                onResetDone={() => setShouldResetCamera(false)}
              />

              <OrbitControls
                enableZoom={true}
                enablePan={true}
                enableDamping={true}
                dampingFactor={0.08}
                minDistance={0.5}
                maxDistance={8.0}
                target={[0, 0.0, 0]}
              />
            </Canvas>
          </div>

          {/* Quick Region Selector Grid */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                Quick Anatomical Selection Shortcuts:
              </span>
              <span className="text-[10px] font-mono text-[#00E5FF]">CLICK TO AUTO-SELECT</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {QUICK_REGIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleQuickRegionClick(item)}
                  className={`p-2 rounded-xl text-left font-mono text-[11px] border transition-all ${
                    selectedRegion === item.label
                      ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.3)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-600 hover:text-white'
                  }`}
                >
                  <div className="font-bold truncate">{item.label}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">{item.painType} ({item.intensity}/10)</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Clinical Intelligence & Symptom Reporting Form */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Panel 1: Selected Anatomical Structure & Aerospace Notes */}
          <div className="glass-panel glass-panel-glow-orange p-6 rounded-2xl border border-[#FF8C00]/40 shadow-[0_0_35px_rgba(255,140,0,0.18)] space-y-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#FF8C00]/20 text-[#FF8C00] border border-[#FF8C00]/40">
                  <Flame className="w-5 h-5 text-[#FF8C00]" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    SELECTED ANATOMICAL STRUCTURE
                  </div>
                  <h2 className="text-xl font-black text-white font-['Chakra_Petch',sans-serif] glow-text-orange tracking-wide">
                    {selectedStructureMeta.name}
                  </h2>
                </div>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 capitalize shrink-0">
                {selectedStructureMeta.tissue}
              </span>
            </div>

            {/* Aerospace Medical Insight Card */}
            <div className="p-3.5 rounded-xl bg-[#080d22] border border-[#00E5FF]/30 space-y-1.5 shadow-inner">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#00E5FF]">
                <Info className="w-4 h-4 text-[#00E5FF]" />
                <span>AEROSPACE PHYSIOLOGY NOTE (JSC / FLIGHT SURGEON)</span>
              </div>
              <p className="text-xs text-slate-200 font-sans leading-relaxed">
                {selectedStructureMeta.insight}
              </p>
            </div>

            {/* Symptom Logging Form */}
            <form onSubmit={handleLogSymptom} className="space-y-4 pt-1">
              {/* 1. Pain Sensation Type */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-200 mb-2">
                  1. Discomfort Sensation:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Dull', 'Sharp', 'Burning', 'Stiffness', 'Ache', 'Spasm'].map((type) => {
                    const isSelected = painType === type;
                    return (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setPainType(type)}
                        className={`py-2 px-2.5 rounded-xl font-mono text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-[#FF8C00] text-black border-[#FF8C00] shadow-[0_0_15px_rgba(255,140,0,0.5)]'
                            : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Intensity Slider */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                    2. Discomfort Intensity (0 - 10):
                  </label>
                  <span
                    className={`text-sm font-black font-mono px-2.5 py-0.5 rounded ${
                      intensity >= 7
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
                        : intensity >= 4
                        ? 'bg-[#FF8C00]/20 text-[#FF8C00] border border-[#FF8C00]/50'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                    }`}
                  >
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
                  <span>0 (Asymptomatic)</span>
                  <span>5 (Moderate)</span>
                  <span>10 (Incapacitating)</span>
                </div>
              </div>

              {/* 3. Notes & Mission Context */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-200 mb-1.5">
                  3. Notes & Context for Telemetry:
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe relation to EVA suit donning, ARED exercise, sleep rack, or fluid shift..."
                  className="w-full bg-slate-900/90 text-white placeholder-slate-500 border border-slate-700 focus:border-[#FF8C00] rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#FF8C00] font-sans resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-black font-mono font-extrabold text-sm tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_rgba(255,140,0,0.4)] disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>{isSubmitting ? 'TRANSMITTING SYMPTOM...' : 'LOG SYMPTOM TO TELEMETRY'}</span>
              </button>
            </form>

            {/* Success Toast Banner */}
            {showLoggedAlert && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-mono text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Discomfort logged to Flight Surgeon Telemetry Console!</span>
              </div>
            )}
          </div>

          {/* Panel 2: Active Clinical Reports Telemetry Queue */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-200 font-bold flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#00E5FF]" />
                <span>ACTIVE CLINICAL REPORTS ({symptoms.length})</span>
              </div>
              <span className="text-[10px] font-mono text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-0.5 rounded border border-[#00E5FF]/30">
                JSC TELEMEDICINE SYNCED
              </span>
            </div>

            {isLoadingSymptoms ? (
              <div className="py-6 text-center text-xs font-mono text-slate-400">Loading symptoms telemetry...</div>
            ) : symptoms.length === 0 ? (
              <div className="py-6 text-center text-xs font-mono text-slate-400">
                No active symptoms recorded. Click any body part on the 3D model to report one.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {symptoms.map((sym) => (
                  <div
                    key={sym.id}
                    className="p-3.5 rounded-xl bg-[#080f24] border border-slate-700/80 flex items-start justify-between gap-3 text-xs"
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
                        {new Date(sym.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · ID: {sym.id}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteSymptom(sym.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition-colors"
                      title="Resolve or delete symptom"
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
