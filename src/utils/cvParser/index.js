/**
 * Smart CV Document Parser - Entry Point
 * Supports PDF, DOCX, and image (JPG, PNG, WebP) extraction and intelligent mapping.
 * Purely client-side, standard parsing with OCR fallback.
 */

import { extractTextFromPdf } from "./pdfExtractor.js";
import { extractTextFromDocx } from "./docxExtractor.js";
import { extractTextFromImage } from "./imageExtractor.js";
import { mapExtractedCvData } from "./dataMapper.js";

export const parseCvFile = async (file, onProgress = () => {}) => {
  if (!file) {
    throw new Error("No file provided for parsing.");
  }

  const fileName = (file.name || "").toLowerCase();
  const fileType = (file.type || "").toLowerCase();
  const isPdf = fileName.endsWith(".pdf") || fileType === "application/pdf";
  const isDocx =
    fileName.endsWith(".docx") ||
    fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  const isImage =
    /\.(jpe?g|png|webp)$/i.test(fileName) ||
    fileType.startsWith("image/");

  if (!isPdf && !isDocx && !isImage) {
    throw new Error(
      "Unsupported file format. Please upload a PDF (.pdf), Word (.docx), or Image (.jpg, .png, .webp) document."
    );
  }

  // Maximum file size: 15MB
  const MAX_SIZE_MB = 15;
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`File size exceeds ${MAX_SIZE_MB}MB limit. Please upload a smaller document.`);
  }

  onProgress({ stage: "reading", percent: 20, message: "Reading document..." });

  let extractionResult;

  if (isPdf) {
    onProgress({ stage: "extracting", percent: 45, message: "Extracting text from PDF..." });
    extractionResult = await extractTextFromPdf(file, onProgress);
  } else if (isDocx) {
    onProgress({ stage: "extracting", percent: 45, message: "Extracting text and structure from DOCX..." });
    extractionResult = await extractTextFromDocx(file);
  } else if (isImage) {
    onProgress({ stage: "extracting", percent: 35, message: "Running OCR on CV image..." });
    extractionResult = await extractTextFromImage(file, onProgress);
  }

  // If this was a CV exported by this platform with embedded metadata, return directly
  if (extractionResult.isOwnPdf && extractionResult.ownPdfData) {
    const ownData = extractionResult.ownPdfData;
    onProgress({ stage: "analyzing", percent: 85, message: "Restoring full CV data..." });

    const totalSkills = Array.isArray(ownData.skills)
      ? ownData.skills.reduce((acc, cat) => acc + (cat.skills || []).length, 0)
      : 0;

    const metadata = {
      personalFound: Boolean(ownData.name || ownData.email || ownData.contactInformation),
      experienceCount: ownData.workExperience?.length || 0,
      educationCount: ownData.education?.length || 0,
      skillsCount: totalSkills,
      certificationsCount: ownData.certifications?.length || 0,
      projectsCount: ownData.projects?.length || 0,
      languagesCount: ownData.languages?.length || 0,
      unrecognizedCount: 0,
      isNativeRoundTrip: true,
    };

    onProgress({ stage: "complete", percent: 100, message: "Extraction complete!" });

    return {
      mappedData: ownData,
      metadata,
      unrecognizedLines: [],
      rawText: "Restored from ATSResume Document Metadata",
    };
  }

  if (!extractionResult.rawText || extractionResult.rawText.trim().length === 0) {
    throw new Error(
      "No readable text could be extracted. The document may be an empty image or corrupted."
    );
  }

  onProgress({ stage: "analyzing", percent: 75, message: "Analyzing sections and structure..." });

  // Map into standardized schema
  const parsedData = mapExtractedCvData(extractionResult.rawText, extractionResult.lines);

  onProgress({ stage: "complete", percent: 100, message: "Extraction complete!" });

  return parsedData;
};

export default parseCvFile;
