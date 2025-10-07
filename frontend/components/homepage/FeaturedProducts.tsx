'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  ShoppingCartIcon,
  HeartIcon,
  StarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useAddToCart } from '@/lib/hooks/cart';
import { useFeaturedProducts } from '@/lib/hooks/products';
import { Product } from '@/lib/types/product';
import { cn } from '@/lib/utils';

// Extended interface for UI-specific properties
interface ProductWithUI extends Product {
  originalPrice?: number;
  discount?: number;
  image: string;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
  category: string;
  vendor: string;
}

interface FeaturedProductsProps {
  className?: string;
  title?: string;
  subtitle?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function FeaturedProducts({
  className,
  title = 'Lo Más Vendido',
  subtitle = 'Los productos favoritos de nuestros clientes',
  autoPlay = true,
  autoPlayInterval = 4000,
}: FeaturedProductsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  const addToCartMutation = useAddToCart();
  
  // Fetch products from API
  const { data: apiProducts, isLoading, error } = useFeaturedProducts(8);

  // Default placeholder images for products - gaming and streetwear focused
  // These images are used when products don't have valid images from the API
  const defaultImages = [
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Gaming hoodie
    'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Gaming setup
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Streetwear
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Gaming accessories
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Tech gadgets
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Gaming peripherals
    'https://images.unsplash.com/photo-1607082349566-187342175e2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Streetwear fashion
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Gaming merchandise
  ];

  // Transform API data to include UI properties
  const products: ProductWithUI[] = apiProducts?.map((product, index) => {
    // Use API image if available and valid, otherwise use placeholder
    const hasValidImage = product.images && product.images.length > 0 && 
                         product.images[0] && 
                         !product.images[0].includes('example.com');
    
    return {
      ...product,
      image: hasValidImage ? product.images[0] : defaultImages[index % defaultImages.length],
      rating: 4.5 + Math.random() * 0.5, // Mock rating between 4.5-5.0
      reviewCount: Math.floor(Math.random() * 200) + 50, // Mock review count
      isNew: index < 2, // First two products are "new"
      isBestSeller: index === 1 || index === 3, // Second and fourth products are "best sellers"
      isOnSale: index === 0 || index === 2, // First and third products are "on sale"
      originalPrice: index === 0 || index === 2 ? product.price * 1.25 : undefined, // Mock original price for sale items
      discount: index === 0 || index === 2 ? 20 : undefined, // Mock discount
      category: 'Producto', // Mock category name
      vendor: 'Vendor', // Mock vendor name
    };
  }) || [];

  // Mock products data (fallback)
  const mockProducts: ProductWithUI[] = [
    {
      id: '1',
      name: 'Hoodie EZZETA Gaming Pro',
      slug: 'hoodie-ezzeta-gaming-pro',
      description: 'Hoodie premium con diseño gaming exclusivo de EZZETA',
      price: 89.99,
      originalPrice: 119.99,
      discount: 25,
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      rating: 4.8,
      reviewCount: 156,
      stock: 25,
      isBestSeller: true,
      isOnSale: true,
      category: 'Ropa Gaming',
      vendor: 'EZZETA',
    },
    {
      id: '2',
      name: 'Mousepad Gaming RGB',
      slug: 'mousepad-gaming-rgb',
      description: 'Mousepad con iluminación RGB y superficie optimizada',
      price: 34.99,
      image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      rating: 4.6,
      reviewCount: 89,
      stock: 45,
      isNew: true,
      category: 'Gaming Setup',
      vendor: 'Gaming Pro',
    },
    {
      id: '3',
      name: 'Camiseta Streetwear Gamer',
      slug: 'camiseta-streetwear-gamer',
      description: 'Camiseta de algodón premium con estampado gaming',
      price: 24.99,
      originalPrice: 29.99,
      discount: 17,
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      rating: 4.7,
      reviewCount: 203,
      stock: 67,
      isBestSeller: true,
      isOnSale: true,
      category: 'Ropa Gaming',
      vendor: 'Street Style',
    },
    {
      id: '4',
      name: 'Mochila Gaming EZZETA',
      slug: 'mochila-gaming-ezzeta',
      description: 'Mochila con compartimentos especiales para gaming',
      price: 79.99,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      rating: 4.9,
      reviewCount: 134,
      stock: 18,
      isBestSeller: true,
      category: 'Accesorios',
      vendor: 'EZZETA',
    },
    {
      id: '5',
      name: 'Stickers Pack Gaming',
      slug: 'stickers-pack-gaming',
      description: 'Pack de 50 stickers con diseños gaming únicos',
      price: 12.99,
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      rating: 4.5,
      reviewCount: 78,
      stock: 120,
      isNew: true,
      category: 'Stickers',
      vendor: 'Art Gaming',
    },
    {
      id: '6',
      name: 'Cable USB-C Gaming',
      slug: 'cable-usb-c-gaming',
      description: 'Cable USB-C de alta velocidad con diseño gaming',
      price: 19.99,
      originalPrice: 24.99,
      discount: 20,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      rating: 4.4,
      reviewCount: 56,
      stock: 89,
      isOnSale: true,
      category: 'Gaming Setup',
      vendor: 'Tech Gaming',
    },
  ];

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % Math.ceil(products.length / 4));
      }, autoPlayInterval);

      return () => clearInterval(timer);
    }
    return undefined;
  }, [isPlaying, autoPlayInterval, products.length]);

  const goToPrevious = () => {
    setCurrentIndex(prev => prev === 0 ? Math.ceil(products.length / 4) - 1 : prev - 1);
    setIsPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % Math.ceil(products.length / 4));
    setIsPlaying(false);
  };

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const handleAddToCart = (product: Product) => {
    addToCartMutation.mutate({
      product_id: product.id,
      quantity: 1,
    });
  };

  const ProductCard = ({ product }: { product: ProductWithUI }) => (
    <div className="group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative overflow-hidden rounded-t-xl">
        <div
          className="h-64 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundImage: `url(${product.image})` }}
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && (
            <Badge className="bg-green-500 text-white text-xs font-semibold">
              Nuevo
            </Badge>
          )}
          {product.isBestSeller && (
            <Badge className="bg-yellow-500 text-gray-900 text-xs font-semibold">
              Más Vendido
            </Badge>
          )}
          {product.isOnSale && product.discount && (
            <Badge className="bg-red-500 text-white text-xs font-semibold">
              -{product.discount}%
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => toggleFavorite(product.id)}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          >
            {favorites.has(product.id) ? (
              <HeartSolidIcon className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-gray-600" />
            )}
          </button>
          
          <Link href={`/producto/${product.slug}`}>
            <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
              <EyeIcon className="h-5 w-5 text-gray-600" />
            </button>
          </Link>
        </div>

        {/* Quick Add to Cart */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            onClick={() => handleAddToCart(product)}
            disabled={addToCartMutation.isPending || product.stock === 0}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold py-2"
          >
            <ShoppingCartIcon className="h-4 w-4 mr-2" />
            {product.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Vendor */}
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
          {product.vendor}
        </p>

        {/* Name */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={cn(
                  'h-4 w-4',
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                )}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {product.rating} ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">
            S/ {product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              S/ {product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock */}
        <div className="text-xs text-gray-500">
          {product.stock > 10 ? (
            <span className="text-green-600">En stock</span>
          ) : product.stock > 0 ? (
            <span className="text-yellow-600">Solo {product.stock} disponibles</span>
          ) : (
            <span className="text-red-600">Agotado</span>
          )}
        </div>
      </div>
    </div>
  );

  // Calculate visible products
  const itemsPerSlide = 4;
  const totalSlides = Math.ceil(products.length / itemsPerSlide);
  const startIndex = currentIndex * itemsPerSlide;
  const visibleProducts = products.slice(startIndex, startIndex + itemsPerSlide);

  // Loading state
  if (isLoading) {
    return (
      <section className={cn('py-16 bg-white', className)}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12">
            <div className="mb-6 lg:mb-0">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {title}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl">
                {subtitle}
              </p>
            </div>
          </div>
          
          {/* Loading skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-300 rounded-xl h-64 mb-4"></div>
                <div className="bg-gray-300 rounded h-4 mb-2"></div>
                <div className="bg-gray-300 rounded h-3 w-3/4 mb-2"></div>
                <div className="bg-gray-300 rounded h-4 w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className={cn('py-16 bg-white', className)}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {title}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {subtitle}
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-600">
                Error al cargar los productos. Por favor, intenta de nuevo más tarde.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cn('py-16 bg-white', className)}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12">
          <div className="mb-6 lg:mb-0">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {title}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl">
              {subtitle}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/productos?sort=best-selling">
              <Button
                variant="outline"
                className="border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white"
              >
                Ver Todos los Productos
              </Button>
            </Link>
          </div>
        </div>

        {/* Products Carousel */}
        <div className="relative">
          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white shadow-lg hover:shadow-xl text-gray-600 hover:text-primary-600 p-3 rounded-full transition-all duration-200"
            aria-label="Productos anteriores"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white shadow-lg hover:shadow-xl text-gray-600 hover:text-primary-600 p-3 rounded-full transition-all duration-200"
            aria-label="Productos siguientes"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-2 mt-8">
            {[...Array(totalSlides)].map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsPlaying(false);
                }}
                className={cn(
                  'w-3 h-3 rounded-full transition-all duration-200',
                  index === currentIndex
                    ? 'bg-primary-600 scale-110'
                    : 'bg-gray-300 hover:bg-gray-400'
                )}
                aria-label={`Ir al slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-gray-50 rounded-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {products.length}+
              </div>
              <div className="text-gray-600">Productos Destacados</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">
                4.7★
              </div>
              <div className="text-gray-600">Calificación Promedio</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">
                1000+
              </div>
              <div className="text-gray-600">Clientes Satisfechos</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
