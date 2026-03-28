'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { ProductImage } from '@/types';

/**
 * ImageGallery Component
 * Features:
 * - Large primary image with fade transition
 * - Thumbnail strip with hover effects
 * - Mouse-hover zoom lens on desktop
 * - Pinch-to-zoom on mobile
 * - Swipe gesture support
 * - Lazy loading with blur placeholder
 */

interface ImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

export default function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(
    images.findIndex((img) => img.isPrimary) || 0
  );
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState(0);
  const [scale, setScale] = useState(1);
  const mainImageRef = useRef<HTMLDivElement>(null);
  const lastTouchRef = useRef(0);

  const currentImage = images[selectedIndex];

  // Handle thumbnail click
  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
    setIsZoomed(false);
    setScale(1);
  };

  // Handle previous image
  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setIsZoomed(false);
    setScale(1);
  };

  // Handle next image
  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setIsZoomed(false);
    setScale(1);
  };

  // Handle mouse zoom lens on desktop
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImageRef.current || !isZoomed) return;

    const rect = mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  // Handle touch pinch zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      );
      setTouchStart(distance);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      );
      const newScale = Math.min(3, Math.max(1, (distance / touchStart) * scale));
      setScale(newScale);
    }
  };

  // Handle swipe gesture
  const handleTouchStartSwipe = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    lastTouchRef.current = Date.now();
  };

  const handleTouchEndSwipe = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touchEnd = e.changedTouches[0].clientX;
    const difference = touchStart - touchEnd;
    const isQuickSwipe = Date.now() - lastTouchRef.current < 300;

    if (isQuickSwipe || Math.abs(difference) > 50) {
      if (difference > 0) {
        handleNext(); // Swipe left → next
      } else {
        handlePrevious(); // Swipe right → previous
      }
    }

    setTouchStart(0);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Main Image Container */}
      <div
        ref={mainImageRef}
        className="relative w-full bg-gray-100 rounded-lg overflow-hidden aspect-square group
                   transition-all duration-300 cursor-zoom-in hover:cursor-zoom-in"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={(e) => {
          handleTouchStart(e);
          handleTouchStartSwipe(e);
        }}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEndSwipe}
      >
        {/* Primary Image with Zoom */}
        <div
          className="relative w-full h-full transition-transform duration-300"
          style={{
            transform: isZoomed ? `scale(${2})` : 'scale(1)',
            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
            touchAction: scale > 1 ? 'none' : 'auto',
          }}
        >
          <Image
            src={currentImage.url}
            alt={currentImage.alt || productName}
            fill
            className="object-cover"
            priority={selectedIndex === 0}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
            placeholder="blur"
            blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect fill='%23f0f0f0' width='400' height='400'/%3E%3C/svg%3E"
          />

          {/* Zoom Icon Indicator */}
          {!isZoomed && (
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full p-2
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ZoomIn className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        {/* Navigation Arrows (Desktop) */}
        <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100
                      transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
          <button
            onClick={handlePrevious}
            className="p-2 bg-white/80 hover:bg-white rounded-full transition-colors
                     shadow-lg backdrop-blur-sm"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </button>
          <button
            onClick={handleNext}
            className="p-2 bg-white/80 hover:bg-white rounded-full transition-colors
                     shadow-lg backdrop-blur-sm"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6 text-gray-900" />
          </button>
        </div>

        {/* Image Counter */}
        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white
                      px-3 py-1 rounded-full text-sm font-medium">
          {selectedIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Strip */}
      <div className="mt-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2
                         transition-all duration-300 group/thumb
                         ${
                           selectedIndex === index
                             ? 'border-gray-900 ring-2 ring-gray-400'
                             : 'border-gray-200 hover:border-gray-400'
                         }`}
            >
              <Image
                src={image.url}
                alt={image.alt || productName}
                width={80}
                height={80}
                className="w-full h-full object-cover transition-transform group-hover/thumb:scale-105"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Touch Hints */}
      <div className="mt-4 text-center text-sm text-gray-500 md:hidden">
        <p>Swipe to navigate • Pinch to zoom</p>
      </div>

      {/* Zoom Level Indicator (Mobile) */}
      {scale > 1 && (
        <div className="mt-2 text-center text-sm text-gray-600">
          Zoom: {Math.round(scale * 100)}%
        </div>
      )}
    </div>
  );
}
