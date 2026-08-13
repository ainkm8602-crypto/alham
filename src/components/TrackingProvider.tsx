import React, { useEffect, createContext, useContext } from 'react';
import { useCms } from '../context/CmsContext';
import {
  trackEvent,
  trackPageView,
  trackViewItem,
  trackAddToCart,
  trackViewCart,
  trackBeginCheckout,
  trackPurchase
} from '../lib/analytics';

export const TrackingContext = createContext<any>({
  trackEvent,
  trackPageView,
  trackViewItem,
  trackAddToCart,
  trackViewCart,
  trackBeginCheckout,
  trackPurchase
});

export const TrackingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { trackingSettings } = useCms();

  useEffect(() => {
    if (!trackingSettings) return;

    // Inject custom scripts from CMS if provided and not duplicated
    if (trackingSettings.customScripts) {
      const addHtmlToElement = (html: string, target: HTMLElement, prepend = false) => {
        if (!html) return;
        try {
          const fragment = document.createRange().createContextualFragment(html);
          const clonedFragment = document.createDocumentFragment();

          Array.from(fragment.childNodes).forEach((node) => {
            if (node.nodeName.toLowerCase() === 'script') {
              const script = document.createElement('script');
              const oldScript = node as HTMLScriptElement;
              Array.from(oldScript.attributes).forEach((attr) => {
                script.setAttribute(attr.name, attr.value);
              });
              script.text = oldScript.text;
              clonedFragment.appendChild(script);
            } else {
              clonedFragment.appendChild(node.cloneNode(true));
            }
          });

          if (prepend) {
            target.insertBefore(clonedFragment, target.firstChild);
          } else {
            target.appendChild(clonedFragment);
          }
        } catch (e) {
          console.error('Error injecting script', e);
        }
      };

      if (trackingSettings.customScripts.headScript) {
        addHtmlToElement(trackingSettings.customScripts.headScript, document.head);
      }
      if (trackingSettings.customScripts.bodyScript) {
        addHtmlToElement(trackingSettings.customScripts.bodyScript, document.body, true);
      }
      if (trackingSettings.customScripts.footerScript) {
        addHtmlToElement(trackingSettings.customScripts.footerScript, document.body);
      }
    }
  }, [trackingSettings]);

  return (
    <TrackingContext.Provider
      value={{
        trackEvent,
        trackPageView,
        trackViewItem,
        trackAddToCart,
        trackViewCart,
        trackBeginCheckout,
        trackPurchase
      }}
    >
      {children}
    </TrackingContext.Provider>
  );
};

export const useTracking = () => useContext(TrackingContext);
