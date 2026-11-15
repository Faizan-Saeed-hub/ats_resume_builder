/**
 * Section Detector for CV/Resume documents
 * Identifies standard and non-standard section headings with high accuracy.
 */

export const SECTION_TYPES = {
  PERSONAL: "PERSONAL",
  SUMMARY: "SUMMARY",
  EXPERIENCE: "EXPERIENCE",
  EDUCATION: "EDUCATION",
  SKILLS: "SKILLS",
  PROJECTS: "PROJECTS",
  CERTIFICATIONS: "CERTIFICATIONS",
  LANGUAGES: "LANGUAGES",
  SOCIAL: "SOCIAL",
  AWARDS: "AWARDS",
  PUBLICATIONS: "PUBLICATIONS",
  CUSTOM: "CUSTOM",
};

export const SECTION_PATTERNS = {
  SUMMARY: [
    /^summary$/i,
    /^professional\s+summary$/i,
    /^executive\s+summary$/i,
    /^career\s+summary$/i,
    /^profile$/i,
    /^professional\s+profile$/i,
    /^career\s+profile$/i,
    /^career\s+objective$/i,
    /^objective$/i,
    /^about\s+me$/i,
    /^about$/i,
    /^personal\s+statement$/i,
    /^overview$/i,
    /^bio$/i,
    /^biography$/i,
  ],
  EXPERIENCE: [
    /^work\s+experience$/i,
    /^professional\s+experience$/i,
    /^employment\s+history$/i,
    /^experience$/i,
    /^employment$/i,
    /^work\s+history$/i,
    /^relevant\s+experience$/i,
    /^career\s+history$/i,
    /^internships?$/i,
    /^professional\s+background$/i,
    /^work\s+background$/i,
    /^positions?\s+held$/i,
    /^recent\s+experience$/i,
  ],
  EDUCATION: [
    /^education$/i,
    /^academic\s+background$/i,
    /^academic\s+history$/i,
    /^educational\s+qualifications$/i,
    /^qualifications$/i,
    /^degrees?$/i,
    /^academics?$/i,
    /^academic\s+qualifications$/i,
    /^education\s+&\s+qualifications$/i,
    /^academic\s+record$/i,
  ],
  SKILLS: [
    /^technical\s+skills$/i,
    /^skills$/i,
    /^skills\s+&\s+abilities$/i,
    /^skills\s+&\s+proficiencies$/i,
    /^core\s+competencies$/i,
    /^competencies$/i,
    /^technologies$/i,
    /^areas\s+of\s+expertise$/i,
    /^expertise$/i,
    /^key\s+skills$/i,
    /^tools\s+&\s+technologies$/i,
    /^programming\s+languages$/i,
    /^hard\s+skills$/i,
    /^soft\s+skills$/i,
    /^proficiencies$/i,
    /^technical\s+proficiencies$/i,
    /^technical\s+expertise$/i,
    /^it\s+skills$/i,
    /^tech\s+stack$/i,
  ],
  PROJECTS: [
    /^projects$/i,
    /^key\s+projects$/i,
    /^personal\s+projects$/i,
    /^academic\s+projects$/i,
    /^technical\s+projects$/i,
    /^selected\s+projects$/i,
    /^portfolio\s+projects$/i,
    /^notable\s+projects$/i,
  ],
  CERTIFICATIONS: [
    /^certifications?$/i,
    /^certificates?$/i,
    /^licenses?\s+&\s+certifications?$/i,
    /^licenses?$/i,
    /^credentials?$/i,
    /^courses?\s+&\s+certifications?$/i,
    /^training\s+&\s+certifications?$/i,
    /^professional\s+certifications?$/i,
    /^tests?\s+&\s+certifications?$/i,
  ],
  LANGUAGES: [
    /^languages?$/i,
    /^language\s+proficiency$/i,
    /^spoken\s+languages?$/i,
    /^languages?\s+known$/i,
  ],
  SOCIAL: [
    /^social\s+links?$/i,
    /^social\s+media$/i,
    /^links?$/i,
    /^websites?$/i,
    /^online\s+presence$/i,
  ],
  AWARDS: [
    /^awards?$/i,
    /^honors?\s+&\s+awards?$/i,
    /^achievements?$/i,
    /^accolades?$/i,
    /^honors?$/i,
  ],
  PUBLICATIONS: [
    /^publications?$/i,
    /^papers?$/i,
    /^research\s+papers?$/i,
  ],
};

/**
 * Checks if a line looks like a section heading.
 */
export const detectSectionHeading = (lineText) => {
  if (!lineText || typeof lineText !== "string") return null;

  // Clean and normalize line
  const cleaned = lineText
    .trim()
    .replace(/^[:•\-\*#>\s]+/, "")
    .replace(/[:•\-\*#>\s]+$/, "")
    .trim();

  if (!cleaned || cleaned.length > 50) return null;

  // Section titles are rarely longer than 4 words
  const words = cleaned.split(/\s+/);
  if (words.length > 5) return null;

  for (const [sectionType, patterns] of Object.entries(SECTION_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(cleaned)) {
        return {
          type: sectionType,
          rawTitle: cleaned,
        };
      }
    }
  }

  return null;
};
