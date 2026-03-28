/**
 * Shared TypeScript Interfaces
 * Used across frontend and backend
 */

// Product-related types
export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface ProductVariant {
  color: {
    name: string;
    hex: string;
  };
  size: string;
  stock: number;
  sku: string;
}

export interface ProductMeasurements {
  chest?: number;
  waist?: number;
  hip?: number;
}

export interface Product {
  _id: string;
  name: string;
  brand: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string;
  tags: string[];
  basePrice: number;
  discountPrice: number;
  images: ProductImage[];
  variants: ProductVariant[];
  materials: Array<{ name: string; percentage: number }>;
  careInstructions: string[];
  measurements: Record<string, ProductMeasurements>;
  modelInfo: {
    height: number;
    size: string;
  };
  sustainability: string[];
  averageRating: number;
  reviewCount: number;
  viewerCount: number;
  createdAt: string;
  updatedAt: string;
}

// Review-related types
export interface Review {
  _id: string;
  productId: string;
  userId: string | {
    name: string;
    avatar?: string;
  };
  rating: number;
  title: string;
  body: string;
  images: string[];
  bodyType?: 'slim' | 'regular' | 'athletic' | 'curvy';
  height?: number;
  size: string;
  fit: 'true to size' | 'runs small' | 'runs large';
  verified: boolean;
  helpful: number;
  unhelpful: number;
  createdAt: string;
  updatedAt: string;
}

// Size recommendation types
export interface SizeRecommendationInput {
  height: number;
  weight: number;
  unit: 'metric' | 'imperial';
  bodyType: 'slim' | 'regular' | 'athletic' | 'curvy';
  fitPreference: 'slim' | 'regular' | 'loose';
}

export interface SizeRecommendationOutput {
  recommendedSize: string;
  confidence: number;
  reasoning: string;
  alternativeSize?: string;
}

// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  addresses: Array<{
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault?: boolean;
  }>;
  preferences: {
    height?: number;
    weight?: number;
    bodyType?: 'slim' | 'regular' | 'athletic' | 'curvy';
    preferredSizes?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

// Auth response types
export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  data?: User;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Toast notification types
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}
