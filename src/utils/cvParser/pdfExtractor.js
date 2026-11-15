/**
 * Client-Side PDF Text Extractor
 * Multi-strategy extraction:
 * 1. Fast-path buffer scan & metadata inspection for self-generated CV data (100% round-trip fidelity).
 * 2. Primary text coordinate extraction with 2-column layout detection and CMap support.
 * 3. Automatic OCR fallback via Tesseract.js for scanned/raster PDFs.
 */

// Helper to decode embedded CV data from both Base64 (new) and legacy URL-encoded formats
const tryDecodeCvMetadata = (text) => {
  if (!text || typeof text !== "string") return null;

  // 1. Check ATSRESUME_B64: (Base64 encoded JSON)
  const b64Match = text.match(/ATSRESUME_B64:([A-Za-z0-9+/=]{10,})/);
  if (b64Match) {
    try {
      const b64String = b64Match[1].trim();
      const rawJson =
        typeof window !== "undefined" && typeof window.atob === "function"
          ? decodeURIComponent(escape(window.atob(b64String)))
          : Buffer.from(b64String, "base64").toString("utf8");
      const parsed = JSON.parse(rawJson);
      if (parsed && typeof parsed === "object") return parsed;
    } catch (e) {
      try {
        const rawJson =
          typeof window !== "undefined" && typeof window.atob === "function"
            ? window.atob(b64Match[1].trim())
            : Buffer.from(b64Match[1].trim(), "base64").toString("utf8");
        const parsed = JSON.parse(rawJson);
        if (parsed && typeof parsed === "object") return parsed;
      } catch (e2) {}
    }
  }

  // 2. Check ATSRESUME_DATA: (Legacy URL-encoded JSON)
  const legacyMatch = text.match(/ATSRESUME_DATA:([\s\S]*?)(?:(?<!\\)\)|[\r\n>\]\x00])/);
  if (legacyMatch) {
    try {
      // Unescape PDF literal parens \( and \)
      const cleaned = legacyMatch[1].replace(/\\([()])/g, "$1");
      const decoded = decodeURIComponent(cleaned);
      const parsed = JSON.parse(decoded);
      if (parsed && typeof parsed === "object") return parsed;
    } catch (e) {}
  }

  return null;
};

