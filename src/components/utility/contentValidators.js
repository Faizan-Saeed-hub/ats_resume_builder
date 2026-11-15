/**
 * Content Validation Utilities for Dynamic CV Rendering Engine
 * Ensures empty sections (blank strings, empty arrays, whitespace-only fields)
 * are completely hidden without rendering empty headings, borders, or bullet points.
 */

export const hasSummary = (data) => {
  return Boolean(data?.summary && data.summary.trim().length > 0);
};

export const hasEducation = (data) => {
  return (
    Array.isArray(data?.education) &&
    data.education.some(
      (item) =>
        (item?.school && item.school.trim().length > 0) ||
        (item?.degree && item.degree.trim().length > 0)
    )
  );
};

export const hasSkills = (data) => {
  return (
    Array.isArray(data?.skills) &&
    data.skills.some(
      (cat) =>
        Array.isArray(cat?.skills) &&
        cat.skills.some((s) => typeof s === "string" && s.trim().length > 0)
    )
  );
};

export const hasWorkExperience = (data) => {
  return (
    Array.isArray(data?.workExperience) &&
    data.workExperience.some(
      (item) =>
        (item?.company && item.company.trim().length > 0) ||
        (item?.position && item.position.trim().length > 0) ||
        (item?.description && item.description.trim().length > 0) ||
        (item?.keyAchievements && item.keyAchievements.trim().length > 0)
    )
  );
};

export const hasProjects = (data) => {
  return (
    Array.isArray(data?.projects) &&
    data.projects.some(
      (item) =>
        (item?.name && item.name.trim().length > 0) ||
        (item?.description && item.description.trim().length > 0) ||
        (item?.link && item.link.trim().length > 0) ||
        (item?.keyAchievements && item.keyAchievements.trim().length > 0)
    )
  );
};

export const hasLanguages = (data) => {
  return (
    Array.isArray(data?.languages) &&
    data.languages.some((l) => typeof l === "string" && l.trim().length > 0)
  );
};

export const hasCertifications = (data) => {
  return (
    Array.isArray(data?.certifications) &&
    data.certifications.some((c) => {
      if (!c) return false;
      if (typeof c === "string") return c.trim().length > 0;
      return Boolean(
        (c.name && c.name.trim().length > 0) ||
        (c.issuer && c.issuer.trim().length > 0)
      );
    })
  );
};

export const hasSocialMedia = (data) => {
  return (
    Array.isArray(data?.socialMedia) &&
    data.socialMedia.some((s) => s && s.link && s.link.trim().length > 0)
  );
};

export const hasContactInfo = (data) => {
  return Boolean(
    (data?.contactInformation && data.contactInformation.trim().length > 0) ||
    (data?.email && data.email.trim().length > 0) ||
    (data?.address && data.address.trim().length > 0)
  );
};
