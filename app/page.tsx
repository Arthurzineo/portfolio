"use client";

import { useEffect, useState } from "react";

type Language = "pt" | "en";
type ProjectImage = { readonly src: string; readonly alt: string };
type ModalGallery = { title: string; images: readonly ProjectImage[]; index: number };

const copy = {
  pt: {
    nav: ["Início", "Projetos", "Experiência", "Certificações", "Pesquisa", "Contato"],
    hero: {
      role: "Security Engineering &",
      accent: "AI Security",
      intro: "Construo defesas, automações e sistemas inteligentes para ambientes reais.",
      projects: "Ver projetos",
      experience: "Ver experiência",
      signals: ["Detecção & Automação", "SIEM & EDR", "IA aplicada à segurança"],
      status: "Security is a process, not a product.",
    },
    sections: {
      projects: {
        kicker: "trabalho selecionado",
        title: "Projetos que conectam segurança, dados e software.",
        text: "Ferramentas e pesquisas construídas para resolver problemas reais de visibilidade, detecção e resposta.",
      },
      experience: {
        kicker: "trajetória",
        title: "Experiência prática em ambientes corporativos.",
        text: "Atuação em segurança de endpoints, observabilidade, automação e infraestrutura, com foco em transformar operação em engenharia.",
      },
      certifications: {
        kicker: "validação técnica",
        title: "Certificações e aprendizado contínuo.",
        text: "Base sólida em defesa, análise de ameaças, segurança ofensiva e evolução para segurança aplicada à IA.",
      },
      research: {
        kicker: "pesquisa aplicada",
        title: "Machine Learning para detectar ataques web.",
        text: "Pesquisa de TCC que combina representações de payloads HTTP produzidas por Transformers com classificadores-base e um metaclassificador em stacking para detectar SQL Injection e Cross-Site Scripting.",
        label: "Pipeline experimental",
        metrics: "Avaliação orientada por precision, recall, F1-score e AUC-PR.",
        publication: "Após a conclusão e publicação do artigo, esta seção será atualizada com o link de acesso.",
      },
      contact: {
        kicker: "contato",
        title: "Vamos construir sistemas mais seguros.",
        text: "Estou aberto a oportunidades e conversas sobre Security Engineering, AI Security, detecção, automação e pesquisa aplicada.",
        action: "Falar pelo LinkedIn",
      },
    },
    projectItems: [
      {
        code: "01",
        title: "KSC Receiver",
        description: "Pipeline assistido por IA para transformar logs do Kaspersky Security Center em decoders e eventos pesquisáveis no Wazuh/OpenSearch.",
        tags: ["Python", "Wazuh", "OpenSearch", "AI"],
        images: [
          { src: "/ksc-receiver-events.png", alt: "Listagem de eventos processados pelo KSC Receiver" },
          { src: "/ksc-receiver-artifact.png", alt: "Tela de aprovação de artefato decoder no KSC Receiver" },
          { src: "/ksc-receiver-decoder-session.png", alt: "Sessão de decodificação e extração JSON no KSC Receiver" },
          { src: "/ksc-receiver-event-review.png", alt: "Revisão de evento e histórico de tentativas no KSC Receiver" },
        ],
      },
      {
        code: "02",
        title: "INOICHI",
        description: "Sistema de visibilidade e resposta para identificar ativos sem proteção, correlacionar evidências e apoiar ações de remediação.",
        tags: ["Python", "Nmap", "OpenSearch", "Asset Security"],
        images: [{ src: "/inoichi-dashboard.png", alt: "Dashboard operacional do INOICHI" }],
      },
      {
        code: "03",
        title: "Recon Automation",
        description: "Orquestração em Go de ferramentas de reconhecimento, parsers estruturados e armazenamento de resultados para análise contínua.",
        tags: ["Go", "Nmap", "httpx", "Docker"],
        images: [{ src: "/recon-automation-smart-recon-certificate.png", alt: "Certificado Smart Recon para Pentest de Arthur Gonçalves" }],
      },
      {
        code: "04",
        title: "Web Attack Detection",
        description: "Abordagem de stacking ensemble com extração de características baseada em Transformers para detecção de SQLi e XSS.",
        tags: ["Machine Learning", "Transformers", "SQLi", "XSS"],
      },
      {
        code: "05",
        title: "OpenRMF",
        description: "Plataforma open source para orquestração de agentes de IA, com coordenação multiagente, memória estruturada e integração segura com ferramentas. Disponibilização prevista até o fim de 2026.",
        tags: ["Open Source", "Multi-Agent", "AI Orchestration", "Security"],
        images: [{ src: "/openrmf-project.png", alt: "Dashboard de governança e riscos do OpenRMF" }],
      },
    ],
    experienceItems: [
      {
        period: "2026 — presente",
        role: "Técnico de TI Sênior",
        org: "Universidade de Caxias do Sul",
        description: "Segurança de endpoints, SIEM/EDR, análise de vulnerabilidades, integrações, automação e suporte à infraestrutura crítica.",
      },
      {
        period: "2023 — 2026",
        role: "Técnico de TI Pleno",
        org: "Universidade de Caxias do Sul",
        description: "Atuação em segurança operacional, gestão de endpoints, observabilidade e desenvolvimento de automações para o ambiente corporativo.",
      },
      {
        period: "2022 — 2023",
        role: "Técnico de TI Júnior",
        org: "Universidade de Caxias do Sul",
        description: "Administração de ambientes Windows e Linux, troubleshooting, redes e evolução de controles operacionais de segurança.",
      },
      {
        period: "2022",
        role: "Analista de Suporte de TI Júnior",
        org: "Introduce",
        description: "Atendimento e suporte técnico a usuários, diagnóstico de incidentes e sustentação de sistemas.",
      },
      {
        period: "2021",
        role: "Estagiário de TI",
        org: "Introduce",
        description: "Início da trajetória profissional com suporte técnico, preparação de equipamentos e atendimento a usuários.",
      },
    ],
    certifications: [
      { name: "CompTIA CySA+", detail: "Cybersecurity Analyst", status: "Concluída" },
      { name: "CompTIA PenTest+", detail: "Penetration Testing", status: "Concluída" },
      { name: "CompTIA Security+", detail: "Security Foundations", status: "Concluída" },
      { name: "Sophos Engineer", detail: "Endpoint & Network Security", status: "Concluída" },
      { name: "CompTIA SecAI+", detail: "AI Security", status: "Em preparação" },
      { name: "CompTIA SecurityX", detail: "Advanced Security Architecture", status: "Em preparação" },
    ],
    education: {
      label: "Formação",
      items: [
        "Engenharia de Software · UCS · conclusão prevista em 2026",
      ],
    },
    footer: "Projetado como um terminal: direto, verificável e orientado a resultados.",
  },
  en: {
    nav: ["Home", "Projects", "Experience", "Certifications", "Research", "Contact"],
    hero: {
      role: "Security Engineering &",
      accent: "AI Security",
      intro: "I build defenses, automation, and intelligent systems for real-world environments.",
      projects: "View projects",
      experience: "View experience",
      signals: ["Detection & Automation", "SIEM & EDR", "AI applied to security"],
      status: "Security is a process, not a product.",
    },
    sections: {
      projects: {
        kicker: "selected work",
        title: "Projects connecting security, data, and software.",
        text: "Tools and research built to solve real-world visibility, detection, and response problems.",
      },
      experience: {
        kicker: "journey",
        title: "Hands-on experience in corporate environments.",
        text: "Work across endpoint security, observability, automation, and infrastructure, focused on turning operations into engineering.",
      },
      certifications: {
        kicker: "technical validation",
        title: "Certifications and continuous learning.",
        text: "A solid foundation in defense, threat analysis, offensive security, and an evolving focus on AI security.",
      },
      research: {
        kicker: "applied research",
        title: "Machine Learning for web attack detection.",
        text: "Undergraduate research combining Transformer-generated HTTP payload representations with base classifiers and a stacking meta-classifier to detect SQL Injection and Cross-Site Scripting.",
        label: "Experimental pipeline",
        metrics: "Evaluation focused on precision, recall, F1-score, and AUC-PR.",
        publication: "After the article is completed and published, this section will be updated with a direct access link.",
      },
      contact: {
        kicker: "contact",
        title: "Let’s build more secure systems.",
        text: "I am open to opportunities and conversations about Security Engineering, AI Security, detection, automation, and applied research.",
        action: "Connect on LinkedIn",
      },
    },
    projectItems: [
      {
        code: "01",
        title: "KSC Receiver",
        description: "An AI-assisted pipeline that transforms Kaspersky Security Center logs into decoders and searchable Wazuh/OpenSearch events.",
        tags: ["Python", "Wazuh", "OpenSearch", "AI"],
        images: [
          { src: "/ksc-receiver-events.png", alt: "Events processed by KSC Receiver" },
          { src: "/ksc-receiver-artifact.png", alt: "Decoder artifact approval screen in KSC Receiver" },
          { src: "/ksc-receiver-decoder-session.png", alt: "Decode session and JSON extraction in KSC Receiver" },
          { src: "/ksc-receiver-event-review.png", alt: "Event review and attempt history in KSC Receiver" },
        ],
      },
      {
        code: "02",
        title: "INOICHI",
        description: "A visibility and response system for finding unprotected assets, correlating evidence, and supporting remediation.",
        tags: ["Python", "Nmap", "OpenSearch", "Asset Security"],
        images: [{ src: "/inoichi-dashboard.png", alt: "INOICHI operational dashboard" }],
      },
      {
        code: "03",
        title: "Recon Automation",
        description: "Go-based orchestration for reconnaissance tools, structured parsers, and continuous analysis storage.",
        tags: ["Go", "Nmap", "httpx", "Docker"],
        images: [{ src: "/recon-automation-smart-recon-certificate.png", alt: "Arthur Gonçalves Smart Recon for Pentest certificate" }],
      },
      {
        code: "04",
        title: "Web Attack Detection",
        description: "A stacking ensemble approach with Transformer-based feature extraction for SQLi and XSS detection.",
        tags: ["Machine Learning", "Transformers", "SQLi", "XSS"],
      },
      {
        code: "05",
        title: "OpenRMF",
        description: "An open-source platform for AI agent orchestration, combining multi-agent coordination, structured memory, and secure tool integration. Planned for release by the end of 2026.",
        tags: ["Open Source", "Multi-Agent", "AI Orchestration", "Security"],
        images: [{ src: "/openrmf-project.png", alt: "OpenRMF governance and risk dashboard" }],
      },
    ],
    experienceItems: [
      {
        period: "2026 — present",
        role: "Senior IT Technician",
        org: "University of Caxias do Sul",
        description: "Endpoint security, SIEM/EDR, vulnerability analysis, integrations, automation, and critical infrastructure support.",
      },
      {
        period: "2023 — 2026",
        role: "Mid-level IT Technician",
        org: "University of Caxias do Sul",
        description: "Operational security, endpoint management, observability, and automation development for the corporate environment.",
      },
      {
        period: "2022 — 2023",
        role: "Junior IT Technician",
        org: "University of Caxias do Sul",
        description: "Windows and Linux administration, troubleshooting, networking, and continuous improvement of operational security controls.",
      },
      {
        period: "2022",
        role: "Junior IT Support Analyst",
        org: "Introduce",
        description: "User support, incident diagnosis, and day-to-day system operations.",
      },
      {
        period: "2021",
        role: "IT Intern",
        org: "Introduce",
        description: "Started a professional career with technical support, equipment preparation, and user assistance.",
      },
    ],
    certifications: [
      { name: "CompTIA CySA+", detail: "Cybersecurity Analyst", status: "Completed" },
      { name: "CompTIA PenTest+", detail: "Penetration Testing", status: "Completed" },
      { name: "CompTIA Security+", detail: "Security Foundations", status: "Completed" },
      { name: "Sophos Engineer", detail: "Endpoint & Network Security", status: "Completed" },
      { name: "CompTIA SecAI+", detail: "AI Security", status: "In progress" },
      { name: "CompTIA SecurityX", detail: "Advanced Security Architecture", status: "In progress" },
    ],
    education: {
      label: "Education",
      items: [
        "Software Engineering · UCS · expected graduation in 2026",
      ],
    },
    footer: "Designed like a terminal: direct, verifiable, and outcome-oriented.",
  },
} as const;

