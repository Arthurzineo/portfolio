/**
 * Single source of truth for every piece of professional content on the site.
 * Both the neural interface and Focus Mode read from here, so nothing has to
 * be kept in sync by hand. Everything below was carried over from the previous
 * portfolio; nothing here is generated or estimated.
 *
 * OWNER REVIEW: entries marked `review` should be confirmed before publishing.
 */

export type Lang = "pt" | "en";
export type Loc = Readonly<Record<Lang, string>>;

export type AreaId =
  | "security"
  | "ai"
  | "ai-security"
  | "research"
  | "projects"
  | "experience"
  | "certifications"
  | "infrastructure"
  | "education"
  | "courses";

export type ProjectId = "ksc-receiver" | "inoichi" | "recon-automation" | "web-attack-detection" | "openrmf";

export const profile = {
  name: "Arthur Gonçalves",
  handle: "Dr4g0nR00t",
  role: { pt: "Security Engineering e AI Security", en: "Security Engineering and AI Security" } as Loc,
  intro: {
    pt: "Construo defesas, automações e sistemas inteligentes para ambientes reais.",
    en: "I build defenses, automation, and intelligent systems for real-world environments.",
  } as Loc,
  motto: "Security is a process, not a product.",
  mottoAuthor: "Bruce Schneier",
  signals: [
    { pt: "Detecção e automação", en: "Detection and automation" },
    { pt: "SIEM e EDR", en: "SIEM and EDR" },
    { pt: "IA aplicada à segurança", en: "AI applied to security" },
  ] as readonly Loc[],
  contact: {
    text: {
      pt: "Estou aberto a oportunidades e conversas sobre Security Engineering, AI Security, detecção, automação e pesquisa aplicada.",
      en: "I am open to opportunities and conversations about Security Engineering, AI Security, detection, automation, and applied research.",
    } as Loc,
    linkedin: "https://www.linkedin.com/in/arthur-goncalves-security",
  },
  portraits: {
    headshot: "/portrait/headshot.webp",
    standing: "/portrait/standing.webp",
    desk: "/portrait/desk-laptop.webp",
    monitors: "/portrait/desk-monitors.webp",
  },
  portraitAlt: { pt: "Retrato de Arthur Gonçalves", en: "Portrait of Arthur Gonçalves" } as Loc,
} as const;

export type Area = { id: AreaId; name: string; summary: Loc };

export const areas: readonly Area[] = [
  {
    id: "security",
    name: "Security Engineering",
    summary: {
      pt: "Segurança de endpoints, SIEM/EDR, análise de vulnerabilidades, integrações e automação, com foco em transformar operação em engenharia.",
      en: "Endpoint security, SIEM/EDR, vulnerability analysis, integrations, and automation, focused on turning operations into engineering.",
    },
  },
  {
    id: "ai",
    name: "Artificial Intelligence",
    summary: {
      pt: "IA aplicada a problemas de segurança: pipelines assistidos por IA, detecção de ataques com machine learning e orquestração de agentes.",
      en: "AI applied to security problems: AI-assisted pipelines, machine-learning attack detection, and agent orchestration.",
    },
  },
  {
    id: "ai-security",
    name: "AI Security",
    summary: {
      pt: "Evolução do foco para segurança aplicada à IA, com integração segura entre agentes e ferramentas.",
      en: "An evolving focus on security applied to AI, with secure integration between agents and tools.",
    },
  },
  {
    id: "research",
    name: "Research",
    summary: {
      pt: "Pesquisa de TCC sobre generalização na detecção de SQL Injection com machine learning: detectores treinados em algumas bases de dados são avaliados em bases que nunca viram.",
      en: "Undergraduate research on generalization in machine-learning detection of SQL Injection: detectors trained on some datasets are evaluated on datasets they have never seen.",
    },
  },
  {
    id: "projects",
    name: "Projects",
    summary: {
      pt: "Ferramentas e pesquisas construídas para resolver problemas reais de visibilidade, detecção e resposta.",
      en: "Tools and research built to solve real-world visibility, detection, and response problems.",
    },
  },
  {
    id: "experience",
    name: "Professional Experience",
    summary: {
      pt: "Atuação em segurança de endpoints, observabilidade, automação e infraestrutura em ambientes corporativos.",
      en: "Work across endpoint security, observability, automation, and infrastructure in corporate environments.",
    },
  },
  {
    id: "certifications",
    name: "Certifications",
    summary: {
      pt: "Base sólida em defesa, análise de ameaças e segurança ofensiva, evoluindo para segurança aplicada à IA.",
      en: "A solid foundation in defense, threat analysis, and offensive security, with an evolving focus on AI security.",
    },
  },
  {
    id: "infrastructure",
    name: "Infrastructure & Networks",
    summary: {
      pt: "Administração de ambientes Windows e Linux, redes, troubleshooting e suporte à infraestrutura crítica.",
      en: "Windows and Linux administration, networking, troubleshooting, and critical infrastructure support.",
    },
  },
  {
    id: "education",
    name: "Education",
    summary: {
      pt: "Graduação em Engenharia de Software na Universidade de Caxias do Sul.",
      en: "Bachelor's degree in Software Engineering at the University of Caxias do Sul.",
    },
  },
  {
    id: "courses",
    name: "Courses",
    summary: {
      pt: "Cursos complementares à formação e às certificações.",
      en: "Courses that complement the degree and the certifications.",
    },
  },
];

