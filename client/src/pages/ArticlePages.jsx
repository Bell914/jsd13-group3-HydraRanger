import React, { useEffect } from "react";
import { ArticleCard } from "../components/ArticleCard.jsx";
import { LoadingSpinner } from "../components/LoadingSpinner.jsx";
import PaginationPrevNext from "../components/PaginationPrevNext.jsx";
import { useArticleStore } from "../store/articleStore.js";

export const ArticlePages = () => {
  const {
    articles,
    loading,
    error,
    currentPage,
    totalPages,
    setPage,
    fetchArticles,
  } = useArticleStore();

  useEffect(() => {
    fetchArticles({ page: 1 });
  }, []);

  const handlePageChange = (pageNumber) => {
    setPage(pageNumber);
    fetchArticles({ page: pageNumber });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center mb-10 text-base-content">
          บทความทั้งหมด
        </h1>
        <div className="flex justify-center py-20">
          <LoadingSpinner message="กำลังโหลดบทความ..." size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center mb-10 text-base-content">
          บทความทั้งหมด
        </h1>
        <div
          className="p-6 rounded-2xl bg-red-50 border border-red-200 text-center my-6"
          role="alert"
        >
          <h2 className="text-base font-bold text-red-800 mb-1">
            ไม่สามารถโหลดข้อมูลได้
          </h2>
          <p className="text-xs text-red-600 mb-4">{error}</p>
          <button
            type="button"
            onClick={() => fetchArticles()}
            className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow hover:bg-primary/90 cursor-pointer"
          >
            ลองใหม่อีกครั้ง (Retry)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-10 text-base-content">
        บทความทั้งหมด
      </h1>

      {articles.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white border border-stone-200 text-center my-8">
          <h2 className="text-base font-bold text-primary mb-1">ไม่พบบทความ</h2>
          <p className="text-xs text-secondary">ยังไม่มีบทความในระบบ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {articles.map((article) => (
            <ArticleCard
              key={article.id || article.title}
              article={article}
            />
          ))}
        </div>
      )}

      <PaginationPrevNext
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        ariaLabel="Article pagination"
      />
    </div>
  );
};