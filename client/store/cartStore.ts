'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Cart Item Interface
 */
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
  image: string;
}

/**
 * Cart Store Interface
 */
interface CartStore {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, color: string, size: string) => void;
  updateQuantity: (productId: string, color: string, size: string, quantity: number) => void;
  clearCart: () => void;
  syncCart: (items: CartItem[]) => void;
}

/**
 * Zustand Cart Store
 * Persists cart data to localStorage
 */
export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,

      // Add item to cart or increase quantity if exists
      addItem: (newItem: CartItem) =>
        set((state) => {
          const existingItem = state.items.find(
            (item) =>
              item.productId === newItem.productId &&
              item.selectedColor === newItem.selectedColor &&
              item.selectedSize === newItem.selectedSize
          );

          let updatedItems: CartItem[];
          if (existingItem) {
            updatedItems = state.items.map((item) =>
              item === existingItem ? { ...item, quantity: item.quantity + newItem.quantity } : item
            );
          } else {
            updatedItems = [...state.items, newItem];
          }

          return {
            items: updatedItems,
            totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
            totalPrice: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
          };
        }),

      // Remove item from cart
      removeItem: (productId: string, color: string, size: string) =>
        set((state) => {
          const updatedItems = state.items.filter(
            (item) =>
              !(
                item.productId === productId &&
                item.selectedColor === color &&
                item.selectedSize === size
              )
          );

          return {
            items: updatedItems,
            totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
            totalPrice: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
          };
        }),

      // Update item quantity
      updateQuantity: (productId: string, color: string, size: string, quantity: number) =>
        set((state) => {
          const updatedItems = state.items
            .map((item) =>
              item.productId === productId &&
              item.selectedColor === color &&
              item.selectedSize === size
                ? { ...item, quantity }
                : item
            )
            .filter((item) => item.quantity > 0);

          return {
            items: updatedItems,
            totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
            totalPrice: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
          };
        }),

      // Clear entire cart
      clearCart: () =>
        set(() => ({
          items: [],
          totalItems: 0,
          totalPrice: 0,
        })),

      // Sync cart with server data
      syncCart: (items: CartItem[]) =>
        set(() => ({
          items,
          totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
          totalPrice: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        })),
    }),
    {
      name: 'cart-store',
      // Only persist specific fields
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice,
      }),
    }
  )
);
