import React from 'react';
import { ArrowRight, Plus, Check } from 'lucide-react';

import { useCart } from '../context/CartContext';
import { useCms } from '../context/CmsContext';

interface HeroSectionProps {
  onExploreClick: () => void;
  onStoryClick: () => void;
}

const HeroSectionComponent: React.FC<HeroSectionProps> = ({ onExploreClick, onStoryClick }) => {
  const { cart, addToCart } = useCart();
  const { cms, products } = useCms();

  const heroConfig = cms.heroSection || {
    badge: 'Authentic & Handcrafted',
    headlineFirst: 'Goodness,',
    headlineSecond: 'Crafted to Be',
    headlineHighlight: 'Craved.',
    subheading: 'Thoughtfully crafted snacks made with carefully selected ingredients, bringing together indulgent taste and mindful living.',
    primaryCtaText: 'Explore Collection',
    secondaryCtaText: 'Our Story',
    alhamCircleTitle: 'The Alham Circle',
    alhamCircleSubtitle: 'Join 2,400+ for early access & gift guides.',
    card1ProductId: 'p1',
    card2ProductId: 'p2',
    card3ProductId: 'p3'
  };

  const spotlightProducts = products.filter(p => p.showInHeroSpotlight);
  const card1Prod = spotlightProducts[0] || products.find(p => p.id === heroConfig.card1ProductId) || products[0];
  const card2Prod = spotlightProducts[1] || products.find(p => p.id === heroConfig.card2ProductId) || products[1] || products[0];
  const card3Prod = spotlightProducts[2] || products.find(p => p.id === heroConfig.card3ProductId) || products[2] || products[0];

  const c1Qty = card1Prod ? (cart.find(i => i.product.id === card1Prod.id)?.quantity || 0) : 0;
  const c2Qty = card2Prod ? (cart.find(i => i.product.id === card2Prod.id)?.quantity || 0) : 0;
  const c3Qty = card3Prod ? (cart.find(i => i.product.id === card3Prod.id)?.quantity || 0) : 0;

  return (
    <section className="relative bg-[#F7F2E8] py-12 md:py-16 border-b border-[#6F765522]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Text Content - 5 cols on lg */}
          <div
            
            
            
            className="lg:col-span-5 flex flex-col justify-center space-y-6 text-left pr-0 lg:pr-4"
          >
            <div className="space-y-4">
              <span className="inline-block px-3.5 py-1 border border-[#C8A96B] text-[9px] uppercase tracking-[0.2em] text-[#A86445] rounded-full font-semibold">
                {heroConfig.badge}
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.08] tracking-tight font-serif font-light text-[#29231F]">
                {heroConfig.headlineFirst}<br />
                {heroConfig.headlineSecond}<br />
                <span className="italic font-normal text-[#A86445]">{heroConfig.headlineHighlight}</span>
              </h1>

              <p className="text-sm sm:text-base leading-relaxed opacity-80 max-w-md text-[#29231F]">
                {heroConfig.subheading}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={onExploreClick}
                id="hero-explore-cta"
                className="px-8 py-4 bg-[#6F7655] hover:bg-[#29231F] text-[#F7F2E8] text-[11px] uppercase tracking-[0.15em] font-bold rounded-full shadow-lg shadow-[#6f765533] transition-all"
              >
                {heroConfig.primaryCtaText || 'Explore Collection'}
              </button>

              <button
                onClick={onStoryClick}
                id="hero-story-cta"
                className="px-8 py-4 border border-[#6F7655] text-[#6F7655] hover:bg-[#E8DCC8] text-[11px] uppercase tracking-[0.15em] font-bold rounded-full transition-all"
              >
                {heroConfig.secondaryCtaText || 'Our Story'}
              </button>
            </div>

            {/* The Alham Circle Badge Box */}
            <div className="mt-8 p-5 bg-[#E8DCC8] rounded-2xl flex items-center gap-5 border border-[#C8A96B44] shadow-sm">
              <div className="flex -space-x-3">
                <div className="w-9 h-9 rounded-full bg-[#6F7655] border-2 border-[#E8DCC8] flex items-center justify-center text-[10px] text-white font-bold">A</div>
                <div className="w-9 h-9 rounded-full bg-[#A86445] border-2 border-[#E8DCC8] flex items-center justify-center text-[10px] text-white font-bold">H</div>
                <div className="w-9 h-9 rounded-full bg-[#C8A96B] border-2 border-[#E8DCC8] flex items-center justify-center text-[10px] text-white font-bold">M</div>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#29231F]">{heroConfig.alhamCircleTitle}</p>
                <p className="text-[10px] text-[#29231F]/70">{heroConfig.alhamCircleSubtitle}</p>
              </div>
            </div>
          </div>

          {/* Right Immersive Showcase Cards - 7 cols on lg */}
          <div
            
            
            
            className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[420px]"
          >
            {/* Signature Large Card - Dark Gradient */}
            {card1Prod && (
              <div
                className="relative rounded-3xl overflow-hidden group min-h-[360px] flex flex-col justify-end p-6 sm:p-8 shadow-xl"
                style={{ background: 'linear-gradient(135deg, #29231F 0%, #3d3530 100%)' }}
              >
                <img
                  src={card1Prod.images[0]}
                  alt={card1Prod.name}
                  referrerPolicy="no-referrer"
                  fetchPriority="high"
                  decoding="async"
                  width="800"
                  height="600"
                  className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:scale-105 transition-transform duration-700"
                />
                <div
                  className="absolute inset-0 opacity-40 mix-blend-overlay"
                  style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #A86445 0%, transparent 70%)' }}
                />

                <div className="relative z-10 w-full text-left">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#C8A96B] mb-2 block font-semibold">
                    Signature
                  </span>
                  <h3 className="text-2xl sm:text-3xl text-white font-light font-serif mb-2">
                    {card1Prod.name}
                  </h3>
                  <p className="text-[11px] text-[#F7F2E8] opacity-80 line-clamp-2 mb-4 font-sans">
                    {card1Prod.description}
                  </p>
                  <div className="flex justify-between items-center pt-2 border-t border-white/20">
                    <span className="text-white font-bold font-serif text-lg">৳ {card1Prod.price}</span>
                    <button
                      onClick={() => addToCart(card1Prod)}
                      id="hero-add-card1-btn"
                      className={`px-3 py-1.5 rounded-full border border-white/30 text-xs font-bold transition-all flex items-center gap-1 ${
                        c1Qty > 0
                          ? 'bg-[#C8A96B] text-[#29231F] border-[#C8A96B]'
                          : 'bg-white/10 hover:bg-[#6F7655] hover:border-[#6F7655] text-white'
                      }`}
                      title={c1Qty > 0 ? `In Cart (${c1Qty})` : "Add to Cart"}
                    >
                      {c1Qty > 0 ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>In Cart ({c1Qty})</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Grid 2 Rows Cards */}
            <div className="grid grid-rows-2 gap-4">
              {/* Card 2: New Batch - Sage Green */}
              {card2Prod && (
                <div
                  className="relative rounded-3xl overflow-hidden p-6 flex flex-col justify-end text-left shadow-md group"
                  style={{ backgroundColor: '#6F7655' }}
                >
                  <img
                    src={card2Prod.images[0]}
                    alt={card2Prod.name}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                    width="600"
                    height="400"
                    className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#7c8460,_transparent)] opacity-50" />
                  
                  <div className="relative z-10">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-[#F7F2E8] mb-1 font-semibold">
                      New Batch
                    </p>
                    <h3 className="text-xl text-white font-light font-serif">
                      {card2Prod.name}
                    </h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-white/90 text-xs font-serif font-bold">৳ {card2Prod.price}</span>
                      <button
                        onClick={() => addToCart(card2Prod)}
                        id="hero-add-card2-btn"
                        className="text-xs text-white font-medium hover:text-[#C8A96B] flex items-center gap-1"
                      >
                        {c2Qty > 0 ? (
                          <span className="bg-[#C8A96B] text-[#29231F] px-2 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1">
                            <Check className="w-3 h-3" /> In Cart ({c2Qty})
                          </span>
                        ) : (
                          <span className="underline">Add +</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Card 3: Healthy Indulgence / Best Seller - Parchment */}
              {card3Prod && (
                <div
                  className="relative rounded-3xl overflow-hidden p-6 flex flex-col justify-end text-left shadow-md group"
                  style={{ backgroundColor: '#E8DCC8' }}
                >
                  <img
                    src={card3Prod.images[0]}
                    alt={card3Prod.name}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                    width="600"
                    height="400"
                    className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-5 right-5 w-12 h-12 rounded-full border border-[#A86445] flex items-center justify-center text-[#A86445] text-[10px] font-bold uppercase tracking-tighter text-center leading-none bg-[#F7F2E8]/80 backdrop-blur-sm z-10">
                    Best<br />Seller
                  </div>

                  <div className="relative z-10">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-[#A86445] mb-1 font-semibold">
                      Healthy Indulgence
                    </p>
                    <h3 className="text-xl text-[#29231F] font-light font-serif">
                      {card3Prod.name}
                    </h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[#29231F] text-xs font-serif font-bold">৳ {card3Prod.price}</span>
                      <button
                        onClick={() => addToCart(card3Prod)}
                        id="hero-add-card3-btn"
                        className="text-xs text-[#6F7655] font-bold hover:text-[#A86445] flex items-center gap-1"
                      >
                        {c3Qty > 0 ? (
                          <span className="bg-[#6F7655] text-white px-2 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1">
                            <Check className="w-3 h-3 text-[#C8A96B]" /> In Cart ({c3Qty})
                          </span>
                        ) : (
                          <span className="underline">Add +</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export const HeroSection = React.memo(HeroSectionComponent);