export type ProjectImage = { src: string; alt: Loc };
export type Project = {
  id: ProjectId;
  title: string;
  description: Loc;
  tags: readonly string[];
  images: readonly ProjectImage[];
  note?: Loc;
  /** Areas this project belongs to, each with the concrete reason for the link. */
  links: readonly { area: AreaId; why: Loc }[];
};

export const projects: readonly Project[] = [
  {
    id: "ksc-receiver",
    title: "KSC Receiver",
    description: {
      pt: "Pipeline assistido por IA para transformar logs do Kaspersky Security Center em decoders e eventos pesquisáveis no Wazuh/OpenSearch.",
      en: "An AI-assisted pipeline that transforms Kaspersky Security Center logs into decoders and searchable Wazuh/OpenSearch events.",
    },
    tags: ["Python", "Wazuh", "OpenSearch", "AI"],
    images: [
      { src: "/ksc-receiver-events.png", alt: { pt: "Listagem de eventos processados pelo KSC Receiver", en: "Events processed by KSC Receiver" } },
      { src: "/ksc-receiver-artifact.png", alt: { pt: "Tela de aprovação de artefato decoder no KSC Receiver", en: "Decoder artifact approval screen in KSC Receiver" } },
      { src: "/ksc-receiver-decoder-session.png", alt: { pt: "Sessão de decodificação e extração JSON no KSC Receiver", en: "Decode session and JSON extraction in KSC Receiver" } },
      { src: "/ksc-receiver-event-review.png", alt: { pt: "Revisão de evento e histórico de tentativas no KSC Receiver", en: "Event review and attempt history in KSC Receiver" } },
    ],
    links: [
      { area: "security", why: { pt: "Leva eventos de endpoint para o SIEM (Wazuh e OpenSearch).", en: "Brings endpoint events into the SIEM (Wazuh and OpenSearch)." } },
      { area: "ai", why: { pt: "A geração de decoders é assistida por IA.", en: "Decoder generation is AI-assisted." } },
    ],
  },
  {
    id: "inoichi",
    title: "INOICHI",
    description: {
      pt: "Sistema de visibilidade e resposta para identificar ativos sem proteção, correlacionar evidências e apoiar ações de remediação.",
      en: "A visibility and response system for finding unprotected assets, correlating evidence, and supporting remediation.",
    },
    tags: ["Python", "Nmap", "OpenSearch", "Asset Security"],
    images: [{ src: "/inoichi-dashboard.png", alt: { pt: "Dashboard operacional do INOICHI", en: "INOICHI operational dashboard" } }],
    links: [
      { area: "security", why: { pt: "Encontra ativos sem proteção e apoia a remediação.", en: "Finds unprotected assets and supports remediation." } },
      { area: "infrastructure", why: { pt: "Descobre os ativos varrendo a rede com Nmap.", en: "Discovers assets by scanning the network with Nmap." } },
    ],
  },
  {
    id: "recon-automation",
    title: "Recon Automation",
    description: {
      pt: "Orquestração em Go de ferramentas de reconhecimento, parsers estruturados e armazenamento de resultados para análise contínua.",
      en: "Go-based orchestration for reconnaissance tools, structured parsers, and continuous analysis storage.",
    },
    tags: ["Go", "Nmap", "httpx", "Docker"],
    images: [
      {
        src: "/recon-automation-smart-recon-certificate.png",
        alt: { pt: "Certificado Smart Recon para Pentest de Arthur Gonçalves", en: "Arthur Gonçalves Smart Recon for Pentest certificate" },
      },
    ],
    links: [
      { area: "security", why: { pt: "Automatiza a etapa de reconhecimento de um pentest.", en: "Automates the reconnaissance stage of a pentest." } },
      { area: "infrastructure", why: { pt: "Orquestra Nmap e httpx em contêineres Docker.", en: "Orchestrates Nmap and httpx in Docker containers." } },
    ],
  },
  {
    id: "web-attack-detection",
    title: "Web Attack Detection",
    description: {
      pt: "Estudo de generalização na detecção de SQL Injection com machine learning: treina detectores em um conjunto de bases e mede o desempenho em bases nunca vistas.",
      en: "A study of generalization in machine-learning detection of SQL Injection: detectors are trained on a set of datasets and measured on datasets never seen.",
    },
    tags: ["Machine Learning", "SQL Injection", "Generalization", "Leave-one-dataset-out"],
    images: [],
    links: [
      { area: "research", why: { pt: "É o tema da pesquisa de TCC.", en: "It is the subject of the undergraduate research." } },
      { area: "ai", why: { pt: "Treina e avalia detectores com machine learning.", en: "Trains and evaluates detectors with machine learning." } },
      { area: "security", why: { pt: "Detecta ataques de SQL Injection.", en: "Detects SQL Injection attacks." } },
    ],
  },
  {
    id: "openrmf",
    title: "OpenRMF",
    description: {
      pt: "Plataforma open source para orquestração de agentes de IA, com coordenação multiagente, memória estruturada e integração segura com ferramentas.",
      en: "An open-source platform for AI agent orchestration, combining multi-agent coordination, structured memory, and secure tool integration.",
    },
    // review: release window carried over from the previous site.
    note: { pt: "Disponibilização prevista até o fim de 2026.", en: "Planned for release by the end of 2026." },
    tags: ["Open Source", "Multi-Agent", "AI Orchestration", "Security"],
    images: [{ src: "/openrmf-project.png", alt: { pt: "Dashboard de governança e riscos do OpenRMF", en: "OpenRMF governance and risk dashboard" } }],
    links: [
      { area: "ai", why: { pt: "Orquestra agentes de IA com memória estruturada.", en: "Orchestrates AI agents with structured memory." } },
      { area: "ai-security", why: { pt: "Integra agentes a ferramentas de forma segura.", en: "Integrates agents with tools securely." } },
    ],
  },
];

