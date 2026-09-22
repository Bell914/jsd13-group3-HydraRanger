import { HTTP_STATUS } from "../config/constants.js";
import multer from "multer";
import * as lookbookService from "../services/lookbookService.js";
import {
  analyzeClothingImage,
  rankLookbooks,
} from "../services/geminiService.js";

const memoryUpload = multer({ storage: multer.memoryStorage() }).fields([
  { name: "top", maxCount: 1 },
  { name: "bottom", maxCount: 1 },
]);

const COLOR_BUCKETS = [
  { name: "white", keywords: ["white", "off white", "cream", "ivory", "beige"] },
  { name: "black", keywords: ["black", "charcoal", "graphite", "dark"] },
  { name: "gray", keywords: ["gray", "grey", "silver", "heather"] },
  { name: "red", keywords: ["red", "terracotta", "burgundy", "wine", "pink", "coral"] },
  { name: "orange", keywords: ["orange", "sand", "tan", "camel", "rust"] },
  { name: "yellow", keywords: ["yellow", "gold", "ochre", "mustard"] },
  { name: "green", keywords: ["green", "olive", "forest", "sage", "khaki", "army"] },
  { name: "blue", keywords: ["blue", "navy", "indigo", "denim", "sky", "teal", "aqua", "cyan"] },
  { name: "purple", keywords: ["purple", "violet", "lavender", "lilac"] },
  { name: "brown", keywords: ["brown", "taupe", "chocolate", "mocha", "tan"] },
];

function bucketOf(colorName) {
  const name = String(colorName || "").toLowerCase().trim();
  for (const bucket of COLOR_BUCKETS) {
    if (bucket.keywords.some((word) => name.includes(word))) {
      return bucket.name;
    }
  }
  return "";
}

function itemSignature(item) {
  const product = item?.product || {};
  const variants = product.variants || item?.variants || [];
  const colors = [
    ...new Set(
      variants
        .map((v) => bucketOf(v.color || v.colorCode || ""))
        .filter(Boolean),
    ),
  ];
  const category = String(
    product.category_id?.slug ||
      product.category?.slug ||
      product.category ||
      "",
  )
    .toLowerCase()
    .trim();
  const tags = (product.tags || []).map((t) => String(t).toLowerCase());
  return { colors, category, tags };
}

function scoreLookbook(lookbook, analysis) {
  const detectedColors = analysis.colors
    .map((c) => bucketOf(c.name))
    .filter(Boolean);
  const detectedTypes = analysis.garment_types.map((t) =>
    String(t).toLowerCase(),
  );
  const detectedStyles = analysis.styles.map((s) => String(s).toLowerCase());

  let score = 0;
  const reasons = [];

  const itemSignatures = (lookbook.items || []).map(itemSignature);

  for (const detectedColor of detectedColors) {
    const matched = itemSignatures.find((sig) =>
      sig.colors.includes(detectedColor),
    );
    if (matched) {
      score += 2;
      reasons.push(`สี ${detectedColor}`);
      break;
    }
  }

  const hasTop = detectedTypes.includes("top") || itemSignatures.some((sig) => sig.category.includes("top"));
  const hasBottom =
    detectedTypes.includes("bottom") ||
    itemSignatures.some((sig) => sig.category.includes("bottom"));

  if (detectedTypes.includes("top")) {
    const matchedTop = itemSignatures.some((sig) =>
      sig.category.includes("top"),
    );
    if (matchedTop) score += 2;
    else if (hasTop) score += 1;
  }

  if (detectedTypes.includes("bottom")) {
    const matchedBottom = itemSignatures.some((sig) =>
      sig.category.includes("bottom"),
    );
    if (matchedBottom) score += 2;
    else if (hasBottom) score += 1;
  }

  for (const style of detectedStyles) {
    const anyTag = itemSignatures.some((sig) =>
      sig.tags.some((tag) => tag.includes(style)),
    );
    if (anyTag) {
      score += 1;
      reasons.push(`สไตล์ ${style}`);
    }
  }

  return { score, reasons };
}

function toPublicLook(lookbook, analysis) {
  const { score, reasons } = scoreLookbook(lookbook, analysis);
  const lookId = lookbook.lookbookId
    ? String(lookbook.lookbookId)
    : `LOOK-${String(lookbook._id || "").replace(/[^a-zA-Z0-9]/g, "")}`;
  const firstVariantImage =
    lookbook.items?.[0]?.product?.variants?.[0]?.imageUrl || "";
  return {
    id: lookId,
    lookbookId: lookId,
    name: lookbook.name || lookbook.title || "",
    imageUrl: lookbook.imageUrl || lookbook.image || firstVariantImage,
    items: (lookbook.items || []).map((item) => ({
      productId: item.product?.productId || item.product?._id,
      name: item.product?.name || item.product?.title || "",
      image:
        item.product?.variants?.[0]?.imageUrl ||
        item.product?.imageUrl ||
        "",
      sku: item.defaultVariantSku || item.sku || "",
    })),
    matchScore: score,
    matchReasons: reasons,
  };
}

