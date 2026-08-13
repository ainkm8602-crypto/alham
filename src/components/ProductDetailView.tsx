import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../types';
import { X, Star, ShoppingBag, Truck, Play, ChevronLeft, ChevronRight, Maximize2, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCms } from '../context/CmsContext';
import { useLanguage } from '../context/LanguageContext';
import { useTracking } from './TrackingProvider';

interface ProductDetailViewProps {
  product: Product | null;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  onClose,
  onSelectProduct
}) => {
  if (!product) return null;

  const { addToCart, quickBuy } = useCart();
  const { trackEvent } = useTracking();
  const { products, reviews } = useCms();
  const { language, t } = useLanguage();

  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'story' | 'ingredients' | 'nutrition' | 'reviews' | 'video'>('story');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFullscreenZoom, setIsFullscreenZoom] = useState(false);

  useEffect(() => {
    if (product && trackEvent) {
      trackEvent('view_item', {
        product: product,
        currency: 'BDT',
        value: Number(product.price || 0),
        content_ids: [product.sku || product.id],
        content_name: product.name,
        content_type: 'product',
        items: [{
          item_id: product.sku || product.id,
          item_name: product.name,
          price: Number(product.price || 0),
          quantity: 1,
          item_category: product.category || 'Confectionery',
          item_variant: product.weight || ''
        }]
      });
    }
  }, [product?.id]);

  const [quantity, setQuantity] = useState(1);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  useEffect(() => {
    setSelectedImageIndex(0);
    setActiveTab('story');
    setQuantity(1);
    setAspectRatio(null);
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [product.id]);

  const images = product.images && product.images.length > 0
    ? product.images
    : ['/src/assets/images/snickers_bar_cut_1784995506640.jpg'];

  const selectedImage = images[selectedImageIndex] || images[0];

  useEffect(() => {
    if (!selectedImage) return;
    const img = new Image();
    img.src = selectedImage;
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setAspectRatio(img.naturalWidth / img.naturalHeight);
      }
    };
  }, [selectedImage]);

  const productReviews = (reviews || []).filter(r => r.productId === product.id);

  // Compute Related Products
  let relatedProducts: Product[] = [];
  if (product.relatedProductsMode === 'manual' && product.relatedProductIds && product.relatedProductIds.length > 0) {
    relatedProducts = products.filter(p => p.id !== product.id && product.relatedProductIds?.includes(p.id));
  }
  
  if (relatedProducts.length === 0) {
    // Automatic fallback: match same category or collection
    relatedProducts = products.filter(
      p => p.id !== product.id && (p.category === product.category || (product.collection && p.collection === product.collection))
    );
    if (relatedProducts.length === 0) {
      relatedProducts = products.filter(p => p.id !== product.id);
    }
  }

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
      <div
        ref={containerRef}
        className="space-y-8 sm:space-y-12 scroll-smooth"
      >
        
        {/* Back Button */}
        <button
          onClick={onClose}
          className="flex items-center space-x-2 text-[#29231F]/70 hover:text-[#29231F] font-serif transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{t('Back to Previous', 'ফিরে যান')}</span>
        </button>

        {/* Upper Section: Gallery & Purchase Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start clear-both">
          
          {/* Left: Product Image Gallery & Video */}
          <div className="lg:col-span-7 space-y-4">
            <div
              className="w-full rounded-2xl overflow-hidden bg-[#E8DCC8] border border-[#C8A96B]/30 relative shadow-inner group flex items-center justify-center min-h-[220px] max-h-[70vh] sm:max-h-[580px] transition-all duration-300 ease-in-out"
              style={{
                aspectRatio: aspectRatio ? `${aspectRatio}` : '16/11',
                transition: 'aspect-ratio 0.35s cubic-bezier(0.4, 0, 0.2, 1), max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <img
                src={selectedImage}
                alt={t(product.name, product.nameBn)}
                referrerPolicy="no-referrer"
                onLoad={(e) => {
                  const { naturalWidth, naturalHeight } = e.currentTarget;
                  if (naturalWidth && naturalHeight) {
                    setAspectRatio(naturalWidth / naturalHeight);
                  }
                }}
                className="w-full h-full object-contain transition-all duration-300"
              />

              <div className="absolute top-4 left-4 bg-[#6F7655] text-white text-[10px] sm:text-xs font-bold uppercase font-mono px-3 py-1 rounded-full shadow-sm z-10">
                {t(product.category, product.categoryBn)}
              </div>

              {/* Fullscreen Zoom Trigger */}
              <button
                onClick={() => setIsFullscreenZoom(true)}
                className="absolute top-4 right-4 p-2 bg-[#29231F]/60 text-white rounded-xl hover:bg-[#29231F] transition-all backdrop-blur-sm shadow-md z-10"
                title="Fullscreen Image View"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Previous / Next Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-[#29231F]/50 hover:bg-[#29231F] text-white rounded-full transition-all backdrop-blur-sm opacity-80 group-hover:opacity-100 z-10"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-[#29231F]/50 hover:bg-[#29231F] text-white rounded-full transition-all backdrop-blur-sm opacity-80 group-hover:opacity-100 z-10"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Gallery Thumbnails */}
            <div className="flex items-center space-x-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => { setSelectedImageIndex(idx); setActiveTab('story'); }}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all bg-[#E8DCC8] flex items-center justify-center ${
                    selectedImageIndex === idx ? 'border-[#A86445] scale-105 shadow-md ring-2 ring-[#A86445]/30' : 'border-[#C8A96B]/30 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} referrerPolicy="no-referrer" className="w-full h-full object-contain p-1" />
                </button>
              ))}

              {/* Video Thumbnail (Only rendered if videoUrl exists) */}
              {product.videoUrl && (
                <button
                  onClick={() => setActiveTab('video')}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#29231F] text-[#C8A96B] flex items-center justify-center shrink-0 border-2 transition-all ${
                    activeTab === 'video' ? 'border-[#C8A96B] scale-105 shadow-md' : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                  title={t('Watch Product Video', 'পণ্য ভিডিও দেখুন')}
                >
                  <Play className="w-7 h-7 fill-[#C8A96B]" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Info & Primary Controls */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div>
              <div className="flex items-center flex-wrap gap-2 text-xs text-[#29231F]/70 mb-2">
                <span className="font-semibold text-[#A86445] bg-[#A86445]/10 px-2.5 py-0.5 rounded-full">
                  {t(product.weight, product.weightBn)}
                </span>
                {product.sku && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-[11px] text-[#29231F]/60">SKU: {product.sku}</span>
                  </>
                )}
                <span>•</span>
                <span className="flex items-center gap-1 text-[#6F7655] font-semibold">
                  <Star className="w-4 h-4 text-[#C8A96B] fill-[#C8A96B]" />
                  {product.rating} ({product.reviewCount} {t('reviews', 'রিভিউ')})
                </span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#29231F] leading-snug">
                {t(product.name, product.nameBn)}
              </h1>

              <p className="text-sm text-[#A86445] font-medium mt-1.5 italic">
                {t(product.subtitle, product.subtitleBn)}
              </p>
            </div>

            {/* Price Box */}
            <div className="p-5 bg-[#E8DCC8]/50 rounded-2xl border border-[#C8A96B]/30 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-xs text-[#29231F]/60 block font-medium">
                  {t('Fresh Artisanal Price', 'দাম (বিডিটি)')}
                </span>
                <div className="flex items-baseline space-x-3 mt-0.5">
                  <span className="font-serif text-3xl sm:text-4xl font-bold text-[#29231F]">
                    ৳{product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-base text-[#29231F]/40 line-through font-serif">
                      ৳{product.originalPrice}
                    </span>
                  )}
                </div>
              </div>

              <span className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-xs ${
                product.stock > 0 ? 'bg-[#6F7655]/20 text-[#6F7655] border border-[#6F7655]/30' : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {product.stock > 0
                  ? (language === 'bn' ? `স্টকে আছে (${product.stock} টি)` : `In Stock (${product.stock} left)`)
                  : (language === 'bn' ? 'স্টক শেষ' : 'Out of Stock')}
              </span>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center justify-between sm:justify-start sm:space-x-6 p-3 bg-[#E8DCC8]/30 rounded-2xl border border-[#C8A96B]/20">
              <span className="text-xs font-bold uppercase tracking-wider text-[#29231F]">{t('Quantity:', 'পরিমাণ:')}</span>
              <div className="flex items-center border border-[#C8A96B]/40 rounded-xl bg-[#F7F2E8] shadow-xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-1.5 text-base font-bold text-[#29231F] hover:bg-[#E8DCC8] rounded-l-xl transition-colors"
                >
                  -
                </button>
                <span className="px-5 py-1.5 text-sm font-bold text-[#29231F] font-mono">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-1.5 text-base font-bold text-[#29231F] hover:bg-[#E8DCC8] rounded-r-xl transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => { addToCart(product, quantity, product.weight, false); }}
                className="py-3.5 px-4 bg-[#6F7655] hover:bg-[#29231F] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t('Add to Cart', 'কার্টে যোগ করুন')}</span>
              </button>

              <button
                onClick={() => { quickBuy(product, quantity, product.weight); onClose(); }}
                className="py-3.5 px-4 bg-[#A86445] hover:bg-[#29231F] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-2xl transition-all shadow-md hover:shadow-lg text-center"
              >
                {t('Buy Now', 'এখনই কিনুন')}
              </button>
            </div>

            {/* Shipping & Delivery Snippet */}
            <div className="text-xs text-[#29231F]/80 space-y-1.5 p-4 bg-[#E8DCC8]/20 rounded-2xl border border-[#C8A96B]/20">
              <p className="flex items-center gap-2 font-semibold text-[#6F7655]">
                <Truck className="w-4 h-4 text-[#6F7655]" />
                <span>{t(product.deliveryInfo, product.deliveryInfoBn)}</span>
              </p>
              <p className="text-[11px] text-[#29231F]/70 leading-relaxed">
                <span className="font-medium text-[#29231F]">{t('Shelf Life:', 'মেয়াদকাল:')}</span> {t(product.shelfLife, product.shelfLifeBn)} | <span className="font-medium text-[#29231F]">{t('Storage:', 'সংরক্ষণ:')}</span> {t(product.storageInstructions, product.storageInstructionsBn)}
              </p>
            </div>

          </div>
        </div>

        {/* Lower Details Tabs */}
        <div className="border-t border-[#C8A96B]/30 pt-8 space-y-6">
          <div className="flex items-center space-x-6 border-b border-[#C8A96B]/30 pb-3 text-xs sm:text-sm font-medium overflow-x-auto">
            <button
              onClick={() => setActiveTab('story')}
              className={`pb-2 transition-all whitespace-nowrap ${
                activeTab === 'story'
                  ? 'text-[#A86445] font-bold border-b-2 border-[#A86445]'
                  : 'text-[#29231F]/60 hover:text-[#29231F]'
              }`}
            >
              {t('Product Story & Profile', 'গল্প ও স্বাদ প্রোফাইল')}
            </button>
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`pb-2 transition-all whitespace-nowrap ${
                activeTab === 'ingredients'
                  ? 'text-[#A86445] font-bold border-b-2 border-[#A86445]'
                  : 'text-[#29231F]/60 hover:text-[#29231F]'
              }`}
            >
              {t('Ingredients & Allergens', 'উপাদান ও এলার্জি নির্দেশ')}
            </button>
            <button
              onClick={() => setActiveTab('nutrition')}
              className={`pb-2 transition-all whitespace-nowrap ${
                activeTab === 'nutrition'
                  ? 'text-[#A86445] font-bold border-b-2 border-[#A86445]'
                  : 'text-[#29231F]/60 hover:text-[#29231F]'
              }`}
            >
              {t('Nutrition Facts', 'পুষ্টি উপাদান')}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-2 transition-all whitespace-nowrap ${
                activeTab === 'reviews'
                  ? 'text-[#A86445] font-bold border-b-2 border-[#A86445]'
                  : 'text-[#29231F]/60 hover:text-[#29231F]'
              }`}
            >
              {t(`Reviews (${productReviews.length})`, `রিভিউ (${productReviews.length})`)}
            </button>

            {/* Video Tab Title (Only shown if video exists) */}
            {product.videoUrl && (
              <button
                onClick={() => setActiveTab('video')}
                className={`pb-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'video'
                    ? 'text-[#A86445] font-bold border-b-2 border-[#A86445]'
                    : 'text-[#29231F]/60 hover:text-[#29231F]'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{t('Crafting Video', 'ভিডিও')}</span>
              </button>
            )}
          </div>

          {/* Tab Contents */}
          {activeTab === 'story' && (
            <div className="space-y-4 text-xs sm:text-sm text-[#29231F]/80 leading-relaxed text-left">
              <p>{t(product.description, product.descriptionBn)}</p>
              {product.story && (
                <p className="p-5 bg-[#E8DCC8]/40 rounded-2xl border border-[#C8A96B]/20 font-serif italic text-[#29231F] text-sm sm:text-base leading-relaxed">
                  "{t(product.story, product.storyBn)}"
                </p>
              )}
            </div>
          )}

          {activeTab === 'ingredients' && (
            <div className="space-y-6 text-xs sm:text-sm text-left">
              <div>
                <h4 className="font-semibold text-[#6F7655] mb-2.5 uppercase tracking-wider">{t('Ingredients:', 'উপাদানসমূহ:')}</h4>
                <div className="flex flex-wrap gap-2">
                  {((language === 'bn' && product.ingredientsBn && product.ingredientsBn.length > 0)
                    ? product.ingredientsBn
                    : product.ingredients
                  ).map((ing, i) => (
                    <span key={i} className="bg-[#E8DCC8] border border-[#C8A96B]/30 text-[#29231F] px-3 py-1.5 rounded-xl font-medium shadow-2xs">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-[#A86445] mb-1.5 uppercase tracking-wider">{t('Allergen Notice:', 'এলার্জেন সতর্কতা:')}</h4>
                <p className="text-[#29231F]/80 bg-[#E8DCC8]/20 p-3 rounded-xl border border-[#C8A96B]/20">
                  {((language === 'bn' && product.allergensBn && product.allergensBn.length > 0)
                    ? product.allergensBn
                    : product.allergens
                  ).join(', ')}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'nutrition' && (
            <div className="p-5 bg-[#E8DCC8]/40 border border-[#C8A96B]/30 rounded-2xl max-w-md text-xs sm:text-sm space-y-2.5 text-left shadow-xs">
              <div className="flex justify-between border-b border-[#C8A96B]/20 pb-1.5">
                <span>{t('Calories', 'ক্যালোরি')}</span>
                <span className="font-bold font-mono">{product.nutrition?.calories || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-[#C8A96B]/20 pb-1.5">
                <span>{t('Protein', 'প্রোটিন')}</span>
                <span className="font-bold font-mono">{product.nutrition?.protein || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-[#C8A96B]/20 pb-1.5">
                <span>{t('Carbohydrates', 'কার্বোহাইড্রেট')}</span>
                <span className="font-bold font-mono">{product.nutrition?.carbs || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-[#C8A96B]/20 pb-1.5">
                <span>{t('Healthy Fats', 'হেলদি ফ্যাট')}</span>
                <span className="font-bold font-mono">{product.nutrition?.fat || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('Dietary Fiber', 'ফাইবার')}</span>
                <span className="font-bold font-mono">{product.nutrition?.fiber || 'N/A'}</span>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-3 text-left">
              {productReviews.length > 0 ? (
                productReviews.map(r => (
                  <div key={r.id} className="p-4 bg-[#E8DCC8]/40 border border-[#C8A96B]/30 rounded-2xl text-xs sm:text-sm space-y-1.5">
                    <div className="flex justify-between font-semibold">
                      <span className="text-[#29231F]">{r.userName}</span>
                      <span className="text-[#C8A96B] font-bold">★ {r.rating}.0</span>
                    </div>
                    <p className="text-[#29231F]/80 italic font-serif">"{r.comment}"</p>
                  </div>
                ))
              ) : (
                <p className="text-xs sm:text-sm text-[#29231F]/60 italic p-4 bg-[#E8DCC8]/20 rounded-2xl border border-[#C8A96B]/20">
                  {t('No reviews yet for this fresh product batch.', 'এই পণ্যের জন্য এখনও কোনো রিভিউ নেই।')}
                </p>
              )}
            </div>
          )}

          {/* Video tab player */}
          {activeTab === 'video' && product.videoUrl && (
            <div className="aspect-[16/9] max-w-3xl rounded-2xl overflow-hidden bg-black shadow-xl">
              <video src={product.videoUrl} controls autoPlay className="w-full h-full object-cover" />
            </div>
          )}

        </div>

        {/* RELATED PRODUCTS SECTION */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-[#C8A96B]/30 pt-8 space-y-6 text-left">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#A86445] bg-[#A86445]/10 px-2.5 py-1 rounded-full font-semibold">
                {t('Recommended Pairings', 'অনুমোদিত পণ্য')}
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#29231F] mt-2">
                {t('You May Also Like', 'আপনার পছন্দ হতে পারে')}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.slice(0, 4).map(relProd => (
                <div
                  key={relProd.id}
                  onClick={() => onSelectProduct(relProd)}
                  className="bg-[#E8DCC8]/30 border border-[#C8A96B]/30 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-[#6F7655] hover:bg-[#E8DCC8]/60 hover:shadow-xl transition-all duration-300 group cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#E8DCC8] relative">
                      <img
                        src={relProd.images?.[0] || '/src/assets/images/snickers_bar_cut_1784995506640.jpg'}
                        alt={t(relProd.name, relProd.nameBn)}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-[#29231F]/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-[#F7F2E8] text-[#29231F] text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1 border border-[#C8A96B]/30">
                          <Eye className="w-3 h-3 text-[#6F7655]" />
                          {t('View Details', 'বিস্তারিত দেখুন')}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-base text-[#29231F] group-hover:text-[#A86445] transition-colors line-clamp-1">
                        {t(relProd.name, relProd.nameBn)}
                      </h4>
                      <p className="text-xs text-[#A86445] line-clamp-1 italic mt-0.5">
                        {t(relProd.subtitle, relProd.subtitleBn)}
                      </p>
                      <div className="flex items-baseline space-x-2 mt-2">
                        <span className="font-serif font-bold text-base text-[#29231F]">
                          ৳{relProd.price}
                        </span>
                        {relProd.originalPrice && (
                          <span className="text-xs text-[#29231F]/40 line-through">
                            ৳{relProd.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-[#C8A96B]/20">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProduct(relProd);
                      }}
                      className="flex-1 py-2 bg-[#E8DCC8] hover:bg-[#29231F] hover:text-white text-[#29231F] text-xs font-bold rounded-xl transition-all text-center border border-[#C8A96B]/30"
                    >
                      {t('View Details', 'বিস্তারিত')}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(relProd, 1, relProd.weight, false);
                      }}
                      className="p-2 bg-[#6F7655] hover:bg-[#A86445] text-white rounded-xl transition-colors shadow-sm shrink-0"
                      title={t('Add to Cart', 'কার্টে যোগ করুন')}
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* FULLSCREEN IMAGE ZOOM OVERLAY */}
      {isFullscreenZoom && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4">
          <button
            onClick={() => setIsFullscreenZoom(false)}
            className="absolute top-6 right-6 p-3 bg-white/20 text-white hover:bg-white/40 rounded-full transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={selectedImage}
            alt="Fullscreen zoom"
            referrerPolicy="no-referrer"
            className="max-w-full max-h-[88vh] object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
};
