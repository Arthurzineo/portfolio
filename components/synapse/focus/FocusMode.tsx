"use client";

/**
 * Focus Mode: the whole portfolio as one conventional, fast, accessible page.
 * No WebGL, no motion dependency. This is also what the server renders, so the
 * content is in the HTML for crawlers and for browsers without JavaScript.
 */
import { lazy, Suspense } from "react";
import { areaById, courses, profile, projects, type Lang } from "@/content/portfolio";
import type { UI } from "@/content/ui";
import { CareerAxis, CertCards, Decrypted, Education, ProjectGallery, ResearchBlock, RoleList, Tags, type OpenImage } from "../content/blocks";

const ProfileCard = lazy(() => import("@/components/reactbits/ProfileCard"));

type Props = { lang: Lang; t: UI; webgl: boolean; hydrated: boolean; onOpenImage: OpenImage };

export function FocusMode({ lang, t, webgl, hydrated, onOpenImage }: Props) {
  return (
    <main className="focus" id="content">
      {hydrated && !webgl ? <p className="notice">{t.noWebgl}</p> : null}

      <section className="focus-hero" id="inicio" aria-labelledby="focus-name">
        <div>
          <h1 id="focus-name">{profile.name}</h1>
          <p className="focus-role">{profile.role[lang]}</p>
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
        <div className="focus-profile">
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

      <section id="projetos" aria-labelledby="focus-projects">
        <header className="focus-head">
          <h2 id="focus-projects">{t.projects}</h2>
          <p>
            <Decrypted text={areaById.projects.summary[lang]} />
          </p>
        </header>
        <div className="focus-projects">
          {projects.map((project) => (
            <article key={project.id} id={project.id}>
              <div>
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
              <ProjectGallery project={project} lang={lang} t={t} onOpen={onOpenImage} />
            </article>
          ))}
        </div>
      </section>

      <section id="experiencia" aria-labelledby="focus-experience">
        <header className="focus-head">
          <h2 id="focus-experience">{t.experience}</h2>
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

      <section id="certificacoes" aria-labelledby="focus-certs">
        <header className="focus-head">
          <h2 id="focus-certs">{t.certifications}</h2>
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

      <section id="pesquisa" aria-labelledby="focus-research">
        <header className="focus-head">
          <h2 id="focus-research">{t.research}</h2>
          <p>
            <Decrypted text={areaById.research.summary[lang]} />
          </p>
        </header>
        <ResearchBlock lang={lang} t={t} />
      </section>

      <section className="focus-contact" id="contato" aria-labelledby="focus-contact">
        <img src={profile.portraits.monitors} alt="" width={960} height={1200} loading="lazy" />
        <div>
          <h2 id="focus-contact">{t.contactTitle}</h2>
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
