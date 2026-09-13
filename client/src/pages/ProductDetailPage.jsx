import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Heart,
  Share2,
  Ruler,
  ChevronDown,
  ChevronUp,
  Star,
  Plus,
  Minus,
  Check,
  X,
  ShoppingBag,
} from "lucide-react";
import { getProductById, getProducts } from "../services/productService.js";
import { useCartStore } from "../store/cartStore.js";
import lookData from "../data/look-data.json";

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addToCart);

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("S");
  const [quantity, setQuantity] = useState(1);
  const [displayedImage, setDisplayedImage] = useState("");
  const [activeThumbIndex, setActiveThumbIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [addedSuccessModal, setAddedSuccessModal] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Accordion state (Details & Materials)
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [isMaterialsOpen, setIsMaterialsOpen] = useState(true);

  // Standard sizes matching wireframe: XS, S, M, L, XL, XXL, 3XL
  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const [prodData, prodList] = await Promise.all([
          getProductById(productId),
          getProducts(),
        ]);

        if (!prodData) {
          if (isMounted) setError("ไม่พบข้อมูลสินค้าที่ต้องการ");
          return;
        }

        if (isMounted) {
          setProduct(prodData);
          setDisplayedImage(prodData.imageUrl);
          setAllProducts(prodList || []);

          if (prodData.variants && prodData.variants.length > 0) {
            const firstColor = prodData.variants[0].color;
            setSelectedColor(firstColor);
            if (prodData.variants[0].imageUrl) {
              setDisplayedImage(prodData.variants[0].imageUrl);
            }
          }
        }
      } catch (err) {
        if (isMounted) setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์เพื่อโหลดข้อมูลได้");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  // Unique list of colors from variants
  const colors = useMemo(() => {
    if (!product?.variants) return [];
    return [...new Set(product.variants.map((v) => v.color))];
  }, [product]);

  // Generate 7 thumbnails for gallery matching the wireframe
  const thumbnails = useMemo(() => {
    if (!product) return [];
    const baseImg = displayedImage || product.imageUrl;
    // Provide 7 images or variants/angle mockups
    const list = [baseImg];
    if (product.variants) {
      product.variants.forEach((v) => {
        if (v.imageUrl && !list.includes(v.imageUrl)) {
          list.push(v.imageUrl);
        }
      });
    }
    // Fill up to 7 items using angles/placeholders
    while (list.length < 7) {
      list.push(baseImg);
    }
    return list.slice(0, 7);
  }, [product, displayedImage]);

  // Selected variant
  const selectedVariant = useMemo(() => {
    if (!product?.variants) return null;
    return (
      product.variants.find((v) => v.color === selectedColor) ||
      product.variants[0] ||
      null
    );
  }, [product, selectedColor]);

  // Handle color change
  const handleColorChange = (color) => {
    setSelectedColor(color);
    const variantWithImage = product?.variants?.find(
      (v) => v.color === color && v.imageUrl
    );
    if (variantWithImage?.imageUrl) {
      setDisplayedImage(variantWithImage.imageUrl);
      setActiveThumbIndex(0);
    }
  };

  // Add to cart handler
  const handleAddToCart = () => {
    setValidationError("");

    if (!selectedSize) {
      setValidationError("กรุณาเลือกไซส์ก่อนทำรายการ");
      return;
    }

    const currentPrice = selectedVariant?.price || 490;

    const variantPayload = {
      ...selectedVariant,
      size: selectedSize,
      color: selectedColor || "Standard",
      price: currentPrice,
    };

    addToCart({
      product,
      variant: variantPayload,
      quantity,
    });

    setAddedSuccessModal({
      productName: product.name,
      color: selectedColor,
      size: selectedSize,
      quantity,
      price: currentPrice,
      total: currentPrice * quantity,
      image: displayedImage || product.imageUrl,
    });
  };

  // Related Matching Products (สินค้าที่เข้ากันได้ดี)
  const matchingProducts = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    // Opposite category: if top show bottoms, if bottom show tops
    const oppCat = product?.category === "tops" ? "bottoms" : "tops";
    const filtered = allProducts.filter((p) => p.category === oppCat);
    const list = filtered.length >= 4 ? filtered : allProducts.filter((p) => p._id !== product?._id);
    return list.slice(0, 4);
  }, [allProducts, product]);

  // Occasion Looks
  const looksList = useMemo(() => {
    const rawLooks = lookData?.looks || [];
    return rawLooks.slice(0, 4);
  }, []);

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

  const currentPrice = selectedVariant?.price || 490;

  return (
    <main className="flex-1 bg-background py-6 md:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ========================================================================= */}
        {/* TOP SECTION: Left Pink Box (Main Image + 7 Thumbs) & Right Product Buy Box */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT COLUMN: Pink Outer Container with Main Image & 7 Thumbnails */}
          <div className="lg:col-span-7 rounded-2xl sm:rounded-3xl bg-accent p-4 sm:p-6 shadow-lg">
            {/* Main Image Box */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl sm:rounded-2xl bg-[#3b5377] flex items-center justify-center p-4">
              <img
                src={displayedImage}
                alt={product.name}
                className="h-full w-full object-contain transition-all duration-300"
              />
            </div>

            {/* 7 Thumbnail Boxes matching the wireframe */}
            <div className="mt-4 grid grid-cols-7 gap-2 sm:gap-3">
              {thumbnails.map((thumb, idx) => {
                const isActive = activeThumbIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setDisplayedImage(thumb);
                      setActiveThumbIndex(idx);
                    }}
                    className={`relative aspect-square w-full overflow-hidden rounded-lg sm:rounded-xl bg-[#3b5377] p-1 transition-all cursor-pointer ${
                      isActive
                        ? "ring-2 ring-white shadow-md scale-105"
                        : "opacity-80 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={thumb}
                      alt={`Thumbnail ${idx + 1}`}
                      className="h-full w-full object-contain"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: Product Info & Purchase Form */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              {/* Title & Action Icons (Share, Wishlist) */}
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
                  {product.name}
                </h1>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href);
                      alert("คัดลอกลิงก์สินค้าเรียบร้อยแล้ว!");
                    }}
                    className="rounded-full p-2 text-secondary hover:bg-slate-200 transition cursor-pointer"
                    title="แชร์สินค้า"
                  >
                    <Share2 size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`rounded-full p-2 transition cursor-pointer ${
                      isWishlisted
                        ? "text-red-500 hover:bg-red-50"
                        : "text-secondary hover:bg-slate-200"
                    }`}
                    title="บันทึกในรายการโปรด"
                  >
                    <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>

              {/* Color Selector */}
              <div className="mt-5">
                <p className="text-sm font-bold text-primary mb-2">
                  สี : <span className="font-semibold text-secondary">{selectedColor || "01 OFF WHITE"}</span>
                </p>
                <div className="flex items-center gap-2.5">
                  {colors.map((color) => {
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleColorChange(color)}
                        className={`h-8 w-8 rounded-full border-2 transition-all cursor-pointer ${
                          isSelected
                            ? "border-primary ring-2 ring-accent scale-110"
                            : "border-gray-300 hover:scale-105"
                        }`}
                        style={{
                          backgroundColor:
                            color.toLowerCase().includes("white")
                              ? "#f8f9fa"
                              : color.toLowerCase().includes("charcoal")
                              ? "#374151"
                              : color.toLowerCase().includes("blue")
                              ? "#38bdf8"
                              : color.toLowerCase().includes("forest")
                              ? "#15803d"
                              : color.toLowerCase().includes("indigo")
                              ? "#312e81"
                              : color.toLowerCase().includes("taupe")
                              ? "#a8a29e"
                              : "#0046a7",
                        }}
                        title={color}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Size Selector: XS, S, M, L, XL, XXL, 3XL */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-primary">
                    ขนาด : <span className="text-secondary font-semibold">{selectedSize}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-accent underline transition cursor-pointer"
                  >
                    <Ruler size={14} />
                    <span>ตารางไซส์</span>
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {sizeOptions.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`rounded-lg py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer text-center ${
                          isSelected
                            ? "bg-primary text-white shadow ring-2 ring-accent"
                            : "border border-occasion-border/50 bg-white text-secondary hover:border-primary hover:text-primary"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-[11px] text-secondary">
                  ขนาด: ผู้หญิง {selectedSize} (ทรง Relaxed พอดีตัว)
                </p>
              </div>

              {/* Price Display */}
              <div className="mt-6 flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-primary">
                  ฿{currentPrice.toLocaleString()}.00
                </span>
                <span className="text-base font-bold text-secondary">บาท</span>
              </div>

              {/* Quantity Stepper & Stock Notification */}
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center rounded-xl border border-occasion-border/60 bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-secondary hover:text-primary transition cursor-pointer"
                    disabled={quantity <= 1}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-primary">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-1.5 text-secondary hover:text-primary transition cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 font-semibold">
                  ✓ มีสินค้าพร้อมจัดส่งทันที
                </div>
              </div>

              {validationError && (
                <p className="mt-2 text-xs font-bold text-red-600">
                  {validationError}
                </p>
              )}

              {/* Add to Cart Button */}
              <div className="mt-8">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full rounded-2xl bg-[#1a1a1a] py-4 text-base font-extrabold text-white shadow-xl hover:bg-black active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={20} />
                  <span>เพิ่มลงในตะกร้า</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DETAILS ACCORDION BOX WITH BLUE BORDER matching wireframe */}
        {/* ========================================================================= */}
        <section className="my-12 max-w-5xl mx-auto rounded-2xl border-2 border-[#0095ff] bg-white p-6 sm:p-8 shadow-sm">
          {/* Section 1: รายละเอียด (Details) */}
          <div className="border-b border-gray-200 pb-6">
            <button
              type="button"
              onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              className="flex w-full items-center justify-between text-left cursor-pointer"
            >
              <h2 className="text-lg sm:text-xl font-extrabold text-primary">
                รายละเอียด
              </h2>
              <span className="text-secondary font-bold text-xl">
                {isDetailsOpen ? "−" : "+"}
              </span>
            </button>

            {isDetailsOpen && (
              <div className="mt-4 space-y-4 text-sm text-gray-700 leading-relaxed">
                <ul className="space-y-1.5 list-none p-0 m-0">
                  <li>- เสื้อทรงหลวมที่ได้แรงบันดาลใจจากยุคทศวรรษที่ 1990</li>
                  <li>
                    - ทรงกระชับเข้ารูปพร้อมดีเทลช่วงชายแบบปล่อยสไตล์สตรีท แมตช์กับกางเกงสไตล์แคชชวล ทางการ และมินิมอล
                  </li>
                </ul>

                <div>
                  <h3 className="font-bold text-primary mb-1">รายละเอียดการใช้งาน</h3>
                  <ul className="space-y-1 list-none p-0 m-0 text-secondary">
                    <li>- ดีไซน์ช่วงลำตัวโปร่งนุ่มสบาย 01 OFF WHITE มีความโปร่งเล็กน้อย</li>
                    <li>- ทรง: ทรงเข้ารูป (Relaxed Fit)</li>
                    <li>- กระเป๋า: ไม่มีกระเป๋า</li>
                    <li>- รูปภาพที่แสดง อาจมีสีที่ยังไม่วางจำหน่าย</li>
                  </ul>
                </div>

                <div className="pt-2 text-xs text-gray-500">
                  <p>รหัสสินค้า: 465433, 474410, 460783</p>
                  <p className="mt-0.5">
                    โปรดทราบว่าสินค้านี้อาจมีรหัสสินค้าแตกต่างไปแม้จะเป็นสินค้าตัวเดียวกันก็ตาม
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: วัสดุ / การดูแล (Materials & Care) */}
          <div className="pt-6">
            <button
              type="button"
              onClick={() => setIsMaterialsOpen(!isMaterialsOpen)}
              className="flex w-full items-center justify-between text-left cursor-pointer"
            >
              <h2 className="text-lg sm:text-xl font-extrabold text-primary">
                วัสดุ / การดูแล
              </h2>
              <span className="text-secondary font-bold text-xl">
                {isMaterialsOpen ? "−" : "+"}
              </span>
            </button>

            {isMaterialsOpen && (
              <div className="mt-4 space-y-3 text-sm text-gray-700 leading-relaxed">
                <div>
                  <h3 className="font-bold text-primary mb-1">รายละเอียดวัสดุ</h3>
                  <p className="text-secondary">96% ฝ้าย, 4% สแปนเด็กซ์</p>
                </div>

                <div>
                  <h3 className="font-bold text-primary mb-1">คำแนะนำในการซัก</h3>
                  <p className="text-secondary">
                    ซักเครื่อง ด้วยน้ำเย็น, ซักแห้ง, ห้ามปั่นแห้ง
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* REVIEWS & COMMENTS SECTION */}
        {/* ========================================================================= */}
        <section className="my-12 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 border-b border-gray-300 pb-3">
            <h2 className="text-xl font-extrabold text-primary">รีวิว (Reviews)</h2>
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="currentColor" />
              ))}
            </div>
            <span className="text-sm font-bold text-primary">4.8 / 5</span>
            <span className="text-xs text-secondary">(จากผู้ซื้อ 128 คน)</span>
          </div>

          <div className="divide-y divide-gray-200 mt-6 space-y-6">
            {/* Comment 1 */}
            <div className="pt-4">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span className="font-bold text-primary text-sm">Comment</span>
                <span>25/01/2026</span>
              </div>
              <div className="flex items-center gap-1 text-amber-500 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <p className="text-xs font-semibold text-secondary mb-2">
                คุณเอมิลี่ • <span className="text-emerald-600">ลูกค้าที่ได้รับการยืนยันการซื้อ (Verified)</span>
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                เสื้อผ้านิ่มมาก ทรง Oversized สวยกำลังดี ใส่สบายไม่ร้อนเลย ตรงปกมากครับ คุณภาพเนื้อผ้าคุ้มเกินราคา
              </p>
              <p className="mt-2 text-[11px] text-gray-400">
                ความสูง 160-165 ซม., น้ำหนัก 50-55 กก. • ไซส์ที่ซื้อ: M
              </p>
            </div>

            {/* Comment 2 */}
            <div className="pt-6">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span className="font-bold text-primary text-sm">Comment</span>
                <span>20/01/2026</span>
              </div>
              <div className="flex items-center gap-1 text-amber-500 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <p className="text-xs font-semibold text-secondary mb-2">
                คุณเจมส์ • <span className="text-emerald-600">ลูกค้าที่ได้รับการยืนยันการซื้อ (Verified)</span>
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                คุณภาพผ้าดีมาก คุ้มราคา แมตช์กับกางเกงได้ง่าย ใส่ไปเที่ยวหรือไปทำงานก็ดูดี สั่งเพิ่มอีกตัวแน่นอน
              </p>
              <p className="mt-2 text-[11px] text-gray-400">
                ความสูง 175-180 ซม., น้ำหนัก 70-75 กก. • ไซส์ที่ซื้อ: L
              </p>
            </div>
          </div>

          <div className="mt-6 text-right">
            <button
              type="button"
              onClick={() => alert("ระบบแสดงความคิดเห็นเพิ่มเติมทั้งหมด")}
              className="text-xs font-bold text-primary hover:text-accent underline cursor-pointer"
            >
              ดูเพิ่มเติม &gt;
            </button>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* RELATED PRODUCTS: "สินค้าที่เข้ากันได้ดี" */}
        {/* ========================================================================= */}
        <section className="my-14">
          <h2 className="text-2xl font-black text-primary mb-6">
            สินค้าที่เข้ากันได้ดี
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {matchingProducts.map((match, idx) => (
              <Link
                key={match._id || idx}
                to={`/products/${match._id || match.productId}`}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl bg-[#0046a7] text-white shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl aspect-[3/4] p-3"
              >
                <div className="relative w-full flex-1 overflow-hidden rounded-xl bg-white/95 p-3 flex items-center justify-center">
                  <img
                    src={match.imageUrl}
                    alt={match.name}
                    className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-2 left-2 rounded-md bg-[#0046a7] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    {match.category || "item"}
                  </span>
                </div>
                <div className="pt-3 pb-1 flex items-center justify-between text-white">
                  <div className="flex flex-col">
                    <span className="text-sm sm:text-base font-extrabold tracking-wide text-white">
                      {match.category === "tops" ? "เสื้อ" : "กางเกง"}
                    </span>
                    <span className="text-[11px] text-white/80 line-clamp-1 max-w-[130px]">
                      {match.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm sm:text-base font-black text-amber-200">
                      ฿{match.variants?.[0]?.price || 590}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* OCCASION LOOK SECTION */}
        {/* ========================================================================= */}
        <section className="my-14">
          <h2 className="text-2xl font-black text-primary mb-6">
            Occasion Look
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {looksList.map((look, idx) => (
              <Link
                key={look.id || idx}
                to="/lookbook"
                className="group flex flex-col justify-between overflow-hidden rounded-2xl bg-[#0046a7] text-white shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl aspect-[3/4] p-3"
              >
                <div className="relative w-full flex-1 overflow-hidden rounded-xl bg-[#3b5377] flex items-center justify-center p-3 text-center">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide group-hover:scale-105 transition-transform">
                    {look.name || `Look${idx + 1}`}
                  </h3>
                </div>
                <div className="pt-3 pb-1 flex items-center justify-between text-white">
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-extrabold text-white">
                      {look.nameTh || "เซ็ตชุดประจำวัน"}
                    </span>
                    <span className="text-[10px] text-white/70">
                      เซ็ต {look.items?.length || 2} ชิ้น
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm sm:text-base font-black text-amber-200">
                      ฿{(look.setPrice || 1290).toLocaleString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* ========================================================================= */}
      {/* SIZE GUIDE MODAL */}
      {/* ========================================================================= */}
      {isSizeGuideOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <Ruler size={18} />
                <span>ตารางขนาดสินค้า (Size Guide)</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs text-left text-gray-700">
                <thead className="bg-slate-100 text-primary uppercase font-bold">
                  <tr>
                    <th className="px-3 py-2">ไซส์ (Size)</th>
                    <th className="px-3 py-2">รอบอก (Chest)</th>
                    <th className="px-3 py-2">ความยาว (Length)</th>
                    <th className="px-3 py-2">ไหล่กว้าง (Shoulder)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-3 py-2 font-bold text-primary">XS</td>
                    <td className="px-3 py-2">96 ซม.</td>
                    <td className="px-3 py-2">66 ซม.</td>
                    <td className="px-3 py-2">46 ซม.</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-bold text-primary">S</td>
                    <td className="px-3 py-2">102 ซม.</td>
                    <td className="px-3 py-2">69 ซม.</td>
                    <td className="px-3 py-2">49 ซม.</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-bold text-primary">M</td>
                    <td className="px-3 py-2">108 ซม.</td>
                    <td className="px-3 py-2">72 ซม.</td>
                    <td className="px-3 py-2">51 ซม.</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-bold text-primary">L</td>
                    <td className="px-3 py-2">114 ซม.</td>
                    <td className="px-3 py-2">74 ซม.</td>
                    <td className="px-3 py-2">53 ซม.</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-bold text-primary">XL</td>
                    <td className="px-3 py-2">122 ซม.</td>
                    <td className="px-3 py-2">76 ซม.</td>
                    <td className="px-3 py-2">56 ซม.</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-bold text-primary">XXL</td>
                    <td className="px-3 py-2">130 ซม.</td>
                    <td className="px-3 py-2">78 ซม.</td>
                    <td className="px-3 py-2">59 ซม.</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-bold text-primary">3XL</td>
                    <td className="px-3 py-2">138 ซม.</td>
                    <td className="px-3 py-2">80 ซม.</td>
                    <td className="px-3 py-2">62 ซม.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-5 text-right">
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow hover:bg-primary-hover cursor-pointer"
              >
                เข้าใจแล้ว
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD TO CART SUCCESS MODAL */}
      {/* ========================================================================= */}
      {addedSuccessModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-md rounded-3xl border border-occasion-border/40 bg-surface p-6 shadow-2xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Check size={28} />
            </div>

            <h3 className="text-xl font-extrabold text-primary">
              เพิ่มลงในตะกร้าเรียบร้อยแล้ว!
            </h3>
            <p className="mt-1 text-xs text-secondary">
              สินค้าของคุณถูกบันทึกไว้ในตะกร้าสินค้าแล้ว
            </p>

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

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                to="/cart"
                onClick={() => setAddedSuccessModal(null)}
                className="flex-1 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-accent-hover transition text-center cursor-pointer"
              >
                ไปที่ตะกร้าสินค้า →
              </Link>
              <Link
                to="/products"
                onClick={() => setAddedSuccessModal(null)}
                className="flex-1 rounded-xl border border-occasion-border/50 bg-surface px-4 py-2.5 text-sm font-semibold text-secondary hover:border-primary hover:text-primary transition text-center"
              >
                ← ดูสินค้าอื่นเพิ่มเติม
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setAddedSuccessModal(null)}
              className="mt-3 w-full text-center text-xs font-semibold text-secondary hover:text-primary transition cursor-pointer"
            >
              เลือกซื้อต่อในหน้านี้
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export { ProductDetailPage };