const SampleResumeData = {
  name: "ALEXANDER CHEN",
  position: "Senior Full Stack Cloud Architect",
  contactInformation: "+1 (415) 890-2341",
  email: "alexander.chen.dev@gmail.com",
  address: "Seattle, WA",
  profilePicture: "",
  socialMedia: [
    {
      id: "sample_sm_1",
      socialMedia: "LinkedIn",
      link: "linkedin.com/in/alexander-chen-cloud",
    },
    {
      id: "sample_sm_2",
      socialMedia: "Portfolio",
      link: "alexanderchen.tech/portfolio",
    },
    {
      id: "sample_sm_3",
      socialMedia: "Website",
      link: "alexanderchen.tech",
    },
  ],
  summary:
    "Distinguished Senior Full Stack & Cloud Architect with 9+ years of expertise designing distributed microservices, highly resilient cloud native architectures, and real-time enterprise platforms. Proven track record leading high-velocity engineering teams, reducing infrastructure expenditure by 35%, and maintaining 99.99% system uptime across mission-critical SaaS applications.",
  education: [
    {
      school: "University of Washington",
      degree: "M.S. in Computer Science & Distributed Systems",
      startYear: "2016-09-01",
      endYear: "2018-06-15",
    },
    {
      school: "University of California, Berkeley",
      degree: "B.S. in Computer Engineering & Mathematics",
      startYear: "2012-08-25",
      endYear: "2016-05-20",
    },
  ],
  workExperience: [
    {
      company: "Stratos Cloud Systems",
      position: "Staff Cloud Engineer & Technical Lead",
      description:
        "Stratos is a high-growth cloud infrastructure platform providing enterprise multi-tenant Kubernetes and observability solutions.",
      keyAchievements:
        "Architected distributed event-driven data streaming engine processing over 12M events per second with sub-50ms latency using Kafka and Go.\nLed an agile team of 14 senior engineers across 3 time zones, delivering quarterly milestones with zero security defects.\nSpearheaded cloud cost optimization initiative cutting annual AWS compute spend by $240,000 via spot fleet auto-scaling.\nImplemented zero-trust mutual TLS service mesh reducing lateral attack surfaces across 180+ microservices.",
      startYear: "2021-03-01",
      endYear: "2024-05-30",
    },
    {
      company: "Nexus Financial Technologies",
      position: "Senior Full Stack Engineer",
      description:
        "Nexus develops low-latency algorithmic trading infrastructure and real-time compliance reporting suites for institutional investors.",
      keyAchievements:
        "Engineered real-time reactive portfolio dashboard using Next.js, React, TypeScript, and WebSocket streaming serving 40k daily traders.\nDesigned PostgreSQL transactional database partitioning that accelerated analytics query execution speeds by 65%.\nAutomated end-to-end CI/CD release pipeline with GitHub Actions, cutting staging deployment duration from 45 minutes to 6 minutes.\nAuthored 850+ unit and integration test suites achieving 94% test coverage across core settlement modules.",
      startYear: "2018-07-15",
      endYear: "2021-02-28",
    },
    {
      company: "Apex Digital Solutions",
      position: "Software Engineer",
      description:
        "Apex Digital is a technology consulting agency specializing in scalable enterprise web applications and mobile platforms.",
      keyAchievements:
        "Developed RESTful APIs and secure OAuth2 authentication gateways utilized by over 500,000 monthly active users.\nRefactored monolithic legacy billing workflow into isolated serverless functions, saving 40 engineering hours per month in operational overhead.\nPartnered closely with product managers and UX designers to establish accessible design system compliant with WCAG 2.1 AA standards.",
      startYear: "2016-06-01",
      endYear: "2018-07-01",
    },
  ],
  projects: [
    {
      name: "PulseStream - Real-Time Observability Engine",
      link: "https://alexanderchen.tech/projects/pulsestream",
      description:
        "Open-source distributed telemetry collector and visualizer built with Go, Rust, React, and WebGL.",
      keyAchievements:
        "Engineered columnar memory storage format yielding 5x compression over raw JSON traces.\nAdopted by over 30 production engineering teams globally.",
      startYear: "2023-01-10",
      endYear: "2023-11-20",
    },
    {
      name: "KubeGuard - Policy Enforcement Daemon",
      link: "https://alexanderchen.tech/projects/kubeguard",
      description:
        "Kubernetes admission controller webhook enforcing security posture compliance and resource quotas.",
      keyAchievements:
        "Prevented unauthorized container privilege escalations across 200+ Kubernetes clusters.\nDecreased misconfiguration rollbacks by 85% through proactive shift-left static analysis.",
      startYear: "2022-04-05",
      endYear: "2022-09-15",
    },
  ],
  skills: [
    {
      title: "Technical Skills",
      skills: [
        "Go",
        "TypeScript",
        "Python",
        "React",
        "Next.js",
        "Node.js",
        "Kubernetes",
        "Docker",
        "AWS",
        "Kafka",
        "PostgreSQL",
        "GraphQL",
        "Redis",
        "Terraform",
      ],
    },
    {
      title: "Soft Skills",
      skills: [
        "Technical Leadership",
        "System Architecture",
        "Cross-functional Collaboration",
        "Agile & Scrum Mentorship",
        "Stakeholder Communication",
        "Incident Management",
      ],
    },
    {
      title: "Additional Skills",
      skills: [
        "Microservices Design",
        "CI/CD Pipeline Automation",
        "FinOps & Cost Optimization",
        "Site Reliability Engineering (SRE)",
        "Zero-Trust Security",
      ],
    },
  ],
  languages: ["English (Native)", "German (Professional)", "Mandarin (Conversational)"],
  certifications: [
    {
      name: "AWS Certified Solutions Architect - Professional",
      issuer: "Amazon Web Services (AWS)",
      date: "2023-08",
      credentialId: "AWS-PSA-920481",
      url: "https://aws.amazon.com/verification",
    },
    {
      name: "Google Cloud Certified Professional Cloud Architect",
      issuer: "Google Cloud",
      date: "2023-02",
      credentialId: "GCP-PCA-449102",
      url: "https://cloud.google.com/certification",
    },
    {
      name: "Certified Kubernetes Administrator (CKA)",
      issuer: "Linux Foundation / CNCF",
      date: "2022-11",
      credentialId: "CKA-774019",
      url: "https://www.cncf.io/certification/cka/",
    },
  ],
  profilePhotoStyle: "circle",
  showProfilePhoto: true,
  selectedTemplate: "modern-professional",
};

export default SampleResumeData;

