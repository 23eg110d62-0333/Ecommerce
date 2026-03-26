'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Wishlist Item Interface
 */
export interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  selectedColor?: string;
  selectedSize?: string;
  addedAt: Date;
}

/**
 * Wishlist Store Interface
 */
interface WishlistStore {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string, color?: string, size?: string) => void;
  isInWishlist: (productId: string, color?: string, size?: string) => boolean;
  clearWishlist: () => void;
  syncWishlist: (items: WishlistItem[]) => void;
  getItemCount: () => number;
}

/**
 * Zustand Wishlist Store
 * Persists wishlist data to localStorage
 */
export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      // Add item to wishlist
      addItem: (newItem: WishlistItem) =>
        set((state) => {
          const exists = state.items.some(
            (item) =>
              item.productId === newItem.productId &&
              item.selectedColor === newItem.selectedColor &&
              item.selectedSize === newItem.selectedSize
          );

          if (exists) {
            return state; // Don't add duplicates
          }

          return {
            items: [...state.items, { ...newItem, addedAt: new Date() }],
          };
        }),

      // Remove item from wishlist
      removeItem: (productId: string, color?: string, size?: string) =>
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(
                item.productId === productId &&
                item.selectedColor === color &&
                item.selectedSize === size
              )
          ),
        })),

      // Check if item is in wishlist
      isInWishlist: (productId: string, color?: string, size?: string) => {
        const state = get();
        return state.items.some(
          (item) =>
            item.productId === productId &&
            item.selectedColor === color &&
            item.selectedSize === size
        );
      },

      // Clear entire wishlist
      clearWishlist: () =>
        set(() => ({
          items: [],
        })),

      // Sync wishlist with server data
      syncWishlist: (items: WishlistItem[]) =>
        set(() => ({
          items: items.map((item) => ({
            ...item,
            addedAt: new Date(item.addedAt),
          })),
        })),

      // Get total count of wishlist items
      getItemCount: () => get().items.length,
    }),
    {
      name: 'wishlist-store',
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
);
