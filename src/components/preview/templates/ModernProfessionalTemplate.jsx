import React from "react";
import Header from "../components/Header";
import LeftSide from "../components/LeftSide";
import RightSide from "../components/RightSide";
import dynamic from "next/dynamic";
import { onDragEndHandler } from "../utils/onDragEndHandler";
import {
  hasSummary,
  hasEducation,
  hasSkills,
  hasLanguages,
  hasCertifications,
  hasWorkExperience,
  hasProjects,
} from "../../utility/contentValidators";

const DragDropContext = dynamic(
  () =>
    import("react-beautiful-dnd").then((mod) => {
      return mod.DragDropContext;
    }),
  { ssr: false }
);

const ModernProfessionalTemplate = ({
  resumeData,
  setResumeData,
  icons,
  density = "normal",
}) => {
  const hasLeft =
    hasSummary(resumeData) ||
    hasEducation(resumeData) ||
    hasSkills(resumeData) ||
    hasLanguages(resumeData) ||
    hasCertifications(resumeData);

  const hasRight = hasWorkExperience(resumeData) || hasProjects(resumeData);

  const leftColSpan = !hasRight ? "col-span-12" : "col-span-5";
  const rightColSpan = !hasLeft ? "col-span-12" : "col-span-7";

  return (
    <DragDropContext
      onDragEnd={(result) => onDragEndHandler(result, resumeData, setResumeData)}
    >
      <Header resumeData={resumeData} icons={icons} density={density} />
      {(hasLeft || hasRight) && <div className="border-t border-gray-300 mt-1.5 mb-2" />}
      <div className="grid grid-cols-12 gap-4 sm:gap-5">
        {hasLeft && (
          <LeftSide
            resumeData={resumeData}
            density={density}
            colSpan={leftColSpan}
          />
        )}
        {hasRight && (
          <RightSide
            resumeData={resumeData}
            density={density}
            colSpan={rightColSpan}
          />
        )}
      </div>
    </DragDropContext>
  );
};

export default ModernProfessionalTemplate;
