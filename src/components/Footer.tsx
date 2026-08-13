import React from 'react';
import { Mail, Phone, MapPin, Instagram, Facebook, Youtube, Video, Linkedin, Twitter, MessageCircle, Globe } from 'lucide-react';
import { useCms } from '../context/CmsContext';

interface FooterProps {
  onNavigate: (view: 'home' | 'collection' | 'ingredients' | 'philosophy' | 'recipes' | 'account' | 'admin') => void;
  onOpenCircle: () => void;
}

const FooterComponent: React.FC<FooterProps> = ({ onNavigate, onOpenCircle }) => {
  const { cms } = useCms();
  const settings = cms.settings || {};
  const contactInfo = (cms.contactInfo || {}) as any;
  const socialLinks = (cms.socialLinks || {}) as any;

  const footerConfig = cms.footerConfig || {
    brandBio: 'Alham creates delicious, beautifully crafted snacks using carefully selected ingredients, combining indulgent taste with a more mindful approach to snacking.',
    exploreHeading: 'Explore',
    assuranceHeading: 'Assurance',
    contactHeading: 'Kitchen & Contact',
    assurancePoints: [
      'Fresh Batch Preparation',
      'Clean & Hygienic Facility',
      'Fast Nationwide Courier',
      'Zero Refined Cane Sugar',
      'Cash on Delivery Payment'
    ],
    copyrightText: 'Alham Artisan Foods Bangladesh. All rights reserved.'
  };

  // Resolve Social Links
  const fbUrl = socialLinks.facebook || settings.socialFacebook;
  const instaUrl = socialLinks.instagram || settings.socialInstagram;
  const ytUrl = socialLinks.youTube;
  const tiktokUrl = socialLinks.tikTok;
  const linkedinUrl = socialLinks.linkedIn;
  const twitterUrl = socialLinks.twitter;
  const waVal = socialLinks.whatsApp || contactInfo.whatsApp || settings.contactPhone || '+8801711223344';

  const formatWaUrl = (val: string) => {
    if (!val) return 'https://wa.me/8801711223344';
    if (val.startsWith('http')) return val;
    const clean = val.replace(/[^0-9]/g, '');
    return `https://wa.me/${clean}`;
  };

  const waUrl = formatWaUrl(waVal);

  // Address, phone, email resolution
  const addressVal = contactInfo.address || settings.contactAddress;
  const phoneVal = contactInfo.phone || settings.contactPhone;
  const emailVal = contactInfo.supportEmail || contactInfo.businessEmail || settings.contactEmail;

  return (
    <footer className="bg-[#29231F] text-[#F7F2E8] pt-16 pb-12 border-t border-[#C8A96B]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#F7F2E8]/10">
          
          {/* Brand Info & Social Media Hub */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 py-1">
              {(() => {
                const footerLogoSrc = cms.siteSettings?.footerLogoUrl || cms.siteSettings?.logoLightUrl || cms.siteSettings?.logoImageUrl || cms.settings?.logoImage;
                const isImageMode = (cms.siteSettings?.logoType === 'image' || (!cms.siteSettings?.logoType && Boolean(footerLogoSrc)));
                if (isImageMode && footerLogoSrc) {
                  return (
                    <img
                      src={footerLogoSrc}
                      alt={cms.siteSettings?.brandName || settings.brandName || 'ALHAM'}
                      loading="lazy"
                      decoding="async"
                      width="280"
                      height="64"
                      className="h-14 sm:h-16 max-w-[280px] sm:max-w-[340px] object-contain transition-transform hover:scale-105"
                    />
                  );
                }
                return (
                  <span className="font-serif text-4xl sm:text-5xl lg:text-[2.75rem] tracking-[0.25em] font-light italic text-[#F7F2E8] leading-none">
                    {cms.siteSettings?.brandName || settings.brandName || 'ALHAM'}
                  </span>
                );
              })()}
            </div>
            <p className="text-xs text-[#E8DCC8]/80 leading-relaxed max-w-sm font-sans">
              {footerConfig.brandBio}
            </p>

            {/* Social Media Links Bar */}
            <div className="pt-3 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C8A96B] block font-bold">Connect With Us</span>
              <div className="flex flex-wrap items-center gap-2.5 text-[#C8A96B]">
                {/* WhatsApp */}
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-full bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-slate-950 transition-all border border-[#25D366]/30 shadow-sm"
                  title="WhatsApp Support & Orders"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>

                {/* Facebook */}
                {fbUrl && (
                  <a
                    href={fbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-full bg-[#F7F2E8]/5 hover:bg-[#1877F2] text-[#F7F2E8] transition-all border border-[#F7F2E8]/10"
                    title="Facebook Page"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}

                {/* Instagram */}
                {instaUrl && (
                  <a
                    href={instaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-full bg-[#F7F2E8]/5 hover:bg-[#E4405F] text-[#F7F2E8] transition-all border border-[#F7F2E8]/10"
                    title="Instagram Profile"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}

                {/* YouTube */}
                {ytUrl && (
                  <a
                    href={ytUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-full bg-[#F7F2E8]/5 hover:bg-[#FF0000] text-[#F7F2E8] transition-all border border-[#F7F2E8]/10"
                    title="YouTube Channel"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                )}

                {/* TikTok */}
                {tiktokUrl && (
                  <a
                    href={tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-full bg-[#F7F2E8]/5 hover:bg-black text-[#F7F2E8] transition-all border border-[#F7F2E8]/10"
                    title="TikTok"
                  >
                    <Video className="w-4 h-4" />
                  </a>
                )}

                {/* LinkedIn */}
                {linkedinUrl && (
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-full bg-[#F7F2E8]/5 hover:bg-[#0A66C2] text-[#F7F2E8] transition-all border border-[#F7F2E8]/10"
                    title="LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}

                {/* Twitter */}
                {twitterUrl && (
                  <a
                    href={twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-full bg-[#F7F2E8]/5 hover:bg-[#1DA1F2] text-[#F7F2E8] transition-all border border-[#F7F2E8]/10"
                    title="Twitter / X"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                )}

                {/* Custom Social Links */}
                {socialLinks.customLinks?.filter(c => c.enabled && c.url)?.map((customItem) => (
                  <a
                    key={customItem.id}
                    href={customItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-full bg-[#F7F2E8]/5 hover:bg-[#C8A96B] hover:text-[#29231F] text-[#F7F2E8] transition-all border border-[#F7F2E8]/10"
                    title={customItem.title}
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                ))}

                <button
                  onClick={onOpenCircle}
                  className="ml-2 px-3.5 py-1.5 rounded-full border border-[#C8A96B]/40 text-[10px] uppercase tracking-[0.15em] font-semibold text-[#C8A96B] hover:bg-[#C8A96B] hover:text-[#29231F] transition-all"
                >
                  Join Circle
                </button>
              </div>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="font-serif text-xs uppercase tracking-[0.2em] font-bold text-[#C8A96B] mb-4">
              {footerConfig.exploreHeading || 'Explore'}
            </h4>
            <ul className="space-y-2.5 text-[11px] uppercase tracking-[0.15em] text-[#E8DCC8]/80 font-medium">
              <li>
                <button onClick={() => onNavigate('collection')} className="hover:text-[#F7F2E8] transition-colors">
                  Signature Collection
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('ingredients')} className="hover:text-[#F7F2E8] transition-colors">
                  Ingredient Stories
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('philosophy')} className="hover:text-[#F7F2E8] transition-colors">
                  Crafted With Intention
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('recipes')} className="hover:text-[#F7F2E8] transition-colors">
                  Journal & Recipes
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Support & Trust */}
          <div>
            <h4 className="font-serif text-base font-semibold text-[#C8A96B] mb-4">
              {footerConfig.assuranceHeading || 'Assurance'}
            </h4>
            <ul className="space-y-2.5 text-sm text-[#E8DCC8]/80">
              {footerConfig.assurancePoints?.map((pt: string, i: number) => (
                <li key={i}>{pt}</li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-serif text-base font-semibold text-[#C8A96B] mb-4">
              {footerConfig.contactHeading || 'Kitchen & Contact'}
            </h4>
            <ul className="space-y-3 text-sm text-[#E8DCC8]/80">
              {addressVal && (
                <li className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-[#C8A96B] shrink-0 mt-0.5" />
                  <span>{addressVal}</span>
                </li>
              )}
              {phoneVal && (
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-[#C8A96B] shrink-0" />
                  <a href={`tel:${phoneVal}`} className="hover:text-[#C8A96B] transition-colors">{phoneVal}</a>
                </li>
              )}
              {waVal && (
                <li className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
                  <a href={waUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#25D366] transition-colors font-semibold text-xs text-[#25D366]">
                    WhatsApp: {waVal}
                  </a>
                </li>
              )}
              {emailVal && (
                <li className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-[#C8A96B] shrink-0" />
                  <a href={`mailto:${emailVal}`} className="hover:text-[#C8A96B] transition-colors">{emailVal}</a>
                </li>
              )}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#E8DCC8]/60 space-y-4 sm:space-y-0">
          <p>© {new Date().getFullYear()} {footerConfig.copyrightText}</p>
          <div className="flex items-center space-x-6">
            <span>Handcrafted in Bangladesh</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export const Footer = React.memo(FooterComponent);
