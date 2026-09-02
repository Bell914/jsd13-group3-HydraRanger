import React from "react";
import { Link } from "react-router-dom";

export const ArticleCard = ({ article }) => {
  return (
    <div className="card bg-base-100 w-full shadow-sm hover:shadow-md transition-shadow duration-300">
      <figure>
        <img
          src={
            article.image ||
            "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
          }
          alt={article.title}
          className="w-full h-52 object-cover"
        />
      </figure>

      <div className="card-body px-5 py-5 flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <span className="badge badge-secondary text-xs font-semibold">
            {article.category}
          </span>
          <span className="text-gray-500 text-xs">{article.date}</span>
        </div>

        <h2 className="card-title text-base md:text-lg leading-tight mb-2 text-base-content">
          {article.title}
          {article.id <= 3 && (
            <span className="badge badge-error badge-sm text-white ml-1 p-2">
              NEW
            </span>
          )}
        </h2>

        <div className="card-actions justify-end mt-auto pt-4">
          <Link to={`/article/${article.id}`} className="w-full sm:w-auto">
            <button className="btn btn-primary btn-sm w-full text-white">
              อ่านเพิ่มเติม
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
