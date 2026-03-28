'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Loader } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';

/**
 * CompleteTheLook Component
 * Features:
 * - AI-suggested complementary products (3-4 items)
 * - Rule-based matching by category
 * - Quick add buttons for each product
 * - "Shop the Full Look" CTA
 * - Toast notifications
 */

interface CompleteTheLookProps {
  currentProduct: Product;
  currentProductId: string;
}

export default function CompleteTheLook({
  currentProduct,
  currentProductId,
}: CompleteTheLookProps) {
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchComplementaryProducts = async () => {
      setLoading(true);

      try {
        // Rule-based matching system:
        // Blazer → Trousers, Dress Shoes, Belt, Bag
        // Trousers → Blazer, Shirt, Shoes
        // Dress → Heels, Clutch, Accessories
        // Shirt → Trousers, Jacket, Loafers

        const categoryMatches: Record<string, string[]> = {
          blazers: ['trousers', 'accessories', 'shoes'],
          trousers: ['shirts', 'blazers', 'accessories'],
          dresses: ['accessories', 'outerwear'],
          shirts: ['trousers', 'accessories', 'blazers'],
          shoes: ['trousers', 'accessories'],
          outerwear: ['trousers', 'accessories', 'blazers'],
        };

        const categoriesToSearch = categoryMatches[currentProduct.category] || [];
        const allSuggestions: Product[] = [];

        for (const category of categoriesToSearch.slice(0, 3)) {
          try {
            const response = await fetch(
              `/api/products/related?id=${currentProductId}&category=${category}&limit=2`
            );
            const data = await response.json();

            if (data.success && data.data) {
              allSuggestions.push(...data.data.slice(0, 1));
            }
          } catch (error) {
            console.error(`Error fetching ${category} products:`, error);
          }
        }

        setSuggestedProducts(allSuggestions.slice(0, 4));
      } catch (error) {
        console.error('Error loading complementary products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplementaryProducts();
  }, [currentProductId, currentProduct.category]);

  // Handle quick add to cart
  const handleQuickAdd = async (product: Product) => {
    setAddingToCart(product._id);

    try {
      // Select first available variant
      const firstVariant = product.variants[0];
      if (!firstVariant) {
        alert('Product variant not available');
        return;
      }

      addItem({
        productId: product._id,
        name: product.name,
        price: product.discountPrice || product.basePrice,
        quantity: 1,
        selectedColor: firstVariant.color.name,
        selectedSize: firstVariant.size,
        image: product.images[0]?.url || '/placeholder.jpg',
      });

      // Show success toast (you can use a toast library)
      setTimeout(() => {
        alert(`${product.name} added to cart!`);
      }, 500);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  if (loading) {
    return (
      <div className="w-full py-12 text-center">
        <Loader className="w-8 h-8 animate-spin mx-auto text-gray-400" />
        <p className="text-gray-500 mt-2">Loading outfit suggestions...</p>
      </div>
    );
  }

  if (suggestedProducts.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete the Look</h2>
        <p className="text-gray-600">
          Style suggestions to pair with this {currentProduct.category.slice(0, -1)}
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {suggestedProducts.map((product) => (
          <div
            key={product._id}
            className="group bg-white rounded-lg border border-gray-200 overflow-hidden
                     hover:shadow-lg transition-all duration-300"
          >
            {/* Product Image */}
            <div className="relative aspect-square bg-gray-100 overflow-hidden">
              <Image
                src={product.images[0]?.url || '/placeholder.jpg'}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />

              {/* Quick Add Badge */}
              <button
                onClick={() => handleQuickAdd(product)}
                disabled={addingToCart === product._id}
                className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40
                         transition-colors duration-300 opacity-0 group-hover:opacity-100"
              >
                <div className="bg-white rounded-full p-3 shadow-lg hover:scale-110 transition-transform">
                  {addingToCart === product._id ? (
                    <Loader className="w-6 h-6 animate-spin text-gray-900" />
                  ) : (
                    <Plus className="w-6 h-6 text-gray-900" />
                  )}
                </div>
              </button>

              {/* Category Badge */}
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-xs font-medium
                          px-2.5 py-1 rounded-full text-gray-700">
                {product.category.slice(0, -1)}
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                {product.brand}
              </p>
              <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                {product.name}
              </h3>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-lg font-bold text-gray-900">
                  £{(product.discountPrice || product.basePrice).toFixed(2)}
                </span>
                {product.discountPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    £{product.basePrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Rating */}
              {product.averageRating > 0 && (
                <div className="flex items-center gap-1">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-xs ${
                          i < Math.floor(product.averageRating)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">
                    ({product.reviewCount})
                  </span>
                </div>
              )}
            </div>

            {/* Color Swatches */}
            {product.variants.length > 0 && (
              <div className="px-4 pb-4">
                <div className="flex gap-2 flex-wrap">
                  {product.variants
                    .slice(0, 4)
                    .map((variant, idx) => (
                      <div
                        key={idx}
                        className="w-5 h-5 rounded-full border-2 border-gray-200 hover:border-gray-400
                                 transition-colors cursor-pointer"
                        style={{ backgroundColor: variant.color.hex }}
                        title={variant.color.name}
                      />
                    ))}
                  {product.variants.length > 4 && (
                    <span className="text-xs text-gray-500 flex items-center">
                      +{product.variants.length - 4}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          className="flex-1 px-6 py-3 bg-gray-900 text-white font-medium rounded-lg
                   hover:bg-gray-800 transition-colors"
        >
          Add All to Cart ({suggestedProducts.length} items)
        </button>
        <button
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-900 font-medium
                   rounded-lg hover:bg-gray-50 transition-colors"
        >
          Shop the Full Look
        </button>
      </div>
    </div>
  );
}
