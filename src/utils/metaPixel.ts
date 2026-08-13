/**
 * Forwarding bridge to central analytics engine in src/lib/analytics.ts
 */
import {
  META_PIXEL_ID as PIXEL_ID,
  trackPageView,
  trackViewItem,
  trackAddToCart,
  trackBeginCheckout,
  trackPurchase,
  trackEvent
} from '../lib/analytics';

export const META_PIXEL_ID = PIXEL_ID;

export const initMetaPixel = () => {
  // Base code is statically placed in index.html to avoid duplicate initializations
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('init', META_PIXEL_ID);
  }
};

export const trackMetaEvent = (eventName: string, data: Record<string, any> = {}) => {
  trackEvent(eventName, data);
};

export {
  trackPageView,
  trackViewItem as trackViewContent,
  trackAddToCart,
  trackBeginCheckout as trackInitiateCheckout,
  trackPurchase
};

export const trackSearch = (query: string) => {
  if (!query || !query.trim()) return;
  trackEvent('search', { search_string: query.trim() });
};
