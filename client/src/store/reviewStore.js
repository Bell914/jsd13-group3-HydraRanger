import { create } from "zustand";
import { createReview, getMyReviews } from "../services/reviewService.js";

const reviewKey = (orderId, productId) => `${String(orderId)}:${String(productId)}`;

export const useReviewStore = create((set, get) => ({
  reviewTarget: null,
  rating: 0,
  comment: "",
  submitting: false,
  message: "",
  error: "",
  reviewedKeys: [],

  loadMyReviews: async () => {
    try {
      const reviews = await getMyReviews();
      const reviewedKeys = (Array.isArray(reviews) ? reviews : []).map((review) => (
        reviewKey(review.order?._id || review.order, review.product?._id || review.product)
      ));
      set({ reviewedKeys });
    } catch (err) {
      set({ error: err.message || 'ไม่สามารถโหลดข้อมูลรีวิวได้' });
    }
  },

  openReview: (orderId, productId, title) =>
    set({
      reviewTarget: { orderId, productId, title },
      rating: 0,
      comment: "",
      message: "",
      error: "",
    }),

  closeReview: () =>
    set({
      reviewTarget: null,
      rating: 0,
      comment: "",
      message: "",
      error: "",
    }),

  setRating: (rating) => set({ rating, error: "" }),

  setComment: (comment) => set({ comment, error: "" }),

  submitReview: async () => {
    const { reviewTarget, rating, comment } = get();

    if (!reviewTarget) {
      set({ error: "กรุณาเลือกสินค้าที่ต้องการรีวิวก่อน" });
      return false;
    }
    if (!rating) {
      set({ error: "กรุณาเลือก 1-5 ดาว" });
      return false;
    }
    if (!comment.trim() || comment.trim().length < 3) {
      set({ error: "กรุณาเขียนรีวิวอย่างน้อย 3 ตัวอักษร" });
      return false;
    }

    set({ submitting: true, message: "", error: "" });

    try {
      await createReview({
        orderId: reviewTarget.orderId,
        productId: reviewTarget.productId,
        rating,
        comment: comment.trim(),
      });
      set({
        message: "ส่งรีวิวเรียบร้อยแล้ว ขอบคุณสำหรับรีวิว!",
        reviewTarget: null,
        rating: 0,
        comment: "",
        submitting: false,
        reviewedKeys: [
          ...get().reviewedKeys,
          reviewKey(reviewTarget.orderId, reviewTarget.productId),
        ],
      });
      return true;
    } catch (err) {
      set({
        error: err.message || "ส่งรีวิวไม่สำเร็จ กรุณาลองใหม่",
        submitting: false,
      });
      return false;
    }
  },
}));

export default useReviewStore;
