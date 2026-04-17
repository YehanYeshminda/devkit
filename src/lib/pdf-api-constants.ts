/**
 * Vercel serverless request bodies are capped (~4.5MB on Hobby). Stay under that
 * so multipart PDF uploads succeed; larger files fall back to client-side pdf-lib.
 */
export const MAX_PDF_API_BODY_BYTES = 3_600_000;

/**
 * PDF → Base64 API: base64 expands ~4/3, so keep input PDF smaller so the JSON
 * response stays within the same order of magnitude as other PDF routes.
 */
export const MAX_PDF_TO_B64_API_FILE_BYTES = Math.floor((MAX_PDF_API_BODY_BYTES - 512) * (3 / 4));

/** Base64 → PDF API: raw base64 character budget (JSON body ~this + wrapper). */
export const MAX_B64_TO_PDF_API_CHARS = MAX_PDF_API_BODY_BYTES - 256;

export function sumFileSizes(files: { size: number }[]): number {
  return files.reduce((s, f) => s + f.size, 0);
}

export function canEncodePdfToBase64OnServer(fileSize: number): boolean {
  return fileSize > 0 && fileSize <= MAX_PDF_TO_B64_API_FILE_BYTES;
}

export function canDecodeBase64ToPdfOnServer(base64CharLength: number): boolean {
  return base64CharLength > 0 && base64CharLength <= MAX_B64_TO_PDF_API_CHARS;
}
