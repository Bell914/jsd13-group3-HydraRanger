import { useEffect, useRef, useState } from "react";
import ImageDropzone from "./ImageDropzone.jsx";
import { RecommendProduct } from "../pages/RecommendProduct.jsx";
import { normalizeImageUrl } from "../utils/imageUtils.js";
import { getLookbooks } from "../services/lookbookService.js";
import { recommendLookbooks } from "../services/recommendService.js";

const MixAndMatchSection = ({ assets }) => {
  const [topFile, setTopFile] = useState(null);
  const [bottomFile, setBottomFile] = useState(null);
  const [recommendedLooks, setRecommendedLooks] = useState([]);
  const [recommending, setRecommending] = useState(false);
  const [aiRanked, setAiRanked] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [recommendError, setRecommendError] = useState("");
  const recommendationRequestId = useRef(0);

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

  const hasFiles = Boolean(topFile || bottomFile);

  const resetRecommendation = () => {
    recommendationRequestId.current += 1;
    setConfirmed(false);
    setAiRanked(false);
    setRecommending(false);
    setRecommendError("");
  };

  const handleTopFileChange = (file) => {
    setTopFile(file);
    resetRecommendation();
  };

  const handleBottomFileChange = (file) => {
    setBottomFile(file);
    resetRecommendation();
  };

  const confirmRecommend = () => {
    const files = [];
    if (topFile) files.push({ name: "top", file: topFile });
    if (bottomFile) files.push({ name: "bottom", file: bottomFile });
    if (files.length === 0) return;

    const requestId = recommendationRequestId.current + 1;
    recommendationRequestId.current = requestId;
    setConfirmed(true);
    setRecommending(true);
    setRecommendError("");
    recommendLookbooks(files)
      .then(({ lookbooks, aiRanked }) => {
        if (requestId !== recommendationRequestId.current) return;
        if (lookbooks.length > 0) {
          setRecommendedLooks(
            lookbooks.map((look) => ({
              ...look,
              image: normalizeImageUrl(look?.imageUrl || look?.image),
            })),
          );
          setAiRanked(Boolean(aiRanked));
        }
      })
      .catch((error) => {
        if (requestId === recommendationRequestId.current) {
          setAiRanked(false);
          setConfirmed(false);
          setRecommendError(error?.message || "ไม่สามารถแนะนำลุคได้ในตอนนี้");
        }
      })
      .finally(() => {
        if (requestId === recommendationRequestId.current) {
          setRecommending(false);
        }
      });
  };

  return (
    <div className="my-12 flex flex-col gap-8 rounded-2xl bg-accent px-4 py-10 sm:px-6 sm:py-12 lg:px-10">
      <div className="flex flex-col justify-between gap-8 lg:flex-row">
        {/* ส่วนเนื้อหาคำอธิบายและขั้นตอน */}
        <div className="flex w-full flex-col px-2 pt-2 sm:px-6 sm:pt-6 lg:w-2/3 lg:p-9">
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

          <ol className="grid grid-cols-1 gap-3 text-white sm:grid-cols-3 sm:gap-4">
            {[
              { n: 1, text: "เลือกเสื้อ / กางเกงที่คุณมี" },
              { n: 2, text: "AI วิเคราะห์สี สไตล์ และประเภทเสื้อผ้า" },
              { n: 3, text: "รับลุคที่แมตช์ที่สุด 3 ลุคจาก Lookbook" },
            ].map((step) => (
              <li
                key={step.n}
                className="flex items-center gap-3 rounded-xl bg-white/10 p-3"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-extrabold text-white">
                  {step.n}
                </span>
                <span className="text-sm leading-snug text-white/90 sm:text-xs lg:text-sm">
                  {step.text}
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-6 flex flex-1 items-end gap-3">
            <img
              src="/collection-2026/lookbook/look-02-weekend-market.png"
              alt="ลุค Mix & Match สไตล์ช้อปปิ้งสุดสัปดาห์"
              className="h-36 min-w-0 w-1/2 rounded-xl object-cover object-top shadow-lg sm:h-52 md:h-56 lg:h-64 xl:h-72"
              loading="lazy"
            />
            <img
              src="/collection-2026/lookbook/look-01-city-museum.png"
              alt="ลุค Mix & Match เก๋ไก๋กลางเมือง"
              className="h-36 min-w-0 w-1/2 rounded-xl object-cover object-top shadow-lg sm:h-52 md:h-56 lg:h-64 xl:h-72"
              loading="lazy"
            />
          </div>
        </div>

        {/* ส่วน Dropzone สำหรับอัปโหลดรูปภาพ */}
        <div className="flex w-full flex-col justify-center gap-4 lg:w-1/3">
          <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
            <ImageDropzone
              assets={assets}
              label="อัปโหลดเสื้อ / ท่อนบน"
              onFileChange={handleTopFileChange}
              persistUpload={false}
              className="w-full sm:w-1/2 lg:w-full"
              buttonClassName="h-44 sm:h-56 xl:h-64"
            />
            <ImageDropzone
              assets={assets}
              label="อัปโหลดกางเกง / ท่อนล่าง"
              onFileChange={handleBottomFileChange}
              persistUpload={false}
              className="w-full sm:w-1/2 lg:w-full"
              buttonClassName="h-44 sm:h-56 xl:h-64"
            />
          </div>
          <button
            type="button"
            onClick={confirmRecommend}
            disabled={!hasFiles || recommending}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all ${
              !hasFiles || recommending
                ? "cursor-not-allowed bg-white/20 text-white/60"
                : "cursor-pointer bg-white text-foreground hover:opacity-85 active:scale-95"
            }`}
          >
            {recommending ? "กำลังวิเคราะห์..." : "ยืนยันการอัปโหลด"}
          </button>
          {recommendError ? (
            <p
              className="text-center text-xs font-semibold text-red-200"
              role="alert"
            >
              {recommendError}
            </p>
          ) : recommending ? (
            <p className="text-center text-xs text-white/80">
              กำลังวิเคราะห์รูปด้วย AI หาลุคใกล้เคียง...
            </p>
          ) : hasFiles && !confirmed ? (
            <p className="text-center text-xs text-white/80">
              เลือกภาพแล้ว กด "ยืนยันการอัปโหลด" เพื่อให้ AI วิเคราะห์ลุค
            </p>
          ) : confirmed ? (
            <p className="text-center text-xs text-white/80">
              การวิเคราะห์เสร็จสิ้น ดูเซ็ตแนะนำด้านล่าง
            </p>
          ) : (
            <p className="text-center text-xs text-white/80">
              อัปโหลดเสื้อหรือกางเกงอย่างน้อย 1 ชิ้น
              แล้วกดยืนยันเพื่อดูเซ็ตแนะนำ
            </p>
          )}
        </div>
      </div>

      {/* เซ็ตแนะนำ Lookbook ใกล้เคียงกับที่ลูกค้าเลือก */}
      {confirmed ? (
        <div className="border-t border-white/20 pt-8">
          <div className="mb-6 text-center md:text-left">
            <p className="text-sm font-bold tracking-wider text-white opacity-80">
              LOOKBOOK RECOMMEND
            </p>
            <h3 className="mt-1 text-2xl font-bold text-white">
              เซ็ตแนะนำที่แมตช์กับชิ้นส่วนที่คุณเลือก
            </h3>
            {recommending ? (
              <p className="mt-1 text-xs text-white/70">
                กำลังวิเคราะห์รูปด้วย AI...
              </p>
            ) : aiRanked ? (
              <p className="mt-1 text-xs text-white/70">
                จัดอันดับโดย AI จากรูปที่คุณอัปโหลด
              </p>
            ) : (
              <p className="mt-1 text-xs text-white/70">
                AI ไม่พร้อมใช้งานชั่วคราว แสดงลุคทั้งหมดจากคอลเลกชัน
              </p>
            )}
          </div>

          {recommending ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-white/10 py-16">
              <span
                className="h-10 w-10 animate-spin rounded-full border-3 border-white/30 border-t-white"
                aria-hidden="true"
              />
              <p className="text-sm font-medium text-white/85">
                กำลังประมวลผลด้วย AI... รอสักครู่
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recommendedLooks.slice(0, 3).map((look, index) => (
                <RecommendProduct
                  key={look._id || look.id || `lookbook-${index}`}
                  product={look}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default MixAndMatchSection;
