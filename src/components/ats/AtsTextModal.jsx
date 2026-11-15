import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  MdClose,
  MdContentCopy,
  MdCheckCircle,
  MdFileDownload,
  MdDescription,
  MdCheck,
} from "react-icons/md";
import { exportToPlainText } from "../utility/exportPdf";
import { generateAtsPlainText } from "../../utils/atsAnalyzer/plainTextGenerator";

const AtsTextModal = ({ isOpen, onClose, resumeData }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const rawText = generateAtsPlainText(resumeData);
  const wordCount = rawText ? rawText.split(/\s+/).filter(Boolean).length : 0;
  const charCount = rawText ? rawText.length : 0;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn("Clipboard copy failed:", e);
    }
  };

  const handleDownload = () => {
    const cleanName = (resumeData?.name || "Resume").trim().replace(/[^a-zA-Z0-9_-]/g, "_");
    exportToPlainText(resumeData, `${cleanName || "Resume"}_ATS_Text.txt`);
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fadeIn exclude-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-blue-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-[#172554] text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-800/60 text-blue-300">
              <MdDescription className="text-xl" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">ATS Plain Text Stream</h2>
              <p className="text-xs text-blue-200">
                This shows the exact text stream parsed by applicant tracking software and online job portals.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg hover:bg-white/20 transition-all text-white active:scale-95 cursor-pointer"
          >
            <MdClose className="text-xl" />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="px-5 py-3 bg-blue-50/70 border-b border-blue-100 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-700">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-[#172554]">
              Words: <strong className="text-[#2563EB]">{wordCount}</strong>
            </span>
            <span className="font-semibold text-[#172554]">
              Characters: <strong className="text-[#2563EB]">{charCount}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
              <MdCheckCircle className="text-emerald-600" />
              Standard UTF-8 Stream
            </span>
          </div>
        </div>

        {/* Text View Area */}
        <div className="p-5 flex-1 overflow-y-auto">
          {rawText ? (
            <pre className="p-4 bg-gray-900 text-gray-100 rounded-xl font-mono text-xs leading-relaxed whitespace-pre-wrap select-all border border-gray-700 max-h-[50vh] overflow-y-auto">
              {rawText}
            </pre>
          ) : (
            <div className="text-center py-12 text-gray-500 text-xs">
              Resume is currently blank. Populate personal information or click &ldquo;Sample Data&rdquo; to generate an ATS text stream.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
          <span className="text-[11px] text-gray-500 hidden sm:inline">
            Preserves logical reading order without multi-column corruption.
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-gray-200 hover:bg-gray-300 text-gray-800 transition-all active:scale-95 cursor-pointer"
            >
              {copied ? (
                <>
                  <MdCheck className="text-emerald-600 text-sm" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <MdContentCopy className="text-sm" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <MdFileDownload className="text-sm" />
              <span>Download .txt File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null;
};

export default AtsTextModal;
