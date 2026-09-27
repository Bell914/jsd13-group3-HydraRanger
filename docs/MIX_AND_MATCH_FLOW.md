# Mix & Match — ขั้นตอนการทำงาน (Flow) และอธิบายโค้ด

ฟีเจอร์ Mix & Match ให้ลูกค้าอัปโหลดรูปเสื้อ/กางเกง แล้วให้ AI (Google Gemini) วิเคราะห์
และแนะนำ Lookbook 3 เซ็ตที่ใกล้เคียงที่สุด

## ภาพรวม Flow

```
┌─────────────────────────── Client (React) ───────────────────────────┐
│  MixAndMatchSection.jsx                                              │
│  1. เลือกรูป top / bottom ผ่าน ImageDropzone                         │
│  2. กด "ยืนยันการอัปโหลด"                                            │
│  3. recommendService.recommendLookbooks([{name, file}, ...])         │
│        │  POST /api/recommend  (FormData: top, bottom)               │
└────────│──────────────────────────────────────────────────────────────┘
         ▼
┌─────────────────────────── Server (Express) ─────────────────────────┐
│  routes/recommendRoutes.js                                           │
│    POST "/" → rate limit (10 ครั้ง/15 นาที)                          │
│             → memoryUpload (validate ไฟล์)                           │
│             → recommendLookbooks (controller)                        │
│                                                                      │
│  controllers/recommendController.js                                  │
│    ├─ สร้าง array images[] จาก multer (base64)                       │
│    ├─ analyzeClothingImage(images)        → ตรวจ + วิเคราะห์สี/สไตล์ │
│    ├─ findInvalidGarmentSlots()  ✋ ถ้ารูปไม่ใช่เสื้อผ้า → 422        │
│    ├─ getPublicLookbooks()                → ดึงลุคทั้งหมด             │
│    ├─ rankLookbooks(images, lookbooks)    → Gemini เลือก 3 อันดับ     │
│    └─ fallback: sort ด้วย scoreLookbook() ถ้า Gemini ล้มเหลว          │
│                                                                      │
│  services/geminiService.js                                           │
│    ├─ ANALYSIS_PROMPT  (เช็ค is_clothing + styles/colors/types)     │
│    └─ RANK_PROMPT      (ให้คะแนน 1-10 + เหตุผลเป็นไทย)              │
└────────│──────────────────────────────────────────────────────────────┘
         ▼
┌─────────────────────────── Client (React) ───────────────────────────┐
│  แสดง top 3 ลุคใน <RecommendProduct> พร้อม matchScore + เหตุผล       │
└───────────────────────────────────────────────────────────────────────┘
```

## รายละเอียดทีละขั้น

### 1. ฝั่ง Client — `MixAndMatchSection.jsx`

| State | ความหมาย |
|-------|-----------|
| `topFile` / `bottomFile` | ไฟล์รูปที่เลือก |
| `confirmed` | กดยืนยันแล้วหรือยัง (เปิดกล่องผลลัพธ์) |
| `recommending` | กำลังรอ AI |
| `aiRanked` | ได้ผลจัดอันดับจาก AI แล้ว |
| `recommendError` | ข้อความ error (เช่น รูปไม่ใช่เสื้อผ้า) |
| `recommendedLooks` | ลิสต์ลุค ผลลัพธ์จาก AI |

- ตอน mount จะ `getLookbooks()` โหลด lookbook ทั้งหมดมาแสดงเป็นค่าเริ่มต้นก่อน
- เมื่อเลือกไฟล์ใหม่ (`handleTopFileChange`/`handleBottomFileChange`) จะเรียก `resetRecommendation()`
  ยกเลิกผลลัพธ์เก่า และเพิ่ม `recommendationRequestId` เพื่อกันผลตอบกลับช้า (stale response) ของคำขอเก่ามาเขียนทับ
- `confirmRecommend()`
  1. รวมไฟล์ที่มีเป็น `[{name:"top"|"bottom", file}]`
  2. จอง `requestId` ใหม่ แล้วเรียก `recommendLookbooks(files)`
  3. สำเร็จ → อัปเดต `recommendedLooks` + `setAiRanked(true)`
  4. ล้มเหลว → เก็บ `error.message` (`setRecommendError`) + `setConfirmed(false)`
  5. `finally` → ปิด `recommending` (ถ้า requestId ยังเป็นตัวล่าสุด)

การ์ดผลลัพธ์จะโชว์เฉพาะเมื่อ `confirmed === true`: มี spinner ระหว่าง `recommending`
และแสดง `recommendedLooks.slice(0, 3)` ผ่าน `<RecommendProduct>`

### 2. ฝั่ง Client ส่งคำขอ — `recommendService.js`

```js
recommendLookbooks(images) {
  const formData = new FormData();
  images.forEach(({ name, file }) => formData.append(name, file));
  // POST {API_URL}/recommend ด้วย body = FormData (multipart)
  // ถ้า !response.ok → throw Error(result.message)
  // คืน { lookbooks, analysis }
}
```

### 3. ฝั่ง Server — Route และ middleware

`routes/recommendRoutes.js`
```js
router.post("/", recommendLimiter, memoryUpload, recommendLookbooks);
```
- `recommendLimiter`: rate limiter ชื่อ `recommend-images` 10 ครั้ง/15 นาที (shared ระหว่าง worker)
- `memoryUpload`: ตรวจไฟล์ก่อนถึง controller (ดูข้อ 4)

