import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductById } from "../services/productService";

export default function ProductDetailPage() {
  const { productId } = useParams();

  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await getProductById(productId);

        if (!data) {
          setError("ไม่พบสินค้า");
          return;
        }

        setProduct(data);
      } catch (error) {
        setError("ไม่สามารถโหลดข้อมูลสินค้าได้");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (!product) {
    return null;
  }

  const colors = [...new Set(product.variants.map((variant) => variant.color))];

  const sizes = [
    ...new Set(
      product.variants
        .filter(
          (variant) =>
            !selectedColor || variant.color === selectedColor
        )
        .map((variant) => variant.size)
    ),
  ];

  const selectedVariant = product.variants.find(
    (variant) =>
      variant.color === selectedColor &&
      variant.size === selectedSize
  );

  function handleColorChange(color) {
    setSelectedColor(color);
    setSelectedSize("");
  }

  function handleAddToCart() {
    if (!selectedColor) {
      alert("กรุณาเลือกสี");
      return;
    }

    if (!selectedSize) {
      alert("กรุณาเลือกไซส์");
      return;
    }

    if (!selectedVariant) {
      alert("ไม่พบสินค้าตัวเลือกนี้");
      return;
    }

    const cartItem = {
      productId: product._id,
      variantId: selectedVariant._id,
      quantity,
    };

    console.log("Add to Cart:", cartItem);

    alert("เพิ่มสินค้าลงตะกร้าแล้ว");
  }

  return (
    <section className="grid lg:grid-cols-2 gap-10">
      <div>
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full rounded-2xl object-cover"
        />
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold">
            {product.name}
          </h1>

          <p className="mt-3 text-base-content/70">
            {product.description}
          </p>
        </div>

        <p className="text-2xl font-bold">
          ฿{selectedVariant?.price ?? product.variants[0]?.price}
        </p>

        <div className="flex gap-2">
          {product.tags.map((tag) => (
            <span key={tag} className="badge badge-outline">
              {tag}
            </span>
          ))}
        </div>

        <div>
          <h3 className="font-semibold mb-3">Color</h3>

          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className={`btn ${
                  selectedColor === color
                    ? "btn-primary"
                    : "btn-outline"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Size</h3>

          <div className="flex gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`btn ${
                  selectedSize === size
                    ? "btn-primary"
                    : "btn-outline"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Quantity</h3>

          <div className="flex items-center gap-4">
            <button
              className="btn"
              onClick={() =>
                setQuantity((current) => Math.max(1, current - 1))
              }
            >
              -
            </button>

            <span className="text-lg font-semibold">
              {quantity}
            </span>

            <button
              className="btn"
              onClick={() => setQuantity((current) => current + 1)}
            >
              +
            </button>
          </div>
        </div>

        <button
          className="btn btn-primary w-full"
          onClick={handleAddToCart}
        >
          Add to Cart
        </button>
      </div>
    </section>
  );
}