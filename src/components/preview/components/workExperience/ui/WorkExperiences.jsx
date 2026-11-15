import React, { useContext } from "react";
import { ResumeContext } from "../../../../builder";
import WorkExperience from "../components/WorkExperience";
import Droppable from "../../../../utility/Droppable";

const WorkExperiences = ({ density = "normal" }) => {
  const { resumeData } = useContext(ResumeContext);

  const validWork = Array.isArray(resumeData.workExperience)
    ? resumeData.workExperience.filter(
        (item) =>
          (item.company && item.company.trim().length > 0) ||
          (item.position && item.position.trim().length > 0) ||
          (item.description && item.description.trim().length > 0) ||
          (item.keyAchievements && item.keyAchievements.trim().length > 0)
      )
    : [];

  if (validWork.length === 0) return null;

  return (
    <Droppable droppableId="work-experience" type="WORK_EXPERIENCE">
      {(provided) => (
        <div {...provided.droppableProps} ref={provided.innerRef}>
          <h2
            className="section-title mb-0.5 border-b border-gray-300 pb-0.5 text-gray-800 editable"
            contentEditable
            suppressContentEditableWarning
          >
            Work Experience
          </h2>
          {validWork.map((item, index) => (
            <WorkExperience
              key={index}
              item={item}
              index={index}
              density={density}
            />
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default WorkExperiences;
