export const RecommendProduct = ({ product, index }) => {
  return (
    <div
      key={index}
      className="group relative aspect-[3/4] mx-auto w-full max-w-sm overflow-hidden rounded-xl shadow-md"
    >
      <a href="Product_Page.html?category=tops" className="block h-full w-full">
        <img
          src={product.image || product.items?.[0]?.image}
          alt={product.title || product.nameTh || product.name}
          className="h-full w-full cursor-pointer object-cover transition duration-300 ease-in-out group-hover:scale-105"
        />
        <div className="absolute bottom-4 left-4 font-bold text-white drop-shadow-lg">
          <h4 className="text-3xl">
            {product.title || product.nameTh || product.name}
          </h4>
          <h6 className="text-sm font-normal opacity-90">สำรวจหมวดหมู่</h6>
        </div>
      </a>
    </div>
  );
};
