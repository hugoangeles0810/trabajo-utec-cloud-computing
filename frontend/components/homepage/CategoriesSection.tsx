'use client';

import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { useCategories } from '@/lib/hooks/categories';
import { Category } from '@/lib/types/category';

// Extended interface for UI-specific properties
interface CategoryWithUI extends Category {
  image?: string;
  productCount?: number;
  isNew?: boolean;
  isPopular?: boolean;
  color?: string;
}

interface CategoriesSectionProps {
  className?: string;
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
}

export function CategoriesSection({
  className,
  title = 'Explora nuestras Categorías',
  subtitle = 'Encuentra exactamente lo que buscas',
  showViewAll = true,
}: CategoriesSectionProps) {
  // Fetch categories from API
  const { data: categoriesResponse, isLoading, error } = useCategories({ is_active: true });

  // Default images and colors for categories
  const defaultImages = [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1607082349566-187342175e2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  ];

  const defaultColors = [
    'from-blue-500 to-blue-700',
    'from-green-500 to-green-700',
    'from-purple-500 to-purple-700',
    'from-yellow-500 to-orange-500',
    'from-pink-500 to-rose-500',
    'from-red-500 to-red-700',
  ];

  // Transform API data to include UI properties
  const categories: CategoryWithUI[] = categoriesResponse?.data?.categories?.map((category, index) => ({
    ...category,
    image: defaultImages[index % defaultImages.length],
    productCount: Math.floor(Math.random() * 100) + 10, // Mock product count for now
    isNew: index < 2, // First two categories are "new"
    isPopular: index === 1 || index === 3, // Second and fourth categories are "popular"
    color: defaultColors[index % defaultColors.length],
  })) || [];

  const CategoryCard = ({ category }: { category: CategoryWithUI }) => (
    <Link
      href={`/categoria/${category.slug}`}
      className="group relative overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <div
          className="h-full w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundImage: `url(${category.image})` }}
        />
        
        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-60`} />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {category.isNew && (
            <Badge className="bg-green-500 text-white text-xs font-semibold">
              Nuevo
            </Badge>
          )}
          {category.isPopular && (
            <Badge className="bg-yellow-500 text-gray-900 text-xs font-semibold">
              Popular
            </Badge>
          )}
        </div>

        {/* Product Count */}
        <div className="absolute top-3 right-3">
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-semibold text-gray-700">
            {category.productCount} productos
          </div>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
          {category.name}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {category.description}
        </p>
        
        {/* CTA */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">
            Ver categoría
          </span>
          <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
        </div>
      </div>
    </Link>
  );

  // Loading state
  if (isLoading) {
    return (
      <section className={cn('py-16 bg-gray-50', className)}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {title}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {subtitle}
            </p>
          </div>
          
          {/* Loading skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-300 rounded-xl h-48 mb-4"></div>
                <div className="bg-gray-300 rounded h-4 mb-2"></div>
                <div className="bg-gray-300 rounded h-3 w-3/4"></div>
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
      <section className={cn('py-16 bg-gray-50', className)}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {title}
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600 mb-4">
                Error al cargar las categorías. Por favor, intenta de nuevo.
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // No categories state
  if (!categories || categories.length === 0) {
    return (
      <section className={cn('py-16 bg-gray-50', className)}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {title}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              No hay categorías disponibles en este momento.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cn('py-16 bg-gray-50', className)}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            {subtitle}
          </p>
          
          {showViewAll && (
            <Link href="/categorias">
              <Button
                variant="outline"
                className="border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white"
              >
                Ver Todas las Categorías
              </Button>
            </Link>
          )}
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>

        {/* Featured Category Highlight */}
        <div className="mt-12 bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 text-white">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1">
              <Badge className="bg-yellow-500 text-gray-900 mb-4">
                Destacado
              </Badge>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                ¡Nueva Colección EZZETA!
              </h3>
              <p className="text-primary-100 mb-6 text-lg">
                Descubre los últimos diseños de la marca líder en streetwear gaming peruano. 
                Calidad premium y estilo inigualable.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/categoria/ezzeta">
                  <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold px-6 py-3">
                    Ver Colección EZZETA
                  </Button>
                </Link>
                <Link href="/productos?marca=ezzeta">
                  <Button
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-gray-900 font-semibold px-6 py-3"
                  >
                    Ver Todos los Productos
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="flex-shrink-0">
              <div className="relative">
                <div
                  className="w-64 h-64 rounded-xl bg-cover bg-center shadow-2xl"
                  style={{
                    backgroundImage: `url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80)`,
                  }}
                />
                <div className="absolute -bottom-4 -right-4 bg-yellow-500 text-gray-900 px-4 py-2 rounded-full font-bold text-sm">
                  +67 productos
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
