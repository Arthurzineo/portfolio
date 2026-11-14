"use client";

/**
 * The WebGL half of Synapse OS. Loaded lazily and only on the client; nothing
 * outside this folder imports three.js, so Focus Mode never pays for it.
 */
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import * as THREE from "three";
import { nodeById, nodeOf, nodes, STATE_LEVEL, visualStates, type GraphNode, type NodeId, type Selection } from "@/content/graph";
import { dustGeometry, filamentGeometry, nodeSeed, somaGeometry } from "./geometry";
import { backdropFragment, backdropVertex, filamentFragment, filamentVertex, MAX_GLOW, PALETTE, somaFragment, somaVertex } from "./shaders";

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
  /** Called once if the device cannot hold the frame rate, so the shell can drop its decorative layers too. */
  onSlow?: () => void;
};

type Quality = "high" | "low";
/** `clock` is the intro time in seconds, advanced by Rig with clamped frame deltas so a slow first frame (shader compilation) cannot skip the opening. */
type Shared = { reduced: boolean; density: number; clock: { current: number } };
/** Screen position and radius of every node, written by Rig each frame and read by Backdrop. */
type GlowBuffer = { current: Float32Array };

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/**
 * Opening sequence ("Neural Awakening"), in seconds from mount:
 * 0.0-0.7 every neuron is packed into one bright mass at the centre;
 * 0.7-2.3 the mass bursts outward to the authored positions, with a flash and a shockwave;
 * 0.9-2.8 neurons unfold and the connections trace out from their sources; labels fade in last.
 * The whole graph scales uniformly from the origin, so filaments stay attached to their nodes throughout.
 */
const CHARGE = 0.7;
const INTRO_SECONDS = 3;
const intro = {
  burst: (t: number) => (t < CHARGE ? 0.03 + 0.03 * (t / CHARGE) : 0.06 + 0.94 * (1 - Math.pow(2, -10 * clamp01((t - CHARGE) / 1.6)))),
  bloom: (t: number) => 0.15 + 0.85 * smooth(clamp01((t - 0.9) / 1.6)),
  trace: (t: number) => smooth(clamp01((t - 0.9) / 1.9)),
  shock: (t: number) => clamp01((t - CHARGE) / 1.5),
  flash: (t: number) => Math.exp(-Math.pow((t - CHARGE - 0.05) / 0.22, 2)),
  labels: (t: number) => smooth(clamp01((t - 1.9) / 0.9)),
};

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
    u.uTime.value = shared.reduced ? 0 : state.clock.elapsedTime;
    u.uIntro.value = shared.reduced ? 1 : intro.bloom(shared.clock.current);
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
    u.uTime.value = shared.reduced ? 0 : state.clock.elapsedTime;
    u.uMotion.value = shared.reduced ? 0 : 1;
    u.uIntro.value = shared.reduced ? 1 : intro.trace(shared.clock.current);
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

