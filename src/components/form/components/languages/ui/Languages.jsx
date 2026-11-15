import React, {useContext} from "react";
import {ResumeContext} from "../../../../builder";
import {addLanguage} from "../utils/addLanguage";
import LanguageLine from "../components/LanguageLine";
import {MdAddCircle} from "react-icons/md";

const Languages = () => {
  const {resumeData, setResumeData} = useContext(ResumeContext);
  // TODO replace hardcoded variables

  return (
    <div id="section-languages" className="flex-col-gap-2">
      <h2 className="input-title">Languages</h2>
      {resumeData["languages"].map((lang, index) => (
        <LanguageLine
          key={index}
          lang={lang}
          resumeData={resumeData}
          setResumeData={setResumeData}
          index={index}
        />
      ))}
      <button
        type="button"
        onClick={() => {
          addLanguage(resumeData, setResumeData, "languages");
        }}
        aria-label="Add Language"
        title="Add Language"
        className="btn-add-section"
      >
        <MdAddCircle className="text-base" />
        <span>Add Language</span>
      </button>
    </div>
  );
};

export default Languages;
