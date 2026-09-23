import { api } from "./api";

export const createReview = async ({ orderId, productId, rating, comment }) => {
  const response = await api.post("/reviews", {
    orderId,
    productId,
    rating,
    comment,
  });
  return response.data;
};

export const getProductReviews = async (productId) => {
  const response = await api.get(`/reviews/product/${productId}`);
  return response.data;
};