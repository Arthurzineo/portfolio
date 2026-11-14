"use client";

import { itemById, items, nodeById, nodeOf, panelConnections, type ItemId, type NodeId, type Selection } from "@/content/graph";
import { areaById, certifications, profile, projectById, projects, type AreaId, type Lang, type ProjectId } from "@/content/portfolio";
import type { UI } from "@/content/ui";
import { lazy, Suspense } from "react";
import { CareerAxis, CertCard, CertStatus, Decrypted, Education, ProjectGallery, ResearchBlock, RoleList, Tags, type OpenImage } from "../content/blocks";

const Radar = lazy(() => import("@/components/reactbits/Radar"));

type Props = { selection: Selection; lang: Lang; t: UI; onSelect: (s: Selection) => void; onOpenImage: OpenImage };

/** Other nodes this one is connected to, each with the documented reason. */
function Connections({ id, lang, t, onSelect }: { id: NodeId; lang: Lang; t: UI; onSelect: Props["onSelect"] }) {
  const groups = panelConnections(id);
  const sections = [
    { key: "project", title: t.relatedProjects, list: groups.project },
    { key: "item", title: t.relatedItems, list: groups.item },
    { key: "area", title: t.connections, list: groups.area },
  ].filter((g) => g.list.length > 0);
  return (
    <>
      {sections.map((group) => (
        <section key={group.key}>
          <h3>{group.title}</h3>
          <ul className="connections">
            {group.list.map((n) => (
              <li key={n.id}>
                <button type="button" onClick={() => onSelect(n.id)}>
                  <span className="connection-name">{nodeLabel(n.id, lang)}</span>
                  {n.why ? <span className="connection-why">{n.why[lang]}</span> : null}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

const nodeLabel = (id: NodeId, lang: Lang) => (nodeById[id].kind === "item" ? itemById[id as ItemId].title[lang] : nodeById[id].label);

function About({ lang, t, onSelect }: { lang: Lang; t: UI; onSelect: Props["onSelect"] }) {
  return (
    <>
      <img className="panel-portrait" src={profile.portraits.desk} alt={profile.portraitAlt[lang]} width={960} height={1200} />
      <h2>{profile.name}</h2>
      <p className="lede">{profile.role[lang]}</p>
      <p>{profile.intro[lang]}</p>
      <ul className="signals">
        {profile.signals.map((s) => (
          <li key={s.en}>{s[lang]}</li>
        ))}
      </ul>
      <Education lang={lang} t={t} />
      <Connections id="core" lang={lang} t={t} onSelect={onSelect} />
      <section>
        <h3>{t.contact}</h3>
        <p>{profile.contact.text[lang]}</p>
        <a className="action" href={profile.contact.linkedin} target="_blank" rel="noreferrer">
          {t.linkedin}
        </a>
      </section>
    </>
  );
}

function AreaContent({ id, ...rest }: { id: AreaId } & Omit<Props, "selection">) {
  const { lang, t, onSelect } = rest;
  const area = areaById[id];
  return (
    <>
      {id === "security" ? (
        // Decorative sweep for the detection area. It shows no data and is hidden from assistive tech.
        <div className="panel-radar" aria-hidden="true">
          <Suspense fallback={null}>
            <Radar color="#64E4DC" backgroundColor="#0a0f17" speed={0.7} scale={1.7} brightness={1.4} intro={false} ringCount={4} targets={5} clutter={0.2} glow={0.5} gridOpacity={0.5} mouseInteraction={false} />
          </Suspense>
        </div>
      ) : null}
      <h2>{area.name}</h2>
      <p className="lede">{area.summary[lang]}</p>
      {id === "projects" ? (
        <ul className="connections">
          {projects.map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => onSelect(p.id)}>
                <span className="connection-name">{p.title}</span>
                <span className="connection-why">{p.description[lang]}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {id === "experience" ? (
        <>
          <CareerAxis lang={lang} />
          <RoleList lang={lang} />
          <Education lang={lang} t={t} />
        </>
      ) : null}
      {id === "certifications" ? <CertLinks t={t} onSelect={onSelect} /> : null}
      {id === "education" || id === "courses" ? <AreaItems id={id} lang={lang} onSelect={onSelect} /> : null}
      {id === "research" ? <ResearchBlock lang={lang} t={t} /> : null}
      <Connections id={id} lang={lang} t={t} onSelect={onSelect} />
    </>
  );
}

function ProjectContent({ id, lang, t, onSelect, onOpenImage }: { id: ProjectId } & Omit<Props, "selection">) {
  const project = projectById[id];
  return (
    <>
      <h2>{project.title}</h2>
      <p className="lede">
        <Decrypted text={project.description[lang]} />
      </p>
      {project.note ? <p className="quiet">{project.note[lang]}</p> : null}
      <Tags tags={project.tags} label={t.technologies} />
      <ProjectGallery project={project} lang={lang} t={t} onOpen={onOpenImage} />
      {id === "web-attack-detection" ? <ResearchBlock lang={lang} t={t} /> : null}
      <Connections id={id} lang={lang} t={t} onSelect={onSelect} />
    </>
  );
}

function ItemContent({ id, lang, t, onSelect }: { id: ItemId } & Omit<Props, "selection" | "onOpenImage">) {
  const item = itemById[id];
  const cert = certifications.find((c) => c.id === id);
  return (
    <>
      {cert ? (
        <div className="panel-cert">
          <CertCard cert={cert} t={t} />
        </div>
      ) : null}
      <h2>{item.title[lang]}</h2>
      <p className="lede">{item.detail[lang]}</p>
      {item.status ? (
        <p data-status={item.status}>
          <CertStatus status={item.status} t={t} />
        </p>
      ) : null}
      <Connections id={id} lang={lang} t={t} onSelect={onSelect} />
    </>
  );
}

/** Every certification: completed ones open their own node, the ones in progress are listed without a link. */
function CertLinks({ t, onSelect }: { t: UI; onSelect: Props["onSelect"] }) {
  return (
    <ul className="connections cert-links">
      {certifications.map((cert) => {
        const row = (
          <>
            <span className="connection-name">{cert.name}</span>
            <span className="connection-why">{cert.detail}</span>
            <span data-status={cert.status}>
              <CertStatus status={cert.status} t={t} />
            </span>
          </>
        );
        return (
          <li key={cert.id}>
            {cert.status === "done" ? (
              <button type="button" onClick={() => onSelect(cert.id)}>
                {row}
              </button>
            ) : (
              <div className="connection-static">{row}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** The courses or degrees that belong to an area, as buttons into their nodes. */
function AreaItems({ id, lang, onSelect }: { id: AreaId; lang: Lang; onSelect: Props["onSelect"] }) {
  const list = items.filter((i) => i.parent === id);
  return (
    <ul className="connections">
      {list.map((i) => (
        <li key={i.id}>
          <button type="button" onClick={() => onSelect(i.id)}>
            <span className="connection-name">{i.title[lang]}</span>
            <span className="connection-why">{i.detail[lang]}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function WorkspacePanel(props: Props) {
  const { selection, lang, t, onSelect } = props;
  if (selection === "core") return null;
  const node = nodeById[nodeOf(selection)];
  const parent: Selection = node.kind === "project" ? "projects" : node.kind === "item" ? itemById[node.id as ItemId].parent : "core";
  return (
    <aside className="workspace" aria-label={t.workspace}>
      <div className="workspace-bar">
        <button type="button" className="back" onClick={() => onSelect(parent)}>
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {parent === "core" ? t.home : parent === "projects" ? t.allProjects : nodeById[parent as NodeId].label}
        </button>
      </div>
      {/* key restarts the content transition whenever the selection changes */}
      <div className="workspace-body" key={selection}>
        {selection === "about" ? <About {...props} /> : null}
        {node.kind === "area" ? <AreaContent id={node.id as AreaId} {...props} /> : null}
        {node.kind === "project" ? <ProjectContent id={node.id as ProjectId} {...props} /> : null}
        {node.kind === "item" ? <ItemContent id={node.id as ItemId} lang={lang} t={t} onSelect={onSelect} /> : null}
      </div>
    </aside>
  );
}
