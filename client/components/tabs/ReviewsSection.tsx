'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, MessageCircle, ThumbsUp, Filter } from 'lucide-react';
import { Review } from '@/types';

/**
 * ReviewsSection Component
 * Features:
 * - Aggregate rating breakdown with histogram
 * - Filter by rating, body type, height range, verified
 * - Review cards with user info, rating, helpful votes
 * - Pagination (6 per page)
 * - Write review button (basic)
 */

interface ReviewsSectionProps {
  productId: string;
  initialRating: number;
  initialReviewCount: number;
}

interface FilterOptions {
  rating: number | null;
  bodyType: string | null;
  verified: boolean;
}

export default function ReviewsSection({
  productId,
  initialRating,
  initialReviewCount,
}: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<FilterOptions>({
    rating: null,
    bodyType: null,
    verified: false,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Rating distribution
  const ratingDistribution = {
    5: 340,
    4: 85,
    3: 25,
    2: 10,
    1: 5,
  };

  const totalRatings = Object.values(ratingDistribution).reduce((a, b) => a + b, 0);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  // Load reviews from API
  const loadReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        productId,
        page: page.toString(),
        limit: '6',
      });

      if (filters.rating) params.append('rating', filters.rating.toString());
      if (filters.bodyType) params.append('bodyType', filters.bodyType);
      if (filters.verified) params.append('verified', 'true');

      const response = await fetch(`/api/reviews/${productId}?${params}`);
      const data = await response.json();

      if (data.success) {
        setReviews(data.data);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [page, filters]);

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < Math.floor(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // Render progress bar for rating
  const renderRatingBar = (count: number) => {
    const percentage = (count / totalRatings) * 100;
    return (
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-400 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  return (
    <div className="w-full space-y-8">
      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Average Rating */}
        <div className="md:col-span-1">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {initialRating.toFixed(1)}
            </div>
            <div className="flex justify-center mb-3">{renderStars(initialRating)}</div>
            <p className="text-sm text-gray-600 mb-2">Based on {initialReviewCount} reviews</p>
            <button className="text-sm text-blue-600 hover:underline">
              Write a Review
            </button>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="md:col-span-2">
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-3">
                <button
                  onClick={() => setFilters({ ...filters, rating: rating === filters.rating ? null : rating })}
                  className={`text-sm font-medium flex items-center gap-1 whitespace-nowrap transition-colors
                           ${filters.rating === rating ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  {rating}
                  <Star className="w-3 h-3 fill-current" />
                </button>
                {renderRatingBar(ratingDistribution[rating as keyof typeof ratingDistribution])}
                <span className="text-sm text-gray-500 w-12 text-right">
                  {ratingDistribution[rating as keyof typeof ratingDistribution]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-t pt-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 font-medium text-gray-900 hover:text-gray-600 transition-colors"
        >
          <Filter className="w-5 h-5" />
          Filters {Object.values(filters).some(v => v) && '✓'}
        </button>

        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Body Type
              </label>
              <select
                value={filters.bodyType || ''}
                onChange={(e) =>
                  setFilters({ ...filters, bodyType: e.target.value || null })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Body Types</option>
                <option value="slim">Slim</option>
                <option value="regular">Regular</option>
                <option value="athletic">Athletic</option>
                <option value="curvy">Curvy</option>
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.verified}
                onChange={(e) =>
                  setFilters({ ...filters, verified: e.target.checked })
                }
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Verified Purchases Only</span>
            </label>
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-6 border-t pt-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
            </div>
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No reviews match your filters.</p>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="pb-6 border-b">
              {/* Review Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0">
                  {/* User avatar placeholder */}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="font-medium text-gray-900">
                        {typeof review.userId === 'string' ? 'Anonymous User' : review.userId?.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {review.size ? `Size: ${review.size}` : ''} •{' '}
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      {review.verified && (
                        <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-3 mb-3">
                    {renderStars(review.rating)}
                    <span className="text-sm font-medium text-gray-900">{review.title}</span>
                  </div>

                  {/* Review Body */}
                  <p className="text-sm text-gray-700 mb-3">{review.body}</p>

                  {/* Fit Badge */}
                  {review.fit && (
                    <div className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded mb-3 mr-2">
                      {review.fit}
                    </div>
                  )}

                  {/* Review Stats */}
                  <div className="flex items-center gap-4 mt-4">
                    <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{review.helpful} helpful</span>
                    </button>
                    <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span>Reply</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 border-t pt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium
                     text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                page === i + 1
                  ? 'bg-gray-900 text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium
                     text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
