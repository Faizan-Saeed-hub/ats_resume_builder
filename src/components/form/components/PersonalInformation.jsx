import React, { useContext, useRef, useState } from "react";
import { ResumeContext } from "../../builder";
import { BsTrash3 } from "react-icons/bs";
import { FaCamera, FaSyncAlt } from "react-icons/fa";
import Image from "next/image";

const PersonalInformation = () => {
  const {
    resumeData,
    setResumeData,
    handleProfilePicture,
    removeProfilePicture,
    handleChange,
  } = useContext(ResumeContext);

  const fileInputRef = useRef(null);
  const [uploadError, setUploadError] = useState("");

  const photoStyle = resumeData.profilePhotoStyle || "circle";

  const setPhotoStyle = (style) => {
    setResumeData((prev) => ({ ...prev, profilePhotoStyle: style }));
  };

  const onFileSelected = (e) => {
    setUploadError("");
    const file = e.target.files?.[0];
    if (!file) return;

    const result = handleProfilePicture(file);
    if (!result?.success && result?.error) {
      setUploadError(result.error);
    }

    // Reset input so re-selecting same file triggers change
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleChooseFileClick = () => {
    setUploadError("");
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = () => {
    setUploadError("");
    removeProfilePicture();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div id="section-personal-info" className="flex-col-gap-2">
      <h2 className="input-title">Personal Information</h2>
      <div className="grid-4">
        <input
          id="input-name"
          type="text"
          placeholder="Full Name"
          name="name"
          className="pi"
          value={resumeData.name || ""}
          onChange={handleChange}
        />
        <input
          id="input-position"
          type="text"
          placeholder="Job Title"
          name="position"
          className="pi"
          value={resumeData.position || ""}
          onChange={handleChange}
        />
        <input
          id="input-contactInformation"
          type="text"
          placeholder="Contact Information"
          name="contactInformation"
          className="pi"
          value={resumeData.contactInformation || ""}
          onChange={handleChange}
          minLength="10"
          maxLength="15"
        />
        <input
          id="input-email"
          type="email"
          placeholder="Email"
          name="email"
          className="pi"
          value={resumeData.email || ""}
          onChange={handleChange}
        />
        <input
          id="input-address"
          type="text"
          placeholder="Address"
          name="address"
          className="pi"
          value={resumeData.address || ""}
          onChange={handleChange}
        />

        {/* Custom Styled Profile Image Upload Button */}
        <div className="flex flex-col justify-center">
          {/* Hidden Native File Input */}
          <input
            ref={fileInputRef}
            type="file"
            name="profileImage"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            className="hidden"
            onChange={onFileSelected}
          />

          {!resumeData.profilePicture ? (
            <button
              type="button"
              onClick={handleChooseFileClick}
              className="w-full h-[38px] px-3.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold flex items-center justify-center gap-2 border border-blue-400/30 shadow-sm transition-all active:scale-95 group cursor-pointer"
              title="Upload profile picture (JPG, PNG, or WebP, max 5MB)"
            >
              <FaCamera className="text-xs transition-transform duration-200 group-hover:scale-110" />
              <span>Choose Photo</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-blue-400 flex-shrink-0 bg-white">
                <Image
                  src={resumeData.profilePicture}
                  alt="Profile thumbnail"
                  width={36}
                  height={36}
                  unoptimized
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={handleChooseFileClick}
                className="flex-1 h-[38px] px-2.5 py-1.5 rounded-lg bg-blue-800 hover:bg-blue-700 text-white text-xs font-medium flex items-center justify-center gap-1.5 border border-blue-400/30 transition-all active:scale-95"
                title="Change photo"
              >
                <FaSyncAlt className="text-[10px]" />
                <span>Change</span>
              </button>
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="h-[38px] px-2.5 py-1.5 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-rose-200 text-xs font-medium flex items-center justify-center gap-1 border border-rose-500/30 transition-all active:scale-95"
                title="Remove photo"
              >
                <BsTrash3 className="text-xs" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error Message if Invalid Format or Size */}
      {uploadError && (
        <div className="text-xs text-rose-300 bg-rose-950/60 border border-rose-500/40 px-3 py-1.5 rounded-lg">
          {uploadError}
        </div>
      )}

      {/* Profile Photo Style Controls (Circle / Rounded / Square) */}
      {resumeData.profilePicture && (
        <div className="bg-blue-900/30 p-2.5 rounded-lg border border-blue-400/20 flex flex-wrap items-center justify-between gap-2 mt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-200 font-medium">Photo Style:</span>
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => setPhotoStyle("circle")}
                className={`px-2.5 py-1 text-xs font-medium rounded-l-md border border-blue-400/30 transition-all ${
                  photoStyle === "circle"
                    ? "bg-[#2563EB] text-white"
                    : "bg-blue-950/60 text-blue-200 hover:bg-blue-900"
                }`}
              >
                Circle
              </button>
              <button
                type="button"
                onClick={() => setPhotoStyle("rounded")}
                className={`px-2.5 py-1 text-xs font-medium border-t border-b border-blue-400/30 transition-all ${
                  photoStyle === "rounded"
                    ? "bg-[#2563EB] text-white"
                    : "bg-blue-950/60 text-blue-200 hover:bg-blue-900"
                }`}
              >
                Rounded
              </button>
              <button
                type="button"
                onClick={() => setPhotoStyle("square")}
                className={`px-2.5 py-1 text-xs font-medium rounded-r-md border border-blue-400/30 transition-all ${
                  photoStyle === "square"
                    ? "bg-[#2563EB] text-white"
                    : "bg-blue-950/60 text-blue-200 hover:bg-blue-900"
                }`}
              >
                Square
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalInformation;
