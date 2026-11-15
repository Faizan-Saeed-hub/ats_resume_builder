/**
 * Professional Summary ATS Checker
 * Evaluates summary length, action verbs, industry keywords, and flags generic cliches.
 * Maximum score: 10 points.
 */

const STRONG_ACTION_VERBS = [
  "architect", "architected", "spearhead", "spearheaded", "engineer", "engineered",
  "develop", "developed", "orchestrate", "orchestrated", "optimize", "optimized",
  "scale", "scaled", "deliver", "delivered", "transform", "transformed",
  "lead", "led", "manage", "managed", "accelerate", "accelerated",
  "implement", "implemented", "design", "designed", "establish", "established",
  "pioneer", "pioneered", "streamline", "streamlined", "execute", "executed"
];

const GENERIC_BUZZWORDS = [
  "hard worker", "go-getter", "team player", "think outside the box",
  "synergy", "detail-oriented", "self-starter", "results-driven",
  "dynamic professional", "people person", "fast learner"
];

export const checkSummary = (resumeData = {}) => {
  let score = 0;
  const maxScore = 10;
  const checks = [];
  const issues = [];

  const summary = (resumeData.summary || "").trim();
  const summaryLower = summary.toLowerCase();
  const position = (resumeData.position || "").trim().toLowerCase();

  // 1. Existence and Length (Max 5 pts)
  if (!summary) {
    checks.push({
      id: "summary_presence",
      title: "Professional Summary Missing",
      status: "ISSUE",
      message: "No summary provided. A concise elevator pitch introduces your profile to recruiters and parsers.",
    });
    issues.push({
      id: "issue_summary_missing",
      title: "Add a Professional Summary",
      severity: "ISSUE",
      section: "Summary",
      fieldId: "input-summary",
      description: "Your CV currently lacks an executive summary or career profile.",
      whyItMatters: "ATS keyword parsers weigh the top 20% of your CV heavily for job title and domain match relevance.",
      suggestedSolution: "Write 2-4 sentences summarizing your target role, years of experience, core technical specialties, and major value proposition.",
    });
  } else if (summary.length < 50) {
    score += 2;
    checks.push({
      id: "summary_presence",
      title: "Summary is Too Brief",
      status: "WARNING",
      message: `Summary is only ${summary.length} characters. Aim for 120-400 characters for optimal keyword density.`,
    });
    issues.push({
      id: "issue_summary_too_short",
      title: "Expand Professional Summary",
      severity: "WARNING",
      section: "Summary",
      fieldId: "input-summary",
      description: `Your summary contains only ${summary.length} characters.`,
      whyItMatters: "Very short summaries miss the opportunity to naturally include industry and domain keywords that ATS scanners look for.",
      suggestedSolution: "Elaborate on your career focus, top 2-3 technologies, and the types of business problems you solve.",
    });
  } else if (summary.length > 550) {
    score += 4;
    checks.push({
      id: "summary_presence",
      title: "Summary is Excessively Long",
      status: "WARNING",
      message: `Summary is ${summary.length} characters. Recruiters prefer concise summaries under 450 characters (3-5 lines).`,
    });
    issues.push({
      id: "issue_summary_too_long",
      title: "Condense Professional Summary",
      severity: "WARNING",
      section: "Summary",
      fieldId: "input-summary",
      description: `Summary is ${summary.length} characters long.`,
      whyItMatters: "Dense paragraphs decrease human readability. Hiring managers spend an average of 6-7 seconds on initial scan.",
      suggestedSolution: "Edit down to 3-4 punchy sentences highlighting your strongest competencies.",
    });
  } else {
    score += 5;
    checks.push({
      id: "summary_presence",
      title: "Optimal Summary Length",
      status: "PASS",
      message: `Well-sized summary (${summary.length} characters, ~${summary.split(/\s+/).length} words).`,
    });
  }

  // 2. Action Verbs (Max 3 pts)
  if (summary) {
    const matchedVerbs = STRONG_ACTION_VERBS.filter((verb) =>
      new RegExp(`\\b${verb}\\b`, "i").test(summaryLower)
    );

    if (matchedVerbs.length >= 2) {
      score += 3;
      checks.push({
        id: "summary_action_verbs",
        title: "Strong Action Verbs Used",
        status: "PASS",
        message: `Found impactful verbs: ${matchedVerbs.slice(0, 4).join(", ")}`,
      });
    } else if (matchedVerbs.length === 1) {
      score += 2;
      checks.push({
        id: "summary_action_verbs",
        title: "Action Verbs Present",
        status: "PASS",
        message: `Found action verb: "${matchedVerbs[0]}"`,
      });
    } else {
      checks.push({
        id: "summary_action_verbs",
        title: "Lack of Strong Action Verbs",
        status: "WARNING",
        message: "Consider using active, achievement-oriented verbs (e.g., spearheaded, architected, optimized, deployed).",
      });
      issues.push({
        id: "issue_summary_no_verbs",
        title: "Incorporate Strong Action Verbs in Summary",
        severity: "WARNING",
        section: "Summary",
        fieldId: "input-summary",
        description: "Your summary relies on passive phrases rather than energetic action verbs.",
        whyItMatters: "Action verbs convey leadership, initiative, and measurable impact to both ATS evaluators and recruiters.",
        suggestedSolution: "Begin statements with verbs such as 'Architected', 'Spearheaded', 'Optimized', or 'Engineered'.",
      });
    }
  }

  // 3. Job Title Alignment (Max 2 pts)
  if (summary && position) {
    const positionWords = position.split(/[\s/|,-]+/).filter((w) => w.length > 3);
    const alignsWithTitle = positionWords.some((word) => summaryLower.includes(word));
    if (alignsWithTitle) {
      score += 2;
      checks.push({
        id: "summary_title_alignment",
        title: "Aligned with Target Role",
        status: "PASS",
        message: `Summary mentions specialization keywords matching your title: "${position}".`,
      });
    } else {
      score += 1;
      checks.push({
        id: "summary_title_alignment",
        title: "Role Specialization Gap",
        status: "OPTIONAL",
        message: `Consider explicitly mentioning your target title "${position}" in your summary opening.`,
      });
    }
  } else if (summary) {
    score += 1;
  }

  // 4. Buzzword / Cliche Detection (Advisory)
  if (summary) {
    const foundBuzzwords = GENERIC_BUZZWORDS.filter((bw) => summaryLower.includes(bw));
    if (foundBuzzwords.length > 0) {
      checks.push({
        id: "summary_buzzwords",
        title: "Generic Buzzwords Detected",
        status: "WARNING",
        message: `Found overused cliches: ${foundBuzzwords.join(", ")}`,
      });
      issues.push({
        id: "issue_summary_buzzwords",
        title: "Replace Overused Buzzwords",
        severity: "WARNING",
        section: "Summary",
        fieldId: "input-summary",
        description: `Your summary contains generic filler words: "${foundBuzzwords.join('", "')}".`,
        whyItMatters: "Cliches waste valuable space and provide no verifiable evidence of your actual technical skill.",
        suggestedSolution: "Replace vague claims with concrete specializations, specific tool names, and quantifiable contributions.",
      });
    }

    // First person pronoun check ("I", "my", "me")
    const firstPersonMatches = summary.match(/\b(I|me|my|we|our)\b/gi);
    if (firstPersonMatches && firstPersonMatches.length > 2) {
      checks.push({
        id: "summary_first_person",
        title: "First-Person Pronouns Detected",
        status: "OPTIONAL",
        message: `Found ${firstPersonMatches.length} first-person pronouns ("I", "my"). Executive CV style typically omits personal pronouns.`,
      });
    }
  }

  return {
    category: "Professional Summary",
    score: Math.min(maxScore, score),
    maxScore,
    checks,
    issues,
  };
};
