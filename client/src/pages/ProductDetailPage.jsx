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
    const list = [baseImg];
    if (product.variants) {
      product.variants.forEach((v) => {
        if (v.imageUrl && !list.includes(v.imageUrl)) {
          list.push(v.imageUrl);
        }
      });
    }
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

export { ProductDetailPage };