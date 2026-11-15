/**
 * Intelligent CV Data Mapper
 * Parses segmented lines and raw text into the standardized resumeData schema.
 * Enforces the STRICT NO-FABRICATION POLICY.
 */

import { detectSectionHeading, SECTION_TYPES } from "./sectionDetector.js";

// Well-known technical skills for categorization
const TECH_SKILL_KEYWORDS = new Set([
  "javascript", "typescript", "python", "java", "c++", "c#", "c", "go", "golang", "rust",
  "ruby", "php", "swift", "kotlin", "scala", "r", "dart", "sql", "nosql", "html", "html5",
  "css", "css3", "sass", "scss", "tailwind", "bootstrap", "react", "next.js", "nextjs",
  "vue", "vue.js", "angular", "svelte", "node", "node.js", "express", "express.js", "nest.js",
  "django", "flask", "fastapi", "spring", "spring boot", "graphql", "rest", "restful", "api",
  "apis", "docker", "kubernetes", "k8s", "aws", "amazon web services", "azure", "gcp",
  "google cloud", "terraform", "ansible", "ci/cd", "jenkins", "github actions", "gitlab",
  "git", "linux", "unix", "bash", "shell", "postgresql", "postgres", "mysql", "mongodb",
  "redis", "sqlite", "oracle", "elasticsearch", "kafka", "rabbitmq", "microservices",
  "distributed systems", "serverless", "webpack", "vite", "babel", "jest", "cypress",
  "playwright", "mocha", "chai", "pandas", "numpy", "pytorch", "tensorflow", "scikit-learn"
]);

// Well-known soft skills for categorization
const SOFT_SKILL_KEYWORDS = new Set([
  "leadership", "technical leadership", "communication", "teamwork", "collaboration",
  "cross-functional collaboration", "problem-solving", "critical thinking", "creativity",
  "time management", "agile", "scrum", "kanban", "mentorship", "mentoring", "negotiation",
  "adaptability", "organization", "decision making", "presentation", "public speaking",
  "stakeholder management", "project management", "conflict resolution", "result-oriented"
]);

// Common languages for language section detection
const KNOWN_LANGUAGES = [
  "English", "Spanish", "Mandarin", "Chinese", "Hindi", "French", "Arabic", "Bengali",
  "Russian", "Portuguese", "Urdu", "Indonesian", "German", "Japanese", "Swahili", "Marathi",
  "Telugu", "Turkish", "Tamil", "Vietnamese", "Korean", "Italian", "Polish", "Dutch"
];

