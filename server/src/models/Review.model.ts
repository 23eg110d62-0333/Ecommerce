import mongoose, { Document, Schema } from "mongoose";

/**
 * Review interface for customer product reviews
 * Tracks detailed feedback including body measurements and fit info
 */
export interface IReview extends Document {
  productId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  rating: number;
  title: string;
  body: string;
  images: string[];
  bodyType?: "slim" | "regular" | "athletic" | "curvy";
  height?: number; // in cm
  size: string; // size purchased
  fit: "true to size" | "runs small" | "runs large";
  verified: boolean;
  helpful: number;
  unhelpful: number;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Please provide product ID"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user ID"],
    },
    rating: {
      type: Number,
      required: [true, "Please provide rating"],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: [true, "Please provide review title"],
      maxlength: 100,
    },
    body: {
      type: String,
      required: [true, "Please provide review body"],
      maxlength: 2000,
    },
    images: [String],
    bodyType: {
      type: String,
      enum: ["slim", "regular", "athletic", "curvy"],
    },
    height: Number, // cm
    size: {
      type: String,
      required: [true, "Please provide purchased size"],
    },
    fit: {
      type: String,
      required: [true, "Please specify fit"],
      enum: ["true to size", "runs small", "runs large"],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    helpful: {
      type: Number,
      default: 0,
      min: 0,
    },
    unhelpful: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// Index for faster queries
reviewSchema.index({ productId: 1, rating: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ createdAt: -1 });

export const Review = mongoose.model<IReview>("Review", reviewSchema);
