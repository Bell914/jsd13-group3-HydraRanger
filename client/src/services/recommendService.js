import { API_URL } from "./api.js";

/**
 * Ask the backend to rank lookbooks closest to the uploaded garment photos.
 * @param {Array<{name: string, file: File}>} images - [{name: "top"|"bottom", file}]
 * @returns {Promise<{lookbooks: Array, analysis: Object}>}
 */
export async function recommendLookbooks(images) {
  const formData = new FormData();
  images.forEach(({ name, file }) => {
    if (file) formData.append(name, file);
  });

  const response = await fetch(`${API_URL}/recommend`, {
    method: "POST",
    body: formData,
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      result.message || "ไม่สามารถแนะนำลุคใกล้เคียงได้ในตอนนี้",
    );
    error.status = response.status;
    throw error;
  }

  return {
    lookbooks: Array.isArray(result.data?.lookbooks)
      ? result.data.lookbooks
      : [],
    analysis: result.data?.analysis || null,
    aiRanked:
      result.data?.aiRanked ?? Boolean(result.data?.analysis),
  };
}
