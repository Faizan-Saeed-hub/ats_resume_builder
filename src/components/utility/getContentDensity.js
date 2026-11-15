/**
 * Determines optimal layout density based on total content volume.
 * Ensures the CV fits perfectly on a single A4 page without overflowing
 * or leaving awkward empty whitespace.
 */
export const getContentDensity = (resumeData) => {
  if (!resumeData) return "normal";

  let bulletCount = 0;
  const workCount = resumeData.workExperience?.length || 0;
  const projectCount = resumeData.projects?.length || 0;
  const certCount = resumeData.certifications?.length || 0;
  const eduCount = resumeData.education?.length || 0;

  resumeData.workExperience?.forEach((item) => {
    if (item.keyAchievements) {
      bulletCount += item.keyAchievements
        .split("\n")
        .filter((l) => l.trim().length > 0).length;
    }
  });

  resumeData.projects?.forEach((item) => {
    if (item.keyAchievements) {
      bulletCount += item.keyAchievements
        .split("\n")
        .filter((l) => l.trim().length > 0).length;
    }
  });

  let skillCount = 0;
  resumeData.skills?.forEach((cat) => {
    skillCount += (cat.skills || []).length;
  });

  // Calculate composite content volume
  const score =
    workCount * 2 +
    bulletCount +
    projectCount * 2 +
    certCount +
    eduCount +
    skillCount * 0.2;

  if (score >= 12) {
    return "compact";
  } else if (score <= 6) {
    return "spacious";
  }
  return "normal";
};

export default getContentDensity;

