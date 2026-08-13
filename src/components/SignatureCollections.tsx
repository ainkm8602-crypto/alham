import React, { useState } from 'react';
import { Product } from '../types';
import { Clock } from 'lucide-react';
import { ProductCard } from './ProductCard';

interface SignatureCollectionsProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

const SignatureCollectionsComponent: React.FC<SignatureCollectionsProps> = ({
  products,
  onSelectProduct
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Date Collection', 'Indulgent', 'Gift Boxes'];

  const signatureBase = products.filter(p => p.showInSignatureSection !== false);
  const filteredProducts = activeCategory === 'All'
    ? signatureBase
    : signatureBase.filter(p => p.category === activeCategory);

  return (
    <section id="collection-section" className="py-20 bg-[#F7F2E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-[#6F765522]">
          <div>
            <span className="inline-block px-3 py-1 border border-[#C8A96B] text-[9px] uppercase tracking-[0.2em] text-[#A86445] rounded-full font-semibold">
              Curated Offerings
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#29231F] mt-2">
              Signature <span className="italic font-normal text-[#A86445]">Collections</span>
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                id={`cat-filter-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                className={`px-5 py-2.5 rounded-full text-[10px] uppercase tracking-[0.15em] font-bold transition-all ${
                  activeCategory === cat
                    ? 'bg-[#6F7655] text-[#F7F2E8] shadow-md shadow-[#6f765533]'
                    : 'bg-[#E8DCC8]/70 text-[#29231F] hover:bg-[#E8DCC8]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Magazine Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectProduct={onSelectProduct}
            />
          ))}

          {/* Coming Soon Teaser Box */}
          <div className="bg-[#E8DCC8]/40 border-2 border-dashed border-[#C8A96B]/50 rounded-3xl p-4 md:p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-2 md:p-3 bg-[#C8A96B]/20 text-[#A86445] rounded-full">
              <Clock className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h3 className="font-serif text-sm md:text-xl font-light text-[#29231F]">
              Coming Soon: <span className="italic font-normal text-[#A86445]">Saffron Pistachio Halwa</span>
            </h3>
            <p className="text-[10px] md:text-xs text-[#29231F]/70 max-w-xs">
              Our master confectioners in Dhaka are perfecting upcoming seasonal date creations.
            </p>
            <span className="text-[9px] md:text-[10px] font-semibold tracking-wider text-[#A86445] bg-[#A86445]/10 px-3 py-1 rounded-full uppercase">
              Autumn Release
            </span>
          </div>

        </div>

      </div>
    </section>
  );
};

export const SignatureCollections = React.memo(SignatureCollectionsComponent);
