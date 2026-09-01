import React, { useState } from "react";
import { fashionNews } from "../assets/assets"; // ตรวจสอบ path ให้ตรง
import { ArticleCard } from "../components/ArticleCard"; // ตรวจสอบ path ให้ตรง
import { Pagination } from "../components/Pagination"; // ตรวจสอบ path ให้ตรง

export const ArticlePages = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = fashionNews.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(fashionNews.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-10 text-base-content">
        บทความทั้งหมด
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {currentItems.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};