// Regex helpers
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
const PHONE_REGEX = /(?:(?:\+|00)\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,4}\b/;
const URL_REGEX = /(?:https?:\/\/|www\.)[^\s,;"'<>()]+/i;
const LINKEDIN_REGEX = /(?:linkedin\.com\/in\/|linkedin\.com\/profile\/)([\w-]+)/i;
const GITHUB_REGEX = /(?:github\.com\/)([\w-]+)/i;
const TWITTER_REGEX = /(?:twitter\.com\/|x\.com\/)([\w-]+)/i;

// Date range regex matching: "Jan 2020 - Present", "2018 - 2022", "04/2019 to 08/2023", etc.
const DATE_RANGE_REGEX = /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?\b(?:19|20)\d{2}\b\s*(?:-|–|—|to)\s*(?:Present|Current|Ongoing|(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?\b(?:19|20)\d{2}\b)/i;
const SINGLE_YEAR_REGEX = /\b(?:19|20)\d{2}\b/g;

/**
 * Main mapping orchestrator
 */
export const mapExtractedCvData = (rawText, lines) => {
  const lineTexts = (lines || []).map((l) => (typeof l === "string" ? l : l.text || "")).filter((t) => t.trim().length > 0);

  // 1. Segment document lines into sections
  const sections = segmentLinesIntoSections(lineTexts);

  // 2. Extract Personal Information from Header / Contact section
  const personalInfo = extractPersonalInfo(sections.HEADER, lineTexts, rawText);

  // 3. Extract Summary
  const summary = extractSummary(sections.SUMMARY);

  // 4. Extract Work Experience
  const workExperience = extractWorkExperience(sections.EXPERIENCE);

  // 5. Extract Education
  const education = extractEducation(sections.EDUCATION);

  // 6. Extract Skills
  const skills = extractSkills(sections.SKILLS, rawText);

  // 7. Extract Projects
  const projects = extractProjects(sections.PROJECTS);

  // 8. Extract Certifications
  const certifications = extractCertifications(sections.CERTIFICATIONS);

  // 9. Extract Languages
  const languages = extractLanguages(sections.LANGUAGES, rawText);

  // 10. Extract Social Media Links
  const socialMedia = extractSocialMedia(personalInfo, sections.SOCIAL, rawText);

  // 11. Compile unmapped / unrecognized lines for user review
  const unrecognizedLines = sections.UNMAPPED.filter((l) => l.trim().length > 0);

  // 12. Build composite confidence metadata
  const metadata = {
    personalFound: Boolean(personalInfo.name || personalInfo.email || personalInfo.contactInformation),
    experienceCount: workExperience.length,
    educationCount: education.length,
    skillsCount: skills.reduce((acc, cat) => acc + (cat.skills || []).length, 0),
    certificationsCount: certifications.length,
    projectsCount: projects.length,
    languagesCount: languages.length,
    unrecognizedCount: unrecognizedLines.length,
  };

  // Standardized resumeData conforming to application schema
  const mappedData = {
    name: personalInfo.name || "",
    position: personalInfo.position || "",
    contactInformation: personalInfo.contactInformation || "",
    email: personalInfo.email || "",
    address: personalInfo.address || "",
    profilePicture: "",
    socialMedia,
    summary,
    education,
    workExperience,
    projects,
    skills,
    languages,
    certifications,
    profilePhotoStyle: "circle",
    showProfilePhoto: true,
    selectedTemplate: "modern-professional",
  };

  return {
    mappedData,
    metadata,
    unrecognizedLines,
    rawText,
  };
};

/**
 * Segments lines into section buckets based on detected section headings.
 */
function segmentLinesIntoSections(lines) {
  const buckets = {
    HEADER: [],
    SUMMARY: [],
    EXPERIENCE: [],
    EDUCATION: [],
    SKILLS: [],
    PROJECTS: [],
    CERTIFICATIONS: [],
    LANGUAGES: [],
    SOCIAL: [],
    AWARDS: [],
    PUBLICATIONS: [],
    UNMAPPED: [],
  };

  let currentSection = "HEADER";
  let hasFoundFirstSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const heading = detectSectionHeading(line);

    if (heading) {
      hasFoundFirstSection = true;
      currentSection = heading.type;
      continue; // Skip heading line itself
    }

    if (!hasFoundFirstSection) {
      // Lines before any section heading belong to header/personal info
      buckets.HEADER.push(line);
    } else if (buckets[currentSection]) {
      buckets[currentSection].push(line);
    } else {
      buckets.UNMAPPED.push(line);
    }
  }

  return buckets;
}

/**
 * Extracts Personal Information (Name, Position, Email, Phone, Address, Website)
 */
function extractPersonalInfo(headerLines, allLines, rawText) {
  const result = {
    name: "",
    position: "",
    contactInformation: "",
    email: "",
    address: "",
    website: "",
  };

  // Search full document or header for email
  const emailMatch = rawText.match(EMAIL_REGEX);
  if (emailMatch) {
    result.email = emailMatch[0].trim();
  }

  // Search for phone number
  const phoneMatch = rawText.match(PHONE_REGEX);
  if (phoneMatch) {
    const rawPhone = phoneMatch[0].trim();
    // Verify phone isn't a date like "2020-2024" or a standalone year
    if (!/^\d{4}\s*-\s*\d{4}$/.test(rawPhone) && rawPhone.replace(/\D/g, "").length >= 7) {
      result.contactInformation = rawPhone;
    }
  }

  // Search header lines for Name & Position
  const candidateLines = headerLines.filter((line) => {
    const clean = line.trim();
    if (!clean) return false;
    // Skip if line is strictly contact info
    if (EMAIL_REGEX.test(clean) && clean.length === clean.match(EMAIL_REGEX)[0].length) return false;
    if (PHONE_REGEX.test(clean) && clean.length === clean.match(PHONE_REGEX)[0].length) return false;
    if (/^(cv|resume|curriculum vitae)$/i.test(clean)) return false;
    return true;
  });

  if (candidateLines.length > 0) {
    // Top line is almost always Name
    result.name = candidateLines[0].trim();

    // Second line often contains Job Title / Position
    if (candidateLines.length > 1) {
      const line2 = candidateLines[1].trim();
      // Ensure line 2 is not contact info or location
      if (!EMAIL_REGEX.test(line2) && !PHONE_REGEX.test(line2) && line2.length < 60) {
        result.position = line2;
      }
    }
  }

  // Location / Address detection (e.g. "San Francisco, CA", "Seattle, WA", "London, UK")
  const locationRegex = /\b([A-Z][a-zA-Z\s.-]+,\s*[A-Z]{2}(?:\s+\d{5})?|[A-Z][a-zA-Z\s.-]+,\s*(?:United States|USA|UK|Canada|Germany|France|India|Australia))\b/;
  for (const line of headerLines) {
    const match = line.match(locationRegex);
    if (match) {
      result.address = match[0].trim();
      break;
    }
  }

  return result;
}

/**
 * Extracts Professional Summary paragraph
 */
function extractSummary(summaryLines) {
  if (!summaryLines || summaryLines.length === 0) return "";
  // Join lines into clean paragraph
  return summaryLines
    .map((l) => l.trim())
    .filter(Boolean)
    .join(" ");
}

/**
 * Extracts Work Experience records
 */
function extractWorkExperience(expLines) {
  if (!expLines || expLines.length === 0) return [];

  const experiences = [];
  let currentExp = null;

  for (let i = 0; i < expLines.length; i++) {
    const line = expLines[i].trim();
    if (!line) continue;

    const dateMatch = line.match(DATE_RANGE_REGEX);
    const isBullet = /^[:•\-\*–]\s*/.test(line) || /^\d+\.\s*/.test(line);

    if (dateMatch) {
      const dateStr = dateMatch[0];
      const dates = parseDates(dateStr);
      const remainingLine = line.replace(dateMatch[0], "").replace(/^[|\s•\-,]+|[|\s•\-,]+$/g, "").trim();

      // If we already have a pending experience without dates, attach this date to it
      if (currentExp && (currentExp.company || currentExp.position) && !currentExp.startYear) {
        currentExp.startYear = dates.start;
        currentExp.endYear = dates.end;
        if (remainingLine) {
          if (!currentExp.position) currentExp.position = remainingLine;
          else if (!currentExp.company) currentExp.company = remainingLine;
        }
      } else {
        if (currentExp && (currentExp.company || currentExp.position)) {
          experiences.push(finalizeExperience(currentExp));
        }

        currentExp = {
          company: "",
          position: "",
          startYear: dates.start,
          endYear: dates.end,
          description: "",
          keyAchievements: [],
        };

        if (remainingLine) {
          if (remainingLine.includes(" - ") || remainingLine.includes(" | ") || remainingLine.includes(" at ")) {
            const parts = remainingLine.split(/\s*(?:-|\||at)\s*/);
            currentExp.company = parts[0]?.trim() || "";
            currentExp.position = parts[1]?.trim() || "";
          } else {
            currentExp.company = remainingLine;
          }
        } else if (i > 0) {
          // Look back for preceding company/position line
          const prevLine = expLines[i - 1].trim();
          if (prevLine && !prevLine.match(DATE_RANGE_REGEX) && !/^[:•\-\*–]/.test(prevLine)) {
            if (prevLine.includes(" - ") || prevLine.includes(" | ") || prevLine.includes(" at ")) {
              const parts = prevLine.split(/\s*(?:-|\||at)\s*/);
              currentExp.company = parts[0]?.trim() || "";
              currentExp.position = parts[1]?.trim() || "";
            } else {
              currentExp.company = prevLine;
            }
          }
        }
      }
    } else if (isBullet && currentExp) {
      const cleanBullet = line.replace(/^[:•\-\*–\d.]+\s*/, "").trim();
      if (cleanBullet) {
        currentExp.keyAchievements.push(cleanBullet);
      }
    } else if (currentExp) {
      // Non-bullet line following an entry
      if (!currentExp.position && line.length < 60) {
        currentExp.position = line;
      } else if (!currentExp.company && line.length < 60) {
        currentExp.company = line;
      } else {
        if (currentExp.description) {
          currentExp.description += " " + line;
        } else {
          currentExp.description = line;
        }
      }
    } else {
      // Pre-date header line (e.g. Company Name on line before date)
      if (line.length < 80) {
        currentExp = {
          company: "",
          position: "",
          startYear: "",
          endYear: "",
          description: "",
          keyAchievements: [],
        };
        if (line.includes(" - ") || line.includes(" | ")) {
          const parts = line.split(/\s*(?:-|\|)\s*/);
          currentExp.company = parts[0]?.trim() || "";
          currentExp.position = parts[1]?.trim() || "";
        } else {
          currentExp.company = line;
        }
      }
    }
  }

  if (currentExp && (currentExp.company || currentExp.position)) {
    experiences.push(finalizeExperience(currentExp));
  }

  return experiences;
}

function finalizeExperience(exp) {
  // If company has both company & position merged, separate them
  let comp = exp.company || "";
  let pos = exp.position || "";

  if (comp.includes(" - ") && !pos) {
    const parts = comp.split(/\s*-\s*/);
    comp = parts[0].trim();
    pos = parts[1].trim();
  }

  return {
    company: comp,
    position: pos,
    startYear: exp.startYear || "",
    endYear: exp.endYear || "",
    description: exp.description || "",
    keyAchievements: exp.keyAchievements.join("\n"),
  };
}

/**
 * Extracts Education records
 */
function extractEducation(eduLines) {
  if (!eduLines || eduLines.length === 0) return [];

  const educations = [];
  let currentEdu = null;

  const DEGREE_KEYWORDS = /\b(bachelor|master|phd|doctorate|b\.?s\.?|b\.?a\.?|m\.?s\.?|m\.?a\.?|mba|b\.?tech|m\.?tech|associate|diploma|degree|high school)\b/i;
  const SCHOOL_KEYWORDS = /\b(university|college|institute|school|academy|polytechnic)\b/i;

  for (let i = 0; i < eduLines.length; i++) {
    const line = eduLines[i].trim();
    if (!line) continue;

    const dateMatch = line.match(DATE_RANGE_REGEX) || line.match(SINGLE_YEAR_REGEX);

    if (SCHOOL_KEYWORDS.test(line)) {
      if (currentEdu && (currentEdu.school || currentEdu.degree)) {
        educations.push(currentEdu);
      }
      currentEdu = {
        school: line.replace(DATE_RANGE_REGEX, "").replace(/^[|\s•\-,]+|[|\s•\-,]+$/g, "").trim(),
        degree: "",
        startYear: "",
        endYear: "",
      };
      if (dateMatch) {
        const dates = parseDates(Array.isArray(dateMatch) ? dateMatch[0] : dateMatch[0]);
        currentEdu.startYear = dates.start || "";
        currentEdu.endYear = dates.end || "";
      }
    } else if (DEGREE_KEYWORDS.test(line)) {
      if (!currentEdu) {
        currentEdu = { school: "", degree: "", startYear: "", endYear: "" };
      }
      currentEdu.degree = line.replace(DATE_RANGE_REGEX, "").replace(/^[|\s•\-,]+|[|\s•\-,]+$/g, "").trim();
      if (dateMatch && !currentEdu.startYear) {
        const dates = parseDates(Array.isArray(dateMatch) ? dateMatch[0] : dateMatch[0]);
        currentEdu.startYear = dates.start || "";
        currentEdu.endYear = dates.end || "";
      }
    } else if (dateMatch && currentEdu) {
      const dates = parseDates(Array.isArray(dateMatch) ? dateMatch[0] : dateMatch[0]);
      currentEdu.startYear = dates.start || "";
      currentEdu.endYear = dates.end || "";
    } else if (currentEdu && !currentEdu.degree && line.length < 60) {
      currentEdu.degree = line;
    }
  }

  if (currentEdu && (currentEdu.school || currentEdu.degree)) {
    educations.push(currentEdu);
  }

  return educations;
}

/**
 * Extracts and categorizes Skills into Technical, Soft, and Additional
 */
function extractSkills(skillLines, rawText) {
  const allDetectedSkills = [];

  // Extract from designated skills section
  if (skillLines && skillLines.length > 0) {
    skillLines.forEach((line) => {
      // Remove prefixes like "Languages:", "Frontend:", "Tools:"
      const cleaned = line.replace(/^[A-Za-z\s/&]+:\s*/, "");
      // Split on commas, bullets, pipes, semicolons
      const tokens = cleaned.split(/[,|;•\n\t]+/).map((s) => s.trim()).filter((s) => s.length > 0 && s.length < 40);
      allDetectedSkills.push(...tokens);
    });
  }

  // Deduplicate case-insensitively
  const uniqueSkills = [];
  const seen = new Set();

  allDetectedSkills.forEach((s) => {
    const lower = s.toLowerCase();
    if (!seen.has(lower) && s.length > 1) {
      seen.add(lower);
      uniqueSkills.push(s);
    }
  });

  const technical = [];
  const soft = [];
  const additional = [];

  uniqueSkills.forEach((skill) => {
    const lower = skill.toLowerCase();
    if (TECH_SKILL_KEYWORDS.has(lower)) {
      technical.push(skill);
    } else if (SOFT_SKILL_KEYWORDS.has(lower)) {
      soft.push(skill);
    } else {
      // If it looks technical (contains code symbols, camelCase, or common abbreviations)
      if (/[A-Z]/.test(skill) && /[a-z]/.test(skill) && !skill.includes(" ")) {
        technical.push(skill);
      } else if (technical.length < 15) {
        technical.push(skill);
      } else {
        additional.push(skill);
      }
    }
  });

  return [
    { title: "Technical Skills", skills: technical },
    { title: "Soft Skills", skills: soft },
    { title: "Additional Skills", skills: additional },
  ];
}

/**
 * Extracts Projects
 */
function extractProjects(projectLines) {
  if (!projectLines || projectLines.length === 0) return [];

  const projects = [];
  let currentProj = null;

  for (let i = 0; i < projectLines.length; i++) {
    const line = projectLines[i].trim();
    if (!line) continue;

    const isBullet = /^[:•\-\*–]\s*/.test(line);

    if (!isBullet && line.length < 80) {
      if (currentProj && currentProj.name) {
        projects.push({
          ...currentProj,
          keyAchievements: currentProj.keyAchievements.join("\n"),
        });
      }

      currentProj = {
        name: line.replace(URL_REGEX, "").replace(/^[|\s•\-,]+|[|\s•\-,]+$/g, "").trim(),
        link: (line.match(URL_REGEX) || [""])[0],
        description: "",
        keyAchievements: [],
        startYear: "",
        endYear: "",
      };
    } else if (currentProj) {
      if (isBullet) {
        currentProj.keyAchievements.push(line.replace(/^[:•\-\*–\d.]+\s*/, "").trim());
      } else if (!currentProj.description) {
        currentProj.description = line;
      }
    }
  }

  if (currentProj && currentProj.name) {
    projects.push({
      ...currentProj,
      keyAchievements: currentProj.keyAchievements.join("\n"),
    });
  }

  return projects;
}

/**
 * Extracts Certifications
 */
function extractCertifications(certLines) {
  if (!certLines || certLines.length === 0) return [];

  const certs = [];

  certLines.forEach((line) => {
    const clean = line.replace(/^[:•\-\*–]\s*/, "").trim();
    if (!clean || clean.length < 3) return;

    // Detect year/date
    const yearMatch = clean.match(/\b(20\d{2}(?:-\d{2})?)\b/);
    const date = yearMatch ? yearMatch[0] : "";

    // Detect URL
    const urlMatch = clean.match(URL_REGEX);
    const url = urlMatch ? urlMatch[0] : "";

    // Clean name of dates/urls
    const nameWithoutMeta = clean
      .replace(URL_REGEX, "")
      .replace(/\b20\d{2}(?:-\d{2})?\b/, "")
      .replace(/^[|\s•\-,()]+|[|\s•\-,()]+$/g, "")
      .trim();

    // Check if issuer exists (e.g. "AWS Certified Solutions Architect - Amazon Web Services")
    let name = nameWithoutMeta;
    let issuer = "";

    if (nameWithoutMeta.includes(" - ") || nameWithoutMeta.includes(" by ")) {
      const parts = nameWithoutMeta.split(/\s*(?:-|by)\s*/);
      name = parts[0]?.trim() || "";
      issuer = parts[1]?.trim() || "";
    }

    if (name) {
      certs.push({
        name,
        issuer,
        date,
        credentialId: "",
        url,
      });
    }
  });

  return certs;
}

/**
 * Extracts Spoken Languages
 */
function extractLanguages(langLines, rawText) {
  const found = new Set();

  if (langLines && langLines.length > 0) {
    langLines.forEach((line) => {
      const tokens = line.split(/[,|;•\n\t]+/).map((t) => t.trim()).filter(Boolean);
      tokens.forEach((t) => {
        const clean = t.replace(/\([^)]*\)/g, "").trim();
        if (clean.length > 1 && clean.length < 30) {
          found.add(t);
        }
      });
    });
  }

  if (found.size === 0) {
    // Scan raw text for known language keywords
    KNOWN_LANGUAGES.forEach((lang) => {
      const reg = new RegExp(`\\b${lang}\\b`, "i");
      if (reg.test(rawText)) {
        found.add(lang);
      }
    });
  }

  return Array.from(found);
}

