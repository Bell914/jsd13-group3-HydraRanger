import { useEffect, useState } from 'react';
import { AdminTopbar } from '../components/AdminTopbar.jsx';
import { LookbookFormModal } from '../components/LookbookFormModal.jsx';
import { productService } from '../services/productService.js';
import {
  getLookbooks,
  createLookbook,
  updateLookbook,
  updateLookbookStatus,
} from '../services/lookbookService.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api';

function getImageUrl(imageUrl) {
  if (!imageUrl || imageUrl.startsWith('http')) return imageUrl;
  return `${API_BASE_URL.replace(/\/api\/?$/, '')}${imageUrl}`;
}

export function AdminLookbooksPage() {
  const [lookbooks, setLookbooks] = useState([]);
  const [products, setProducts] = useState([]);
  const [editingLookbook, setEditingLookbook] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('all');

  const searchText = search.trim().toLowerCase();
  const visibleLookbooks = lookbooks.filter((lookbook) => {
    const isVisible = lookbook.isActive !== false;
    const matchesVisibility = visibilityFilter === 'all' || (visibilityFilter === 'visible' ? isVisible : !isVisible);
    const lookbookText = `${lookbook.nameTh || ''} ${lookbook.name || ''} ${lookbook.lookbookId || ''}`.toLowerCase();
    return matchesVisibility && lookbookText.includes(searchText);
  });

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [lookbookData, productData] = await Promise.all([
        getLookbooks(),
        productService.getProducts(),
      ]);
      setLookbooks(lookbookData);
      setProducts(productData);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openCreateForm() {
    setEditingLookbook(null);
    setFormOpen(true);
  }

  function openEditForm(lookbook) {
    setEditingLookbook(lookbook);
    setFormOpen(true);
  }

  function replaceLookbook(updatedLookbook) {
    setLookbooks((current) => current.map((lookbook) => (
      lookbook._id === updatedLookbook._id ? updatedLookbook : lookbook
    )));
  }

  async function saveLookbook(data) {
    setSaving(true);
    setError('');
    try {
      if (editingLookbook) {
        const updated = await updateLookbook(editingLookbook._id, data);
        replaceLookbook(updated);
      } else {
        const created = await createLookbook(data);
        setLookbooks((current) => [created, ...current]);
      }
      setFormOpen(false);
      setEditingLookbook(null);
    } catch (saveError) {
      setError(saveError.message);
      throw saveError;
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(lookbook) {
    setSaving(true);
    setError('');
    try {
      const updated = await updateLookbookStatus(lookbook._id, lookbook.isActive === false);
      replaceLookbook(updated);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-content">
      <AdminTopbar title="Lookbooks" />

      <main className="data-page">
        <header className="page-heading">
          <div><h1>ลุคบุ๊ก</h1><p>จัดการลุคและสินค้าในแต่ละเซ็ตจาก MongoDB</p></div>
          <button type="button" className="primary-action" onClick={openCreateForm} disabled={products.length === 0}>เพิ่ม Lookbook</button>
        </header>

        {error && <div className="dashboard-error" role="alert"><p>{error}</p><button type="button" onClick={loadData}>ลองใหม่</button></div>}
        <section className="filter-toolbar" aria-label="ค้นหาและกรอง Lookbook">
          <label className="product-search plain-search">
            <span className="sr-only">ค้นหาชื่อหรือรหัส Lookbook</span>
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหา Lookbook..." />
          </label>
          <div className="filters">
            <select value={visibilityFilter} onChange={(event) => setVisibilityFilter(event.target.value)} aria-label="กรองการมองเห็น Lookbook">
              <option value="all">ทุกสถานะ</option>
              <option value="visible">แสดงอยู่</option>
              <option value="hidden">ซ่อนอยู่</option>
            </select>
          </div>
        </section>
        {loading && <p className="dashboard-message">กำลังโหลด Lookbooks…</p>}
        {!loading && !error && lookbooks.length === 0 && <div className="empty-state"><strong>ยังไม่มี Lookbook</strong><p>กดเพิ่ม Lookbook เพื่อสร้างลุคแรก</p></div>}
        {!loading && lookbooks.length > 0 && visibleLookbooks.length === 0 && <div className="empty-state"><strong>ไม่พบ Lookbook ที่ตรงกับตัวกรอง</strong><p>ลองเปลี่ยนคำค้นหาหรือสถานะ</p></div>}

        {visibleLookbooks.length > 0 && (
          <section className="product-table-card">
            <div className="table-scroll">
              <table className="data-table">
                <thead><tr><th>รูป</th><th>Lookbook</th><th>สินค้า</th><th>ราคาเซ็ต</th><th>สถานะ</th><th>จัดการ</th></tr></thead>
                <tbody>
                  {visibleLookbooks.map((lookbook) => (
                    <tr key={lookbook._id}>
                      <td data-label="รูป"><img className="lookbook-thumbnail" src={getImageUrl(lookbook.imageUrl)} alt={lookbook.nameTh} /></td>
                      <td data-label="Lookbook"><strong>{lookbook.nameTh}</strong><small>{lookbook.lookbookId} • {lookbook.name}</small></td>
                      <td data-label="สินค้า">{lookbook.items?.length || 0} รายการ</td>
                      <td data-label="ราคาเซ็ต" className="price">฿{Number(lookbook.setPrice || 0).toLocaleString()}</td>
                      <td data-label="สถานะ"><span className={`status ${lookbook.isActive === false ? 'suspended' : 'active'}`}>{lookbook.isActive === false ? 'ซ่อนอยู่' : 'แสดงอยู่'}</span></td>
                      <td data-label="จัดการ"><div className="row-actions"><button type="button" onClick={() => openEditForm(lookbook)} disabled={saving}>แก้ไข</button><button type="button" className={lookbook.isActive === false ? '' : 'danger'} onClick={() => toggleStatus(lookbook)} disabled={saving}>{lookbook.isActive === false ? 'เปิดแสดง' : 'ซ่อน'}</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {formOpen && (
          <LookbookFormModal
            lookbook={editingLookbook}
            products={products}
            loading={saving}
            onClose={() => setFormOpen(false)}
            onSave={saveLookbook}
          />
        )}
      </main>
    </div>
  );
}
