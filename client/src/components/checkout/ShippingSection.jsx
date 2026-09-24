import React, { useState } from "react";
import { Gift, ChevronDown, Plus, Minus } from "lucide-react";

export const SHIPPING_METHODS = [
  {
    id: "standard",
    name: "STANDARD SHIPPING (FREE)",
    duration: "2-6 business days",
    price: 0,
    estimatedDelivery: "Sat, Aug 8",
  },
  {
    id: "express",
    name: "EXPRESS SHIPPING (฿50.00)",
    duration: "in 2-4 business days",
    price: 50,
    estimatedDelivery: "2-4 วันทำการ",
  },
  {
    id: "priority",
    name: "PRIORITY SHIPPING (฿100.00)",
    duration: "in 1-2 business days",
    price: 100,
    estimatedDelivery: "1-2 วันทำการ",
  },
];

export default function ShippingSection({
  shippingData,
  onChangeShipping,
  isCollapsed,
  onEdit,
  onContinue,
  onBack,
  savedAddresses = [],
  onSelectAddress,
  onAddNewAddress,
}) {
  const [showDeliveryNote, setShowDeliveryNote] = useState(
    Boolean(shippingData.deliveryNote)
  );
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!shippingData.firstName?.trim()) errs.firstName = "กรุณากรอกชื่อ";
    if (!shippingData.lastName?.trim()) errs.lastName = "กรุณากรอกนามสกุล";
    if (!shippingData.phone?.trim()) errs.phone = "กรุณากรอกเบอร์โทรศัพท์";
    if (!shippingData.address?.trim()) errs.address = "กรุณากรอกที่อยู่จัดส่ง";
    if (!shippingData.city?.trim()) errs.city = "กรุณากรอกเมือง/อำเภอ";
    if (!shippingData.state?.trim()) errs.state = "กรุณาเลือกหรือระบุรัฐ/จังหวัด";
    if (!shippingData.zipCode?.trim()) errs.zipCode = "กรุณากรอกรหัสไปรษณีย์";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onContinue();
    }
  };

  const selectedMethod =
    SHIPPING_METHODS.find((m) => m.id === shippingData.shippingMethod) ||
    SHIPPING_METHODS[0];

  // Collapsed View for Step 3 and 4
  if (isCollapsed) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-900">Shipping</h2>
          <button
            type="button"
            onClick={onEdit}
            className="text-sm font-semibold text-gray-900 underline hover:text-gray-600 transition-colors cursor-pointer"
          >
            Edit
          </button>
        </div>
        <div className="text-sm text-gray-700 space-y-1">
          <p className="font-semibold text-gray-900">
            {shippingData.firstName || "-"} {shippingData.lastName || ""}
          </p>
          <p>
            {shippingData.address || "-"}, {shippingData.city || ""},{" "}
            {shippingData.state || ""} {shippingData.zipCode || ""},{" "}
            {shippingData.location || "Thailand"}
          </p>
          <p className="text-gray-600">{shippingData.phone || "-"}</p>
          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col">
            <span className="font-bold text-xs uppercase tracking-wider text-gray-900">
              {selectedMethod.name}
            </span>
            <span className="text-xs font-semibold text-gray-800 mt-0.5">
              Arrives by {selectedMethod.estimatedDelivery}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Active Edit Form for Step 2
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {onSelectAddress && <div className="rounded-lg border border-gray-200 bg-gray-50 p-4"><label htmlFor="saved-shipping-address" className="mb-2 block text-sm font-semibold text-gray-800">เลือกที่อยู่ที่บันทึกไว้</label><select id="saved-shipping-address" value={shippingData.selectedAddressId || ''} onChange={(event) => event.target.value === '__new' ? onAddNewAddress?.() : event.target.value ? onSelectAddress(event.target.value) : onAddNewAddress?.()} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"><option value="">กรอกที่อยู่ใหม่</option>{savedAddresses.map((address) => <option key={address._id || address.id} value={address._id || address.id}>{address.recipientName}{address.isDefault ? ' (ที่อยู่หลัก)' : ''} — {address.addressDetail || address.addressLine}, {address.district}</option>)}<option value="__new">+ เพิ่มที่อยู่ใหม่</option></select></div>}
        {/* Location Dropdown */}
        <div>
          <label
            htmlFor="shipping-location"
            className="block text-sm font-medium text-gray-800 mb-1"
          >
            Location
          </label>
          <div className="relative">
            <select
              id="shipping-location"
              value={shippingData.location || "Thailand"}
              onChange={(e) =>
                onChangeShipping({ ...shippingData, location: e.target.value })
              }
              className="w-full appearance-none px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 cursor-pointer pr-10"
            >
              <option value="Thailand">ประเทศไทย (Thailand)</option>
              <option value="United States">สหรัฐอเมริกา (United States)</option>
              <option value="Singapore">สิงคโปร์ (Singapore)</option>
              <option value="Japan">ญี่ปุ่น (Japan)</option>
              <option value="United Kingdom">สหราชอาณาจักร (United Kingdom)</option>
              <option value="Australia">ออสเตรเลีย (Australia)</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* First & Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="shipping-first-name"
              className="block text-sm font-medium text-gray-800 mb-1"
            >
              First name
            </label>
            <input
              id="shipping-first-name"
              type="text"
              value={shippingData.firstName || ""}
              placeholder="สมชาย"
              onChange={(e) => {
                onChangeShipping({ ...shippingData, firstName: e.target.value });
                if (errors.firstName) setErrors({ ...errors, firstName: null });
              }}
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 ${
                errors.firstName
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-100 focus:border-blue-600"
              }`}
            />
            {errors.firstName && (
              <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="shipping-last-name"
              className="block text-sm font-medium text-gray-800 mb-1"
            >
              Last name
            </label>
            <input
              id="shipping-last-name"
              type="text"
              value={shippingData.lastName || ""}
              placeholder="ใจดี"
              onChange={(e) => {
                onChangeShipping({ ...shippingData, lastName: e.target.value });
                if (errors.lastName) setErrors({ ...errors, lastName: null });
              }}
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 ${
                errors.lastName
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-100 focus:border-blue-600"
              }`}
            />
            {errors.lastName && (
              <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Phone number */}
        <div>
          <label
            htmlFor="shipping-phone"
            className="block text-sm font-medium text-gray-800 mb-1"
          >
            Phone number
          </label>
          <input
            id="shipping-phone"
            type="tel"
            value={shippingData.phone || ""}
            placeholder="0812345678"
            onChange={(e) => {
              onChangeShipping({ ...shippingData, phone: e.target.value });
              if (errors.phone) setErrors({ ...errors, phone: null });
            }}
            className={`w-full px-3.5 py-2.5 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 ${
              errors.phone
                ? "border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:ring-blue-100 focus:border-blue-600"
            }`}
          />
          <p className="text-xs text-gray-500 mt-1">
            ใช้สำหรับการติดต่อเรื่องการจัดส่งสินค้าเท่านั้น
          </p>
          {errors.phone && (
            <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label
            htmlFor="shipping-address"
            className="block text-sm font-medium text-gray-800 mb-1"
          >
            Address
          </label>
          <input
            id="shipping-address"
            type="text"
            value={shippingData.address || ""}
            placeholder="123/45 ซอยสุขุมวิท 21 ถนนสุขุมวิท อาคาร/หมู่บ้าน (ถ้ามี)"
            onChange={(e) => {
              onChangeShipping({ ...shippingData, address: e.target.value });
              if (errors.address) setErrors({ ...errors, address: null });
            }}
            className={`w-full px-3.5 py-2.5 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 ${
              errors.address
                ? "border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:ring-blue-100 focus:border-blue-600"
            }`}
          />
          {errors.address && (
            <p className="text-xs text-red-500 mt-1">{errors.address}</p>
          )}
        </div>

        {/* Add delivery note toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowDeliveryNote(!showDeliveryNote)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-800 hover:text-black transition-colors underline cursor-pointer"
          >
            {showDeliveryNote ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{showDeliveryNote ? "ซ่อนโน้ตถึงพนักงานจัดส่ง" : "เพิ่มโน้ตถึงพนักงานจัดส่ง"}</span>
          </button>

          {showDeliveryNote && (
            <textarea
              rows={2}
              value={shippingData.deliveryNote || ""}
              onChange={(e) =>
                onChangeShipping({ ...shippingData, deliveryNote: e.target.value })
              }
              placeholder="รหัสเข้าหมู่บ้าน, จุดวางพัสดุ หรือคำแนะนำเพิ่มเติมสำหรับพนักงานส่ง"
              className="mt-2 w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
            />
          )}
        </div>

        {/* City / State / Zip code */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="shipping-city"
              className="block text-sm font-medium text-gray-800 mb-1"
            >
              City
            </label>
            <input
              id="shipping-city"
              type="text"
              value={shippingData.city || ""}
              placeholder="เขตวัฒนา / อำเภอเมือง"
              onChange={(e) => {
                onChangeShipping({ ...shippingData, city: e.target.value });
                if (errors.city) setErrors({ ...errors, city: null });
              }}
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 ${
                errors.city
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-100 focus:border-blue-600"
              }`}
            />
            {errors.city && (
              <p className="text-xs text-red-500 mt-1">{errors.city}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="shipping-state"
              className="block text-sm font-medium text-gray-800 mb-1"
            >
              State
            </label>
            <div className="relative">
              <select
                id="shipping-state"
                value={shippingData.state || ""}
                onChange={(e) => {
                  onChangeShipping({ ...shippingData, state: e.target.value });
                  if (errors.state) setErrors({ ...errors, state: null });
                }}
                className={`w-full appearance-none px-3.5 py-2.5 bg-white border rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 cursor-pointer pr-8 ${
                  errors.state
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-blue-100 focus:border-blue-600"
                }`}
              >
                <option value="">เลือกจังหวัด...</option>
                <option value="Bangkok">กรุงเทพมหานคร</option>
                <option value="Chiang Mai">เชียงใหม่</option>
                <option value="Phuket">ภูเก็ต</option>
                <option value="Nonthaburi">นนทบุรี</option>
                <option value="Samut Prakan">สมุทรปราการ</option>
                <option value="Other">จังหวัดอื่นๆ</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {errors.state && (
              <p className="text-xs text-red-500 mt-1">{errors.state}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="shipping-zip"
              className="block text-sm font-medium text-gray-800 mb-1"
            >
              Zip code
            </label>
            <input
              id="shipping-zip"
              type="text"
              value={shippingData.zipCode || ""}
              placeholder="10110"
              onChange={(e) => {
                onChangeShipping({ ...shippingData, zipCode: e.target.value });
                if (errors.zipCode) setErrors({ ...errors, zipCode: null });
              }}
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 ${
                errors.zipCode
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-100 focus:border-blue-600"
              }`}
            />
            {errors.zipCode && (
              <p className="text-xs text-red-500 mt-1">{errors.zipCode}</p>
            )}
          </div>
        </div>

        {/* Save address checkbox */}
        <div className="pt-1">
          <label className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={Boolean(shippingData.saveAddress)}
              onChange={(e) =>
                onChangeShipping({
                  ...shippingData,
                  saveAddress: e.target.checked,
                })
              }
              className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer accent-black"
            />
            <span>บันทึกที่อยู่นี้ลงในบัญชีของฉัน</span>
          </label>
        </div>

        {/* Shipping Method Radios */}
        <div className="pt-3">
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
            {SHIPPING_METHODS.map((method) => {
              const isSelected = shippingData.shippingMethod === method.id;
              return (
                <label
                  key={method.id}
                  className="flex items-start gap-3 cursor-pointer select-none"
                >
                  <input
                    type="radio"
                    name="shippingMethod"
                    value={method.id}
                    checked={isSelected}
                    onChange={() =>
                      onChangeShipping({
                        ...shippingData,
                        shippingMethod: method.id,
                      })
                    }
                    className="mt-1 w-4 h-4 text-red-600 accent-red-600 focus:ring-red-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 uppercase">
                      {method.name}
                    </p>
                    <p className="text-xs text-gray-600">{method.duration}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Add a gift message checkbox */}
        <div className="pt-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-800 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={Boolean(shippingData.isGift)}
              onChange={(e) =>
                onChangeShipping({
                  ...shippingData,
                  isGift: e.target.checked,
                })
              }
              className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer accent-black"
            />
            <Gift className="w-4 h-4 text-gray-700" />
            <span>เพิ่มข้อความอวยพร / การ์ดของขวัญ</span>
          </label>

          {shippingData.isGift && (
            <textarea
              rows={2}
              value={shippingData.giftMessage || ""}
              onChange={(e) =>
                onChangeShipping({
                  ...shippingData,
                  giftMessage: e.target.value,
                })
              }
              placeholder="พิมพ์ข้อความอวยพรพิเศษที่คุณต้องการแนบไปกับพัสดุ..."
              className="mt-2 w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
            />
          )}
        </div>

        {/* Bottom Buttons: ย้อนกลับ (Back) and CONTINUE */}
        <div className="flex flex-col-reverse sm:flex-row items-center gap-3 sm:gap-4 pt-6">
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-36 py-3.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold text-sm rounded-lg transition-colors text-center cursor-pointer"
          >
            ย้อนกลับ
          </button>
          <button
            type="submit"
            className="w-full sm:flex-1 py-3.5 bg-[#D0021B] hover:bg-[#b00217] text-white font-bold text-sm tracking-wider uppercase rounded-lg transition-colors shadow-xs text-center cursor-pointer"
          >
            CONTINUE
          </button>
        </div>
      </form>
    </div>
  );
}
