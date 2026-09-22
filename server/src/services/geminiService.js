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

const RANK_PROMPT = `You are a fashion stylist. A customer uploaded photos of a top garment and/or a bottom garment they own.

Compare the uploaded garments with the lookbook list below and pick the 3 looks most similar to what the customer uploaded.
Judge similarity by ALL of these:
1. garment type / product type (e.g. tee vs v-neck vs tank vs shirt vs oversized, and jeans vs chinos vs cargo vs trousers vs skirt)
2. colour closeness
3. material and style

Respond with STRICT JSON only (no markdown, no extra text):
{"rankings":[{"lookbookId":"LOOK-001","score":9,"reasons":["เสื้อยืดคอตตอน ทรงใกล้กับที่ลูกค้าอัปโหลด","สีขาวตรงกัน","สไตล์ minimal"]}]}

Rules:
- Exactly 3 rankings, best first.
- score must be an integer from 1 to 10.
- reasons in Thai, 1-3 short phrases about what matched (type/product/color/style).

Lookbooks:
`;

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
    if (match && match[0] !== cleaned) return parseAnalysisJson(match[0]);
    const error = new Error("Gemini response was not valid JSON");
    error.code = "GEMINI_INVALID";
    throw error;
  }
}

function parseRankingsJson(text) {
  const cleaned = text.replace(/```json|```/g, "").trim();

  try {
    const data = JSON.parse(cleaned);
    const rankings = Array.isArray(data.rankings) ? data.rankings : [];

    return rankings
      .filter((ranking) => ranking && ranking.lookbookId)
      .map((ranking) => ({
        lookbookId: String(ranking.lookbookId),
        score: Math.min(10, Math.max(1, Number(ranking.score) || 1)),
        reasons: Array.isArray(ranking.reasons) ? ranking.reasons : [],
      }));
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match && match[0] !== cleaned) return parseRankingsJson(match[0]);

    const error = new Error("Gemini rank response was not valid JSON");
    error.code = "GEMINI_INVALID";
    throw error;
  }
}

function buildGeminiBody(prompt, parts) {
  return {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }, ...parts],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  };
}

/**
 * Ask Gemini to rank lookbooks by similarity to the uploaded garments,
 * considering garment/product type, colour, material and style.
 * @param {Array<{mimeType: string, data: string, frame: 'top'|'bottom'}>} images
 * @param {Array<{id: string, name: string, items: string[], tags: string[]}>} lookbooks
 * @returns {Promise<Array<{lookbookId: string, score: number, reasons: string[]}>>}
 */
export async function rankLookbooks(images, lookbooks) {
  if (!ENV.GEMINI_API_KEY) {
    const error = new Error("GEMINI_API_KEY is not configured");
    error.code = "NO_GEMINI_KEY";
    throw error;
  }

  const parts = [
    { text: JSON.stringify(lookbooks, null, 1) },
    ...images.map((image) => ({
      inlineData: { mimeType: image.mimeType, data: image.data },
    })),
  ];

  const url = `${GEMINI_ENDPOINT}/${encodeURIComponent(
    ENV.GEMINI_MODEL,
  )}:generateContent?key=${encodeURIComponent(ENV.GEMINI_API_KEY)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildGeminiBody(RANK_PROMPT, parts)),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    const error = new Error(
      `Gemini rank request failed (${response.status}): ${text.slice(0, 300)}`,
    );
    error.code = "GEMINI_HTTP";
    throw error;
  }

  const result = await response.json();
  const text = result?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("");

  if (!text) {
    const error = new Error("Gemini returned an empty rank response");
    error.code = "GEMINI_EMPTY";
    throw error;
  }

  return parseRankingsJson(text);
}
