import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { fashionNews } from '../assets/assets.js';
import { getArticleById, normalizeArticle } from '../services/articleService.js';

function findLegacyArticle(id) {
  return fashionNews.find((item) => String(item.id) === String(id));
}

export const ArticleDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const backPath = location.state?.from || '/article';
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const legacyArticle = findLegacyArticle(id);

    if (!/^[a-f\d]{24}$/i.test(id)) {
      setArticle(legacyArticle ? normalizeArticle(legacyArticle) : null);
      setLoading(false);
      return () => { mounted = false; };
    }

    getArticleById(id)
      .then((data) => {
        if (mounted) setArticle(data);
      })
      .catch(() => {
        if (mounted) setArticle(legacyArticle ? normalizeArticle(legacyArticle) : null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return <p className="py-20 text-center text-base-content/60">กำลังโหลดบทความ…</p>;
  }

  if (!article) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-red-500 mb-4">ไม่พบบทความ</h2>
        <Link to="/article" className="btn">กลับไปหน้ารวม</Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-4xl py-10 px-4 text-base-content">
      <Link to={backPath} className="btn btn-ghost mb-6">← กลับ</Link>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="badge badge-secondary">{article.category}</span>
        <span className="text-base-content/60 text-sm">{article.date}</span>
        {article.author && <span className="text-base-content/60 text-sm">โดย {article.author}</span>}
      </div>
      <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
      {article.description && <p className="mb-6 text-lg text-base-content/70">{article.description}</p>}
      <img
        src={article.image || 'https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp'}
        alt={article.title}
        className="w-full h-[400px] object-cover rounded-xl mb-8 shadow-md"
      />
      <div className="whitespace-pre-line text-lg leading-8">
        {article.content || `เนื้อหาของบทความ ${article.title} จะแสดงที่นี่...`}
      </div>
    </article>
  );
};
