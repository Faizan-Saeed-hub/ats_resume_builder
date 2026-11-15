import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FiExternalLink } from "react-icons/fi";
import { MdPhone, MdEmail, MdLocationOn } from "react-icons/md";
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

const CreativeModernTemplate = ({ resumeData }) => {
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

  const hasLeft =
    showPhoto ||
    hasContactInfo(resumeData) ||
    validSocial.length > 0 ||
    validEducation.length > 0 ||
    validSkills.length > 0 ||
    validCerts.length > 0 ||
    validLanguages.length > 0;

  const hasRight =
    resumeData.name ||
    resumeData.position ||
    hasSummary(resumeData) ||
    validWork.length > 0 ||
    validProjects.length > 0;

  const leftColWidth = !hasRight ? "w-full" : "w-full md:w-1/3 print:w-[33%]";
  const rightColWidth = !hasLeft ? "w-full" : "w-full md:w-2/3 print:w-[67%]";

  return (
    <div className="font-sans text-gray-800 text-xs leading-normal -m-4 sm:-mx-6 sm:-my-5 flex flex-col md:flex-row print:flex-row min-h-[1100px] print:min-h-0">
      {/* Left Accent Column */}
      {hasLeft && (
        <div className={`${leftColWidth} bg-[#F0FDF4]/50 md:bg-blue-50/70 p-5 sm:p-6 border-r border-blue-100 space-y-3.5`}>
          {showPhoto && (
            <div className="flex justify-center mb-3">
              <div className={`w-24 h-24 ${roundedClass} overflow-hidden border-2 border-[#2563EB] shadow-md`}>
                <Image
                  src={resumeData.profilePicture}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          )}

          {/* Contact info */}
          {hasContactInfo(resumeData) && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#172554] border-b border-blue-200 pb-1 mb-2">
                Contact
              </h3>
              <div className="space-y-1.5 text-[11px] text-gray-700">
                {resumeData.contactInformation && (
                  <div className="flex items-center gap-1.5">
                    <MdPhone className="text-blue-600 flex-shrink-0" />
                    <span>{resumeData.contactInformation}</span>
                  </div>
                )}
                {resumeData.email && (
                  <div className="flex items-center gap-1.5">
                    <MdEmail className="text-blue-600 flex-shrink-0" />
                    <span className="break-all">{resumeData.email}</span>
                  </div>
                )}
                {resumeData.address && (
                  <div className="flex items-center gap-1.5">
                    <MdLocationOn className="text-blue-600 flex-shrink-0" />
                    <span>{resumeData.address}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {validSocial.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-blue-100 space-y-1 text-[11px]">
              {validSocial.map((s, i) => (
                <div key={i}>
                  {s.socialMedia && <span className="font-semibold text-gray-800">{s.socialMedia}: </span>}
                  <a
                    href={`https://${s.link.replace(/^https?:\/\//, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 hover:underline break-all"
                  >
                    {s.link}
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {validEducation.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#172554] border-b border-blue-200 pb-1 mb-2">
                Education
              </h3>
              <div className="space-y-2">
                {validEducation.map((edu, idx) => (
                  <div key={idx}>
                    {edu.degree && <div className="font-bold text-gray-900 text-xs">{edu.degree}</div>}
                    {edu.school && <div className="text-[11px] text-gray-700">{edu.school}</div>}
                    {(edu.startYear || edu.endYear) && (
                      <div className="text-[10px] text-blue-700 font-medium">
                        {edu.startYear} {edu.endYear ? `— ${edu.endYear}` : ""}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {validSkills.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#172554] border-b border-blue-200 pb-1 mb-2">
                Skills
              </h3>
              <div className="space-y-2.5">
                {validSkills.map((cat, idx) => {
                  const activeSkills = (cat.skills || []).filter(
                    (s) => typeof s === "string" && s.trim().length > 0
                  );
                  if (activeSkills.length === 0) return null;
                  return (
                    <div key={idx}>
                      <div className="font-semibold text-gray-800 text-[11px] mb-1">{cat.title}</div>
                      <div className="flex flex-wrap gap-1">
                        {activeSkills.map((s, sIdx) => (
                          <span
                            key={sIdx}
                            className="bg-white border border-blue-200 text-blue-900 text-[10px] px-1.5 py-0.5 rounded shadow-2xs font-medium"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Certifications with Clickable Links */}
          {validCerts.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#172554] border-b border-blue-200 pb-1 mb-2">
                Certifications
              </h3>
              <ul className="space-y-2 text-[11px]">
                {validCerts.map((c, idx) => {
                  const isObj = typeof c === "object" && c !== null;
                  const name = isObj ? c.name : c;
                  const url = isObj ? c.url : "";
                  const issuer = isObj ? c.issuer : "";
                  const date = isObj ? c.date : "";
                  const credentialId = isObj ? c.credentialId : "";

                  if (!name) return null;

                  return (
                    <li key={idx} className="bg-white/80 p-2 rounded border border-blue-100">
                      {url ? (
                        <a
                          href={url.startsWith("http") ? url : `https://${url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-blue-700 hover:underline inline-flex items-center gap-1"
                        >
                          <span>{name}</span>
                          <FiExternalLink className="w-2.5 h-2.5 inline print:hidden" />
                        </a>
                      ) : (
                        <span className="font-bold text-gray-900">{name}</span>
                      )}
                      {issuer && <div className="text-[10px] text-gray-600">{issuer}</div>}
                      {date && <div className="text-[10px] text-gray-500">{date}</div>}
                      {credentialId && (
                        <div className="text-[10px] text-gray-500">ID: {credentialId}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Languages */}
          {validLanguages.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#172554] border-b border-blue-200 pb-1 mb-1">
                Languages
              </h3>
              <p className="text-[11px] text-gray-700">{validLanguages.join(" • ")}</p>
            </div>
          )}
        </div>
      )}

      {/* Right Content Column */}
      {hasRight && (
        <div className={`${rightColWidth} p-5 sm:p-7 space-y-3.5 bg-white`}>
          {/* Name & Title Header */}
          {(resumeData.name || resumeData.position) && (
            <div className="border-b-2 border-blue-600 pb-3">
              {resumeData.name && (
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172554] tracking-tight">
                  {resumeData.name}
                </h1>
              )}
              {resumeData.position && (
                <p className="text-base font-semibold text-blue-600 mt-0.5 tracking-wide uppercase">
                  {resumeData.position}
                </p>
              )}
            </div>
          )}

          {/* Summary */}
          {hasSummary(resumeData) && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#172554] border-b border-gray-200 pb-1 mb-1.5">
                Profile Summary
              </h2>
              <p className="text-gray-700 text-xs leading-relaxed">{resumeData.summary}</p>
            </div>
          )}

          {/* Work Experience */}
          {validWork.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#172554] border-b border-gray-200 pb-1 mb-2">
                Work Experience
              </h2>
              <div className="space-y-3.5">
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
                      <div className="flex justify-between items-baseline">
                        {exp.position && <span className="font-bold text-gray-900 text-xs">{exp.position}</span>}
                        {(exp.startYear || exp.endYear) && (
                          <span className="text-[11px] font-semibold text-blue-700">
                            {exp.startYear} {exp.endYear ? `— ${exp.endYear}` : ""}
                          </span>
                        )}
                      </div>
                      {exp.company && <div className="text-[11px] font-semibold text-gray-700 mb-1">{exp.company}</div>}
                      {exp.description && (
                        <p className="text-gray-700 text-xs mb-1">{exp.description}</p>
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
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#172554] border-b border-gray-200 pb-1 mb-2">
                Featured Projects
              </h2>
              <div className="space-y-3">
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
                      <div className="flex justify-between items-baseline">
                        {proj.name && <span className="font-bold text-gray-900 text-xs">{proj.name}</span>}
                        {(proj.startYear || proj.endYear) && (
                          <span className="text-[11px] font-semibold text-blue-700">
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
                      {proj.description && (
                        <p className="text-gray-700 text-xs mb-1">{proj.description}</p>
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
        </div>
      )}
    </div>
  );
};

export default CreativeModernTemplate;
