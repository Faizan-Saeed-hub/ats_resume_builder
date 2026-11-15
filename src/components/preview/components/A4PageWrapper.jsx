import React from "react";

const A4PageWrapper = ({ children, density = "normal" }) => {
  const paddingClass =
    density === "compact"
      ? "p-4 sm:px-6 sm:py-5"
      : density === "spacious"
      ? "p-6 sm:px-9 sm:py-8"
      : "p-5 sm:px-7 sm:py-6";

  return (
    <div
      id="resume-a4-page"
      className={`w-full max-w-[794px] md:w-[794px] min-h-[1123px] bg-white ${paddingClass} shadow-xl rounded-sm border border-gray-200/80 my-2 print:my-0 print:shadow-none print:border-none print:w-[210mm] print:max-w-[210mm] print:min-h-[297mm] transition-all duration-200 relative cv-${density}`}
    >
      {children}
    </div>
  );
};

export default A4PageWrapper;
