import { useEffect, useState } from 'react';
import { AlertCircle, MapPin, Pencil, Plus, Save, Trash2, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAddressStore, emptyAddress } from '../../store/addressStore.js';
import { getAddresses, addAddress as createAddress, updateAddress, deleteAddress, setDefaultAddress } from '../../services/userService.js';

const toForm = (address = {}) => ({ recipientName: address.recipientName || `${address.firstName || ''} ${address.lastName || ''}`.trim(), phone: address.phone || '', addressDetail: address.addressDetail || address.addressLine || address.address || '', subdistrict: address.subdistrict || '', district: address.district || address.city || '', province: address.province || address.state || '', zipCode: address.zipCode || address.postalCode || '', label: address.label || '', isDefault: Boolean(address.isDefault) });

export const AddressSection = () => {
  const addresses = useAddressStore((state) => state.addresses);
  const setAddresses = useAddressStore((state) => state.setAddresses);
  const [form, setForm] = useState(toForm(emptyAddress));
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const refresh = async () => {
    const response = await getAddresses();
    setAddresses(response?.data || []);
  };
  useEffect(() => { let active = true; getAddresses().then((response) => { if (active) setAddresses(response?.data || []); }).catch((err) => { if (active) setError(err.data?.message || err.message || 'โหลดที่อยู่ไม่สำเร็จ'); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [setAddresses]);

  const reset = () => { setForm(toForm(emptyAddress)); setEditingId(null); setError(''); };
  const handleSave = async (event) => {
    event.preventDefault(); setError(''); setMessage('');
    const phone = form.phone.trim(); const zip = form.zipCode.trim();
    if (!form.recipientName.trim()) return setError('กรุณากรอกชื่อผู้รับ');
    if (!/^[0-9]{9,10}$/.test(phone)) return setError('เบอร์โทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก');
    if (!/^[0-9]{5}$/.test(zip)) return setError('รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก');
    if (!form.addressDetail.trim() || !form.district.trim() || !form.province.trim()) return setError('กรุณากรอกรายละเอียดที่อยู่ อำเภอ/เขต และจังหวัด');
    setSaving(true);
    try {
      const payload = { ...form, recipientName: form.recipientName.trim(), phone, addressLine: form.addressDetail.trim(), postalCode: zip };
      if (editingId) await updateAddress(editingId, payload); else await createAddress(payload);
      await refresh(); setMessage(editingId ? 'อัปเดตที่อยู่เรียบร้อย' : 'บันทึกที่อยู่เรียบร้อย'); reset();
    } catch (err) { setError(err.data?.message || err.message || 'บันทึกที่อยู่ไม่สำเร็จ'); }
    finally { setSaving(false); }
  };
  const handleDefault = async (id) => { setError(''); try { const response = await setDefaultAddress(id); setAddresses(response?.data || []); } catch (err) { setError(err.data?.message || err.message || 'ตั้งที่อยู่หลักไม่สำเร็จ'); } };
  const handleDelete = async (address) => { if (!window.confirm('ต้องการลบที่อยู่นี้ใช่หรือไม่?')) return; setError(''); try { const response = await deleteAddress(address._id || address.id); setAddresses(response?.data || []); if (editingId === (address._id || address.id)) reset(); } catch (err) { setError(err.data?.message || err.message || 'ลบที่อยู่ไม่สำเร็จ'); } };
  const fields = [['recipientName', 'ชื่อผู้รับ', 'สมชาย ใจดี'], ['phone', 'เบอร์โทรศัพท์', '0812345678'], ['addressDetail', 'บ้านเลขที่ / ถนน / อาคาร', '123/45 ถนนสุขุมวิท'], ['subdistrict', 'ตำบล / แขวง', 'คลองเตย'], ['district', 'อำเภอ / เขต', 'วัฒนา'], ['province', 'จังหวัด', 'กรุงเทพมหานคร'], ['zipCode', 'รหัสไปรษณีย์', '10110']];

  return <section><h2 className="mb-4 text-lg font-semibold">ที่อยู่จัดส่ง (Shipping Addresses)</h2>
    {message && <p role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
    {error && <p role="alert" className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600"><AlertCircle size={18}/>{error}</p>}
    {loading ? <p className="py-8 text-center text-sm text-gray-500">กำลังโหลดที่อยู่...</p> : addresses.length === 0 ? <div className="mb-5 rounded-xl border border-dashed p-8 text-center"><MapPin className="mx-auto mb-2 text-gray-400"/><p className="text-sm text-gray-600">ยังไม่มีข้อมูลที่อยู่จัดส่ง</p><Link to="/products" className="mt-2 inline-block text-sm font-semibold text-accent">เลือกซื้อสินค้า</Link></div> : <div className="mb-6 grid gap-4 sm:grid-cols-2">{addresses.map((address) => <article key={address._id || address.id} className="rounded-xl border bg-white p-4"><div className="flex items-center justify-between"><strong className="flex items-center gap-2 text-sm"><MapPin size={16}/>{address.label || 'ที่อยู่จัดส่ง'}</strong>{address.isDefault && <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent">ที่อยู่หลัก</span>}</div><p className="mt-2 font-medium">{address.recipientName}</p><p className="text-sm text-gray-600">{address.phone}</p><p className="text-sm text-gray-600">{[address.addressDetail || address.addressLine, address.subdistrict, address.district, address.province, address.zipCode || address.postalCode].filter(Boolean).join(' ')}</p><div className="mt-3 flex flex-wrap gap-3 border-t pt-3 text-xs font-semibold">{!address.isDefault && <button type="button" onClick={() => handleDefault(address._id || address.id)} className="flex items-center gap-1 text-accent"><Star size={13}/>ตั้งเป็นที่อยู่หลัก</button>}<button type="button" onClick={() => { setEditingId(address._id || address.id); setForm(toForm(address)); }} className="flex items-center gap-1"><Pencil size={13}/>แก้ไข</button><button type="button" onClick={() => handleDelete(address)} className="flex items-center gap-1 text-red-600"><Trash2 size={13}/>ลบ</button></div></article>)}</div>}
    <form onSubmit={handleSave} className="space-y-4 rounded-xl border bg-white p-5"><h3 className="flex items-center gap-2 font-bold"><Plus size={18}/>{editingId ? 'แก้ไขที่อยู่' : 'เพิ่มที่อยู่ใหม่'}</h3><div className="grid gap-4 sm:grid-cols-2">{fields.map(([key, label, placeholder]) => <label key={key} className="block text-sm font-medium text-gray-700">{label} *<input required type="text" inputMode={key === 'phone' || key === 'zipCode' ? 'numeric' : undefined} pattern={key === 'phone' ? '[0-9]{9,10}' : key === 'zipCode' ? '[0-9]{5}' : undefined} value={form[key] || ''} placeholder={placeholder} onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))} className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/></label>)}</div><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isDefault} onChange={(event) => setForm((prev) => ({ ...prev, isDefault: event.target.checked }))}/>ตั้งเป็นที่อยู่หลัก</label><div className="flex gap-3"><button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Save size={16}/>{saving ? 'กำลังบันทึก...' : editingId ? 'บันทึกการแก้ไข' : 'บันทึกที่อยู่'}</button>{editingId && <button type="button" onClick={reset} className="rounded-xl px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-100">ยกเลิก</button>}</div></form>
  </section>;
};
