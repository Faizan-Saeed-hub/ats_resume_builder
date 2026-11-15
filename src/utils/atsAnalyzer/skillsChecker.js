/**
 * Skills & Technical Competencies ATS Checker
 * Evaluates skill density, categorization, duplicate skills, and keyword presence.
 * Rule: Identifies organization opportunities; never hallucinates or invents skills.
 * Maximum score: 20 points.
 */

export const checkSkills = (resumeData = {}) => {
  let score = 0;
  const maxScore = 20;
  const checks = [];
  const issues = [];

  const rawSkillCategories = Array.isArray(resumeData.skills) ? resumeData.skills : [];
  
  // Extract all individual skill tokens
  const allSkills = [];
  const skillCountPerCategory = {};

  rawSkillCategories.forEach((cat) => {
    const title = cat.title || "Skills";
    const items = (cat.skills || []).map((s) => (typeof s === "string" ? s.trim() : "")).filter(Boolean);
    skillCountPerCategory[title] = items.length;
    items.forEach((item) => {
      allSkills.push({
        raw: item,
        normalized: item.toLowerCase().replace(/[^a-z0-9+#]/g, ""),
        category: title,
      });
    });
  });

  const totalSkillCount = allSkills.length;

  // 1. Total Skills Count & Density (Max 12 pts)
  if (totalSkillCount === 0) {
    checks.push({
      id: "skills_presence",
      title: "No Skills Listed",
      status: "ISSUE",
      message: "The skills section is completely empty. ATS bots search primarily for skills keywords.",
    });
    issues.push({
      id: "issue_skills_none",
      title: "Add Relevant Skills",
      severity: "ISSUE",
      section: "Skills",
      fieldId: "section-skills",
      description: "No skills or technical competencies are currently entered.",
      whyItMatters: "Job board and employer ATS systems rank applicants primarily by skill keyword matches.",
      suggestedSolution: "Add 8-15 technical skills, frameworks, tools, or domain competencies you actively use.",
    });
  } else if (totalSkillCount >= 10) {
    score += 12;
    checks.push({
      id: "skills_presence",
      title: "Optimal Skills Density",
      status: "PASS",
      message: `${totalSkillCount} core competencies listed across categories.`,
    });
  } else if (totalSkillCount >= 5) {
    score += 8;
    checks.push({
      id: "skills_presence",
      title: "Moderate Skills Coverage",
      status: "PASS",
      message: `${totalSkillCount} skills listed. Aiming for 10-15 skills gives stronger keyword coverage.`,
    });
  } else {
    score += 4;
    checks.push({
      id: "skills_presence",
      title: "Low Skill Count",
      status: "WARNING",
      message: `Only ${totalSkillCount} skills listed. Standard resumes feature 8-16 targeted skills.`,
    });
    issues.push({
      id: "issue_skills_too_few",
      title: "Add More Technical & Domain Skills",
      severity: "WARNING",
      section: "Skills",
      fieldId: "section-skills",
      description: `Only ${totalSkillCount} skills are listed on your resume.`,
      whyItMatters: "Recruiters and automated filters search for combinations of languages, tools, and domain concepts.",
      suggestedSolution: "List additional relevant software, tools, frameworks, and methodologies you know.",
    });
  }

  // 2. Skill Categorization (Max 5 pts)
  const populatedCategories = Object.entries(skillCountPerCategory).filter(([_, count]) => count > 0);
  if (populatedCategories.length >= 2) {
    score += 5;
    checks.push({
      id: "skills_categorization",
      title: "Structured Skill Categories",
      status: "PASS",
      message: `Skills organized into ${populatedCategories.length} distinct groups.`,
    });
  } else if (populatedCategories.length === 1 && totalSkillCount > 0) {
    score += 2;
    checks.push({
      id: "skills_categorization",
      title: "Single Skill Category",
      status: "OPTIONAL",
      message: "Group skills into distinct categories (e.g., Programming Languages, Frameworks, Tools, Soft Skills) for improved clarity.",
    });
  }

  // 3. Duplicate Skills Detection (Max 3 pts)
  const seenSkills = new Map();
  const duplicates = [];

  allSkills.forEach((s) => {
    if (!s.normalized) return;
    if (seenSkills.has(s.normalized)) {
      const prior = seenSkills.get(s.normalized);
      duplicates.push(`"${s.raw}" (found in ${prior.category} and ${s.category})`);
    } else {
      seenSkills.set(s.normalized, s);
    }
  });

  if (duplicates.length === 0 && totalSkillCount > 0) {
    score += 3;
    checks.push({
      id: "skills_duplicates",
      title: "Zero Duplicate Skills",
      status: "PASS",
      message: "All listed skills are unique.",
    });
  } else if (duplicates.length > 0) {
    checks.push({
      id: "skills_duplicates",
      title: "Duplicate Skills Detected",
      status: "WARNING",
      message: `Repeated entries detected: ${duplicates.join(", ")}.`,
    });
    issues.push({
      id: "issue_skills_duplicates",
      title: "Remove Redundant Duplicate Skills",
      severity: "WARNING",
      section: "Skills",
      fieldId: "section-skills",
      description: `The following skill names appear more than once: ${duplicates.join(", ")}.`,
      whyItMatters: "Duplicating identical skills across groups wastes valuable resume real estate and signals sloppy formatting.",
      suggestedSolution: "Remove duplicate entries and consolidate each skill under its most appropriate category.",
    });
  } else {
    score += 3;
  }

  return {
    category: "Skills & Keywords",
    score: Math.min(maxScore, score),
    maxScore,
    totalSkillCount,
    duplicates,
    checks,
    issues,
  };
};
