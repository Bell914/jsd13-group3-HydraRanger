import { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api';

function getImageUrl(imageUrl) {
  if (!imageUrl || imageUrl.startsWith('http')) return imageUrl;
  return `${API_BASE_URL.replace(/\/api\/?$/, '')}${imageUrl}`;
}

function createEmptyItem(products) {
  const product = products[0];
  return {
    product: product?._id || '',
    defaultVariantSku: product?.variants?.[0]?.sku || '',
  };
}

function getInitialForm(lookbook, products) {
  if (lookbook) {
    return {
      lookbookId: lookbook.lookbookId || '',
      name: lookbook.name || '',
      nameTh: lookbook.nameTh || '',
      concept: lookbook.concept || '',
      occasion: (lookbook.occasion || []).join(', '),
      styleTags: (lookbook.styleTags || []).join(', '),
      imageUrl: lookbook.imageUrl || '',
      regularPrice: lookbook.regularPrice || 0,
      setPrice: lookbook.setPrice || 0,
      isActive: lookbook.isActive !== false,
      items: (lookbook.items || []).map((item) => ({
        product: item.product?._id || item.product,
        defaultVariantSku: item.defaultVariantSku,
      })),
    };
  }

  return {
    lookbookId: '', name: '', nameTh: '', concept: '', occasion: '', styleTags: '',
    imageUrl: '', regularPrice: 0, setPrice: 0, isActive: true,
    items: [createEmptyItem(products), createEmptyItem(products)],
  };
}

export function LookbookFormModal({ lookbook, products, loading, onClose, onSave }) {
  const [form, setForm] = useState(() => getInitialForm(lookbook, products));
  const [error, setError] = useState('');

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  function updateProduct(index, productId) {
    const product = products.find((item) => item._id === productId);
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => itemIndex === index ? {
        product: productId,
        defaultVariantSku: product?.variants?.[0]?.sku || '',
      } : item),
    }));
  }

  function updateVariant(index, sku) {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => (
        itemIndex === index ? { ...item, defaultVariantSku: sku } : item
      )),
    }));
  }

  async function submitForm(event) {
    event.preventDefault();
    if (!form.lookbookId || !form.name || !form.nameTh || !form.concept || !form.imageUrl) {
      setError('กรุณากรอกข้อมูลที่จำเป็นให้ครบ');
      return;
    }

    const data = {
      ...form,
      regularPrice: Number(form.regularPrice),
      setPrice: Number(form.setPrice),
      occasion: form.occasion.split(',').map((item) => item.trim()).filter(Boolean),
      styleTags: form.styleTags.split(',').map((item) => item.trim()).filter(Boolean),
    };

    try {
      await onSave(data);
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="product-modal lookbook-modal" role="dialog" aria-modal="true" aria-label="ฟอร์ม Lookbook">
        <header className="modal-header"><div><h2>{lookbook ? 'แก้ไข Lookbook' : 'เพิ่ม Lookbook'}</h2><p>เลือกสินค้าและ Variant ที่มีอยู่จริงในระบบ</p></div><button type="button" onClick={onClose}>×</button></header>
        <form className="product-form" onSubmit={submitForm}>
          {error && <p className="error form-wide" role="alert">{error}</p>}
          <div className="field"><label>Lookbook ID *</label><input name="lookbookId" value={form.lookbookId} onChange={updateField} placeholder="LOOK-011" /></div>
          <div className="field"><label>ชื่อภาษาอังกฤษ *</label><input name="name" value={form.name} onChange={updateField} /></div>
          <div className="field"><label>ชื่อภาษาไทย *</label><input name="nameTh" value={form.nameTh} onChange={updateField} /></div>
          <div className="field form-wide"><label>Concept *</label><textarea name="concept" value={form.concept} onChange={updateField} rows="3" /></div>
          <div className="field form-wide"><label>URL รูปภาพ *</label><input name="imageUrl" value={form.imageUrl} onChange={updateField} /></div>
          {form.imageUrl && <div className="form-wide lookbook-preview"><img src={getImageUrl(form.imageUrl)} alt="ตัวอย่าง Lookbook" /></div>}
          <div className="field"><label>โอกาส (คั่นด้วย comma)</label><input name="occasion" value={form.occasion} onChange={updateField} /></div>
          <div className="field"><label>Style tags (คั่นด้วย comma)</label><input name="styleTags" value={form.styleTags} onChange={updateField} /></div>
          <div className="field"><label>ราคาปกติ *</label><input name="regularPrice" type="number" min="0" value={form.regularPrice} onChange={updateField} /></div>
          <div className="field"><label>ราคาเซ็ต *</label><input name="setPrice" type="number" min="0" value={form.setPrice} onChange={updateField} /></div>

          <fieldset className="form-wide lookbook-items">
            <legend>สินค้าใน Lookbook</legend>
            {form.items.map((item, index) => {
              const product = products.find((current) => current._id === item.product);
              return (
                <div className="lookbook-item-row" key={index}>
                  <div className="field"><label>สินค้า {index + 1}</label><select value={item.product} onChange={(event) => updateProduct(index, event.target.value)}>{products.map((option) => <option key={option._id} value={option._id}>{option.name}</option>)}</select></div>
                  <div className="field"><label>Variant</label><select value={item.defaultVariantSku} onChange={(event) => updateVariant(index, event.target.value)}>{(product?.variants || []).map((variant) => <option key={variant.sku} value={variant.sku}>{variant.sku}</option>)}</select></div>
                </div>
              );
            })}
          </fieldset>

          <label className="checkbox-field form-wide"><input name="isActive" type="checkbox" checked={form.isActive} onChange={updateField} /> แสดง Lookbook บนหน้าเว็บ</label>
          <div className="modal-actions form-wide"><button type="button" className="secondary-button" onClick={onClose} disabled={loading}>ยกเลิก</button><button type="submit" disabled={loading}>{loading ? 'กำลังบันทึก…' : 'บันทึก Lookbook'}</button></div>
        </form>
      </section>
    </div>
  );
}
