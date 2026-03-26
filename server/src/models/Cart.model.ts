import mongoose, { Document, Schema } from "mongoose";

/**
 * Cart interface for user shopping cart
 * Stores items with variant selections (color, size)
 */
export interface ICartItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
  price: number; // price at time of adding to cart
}

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  totalItems: number;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

const cartSchema = new Schema<ICart>(
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
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        selectedColor: {
          type: String,
          required: true,
        },
        selectedSize: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    totalItems: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// Calculate totals before saving
cartSchema.pre("save", function (next) {
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.totalPrice = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  next();
});

// Index for faster queries
cartSchema.index({ userId: 1 });

export const Cart = mongoose.model<ICart>("Cart", cartSchema);
