export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

// Ensure the worker version matches the pdfjs API version.
// Vite will copy this to an asset URL at build/dev time.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import pdfWorkerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

let pdfjsLib: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;

  isLoading = true;
  // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module
  loadPromise = import("pdfjs-dist/build/pdf.mjs").then((lib) => {
    lib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
    pdfjsLib = lib;
    isLoading = false;
    return lib;
  });

  return loadPromise;
}

export async function convertPdfToImage(
  file: File,
): Promise<PdfConversionResult> {
  try {
    const lib = await loadPdfJs();

    const arrayBuffer = await file.arrayBuffer();
    let pdf: any;
    try {
      pdf = await lib.getDocument({ data: arrayBuffer }).promise;
    } catch (err) {
      console.error("[pdf2img] getDocument failed", err);
      throw err;
    }

    let page: any;
    try {
      page = await pdf.getPage(1);
    } catch (err) {
      console.error("[pdf2img] getPage(1) failed", err);
      throw err;
    }

    const viewport = page.getViewport({ scale: 4 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (!context) {
      return {
        imageUrl: "",
        file: null,
        error: "Failed to get 2D canvas context",
      };
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    try {
      await page.render({ canvasContext: context, viewport }).promise;
    } catch (err) {
      console.error("[pdf2img] render failed", {
        err,
        viewport: { width: viewport.width, height: viewport.height, scale: 4 },
      });
      throw err;
    }

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create a File from the blob with the same name as the pdf
            const originalName = file.name.replace(/\.pdf$/i, "");
            const imageFile = new File([blob], `${originalName}.png`, {
              type: "image/png",
            });

            resolve({
              imageUrl: URL.createObjectURL(blob),
              file: imageFile,
            });
          } else {
            console.error("[pdf2img] canvas.toBlob returned null", {
              canvas: { width: canvas.width, height: canvas.height },
            });
            resolve({
              imageUrl: "",
              file: null,
              error: "Failed to create image blob",
            });
          }
        },
        "image/png",
        1.0,
      ); // Set quality to maximum (1.0)
    });
  } catch (err) {
    console.error("[pdf2img] Failed to convert PDF to image", err);
    return {
      imageUrl: "",
      file: null,
      error: `Failed to convert PDF: ${err}`,
    };
  }
}
