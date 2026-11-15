import React from "react";
import DateRange from "../../../../utility/DateRange";
import dynamic from "next/dynamic";
import Droppable from "../../../../utility/Droppable";

const Draggable = dynamic(
  () => import("react-beautiful-dnd").then((mod) => mod.Draggable),
  { ssr: false }
);

const WorkExperience = ({ item, index, density = "normal" }) => {
  const isCompact = density === "compact";

  const achievements =
    typeof item.keyAchievements === "string"
      ? item.keyAchievements
          .split("\n")
          .map((a) => a.trim().replace(/^[•\-\*]\s*/, ""))
          .filter((a) => a.length > 0)
      : [];

  return (
    <Draggable
      key={`${item.company || "exp"}-${index}`}
      draggableId={`WORK_EXPERIENCE-${index}`}
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
          {/* Header row: Company & Date */}
          <div className="flex flex-row justify-between items-baseline leading-tight">
            {item.company && (
              <span className="content i-bold text-gray-900">{item.company}</span>
            )}
            <DateRange
              startYear={item.startYear}
              endYear={item.endYear}
              id={`work-experience-start-end-date-${index}`}
            />
          </div>

          {/* Position */}
          {item.position && (
            <p className="sub-content font-semibold text-blue-700 leading-tight mb-0.5">
              {item.position}
            </p>
          )}

          {/* Optional Short Description */}
          {item.description && item.description.trim().length > 0 && (
            <p className="sub-content text-gray-600 leading-[1.3] mb-0.5 italic">
              {item.description}
            </p>
          )}

          {/* Achievements */}
          {achievements.length > 0 && (
            <Droppable
              droppableId={`WORK_EXPERIENCE_KEY_ACHIEVEMENT-${index}`}
              type="WORK_EXPERIENCE_KEY_ACHIEVEMENT"
            >
              {(provided) => (
                <ul
                  className="list-disc ml-3.5 space-y-0.5 sub-content text-gray-700 leading-snug"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {achievements.map((achievement, subIndex) => (
                    <Draggable
                      key={`${item.company || "exp"}-${index}-${subIndex}`}
                      draggableId={`WORK_EXPERIENCE_KEY_ACHIEVEMENT-${index}-${subIndex}`}
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
};

export default WorkExperience;
