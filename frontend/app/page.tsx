import { PromotionalBanner } from '@/components/homepage/PromotionalBanner';
import { HeroSection } from '@/components/homepage/HeroSection';
import { CategoriesSection } from '@/components/homepage/CategoriesSection';
import { FeaturedProducts } from '@/components/homepage/FeaturedProducts';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Promotional Banner */}
      <PromotionalBanner />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Categories Section */}
      <CategoriesSection />
      
      {/* Featured Products */}
      <FeaturedProducts />
    </div>
  );
}