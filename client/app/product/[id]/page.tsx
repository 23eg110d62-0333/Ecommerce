import type { Metadata } from 'next';
import ProductPage from './ProductPage';
import { Product } from '@/types';

/**
 * Product Detail Page - Server Component
 * Implements SSR for SEO and initial data fetching
 * Uses dynamic routes with [id] parameter
 */

interface ProductPageRouteProps {
  params: {
    id: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: ProductPageRouteProps): Promise<Metadata> {
  try {
    // Fetch product data from API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product/${params.id}`, {
      next: { revalidate: 3600 }, // ISR - revalidate every hour
    });

    if (!response.ok) {
      return {
        title: 'Product Not Found',
        description: 'The product you are looking for does not exist.',
      };
    }

    const { data: product } = (await response.json()) as { data: Product };

    return {
      title: `${product.name} - ${product.brand}`,
      description: product.shortDescription || product.description,
      keywords: [product.name, product.brand, product.category, ...product.tags],
      openGraph: {
        title: product.name,
        description: product.shortDescription || product.description,
        images: [
          {
            url: product.images[0]?.url || '/og-image.jpg',
            width: 1200,
            height: 630,
            alt: product.name,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description: product.shortDescription || product.description,
        images: [product.images[0]?.url || '/og-image.jpg'],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Product',
      description: 'Premium fashion product',
    };
  }
}

export default async function Page({ params }: ProductPageRouteProps) {
  try {
    // Fetch product data server-side
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product/${params.id}`, {
      next: { revalidate: 3600 }, // ISR
    });

    if (!response.ok) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
            <p className="text-gray-600 mb-6">The product you are looking for does not exist.</p>
            <a href="/" className="text-blue-600 hover:underline">
              Return to Home
            </a>
          </div>
        </div>
      );
    }

    const { data: product } = (await response.json()) as { data: Product };

    return (
      <>
        <ProductPage product={product} />

        {/* JSON-LD Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org/',
              '@type': 'Product',
              name: product.name,
              brand: {
                '@type': 'Brand',
                name: product.brand,
              },
              description: product.description,
              image: product.images[0]?.url,
              price: product.discountPrice || product.basePrice,
              priceCurrency: 'GBP',
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: product.averageRating,
                reviewCount: product.reviewCount,
              },
              offers: {
                '@type': 'Offer',
                availability: product.variants.some((v) => v.stock > 0)
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/OutOfStock',
                priceCurrency: 'GBP',
                price: product.discountPrice || product.basePrice,
              },
            }),
          }}
        />
      </>
    );
  } catch (error) {
    console.error('Error loading product:', error);

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Product</h1>
          <p className="text-gray-600 mb-6">
            Something went wrong while loading the product. Please try again later.
          </p>
          <a href="/" className="text-blue-600 hover:underline">
            Return to Home
          </a>
        </div>
      </div>
    );
  }
}
