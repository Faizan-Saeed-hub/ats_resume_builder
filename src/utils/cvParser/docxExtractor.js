/**
 * Client-Side DOCX Text Extractor
 * Uses mammoth to convert DOCX documents to HTML/text,
 * preserving document structure, headings, lists, and tables.
 */

export const extractTextFromDocx = async (fileOrBuffer) => {
  const mammoth = (await import("mammoth")).default || (await import("mammoth"));

  let arrayBuffer;
  if (fileOrBuffer instanceof ArrayBuffer) {
    arrayBuffer = fileOrBuffer;
  } else if (fileOrBuffer instanceof Blob || (typeof File !== "undefined" && fileOrBuffer instanceof File)) {
    arrayBuffer = await fileOrBuffer.arrayBuffer();
  } else {
    throw new Error("Invalid file input for DOCX extraction.");
  }

  // Extract both structured HTML and raw text
  const [htmlResult, rawTextResult] = await Promise.all([
    mammoth.convertToHtml({ arrayBuffer }),
    mammoth.extractRawText({ arrayBuffer }),
  ]);

  const html = htmlResult.value || "";
  const rawText = rawTextResult.value || "";

  // Parse HTML into sequential structured lines
  const lines = [];

  // If in browser, use DOMParser
  if (typeof window !== "undefined" && typeof DOMParser !== "undefined") {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Walk through block elements
    const blockElements = doc.querySelectorAll("h1, h2, h3, h4, h5, h6, p, li, tr");

    blockElements.forEach((el) => {
      const text = el.textContent ? el.textContent.trim() : "";
      if (!text) return;

      const tagName = el.tagName.toLowerCase();
      const isHeading = tagName.startsWith("h") || el.querySelector("strong, b")?.textContent?.trim() === text;
      const isBullet = tagName === "li";

      lines.push({
        text,
        isHeadingCandidate: isHeading,
        isBullet,
        tagName,
      });
    });
  } else {
    // Fallback: parse raw text lines
    rawText.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed) {
        lines.push({
          text: trimmed,
          isHeadingCandidate: false,
          isBullet: /^[-•*]/.test(trimmed),
        });
      }
    });
  }

  return {
    rawText,
    lines,
    html,
  };
};

export default extractTextFromDocx;
