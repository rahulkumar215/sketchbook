import { IMAGE_MIME_TYPES } from "@/lib/validators";

const ALLOWED = new Set<string>(IMAGE_MIME_TYPES);
/** Re-encoding these would lose animation (gif) or vector quality (svg). */
const KEEP_AS_IS = new Set(["image/svg+xml", "image/gif"]);
const WEBP_QUALITY = 0.85;

type Encoded = { dataURL: string; mimeType: string };

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not decode image"));
    img.src = src;
  });
}

async function toWebp(dataURL: string): Promise<string | null> {
  const img = await loadImage(dataURL);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0);
  const webp = canvas.toDataURL("image/webp", WEBP_QUALITY);
  // Browsers that can't encode WebP silently return PNG instead.
  return webp.startsWith("data:image/webp") ? webp : null;
}

/**
 * Shrinks a pasted screenshot before it is stored: re-encodes it as WebP
 * when that is smaller (typically 40-70% for screenshots). Types the server
 * doesn't accept are always converted.
 */
export async function compressImage(
  dataURL: string,
  mimeType: string,
): Promise<Encoded> {
  if (KEEP_AS_IS.has(mimeType)) return { dataURL, mimeType };
  try {
    const webp = await toWebp(dataURL);
    if (webp && (webp.length < dataURL.length || !ALLOWED.has(mimeType))) {
      return { dataURL: webp, mimeType: "image/webp" };
    }
  } catch (error) {
    console.warn("Image compression skipped:", error);
  }
  return { dataURL, mimeType };
}