export async function recommendLookbooks(req, res, next) {
  try {
    const files = req.files || {};
    const topFile = files.top?.[0];
    const bottomFile = files.bottom?.[0];

    if (!topFile && !bottomFile) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "ส่งรูปเสื้อ/กางเกงอย่างน้อย 1 รูปเพื่อให้แนะนำลุค",
      });
    }

    console.log(
      `🎯 [Mix & Match] เริ่มใช้งาน recommend | ${new Date().toISOString()} | ` +
        `top: ${topFile ? `${topFile.originalname} (${topFile.size} bytes)` : "—"} | ` +
        `bottom: ${bottomFile ? `${bottomFile.originalname} (${bottomFile.size} bytes)` : "—"}`,
    );

    const images = [];
    if (topFile) {
      images.push({
        mimeType: topFile.mimetype,
        data: topFile.buffer.toString("base64"),
        frame: "top",
      });
    }
    if (bottomFile) {
      images.push({
        mimeType: bottomFile.mimetype,
        data: bottomFile.buffer.toString("base64"),
        frame: "bottom",
      });
    }

    const analysis = await analyzeClothingImage(images);
    const lookbooks = await lookbookService.getPublicLookbooks();

    const publicLooks = lookbooks
      .map((lookbook) => toPublicLook(lookbook, analysis))
      .filter((look) => look.imageUrl && look.id);

    const lookbookList = lookbooks.map((lookbook) => ({
      id: String(lookbook.lookbookId || ""),
      name: lookbook.name || lookbook.title || "",
      items: (lookbook.items || [])
        .map((item) => item.product?.name || item.product?.title || "")
        .filter(Boolean),
      tags: Array.isArray(lookbook.styleTags) ? lookbook.styleTags : [],
    }));

    let ranked;
    try {
      const rankings = await rankLookbooks(images, lookbookList);
      const scoreMap = new Map(rankings.map((r) => [r.lookbookId, r]));
      ranked = publicLooks
        .map((look) => {
          const rank = scoreMap.get(look.id);
          if (rank) {
            look.matchScore = rank.score;
            look.matchReasons = rank.reasons;
          }
          return look;
        })
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 3);
    } catch (rankError) {
      if (
        rankError.code === "NO_GEMINI_KEY" ||
        rankError.code === "GEMINI_HTTP" ||
        rankError.code === "GEMINI_EMPTY" ||
        rankError.code === "GEMINI_INVALID"
      ) {
        console.warn(
          `⚠️  [Mix & Match] rankLookbooks ล้มเหลว ใช้ heuristic แทน: ${rankError.message}`,
        );
        ranked = [...publicLooks]
          .sort((a, b) => b.matchScore - a.matchScore)
          .slice(0, 3);
      } else {
        throw rankError;
      }
    }

    const analysisSummary = {
      styles: analysis.styles,
      garmentTypes: analysis.garment_types,
      colors: analysis.colors,
    };

    console.log(
      `✅ [Mix & Match] ประมวลผลเสร็จ | ${new Date().toISOString()} | ` +
        `AI ตรวจจับ: styles=${JSON.stringify(analysisSummary.styles)} ` +
        `types=${JSON.stringify(analysisSummary.garmentTypes)} ` +
        `colors=${JSON.stringify(analysisSummary.colors)}`,
    );
    console.log(
      `  🔍 [Mix & Match] ลุคที่แนะนำ (top 3): ` +
        ranked
          .map(
            (look, i) =>
              `${i + 1}. ${look.id} "${look.name}" score=${look.matchScore} ` +
              `reasons=[${(look.matchReasons || []).join(", ")}]`,
          )
          .join(" | "),
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { lookbooks: ranked, analysis: analysisSummary },
    });
  } catch (error) {
    if (error.code === "NO_GEMINI_KEY") {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "ระบบ AI ยังไม่ได้ตั้งค่า GEMINI_API_KEY",
      });
    }
    if (
      error.code === "GEMINI_HTTP" ||
      error.code === "GEMINI_EMPTY" ||
      error.code === "GEMINI_INVALID"
    ) {
      return res.status(HTTP_STATUS.BAD_GATEWAY || 502).json({
        success: false,
        message: "ไม่สามารถวิเคราะห์รูปได้ในตอนนี้ กรุณาลองใหม่",
      });
    }
    next(error);
  }
}

export { memoryUpload };
