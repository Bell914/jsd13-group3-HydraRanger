import { useEffect, useState } from "react";
import { AlertCircle, MapPin, Pencil, Plus, Save, Star, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAddressStore } from "../../store/addressStore.js";
import { THAI_PROVINCES } from "../../constants/provinces.js";
import {
  addAddress,
  deleteAddress,
  getAddresses,
  setDefaultAddress,
  updateAddress,
} from "../../services/userService.js";

const emptyForm = {
  firstName: "",
  lastName: "",
  phone: "",
  addressDetail: "",
  subdistrict: "",
  district: "",
  province: "",
  zipCode: "",
  isDefault: false,
};

const addressFields = [
  ["phone", "เบอร์โทรศัพท์", "0812345678"],
  ["addressDetail", "บ้านเลขที่ / ถนน / อาคาร", "123/45 ถนนสุขุมวิท"],
  ["subdistrict", "ตำบล / แขวง", "คลองเตย"],
  ["district", "อำเภอ / เขต", "วัฒนา"],
  ["province", "จังหวัด", "กรุงเทพมหานคร"],
  ["zipCode", "รหัสไปรษณีย์", "10110"],
];

function getAddressForm(address) {
  const fullName = (address.recipientName || "").trim().split(/\s+/);
  return {
    firstName: address.firstName || fullName[0] || "",
    lastName: address.lastName || fullName.slice(1).join(" "),
    phone: address.phone || "",
    addressDetail: address.addressDetail || address.addressLine || "",
    subdistrict: address.subdistrict || "",
    district: address.district || "",
    province: address.province || "",
    zipCode: address.zipCode || address.postalCode || "",
    isDefault: Boolean(address.isDefault),
  };
}

function getErrorMessage(error, fallback) {
  return error.data?.message || error.message || fallback;
}

