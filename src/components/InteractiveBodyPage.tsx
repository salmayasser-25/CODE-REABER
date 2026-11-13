import React, { useState, useEffect, useRef, Suspense, useMemo, useCallback } from 'react';
import { Canvas, useThree, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
  Activity,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Plus,
  Flame,
  ShieldAlert,
  RotateCcw,
  Layers, 
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Plus,
  Flame,
  Layers,
  Sparkles,
  Check,
  Search,
  X,
  Info,
  Sparkles,
  Eye,
  EyeOff,
  Sliders,
  Check
} from 'lucide-react';
import { SymptomReport, AstronautProfile } from '../types/astronaut.ts';

const BODY_MODEL_URL = '/models/body_superficial.app5m.glb';
// ─── Constants ───────────────────────────────────────────────────────────────

// Preload the body model from local static storage
try {
  useGLTF.preload(BODY_MODEL_URL);
} catch {
  // Preload safety catch
}
const ECORCHE_MODEL_URL = '/models/ecorche-main/model/ecorche.meshopt.glb';

// React Error Boundary for 3D body mesh loading
class ModelErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
    // Pre-configure loader with MeshoptDecoder so the useLoader hook can decode it
    GLTFLoader.prototype.constructor = GLTFLoader;

    // ─── Aerospace clinical info per anatomical body region ──────────────────────

    function getAerospaceNote(name: string, layer: string, side: string, tissue: string): string {
      const n = name.toLowerCase();

      // Spinal column
      if (n.includes('vertebra') || n.includes('intervertebral') || n.includes('atlas') || n.includes('axis') || n.includes('sacrum') || n.includes('coccyx')) {
        return 'Microgravity causes spinal elongation of +2–5 cm in long-duration missions due to intervertebral disc expansion. Monitor for disc herniation risk. Axial loading exercises (ARED squats/deadlifts) require Flight Surgeon clearance.';
      }
  static getDerivedStateFromError() {
    return { hasError: true };
    if (n.includes('disc')) {
      return 'Intervertebral discs expand in microgravity, contributing to spinal elongation. Associated with back pain in ~50% of astronauts. Avoid high axial-load activities during adaptation phase.';
    }
    componentDidCatch(err: any) {
      console.warn('3D body model failed to render, switching to procedural anatomical fallback:', err?.message);

      // Musculature – spinal
      if (n.includes('multifidus') || n.includes('erector spinae') || n.includes('transversospinal')) {
        return 'Deep postural stabiliser muscles weaken rapidly in microgravity. Targeted resistance exercise (ARED, resistive bands) is prescribed from mission day 1 to counteract atrophy.';
      }
      render() {
        if (this.state.hasError) {
          return this.props.fallback;
        }
        return this.props.children;
        if (n.includes('psoas') || n.includes('iliacus') || n.includes('quadratus lumborum')) {
          return 'Hip flexors and lumbar stabilisers are under-loaded in microgravity, leading to tightening and atrophy. Stretching and eccentric loading are prescribed countermeasures.';
        }
      }

      // Map 3D coordinate heights or mesh names to anatomical clinical space labels
      function mapMeshToBodyPart(point: THREE.Vector3, meshName: string): string {
        const y = point.y;
        const x = point.x;
        const z = point.z;
        // Head & skull
        if (tissue === 'bone' && (n.includes('skull') || n.includes('frontal') || n.includes('parietal') || n.includes('occipital') || n.includes('temporal') || n.includes('sphenoid'))) {
          return 'Cephalic fluid shift in microgravity increases intracranial pressure, causing fullness, nasal congestion and visual disturbances. SpaceHab Vision Impairment and Intracranial Pressure (VIIP) syndrome monitoring is mandatory.';
        }

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
          // Eyes
          if (tissue === 'eye' || n.includes('eye') || n.includes('ocular')) {
            return 'VIIP Syndrome: elevated intracranial pressure causes optic disc oedema, globe flattening and choroidal folds in ~70% of long-duration ISS crew. Routine ophthalmic monitoring every 30 days. Report any visual changes immediately.';
          }
        }

        export interface AnatomicalZone {
          id: string;
          label: string;
          position: [number, number, number];
          rotation?: [number, number, number];
          type: 'box' | 'cylinder' | 'sphere';
          args: any[];
          // Shoulder girdle
          if(n.includes('rotator') || n.includes('supraspinatus') || n.includes('infraspinatus') || n.includes('teres minor') || n.includes('subscapularis')) {
          return 'Rotator cuff structures are under high load during EVA (extravehicular activity) spacesuit donning/doffing and translation on the ISS exterior. Shoulder impingement is the leading EVA-related injury. Rotator cuff strengthening is mandatory pre-EVA.';
        }
        if (n.includes('deltoid') || n.includes('clavicle') || n.includes('acromion') || n.includes('scapula') || n.includes('trapezius')) {
          return 'Shoulder and upper back musculature are primary EVA-use structures. Spacesuit pressurisation creates significant resistance. Shoulder injuries account for a large proportion of EVA-related musculoskeletal complaints.';
        }

        // Arms
        if (n.includes('biceps') || n.includes('triceps') || n.includes('brachialis') || n.includes('brachioradialis')) {
          return 'Upper arm musculature atrophies in microgravity if not actively trained. ARED resistance exercises targeting elbow flexors/extensors are prescribed as countermeasures. EVA glove manipulation places high load on forearm muscles.';
        }
        if (n.includes('humerus') || n.includes('radius') || n.includes('ulna')) {
          return 'Long bone density decreases at ~1–2% per month in microgravity. ARED resistive exercise and vibration platforms are used as countermeasures. Fracture risk is elevated post-mission during re-adaptation.';
        }

        // Hands & wrists
        if (n.includes('carpal') || n.includes('metacarp') || n.includes('phalanx') || n.includes('finger') || n.includes('thumb')) {
          return 'Fine motor dexterity can be affected by pressurised gloves during EVA. Repetitive EVA tasks may cause finger squeeze injuries and tendon strain. Post-EVA hand soreness is commonly reported.';
        }

        // Core / Thorax
        if (n.includes('rectus abdominis') || n.includes('oblique') || n.includes('transversus')) {
          return 'Core stability muscles weaken significantly in microgravity as the spine does not need active stabilisation against gravity. Progressive resistance training (ARED) and core stability exercises are mandatory from day 1.';
        }
        if (n.includes('diaphragm')) {
          return 'The diaphragm operates differently in microgravity due to altered intrathoracic pressures and fluid distribution. Breathing mechanics adapt within days. Respiratory function monitoring is performed throughout the mission.';
        }
        if (n.includes('rib') || n.includes('sternum') || n.includes('costal')) {
          return 'The thoracic cage bones lose density in microgravity. Rib stress fractures have been reported, particularly in crews performing heavy EVA or resistive exercise protocols. Impact protection protocols apply during re-entry.';
        }
        if (n.includes('pectoralis') || n.includes('serratus')) {
          return 'Chest musculature is targeted in ARED bench press protocols aboard the ISS. These muscles support EVA shoulder stability and are part of the standard countermeasure exercise prescription.';
        }
        if (n.includes('latissimus')) {
          return 'The latissimus dorsi is critical for EVA handhold translation and pull-up manoeuvres. ARED pull-down and row exercises maintain strength throughout the mission.';
        }

        // Pelvis & hip
        if (n.includes('ilium') || n.includes('ischium') || n.includes('pubis') || n.includes('pelvis') || n.includes('sacroiliac')) {
          return 'The pelvis is a key bone density monitoring site. Hip bone mineral density decreases at ~1.5% per month without countermeasures. DXA scanning before and after each mission tracks cumulative bone loss.';
        }
        if (n.includes('glute') || n.includes('gluteus')) {
          return 'Gluteal muscles are among the first to atrophy in microgravity due to lack of weight-bearing demands. ARED squat and deadlift protocols target gluteal activation. Atrophy contributes to lower back pain in-flight.';
        }

        // Thigh
        if (n.includes('femur')) {
          return 'The femur is a primary site of bone mineral density loss in spaceflight – neck of femur loses up to 2% per month. Post-flight fracture risk is elevated during re-adaptation. Weekly ARED loading protocols target femoral strength.';
        }
        if (n.includes('quadriceps') || n.includes('rectus femoris') || n.includes('vastus')) {
          return 'Quadriceps muscle mass and strength decline rapidly without weight-bearing. ARED squats, leg press and CEVIS cycling are the primary quadriceps countermeasures prescribed for all long-duration crewmembers.';
        }
        if (n.includes('hamstring') || n.includes('biceps femoris') || n.includes('semimembran') || n.includes('semitendin')) {
          return 'Hamstring musculature atrophies in microgravity and becomes less flexible. Post-flight hamstring strains are common during re-adaptation walks. Targeted eccentric hamstring loading and stretching are prescribed countermeasures.';
        }
        if (n.includes('adductor') || n.includes('gracilis')) {
          return 'Hip adductors are underloaded in microgravity. Combined with muscle atrophy, this contributes to altered gait patterns post-landing. Targeted adductor exercises supplement standard ARED protocols.';
        }

        // Lower leg
        if (n.includes('tibia') || n.includes('fibula')) {
          return 'The tibia and fibula experience reduced mechanical loading in weightlessness, leading to bone density loss. Post-flight stress fractures have been reported. T2 treadmill (with bungee harness) and CEVIS bike help maintain tibia loading in-flight.';
        }
        if (n.includes('gastrocnemius') || n.includes('soleus') || n.includes('calf')) {
          return 'Calf musculature is among the most affected by microgravity atrophy, as these are primary postural and propulsion muscles under gravity. CEVIS cycling and T2 treadmill running are the primary countermeasures.';
        }
        if (n.includes('tibialis') || n.includes('peroneus') || n.includes('fibularis')) {
          return 'Ankle stabilisers weaken without weight-bearing stimulation. Post-flight ankle instability and proprioceptive deficits are common. Progressive balance and gait training is prescribed immediately after landing.';
        }

        // Foot / ankle
        if (n.includes('calcaneus') || n.includes('talus') || n.includes('tarsal') || n.includes('metatarsal') || n.includes('toe') || n.includes('foot') || n.includes('plantar')) {
          return 'Foot and ankle bones lose density without weight-bearing. Post-flight plantar fasciitis has been reported. Graduated standing protocols begin within hours of landing to restore normal foot loading.';
        }

        // Knee
        if (n.includes('patella') || n.includes('meniscus') || n.includes('cruciate') || n.includes('popliteal')) {
          return 'Knee joint structures are unloaded in microgravity. Articular cartilage health depends on cyclical loading. CEVIS cycling and T2 treadmill protocols maintain knee joint health. Post-flight knee pain is a commonly reported complaint.';
        }

        // Neck
        if (n.includes('sternocleidomastoid') || n.includes('scalenus') || n.includes('scalene') || n.includes('splenius') || n.includes('semispinalis') || n.includes('longus colli') || n.includes('longus capitis')) {
          return 'Neck muscles must adapt to altered head-weight dynamics in microgravity. Cephalic fluid shift causes head fullness. Neck stiffness and discomfort are commonly reported. Helmet donning for EVA can cause neck strain.';
        }

        // Cartilage general
        if (tissue === 'cartilage') {
          return 'Cartilaginous structures depend on cyclical mechanical loading to maintain nutrition and health. Reduced loading in microgravity can impair cartilage homeostasis. Articular cartilage monitoring is part of the post-flight medical assessment.';
        }

        // Bone general
        if (tissue === 'bone') {
          return `Bone mineral density in the ${name.toLowerCase()} decreases at approximately 1–2% per month in microgravity without adequate countermeasures. Targeted ARED resistive exercise, vibration platforms and pharmacological agents (bisphosphonates) are used to mitigate loss. DXA scanning before and after each mission is mandatory.`;
        }

        // Deep muscle general
        if (layer === 'deep muscles') {
          return `Deep muscle ${name} is part of the core stabilisation system. In microgravity, postural muscles are progressively unloaded and atrophy without active countermeasures. Targeted resistance and stabilisation exercises are prescribed as part of the daily 2.5-hour exercise protocol.`;
        }

        // Superficial muscle general
        return `The ${name} is a ${side !== 'midline' ? side + ' ' : ''}skeletal muscle that requires consistent resistance training to maintain mass and strength during long-duration spaceflight. ARED and CEVIS exercise protocols target this muscle group as part of the standard 2.5-hour daily countermeasure regimen.`;
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
// ─── Region body-part groups (for the quick-select bar) ─────────────────────

const QUICK_ZONES = [
        { id: 'spine', label: 'Lumbar Spine', search: 'vertebra', painType: 'Dull' as const, intensity: 5, notes: 'Microgravity spinal elongation intervertebral disc ache.' },
        { id: 'skull', label: 'Head / VIIP', search: 'frontal bone', painType: 'Dull' as const, intensity: 3, notes: 'Cephalic fluid shift post-sleep fullness.' },
        { id: 'shoulder', label: 'Shoulder EVA', search: 'deltoid', painType: 'Sharp' as const, intensity: 4, notes: 'Post-EVA shoulder rotator cuff strain.' },
        { id: 'quadriceps', label: 'Quadriceps', search: 'rectus femoris', painType: 'Burning' as const, intensity: 5, notes: 'Post-ARED squat protocol muscle fatigue.' },
        { id: 'calves', label: 'Calves', search: 'gastrocnemius', painType: 'Dull' as const, intensity: 3, notes: 'Lower limb muscle atrophy in microgravity.' },
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
// ─── Ecorche Model Component ──────────────────────────────────────────────────

interface EcorcheModelProps {
        layer: 'both' | 'muscles' | 'skeleton';
        xrayOpacity: number;
        selectedMesh: THREE.Mesh | null;
        hoveredMesh: THREE.Mesh | null;
        onMeshClick: (mesh: THREE.Mesh) => void;
        onMeshHover: (mesh: THREE.Mesh | null) => void;
        searchTarget: THREE.Mesh | null;
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

          // Holographic cybernetic baseline material for the underlying anatomical mesh
          const clonedScene = React.useMemo(() => {
            const { camera, controls: orbitRef } = useThree();
            const meshesRef = useRef<THREE.Mesh[]>([]);
            const skeletonMeshesRef = useRef<THREE.Mesh[]>([]);
            const deepMeshesRef = useRef<THREE.Mesh[]>([]);
            const superficialMeshesRef = useRef<THREE.Mesh[]>([]);
            const outerMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
            const matsRef = useRef<{
              Bone: THREE.MeshStandardMaterial;
              Muscle: THREE.MeshStandardMaterial;
              Outer: THREE.MeshStandardMaterial;
            } | null>(null);

            // Build scene clone + categorise meshes + create materials once
            const clonedScene = useMemo(() => {
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
                  const all: THREE.Mesh[] = [];
                  const skel: THREE.Mesh[] = [];
                  const deep: THREE.Mesh[] = [];
                  const sup: THREE.Mesh[] = [];

                  // Collect original material names from the original scene before cloning
                  const baseMats: Record<string, THREE.MeshStandardMaterial> = {};
                  gltf.scene.traverse((o) => {
                    if ((o as THREE.Mesh).isMesh) {
                      const m = o as THREE.Mesh;
                      const mat = Array.isArray(m.material) ? m.material[0] : m.material;
                      if (mat && !baseMats[mat.name]) {
                        baseMats[mat.name] = mat.clone() as THREE.MeshStandardMaterial;
                      }
                    }
                  });

                  const boneMat = (baseMats['Bone'] || new THREE.MeshStandardMaterial({ name: 'Bone' })).clone() as THREE.MeshStandardMaterial;
                  boneMat.vertexColors = true;
                  const muscleMat = (baseMats['Muscle'] || new THREE.MeshStandardMaterial({ name: 'Muscle' })).clone() as THREE.MeshStandardMaterial;
                  muscleMat.vertexColors = true;
                  const outerMat = muscleMat.clone() as THREE.MeshStandardMaterial;
                  outerMat.name = 'Outer';
                  outerMat.vertexColors = true;
                  outerMat.transparent = true;
                  outerMat.opacity = 1.0;
                  outerMat.depthWrite = true;
                  outerMatRef.current = outerMat;

                  matsRef.current = { Bone: boneMat, Muscle: muscleMat, Outer: outerMat };

                  clone.traverse((o) => {
                    if (!(o as THREE.Mesh).isMesh) return;
                    const m = o as THREE.Mesh;
                    // Copy userData from original scene nodes by matching names
                    const origNode = gltf.scene.getObjectByName(m.name);
                    if (origNode) {
                      m.userData = { ...origNode.userData };
                    }
                    const lyr = m.userData?.layer || '';
                    m.userData._baseMat = lyr === 'skeleton' ? 'Bone' : lyr === 'superficial muscles' ? 'Outer' : 'Muscle';

                    if (lyr === 'skeleton') {
                      m.material = boneMat;
                      skel.push(m);
                    } else if (lyr === 'deep muscles') {
                      m.material = muscleMat;
                      deep.push(m);
                    } else {
                      m.material = outerMat;
                      sup.push(m);
                    }
                    all.push(m);
                  });

                  meshesRef.current = all;
                  skeletonMeshesRef.current = skel;
                  deepMeshesRef.current = deep;
                  superficialMeshesRef.current = sup;

                  return clone;
                }, [gltf.scene]);

              // Subtle breathing animation for body
              useFrame((state) => {
                if (modelRef.current) {
                  const t = state.clock.getElapsedTime();
                  modelRef.current.position.y = -0.65 + Math.sin(t * 1.2) * 0.015;
                }
              });
              // Layer visibility
              useEffect(() => {
                skeletonMeshesRef.current.forEach((m) => { m.visible = layer !== 'muscles'; });
                deepMeshesRef.current.forEach((m) => { m.visible = layer !== 'skeleton'; });
                superficialMeshesRef.current.forEach((m) => { m.visible = layer !== 'skeleton'; });
              }, [layer]);

              return (
                <group ref={modelRef} position={[0, -0.65, 0]} scale={1.35}>
                  {/* 1. Underlying High-Tech Translucent Holographic Anatomical Body */}
                  <primitive object={clonedScene} />
  // X-ray opacity on outer (superficial) material
  useEffect(() => {
    if (!outerMatRef.current) return;
                  const v = xrayOpacity;
                  outerMatRef.current.transparent = v < 1;
                  outerMatRef.current.opacity = v;
    outerMatRef.current.depthWrite = v >= 1;
                  outerMatRef.current.needsUpdate = true;
  }, [xrayOpacity]);

                  {/* 2. Discrete Anatomical Hitboxes with Independent Hover (Orange) and Click (Red) States */}
                  {ANATOMICAL_ZONES.map((zone) => {
                    const isSelected = selectedZoneId === zone.id || selectedMeshId === zone.id;
                    const isHovered = hoveredZoneId === zone.id;
                    // Material state: idle | hovered | selected
                    useEffect(() => {
                      if (!matsRef.current) return;
                      meshesRef.current.forEach((m) => {
                        const base = m.userData._baseMat as 'Bone' | 'Muscle' | 'Outer';
                        if (m === selectedMesh) {
                          const sel = matsRef.current![base].clone() as THREE.MeshStandardMaterial;
                          sel.vertexColors = false;
                          sel.color = new THREE.Color(0xef4444);
                          sel.emissive = new THREE.Color(0xdc2626);
                          sel.emissiveIntensity = 0.5;
                          sel.transparent = false;
                          sel.opacity = 1;
                          sel.needsUpdate = true;
                          m.material = sel;
                        } else if (m === hoveredMesh) {
                          const hov = matsRef.current![base].clone() as THREE.MeshStandardMaterial;
                          hov.vertexColors = false;
                          hov.color = new THREE.Color(0xff8c00);
                          hov.emissive = new THREE.Color(0xea580c);
                          hov.emissiveIntensity = 0.4;
                          hov.transparent = base === 'Outer' ? outerMatRef.current!.transparent : false;
                          hov.opacity = base === 'Outer' ? outerMatRef.current!.opacity : 1;
                          hov.needsUpdate = true;
                          m.material = hov;
                        } else {
                          m.material = matsRef.current![base];
                        }
                      });
                    }, [selectedMesh, hoveredMesh, xrayOpacity]);

                    // Color logic: Selected -> Glowing Crimson Red (#ef4444); Hovered -> Glowing Orange (#ff8c00); Idle -> Transparent Hitbox
                    let color = '#00e5ff';
                    let emissive = '#000000';
                    let emissiveIntensity = 0;
                    let opacity = 0.02; // Very subtle so invisible until hovered/clicked
                    let wireframe = false;
                    // Camera fly-to when search target changes
                    useEffect(() => {
                      if (!searchTarget || !orbitRef) return;
                      const box = new THREE.Box3().setFromObject(searchTarget);
                      const center = box.getCenter(new THREE.Vector3());
                      const size = box.getSize(new THREE.Vector3()).length();
                      const r = Math.max(0.05, size * 1.4);
                      const dir = new THREE.Vector3(center.x, 0, center.z - 0.01);
                      if (dir.length() < 0.01) dir.set(0, 0, 1);
                      dir.normalize().setY(0.15).normalize();
                      const targetPos = center.clone().addScaledVector(dir, r / Math.tan((30 * Math.PI) / 180 / 2));
                      // @ts-ignore
                      orbitRef.target.copy(center);
                      camera.position.copy(targetPos);
                      // @ts-ignore
                      orbitRef.update();
                    }, [searchTarget, camera, orbitRef]);

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
                      // Raycasting via pointer events on the primitive
                      const handlePointerDown = useRef<{ x: number; y: number } | null>(null);

                      return (
                        <primitive
                          object={clonedScene}
                          onPointerDown={(e: any) => {
                            handlePointerDown.current = { x: e.clientX, y: e.clientY };
                          }}
                          onPointerUp={(e: any) => {
                            const down = handlePointerDown.current;
                            if (!down) return;
                            const dist = Math.hypot(e.clientX - down.x, e.clientY - down.y);
                            if (dist < 5 && e.object && (e.object as THREE.Mesh).isMesh) {
                              e.stopPropagation();
                              onMeshClick(e.object as THREE.Mesh);
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
                          })
                    }
    </group>
        handlePointerDown.current = null;
            }}
      onPointerMove = {(e: any) => {
            if (e.object && (e.object as THREE.Mesh).isMesh) {
              onMeshHover(e.object as THREE.Mesh);
            }
          }
        }
        onPointerOut = {() => {
          onMeshHover(null);
        }
      }
    />
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
      function LoadingFallback() {
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
    <mesh position={[0, 0.9, 0]}>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial color="#00e5ff" emissive="#003344" emissiveIntensity={0.5} wireframe />
    </mesh>
        );
      }

      class ModelErrorBoundary extends React.Component<
        { children: React.ReactNode },
        { error: string | null }
      > {
        constructor(props: any) {
          super(props);
          this.state = { error: null };
        }
        static getDerivedStateFromError(e: any) {
          return { error: e?.message || 'Unknown error' };
        }
        render() {
          if (this.state.error) {
            return (
              <mesh position={[0, 0.9, 0]}>
                <boxGeometry args={[0.5, 1.6, 0.3]} />
                <meshStandardMaterial color="#ef4444" wireframe />
              </mesh>
            );
          }
          return this.props.children;
        }
      }

      // ─── Main Page Component ──────────────────────────────────────────────────────

      interface InteractiveBodyPageProps {
        profile: AstronautProfile;
      }

      export const InteractiveBodyPage: React.FC<InteractiveBodyPageProps> = ({ profile }) => {
        const [selectedRegion, setSelectedRegion] = useState<string>('Lumbar Spine (L1-L5 Microgravity Delta)');
        const [selectedMeshId, setSelectedMeshId] = useState<string | null>('spine');
        const [selectedZoneId, setSelectedZoneId] = useState<string | null>('spine');
        const [hoveredPart, setHoveredPart] = useState<string | null>(null);
        const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);
        // 3D state
        const [selectedMesh, setSelectedMesh] = useState<THREE.Mesh | null>(null);
        const [hoveredMesh, setHoveredMesh] = useState<THREE.Mesh | null>(null);
        const [layer, setLayer] = useState<'both' | 'muscles' | 'skeleton'>('both');
        const [xrayOpacity, setXrayOpacity] = useState<number>(1.0);
        const [searchTarget, setSearchTarget] = useState<THREE.Mesh | null>(null);

        // Form State
        // Selected part info
        const [selectedInfo, setSelectedInfo] = useState<{
          name: string;
          anatomicalName: string;
          layer: string;
          side: string;
          tissue?: string;
          fma?: string;
          source?: string;
          group?: string;
          aerospaceNote: string;
        } | null>(null);

        // Search
        const [searchQuery, setSearchQuery] = useState('');
        const [searchResults, setSearchResults] = useState<THREE.Mesh[]>([]);
        const allMeshesRef = useRef<THREE.Mesh[]>([]);

        // Form state
        const [painType, setPainType] = useState<'Sharp' | 'Dull' | 'Burning'>('Dull');
        const [intensity, setIntensity] = useState<number>(4);
        const [notes, setNotes] = useState<string>('Microgravity intervertebral disc expansion ache following cycle ergometer exercise.');
        const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
        const [showLoggedAlert, setShowLoggedAlert] = useState<boolean>(false);

        // Symptom List
        const [notes, setNotes] = useState<string>('');
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [showLoggedAlert, setShowLoggedAlert] = useState(false);
        const [symptoms, setSymptoms] = useState<SymptomReport[]>([]);
        const [isLoadingSymptoms, setIsLoadingSymptoms] = useState<boolean>(true);
        const [isLoadingSymptoms, setIsLoadingSymptoms] = useState(true);

        const fetchSymptoms = async () => {
          // ── Load symptoms
          const fetchSymptoms = useCallback(async () => {
            setIsLoadingSymptoms(true);
            try {
              const res = await fetch('/api/symptoms');
              if (res.ok) {
                const json = await res.json();
                if (json.success && json.data) {
                  setSymptoms(json.data);
                }
                if (json.success && json.data) setSymptoms(json.data);
              }
            } catch (e) {
              console.warn('Failed to load symptoms:', e);
            } finally {
              setIsLoadingSymptoms(false);
            }
          };
        }, []);

        useEffect(() => {
          fetchSymptoms();
          useEffect(() => { fetchSymptoms(); }, [fetchSymptoms]);

          // ── Mesh click handler
          const handleMeshClick = useCallback((mesh: THREE.Mesh) => {
            setSelectedMesh(mesh);
            const ud = mesh.userData;
            const rawName: string = ud.name || mesh.name || 'Unknown structure';
            const displayName = rawName;
            const info = {
              name: displayName,
              anatomicalName: rawName,
              layer: ud.layer || 'unknown',
              side: ud.side || 'midline',
              tissue: ud.tissue,
              fma: ud.fma,
              source: ud.source,
              group: ud.group,
              aerospaceNote: getAerospaceNote(rawName, ud.layer || '', ud.side || '', ud.tissue || ''),
            };
            setSelectedInfo(info);
            setNotes(`Pain/discomfort at ${displayName}. ${ud.tissue === 'bone' ? 'Possible bone stress or reduced BMD from microgravity.' : 'Possible muscle atrophy or strain from spaceflight demands.'}`);
          }, []);

          const handleSelectRegion = (part: string, meshId: string, _point: THREE.Vector3) => {
            setSelectedRegion(part);
            setSelectedMeshId(meshId);
            setSelectedZoneId(meshId);
            // ── Search
            useEffect(() => {
              if (searchQuery.trim().length < 2) {
                setSearchResults([]);
                return;
              }
              const q = searchQuery.trim().toLowerCase();
              const words = q.split(/\s+/);
              const results = allMeshesRef.current
                .filter((m) => {
                  const n = ((m.userData.name || m.name) as string).toLowerCase();
                  return words.every((w) => n.includes(w));
                })
                .slice(0, 12);
              setSearchResults(results);
            }, [searchQuery]);

            const handleSearchSelect = (mesh: THREE.Mesh) => {
              setSearchQuery(mesh.userData.name || mesh.name);
              setSearchResults([]);
              setSearchTarget(mesh);
              handleMeshClick(mesh);
            };

            const handleQuickSelect = (zoneId: string, part: string, defaultType: 'Sharp' | 'Dull' | 'Burning', defaultIntensity: number, defaultNotes: string) => {
              setSelectedRegion(part);
              setSelectedMeshId(zoneId);
              setSelectedZoneId(zoneId);
              setPainType(defaultType);
              setIntensity(defaultIntensity);
              setNotes(defaultNotes);
              // ── Quick zone select
              const handleQuickSelect = (zone: typeof QUICK_ZONES[0]) => {
                const q = zone.search.toLowerCase();
                const found = allMeshesRef.current.find((m) =>
                  ((m.userData.name || m.name) as string).toLowerCase().includes(q)
                );
                if (found) {
                  setSearchTarget(found);
                  handleMeshClick(found);
                }
                setPainType(zone.painType);
                setIntensity(zone.intensity);
                setNotes(zone.notes);
              };

              // ── Collect meshes from scene after load (via callback ref on Canvas)
              const onSceneReady = useCallback((meshes: THREE.Mesh[]) => {
                allMeshesRef.current = meshes;
              }, []);

              // ── Log symptom
              const handleLogSymptom = async (e: React.FormEvent) => {
                e.preventDefault();
                if (!selectedRegion) return;

                if (!selectedInfo) return;
                setIsSubmitting(true);
                try {
                  const res = await fetch('/api/symptoms', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      bodyPart: selectedRegion,
                      meshId: selectedMeshId || 'Manual_Raycast',
                      bodyPart: selectedInfo.name,
                      meshId: selectedMesh?.name || 'ecorche_mesh',
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
                  if (res.ok) setSymptoms((prev) => prev.filter((s) => s.id !== id));
                } catch (err) {
                  console.error('Failed to delete symptom:', err);
                }
              };

              const LAYER_LABEL: Record<string, string> = {
                skeleton: '🦴 Skeleton',
                'deep muscles': '💪 Deep Muscle',
                'superficial muscles': '🔴 Superficial Muscle',
              };

              return (
                <div className="space-y-7 animate-in fade-in duration-300">
                  {/* Top Banner */}
                  <div className="glass-panel glass-panel-glow-cyan p-6 sm:p-7 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#00E5FF]/40 shadow-[0_0_35px_rgba(0,229,255,0.22)]">
                    <div className="space-y-6 animate-in fade-in duration-300">
                      {/* ── Top Banner ── */}
                      <div className="glass-panel glass-panel-glow-cyan p-5 sm:p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#00E5FF]/40 shadow-[0_0_35px_rgba(0,229,255,0.22)]">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/50 flex items-center justify-center text-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.35)] shrink-0">
                            <Activity className="w-7 h-7 text-[#00E5FF]" />
                            <div className="w-11 h-11 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/50 flex items-center justify-center shrink-0">
                              <Activity className="w-6 h-6 text-[#00E5FF]" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Chakra_Petch',sans-serif] tracking-wide">
                                    Interactive 3D Anatomical Body Map
                                    Interactive 3D Anatomy
                                  </h1>
                                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#00E5FF]/20 border border-[#00E5FF]/50 text-[#00E5FF]">
                                    RAYCASTING SENSOR ACTIVE
                                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#00E5FF]/20 border border-[#00E5FF]/50 text-[#00E5FF]">
                                      634 STRUCTURES
                                    </span>
                                </div>
                                <p className="text-sm font-sans text-slate-300 mt-1">
                                  Rotate, zoom, and click any anatomical zone to map physiological symptoms, spinal expansion, or cephalic shifts for <strong className="text-white">{profile.name}</strong>.
                                  <p className="text-sm text-slate-300 mt-0.5">
                                    Click any muscle or bone on the écorché model to log a symptom for <strong className="text-white">{profile.name}</strong>.
                                  </p>
                              </div>
                            </div>

                            {/* Quick Spaceflight Zone Shortcut Buttons */}
                            {/* Quick zone buttons */}
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                onClick={() => handleQuickSelect('spine', 'Lumbar Spine (L1-L5 Microgravity Delta)', 'Dull', 4, 'Microgravity spinal elongation (+4.2cm) intervertebral decompression ache.')}
                                className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(255,140,0,0.2)] cursor-pointer ${selectedZoneId === 'spine' ? 'bg-[#FF8C00] text-black border-[#FF8C00]' : 'bg-[#FF8C00]/20 hover:bg-[#FF8C00]/30 border-[#FF8C00]/60 text-[#FFB347]'
                                  }`}
                              >
                                Spine (+4.2cm)
                              </button>
                              <button
                                onClick={() => handleQuickSelect('cranial', 'Cranial / Sinus (Cephalic Fluid Shift Area)', 'Dull', 3, 'Cephalic fluid shift post-sleep fullness.')}
                                className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,229,255,0.2)] cursor-pointer ${selectedZoneId === 'cranial' ? 'bg-[#00E5FF] text-black border-[#00E5FF]' : 'bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 border-[#00E5FF]/60 text-[#00E5FF]'
                                  }`}
                              >
                                Cephalic Fluid Shift
                              </button>
                              <button
                                onClick={() => handleQuickSelect('right_thigh', 'Right Femoral / Quadriceps', 'Burning', 5, 'Post-ARED squat protocol lactic accumulation.')}
                                className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(244,63,94,0.2)] cursor-pointer ${selectedZoneId === 'right_thigh' ? 'bg-rose-500 text-white border-rose-500' : 'bg-rose-500/20 hover:bg-rose-500/30 border-rose-500/60 text-rose-300'
                                  }`}
                              >
                                Quadriceps Fatigue
                              </button>
                              {QUICK_ZONES.map((z) => (
                                <button
                                  key={z.id}
                                  onClick={() => handleQuickSelect(z)}
                                  className="px-3 py-1.5 rounded-lg border font-mono text-xs font-bold transition-all cursor-pointer bg-[#00E5FF]/10 hover:bg-[#00E5FF]/25 border-[#00E5FF]/50 text-[#00E5FF]"
                                >
                                  {z.label}
                                </button>
                              ))}
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
                                  {/* ── Main Grid ── */}
                                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                                    {/* ── Left: 3D Viewport (8 cols) ── */}
                                    <div className="lg:col-span-8 flex flex-col gap-3">
                                      {/* Controls Bar */}
                                      <div className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-xl bg-[#060b1c]/90 border border-[#00E5FF]/30">
                                        {/* Layer toggle */}
                                        <div className="flex items-center gap-1 bg-slate-900/80 rounded-lg p-1 border border-slate-700">
                                          {(['both', 'muscles', 'skeleton'] as const).map((l) => (
                                            <button
                                              key={l}
                                              onClick={() => setLayer(l)}
                                              className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${layer === l
                                                  ? 'bg-[#00E5FF] text-black shadow-[0_0_12px_rgba(0,229,255,0.5)]'
                                                  : 'text-slate-400 hover:text-white'
                                                }`}
                                            >
                                              {l === 'both' ? 'Both' : l === 'muscles' ? 'Muscles' : 'Skeleton'}
                                            </button>
                                          ))}
                                        </div>

                                        {hoveredPart && (
                                          <div className="px-3.5 py-1.5 rounded-xl bg-[#FF8C00]/25 border border-[#FF8C00]/70 text-white font-mono text-xs font-bold animate-in fade-in shadow-[0_0_18px_rgba(255,140,0,0.35)]">
                                            HOVER: <span className="text-[#FFB347]">{hoveredPart}</span>
                                            {/* X-ray slider */}
                                            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                                              <Eye className="w-3.5 h-3.5 text-[#00E5FF]" />
                                              <span>Outer</span>
                                              <input
                                                type="range"
                                                min="0.08"
                                                max="1"
                                                step="0.01"
                                                value={xrayOpacity}
                                                onChange={(e) => setXrayOpacity(parseFloat(e.target.value))}
                                                className="w-24 accent-[#00E5FF]"
                                                title="Adjust superficial muscle transparency"
                                              />
                                              <span>{Math.round(xrayOpacity * 100)}%</span>
                                            </div>

                                            {/* Hovered label */}
                                            {hoveredMesh && (
                                              <div className="ml-auto px-3 py-1 rounded-lg bg-[#FF8C00]/20 border border-[#FF8C00]/60 text-[#FFB347] font-mono text-xs font-bold">
                                                {hoveredMesh.userData.name || hoveredMesh.name}
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
                                            {/* Search */}
                                            <div className="relative">
                                              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#060b1c]/90 border border-[#00E5FF]/30">
                                                <Search className="w-4 h-4 text-[#00E5FF] shrink-0" />
                                                <input
                                                  type="text"
                                                  value={searchQuery}
                                                  onChange={(e) => setSearchQuery(e.target.value)}
                                                  placeholder="Search any muscle or bone (e.g. 'biceps', 'lumbar', 'femur')…"
                                                  className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm outline-none font-sans"
                                                />
                                                {searchQuery && (
                                                  <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="text-slate-500 hover:text-white">
                                                    <X className="w-4 h-4" />
                                                  </button>
                                                )}
                                              </div>
                                              {searchResults.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-[#0d1526] border border-[#00E5FF]/40 rounded-xl overflow-hidden shadow-2xl max-h-56 overflow-y-auto">
                                                  {searchResults.map((m) => (
                                                    <button
                                                      key={m.uuid}
                                                      onClick={() => handleSearchSelect(m)}
                                                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#00E5FF]/10 transition-colors flex items-center justify-between gap-3"
                                                    >
                                                      <span className="text-white font-sans">{m.userData.name || m.name}</span>
                                                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                                                        {LAYER_LABEL[m.userData.layer] || m.userData.layer}
                                                      </span>
                                                    </button>
                                                  ))}
                                                </div>
                                              )}
                                            </div>

                                            <Suspense
                                              fallback={
                  <ProceduralBodyFallback
                    onSelectRegion={handleSelectRegion}
                    selectedZoneId={selectedZoneId}
                    setSelectedZoneId={setSelectedZoneId}
                    setHoveredPart={setHoveredPart}
          {/* 3D Canvas */}
          <div className="relative rounded-2xl overflow-hidden border border-[#00E5FF]/30 shadow-[0_0_40px_rgba(0,229,255,0.15)] bg-[#060b1c]/90"
               style={{ height: '580px' }}>
            {/* HUD overlays */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-[#00E5FF]/40 text-[#00E5FF] font-mono text-xs font-bold pointer-events-none">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>ÉCORCHÉ · 634 NAMED STRUCTURES</span>
            </div>
            <div className="absolute bottom-3 right-3 z-10 text-[11px] font-mono text-slate-400 bg-slate-950/70 px-2.5 py-1 rounded border border-slate-800 pointer-events-none">
              ORBIT: Left-drag · ZOOM: Scroll · CLICK: Select structure
            </div>

            <Canvas
              camera={{ position: [0.7, 1.2, 2.2], fov: 30 }}
              gl={{ antialias: true }}
              onCreated={({ gl }) => {
                gl.outputColorSpace = THREE.SRGBColorSpace;
                gl.toneMapping = THREE.AgXToneMapping;
                gl.toneMappingExposure = 1.05;
              }}
            >
              <color attach="background" args={['#060b1c']} />
              <ambientLight intensity={0.6} />
              <directionalLight position={[2, 3, 2.5]} intensity={1.6} color="#fff4e8" />
              <directionalLight position={[-2.5, 2, -2.5]} intensity={0.9} color="#e8f0ff" />
              <pointLight position={[0, 2, 1]} intensity={0.5} color="#00e5ff" />

              <Suspense fallback={<LoadingFallback />}>
                <ModelErrorBoundary>
                  <EcorcheModelWrapper
                    layer={layer}
                    xrayOpacity={xrayOpacity}
                    selectedMesh={selectedMesh}
                    hoveredMesh={hoveredMesh}
                    onMeshClick={handleMeshClick}
                    onMeshHover={setHoveredMesh}
                    searchTarget={searchTarget}
                    onMeshesReady={onSceneReady}
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
                minDistance={0.3}
                maxDistance={6}
                target={[0, 0.9, 0]}
                dampingFactor={0.08}
                enableDamping
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
                                              {/* Legend */}
                                              <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400 px-1">
                                                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#ef4444] shadow-[0_0_6px_#ef4444]" />Selected</div>
                                                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#ff8c00] shadow-[0_0_6px_#ff8c00]" />Hovered</div>
                                                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#cc9966]" />Bone (ivory)</div>
                                                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#cc4444]" />Muscle (red)</div>
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
                                                    {/* ── Right: Info + Symptom Form (4 cols) ── */}
                                                    <div className="lg:col-span-4 space-y-5">

                                                      {/* Selected Structure Info Card */}
                                                      <div className="glass-panel rounded-2xl border border-[#00E5FF]/35 shadow-[0_0_30px_rgba(0,229,255,0.15)] overflow-hidden">
                                                        <div className="p-4 border-b border-slate-800/60 flex items-center gap-2">
                                                          <Info className="w-4 h-4 text-[#00E5FF]" />
                                                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#00E5FF]">
                                                            STRUCTURE DETAILS
                                                          </span>
                                                        </div>

                                                        {selectedInfo ? (
                                                          <div className="p-4 space-y-3">
                                                            {/* Name */}
                                                            <div>
                                                              <div className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                                                                SELECTED REGION
                                                                <div className="text-xs font-mono text-slate-400 mb-0.5">Anatomical Name</div>
                                                                <div className="text-lg font-black text-white font-['Chakra_Petch',sans-serif] leading-tight">
                                                                  {selectedInfo.name}
                                                                </div>
                                                                <h3 className="text-xl font-black text-white font-['Chakra_Petch',sans-serif] glow-text-orange tracking-wide">
                                                                  {selectedRegion}
                                                                </h3>
                                                              </div>

                                                              {/* Metadata grid */}
                                                              <div className="grid grid-cols-2 gap-2 text-xs">
                                                                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                                                                  <div className="text-slate-500 font-mono">Layer</div>
                                                                  <div className="text-white font-semibold mt-0.5">{LAYER_LABEL[selectedInfo.layer] || selectedInfo.layer}</div>
                                                                </div>
                                                                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                                                                  <div className="text-slate-500 font-mono">Side</div>
                                                                  <div className="text-white font-semibold mt-0.5 capitalize">{selectedInfo.side}</div>
                                                                </div>
                                                                {selectedInfo.tissue && (
                                                                  <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                                                                    <div className="text-slate-500 font-mono">Tissue</div>
                                                                    <div className="text-white font-semibold mt-0.5 capitalize">{selectedInfo.tissue}</div>
                                                                  </div>
                                                                )}
                                                                {selectedInfo.fma && (
                                                                  <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                                                                    <div className="text-slate-500 font-mono">FMA ID</div>
                                                                    <div className="text-[#00E5FF] font-mono text-[11px] mt-0.5">{selectedInfo.fma}</div>
                                                                  </div>
                                                                )}
                                                                {selectedInfo.group && (
                                                                  <div className="col-span-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                                                                    <div className="text-slate-500 font-mono">Part of</div>
                                                                    <div className="text-white font-semibold mt-0.5">{selectedInfo.group}</div>
                                                                  </div>
                                                                )}
                                                              </div>

                                                              {/* Aerospace note */}
                                                              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30">
                                                                <div className="flex items-center gap-1.5 mb-1.5">
                                                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                                                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                                                                    Spaceflight Clinical Note
                                                                  </span>
                                                                </div>
                                                                <p className="text-xs text-amber-100/80 leading-relaxed font-sans">
                                                                  {selectedInfo.aerospaceNote}
                                                                </p>
                                                              </div>
                                                            </div>
                                                            ) : (
                                                            <div className="p-8 text-center">
                                                              <Activity className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                                                              <p className="text-sm text-slate-500 font-sans">
                                                                Click any muscle or bone on the 3D model to see detailed anatomical information.
                                                              </p>
                                                            </div>
            )}
                                                          </div>

          {/* Symptom Logging Form */}
                                                        <div className="glass-panel glass-panel-glow-orange p-5 rounded-2xl border border-[#FF8C00]/40 shadow-[0_0_30px_rgba(255,140,0,0.18)] space-y-4">
                                                          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                                                            <Flame className="w-4 h-4 text-[#FF8C00]" />
                                                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF8C00]">
                                                              LOG SYMPTOM TO TELEMETRY
                                                            </span>
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
                                                                    {!selectedInfo && (
                                                                      <p className="text-xs text-slate-500 font-sans text-center py-2">
                                                                        Select a structure on the 3D model first.
                                                                      </p>
                                                                    )
                                                                }

            { selectedInfo && (
                                                                    <form onSubmit={handleLogSymptom} className="space-y-4">
                                                                      {/* Selected part display */}
                                                                      <div className="px-3 py-2 rounded-lg bg-[#FF8C00]/10 border border-[#FF8C00]/30 text-sm font-bold text-white font-['Chakra_Petch',sans-serif]">
                                                                        {selectedInfo.name}
                                                                      </div>

                                                                      {/* Pain type */}
                                                                      <div>
                                                                        <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-200 mb-2">
                                                                          Pain Type
                                                                        </label>
                                                                        <div className="grid grid-cols-3 gap-2">
                                                                          {(['Sharp', 'Dull', 'Burning'] as const).map((type) => (
                                                                            <button
                                                                              key={type}
                                                                              type="button"
                                                                              key={type}
                                                                              onClick={() => setPainType(type)}
                                                                              className={`py-2.5 px-3 rounded-xl font-mono text-xs sm:text-sm font-bold border transition-all ${isSelected
                                                                                  ? 'bg-[#FF8C00] text-black border-[#FF8C00] shadow-[0_0_18px_rgba(255,140,0,0.5)]'
                        className={`py-2 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer ${painType === type
                                                                                  ? 'bg-[#FF8C00] text-black border-[#FF8C00] shadow-[0_0_15px_rgba(255,140,0,0.4)]'
                                                                                  : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:border-slate-500'
                                                                                }`}
                                                                            >
                                                                              {type}
                                                                            </button>
                                                                          );
                  })}
                    ))}
                                                                        </div>
                                                                      </div>
                                                                    </div>

              {/* 2. Pain Intensity Slider (0-10) */ }
                                                                  < div >
                                                                  <div className="flex items-center justify-between mb-2">
                                                                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                                                                      2. Pain Intensity (0 - 10)
                                                                      {/* Intensity */}
                                                                      <div>
                                                                        <div className="flex items-center justify-between mb-2">
                                                                          <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                                                                            Intensity (0–10)
                                                                          </label>
                                                                          <span className={`text-sm font-black font-mono px-2 py-0.5 rounded ${intensity > 6
                                                                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
                                                                              : 'bg-[#FF8C00]/20 text-[#FF8C00] border border-[#FF8C00]/50'
                                                                            }`}>
                                                                            {intensity} / 10
                                                                          </span>
                                                                        </div>
                                                                        <input
                                                                          type="range" min="0" max="10" value={intensity}
                                                                          onChange={(e) => setIntensity(parseInt(e.target.value, 10))}
                                                                          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#FF8C00]"
                                                                        />
                                                                        <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                                                                          <span>No Pain</span><span>Moderate</span><span>Severe</span>
                                                                        </div>
                                                                      </div>

                                                                      {/* Notes */}
                                                                      <div>
                                                                        <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-200 mb-2">
                                                                          Notes
                                                                        </label>
                                                                        <span className={`text-base font-black font-mono px-2.5 py-0.5 rounded ${intensity > 6 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50' : 'bg-[#FF8C00]/20 text-[#FF8C00] border border-[#FF8C00]/50'
                                                                          }`}>
                                                                          {intensity} / 10
                                                                        </span>
                                                                        <textarea
                                                                          rows={3}
                                                                          value={notes}
                                                                          onChange={(e) => setNotes(e.target.value)}
                                                                          placeholder="Describe pain onset, relation to EVA/ARED exercise, duration…"
                                                                          className="w-full bg-slate-900/90 text-white placeholder-slate-500 border border-slate-700 focus:border-[#FF8C00] rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF8C00] font-sans resize-none"
                                                                        />
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

              {/* 3. Notes Text Area */ }
                                                                  < div >
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
                                                              <button
                                                                type="submit"
                                                                disabled={isSubmitting}
                                                                className="w-full py-3 rounded-xl bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-black font-mono font-extrabold text-sm tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(255,140,0,0.4)] disabled:opacity-50 cursor-pointer"
                                                              >
                                                                <Plus className="w-4 h-4" />
                                                                {isSubmitting ? 'LOGGING…' : 'LOG SYMPTOM'}
                                                              </button>
                                                          </form>
            )}

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
                                                            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-mono text-xs flex items-center gap-2 animate-in fade-in">
                                                              <Check className="w-4 h-4 shrink-0" />
                                                              <span>Symptom logged to Flight Telemetry Registry!</span>
                                                            </div>
            )}
                                                          </div>

          {/* Panel 2: Logged Symptoms List */}
                                                        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                                                          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                                            <div className="text-xs font-mono uppercase tracking-wider text-slate-200 font-bold flex items-center gap-2">
                                                              {/* Active Symptoms */}
                                                              <div className="glass-panel p-5 rounded-2xl border border-slate-700/60 space-y-3">
                                                                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                                                                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                                                                    <Layers className="w-4 h-4 text-[#00E5FF]" />
                                                                    <span>ACTIVE CLINICAL REPORTS ({symptoms.length})</span>
                                                                    <span>ACTIVE REPORTS ({symptoms.length})</span>
                                                                  </div>
                                                                  <span className="text-[11px] font-mono text-[#00E5FF]">JSC TELEMEDICINE SYNCED</span>
                                                                  <span className="text-[10px] font-mono text-[#00E5FF]">JSC SYNCED</span>
                                                                </div>

                                                                {isLoadingSymptoms ? (
              <div className="py-6 text-center text-xs font-mono text-slate-400">Loading symptoms...</div>
              <div className="py-4 text-center text-xs font-mono text-slate-500">Loading…</div>
                                                                ) : symptoms.length === 0 ? (
                                                                  <div className="py-6 text-center text-xs font-mono text-slate-400">
                                                                    No active symptoms logged. Click on the 3D body to add one.
                                                                    <div className="py-4 text-center text-xs font-mono text-slate-500">
                                                                      No active symptoms. Click a structure on the model to log one.
                                                                    </div>
                                                                    ) : (
                                                                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                                                                      <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                                                                        {symptoms.map((sym) => (
                                                                          <div
                                                                            key={sym.id}
                                                                            className="p-3.5 rounded-xl bg-[#091128] border border-slate-700/80 flex items-start justify-between gap-3 text-xs"
                                                                            className="p-3 rounded-xl bg-[#091128] border border-slate-700/70 flex items-start justify-between gap-3 text-xs"
                                                                          >
                                                                            <div className="space-y-1">
                                                                              <div className="flex items-center gap-2">
                                                                                <span className="font-bold text-white font-['Chakra_Petch',sans-serif] text-sm">
                                                                                  <div className="space-y-1 min-w-0">
                                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                                      <span className="font-bold text-white font-['Chakra_Petch',sans-serif] text-sm truncate">
                                                                                        {sym.bodyPart}
                                                                                      </span>
                                                                                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-[#FF8C00]/20 text-[#FF8C00] border border-[#FF8C00]/40">
                                                                                        {sym.painType} ({sym.intensity}/10)
                                                                                        <span className="px-1.5 py-0.5 rounded font-mono text-[10px] font-bold bg-[#FF8C00]/20 text-[#FF8C00] border border-[#FF8C00]/40 shrink-0">
                                                                                          {sym.painType} {sym.intensity}/10
                                                                                        </span>
                                                                                    </div>
                                                                                    <p className="text-slate-300 font-sans line-clamp-2">{sym.notes}</p>
                                                                                    <div className="text-[10px] font-mono text-slate-400">
                                                                                      {new Date(sym.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {sym.id}
                                                                                    </div>
                                                                                    <p className="text-slate-400 font-sans line-clamp-2 text-[11px]">{sym.notes}</p>
                                                                                  </div>

                                                                                  <button
                                                                                    onClick={() => handleDeleteSymptom(sym.id)}
                                                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition-colors"
                                                                                    title="Resolve or remove symptom report"
                                                                                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/15 transition-colors shrink-0"
                                                                                    title="Remove report"
                                                                                  >
                                                                                    <Trash2 className="w-4 h-4" />
                                                                                    <Trash2 className="w-3.5 h-3.5" />
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

                                                                // ─── Wrapper to expose meshes after scene load ────────────────────────────────

                                                                function EcorcheModelWrapper({
                                                                  onMeshesReady,
  ...props
}: EcorcheModelProps & {onMeshesReady: (meshes: THREE.Mesh[]) => void }) {
  const gltf = useLoader(
                                                                GLTFLoader,
                                                                ECORCHE_MODEL_URL,
    (loader) => {(loader as any).setMeshoptDecoder(MeshoptDecoder); }
                                                                );

                                                                const {camera, controls: orbitRef } = useThree();
                                                                const meshesRef = useRef<THREE.Mesh[]>([]);
                                                                const skeletonMeshesRef = useRef<THREE.Mesh[]>([]);
                                                                const deepMeshesRef = useRef<THREE.Mesh[]>([]);
                                                                const superficialMeshesRef = useRef<THREE.Mesh[]>([]);
                                                                const outerMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
                                                                const matsRef = useRef<Record<string, THREE.MeshStandardMaterial>>({ });

  const clonedScene = useMemo(() => {
    const clone = gltf.scene.clone(true);
                                                                  const all: THREE.Mesh[] = [];
                                                                  const skel: THREE.Mesh[] = [];
                                                                  const deep: THREE.Mesh[] = [];
                                                                  const sup: THREE.Mesh[] = [];

                                                                  // Grab base materials from original scene
                                                                  const baseMats: Record<string, THREE.MeshStandardMaterial> = { };
    gltf.scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        const m = o as THREE.Mesh;
                                                                  const mat = Array.isArray(m.material) ? m.material[0] : m.material;
                                                                  if (mat && !baseMats[mat.name]) baseMats[mat.name] = mat as THREE.MeshStandardMaterial;
      }
    });

                                                                  const boneMat: THREE.MeshStandardMaterial = (baseMats['Bone'] || new THREE.MeshStandardMaterial()).clone() as THREE.MeshStandardMaterial;
                                                                  boneMat.name = 'Bone'; boneMat.vertexColors = true;
                                                                  const muscleMat: THREE.MeshStandardMaterial = (baseMats['Muscle'] || new THREE.MeshStandardMaterial()).clone() as THREE.MeshStandardMaterial;
                                                                  muscleMat.name = 'Muscle'; muscleMat.vertexColors = true;
                                                                  const outerMat: THREE.MeshStandardMaterial = muscleMat.clone() as THREE.MeshStandardMaterial;
                                                                  outerMat.name = 'Outer'; outerMat.vertexColors = true;
                                                                  outerMat.transparent = false; outerMat.opacity = 1.0; outerMat.depthWrite = true;
                                                                  outerMatRef.current = outerMat;
                                                                  matsRef.current = {Bone: boneMat, Muscle: muscleMat, Outer: outerMat };

                                                                  // Map original userData to cloned nodes by matching node names
                                                                  const origByName: Record<string, THREE.Object3D> = { };
    gltf.scene.traverse((o) => {origByName[o.name] = o; });

    clone.traverse((o) => {
      if (!(o as THREE.Mesh).isMesh) return;
                                                                  const m = o as THREE.Mesh;
                                                                  const orig = origByName[m.name];
                                                                  if (orig) m.userData = {...orig.userData};
                                                                  const lyr: string = m.userData?.layer || '';
                                                                  m.userData._baseMat = lyr === 'skeleton' ? 'Bone' : lyr === 'superficial muscles' ? 'Outer' : 'Muscle';
                                                                  if (lyr === 'skeleton') {m.material = boneMat; skel.push(m); }
                                                                  else if (lyr === 'deep muscles') {m.material = muscleMat; deep.push(m); }
                                                                  else {m.material = outerMat; sup.push(m); }
                                                                  all.push(m);
    });

                                                                  meshesRef.current = all;
                                                                  skeletonMeshesRef.current = skel;
                                                                  deepMeshesRef.current = deep;
                                                                  superficialMeshesRef.current = sup;

                                                                  return clone;
  }, [gltf.scene]);

  // Notify parent once meshes are ready
  useEffect(() => {
    if (meshesRef.current.length > 0) onMeshesReady(meshesRef.current);
  }, [clonedScene, onMeshesReady]);

  // Layer visibility
  useEffect(() => {
                                                                    skeletonMeshesRef.current.forEach((m) => { m.visible = props.layer !== 'muscles'; });
    deepMeshesRef.current.forEach((m) => {m.visible = props.layer !== 'skeleton'; });
    superficialMeshesRef.current.forEach((m) => {m.visible = props.layer !== 'skeleton'; });
  }, [props.layer]);

  // X-ray
  useEffect(() => {
    if (!outerMatRef.current) return;
                                                                  const v = props.xrayOpacity;
                                                                  outerMatRef.current.transparent = v < 1;
                                                                  outerMatRef.current.opacity = v;
    outerMatRef.current.depthWrite = v >= 1;
                                                                  outerMatRef.current.needsUpdate = true;
  }, [props.xrayOpacity]);

  // Highlight materials
  useEffect(() => {
                                                                    meshesRef.current.forEach((m) => {
                                                                      const base = m.userData._baseMat as string;
                                                                      const baseMat = matsRef.current[base];
                                                                      if (!baseMat) return;
                                                                      if (m === props.selectedMesh) {
                                                                        const sel = baseMat.clone() as THREE.MeshStandardMaterial;
                                                                        sel.vertexColors = false;
                                                                        sel.color = new THREE.Color(0xef4444);
                                                                        sel.emissive = new THREE.Color(0xdc2626);
                                                                        sel.emissiveIntensity = 0.5;
                                                                        sel.transparent = false; sel.opacity = 1;
                                                                        m.material = sel;
                                                                      } else if (m === props.hoveredMesh) {
                                                                        const hov = baseMat.clone() as THREE.MeshStandardMaterial;
                                                                        hov.vertexColors = false;
                                                                        hov.color = new THREE.Color(0xff8c00);
                                                                        hov.emissive = new THREE.Color(0xea580c);
                                                                        hov.emissiveIntensity = 0.4;
                                                                        hov.transparent = base === 'Outer' ? outerMatRef.current!.transparent : false;
                                                                        hov.opacity = base === 'Outer' ? outerMatRef.current!.opacity : 1;
                                                                        m.material = hov;
                                                                      } else {
                                                                        m.material = baseMat;
                                                                      }
                                                                    });
  }, [props.selectedMesh, props.hoveredMesh, props.xrayOpacity]);

  // Camera fly-to
  useEffect(() => {
    if (!props.searchTarget || !orbitRef) return;
                                                                  const box = new THREE.Box3().setFromObject(props.searchTarget);
                                                                  const center = box.getCenter(new THREE.Vector3());
                                                                  const size = box.getSize(new THREE.Vector3()).length();
                                                                  const r = Math.max(0.05, size * 1.6);
                                                                  const dir = new THREE.Vector3(center.x, 0, center.z + 0.1).normalize().setY(0.2).normalize();
                                                                  const targetPos = center.clone().addScaledVector(dir, r / Math.tan((30 * Math.PI) / 360 * Math.PI));
                                                                  // @ts-ignore
                                                                  orbitRef.target.lerp(center, 1);
                                                                  camera.position.lerp(targetPos, 1);
                                                                  // @ts-ignore
                                                                  orbitRef.update();
  }, [props.searchTarget, camera, orbitRef]);

                                                                  const handlePointerDown = useRef<{ x: number; y: number } | null>(null);

                                                                  return (
                                                                  <primitive
                                                                    object={clonedScene}
                                                                    onPointerDown={(e: any) => { handlePointerDown.current = { x: e.clientX, y: e.clientY }; }}
                                                                    onPointerUp={(e: any) => {
                                                                      const down = handlePointerDown.current;
                                                                      if (!down) return;
                                                                      if (Math.hypot(e.clientX - down.x, e.clientY - down.y) < 5 && e.object?.isMesh) {
                                                                        e.stopPropagation();
                                                                        props.onMeshClick(e.object as THREE.Mesh);
                                                                      }
                                                                      handlePointerDown.current = null;
                                                                    }}
                                                                    onPointerOver={(e: any) => { if (e.object?.isMesh) { e.stopPropagation(); props.onMeshHover(e.object as THREE.Mesh); } }}
                                                                    onPointerOut={() => props.onMeshHover(null)}
                                                                  />
                                                                  );
}
