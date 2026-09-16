import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductById, getProducts } from "../services/productService.js";
import { useCartStore } from "../store/cartStore.js";
import lookData from "../data/look-data.json";
import {
  ProductGallery,
  ProductBuySection,
  ProductAccordionDetails,
  ProductReviews,
  MatchingProducts,
  OccasionLookSection,
  ProductSizeGuideModal,
  ProductAddedModal,
} from "../components/product/index.js";
import { normalizeImageUrl, getDetailImageSet } from "../utils/imageUtils.js";

export default function ProductDetailPage() {
  const { productId } = useParams();
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

  // Standard sizes matching backend (S, M, L)
  const sizeOptions = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return ["S", "M", "L"];
    const variantSizes = [
      ...new Set(
        product.variants
          .map((v) => v.size || v.size_or_color)
          .filter(Boolean)
      ),
    ];
    const allowed = ["S", "M", "L"];
    const filtered = allowed.filter((s) => variantSizes.includes(s));
    return filtered.length > 0 ? filtered : allowed;
  }, [product]);

  // Ensure selectedSize is valid
  useEffect(() => {
    if (!sizeOptions.includes(selectedSize) && sizeOptions.length > 0) {
      setSelectedSize(sizeOptions[0]);
    }
  }, [sizeOptions, selectedSize]);

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
          const mainImg =
            prodData.images?.[0]?.image_url ||
            prodData.imageUrl ||
            prodData.image ||
            prodData.variants?.[0]?.imageUrl ||
            "";
          const normProd = {
            ...prodData,
            imageUrl: normalizeImageUrl(mainImg),
          };
          setProduct(normProd);
          setAllProducts(prodList || []);

          if (normProd.variants && normProd.variants.length > 0) {
            const firstVariant = normProd.variants[0];
            setSelectedColor(firstVariant.color || "");
            setSelectedSize(firstVariant.size || "S");
            const variantImg =
              firstVariant.imageUrl || firstVariant.image || normProd.imageUrl;
            const initialImg =
              normalizeImageUrl(variantImg) || normProd.imageUrl;
            setDisplayedImage(initialImg);
          } else {
            setDisplayedImage(normProd.imageUrl);
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

  // Unique list of colors with their colorCode from variants
  const colors = useMemo(() => {
    if (!product?.variants) return [];
    const colorMap = new Map();
    product.variants.forEach((v) => {
      if (!colorMap.has(v.color)) {
        colorMap.set(v.color, v.colorCode || "");
      }
    });
    return [...colorMap.entries()].map(([color, colorCode]) => ({
      color,
      colorCode,
    }));
  }, [product]);

  // Selected variant
  const selectedVariant = useMemo(() => {
    if (!product?.variants) return null;
    const match =
      product.variants.find((v) => v.color === selectedColor) ||
      product.variants[0] ||
      null;
    if (!match) return null;
    return {
      ...match,
      imageUrl: normalizeImageUrl(match.imageUrl),
      detailImages: (match.detailImages || []).map(normalizeImageUrl),
    };
  }, [product, selectedColor]);

  // Generate 7 thumbnails from collection-2026/all-images matching the wireframe
  const thumbnails = useMemo(() => {
    if (!product) return [];
    const list = [];
    const seen = new Set();

    const addUnique = (url) => {
      const normalized = normalizeImageUrl(url);
      if (normalized && !seen.has(normalized)) {
        seen.add(normalized);
        list.push(normalized);
      }
    };

    // 1) Selected variant detail set (front, back, detail)
    if (selectedVariant?.imageUrl) {
      getDetailImageSet(selectedVariant.imageUrl).forEach(addUnique);
    }
    if (selectedVariant?.detailImages) {
      selectedVariant.detailImages.forEach(addUnique);
    }

    // 2) Other variants detail set (front, back, detail)
    if (product.variants) {
      product.variants.forEach((v) => {
        if (v.color !== selectedColor && v.imageUrl) {
          getDetailImageSet(v.imageUrl).forEach(addUnique);
        }
        if (v.detailImages) {
          v.detailImages.forEach(addUnique);
        }
      });
    }

    // 3) Product main image and additional images
    if (product.imageUrl) {
      addUnique(product.imageUrl);
    }
    if (Array.isArray(product.images)) {
      product.images.forEach((img) => addUnique(img?.image_url || img));
    }

    // 4) Pad with existing images if less than 7 so all 7 slots are filled
    if (list.length > 0 && list.length < 7) {
      const originalCount = list.length;
      let i = 0;
      while (list.length < 7) {
        list.push(list[i % originalCount]);
        i++;
      }
    }

    return list.slice(0, 7);
  }, [product, selectedVariant, selectedColor]);

  // Handle color change
  const handleColorChange = (color) => {
    setSelectedColor(color);
    const variantWithImage = product?.variants?.find(
      (v) => v.color === color && v.imageUrl
    );
    if (variantWithImage?.imageUrl) {
      setDisplayedImage(normalizeImageUrl(variantWithImage.imageUrl));
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

    const currentPrice = selectedVariant?.price ?? 490;

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
    const oppCat = product?.category === "tops" ? "bottoms" : "tops";
    const filtered = allProducts.filter((p) => p.category === oppCat);
    const list =
      filtered.length >= 4
        ? filtered
        : allProducts.filter((p) => p._id !== product?._id);
    return list.slice(0, 4).map((p) => ({
      ...p,
      imageUrl: normalizeImageUrl(p.imageUrl),
    }));
  }, [allProducts, product]);

  // Occasion Looks
  const looksList = useMemo(() => {
    const rawLooks = lookData?.looks || [];
    return rawLooks.slice(0, 4).map((l) => ({
      ...l,
      image: normalizeImageUrl(l.image),
    }));
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

  const currentPrice = selectedVariant?.price ?? 490;

  return (
    <main className="flex-1 bg-background py-6 md:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* TOP SECTION: Gallery & Buy Options */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          <ProductGallery
            displayedImage={displayedImage}
            productName={product.name}
            thumbnails={thumbnails}
            activeThumbIndex={activeThumbIndex}
            onSelectThumbnail={(thumb, idx) => {
              setDisplayedImage(thumb);
              setActiveThumbIndex(idx);
            }}
          />

          <ProductBuySection
            product={product}
            colors={colors}
            selectedColor={selectedColor}
            onColorChange={handleColorChange}
            sizeOptions={sizeOptions}
            selectedSize={selectedSize}
            onSizeChange={setSelectedSize}
            onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
            currentPrice={currentPrice}
            quantity={quantity}
            onQuantityChange={setQuantity}
            validationError={validationError}
            onAddToCart={handleAddToCart}
            isWishlisted={isWishlisted}
            onToggleWishlist={() => setIsWishlisted(!isWishlisted)}
          />
        </div>

        {/* DETAILS ACCORDION: รายละเอียด & วัสดุ/การดูแล */}
        <ProductAccordionDetails
          isDetailsOpen={isDetailsOpen}
          setIsDetailsOpen={setIsDetailsOpen}
          isMaterialsOpen={isMaterialsOpen}
          setIsMaterialsOpen={setIsMaterialsOpen}
        />

        {/* REVIEWS SECTION */}
        <ProductReviews />

        {/* RELATED PRODUCTS: สินค้าที่เข้ากันได้ดี */}
        <MatchingProducts products={matchingProducts} />

        {/* OCCASION LOOKS */}
        <OccasionLookSection looks={looksList} />
      </div>

      {/* MODALS */}
      <ProductSizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />

      <ProductAddedModal
        addedItem={addedSuccessModal}
        onClose={() => setAddedSuccessModal(null)}
      />
    </main>
  );
}