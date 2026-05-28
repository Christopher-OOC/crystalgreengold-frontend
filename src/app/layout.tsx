import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppProviders } from '@/app/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'crystalgreengold',
  description: 'The crystalgreengold frontend application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

