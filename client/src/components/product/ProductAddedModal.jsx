import React from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { normalizeImageUrl } from "../../utils/imageUtils.js";

export const ProductAddedModal = ({ addedItem, onClose }) => {
  if (!addedItem) return null;

  const imgSrc = normalizeImageUrl(addedItem.image) || addedItem.image;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-md rounded-3xl border border-occasion-border/40 bg-surface p-6 shadow-2xl text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <Check size={28} />
        </div>

        <h3 className="text-xl font-extrabold text-primary">
          เพิ่มลงในตะกร้าเรียบร้อยแล้ว!
        </h3>
        <p className="mt-1 text-xs text-secondary">
          สินค้าของคุณถูกบันทึกไว้ในตะกร้าสินค้าแล้ว
        </p>

        <div className="mt-5 flex items-center gap-4 rounded-2xl border border-occasion-border/20 bg-background/60 p-3 text-left">
          <img
            src={imgSrc}
            alt=""
            className="h-16 w-16 rounded-xl object-cover"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-primary truncate">
              {addedItem.productName}
            </h4>
            <p className="text-xs text-secondary mt-0.5">
              สี: <span className="font-semibold text-primary">{addedItem.color}</span> | ไซส์: <span className="font-semibold text-primary">{addedItem.size}</span>
            </p>
            <p className="text-xs text-accent font-bold mt-1">
              จำนวน: {addedItem.quantity} ชิ้น | รวม ฿{addedItem.total?.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link
            to="/cart"
            onClick={onClose}
            className="flex-1 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-accent-hover transition text-center cursor-pointer"
          >
            ไปที่ตะกร้าสินค้า →
          </Link>
          <Link
            to="/products"
            onClick={onClose}
            className="flex-1 rounded-xl border border-occasion-border/50 bg-surface px-4 py-2.5 text-sm font-semibold text-secondary hover:border-primary hover:text-primary transition text-center"
          >
            ← ดูสินค้าอื่นเพิ่มเติม
          </Link>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full text-center text-xs font-semibold text-secondary hover:text-primary transition cursor-pointer"
        >
          เลือกซื้อต่อในหน้านี้
        </button>
      </div>
    </div>
  );
};

export default ProductAddedModal;
