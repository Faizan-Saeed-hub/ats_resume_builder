import React, { useContext } from "react";
import { ResumeContext } from "../../builder";

const Skills = ({ title, skills }) => {
  const { resumeData, setResumeData } = useContext(ResumeContext);

  const handleTitleChange = (e) => {
    const newSkills = [...resumeData.skills];
    const item = newSkills.find((skillType) => skillType.title === title);
    if (item) {
      item.title = e.target.innerText;
      setResumeData({ ...resumeData, skills: newSkills });
    }
  };

  const validSkills = Array.isArray(skills)
    ? skills.filter((s) => typeof s === "string" && s.trim().length > 0)
    : [];

  if (validSkills.length === 0) return null;

  return (
    <div className="mb-1 leading-snug">
      <h2
        className="section-title mb-0.5 border-b border-gray-300 pb-0.5 text-gray-800 editable"
        contentEditable
        suppressContentEditableWarning
        onBlur={handleTitleChange}
      >
        {title}
      </h2>
      <p className="sub-content text-gray-700 leading-snug">{validSkills.join(", ")}</p>
    </div>
  );
};

export default Skills;
