"use client";

/**
 * The WebGL half of Synapse OS. Loaded lazily and only on the client; nothing
 * outside this folder imports three.js, so Focus Mode never pays for it.
 */
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { nodeById, nodeOf, nodes, STATE_LEVEL, visualStates, type GraphNode, type NodeId, type Selection } from "@/content/graph";
import { dustGeometry, filamentGeometry, nodeSeed, somaGeometry } from "./geometry";
import { filamentFragment, filamentVertex, PALETTE, somaFragment, somaVertex } from "./shaders";

export type NeuralSceneProps = {
  selection: Selection;
  hovered: NodeId | null;
  onHover: (id: NodeId | null) => void;
  onSelect: (id: NodeId) => void;
  reduced: boolean;
  compact: boolean;
  /** Fraction of the viewport width the scene shifts left (negative: right) to stay clear of the UI. */
  shift: number;
  /** Fraction of the viewport height the scene shifts up. */
  lift: number;
  labels: RefObject<Map<NodeId, HTMLElement>>;
};

type Quality = "high" | "low";
type Shared = { reduced: boolean; density: number };

const INTRO_SECONDS = 2.2;
const smooth = (t: number) => t * t * (3 - 2 * t);

function useColors() {
  return useMemo(
    () => ({
      uIce: { value: new THREE.Color(PALETTE.ice) },
      uCyan: { value: new THREE.Color(PALETTE.cyan) },
      uViolet: { value: new THREE.Color(PALETTE.violet) },
    }),
    [],
  );
}

