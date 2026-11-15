import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FiExternalLink } from "react-icons/fi";
import {
  hasSummary,
  hasEducation,
  hasSkills,
  hasWorkExperience,
  hasProjects,
  hasCertifications,
  hasLanguages,
  hasContactInfo,
} from "../../utility/contentValidators";

const MinimalAtsTemplate = ({ resumeData }) => {
  const photoStyle = resumeData.profilePhotoStyle || "circle";
  const roundedClass =
    photoStyle === "square"
      ? "rounded-none"
      : photoStyle === "rounded"
      ? "rounded-xl"
      : "rounded-full";

  const showPhoto =
    resumeData.showProfilePhoto !== false &&
    resumeData.profilePicture &&
    resumeData.profilePicture.length > 0;

  const validSocial = Array.isArray(resumeData.socialMedia)
    ? resumeData.socialMedia.filter((s) => s && s.link && s.link.trim().length > 0)
    : [];

  const validWork = Array.isArray(resumeData.workExperience)
    ? resumeData.workExperience.filter(
        (exp) =>
          (exp.position && exp.position.trim().length > 0) ||
          (exp.company && exp.company.trim().length > 0) ||
          (exp.description && exp.description.trim().length > 0) ||
          (exp.keyAchievements && exp.keyAchievements.trim().length > 0)
      )
    : [];

  const validProjects = Array.isArray(resumeData.projects)
    ? resumeData.projects.filter(
        (proj) =>
          (proj.name && proj.name.trim().length > 0) ||
          (proj.description && proj.description.trim().length > 0) ||
          (proj.link && proj.link.trim().length > 0) ||
          (proj.keyAchievements && proj.keyAchievements.trim().length > 0)
      )
    : [];

  const validEducation = Array.isArray(resumeData.education)
    ? resumeData.education.filter(
        (edu) =>
          (edu.degree && edu.degree.trim().length > 0) ||
          (edu.school && edu.school.trim().length > 0)
      )
    : [];

  const validSkills = Array.isArray(resumeData.skills)
    ? resumeData.skills.filter(
        (cat) =>
          Array.isArray(cat.skills) &&
          cat.skills.some((s) => typeof s === "string" && s.trim().length > 0)
      )
    : [];

  const validCerts = Array.isArray(resumeData.certifications)
    ? resumeData.certifications.filter((c) => {
        if (!c) return false;
        if (typeof c === "string") return c.trim().length > 0;
        return Boolean((c.name && c.name.trim().length > 0) || (c.issuer && c.issuer.trim().length > 0));
      })
    : [];

  const validLanguages = Array.isArray(resumeData.languages)
    ? resumeData.languages.filter((l) => typeof l === "string" && l.trim().length > 0)
    : [];

  return (
    <div className="space-y-4 text-gray-900 font-sans leading-relaxed text-sm">
      {/* Header */}
      <div className="border-b-2 border-gray-900 pb-3 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          {resumeData.name && (
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 uppercase">
              {resumeData.name}
            </h1>
          )}
          {resumeData.position && (
            <p className="text-base font-medium text-gray-700 mt-0.5">
              {resumeData.position}
            </p>
          )}
          {hasContactInfo(resumeData) && (
            <div className="text-xs text-gray-600 mt-1.5 flex flex-wrap gap-x-3 gap-y-1 justify-center sm:justify-start">
              {resumeData.contactInformation && <span>📞 {resumeData.contactInformation}</span>}
              {resumeData.email && <span>✉️ {resumeData.email}</span>}
              {resumeData.address && <span>📍 {resumeData.address}</span>}
            </div>
          )}
          {validSocial.length > 0 && (
            <div className="text-xs text-blue-700 mt-1 flex flex-wrap gap-x-3 justify-center sm:justify-start">
              {validSocial.map((s, i) => (
                <a
                  key={i}
                  href={`https://${s.link.replace(/^https?:\/\//, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  {s.socialMedia ? `${s.socialMedia}: ` : ""}{s.link}
                </a>
              ))}
            </div>
          )}
        </div>

        {showPhoto && (
          <div className={`w-20 h-20 ${roundedClass} overflow-hidden border border-gray-300 flex-shrink-0`}>
            <Image
              src={resumeData.profilePicture}
              alt="Profile"
              width={80}
              height={80}
              className="object-cover w-full h-full"
            />
          </div>
        )}
      </div>

      {/* Summary */}
      {hasSummary(resumeData) && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5 mb-1.5">
            Professional Summary
          </h2>
          <p className="text-xs text-gray-800 leading-normal">{resumeData.summary}</p>
        </div>
      )}

      {/* Work Experience */}
      {validWork.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5 mb-2">
            Professional Experience
          </h2>
          <div className="space-y-3">
            {validWork.map((exp, idx) => {
              const achievements =
                typeof exp.keyAchievements === "string"
                  ? exp.keyAchievements
                      .split("\n")
                      .map((a) => a.trim().replace(/^[•\-\*]\s*/, ""))
                      .filter((a) => a.length > 0)
                  : [];

              return (
                <div key={idx}>
                  <div className="flex justify-between items-baseline text-xs">
                    {exp.position && <span className="font-bold text-gray-900">{exp.position}</span>}
                    {(exp.startYear || exp.endYear) && (
                      <span className="text-gray-600 font-medium">
                        {exp.startYear} {exp.endYear ? `— ${exp.endYear}` : ""}
                      </span>
                    )}
                  </div>
                  {exp.company && <div className="text-xs font-semibold text-gray-700 mb-1">{exp.company}</div>}
                  {exp.description && (
                    <p className="text-xs text-gray-700 mb-1 leading-normal">{exp.description}</p>
                  )}
                  {achievements.length > 0 && (
                    <ul className="list-disc pl-4 text-xs text-gray-700 space-y-0.5">
                      {achievements.map((ach, aIdx) => (
                        <li key={aIdx}>{ach}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Projects */}
      {validProjects.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5 mb-2">
            Key Projects
          </h2>
          <div className="space-y-2.5">
            {validProjects.map((proj, idx) => {
              const achievements =
                typeof proj.keyAchievements === "string"
                  ? proj.keyAchievements
                      .split("\n")
                      .map((a) => a.trim().replace(/^[•\-\*]\s*/, ""))
                      .filter((a) => a.length > 0)
                  : [];

              return (
                <div key={idx}>
                  <div className="flex justify-between items-baseline text-xs">
                    {proj.name && <span className="font-bold text-gray-900">{proj.name}</span>}
                    {(proj.startYear || proj.endYear) && (
                      <span className="text-gray-600 font-medium">
                        {proj.startYear} {proj.endYear ? `— ${proj.endYear}` : ""}
                      </span>
                    )}
                  </div>
                  {proj.link && (
                    <Link
                      href={proj.link.startsWith("http") ? proj.link : `https://${proj.link}`}
                      target="_blank"
                      className="text-xs text-blue-700 hover:underline block mb-0.5"
                    >
                      {proj.link}
                    </Link>
                  )}
                  {proj.description && <p className="text-xs text-gray-700 mb-1">{proj.description}</p>}
                  {achievements.length > 0 && (
                    <ul className="list-disc pl-4 text-xs text-gray-700 space-y-0.5">
                      {achievements.map((ach, aIdx) => (
                        <li key={aIdx}>{ach}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Education */}
      {validEducation.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5 mb-1.5">
            Education
          </h2>
          <div className="space-y-1.5">
            {validEducation.map((edu, idx) => (
              <div key={idx} className="flex justify-between items-baseline text-xs">
                <div>
                  {edu.degree && <span className="font-bold text-gray-900">{edu.degree}</span>}
                  {edu.school && <span className="text-gray-700">{edu.degree ? `, ` : ""}{edu.school}</span>}
                </div>
                {(edu.startYear || edu.endYear) && (
                  <span className="text-gray-600 font-medium">
                    {edu.startYear} {edu.endYear ? `— ${edu.endYear}` : ""}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {validSkills.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5 mb-1.5">
            Core Competencies & Skills
          </h2>
          <div className="space-y-1 text-xs">
            {validSkills.map((cat, idx) => {
              const activeSkills = (cat.skills || []).filter(
                (s) => typeof s === "string" && s.trim().length > 0
              );
              if (activeSkills.length === 0) return null;
              return (
                <div key={idx} className="leading-normal">
                  <span className="font-semibold text-gray-900">{cat.title}: </span>
                  <span className="text-gray-700">{activeSkills.join(" • ")}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Certifications with Clickable Links */}
      {validCerts.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5 mb-1.5">
            Licenses & Certifications
          </h2>
          <ul className="list-disc pl-4 space-y-1 text-xs">
            {validCerts.map((c, idx) => {
              const isObj = typeof c === "object" && c !== null;
              const name = isObj ? c.name : c;
              const url = isObj ? c.url : "";
              const issuer = isObj ? c.issuer : "";
              const date = isObj ? c.date : "";
              const credentialId = isObj ? c.credentialId : "";

              if (!name) return null;

              return (
                <li key={idx}>
                  {url ? (
                    <a
                      href={url.startsWith("http") ? url : `https://${url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-blue-700 hover:underline inline-flex items-center gap-1"
                    >
                      <span>{name}</span>
                      <FiExternalLink className="w-2.5 h-2.5 inline print:hidden" />
                    </a>
                  ) : (
                    <span className="font-semibold text-gray-900">{name}</span>
                  )}
                  {issuer && <span className="text-gray-700"> — {issuer}</span>}
                  {date && <span className="text-gray-500"> ({date})</span>}
                  {credentialId && <span className="text-gray-500"> [ID: {credentialId}]</span>}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Languages */}
      {validLanguages.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5 mb-1">
            Languages
          </h2>
          <p className="text-xs text-gray-700">{validLanguages.join(" • ")}</p>
        </div>
      )}
    </div>
  );
};

export default MinimalAtsTemplate;
