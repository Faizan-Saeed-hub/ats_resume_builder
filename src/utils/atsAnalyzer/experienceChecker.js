/**
 * Work Experience & Projects ATS Checker
 * Evaluates career history, quantifiable metrics, action verbs, and date formats.
 * CRITICAL RULE: Candidates without work experience (e.g., fresh graduates) are fairly
 * evaluated on their Projects, Internships, and Academic Experience without harsh penalties.
 * Maximum score: 20 points.
 */

const METRIC_REGEX = /(\d+[%kKmMbB]?\+?|\$\d+(?:,\d+)*(?:\.\d+)?|\b\d+\s*(?:percent|users|clients|engineers|team members|projects|customers|fold|hours|days|x|X)\b)/i;

const STRONG_VERBS = [
  "built", "designed", "developed", "architected", "engineered", "spearheaded",
  "delivered", "implemented", "scaled", "optimized", "reduced", "increased",
  "generated", "automated", "mentored", "orchestrated", "launched", "migrated",
  "created", "managed", "maintained", "led", "established", "deployed"
];

export const checkExperience = (resumeData = {}) => {
  let score = 0;
  const maxScore = 20;
  const checks = [];
  const issues = [];

  const rawExperiences = Array.isArray(resumeData.workExperience) ? resumeData.workExperience : [];
  const validExperiences = rawExperiences.filter(
    (exp) => (exp.company && exp.company.trim()) || (exp.position && exp.position.trim())
  );

  const rawProjects = Array.isArray(resumeData.projects) ? resumeData.projects : [];
  const validProjects = rawProjects.filter(
    (proj) => (proj.name && proj.name.trim()) || (proj.description && proj.description.trim())
  );

  const isEntryLevelCandidate = validExperiences.length === 0 && validProjects.length > 0;

  // CASE 1: Standard Candidate with Work Experience
  if (validExperiences.length > 0) {
    // A. Experience Quantity & Titles (Max 8 pts)
    if (validExperiences.length >= 2) {
      score += 8;
      checks.push({
        id: "exp_entries",
        title: "Multiple Experience Entries",
        status: "PASS",
        message: `${validExperiences.length} professional roles documented.`,
      });
    } else {
      score += 5;
      checks.push({
        id: "exp_entries",
        title: "Single Work Experience Entry",
        status: "PASS",
        message: "1 professional role documented.",
      });
    }

    // Check title and company completeness
    const missingTitleOrCompany = validExperiences.some(
      (exp) => !exp.position || !exp.company
    );
    if (missingTitleOrCompany) {
      score = Math.max(0, score - 2);
      checks.push({
        id: "exp_completeness",
        title: "Incomplete Job Title or Employer",
        status: "WARNING",
        message: "Some work entries are missing either the Job Title or Company Name.",
      });
      issues.push({
        id: "issue_exp_missing_fields",
        title: "Complete Company & Job Title Details",
        severity: "WARNING",
        section: "Work Experience",
        fieldId: "section-work-experience",
        description: "One or more experience entries have an empty Company or Job Title field.",
        whyItMatters: "ATS parsers require clear employer and title pairs to calculate your total years of experience.",
        suggestedSolution: "Ensure every role clearly specifies both your official Job Title and the Company Name.",
      });
    }

    // Check dates consistency
    let missingDates = false;
    validExperiences.forEach((exp) => {
      if (!exp.startYear && !exp.endYear) {
        missingDates = true;
      }
    });

    if (missingDates) {
      checks.push({
        id: "exp_dates",
        title: "Missing Employment Dates",
        status: "WARNING",
        message: "Some roles do not specify start or end dates.",
      });
      issues.push({
        id: "issue_exp_dates",
        title: "Add Employment Date Ranges",
        severity: "WARNING",
        section: "Work Experience",
        fieldId: "section-work-experience",
        description: "One or more roles do not have employment dates.",
        whyItMatters: "Applicant Tracking Systems use dates to verify career timeline continuity and calculate seniority.",
        suggestedSolution: "Provide start and end years (or 'Present' for your current role).",
      });
    } else {
      checks.push({
        id: "exp_dates",
        title: "Employment Dates Documented",
        status: "PASS",
        message: "Role timelines are clearly indicated.",
      });
    }

    // B. Action Verbs & Bullet Descriptions (Max 6 pts)
    let totalBullets = 0;
    let actionVerbCount = 0;

    validExperiences.forEach((exp) => {
      const text = `${exp.description || ""} \n ${exp.keyAchievements || ""}`;
      const lines = text.split("\n").filter((l) => l.trim().length > 5);
      totalBullets += lines.length;

      lines.forEach((line) => {
        const firstWord = line.trim().replace(/^[-*•\d.)\s]+/, "").split(/\s+/)[0]?.toLowerCase();
        if (STRONG_VERBS.includes(firstWord)) {
          actionVerbCount++;
        }
      });
    });

    if (totalBullets >= 4 && actionVerbCount >= 2) {
      score += 6;
      checks.push({
        id: "exp_action_verbs",
        title: "Action-Oriented Descriptions",
        status: "PASS",
        message: `Strong bullet points detected with ${actionVerbCount} action-driven verbs.`,
      });
    } else if (totalBullets >= 2) {
      score += 4;
      checks.push({
        id: "exp_action_verbs",
        title: "Adequate Bullet Descriptions",
        status: "PASS",
        message: `${totalBullets} description bullet points provided.`,
      });
    } else {
      score += 2;
      checks.push({
        id: "exp_action_verbs",
        title: "Brief Experience Descriptions",
        status: "WARNING",
        message: "Add more detailed bullet points detailing your responsibilities and achievements.",
      });
      issues.push({
        id: "issue_exp_short_bullets",
        title: "Expand Work Experience Bullet Points",
        severity: "WARNING",
        section: "Work Experience",
        fieldId: "section-work-experience",
        description: "Your roles have very few bullet points explaining your actual work.",
        whyItMatters: "Bullet points are the primary source for ATS keyword scanning and demonstrate real-world competency.",
        suggestedSolution: "Include 3-5 concise bullet points per role highlighting your core accomplishments.",
      });
    }

    // C. Quantifiable Metrics & Business Impact (Max 6 pts)
    let hasQuantifiableMetrics = false;
    let metricsFound = [];

    validExperiences.forEach((exp) => {
      const text = `${exp.description || ""} ${exp.keyAchievements || ""}`;
      const matches = text.match(METRIC_REGEX);
      if (matches) {
        hasQuantifiableMetrics = true;
        metricsFound.push(matches[0]);
      }
    });

    if (hasQuantifiableMetrics) {
      score += 6;
      checks.push({
        id: "exp_metrics",
        title: "Quantifiable Metrics Present",
        status: "PASS",
        message: `Found quantifiable impact (e.g., "${metricsFound[0]}").`,
      });
    } else {
      score += 2;
      checks.push({
        id: "exp_metrics",
        title: "Lack of Measurable Metrics",
        status: "WARNING",
        message: "Quantified results (percentages, revenue, team size, latency) significantly improve CV strength.",
      });
      issues.push({
        id: "issue_exp_no_metrics",
        title: "Include Measurable Numbers and Metrics",
        severity: "WARNING",
        section: "Work Experience",
        fieldId: "section-work-experience",
        description: "No quantifiable results or performance percentages were detected in your experience entries.",
        whyItMatters: "Resumes with numbers and metrics achieve up to a 40% higher callback rate than resumes with generic task lists.",
        suggestedSolution: "Add metrics like 'reduced load times by 35%', 'managed $20k budget', or 'supported 5,000+ active users'.",
      });
    }

  // CASE 2: Entry-Level / Fresh Graduate Candidate (Has Projects, No Experience)
  } else if (isEntryLevelCandidate) {
    // Fresh graduate / student logic: Evaluated fairly on Projects (Max 20 pts)
    checks.push({
      id: "candidate_mode",
      title: "Entry-Level / Project-Focused Evaluation",
      status: "PASS",
      message: "No traditional work experience found, but strong project portfolio detected. Evaluated on project achievements.",
    });

    // A. Projects Quantity & Names (Max 8 pts)
    if (validProjects.length >= 2) {
      score += 8;
      checks.push({
        id: "proj_entries",
        title: "Demonstrated Project Experience",
        status: "PASS",
        message: `${validProjects.length} technical projects documented.`,
      });
    } else {
      score += 6;
      checks.push({
        id: "proj_entries",
        title: "Project Documented",
        status: "PASS",
        message: "1 technical project documented.",
      });
    }

    // B. Project Technologies & Descriptions (Max 6 pts)
    let hasDetailedDesc = validProjects.some((p) => (p.description || "").length > 40);
    if (hasDetailedDesc) {
      score += 6;
      checks.push({
        id: "proj_descriptions",
        title: "Detailed Project Deliverables",
        status: "PASS",
        message: "Projects include technical descriptions and architectural details.",
      });
    } else {
      score += 3;
      checks.push({
        id: "proj_descriptions",
        title: "Brief Project Descriptions",
        status: "WARNING",
        message: "Expand project details with technologies used and architectural highlights.",
      });
    }

    // C. Project Outcomes / Metrics / Links (Max 6 pts)
    let projectHasMetrics = validProjects.some((p) => {
      const text = `${p.description || ""} ${p.keyAchievements || ""}`;
      return METRIC_REGEX.test(text);
    });

    if (projectHasMetrics) {
      score += 6;
      checks.push({
        id: "proj_metrics",
        title: "Measurable Project Outcomes",
        status: "PASS",
        message: "Project achievements include measurable results or performance figures.",
      });
    } else {
      score += 4;
      checks.push({
        id: "proj_metrics",
        title: "Project Outcomes Documented",
        status: "OPTIONAL",
        message: "Consider adding measurable outcomes to your projects (e.g., users served, test coverage, efficiency).",
      });
    }

  // CASE 3: Both Experience and Projects are Empty
  } else {
    checks.push({
      id: "exp_missing_all",
      title: "No Experience or Projects Listed",
      status: "ISSUE",
      message: "Resumes require either professional employment history or technical/academic projects.",
    });
    issues.push({
      id: "issue_exp_none",
      title: "Add Work Experience or Projects",
      severity: "ISSUE",
      section: "Work Experience",
      fieldId: "section-work-experience",
      description: "Both the Work Experience and Projects sections are currently empty.",
      whyItMatters: "Recruiters and ATS algorithms evaluate applied expertise through past employment or hands-on projects.",
      suggestedSolution: "Add your previous work history, internships, or practical academic/open-source projects.",
    });
  }

  return {
    category: "Experience & Projects",
    score: Math.min(maxScore, score),
    maxScore,
    isEntryLevel: isEntryLevelCandidate,
    checks,
    issues,
  };
};
