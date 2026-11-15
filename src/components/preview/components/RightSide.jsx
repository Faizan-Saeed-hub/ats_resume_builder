import React from "react";
import WorkExperiences from "./workExperience/ui/WorkExperiences";
import Projects from "./projects/ui/Projects";
import { hasWorkExperience, hasProjects } from "../../utility/contentValidators";

const RightSide = ({ resumeData, density = "normal", colSpan = "col-span-7" }) => {
  const isCompact = density === "compact";
  const sectionSpacing = isCompact ? "space-y-1.5" : "space-y-2";

  const hasWork = hasWorkExperience(resumeData);
  const hasProj = hasProjects(resumeData);

  if (!hasWork && !hasProj) {
    return null;
  }

  return (
    <div className={`${colSpan} ${sectionSpacing}`}>
      {hasWork && <WorkExperiences density={density} />}
      {hasProj && <Projects density={density} />}
    </div>
  );
};

export default RightSide;