/** Relationships between a course or degree and another node. */
export const itemLinks: readonly { item: string; to: AreaId | ProjectId; why: Loc }[] = [
  { item: "smart-recon", to: "recon-automation", why: { pt: "O certificado do curso está na galeria do projeto.", en: "The course certificate is in the project gallery." } },
  { item: "software-engineering", to: "research", why: { pt: "A pesquisa é o TCC da graduação.", en: "The research is the degree's final thesis." } },
];

/** Area-to-area relationships that do not pass through a project. */
export const areaLinks: readonly { a: AreaId; b: AreaId; why: Loc }[] = [
  { a: "experience", b: "security", why: { pt: "Segurança de endpoints e SIEM/EDR no dia a dia da UCS.", en: "Endpoint security and SIEM/EDR in day-to-day work at UCS." } },
  { a: "experience", b: "infrastructure", why: { pt: "Administração de Windows, Linux e redes desde 2022.", en: "Windows, Linux, and network administration since 2022." } },
  { a: "certifications", b: "security", why: { pt: "CySA+, PenTest+, Security+ e Sophos Engineer.", en: "CySA+, PenTest+, Security+, and Sophos Engineer." } },
  { a: "certifications", b: "ai-security", why: { pt: "CompTIA SecAI+.", en: "CompTIA SecAI+." } },
];

