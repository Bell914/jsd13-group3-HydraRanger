import { assets } from "../assets/assets";
export const SpecialProducts = ({ product, index }) => {
  return (
    <div
      key={index}
      className="group relative shrink-0 overflow-hidden rounded-xl cursor-pointer"
    >
      <img
        src={product.image}
        alt={product.title}
        className="h-[400px] w-96 object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <a
        href={product.link}
        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      >
        <span className="rounded-full bg-white px-6 py-2 font-bold text-gray-900 shadow-lg transition-colors hover:bg-gray-100">
          ดูสินค้า
        </span>
      </a>
      <span className="absolute top-0 left-1">
        <img src={assets.newtag} alt="new-icon" className="h-12 w-13" />
      </span>
      <div className="absolute bottom-4 left-4 font-bold text-white drop-shadow-lg">
        <h4 className="text-3xl">{product.title}</h4>
        <h6 className="text-sm font-normal opacity-90">สำรวจหมวดหมู่</h6>
      </div>
    </div>
  );
};
