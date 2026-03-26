'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';

/**
 * Providers Component
 * Wraps the app with required providers (Theme, Context, etc.)
 * Separated from layout to use 'use client'
 */

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      {children}
    </ThemeProvider>
  );
}
