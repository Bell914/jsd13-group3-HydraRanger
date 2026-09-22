import { useEffect, useState } from "react";
import ImageDropzone from "./ImageDropzone.jsx";
import { RecommendProduct } from "../pages/RecommendProduct.jsx";
import { normalizeImageUrl } from "../utils/imageUtils.js";
import { getLookbooks } from "../services/lookbookService.js";
import { recommendLookbooks } from "../services/recommendService.js";

const MixAndMatchSection = ({ assets }) => {
  const [topUrl, setTopUrl] = useState("");
  const [bottomUrl, setBottomUrl] = useState("");
  const [topFile, setTopFile] = useState(null);
  const [bottomFile, setBottomFile] = useState(null);
  const [recommendedLooks, setRecommendedLooks] = useState([]);
  const [recommending, setRecommending] = useState(false);
  const [aiRanked, setAiRanked] = useState(false);

  useEffect(() => {
    let mounted = true;
    getLookbooks()
      .then((lookbooks) => {
        if (!mounted) return;
        setRecommendedLooks(
          (Array.isArray(lookbooks) ? lookbooks : []).map((look) => ({
            ...look,
            image: normalizeImageUrl(look?.image),
          })),
        );
      })
      .catch(() => {
        if (mounted) setRecommendedLooks([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const files = [];
    if (topFile) files.push({ name: "top", file: topFile });
    if (bottomFile) files.push({ name: "bottom", file: bottomFile });
    if (files.length === 0) return;

    let cancelled = false;
    setRecommending(true);
    recommendLookbooks(files)
      .then(({ lookbooks }) => {
        if (cancelled) return;
        if (lookbooks.length > 0) {
          setRecommendedLooks(
            lookbooks.map((look) => ({
              ...look,
              image: normalizeImageUrl(look?.imageUrl || look?.image),
            })),
          );
          setAiRanked(true);
        }
      })
      .catch(() => {
        if (!cancelled) setAiRanked(false);
      })
      .finally(() => {
        if (!cancelled) setRecommending(false);
      });
    return () => {
      cancelled = true;
    };
  }, [topFile, bottomFile]);

  const hasAnyUpload = Boolean(topUrl || bottomUrl);

  return (
    <div className="my-12 flex flex-col gap-8 rounded-2xl bg-accent p-6 sm:p-10">
      <div className="flex flex-col justify-between gap-8 lg:flex-row">
      {/* ส่วนเนื้อหาคำอธิบายและขั้นตอน */}
      <div className="flex flex-col p-9 lg:w-2/3">
        <div className="mb-6 text-white">
          <p className="text-sm font-bold tracking-wider opacity-80">
            MIX AND MATCH
          </p>
          <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
            หมดปัญหาซื้อเสื้อไปแล้วไม่รู้จะแมตช์กับกางเกงตัวไหน!
          </h2>
          <p className="mt-2 text-white/90">
            ทดลองจับคู่ลุคโปรดของคุณในระบบจำลองห้องแต่งตัวก่อนสั่งซื้อ
          </p>
        </div>

        <ol className="flex flex-col gap-4 text-white">
          <li className="flex items-center gap-3">
            <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-primary font-bold text-white">
              1
            </span>
            <span>
              เลือกชิ้นส่วนเสื้อผ้า เลือกเสื้อ ท่อนล่าง
              และเครื่องประดับที่คุณชอบ
            </span>
          </li>
          <li className="flex items-center gap-3">
            <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-primary font-bold text-white">
              2
            </span>
            <span>
              ดูพรีวิวบนหุ่นจำลอง ระบบจะจัดเรียงชุดให้เห็นสไตล์โดยรวมทันที
            </span>
          </li>
          <li className="flex items-center gap-3">
            <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-primary font-bold text-white">
              3
            </span>
            <span>
              เพิ่มลงตะกร้าพร้อมกันทั้งเซ็ต รับส่วนลดพิเศษทันที 10%
              เมื่อซื้อยกเซ็ต
            </span>
          </li>
        </ol>
      </div>

      {/* ส่วน Dropzone สำหรับอัปโหลดรูปภาพ */}
      <div className="flex flex-col justify-center gap-4 sm:flex-row lg:w-1/3 lg:flex-col">
        <ImageDropzone
          assets={assets}
          label="อัปโหลดเสื้อ / ท่อนบน"
          onChange={setTopUrl}
          onFileChange={setTopFile}
        />
        <ImageDropzone
          assets={assets}
          label="อัปโหลดกางเกง / ท่อนล่าง"
          onChange={setBottomUrl}
          onFileChange={setBottomFile}
        />
        {recommending ? (
          <p className="text-center text-xs text-white/80">
            กำลังวิเคราะห์รูปด้วย AI หาลุคใกล้เคียง...
          </p>
        ) : topUrl && bottomUrl ? (
          <p className="text-center text-xs text-white/80">
            อัปโหลดครบทั้ง 2 ชิ้น! ดูเซ็ตแนะนำด้านล่าง
          </p>
        ) : hasAnyUpload ? (
          <p className="text-center text-xs text-white/80">
            อัปโหลดแค่ชิ้นเดียวก็ได้ เซ็ตแนะนำแสดงด้านล่างแล้ว
          </p>
        ) : (
          <p className="text-center text-xs text-white/80">
            อัปโหลดเสื้อหรือกางเกงอย่างน้อย 1 ชิ้น แล้วดูเซ็ตแนะนำ
          </p>
        )}
      </div>
      </div>

      {/* เซ็ตแนะนำ Lookbook ใกล้เคียงกับที่ลูกค้าเลือก */}
      {hasAnyUpload && (
        <div className="border-t border-white/20 pt-8">
          <div className="mb-6 text-center md:text-left">
            <p className="text-sm font-bold tracking-wider text-white opacity-80">
              LOOKBOOK RECOMMEND
            </p>
            <h3 className="mt-1 text-2xl font-bold text-white">
              เซ็ตแนะนำที่แมตช์กับชิ้นส่วนที่คุณเลือก
            </h3>
            {aiRanked && !recommending && (
              <p className="mt-1 text-xs text-white/70">
                จัดอันดับโดย AI จากรูปที่คุณอัปโหลด
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 gap-6 sm:px-0 md:grid-cols-3">
            {recommendedLooks.slice(0, 3).map((look, index) => (
              <RecommendProduct
                key={look._id || look.id || `lookbook-${index}`}
                product={look}
                index={index}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MixAndMatchSection;
