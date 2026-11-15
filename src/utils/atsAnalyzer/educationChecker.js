/**
 * Education ATS Checker
 * Evaluates academic credentials, institution names, degree validity, and dates.
 * Maximum score: 10 points.
 */

export const checkEducation = (resumeData = {}) => {
  let score = 0;
  const maxScore = 10;
  const checks = [];
  const issues = [];

  const rawEducations = Array.isArray(resumeData.education) ? resumeData.education : [];
  const validEducations = rawEducations.filter(
    (edu) => (edu.school && edu.school.trim()) || (edu.degree && edu.degree.trim())
  );

  if (validEducations.length === 0) {
    checks.push({
      id: "edu_presence",
      title: "Education Section Missing",
      status: "ISSUE",
      message: "Most ATS filters check for minimum education criteria (e.g., Bachelor's, Associate's, or High School Diploma).",
    });
    issues.push({
      id: "issue_edu_missing",
      title: "Add Your Education Credentials",
      severity: "ISSUE",
      section: "Education",
      fieldId: "section-education",
      description: "No education records have been specified.",
      whyItMatters: "Many job postings configure ATS filters that automatically screen for required degree levels.",
      suggestedSolution: "Add your college, university, or highest level of schooling completed.",
    });
  } else {
    // 1. Degree & Institution presence (Max 7 pts)
    const primary = validEducations[0];
    const hasDegree = !!(primary.degree && primary.degree.trim());
    const hasSchool = !!(primary.school && primary.school.trim());

    if (hasDegree && hasSchool) {
      score += 7;
      checks.push({
        id: "edu_degree_school",
        title: "Degree & Institution Specified",
        status: "PASS",
        message: `${primary.degree} at ${primary.school}.`,
      });
    } else {
      score += 3;
      checks.push({
        id: "edu_degree_school",
        title: "Incomplete Education Details",
        status: "WARNING",
        message: hasDegree ? "Missing School/Institution name." : "Missing Degree name.",
      });
      issues.push({
        id: "issue_edu_incomplete",
        title: "Specify Both Degree and Institution",
        severity: "WARNING",
        section: "Education",
        fieldId: "section-education",
        description: "Your education entry is missing either the degree or the institution name.",
        whyItMatters: "ATS parsers look for standardized pairs of degree type and accredited institution.",
        suggestedSolution: "Fill in both the specific degree (e.g., 'B.S. in Computer Science') and the university/college name.",
      });
    }

    // 2. Graduation Year / Dates (Max 3 pts)
    const hasDates = validEducations.some((edu) => edu.startYear || edu.endYear);
    if (hasDates) {
      score += 3;
      checks.push({
        id: "edu_dates",
        title: "Graduation / Study Dates Included",
        status: "PASS",
        message: "Study dates or graduation year documented.",
      });
    } else {
      score += 1;
      checks.push({
        id: "edu_dates",
        title: "Missing Graduation Date",
        status: "OPTIONAL",
        message: "Adding your graduation year helps verify recency of education.",
      });
    }

    // Additional entries bonus / confirmation
    if (validEducations.length > 1) {
      checks.push({
        id: "edu_multiple",
        title: "Multiple Degrees / Diplomas",
        status: "PASS",
        message: `${validEducations.length} academic credentials listed.`,
      });
    }
  }

  return {
    category: "Education",
    score: Math.min(maxScore, score),
    maxScore,
    checks,
    issues,
  };
};
