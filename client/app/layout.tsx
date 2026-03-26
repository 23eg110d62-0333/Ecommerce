import type { Metadata } from 'next';
import { Providers } from './providers';
import '@/styles/globals.css';

/**
 * Root Layout Component
 * Applies to all pages in the Next.js app
 * Includes ThemeProvider, dark mode support, and global styles
 */

export const metadata: Metadata = {
  title: 'Premium Fashion Store - Premium Clothing & Accessories',
  description:
    'Shop premium fashion from leading brands. Discover exclusive collections of blazers, dresses, and more with free shipping and easy returns.',
  keywords: [
    'fashion',
    'premium clothing',
    'blazers',
    'dresses',
    'designer fashion',
    'online shopping',
  ],
  viewport: 'width=device-width, initial-scale=1',
  authors: [{ name: 'Fashion Store' }],
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://fashion-store.com',
    title: 'Premium Fashion Store',
    description: 'Shop premium fashion from leading brands',
    images: [
      {
        url: 'https://fashion-store.com/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
  },
  robots: 'index, follow',
  googleSiteVerification: 'your-verification-code-here',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#ffffff" />
      </head>

      <body className="bg-white text-gray-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
