import mongoose, { Document, Schema } from "mongoose";

/**
 * Product interface for the e-commerce catalog
 * Includes variants, measurements, images, and product metadata
 */
export interface IMeasurements {
  chest?: number;
  waist?: number;
  hip?: number;
}

export interface IProductVariant {
  color: {
    name: string;
    hex: string;
  };
  size: string;
  stock: number;
  sku: string;
}

export interface IProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface IMaterial {
  name: string;
  percentage: number;
}

export interface IProduct extends Document {
  name: string;
  brand: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string;
  tags: string[];
  basePrice: number;
  discountPrice: number;
  images: IProductImage[];
  variants: IProductVariant[];
  materials: IMaterial[];
  careInstructions: string[];
  measurements: {
    XS?: IMeasurements;
    S?: IMeasurements;
    M?: IMeasurements;
    L?: IMeasurements;
    XL?: IMeasurements;
    XXL?: IMeasurements;
  };
  modelInfo: {
    height: number;
    size: string;
  };
  sustainability: string[];
  averageRating: number;
  reviewCount: number;
  viewerCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Please provide product name"],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, "Please provide brand name"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Please provide description"],
    },
    shortDescription: {
      type: String,
      maxlength: 200,
    },
    category: {
      type: String,
      required: [true, "Please provide category"],
      enum: ["blazers", "trousers", "dresses", "shirts", "accessories", "outerwear"],
    },
    tags: [String],
    basePrice: {
      type: Number,
      required: [true, "Please provide base price"],
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
      validate: {
        validator: function (value: number) {
          return value <= this.basePrice;
        },
        message: "Discount price must be less than or equal to base price",
      },
    },
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    variants: [
      {
        color: {
          name: String,
          hex: String,
        },
        size: String,
        stock: { type: Number, default: 0, min: 0 },
        sku: { type: String, unique: true },
      },
    ],
    materials: [
      {
        name: String,
        percentage: { type: Number, min: 0, max: 100 },
      },
    ],
    careInstructions: [String],
    measurements: {
      XS: { chest: Number, waist: Number, hip: Number },
      S: { chest: Number, waist: Number, hip: Number },
      M: { chest: Number, waist: Number, hip: Number },
      L: { chest: Number, waist: Number, hip: Number },
      XL: { chest: Number, waist: Number, hip: Number },
      XXL: { chest: Number, waist: Number, hip: Number },
    },
    modelInfo: {
      height: Number,
      size: String,
    },
    sustainability: [String],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    viewerCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// Create slug from product name and brand before saving
productSchema.pre("save", function (next) {
  if (this.isModified("name") || this.isModified("brand")) {
    this.slug = `${this.brand}-${this.name}`.toLowerCase().replace(/\s+/g, "-");
  }
  next();
});

// Index for faster queries
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ brand: 1 });

export const Product = mongoose.model<IProduct>("Product", productSchema);
