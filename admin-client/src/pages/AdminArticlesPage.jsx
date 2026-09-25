import { useEffect, useState } from 'react';
import { AdminTopbar } from '../components/AdminTopbar.jsx';
import { ArticleFormModal } from '../components/ArticleFormModal.jsx';
import {
  getArticles,
  createArticle,
  updateArticle,
  updateArticleStatus,
} from '../services/articleService.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api';

function getImageUrl(imageUrl) {
  if (!imageUrl || imageUrl.startsWith('http')) return imageUrl;
  return `${API_BASE_URL.replace(/\/api\/?$/, '')}${imageUrl}`;
}

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(new Date(value));
}

export function AdminArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [editingArticle, setEditingArticle] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const searchText = search.trim().toLowerCase();
  const visibleArticles = articles.filter((article) => {
    const matchesStatus = statusFilter === 'all' || (
      statusFilter === 'published' ? article.isPublished !== false : article.isPublished === false
    );
    const articleText = `${article.title || ''} ${article.category || ''} ${article.author || ''}`.toLowerCase();
    return matchesStatus && articleText.includes(searchText);
  });

  async function loadArticles() {
    setLoading(true);
    setError('');
    try {
      setArticles(await getArticles());
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadArticles();
  }, []);

  function replaceArticle(updatedArticle) {
    setArticles((current) => current.map((article) => (
      article._id === updatedArticle._id ? updatedArticle : article
    )));
  }

  async function saveArticle(data) {
    setSaving(true);
    setError('');
    try {
      if (editingArticle) {
        replaceArticle(await updateArticle(editingArticle._id, data));
      } else {
        const created = await createArticle(data);
        setArticles((current) => [created, ...current]);
      }
      setFormOpen(false);
      setEditingArticle(null);
    } catch (saveError) {
      setError(saveError.message);
      throw saveError;
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(article) {
    setSaving(true);
    setError('');
    try {
      const updated = await updateArticleStatus(article._id, article.isPublished === false);
      replaceArticle(updated);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-content">
      <AdminTopbar title="บทความ" />
      <main className="data-page">
        <header className="page-heading">
          <div><h1>บทความ</h1><p>สร้าง แก้ไข และจัดการบทความที่แสดงบนหน้าเว็บ</p></div>
          <button type="button" className="primary-action" onClick={() => { setEditingArticle(null); setFormOpen(true); }}>เพิ่มบทความ</button>
        </header>

        {error && <div className="dashboard-error" role="alert"><p>{error}</p><button type="button" onClick={loadArticles}>ลองใหม่</button></div>}
        <section className="filter-toolbar" aria-label="ค้นหาและกรองบทความ">
          <label className="product-search plain-search">
            <span className="sr-only">ค้นหาบทความ</span>
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหาหัวข้อ หมวดหมู่ หรือผู้เขียน..." />
          </label>
          <div className="filters">
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="กรองสถานะบทความ">
              <option value="all">ทุกสถานะ</option>
              <option value="published">เผยแพร่แล้ว</option>
              <option value="draft">ฉบับร่าง</option>
            </select>
          </div>
        </section>

        {loading && <p className="dashboard-message">กำลังโหลดบทความ…</p>}
        {!loading && !error && articles.length === 0 && <div className="empty-state"><strong>ยังไม่มีบทความ</strong><p>กดเพิ่มบทความเพื่อสร้างบทความแรก</p></div>}
        {!loading && articles.length > 0 && visibleArticles.length === 0 && <div className="empty-state"><strong>ไม่พบบทความที่ตรงกับตัวกรอง</strong><p>ลองเปลี่ยนคำค้นหาหรือสถานะ</p></div>}

        {visibleArticles.length > 0 && (
          <section className="product-table-card">
            <div className="table-scroll">
              <table className="data-table">
                <thead><tr><th>รูป</th><th>บทความ</th><th>หมวดหมู่</th><th>วันที่</th><th>สถานะ</th><th>จัดการ</th></tr></thead>
                <tbody>
                  {visibleArticles.map((article) => (
                    <tr key={article._id}>
                      <td data-label="รูป"><img className="article-thumbnail" src={getImageUrl(article.imageUrl)} alt="" /></td>
                      <td data-label="บทความ"><strong>{article.title}</strong><small>{article.author || 'OCCASION'}</small></td>
                      <td data-label="หมวดหมู่">{article.category}</td>
                      <td data-label="วันที่">{formatDate(article.publishedAt)}</td>
                      <td data-label="สถานะ"><span className={`status ${article.isPublished === false ? 'suspended' : 'active'}`}>{article.isPublished === false ? 'ฉบับร่าง' : 'เผยแพร่แล้ว'}</span></td>
                      <td data-label="จัดการ"><div className="row-actions"><button type="button" onClick={() => { setEditingArticle(article); setFormOpen(true); }} disabled={saving}>แก้ไข</button><button type="button" className={article.isPublished === false ? '' : 'danger'} onClick={() => toggleStatus(article)} disabled={saving}>{article.isPublished === false ? 'เผยแพร่' : 'ซ่อน'}</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {formOpen && <ArticleFormModal article={editingArticle} loading={saving} onClose={() => setFormOpen(false)} onSave={saveArticle} />}
      </main>
    </div>
  );
}
