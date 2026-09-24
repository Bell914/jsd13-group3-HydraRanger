import { Link } from "react-router-dom";

function isNewArticle(article) {
  if (!article.publishedAt) return Number(article.id) <= 3;
  const age = Date.now() - new Date(article.publishedAt).getTime();
  return age >= 0 && age <= 7 * 24 * 60 * 60 * 1000;
}

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
          {isNewArticle(article) && (
            <span className="badge badge-error badge-sm text-white ml-1 p-2">
              NEW
            </span>
          )}
        </h2>

        <div className="card-actions justify-end mt-auto pt-4">
          <Link
            to={`/article/${article.id}`}
            state={{ from: "/article" }}
            className="btn btn-primary btn-sm w-full sm:w-auto text-white"
          >
            อ่านเพิ่มเติม
          </Link>
        </div>
      </div>
    </div>
  );
};
