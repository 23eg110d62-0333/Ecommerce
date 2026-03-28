/**
 * API Utilities for Frontend
 * Provides typed fetchers and API helper functions
 * Centralized configuration for API calls
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export type ApiPayload = Record<string, unknown>;

/**
 * Generic API fetcher with error handling
 */
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data: data.data || data };
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get product details
 */
export async function getProduct(productId: string) {
  return apiFetch(`/api/product/${productId}`);
}

/**
 * Get related products
 */
export async function getRelatedProducts(productId: string, category?: string) {
  const params = new URLSearchParams();
  if (category) params.append('category', category);

  return apiFetch(`/api/products/related?id=${productId}&${params}`);
}

/**
 * Get reviews with filters
 */
export async function getReviews(productId: string, filters?: Record<string, string | number | boolean | null | undefined>) {
  const params = new URLSearchParams({ productId, limit: '6' });

  if (filters?.rating) params.append('rating', String(filters.rating));
  if (filters?.bodyType) params.append('bodyType', String(filters.bodyType));
  if (filters?.verified) params.append('verified', 'true');
  if (filters?.page) params.append('page', String(filters.page));

  return apiFetch(`/api/reviews/${productId}?${params}`);
}

/**
 * Submit a product review
 */
export async function submitReview(token: string, reviewData: ApiPayload) {
  return apiFetch('/api/reviews', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(reviewData),
  });
}

/**
 * Get size recommendation
 */
export async function getSizeRecommendation(input: { height: number; weight: number; unit: 'metric' | 'imperial'; bodyType: string; fitPreference: string; }) {
  return apiFetch('/api/size-recommendation', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

/**
 * Authentication functions
 */
export async function register(data: { name: string; email: string; password: string; confirmPassword: string }) {
  return apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function login(email: string, password: string) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Cart operations
 */
export async function addToCart(token: string, cartItem: ApiPayload) {
  return apiFetch('/api/cart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(cartItem),
  });
}

export async function getCart(token: string) {
  return apiFetch('/api/cart', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function updateCartItem(token: string, itemIndex: number, quantity: number) {
  return apiFetch('/api/cart/item', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ itemIndex, quantity }),
  });
}

export async function clearCart(token: string) {
  return apiFetch('/api/cart', {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Wishlist operations
 */
export async function toggleWishlistItem(token: string, item: ApiPayload) {
  return apiFetch('/api/wishlist', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(item),
  });
}

export async function getWishlist(token: string) {
  return apiFetch('/api/wishlist', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * User profile operations
 */
export async function getUserProfile(token: string) {
  return apiFetch('/api/user/profile', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function updateUserProfile(token: string, profileData: ApiPayload) {
  return apiFetch('/api/user/profile', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });
}

/**
 * Health check
 */
export async function healthCheck() {
  return apiFetch('/api/health');
}
