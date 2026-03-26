import mongoose, { Document, Schema } from "mongoose";

/**
 * Wishlist interface for user's saved items
 * Allows users to save products for later purchase
 */
export interface IWishlistItem {
  productId: mongoose.Types.ObjectId;
  addedAt: Date;
  selectedColor?: string;
  selectedSize?: string;
}

export interface IWishlist extends Document {
  userId: mongoose.Types.ObjectId;
  items: IWishlistItem[];
  createdAt: Date;
  updatedAt: Date;
}

const wishlistSchema = new Schema<IWishlist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user ID"],
      unique: true,
    },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
        selectedColor: String,
        selectedSize: String,
      },
    ],
  },
  { timestamps: true }
);

// Prevent duplicate items in wishlist
wishlistSchema.pre("save", async function (next) {
  try {
    const uniqueItems = Array.from(
      new Map(
        this.items.map((item) => [
          `${item.productId}-${item.selectedColor || ""}-${item.selectedSize || ""}`,
          item,
        ])
      ).values()
    );
    this.items = uniqueItems;
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Index for faster queries
wishlistSchema.index({ userId: 1 });
wishlistSchema.index({ "items.productId": 1 });

export const Wishlist = mongoose.model<IWishlist>("Wishlist", wishlistSchema);
