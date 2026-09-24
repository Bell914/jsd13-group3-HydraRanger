import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { LoadingSpinner } from "../components/LoadingSpinner.jsx";
import { getArticleById } from "../services/articleService.js";

export const ArticleDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const backPath = location.state?.from || "/article";

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    getArticleById(id).then((result) => {
      if (!isMounted) return;
      setArticle(result);
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-28">
        <LoadingSpinner message="กำลังโหลดบทความ..." size="lg" />
      </div>
    );
  }

  // ถ้าหาบทความไม่เจอ (เช่น พิมพ์ URL ผิด)
  if (!article) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-red-500 mb-4">ไม่พบบทความ</h2>
        <Link to="/article" className="btn">
          กลับไปหน้ารวม
        </Link>
      </div>
    );
  }

  const paragraphs = (article.content || "")
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-4xl py-10 px-4 text-black">
      {/* ปุ่มย้อนกลับ */}
      <Link to={backPath} className="btn btn-ghost mb-6">
        ← กลับ
      </Link>

      {/* เนื้อหาบทความ */}
      <div className="mb-4 flex items-center gap-2">
        <span className="badge badge-secondary">{article.category}</span>
        <span className="text-gray-500 text-sm">{article.date}</span>
        {article.author && (
          <span className="text-gray-400 text-sm">โดย {article.author}</span>
        )}
      </div>

      <h1 className="text-3xl font-bold mb-6">{article.title}</h1>

      <img
        src={article.image}
        alt={article.title}
        loading="lazy"
        decoding="async"
        className="w-full h-[400px] object-cover rounded-xl mb-6 shadow-md"
      />

      {paragraphs.length > 0 ? (
        <div className="space-y-4">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="text-lg leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      ) : (
        <p className="text-lg leading-relaxed">
          เนื้อหาของบทความ {article.title} จะแสดงที่นี่...
        </p>
      )}
    </div>
  );
};