/** Full-screen light pass: every neuron glows onto the background according to its state. */
function Backdrop({ levels, glow, shared }: { levels: number[]; glow: GlowBuffer; shared: Shared }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const colors = useColors();
  const uniforms = useMemo(
    () => ({
      ...colors,
      uNodes: { value: Array.from({ length: MAX_GLOW }, () => new THREE.Vector4(0, 0, 1, 0)) },
      uCount: { value: Math.min(nodes.length, MAX_GLOW) },
      uTime: { value: 0 },
      uHeight: { value: 900 },
      uCore: { value: new THREE.Vector2() },
      uShock: { value: 0 },
      uGlow: { value: 1 },
      uFlash: { value: 0 },
    }),
    [colors],
  );

  useFrame((state, dt) => {
    const u = material.current?.uniforms;
    if (!u) return;
    const t = shared.clock.current;
    const k = shared.reduced ? 1 : 1 - Math.exp(-dt * 4);
    const list = u.uNodes.value as THREE.Vector4[];
    for (let i = 0; i < u.uCount.value; i += 1) {
      const v = list[i];
      v.x = glow.current[i * 3];
      v.y = glow.current[i * 3 + 1];
      v.z = Math.max(1, glow.current[i * 3 + 2]);
      v.w += (levels[i] - v.w) * k;
    }
    u.uTime.value = shared.reduced ? 0 : t;
    u.uCore.value.set(glow.current[0], glow.current[1]);
    u.uShock.value = shared.reduced ? 0 : intro.shock(t);
    u.uGlow.value = shared.reduced ? 1 : 0.12 + 0.88 * intro.trace(t);
    u.uFlash.value = shared.reduced ? 0 : intro.flash(t);
    u.uHeight.value = state.size.height * state.viewport.dpr;
  });

  return (
    <mesh frustumCulled={false} renderOrder={-10}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        vertexShader={backdropVertex}
        fragmentShader={backdropFragment}
        uniforms={uniforms}
        transparent
        depthTest={false}
        depthWrite={false}
        blending={THREE.CustomBlending}
        blendSrc={THREE.OneFactor}
        blendDst={THREE.OneFactor}
      />
    </mesh>
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

/** Scales the whole graph from the origin during the opening burst. */
function Burst({ shared, children }: { shared: Shared; children: ReactNode }) {
  const group = useRef<THREE.Group>(null);
  useFrame(() => {
    group.current?.scale.setScalar(shared.reduced ? 1 : intro.burst(shared.clock.current));
  });
  return <group ref={group}>{children}</group>;
}

function cameraPose(selection: Selection, aspect: number) {
  const pull = Math.max(1, Math.min(1.45, 1.3 / aspect));
  const focus = nodeById[nodeOf(selection)];
  const p = new THREE.Vector3(...focus.position);
  if (selection === "core") return { position: new THREE.Vector3(0, 0.2, 15 * pull), look: new THREE.Vector3(0, 0, 0) };
  if (selection === "about") return { position: new THREE.Vector3(0, 0, 6.5 * pull), look: new THREE.Vector3(0, 0, 0) };
  if (focus.kind === "project" || focus.kind === "item") return { position: p.clone().multiplyScalar(0.9).add(new THREE.Vector3(0, 0.3, 7.2 * pull)), look: p.clone().multiplyScalar(0.9) };
  return { position: p.clone().multiplyScalar(0.45).add(new THREE.Vector3(0, 0, 11 * pull)), look: p.clone().multiplyScalar(0.5) };
}

/** Moves the camera, positions the HTML labels, and watches frame time. */
function Rig({ selection, reduced, shift, lift, labels, glow, clockRef, onSlow }: Pick<NeuralSceneProps, "selection" | "reduced" | "shift" | "lift" | "labels"> & { glow: GlowBuffer; clockRef: RefObject<number>; onSlow: () => void }) {
  const size = useThree((s) => s.size);
  const pose = useMemo(() => cameraPose(selection, size.width / size.height), [selection, size.width, size.height]);
  const position = useRef(new THREE.Vector3(0, 0.1, 6));
  const look = useRef(new THREE.Vector3());
  const offset = useRef({ x: 0, y: 0 });
  const frames = useRef({ count: 0, total: 0, reported: false });
  const scratch = useRef(new THREE.Vector3());

  useFrame((state, dt) => {
    const camera = state.camera as THREE.PerspectiveCamera;
    clockRef.current += Math.min(dt, 1 / 12);
    const t = clockRef.current;
    const burst = reduced ? 1 : intro.burst(t);
    const labelFade = reduced ? 1 : intro.labels(t);
    // Hold the close-up while the mass charges, then pull back as it bursts.
    const charging = !reduced && t < CHARGE;
    const k = reduced ? 1 : charging ? 0 : 1 - Math.exp(-dt * 2.8);
    const ko = charging ? 1 : k;
    position.current.lerp(pose.position, k);
    look.current.lerp(pose.look, k);
    offset.current.x += (shift * state.size.width - offset.current.x) * ko;
    offset.current.y += (lift * state.size.height - offset.current.y) * ko;

    camera.position.copy(position.current);
    if (!reduced) {
      camera.position.x += state.pointer.x * 0.35;
      camera.position.y += state.pointer.y * 0.22;
    }
    camera.lookAt(look.current);
    camera.setViewOffset(state.size.width, state.size.height, offset.current.x, offset.current.y, state.size.width, state.size.height);
    camera.updateMatrixWorld();

    const perUnit = state.size.height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    const dpr = state.viewport.dpr;
    nodes.forEach((node, i) => {
      const v = scratch.current.set(...node.position).multiplyScalar(burst);
      const distance = camera.position.distanceTo(v);
      v.project(camera);
      const x = (v.x * 0.5 + 0.5) * state.size.width;
      const cy = (-v.y * 0.5 + 0.5) * state.size.height;
      const radius = (node.radius * perUnit) / distance;
      glow.current[i * 3] = x * dpr;
      glow.current[i * 3 + 1] = (state.size.height - cy) * dpr;
      glow.current[i * 3 + 2] = v.z > 1 ? 1 : radius * (node.kind === "core" ? 4.2 : 5.2) * dpr;
      const el = labels.current?.get(node.id);
      if (!el) return;
      if (v.z > 1) {
        el.style.visibility = "hidden";
        return;
      }
      const y = cy + radius * 1.15 + 4;
      el.style.visibility = "visible";
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translateX(-50%)`;
      el.style.setProperty("--depth", (THREE.MathUtils.clamp(1.5 - distance / 16, 0.55, 1) * labelFade).toFixed(2));
    });

    // After the intro settles, sample ~2 seconds of frames; if the device is struggling, drop quality once.
    const f = frames.current;
    if (!reduced && !f.reported && t > INTRO_SECONDS) {
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
  const clock = useRef(0);
  const shared = useMemo<Shared>(
    () => ({ reduced, density: quality === "low" ? 0.5 : compact ? 0.75 : 1, clock }),
    [reduced, quality, compact],
  );

  const levels = useMemo(() => nodes.map((n) => STATE_LEVEL[nodeState[n.id]]), [nodeState]);
  const glow = useRef(new Float32Array(MAX_GLOW * 3));

  return (
    <Canvas
      camera={{ fov: 42, near: 0.1, far: 80, position: [0, 0.1, 6] }}
      dpr={quality === "low" ? 1 : [1, 1.75]}
      frameloop={reduced ? "demand" : "always"}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      aria-hidden="true"
    >
      <Rig selection={selection} reduced={reduced} shift={props.shift} lift={props.lift} labels={props.labels} glow={glow} clockRef={clock} onSlow={() => {
          setQuality("low");
          props.onSlow?.();
        }}
      />
      <Backdrop levels={levels} glow={glow} shared={shared} />
      <Dust shared={shared} />
      <Burst shared={shared}>
        <Filaments edgeLevel={edgeLevel} focus={nodeOf(selection)} shared={shared} />
        {nodes.map((node) => (
          <Soma key={node.id} node={node} level={STATE_LEVEL[nodeState[node.id]]} shared={shared} />
        ))}
        <HitTargets onHover={props.onHover} onSelect={props.onSelect} />
      </Burst>
    </Canvas>
  );
}
