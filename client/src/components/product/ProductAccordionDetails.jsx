import React from "react";

export const ProductAccordionDetails = ({
  product,
  selectedVariant,
  isDetailsOpen,
  setIsDetailsOpen,
  isMaterialsOpen,
  setIsMaterialsOpen,
}) => {
  return (
    <section className="my-12 max-w-5xl mx-auto overflow-hidden rounded-2xl border border-[#ded8cf] bg-white px-6 sm:px-8 shadow-sm">
      {/* Section 1: รายละเอียด (Details) */}
      <div className="border-b border-gray-200 py-6">
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
            <p>{product?.description || "รายละเอียดสินค้าจะอัปเดตเร็ว ๆ นี้"}</p>

            <div className="pt-2 text-xs text-gray-500">
              <p>รหัสสินค้า {selectedVariant?.sku || product?.sku || product?.productId || "-"}</p>
            </div>
          </div>
        )}
      </div>

      {/* Section 2: วัสดุ / การดูแล (Materials & Care) */}
      <div className="py-6">
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
