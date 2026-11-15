import React, {useContext} from "react";
import {ResumeContext} from "../../../../builder";
import {addEducation} from "../units/addEducation";
import Education from "../components/Education";
import {MdAddCircle} from "react-icons/md";

const Educations = () => {
  const {resumeData, setResumeData} = useContext(ResumeContext);

  return (
    <div id="section-education" className="flex-col-gap-2">
      <h2 className="input-title">Education</h2>
      {resumeData.education.map((education, index) => (
        <Education
          key={index}
          education={education}
          index={index}
        />
      ))}
      <button
        type="button"
        onClick={() => {
          addEducation(resumeData, setResumeData);
        }}
        aria-label="Add Education"
        title="Add Education"
        className="btn-add-section"
      >
        <MdAddCircle className="text-base" />
        <span>Add Education</span>
      </button>
    </div>
  )
}

export default Educations;
