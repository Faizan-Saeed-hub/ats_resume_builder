import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  MdClose,
  MdCheckCircle,
  MdWarning,
  MdErrorOutline,
  MdInfo,
  MdSpeed,
  MdCompareArrows,
  MdAutoAwesome,
  MdCheck,
  MdContentCopy,
  MdArrowForward,
  MdViewQuilt,
  MdOutlineRule,
  MdSearch,
} from "react-icons/md";
import { FaCheck, FaExclamationTriangle, FaTimesCircle, FaLightbulb, FaBriefcase, FaGraduationCap } from "react-icons/fa";
import { analyzeResumeAts } from "../../utils/atsAnalyzer/atsScorer";
import { matchJobDescription } from "../../utils/atsAnalyzer/jobMatcher";
import {
  generateSummarySuggestions,
  generateBulletPointSuggestions,
  suggestSkillCategories,
} from "../../utils/atsAnalyzer/suggestionEngine";

// Backward-compatible calculation helper for external callers
export const calculateAtsScore = (resumeData) => {
  const analysis = analyzeResumeAts(resumeData);
  return {
    score: analysis.score,
    breakdowns: analysis.categories.map((c) => ({
      section: c.category,
      score: c.score,
      max: c.maxScore,
      status: c.score >= c.maxScore * 0.75 ? "good" : "needs-work",
    })),
    recommendations: analysis.allIssues.map((i) => i.suggestedSolution),
    missingKeywords: [],
    analysis,
  };
};

const TEMPLATE_GUIDES = [
  {
    id: "minimal-ats",
    name: "Minimal ATS-Friendly",
    compatibility: 100,
    badge: "Maximum ATS Parsing Rate",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    description: "Strict single-column linear layout. Zero multi-column tables or complex graphical containers.",
    bestFor: "Enterprise ATS portals (Workday, Taleo, iCIMS, Greenhouse) and conservative corporate job applications.",
  },
  {
    id: "modern-professional",
    name: "Modern Professional",
    compatibility: 95,
    badge: "Recommended Default",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
    description: "Balanced hybrid layout with modern typography and distinct header. Highly readable by both humans and modern parsers.",
    bestFor: "Tech companies, consulting, startups, mid-to-senior engineering roles.",
  },
  {
    id: "corporate-executive",
    name: "Corporate Executive",
    compatibility: 90,
    badge: "Executive Presentation",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-300",
    description: "Distinctive navy header banner with multi-column overview. Clean semantic HTML preserves text hierarchy.",
    bestFor: "Director, VP, management, and business leadership positions.",
  },
  {
    id: "creative-modern",
    name: "Creative Modern",
    compatibility: 85,
    badge: "Creative & Design",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
    description: "Modern left sidebar accent for skills and contact info. Rich visual impact for human reviewers.",
    bestFor: "Designers, creative technologists, frontend engineers, marketing roles.",
  },
];

