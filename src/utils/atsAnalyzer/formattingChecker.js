/**
 * ATS Formatting & Document Quality Checker
 * Evaluates heading standardization, symbol safety, date formatting consistency,
 * bullet structure, and template parseability.
 * Maximum score: 20 points.
 */

// Regex to detect emojis or non-standard characters that break legacy ATS ASCII parsers
const ATS_UNFRIENDLY_CHARS = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}]/u;

export const checkFormatting = (resumeData = {}) => {
  let score = 0;
  const maxScore = 20;
  const checks = [];
  const issues = [];

  // 1. Symbol & Emoji Character Safety (Max 5 pts)
  const fullTextContent = JSON.stringify(resumeData);
  const hasUnfriendlySymbols = ATS_UNFRIENDLY_CHARS.test(fullTextContent);

  if (!hasUnfriendlySymbols) {
    score += 5;
    checks.push({
      id: "format_symbols",
      title: "Clean Typography & Characters",
      status: "PASS",
      message: "No non-standard symbols or emojis detected. Clean for ASCII/UTF-8 ATS text parsing.",
    });
  } else {
    score += 2;
    checks.push({
      id: "format_symbols",
      title: "Potentially Parsing-Incompatible Symbols Detected",
      status: "WARNING",
      message: "Detected decorative emojis or unusual symbols that may convert into garbled text in older ATS parsers.",
    });
    issues.push({
      id: "issue_format_symbols",
      title: "Remove Decorative Symbols or Emojis",
      severity: "WARNING",
      section: "Formatting",
      fieldId: "section-personal-info",
      description: "Decorative icons, emojis, or non-standard bullet characters were found in your CV text.",
      whyItMatters: "Older enterprise Applicant Tracking Systems (e.g., legacy Taleo or brassRing) often parse Unicode symbols as '?' or corrupt square glyphs.",
      suggestedSolution: "Stick to clean standard typography, standard bullet points, and plain alphanumeric characters.",
    });
  }

  // 2. Date Format Consistency (Max 5 pts)
  const allDates = [];
  (resumeData.workExperience || []).forEach((exp) => {
    if (exp.startYear) allDates.push(exp.startYear.trim());
    if (exp.endYear) allDates.push(exp.endYear.trim());
  });
  (resumeData.education || []).forEach((edu) => {
    if (edu.startYear) allDates.push(edu.startYear.trim());
    if (edu.endYear) allDates.push(edu.endYear.trim());
  });

  if (allDates.length > 0) {
    // Check if dates follow consistent patterns (e.g., all 4-digit years YYYY, or all MM/YYYY, or all Month YYYY)
    const only4Digits = allDates.filter((d) => /^\d{4}$/.test(d)).length;
    const isIsoOrMonthYear = allDates.filter((d) => /^\d{4}-\d{2}|\b[a-zA-Z]{3,9}\s+\d{4}\b|\d{1,2}\/\d{4}/.test(d)).length;

    if (only4Digits === allDates.length || isIsoOrMonthYear === allDates.length) {
      score += 5;
      checks.push({
        id: "format_dates",
        title: "Consistent Date Formatting",
        status: "PASS",
        message: "Dates follow uniform chronology and consistent format.",
      });
    } else {
      score += 3;
      checks.push({
        id: "format_dates",
        title: "Mixed Date Formats",
        status: "WARNING",
        message: "Some dates use simple years (e.g., 2023) while others use months or full dates.",
      });
      issues.push({
        id: "issue_format_dates",
        title: "Standardize Chronological Date Formats",
        severity: "WARNING",
        section: "Work Experience",
        fieldId: "section-work-experience",
        description: "Your experience and education entries use inconsistent date formats.",
        whyItMatters: "Consistent timeline formatting allows ATS algorithms to calculate tenure and avoid chronological discrepancies.",
        suggestedSolution: "Choose one consistent format across all entries (e.g., 'YYYY' or 'Month YYYY').",
      });
    }
  } else {
    score += 3;
    checks.push({
      id: "format_dates",
      title: "Date Records",
      status: "OPTIONAL",
      message: "Add dates to your experience and education to establish a chronological career timeline.",
    });
  }

  // 3. Bullet Point Readability & Length (Max 5 pts)
  let longWallOfTextFound = false;
  (resumeData.workExperience || []).forEach((exp) => {
    const text = `${exp.description || ""} \n ${exp.keyAchievements || ""}`;
    const lines = text.split("\n");
    lines.forEach((line) => {
      if (line.trim().length > 400) {
        longWallOfTextFound = true;
      }
    });
  });

  if (!longWallOfTextFound) {
    score += 5;
    checks.push({
      id: "format_bullets",
      title: "Concise Bullet Point Architecture",
      status: "PASS",
      message: "Descriptions are chunked into readable bullet points without dense walls of text.",
    });
  } else {
    score += 2;
    checks.push({
      id: "format_bullets",
      title: "Overly Long Bullet Points",
      status: "WARNING",
      message: "Detected single bullet statements exceeding 400 characters.",
    });
    issues.push({
      id: "issue_format_bullets",
      title: "Break Dense Paragraphs into Shorter Bullets",
      severity: "WARNING",
      section: "Work Experience",
      fieldId: "section-work-experience",
      description: "One or more bullet points are longer than 400 characters.",
      whyItMatters: "Recruiters scan resumes in F-shaped patterns. Paragraphs exceeding 3 lines are frequently skipped.",
      suggestedSolution: "Split dense run-on paragraphs into 2-3 distinct, punchy bullet points.",
    });
  }

  // 4. Template ATS Compatibility (Max 5 pts)
  const currentTemplate = resumeData.selectedTemplate || "modern-professional";
  if (currentTemplate === "minimal-ats") {
    score += 5;
    checks.push({
      id: "format_template",
      title: "Highest-Tier ATS Template Selected",
      status: "PASS",
      message: "Minimal ATS-Friendly template uses a strict single-column linear layout ideal for all parsers.",
    });
  } else if (currentTemplate === "modern-professional") {
    score += 5;
    checks.push({
      id: "format_template",
      title: "Optimal Modern Layout Selected",
      status: "PASS",
      message: "Modern Professional balances strong visual hierarchy with high machine extractability.",
    });
  } else if (currentTemplate === "corporate-executive") {
    score += 4;
    checks.push({
      id: "format_template",
      title: "Corporate Executive Template",
      status: "PASS",
      message: "Executive styling. Clean semantic HTML structure ensures accurate section parsing.",
    });
  } else {
    score += 4;
    checks.push({
      id: "format_template",
      title: "Creative Modern Template",
      status: "PASS",
      message: "Modern accent styling. Suitable for creative and tech roles.",
    });
  }

  return {
    category: "ATS Formatting & Quality",
    score: Math.min(maxScore, score),
    maxScore,
    checks,
    issues,
  };
};
