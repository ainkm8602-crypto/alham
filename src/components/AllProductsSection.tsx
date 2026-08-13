import React, { useState } from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface AllProductsSectionProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  config?: any;
}

export const AllProductsSection: React.FC<AllProductsSectionProps> = ({ products, onSelectProduct, config }) => {
  if (!config?.enabled) return null;

  const [filter, setFilter] = useState('All');
  
  let displayProducts = products.filter(p => p.isAllProducts !== false && p.status !== 'archived');
  if (filter !== 'All') {
    displayProducts = displayProducts.filter(p => p.category === filter);
  }
  
  // Sorting would go here based on config.sortOrder
  
  const displayedProducts = displayProducts.slice(0, 100); // Or limit based on config

  return (
    <section className="py-16 bg-[#F7F2E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-serif text-3xl font-light text-[#29231F] mb-8 text-center">All Products</h2>
        <div className={`grid grid-cols-2 lg:grid-cols-${config?.productsPerRow || 4} gap-4 md:gap-8`}>
          {displayedProducts.map(product => (
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
