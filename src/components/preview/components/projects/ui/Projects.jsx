import React, { useContext } from "react";
import DateRange from "../../../../utility/DateRange";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ResumeContext } from "../../../../builder";
import Droppable from "../../../../utility/Droppable";

const Draggable = dynamic(
  () => import("react-beautiful-dnd").then((mod) => mod.Draggable),
  { ssr: false }
);

const Projects = ({ density = "normal" }) => {
  const { resumeData } = useContext(ResumeContext);
  const isCompact = density === "compact";

  const validProjects = Array.isArray(resumeData.projects)
    ? resumeData.projects.filter(
        (item) =>
          (item.name && item.name.trim().length > 0) ||
          (item.description && item.description.trim().length > 0) ||
          (item.link && item.link.trim().length > 0) ||
          (item.keyAchievements && item.keyAchievements.trim().length > 0)
      )
    : [];

  if (validProjects.length === 0) return null;

  return (
    <Droppable droppableId="projects" type="PROJECTS">
      {(provided) => (
        <div {...provided.droppableProps} ref={provided.innerRef}>
          <h2
            className="section-title mb-0.5 border-b border-gray-300 pb-0.5 text-gray-800 editable"
            contentEditable
            suppressContentEditableWarning
          >
            Projects
          </h2>
          {validProjects.map((item, index) => {
            const achievements =
              typeof item.keyAchievements === "string"
                ? item.keyAchievements
                    .split("\n")
                    .map((a) => a.trim().replace(/^[•\-\*]\s*/, ""))
                    .filter((a) => a.length > 0)
                : [];

            return (
              <Draggable
                key={`${item.name || "proj"}-${index}`}
                draggableId={`PROJECTS-${index}`}
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`${isCompact ? "mb-1.5" : "mb-2"} ${
                      snapshot.isDragging
                        ? "outline-dashed outline-2 outline-gray-400 bg-white"
                        : ""
                    }`}
                  >
                    <div className="flex flex-row justify-between items-baseline leading-tight">
                      {item.name && (
                        <span className="content i-bold text-gray-900">{item.name}</span>
                      )}
                      <DateRange
                        startYear={item.startYear}
                        endYear={item.endYear}
                        id={`projects-start-end-date-${index}`}
                      />
                    </div>

                    {item.link && item.link.trim().length > 0 && (
                      <Link
                        href={item.link.startsWith("http") ? item.link : `https://${item.link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sub-content text-blue-700 hover:underline block leading-tight mb-0.5 truncate"
                      >
                        {item.link.replace(/^https?:\/\//, "")}
                      </Link>
                    )}

                    {item.description && item.description.trim().length > 0 && (
                      <p className="sub-content text-gray-600 leading-[1.3] mb-0.5 italic">
                        {item.description}
                      </p>
                    )}

                    {achievements.length > 0 && (
                      <Droppable
                        droppableId={`PROJECTS_KEY_ACHIEVEMENT-${index}`}
                        type="PROJECTS_KEY_ACHIEVEMENT"
                      >
                        {(provided) => (
                          <ul
                            className="list-disc ml-3.5 space-y-0.5 sub-content text-gray-700 leading-snug"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                          >
                            {achievements.map((achievement, subIndex) => (
                              <Draggable
                                key={`${item.name || "proj"}-${index}-${subIndex}`}
                                draggableId={`PROJECTS_KEY_ACHIEVEMENT-${index}-${subIndex}`}
                                index={subIndex}
                              >
                                {(provided, snapshot) => (
                                  <li
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={
                                      snapshot.isDragging
                                        ? "outline-dashed outline-2 outline-gray-400 bg-white"
                                        : ""
                                    }
                                  >
                                    <div
                                      dangerouslySetInnerHTML={{
                                        __html: achievement,
                                      }}
                                      contentEditable
                                      suppressContentEditableWarning
                                    />
                                  </li>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </ul>
                        )}
                      </Droppable>
                    )}
                  </div>
                )}
              </Draggable>
            );
          })}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default Projects;
