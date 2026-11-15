/**
 * Job Description Matcher
 * Parses pasted Job Descriptions (JD), extracts critical technical keywords,
 * tools, qualifications, and compares them with the user's active resume.
 * Strict Rule: Zero fabrication guarantee; distinguishes keyword presence from qualifications.
 */

// Comprehensive dictionary of industry technologies, platforms, tools, and methodologies
const RECOGNIZED_TECH_KEYWORDS = [
  // Programming Languages
  "javascript", "typescript", "python", "java", "c++", "c#", "go", "golang", "rust",
  "ruby", "php", "swift", "kotlin", "scala", "r", "sql", "html", "css", "bash", "shell",
  
  // Frontend & Mobile
  "react", "react.js", "next.js", "vue", "vue.js", "angular", "svelte", "redux", "zustand",
  "tailwind", "bootstrap", "sass", "webpack", "vite", "graphql", "rest", "restful api",
  "react native", "flutter", "ios", "android",
  
  // Backend & Databases
  "node", "node.js", "express", "express.js", "nest.js", "django", "fastapi", "flask",
  "spring", "spring boot", "asp.net", "rails", "postgresql", "mysql", "mongodb",
  "redis", "sqlite", "elasticsearch", "dynamodb", "firebase", "supabase", "prisma",
  
  // Cloud, DevOps & Infrastructure
  "aws", "amazon web services", "azure", "gcp", "google cloud", "docker", "kubernetes",
  "terraform", "ci/cd", "github actions", "gitlab", "jenkins", "linux", "nginx",
  "microservices", "serverless", "kafka", "rabbitmq", "prometheus", "grafana",
  
  // Methodologies & Practices
  "agile", "scrum", "kanban", "tdd", "unit testing", "jest", "cypress", "playwright",
  "system design", "distributed systems", "devops", "cloud native", "security", "oauth"
];

export const matchJobDescription = (jobDescriptionText = "", resumeData = {}) => {
  if (!jobDescriptionText || !jobDescriptionText.trim()) {
    return {
      matchPercentage: 0,
      matchedKeywords: [],
      missingKeywords: [],
      extractedJdKeywords: [],
      qualificationNotes: [],
      recommendations: [],
    };
  }

  const jdLower = jobDescriptionText.toLowerCase();

  // Extract candidate's entire resume text into normalized token set
  const cvTextParts = [
    resumeData.name || "",
    resumeData.position || "",
    resumeData.summary || "",
    resumeData.address || "",
    (resumeData.languages || []).join(" "),
  ];

  (resumeData.skills || []).forEach((cat) => {
    cvTextParts.push(cat.title || "");
    (cat.skills || []).forEach((s) => cvTextParts.push(s || ""));
  });

  (resumeData.workExperience || []).forEach((exp) => {
    cvTextParts.push(exp.company || "");
    cvTextParts.push(exp.position || "");
    cvTextParts.push(exp.description || "");
    cvTextParts.push(exp.keyAchievements || "");
  });

  (resumeData.projects || []).forEach((p) => {
    cvTextParts.push(p.name || "");
    cvTextParts.push(p.description || "");
    cvTextParts.push(p.keyAchievements || "");
  });

  (resumeData.education || []).forEach((edu) => {
    cvTextParts.push(edu.school || "");
    cvTextParts.push(edu.degree || "");
  });

  (resumeData.certifications || []).forEach((c) => {
    if (typeof c === "string") cvTextParts.push(c);
    if (typeof c === "object" && c) {
      cvTextParts.push(c.name || "");
      cvTextParts.push(c.issuer || "");
    }
  });

  const fullCvText = cvTextParts.join(" ").toLowerCase();

  // 1. Extract matching technical keywords from JD
  const foundJdKeywords = new Set();
  RECOGNIZED_TECH_KEYWORDS.forEach((keyword) => {
    // Regex word boundary check (handling punctuation like c++ or node.js safely)
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(^|[^a-zA-Z0-9])${escaped}([^a-zA-Z0-9]|$)`, "i");
    if (regex.test(jdLower)) {
      foundJdKeywords.add(keyword);
    }
  });

  const extractedList = Array.from(foundJdKeywords);

  // 2. Classify into Matched vs Missing
  const matchedKeywords = [];
  const missingKeywords = [];

  extractedList.forEach((kw) => {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(^|[^a-zA-Z0-9])${escaped}([^a-zA-Z0-9]|$)`, "i");
    if (regex.test(fullCvText)) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  });

  // Calculate Match Percentage
  const matchPercentage =
    extractedList.length > 0
      ? Math.round((matchedKeywords.length / extractedList.length) * 100)
      : 50;

  // 3. Detect Qualifications & Experience Requirements in JD
  const qualificationNotes = [];
  const expMatch = jdLower.match(/(\d+)\+?\s*(?:-\s*\d+)?\s*(?:years?|yrs?)(?:\s+of)?\s+(?:experience|exp)/i);
  if (expMatch) {
    qualificationNotes.push({
      type: "Experience Level",
      text: `Job posting specifies ${expMatch[0]}. Verify that your total employment or project history demonstrates equivalent depth.`,
    });
  }

  const degreeMatch = jdLower.match(/\b(bachelor'?s?|master'?s?|phd|b\.s\.|m\.s\.|degree in computer science)\b/i);
  if (degreeMatch) {
    qualificationNotes.push({
      type: "Degree Requirement",
      text: `Job posting mentions "${degreeMatch[0]}". Ensure your Education section clearly reflects your corresponding degree.`,
    });
  }

  // 4. Actionable Recommendations (Zero Fabrication)
  const recommendations = [];
  if (missingKeywords.length > 0) {
    recommendations.push(
      `The job posting mentions terms like ${missingKeywords.slice(0, 4).join(", ")}. If you genuinely have experience with any of these, consider adding them to your Skills or Work Experience.`
    );
  }
  if (matchedKeywords.length > 0) {
    recommendations.push(
      `Great keyword alignment on: ${matchedKeywords.slice(0, 5).join(", ")}. Make sure these are supported by quantifiable achievements in your bullet points.`
    );
  }

  return {
    matchPercentage,
    matchedKeywords,
    missingKeywords,
    extractedJdKeywords: extractedList,
    qualificationNotes,
    recommendations,
  };
};
