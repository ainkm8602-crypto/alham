import React from 'react';
import { Star, ShieldCheck, Truck, Package, Heart, CheckCircle2 } from 'lucide-react';
import { useCms } from '../context/CmsContext';

export const AlhamCommunity: React.FC = () => {
  const { reviews } = useCms();

  return (
    <section className="py-20 bg-[#F7F2E8] border-t border-[#E8DCC8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-semibold tracking-widest text-[#A86445] uppercase">
            Community Stories
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#29231F]">
            The Alham Community
          </h2>
          <p className="text-sm text-[#29231F]/70 font-sans">
            Hear from health-conscious food lovers across Dhaka, Chittagong, and Sylhet who have made Alham their go-to daily snack.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#E8DCC8]/30 border border-[#E8DCC8] rounded-2xl p-6 space-y-4 hover:border-[#6F7655] transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-[#C8A96B]">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#C8A96B]" />
                    ))}
                  </div>
                  <span className="text-[11px] text-[#29231F]/50">{rev.date}</span>
                </div>

                <p className="text-xs text-[#29231F]/80 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-[#E8DCC8] flex items-center justify-between">
                <div>
                  <p className="font-serif font-bold text-sm text-[#29231F]">{rev.userName}</p>
                  <p className="text-[10px] text-[#6F7655] flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-[#6F7655]" />
                    <span>Verified Buyer</span>
                  </p>
                </div>
                <span className="text-xs text-[#A86445] font-serif italic">Dhaka</span>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges Bar */}
        <div className="p-8 rounded-2xl bg-[#29231F] text-[#F7F2E8] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="p-3 bg-[#6F7655] rounded-xl text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <p className="font-serif font-bold text-sm">Secure Payment</p>
            <p className="text-xs text-[#E8DCC8]/70">Cash on Delivery</p>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <div className="p-3 bg-[#6F7655] rounded-xl text-white">
              <Package className="w-5 h-5" />
            </div>
            <p className="font-serif font-bold text-sm">Insulated Eco-Box</p>
            <p className="text-xs text-[#E8DCC8]/70">Protects delicate chocolate & nougat</p>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <div className="p-3 bg-[#6F7655] rounded-xl text-white">
              <Truck className="w-5 h-5" />
            </div>
            <p className="font-serif font-bold text-sm">Fast Courier</p>
            <p className="text-xs text-[#E8DCC8]/70">3–4 Business Days Nationwide</p>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <div className="p-3 bg-[#6F7655] rounded-xl text-white">
              <Heart className="w-5 h-5" />
            </div>
            <p className="font-serif font-bold text-sm">Fresh Batch Promise</p>
            <p className="text-xs text-[#E8DCC8]/70">Handcrafted upon order</p>
          </div>
        </div>

      </div>
    </section>
  );
};

