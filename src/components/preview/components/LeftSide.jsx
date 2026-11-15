import React from "react";
import Skills from "../components/Skills";
import DateRange from "../../utility/DateRange";
import Language from "../components/Language";
import Certification from "../components/Certification";
import dynamic from "next/dynamic";
import Droppable from "../../utility/Droppable";

const Draggable = dynamic(
  () => import("react-beautiful-dnd").then((mod) => mod.Draggable),
  { ssr: false }
);

const LeftSide = ({ resumeData, density = "normal", colSpan = "col-span-5" }) => {
  const isCompact = density === "compact";
  const sectionSpacing = isCompact ? "space-y-1.5" : "space-y-2";
  const itemMb = isCompact ? "mb-1" : "mb-1.5";

  // Filter valid education entries
  const validEducation = Array.isArray(resumeData.education)
    ? resumeData.education.filter(
        (item) =>
          (item.degree && item.degree.trim().length > 0) ||
          (item.school && item.school.trim().length > 0)
      )
    : [];

  // Filter valid skill categories
  const validSkills = Array.isArray(resumeData.skills)
    ? resumeData.skills.filter(
        (cat) =>
          Array.isArray(cat.skills) &&
          cat.skills.some((s) => typeof s === "string" && s.trim().length > 0)
      )
    : [];

  return (
    <div className={`${colSpan} ${sectionSpacing}`}>
      {resumeData.summary && resumeData.summary.trim().length > 0 && (
        <div className={itemMb}>
          <h2 className="section-title mb-0.5 border-b border-gray-300 pb-0.5 text-gray-800">
            Summary
          </h2>
          <p className="content break-words leading-relaxed text-gray-700">
            {resumeData.summary}
          </p>
        </div>
      )}

      {validEducation.length > 0 && (
        <div className={itemMb}>
          <h2 className="section-title mb-0.5 border-b border-gray-300 pb-0.5 text-gray-800">
            Education
          </h2>
          {validEducation.map((item, index) => (
            <div key={index} className="mb-1 leading-tight">
              {item.degree && <p className="content i-bold text-gray-900">{item.degree}</p>}
              <div className="flex justify-between items-baseline text-gray-600 sub-content">
                <span className="truncate pr-1">{item.school}</span>
                <DateRange
                  startYear={item.startYear}
                  endYear={item.endYear}
                  id={`education-start-end-date-${index}`}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {validSkills.length > 0 && (
        <Droppable droppableId="skills" type="SKILLS">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className={itemMb}>
              {validSkills.map((skill, index) => (
                <Draggable
                  key={`SKILLS-${index}`}
                  draggableId={`SKILLS-${index}`}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`mb-1 ${
                        snapshot.isDragging
                          ? "outline-dashed outline-2 outline-gray-400 bg-white"
                          : ""
                      }`}
                    >
                      <Skills title={skill.title} skills={skill.skills} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      )}

      <Language title="Languages" languages={resumeData.languages} />
      <Certification
        title="Certifications"
        certifications={resumeData.certifications}
      />
    </div>
  );
};

export default LeftSide;
