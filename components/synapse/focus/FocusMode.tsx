"use client";

/**
 * Focus Mode: the whole portfolio as one conventional, fast, accessible page.
 * No WebGL, no motion dependency. This is also what the server renders, so the
 * content is in the HTML for crawlers and for browsers without JavaScript.
 */
import React, { lazy, Suspense, useEffect, useRef } from "react";
import { areaById, courses, profile, projects, type Lang } from "@/content/portfolio";
import type { UI } from "@/content/ui";
import { CareerAxis, CertCards, Decrypted, Education, ProjectGallery, ResearchBlock, RoleList, Tags, type OpenImage } from "../content/blocks";

const ProfileCard = lazy(() => import("@/components/reactbits/ProfileCard"));

type Props = { lang: Lang; t: UI; webgl: boolean; hydrated: boolean; onOpenImage: OpenImage };

/**
 * "Build on scroll": every element marked data-build starts in a hidden state (see globals.css) and gets
 * data-inview the first time it enters the viewport, which plays its entrance once. Without JavaScript or
 * with reduced motion nothing is hidden, so the content is always there.
 */
function useBuildOnScroll() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-inview", "");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );
    el.querySelectorAll("[data-build]").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
  return root;
}

export function FocusMode({ lang, t, webgl, hydrated, onOpenImage }: Props) {
  const root = useBuildOnScroll();
  return (
    <main className="focus" id="content" ref={root}>
      <div className="focus-progress" aria-hidden="true" />
      {hydrated && !webgl ? <p className="notice">{t.noWebgl}</p> : null}

      <section className="focus-hero" id="inicio" aria-labelledby="focus-name">
        <div>
          <h1 id="focus-name" data-build="wipe">
            <span>{profile.name}</span>
          </h1>
          <p className="focus-role" data-build="" style={{ "--i": 2 } as React.CSSProperties}>
            {profile.role[lang]}
          </p>
          <p className="lede">
            <Decrypted text={profile.intro[lang]} />
          </p>
          <ul className="signals">
            {profile.signals.map((s) => (
              <li key={s.en}>{s[lang]}</li>
            ))}
          </ul>
          <nav className="focus-nav" aria-label={t.areasNav}>
            <a href="#projetos">{t.projects}</a>
            <a href="#experiencia">{t.experience}</a>
            <a href="#certificacoes">{t.certifications}</a>
            <a href="#pesquisa">{t.research}</a>
            <a href="#contato">{t.contact}</a>
          </nav>
        </div>
        <div className="focus-profile" data-build="right">
          <Suspense fallback={<img src={profile.portraits.standing} alt={profile.portraitAlt[lang]} width={960} height={1200} />}>
            <ProfileCard
              avatarUrl={profile.portraits.standing}
              miniAvatarUrl={profile.portraits.headshot}
              name={profile.name}
              title={profile.role[lang]}
              handle={profile.handle}
              status=""
              contactText="LinkedIn"
              onContactClick={() => window.open(profile.contact.linkedin, "_blank", "noopener,noreferrer")}
              backdropColor="#0c121b"
              radius={10}
              holo={0.55}
              glare={0.4}
              tiltStrength={9}
            />
          </Suspense>
        </div>
      </section>

      <section id="projetos" data-build="rule" aria-labelledby="focus-projects">
        <header className="focus-head">
          <h2 id="focus-projects" data-build="wipe">
            <span>{t.projects}</span>
          </h2>
          <p>
            <Decrypted text={areaById.projects.summary[lang]} />
          </p>
        </header>
        <div className="focus-projects">
          {projects.map((project) => (
            <article key={project.id} id={project.id} data-build="rule">
              <div data-build="left">
                <h3>{project.title}</h3>
                <p>
                  <Decrypted text={project.description[lang]} />
                </p>
                {project.note ? <p className="quiet">{project.note[lang]}</p> : null}
                <Tags tags={project.tags} label={t.technologies} />
                <ul className="reasons">
                  {project.links.map((link) => (
                    <li key={link.area}>
                      <strong>{areaById[link.area].name}</strong>
                      {link.why[lang]}
                    </li>
                  ))}
                </ul>
              </div>
              <div data-build="right" style={{ "--i": 1 } as React.CSSProperties}>
                <ProjectGallery project={project} lang={lang} t={t} onOpen={onOpenImage} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="experiencia" data-build="rule" aria-labelledby="focus-experience">
        <header className="focus-head">
          <h2 id="focus-experience" data-build="wipe">
            <span>{t.experience}</span>
          </h2>
          <p>
            <Decrypted text={areaById.experience.summary[lang]} />
          </p>
        </header>
        <div className="focus-split">
          <div>
            <CareerAxis lang={lang} />
            <Education lang={lang} t={t} />
          </div>
          <RoleList lang={lang} decrypt />
        </div>
      </section>

      <section id="certificacoes" data-build="rule" aria-labelledby="focus-certs">
        <header className="focus-head">
          <h2 id="focus-certs" data-build="wipe">
            <span>{t.certifications}</span>
          </h2>
          <p>
            <Decrypted text={areaById.certifications.summary[lang]} />
          </p>
        </header>
        <CertCards t={t} />
        <div className="focus-courses">
          <h3>{t.courses}</h3>
          <ul>
            {courses.map((course) => (
              <li key={course.id}>
                <strong>{course.name}</strong> {course.detail[lang]}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="pesquisa" data-build="rule" aria-labelledby="focus-research">
        <header className="focus-head">
          <h2 id="focus-research" data-build="wipe">
            <span>{t.research}</span>
          </h2>
          <p>
            <Decrypted text={areaById.research.summary[lang]} />
          </p>
        </header>
        <ResearchBlock lang={lang} t={t} />
      </section>

      <section className="focus-contact" id="contato" data-build="rule" aria-labelledby="focus-contact">
        <div className="focus-profile focus-profile-start" data-build="left">
          <Suspense fallback={<img src={profile.portraits.monitors} alt="" width={960} height={1200} loading="lazy" />}>
            <ProfileCard
              avatarUrl={profile.portraits.monitors}
              miniAvatarUrl={profile.portraits.headshot}
              name={profile.name}
              title={profile.role[lang]}
              handle={profile.handle}
              status=""
              contactText="LinkedIn"
              onContactClick={() => window.open(profile.contact.linkedin, "_blank", "noopener,noreferrer")}
              backdropColor="#0c121b"
              radius={10}
              holo={0.55}
              glare={0.4}
              tiltStrength={9}
            />
          </Suspense>
        </div>
        <div>
          <h2 id="focus-contact" data-build="wipe">
            <span>{t.contactTitle}</span>
          </h2>
          <p>
            <Decrypted text={profile.contact.text[lang]} />
          </p>
          <a className="action" href={profile.contact.linkedin} target="_blank" rel="noreferrer">
            {t.linkedin}
          </a>
          <blockquote className="motto">
            <p>“{profile.motto}”</p>
            <cite>{profile.mottoAuthor}</cite>
          </blockquote>
        </div>
      </section>
    </main>
  );
}