`middleware/recommendUploadMiddleware.js`
- รับแค่ `top` และ `bottom` อย่างละ 1 รูป (`multer.fields(...)`)
- ขนาดไม่เกิน `MAX_RECOMMEND_IMAGE_SIZE = 5 MB`
- ชนิดไฟล์: `image/jpeg | png | webp | gif`
- **Anti-spoof**: `matchesImageHeader(file)` ตรวจ magic bytes (header) ของไฟล์จริง
  เทียบกับ mimetype ที่ประกาศ กันมิจฉาชีพส่งนามสกุลปลอม
  - JPG → `FF D8 FF`
  - PNG → 8-byte signature
  - WebP → `RIFF....WEBP`
  - GIF → `GIF87a` / `GIF89a`
- error → `413` (ไฟล์ใหญ่เกิน) / `400` (ชนิดไม่รองรับ / header ผิด)

### 4. ฝั่ง Server — Controller `recommendController.js`

`recommendLookbooks(req, res, next)`
1. อ่าน `req.files.top` / `req.files.bottom` ถ้าไม่มีทั้งคู่ → `400`
2. สร้าง `images[] = [{ mimeType, data: base64, frame: "top"|"bottom" }]`
3. `analyzeClothingImage(images)` → ได้ `analysis` (styles, garment_types, colors, validation)
4. **Gate กันรูปไม่ใช่เสื้อผ้า**: `findInvalidGarmentSlots(images, analysis)`
   - ไล่ดู `analysis.validation` เทียบ `frame` กับ `isClothing === false`
   - เจอ → `422 { success:false, message, data:{ invalidSlots } }`
5. `getPublicLookbooks()` + `toPublicLook()` แปลงเป็น object หน้าตาที่ client ใช้
6. สร้าง `lookbookList` แบบย่อ (id, name, items, tags) ส่งให้ Gemini rank
7. `rankLookbooks(images, lookbookList)` → `[{lookbookId, score, reasons}]`
   - map ลับ `scoreMap` แล้วทับ `matchScore`/`matchReasons` ลงใน `publicLooks`
   - sort ตาม `matchScore` ลง แล้ว `slice(0, 3)`
8. **Fallback heuristic**: ถ้า Gemini rank ล้มเหลว (`NO_GEMINI_KEY`, `GEMINI_HTTP`, `GEMINI_EMPTY`, `GEMINI_INVALID`)
   → ใช้ `scoreLookbook()` (กฎในโค้ด: สี +2, ประเภท top/bottom +1..2, สไตล์ +1) แทน
9. ตอบ `200 { success:true, data:{ lookbooks, analysis } }`

`scoreLookbook(lookbook, analysis)` — คะแนนเชิงกติกา (ไม่ใช้ AI)
- ใช้ `COLOR_BUCKETS` จัดกลุ่มสี (white/black/gray/red/.../brown) จากคำค้น
- `itemSignature(item)` สรุปสี/หมวดหมู่/tags ของแต่ละ item ในลุค
- +2 สีตรง, +2 ประเภทตรง (top/bottom), +1 ถ้ามีประเภทนั้นในลุค, +1 ต่อสไตล์ที่ตรง

### 5. ฝั่ง Server — Gemini `geminiService.js`

`ANALYSIS_PROMPT` (เทมเพลตวิเคราะห์รูป)
- คืน JSON แบบตายตัว: `styles`, `garment_types`, `colors`, `valid[]`
- `valid[]` มี `frame`, `is_clothing`, `type` — ใช้ชี้ว่าแต่ละรูปเป็นเสื้อผ้าจริงหรือไม่

`RANK_PROMPT` (เทมเพลตจัดอันดับ)
- เปรียบเทียบรูปที่อัปโหลดกับลิสต์ลุค แล้วคืน `{ rankings: [{lookbookId, score(1–10), reasons[]}] }`
- `reasons` เป็นภาษาไทย (บอกเหตุผลว่าตรงแบบไหน)

จุดเด่นของโค้ด
- ตั้ง `responseMimeType: "application/json"` + `temperature: 0.2` ให้ผลลัพธ์คงที่
- `parseAnalysisJson()` / `parseRankingsJson()` ตัด ```json ``` ครอบออก, fallback regex ลอง parse อีกครั้ง
- ไม่เก็บภาพจริง — ส่งเป็น base64 ใน request เดียว (memory upload) แล้วทิ้ง

## ตาราง HTTP Status ของ `/api/recommend`

| Status | กรณี |
|--------|------|
| `200` | สำเร็จ ได้ `{ lookbooks, analysis }` |
| `400` | ไม่ส่งรูป / ชนิดไฟล์ไม่รองรับ / header ไฟล์ปลอม / ไม่มี GEMINI_API_KEY |
| `413` | รูปใหญ่เกิน 5 MB |
| `422` | รูปเป็นสิ่งที่ไม่ใช่เสื้อผ้า (ใบหน้า สัตว์ วิว ข้อความ ฯลฯ) |
| `429` | เกิน 10 ครั้ง / 15 นาที |
| `502` | Gemini ตอบ error / ว่าง / JSON ผิดรูปแบบ |

## Files ที่เกี่ยวข้อง

| ไฟล์ | บทบาท |
|------|--------|
| `client/src/components/MixAndMatchSection.jsx` | UI หลัก + สถานะของฟีเจอร์ |
| `client/src/components/ImageDropzone.jsx` | input อัปโหลดรูป |
| `client/src/services/recommendService.js` | ส่งคำขอไป `/recommend` |
| `server/src/routes/recommendRoutes.js` | route + rate limit |
| `server/src/middleware/recommendUploadMiddleware.js` | ตรวจไฟล์ (multer + magic bytes) |
| `server/src/controllers/recommendController.js` | orchestrate: วิเคราะห์ → ตรวจเป็นเสื้อผ้า → rank |
| `server/src/services/geminiService.js` | เรียก Gemini (analyze + rank) + parse JSON |
| `server/src/tests/followup.test.js` | tests: upload ต้อง fail ก่อน AI + 422 รูปไม่ใช่เสื้อผ้า |