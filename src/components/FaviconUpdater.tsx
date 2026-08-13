import React, { useEffect } from 'react';
import { useCms } from '../context/CmsContext';

export const FaviconUpdater: React.FC = () => {
  const { cms } = useCms();
  const faviconUrl =
    cms?.siteSettings?.faviconUrl ||
    (cms as any)?.settings?.faviconUrl ||
    cms?.siteSettings?.logoImageUrl ||
    (cms as any)?.settings?.logoImage ||
    cms?.siteSettings?.logoLightUrl ||
    '';

  useEffect(() => {
    // Keep document title strictly set to "ALHAM" across all routes & updates
    document.title = 'ALHAM';

    const updateFavicon = (url: string) => {
      // Determine link type from extension or default to png/ico
      let type = 'image/png';
      if (url) {
        const cleanUrl = url.split('?')[0].toLowerCase();
        if (cleanUrl.endsWith('.ico')) type = 'image/x-icon';
        else if (cleanUrl.endsWith('.svg')) type = 'image/svg+xml';
        else if (cleanUrl.endsWith('.jpg') || cleanUrl.endsWith('.jpeg')) type = 'image/jpeg';
        else if (cleanUrl.endsWith('.webp')) type = 'image/webp';
        else if (cleanUrl.endsWith('.png')) type = 'image/png';
      }

      // Default fallback SVG data URI if no custom favicon is configured
      const defaultIcon = `data:image/svg+xml,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="48" fill="#29231F" stroke="#C8A96B" stroke-width="4"/>
          <text x="50%" y="62%" font-family="serif" font-size="52" font-weight="bold" fill="#C8A96B" text-anchor="middle">A</text>
        </svg>
      `)}`;

      const targetUrl = url ? url : defaultIcon;
      // Add cache-busting timestamp parameter to force browser refresh on replacement for network/file URLs
      const cacheBustUrl = (url && !url.startsWith('data:'))
        ? (url.includes('?') ? `${url}&v=${Date.now()}` : `${url}?v=${Date.now()}`)
        : (url || defaultIcon);

      // 1. Standard rel="icon"
      let linkIcon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      if (!linkIcon) {
        linkIcon = document.createElement('link');
        linkIcon.rel = 'icon';
        document.head.appendChild(linkIcon);
      }
      linkIcon.type = type;
      linkIcon.href = cacheBustUrl;

      // 2. rel="shortcut icon" (Edge / Internet Explorer / older Firefox)
      let linkShortcut = document.querySelector("link[rel='shortcut icon']") as HTMLLinkElement;
      if (!linkShortcut) {
        linkShortcut = document.createElement('link');
        linkShortcut.rel = 'shortcut icon';
        document.head.appendChild(linkShortcut);
      }
      linkShortcut.type = type;
      linkShortcut.href = cacheBustUrl;

      // 3. rel="apple-touch-icon" (Safari / iOS home screen shortcuts)
      let linkApple = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
      if (!linkApple) {
        linkApple = document.createElement('link');
        linkApple.rel = 'apple-touch-icon';
        document.head.appendChild(linkApple);
      }
      linkApple.href = cacheBustUrl;
    };

    updateFavicon(faviconUrl);
  }, [faviconUrl]);

  return null;
};
