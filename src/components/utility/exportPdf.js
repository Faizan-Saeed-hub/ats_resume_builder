/**
 * Direct PDF and Text export utility
 * Guarantees high-resolution visual fidelity, text selectability,
 * and 100% round-trip metadata compatibility with the Smart CV Import engine.
 */

export const downloadPdfDirect = async (
  elementId = "resume-a4-page",
  filename = "Resume.pdf",
  resumeData = null
) => {
  const element =
    document.getElementById("resume-a4-page") ||
    document.getElementById(elementId) ||
    document.getElementById("resume-preview-document");

  if (!element) {
    console.error("Resume preview element not found. Falling back to print dialog.");
    window.print();
    return;
  }

  // Mobile safety: if preview pane is hidden (e.g. mobile "editor" tab is active),
  // temporarily position it offscreen so DOM cloner and html2canvas can measure & capture it.
  const previewPane = typeof document !== "undefined" ? document.getElementById("builder-preview-pane") : null;
  let wasHidden = false;
  if (previewPane && typeof window !== "undefined") {
    const computedDisplay = window.getComputedStyle(previewPane).display;
    if (computedDisplay === "none") {
      wasHidden = true;
      previewPane.style.setProperty("display", "block", "important");
      previewPane.style.setProperty("position", "fixed", "important");
      previewPane.style.setProperty("top", "-99999px", "important");
      previewPane.style.setProperty("left", "-99999px", "important");
      previewPane.style.setProperty("width", "794px", "important");
      previewPane.style.setProperty("z-index", "-9999", "important");
    }
  }

  try {
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");

    const rawTextNodes = [];

    // Render the resume element to high-res canvas at 2x scale
    // Force windowWidth: 1200 so Tailwind's sm: (>=640px) and md: (>=768px) desktop media queries apply identically on all mobile and desktop devices.
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 1200,
      windowHeight: 1600,
      onclone: (clonedDoc, clonedTarget) => {
        // 1. Ensure preview pane is visible and full desktop width in cloned iframe
        const clonedPreviewPane = clonedDoc.getElementById("builder-preview-pane");
        if (clonedPreviewPane) {
          clonedPreviewPane.classList.remove("hidden");
          clonedPreviewPane.style.setProperty("display", "block", "important");
          clonedPreviewPane.style.setProperty("visibility", "visible", "important");
          clonedPreviewPane.style.setProperty("position", "static", "important");
          clonedPreviewPane.style.setProperty("left", "auto", "important");
          clonedPreviewPane.style.setProperty("top", "auto", "important");
          clonedPreviewPane.style.setProperty("width", "1200px", "important");
          clonedPreviewPane.style.setProperty("max-width", "1200px", "important");
        }

        const clonedMain = clonedDoc.getElementById("builder-main-container");
        if (clonedMain) {
          clonedMain.style.setProperty("display", "block", "important");
          clonedMain.style.setProperty("width", "1200px", "important");
        }

        const clonedDocWrapper = clonedDoc.getElementById("resume-preview-document");
        if (clonedDocWrapper) {
          clonedDocWrapper.style.setProperty("width", "850px", "important");
          clonedDocWrapper.style.setProperty("max-width", "850px", "important");
          clonedDocWrapper.style.setProperty("display", "flex", "important");
          clonedDocWrapper.style.setProperty("justify-content", "center", "important");
        }

        // 2. Lock the A4 page element to standard desktop 794px width
        const targetPage =
          clonedDoc.getElementById("resume-a4-page") ||
          clonedTarget ||
          clonedDoc.getElementById(elementId);

        if (targetPage) {
          targetPage.style.setProperty("display", "block", "important");
          targetPage.style.setProperty("visibility", "visible", "important");
          targetPage.style.setProperty("width", "794px", "important");
          targetPage.style.setProperty("min-width", "794px", "important");
          targetPage.style.setProperty("max-width", "794px", "important");
          targetPage.style.setProperty("margin", "0 auto", "important");
          targetPage.style.setProperty("box-sizing", "border-box", "important");
          targetPage.style.setProperty("transform", "none", "important");

          // 3. Collect text nodes from the desktop-rendered cloned element for exact coordinate mapping
          try {
            const elemRect = targetPage.getBoundingClientRect();
            const walk = (node) => {
              if (!node) return;
              if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent?.trim();
                if (text && text.length > 0 && node.parentElement) {
                  const rect = node.parentElement.getBoundingClientRect();
                  if (rect.width > 0 && rect.height > 0 && elemRect.width > 0) {
                    rawTextNodes.push({
                      text,
                      left: rect.left - elemRect.left,
                      top: rect.top - elemRect.top,
                      width: elemRect.width,
                      height: elemRect.height,
                    });
                  }
                }
              } else if (node.nodeType === Node.ELEMENT_NODE) {
                const isExcluded =
                  node.classList && typeof node.classList.contains === "function"
                    ? node.classList.contains("exclude-print") || node.classList.contains("print-hidden")
                    : false;
                if (!isExcluded) {
                  for (let child of node.childNodes) {
                    walk(child);
                  }
                }
              }
            };
            walk(targetPage);
          } catch (walkErr) {
            console.warn("Could not extract cloned text nodes:", walkErr);
          }
        }
      },
      ignoreElements: (el) => {
        return (
          el.classList?.contains("exclude-print") ||
          el.classList?.contains("print-hidden")
        );
      },
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.98);

    // Instantiate A4 PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pdfPageWidth = 210; // A4 width in mm
    const pdfPageHeight = 297; // A4 height in mm

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const canvasRatio = canvasWidth / canvasHeight;
    const a4Ratio = pdfPageWidth / pdfPageHeight; // ~0.707

    let renderWidth = pdfPageWidth;
    let renderHeight = pdfPageHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > a4Ratio) {
      renderWidth = pdfPageWidth;
      renderHeight = pdfPageWidth / canvasRatio;
      offsetY = 0;
    } else {
      renderHeight = pdfPageHeight;
      renderWidth = pdfPageHeight * canvasRatio;
      offsetX = (pdfPageWidth - renderWidth) / 2;
      offsetY = 0;
    }

    // Embed structured CV metadata for 100% round-trip re-import fidelity
    if (resumeData && typeof resumeData === "object") {
      try {
        const jsonStr = JSON.stringify(resumeData);
        // Base64 encoding is 100% immune to PDF literal string escaping, parens, and URI encoding quirks
        const base64Data =
          typeof window !== "undefined" && typeof window.btoa === "function"
            ? window.btoa(unescape(encodeURIComponent(jsonStr)))
            : Buffer.from(jsonStr, "utf8").toString("base64");

        pdf.setProperties({
          title: filename.replace(/\.pdf$/i, ""),
          subject: `ATSRESUME_B64:${base64Data}`,
          keywords: `ATSRESUME_B64:${base64Data}`,
          author: resumeData.name || "ATSResume",
          creator: "ATSResume Platform",
        });
      } catch (metaErr) {
        console.warn("Failed to embed CV metadata in PDF:", metaErr);
      }
    }

    // Add high-resolution visual layer
    pdf.addImage(
      imgData,
      "JPEG",
      offsetX,
      offsetY,
      renderWidth,
      renderHeight,
      undefined,
      "FAST"
    );

    // Inject selectable text layer from desktop-cloned elements
    try {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      for (const item of rawTextNodes) {
        const x = (item.left / item.width) * renderWidth + offsetX;
        const y = (item.top / item.height) * renderHeight + offsetY + 3;

        if (x >= 0 && x <= pdfPageWidth && y >= 0 && y <= pdfPageHeight) {
          // Sanitize control characters to prevent PDF stream corruption
          const safeText = (item.text || "").replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, "");
          if (!safeText) continue;
          try {
            pdf.text(safeText, x, y, {
              renderingMode: "invisible",
            });
          } catch (e) {
            try {
              // fallback if renderingMode not supported by specific jspdf build
              pdf.setTextColor(255, 255, 255);
              pdf.text(safeText, x, y);
            } catch (fallbackErr) {
              // Ignore individual problematic glyphs rather than failing entire layer
            }
          }
        }
      }
    } catch (textLayerErr) {
      console.warn("Could not generate selectable text overlay:", textLayerErr);
    }

    // Save PDF
    pdf.save(filename);
  } catch (err) {
    console.error("Direct PDF generation failed, falling back to print dialog:", err);
    window.print();
  } finally {
    // Restore preview pane visibility if it was temporarily unhidden
    if (wasHidden && previewPane) {
      previewPane.style.removeProperty("display");
      previewPane.style.removeProperty("position");
      previewPane.style.removeProperty("top");
      previewPane.style.removeProperty("left");
      previewPane.style.removeProperty("width");
      previewPane.style.removeProperty("z-index");
    }
  }
};