export const extractTextFromPdf = async (fileOrBuffer, onProgress = () => {}) => {
  let arrayBuffer;
  if (fileOrBuffer instanceof ArrayBuffer) {
    arrayBuffer = fileOrBuffer;
  } else if (
    (typeof Blob !== "undefined" && fileOrBuffer instanceof Blob) ||
    (typeof File !== "undefined" && fileOrBuffer instanceof File) ||
    (fileOrBuffer && typeof fileOrBuffer.arrayBuffer === "function")
  ) {
    arrayBuffer = await fileOrBuffer.arrayBuffer();
  } else {
    throw new Error("Invalid file input for PDF extraction.");
  }

  // Fast-Path Step 1A: Direct byte-scan for embedded CV data (instant, 0-latency, 100% fidelity)
  try {
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }
    const embeddedData = tryDecodeCvMetadata(binary);
    if (embeddedData && typeof embeddedData === "object") {
      return {
        isOwnPdf: true,
        ownPdfData: embeddedData,
        rawText: "Restored from ATSResume Document Metadata",
        lines: [],
      };
    }
  } catch (rawScanErr) {
    console.warn("Fast-path metadata scan skipped:", rawScanErr);
  }

  // Load pdfjs-dist dynamically
  const pdfjsLib = await import("pdfjs-dist/build/pdf.js");

  // Configure worker for client-side execution (local public file with CDN fallback)
  if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
  }

  let pdf;
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
      isEvalSupported: false,
      cMapUrl: typeof window !== "undefined" ? "/cmaps/" : undefined,
      cMapPacked: true,
      standardFontDataUrl: typeof window !== "undefined" ? "/standard_fonts/" : undefined,
    });
    pdf = await loadingTask.promise;
  } catch (loadErr) {
    if (loadErr?.name === "PasswordException" || /password/i.test(loadErr?.message || "")) {
      throw new Error(
        "This PDF is password protected. Please remove the password and try again."
      );
    }
    throw new Error(
      "The PDF file appears corrupted or invalid. Please check the file and try again."
    );
  }

  // Strategy 1B: Inspect PDF document metadata dictionary
  try {
    const metadata = await pdf.getMetadata();
    const info = metadata?.info || {};
    const candidates = [
      info.Subject,
      info.subject,
      info.Keywords,
      info.keywords,
      info.Title,
      info.title,
      info.Author,
      info.author,
      info.Creator,
    ];

    for (const cand of candidates) {
      if (typeof cand === "string") {
        const parsed = tryDecodeCvMetadata(cand);
        if (parsed) {
          return {
            isOwnPdf: true,
            ownPdfData: parsed,
            rawText: "Restored from ATSResume Document Metadata",
            lines: [],
          };
        }
      }
    }
  } catch (metaErr) {
    console.warn("PDF metadata inspection skipped:", metaErr);
  }

  // Strategy 2: Primary text coordinate extraction
  const numPages = pdf.numPages;
  const extractedLines = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1.0 });
    const pageWidth = viewport.width;

    const items = textContent.items
      .map((item) => ({
        str: (item.str || "").replace(/\0/g, "").trim(),
        x: item.transform[4],
        y: item.transform[5],
        width: item.width,
        height: item.height || Math.abs(item.transform[0]) || 12,
      }))
      .filter((item) => item.str && item.str.length > 0);

    if (items.length === 0) continue;

    // Detect two-column layout
    const leftColItems = [];
    const rightColItems = [];
    const fullWidthItems = [];
    const colThreshold = pageWidth * 0.42;

    items.forEach((item) => {
      if (item.width > pageWidth * 0.6) {
        fullWidthItems.push(item);
      } else if (item.x < colThreshold) {
        leftColItems.push(item);
      } else {
        rightColItems.push(item);
      }
    });

    const isTwoColumn =
      leftColItems.length > 8 &&
      rightColItems.length > 8 &&
      leftColItems.length / (items.length || 1) > 0.25;

    const groupItemsIntoLines = (itemList) => {
      const sorted = [...itemList].sort((a, b) => b.y - a.y);
      const lines = [];
      let currentLine = [];
      let currentY = null;
      const yTolerance = 4;

      sorted.forEach((item) => {
        if (currentY === null || Math.abs(item.y - currentY) <= yTolerance) {
          currentLine.push(item);
          if (currentY === null) currentY = item.y;
        } else {
          currentLine.sort((a, b) => a.x - b.x);
          const lineText = currentLine.map((i) => i.str).join(" ").trim();
          if (lineText) {
            lines.push({
              text: lineText,
              y: currentY,
              x: currentLine[0].x,
              fontSize: currentLine[0].height,
              pageNum,
            });
          }
          currentLine = [item];
          currentY = item.y;
        }
      });

      if (currentLine.length > 0) {
        currentLine.sort((a, b) => a.x - b.x);
        const lineText = currentLine.map((i) => i.str).join(" ").trim();
        if (lineText) {
          lines.push({
            text: lineText,
            y: currentY,
            x: currentLine[0].x,
            fontSize: currentLine[0].height,
            pageNum,
          });
        }
      }

      return lines;
    };

    if (isTwoColumn) {
      const headerItems = fullWidthItems.filter((i) => i.y > viewport.height * 0.75);
      const bodyFullItems = fullWidthItems.filter((i) => i.y <= viewport.height * 0.75);

      const headerLines = groupItemsIntoLines(headerItems);
      const leftLines = groupItemsIntoLines(leftColItems);
      const rightLines = groupItemsIntoLines(rightColItems);
      const bodyLines = groupItemsIntoLines(bodyFullItems);

      extractedLines.push(...headerLines, ...leftLines, ...rightLines, ...bodyLines);
    } else {
      const pageLines = groupItemsIntoLines(items);
      extractedLines.push(...pageLines);
    }
  }

  let rawText = extractedLines.map((l) => l.text).join("\n");

  // Strategy 3: OCR Fallback for scanned or rasterized image PDFs
  if (rawText.trim().length < 35 && typeof window !== "undefined") {
    try {
      onProgress({
        stage: "ocr",
        percent: 60,
        message: "No text stream found. Running OCR recognition on scanned pages...",
      });

      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng");

      const ocrLines = [];

      for (let pageNum = 1; pageNum <= Math.min(numPages, 3); pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.8 });

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext("2d");

        await page.render({ canvasContext: context, viewport }).promise;

        const { data } = await worker.recognize(canvas);
        if (data?.lines) {
          data.lines.forEach((l, idx) => {
            const cleanText = l.text.trim();
            if (cleanText) {
              ocrLines.push({
                text: cleanText,
                y: l.baseline?.y0 || 1000 - idx * 20,
                x: l.bbox?.x0 || 0,
                pageNum,
              });
            }
          });
        }
      }

      await worker.terminate();

      if (ocrLines.length > 0) {
        extractedLines.push(...ocrLines);
        rawText = extractedLines.map((l) => l.text).join("\n");
      }
    } catch (ocrErr) {
      console.warn("OCR fallback error:", ocrErr);
    }
  }

  return {
    isOwnPdf: false,
    rawText,
    lines: extractedLines,
  };
};

export default extractTextFromPdf;
