/**
 * Match PDF routes: stay under typical serverless body limits (~4.5MB).
 */
export const MAX_IMAGE_API_BODY_BYTES = 3_600_000;

/** Reject decompressed images above this pixel count (memory safety). */
export const MAX_IMAGE_PIXELS = 25_000_000;

/** Max width/height passed to resize/crop APIs. */
export const MAX_IMAGE_SIDE = 8192;

export function canUseImageApi(fileSize: number): boolean {
  return fileSize > 0 && fileSize <= MAX_IMAGE_API_BODY_BYTES;
}
