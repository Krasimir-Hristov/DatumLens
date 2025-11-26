import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

import Providers from '@/lib/query-provider';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'DatumLens - Intelligent Document Analysis',
  description: 'AI-powered RAG system for document analysis',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
          <Toaster richColors position='top-center' closeButton />
        </Providers>
      </body>
    </html>
  );
}
