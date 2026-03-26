import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { Cart } from "../models/Cart.model";
import { Wishlist } from "../models/Wishlist.model";
import { Product } from "../models/Product.model";

/**
 * Cart Controller
 * Manages user shopping cart operations
 */

export async function addToCart(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    const { productId, quantity, selectedColor, selectedSize } = req.body;

    // Validate required fields
    if (!productId || !quantity || !selectedColor || !selectedSize) {
      res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
      return;
    }

    // Validate quantity
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
      res.status(400).json({
        success: false,
        message: "Quantity must be an integer between 1 and 999",
      });
      return;
    }

    // Get product to verify and get price
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    // Verify stock availability for the selected variant
    const variant = product.variants.find(
      (v) => v.color.name === selectedColor && v.size === selectedSize
    );
    if (!variant || variant.stock < quantity) {
      res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${variant?.stock || 0} items available for the selected color and size.`,
      });
      return;
    }

    // Get or create cart
    let cart = await Cart.findOne({ userId: req.userId });
    if (!cart) {
      cart = new Cart({
        userId: req.userId,
        items: [],
      });
    }

    // Check if item already exists in cart
    const existingItem = cart.items.find(
      (item) =>
        item.productId.toString() === productId &&
        item.selectedColor === selectedColor &&
        item.selectedSize === selectedSize
    );

    if (existingItem) {
      // Update quantity
      existingItem.quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        productId,
        quantity,
        selectedColor,
        selectedSize,
        price: product.discountPrice || product.basePrice,
      });
    }

    await cart.save();

    res.status(200).json({
      success: true,
      data: cart,
      message: "Item added to cart",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add item to cart",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function getCart(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    let cart = await Cart.findOne({ userId: req.userId }).populate("items.productId");

    if (!cart) {
      cart = new Cart({
        userId: req.userId,
        items: [],
      });
      // Save empty cart to database on first access
      await cart.save();
    }

    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function updateCartItem(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    const { itemIndex, quantity } = req.body;

    // Validate itemIndex is a valid non-negative integer
    if (!Number.isInteger(itemIndex) || itemIndex < 0) {
      res.status(400).json({
        success: false,
        message: "Invalid item index. Must be a non-negative integer.",
      });
      return;
    }

    if (quantity < 0) {
      res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0",
      });
      return;
    }

    let cart = await Cart.findOne({ userId: req.userId });

    if (!cart) {
      res.status(404).json({
        success: false,
        message: "Cart not found",
      });
      return;
    }

    // Validate itemIndex is within cart bounds
    if (itemIndex >= cart.items.length) {
      res.status(400).json({
        success: false,
        message: "Invalid item index. Item not found in cart.",
      });
      return;
    }

    if (quantity === 0) {
      // Remove item
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();

    res.json({
      success: true,
      data: cart,
      message: "Cart updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update cart",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function clearCart(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    const cart = await Cart.findOne({ userId: req.userId });

    if (!cart) {
      res.status(404).json({
        success: false,
        message: "Cart not found",
      });
      return;
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      data: cart,
      message: "Cart cleared",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to clear cart",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Wishlist Controller
 * Manages user wishlist operations
 */

export async function toggleWishlistItem(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    const { productId, selectedColor, selectedSize } = req.body;

    if (!productId) {
      res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
      return;
    }

    let wishlist = await Wishlist.findOne({ userId: req.userId });

    if (!wishlist) {
      wishlist = new Wishlist({
        userId: req.userId,
        items: [],
      });
    }

    // Check if item exists - use safer comparison
    const itemIndex = wishlist.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        (item.selectedColor || "") === (selectedColor || "") &&
        (item.selectedSize || "") === (selectedSize || "")
    );

    if (itemIndex > -1) {
      // Remove item
      wishlist.items.splice(itemIndex, 1);
    } else {
      // Add item
      wishlist.items.push({
        productId,
        addedAt: new Date(),
        selectedColor,
        selectedSize,
      });
    }

    await wishlist.save();

    res.json({
      success: true,
      data: wishlist,
      isInWishlist: itemIndex === -1, // True if just added
      message: itemIndex > -1 ? "Item removed from wishlist" : "Item added to wishlist",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update wishlist",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function getWishlist(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    let wishlist = await Wishlist.findOne({ userId: req.userId }).populate("items.productId");

    if (!wishlist) {
      wishlist = new Wishlist({
        userId: req.userId,
        items: [],
      });
    }

    res.json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function clearWishlist(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    const wishlist = await Wishlist.findOne({ userId: req.userId });

    if (!wishlist) {
      res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
      return;
    }

    wishlist.items = [];
    await wishlist.save();

    res.json({
      success: true,
      data: wishlist,
      message: "Wishlist cleared",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to clear wishlist",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
