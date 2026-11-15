/**
 * ATS Plain Text Stream Generator
 * Generates structured, readable plain text from resumeData in logical reading order.
 */

export const generateAtsPlainText = (resumeData = {}) => {
  let text = "";

  if (resumeData.name) {
    text += `${resumeData.name.toUpperCase()}\n`;
  }
  if (resumeData.position) {
    text += `${resumeData.position}\n`;
  }

  const contactParts = [
    resumeData.contactInformation,
    resumeData.email,
    resumeData.address,
  ].filter(Boolean);

  if (contactParts.length > 0) {
    text += `${contactParts.join(" | ")}\n`;
  }

  if (Array.isArray(resumeData.socialMedia) && resumeData.socialMedia.length > 0) {
    text += `${resumeData.socialMedia
      .filter((s) => s?.link)
      .map((s) => `${s.socialMedia ? s.socialMedia + ": " : ""}${s.link}`)
      .join(" | ")}\n`;
  }

  text += "\n";

  if (resumeData.summary) {
    text += `PROFESSIONAL SUMMARY\n${resumeData.summary}\n\n`;
  }

  if (Array.isArray(resumeData.workExperience) && resumeData.workExperience.length > 0) {
    text += "WORK EXPERIENCE\n";
    resumeData.workExperience.forEach((exp) => {
      text += `\n${exp.position || "Role"} - ${exp.company || "Company"}\n`;
      if (exp.startYear || exp.endYear) {
        text += `${exp.startYear || ""} - ${exp.endYear || "Present"}\n`;
      }
      if (exp.description) text += `${exp.description}\n`;
      if (exp.keyAchievements) text += `${exp.keyAchievements}\n`;
    });
    text += "\n";
  }

  if (Array.isArray(resumeData.education) && resumeData.education.length > 0) {
    text += "EDUCATION\n";
    resumeData.education.forEach((edu) => {
      text += `\n${edu.degree || "Degree"} - ${edu.school || "Institution"}\n`;
      if (edu.startYear || edu.endYear) {
        text += `${edu.startYear || ""} - ${edu.endYear || "Present"}\n`;
      }
    });
    text += "\n";
  }

  if (Array.isArray(resumeData.projects) && resumeData.projects.length > 0) {
    text += "PROJECTS\n";
    resumeData.projects.forEach((proj) => {
      text += `\n${proj.name || "Project"}\n`;
      if (proj.description) text += `${proj.description}\n`;
      if (proj.keyAchievements) text += `${proj.keyAchievements}\n`;
      if (proj.link) text += `Link: ${proj.link}\n`;
    });
    text += "\n";
  }

  if (Array.isArray(resumeData.skills) && resumeData.skills.length > 0) {
    text += "SKILLS\n";
    resumeData.skills.forEach((cat) => {
      const active = (cat.skills || []).filter(Boolean);
      if (active.length > 0) {
        text += `${cat.title || "Skills"}: ${active.join(", ")}\n`;
      }
    });
    text += "\n";
  }

  if (Array.isArray(resumeData.certifications) && resumeData.certifications.length > 0) {
    text += "CERTIFICATIONS\n";
    resumeData.certifications.forEach((c) => {
      const isObj = typeof c === "object" && c !== null;
      const name = isObj ? c.name : c;
      const issuer = isObj ? c.issuer : "";
      const date = isObj ? c.date : "";
      if (name) {
        text += `- ${name}${issuer ? " (" + issuer + ")" : ""}${date ? " - " + date : ""}\n`;
      }
    });
    text += "\n";
  }

  if (Array.isArray(resumeData.languages) && resumeData.languages.length > 0) {
    text += `LANGUAGES\n${resumeData.languages.filter(Boolean).join(", ")}\n\n`;
  }

  return text.trim();
};
