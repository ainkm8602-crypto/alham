import React from 'react';
import { Heart, Sparkles, ShieldCheck, Sun, Leaf, Utensils, Gift } from 'lucide-react';
import { useCms } from '../context/CmsContext';

const CraftPhilosophyComponent: React.FC = () => {
  const { cms } = useCms();
  const phil = cms.craftPhilosophySection || {
    badge: 'Our Philosophy',
    headingMain: 'Crafted With',
    headingHighlight: 'Intention.',
    paragraph1: 'At Alham, we believe that food should be an expression of reverence — honoring the pure ingredients nature provides while creating moments of genuine delight for your senses.',
    paragraph2: 'We eliminate artificial corn syrups, excessive cane sugars, and palm oils. Instead, we rely on the natural sweetness of Saudi Medjool dates, local wildflower honey, and slow oven-roasted nuts.',
    mainImage: '/src/assets/images/khajur_barfi_1784995525489.jpg',
    hygieneBadgeTitle: 'Hygienic Kitchen',
    hygieneBadgeText: 'Prepared in small sterile batches in Gulshan, Dhaka.',
    features: [
      { id: 'f1', title: 'Carefully Selected Ingredients', description: 'Only premium grade dates, whole nuts, and single-origin dark cocoa enter our kitchen.', icon: 'Leaf', enabled: true },
      { id: 'f2', title: 'Small-Batch Crafting', description: 'Hand-mixed and cut daily to guarantee peak freshness and delicate texture.', icon: 'Sparkles', enabled: true },
      { id: 'f3', title: 'Balanced Sweetness', description: 'Mindfully formulated so you enjoy clean, sustained energy without sugar crashes.', icon: 'Sun', enabled: true },
      { id: 'f4', title: 'Thoughtful Gifting', description: 'Elegantly packaged in warm ivory boxes perfect for family gatherings and corporate gifts.', icon: 'Heart', enabled: true }
    ]
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Leaf': return <Leaf className="w-4 h-4 text-[#A86445]" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4 text-[#A86445]" />;
      case 'Sun': return <Sun className="w-4 h-4 text-[#A86445]" />;
      case 'Heart': return <Heart className="w-4 h-4 text-[#A86445]" />;
      case 'Utensils': return <Utensils className="w-4 h-4 text-[#A86445]" />;
      case 'Gift': return <Gift className="w-4 h-4 text-[#A86445]" />;
      default: return <Sparkles className="w-4 h-4 text-[#A86445]" />;
    }
  };

  const sectionImg = phil.mainImage || (phil as any).craftImage || "/src/assets/images/khajur_barfi_1784995525489.jpg";

  return (
    <section className="py-20 bg-[#E8DCC8]/40 border-y border-[#E8DCC8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Visual Composition */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-[#F7F2E8] bg-[#E8DCC8] aspect-[3/4]">
              <img
                src={sectionImg}
                alt={phil.headingMain || "Handcrafted artisan confectionery at Alham"}
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
                width="600"
                height="800"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#29231F]/50 via-transparent to-transparent" />
            </div>

            {/* Badge */}
            <div className="absolute -bottom-6 -right-4 p-5 bg-[#F7F2E8] rounded-2xl shadow-xl border border-[#C8A96B44] max-w-[220px]">
              <div className="flex items-center space-x-2 text-[#6F7655] mb-1">
                <ShieldCheck className="w-5 h-5 text-[#A86445]" />
                <span className="font-bold text-[10px] uppercase tracking-wider text-[#6F7655]">{phil.hygieneBadgeTitle}</span>
              </div>
              <p className="text-xs text-[#29231F]/80 leading-snug">
                {phil.hygieneBadgeText}
              </p>
            </div>
          </div>

          {/* Right Editorial Story */}
          <div className="lg:col-span-7 space-y-6 lg:pl-6 text-left">
            <span className="inline-block px-3 py-1 border border-[#C8A96B] text-[9px] uppercase tracking-[0.2em] text-[#A86445] rounded-full font-semibold">
              {phil.badge}
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#29231F] leading-tight">
              {phil.headingMain} <span className="italic font-normal text-[#A86445]">{phil.headingHighlight}</span>
            </h2>

            <p className="text-base text-[#29231F]/80 leading-relaxed font-sans">
              {phil.paragraph1}
            </p>

            <p className="text-sm text-[#29231F]/70 leading-relaxed font-sans">
              {phil.paragraph2}
            </p>

            {/* Core Values Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#E8DCC8]">
              {phil.features?.filter(f => f.enabled !== false).map((feat) => (
                <div key={feat.id} className="space-y-1.5">
                  <div className="flex items-center space-x-2 text-[#6F7655] font-serif font-bold text-base">
                    {renderIcon(feat.icon)}
                    <span>{feat.title}</span>
                  </div>
                  <p className="text-xs text-[#29231F]/70">
                    {feat.description}
                  </p>
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export const CraftPhilosophy = React.memo(CraftPhilosophyComponent);

