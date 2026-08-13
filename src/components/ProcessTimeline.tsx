import React from 'react';
import { CheckCircle2, Sparkles, Box, Heart, Award, ShieldCheck, Flame, Search, UtensilsCrossed, Package, Smile } from 'lucide-react';
import { useCms } from '../context/CmsContext';

export const ProcessTimeline: React.FC = () => {
  const { cms } = useCms();
  const proc = cms.processTimelineSection || {
    badge: 'Our Craft',
    headingMain: 'From Ingredient',
    headingHighlight: 'to Bite',
    description: 'Every Alham confection follows an unhurried 6-step artisanal journey in our Dhaka facility.',
    steps: [
      { id: 'st1', stepNumber: '01', title: 'Select', description: 'Hand-sorting jumbo Medjool dates for moisture content and soft caramel pulp density.', icon: 'Search', enabled: true },
      { id: 'st2', stepNumber: '02', title: 'Prepare', description: 'Slow-roasting Char land peanuts and California almonds in copper drums.', icon: 'Flame', enabled: true },
      { id: 'st3', stepNumber: '03', title: 'Craft', description: 'Blending date reduction caramel over low heat with pure go-shodho ghee.', icon: 'UtensilsCrossed', enabled: true },
      { id: 'st4', stepNumber: '04', title: 'Hand Finish', description: 'Dipping each bar in single-origin cocoa mass and garnishing with crushed pistachios.', icon: 'Sparkles', enabled: true },
      { id: 'st5', stepNumber: '05', title: 'Pack', description: 'Sealing in food-grade foil and wrapping in wax-embossed boxes.', icon: 'Package', enabled: true },
      { id: 'st6', stepNumber: '06', title: 'Enjoy', description: 'Dispatched via climate-buffered courier for doorstep fresh arrival.', icon: 'Smile', enabled: true }
    ]
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Search': return <Search className="w-5 h-5 text-[#6F7655]" />;
      case 'Flame': return <Flame className="w-5 h-5 text-[#6F7655]" />;
      case 'UtensilsCrossed': return <UtensilsCrossed className="w-5 h-5 text-[#6F7655]" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-[#6F7655]" />;
      case 'Package': return <Package className="w-5 h-5 text-[#6F7655]" />;
      case 'Smile': return <Smile className="w-5 h-5 text-[#6F7655]" />;
      default: return <Award className="w-5 h-5 text-[#6F7655]" />;
    }
  };

  const visibleSteps = proc.steps?.filter(s => s.enabled !== false) || [];

  return (
    <section className="py-20 bg-[#E8DCC8]/30 border-y border-[#E8DCC8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Header */}
        <div className="max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-semibold tracking-widest text-[#A86445] uppercase">
            {proc.badge}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#29231F]">
            {proc.headingMain} <span className="italic font-normal text-[#A86445]">{proc.headingHighlight}</span>
          </h2>
          <p className="text-sm text-[#29231F]/70 font-sans">
            {proc.description}
          </p>
        </div>

        {/* Horizontal Process Workflow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 relative">
          {visibleSteps.map((step, idx) => (
            <div
              key={step.id || step.stepNumber}
              className="bg-[#F7F2E8] border border-[#E8DCC8] rounded-2xl p-6 text-left relative space-y-4 hover:border-[#6F7655] transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-[#C8A96B] bg-[#29231F] px-2.5 py-1 rounded">
                    Step {step.stepNumber}
                  </span>
                  {renderIcon(step.icon)}
                </div>

                <h3 className="font-serif text-xl font-bold text-[#29231F]">
                  {step.title}
                </h3>

                <p className="text-xs text-[#29231F]/75 leading-relaxed mt-2">
                  {step.description}
                </p>
              </div>

              {idx < visibleSteps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-[#C8A96B] font-bold text-lg">
                  →
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