const AtsScoreModal = ({ isOpen, onClose, resumeData, setResumeData }) => {
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "checklist" | "job_match" | "suggestions" | "templates"
  const [checklistFilter, setChecklistFilter] = useState("all"); // "all" | "issues" | "warnings" | "passed" | "optional"
  const [jobDescriptionInput, setJobDescriptionInput] = useState("");
  const [jobMatchResults, setJobMatchResults] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [appliedSummarySuccess, setAppliedSummarySuccess] = useState(false);

  // Compute live ATS analysis
  const analysis = useMemo(() => {
    return analyzeResumeAts(resumeData);
  }, [resumeData]);

  if (!isOpen) return null;

  // Handle navigating directly to input field in the editor
  const handleFixIssue = (fieldId) => {
    onClose();
    setTimeout(() => {
      if (!fieldId) return;
      const el = document.getElementById(fieldId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        if (typeof el.focus === "function") {
          el.focus();
        }
      }
    }, 150);
  };

  // Run Job Matcher
  const handleAnalyzeJobMatch = () => {
    if (!jobDescriptionInput.trim()) return;
    const res = matchJobDescription(jobDescriptionInput, resumeData);
    setJobMatchResults(res);
  };

  // Copy helper
  const handleCopyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Apply summary suggestion to resumeData
  const handleApplySummary = (text) => {
    if (setResumeData && typeof setResumeData === "function") {
      setResumeData((prev) => ({
        ...prev,
        summary: text,
      }));
      setAppliedSummarySuccess(true);
      setTimeout(() => setAppliedSummarySuccess(false), 3000);
    }
  };

  // Switch Template
  const handleSwitchTemplate = (templateId) => {
    if (setResumeData && typeof setResumeData === "function") {
      setResumeData((prev) => ({
        ...prev,
        selectedTemplate: templateId,
      }));
    }
  };

  // Filter checklist items
  const filteredIssues = analysis.allIssues.filter((item) => {
    if (checklistFilter === "all") return true;
    if (checklistFilter === "issues") return item.severity === "ISSUE";
    if (checklistFilter === "warnings") return item.severity === "WARNING";
    if (checklistFilter === "optional") return item.severity === "OPTIONAL";
    return true;
  });

  const passedChecks = analysis.allChecks.filter((c) => c.status === "PASS");

  // Summary Suggestions
  const summarySuggestionsData = generateSummarySuggestions(resumeData);

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn exclude-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-blue-100 overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-[#172554] text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/40 text-blue-300 border border-blue-400/30">
              <MdSpeed className="text-2xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">ATS Resume Audit & Quality System</h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  Client-Side Heuristics
                </span>
              </div>
              <p className="text-xs text-blue-200">
                Comprehensive algorithmic analysis of contact details, keywords, measurable impact & layout.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Modal"
            className="p-1.5 rounded-lg hover:bg-white/20 transition-all text-white active:scale-95 cursor-pointer"
          >
            <MdClose className="text-xl" />
          </button>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex border-b border-gray-200 bg-gray-50/90 px-3 sm:px-5 overflow-x-auto gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "overview"
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <MdSpeed className="text-sm" />
            <span>Audit Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("checklist")}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "checklist"
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <MdOutlineRule className="text-sm" />
            <span>Checklist & Fixes</span>
            {analysis.issuesCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-extrabold">
                {analysis.issuesCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("job_match")}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "job_match"
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <MdCompareArrows className="text-sm" />
            <span>Job Description Matcher</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("suggestions")}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "suggestions"
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <MdAutoAwesome className="text-sm text-indigo-600" />
            <span>Improvement Assistant</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("templates")}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "templates"
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <MdViewQuilt className="text-sm" />
            <span>Template ATS Guide</span>
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: AUDIT OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Score Banner Dial */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-5 p-5 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white shadow-sm">
                <div className="flex items-center gap-5">
                  {/* Circular Score Gauge */}
                  <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="text-gray-200 stroke-current"
                        strokeWidth="9"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className={`${analysis.tierColor} stroke-current transition-all duration-700 ease-out`}
                        strokeWidth="9"
                        strokeDasharray={263.89}
                        strokeDashoffset={263.89 - (263.89 * analysis.score) / 100}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-gray-900 leading-none">{analysis.score}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">/ 100</span>
                    </div>
                  </div>

                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mb-1.5 shadow-sm ${analysis.tierBadgeBg}`}>
                      {analysis.readinessTier}
                    </span>
                    <h3 className="text-base font-bold text-gray-900">
                      {analysis.score >= 80
                        ? "Resume demonstrates strong ATS readiness!"
                        : analysis.score >= 60
                        ? "Good foundation — a few improvements recommended."
                        : "Key information missing or improvable for ATS parsers."}
                    </h3>
                    <p className="text-xs text-gray-500 max-w-lg mt-0.5">
                      Target a benchmark of 80+ for optimal visibility in candidate screening pipelines.
                    </p>
                  </div>
                </div>

                {/* Status Count Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/60 text-center">
                    <span className="text-xs text-emerald-800 font-bold block">{analysis.passedCount}</span>
                    <span className="text-[10px] text-emerald-600 font-medium">Passed</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200/60 text-center">
                    <span className="text-xs text-rose-800 font-bold block">{analysis.issuesCount}</span>
                    <span className="text-[10px] text-rose-600 font-medium">Issues</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/60 text-center">
                    <span className="text-xs text-amber-800 font-bold block">{analysis.warningsCount}</span>
                    <span className="text-[10px] text-amber-600 font-medium">Warnings</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-center">
                    <span className="text-xs text-gray-800 font-bold block">{analysis.optionalCount}</span>
                    <span className="text-[10px] text-gray-500 font-medium">Optional</span>
                  </div>
                </div>
              </div>

              {/* Fresh Graduate / Entry Level Banner if applicable */}
              {analysis.isEntryLevel && (
                <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl flex items-center gap-3 text-xs text-sky-900">
                  <MdInfo className="text-sky-600 text-lg flex-shrink-0" />
                  <div>
                    <strong>Entry-Level / Student Profile Mode:</strong> You are evaluated fairly on projects, academic achievements, and technical skills without penalty for lack of traditional work experience.
                  </div>
                </div>
              )}

              {/* Category-by-Category Cards */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Category Scores & Coverage
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {analysis.categories.map((cat, idx) => {
                    const pct = Math.round((cat.score / cat.maxScore) * 100);
                    const isHigh = pct >= 80;
                    const isMid = pct >= 50;

                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-white hover:border-blue-200 transition-all flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-gray-800">{cat.category}</span>
                          <span className="text-xs font-bold text-[#2563EB]">
                            {cat.score} / {cat.maxScore} <span className="text-[10px] text-gray-400">pts</span>
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-2">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isHigh ? "bg-emerald-500" : isMid ? "bg-amber-500" : "bg-rose-500"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-gray-500">
                          <span>{cat.checks?.length || 0} checks</span>
                          <span
                            className={`font-semibold ${
                              isHigh ? "text-emerald-600" : isMid ? "text-amber-600" : "text-rose-600"
                            }`}
                          >
                            {pct}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actionable Issues Preview */}
              {analysis.allIssues.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Immediate Action Items ({analysis.allIssues.length})
                    </h4>
                    <button
                      type="button"
                      onClick={() => setActiveTab("checklist")}
                      className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Full Checklist</span>
                      <MdArrowForward className="text-xs" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {analysis.allIssues.slice(0, 3).map((issue, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-gray-100 bg-white shadow-sm flex items-start justify-between gap-3"
                      >
                        <div className="flex items-start gap-2.5">
                          {issue.severity === "ISSUE" ? (
                            <MdErrorOutline className="text-rose-600 text-lg flex-shrink-0 mt-0.5" />
                          ) : issue.severity === "WARNING" ? (
                            <MdWarning className="text-amber-600 text-lg flex-shrink-0 mt-0.5" />
                          ) : (
                            <MdInfo className="text-blue-500 text-lg flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs font-bold text-gray-900">{issue.title}</h5>
                              <span
                                className={`px-2 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                                  issue.severity === "ISSUE"
                                    ? "bg-rose-100 text-rose-800"
                                    : issue.severity === "WARNING"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {issue.severity}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-0.5">{issue.suggestedSolution}</p>
                          </div>
                        </div>
                        {issue.fieldId && (
                          <button
                            type="button"
                            onClick={() => handleFixIssue(issue.fieldId)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white flex-shrink-0 active:scale-95 transition-all shadow-sm cursor-pointer"
                          >
                            Fix This
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-2 text-[11px] text-gray-500">
                <MdInfo className="text-gray-400 text-sm flex-shrink-0 mt-0.5" />
                <p>{analysis.disclaimer}</p>
              </div>
            </div>
          )}

          {/* TAB 2: DETAILED CHECKLIST & FIXES */}
          {activeTab === "checklist" && (
            <div className="space-y-4">
              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "all", label: `All Checks (${analysis.allChecks.length})` },
                  { id: "issues", label: `Issues (${analysis.issuesCount})` },
                  { id: "warnings", label: `Warnings (${analysis.warningsCount})` },
                  { id: "passed", label: `Passed (${passedChecks.length})` },
                  { id: "optional", label: `Optional (${analysis.optionalCount})` },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setChecklistFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      checklistFilter === f.id
                        ? "bg-[#172554] text-white shadow-sm"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Checklist Items */}
              <div className="space-y-3">
                {checklistFilter === "passed" ? (
                  passedChecks.map((check, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/40 flex items-start gap-3"
                    >
                      <MdCheckCircle className="text-emerald-600 text-lg flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-bold text-gray-900">{check.title}</h5>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                            PASSED
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">{check.message}</p>
                      </div>
                    </div>
                  ))
                ) : filteredIssues.length > 0 ? (
                  filteredIssues.map((issue, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:border-blue-300 transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          {issue.severity === "ISSUE" ? (
                            <MdErrorOutline className="text-rose-600 text-lg flex-shrink-0 mt-0.5" />
                          ) : issue.severity === "WARNING" ? (
                            <MdWarning className="text-amber-600 text-lg flex-shrink-0 mt-0.5" />
                          ) : (
                            <MdInfo className="text-blue-500 text-lg flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs font-bold text-gray-900">{issue.title}</h5>
                              <span
                                className={`px-2 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                                  issue.severity === "ISSUE"
                                    ? "bg-rose-100 text-rose-800"
                                    : issue.severity === "WARNING"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {issue.severity}
                              </span>
                              <span className="text-[10px] text-gray-400 font-medium">({issue.section})</span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{issue.description}</p>
                          </div>
                        </div>

                        {issue.fieldId && (
                          <button
                            type="button"
                            onClick={() => handleFixIssue(issue.fieldId)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white flex-shrink-0 active:scale-95 transition-all shadow-sm cursor-pointer"
                          >
                            Fix This Issue
                          </button>
                        )}
                      </div>

                      {/* Why it matters & suggested solution */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-xs">
                        <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                          <span className="font-bold text-gray-700 block text-[11px] mb-0.5">Why It Matters:</span>
                          <span className="text-gray-600 text-[11px] leading-relaxed">{issue.whyItMatters}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100">
                          <span className="font-bold text-[#172554] block text-[11px] mb-0.5">Suggested Solution:</span>
                          <span className="text-gray-700 text-[11px] leading-relaxed">{issue.suggestedSolution}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 text-xs">
                    No issues found for this filter.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: JOB DESCRIPTION MATCHER */}
          {activeTab === "job_match" && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50">
                <h4 className="text-xs font-bold text-[#172554] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <MdCompareArrows className="text-base text-[#2563EB]" />
                  Job Description Alignment Analysis
                </h4>
                <p className="text-xs text-gray-600">
                  Paste the requirements from a real job opening. The matcher will compare target keywords with your CV.
                </p>
              </div>

              {/* Textarea */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 block">
                  Paste Job Description (JD):
                </label>
                <textarea
                  rows={6}
                  value={jobDescriptionInput}
                  onChange={(e) => setJobDescriptionInput(e.target.value)}
                  placeholder="Paste the job description or role requirements here (e.g. 'Looking for a Senior Software Engineer with React, TypeScript, Docker, and AWS...')"
                  className="w-full p-3 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAnalyzeJobMatch}
                  disabled={!jobDescriptionInput.trim()}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                >
                  <MdSearch className="text-sm" />
                  <span>Analyze Job Match</span>
                </button>
              </div>

              {/* Match Results */}
              {jobMatchResults && (
                <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-sm space-y-5">
                  {/* Match Percentage Bar */}
                  <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                        Estimated Keyword Match
                      </span>
                      <h4 className="text-lg font-bold text-gray-900">
                        {jobMatchResults.matchPercentage}% Alignment
                      </h4>
                    </div>
                    <div className="w-36 bg-gray-200 h-3 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          jobMatchResults.matchPercentage >= 70
                            ? "bg-emerald-500"
                            : jobMatchResults.matchPercentage >= 40
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                        style={{ width: `${jobMatchResults.matchPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Matched Keywords */}
                  <div>
                    <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <MdCheckCircle className="text-emerald-600" />
                      Matched Keywords in Your CV ({jobMatchResults.matchedKeywords.length})
                    </h5>
                    {jobMatchResults.matchedKeywords.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {jobMatchResults.matchedKeywords.map((kw, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                          >
                            ✓ {kw}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">No direct technical keyword matches found.</p>
                    )}
                  </div>

                  {/* Missing Keywords */}
                  <div>
                    <h5 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <MdWarning className="text-amber-600" />
                      Keywords in JD Not Found in Your CV ({jobMatchResults.missingKeywords.length})
                    </h5>
                    {jobMatchResults.missingKeywords.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {jobMatchResults.missingKeywords.map((kw, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200"
                          >
                            + {kw}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-emerald-600 font-semibold">
                        All recognized technical keywords from the job description are present in your CV!
                      </p>
                    )}
                  </div>

                  {/* Qualifications Notes */}
                  {jobMatchResults.qualificationNotes.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-gray-100">
                      <h5 className="text-xs font-bold text-gray-700">Role & Experience Constraints:</h5>
                      {jobMatchResults.qualificationNotes.map((note, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-gray-50 text-xs text-gray-600 border border-gray-200">
                          <strong>{note.type}:</strong> {note.text}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Zero-Fabrication Disclaimer */}
                  <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-900 border border-blue-200 flex items-start gap-2">
                    <MdInfo className="text-blue-600 text-sm flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Strict No-Fabrication Policy:</strong> Do not add keywords for technologies or tools you have not used. Hiring teams test keyword claims during technical interviews.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SMART IMPROVEMENT ASSISTANT */}
          {activeTab === "suggestions" && (
            <div className="space-y-6">
              {appliedSummarySuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <MdCheckCircle className="text-emerald-600 text-base" />
                  <span>Summary updated and populated into your CV editor successfully!</span>
                </div>
              )}

              {/* Summary Rewrites */}
              <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                      <MdAutoAwesome className="text-indigo-600" />
                      Professional Summary Enhancements
                    </h4>
                    <p className="text-xs text-gray-500">
                      Tailored options structured with action verbs and career specialization.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {summarySuggestionsData.suggestions.map((sug, i) => (
                    <div key={i} className="p-4 rounded-xl border border-blue-100 bg-blue-50/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#172554]">{sug.title}</span>
                        <span className="text-[10px] text-gray-500">{sug.focus}</span>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed font-sans">{sug.text}</p>
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => handleCopyText(sug.text, sug.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-200 hover:bg-gray-300 text-gray-800 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === sug.id ? <MdCheck className="text-emerald-600" /> : <MdContentCopy />}
                          <span>{copiedId === sug.id ? "Copied" : "Copy"}</span>
                        </button>
                        {setResumeData && (
                          <button
                            type="button"
                            onClick={() => handleApplySummary(sug.text)}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                          >
                            <MdCheck className="text-xs" />
                            <span>Apply to CV</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bullet Point Power Verbs Guide */}
              <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-sm space-y-3">
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <FaLightbulb className="text-amber-500" />
                  STAR Formula for Bullet Points (Situation, Task, Action, Result)
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Transform passive descriptions into active accomplishments:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
                    <span className="font-bold block text-[11px] mb-1">❌ Passive Duty (Weak):</span>
                    <span>&ldquo;Responsible for bug fixing and website maintenance.&rdquo;</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                    <span className="font-bold block text-[11px] mb-1">✓ Active Outcome (High ATS Impact):</span>
                    <span>&ldquo;Architected modular microservices that reduced page load latency by 35% across 10k daily users.&rdquo;</span>
                  </div>
                </div>
              </div>

              {/* Recommended Skill Categorization */}
              <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-sm space-y-3">
                <h4 className="text-sm font-bold text-gray-900">
                  Optimal Skills Taxonomy Structure
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {suggestSkillCategories(resumeData).map((cat, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                      <span className="font-bold text-gray-800 block text-xs">{cat.recommendedCategory}</span>
                      <span className="text-gray-500 text-[11px]">{cat.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TEMPLATE ATS GUIDE */}
          {activeTab === "templates" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50">
                <h4 className="text-xs font-bold text-[#172554] uppercase tracking-wider mb-1">
                  Template ATS Compatibility & Layout Architecture
                </h4>
                <p className="text-xs text-gray-600">
                  All 4 built-in templates are designed with clean semantic HTML. Switch anytime without losing data.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TEMPLATE_GUIDES.map((tmpl) => {
                  const isActive = (resumeData.selectedTemplate || "modern-professional") === tmpl.id;

                  return (
                    <div
                      key={tmpl.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                        isActive
                          ? "border-[#2563EB] bg-blue-50/30 ring-2 ring-blue-500/20 shadow-md"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-sm font-bold text-gray-900">{tmpl.name}</h5>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${tmpl.badgeColor}`}>
                            {tmpl.compatibility}% ATS Parse Score
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2 leading-relaxed">{tmpl.description}</p>
                        <div className="p-2 rounded-lg bg-gray-50 text-[11px] text-gray-500 mb-3">
                          <strong>Best for:</strong> {tmpl.bestFor}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                            <MdCheck className="text-sm" />
                            Currently Active Template
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSwitchTemplate(tmpl.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 hover:bg-[#2563EB] hover:text-white text-gray-700 transition-all cursor-pointer"
                          >
                            Switch to this Template
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="text-[11px] text-gray-500 hidden sm:block">
            Auto-saves continuously. Check ATS score anytime during editing.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-md active:scale-95 transition-all cursor-pointer"
          >
            Continue Editing CV
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null;
};

export default AtsScoreModal;