export const AddressSection = () => {
  const addresses = useAddressStore((state) => state.addresses);
  const setAddresses = useAddressStore((state) => state.setAddresses);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadAddresses() {
    const response = await getAddresses();
    setAddresses(response.data || []);
  }

  useEffect(() => {
    let isMounted = true;

    getAddresses()
      .then((response) => {
        if (isMounted) setAddresses(response.data || []);
      })
      .catch((loadError) => {
        if (isMounted) setError(getErrorMessage(loadError, "โหลดที่อยู่ไม่สำเร็จ"));
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [setAddresses]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId("");
    setError("");
  }

  function validateForm() {
    if (!form.firstName.trim()) return "กรุณากรอกชื่อผู้รับ";
    if (!form.lastName.trim()) return "กรุณากรอกนามสกุล";
    if (!/^[0-9]{9,10}$/.test(form.phone.trim())) {
      return "เบอร์โทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก";
    }
    if (!/^[0-9]{5}$/.test(form.zipCode.trim())) {
      return "รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก";
    }
    if (!form.addressDetail.trim() || !form.district.trim() || !form.province.trim()) {
      return "กรุณากรอกรายละเอียดที่อยู่ อำเภอ/เขต และจังหวัด";
    }
    return "";
  }

  async function handleSave(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      ...form,
      recipientName: `${form.firstName.trim()} ${form.lastName.trim()}`,
      phone: form.phone.trim(),
      addressDetail: form.addressDetail.trim(),
      addressLine: form.addressDetail.trim(),
      postalCode: form.zipCode.trim(),
    };

    setSaving(true);
    try {
      if (editingId) {
        await updateAddress(editingId, payload);
        setMessage("อัปเดตที่อยู่เรียบร้อย");
      } else {
        await addAddress(payload);
        setMessage("บันทึกที่อยู่เรียบร้อย");
      }

      await loadAddresses();
      resetForm();
    } catch (saveError) {
      setError(getErrorMessage(saveError, "บันทึกที่อยู่ไม่สำเร็จ"));
    } finally {
      setSaving(false);
    }
  }

  async function handleSetDefault(addressId) {
    setError("");
    try {
      const response = await setDefaultAddress(addressId);
      setAddresses(response.data || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "ตั้งที่อยู่หลักไม่สำเร็จ"));
    }
  }

  async function handleDelete(address) {
    const confirmed = window.confirm("ต้องการลบที่อยู่นี้ใช่หรือไม่?");
    if (!confirmed) return;

    const addressId = address._id || address.id;
    setError("");
    try {
      const response = await deleteAddress(addressId);
      setAddresses(response.data || []);
      if (editingId === addressId) resetForm();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "ลบที่อยู่ไม่สำเร็จ"));
    }
  }

  function startEditing(address) {
    setEditingId(address._id || address.id);
    setForm(getAddressForm(address));
    setMessage("");
    setError("");
  }

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold">ที่อยู่จัดส่ง (Shipping Addresses)</h2>

      {message && (
        <p role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          <AlertCircle size={18} />
          {error}
        </p>
      )}

      {loading ? (
        <p className="py-8 text-center text-sm text-gray-500">กำลังโหลดที่อยู่...</p>
      ) : addresses.length === 0 ? (
        <div className="mb-5 rounded-xl border border-dashed p-8 text-center">
          <MapPin className="mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600">ยังไม่มีข้อมูลที่อยู่จัดส่ง</p>
        </div>
      ) : (
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => {
            const addressId = address._id || address.id;
            const addressText = [
              address.addressDetail || address.addressLine,
              address.subdistrict,
              address.district,
              address.province,
              address.zipCode || address.postalCode,
            ].filter(Boolean).join(" ");

            return (
              <article key={addressId} className="rounded-xl border bg-white p-4">
                <div className="flex items-center justify-between">
                  <strong className="flex items-center gap-2 text-sm">
                    <MapPin size={16} />
                    {address.label || "ที่อยู่จัดส่ง"}
                  </strong>
                  {address.isDefault && (
                    <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent">
                      ที่อยู่หลัก
                    </span>
                  )}
                </div>
                <p className="mt-2 font-medium">{address.recipientName}</p>
                <p className="text-sm text-gray-600">{address.phone}</p>
                <p className="text-sm text-gray-600">{addressText}</p>

                <div className="mt-3 flex flex-wrap gap-3 border-t pt-3 text-xs font-semibold">
                  {!address.isDefault && (
                    <button type="button" onClick={() => handleSetDefault(addressId)} className="flex items-center gap-1 text-accent">
                      <Star size={13} /> ตั้งเป็นที่อยู่หลัก
                    </button>
                  )}
                  <button type="button" onClick={() => startEditing(address)} className="flex items-center gap-1">
                    <Pencil size={13} /> แก้ไข
                  </button>
                  <button type="button" onClick={() => handleDelete(address)} className="flex items-center gap-1 text-red-600">
                    <Trash2 size={13} /> ลบ
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4 rounded-xl border bg-white p-5">
        <h3 className="flex items-center gap-2 font-bold">
          <Plus size={18} />
          {editingId ? "แก้ไขที่อยู่" : "เพิ่มที่อยู่ใหม่"}
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          {[["firstName", "ชื่อผู้รับ", "สมชาย"], ["lastName", "นามสกุล", "ใจดี"], ...addressFields].map(([field, label, placeholder]) => (
            <label key={field} className="block text-sm font-medium text-gray-700">
              {label} *
              {field === "province" ? (
                <select
                  required
                  value={form.province}
                  onChange={(event) => setForm({ ...form, province: event.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="">เลือกจังหวัด...</option>
                  {THAI_PROVINCES.map((province) => <option key={province} value={province}>{province}</option>)}
                </select>
              ) : (
                <input
                  required
                  type="text"
                  inputMode={field === "phone" || field === "zipCode" ? "numeric" : undefined}
                  pattern={field === "phone" ? "[0-9]{9,10}" : field === "zipCode" ? "[0-9]{5}" : undefined}
                  value={form[field]}
                  placeholder={placeholder}
                  onChange={(event) => setForm({ ...form, [field]: event.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              )}
            </label>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(event) => setForm({ ...form, isDefault: event.target.checked })}
          />
          ตั้งเป็นที่อยู่หลัก
        </label>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
            <Save size={16} />
            {saving ? "กำลังบันทึก..." : editingId ? "บันทึกการแก้ไข" : "บันทึกที่อยู่"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="rounded-xl px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-100">
              ยกเลิก
            </button>
          )}
        </div>
      </form>
    </section>
  );
};
