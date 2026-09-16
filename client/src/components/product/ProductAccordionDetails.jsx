import React from "react";

export const ProductAccordionDetails = ({
  isDetailsOpen,
  setIsDetailsOpen,
  isMaterialsOpen,
  setIsMaterialsOpen,
}) => {
  return (
    <section className="my-12 max-w-5xl mx-auto rounded-2xl border-2 border-[#0095ff] bg-white p-6 sm:p-8 shadow-sm">
      {/* Section 1: รายละเอียด (Details) */}
      <div className="border-b border-gray-200 pb-6">
        <button
          type="button"
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
          className="flex w-full items-center justify-between text-left cursor-pointer"
        >
          <h2 className="text-lg sm:text-xl font-extrabold text-primary">
            รายละเอียด
          </h2>
          <span className="text-secondary font-bold text-xl">
            {isDetailsOpen ? "−" : "+"}
          </span>
        </button>

        {isDetailsOpen && (
          <div className="mt-4 space-y-4 text-sm text-gray-700 leading-relaxed">
            <ul className="space-y-1.5 list-none p-0 m-0">
              <li>- เสื้อทรงหลวมที่ได้แรงบันดาลใจจากยุคทศวรรษที่ 1990</li>
              <li>
                - ทรงกระชับเข้ารูปพร้อมดีเทลช่วงชายแบบปล่อยสไตล์สตรีท แมตช์กับกางเกงสไตล์แคชชวล ทางการ และมินิมอล
              </li>
            </ul>

            <div>
              <h3 className="font-bold text-primary mb-1">รายละเอียดการใช้งาน</h3>
              <ul className="space-y-1 list-none p-0 m-0 text-secondary">
                <li>- ดีไซน์ช่วงลำตัวโปร่งนุ่มสบาย 01 OFF WHITE มีความโปร่งเล็กน้อย</li>
                <li>- ทรง: ทรงเข้ารูป (Relaxed Fit)</li>
                <li>- กระเป๋า: ไม่มีกระเป๋า</li>
                <li>- รูปภาพที่แสดง อาจมีสีที่ยังไม่วางจำหน่าย</li>
              </ul>
            </div>

            <div className="pt-2 text-xs text-gray-500">
              <p>รหัสสินค้า: 465433, 474410, 460783</p>
              <p className="mt-0.5">
                โปรดทราบว่าสินค้านี้อาจมีรหัสสินค้าแตกต่างไปแม้จะเป็นสินค้าตัวเดียวกันก็ตาม
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Section 2: วัสดุ / การดูแล (Materials & Care) */}
      <div className="pt-6">
        <button
          type="button"
          onClick={() => setIsMaterialsOpen(!isMaterialsOpen)}
          className="flex w-full items-center justify-between text-left cursor-pointer"
        >
          <h2 className="text-lg sm:text-xl font-extrabold text-primary">
            วัสดุ / การดูแล
          </h2>
          <span className="text-secondary font-bold text-xl">
            {isMaterialsOpen ? "−" : "+"}
          </span>
        </button>

        {isMaterialsOpen && (
          <div className="mt-4 space-y-3 text-sm text-gray-700 leading-relaxed">
            <div>
              <h3 className="font-bold text-primary mb-1">รายละเอียดวัสดุ</h3>
              <p className="text-secondary">96% ฝ้าย, 4% สแปนเด็กซ์</p>
            </div>

            <div>
              <h3 className="font-bold text-primary mb-1">คำแนะนำในการซัก</h3>
              <p className="text-secondary">
                ซักเครื่อง ด้วยน้ำเย็น, ซักแห้ง, ห้ามปั่นแห้ง
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductAccordionDetails;
