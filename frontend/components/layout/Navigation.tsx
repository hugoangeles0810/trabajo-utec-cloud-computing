'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id?: string;
  children?: Category[];
  product_count?: number;
}

interface NavigationProps {
  categories?: Category[];
  className?: string;
}

export function Navigation({ categories = [], className }: NavigationProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const categoriesDropdownRef = useRef<HTMLDivElement>(null);

  // Mock categories for demonstration
  const mockCategories: Category[] = [
    {
      id: '1',
      name: 'Ropa',
      slug: 'ropa',
      description: 'Toda la ropa gamer y streetwear',
      children: [
        { id: '1-1', name: 'Hoodies', slug: 'hoodies', product_count: 15 },
        { id: '1-2', name: 'Camisetas', slug: 'camisetas', product_count: 32 },
        { id: '1-3', name: 'Pantalones', slug: 'pantalones', product_count: 18 },
        { id: '1-4', name: 'Shorts', slug: 'shorts', product_count: 12 },
      ],
    },
    {
      id: '2',
      name: 'Accesorios',
      slug: 'accesorios',
      description: 'Accesorios para gaming y lifestyle',
      children: [
        { id: '2-1', name: 'Gorras', slug: 'gorras', product_count: 8 },
        { id: '2-2', name: 'Mochilas', slug: 'mochilas', product_count: 6 },
        { id: '2-3', name: 'Pulseras', slug: 'pulseras', product_count: 20 },
        { id: '2-4', name: 'Stickers', slug: 'stickers', product_count: 25 },
      ],
    },
    {
      id: '3',
      name: 'Gaming',
      slug: 'gaming',
      description: 'Productos para gamers',
      children: [
        { id: '3-1', name: 'Mousepads', slug: 'mousepads', product_count: 10 },
        { id: '3-2', name: 'Cables', slug: 'cables', product_count: 15 },
        { id: '3-3', name: 'Controles', slug: 'controles', product_count: 5 },
        { id: '3-4', name: 'Auriculares', slug: 'auriculares', product_count: 8 },
      ],
    },
    {
      id: '4',
      name: 'Marcas',
      slug: 'marcas',
      description: 'Nuestras marcas favoritas',
      children: [
        { id: '4-1', name: 'EZZETA', slug: 'ezzeta', product_count: 45 },
        { id: '4-2', name: 'Gaming Pro', slug: 'gaming-pro', product_count: 32 },
        { id: '4-3', name: 'Street Style', slug: 'street-style', product_count: 28 },
        { id: '4-4', name: 'Tech Wear', slug: 'tech-wear', product_count: 18 },
      ],
    },
  ];

  const displayCategories = categories.length > 0 ? categories : mockCategories;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Close category sub-dropdowns
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setActiveDropdown(null);
        setHoveredCategory(null);
      }
      
      // Close main categories dropdown
      if (categoriesDropdownRef.current && !categoriesDropdownRef.current.contains(target)) {
        setIsCategoriesDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = (categoryId: string) => {
    setHoveredCategory(categoryId);
    setActiveDropdown(categoryId);
  };

  const handleMouseLeave = () => {
    setHoveredCategory(null);
    // Delay hiding dropdown to allow mouse to move to dropdown
    setTimeout(() => {
      if (!hoveredCategory) {
        setActiveDropdown(null);
      }
    }, 100);
  };

  const handleDropdownMouseEnter = () => {
    // Keep dropdown open when mouse enters dropdown area
  };

  const handleDropdownMouseLeave = () => {
    setHoveredCategory(null);
    setActiveDropdown(null);
  };

  const CategoryDropdown = ({ category }: { category: Category }) => {
    if (!category.children || category.children.length === 0) return null;

    return (
      <div
        ref={dropdownRef}
        className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
        onMouseEnter={handleDropdownMouseEnter}
        onMouseLeave={handleDropdownMouseLeave}
      >
        <div className="p-4">
          <div className="mb-3">
            <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
            {category.description && (
              <p className="text-sm text-gray-600">{category.description}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {category.children.map((subcategory) => (
              <Link
                key={subcategory.id}
                href={`/categoria/${subcategory.slug}`}
                className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition-colors group"
              >
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900 group-hover:text-primary-600">
                    {subcategory.name}
                  </span>
                </div>
                {subcategory.product_count && (
                  <span className="text-xs text-gray-500 ml-2">
                    {subcategory.product_count}
                  </span>
                )}
                <ChevronRightIcon className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>

          {/* View All Link */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <Link
              href={`/categoria/${category.slug}`}
              className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              Ver todos los {category.name.toLowerCase()}
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <nav className={cn('bg-white border-b border-gray-200', className)}>
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center space-x-4 sm:space-x-8">
          {/* Categories */}
          <div className="relative" ref={categoriesDropdownRef}>
            <button 
              className="flex items-center space-x-1 py-3 sm:py-4 text-gray-700 hover:text-primary-600 font-medium transition-colors text-sm sm:text-base"
              onClick={() => setIsCategoriesDropdownOpen(!isCategoriesDropdownOpen)}
              onMouseEnter={() => setIsCategoriesDropdownOpen(true)}
            >
              <span>Categorías</span>
              <ChevronDownIcon className={cn(
                "h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200",
                isCategoriesDropdownOpen && "rotate-180"
              )} />
            </button>
            
            {/* Categories Dropdown */}
            {isCategoriesDropdownOpen && (
              <div 
                className="absolute top-full left-0 mt-1 w-80 sm:w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                onMouseEnter={() => setIsCategoriesDropdownOpen(true)}
                onMouseLeave={() => setIsCategoriesDropdownOpen(false)}
              >
                <div className="p-3 sm:p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Explora nuestras categorías</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {displayCategories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/categoria/${category.slug}`}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition-colors group"
                        onClick={() => setIsCategoriesDropdownOpen(false)}
                      >
                        <div className="flex-1">
                          <span className="text-xs sm:text-sm font-medium text-gray-900 group-hover:text-primary-600">
                            {category.name}
                          </span>
                          {category.product_count && (
                            <span className="text-xs text-gray-500 block">
                              {category.product_count} productos
                            </span>
                          )}
                        </div>
                        <ChevronRightIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Navigation Links */}
          <div className="hidden lg:flex items-center space-x-6">
            {displayCategories.map((category) => (
              <div
                key={category.id}
                className="relative"
                onMouseEnter={() => handleMouseEnter(category.id)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href={`/categoria/${category.slug}`}
                  className="flex items-center space-x-1 py-4 text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  <span>{category.name}</span>
                  {category.children && category.children.length > 0 && (
                    <ChevronDownIcon className="h-4 w-4" />
                  )}
                </Link>
                
                {/* Subcategory Dropdown */}
                {activeDropdown === category.id && (
                  <CategoryDropdown category={category} />
                )}
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="hidden lg:flex items-center space-x-6 ml-auto">
            <Link
              href="/ofertas"
              className="py-4 text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              🔥 Ofertas
            </Link>
            <Link
              href="/nuevos"
              className="py-4 text-green-600 hover:text-green-700 font-medium transition-colors"
            >
              ✨ Nuevos
            </Link>
            <Link
              href="/lo-mas-vendido"
              className="py-4 text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
            >
              🏆 Lo Más Vendido
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between py-3 sm:py-4 border-t border-gray-100">
            <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto scrollbar-hide">
              {displayCategories.slice(0, 4).map((category) => (
                <Link
                  key={category.id}
                  href={`/categoria/${category.slug}`}
                  className="flex-shrink-0 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors whitespace-nowrap"
                >
                  {category.name}
                </Link>
              ))}
            </div>
            <Link
              href="/ofertas"
              className="flex-shrink-0 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors whitespace-nowrap"
            >
              🔥 Ofertas
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
