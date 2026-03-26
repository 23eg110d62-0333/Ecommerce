/**
 * Client-side Size Recommendation Engine
 * Mirror of server-side logic for immediate execution on the frontend
 * This avoids API latency for real-time size recommendations
 */

interface SizeRecommendationInput {
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

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const HEIGHT_RANGES: Record<string, [number, number]> = {
  XS: [140, 156],
  S: [156, 165],
  M: [165, 174],
  L: [174, 183],
  XL: [183, 192],
  XXL: [192, 210],
};

const WEIGHT_RANGES_BY_BODY_TYPE: Record<string, Record<string, [number, number]>> = {
  slim: {
    XS: [40, 50],
    S: [50, 60],
    M: [60, 70],
    L: [70, 82],
    XL: [82, 95],
    XXL: [95, 120],
  },
  regular: {
    XS: [45, 55],
    S: [55, 68],
    M: [68, 82],
    L: [82, 95],
    XL: [95, 110],
    XXL: [110, 135],
  },
  athletic: {
    XS: [48, 58],
    S: [58, 72],
    M: [72, 85],
    L: [85, 98],
    XL: [98, 115],
    XXL: [115, 140],
  },
  curvy: {
    XS: [50, 60],
    S: [60, 72],
    M: [72, 85],
    L: [85, 100],
    XL: [100, 120],
    XXL: [120, 145],
  },
};

function convertToMetric(
  height: number,
  weight: number,
  unit: 'metric' | 'imperial'
): [number, number] {
  if (unit === 'metric') {
    return [height, weight];
  }

  const heightCm = height * 2.54;
  const weightKg = weight * 0.453592;

  return [heightCm, weightKg];
}

function findBaseSize(heightCm: number, weightKg: number, bodyType: string): string {
  let bestMatch = 'M';
  let bestScore = 0;

  for (const size of SIZES) {
    const [minHeight, maxHeight] = HEIGHT_RANGES[size];
    const [minWeight, maxWeight] =
      WEIGHT_RANGES_BY_BODY_TYPE[bodyType]?.[size] || WEIGHT_RANGES_BY_BODY_TYPE.regular[size];

    const heightMatch =
      heightCm >= minHeight && heightCm <= maxHeight
        ? 1
        : Math.max(0, 1 - Math.abs(heightCm - (minHeight + maxHeight) / 2) / 30);

    const weightMatch =
      weightKg >= minWeight && weightKg <= maxWeight
        ? 1
        : Math.max(0, 1 - Math.abs(weightKg - (minWeight + maxWeight) / 2) / 20);

    const score = (heightMatch + weightMatch) / 2;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = size;
    }
  }

  return bestMatch;
}

function adjustSizeByFitPreference(baseSize: string, fitPreference: string): string {
  const sizeIndex = SIZES.indexOf(baseSize);

  if (fitPreference === 'slim' && sizeIndex > 0) {
    return SIZES[sizeIndex - 1];
  }

  if (fitPreference === 'loose' && sizeIndex < SIZES.length - 1) {
    return SIZES[sizeIndex + 1];
  }

  return baseSize;
}

function generateReasoning(
  heightCm: number,
  weightKg: number,
  bodyType: string,
  fitPreference: string,
  recommendedSize: string,
  alternativeSize?: string
): string {
  const heightFt = Math.floor(heightCm / 30.48);
  const heightIn = Math.round((heightCm % 30.48) / 2.54);
  const bmi = ((weightKg / ((heightCm / 100) ** 2)) * 10) / 10;

  let reasoning = `Based on your measurements (${heightFt}'${heightIn}", ${weightKg}kg, BMI: ${bmi.toFixed(1)}), `;
  reasoning += `${bodyType} build, and preference for ${fitPreference} fit, `;
  reasoning += `we recommend **size ${recommendedSize}** for optimal comfort and style.`;

  if (alternativeSize) {
    reasoning += ` Size ${alternativeSize} is also a good option if you prefer ${fitPreference === 'loose' ? 'a snugger' : 'more relaxed'} fit.`;
  }

  reasoning += ` Please refer to the size chart for specific measurements to ensure the best fit.`;

  return reasoning;
}

export function getSizeRecommendation(
  input: SizeRecommendationInput
): SizeRecommendationOutput {
  if (!input.height || !input.weight || !input.unit || !input.bodyType || !input.fitPreference) {
    return {
      recommendedSize: 'M',
      confidence: 0,
      reasoning: 'Invalid input provided. Using default size.',
    };
  }

  const [heightCm, weightKg] = convertToMetric(input.height, input.weight, input.unit);

  if (heightCm < 140 || heightCm > 210 || weightKg < 30 || weightKg > 200) {
    return {
      recommendedSize: 'M',
      confidence: 30,
      reasoning:
        'Measurements are outside typical range. Please verify your height and weight for accurate recommendations.',
    };
  }

  const baseSize = findBaseSize(heightCm, weightKg, input.bodyType);
  const recommendedSize = adjustSizeByFitPreference(baseSize, input.fitPreference);

  const sizeIndex = SIZES.indexOf(recommendedSize);
  const alternativeSize = input.fitPreference === 'slim' ? SIZES[sizeIndex + 1] : SIZES[sizeIndex - 1];

  const [minHeight, maxHeight] = HEIGHT_RANGES[recommendedSize];
  const [minWeight, maxWeight] =
    WEIGHT_RANGES_BY_BODY_TYPE[input.bodyType]?.[recommendedSize] ||
    WEIGHT_RANGES_BY_BODY_TYPE.regular[recommendedSize];

  const heightDev = Math.abs(heightCm - (minHeight + maxHeight) / 2) / 30;
  const weightDev = Math.abs(weightKg - (minWeight + maxWeight) / 2) / 20;

  const confidence = Math.max(60, Math.round(100 - (heightDev + weightDev) * 10));

  const reasoning = generateReasoning(
    heightCm,
    weightKg,
    input.bodyType,
    input.fitPreference,
    recommendedSize,
    alternativeSize
  );

  return {
    recommendedSize,
    confidence,
    reasoning,
    alternativeSize: alternativeSize || undefined,
  };
}
