import { MdPictureAsPdf } from "react-icons/md";
import React, { useContext, useState } from "react";
import { ResumeContext } from "../builder";
import { downloadPdfDirect } from "./exportPdf";

const WinPrint = () => {
  const { resumeData } = useContext(ResumeContext);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    const cleanName = (resumeData?.name || "Resume").trim().replace(/[^a-zA-Z0-9_-]/g, "_");
    try {
      await downloadPdfDirect("resume-preview-document", `${cleanName}_CV.pdf`, resumeData);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      aria-label="Download Resume PDF"
      title="Download Resume Directly as PDF"
      disabled={downloading}
      className="exclude-print fixed bottom-5 right-10 font-bold rounded-full bg-[#059669] text-white hover:bg-[#047857] shadow-xl border-2 border-white p-3.5 transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-2xl flex items-center justify-center group cursor-pointer z-30"
      onClick={handleDownload}
    >
      <MdPictureAsPdf className={`w-7 h-7 transition-transform duration-200 ${downloading ? "animate-spin" : "group-hover:scale-110"}`} />
    </button>
  );
};

export default WinPrint;