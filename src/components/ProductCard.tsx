import React from 'react';
import { Product } from '../types';
import { ShoppingBag, Star, Eye, Plus, Minus, Check } from 'lucide-react';

import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  variant?: 'standard' | 'compact';
}

const ProductCardComponent: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  variant = 'standard'
}) => {
  const { cart, addToCart, updateQuantity } = useCart();
  const { t } = useLanguage();

  const cartItem = cart.find(item => item.product.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const handleCardClick = (e: React.MouseEvent) => {
    onSelectProduct(product);
  };

  return (
    <div
      className="bg-[#F7F2E8] border border-[#C8A96B44] rounded-xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative h-full"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '320px' }}
    >
      <div>
        {/* Top Image Section - Entire image area clickable */}
        <div
          onClick={handleCardClick}
          className="relative aspect-[4/5] sm:aspect-[4/3] w-full h-64 sm:h-auto bg-[#E8DCC8] overflow-hidden cursor-pointer group/img shrink-0"
          title={t('Click to view product details', 'বিস্তারিত দেখতে ক্লিক করুন')}
        >
          <img
            src={product.images && product.images.length > 0 ? product.images[0] : '/src/assets/images/snickers_bar_cut_1784995506640.jpg'}
            alt={t(product.name, product.nameBn)}
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
            width="400"
            height="300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Category Pill */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-[#29231F]/85 sm:backdrop-blur-md text-[#F7F2E8] text-[9px] sm:text-[10px] uppercase tracking-[0.08em] sm:tracking-[0.15em] px-2 py-0.5 sm:px-3 sm:py-1 rounded-full font-semibold pointer-events-none truncate max-w-[65%]">
            {t(product.category, product.categoryBn)}
          </div>

          {/* Rating Badge */}
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-[#F7F2E8]/95 sm:backdrop-blur-md text-[#29231F] text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-semibold flex items-center space-x-1 shadow-sm border border-[#E8DCC8] pointer-events-none">
            <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#C8A96B] fill-[#C8A96B]" />
            <span>{product.rating}</span>
          </div>

          {/* Clean Quick View / View Details Hover Badge */}
          <div className="absolute inset-0 bg-[#29231F]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <span className="bg-[#F7F2E8]/95 text-[#29231F] text-[10px] uppercase font-bold tracking-widest px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5 sm:backdrop-blur-sm border border-[#C8A96B]/30">
              <Eye className="w-3.5 h-3.5 text-[#6F7655]" />
              {t('View Details', 'বিস্তারিত দেখুন')}
            </span>
          </div>
        </div>

        {/* Product Details Info */}
        <div
          onClick={handleCardClick}
          className="p-2.5 sm:p-5 space-y-1 sm:space-y-2.5 cursor-pointer text-left"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] sm:text-[10px] text-[#A86445] font-bold uppercase tracking-wider shrink-0">
              {t(product.weight, product.weightBn)}
            </span>
            {product.subtitle && (
              <span className="text-[9.5px] sm:text-[11px] text-[#29231F]/60 italic line-clamp-1">
                {t(product.subtitle, product.subtitleBn)}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-serif text-sm sm:text-xl font-bold text-[#29231F] group-hover:text-[#A86445] transition-colors leading-tight sm:leading-snug line-clamp-2 sm:line-clamp-none">
            {t(product.name, product.nameBn)}
          </h3>

          <p className="text-[11px] sm:text-xs text-[#29231F]/70 line-clamp-1 sm:line-clamp-2 leading-tight sm:leading-relaxed">
            {t(product.description, product.descriptionBn)}
          </p>

          {/* Taste Profile Chips */}
          {product.tasteProfile && (
            <div className="hidden sm:flex pt-1 flex-wrap gap-1.5 text-[10px] uppercase tracking-wider">
              <span className="bg-[#E8DCC8] text-[#29231F]/80 px-2.5 py-0.5 rounded-full font-medium">
                {t('Sweetness', 'মিষ্টতা')}: {product.tasteProfile.sweetness}/5
              </span>
              <span className="bg-[#E8DCC8] text-[#29231F]/80 px-2.5 py-0.5 rounded-full font-medium">
                {t('Richness', 'ঘনত্ব')}: {product.tasteProfile.richness}/5
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Area: Price & Add to Cart Controls */}
      <div className="p-2.5 sm:p-5 pt-1.5 sm:pt-3 border-t border-[#E8DCC8]/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 bg-[#F7F2E8] mt-auto">
        {/* Price Box */}
        <div className="text-left mb-0.5 sm:mb-0">
          <span className="text-[8px] sm:text-[10px] uppercase tracking-wider text-[#29231F]/50 block leading-none mb-0.5 sm:mb-1">
            {t('Price', 'মূল্য')}
          </span>
          <div className="flex items-baseline space-x-1 sm:space-x-1.5">
            <span className="font-serif text-sm sm:text-lg font-bold text-[#29231F]">
              ৳{product.price}
            </span>
            {product.originalPrice && (
              <span className="text-[10px] sm:text-xs text-[#29231F]/40 line-through font-mono">
                ৳{product.originalPrice}
              </span>
            )}
          </div>
        </div>

        {/* Cart Action Area */}
        {quantityInCart === 0 ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, 1, product.weight, false);
            }}
            id={`add-to-cart-${product.id}`}
            className="px-3 sm:px-4 py-2 sm:py-2.5 bg-[#6F7655] hover:bg-[#29231F] active:scale-95 text-[#F7F2E8] font-bold text-[10px] sm:text-xs uppercase tracking-wider rounded-full transition-all duration-200 flex items-center justify-center gap-1 sm:gap-1.5 shadow-sm hover:shadow-md w-full sm:w-auto"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#C8A96B]" />
            <span className="whitespace-nowrap">{t('Add to Cart', 'কার্টে যোগ')}</span>
          </button>
        ) : (
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-between bg-[#6F7655] text-white rounded-full p-1 border border-[#6F7655] shadow-sm w-full sm:w-auto"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateQuantity(product.id, quantityInCart - 1);
              }}
              id={`dec-qty-${product.id}`}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 hover:bg-white/35 text-white font-bold flex items-center justify-center transition-colors"
              title={t('Decrease quantity', 'পরিমাণ কমান')}
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
            </button>

            <div className="px-1.5 sm:px-2.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 text-white select-none whitespace-nowrap">
              <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#C8A96B] stroke-[3]" />
              <span>{quantityInCart}</span>
              <span className="hidden sm:inline">
                {t('In Cart', 'কার্টে')}
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                updateQuantity(product.id, quantityInCart + 1);
              }}
              id={`inc-qty-${product.id}`}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 hover:bg-white/35 text-white font-bold flex items-center justify-center transition-colors"
              title={t('Increase quantity', 'পরিমাণ বাড়ান')}
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const ProductCard = React.memo(ProductCardComponent);