export type Degree = { id: "software-engineering"; name: Loc; detail: Loc };
// review: expected graduation year carried over from the previous site.
export const degrees: readonly Degree[] = [
  {
    id: "software-engineering",
    name: { pt: "Engenharia de Software", en: "Software Engineering" },
    detail: { pt: "Universidade de Caxias do Sul. Conclusão prevista em 2026.", en: "University of Caxias do Sul. Expected graduation in 2026." },
  },
];

export type Course = { id: "smart-recon"; name: string; detail: Loc };
// review: only the course evidenced in the previous site (its certificate is in the Recon Automation
// gallery) is listed. Add the others here; provider and year are unknown and left out on purpose.
export const courses: readonly Course[] = [
  {
    id: "smart-recon",
    name: "Smart Recon para Pentest",
    detail: { pt: "Curso de reconhecimento para testes de intrusão, com certificado.", en: "Reconnaissance course for penetration testing, with certificate." },
  },
];

export type Role = { id: string; start: number; end: number | null; period: Loc; role: Loc; org: Loc; description: Loc };

export const experience: readonly Role[] = [
  {
    id: "ucs-senior",
    start: 2026,
    end: null,
    period: { pt: "2026 — presente", en: "2026 — present" },
    role: { pt: "Técnico de TI Sênior", en: "Senior IT Technician" },
    org: { pt: "Universidade de Caxias do Sul", en: "University of Caxias do Sul" },
    description: {
      pt: "Segurança de endpoints, SIEM/EDR, análise de vulnerabilidades, integrações, automação e suporte à infraestrutura crítica.",
      en: "Endpoint security, SIEM/EDR, vulnerability analysis, integrations, automation, and critical infrastructure support.",
    },
  },
  {
    id: "ucs-mid",
    start: 2023,
    end: 2026,
    period: { pt: "2023 — 2026", en: "2023 — 2026" },
    role: { pt: "Técnico de TI Pleno", en: "Mid-level IT Technician" },
    org: { pt: "Universidade de Caxias do Sul", en: "University of Caxias do Sul" },
    description: {
      pt: "Atuação em segurança operacional, gestão de endpoints, observabilidade e desenvolvimento de automações para o ambiente corporativo.",
      en: "Operational security, endpoint management, observability, and automation development for the corporate environment.",
    },
  },
  {
    id: "ucs-junior",
    start: 2022,
    end: 2023,
    period: { pt: "2022 — 2023", en: "2022 — 2023" },
    role: { pt: "Técnico de TI Júnior", en: "Junior IT Technician" },
    org: { pt: "Universidade de Caxias do Sul", en: "University of Caxias do Sul" },
    description: {
      pt: "Administração de ambientes Windows e Linux, troubleshooting, redes e evolução de controles operacionais de segurança.",
      en: "Windows and Linux administration, troubleshooting, networking, and continuous improvement of operational security controls.",
    },
  },
  {
    id: "introduce-analyst",
    start: 2022,
    end: 2022,
    period: { pt: "2022", en: "2022" },
    role: { pt: "Analista de Suporte de TI Júnior", en: "Junior IT Support Analyst" },
    org: { pt: "Introduce", en: "Introduce" },
    description: {
      pt: "Atendimento e suporte técnico a usuários, diagnóstico de incidentes e sustentação de sistemas.",
      en: "User support, incident diagnosis, and day-to-day system operations.",
    },
  },
  {
    id: "introduce-intern",
    start: 2021,
    end: 2021,
    period: { pt: "2021", en: "2021" },
    role: { pt: "Estagiário de TI", en: "IT Intern" },
    org: { pt: "Introduce", en: "Introduce" },
    description: {
      pt: "Início da trajetória profissional com suporte técnico, preparação de equipamentos e atendimento a usuários.",
      en: "Started a professional career with technical support, equipment preparation, and user assistance.",
    },
  },
];

