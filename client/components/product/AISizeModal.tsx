'use client';

import React, { useState, useTransition } from 'react';
import { X, Loader, CheckCircle } from 'lucide-react';
import { SizeRecommendationOutput, SizeRecommendationInput } from '@/types';
import { getSizeRecommendation } from '@/lib/sizeEngine';

/**
 * AISizeModal Component
 * Features:
 * - Input form for height, weight, body type, fit preference
 * - Rule-based AI size recommendation logic
 * - Result display with reasoning and confidence
 * - Apply size button to update selection
 */

interface AISizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySize: (size: string) => void;
  availableSizes: string[];
}

interface AISizeModalFormData {
  height: string;
  heightUnit: 'cm' | 'ft';
  weight: string;
  weightUnit: 'kg' | 'lbs';
  bodyType: 'slim' | 'regular' | 'athletic' | 'curvy';
  fitPreference: 'slim' | 'regular' | 'loose';
}

export default function AISizeModal({
  isOpen,
  onClose,
  onApplySize,
  availableSizes,
}: AISizeModalProps) {
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<'form' | 'result'>('form');
  const [recommendation, setRecommendation] = useState<SizeRecommendationOutput | null>(null);

  const [formData, setFormData] = useState<AISizeModalFormData>({
    height: '',
    heightUnit: 'cm',
    weight: '',
    weightUnit: 'kg',
    bodyType: 'regular',
    fitPreference: 'regular',
  });

  if (!isOpen) return null;

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        const height = parseFloat(formData.height);
        const weight = parseFloat(formData.weight);

        if (!height || !weight) {
          alert('Please fill in all fields');
          return;
        }

        // Convert to metric if imperial
        const normalizedHeight = height;
        const normalizedWeight = weight;
        let unit: 'metric' | 'imperial' = 'metric';

        if (formData.heightUnit === 'ft') {
          unit = 'imperial';
        } else if (formData.weightUnit === 'lbs') {
          unit = 'imperial';
        }

        const input: SizeRecommendationInput = {
          height: normalizedHeight,
          weight: normalizedWeight,
          unit,
          bodyType: formData.bodyType,
          fitPreference: formData.fitPreference,
        };

        const result = getSizeRecommendation(input);
        setRecommendation(result);
        setStep('result');
      } catch (error) {
        console.error('Error getting recommendation:', error);
        alert('Error generating recommendation. Please try again.');
      }
    });
  };

  // Handle apply size
  const handleApplySize = () => {
    if (recommendation) {
      onApplySize(recommendation.recommendedSize);
      onClose();
      setStep('form');
      setRecommendation(null);
    }
  };

  // Reset form
  const resetForm = () => {
    setStep('form');
    setRecommendation(null);
    setFormData({
      height: '',
      heightUnit: 'cm',
      weight: '',
      weightUnit: 'kg',
      bodyType: 'regular',
      fitPreference: 'regular',
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md
                   bg-white rounded-lg shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b bg-white">
          <h2 className="text-xl font-bold text-gray-900">Find Your Perfect Size</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'form' ? (
            <>
              {/* Form Step */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <p className="text-sm text-gray-600 mb-6">
                  Tell us about your measurements and preferences to get a personalized size recommendation.
                </p>

                {/* Height Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Enter height"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none
                               focus:ring-2 focus:ring-gray-400"
                      step="0.1"
                    />
                    <select
                      value={formData.heightUnit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          heightUnit: e.target.value as 'cm' | 'ft',
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none
                               focus:ring-2 focus:ring-gray-400"
                    >
                      <option value="cm">cm</option>
                      <option value="ft">ft</option>
                    </select>
                  </div>
                </div>

                {/* Weight Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Enter weight"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none
                               focus:ring-2 focus:ring-gray-400"
                      step="0.1"
                    />
                    <select
                      value={formData.weightUnit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          weightUnit: e.target.value as 'kg' | 'lbs',
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none
                               focus:ring-2 focus:ring-gray-400"
                    >
                      <option value="kg">kg</option>
                      <option value="lbs">lbs</option>
                    </select>
                  </div>
                </div>

                {/* Body Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Body Type
                  </label>
                  <select
                    value={formData.bodyType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bodyType: e.target.value as 'slim' | 'regular' | 'athletic' | 'curvy',
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none
                             focus:ring-2 focus:ring-gray-400"
                  >
                    <option value="slim">Slim</option>
                    <option value="regular">Regular</option>
                    <option value="athletic">Athletic</option>
                    <option value="curvy">Curvy</option>
                  </select>
                </div>

                {/* Fit Preference */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fit Preference
                  </label>
                  <select
                    value={formData.fitPreference}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fitPreference: e.target.value as 'slim' | 'regular' | 'loose',
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none
                             focus:ring-2 focus:ring-gray-400"
                  >
                    <option value="slim">Slim Fit</option>
                    <option value="regular">Regular Fit</option>
                    <option value="loose">Loose Fit</option>
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-gray-900 text-white font-medium py-2.5 rounded-lg
                           hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2 mt-6"
                >
                  {isPending ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Getting Recommendation...
                    </>
                  ) : (
                    'Get Recommendation'
                  )}
                </button>
              </form>
            </>
          ) : recommendation ? (
            <>
              {/* Result Step */}
              <div className="space-y-6">
                {/* Recommended Size Display */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Recommended Size</p>
                      <p className="text-4xl font-bold text-gray-900">
                        {recommendation.recommendedSize}
                      </p>
                    </div>
                    <div className="text-right">
                      <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
                      <p className="text-sm font-medium text-green-600">
                        {recommendation.confidence}% confidence
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reasoning */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Why This Size?</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {recommendation.reasoning}
                  </p>
                </div>

                {/* Alternative Size */}
                {recommendation.alternativeSize && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-gray-600">
                      <strong>Alternative size:</strong> {recommendation.alternativeSize}
                    </p>
                  </div>
                )}

                {/* Availability Info */}
                {!availableSizes.includes(recommendation.recommendedSize) && (
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      ⚠️ This size is currently unavailable. Consider the alternative size or visit later.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={resetForm}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-900
                             rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleApplySize}
                    className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-lg
                             hover:bg-gray-800 transition-colors font-medium"
                    disabled={!availableSizes.includes(recommendation.recommendedSize)}
                  >
                    Apply This Size
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
