/* eslint-disable react/jsx-no-undef */
import {FaFacebook, FaGithub, FaInstagram, FaLinkedin, FaTwitter, FaYoutube, FaTelegramPlane,} from "react-icons/fa";
import {CgWebsite} from "react-icons/cg";
import React, {useContext} from "react";
import {ResumeContext} from "../../builder";
import ModalHighlightMenu from "../components/ModalHighlightMenu";
import A4PageWrapper from "../components/A4PageWrapper";
import TemplateSelector from "../templates/TemplateSelector";
import ModernProfessionalTemplate from "../templates/ModernProfessionalTemplate";
import MinimalAtsTemplate from "../templates/MinimalAtsTemplate";
import CorporateExecutiveTemplate from "../templates/CorporateExecutiveTemplate";
import CreativeModernTemplate from "../templates/CreativeModernTemplate";
import { getContentDensity } from "../../utility/getContentDensity";

const Preview = () => {
  const {resumeData, setResumeData} = useContext(ResumeContext);
  const icons = [
    {name: "github", icon: <FaGithub/>},
    {name: "linkedin", icon: <FaLinkedin/>},
    {name: "twitter", icon: <FaTwitter/>},
    {name: "facebook", icon: <FaFacebook/>},
    {name: "instagram", icon: <FaInstagram/>},
    {name: "youtube", icon: <FaYoutube/>},
    {name: "telegram", icon: <FaTelegramPlane/>},
    {name: "website", icon: <CgWebsite/>},
  ];

  const template = resumeData.selectedTemplate || "modern-professional";
  const density = getContentDensity(resumeData);

  const handleSelectTemplate = (templateId) => {
    setResumeData({ ...resumeData, selectedTemplate: templateId });
  };

  return (
    <div className="w-full h-full preview rm-padding-print p-4 md:p-6 overflow-y-auto flex flex-col items-center">
      <div className="w-full max-w-[850px] flex flex-col items-center">
        <TemplateSelector
          selectedTemplate={template}
          onSelectTemplate={handleSelectTemplate}
        />

        <div id="resume-preview-document" className="w-full flex justify-center">
          <A4PageWrapper density={density}>
            <ModalHighlightMenu/>

            {template === "minimal-ats" && (
              <MinimalAtsTemplate resumeData={resumeData} density={density} />
            )}

            {template === "corporate-executive" && (
              <CorporateExecutiveTemplate resumeData={resumeData} density={density} />
            )}

            {template === "creative-modern" && (
              <CreativeModernTemplate resumeData={resumeData} density={density} />
            )}

            {(template === "modern-professional" || !["minimal-ats", "corporate-executive", "creative-modern"].includes(template)) && (
              <ModernProfessionalTemplate
                resumeData={resumeData}
                setResumeData={setResumeData}
                icons={icons}
                density={density}
              />
            )}
          </A4PageWrapper>
        </div>
      </div>
    </div>
  );
};

export default Preview;
