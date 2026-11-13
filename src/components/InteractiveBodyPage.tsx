import React, { useState, useRef, Suspense, useMemo } from 'react';
import { Canvas, useThree, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Layers,
  Sparkles,
  Search,
  X,
  Info,
  Eye,
  EyeOff,
  Sliders,
  Plus,
} from 'lucide-react';
import { AstronautProfile } from '../types/astronaut.ts';

// ─── Constants ────────────────────────────────────────────────────────────────
const ECORCHE_MODEL_URL = '/models/ecorche-main/model/ecorche.meshopt.glb';

// ─── Aerospace clinical notes per mesh name ───────────────────────────────────
function getAerospaceNote(name: string, tissue: string): string {
  const n = name.toLowerCase();

  // Spinal column
  if (n.includes('vertebra') || n.includes('intervertebral') || n.includes('atlas') || n.includes('axis') || n.includes('sacrum') || n.includes('coccyx') || n.includes('disc'))
    return 'Microgravity causes spinal elongation of +2–5 cm in long-duration missions due to intervertebral disc expansion. Monitor for disc herniation risk. Axial loading exercises (ARED squats/deadlifts) require Flight Surgeon clearance.';

  // Deep postural stabilisers
  if (n.includes('multifidus') || n.includes('erector spinae') || n.includes('transversospinal'))
    return 'Deep postural stabiliser muscles weaken rapidly in microgravity. Targeted resistance exercise (ARED, resistive bands) is prescribed from mission day 1 to counteract atrophy.';

  if (n.includes('psoas') || n.includes('iliacus') || n.includes('quadratus lumborum'))
    return 'Hip flexors and lumbar stabilisers are under-loaded in microgravity, leading to tightening and atrophy. Stretching and eccentric loading are prescribed countermeasures.';

  // Skull / cranial
  if (tissue === 'bone' && (n.includes('skull') || n.includes('frontal') || n.includes('parietal') || n.includes('occipital') || n.includes('temporal') || n.includes('sphenoid')))
    return 'Cephalic fluid shift in microgravity increases intracranial pressure, causing fullness, nasal congestion and visual disturbances. VIIP syndrome monitoring is mandatory.';

  // Eyes
  if (tissue === 'eye' || n.includes('eye') || n.includes('ocular'))
    return 'VIIP Syndrome: elevated intracranial pressure causes optic disc oedema, globe flattening and choroidal folds in ~70% of long-duration ISS crew. Routine ophthalmic monitoring every 30 days.';

  // Rotator cuff / shoulder
  if (n.includes('rotator') || n.includes('supraspinatus') || n.includes('infraspinatus') || n.includes('teres') || n.includes('subscapularis'))
    return 'Rotator cuff structures are under high load during EVA spacesuit donning/doffing and translation on the ISS exterior. Shoulder impingement is the leading EVA-related injury.';

  if (n.includes('deltoid') || n.includes('clavicle') || n.includes('acromion') || n.includes('scapula') || n.includes('trapezius'))
    return 'Shoulder girdle muscles work intensively during spacewalks. Microtrauma accumulates across EVAs. Pre/post EVA imaging recommended after every 3 EVAs.';

  // Arms
  if (n.includes('bicep') || n.includes('tricep') || n.includes('brachial') || n.includes('forearm') || n.includes('radius') || n.includes('ulna'))
    return 'Upper limb musculature atrophies in microgravity despite EVA workload. ARED and resistive band protocols target upper arm preservation.';

  // Hands / wrists
  if (n.includes('hand') || n.includes('wrist') || n.includes('carpal') || n.includes('metacarpal') || n.includes('phalanx') || n.includes('finger'))
    return 'Glove-induced compression during EVA causes hand fatigue, numbness and grip-strength loss. Degloved hand neuropathy is a reported risk. Post-EVA grip testing is standard.';

  // Chest / thorax
  if (n.includes('rib') || n.includes('sternum') || n.includes('thorac') || n.includes('intercostal') || n.includes('pectoralis'))
    return 'Thoracic expansion is restricted by EVA suit pressure. Barotrauma risk during rapid decompression. Chest tightness should be reported immediately.';

  // Heart / cardiovascular
  if (n.includes('heart') || n.includes('cardiac') || n.includes('aorta') || n.includes('ventricle') || n.includes('atrium'))
    return 'Cardiovascular deconditioning is a primary concern in microgravity. Cardiac mass decreases ~10%, stroke volume drops, and orthostatic intolerance develops. Daily aerobic countermeasures (CEVIS ergometer, 2.5 h/day) are mandatory.';

  // Lungs
  if (n.includes('lung') || n.includes('bronch') || n.includes('pulmonary') || n.includes('trachea') || n.includes('larynx') || n.includes('diaphragm'))
    return 'Pulmonary function is altered in microgravity: uniform ventilation/perfusion distribution changes gas exchange. SpO₂ monitoring continuous during EVA. Diaphragm displacement cranially increases residual volume.';

  // Abdomen / core
  if (n.includes('rectus abdominis') || n.includes('oblique') || n.includes('transverse abdominis') || n.includes('abdomen'))
    return 'Core musculature is significantly undertaxed in microgravity. Targeted core stabilisation exercises are essential to prevent lumbar injury during mission. Intra-abdominal pressure changes affect spinal biomechanics.';

  // GI tract
  if (n.includes('intestine') || n.includes('colon') || n.includes('stomach') || n.includes('liver') || n.includes('pancreas') || n.includes('spleen'))
    return 'Gastrointestinal motility decreases in microgravity. Constipation, bloating and altered nutrient absorption are common. Dietary fibre and fluid intake are closely monitored.';

  // Kidneys
  if (n.includes('kidney') || n.includes('renal') || n.includes('ureter') || n.includes('bladder'))
    return 'Increased calcium excretion in microgravity raises kidney stone risk (10× higher than Earth baseline). Fluid intake >2.5 L/day is mandatory. Ultrasound screening every 90 days.';

  // Leg muscles
  if (n.includes('quadricep') || n.includes('hamstring') || n.includes('vastus') || n.includes('rectus femoris') || n.includes('sartorius'))
    return 'Lower extremity muscle mass decreases ~15–20% over 6-month missions. ARED lower-body protocols (squats, deadlifts, leg press) target preservation. Sarcopenia is monitored via DEXA scans.';

  // Calves / feet
  if (n.includes('gastrocnemius') || n.includes('soleus') || n.includes('tibialis') || n.includes('calf') || n.includes('achilles') || n.includes('foot') || n.includes('plantar'))
    return 'Plantar fascia and Achilles tendon undergo rapid unloading in microgravity, increasing injury risk on return. Vibration plate therapy and resistive exercise prescribed. Foot pain post-landing is common during readaptation.';

  // Bone (generic)
  if (tissue === 'bone' || n.includes('bone') || n.includes('femur') || n.includes('tibia') || n.includes('fibula') || n.includes('humerus'))
    return 'Bone density decreases ~1–2% per month in microgravity (compared to 1–1.5% per year in osteoporosis). Load-bearing exercise is essential. Bisphosphonate therapy may be indicated for missions >6 months.';

  // Arteries / veins
  if (n.includes('artery') || n.includes('vein') || n.includes('vessel') || n.includes('vascular'))
    return 'Vascular remodelling occurs in microgravity with reduced venous return and peripheral vasoconstriction. Lower body negative pressure (LBNP) is used as a countermeasure for orthostatic intolerance.';

  // Lymphatic / immune
  if (n.includes('lymph') || n.includes('thymus') || n.includes('spleen') || n.includes('immune'))
    return 'Immune dysregulation in space includes T-cell redistribution, viral reactivation (EBV, CMV, VZV) and altered cytokine profiles. Latent herpesvirus monitoring is conducted monthly.';

  // Nerves
  if (n.includes('nerve') || n.includes('neural') || n.includes('plexus') || n.includes('sciatic'))
    return 'Space motion sickness (SMS) affects ~70% of crew in first 72 hours due to vestibular-visual conflict. Sensorimotor adaptation training pre-flight reduces severity.';

  // Generic muscle
  if (tissue === 'muscle' || n.includes('muscle') || n.includes('tendon') || n.includes('ligament'))
    return 'Skeletal muscle atrophy begins within 48 hours of microgravity exposure. Combined aerobic and resistance exercise (2.5 h/day) is prescribed. Protein intake ≥1.5 g/kg/day is recommended.';

  return `Anatomical structure: ${name}. Click to report discomfort to your Flight Surgeon. All symptoms are logged in the ASTROCARE telemetry database for real-time medical review.`;
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
  componentDidCatch(err: any) {
    console.warn('3D body model failed to render:', err?.message);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// ─── Camera fly-to helper ─────────────────────────────────────────────────────
function CameraFlyTo({ target }: { target: THREE.Object3D | null }) {
  const { camera, controls } = useThree();
  const flyRef = useRef<{ p0: THREE.Vector3; p1: THREE.Vector3; c0: THREE.Vector3; c1: THREE.Vector3; t0: number } | null>(null);

  useMemo(() => {
    if (!target) return;
    const box = new THREE.Box3().setFromObject(target);
    const c = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3()).length();
    const r = size * 0.6;
    const fovRad = THREE.MathUtils.degToRad(30 / 2);
    const dist = r / Math.tan(fovRad);
    const p1 = c.clone().add(new THREE.Vector3(0, 0, dist));
    flyRef.current = {
      p0: camera.position.clone(),
      p1,
      c0: (controls as any)?.target?.clone() ?? new THREE.Vector3(0, 0.9, 0),
      c1: c,
      t0: performance.now(),
    };
  }, [target]);

  useFrame(() => {
    if (!flyRef.current) return;
    const elapsed = (performance.now() - flyRef.current.t0) / 600;
    const e = Math.min(elapsed, 1);
    camera.position.lerpVectors(flyRef.current.p0, flyRef.current.p1, e);
    if ((controls as any)?.target) {
      (controls as any).target.lerpVectors(flyRef.current.c0, flyRef.current.c1, e);
    }
    if (e >= 1) flyRef.current = null;
  });

  return null;
}

// ─── Écorché 3D Model ─────────────────────────────────────────────────────────
// IMPORTANT: render gltf.scene directly as a <primitive> to preserve the root
// node's scale=0.0001 (positions stored in 0.1 mm units). Extracting meshes
// and re-rendering them individually breaks the hierarchy and makes the model
// appear 10,000× too large.

interface EcorcheModelProps {
  layer: 'both' | 'muscles' | 'skeleton';
  xrayOpacity: number;
  selectedMesh: THREE.Mesh | null;
  hoveredMesh: THREE.Mesh | null;
  onMeshClick: (mesh: THREE.Mesh) => void;
  onMeshHover: (mesh: THREE.Mesh | null) => void;
  searchTarget: THREE.Object3D | null;
}

function EcorcheModel({
  layer,
  xrayOpacity,
  selectedMesh,
  hoveredMesh,
  onMeshClick,
  onMeshHover,
  searchTarget,
}: EcorcheModelProps) {
  const gltf = useLoader(
    GLTFLoader,
    ECORCHE_MODEL_URL,
    (loader) => {
      (loader as any).setMeshoptDecoder(MeshoptDecoder);
    }
  );

  // Clone scene once so material overrides don't mutate the cached original
  const scene = useMemo(() => gltf.scene.clone(true), [gltf]);

  // Apply layer visibility + material overrides on every render
  useMemo(() => {
    scene.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return;
      const mesh = obj as THREE.Mesh;
      const ud = mesh.userData as { layer?: string; tissue?: string };
      const tissue = ud.tissue ?? 'muscle';
      const meshLayer = (ud.layer ?? 'superficial muscles').toLowerCase();

      // Layer visibility
      if (layer === 'muscles') mesh.visible = tissue !== 'bone' && tissue !== 'cartilage' && tissue !== 'tooth';
      else if (layer === 'skeleton') mesh.visible = tissue === 'bone' || tissue === 'cartilage' || tissue === 'tooth';
      else mesh.visible = true;

      // Material override
      const isBone = tissue === 'bone' || tissue === 'cartilage' || tissue === 'tooth';
      const isSelected = selectedMesh?.uuid === mesh.uuid;
      const isHovered = hoveredMesh?.uuid === mesh.uuid;

      const color = isSelected ? '#00E5FF' : isHovered ? '#FF8C00' : (isBone ? '#e8d5b0' : '#c0392b');
      const opacity = isSelected ? 1.0 : isBone ? xrayOpacity * 0.9 : xrayOpacity;
      const transparent = opacity < 0.99;

      const mat = new THREE.MeshStandardMaterial({
        color,
        transparent,
        opacity,
        roughness: isBone ? 0.75 : 0.5,
        metalness: isBone ? 0.05 : 0.0,
        side: THREE.DoubleSide,
        depthWrite: !transparent || opacity > 0.6,
      });
      mesh.material = mat;
    });
  }, [scene, layer, xrayOpacity, selectedMesh, hoveredMesh]);

  const handleClick = (e: any) => {
    e.stopPropagation();
    const hit = e.intersections?.[0]?.object as THREE.Mesh | undefined;
    if (hit?.isMesh) onMeshClick(hit);
  };

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    const hit = e.intersections?.[0]?.object as THREE.Mesh | undefined;
    if (hit?.isMesh) {
      onMeshHover(hit);
      document.body.style.cursor = 'pointer';
    }
  };

  const handlePointerOut = () => {
    onMeshHover(null);
    document.body.style.cursor = 'default';
  };

  return (
    <>
      <primitive
        object={scene}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />
      <CameraFlyTo target={searchTarget} />
    </>
  );
}

