import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { Product } from "../models/Product.model";
import { Review } from "../models/Review.model";
import { User } from "../models/User.model";
import { generateToken } from "../middleware/auth.middleware";
import { Types } from "mongoose";

/**
 * Product Controller
 * Handles all product-related API requests
 */

// Get single product by ID with full details
export async function getProduct(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    // Increment viewer count
    await Product.findByIdAndUpdate(id, { $inc: { viewerCount: 1 } });

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// Get related products by category
export async function getRelatedProducts(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id, category, limit = 8 } = req.query;

    // Validate and sanitize limit
    let limitNum = parseInt(limit as string) || 8;
    if (limitNum < 1 || limitNum > 100) {
      limitNum = 8; // Default safe limit
    }

    // Validate id format if provided
    if (id && !req.app.locals.isValidObjectId?.(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
      return;
    }

    // Find the product to get its category if not provided
    let targetCategory = category;
    if (id && !category) {
      const product = await Product.findById(id);
      if (!product) {
        res.status(404).json({
          success: false,
          message: "Product not found",
        });
        return;
      }
      targetCategory = product.category;
    }

    // Validate category exists
    if (!targetCategory) {
      res.status(400).json({
        success: false,
        message: "Category is required",
      });
      return;
    }

    const validCategories = ["blazers", "trousers", "dresses", "shirts", "accessories", "outerwear"];
    if (!validCategories.includes(targetCategory as string)) {
      res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(", ")}`,
      });
      return;
    }

    const relatedProducts = await Product.find({
      category: targetCategory,
      _id: { $ne: id },
    })
      .limit(limitNum)
      .select("name brand slug basePrice discountPrice images category averageRating")
      .lean();

    res.json({
      success: true,
      data: relatedProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch related products",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// Get reviews with pagination and filters
export async function getReviews(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { productId, rating, bodyType, page = 1, limit = 6, verified } = req.query;

    // Build filter object
    const filter: Record<string, unknown> = { productId };

    if (rating) {
      filter.rating = parseInt(rating as string);
    }

    if (bodyType) {
      filter.bodyType = bodyType;
    }

    if (verified === "true") {
      filter.verified = true;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Get reviews and total count
    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("userId", "name avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Review.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// Create a new review
export async function createReview(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    const { productId, rating, title, body, images, bodyType, height, size, fit } = req.body;

    // Validate required fields
    if (!productId || !rating || !title || !body || !size || !fit) {
      res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
      return;
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
      return;
    }

    // Create review
    const review = new Review({
      productId,
      userId: req.userId,
      rating,
      title,
      body,
      images: images || [],
      bodyType,
      height,
      size,
      fit,
      verified: true, // Can be set based on purchase verification
    });

    await review.save();

    // Use aggregation pipeline for atomic calculation - prevents race conditions
    const ratings = await Review.aggregate([
      { $match: { productId: new Types.ObjectId(productId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    const { averageRating, reviewCount } = ratings[0] || {
      averageRating: 0,
      reviewCount: 0,
    };

    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount,
    });

    res.status(201).json({
      success: true,
      data: review,
      message: "Review created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create review",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Auth Controller
 */

// Register new user
export async function register(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validate required fields
    if (!name || !email || !password || !confirmPassword) {
      res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
      return;
    }

    // Check password has mix of uppercase, lowercase, and numbers
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      res.status(400).json({
        success: false,
        message: "Password must include uppercase letters, lowercase letters, and numbers",
      });
      return;
    }

    // Check password match
    if (password !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "Email already registered",
      });
      return;
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id.toString(), user.email);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        userId: user._id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// Login user
export async function login(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
      return;
    }

    // Find user and select password field
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    // Generate token
    const token = generateToken(user._id.toString(), user.email);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        userId: user._id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// Get user profile
export async function getUserProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// Update user profile
export async function updateUserProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    const { name, phone, preferences } = req.body;

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (preferences) updateData.preferences = preferences;

    const user = await User.findByIdAndUpdate(req.userId, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: user,
      message: "Profile updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
