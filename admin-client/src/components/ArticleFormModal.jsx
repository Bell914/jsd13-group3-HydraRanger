import { useState } from 'react';
import { uploadArticleImage } from '../services/uploadService.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api';

function getImageUrl(imageUrl) {
  if (!imageUrl || imageUrl.startsWith('http')) return imageUrl;
  return `${API_BASE_URL.replace(/\/api\/?$/, '')}${imageUrl}`;
}

function formatDateInput(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function getInitialForm(article) {
  return {
    title: article?.title || '',
    excerpt: article?.excerpt || '',
    content: article?.content || '',
    category: article?.category || '',
    imageUrl: article?.imageUrl || '',
    author: article?.author || 'OCCASION',
    publishedAt: formatDateInput(article?.publishedAt),
    isPublished: article?.isPublished !== false,
  };
}

export function ArticleFormModal({ article, loading, onClose, onSave }) {
  const [form, setForm] = useState(() => getInitialForm(article));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function uploadImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const imageUrl = await uploadArticleImage(file);
      setForm((current) => ({ ...current, imageUrl }));
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  async function submitForm(event) {
    event.preventDefault();
    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim() || !form.category.trim() || !form.imageUrl.trim()) {
      setError('กรุณากรอกหัวข้อ คำโปรย เนื้อหา หมวดหมู่ และรูปภาพให้ครบ');
      return;
    }

    try {
      await onSave(form);
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="product-modal article-modal" role="dialog" aria-modal="true" aria-label="ฟอร์มบทความ">
        <header className="modal-header">
          <div>
            <h2>{article ? 'แก้ไขบทความ' : 'เพิ่มบทความ'}</h2>
            <p>กรอกเนื้อหาและเลือกรูปปกสำหรับแสดงบนหน้าเว็บ</p>
          </div>
          <button type="button" onClick={onClose} aria-label="ปิดฟอร์ม">×</button>
        </header>

        <form className="product-form" onSubmit={submitForm}>
          {error && <p className="error form-wide" role="alert">{error}</p>}
          <div className="field form-wide">
            <label htmlFor="article-title">หัวข้อ *</label>
            <input id="article-title" name="title" value={form.title} onChange={updateField} />
          </div>
          <div className="field">
            <label htmlFor="article-category">หมวดหมู่ *</label>
            <input id="article-category" name="category" value={form.category} onChange={updateField} placeholder="Fashion Tips" />
          </div>
          <div className="field">
            <label htmlFor="article-author">ผู้เขียน</label>
            <input id="article-author" name="author" value={form.author} onChange={updateField} />
          </div>
          <div className="field">
            <label htmlFor="article-date">วันที่เผยแพร่</label>
            <input id="article-date" name="publishedAt" type="date" value={form.publishedAt} onChange={updateField} />
          </div>
          <div className="field">
            <label htmlFor="article-image-file">อัปโหลดรูปปก</label>
            <input id="article-image-file" type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadImage} disabled={uploading || loading} />
          </div>
          <div className="field form-wide">
            <label htmlFor="article-image-url">URL รูปปก *</label>
            <input id="article-image-url" name="imageUrl" value={form.imageUrl} onChange={updateField} placeholder="วาง URL หรืออัปโหลดไฟล์ด้านบน" />
            {uploading && <small>กำลังอัปโหลดรูป…</small>}
          </div>
          {form.imageUrl && (
            <div className="form-wide article-preview">
              <img src={getImageUrl(form.imageUrl)} alt="ตัวอย่างรูปปกบทความ" />
            </div>
          )}
          <div className="field form-wide">
            <label htmlFor="article-excerpt">คำโปรย *</label>
            <textarea id="article-excerpt" name="excerpt" value={form.excerpt} onChange={updateField} rows="3" maxLength="500" />
          </div>
          <div className="field form-wide">
            <label htmlFor="article-content">เนื้อหาบทความ *</label>
            <textarea id="article-content" name="content" value={form.content} onChange={updateField} rows="12" />
          </div>
          <label className="checkbox-field form-wide">
            <input name="isPublished" type="checkbox" checked={form.isPublished} onChange={updateField} />
            เผยแพร่บทความบนหน้าเว็บ
          </label>
          <div className="modal-actions form-wide">
            <button type="button" className="secondary-button" onClick={onClose} disabled={loading || uploading}>ยกเลิก</button>
            <button type="submit" disabled={loading || uploading}>{loading ? 'กำลังบันทึก…' : 'บันทึกบทความ'}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
