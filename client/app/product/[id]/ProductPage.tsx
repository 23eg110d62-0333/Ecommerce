'use client';

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import { Heart, Share2, Truck, RotateCcw, Lock, Users } from 'lucide-react';
import ImageGallery from '@/components/product/ImageGallery';
import AISizeModal from '@/components/product/AISizeModal';
import ReviewsSection from '@/components/tabs/ReviewsSection';
import CompleteTheLook from '@/components/tabs/CompleteTheLook';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { Product } from '@/types';

/**
 * Product Page Component
 * Server-rendered main product detail page
 * Features:
 * - Image gallery with zoom/swipe
 * - Product info with pricing and stock
 * - Color and size selection
 * - AI size recommendation modal
 * - Tabbed content sections
 * - Add to cart/wishlist functionality
 */

interface ProductPageProps {
  product: Product;
}

type TabType = 'details' | 'sizing' | 'reviews' | 'look' | 'related';

export default function ProductPage({ product }: ProductPageProps) {
  const [selectedColor, setSelectedColor] = useState(product.variants[0]?.color.name || '');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [viewerCount, setViewerCount] = useState(product.viewerCount);

  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.addItem);
  const removeFromWishlist = useWishlistStore((state) => state.removeItem);

  // Simulate live viewer count
  React.useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount((prev) => prev + Math.floor(Math.random() * 3) - 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Get stock for selected variant
  const selectedVariant = product.variants.find(
    (v) => v.color.name === selectedColor && v.size === selectedSize
  );
  const availableStock = selectedVariant?.stock || 0;

  // Available sizes for selected color
  const availableSizes = product.variants
    .filter((v) => v.color.name === selectedColor)
    .map((v) => v.size);

  // Discount percentage
  const discountPercent =
    product.discountPrice && product.basePrice
      ? Math.round(((product.basePrice - product.discountPrice) / product.basePrice) * 100)
      : 0;

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }

    addItem({
      productId: product._id,
      name: product.name,
      price: product.discountPrice || product.basePrice,
      quantity,
      selectedColor,
      selectedSize,
      image: product.images[0]?.url || '/placeholder.jpg',
    });

    alert('Added to cart!');
  };

  const handleToggleWishlist = () => {
    if (isInWishlist) {
      removeFromWishlist(product._id, selectedColor, selectedSize);
      setIsInWishlist(false);
    } else {
      toggleWishlist({
        productId: product._id,
        name: product.name,
        price: product.discountPrice || product.basePrice,
        image: product.images[0]?.url || '/placeholder.jpg',
        selectedColor,
        selectedSize,
        addedAt: new Date(),
      });
      setIsInWishlist(true);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b bg-gray-50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 text-sm text-gray-600">
          <nav className="flex gap-2">
            <a href="/" className="hover:text-gray-900">
              Home
            </a>
            <span>/</span>
            <a href={`/category/${product.category}`} className="hover:text-gray-900">
              {product.category}
            </a>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left: Image Gallery */}
          <Suspense fallback={<div className="aspect-square bg-gray-200 rounded-lg animate-pulse" />}>
            <ImageGallery images={product.images} productName={product.name} />
          </Suspense>

          {/* Right: Product Info */}
          <div className="space-y-6">
            {/* Brand and Name */}
            <div>
              <p className="text-sm uppercase tracking-wider text-gray-600 mb-2">
                {product.brand}
              </p>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`text-xl ${
                        i < Math.floor(product.averageRating)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <button className="text-blue-600 hover:underline text-sm">
                  {product.reviewCount} reviews
                </button>
              </div>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">
                £{(product.discountPrice || product.basePrice).toFixed(2)}
              </span>
              {product.discountPrice && (
                <>
                  <span className="text-lg text-gray-500 line-through">
                    £{product.basePrice.toFixed(2)}
                  </span>
                  <span className="inline-block bg-red-100 text-red-700 text-sm font-bold px-2.5 py-1 rounded">
                    SAVE {discountPercent}%
                  </span>
                </>
              )}
            </div>

            {/* Stock Status */}
            {availableStock <= 5 && availableStock > 0 && (
              <div className="inline-block bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg">
                🔴 Only {availableStock} left in stock
              </div>
            )}

            {/* Viewer Count */}
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4" />
              {viewerCount} people viewing this now
            </div>

            {/* Description */}
            <p className="text-gray-700 leading-relaxed text-sm">{product.shortDescription}</p>

            {/* Color Selector */}
            <div>
              <p className="text-sm font-medium text-gray-900 mb-3">Color</p>
              <div className="flex flex-wrap gap-3">
                {Array.from(
                  new Set(product.variants.map((v) => v.color.name))
                ).map((colorName) => {
                  const colorHex = product.variants.find((v) => v.color.name === colorName)
                    ?.color.hex;
                  return (
                    <button
                      key={colorName}
                      onClick={() => {
                        setSelectedColor(colorName);
                        setSelectedSize('');
                      }}
                      className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110
                               ${selectedColor === colorName ? 'ring-2 ring-gray-400 border-gray-900' : 'border-gray-300'}`}
                      style={{ backgroundColor: colorHex }}
                      title={colorName}
                    />
                  );
                })}
              </div>
            </div>

            {/* Size Selector */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-medium text-gray-900">Size</p>
                <button
                  onClick={() => setShowSizeModal(true)}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  ✨ Get AI Size Recommendation
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    disabled={!availableSizes.includes(size)}
                    className={`py-2.5 px-3 border rounded-lg font-medium transition-all
                             ${
                               selectedSize === size
                                 ? 'border-gray-900 bg-gray-900 text-white'
                                 : 'border-gray-300 text-gray-700 hover:border-gray-400'
                             }
                             ${!availableSizes.includes(size) ? 'opacity-50 line-through cursor-not-allowed' : ''}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div>
              <p className="text-sm font-medium text-gray-900 mb-3">Quantity</p>
              <div className="flex items-center border border-gray-300 rounded-lg w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  −
                </button>
                <span className="px-6 py-2 border-l border-r border-gray-300">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t sticky bottom-0 bg-white z-20">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-gray-900 text-white font-medium py-3 rounded-lg
                         hover:bg-gray-800 transition-colors disabled:opacity-50"
                disabled={!selectedSize || availableStock === 0}
              >
                Add to Cart
              </button>
              <button
                onClick={() => {}}
                className="flex-1 border border-gray-300 text-gray-900 font-medium py-3 rounded-lg
                         hover:bg-gray-50 transition-colors"
              >
                Buy Now
              </button>
              <button
                onClick={handleToggleWishlist}
                className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Heart
                  className={`w-5 h-5 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="space-y-3 text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-gray-600" />
                Free shipping on orders over £100
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-gray-600" />
                Easy returns within 30 days
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-gray-600" />
                Secure checkout with SSL encryption
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="border-t pt-12">
          {/* Tab Navigation */}
          <div className="flex gap-8 border-b mb-8 overflow-x-auto">
            {[
              { id: 'details', label: 'Details' },
              { id: 'sizing', label: 'Size & Fit' },
              { id: 'reviews', label: 'Reviews' },
              { id: 'look', label: 'Complete the Look' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`pb-4 font-medium whitespace-nowrap transition-colors border-b-2
                           ${
                             activeTab === tab.id
                               ? 'border-gray-900 text-gray-900'
                               : 'border-transparent text-gray-600 hover:text-gray-900'
                           }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="max-w-4xl">
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-lg mb-3">Materials</h3>
                  <div className="space-y-2">
                    {product.materials.map((material, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="text-gray-700">{material.name}</span>
                        <span className="font-medium text-gray-900">{material.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-3">Care Instructions</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {product.careInstructions.map((instruction, idx) => (
                      <li key={idx}>{instruction}</li>
                    ))}
                  </ul>
                </div>

                {product.sustainability.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg mb-3">Sustainability</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.sustainability.map((badge, idx) => (
                        <span
                          key={idx}
                          className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full"
                        >
                          ♻️ {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'sizing' && (
              <div className="space-y-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 font-medium">Size</th>
                      <th className="text-left py-3 font-medium">Chest</th>
                      <th className="text-left py-3 font-medium">Waist</th>
                      <th className="text-left py-3 font-medium">Hip</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(product.measurements).map(([size, measurements]) => (
                      <tr key={size} className="border-b">
                        <td className="py-3 font-medium">{size}</td>
                        <td className="py-3">{measurements.chest}cm</td>
                        <td className="py-3">{measurements.waist}cm</td>
                        <td className="py-3">{measurements.hip}cm</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && (
              <Suspense fallback={<div>Loading reviews...</div>}>
                <ReviewsSection
                  productId={product._id}
                  initialRating={product.averageRating}
                  initialReviewCount={product.reviewCount}
                />
              </Suspense>
            )}

            {activeTab === 'look' && (
              <Suspense fallback={<div>Loading suggestions...</div>}>
                <CompleteTheLook
                  currentProduct={product}
                  currentProductId={product._id}
                />
              </Suspense>
            )}
          </div>
        </div>
      </div>

      {/* AI Size Modal */}
      <AISizeModal
        isOpen={showSizeModal}
        onClose={() => setShowSizeModal(false)}
        onApplySize={setSelectedSize}
        availableSizes={availableSizes}
      />
    </main>
  );
}
