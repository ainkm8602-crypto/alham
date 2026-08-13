import React, { useState } from 'react';
import { IngredientInfo } from '../types';
import { Sparkles, Info, X, MapPin, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCms } from '../context/CmsContext';

interface IngredientStoryProps {
  ingredients?: IngredientInfo[];
  onNavigate?: (view: string) => void;
}

const IngredientStoryComponent: React.FC<IngredientStoryProps> = ({ ingredients: propsIngredients, onNavigate }) => {
  const { ingredients: cmsIngredients } = useCms();
  const ingredients = propsIngredients && propsIngredients.length > 0 ? propsIngredients : cmsIngredients;
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientInfo | null>(null);

  const handleCtaClick = (e: React.MouseEvent, ctaLink?: string, openInNewTab?: boolean) => {
    e.stopPropagation();
    if (openInNewTab && ctaLink) {
      window.open(ctaLink, '_blank', 'noopener,noreferrer');
      return;
    }
    if (ctaLink && ctaLink.startsWith('http')) {
      window.location.href = ctaLink;
      return;
    }
    if (onNavigate) {
      onNavigate('collection');
    } else {
      window.history.pushState({ view: 'collection' }, '', '/collection');
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-20 bg-[#F7F2E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-semibold tracking-widest text-[#A86445] uppercase">
            Nature's Pantry
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#29231F]">
            Simple Ingredients. Thoughtful Craft.
          </h2>
          <p className="text-sm text-[#29231F]/70 font-sans">
            We source purest non-GMO dates, wild honey, and whole roasted nuts directly from origin farms.
          </p>
        </div>

        {/* Ingredient Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ingredients.map((ing) => {
            const isCtaEnabled = ing.ctaEnabled !== false;
            const ctaText = ing.ctaText || 'Shop Collection';
            const ctaLink = ing.ctaLink || '/collection';

            return (
              <div
                key={ing.id}
                id={`ing-card-${ing.id}`}
                className="bg-[#F7F2E8] border border-[#E8DCC8] rounded-2xl p-5 hover:border-[#6F7655] hover:shadow-lg transition-all duration-300 flex flex-col justify-between group space-y-4"
              >
                <div className="space-y-4">
                  {/* Clickable Image -> Redirects to Shop Page */}
                  <div
                    onClick={(e) => handleCtaClick(e, ctaLink, ing.openInNewTab)}
                    className="aspect-[4/3] rounded-xl overflow-hidden bg-[#E8DCC8] cursor-pointer relative shadow-sm group-hover:shadow-md transition-shadow"
                    title="Click to view shop products"
                  >
                    <img
                      src={ing.image}
                      alt={ing.name}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      width="400"
                      height="300"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-[#29231F]/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-[#29231F]/80 text-[#F7F2E8] text-[11px] font-medium px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1.5 shadow-lg">
                        <ShoppingBag className="w-3 h-3 text-[#C8A96B]" />
                        <span>Shop Products</span>
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif font-bold text-lg text-[#29231F] group-hover:text-[#A86445] transition-colors">
                        {ing.name}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setSelectedIngredient(ing)}
                        className="p-1 hover:bg-[#E8DCC8] rounded-full text-[#6F7655] transition-colors"
                        title="Read Sourcing Story"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-[#6F7655] font-medium flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      <span>{ing.origin}</span>
                    </p>
                  </div>

                  <p className="text-xs text-[#29231F]/75 line-clamp-2 leading-relaxed">
                    {ing.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E8DCC8] space-y-2">
                  {/* Shop CTA Button */}
                  {isCtaEnabled && (
                    <button
                      type="button"
                      onClick={(e) => handleCtaClick(e, ctaLink, ing.openInNewTab)}
                      className="w-full py-2 px-3 bg-[#6F7655] hover:bg-[#29231F] text-[#F7F2E8] text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 shadow-sm hover:shadow group/btn"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-[#C8A96B]" />
                      <span>{ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  )}

                  {/* Explore Sourcing Link */}
                  <button
                    type="button"
                    onClick={() => setSelectedIngredient(ing)}
                    className="w-full py-1 text-center text-[11px] font-semibold text-[#A86445] hover:text-[#29231F] transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Read Origin Story</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Popover for Selected Ingredient */}
        {selectedIngredient && (
          <div className="fixed inset-0 z-50 bg-[#29231F]/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#F7F2E8] rounded-2xl border border-[#E8DCC8] max-w-lg w-full p-6 sm:p-8 relative shadow-2xl space-y-6">
              <button
                onClick={() => setSelectedIngredient(null)}
                className="absolute top-4 right-4 p-2 text-[#29231F] hover:bg-[#E8DCC8] rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="aspect-[16/9] rounded-xl overflow-hidden bg-[#E8DCC8]">
                <img
                  src={selectedIngredient.image}
                  alt={selectedIngredient.name}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                  width="600"
                  height="350"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-3 text-left">
                <span className="text-xs font-mono uppercase tracking-widest text-[#A86445] bg-[#A86445]/10 px-2.5 py-1 rounded">
                  {selectedIngredient.origin}
                </span>

                <h3 className="font-serif text-2xl font-bold text-[#29231F]">
                  {selectedIngredient.name}
                </h3>

                <p className="text-sm text-[#29231F]/80 leading-relaxed font-sans">
                  {selectedIngredient.description}
                </p>

                <div className="p-4 bg-[#E8DCC8]/50 rounded-xl space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-[#6F7655]">Nutritional Benefit: </span>
                    <span className="text-[#29231F]">{selectedIngredient.benefit}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#A86445]">Flavor Profile: </span>
                    <span className="text-[#29231F]">{selectedIngredient.flavorNotes}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  onClick={(e) => {
                    setSelectedIngredient(null);
                    handleCtaClick(e, selectedIngredient.ctaLink, selectedIngredient.openInNewTab);
                  }}
                  className="px-5 py-2.5 bg-[#6F7655] text-white rounded-xl text-xs font-bold hover:bg-[#29231F] transition-colors flex items-center gap-1.5 shadow"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-[#C8A96B]" />
                  <span>Shop Products With {selectedIngredient.name}</span>
                </button>
                <button
                  onClick={() => setSelectedIngredient(null)}
                  className="px-4 py-2.5 bg-[#E8DCC8] text-[#29231F] rounded-xl text-xs font-semibold hover:bg-[#29231F] hover:text-white transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export const IngredientStory = React.memo(IngredientStoryComponent);