export type CertId = "cysa" | "pentest" | "security-plus" | "sophos" | "secai" | "securityx";
export type Certification = {
  id: CertId;
  name: string;
  detail: string;
  status: "done" | "progress";
  /** Path under /public to the official badge file issued to the holder (for example from Credly). Optional. */
  badge?: string;
};
/** Card tint per issuer: a colour cue only. Logos come from the official badge files, never redrawn here. */
export const ISSUER_TINT: Record<string, string> = { CompTIA: "#ff5a5f", Sophos: "#4d8dff" };
/** The issuer is the first word of the certification name (CompTIA, Sophos). */
export const issuerOf = (cert: Certification) => cert.name.split(" ")[0];

// SecAI+ confirmed as completed by the owner on 2026-11-14. review: SecurityX still in progress?
export const certifications: readonly Certification[] = [
  { id: "cysa", name: "CompTIA CySA+", detail: "Cybersecurity Analyst", status: "done" },
  { id: "pentest", name: "CompTIA PenTest+", detail: "Penetration Testing", status: "done" },
  { id: "security-plus", name: "CompTIA Security+", detail: "Security Foundations", status: "done" },
  { id: "sophos", name: "Sophos Engineer", detail: "Endpoint & Network Security", status: "done" },
  { id: "secai", name: "CompTIA SecAI+", detail: "AI Security", status: "done" },
  { id: "securityx", name: "CompTIA SecurityX", detail: "Advanced Security Architecture", status: "progress" },
];

// review: expected graduation year carried over from the previous site.
export const education: Loc = {
  pt: "Engenharia de Software, UCS. Conclusão prevista em 2026.",
  en: "Software Engineering, UCS. Expected graduation in 2026.",
};

// review: rewritten on 2026-11-14 from what the owner said about the current scope of the thesis.
// The old paper title and the stacking pipeline were removed because the thesis changed focus.
export const research = {
  focus: {
    pt: "A pergunta central é se um detector de SQL Injection continua funcionando fora dos dados em que foi treinado.",
    en: "The central question is whether a SQL Injection detector keeps working outside the data it was trained on.",
  } as Loc,
  datasets: {
    pt: "Cinco bases: três externas, uma real coletada por mim e uma sintética, gerada simulando ataques em laboratório próprio.",
    en: "Five datasets: three external, one real dataset I collected, and one synthetic, generated by simulating attacks in my own lab.",
  } as Loc,
  protocol: [
    { pt: "Reunir as cinco bases de dados", en: "Gather the five datasets" },
    { pt: "Treinar o detector em quatro delas", en: "Train the detector on four of them" },
    { pt: "Testar na base que ficou de fora", en: "Test on the one left out" },
    { pt: "Repetir até cada base ter sido a de teste", en: "Repeat until each dataset has been the test set" },
  ] as readonly Loc[],
  protocolName: "leave-one-dataset-out",
  metrics: {
    pt: "Avaliação orientada por precision, recall, F1-score e AUC-PR.",
    en: "Evaluation focused on precision, recall, F1-score, and AUC-PR.",
  } as Loc,
  publication: {
    pt: "Após a conclusão e publicação do artigo, esta seção será atualizada com o link de acesso.",
    en: "After the article is completed and published, this section will be updated with a direct access link.",
  } as Loc,
} as const;

export const areaById = Object.fromEntries(areas.map((a) => [a.id, a])) as Record<AreaId, Area>;
export const projectById = Object.fromEntries(projects.map((p) => [p.id, p])) as Record<ProjectId, Project>;
export const certById = Object.fromEntries(certifications.map((c) => [c.id, c])) as Record<CertId, Certification>;
