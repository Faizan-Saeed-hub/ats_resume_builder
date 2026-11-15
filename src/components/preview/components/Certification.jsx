import React from "react";
import { FiExternalLink } from "react-icons/fi";

const Certification = ({ title = "Certifications", certifications }) => {
  if (!certifications || !Array.isArray(certifications)) return null;

  const validCertifications = certifications.filter((cert) => {
    if (!cert) return false;
    if (typeof cert === "string") return cert.trim().length > 0;
    return Boolean((cert.name && cert.name.trim().length > 0) || (cert.issuer && cert.issuer.trim().length > 0));
  });

  if (validCertifications.length === 0) return null;

  return (
    <div className="mb-1 leading-snug">
      <h2 className="section-title mb-0.5 border-b border-gray-300 pb-0.5 text-gray-800">
        {title}
      </h2>
      <ul className="sub-content list-disc ml-3.5 space-y-0.5 text-gray-700 leading-snug">
        {validCertifications.map((certification, index) => {
          const isObj = typeof certification === "object" && certification !== null;
          const name = isObj ? certification.name : certification;
          const url = isObj ? certification.url : "";
          const issuer = isObj ? certification.issuer : "";
          const date = isObj ? certification.date : "";
          const credentialId = isObj ? certification.credentialId : "";

          if (!name) return null;

          return (
            <li key={index} className="leading-snug">
              {url ? (
                <a
                  href={url.startsWith("http") ? url : `https://${url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-700 hover:text-blue-900 hover:underline inline-flex items-center gap-0.5"
                  title="Verify Certification"
                >
                  <span>{name}</span>
                  <FiExternalLink className="w-2.5 h-2.5 inline text-blue-600 print:hidden" />
                </a>
              ) : (
                <span className="font-semibold text-gray-800">{name}</span>
              )}
              {issuer && <span className="text-gray-600"> — {issuer}</span>}
              {date && <span className="text-gray-500 text-[10px]"> ({date})</span>}
              {credentialId && (
                <span className="text-gray-500 text-[10px]"> [ID: {credentialId}]</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Certification;
