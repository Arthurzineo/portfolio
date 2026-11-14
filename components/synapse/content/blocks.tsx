"use client";

/**
 * Presentational blocks shared by the workspace panel and Focus Mode, so both
 * modes show exactly the same information from content/portfolio.ts.
 */
import DecryptedText from "@/components/reactbits/DecryptedText";
import FuzzyText from "@/components/reactbits/FuzzyText";
import React, { lazy, Suspense } from "react";
import {
  certifications,
  education,
  experience,
  ISSUER_LOGO,
  ISSUER_TINT,
  issuerOf,
  research,
  type Certification,
  type Lang,
  type Project,
} from "@/content/portfolio";
import type { UI } from "@/content/ui";

const TiltedCard = lazy(() => import("@/components/reactbits/TiltedCard"));
const ReflectiveCard = lazy(
  () => import("@/components/reactbits/ReflectiveCard"),
);

export type OpenImage = (project: Project, index: number) => void;

export function Tags({
  tags,
  label,
}: {
  tags: readonly string[];
  label: string;
}) {
  return (
    <ul className="tags" aria-label={label}>
      {tags.map((tag) => (
        <li key={tag}>{tag}</li>
      ))}
    </ul>
  );
}

export function ProjectGallery({
  project,
  lang,
  t,
  onOpen,
}: {
  project: Project;
  lang: Lang;
  t: UI;
  onOpen: OpenImage;
}) {
  if (project.images.length === 0) return null;
  return (
    <ul
      className="gallery"
      aria-label={t.gallery}
      data-count={Math.min(project.images.length, 2)}
    >
      {project.images.map((image, index) => (
        <li key={image.src}>
          {/* The plain image shows until the tilt card loads, and stays if it never does. */}
          <Suspense
            fallback={
              <img
                src={image.src}
                alt={image.alt[lang]}
                loading="lazy"
                decoding="async"
              />
            }
          >
            <TiltedCard
              imageSrc={image.src}
              altText={`${t.enlarge}: ${image.alt[lang]}`}
              containerWidth="100%"
              containerHeight="100%"
              imageWidth="100%"
              imageHeight="100%"
              radius={4}
              rotateAmplitude={9}
              scaleOnHover={1.04}
              glare={0.35}
              shadow={0.4}
              showTooltip={false}
              intro={false}
              onClick={() => onOpen(project, index)}
            />
          </Suspense>
        </li>
      ))}
    </ul>
  );
}

/** One certification as a reflective ID-style card. The camera is never requested. */
export function CertCard({ cert, t }: { cert: Certification; t: UI }) {
  const done = cert.status === "done";
  const tint = ISSUER_TINT[issuerOf(cert)] ?? "#bfeeee";
  const badge = cert.badge ?? (done ? ISSUER_LOGO[issuerOf(cert)] : undefined);
  return (
    <div
      className="cert-card"
      style={{ "--issuer": tint } as React.CSSProperties}
    >
      <Suspense fallback={<div className="cert-card-fallback" />}>
        <ReflectiveCard
          name={cert.name}
          role={cert.detail}
          badge={done ? t.certified : ""}
          status={done ? t.done : t.progress}
          statusColor={done ? "#64E4DC" : "#9DADBF"}
          idLabel={t.issuer}
          idValue={issuerOf(cert)}
          webcam={false}
          tint={done ? tint : "#8f9bb0"}
          roughness={done ? 0.28 : 0.6}
          shine={done ? 1 : 0.4}
          width="100%"
          height={360}
          radius={10}
          tiltStrength={9}
          intro={false}
        />
      </Suspense>
      {badge ? <img className="cert-badge" src={badge} alt={`${issuerOf(cert)} logo`} loading="lazy" /> : null}
    </div>
  );
}

export function CertCards({ t }: { t: UI }) {
  return (
    <ul className="cert-cards">
      {certifications.map((cert) => (
        <li key={cert.id}>
          <CertCard cert={cert} t={t} />
        </li>
      ))}
    </ul>
  );
}

