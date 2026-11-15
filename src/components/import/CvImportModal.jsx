import React, { useState, useRef, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FaCloudUploadAlt,
  FaFilePdf,
  FaFileWord,
  FaFileImage,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes,
  FaTrash,
  FaPlus,
  FaCopy,
  FaUser,
  FaBriefcase,
  FaGraduationCap,
  FaTools,
  FaAward,
  FaGlobe,
  FaFolder,
  FaShareAlt,
} from "react-icons/fa";
import { parseCvFile } from "../../utils/cvParser";

const CvImportModal = ({ isOpen, onClose, onApplyData }) => {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState("upload"); // "upload" | "processing" | "review"
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState({ stage: "", percent: 0, message: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [extractedData, setExtractedData] = useState(null);
  const [reviewTab, setReviewTab] = useState("personal");
  const [confirmApply, setConfirmApply] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // New skill input state per category
  const [newSkillText, setNewSkillText] = useState({});

  const fileInputRef = useRef(null);

  // Dynamic live count calculations
  const liveStats = useMemo(() => {
    const d = extractedData?.mappedData || {};
    const totalSkills = Array.isArray(d.skills)
      ? d.skills.reduce((acc, cat) => acc + (cat.skills || []).length, 0)
      : 0;

    return {
      name: d.name || "None",
      experienceCount: d.workExperience?.length || 0,
      educationCount: d.education?.length || 0,
      skillsCount: totalSkills,
      certificationsCount: d.certifications?.length || 0,
      languagesCount: d.languages?.length || 0,
      socialCount: d.socialMedia?.length || 0,
      unrecognizedCount: extractedData?.unrecognizedLines?.length || 0,
    };
  }, [extractedData]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  // Handle Drag & Drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  // Process Document
  const processSelectedFile = async (file) => {
    setErrorMessage("");
    setSelectedFile(file);
    setStep("processing");

    try {
      const result = await parseCvFile(file, (p) => {
        setProgress(p);
      });

      // Ensure all social links have unique ids
      if (result?.mappedData?.socialMedia) {
        result.mappedData.socialMedia = result.mappedData.socialMedia.map((s, idx) => ({
          ...s,
          id: s.id || `sm_${Date.now()}_${idx}`,
        }));
      }

      setExtractedData(result);
      setStep("review");
    } catch (err) {
      console.error("CV parsing error:", err);
      setErrorMessage(
        err.message || "Failed to process document. Please check the file and try again."
      );
      setStep("upload");
    }
  };

  // Reset Modal
  const handleReset = () => {
    setStep("upload");
    setSelectedFile(null);
    setProgress({ stage: "", percent: 0, message: "" });
    setErrorMessage("");
    setExtractedData(null);
    setReviewTab("personal");
    setConfirmApply(false);
    setNewSkillText({});
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Close Modal
  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Field Edit Handlers for Review State (Centralized single source of truth)
  const updatePersonalInfo = (field, value) => {
    setExtractedData((prev) => ({
      ...prev,
      mappedData: {
        ...prev.mappedData,
        [field]: value,
      },
    }));
  };

  const updateSummary = (value) => {
    setExtractedData((prev) => ({
      ...prev,
      mappedData: {
        ...prev.mappedData,
        summary: value,
      },
    }));
  };

  // Experience handlers
  const updateExperience = (index, field, value) => {
    setExtractedData((prev) => {
      const updated = [...prev.mappedData.workExperience];
      updated[index] = { ...updated[index], [field]: value };
      return {
        ...prev,
        mappedData: { ...prev.mappedData, workExperience: updated },
      };
    });
  };

  const removeExperience = (index) => {
    setExtractedData((prev) => ({
      ...prev,
      mappedData: {
        ...prev.mappedData,
        workExperience: prev.mappedData.workExperience.filter((_, i) => i !== index),
      },
    }));
  };

  const addExperience = () => {
    setExtractedData((prev) => ({
      ...prev,
      mappedData: {
        ...prev.mappedData,
        workExperience: [
          ...prev.mappedData.workExperience,
          {
            company: "",
            position: "",
            startYear: "",
            endYear: "",
            description: "",
            keyAchievements: "",
          },
        ],
      },
    }));
  };

  // Education handlers
  const updateEducation = (index, field, value) => {
    setExtractedData((prev) => {
      const updated = [...prev.mappedData.education];
      updated[index] = { ...updated[index], [field]: value };
      return {
        ...prev,
        mappedData: { ...prev.mappedData, education: updated },
      };
    });
  };

  const removeEducation = (index) => {
    setExtractedData((prev) => ({
      ...prev,
      mappedData: {
        ...prev.mappedData,
        education: prev.mappedData.education.filter((_, i) => i !== index),
      },
    }));
  };

  const addEducation = () => {
    setExtractedData((prev) => ({
      ...prev,
      mappedData: {
        ...prev.mappedData,
        education: [
          ...prev.mappedData.education,
          { school: "", degree: "", startYear: "", endYear: "" },
        ],
      },
    }));
  };

  // Skills handlers with duplicate prevention
  const removeSkill = (catTitle, skillIndex) => {
    setExtractedData((prev) => {
      const updated = prev.mappedData.skills.map((cat) => {
        if (cat.title === catTitle) {
          return {
            ...cat,
            skills: cat.skills.filter((_, idx) => idx !== skillIndex),
          };
        }
        return cat;
      });
      return {
        ...prev,
        mappedData: { ...prev.mappedData, skills: updated },
      };
    });
  };

  const addSkillToCategory = (catTitle) => {
    const text = (newSkillText[catTitle] || "").trim();
    if (!text) return;

    setExtractedData((prev) => {
      const updated = prev.mappedData.skills.map((cat) => {
        if (cat.title === catTitle) {
          // Duplicate prevention (case-insensitive)
          const lowerExisting = (cat.skills || []).map((s) => s.toLowerCase());
          if (lowerExisting.includes(text.toLowerCase())) {
            return cat;
          }
          return {
            ...cat,
            skills: [...(cat.skills || []), text],
          };
        }
        return cat;
      });
      return {
        ...prev,
        mappedData: { ...prev.mappedData, skills: updated },
      };
    });

    setNewSkillText((prev) => ({ ...prev, [catTitle]: "" }));
  };

  // Certifications handlers
  const updateCertification = (index, field, value) => {
    setExtractedData((prev) => {
      const updated = [...prev.mappedData.certifications];
      const cert = typeof updated[index] === "object" ? updated[index] : { name: updated[index] };
      updated[index] = { ...cert, [field]: value };
      return {
        ...prev,
        mappedData: { ...prev.mappedData, certifications: updated },
      };
    });
  };

  const removeCertification = (index) => {
    setExtractedData((prev) => ({
      ...prev,
      mappedData: {
        ...prev.mappedData,
        certifications: prev.mappedData.certifications.filter((_, i) => i !== index),
      },
    }));
  };

  const addCertification = () => {
    setExtractedData((prev) => ({
      ...prev,
      mappedData: {
        ...prev.mappedData,
        certifications: [
          ...prev.mappedData.certifications,
          { name: "", issuer: "", date: "", credentialId: "", url: "" },
        ],
      },
    }));
  };

  // Social Media handlers
  const updateSocialMedia = (idOrIndex, field, value) => {
    setExtractedData((prev) => {
      const updated = (prev.mappedData.socialMedia || []).map((sm, idx) => {
        const matches = sm.id ? sm.id === idOrIndex : idx === idOrIndex;
        if (!matches) return sm;
        return { ...sm, [field]: value };
      });
      return {
        ...prev,
        mappedData: { ...prev.mappedData, socialMedia: updated },
      };
    });
  };

  const removeSocialMedia = (idOrIndex) => {
    setExtractedData((prev) => ({
      ...prev,
      mappedData: {
        ...prev.mappedData,
        socialMedia: (prev.mappedData.socialMedia || []).filter((sm, idx) => {
          return sm.id ? sm.id !== idOrIndex : idx !== idOrIndex;
        }),
      },
    }));
  };

  const addSocialMedia = () => {
    const newId = `sm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setExtractedData((prev) => ({
      ...prev,
      mappedData: {
        ...prev.mappedData,
        socialMedia: [
          ...(prev.mappedData.socialMedia || []),
          { id: newId, socialMedia: "", link: "" },
        ],
      },
    }));
  };

  // Languages handlers
  const removeLanguage = (index) => {
    setExtractedData((prev) => ({
      ...prev,
      mappedData: {
        ...prev.mappedData,
        languages: prev.mappedData.languages.filter((_, i) => i !== index),
      },
    }));
  };

  const addLanguage = (lang) => {
    const text = (lang || "").trim();
    if (!text) return;
    setExtractedData((prev) => {
      const current = prev.mappedData.languages || [];
      if (current.some((l) => l.toLowerCase() === text.toLowerCase())) {
        return prev;
      }
      return {
        ...prev,
        mappedData: { ...prev.mappedData, languages: [...current, text] },
      };
    });
  };

  // Copy unrecognized line
  const handleCopyLine = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  // Apply to Builder
  const handleApply = () => {
    if (!extractedData?.mappedData) return;
    onApplyData(extractedData.mappedData);
    handleClose();
  };

  const data = extractedData?.mappedData || {};

  return createPortal(
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md animate-fadeIn"
    >
      {/* Stable, Centered, Fixed-Height Modal Container (Prevents Jumping & Movement) */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[88vh] max-h-[850px] flex flex-col overflow-hidden border border-gray-200">
        {/* Fixed Header */}
        <div className="flex-shrink-0 bg-[#172554] text-white px-6 py-4 flex items-center justify-between border-b border-blue-900/50">
          <div className="flex items-center gap-2.5">
            <FaCloudUploadAlt className="text-2xl text-blue-400" />
            <div>
              <h2 className="text-lg font-bold tracking-tight">Smart CV Import & Extraction</h2>
              <p className="text-xs text-blue-200">
                {step === "review"
                  ? "Review, verify, and edit extracted details before applying"
                  : "Upload any existing CV in PDF, DOCX, or Image format"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-blue-200 hover:text-white p-1.5 rounded-lg hover:bg-blue-800/60 transition-all cursor-pointer"
            title="Close"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* STEP 1: UPLOAD SCREEN */}
        {step === "upload" && (
          <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-slate-50/50 space-y-5">
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2.5">
                <FaExclamationTriangle className="text-rose-500 text-base flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                dragActive
                  ? "border-blue-500 bg-blue-50/80 scale-[1.01]"
                  : "border-gray-300 hover:border-blue-400 bg-white hover:bg-blue-50/20"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.jpg,.jpeg,.png,.webp,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
                <FaCloudUploadAlt className="text-3xl" />
              </div>

              <h3 className="text-base font-bold text-gray-800 mb-1">
                Drag and drop your CV here, or <span className="text-blue-600 underline">browse</span>
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Supports Adobe PDF (.pdf), Microsoft Word (.docx), and Images (.jpg, .png, .webp) up to 15MB.
              </p>

              <div className="inline-flex items-center gap-3 text-xs font-semibold text-gray-600 bg-gray-100 px-4 py-2 rounded-xl flex-wrap justify-center">
                <span className="flex items-center gap-1.5 text-rose-600">
                  <FaFilePdf /> PDF
                </span>
                <span className="text-gray-300">|</span>
                <span className="flex items-center gap-1.5 text-blue-600">
                  <FaFileWord /> DOCX
                </span>
                <span className="text-gray-300">|</span>
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <FaFileImage /> JPG / PNG / WebP
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500">100% Client-Side Processing</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                <FaCheckCircle className="text-emerald-600 text-sm" />
                <span>Strict No-Fabrication Guarantee</span>
              </div>
              <p className="text-emerald-800/90 text-[11.5px]">
                Only real text found in your document will be mapped. The builder will never invent job histories, assume degrees, or generate sample placeholders. Empty fields remain empty, and missing sections are automatically hidden.
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: PROCESSING STATE */}
        {step === "processing" && (
          <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-8 text-center space-y-6 bg-slate-50/50">
            <div className="w-20 h-20 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto"></div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Processing Document</h3>
              <p className="text-xs text-gray-500 mb-4">{selectedFile?.name}</p>
              <div className="max-w-md mx-auto w-72 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percent}%` }}
                ></div>
              </div>
              <p className="text-xs font-semibold text-blue-600 mt-3">{progress.message}</p>
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW & EDIT SCREEN */}
        {step === "review" && (
          <>
            {/* Fixed Live Dynamic Summary Stats Badges */}
            <div className="flex-shrink-0 px-6 pt-3.5 pb-2.5 bg-white border-b border-gray-100">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-2 rounded-xl border border-gray-200">
                  <span className="block text-gray-500 text-[10px] uppercase font-bold">Contact</span>
                  <span className="font-bold text-blue-600 truncate block">{liveStats.name}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-gray-200">
                  <span className="block text-gray-500 text-[10px] uppercase font-bold">Experience</span>
                  <span className="font-bold text-blue-600">{liveStats.experienceCount} entries</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-gray-200">
                  <span className="block text-gray-500 text-[10px] uppercase font-bold">Education</span>
                  <span className="font-bold text-blue-600">{liveStats.educationCount} degrees</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-gray-200">
                  <span className="block text-gray-500 text-[10px] uppercase font-bold">Skills</span>
                  <span className="font-bold text-blue-600">{liveStats.skillsCount} skills</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-gray-200">
                  <span className="block text-gray-500 text-[10px] uppercase font-bold">Certifications</span>
                  <span className="font-bold text-blue-600">{liveStats.certificationsCount} certs</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-gray-200">
                  <span className="block text-gray-500 text-[10px] uppercase font-bold">Languages</span>
                  <span className="font-bold text-blue-600">{liveStats.languagesCount} items</span>
                </div>
              </div>
            </div>

            {/* Fixed Navigation Tabs Bar */}
            <div className="flex-shrink-0 px-6 py-2 bg-slate-50 border-b border-gray-200 overflow-x-auto flex gap-1.5">
              {[
                { id: "personal", label: "Personal", icon: <FaUser /> },
                { id: "summary", label: "Summary", icon: <FaFolder /> },
                { id: "experience", label: `Experience (${liveStats.experienceCount})`, icon: <FaBriefcase /> },
                { id: "education", label: `Education (${liveStats.educationCount})`, icon: <FaGraduationCap /> },
                { id: "skills", label: `Skills (${liveStats.skillsCount})`, icon: <FaTools /> },
                { id: "certifications", label: `Certifications (${liveStats.certificationsCount})`, icon: <FaAward /> },
                { id: "languages", label: `Languages (${liveStats.languagesCount})`, icon: <FaGlobe /> },
                { id: "social", label: `Social Links (${liveStats.socialCount})`, icon: <FaShareAlt /> },
                { id: "unmapped", label: `Unrecognized (${liveStats.unrecognizedCount})`, icon: <FaCopy /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setReviewTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    reviewTab === tab.id
                      ? "bg-[#2563EB] text-white shadow"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Scrollable Content Body - Only this section scrolls, modal never jumps! */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-slate-50/50 space-y-4">
              {/* TAB: PERSONAL */}
              {reviewTab === "personal" && (
                <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Personal Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-600 block mb-1">Full Name</label>
                      <input
                        type="text"
                        value={data.name || ""}
                        onChange={(e) => updatePersonalInfo("name", e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full text-xs p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-600 block mb-1">Professional Title</label>
                      <input
                        type="text"
                        value={data.position || ""}
                        onChange={(e) => updatePersonalInfo("position", e.target.value)}
                        placeholder="e.g. Senior Software Engineer"
                        className="w-full text-xs p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-600 block mb-1">Email Address</label>
                      <input
                        type="email"
                        value={data.email || ""}
                        onChange={(e) => updatePersonalInfo("email", e.target.value)}
                        placeholder="e.g. john@example.com"
                        className="w-full text-xs p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-600 block mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={data.contactInformation || ""}
                        onChange={(e) => updatePersonalInfo("contactInformation", e.target.value)}
                        placeholder="e.g. +1 (555) 123-4567"
                        className="w-full text-xs p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-semibold text-gray-600 block mb-1">Location / Address</label>
                      <input
                        type="text"
                        value={data.address || ""}
                        onChange={(e) => updatePersonalInfo("address", e.target.value)}
                        placeholder="e.g. San Francisco, CA"
                        className="w-full text-xs p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: SUMMARY */}
              {reviewTab === "summary" && (
                <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Professional Summary</h4>
                    <span className="text-[11px] text-gray-500">{data.summary?.length || 0} characters</span>
                  </div>
                  <textarea
                    rows={6}
                    value={data.summary || ""}
                    onChange={(e) => updateSummary(e.target.value)}
                    placeholder="Enter professional summary..."
                    className="w-full text-xs p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 leading-relaxed"
                  />
                </div>
              )}

              {/* TAB: EXPERIENCE */}
              {reviewTab === "experience" && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Work Experience</h4>
                    <button
                      type="button"
                      onClick={addExperience}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      <FaPlus className="text-[10px]" /> Add Experience
                    </button>
                  </div>

                  {data.workExperience?.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-xl border border-gray-200 text-gray-500 text-xs">
                      No work experience detected. Click &quot;+ Add Experience&quot; if you wish to add one.
                    </div>
                  ) : (
                    data.workExperience?.map((exp, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-2.5 relative">
                        <div className="flex justify-between items-start">
                          <span className="text-[11px] font-bold text-blue-600 uppercase">Entry #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeExperience(idx)}
                            className="text-gray-400 hover:text-rose-600 p-1 transition-colors"
                            title="Delete"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="text-[10px] font-semibold text-gray-600 block mb-0.5">Job Title</label>
                            <input
                              type="text"
                              value={exp.position || ""}
                              onChange={(e) => updateExperience(idx, "position", e.target.value)}
                              placeholder="Position"
                              className="w-full text-xs p-1.5 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-gray-600 block mb-0.5">Company</label>
                            <input
                              type="text"
                              value={exp.company || ""}
                              onChange={(e) => updateExperience(idx, "company", e.target.value)}
                              placeholder="Company Name"
                              className="w-full text-xs p-1.5 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-gray-600 block mb-0.5">Start Date</label>
                            <input
                              type="text"
                              value={exp.startYear || ""}
                              onChange={(e) => updateExperience(idx, "startYear", e.target.value)}
                              placeholder="e.g. 2021"
                              className="w-full text-xs p-1.5 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-gray-600 block mb-0.5">End Date</label>
                            <input
                              type="text"
                              value={exp.endYear || ""}
                              onChange={(e) => updateExperience(idx, "endYear", e.target.value)}
                              placeholder="e.g. Present"
                              className="w-full text-xs p-1.5 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-gray-600 block mb-0.5">
                            Key Achievements / Bullets (One per line)
                          </label>
                          <textarea
                            rows={3}
                            value={exp.keyAchievements || ""}
                            onChange={(e) => updateExperience(idx, "keyAchievements", e.target.value)}
                            placeholder="Key responsibilities and achievements..."
                            className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB: EDUCATION */}
              {reviewTab === "education" && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Education</h4>
                    <button
                      type="button"
                      onClick={addEducation}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      <FaPlus className="text-[10px]" /> Add Education
                    </button>
                  </div>

                  {data.education?.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-xl border border-gray-200 text-gray-500 text-xs">
                      No education records detected. Click &quot;+ Add Education&quot; if you wish to add one.
                    </div>
                  ) : (
                    data.education?.map((edu, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-2 relative">
                        <div className="flex justify-between items-start">
                          <span className="text-[11px] font-bold text-blue-600 uppercase">Degree #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeEducation(idx)}
                            className="text-gray-400 hover:text-rose-600 p-1 transition-colors"
                            title="Delete"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="text-[10px] font-semibold text-gray-600 block mb-0.5">Degree / Certificate</label>
                            <input
                              type="text"
                              value={edu.degree || ""}
                              onChange={(e) => updateEducation(idx, "degree", e.target.value)}
                              placeholder="e.g. B.S. in Computer Science"
                              className="w-full text-xs p-1.5 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-gray-600 block mb-0.5">Institution / University</label>
                            <input
                              type="text"
                              value={edu.school || ""}
                              onChange={(e) => updateEducation(idx, "school", e.target.value)}
                              placeholder="e.g. Stanford University"
                              className="w-full text-xs p-1.5 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-gray-600 block mb-0.5">Start Year</label>
                            <input
                              type="text"
                              value={edu.startYear || ""}
                              onChange={(e) => updateEducation(idx, "startYear", e.target.value)}
                              placeholder="e.g. 2016"
                              className="w-full text-xs p-1.5 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-gray-600 block mb-0.5">Graduation Year</label>
                            <input
                              type="text"
                              value={edu.endYear || ""}
                              onChange={(e) => updateEducation(idx, "endYear", e.target.value)}
                              placeholder="e.g. 2020"
                              className="w-full text-xs p-1.5 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB: SKILLS */}
              {reviewTab === "skills" && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Skills by Category</h4>
                  {data.skills?.map((cat, catIdx) => (
                    <div key={catIdx} className="bg-white p-4 rounded-xl border border-gray-200 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-800">{cat.title}</span>
                        <span className="text-[11px] text-gray-500">{(cat.skills || []).length} items</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 p-2.5 bg-gray-50 rounded-lg min-h-[42px] border border-gray-200">
                        {(cat.skills || []).length === 0 ? (
                          <span className="text-xs text-gray-400 italic">No skills in this category yet.</span>
                        ) : (
                          cat.skills.map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-white text-gray-800 border border-gray-300 shadow-sm"
                            >
                              <span>{skill}</span>
                              <button
                                type="button"
                                onClick={() => removeSkill(cat.title, sIdx)}
                                className="text-gray-400 hover:text-rose-600 ml-1 text-[10px]"
                                title="Remove"
                              >
                                &times;
                              </button>
                            </span>
                          ))
                        )}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newSkillText[cat.title] || ""}
                          onChange={(e) =>
                            setNewSkillText({ ...newSkillText, [cat.title]: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addSkillToCategory(cat.title);
                            }
                          }}
                          placeholder={`Add a skill to ${cat.title}...`}
                          className="flex-1 text-xs p-1.5 border border-gray-300 rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => addSkillToCategory(cat.title)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB: CERTIFICATIONS */}
              {reviewTab === "certifications" && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Licenses & Certifications</h4>
                    <button
                      type="button"
                      onClick={addCertification}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      <FaPlus className="text-[10px]" /> Add Certification
                    </button>
                  </div>

                  {data.certifications?.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-xl border border-gray-200 text-gray-500 text-xs">
                      No certifications detected in uploaded file. Click &quot;+ Add Certification&quot; to add one.
                    </div>
                  ) : (
                    data.certifications?.map((c, idx) => {
                      const isObj = typeof c === "object" && c !== null;
                      const name = isObj ? c.name : c;
                      const issuer = isObj ? c.issuer : "";
                      const date = isObj ? c.date : "";
                      const url = isObj ? c.url : "";
                      const credentialId = isObj ? c.credentialId : "";

                      return (
                        <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-2 relative">
                          <div className="flex justify-between items-start">
                            <span className="text-[11px] font-bold text-blue-600 uppercase">Certification #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeCertification(idx)}
                              className="text-gray-400 hover:text-rose-600 p-1 transition-colors"
                              title="Delete"
                            >
                              <FaTrash className="text-xs" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="text-[10px] font-semibold text-gray-600 block mb-0.5">Certification Name</label>
                              <input
                                type="text"
                                value={name || ""}
                                onChange={(e) => updateCertification(idx, "name", e.target.value)}
                                placeholder="Certification Name"
                                className="w-full text-xs p-1.5 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold text-gray-600 block mb-0.5">Issuing Authority</label>
                              <input
                                type="text"
                                value={issuer || ""}
                                onChange={(e) => updateCertification(idx, "issuer", e.target.value)}
                                placeholder="e.g. AWS, Microsoft, Cisco"
                                className="w-full text-xs p-1.5 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold text-gray-600 block mb-0.5">Issue Date</label>
                              <input
                                type="text"
                                value={date || ""}
                                onChange={(e) => updateCertification(idx, "date", e.target.value)}
                                placeholder="e.g. 2023"
                                className="w-full text-xs p-1.5 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold text-gray-600 block mb-0.5">Credential URL / Link</label>
                              <input
                                type="text"
                                value={url || ""}
                                onChange={(e) => updateCertification(idx, "url", e.target.value)}
                                placeholder="https://..."
                                className="w-full text-xs p-1.5 border border-gray-300 rounded-lg"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* TAB: LANGUAGES */}
              {reviewTab === "languages" && (
                <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Languages</h4>
                  <div className="flex flex-wrap gap-1.5 p-2.5 bg-gray-50 rounded-lg min-h-[42px] border border-gray-200">
                    {data.languages?.length === 0 ? (
                      <span className="text-xs text-gray-400 italic">No languages detected.</span>
                    ) : (
                      data.languages?.map((lang, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-white text-gray-800 border border-gray-300 shadow-sm"
                        >
                          <span>{lang}</span>
                          <button
                            type="button"
                            onClick={() => removeLanguage(idx)}
                            className="text-gray-400 hover:text-rose-600 ml-1 text-[10px]"
                            title="Remove"
                          >
                            &times;
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="new-lang-input"
                      placeholder="Add language (e.g. English, Spanish)..."
                      className="flex-1 text-xs p-1.5 border border-gray-300 rounded-lg"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addLanguage(e.target.value);
                          e.target.value = "";
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById("new-lang-input");
                        if (input && input.value) {
                          addLanguage(input.value);
                          input.value = "";
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {/* TAB: SOCIAL LINKS */}
              {reviewTab === "social" && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Social Profiles & Portfolios</h4>
                    <button
                      type="button"
                      onClick={addSocialMedia}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      <FaPlus className="text-[10px]" /> Add Social Link
                    </button>
                  </div>

                  {data.socialMedia?.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-xl border border-gray-200 text-gray-500 text-xs">
                      No social links detected. Click &quot;+ Add Social Link&quot; to add one.
                    </div>
                  ) : (
                    data.socialMedia?.map((sm, idx) => (
                      <div key={sm.id || idx} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={sm.socialMedia || ""}
                            onChange={(e) => updateSocialMedia(sm.id || idx, "socialMedia", e.target.value)}
                            placeholder="Platform (e.g. LinkedIn, GitHub)"
                            className="text-xs p-1.5 border border-gray-300 rounded-lg"
                          />
                          <input
                            type="text"
                            value={sm.link || ""}
                            onChange={(e) => updateSocialMedia(sm.id || idx, "link", e.target.value)}
                            placeholder="URL / Handle"
                            className="text-xs p-1.5 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSocialMedia(sm.id || idx)}
                          className="text-gray-400 hover:text-rose-600 p-2 transition-colors flex-shrink-0"
                          title="Remove"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB: UNMAPPED / UNRECOGNIZED TEXT */}
              {reviewTab === "unmapped" && (
                <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                      Unmapped Document Lines ({extractedData?.unrecognizedLines?.length || 0})
                    </h4>
                    <span className="text-[11px] text-gray-500">Copy any missed lines to your clipboard</span>
                  </div>

                  {extractedData?.unrecognizedLines?.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-xs">
                      All text lines were successfully matched to recognized CV sections!
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                      {extractedData?.unrecognizedLines?.map((line, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs text-gray-700 border border-gray-200"
                        >
                          <span className="truncate pr-2">{line}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyLine(line, idx)}
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-[11px] font-semibold flex-shrink-0"
                          >
                            <FaCopy className="text-xs" />
                            <span>{copiedIndex === idx ? "Copied!" : "Copy"}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Fixed Footer */}
        <div className="flex-shrink-0 bg-gray-100 px-6 py-3.5 flex items-center justify-between border-t border-gray-200">
          {step === "review" ? (
            <>
              <button
                type="button"
                onClick={() => setStep("upload")}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
              >
                Re-upload File
              </button>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmApply(true)}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Apply to CV Builder
                </button>
              </div>
            </>
          ) : (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Confirmation Modal Before Applying */}
        {confirmApply && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5 border border-gray-200">
              <h3 className="text-base font-bold text-gray-900 mb-2">Apply Extracted CV Data?</h3>
              <p className="text-xs text-gray-600 mb-5 leading-relaxed">
                This will populate the form and live preview with your reviewed information. Are you ready to continue?
              </p>
              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmApply(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#059669] hover:bg-[#047857] text-white transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Yes, Apply Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default CvImportModal;
