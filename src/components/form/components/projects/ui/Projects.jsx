import React, {useContext} from "react";
import {ResumeContext} from "../../../../builder";
import {addProject} from "../utils/addProject";
import Project from "../components/Project";
import {MdAddCircle} from "react-icons/md";

const Projects = () => {
  const {resumeData, setResumeData} = useContext(ResumeContext);

  return (
    <div id="section-projects" className="flex-col-gap-2">
      <h2 className="input-title">Projects</h2>
      {resumeData.projects.map((project, index) => (
        <Project
          key={index}
          project={project}
          index={index}
        />
      ))}
      <button
        type="button"
        onClick={() => {
          addProject(resumeData, setResumeData);
        }}
        aria-label="Add Project"
        title="Add Project"
        className="btn-add-section"
      >
        <MdAddCircle className="text-base" />
        <span>Add Project</span>
      </button>
    </div>
  );
};

export default Projects;
