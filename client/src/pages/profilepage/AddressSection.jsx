import { useState } from 'react';
import { AlertCircle, MapPin, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { useAddressStore, emptyAddress } from '../../store/addressStore.js';
import { EmptyState } from './EmptyState.jsx';

export const AddressSection = () => {
  const addresses = useAddressStore((state) => state.addresses);
  const addAddress = useAddressStore((state) => state.addAddress);
  const updateAddress = useAddressStore((state) => state.updateAddress);
  const removeAddress = useAddressStore((state) => state.removeAddress);
  const setDefaultAddress = useAddressStore((state) => state.setDefaultAddress);
  const [addrForm, setAddrForm] = useState(emptyAddress);
  const [editingAddrId, setEditingAddrId] = useState(null);
  const [addrMsg, setAddrMsg] = useState('');
  const [addrError, setAddrError] = useState('');

  const handleAddrChange = (field) => (e) => {
    setAddrMsg('');
    setAddrForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const resetAddrForm = () => {
    setAddrForm(emptyAddress);
    setEditingAddrId(null);
    setAddrMsg('');
    setAddrError('');
  };

  const handleEditAddress = (addr) => {
    setAddrError('');
    setAddrMsg('');
    setEditingAddrId(addr.id);
    setAddrForm({
      label: addr.label || '',
      firstName: addr.firstName || '',
      lastName: addr.lastName || '',
      phone: addr.phone || '',
      address: addr.address || '',
      city: addr.city || '',
      state: addr.state || '',
      zipCode: addr.zipCode || '',
      location: addr.location || 'Thailand',
    });
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    setAddrError('');
    setAddrMsg('');
    const required = ['firstName', 'lastName', 'phone', 'address', 'city', 'state', 'zipCode'];
    const missing = required.find((key) => !addrForm[key]?.trim());
    if (missing) {
      setAddrError('กรุณากรอกข้อมูลให้ครบทุกช่อง (ชื่อ, นามสกุล, เบอร์โทร, ที่อยู่, เมือง, จังหวัด, รหัสไปรษณีย์)');
      return;
    }
    if (editingAddrId) {
      updateAddress(editingAddrId, addrForm);
      setAddrMsg('อัปเดตที่อยู่เรียบร้อย');
    } else {
      addAddress(addrForm);
      setAddrMsg('บันทึกที่อยู่เรียบร้อย');
    }
    setAddrForm(emptyAddress);
    setEditingAddrId(null);
  };

  const handleRemoveAddress = (id) => {
    removeAddress(id);
    if (editingAddrId === id) {
      resetAddrForm();
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">ที่อยู่จัดส่ง (Shipping Addresses)</h2>

      {addrMsg && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <span>{addrMsg}</span>
        </div>
      )}
      {addrError && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          <AlertCircle size={18} className="shrink-0" />
          <span>{addrError}</span>
        </div>
      )}

      {addresses.length === 0 ? (
        <EmptyState
          title="ยังไม่มีข้อมูลที่อยู่จัดส่ง"
          description="เพิ่มที่อยู่สำหรับใช้จัดส่งสินค้าได้เลยด้านล่าง"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-bold text-primary">
                  <MapPin size={16} />
                  {addr.label || 'ที่อยู่'}
                </span>
                {addr.isDefault && (
                  <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[11px] font-bold text-accent">
                    ค่าเริ่มต้น
                  </span>
                )}
              </div>
              <div className="space-y-0.5 text-sm text-gray-600">
                <p className="font-semibold text-gray-800">
                  {addr.firstName} {addr.lastName}
                </p>
                <p>{addr.address}</p>
                <p>
                  {addr.city} {addr.state} {addr.zipCode}
                </p>
                <p>{addr.location}</p>
                <p className="text-secondary">{addr.phone}</p>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
                {!addr.isDefault && (
                  <button
                    type="button"
                    onClick={() => setDefaultAddress(addr.id)}
                    className="text-xs font-semibold text-secondary hover:text-accent transition cursor-pointer"
                  >
                    ตั้งเป็นค่าเริ่มต้น
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleEditAddress(addr)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-accent transition cursor-pointer"
                >
                  <Pencil size={13} />
                  แก้ไข
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveAddress(addr.id)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600 transition cursor-pointer"
                >
                  <Trash2 size={13} />
                  ลบ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={handleSaveAddress}
        className="mt-6 space-y-4 rounded-xl border border-gray-200 bg-white p-5"
      >
        <h3 className="flex items-center gap-2 text-base font-bold text-primary">
          <Plus size={18} />
          {editingAddrId ? 'แก้ไขที่อยู่' : 'เพิ่มที่อยู่ใหม่'}
        </h3>
        <div>
          <label htmlFor="addr-label" className="mb-1 block text-sm font-medium text-gray-600">
            ชื่อที่อยู่ (เช่น บ้าน / ที่ทำงาน)
          </label>
          <input
            id="addr-label"
            type="text"
            value={addrForm.label}
            onChange={handleAddrChange('label')}
            placeholder="บ้าน"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="addr-first" className="mb-1 block text-sm font-medium text-gray-600">
              ชื่อ *
            </label>
            <input
              id="addr-first"
              type="text"
              value={addrForm.firstName}
              onChange={handleAddrChange('firstName')}
              required
              placeholder="สมชาย"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="addr-last" className="mb-1 block text-sm font-medium text-gray-600">
              นามสกุล *
            </label>
            <input
              id="addr-last"
              type="text"
              value={addrForm.lastName}
              onChange={handleAddrChange('lastName')}
              required
              placeholder="ใจดี"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label htmlFor="addr-phone" className="mb-1 block text-sm font-medium text-gray-600">
            เบอร์โทรศัพท์ *
          </label>
          <input
            id="addr-phone"
            type="tel"
            value={addrForm.phone}
            onChange={handleAddrChange('phone')}
            required
            placeholder="0812345678"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="addr-line" className="mb-1 block text-sm font-medium text-gray-600">
            ที่อยู่ (บ้านเลขที่, ถนน, ซอย) *
          </label>
          <input
            id="addr-line"
            type="text"
            value={addrForm.address}
            onChange={handleAddrChange('address')}
            required
            placeholder="123/45 ซอยสุขุมวิท 21 ถนนสุขุมวิท"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="addr-city" className="mb-1 block text-sm font-medium text-gray-600">
              เมือง / อำเภอ *
            </label>
            <input
              id="addr-city"
              type="text"
              value={addrForm.city}
              onChange={handleAddrChange('city')}
              required
              placeholder="เขตวัฒนา"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="addr-state" className="mb-1 block text-sm font-medium text-gray-600">
              จังหวัด *
            </label>
            <select
              id="addr-state"
              value={addrForm.state}
              onChange={handleAddrChange('state')}
              required
              className="w-full cursor-pointer rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            >
              <option value="">เลือกจังหวัด...</option>
              <option value="Bangkok">กรุงเทพมหานคร</option>
              <option value="Chiang Mai">เชียงใหม่</option>
              <option value="Phuket">ภูเก็ต</option>
              <option value="Nonthaburi">นนทบุรี</option>
              <option value="Samut Prakan">สมุทรปราการ</option>
              <option value="Other">จังหวัดอื่นๆ</option>
            </select>
          </div>
          <div>
            <label htmlFor="addr-zip" className="mb-1 block text-sm font-medium text-gray-600">
              รหัสไปรษณีย์ *
            </label>
            <input
              id="addr-zip"
              type="text"
              value={addrForm.zipCode}
              onChange={handleAddrChange('zipCode')}
              required
              placeholder="10110"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label htmlFor="addr-location" className="mb-1 block text-sm font-medium text-gray-600">
            ประเทศ
          </label>
          <select
            id="addr-location"
            value={addrForm.location}
            onChange={handleAddrChange('location')}
            className="w-full cursor-pointer rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
          >
            <option value="Thailand">ประเทศไทย (Thailand)</option>
            <option value="United States">สหรัฐอเมริกา (United States)</option>
            <option value="Singapore">สิงคโปร์ (Singapore)</option>
            <option value="Japan">ญี่ปุ่น (Japan)</option>
            <option value="United Kingdom">สหราชอาณาจักร (United Kingdom)</option>
            <option value="Australia">ออสเตรเลีย (Australia)</option>
          </select>
        </div>
        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-primary-hover transition cursor-pointer"
          >
            <Save size={16} />
            {editingAddrId ? 'อัปเดตที่อยู่' : 'บันทึกที่อยู่'}
          </button>
          {editingAddrId && (
            <button
              type="button"
              onClick={resetAddrForm}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-100 transition cursor-pointer"
            >
              ยกเลิก
            </button>
          )}
        </div>
      </form>
    </div>
  );
};