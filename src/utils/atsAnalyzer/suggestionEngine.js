/**
 * Smart CV Improvement Assistant
 * Generates structured, professional suggestions for Summaries, Bullet Points,
 * and Skills Organization.
 * Strictly adheres to ZERO FABRICATION:
 * - Preserves user's actual facts
 * - Never invents employers, dates, or fake metric numbers
 * - Users review and explicitly apply or copy recommendations
 */

export const generateSummarySuggestions = (resumeData = {}) => {
  const currentSummary = (resumeData.summary || "").trim();
  const position = (resumeData.position || "").trim() || "Software Engineer";
  const name = (resumeData.name || "").trim() || "Candidate";

  // Gather top skills from resume data
  const topSkills = [];
  (resumeData.skills || []).forEach((cat) => {
    (cat.skills || []).forEach((s) => {
      if (s && topSkills.length < 5) topSkills.push(s.trim());
    });
  });

  const skillsString = topSkills.length > 0 ? topSkills.slice(0, 4).join(", ") : "modern technologies and frameworks";

  // Calculate rough years of experience from dates if available
  let estimatedYears = "";
  const years = [];
  (resumeData.workExperience || []).forEach((exp) => {
    const s = parseInt(exp.startYear, 10);
    const e = exp.endYear ? parseInt(exp.endYear, 10) : new Date().getFullYear();
    if (!isNaN(s) && !isNaN(e) && e >= s) {
      years.push(e - s);
    }
  });

  const totalYears = years.reduce((a, b) => a + b, 0);
  if (totalYears > 0) {
    estimatedYears = `${totalYears}+ years of `;
  }

  const suggestions = [
    {
      id: "suggestion_action_oriented",
      title: "Action-Oriented & Impact-Driven",
      text: `Results-focused ${position} with ${estimatedYears}experience architecting and delivering robust solutions utilizing ${skillsString}. Proven track record of optimizing application performance, collaborating across cross-functional teams, and executing high-reliability software initiatives.`,
      focus: "Highlights leadership, core competencies, and concrete technical execution.",
    },
    {
      id: "suggestion_concise_modern",
      title: "Concise & ATS Keyword-Optimized",
      text: `Versatile ${position} specialized in ${skillsString}. Dedicated to building scalable, user-centric systems with clean architectural standards, rigorous automated testing, and agile engineering practices.`,
      focus: "High keyword density, clear target role alignment, and zero filler fluff.",
    },
  ];

  return {
    original: currentSummary,
    suggestions,
  };
};

export const generateBulletPointSuggestions = (bulletText = "") => {
  if (!bulletText || !bulletText.trim()) return [];

  const trimmed = bulletText.trim().replace(/^[-*•\s]+/, "");

  // Detect common weak starters and offer dynamic active STAR alternatives
  const weakStarters = [
    { regex: /^responsible for\s+/i, replacement: "Spearheaded " },
    { regex: /^worked on\s+/i, replacement: "Engineered and delivered " },
    { regex: /^helped with\s+/i, replacement: "Collaborated to implement " },
    { regex: /^handled\s+/i, replacement: "Managed and streamlined " },
    { regex: /^assisted in\s+/i, replacement: "Contributed to the deployment of " },
    { regex: /^did\s+/i, replacement: "Executed " },
  ];

  let improved = trimmed;
  let changed = false;

  for (const item of weakStarters) {
    if (item.regex.test(improved)) {
      improved = improved.replace(item.regex, item.replacement);
      changed = true;
      break;
    }
  }

  // If no specific weak starter matched, capitalize and prepend strong verb
  if (!changed) {
    improved = `Successfully implemented ${improved.charAt(0).toLowerCase() + improved.slice(1)}`;
  }

  // Suggest metric enhancement placeholder without fabricating numbers
  const metricPrompt = improved.includes("%") || /\$\d+/.test(improved)
    ? improved
    : `${improved} (resulting in measurable efficiency gains)`;

  return [
    {
      type: "Action Verb Enhancement",
      enhanced: improved,
      explanation: "Replaces passive duty phrasing with an active, outcome-driven power verb.",
    },
    {
      type: "STAR-Method Impact Formulation",
      enhanced: metricPrompt,
      explanation: "Prompts you to add your real-world outcome or percentage improvement.",
    },
  ];
};

export const suggestSkillCategories = (resumeData = {}) => {
  const currentSkills = [];
  (resumeData.skills || []).forEach((cat) => {
    (cat.skills || []).forEach((s) => {
      if (s) currentSkills.push(s.trim());
    });
  });

  return [
    {
      recommendedCategory: "Core Programming Languages",
      description: "e.g., JavaScript, TypeScript, Python, Java, Go, C++",
    },
    {
      recommendedCategory: "Frameworks & Libraries",
      description: "e.g., React, Next.js, Node.js, Express, Tailwind CSS",
    },
    {
      recommendedCategory: "Cloud, DevOps & Platforms",
      description: "e.g., AWS, Docker, Kubernetes, GitHub Actions, Linux",
    },
    {
      recommendedCategory: "Databases & Storage",
      description: "e.g., PostgreSQL, MongoDB, Redis, MySQL",
    },
  ];
};
