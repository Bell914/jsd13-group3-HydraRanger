import { Plus, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
const IMAGE_SERVER_URL = API_BASE_URL.replace(/\/api\/?$/, '');

function getFullImageUrl(imageUrl) {
  if (!imageUrl) {
    return '';
  }

  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }

  return `${IMAGE_SERVER_URL}${imageUrl}`;
}

function ImagePreview({ imageUrl, label }) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  if (!imageUrl) {
    return <p className="image-preview-empty">กรอก URL แล้วรูปจะแสดงตรงนี้</p>;
  }

  if (imageFailed) {
    return <p className="image-preview-error">ไม่สามารถแสดงรูปนี้ได้ กรุณาตรวจสอบ URL</p>;
  }

  return (
    <div className="image-preview">
      <img
        src={getFullImageUrl(imageUrl)}
        alt={label}
        onError={() => setImageFailed(true)}
      />
    </div>
  );
}

function getAllImageUrls(form) {
  const imageUrls = [];

  if (form.imageUrl) {
    imageUrls.push(form.imageUrl);
  }

  form.variants.forEach((variant) => {
    if (variant.imageUrl) {
      imageUrls.push(variant.imageUrl);
    }

    if (Array.isArray(variant.detailImages)) {
      imageUrls.push(...variant.detailImages);
    }
  });

  return [...new Set(imageUrls)];
}

function createId() {
  return `${Date.now()}-${Math.random()}`;
}

function createEmptyVariant() {
  return {
    id: createId(),
    sku: '',
    color: '',
    colorCode: '',
    size: 'S',
    price: '',
    stockQuantity: '',
    imageUrl: '',
    detailImages: [],
  };
}

function createEmptyForm() {
  return {
    name: '',
    description: '',
    category: 'tops',
    gender: 'unisex',
    tags: '',
    availableDate: '',
    imageUrl: '',
    variants: [createEmptyVariant()],
  };
}

function createFormFromProduct(product) {
  if (!product) {
    return createEmptyForm();
  }

  let variants = [createEmptyVariant()];

  if (product.variants && product.variants.length > 0) {
    variants = product.variants.map((variant) => {
      return {
        ...variant,
        id: variant._id || createId(),
        price: String(variant.price || ''),
        stockQuantity: String(variant.stockQuantity ?? ''),
      };
    });
  }

  return {
    name: product.name || '',
    description: product.description || '',
    category: product.category || 'tops',
    gender: product.gender || 'unisex',
    tags: (product.tags || []).join(', '),
    availableDate: product.availableDate ? product.availableDate.slice(0, 10) : '',
    imageUrl: product.imageUrl || '',
    variants,
  };
}

function validateForm(form) {
  const errors = {};

  if (!form.name.trim()) {
    errors.name = 'กรุณากรอกชื่อสินค้า';
  }

  if (!form.description.trim()) {
    errors.description = 'กรุณากรอกรายละเอียดสินค้า';
  }

  const tags = form.tags.split(',').map((tag) => tag.trim()).filter((tag) => tag !== '');
  if (tags.length === 0) {
    errors.tags = 'กรุณากรอก Tag อย่างน้อย 1 รายการ';
  }

  if (!form.availableDate) {
    errors.availableDate = 'กรุณาเลือกวันที่เริ่มจำหน่าย';
  }

  form.variants.forEach((variant, index) => {
    if (!variant.sku.trim()) {
      errors[`variant-${index}-sku`] = 'กรุณากรอก SKU';
    }
    if (!variant.color.trim()) {
      errors[`variant-${index}-color`] = 'กรุณากรอกสี';
    }
    const price = Number(variant.price);
    const stock = Number(variant.stockQuantity);

    if (variant.price === '' || !Number.isFinite(price) || price <= 0) {
      errors[`variant-${index}-price`] = 'ราคาต้องมากกว่า 0';
    }
    if (variant.stockQuantity === '' || !Number.isInteger(stock) || stock < 0) {
      errors[`variant-${index}-stock`] = 'สต็อกต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป';
    }
  });

  return errors;
}

