import React, { useState } from 'react';
import { ShoppingBag, User, Menu, X, ShieldCheck, Globe } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCms } from '../context/CmsContext';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  onNavigate: (view: 'home' | 'collection' | 'ingredients' | 'philosophy' | 'recipes' | 'account' | 'admin') => void;
  currentView: string;
}

const NavbarComponent: React.FC<NavbarProps> = ({ onNavigate, currentView }) => {
  const { currentUser, openAuthModal, isAdmin } = useAuth();
  const { cart, setIsCartOpen, cartBumpKey } = useCart();
  const { cms, deliverySettings } = useCms();
  const { language, toggleLanguage } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleAccountClick = () => {
    if (!currentUser) {
      openAuthModal();
    } else if (isAdmin) {
      onNavigate('admin');
    } else {
      onNavigate('account');
    }
  };

  const navItems = cms.headerNav?.items || [
    { id: 'n1', label: 'Collection', view: 'collection', visible: true, order: 1 },
    { id: 'n2', label: 'Our Story', view: 'philosophy', visible: true, order: 2 },
    { id: 'n3', label: 'Ingredients', view: 'ingredients', visible: true, order: 3 },
    { id: 'n4', label: 'Journal', view: 'recipes', visible: true, order: 4 }
  ];

  const leftNavItems = navItems.slice(0, Math.ceil(navItems.length / 2));
  const rightNavItems = navItems.slice(Math.ceil(navItems.length / 2));

  // Top bar language resolution
  const topBarConfig = (cms.topBar || {}) as any;
  const isTopBarEnabled = topBarConfig.enabled !== false;
  
  const activeZones = deliverySettings?.zones?.filter((z: any) => z.active) || [];
  const primaryZoneThreshold = activeZones[0]?.freeDeliveryMinAmount || deliverySettings?.globalFreeDeliveryThreshold || 1500;

  const announcementText = language === 'bn'
    ? (topBarConfig.textBn || topBarConfig.text || `৳${primaryZoneThreshold} টাকার বেশি অর্ডারে সারা বাংলাদেশে ফ্রি ডেলিভারি`)
    : (topBarConfig.textEn || topBarConfig.text || `Free delivery across Bangladesh on orders over ৳${primaryZoneThreshold.toLocaleString()}`);

  const announcementLinkText = language === 'bn'
    ? (topBarConfig.linkTextBn || topBarConfig.linkText || 'কালেকশন দেখুন')
    : (topBarConfig.linkTextEn || topBarConfig.linkText || 'Shop Collection');

  const showAnnouncementLink = topBarConfig.showLink !== false && !!announcementLinkText && !!topBarConfig.linkUrl;

  // Header Logo resolution
  const siteLogoUrl = cms.siteSettings?.logoImageUrl || cms.settings?.logoImage || cms.siteSettings?.logoLightUrl;
  const siteLogoType = cms.siteSettings?.logoType || (siteLogoUrl ? 'image' : 'text');
  const brandTitle = cms.siteSettings?.brandName || cms.settings?.brandName || 'ALHAM';

  return (
    <header className="sticky top-0 z-40 bg-[#F7F2E8]/90 backdrop-blur-md border-b border-[#E8DCC8] transition-all duration-200">
      {/* Top Editorial Announcement Banner */}
      {isTopBarEnabled && (
        <div
          className="py-2 px-4 text-xs font-medium tracking-wide flex justify-between items-center transition-colors"
          style={{
            backgroundColor: topBarConfig.backgroundColor || '#29231F',
            color: topBarConfig.textColor || '#F7F2E8'
          }}
        >
          <div className="mx-auto flex items-center space-x-3 text-center">
            <span className="inline-block w-2 h-2 rounded-full bg-[#C8A96B] animate-pulse shrink-0"></span>
            <span>{announcementText}</span>
            {showAnnouncementLink && (
              <a
                href={topBarConfig.linkUrl || '#collection'}
                onClick={(e) => {
                  if (topBarConfig.linkUrl?.startsWith('#') || !topBarConfig.linkUrl) {
                    e.preventDefault();
                    onNavigate('collection');
                  }
                }}
                className="hidden md:inline-block font-serif italic underline ml-1 hover:opacity-80 transition-opacity"
                style={{ color: topBarConfig.textColor ? undefined : '#C8A96B' }}
              >
                | {announcementLinkText}
              </a>
            )}
          </div>
          {isAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              id="admin-quick-badge"
              className="hidden sm:flex items-center gap-1 bg-[#6F7655] text-white px-2.5 py-0.5 rounded text-[11px] font-mono tracking-wider hover:bg-[#A86445] transition-colors shrink-0"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin CMS
            </button>
          )}
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            id="mobile-menu-toggle"
            className="p-2 text-[#29231F] hover:text-[#6F7655] focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Desktop Links Left */}
        <nav className="hidden md:flex items-center space-x-6 text-[10px] uppercase tracking-[0.2em] font-semibold text-[#6F7655]">
          {leftNavItems.filter(item => item.visible).map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.view as any)}
              className={`transition-colors hover:text-[#A86445] ${
                currentView === item.view ? 'text-[#A86445] font-bold underline underline-offset-8' : ''
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Brand Logo */}
        <div className="flex items-center justify-center">
          <button
            onClick={() => onNavigate('home')}
            id="brand-logo-btn"
            className="text-center group focus:outline-none py-0.5 flex items-center justify-center"
          >
            {siteLogoType === 'image' && siteLogoUrl ? (
              <img
                src={siteLogoUrl}
                alt={brandTitle}
                width="220"
                height="68"
                decoding="async"
                className="h-14 sm:h-16 lg:h-[68px] max-w-[220px] sm:max-w-[320px] object-contain mx-auto transition-transform group-hover:scale-105 drop-shadow-sm"
              />
            ) : (
              <span className="font-serif text-4xl sm:text-5xl lg:text-[2.75rem] tracking-[0.25em] font-light italic text-[#29231F] group-hover:text-[#6F7655] transition-colors leading-none">
                {brandTitle}
              </span>
            )}
          </button>
        </div>

        {/* Desktop Links Right & Utility */}
        <div className="hidden md:flex items-center space-x-6 text-[10px] uppercase tracking-[0.2em] font-semibold text-[#6F7655]">
          {rightNavItems.filter(item => item.visible).map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.view as any)}
              className={`transition-colors hover:text-[#A86445] ${
                currentView === item.view ? 'text-[#A86445] font-bold underline underline-offset-8' : ''
              }`}
            >
              {item.label}
            </button>
          ))}

          <button
            onClick={handleAccountClick}
            id="account-btn"
            className="flex items-center space-x-1.5 transition-colors hover:text-[#A86445]"
            title={currentUser ? (isAdmin ? 'Admin Dashboard' : 'My Account') : 'Log In / Sign Up'}
          >
            <User className="w-4 h-4 text-[#A86445]" />
            <span>
              {currentUser
                ? (isAdmin ? 'Admin' : currentUser.name.split(' ')[0])
                : (cms.dictionary?.signInLabel || 'Sign In')}
            </span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            id="language-switcher-btn"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#29231F] text-[#F7F2E8] hover:bg-[#6F7655] transition-all text-[11px] font-sans font-bold tracking-normal shadow-sm"
            title="Switch Language / ভাষা পরিবর্তন করুন"
          >
            <Globe className="w-3.5 h-3.5 text-[#C8A96B]" />
            <span className={language === 'en' ? 'text-[#C8A96B] font-extrabold underline' : 'opacity-70'}>EN</span>
            <span className="opacity-40">|</span>
            <span className={language === 'bn' ? 'text-[#C8A96B] font-extrabold underline' : 'opacity-70'}>বাংলা</span>
          </button>

          {/* Cart Drawer Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            id="cart-btn"
            key={cartBumpKey || 'cart-btn'}
            className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#C8A96B]/60 hover:bg-[#E8DCC8] text-[#29231F] transition-all bg-[#F7F2E8]/80 backdrop-blur-sm shadow-sm ${cartBumpKey ? 'scale-105' : 'scale-100'}`}
            aria-label="Shopping Cart"
          >
            <div className="relative flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-[#A86445]" />
              {totalItems > 0 && (
                <span
                  key={cartBumpKey || 'cart-badge'}
                  className={`absolute -top-2 -right-2 bg-[#A86445] text-white text-[10px] font-bold h-4 min-w-[1rem] px-1 rounded-full flex items-center justify-center shadow-sm border border-[#F7F2E8] transition-transform ${cartBumpKey ? 'scale-110' : 'scale-100'}`}
                >
                  {totalItems}
                </span>
              )}
            </div>
            <span className="font-semibold text-xs tracking-wider uppercase">
              {cms.dictionary?.cartLabel || 'Cart'} ({totalItems})
            </span>
          </button>
        </div>

        {/* Mobile Right Cart & Lang Icon */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            onClick={toggleLanguage}
            id="mobile-lang-btn"
            className="px-2.5 py-1 rounded-full bg-[#29231F] text-[#F7F2E8] text-[11px] font-bold"
          >
            {language === 'en' ? 'বাংলা' : 'EN'}
          </button>
          
          <button
            onClick={() => setIsCartOpen(true)}
            id="mobile-cart-btn"
            key={cartBumpKey || 'mobile-cart-btn'}
            className={`relative p-2.5 rounded-full bg-[#6F7655] text-white shadow-sm transition-transform ${cartBumpKey ? 'scale-110' : 'scale-100'}`}
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span
                key={cartBumpKey || 'm-cart-badge'}
                className={`absolute -top-1 -right-1 bg-[#A86445] text-white text-[10px] font-bold h-4.5 min-w-[1.125rem] px-1 rounded-full flex items-center justify-center shadow-md border border-[#F7F2E8] transition-transform ${cartBumpKey ? 'scale-110' : 'scale-100'}`}
              >
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#F7F2E8] border-b border-[#E8DCC8] px-4 pt-2 pb-6 space-y-3">
          <button
            onClick={() => { onNavigate('home'); setIsMobileMenuOpen(false); }}
            className="block w-full text-left py-2 text-base font-medium text-[#29231F] hover:text-[#A86445]"
          >
            Home
          </button>

          {navItems.filter(item => item.visible).map(item => (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.view as any); setIsMobileMenuOpen(false); }}
              className="block w-full text-left py-2 text-base font-medium text-[#29231F] hover:text-[#A86445]"
            >
              {item.label}
            </button>
          ))}

          <div className="pt-4 border-t border-[#E8DCC8] flex items-center justify-between">
            <button
              onClick={() => { handleAccountClick(); setIsMobileMenuOpen(false); }}
              className="flex items-center space-x-2 text-sm font-medium text-[#29231F]"
            >
              <User className="w-5 h-5 text-[#6F7655]" />
              <span>{currentUser ? (isAdmin ? 'Super Admin Dashboard' : 'My Account') : (cms.dictionary?.signInLabel || 'Sign In')}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export const Navbar = React.memo(NavbarComponent);

