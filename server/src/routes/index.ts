import express, { Router } from "express";
import {
  getProduct,
  getRelatedProducts,
  getReviews,
  createReview,
  register,
  login,
  getUserProfile,
  updateUserProfile,
} from "../controllers/index";
import {
  addToCart,
  getCart,
  updateCartItem,
  clearCart,
  toggleWishlistItem,
  getWishlist,
  clearWishlist,
} from "../controllers/cart.controller";
import { getSizeRecommendationHandler } from "../controllers/sizeRecommendation.controller";
import { authenticateToken, validateRequest } from "../middleware/auth.middleware";

const router: Router = express.Router();

/**
 * Product Routes
 */
router.get("/api/product/:id", getProduct);
router.get("/api/products/related", getRelatedProducts);

/**
 * Review Routes
 */
router.get("/api/reviews/:productId", getReviews);
router.post("/api/reviews", authenticateToken, createReview);

/**
 * Size Recommendation Route
 */
router.post("/api/size-recommendation", getSizeRecommendationHandler);

/**
 * Authentication Routes
 */
router.post(
  "/api/auth/register",
  validateRequest(["name", "email", "password", "confirmPassword"]),
  register
);
router.post("/api/auth/login", validateRequest(["email", "password"]), login);

/**
 * User Profile Routes
 */
router.get("/api/user/profile", authenticateToken, getUserProfile);
router.put("/api/user/profile", authenticateToken, updateUserProfile);

/**
 * Cart Routes
 */
router.post("/api/cart", authenticateToken, addToCart);
router.get("/api/cart", authenticateToken, getCart);
router.put("/api/cart/item", authenticateToken, updateCartItem);
router.delete("/api/cart", authenticateToken, clearCart);

/**
 * Wishlist Routes
 */
router.post("/api/wishlist", authenticateToken, toggleWishlistItem);
router.get("/api/wishlist", authenticateToken, getWishlist);
router.delete("/api/wishlist", authenticateToken, clearWishlist);

/**
 * Health check route
 */
router.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;
