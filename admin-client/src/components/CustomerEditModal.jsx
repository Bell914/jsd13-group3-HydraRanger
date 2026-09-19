import { useState } from 'react';
import { X } from 'lucide-react';

export function CustomerEditModal({ customer, loading, onClose, onSave }) {
  const [form, setForm] = useState({
    username: customer.username || '',
    avatar: customer.avatar || ''
  });
  const [error, setError] = useState('');

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError('');
  }

  function submitForm(event) {
    event.preventDefault();
    const username = form.username.trim();

    if (username.length < 3) {
      setError('ชื่อลูกค้าต้องมีอย่างน้อย 3 ตัวอักษร');
      return;
    }
    onSave({ username, avatar: form.avatar.trim() });
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="customer-modal" role="dialog" aria-modal="true" aria-labelledby="customer-modal-title">
        <header className="modal-header">
          <div><p>EDIT CUSTOMER</p><h2 id="customer-modal-title">แก้ไขข้อมูลลูกค้า</h2></div>
          <button type="button" onClick={onClose} disabled={loading} aria-label="ปิด"><X size={20} /></button>
        </header>
        <form className="customer-form" onSubmit={submitForm}>
          <label className="field">
            <span>ชื่อผู้ใช้ <b>*</b></span>
            <input name="username" value={form.username} onChange={updateField} disabled={loading} />
            {error && <small className="field-error">{error}</small>}
          </label>
          <label className="field">
            <span>Avatar URL</span>
            <input name="avatar" type="url" value={form.avatar} onChange={updateField} disabled={loading} placeholder="https://..." />
          </label>
          <label className="field">
            <span>อีเมล</span>
            <input value={customer.email} disabled />
            <small>Admin ไม่สามารถเปลี่ยนอีเมลหรือรหัสผ่านของลูกค้าได้</small>
          </label>
          <div className="customer-modal-actions">
            <button type="button" className="cancel-action" onClick={onClose} disabled={loading}>ยกเลิก</button>
            <button type="submit" className="primary-action" disabled={loading}>{loading ? 'กำลังบันทึก…' : 'บันทึกข้อมูล'}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
