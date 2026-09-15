import { useState } from 'react';
import { Image } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
const IMAGE_SERVER_URL = API_BASE_URL.replace(/\/api\/?$/, '');

const getProductImageUrl = (product) => {
  const firstVariant = product.variants?.[0];
  const imageUrl = firstVariant?.imageUrl || product.imageUrl;

  if (!imageUrl) {
    return '';
  }

  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }

  return `${IMAGE_SERVER_URL.replace('/api', '')}${imageUrl}`;
};

function ProductThumbnail({ product }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = getProductImageUrl(product);

  if (!imageUrl || imageFailed) {
    return (
      <div className="product-thumbnail product-thumbnail-placeholder">
        <Image size={20} aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="product-thumbnail">
      <img
        src={imageUrl}
        alt={`รูปสินค้า ${product.name}`}
        loading="lazy"
        onError={() => setImageFailed(true)}
      />
    </div>
  );
}

const formatPrice = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  maximumFractionDigits: 0,
});

const getSummary = (product) => {
  const variants = product.variants || [];
  const totalStock = variants.reduce((total, variant) => total + variant.stockQuantity, 0);
  const prices = variants.map((variant) => variant.price);

  let price = 0;
  if (prices.length > 0) {
    price = Math.min(...prices);
  }

  let status = 'สินค้าหมด';
  if (totalStock > 0) {
    status = 'พร้อมขาย';
  }

  return {
    sku: variants.length > 0 ? variants[0].sku : '-',
    price,
    totalStock,
    status,
  };
};

export function ProductTable({ products, onEdit, onDelete }) {
  if (products.length === 0) {
    return (
      <section className="empty-state" aria-live="polite">
        <strong>ยังไม่มีสินค้า</strong>
        <p>เพิ่มสินค้าใหม่ หรือเปลี่ยนคำค้นหาเพื่อดูรายการสินค้า</p>
      </section>
    );
  }

  return (
    <section className="product-table-card" aria-label="รายการสินค้า">
      <div className="table-scroll">
        <table className="product-table">
          <thead>
            <tr>
              <th>รูปภาพ</th>
              <th>ชื่อสินค้า / SKU</th>
              <th>หมวดหมู่</th>
              <th>ราคา</th>
              <th>คงเหลือ (Stock)</th>
              <th>สถานะ</th>
              <th className="align-right">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const summary = getSummary(product);
              return (
                <tr key={product._id ?? product.productId}>
                  <td>
                    <ProductThumbnail product={product} />
                  </td>
                  <td>
                    <strong className="product-name">{product.name}</strong>
                    <small>SKU: {summary.sku}</small>
                  </td>
                  <td className="capitalize">{product.category}</td>
                  <td className="price">{formatPrice.format(summary.price)}</td>
                  <td>
                    <span className={summary.totalStock <= 10 ? 'stock low' : 'stock'}>
                      {summary.totalStock} ตัว
                    </span>
                  </td>
                  <td>
                    <span className={`status ${summary.totalStock > 0 ? 'active' : 'empty'}`}>
                      {summary.status}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button type="button" aria-label={`แก้ไข ${product.name}`} title="แก้ไข" onClick={() => onEdit(product)}>
                        แก้ไข
                      </button>
                      <button
                        type="button"
                        className="danger"
                        aria-label={`ลบ ${product.name}`}
                        title="ลบ"
                        onClick={() => onDelete(product)}
                      >
                        ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <footer className="table-footer">
        <p>แสดง {products.length} จากทั้งหมด {products.length} รายการ</p>
        <button type="button" className="page-button" aria-current="page">1</button>
      </footer>
    </section>
  );
}
