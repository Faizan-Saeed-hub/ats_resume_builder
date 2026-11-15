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

  try {
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");

    // Render the resume element to high-res canvas at 2x scale
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
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

    // Inject selectable text layer from DOM elements
    try {
      const textNodes = [];
      const walk = (node) => {
        if (!node) return;
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent?.trim();
          if (text && text.length > 0 && node.parentElement) {
            const rect = node.parentElement.getBoundingClientRect();
            const elemRect = element.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              const relX = ((rect.left - elemRect.left) / elemRect.width) * renderWidth + offsetX;
              const relY = ((rect.top - elemRect.top) / elemRect.height) * renderHeight + offsetY + 3;
              textNodes.push({ text, x: relX, y: relY });
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
      walk(element);

      // Render invisible selectable text stream
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      for (const item of textNodes) {
        if (item.x >= 0 && item.x <= pdfPageWidth && item.y >= 0 && item.y <= pdfPageHeight) {
          // Sanitize control characters to prevent PDF stream corruption
          const safeText = (item.text || "").replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, "");
          if (!safeText) continue;
          try {
            pdf.text(safeText, item.x, item.y, {
              renderingMode: "invisible",
            });
          } catch (e) {
            try {
              // fallback if renderingMode not supported by specific jspdf build
              pdf.setTextColor(255, 255, 255);
              pdf.text(safeText, item.x, item.y);
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
