import React, { useContext } from "react";
import { ResumeContext } from "../../../../builder";
import { BsTrash3 } from "react-icons/bs";

const SocialMedia = ({ item, index }) => {
  const { resumeData, setResumeData } = useContext(ResumeContext);

  const handleFieldChange = (field, value) => {
    setResumeData((prev) => {
      const updated = prev.socialMedia.map((sm, i) => {
        const matches = item.id ? sm.id === item.id : i === index;
        if (!matches) return sm;
        return {
          ...sm,
          [field]: value,
        };
      });
      return { ...prev, socialMedia: updated };
    });
  };

  const handleRemove = () => {
    setResumeData((prev) => {
      const updated = prev.socialMedia.filter((sm, i) => {
        return item.id ? sm.id !== item.id : i !== index;
      });
      return { ...prev, socialMedia: updated };
    });
  };

  return (
    <div className="flex w-full gap-2 items-center">
      <div className="flex-1 flex flex-col gap-1.5">
        <input
          type="text"
          placeholder="Platform Name (e.g. LinkedIn, GitHub, Website)"
          name="socialMedia"
          className="other-input w-full !mb-0"
          value={item.socialMedia || ""}
          onChange={(e) => handleFieldChange("socialMedia", e.target.value)}
        />
        <input
          type="text"
          placeholder="Profile URL or Handle (e.g. linkedin.com/in/alex)"
          name="link"
          className="other-input w-full !mb-0"
          value={item.link || ""}
          onChange={(e) => handleFieldChange("link", e.target.value)}
        />
      </div>
      <button
        type="button"
        onClick={handleRemove}
        aria-label="Remove Social Link"
        title="Remove"
        className="btn-remove h-[84px] w-10 flex items-center justify-center text-base flex-shrink-0"
      >
        <BsTrash3 />
      </button>
    </div>
  );
};

export default SocialMedia;
