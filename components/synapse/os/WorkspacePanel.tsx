"use client";

import { neighbors, nodeById, nodeOf, type NodeId, type Selection } from "@/content/graph";
import { areaById, certById, profile, projectById, projects, type AreaId, type CertId, type Lang, type ProjectId } from "@/content/portfolio";
import type { UI } from "@/content/ui";
import { CareerAxis, CertList, Education, ProjectGallery, ResearchBlock, RoleList, Tags, type OpenImage } from "../content/blocks";

type Props = { selection: Selection; lang: Lang; t: UI; onSelect: (s: Selection) => void; onOpenImage: OpenImage };

/** Other nodes this one is connected to, each with the documented reason. */
function Connections({ id, lang, t, onSelect, only }: { id: NodeId; lang: Lang; t: UI; onSelect: Props["onSelect"]; only: "project" | "area" }) {
  const list = neighbors(id).filter((n) => nodeById[n.id].kind === only && n.kind === "link");
  if (list.length === 0) return null;
  return (
    <section>
      <h3>{only === "project" ? t.relatedProjects : t.connections}</h3>
      <ul className="connections">
        {list.map((n) => (
          <li key={n.id}>
            <button type="button" onClick={() => onSelect(n.id)}>
              <span className="connection-name">{nodeById[n.id].label}</span>
              {n.why ? <span className="connection-why">{n.why[lang]}</span> : null}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function About({ lang, t }: { lang: Lang; t: UI }) {
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
      {id === "certifications" ? <CertList t={t} /> : null}
      {id === "research" ? <ResearchBlock lang={lang} t={t} /> : null}
      <Connections id={id} lang={lang} t={t} onSelect={onSelect} only="project" />
      <Connections id={id} lang={lang} t={t} onSelect={onSelect} only="area" />
    </>
  );
}

function ProjectContent({ id, lang, t, onSelect, onOpenImage }: { id: ProjectId } & Omit<Props, "selection">) {
  const project = projectById[id];
  return (
    <>
      <h2>{project.title}</h2>
      <p className="lede">{project.description[lang]}</p>
      {project.note ? <p className="quiet">{project.note[lang]}</p> : null}
      <Tags tags={project.tags} label={t.technologies} />
      <ProjectGallery project={project} lang={lang} t={t} onOpen={onOpenImage} />
      {id === "web-attack-detection" ? <ResearchBlock lang={lang} t={t} /> : null}
      <Connections id={id} lang={lang} t={t} onSelect={onSelect} only="area" />
    </>
  );
}

function CertContent({ id, t }: { id: CertId; t: UI }) {
  const cert = certById[id];
  return (
    <>
      <h2>{cert.name}</h2>
      <p className="lede">{cert.detail}</p>
      <p data-status={cert.status}>
        <span className="cert-status">{cert.status === "done" ? t.done : t.progress}</span>
      </p>
    </>
  );
}

export function WorkspacePanel(props: Props) {
  const { selection, t, onSelect } = props;
  if (selection === "core") return null;
  const node = nodeById[nodeOf(selection)];
  const parent: Selection = node.kind === "project" ? "projects" : node.kind === "cert" ? "certifications" : "core";
  return (
    <aside className="workspace" aria-label={t.workspace}>
      <div className="workspace-bar">
        <button type="button" className="back" onClick={() => onSelect(parent)}>
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {parent === "core" ? t.home : parent === "projects" ? t.allProjects : t.allCerts}
        </button>
      </div>
      {/* key restarts the content transition whenever the selection changes */}
      <div className="workspace-body" key={selection}>
        {selection === "about" ? <About {...props} /> : null}
        {node.kind === "area" ? <AreaContent id={node.id as AreaId} {...props} /> : null}
        {node.kind === "project" ? <ProjectContent id={node.id as ProjectId} {...props} /> : null}
        {node.kind === "cert" ? <CertContent id={node.id as CertId} t={t} /> : null}
      </div>
    </aside>
  );
}