function Soma({ node, level, shared }: { node: GraphNode; level: number; shared: Shared }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const geometry = useMemo(() => somaGeometry(node.kind, node.radius, nodeSeed(node.id)), [node]);
  const colors = useColors();
  const uniforms = useMemo(
    () => ({ ...colors, uTime: { value: 0 }, uState: { value: 1 }, uIntro: { value: 0 }, uPx: { value: 1 }, uDensity: { value: 1 } }),
    [colors],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state, dt) => {
    const u = material.current?.uniforms;
    if (!u) return;
    const t = state.clock.elapsedTime;
    u.uTime.value = shared.reduced ? 0 : t;
    u.uIntro.value = shared.reduced ? 1 : smooth(Math.min(1, t / INTRO_SECONDS));
    u.uState.value += (level - u.uState.value) * (shared.reduced ? 1 : 1 - Math.exp(-dt * 6));
    u.uPx.value = state.viewport.dpr * (state.size.height / 900);
    u.uDensity.value = shared.density;
  });

  return (
    <points position={node.position as [number, number, number]} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        vertexShader={somaVertex}
        fragmentShader={somaFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Dust({ shared }: { shared: Shared }) {
  const points = useRef<THREE.Points>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const geometry = useMemo(() => dustGeometry(), []);
  const colors = useColors();
  const uniforms = useMemo(
    () => ({ ...colors, uTime: { value: 0 }, uState: { value: 0.55 }, uIntro: { value: 1 }, uPx: { value: 1 }, uDensity: { value: 1 } }),
    [colors],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state) => {
    const u = material.current?.uniforms;
    if (!u || !points.current) return;
    u.uPx.value = state.viewport.dpr * (state.size.height / 900);
    u.uDensity.value = shared.density;
    if (!shared.reduced) points.current.rotation.y = state.clock.elapsedTime * 0.012;
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        vertexShader={somaVertex}
        fragmentShader={somaFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Filaments({ edgeLevel, focus, shared }: { edgeLevel: Record<string, number>; focus: NodeId; shared: Shared }) {
  const lines = useRef<THREE.LineSegments>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const { geometry, ranges } = useMemo(() => filamentGeometry(), []);
  const current = useRef<number[]>(ranges.map(() => 1));
  const colors = useColors();
  const uniforms = useMemo(() => ({ ...colors, uTime: { value: 0 }, uIntro: { value: 0 }, uMotion: { value: 1 } }), [colors]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  // Pulses travel away from the focused node, so the direction of each strand follows the selection.
  useEffect(() => {
    const dir = lines.current?.geometry.getAttribute("aDir") as THREE.BufferAttribute | undefined;
    if (!dir) return;
    for (const r of ranges) {
      const value = r.to === focus ? -1 : 1;
      for (let i = 0; i < r.count; i += 1) dir.setX(r.start + i, value);
    }
    dir.needsUpdate = true;
  }, [focus, ranges]);

  useFrame((state, dt) => {
    const u = material.current?.uniforms;
    const attr = lines.current?.geometry.getAttribute("aState") as THREE.BufferAttribute | undefined;
    if (!u || !attr) return;
    const t = state.clock.elapsedTime;
    u.uTime.value = shared.reduced ? 0 : t;
    u.uMotion.value = shared.reduced ? 0 : 1;
    u.uIntro.value = shared.reduced ? 1 : smooth(Math.min(1, t / INTRO_SECONDS));
    const k = shared.reduced ? 1 : 1 - Math.exp(-dt * 6);
    let dirty = false;
    ranges.forEach((r, index) => {
      const target = edgeLevel[r.id] ?? 1;
      const now = current.current[index];
      if (Math.abs(target - now) < 0.002) return;
      const next = now + (target - now) * k;
      current.current[index] = next;
      for (let i = 0; i < r.count; i += 1) attr.setX(r.start + i, next);
      dirty = true;
    });
    if (dirty) attr.needsUpdate = true;
  });

  return (
    <lineSegments ref={lines} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        vertexShader={filamentVertex}
        fragmentShader={filamentFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}

/** Invisible spheres that make each neuron hoverable and clickable. */
function HitTargets({ onHover, onSelect }: Pick<NeuralSceneProps, "onHover" | "onSelect">) {
  return (
    <>
      {nodes.map((node) => (
        <mesh
          key={node.id}
          position={node.position as [number, number, number]}
          onPointerOver={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            onHover(node.id);
          }}
          onPointerOut={() => onHover(null)}
          onClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation();
            onSelect(node.id);
          }}
        >
          <sphereGeometry args={[node.radius * 1.5, 12, 12]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}

function cameraPose(selection: Selection, aspect: number) {
  const pull = Math.max(1, Math.min(1.45, 1.3 / aspect));
  const focus = nodeById[nodeOf(selection)];
  const p = new THREE.Vector3(...focus.position);
  if (selection === "core") return { position: new THREE.Vector3(0, 0.2, 15 * pull), look: new THREE.Vector3(0, 0, 0) };
  if (selection === "about") return { position: new THREE.Vector3(0, 0, 6.5 * pull), look: new THREE.Vector3(0, 0, 0) };
  if (focus.kind === "project") return { position: p.clone().multiplyScalar(0.9).add(new THREE.Vector3(0, 0.3, 7.2 * pull)), look: p.clone().multiplyScalar(0.9) };
  return { position: p.clone().multiplyScalar(0.45).add(new THREE.Vector3(0, 0, 11 * pull)), look: p.clone().multiplyScalar(0.5) };
}

/** Moves the camera, positions the HTML labels, and watches frame time. */
function Rig({ selection, reduced, shift, lift, labels, onSlow }: Pick<NeuralSceneProps, "selection" | "reduced" | "shift" | "lift" | "labels"> & { onSlow: () => void }) {
  const size = useThree((s) => s.size);
  const pose = useMemo(() => cameraPose(selection, size.width / size.height), [selection, size.width, size.height]);
  const position = useRef(new THREE.Vector3(0, 0.2, 30));
  const look = useRef(new THREE.Vector3());
  const offset = useRef({ x: 0, y: 0 });
  const frames = useRef({ count: 0, total: 0, reported: false });
  const scratch = useRef(new THREE.Vector3());

  useFrame((state, dt) => {
    const camera = state.camera as THREE.PerspectiveCamera;
    const k = reduced ? 1 : 1 - Math.exp(-dt * 2.8);
    position.current.lerp(pose.position, k);
    look.current.lerp(pose.look, k);
    offset.current.x += (shift * state.size.width - offset.current.x) * k;
    offset.current.y += (lift * state.size.height - offset.current.y) * k;

    camera.position.copy(position.current);
    if (!reduced) {
      camera.position.x += state.pointer.x * 0.35;
      camera.position.y += state.pointer.y * 0.22;
    }
    camera.lookAt(look.current);
    camera.setViewOffset(state.size.width, state.size.height, offset.current.x, offset.current.y, state.size.width, state.size.height);
    camera.updateMatrixWorld();

    const perUnit = state.size.height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    labels.current?.forEach((el, id) => {
      const node = nodeById[id];
      const v = scratch.current.set(...node.position);
      const distance = camera.position.distanceTo(v);
      v.project(camera);
      if (v.z > 1) {
        el.style.visibility = "hidden";
        return;
      }
      const x = (v.x * 0.5 + 0.5) * state.size.width;
      const y = (-v.y * 0.5 + 0.5) * state.size.height + (node.radius * 1.15 * perUnit) / distance + 4;
      el.style.visibility = "visible";
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translateX(-50%)`;
      el.style.setProperty("--depth", THREE.MathUtils.clamp(1.5 - distance / 16, 0.55, 1).toFixed(2));
    });

    // After the intro settles, sample ~2 seconds of frames; if the device is struggling, drop quality once.
    const f = frames.current;
    if (!reduced && !f.reported && state.clock.elapsedTime > INTRO_SECONDS) {
      f.count += 1;
      f.total += dt;
      if (f.count === 120) {
        f.reported = true;
        if (f.total / f.count > 1 / 42) onSlow();
      }
    }
  });
  return null;
}

export default function NeuralScene(props: NeuralSceneProps) {
  const { selection, hovered, reduced, compact } = props;
  const [quality, setQuality] = useState<Quality>("high");
  const { nodeState, edgeState } = useMemo(() => visualStates(selection, hovered), [selection, hovered]);
  const edgeLevel = useMemo(() => Object.fromEntries(Object.entries(edgeState).map(([id, s]) => [id, STATE_LEVEL[s]])), [edgeState]);
  const shared = useMemo<Shared>(
    () => ({ reduced, density: quality === "low" ? 0.5 : compact ? 0.75 : 1 }),
    [reduced, quality, compact],
  );

  return (
    <Canvas
      camera={{ fov: 42, near: 0.1, far: 80, position: [0, 0.2, 30] }}
      dpr={quality === "low" ? 1 : [1, 1.75]}
      frameloop={reduced ? "demand" : "always"}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      aria-hidden="true"
    >
      <Rig selection={selection} reduced={reduced} shift={props.shift} lift={props.lift} labels={props.labels} onSlow={() => setQuality("low")} />
      <Dust shared={shared} />
      <Filaments edgeLevel={edgeLevel} focus={nodeOf(selection)} shared={shared} />
      {nodes.map((node) => (
        <Soma key={node.id} node={node} level={STATE_LEVEL[nodeState[node.id]]} shared={shared} />
      ))}
      <HitTargets onHover={props.onHover} onSelect={props.onSelect} />
    </Canvas>
  );
}