export function ProductFormModal({ product, onClose, onSave }) {
  const isEditing = Boolean(product);
  const [form, setForm] = useState(() => createFormFromProduct(product));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const nameInputRef = useRef(null);
  const allImageUrls = getAllImageUrls(form);

  useEffect(() => {
    nameInputRef.current?.focus();
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  const updateField = (field, value) => {
    const updatedForm = { ...form };
    updatedForm[field] = value;
    setForm(updatedForm);

    const updatedErrors = { ...errors };
    delete updatedErrors[field];
    setErrors(updatedErrors);
  };

  const updateVariant = (index, field, value) => {
    const updatedVariants = [...form.variants];
    updatedVariants[index] = { ...updatedVariants[index] };
    updatedVariants[index][field] = value;
    setForm({ ...form, variants: updatedVariants });

    let errorField = field;
    if (field === 'stockQuantity') {
      errorField = 'stock';
    }

    const updatedErrors = { ...errors };
    delete updatedErrors[`variant-${index}-${errorField}`];
    setErrors(updatedErrors);
  };

  const removeVariant = (index) => {
    const updatedVariants = form.variants.filter((variant, variantIndex) => {
      return variantIndex !== index;
    });
    setForm({ ...form, variants: updatedVariants });
  };

  const addVariant = () => {
    const updatedVariants = [...form.variants, createEmptyVariant()];
    setForm({ ...form, variants: updatedVariants });
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitError('');
    const nextErrors = validateForm(form);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    let productId = `product-${Date.now()}`;
    if (product && product._id) {
      productId = product._id;
    } else if (product && product.productId) {
      productId = product.productId;
    }

    const tags = form.tags.split(',').map((tag) => tag.trim()).filter((tag) => tag !== '');
    const variants = form.variants.map((variant) => {
      return {
        _id: variant._id || `${productId}-${variant.sku.toLowerCase()}`,
        sku: variant.sku,
        color: variant.color,
        colorCode: variant.colorCode,
        size: variant.size,
        price: Number(variant.price),
        stockQuantity: Number(variant.stockQuantity),
        imageUrl: variant.imageUrl || form.imageUrl,
        detailImages: variant.detailImages || [],
      };
    });

    let savedProductId = productId;
    if (product && product.productId) {
      savedProductId = product.productId;
    }

    const savedProduct = {
      ...form,
      _id: productId,
      productId: savedProductId,
      tags,
      variants,
    };

    setLoading(true);
    try {
      await onSave(savedProduct);
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="product-modal" role="dialog" aria-modal="true" aria-labelledby="product-form-title">
        <header className="modal-header">
          <div>
            <p>PRODUCT MANAGEMENT</p>
            <h2 id="product-form-title">{isEditing ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="ปิดฟอร์มสินค้า"><X size={20} /></button>
        </header>

        <form className="product-form" onSubmit={submit} noValidate>
          <div className="form-grid">
            <label className="field full-width">
              <span>ชื่อสินค้า <b>*</b></span>
              <input type="text" ref={nameInputRef} value={form.name} onChange={(event) => updateField('name', event.target.value)} aria-invalid={Boolean(errors.name)} />
              {errors.name && <small className="field-error">{errors.name}</small>}
            </label>

            <label className="field full-width">
              <span>รายละเอียดสินค้า <b>*</b></span>
              <textarea value={form.description} onChange={(event) => updateField('description', event.target.value)} rows="3" aria-invalid={Boolean(errors.description)} />
              {errors.description && <small className="field-error">{errors.description}</small>}
            </label>

            <label className="field">
              <span>หมวดหมู่</span>
              <select value={form.category} onChange={(event) => updateField('category', event.target.value)}>
                <option value="tops">เสื้อ (Tops)</option>
                <option value="bottoms">กางเกง (Bottoms)</option>
              </select>
            </label>

            <label className="field">
              <span>เพศ</span>
              <select value={form.gender} onChange={(event) => updateField('gender', event.target.value)}>
                <option value="unisex">Unisex</option>
                <option value="women">Women</option>
                <option value="men">Men</option>
              </select>
            </label>

            <label className="field">
              <span>Tags <b>*</b></span>
              <input type="text" value={form.tags} onChange={(event) => updateField('tags', event.target.value)} placeholder="casual, minimal" aria-invalid={Boolean(errors.tags)} />
              {errors.tags && <small className="field-error">{errors.tags}</small>}
            </label>

            <label className="field">
              <span>วันที่เริ่มจำหน่าย <b>*</b></span>
              <input type="date" value={form.availableDate} onChange={(event) => updateField('availableDate', event.target.value)} aria-invalid={Boolean(errors.availableDate)} />
              {errors.availableDate && <small className="field-error">{errors.availableDate}</small>}
            </label>

            <label className="field full-width">
              <span>Image URL</span>
              <input type="text" value={form.imageUrl} onChange={(event) => updateField('imageUrl', event.target.value)} placeholder="/collection-2026/products/..." />
            </label>
            <div className="field full-width">
              <span>ภาพทั้งหมดก่อนบันทึก ({allImageUrls.length} ภาพ)</span>
              {allImageUrls.length === 0 ? (
                <ImagePreview imageUrl="" label="ยังไม่มีรูปสินค้า" />
              ) : (
                <div className="image-preview-gallery">
                  {allImageUrls.map((imageUrl, index) => (
                    <ImagePreview
                      key={imageUrl}
                      imageUrl={imageUrl}
                      label={`ตัวอย่างรูป ${index + 1} ของ ${form.name || 'สินค้าใหม่'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="variant-heading">
            <div>
              <h3>ตัวเลือกสินค้า (Variants)</h3>
              <p>กำหนด SKU สี ไซซ์ ราคา และจำนวนสินค้า</p>
            </div>
            <button type="button" className="secondary-action" onClick={addVariant}>
              <Plus size={15} /> เพิ่ม Variant
            </button>
          </div>

          <div className="variant-list">
            {form.variants.map((variant, index) => (
              <fieldset className="variant-card" key={variant.id}>
                <legend>Variant {index + 1}</legend>
                <div className="variant-grid">
                  <label className="field"><span>SKU *</span><input type="text" value={variant.sku} onChange={(event) => updateVariant(index, 'sku', event.target.value)} aria-invalid={Boolean(errors[`variant-${index}-sku`])} />{errors[`variant-${index}-sku`] && <small className="field-error">{errors[`variant-${index}-sku`]}</small>}</label>
                  <label className="field"><span>สี *</span><input type="text" value={variant.color} onChange={(event) => updateVariant(index, 'color', event.target.value)} aria-invalid={Boolean(errors[`variant-${index}-color`])} />{errors[`variant-${index}-color`] && <small className="field-error">{errors[`variant-${index}-color`]}</small>}</label>
                  <label className="field"><span>รหัสสี</span><input type="text" value={variant.colorCode} onChange={(event) => updateVariant(index, 'colorCode', event.target.value)} placeholder="OW" /></label>
                  <label className="field"><span>ไซซ์</span><select value={variant.size} onChange={(event) => updateVariant(index, 'size', event.target.value)}><option>S</option><option>M</option><option>L</option></select></label>
                  <label className="field"><span>ราคา *</span><input type="number" min="1" step="0.01" value={variant.price} onChange={(event) => updateVariant(index, 'price', event.target.value)} aria-invalid={Boolean(errors[`variant-${index}-price`])} />{errors[`variant-${index}-price`] && <small className="field-error">{errors[`variant-${index}-price`]}</small>}</label>
                  <label className="field"><span>Stock *</span><input type="number" min="0" step="1" value={variant.stockQuantity} onChange={(event) => updateVariant(index, 'stockQuantity', event.target.value)} aria-invalid={Boolean(errors[`variant-${index}-stock`])} />{errors[`variant-${index}-stock`] && <small className="field-error">{errors[`variant-${index}-stock`]}</small>}</label>
                  <label className="field full-width"><span>รูปของ Variant</span><input type="text" value={variant.imageUrl || ''} onChange={(event) => updateVariant(index, 'imageUrl', event.target.value)} placeholder="เว้นว่างเพื่อใช้รูปหลัก" /></label>
                  <div className="field full-width">
                    <span>ตัวอย่างรูป Variant {index + 1}</span>
                    <ImagePreview imageUrl={variant.imageUrl || form.imageUrl} label={`ตัวอย่าง ${variant.sku || `Variant ${index + 1}`}`} />
                  </div>
                </div>
                {form.variants.length > 1 && <button type="button" className="remove-variant" onClick={() => removeVariant(index)}><Trash2 size={14} /> ลบ Variant</button>}
              </fieldset>
            ))}
          </div>

          {submitError && <p className="error" role="alert">{submitError}</p>}

          <footer className="modal-actions">
            <button type="button" className="cancel-action" onClick={onClose} disabled={loading}>ยกเลิก</button>
            <button type="submit" className="primary-action" disabled={loading}>
              {loading ? 'กำลังบันทึก…' : (isEditing ? 'บันทึกการแก้ไข' : 'บันทึกสินค้า')}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
