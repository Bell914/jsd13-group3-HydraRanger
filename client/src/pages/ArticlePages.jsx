import React, { useEffect, useState } from "react";
import { fashionNews } from "../assets/assets.js";
import { ArticleCard } from "../components/ArticleCard.jsx";
import PaginationPrevNext from "../components/PaginationPrevNext.jsx";
import { getArticles, normalizeArticle } from "../services/articleService.js";

export const ArticlePages = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [articles, setArticles] = useState(() => fashionNews.map(normalizeArticle));
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 9;

  useEffect(() => {
    let mounted = true;
    getArticles()
      .then((data) => {
        if (mounted) setArticles(data);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = articles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(articles.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-10 text-base-content">
        บทความทั้งหมด
      </h1>

      {loading && <p className="mb-6 text-center text-base-content/60">กำลังโหลดบทความ…</p>}
      {!loading && articles.length === 0 && (
        <p className="py-16 text-center text-base-content/60">ยังไม่มีบทความที่เผยแพร่</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {currentItems.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      <PaginationPrevNext
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        ariaLabel="Article pagination"
      />
    </div>
  );
};
