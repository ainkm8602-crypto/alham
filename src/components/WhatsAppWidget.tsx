import React, { useState } from 'react';
import { MessageCircle, X, Send, CheckCircle2 } from 'lucide-react';
import { useCms } from '../context/CmsContext';

export const WhatsAppWidget: React.FC = () => {
  const { cms } = useCms();
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  const contactInfo = (cms.contactInfo || {}) as any;
  const socialLinks = (cms.socialLinks || {}) as any;
  const siteSettings = (cms.siteSettings || {}) as any;

  // Check if widget enabled (defaults to true)
  if (contactInfo.enableWhatsAppWidget === false) {
    return null;
  }

  // Determine WhatsApp number and preset message
  const rawNum = contactInfo.whatsAppWidgetNumber || contactInfo.whatsApp || socialLinks.whatsApp || '+8801711223344';
  const cleanNumber = rawNum.replace(/[^0-9]/g, '');
  const defaultMsg = contactInfo.whatsAppWidgetMessage || 'Hi ALHAM! I would like to inquire about your products & ordering details.';

  const handleOpenWhatsApp = (overrideMsg?: string) => {
    const msgToSend = overrideMsg || customMsg.trim() || defaultMsg;
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msgToSend)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Floating Popup Card */}
      {isOpen && (
        <div className="pointer-events-auto mb-4 w-80 sm:w-88 bg-[#1F1A17] border border-[#C8A96B]/30 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="bg-[#25D366] text-slate-900 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold font-serif text-[#25D366] text-lg shadow-md">
                  {siteSettings.brandName ? siteSettings.brandName.charAt(0) : 'A'}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight font-serif text-slate-900">
                  {siteSettings.brandName || 'ALHAM'} Customer Care
                </h4>
                <p className="text-[11px] text-slate-800 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-slate-800 inline" />
                  <span>Online | Immediate Response</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-slate-900 hover:bg-black/10 transition-colors"
              title="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 bg-[#29231F] space-y-3 text-xs">
            <div className="bg-[#1F1A17] border border-[#F7F2E8]/10 p-3 rounded-xl space-y-1 text-[#E8DCC8]">
              <p className="font-bold text-[#C8A96B] text-[11px] uppercase tracking-wider">Assistance on WhatsApp</p>
              <p className="text-[#F7F2E8] leading-relaxed">
                Assalamu Alaikum! Have any questions regarding date varieties, gift boxes, or delivery time in Bangladesh?
              </p>
            </div>

            <div className="pt-1">
              <label className="block text-[11px] text-[#E8DCC8]/70 mb-1">Your message (optional):</label>
              <textarea
                rows={2}
                value={customMsg}
                onChange={e => setCustomMsg(e.target.value)}
                placeholder={defaultMsg}
                className="w-full p-2.5 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-xl text-white text-xs placeholder-[#E8DCC8]/40 focus:outline-none focus:border-[#25D366] resize-none"
              />
            </div>

            <button
              onClick={() => handleOpenWhatsApp()}
              className="w-full py-3 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all text-xs"
            >
              <Send className="w-4 h-4 fill-slate-950" />
              <span>Start WhatsApp Chat ({cleanNumber ? `+${cleanNumber}` : 'Contact Us'})</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Circle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto p-3.5 sm:p-4 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 group relative"
        title="Chat with ALHAM on WhatsApp"
        aria-label="WhatsApp Support"
      >
        <div className="relative">
          <MessageCircle className="w-7 h-7 fill-slate-950 text-[#25D366]" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-white border-2 border-[#25D366] rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-white border-2 border-[#25D366] rounded-full" />
        </div>
        {!isOpen && (
          <span className="hidden md:inline-block ml-2 text-xs font-bold text-slate-950 pr-1">
            WhatsApp
          </span>
        )}
      </button>
    </div>
  );
};
