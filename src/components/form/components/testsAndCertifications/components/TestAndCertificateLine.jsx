import React from 'react';
import {handleCertificate} from "../utils/handleCertificate";
import {BsTrash3, BsLink45Deg} from "react-icons/bs";
import {removeCertificate} from "../utils/removeCertificate";

const TestAndCertificateLine = ({resumeData, setResumeData, cert, index}) => {
  const isObj = typeof cert === "object" && cert !== null;
  const name = isObj ? cert.name || "" : cert || "";
  const issuer = isObj ? cert.issuer || "" : "";
  const date = isObj ? cert.date || "" : "";
  const credentialId = isObj ? cert.credentialId || "" : "";
  const url = isObj ? cert.url || "" : "";

  return (
    <div className="p-3 bg-blue-900/30 border border-blue-400/20 rounded-lg mb-2 relative group hover:border-blue-400/40 transition-all">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
          Certification #{index + 1}
        </span>
        <button
          type="button"
          onClick={() => {
            removeCertificate(resumeData, setResumeData, index);
          }}
          aria-label="Remove Certificate"
          title="Remove Certificate"
          className="btn-remove p-1.5 text-sm h-fit"
        >
          <BsTrash3 />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="md:col-span-2">
          <input
            type="text"
            placeholder="Certificate Name (e.g. AWS Certified Solutions Architect)"
            name="name"
            className="w-full mb-0 other-input text-sm"
            value={name}
            onChange={(e) => handleCertificate(resumeData, setResumeData, "name", e.target.value, index)}
          />
        </div>

        <div>
          <input
            type="text"
            placeholder="Issuing Organization (e.g. Amazon Web Services)"
            name="issuer"
            className="w-full mb-0 other-input text-sm"
            value={issuer}
            onChange={(e) => handleCertificate(resumeData, setResumeData, "issuer", e.target.value, index)}
          />
        </div>

        <div>
          <input
            type="text"
            placeholder="Issue Date / Year (e.g. 2023-08)"
            name="date"
            className="w-full mb-0 other-input text-sm"
            value={date}
            onChange={(e) => handleCertificate(resumeData, setResumeData, "date", e.target.value, index)}
          />
        </div>

        <div>
          <input
            type="text"
            placeholder="Credential ID (optional)"
            name="credentialId"
            className="w-full mb-0 other-input text-sm"
            value={credentialId}
            onChange={(e) => handleCertificate(resumeData, setResumeData, "credentialId", e.target.value, index)}
          />
        </div>

        <div className="relative">
          <input
            type="url"
            placeholder="Verification URL / Link (https://...)"
            name="url"
            className="w-full mb-0 other-input text-sm pr-7"
            value={url}
            onChange={(e) => handleCertificate(resumeData, setResumeData, "url", e.target.value, index)}
          />
          <BsLink45Deg className="absolute right-2.5 top-3 text-blue-400 text-lg pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default TestAndCertificateLine;
