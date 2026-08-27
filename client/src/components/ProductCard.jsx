import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  const price = product.variants?.[0]?.price ?? 0;

  return (
    <Link
      to={`/products/${product._id}`}
      className="card bg-base-100 shadow-sm hover:shadow-lg transition"
    >
      <figure className="aspect-square overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </figure>

      <div className="card-body">
        <h2 className="card-title">{product.name}</h2>

        <p className="text-lg font-semibold">฿{price}</p>

        <div className="flex flex-wrap gap-2">
          {product.tags?.map((tag) => (
            <span key={tag} className="badge badge-outline">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}