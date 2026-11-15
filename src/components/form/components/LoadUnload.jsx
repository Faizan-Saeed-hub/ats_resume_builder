import {
  FaFileAlt,
  FaPrint,
  FaRedo,
  FaMagic,
  FaCheckCircle,
  FaFileUpload,
  FaUndo,
} from "react-icons/fa";
import { MdPictureAsPdf, MdSpeed } from "react-icons/md";
import React, { useContext, useState } from "react";
import { ResumeContext } from "../../builder";
import AtsScoreModal, { calculateAtsScore } from "../../ats/AtsScoreModal";
import AtsTextModal from "../../ats/AtsTextModal";
import SampleResumeData from "../../utility/SampleResumeData";
import { downloadPdfDirect, exportToPlainText } from "../../utility/exportPdf";
import CvImportModal from "../../import/CvImportModal";

const LoadUnload = () => {
  const {
    resumeData,
    setResumeData,
    undo,
    redo,
    canUndo,
    canRedo,
    resetResumeData,
    isSaving,
  } = useContext(ResumeContext);

  const [isAtsModalOpen, setIsAtsModalOpen] = useState(false);
  const [isAtsTextModalOpen, setIsAtsTextModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const { score } = calculateAtsScore(resumeData);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Direct PDF Download
  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    const cleanName = (resumeData.name || "Resume").trim().replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `${cleanName || "Resume"}_CV.pdf`;
    try {
      await downloadPdfDirect("resume-preview-document", filename, resumeData);
      showToast("Selectable PDF downloaded successfully!");
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Error generating PDF. You can also use the Print button to Save as PDF.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Browser Print: ensures 1-page fit identical to downloaded PDF
  const handlePrint = () => {
    const page = document.getElementById("resume-a4-page");
    if (page) {
      const targetHeight = 1122.5; // A4 height at 96 DPI (297mm)
      const currentHeight = page.scrollHeight || page.offsetHeight;
      if (currentHeight > targetHeight) {
        const scale = Math.max(0.70, Math.min(1, targetHeight / currentHeight));
        document.documentElement.style.setProperty("--print-scale", scale.toFixed(4));
      } else {
        document.documentElement.style.setProperty("--print-scale", "1");
      }
    }
    window.print();
  };

  // Load Sample Data
  const handleLoadSampleData = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Load Sample Data?",
      message:
        "This will replace your current form data with a realistic professional sample resume (Alexander Chen - Cloud Architect). Are you sure you want to proceed?",
      onConfirm: () => {
        setResumeData(SampleResumeData);
        setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: null });
        showToast("Sample resume loaded successfully!");
      },
    });
  };

  // Reset Form to Genuinely Blank State
  const handleResetForm = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Reset Form to Blank State?",
      message:
        "This will permanently clear all personal information, social links, profile photos, summary, experience, education, skills, certifications, and languages. Are you sure you want a clean slate?",
      onConfirm: () => {
        resetResumeData();
        setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: null });
        showToast("Resume reset to completely blank state.");
      },
    });
  };

  // Plain Text Export
  const handleExportText = () => {
    const cleanName = (resumeData.name || "Resume").trim().replace(/[^a-zA-Z0-9_-]/g, "_");
    exportToPlainText(resumeData, `${cleanName || "Resume"}_ATS_Text.txt`);
    showToast("ATS Plain Text file downloaded!");
  };

  // Smart CV Import Handler
  const handleApplyImportedData = (importedData) => {
    setResumeData((prev) => ({
      ...prev,
      ...importedData,
      profilePhotoStyle: prev.profilePhotoStyle || "circle",
      showProfilePhoto:
        importedData.profilePicture ? true : prev.showProfilePhoto !== undefined ? prev.showProfilePhoto : true,
      selectedTemplate: prev.selectedTemplate || "modern-professional",
    }));
    showToast("CV imported & populated successfully!");
  };

  return (
    <div className="mb-4 pb-3 border-b border-blue-400/20">
      {/* Top Bar Status, Undo/Redo & Quick Actions */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {/* Autosave status & Undo/Redo buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-blue-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{isSaving ? "Saving changes..." : "✓ Auto-saved"}</span>
          </div>

          <div className="flex items-center gap-1 ml-2 border-l border-blue-400/20 pl-2">
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              className={`p-1.5 rounded-md text-xs transition-all ${
                canUndo
                  ? "text-blue-100 hover:bg-blue-800/80 active:scale-95 cursor-pointer"
                  : "text-blue-400/40 cursor-not-allowed"
              }`}
              title="Undo (Ctrl+Z)"
            >
              <FaUndo className="text-xs" />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              className={`p-1.5 rounded-md text-xs transition-all ${
                canRedo
                  ? "text-blue-100 hover:bg-blue-800/80 active:scale-95 cursor-pointer"
                  : "text-blue-400/40 cursor-not-allowed"
              }`}
              title="Redo (Ctrl+Y)"
            >
              <FaRedo className="text-xs" />
            </button>
          </div>
        </div>

        {/* ATS Score Button */}
        <button
          type="button"
          onClick={() => setIsAtsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-900/80 hover:bg-blue-800 text-blue-100 border border-blue-400/30 transition-all hover:scale-105 active:scale-95 shadow-sm"
          title="Open ATS Compatibility Analysis"
        >
          <MdSpeed className="text-amber-400 text-sm" />
          <span>ATS Score:</span>
          <span className={score >= 75 ? "text-emerald-400" : score >= 50 ? "text-amber-300" : "text-rose-400"}>
            {score}%
          </span>
        </button>
      </div>

      {/* Main Action Buttons Grid: 6 Essential Actions (Save Data and Load Data removed per requirement) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {/* 1. Load Sample Data */}
        <button
          type="button"
          onClick={handleLoadSampleData}
          className="btn-action bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 group"
          title="Load realistic sample data to test CV templates"
        >
          <FaMagic className="text-xs transition-transform duration-200 group-hover:rotate-12" />
          <span className="truncate">Sample Data</span>
        </button>

        {/* 2. Smart CV Import Button (PDF / DOCX) */}
        <button
          type="button"
          onClick={() => setIsImportModalOpen(true)}
          className="btn-action bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 ring-1 ring-teal-400/50 group"
          title="Import and parse existing CV from PDF or DOCX file"
        >
          <FaFileUpload className="text-xs transition-transform duration-200 group-hover:-translate-y-0.5" />
          <span className="truncate">Import CV</span>
        </button>

        {/* 3. Direct PDF Download Button */}
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={isDownloadingPdf}
          className="btn-download group ring-1 ring-emerald-400/40"
          title="Download resume directly as selectable PDF"
        >
          <MdPictureAsPdf className="text-sm transition-transform duration-200 group-hover:scale-125" />
          <span className="truncate">{isDownloadingPdf ? "Generating..." : "Download PDF"}</span>
        </button>

        {/* 4. Print CV */}
        <button
          type="button"
          onClick={handlePrint}
          className="btn-action bg-[#1E3A8A] hover:bg-[#1e40af] group"
          title="Print CV or Save via browser print dialog"
        >
          <FaPrint className="text-xs transition-transform duration-200 group-hover:scale-110" />
          <span className="truncate">Print</span>
        </button>

        {/* 5. Export Plain Text / ATS Stream */}
        <button
          type="button"
          onClick={() => setIsAtsTextModalOpen(true)}
          className="btn-action bg-slate-700 hover:bg-slate-800 group"
          title="Inspect and copy ATS plain text stream or download .txt file"
        >
          <FaFileAlt className="text-xs transition-transform duration-200 group-hover:scale-110" />
          <span className="truncate">ATS Text</span>
        </button>

        {/* 6. Reset Form */}
        <button
          type="button"
          onClick={handleResetForm}
          className="btn-action bg-rose-950/70 hover:bg-rose-900 border border-rose-500/30 text-rose-200 group"
          title="Clear all fields and reset form to completely blank state"
        >
          <FaRedo className="text-xs transition-transform duration-200 group-hover:-rotate-90" />
          <span className="truncate">Reset</span>
        </button>
      </div>

      {/* Floating Action Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900/95 text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold border border-blue-400/40 backdrop-blur-md transition-all">
          <FaCheckCircle className="text-emerald-400 text-base" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5 border border-gray-200">
            <h3 className="text-base font-bold text-gray-900 mb-2">{confirmDialog.title}</h3>
            <p className="text-xs text-gray-600 mb-5 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: null })}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition-all shadow-md active:scale-95"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ATS Score Modal */}
      <AtsScoreModal
        isOpen={isAtsModalOpen}
        onClose={() => setIsAtsModalOpen(false)}
        resumeData={resumeData}
        setResumeData={setResumeData}
      />

      {/* ATS Text Stream Extraction Modal */}
      <AtsTextModal
        isOpen={isAtsTextModalOpen}
        onClose={() => setIsAtsTextModalOpen(false)}
        resumeData={resumeData}
      />

      {/* Smart CV Import Modal (PDF & DOCX) */}
      <CvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onApplyData={handleApplyImportedData}
      />
    </div>
  );
};

export default LoadUnload;
