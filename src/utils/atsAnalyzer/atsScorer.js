/**
 * Master ATS Scorer & Analysis Orchestrator
 * Computes weighted scores across all 7 categories (out of 100).
 * Dynamic, real-time, non-hardcoded, and handles edge cases gracefully.
 */

import { checkContactInfo } from "./contactChecker.js";
import { checkSummary } from "./summaryChecker.js";
import { checkExperience } from "./experienceChecker.js";
import { checkEducation } from "./educationChecker.js";
import { checkSkills } from "./skillsChecker.js";
import { checkCertifications } from "./certificationsChecker.js";
import { checkFormatting } from "./formattingChecker.js";

export const analyzeResumeAts = (resumeData = {}) => {
  const contact = checkContactInfo(resumeData);
  const summary = checkSummary(resumeData);
  const experience = checkExperience(resumeData);
  const education = checkEducation(resumeData);
  const skills = checkSkills(resumeData);
  const certifications = checkCertifications(resumeData);
  const formatting = checkFormatting(resumeData);

  const categories = [
    contact,
    summary,
    experience,
    education,
    skills,
    certifications,
    formatting,
  ];

  // Calculate total score
  const totalScore = categories.reduce((sum, cat) => sum + (cat.score || 0), 0);
  const roundedScore = Math.min(100, Math.max(0, Math.round(totalScore)));

  // Flatten all checks and issues
  const allChecks = [];
  const allIssues = [];

  categories.forEach((cat) => {
    (cat.checks || []).forEach((c) => allChecks.push({ ...c, category: cat.category }));
    (cat.issues || []).forEach((i) => allIssues.push({ ...i, category: cat.category }));
  });

  const passedCount = allChecks.filter((c) => c.status === "PASS").length;
  const issuesCount = allIssues.filter((i) => i.severity === "ISSUE").length;
  const warningsCount = allIssues.filter((i) => i.severity === "WARNING").length;
  const optionalCount = allIssues.filter((i) => i.severity === "OPTIONAL").length;

  // Determine readiness level
  let readinessTier = "";
  let tierColor = "";
  let tierBadgeBg = "";

  if (roundedScore >= 80) {
    readinessTier = "High ATS Readiness";
    tierColor = "text-emerald-500";
    tierBadgeBg = "bg-emerald-50 text-emerald-700 border-emerald-300";
  } else if (roundedScore >= 60) {
    readinessTier = "Good Compatibility - Minor Polish";
    tierColor = "text-blue-500";
    tierBadgeBg = "bg-blue-50 text-blue-700 border-blue-300";
  } else if (roundedScore >= 40) {
    readinessTier = "Moderate - Optimization Recommended";
    tierColor = "text-amber-500";
    tierBadgeBg = "bg-amber-50 text-amber-700 border-amber-300";
  } else {
    readinessTier = "Low Match - Needs Attention";
    tierColor = "text-rose-500";
    tierBadgeBg = "bg-rose-50 text-rose-700 border-rose-300";
  }

  return {
    score: roundedScore,
    readinessTier,
    tierColor,
    tierBadgeBg,
    totalChecks: allChecks.length,
    passedCount,
    issuesCount,
    warningsCount,
    optionalCount,
    categories,
    allChecks,
    allIssues,
    isEntryLevel: experience.isEntryLevel || false,
    disclaimer:
      "This ATS Readiness Score is an algorithmic estimate based on widely recognized recruitment software standards and parsing heuristics. It does not guarantee employment outcomes or third-party ATS behavior.",
  };
};
