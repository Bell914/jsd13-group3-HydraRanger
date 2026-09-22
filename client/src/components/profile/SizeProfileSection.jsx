import { useEffect, useState } from 'react';
import { Ruler, ShieldCheck, Trash2 } from 'lucide-react';
import { userService } from '../../services/userService.js';
import { cmToInch, inchToCm } from '../../data/sizeGuide.js';

const EMPTY_FORM = {
  chestCm: '',
  waistCm: '',
  hipsCm: '',
  preferredFit: 'regular',
  consentGiven: false
};

const FIELDS = [
  { name: 'chestCm', label: 'รอบอก', min: 60, max: 160 },
  { name: 'waistCm', label: 'รอบเอว', min: 50, max: 160 },
  { name: 'hipsCm', label: 'รอบสะโพก', min: 60, max: 180 }
];

export function SizeProfileSection() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [hasSavedProfile, setHasSavedProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [unit, setUnit] = useState('inch');

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await userService.getSizeProfile();
        if (profile) {
          setForm({ ...EMPTY_FORM, ...profile, consentGiven: true });
          setHasSavedProfile(true);
        }
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  function updateField(name, value) {
    setForm({ ...form, [name]: value });
    setMessage('');
    setError('');
  }

  function getDisplayValue(value) {
    if (value === '') return '';
    if (unit === 'cm') return value;
    return cmToInch(value).toFixed(1);
  }

  function updateMeasurement(name, value) {
    if (value === '') {
      updateField(name, '');
      return;
    }

    const valueInCm = unit === 'inch' ? inchToCm(value) : Number(value);
    updateField(name, Number(valueInCm.toFixed(1)));
  }

  function getInputLimit(valueInCm) {
    if (unit === 'cm') return valueInCm;
    return Number(cmToInch(valueInCm).toFixed(1));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const saved = await userService.saveSizeProfile(form);
      setForm({ ...EMPTY_FORM, ...saved, consentGiven: true });
      setHasSavedProfile(true);
      setMessage('บันทึกข้อมูลสำหรับแนะนำไซส์เรียบร้อยแล้ว');
    } catch (saveError) {
      setError(saveError.data?.errors?.join(', ') || saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm('ลบข้อมูลสัดส่วนทั้งหมดใช่หรือไม่?');
    if (!confirmed) return;
    try {
      await userService.deleteSizeProfile();
      setForm(EMPTY_FORM);
      setHasSavedProfile(false);
      setMessage('ลบข้อมูลสัดส่วนเรียบร้อยแล้ว');
      setError('');
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  if (loading) return <p className="text-sm text-secondary">กำลังโหลดข้อมูลไซส์…</p>;

  return (
    <section>
      <div className="flex items-start gap-3 mb-5">
        <div className="rounded-xl bg-pink-50 p-2.5 text-accent"><Ruler size={22} /></div>
        <div>
          <h2 className="text-lg font-bold text-primary">คำแนะนำไซส์เฉพาะคุณ</h2>
          <p className="text-sm text-secondary">บันทึกสัดส่วนครั้งเดียว แล้วดูไซส์แนะนำบนหน้าสินค้า</p>
        </div>
      </div>

      <div className="mb-5 flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
        <ShieldCheck className="shrink-0" size={20} />
        <p>ข้อมูลนี้ใช้เพื่อแนะนำไซส์เท่านั้น Admin จะไม่เห็นสัดส่วนรายบุคคล และคุณลบข้อมูลได้ทุกเมื่อ</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <p className="mb-2 text-sm font-semibold text-primary">หน่วยวัด</p>
          <div className="inline-flex rounded-xl border border-gray-200 p-1" aria-label="เลือกหน่วยวัด">
            <button type="button" onClick={() => setUnit('inch')} className={`rounded-lg px-4 py-2 text-sm font-bold ${unit === 'inch' ? 'bg-primary text-white' : 'text-secondary'}`}>นิ้ว</button>
            <button type="button" onClick={() => setUnit('cm')} className={`rounded-lg px-4 py-2 text-sm font-bold ${unit === 'cm' ? 'bg-primary text-white' : 'text-secondary'}`}>ซม.</button>
          </div>
          <p className="mt-2 text-xs text-gray-500">ระบบเก็บค่ามาตรฐานเป็นเซนติเมตร และแปลงหน่วยให้อัตโนมัติ</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FIELDS.map((field) => (
            <label key={field.name} className="text-sm font-semibold text-primary">
              {field.label} ({unit === 'inch' ? 'นิ้ว' : 'ซม.'})
              <input
                type="number"
                min={getInputLimit(field.min)}
                max={getInputLimit(field.max)}
                step="0.1"
                required
                value={getDisplayValue(form[field.name])}
                onChange={(event) => updateMeasurement(field.name, event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-accent focus:ring-2 focus:ring-pink-100"
              />
            </label>
          ))}
        </div>

        <label className="block text-sm font-semibold text-primary">
          ชอบเสื้อผ้าทรงไหน
          <select
            value={form.preferredFit}
            onChange={(event) => updateField('preferredFit', event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-accent"
          >
            <option value="fitted">พอดีตัว</option>
            <option value="regular">มาตรฐาน</option>
            <option value="relaxed">หลวมสบาย</option>
          </select>
        </label>

        <label className="flex items-start gap-3 text-sm text-secondary">
          <input
            type="checkbox"
            required
            checked={form.consentGiven}
            onChange={(event) => updateField('consentGiven', event.target.checked)}
            className="mt-1 h-4 w-4 accent-pink-600"
          />
          ฉันยินยอมให้ระบบบันทึกสัดส่วนเพื่อใช้แนะนำไซส์สินค้า และเข้าใจว่านี่เป็นคำแนะนำเบื้องต้น
        </label>

        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {message && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}

        <div className="flex flex-col sm:flex-row gap-3">
          <button type="submit" disabled={saving} className="rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60">
            {saving ? 'กำลังบันทึก…' : 'บันทึกข้อมูลไซส์'}
          </button>
          {hasSavedProfile && (
            <button type="button" onClick={handleDelete} className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50">
              <Trash2 size={17} /> ลบข้อมูลสัดส่วน
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
