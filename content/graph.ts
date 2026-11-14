/**
 * Builds the knowledge graph from portfolio content. Every edge comes from a
 * documented relationship in `portfolio.ts`; nothing is randomised into
 * existence. Positions are authored (not force-simulated) so navigation is
 * predictable: a node is always in the same place.
 */
import { areaLinks, areas, projects, type AreaId, type Loc, type ProjectId } from "./portfolio";

export type NodeId = "core" | AreaId | ProjectId;
export type Selection = NodeId | "about";
export type Vec3 = readonly [number, number, number];

export type GraphNode = {
  id: NodeId;
  kind: "core" | "area" | "project";
  label: string;
  position: Vec3;
  radius: number;
};

export type GraphEdge = {
  id: string;
  from: NodeId;
  to: NodeId;
  /** trunk: core to area. branch: Projects to a project. link: a documented relationship. */
  kind: "trunk" | "branch" | "link";
  why?: Loc;
};

const AREA_POSITIONS: Record<AreaId, Vec3> = {
  security: [-3.0, 3.1, 0.4],
  ai: [4.0, 2.5, -0.8],
  "ai-security": [0.3, 4.0, -2.2],
  research: [4.9, -0.5, 1.0],
  projects: [2.2, -2.9, 1.6],
  experience: [-4.9, -0.9, 0.8],
  certifications: [-5.4, 1.5, -1.8],
  infrastructure: [-1.7, -3.9, -1.6],
};

/** Angle (degrees) of each project around the Projects area, placed toward its related areas. */
const PROJECT_ANGLES: Record<ProjectId, number> = {
  "ksc-receiver": 122,
  "web-attack-detection": 52,
  openrmf: -12,
  "recon-automation": 250,
  inoichi: 172,
};

const projectsCenter = AREA_POSITIONS.projects;

export const nodes: readonly GraphNode[] = [
  { id: "core", kind: "core", label: "Arthur Gonçalves", position: [0, 0, 0], radius: 0.95 },
  ...areas.map((a): GraphNode => ({ id: a.id, kind: "area", label: a.name, position: AREA_POSITIONS[a.id], radius: 0.55 })),
  ...projects.map((p): GraphNode => {
    const a = (PROJECT_ANGLES[p.id] * Math.PI) / 180;
    return {
      id: p.id,
      kind: "project",
      label: p.title,
      position: [projectsCenter[0] + Math.cos(a) * 1.9, projectsCenter[1] + Math.sin(a) * 1.3, projectsCenter[2] + 0.9 + 0.35 * Math.sin(2 * a)],
      radius: 0.3,
    };
  }),
];

export const edges: readonly GraphEdge[] = [
  ...areas.map((a): GraphEdge => ({ id: `core>${a.id}`, from: "core", to: a.id, kind: "trunk" })),
  ...projects.map((p): GraphEdge => ({ id: `projects>${p.id}`, from: "projects", to: p.id, kind: "branch" })),
  ...projects.flatMap((p) => p.links.map((l): GraphEdge => ({ id: `${p.id}>${l.area}`, from: p.id, to: l.area, kind: "link", why: l.why }))),
  ...areaLinks.map((l): GraphEdge => ({ id: `${l.a}>${l.b}`, from: l.a, to: l.b, kind: "link", why: l.why })),
];

export const nodeById = Object.fromEntries(nodes.map((n) => [n.id, n])) as Record<NodeId, GraphNode>;

export function isNodeId(value: string): value is NodeId {
  return value in nodeById;
}

export function nodeOf(selection: Selection): NodeId {
  return selection === "about" ? "core" : selection;
}

export type Neighbor = { id: NodeId; why?: Loc; kind: GraphEdge["kind"] };

/** Nodes directly connected to `id`, with the reason for each connection. */
export function neighbors(id: NodeId): Neighbor[] {
  const out: Neighbor[] = [];
  for (const e of edges) {
    if (e.from === id) out.push({ id: e.to, why: e.why, kind: e.kind });
    else if (e.to === id) out.push({ id: e.from, why: e.why, kind: e.kind });
  }
  return out;
}

export type VisualState = "dim" | "normal" | "linked" | "hot";

/** How each node and edge should read for the current selection and hover. */
export function visualStates(selection: Selection, hovered: NodeId | null) {
  const focus = nodeOf(selection);
  const home = focus === "core";
  const near = new Set(neighbors(focus).map((n) => n.id));
  const nodeState = {} as Record<NodeId, VisualState>;
  for (const n of nodes) {
    if (home) nodeState[n.id] = n.id === hovered ? "linked" : "normal";
    else if (n.id === focus) nodeState[n.id] = "hot";
    else if (near.has(n.id) || n.id === hovered) nodeState[n.id] = "linked";
    else nodeState[n.id] = n.id === "core" ? "normal" : "dim";
  }
  const edgeState: Record<string, VisualState> = {};
  for (const e of edges) {
    const touchesFocus = e.from === focus || e.to === focus;
    const touchesHover = hovered !== null && (e.from === hovered || e.to === hovered);
    if (home) edgeState[e.id] = touchesHover ? "hot" : e.kind === "trunk" ? "normal" : "dim";
    else edgeState[e.id] = touchesFocus ? "hot" : touchesHover ? "linked" : "dim";
  }
  return { nodeState, edgeState };
}

export const STATE_LEVEL: Record<VisualState, number> = { dim: 0.25, normal: 1, linked: 1.5, hot: 2 };
