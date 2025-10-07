import type { Metadata, Viewport } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { QueryProvider } from '@/lib/providers/QueryProvider';
import { StoreProvider } from '@/lib/providers/StoreProvider';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Gamarriando - Marketplace de Streetwear Peruano',
  description:
    'Descubre las prendas más frescas del streetwear peruano. Ropa para hombre, mujer, niños y bebés con los mejores precios.',
  keywords: [
    'streetwear',
    'ropa peruana',
    'gamarriando',
    'moda',
    'ropa hombre',
    'ropa mujer',
  ],
  authors: [{ name: 'Gamarriando Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Gamarriando - Marketplace de Streetwear Peruano',
    description: 'Descubre las prendas más frescas del streetwear peruano',
    url: 'https://gamarriando.com',
    siteName: 'Gamarriando',
    locale: 'es_PE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gamarriando - Marketplace de Streetwear Peruano',
    description: 'Descubre las prendas más frescas del streetwear peruano',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='es'>
      <body className="min-h-screen bg-gray-50">
        <QueryProvider>
          <StoreProvider>
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <CartDrawer />
          </StoreProvider>
        </QueryProvider>
      </body>
    </html>
  );
}