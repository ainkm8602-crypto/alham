import React from 'react';
import { Sparkles, Sun, Coffee, Gift, Smile, Heart, Leaf, Utensils, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCms } from '../context/CmsContext';

interface WellnessLifestyleProps {
  onNavigate?: (view: string) => void;
}

const WellnessLifestyleComponent: React.FC<WellnessLifestyleProps> = ({ onNavigate }) => {
  const { cms } = useCms();
  const well = cms.wellnessLifestyleSection || {
    badge: 'Mindful Living',
    headingMain: 'Elevated Snacking for',
    headingHighlight: 'Modern Dhaka',
    description: 'Nourishing your day through every meeting, workout, and family gathering.',
    cards: [
      { id: 'w1', title: 'The 3 PM Focus Fuel', description: 'Sustained natural energy without glucose crashes during long desk hours.', image: '/src/assets/images/snickers_bar_cut_1784995506640.jpg', tag: 'Workplace', icon: 'Sun', enabled: true, ctaEnabled: true, ctaText: 'Shop Collection', ctaLink: '/collection' },
      { id: 'w2', title: 'Post-Workout Recovery', description: 'High-protein dates and slow-roasted nuts for natural muscle nourishment.', image: '/src/assets/images/fudge_date_balls_178499558856.jpg', tag: 'Fitness', icon: 'Coffee', enabled: true, ctaEnabled: true, ctaText: 'Explore Products', ctaLink: '/collection' },
      { id: 'w3', title: 'Festive Hospitality', description: 'Traditional Bengali warmth reimagined with clean-label elegance.', image: '/src/assets/images/khajur_barfi_1784995525489.jpg', tag: 'Gifting', icon: 'Gift', enabled: true, ctaEnabled: true, ctaText: 'Shop Now', ctaLink: '/collection' }
    ]
  };

  const renderIcon = (iconName?: string, index: number = 0) => {
    if (iconName) {
      switch (iconName) {
        case 'Sun': return <Sun className="w-5 h-5" />;
        case 'Coffee': return <Coffee className="w-5 h-5" />;
        case 'Gift': return <Gift className="w-5 h-5" />;
        case 'Smile': return <Smile className="w-5 h-5" />;
        case 'Sparkles': return <Sparkles className="w-5 h-5" />;
        case 'Heart': return <Heart className="w-5 h-5" />;
        case 'Leaf': return <Leaf className="w-5 h-5" />;
        case 'Utensils': return <Utensils className="w-5 h-5" />;
      }
    }
    switch (index % 4) {
      case 0: return <Sun className="w-5 h-5" />;
      case 1: return <Coffee className="w-5 h-5" />;
      case 2: return <Gift className="w-5 h-5" />;
      case 3: return <Smile className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

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

  const visibleCards = well.cards?.filter(c => c.enabled !== false) || [];

  return (
    <section className="py-20 bg-[#F7F2E8] border-t border-[#E8DCC8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-semibold tracking-widest text-[#A86445] uppercase">
            {well.badge}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#29231F]">
            {well.headingMain} <span className="italic font-normal text-[#A86445]">{well.headingHighlight}</span>
          </h2>
          <p className="text-sm text-[#29231F]/70 font-sans">
            {well.description}
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleCards.map((c, idx) => {
            const isCtaEnabled = c.ctaEnabled !== false && well.defaultCtaEnabled !== false;
            const buttonText = c.ctaText || well.defaultCtaText || 'Shop Collection';
            const targetLink = c.ctaLink || well.defaultCtaLink || '/collection';

            return (
              <div
                key={c.id || idx}
                className="bg-[#E8DCC8]/30 border border-[#E8DCC8] rounded-2xl p-6 hover:bg-[#F7F2E8] hover:border-[#6F7655] hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-[#6F7655] text-white w-fit rounded-xl">
                      {renderIcon(c.icon, idx)}
                    </div>
                    {c.tag && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-[#A86445]/10 text-[#A86445]">
                        {c.tag}
                      </span>
                    )}
                  </div>

                  {c.image && (
                    <div
                      onClick={(e) => handleCtaClick(e, targetLink, c.openInNewTab)}
                      className="aspect-[16/9] rounded-xl overflow-hidden bg-[#E8DCC8] cursor-pointer relative shadow-sm group-hover:shadow-md transition-shadow"
                      title="Click to view shop collection"
                    >
                      <img
                        src={c.image}
                        alt={c.title}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        decoding="async"
                        width="500"
                        height="280"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-[#29231F]/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-[#29231F]/80 text-[#F7F2E8] text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1.5 shadow-lg">
                          <ShoppingBag className="w-3.5 h-3.5 text-[#C8A96B]" />
                          <span>Shop Collection</span>
                        </span>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#29231F] group-hover:text-[#A86445] transition-colors">
                      {c.title}
                    </h3>
                  </div>

                  <p className="text-xs text-[#29231F]/75 leading-relaxed">
                    {c.description}
                  </p>
                </div>

                {isCtaEnabled && (
                  <div className="pt-3 border-t border-[#E8DCC8]">
                    <button
                      type="button"
                      onClick={(e) => handleCtaClick(e, targetLink, c.openInNewTab)}
                      className="w-full py-2.5 px-4 bg-[#6F7655] hover:bg-[#29231F] text-[#F7F2E8] text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow group/btn"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-[#C8A96B]" />
                      <span>{buttonText}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export const WellnessLifestyle = React.memo(WellnessLifestyleComponent);
