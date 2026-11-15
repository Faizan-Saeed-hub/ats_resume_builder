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

const CorporateExecutiveTemplate = ({ resumeData }) => {
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

  const hasMain = validWork.length > 0 || validProjects.length > 0;
  const hasSide =
    validEducation.length > 0 ||
    validSkills.length > 0 ||
    validCerts.length > 0 ||
    validLanguages.length > 0;

  const mainColClass = !hasSide
    ? "col-span-1 md:col-span-3 print:col-span-3 space-y-3"
    : "col-span-1 md:col-span-2 print:col-span-2 space-y-3";
  const sideColClass = !hasMain
    ? "col-span-1 md:col-span-3 print:col-span-3 space-y-3"
    : "col-span-1 md:col-span-1 print:col-span-1 space-y-3";

  return (
    <div className="font-sans text-gray-800 text-xs leading-normal -m-4 sm:-mx-6 sm:-my-5">
      {/* Executive Header Banner */}
      <div className="bg-[#172554] text-white p-5 sm:p-6 flex flex-col sm:flex-row print:flex-row justify-between items-center gap-3">
        <div className="text-center sm:text-left">
          {resumeData.name && (
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide uppercase">
              {resumeData.name}
            </h1>
          )}
          {resumeData.position && (
            <p className="text-blue-300 font-semibold text-sm sm:text-base mt-1 tracking-wider uppercase">
              {resumeData.position}
            </p>
          )}
          {hasContactInfo(resumeData) && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-blue-100 mt-2.5 justify-center sm:justify-start">
              {resumeData.contactInformation && (
                <span className="flex items-center gap-1">
                  <MdPhone className="text-blue-300" />
                  {resumeData.contactInformation}
                </span>
              )}
              {resumeData.email && (
                <span className="flex items-center gap-1">
                  <MdEmail className="text-blue-300" />
                  {resumeData.email}
                </span>
              )}
              {resumeData.address && (
                <span className="flex items-center gap-1">
                  <MdLocationOn className="text-blue-300" />
                  {resumeData.address}
                </span>
              )}
            </div>
          )}
          {validSocial.length > 0 && (
            <div className="flex flex-wrap gap-x-3 text-xs text-blue-200 mt-1.5 justify-center sm:justify-start">
              {validSocial.map((s, i) => (
                <a
                  key={i}
                  href={`https://${s.link.replace(/^https?:\/\//, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white hover:underline"
                >
                  {s.socialMedia ? `${s.socialMedia}: ` : ""}{s.link}
                </a>
              ))}
            </div>
          )}
        </div>

        {showPhoto && (
          <div className={`w-24 h-24 ${roundedClass} overflow-hidden border-2 border-white shadow-lg flex-shrink-0`}>
            <Image
              src={resumeData.profilePicture}
              alt="Profile"
              width={96}
              height={96}
              className="object-cover w-full h-full"
            />
          </div>
        )}
      </div>

      {/* Main Body */}
      <div className="p-5 sm:p-7 space-y-3.5 bg-white">
        {/* Executive Summary */}
        {hasSummary(resumeData) && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#172554] border-b-2 border-[#172554] pb-1 mb-1.5">
              Executive Profile
            </h2>
            <p className="text-gray-700 leading-relaxed text-xs">{resumeData.summary}</p>
          </div>
        )}

        {(hasMain || hasSide) && (
          <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-5">
            {/* Main Experience Column */}
            {hasMain && (
              <div className={mainColClass}>
                {/* Work Experience */}
                {validWork.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#172554] border-b border-gray-300 pb-1 mb-2">
                      Leadership & Work Experience
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
                          <div key={idx} className="border-l-2 border-blue-900/30 pl-3 py-0.5">
                            <div className="flex justify-between items-baseline">
                              {exp.position && <span className="font-bold text-gray-900 text-xs">{exp.position}</span>}
                              {(exp.startYear || exp.endYear) && (
                                <span className="text-[11px] text-gray-500 font-semibold">
                                  {exp.startYear} {exp.endYear ? `— ${exp.endYear}` : ""}
                                </span>
                              )}
                            </div>
                            {exp.company && (
                              <div className="text-[11px] font-semibold text-[#172554] mb-1">
                                {exp.company}
                              </div>
                            )}
                            {exp.description && (
                              <p className="text-gray-700 text-[11px] mb-1">{exp.description}</p>
                            )}
                            {achievements.length > 0 && (
                              <ul className="list-disc pl-3 text-[11px] text-gray-700 space-y-0.5">
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
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#172554] border-b border-gray-300 pb-1 mb-2">
                      Key Strategic Projects
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
                          <div key={idx} className="border-l-2 border-blue-900/30 pl-3">
                            <div className="flex justify-between items-baseline">
                              {proj.name && <span className="font-bold text-gray-900 text-xs">{proj.name}</span>}
                              {(proj.startYear || proj.endYear) && (
                                <span className="text-[11px] text-gray-500">
                                  {proj.startYear} {proj.endYear ? `— ${proj.endYear}` : ""}
                                </span>
                              )}
                            </div>
                            {proj.link && (
                              <Link
                                href={proj.link.startsWith("http") ? proj.link : `https://${proj.link}`}
                                target="_blank"
                                className="text-[11px] text-blue-700 hover:underline block"
                              >
                                {proj.link}
                              </Link>
                            )}
                            {proj.description && (
                              <p className="text-gray-700 text-[11px] mt-0.5">{proj.description}</p>
                            )}
                            {achievements.length > 0 && (
                              <ul className="list-disc pl-3 text-[11px] text-gray-700 mt-1 space-y-0.5">
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

            {/* Sidebar Column */}
            {hasSide && (
              <div className={sideColClass}>
                {/* Education */}
                {validEducation.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#172554] border-b border-gray-300 pb-1 mb-1.5">
                      Education
                    </h2>
                    <div className="space-y-2">
                      {validEducation.map((edu, idx) => (
                        <div key={idx}>
                          {edu.degree && <div className="font-bold text-gray-900 text-xs">{edu.degree}</div>}
                          {edu.school && <div className="text-[11px] text-gray-700">{edu.school}</div>}
                          {(edu.startYear || edu.endYear) && (
                            <div className="text-[10px] text-gray-500">
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
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#172554] border-b border-gray-300 pb-1 mb-1.5">
                      Core Competencies
                    </h2>
                    <div className="space-y-2">
                      {validSkills.map((cat, idx) => {
                        const activeSkills = (cat.skills || []).filter(
                          (s) => typeof s === "string" && s.trim().length > 0
                        );
                        if (activeSkills.length === 0) return null;
                        return (
                          <div key={idx}>
                            <div className="font-semibold text-gray-900 text-[11px] mb-1">
                              {cat.title}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {activeSkills.map((s, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="bg-gray-100 text-gray-800 text-[10px] px-1.5 py-0.5 rounded font-medium"
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

                {/* Certifications */}
                {validCerts.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#172554] border-b border-gray-300 pb-1 mb-1.5">
                      Credentials & Certifications
                    </h2>
                    <ul className="space-y-1.5 text-[11px]">
                      {validCerts.map((c, idx) => {
                        const isObj = typeof c === "object" && c !== null;
                        const name = isObj ? c.name : c;
                        const url = isObj ? c.url : "";
                        const issuer = isObj ? c.issuer : "";
                        const date = isObj ? c.date : "";
                        const credentialId = isObj ? c.credentialId : "";

                        if (!name) return null;

                        return (
                          <li key={idx} className="border-b border-gray-100 pb-1">
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
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#172554] border-b border-gray-300 pb-1 mb-1">
                      Languages
                    </h2>
                    <div className="text-[11px] text-gray-700">{validLanguages.join(", ")}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CorporateExecutiveTemplate;
