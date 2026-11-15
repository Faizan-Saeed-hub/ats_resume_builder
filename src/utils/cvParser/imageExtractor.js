/**
 * Dedicated Image CV Text Extractor (JPG, JPEG, PNG, WebP)
 * Uses Tesseract.js client-side OCR engine to extract structured text
 * and line coordinates from uploaded CV images.
 */

export const extractTextFromImage = async (fileOrBlob, onProgress = () => {}) => {
  if (!fileOrBlob) {
    throw new Error("No image file provided for OCR extraction.");
  }

  onProgress({
    stage: "ocr",
    percent: 30,
    message: "Initializing OCR engine for image CV...",
  });

  const { createWorker } = await import("tesseract.js");

  let worker = null;
  try {
    worker = await createWorker("eng", 1, {
      logger: (m) => {
        if (m.status === "recognizing text" && typeof m.progress === "number") {
          onProgress({
            stage: "ocr",
            percent: Math.round(30 + m.progress * 60),
            message: `Reading text from CV image (${Math.round(m.progress * 100)}%)...`,
          });
        }
      },
    });

    const result = await worker.recognize(fileOrBlob);
    await worker.terminate();
    worker = null;

    const data = result?.data || {};
    const rawLines = data.lines || [];

    // Extract structured lines with coordinates
    const lines = rawLines
      .map((l, idx) => {
        const cleanText = (l.text || "").trim();
        return {
          text: cleanText,
          x: l.bbox?.x0 || 0,
          y: l.bbox?.y0 || idx * 24,
          width: (l.bbox?.x1 || 0) - (l.bbox?.x0 || 0),
          height: (l.bbox?.y1 || 0) - (l.bbox?.y0 || 0),
          confidence: l.confidence,
        };
      })
      .filter((l) => l.text.length > 0);

    const rawText = lines.map((l) => l.text).join("\n");

    if (!rawText || rawText.trim().length === 0) {
      throw new Error(
        "Could not detect readable text in the image. Please ensure the image is clear and not too blurry."
      );
    }

    return {
      rawText,
      lines,
      confidence: data.confidence || 0,
    };
  } catch (err) {
    if (worker) {
      try {
        await worker.terminate();
      } catch (termErr) {
        // ignore
      }
    }
    throw err;
  }
};

export default extractTextFromImage;