/** Roles drawn on a real time axis: bar length is proportional to duration. */
export function CareerAxis({ lang }: { lang: Lang }) {
  const first = 2021;
  const last = 2027;
  const span = last - first;
  const rows = [...experience].reverse();
  return (
    <div
      className="career-axis"
      role="img"
      aria-label={
        lang === "pt"
          ? "Linha do tempo de 2021 até hoje"
          : "Timeline from 2021 to today"
      }
    >
      <div className="career-years" aria-hidden="true">
        {Array.from({ length: span }, (_, i) => (
          <span key={i}>{first + i}</span>
        ))}
      </div>
      {rows.map((role) => {
        // Year granularity only: the source data has no months, so a single-year role fills that year.
        const end =
          role.end === null
            ? last
            : role.end === role.start
              ? role.start + 1
              : role.end;
        return (
          <div className="career-row" key={role.id} aria-hidden="true">
            <span
              className="career-bar"
              data-current={role.end === null}
              style={{
                marginLeft: `${((role.start - first) / span) * 100}%`,
                width: `${((end - role.start) / span) * 100}%`,
              }}
            />
            <span className="career-name">{role.role[lang]}</span>
          </div>
        );
      })}
    </div>
  );
}

export function RoleList({
  lang,
  decrypt = false,
}: {
  lang: Lang;
  decrypt?: boolean;
}) {
  return (
    <ol className="roles" reversed>
      {experience.map((role) => (
        <li key={role.id}>
          <p className="role-period">{role.period[lang]}</p>
          <h3>{role.role[lang]}</h3>
          <p className="role-org">{role.org[lang]}</p>
          <p>
            {decrypt ? (
              <Decrypted text={role.description[lang]} />
            ) : (
              role.description[lang]
            )}
          </p>
        </li>
      ))}
    </ol>
  );
}

export function Education({ lang, t }: { lang: Lang; t: UI }) {
  return (
    <div className="education">
      <h3>{t.education}</h3>
      <p>{education[lang]}</p>
    </div>
  );
}

/** A project summary that resolves from scrambled characters the first time it scrolls into view. */
export function Decrypted({ text }: { text: string }) {
  return (
    <DecryptedText
      text={text}
      animateOn="view"
      sequential
      revealDirection="start"
      speed={14}
      maxIterations={8}
      useOriginalCharsOnly
    />
  );
}

/** "In progress" is drawn fuzzy on purpose: it is not settled yet. Completed stays crisp. */
export function CertStatus({
  status,
  t,
}: {
  status: "done" | "progress";
  t: UI;
}) {
  if (status === "done") return <span className="cert-status">{t.done}</span>;
  return (
    <span className="cert-status">
      <span className="sr-only">{t.progress}</span>
      <span aria-hidden="true" className="fuzzy">
        <FuzzyText
          fontSize={13}
          fontWeight={500}
          fontFamily="'Archivo Variable', sans-serif"
          color="#9dadbf"
          baseIntensity={0.16}
          hoverIntensity={0.45}
          fuzzRange={6}
          fps={30}
        >
          {t.progress}
        </FuzzyText>
      </span>
    </span>
  );
}

export function CertList({ t }: { t: UI }) {
  return (
    <ul className="certs">
      {certifications.map((cert) => (
        <li key={cert.name} data-status={cert.status}>
          <div>
            <h3>{cert.name}</h3>
            <p>{cert.detail}</p>
          </div>
          <CertStatus status={cert.status} t={t} />
        </li>
      ))}
    </ul>
  );
}

export function ResearchBlock({ lang, t }: { lang: Lang; t: UI }) {
  return (
    <div className="research">
      <p className="paper-title">{research.focus[lang]}</p>
      <h3>
        {t.pipeline} ({research.protocolName})
      </h3>
      <ol className="pipeline">
        {research.protocol.map((step) => (
          <li key={step.en}>{step[lang]}</li>
        ))}
      </ol>
      <p>{research.datasets[lang]}</p>
      <p>{research.metrics[lang]}</p>
      <p className="quiet">{research.publication[lang]}</p>
    </div>
  );
}
