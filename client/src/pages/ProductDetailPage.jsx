import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProductById } from "../services/productService.js";
import { useCartStore } from "../store/cartStore.js";

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addToCart);

  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [displayedImage, setDisplayedImage] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [addedSuccessModal, setAddedSuccessModal] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      setLoading(true);
      setError("");
      try {
        const data = await getProductById(productId);

        if (!data) {
          if (isMounted) setError("ไม่พบข้อมูลสินค้าที่ต้องการ");
          return;
        }

        if (isMounted) {
          setProduct(data);
          setDisplayedImage(data.imageUrl);

          // Auto-select first color if available
          if (data.variants && data.variants.length > 0) {
            const firstColor = data.variants[0].color;
            setSelectedColor(firstColor);
            if (data.variants[0].imageUrl) {
              setDisplayedImage(data.variants[0].imageUrl);
            }
          }
        }
      } catch (err) {
        if (isMounted) setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์เพื่อโหลดข้อมูลได้");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  // Unique list of colors from variants
  const colors = useMemo(() => {
    if (!product?.variants) return [];
    return [...new Set(product.variants.map((v) => v.color))];
  }, [product]);

  // Unique list of sizes available for the currently selected color
  const availableSizes = useMemo(() => {
    if (!product?.variants) return [];
    return [
      ...new Set(
        product.variants
          .filter((v) => !selectedColor || v.color === selectedColor)
          .map((v) => v.size)
      ),
    ];
  }, [product, selectedColor]);

  // Specific selected variant
  const selectedVariant = useMemo(() => {
    if (!product?.variants) return null;
    return (
      product.variants.find(
        (v) => v.color === selectedColor && v.size === selectedSize
      ) || null
    );
  }, [product, selectedColor, selectedSize]);

  // Handle color change and update image
  const handleColorChange = (color) => {
    setSelectedColor(color);
    setSelectedSize(""); // Reset size when color changes
    setValidationError("");

    // Find variant image for this color
    const variantWithImage = product.variants.find(
      (v) => v.color === color && v.imageUrl
    );
    if (variantWithImage && variantWithImage.imageUrl) {
      setDisplayedImage(variantWithImage.imageUrl);
    }
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    setValidationError("");
  };

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => {
      const nextVal = prev + delta;
      const maxStock = selectedVariant?.stockQuantity || 99;
      return Math.max(1, Math.min(nextVal, maxStock));
    });
  };

  // Add to Cart Flow
  const handleAddToCart = () => {
    setValidationError("");

    if (!selectedColor) {
      setValidationError("กรุณาเลือกสีก่อนทำรายการ");
      return;
    }

    if (!selectedSize) {
      setValidationError("กรุณาเลือกไซส์ก่อนทำรายการ");
      return;
    }

    if (!selectedVariant) {
      setValidationError("ขออภัย สินค้าตัวเลือกนี้ไม่มีในระบบ");
      return;
    }

    if (selectedVariant.stockQuantity <= 0) {
      setValidationError("ขออภัย สินค้านี้หมดสต็อกชั่วคราว");
      return;
    }

    const cartPayload = {
      product,
      productId: product._id,
      variant: selectedVariant,
      variantId: selectedVariant._id,
      quantity,
    };
    console.log("Add to Cart:", cartPayload);

    // Add to Zustand Cart Store
    addToCart({
      product,
      variant: selectedVariant,
      quantity,
    });

    // Show Success Modal / Alert
    setAddedSuccessModal({
      productName: product.name,
      color: selectedColor,
      size: selectedSize,
      quantity,
      price: selectedVariant.price,
      total: selectedVariant.price * quantity,
      image: displayedImage || product.imageUrl,
    });
  };

  if (loading) {
    return (
      <main className="flex-1 bg-background py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 animate-pulse">
            <div className="aspect-square w-full rounded-2xl bg-occasion-border/20"></div>
            <div className="space-y-6">
              <div className="h-8 w-2/3 bg-occasion-border/20 rounded"></div>
              <div className="h-6 w-1/3 bg-occasion-border/20 rounded"></div>
              <div className="h-24 w-full bg-occasion-border/15 rounded"></div>
              <div className="h-12 w-full bg-occasion-border/20 rounded"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex-1 bg-background py-16">
        <div className="mx-auto max-w-md px-4 text-center">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
            <p className="text-lg font-bold text-red-700">{error || "ไม่พบสินค้า"}</p>
            <Link
              to="/products"
              className="mt-6 inline-flex rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-primary-hover transition"
            >
              ← กลับไปหน้ารวมสินค้า
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const basePrice = selectedVariant?.price ?? (product.variants?.[0]?.price || 0);

  return (
    <main className="flex-1 bg-background py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-secondary">
          <ol className="flex items-center gap-2">
            <li>
              <Link to="/" className="hover:text-primary transition">
                หน้าแรก
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link to="/products" className="hover:text-primary transition">
                สินค้าทั้งหมด
              </Link>
            </li>
            <li>/</li>
            <li className="font-semibold text-primary truncate max-w-xs sm:max-w-md">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Product Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Left Column: Product Imagery */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-occasion-border/20 bg-surface shadow-surface">
              <img
                src={displayedImage}
                alt={product.name}
                className="h-full w-full object-cover transition-all duration-300"
              />
              {product.category && (
                <span className="absolute top-4 left-4 rounded-xl bg-surface/90 backdrop-blur-sm px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary shadow-sm">
                  {product.category}
                </span>
              )}
            </div>

            {/* Thumbnail Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {colors.map((color) => {
                  const variantWithImg = product.variants.find(
                    (v) => v.color === color && v.imageUrl
                  );
                  const thumbImg = variantWithImg?.imageUrl || product.imageUrl;
                  const isSelected = selectedColor === color;

                  return (
                    <button
                      key={color}
                      onClick={() => handleColorChange(color)}
                      className={`relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? "border-accent ring-2 ring-accent/30 shadow-md"
                          : "border-occasion-border/30 hover:border-primary/50 opacity-70 hover:opacity-100"
                      }`}
                      title={color}
                    >
                      <img
                        src={thumbImg}
                        alt={color}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-black/60 py-0.5 text-center text-[10px] text-white font-medium truncate">
                        {color}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Product Flow (Info & Selection) */}
          <div className="flex flex-col justify-between">
            <div className="space-y-6">
              {/* Product Header & Pricing */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded-md bg-accent/10 px-2.5 py-0.5 text-xs font-bold text-accent">
                    {product.gender ? product.gender.toUpperCase() : "UNISEX"}
                  </span>
                  {product.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-occasion-border/40 px-2 py-0.5 text-xs text-secondary"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-primary">
                  {product.name}
                </h1>

                <div className="mt-3 flex items-baseline gap-4">
                  <span className="text-3xl font-extrabold text-accent">
                    ฿{basePrice.toLocaleString()}
                  </span>
                  {selectedVariant && (
                    <span className="text-xs text-secondary font-medium">
                      SKU: {selectedVariant.sku}
                    </span>
                  )}
                </div>

                <p className="mt-4 text-sm text-secondary leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Stock Status Indicator */}
              <div className="flex items-center gap-2 text-xs font-medium">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-emerald-700">
                  {selectedVariant
                    ? `มีสินค้าในสต็อก (${selectedVariant.stockQuantity} ชิ้น)`
                    : "พร้อมจัดส่งทั่วประเทศ"}
                </span>
              </div>

              <hr className="border-occasion-border/20" />

              {/* STEP 1: SELECT COLOR */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-bold text-primary flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[11px]">1</span>
                    เลือกสี (Color)
                  </label>
                  {selectedColor && (
                    <span className="text-xs font-semibold text-accent">
                      {selectedColor}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {colors.map((color) => {
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleColorChange(color)}
                        className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-primary text-white shadow-md ring-2 ring-primary/20"
                            : "border border-occasion-border/30 bg-surface text-secondary hover:border-primary hover:text-primary"
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 2: SELECT SIZE */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-bold text-primary flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[11px]">2</span>
                    เลือกไซส์ (Size)
                  </label>
                  {selectedSize ? (
                    <span className="text-xs font-semibold text-accent">
                      ไซส์ {selectedSize}
                    </span>
                  ) : (
                    <span className="text-xs text-secondary/70">
                      กรุณาเลือกไซส์
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {availableSizes.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleSizeChange(size)}
                        className={`min-w-[54px] rounded-xl px-4 py-2.5 text-sm font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-accent text-white shadow-md ring-2 ring-accent/30"
                            : "border border-occasion-border/30 bg-surface text-secondary hover:border-accent hover:text-accent"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 3: SELECT QUANTITY */}
              <div>
                <label className="block text-sm font-bold text-primary mb-3 flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[11px]">3</span>
                  เลือกจำนวน (Quantity)
                </label>

                <div className="flex items-center gap-4">
                  <div className="flex items-center rounded-xl border border-occasion-border/30 bg-surface shadow-sm">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="px-3.5 py-2 text-base font-bold text-secondary hover:text-primary disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                      aria-label="ลดจำนวน"
                    >
                      −
                    </button>
                    <span className="w-12 text-center text-sm font-bold text-primary">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= (selectedVariant?.stockQuantity || 99)}
                      className="px-3.5 py-2 text-base font-bold text-secondary hover:text-primary disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                      aria-label="เพิ่มจำนวน"
                    >
                      +
                    </button>
                  </div>

                  {selectedVariant && (
                    <span className="text-xs text-secondary">
                      ราคารวม: <strong className="text-accent text-sm">฿{(selectedVariant.price * quantity).toLocaleString()}</strong>
                    </span>
                  )}
                </div>
              </div>

              {/* Validation Alert */}
              {validationError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600 animate-bounce">
                  ⚠️ {validationError}
                </div>
              )}
            </div>

            {/* STEP 4: ADD TO CART ACTION */}
            <div className="mt-8 pt-6 border-t border-occasion-border/20">
              <button
                type="button"
                id="add-to-cart-btn"
                onClick={handleAddToCart}
                className="w-full rounded-2xl bg-accent px-6 py-4 text-base font-bold text-white shadow-lg transition-all duration-200 hover:bg-accent-hover hover:shadow-xl active:scale-[0.99] cursor-pointer flex items-center justify-center gap-3"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                เพิ่มลงตะกร้าสินค้า (Add to Cart)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL / TOAST */}
      {addedSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-surface p-6 sm:p-8 shadow-2xl border border-occasion-border/20">
            {/* Close button */}
            <button
              onClick={() => setAddedSuccessModal(null)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full border border-occasion-border/30 flex items-center justify-center text-secondary hover:text-primary transition cursor-pointer"
            >
              ✕
            </button>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-extrabold text-primary">
                เพิ่มลงในตะกร้าเรียบร้อยแล้ว!
              </h3>
              <p className="mt-1 text-xs text-secondary">
                สินค้าของคุณถูกบันทึกไว้ในตะกร้าสินค้าแล้ว
              </p>

              {/* Item Summary Card */}
              <div className="mt-5 flex items-center gap-4 rounded-2xl border border-occasion-border/20 bg-background/60 p-3 text-left">
                <img
                  src={addedSuccessModal.image}
                  alt=""
                  className="h-16 w-16 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-primary truncate">
                    {addedSuccessModal.productName}
                  </h4>
                  <p className="text-xs text-secondary mt-0.5">
                    สี: <span className="font-semibold text-primary">{addedSuccessModal.color}</span> | ไซส์: <span className="font-semibold text-primary">{addedSuccessModal.size}</span>
                  </p>
                  <p className="text-xs text-accent font-bold mt-1">
                    จำนวน: {addedSuccessModal.quantity} ชิ้น | รวม ฿{addedSuccessModal.total.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setAddedSuccessModal(null)}
                  className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover transition cursor-pointer"
                >
                  ตกลง (เรียบร้อย)
                </button>
                <Link
                  to="/products"
                  onClick={() => setAddedSuccessModal(null)}
                  className="flex-1 rounded-xl border border-occasion-border/40 bg-surface px-4 py-2.5 text-sm font-semibold text-secondary hover:border-primary hover:text-primary transition text-center"
                >
                  ← ดูสินค้าอื่นเพิ่มเติม
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export { ProductDetailPage };