const anchors = ["inicio", "projetos", "experiencia", "certificacoes", "pesquisa", "contato"];
const researchPipeline = ["Transformer Encoder", "CLS Embeddings", "Base Classifiers", "OOF Predictions", "Meta-classifier"];

export default function Home() {
  const [language, setLanguage] = useState<Language>("pt");
  const [projectImageIndexes, setProjectImageIndexes] = useState<Record<string, number>>({});
  const [modalGallery, setModalGallery] = useState<ModalGallery | null>(null);
  const t = copy[language];

  useEffect(() => {
    if (!modalGallery) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setModalGallery(null);
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        setModalGallery((current) => {
          if (!current || current.images.length < 2) return current;
          const direction = event.key === "ArrowLeft" ? -1 : 1;
          return { ...current, index: (current.index + direction + current.images.length) % current.images.length };
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalGallery]);

  const changeProjectImage = (code: string, length: number, direction: number) => {
    setProjectImageIndexes((current) => {
      const index = current[code] ?? 0;
      return { ...current, [code]: (index + direction + length) % length };
    });
  };

  return (
    <main>
      <section className="hero-shell" id="inicio" aria-labelledby="hero-title">
        <header className="topbar">
          <a className="terminal-mark" href="#inicio" aria-label={language === "pt" ? "Voltar ao início" : "Back to home"}>
            <TerminalSignature />
          </a>

          <nav className="nav-links" aria-label={language === "pt" ? "Navegação principal" : "Main navigation"}>
            {t.nav.map((item, index) => (
              <a key={anchors[index]} href={"#" + anchors[index]}>{item}</a>
            ))}
          </nav>

          <div className="language-switch" aria-label={language === "pt" ? "Selecionar idioma" : "Select language"}>
            <button className={language === "pt" ? "active" : ""} onClick={() => setLanguage("pt")} aria-pressed={language === "pt"}>PT</button>
            <span aria-hidden="true">|</span>
            <button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")} aria-pressed={language === "en"}>EN</button>
          </div>
        </header>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow"><span className="status-dot" />{t.hero.status}</p>
            <h1 id="hero-title" className="hero-role">{t.hero.role}<br /><span>{t.hero.accent}</span></h1>
            <p className="hero-intro">{t.hero.intro}</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#projetos">{t.hero.projects}<span aria-hidden="true">→</span></a>
              <a className="button button-secondary" href="#experiencia">{t.hero.experience}<span aria-hidden="true">↓</span></a>
            </div>
          </div>

          <div className="terminal-window" aria-label={language === "pt" ? "Terminal com exemplos de operações de segurança" : "Terminal with security operations examples"}>
            <div className="terminal-titlebar">
              <span><i />terminal</span>
              <small>session: security-ops</small>
              <b aria-hidden="true">—</b>
            </div>
            <div className="terminal-body">
              <AnimatedTerminal />
            </div>
          </div>
        </div>

        <div className="signal-cards" aria-label={language === "pt" ? "Áreas de atuação" : "Areas of expertise"}>
          {t.hero.signals.map((signal, index) => (
            <article key={signal}>
              <span className="signal-number">0{index + 1}</span>
              <strong>{signal}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section" id="projetos">
        <SectionHeader kicker={t.sections.projects.kicker} title={t.sections.projects.title} text={t.sections.projects.text} />
        <div className="projects-grid">
          {t.projectItems.map((project) => {
            const images: readonly ProjectImage[] = "images" in project ? project.images : [];
            const imageIndex = images.length ? (projectImageIndexes[project.code] ?? 0) % images.length : 0;

            return (
            <article className="project-card" key={project.code}>
              <div className="card-top"><span>{project.code}</span><i aria-hidden="true">↗</i></div>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              {images.length ? (
                <div className="project-gallery">
                  <button
                    type="button"
                    className="project-image-button"
                    onClick={() => setModalGallery({ title: project.title, images, index: imageIndex })}
                    aria-label={language === "pt" ? `Ampliar imagem do projeto ${project.title}` : `Enlarge ${project.title} project image`}
                  >
                    <img src={images[imageIndex].src} alt={images[imageIndex].alt} loading="lazy" />
                    <span className="expand-hint">{language === "pt" ? "Ampliar" : "Enlarge"} ↗</span>
                  </button>
                  {images.length > 1 ? (
                    <div className="card-carousel-controls" aria-label={language === "pt" ? "Controles da galeria" : "Gallery controls"}>
                      <button type="button" onClick={() => changeProjectImage(project.code, images.length, -1)} aria-label={language === "pt" ? "Imagem anterior" : "Previous image"}>←</button>
                      <span>{imageIndex + 1} / {images.length}</span>
                      <button type="button" onClick={() => changeProjectImage(project.code, images.length, 1)} aria-label={language === "pt" ? "Próxima imagem" : "Next image"}>→</button>
                    </div>
                  ) : null}
                </div>
              ) : null}
              <div className="tag-list">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            </article>
          )})}
        </div>
      </section>

      <section className="content-section split-section" id="experiencia">
        <div>
          <SectionHeader kicker={t.sections.experience.kicker} title={t.sections.experience.title} text={t.sections.experience.text} />
          <div className="education-panel">
            <span>{t.education.label}</span>
            {t.education.items.map((item) => <p key={item}>{item}</p>)}
          </div>
        </div>
        <div className="timeline">
          {t.experienceItems.map((item) => (
            <article key={item.period}>
              <span>{item.period}</span>
              <div>
                <h3>{item.role}</h3>
                <strong>{item.org}</strong>
                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section" id="certificacoes">
        <SectionHeader kicker={t.sections.certifications.kicker} title={t.sections.certifications.title} text={t.sections.certifications.text} />
        <div className="cert-grid">
          {t.certifications.map((cert, index) => (
            <article key={cert.name}>
              <span className="cert-index">cert_{String(index + 1).padStart(2, "0")}</span>
              <h3>{cert.name}</h3>
              <p>{cert.detail}</p>
              <strong><i />{cert.status}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section research-section" id="pesquisa">
        <div className="research-copy">
          <SectionHeader kicker={t.sections.research.kicker} title={t.sections.research.title} text={t.sections.research.text} />
          <p className="research-title">A Stacking Ensemble Approach with Transformer-Based Feature Extraction for Detecting SQL Injection and Cross-Site Scripting in HTTP Traffic</p>
          <p className="metrics-note">{t.sections.research.metrics}</p>
          <p className="publication-note">{t.sections.research.publication}</p>
        </div>
        <div className="pipeline" aria-label={t.sections.research.label}>
          <div className="pipeline-head"><span>{t.sections.research.label}</span><small>model.pipeline</small></div>
          {researchPipeline.map((step, index) => (
            <div className="pipeline-step" key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
              <i aria-hidden="true">{index < researchPipeline.length - 1 ? "↓" : "✓"}</i>
            </div>
          ))}
        </div>
      </section>

      <section className="contact-section" id="contato">
        <div>
          <p className="section-kicker">{"// "}{t.sections.contact.kicker}</p>
          <h2>{t.sections.contact.title}</h2>
          <p>{t.sections.contact.text}</p>
        </div>
        <a className="button button-primary" href="https://www.linkedin.com/in/arthur-goncalves-security" target="_blank" rel="noreferrer">
          {t.sections.contact.action}<span aria-hidden="true">↗</span>
        </a>
      </section>

      <footer>
        <span>&gt;_ Arthur Gonçalves</span>
        <p>{t.footer}</p>
        <a href="#inicio">{language === "pt" ? "Voltar ao início ↑" : "Back to top ↑"}</a>
      </footer>

      {modalGallery ? (
        <div className="image-modal" role="dialog" aria-modal="true" aria-label={modalGallery.title} onMouseDown={(event) => {
          if (event.target === event.currentTarget) setModalGallery(null);
        }}>
          <div className="image-modal-panel">
            <div className="image-modal-header">
              <div>
                <span>{language === "pt" ? "Galeria do projeto" : "Project gallery"}</span>
                <strong>{modalGallery.title}</strong>
              </div>
              <button type="button" className="modal-close" onClick={() => setModalGallery(null)} aria-label={language === "pt" ? "Fechar imagem" : "Close image"}>×</button>
            </div>
            <div className="modal-image-stage">
              <img src={modalGallery.images[modalGallery.index].src} alt={modalGallery.images[modalGallery.index].alt} />
              {modalGallery.images.length > 1 ? (
                <>
                  <button type="button" className="modal-arrow modal-arrow-left" onClick={() => setModalGallery((current) => current ? { ...current, index: (current.index - 1 + current.images.length) % current.images.length } : current)} aria-label={language === "pt" ? "Imagem anterior" : "Previous image"}>←</button>
                  <button type="button" className="modal-arrow modal-arrow-right" onClick={() => setModalGallery((current) => current ? { ...current, index: (current.index + 1) % current.images.length } : current)} aria-label={language === "pt" ? "Próxima imagem" : "Next image"}>→</button>
                </>
              ) : null}
            </div>
            <div className="modal-footer">
              <span>{modalGallery.index + 1} / {modalGallery.images.length}</span>
              {modalGallery.images.length > 1 ? (
                <div className="modal-dots" aria-label={language === "pt" ? "Selecionar imagem" : "Select image"}>
                  {modalGallery.images.map((image, index) => (
                    <button key={image.src} type="button" className={index === modalGallery.index ? "active" : ""} onClick={() => setModalGallery((current) => current ? { ...current, index } : current)} aria-label={`${language === "pt" ? "Imagem" : "Image"} ${index + 1}`} />
                  ))}
                </div>
              ) : null}
              <span>{language === "pt" ? "Use ← → ou Esc" : "Use ← → or Esc"}</span>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function SectionHeader({ kicker, title, text }: { kicker: string; title: string; text: string }) {
  return (
    <div className="section-header">
      <p className="section-kicker">{"// "}{kicker}</p>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}

function TerminalBlock({ command, lines }: { command: string; lines: string[] }) {
  return (
    <div className="terminal-block">
      <p><span>$</span> {command}</p>
      {lines.map((line) => <code className={line.startsWith("[ok]") ? "ok" : ""} key={line}>{line}</code>)}
    </div>
  );
}

const terminalSequence = [
  { command: "wazuh-alerts --severity high", lines: ["rule: 31105  severity: 12  source: web-gateway", "rule: 5715   severity: 10  source: identity", "[ok] correlation pipeline active"] },
  { command: "curl -s localhost:9200/_cluster/health", lines: ["status   nodes   shards   latency", "green    3       126      42ms", "[ok] OpenSearch index healthy"] },
  { command: "python automate_response.py", lines: ["[+] Loading rules and playbooks", "[+] Evaluating alerts", "[ok] Response workflow completed"] },
  { command: "go run collector.go", lines: ["[info] collector started", "[info] events normalized and indexed", "[ok] Collector running"] },
];

function AnimatedTerminal() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(10000);
      return;
    }
    const timer = window.setInterval(() => setStep((current) => current + 1), 28);
    return () => window.clearInterval(timer);
  }, []);

  let cursor = 0;
  const rendered = terminalSequence.map((block) => {
    const commandStart = cursor;
    const typedLength = Math.max(0, Math.min(block.command.length, step - commandStart));
    cursor += block.command.length + 5;
    const visibleLines = block.lines.filter((_, index) => step >= cursor + index * 9);
    cursor += block.lines.length * 9 + 7;
    if (step < commandStart) return null;
    return (
      <div className="terminal-block terminal-block-live" key={block.command}>
        <p><span>$</span> {block.command.slice(0, typedLength)}{typedLength < block.command.length && <i className="typing-cursor" />}</p>
        {visibleLines.map((line) => <code className={line.startsWith("[ok]") ? "ok terminal-line-live" : "terminal-line-live"} key={line}>{line}</code>)}
      </div>
    );
  });

  return <>{rendered}<div className="terminal-prompt" style={{ opacity: step >= cursor ? 1 : 0 }}><span>$</span><i /></div></>;
}

function TerminalSignature() {
  const name = "Arthur Gonçalves";
  const [length, setLength] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLength(name.length);
      return;
    }
    const timer = window.setInterval(() => {
      setLength((current) => {
        if (current >= name.length) {
          window.clearInterval(timer);
          return current;
        }
        return current + 1;
      });
    }, 75);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <span className="terminal-signature" aria-hidden="true">
      <b>&gt;_</b><span>{name.slice(0, length)}</span><i />
    </span>
  );
}
