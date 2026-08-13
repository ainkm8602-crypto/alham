import React from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface FeaturedShowcaseProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  config?: any;
}

export const FeaturedShowcase: React.FC<FeaturedShowcaseProps> = ({ products, onSelectProduct, config }) => {
  const mindfulProducts = products.filter(p => p.showInMindfulSection);
  const featuredList = mindfulProducts.length > 0
    ? mindfulProducts.slice(0, config?.displayCount || 4)
    : products.filter(p => p.isFeatured).slice(0, config?.displayCount || 4);

  return (
    <section className="py-16 md:py-24 bg-[#F7F2E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="inline-block px-3 py-1 border border-[#C8A96B] text-[9px] uppercase tracking-[0.2em] text-[#A86445] rounded-full font-semibold">
            Signature Creations
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#29231F]">
            The Art of <span className="italic font-normal text-[#A86445]">Mindful Indulgence</span>
          </h2>
          <p className="text-sm sm:text-base text-[#29231F]/70 font-sans">
            Every bite is crafted by hand in Dhaka using Saudi Medjool dates, single-origin cocoa, and slow-roasted nuts.
          </p>
        </div>

        {/* Featured Products Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {featuredList.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