export const exportToPlainText = (resumeData, filename = "Resume.txt") => {
  if (!resumeData) return;

  let text = "";
  if (resumeData.name) text += `${resumeData.name}\n`;
  if (resumeData.position) text += `${resumeData.position}\n`;

  const contactParts = [
    resumeData.contactInformation,
    resumeData.email,
    resumeData.address,
  ].filter(Boolean);

  if (contactParts.length > 0) {
    text += `${contactParts.join(" | ")}\n`;
  }

  if (Array.isArray(resumeData.socialMedia) && resumeData.socialMedia.length > 0) {
    text += `${resumeData.socialMedia
      .filter((s) => s?.link)
      .map((s) => `${s.socialMedia ? s.socialMedia + ": " : ""}${s.link}`)
      .join(" | ")}\n`;
  }

  text += "\n";

  if (resumeData.summary) {
    text += `PROFESSIONAL SUMMARY\n${resumeData.summary}\n\n`;
  }

  if (Array.isArray(resumeData.workExperience) && resumeData.workExperience.length > 0) {
    text += "WORK EXPERIENCE\n";
    resumeData.workExperience.forEach((exp) => {
      text += `\n${exp.position || ""} - ${exp.company || ""}\n`;
      if (exp.startYear || exp.endYear) {
        text += `${exp.startYear || ""} - ${exp.endYear || "Present"}\n`;
      }
      if (exp.description) text += `${exp.description}\n`;
      if (exp.keyAchievements) text += `${exp.keyAchievements}\n`;
    });
    text += "\n";
  }

  if (Array.isArray(resumeData.education) && resumeData.education.length > 0) {
    text += "EDUCATION\n";
    resumeData.education.forEach((edu) => {
      text += `\n${edu.degree || ""} - ${edu.school || ""}\n`;
      if (edu.startYear || edu.endYear) {
        text += `${edu.startYear || ""} - ${edu.endYear || "Present"}\n`;
      }
    });
    text += "\n";
  }

  if (Array.isArray(resumeData.skills) && resumeData.skills.length > 0) {
    text += "SKILLS\n";
    resumeData.skills.forEach((cat) => {
      const active = (cat.skills || []).filter(Boolean);
      if (active.length > 0) {
        text += `${cat.title || "Skills"}: ${active.join(", ")}\n`;
      }
    });
    text += "\n";
  }

  if (Array.isArray(resumeData.certifications) && resumeData.certifications.length > 0) {
    text += "CERTIFICATIONS\n";
    resumeData.certifications.forEach((c) => {
      const isObj = typeof c === "object" && c !== null;
      const name = isObj ? c.name : c;
      const issuer = isObj ? c.issuer : "";
      const date = isObj ? c.date : "";
      if (name) {
        text += `- ${name}${issuer ? " (" + issuer + ")" : ""}${date ? " - " + date : ""}\n`;
      }
    });
    text += "\n";
  }

  if (Array.isArray(resumeData.languages) && resumeData.languages.length > 0) {
    text += `LANGUAGES\n${resumeData.languages.filter(Boolean).join(", ")}\n\n`;
  }

  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};
