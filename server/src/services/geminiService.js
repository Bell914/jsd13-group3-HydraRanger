import { ENV } from "../config/env.js";

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models";

const ANALYSIS_PROMPT = `You are a fashion stylist assistant. Analyze the clothing photo(s) provided.

Input: one clothing image (top garment) and/or a second clothing image (bottom garment), in that order. Some may be missing.

Respond with STRICT JSON only (no markdown, no extra text):
{
  "styles": ["up to 3 short english lowercase style words, e.g. casual, minimal, street, office, resort, vintage, sporty"],
  "garment_types": ["top" | "bottom" | "both" | "other"],
  "colors": [{"name": "english color name", "hex": "#rrggbb"}]
}`;

/**
 * Call Gemini with one or two images and ask for a structured description.
 * @param {Array<{mimeType: string, data: string, frame: 'top'|'bottom'}>} images
 * @returns {Promise<{styles: string[], garment_types: string[], colors: Array<{name:string, hex:string}>}>}
 */
export async function analyzeClothingImage(images) {
  if (!ENV.GEMINI_API_KEY) {
    const error = new Error("GEMINI_API_KEY is not configured");
    error.code = "NO_GEMINI_KEY";
    throw error;
  }

  const parts = images.map((image) => ({
    inlineData: { mimeType: image.mimeType, data: image.data },
  }));

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { text: ANALYSIS_PROMPT },
          { text: "Analyze these garment images:" },
          ...parts,
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  };

  const url = `${GEMINI_ENDPOINT}/${encodeURIComponent(
    ENV.GEMINI_MODEL,
  )}:generateContent?key=${encodeURIComponent(ENV.GEMINI_API_KEY)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    const error = new Error(
      `Gemini request failed (${response.status}): ${text.slice(0, 300)}`,
    );
    error.code = "GEMINI_HTTP";
    throw error;
  }

  const result = await response.json();
  const text = result?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("");

  if (!text) {
    const error = new Error("Gemini returned an empty response");
    error.code = "GEMINI_EMPTY";
    throw error;
  }

  return parseAnalysisJson(text);
}

function parseAnalysisJson(text) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  try {
    const data = JSON.parse(cleaned);
    return {
      styles: Array.isArray(data.styles) ? data.styles : [],
      garment_types: Array.isArray(data.garment_types)
        ? data.garment_types
        : [],
      colors: Array.isArray(data.colors)
        ? data.colors
            .filter((c) => c && c.name)
            .map((c) => ({ name: String(c.name), hex: c.hex || "" }))
        : [],
    };
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return parseAnalysisJson(match[0]);
    throw new Error("Gemini response was not valid JSON");
  }
}