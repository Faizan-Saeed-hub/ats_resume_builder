"use client";

import React, { createContext, useState, useEffect, useRef, useCallback } from "react";
import Meta from "../components/meta/Meta";
import FormCloseOpenBtn from "../components/FormCloseOpenBtn";
import Preview from "../components/preview/ui/Preview";
import DefaultResumeData from "../components/utility/DefaultResumeData";
import dynamic from "next/dynamic";
import Form from "../components/form/ui/Form";
import { MdEditDocument, MdVisibility } from "react-icons/md";

const ResumeContext = createContext({
  resumeData: DefaultResumeData,
  setResumeData: () => {},
  updateResumeData: () => {},
  undo: () => {},
  redo: () => {},
  canUndo: false,
  canRedo: false,
  handleProfilePicture: () => {},
  removeProfilePicture: () => {},
  handleChange: () => {},
  resetResumeData: () => {},
  isSaving: false,
});

// server side rendering false
const Print = dynamic(() => import("../components/utility/WinPrint"), {
  ssr: false,
});

export default function Builder() {
  // Centralized resume data
  const [resumeData, setResumeDataState] = useState(DefaultResumeData);
  const [isSaving, setIsSaving] = useState(false);
  const [mobileTab, setMobileTab] = useState("editor"); // "editor" | "preview"

  // Undo / Redo history stacks
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);

  // Form hide/show (desktop toggle)
  const [formClose, setFormClose] = useState(false);
  const isInitialMount = useRef(true);

  // Set resume data with history tracking
  const setResumeData = useCallback(
    (action) => {
      setResumeDataState((current) => {
        const next = typeof action === "function" ? action(current) : action;
        if (JSON.stringify(current) !== JSON.stringify(next)) {
          setPast((p) => [...p.slice(-25), current]);
          setFuture([]);
        }
        return next;
      });
    },
    []
  );

  // Undo action
  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setPast((p) => p.slice(0, p.length - 1));
    setFuture((f) => [resumeData, ...f.slice(0, 25)]);
    setResumeDataState(previous);
  }, [past, resumeData]);

  // Redo action
  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((f) => f.slice(1));
    setPast((p) => [...p.slice(-25), resumeData]);
    setResumeDataState(next);
  }, [future, resumeData]);

  // Keyboard shortcut listener (Ctrl+Z for Undo, Ctrl+Y / Ctrl+Shift+Z for Redo)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isInput =
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.isContentEditable;

      // Allow global undo/redo when not actively typing or if modifier pressed
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === "z") {
        if (!isInput) {
          e.preventDefault();
          undo();
        }
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z"))
      ) {
        if (!isInput) {
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  // Dynamic Print Scale: matches downloaded PDF's 1-page proportional scaling
  useEffect(() => {
    const computePrintScale = () => {
      const page = document.getElementById("resume-a4-page");
      if (!page) return;
      const targetHeight = 1122.5; // A4 height at 96 DPI (297mm)
      const currentHeight = page.scrollHeight || page.offsetHeight;
      if (currentHeight > targetHeight) {
        const scale = Math.max(0.70, Math.min(1, targetHeight / currentHeight));
        document.documentElement.style.setProperty("--print-scale", scale.toFixed(4));
      } else {
        document.documentElement.style.setProperty("--print-scale", "1");
      }
    };

    window.addEventListener("beforeprint", computePrintScale);
    window.addEventListener("afterprint", () => {
      document.documentElement.style.removeProperty("--print-scale");
    });

    return () => {
      window.removeEventListener("beforeprint", computePrintScale);
    };
  }, []);

  // Restore saved data from localStorage on mount (if available)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("atsresume_data");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          setResumeDataState(parsed);
        }
      }
    } catch (e) {
      console.warn("Failed to load saved resume from localStorage:", e);
    }
  }, []);

  // Auto-save changes to localStorage
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setIsSaving(true);
    const timer = setTimeout(() => {
      try {
        localStorage.setItem("atsresume_data", JSON.stringify(resumeData));
      } catch (e) {
        console.warn("Failed to auto-save to localStorage:", e);
      } finally {
        setIsSaving(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [resumeData]);

  // Reset function: completely clears all state & local storage
  const resetResumeData = useCallback(() => {
    try {
      localStorage.removeItem("atsresume_data");
    } catch (e) {
      // ignore
    }
    setPast([]);
    setFuture([]);
    setResumeDataState(DefaultResumeData);
  }, []);

  // Profile Picture File Handler with validation
  const handleProfilePicture = (file) => {
    if (!file) return { success: false, error: "No file selected." };

    // Format validation
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      return {
        success: false,
        error: "Unsupported image format. Please select a JPG, PNG, or WebP image.",
      };
    }

    // Size validation: 5 MB limit
    if (file.size > 5 * 1024 * 1024) {
      return {
        success: false,
        error: "Image exceeds 5 MB. Please select a smaller photo.",
      };
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setResumeData((prev) => ({
        ...prev,
        profilePicture: event.target.result,
        showProfilePhoto: true,
      }));
    };
    reader.onerror = () => {
      console.error("Failed to read image file.");
    };
    reader.readAsDataURL(file);

    return { success: true };
  };

  // Remove Profile Picture
  const removeProfilePicture = useCallback(() => {
    setResumeData((prev) => ({
      ...prev,
      profilePicture: "",
    }));
  }, [setResumeData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setResumeData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <>
      <ResumeContext.Provider
        value={{
          resumeData,
          setResumeData,
          undo,
          redo,
          canUndo: past.length > 0,
          canRedo: future.length > 0,
          handleProfilePicture,
          removeProfilePicture,
          handleChange,
          resetResumeData,
          isSaving,
        }}
      >
        <Meta
          title="ATSResume | Premium Professional CV & Resume Platform"
          description="ATSResume is a cutting-edge resume builder that helps job seekers create a professional, ATS-friendly resume in minutes. Live preview, multiple templates, clickable certifications, ATS score checking and instant PDF download."
          keywords="ATS-friendly, Resume optimization, Keyword-rich resume, Applicant Tracking System, ATS resume builder, ATS resume templates, ATS-compliant resume, ATS-optimized CV, ATS-friendly format, ATS resume tips, Resume writing services, Career guidance, Professional resume builder, resume builder, free resume builder, best free resume builder, resume creator"
        />

        {/* Mobile Tab Switcher */}
        <div className="md:hidden flex sticky top-0 z-40 bg-[#172554] border-b border-blue-900/50 p-2 justify-center gap-2 exclude-print shadow-md">
          <button
            type="button"
            onClick={() => setMobileTab("editor")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              mobileTab === "editor"
                ? "bg-[#2563EB] text-white shadow"
                : "text-blue-200 hover:bg-blue-900/60"
            }`}
          >
            <MdEditDocument className="text-sm" />
            <span>Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("preview")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              mobileTab === "preview"
                ? "bg-[#2563EB] text-white shadow"
                : "text-blue-200 hover:bg-blue-900/60"
            }`}
          >
            <MdVisibility className="text-sm" />
            <span>Live Preview</span>
          </button>
        </div>

        <div id="builder-main-container" className="flex flex-col md:flex-row w-full h-[calc(100vh-49px)] md:h-screen overflow-hidden bg-gray-100">
          {/* Form / Editor Pane - completely hidden when formClose is true */}
          <div
            id="builder-form-pane"
            className={`exclude-print ${
              formClose
                ? "hidden"
                : `${mobileTab === "editor" ? "block" : "hidden"} md:block md:w-1/2 w-full`
            } h-full overflow-hidden flex-shrink-0 transition-all duration-300`}
          >
            <Form />
          </div>

          {/* Preview Pane - 100% full width when formClose is true */}
          <div
            id="builder-preview-pane"
            className={`${
              formClose
                ? "w-full block"
                : `${mobileTab === "preview" ? "block" : "hidden"} md:block md:w-1/2 w-full`
            } h-full overflow-hidden flex-1 transition-all duration-300`}
          >
            <Preview />
          </div>
        </div>

        <FormCloseOpenBtn formClose={formClose} setFormClose={setFormClose} />
        <Print />
      </ResumeContext.Provider>
    </>
  );
}
export { ResumeContext };
