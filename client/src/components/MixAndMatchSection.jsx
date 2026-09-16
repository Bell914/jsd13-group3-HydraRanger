const MixAndMatchSection = ({ assets }) => {
  return (
    <div className="my-12 flex flex-col justify-between gap-8 rounded-2xl bg-accent p-6 sm:p-10 lg:flex-row">
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
        <DropzoneBox assets={assets} />
        <DropzoneBox assets={assets} />
      </div>
    </div>
  );
};

// Sub-component สำหรับกล่อง Dropzone เพื่อความสะอาดของโค้ด
const DropzoneBox = ({ assets }) => (
  <div className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-white/40 bg-secondary/80 p-12 transition hover:bg-secondary lg:bg-gray-600">
    <div className="flex items-center gap-3 text-white">
      <img src={assets?.camera} alt="icon" className="h-6 w-6 object-contain" />
      <span className="font-medium">ลากรูปมาที่นี่</span>
    </div>
  </div>
);

export default MixAndMatchSection;
