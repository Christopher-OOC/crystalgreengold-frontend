import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppProviders } from '@/app/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Topnivo',
  description: 'The Topnivo frontend application',
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
