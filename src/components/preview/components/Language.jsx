import React from "react";

const Language = ({ title = "Languages", languages }) => {
  if (!languages || !Array.isArray(languages)) return null;

  const validLanguages = languages.filter(
    (l) => typeof l === "string" && l.trim().length > 0
  );

  if (validLanguages.length === 0) return null;

  return (
    <div className="mb-1 leading-snug">
      <h2 className="section-title mb-0.5 border-b border-gray-300 pb-0.5 text-gray-800">
        {title}
      </h2>
      <p className="sub-content text-gray-700 leading-snug">
        {validLanguages.join(", ")}
      </p>
    </div>
  );
};

export default Language;
