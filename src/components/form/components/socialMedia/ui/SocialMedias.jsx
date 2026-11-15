import React, { useContext } from "react";
import { ResumeContext } from "../../../../builder";
import SocialMedia from "../components/SocialMedia";
import { MdAddCircle } from "react-icons/md";

const SocialMedias = () => {
  const { resumeData, setResumeData } = useContext(ResumeContext);

  const handleAddSocialLink = () => {
    const newId = `sm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setResumeData((prev) => ({
      ...prev,
      socialMedia: [
        ...(prev.socialMedia || []),
        { id: newId, socialMedia: "", link: "" },
      ],
    }));
  };

  const socialLinks = resumeData.socialMedia || [];

  return (
    <div id="section-social-media" className="flex-col-gap-2">
      <h2 className="input-title">Social Media</h2>
      {socialLinks.map((item, index) => (
        <SocialMedia
          key={item.id || `sm_idx_${index}`}
          item={item}
          index={index}
        />
      ))}
      <button
        type="button"
        onClick={handleAddSocialLink}
        aria-label="Add Social Link"
        title="Add another social profile or website link"
        className="btn-add-section"
      >
        <MdAddCircle className="text-base" />
        <span>Add Social Link</span>
      </button>
    </div>
  );
};

export default SocialMedias;
