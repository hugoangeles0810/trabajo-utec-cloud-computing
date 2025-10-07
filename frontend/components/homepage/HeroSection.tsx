'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon } from '@heroicons/react/24/outline';

import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  badge?: string;
  isVideo?: boolean;
}

interface HeroSectionProps {
  className?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function HeroSection({ 
  className, 
  autoPlay = true,
  autoPlayInterval = 5000 
}: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  // Mock slides data
  const slides: HeroSlide[] = [
    {
      id: '1',
      title: 'Nueva Colección EZZETA',
      subtitle: 'Streetwear Gaming',
      description: 'Descubre la última colección de EZZETA con diseños únicos que combinan el gaming con el streetwear peruano. Calidad premium y estilo inigualable.',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      ctaText: 'Ver Colección',
      ctaLink: '/categoria/ezzeta',
      badge: 'Nuevo',
    },
    {
      id: '2',
      title: 'Hoodies Gaming',
      subtitle: 'Confort y Estilo',
      description: 'Hoodies diseñados para gamers con materiales de alta calidad, bolsillos especiales para controles y diseños exclusivos de tus juegos favoritos.',
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      ctaText: 'Explorar Hoodies',
      ctaLink: '/categoria/hoodies',
      badge: 'Más Vendido',
    },
    {
      id: '3',
      title: 'Accesorios Gaming',
      subtitle: 'Completa tu Setup',
      description: 'Mousepads, cables, stickers y más accesorios para personalizar tu espacio gaming. Diseñados por gamers, para gamers.',
      image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      ctaText: 'Ver Accesorios',
      ctaLink: '/categoria/accesorios-gaming',
      badge: 'Oferta',
    },
  ];

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % slides.length);
      }, autoPlayInterval);

      return () => clearInterval(timer);
    }
    return undefined;
  }, [isPlaying, autoPlayInterval, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsPlaying(false); // Stop auto-play when user interacts
  };

  const goToPrevious = () => {
    setCurrentSlide(prev => prev === 0 ? slides.length - 1 : prev - 1);
    setIsPlaying(false);
  };

  const goToNext = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
    setIsPlaying(false);
  };

  const toggleAutoPlay = () => {
    setIsPlaying(!isPlaying);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <section className={cn('relative overflow-hidden bg-gray-900', className)}>
      {/* Hero Carousel */}
      <div className="relative h-[500px] md:h-[600px] lg:h-[700px]">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${currentSlideData.image})`,
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40" />

        {/* Content */}
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="max-w-2xl">
              {/* Badge */}
              {currentSlideData.badge && (
                <div className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-primary-600 text-white mb-3 sm:mb-4 hero-fade-in">
                  {currentSlideData.badge}
                </div>
              )}

              {/* Title */}
              <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight hero-slide-up">
                {currentSlideData.title}
              </h1>

              {/* Subtitle */}
              <h2 className="text-lg xs:text-xl sm:text-xl md:text-2xl lg:text-3xl font-semibold text-primary-300 mb-3 sm:mb-4 hero-slide-up hero-delay-200">
                {currentSlideData.subtitle}
              </h2>

              {/* Description */}
              <p className="text-sm xs:text-base sm:text-lg text-gray-200 mb-6 sm:mb-8 leading-relaxed hero-slide-up hero-delay-400 max-w-xl">
                {currentSlideData.description}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 hero-slide-up hero-delay-600">
                <Link href={currentSlideData.ctaLink} className="flex-1 xs:flex-none">
                  <Button className="w-full xs:w-auto bg-primary-600 hover:bg-primary-700 text-white px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 text-sm sm:text-base lg:text-lg font-semibold">
                    {currentSlideData.ctaText}
                  </Button>
                </Link>
                
                <Link href="/productos" className="flex-1 xs:flex-none">
                  <Button
                    variant="outline"
                    className="w-full xs:w-auto border-white text-white hover:bg-white hover:text-gray-900 px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 text-sm sm:text-base lg:text-lg font-semibold"
                  >
                    Ver Todos los Productos
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-1.5 sm:p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
          aria-label="Slide anterior"
        >
          <ChevronLeftIcon className="h-4 w-4 sm:h-6 sm:w-6" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-1.5 sm:p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
          aria-label="Slide siguiente"
        >
          <ChevronRightIcon className="h-4 w-4 sm:h-6 sm:w-6" />
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={toggleAutoPlay}
          className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-white/20 hover:bg-white/30 text-white p-1.5 sm:p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
          aria-label={isPlaying ? 'Pausar carousel' : 'Reproducir carousel'}
        >
          <PlayIcon className={cn('h-4 w-4 sm:h-5 sm:w-5', !isPlaying && 'ml-0.5')} />
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1.5 sm:space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              'w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-200',
              index === currentSlide
                ? 'bg-primary-500 scale-110'
                : 'bg-white/50 hover:bg-white/70'
            )}
            aria-label={`Ir al slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      {isPlaying && (
        <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full">
          <div
            className="h-full bg-primary-500 transition-all duration-100 ease-linear"
            style={{ 
              width: `${((currentSlide + 1) / slides.length) * 100}%` 
            }}
          />
        </div>
      )}

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
        <div className="absolute top-32 right-20 w-1 h-1 bg-yellow-400 rounded-full animate-pulse hero-delay-1000" />
        <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse hero-delay-2000" />
        <div className="absolute bottom-32 right-10 w-1 h-1 bg-white rounded-full animate-pulse hero-delay-3000" />
      </div>
    </section>
  );
}

// Custom CSS animations (to be added to global CSS)
const heroStyles = `
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out;
}

.animate-slide-up {
  animation: slide-up 0.8s ease-out;
}

.animation-delay-200 {
  animation-delay: 0.2s;
}

.animation-delay-400 {
  animation-delay: 0.4s;
}

.animation-delay-600 {
  animation-delay: 0.6s;
}

.animation-delay-1000 {
  animation-delay: 1s;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-3000 {
  animation-delay: 3s;
}
`;

// Export styles for use in global CSS
export { heroStyles };
