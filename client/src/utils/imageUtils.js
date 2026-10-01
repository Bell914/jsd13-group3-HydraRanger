/**
 * Utility functions for normalizing image paths to point directly to
 * /collection-2026/all-images/<filename>
 */

export function normalizeImageUrl(path) {
  if (!path || typeof path !== "string") return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.includes("/all-images/")) return path;

  // Extract base filename e.g. "top-01-off-white.png" or "look-01-city-museum.png"
  let filename = path.split("/").pop().replace("-front.png", ".png");
  return `/collection-2026/all-images/${filename}`;
}

export function getDetailImageSet(imagePath) {
  const norm = normalizeImageUrl(imagePath);
  if (!norm) return [];
  if (norm.includes("look-") || norm.includes("-back.png") || norm.includes("-detail.png")) {
    return [norm];
  }
  const base = norm.replace(/\.png$/i, "");
  return [
    `${base}.png`,
    `${base}-back.png`,
    `${base}-detail.png`,
  ];
}
