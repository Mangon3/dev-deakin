const MAX_DIMENSION = 1200;
const QUALITY = 0.75;

export const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

export async function fileToDataUrl(file: File): Promise<string> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Please choose a PNG, JPEG or WebP image.");
  }

  const bitmap = await createImageBitmap(file);

  // Only shrink, never enlarge
  const scale = Math.min(
    1,
    MAX_DIMENSION / Math.max(bitmap.width, bitmap.height)
  );

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not process that image.");
  }

  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", QUALITY);
}