/**
 * Extracts Social Media Profiles (LinkedIn, GitHub, Portfolio)
 */
function extractSocialMedia(personalInfo, socialLines, rawText) {
  const socials = [];
  const seen = new Set();

  const addSocial = (platform, link) => {
    if (!link || seen.has(platform.toLowerCase())) return;
    seen.add(platform.toLowerCase());
    socials.push({
      id: `sm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      socialMedia: platform,
      link: link.replace(/^https?:\/\//i, "").replace(/\/$/, ""),
    });
  };

  const liMatch = rawText.match(LINKEDIN_REGEX);
  if (liMatch) addSocial("LinkedIn", `linkedin.com/in/${liMatch[1]}`);

  const ghMatch = rawText.match(GITHUB_REGEX);
  if (ghMatch) addSocial("Github", `github.com/${ghMatch[1]}`);

  const twMatch = rawText.match(TWITTER_REGEX);
  if (twMatch) addSocial("Twitter", `twitter.com/${twMatch[1]}`);

  // Look for standalone personal website URL
  const allUrls = rawText.match(/https?:\/\/[^\s,;"'<>()]+/gi) || [];
  for (const url of allUrls) {
    if (!url.includes("linkedin") && !url.includes("github") && !url.includes("twitter") && !url.includes("x.com")) {
      addSocial("Website", url);
      break;
    }
  }

  return socials;
}

/**
 * Helper to parse dates into ISO / readable formats
 */
function parseDates(dateStr) {
  if (!dateStr) return { start: "", end: "" };

  const parts = dateStr.split(/\s*(?:-|–|—|to)\s*/i);
  const startRaw = parts[0]?.trim() || "";
  const endRaw = parts[1]?.trim() || "";

  return {
    start: normalizeDateString(startRaw),
    end: /present|current|ongoing/i.test(endRaw) ? "Present" : normalizeDateString(endRaw),
  };
}

function normalizeDateString(str) {
  if (!str) return "";
  const yearMatch = str.match(/\b(19|20)\d{2}\b/);
  return yearMatch ? yearMatch[0] : str;
}