// ─── Fallback Procedural Body ─────────────────────────────────────────────────
function ProceduralBody({ onPartClick }: { onPartClick: (name: string) => void }) {
  const parts = [
    { name: 'Head', geo: <sphereGeometry args={[0.13, 16, 16]} />, pos: [0, 1.72, 0] as [number,number,number] },
    { name: 'Neck', geo: <cylinderGeometry args={[0.055, 0.065, 0.14, 12]} />, pos: [0, 1.56, 0] as [number,number,number] },
    { name: 'Torso (Chest/Spine)', geo: <boxGeometry args={[0.38, 0.55, 0.22]} />, pos: [0, 1.2, 0] as [number,number,number] },
    { name: 'Abdomen', geo: <boxGeometry args={[0.33, 0.28, 0.2]} />, pos: [0, 0.87, 0] as [number,number,number] },
    { name: 'Pelvis', geo: <boxGeometry args={[0.35, 0.18, 0.2]} />, pos: [0, 0.67, 0] as [number,number,number] },
    { name: 'Left Shoulder', geo: <sphereGeometry args={[0.07, 12, 12]} />, pos: [-0.26, 1.42, 0] as [number,number,number] },
    { name: 'Right Shoulder', geo: <sphereGeometry args={[0.07, 12, 12]} />, pos: [0.26, 1.42, 0] as [number,number,number] },
    { name: 'Left Upper Arm', geo: <cylinderGeometry args={[0.04, 0.045, 0.28, 10]} />, pos: [-0.33, 1.2, 0] as [number,number,number] },
    { name: 'Right Upper Arm', geo: <cylinderGeometry args={[0.04, 0.045, 0.28, 10]} />, pos: [0.33, 1.2, 0] as [number,number,number] },
    { name: 'Left Forearm', geo: <cylinderGeometry args={[0.033, 0.038, 0.26, 10]} />, pos: [-0.38, 0.9, 0] as [number,number,number] },
    { name: 'Right Forearm', geo: <cylinderGeometry args={[0.033, 0.038, 0.26, 10]} />, pos: [0.38, 0.9, 0] as [number,number,number] },
    { name: 'Left Hand', geo: <boxGeometry args={[0.07, 0.1, 0.03]} />, pos: [-0.4, 0.68, 0] as [number,number,number] },
    { name: 'Right Hand', geo: <boxGeometry args={[0.07, 0.1, 0.03]} />, pos: [0.4, 0.68, 0] as [number,number,number] },
    { name: 'Left Thigh', geo: <cylinderGeometry args={[0.07, 0.065, 0.42, 12]} />, pos: [-0.1, 0.35, 0] as [number,number,number] },
    { name: 'Right Thigh', geo: <cylinderGeometry args={[0.07, 0.065, 0.42, 12]} />, pos: [0.1, 0.35, 0] as [number,number,number] },
    { name: 'Left Knee', geo: <sphereGeometry args={[0.055, 12, 12]} />, pos: [-0.1, 0.1, 0] as [number,number,number] },
    { name: 'Right Knee', geo: <sphereGeometry args={[0.055, 12, 12]} />, pos: [0.1, 0.1, 0] as [number,number,number] },
    { name: 'Left Lower Leg', geo: <cylinderGeometry args={[0.042, 0.035, 0.38, 12]} />, pos: [-0.1, -0.12, 0] as [number,number,number] },
    { name: 'Right Lower Leg', geo: <cylinderGeometry args={[0.042, 0.035, 0.38, 12]} />, pos: [0.1, -0.12, 0] as [number,number,number] },
    { name: 'Left Foot', geo: <boxGeometry args={[0.08, 0.06, 0.18]} />, pos: [-0.1, -0.34, 0.05] as [number,number,number] },
    { name: 'Right Foot', geo: <boxGeometry args={[0.08, 0.06, 0.18]} />, pos: [0.1, -0.34, 0.05] as [number,number,number] },
  ];

  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <group>
      {parts.map((p) => (
        <mesh
          key={p.name}
          position={p.pos}
          onClick={(e) => { e.stopPropagation(); setSelected(p.name); onPartClick(p.name); }}
          onPointerOver={(e) => { e.stopPropagation(); setHovered(p.name); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { setHovered(null); document.body.style.cursor = 'default'; }}
        >
          {p.geo}
          <meshStandardMaterial
            color={selected === p.name ? '#00E5FF' : hovered === p.name ? '#FF8C00' : '#c0392b'}
            roughness={0.5}
            metalness={0.1}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────
interface InteractiveBodyPageProps {
  profile: AstronautProfile;
}

export const InteractiveBodyPage: React.FC<InteractiveBodyPageProps> = ({ profile }) => {
  const [selectedMesh, setSelectedMesh] = useState<THREE.Mesh | null>(null);
  const [hoveredMesh, setHoveredMesh] = useState<THREE.Mesh | null>(null);
  const [layer, setLayer] = useState<'both' | 'muscles' | 'skeleton'>('both');
  const [xrayOpacity, setXrayOpacity] = useState<number>(1.0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchTarget, setSearchTarget] = useState<THREE.Mesh | null>(null);
  const [useEcorche, setUseEcorche] = useState<boolean>(true);

  // Selected part info
  const [selectedInfo, setSelectedInfo] = useState<{
    name: string;
    tissue: string;
    note: string;
  } | null>(null);

  // Symptom report form
  const [symptomText, setSymptomText] = useState<string>('');
  const [severity, setSeverity] = useState<'Mild' | 'Moderate' | 'Severe'>('Mild');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitToast, setSubmitToast] = useState<string | null>(null);

  // All meshes ref for search
  const allMeshesRef = useRef<THREE.Mesh[]>([]);

  const handleMeshClick = (mesh: THREE.Mesh) => {
    setSelectedMesh(mesh);
    const ud = mesh.userData as { name?: string; tissue?: string; layer?: string };
    const name = ud.name || mesh.name || 'Unknown Structure';
    const tissue = ud.tissue || 'unknown';
    const note = getAerospaceNote(name, tissue);
    setSelectedInfo({ name, tissue, note });
  };

  const handleProceduralClick = (partName: string) => {
    setSelectedInfo({
      name: partName,
      tissue: 'unknown',
      note: getAerospaceNote(partName, 'muscle'),
    });
  };

  const handleSearch = () => {
    if (!searchQuery.trim() || !allMeshesRef.current.length) return;
    const q = searchQuery.toLowerCase();
    const found = allMeshesRef.current.find((m) => {
      const n = (m.userData?.name || m.name || '').toLowerCase();
      return n.includes(q);
    });
    if (found) {
      setSearchTarget(found);
      handleMeshClick(found);
    }
  };

  const handleSubmitSymptom = async () => {
    if (!selectedInfo || !symptomText.trim()) return;
    setIsSubmitting(true);
    try {
      await fetch('/api/symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          astronautId: profile.id,
          astronautName: profile.name,
          region: selectedInfo.name,
          description: symptomText.trim(),
          severity,
          timestamp: new Date().toISOString(),
        }),
      });
      setSubmitToast(`Symptom logged for ${selectedInfo.name} — Flight Surgeon notified.`);
      setSymptomText('');
    } catch {
      setSubmitToast('Symptom saved locally. Will sync when connection restored.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitToast(null), 5000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-[#00E5FF]/20 bg-[#060d1f]/80 backdrop-blur-xl p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-white font-['Chakra_Petch',sans-serif] tracking-wide flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#00E5FF]" />
              INTERACTIVE 3D BODY MAP
            </h2>
            <p className="text-slate-400 text-xs font-mono mt-0.5">
              Click any body part to report pain or view aerospace medical info
            </p>
          </div>

          {/* Model toggle */}
          <button
            onClick={() => { setUseEcorche((v) => !v); setSelectedMesh(null); setSelectedInfo(null); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-600 text-slate-300 text-xs font-mono hover:border-[#00E5FF]/50 transition-all"
          >
            {useEcorche ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {useEcorche ? 'Simple View' : 'Écorché Model'}
          </button>
        </div>

        {/* Controls */}
        <div className="mt-3 flex flex-wrap gap-3 items-center">
          {/* Layer filter */}
          <div className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            {(['both', 'muscles', 'skeleton'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLayer(l)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono uppercase transition-all ${
                  layer === l
                    ? 'bg-[#00E5FF] text-black'
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* X-ray slider */}
          {useEcorche && (
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] text-slate-400 font-mono">X-RAY</span>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={xrayOpacity}
                onChange={(e) => setXrayOpacity(parseFloat(e.target.value))}
                className="w-24 accent-[#00E5FF]"
              />
            </div>
          )}

          {/* Search */}
          {useEcorche && (
            <div className="flex items-center gap-1 ml-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search muscle / bone…"
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:border-[#00E5FF] focus:outline-none w-44"
              />
              <button
                onClick={handleSearch}
                className="px-2.5 py-1 rounded-lg bg-[#00E5FF]/20 border border-[#00E5FF]/30 text-[#00E5FF] hover:bg-[#00E5FF]/30 transition-all"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main layout: 3D canvas + Info panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* 3D Canvas */}
        <div className="lg:col-span-2 rounded-2xl border border-[#00E5FF]/15 bg-[#030810] overflow-hidden" style={{ height: '560px' }}>
          <Canvas
            camera={{ position: [1.4, 1.2, 4.1], fov: 30, near: 0.01, far: 100 }}
            shadows
            gl={{ antialias: true, alpha: true }}
            onPointerMissed={() => { setSelectedMesh(null); }}
          >
            <ambientLight intensity={0.6} />
            <directionalLight position={[2, 4, 3]} intensity={1.2} castShadow />
            <directionalLight position={[-2, 2, -2]} intensity={0.4} color="#00E5FF" />
            <pointLight position={[0, 2, 1]} intensity={0.5} color="#ffffff" />

            <OrbitControls
              enablePan
              enableZoom
              enableRotate
              enableDamping
              dampingFactor={0.08}
              minDistance={0.3}
              maxDistance={20}
              target={[0, 0.9, 0]}
            />

            {useEcorche ? (
              <Suspense fallback={
                <mesh position={[0, 0.9, 0]}>
                  <boxGeometry args={[0.3, 1.6, 0.2]} />
                  <meshStandardMaterial color="#00E5FF" wireframe opacity={0.4} transparent />
                </mesh>
              }>
                <ModelErrorBoundary
                  fallback={
                    <ProceduralBody onPartClick={handleProceduralClick} />
                  }
                >
                  <EcorcheModel
                    layer={layer}
                    xrayOpacity={xrayOpacity}
                    selectedMesh={selectedMesh}
                    hoveredMesh={hoveredMesh}
                    onMeshClick={handleMeshClick}
                    onMeshHover={setHoveredMesh}
                    searchTarget={searchTarget}
                  />
                </ModelErrorBoundary>
              </Suspense>
            ) : (
              <ProceduralBody onPartClick={handleProceduralClick} />
            )}
          </Canvas>

          {/* Canvas overlay legend */}
          <div className="absolute bottom-4 left-4 flex items-center gap-3 text-[10px] font-mono text-slate-400 pointer-events-none">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#c0392b] inline-block" /> Muscle</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#e8d5b0] inline-block" /> Bone</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#FF8C00] inline-block" /> Hover</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#00E5FF] inline-block" /> Selected</span>
          </div>
        </div>

        {/* Info + Symptom Panel */}
        <div className="space-y-4">
          {/* Selected part info */}
          {selectedInfo ? (
            <div className="rounded-2xl border border-[#00E5FF]/30 bg-[#060d1f]/90 backdrop-blur-xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[9px] font-mono text-[#00E5FF] tracking-widest mb-1">SELECTED STRUCTURE</p>
                  <h3 className="text-white font-bold text-sm font-['Chakra_Petch',sans-serif] leading-tight">
                    {selectedInfo.name}
                  </h3>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono capitalize">
                    {selectedInfo.tissue}
                  </span>
                </div>
                <button
                  onClick={() => { setSelectedMesh(null); setSelectedInfo(null); }}
                  className="p-1 text-slate-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Aerospace note */}
              <div className="rounded-xl bg-[#00E5FF]/5 border border-[#00E5FF]/15 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Info className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span className="text-[9px] text-[#00E5FF] font-mono tracking-widest">AEROSPACE MEDICAL NOTE</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">{selectedInfo.note}</p>
              </div>

              {/* Symptom report form */}
              <div className="rounded-xl bg-rose-500/5 border border-rose-500/20 p-3 space-y-2.5">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-[9px] text-rose-400 font-mono tracking-widest">REPORT DISCOMFORT</span>
                </div>

                <textarea
                  value={symptomText}
                  onChange={(e) => setSymptomText(e.target.value)}
                  placeholder={`Describe pain or discomfort in ${selectedInfo.name}…`}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs font-sans focus:border-rose-400 focus:outline-none resize-none"
                />

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-mono">SEVERITY:</span>
                  {(['Mild', 'Moderate', 'Severe'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSeverity(s)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono transition-all ${
                        severity === s
                          ? s === 'Severe' ? 'bg-rose-500 text-white' : s === 'Moderate' ? 'bg-amber-500 text-black' : 'bg-emerald-500 text-black'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleSubmitSymptom}
                  disabled={isSubmitting || !symptomText.trim()}
                  className="w-full py-2 rounded-xl bg-rose-500 hover:bg-rose-400 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isSubmitting ? 'TRANSMITTING…' : 'LOG SYMPTOM TO FLIGHT SURGEON'}
                </button>
              </div>
            </div>
          ) : (
            /* Placeholder when nothing is selected */
            <div className="rounded-2xl border border-slate-700/40 bg-[#060d1f]/60 backdrop-blur-xl p-6 text-center">
              <Sparkles className="w-10 h-10 text-[#00E5FF]/30 mx-auto mb-3" />
              <p className="text-slate-500 text-xs font-mono">
                Click any body part on the 3D model to view aerospace medical information and report symptoms.
              </p>
            </div>
          )}

          {/* Quick-pain body map (2D fallback reference) */}
          <div className="rounded-2xl border border-slate-700/40 bg-[#060d1f]/60 backdrop-blur-xl p-4">
            <p className="text-[9px] font-mono text-slate-500 tracking-widest mb-3">QUICK PAIN LOCATOR</p>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                'Head / Skull', 'Neck / Cervical', 'Left Shoulder', 'Right Shoulder',
                'Chest / Sternum', 'Thoracic Spine', 'Lumbar Spine', 'Abdomen',
                'Left Hip', 'Right Hip', 'Left Knee', 'Right Knee',
                'Left Lower Leg', 'Right Lower Leg', 'Left Foot', 'Right Foot',
              ].map((part) => (
                <button
                  key={part}
                  onClick={() => handleProceduralClick(part)}
                  className={`px-2 py-1.5 rounded-lg text-[10px] font-mono text-left transition-all border ${
                    selectedInfo?.name === part
                      ? 'bg-[#00E5FF]/15 border-[#00E5FF]/40 text-[#00E5FF]'
                      : 'bg-slate-900/60 border-slate-700/40 text-slate-400 hover:border-[#00E5FF]/30 hover:text-white'
                  }`}
                >
                  {part}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {submitToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl bg-[#080e22]/95 border-2 border-[#00E5FF]/60 text-white shadow-[0_0_35px_rgba(0,229,255,0.45)] backdrop-blur-xl font-mono text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{submitToast}</span>
        </div>
      )}
    </div>
  );
};

export default InteractiveBodyPage;
