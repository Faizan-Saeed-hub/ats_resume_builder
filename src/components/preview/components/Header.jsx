import React from "react";
import Image from "next/image";
import ContactInfo from "../components/ContactInfo";
import { MdPhone, MdEmail, MdLocationOn } from "react-icons/md";
import { hasContactInfo } from "../../utility/contentValidators";

const Header = ({ resumeData, icons, density = "normal" }) => {
  const photoStyle = resumeData.profilePhotoStyle || "circle";
  const roundedClass =
    photoStyle === "square"
      ? "rounded-none"
      : photoStyle === "rounded"
      ? "rounded-xl"
      : "rounded-full";

  const isCompact = density === "compact";
  const photoSizeClass = isCompact ? "w-14 h-14 sm:w-16 sm:h-16" : "w-16 h-16 sm:w-20 sm:h-20";

  const showPhoto =
    resumeData.showProfilePhoto !== false &&
    resumeData.profilePicture &&
    resumeData.profilePicture.length > 0;

  const validSocialMedia = Array.isArray(resumeData.socialMedia)
    ? resumeData.socialMedia.filter((s) => s && s.link && s.link.trim().length > 0)
    : [];

  return (
    <div className="f-col items-center text-center">
      {showPhoto && (
        <div
          className={`${photoSizeClass} ${roundedClass} overflow-hidden border-2 border-blue-600 mb-1 shadow-sm flex-shrink-0`}
        >
          <Image
            src={resumeData.profilePicture}
            alt="profile"
            width={80}
            height={80}
            className="object-cover h-full w-full"
          />
        </div>
      )}

      {resumeData.name && (
        <h1 className="name text-gray-900 tracking-tight">{resumeData.name}</h1>
      )}
      {resumeData.position && (
        <p className="profession text-blue-700 tracking-normal mt-0.5">
          {resumeData.position}
        </p>
      )}

      {hasContactInfo(resumeData) && (
        <ContactInfo
          mainclass="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 contact text-gray-700 mt-0.5"
          linkclass="inline-flex items-center gap-1 hover:text-blue-700 transition-colors"
          teldata={resumeData.contactInformation}
          emaildata={resumeData.email}
          addressdata={resumeData.address}
          telicon={<MdPhone className="text-blue-600 text-xs" />}
          emailicon={<MdEmail className="text-blue-600 text-xs" />}
          addressicon={<MdLocationOn className="text-blue-600 text-xs" />}
        />
      )}

      {validSocialMedia.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 social-media text-gray-600 mt-0.5">
          {validSocialMedia.map((socialMedia, index) => {
            const cleanUrl = socialMedia.link.startsWith("http")
              ? socialMedia.link
              : `https://${socialMedia.link}`;
            const displayHandle = socialMedia.link.replace(/^https?:\/\//, "");

            return (
              <a
                href={cleanUrl}
                aria-label={socialMedia.socialMedia}
                key={index}
                title={socialMedia.socialMedia}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-blue-700 transition-colors"
              >
                {icons &&
                  icons.map((icon, iconIdx) => {
                    if (icon.name === (socialMedia.socialMedia || "").toLowerCase()) {
                      return (
                        <span key={iconIdx} className="text-xs text-blue-600">
                          {icon.icon}
                        </span>
                      );
                    }
                    return null;
                  })}
                <span>{displayHandle}</span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Header;
