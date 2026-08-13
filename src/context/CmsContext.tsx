import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, deleteDoc, collection, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { CompleteCmsData, IngredientInfo, Article, ProductReview, Product, MediaItem, DeliverySettings, PaymentSettings, TrackingSettings } from '../types';
import { initialCmsData, initialIngredients, initialArticles, initialReviews, initialProducts, initialDeliverySettings } from '../data/initialData';

interface CmsContextType {
  cms: CompleteCmsData;
  ingredients: IngredientInfo[];
  setIngredients: React.Dispatch<React.SetStateAction<IngredientInfo[]>>;
  articles: Article[];
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>;
  reviews: ProductReview[];
  setReviews: React.Dispatch<React.SetStateAction<ProductReview[]>>;
  products: Product[];
  deliverySettings: DeliverySettings;
  setDeliverySettings: React.Dispatch<React.SetStateAction<DeliverySettings>>;
  updateDeliverySettings: (updated: Partial<DeliverySettings>) => Promise<boolean>;
  mediaLibrary: any[];

  paymentSettings: any;
  updatePaymentSettings: (settings: any) => Promise<boolean>;
  trackingSettings: any;
  updateTrackingSettings: (settings: any) => Promise<boolean>;

  setMediaLibrary: React.Dispatch<React.SetStateAction<any[]>>;
  isLoading: boolean;
  isBackendLoaded: boolean;
  refreshCms: () => Promise<void>;
  updateCms: (updatedCms: Partial<CompleteCmsData>) => Promise<boolean>;
  saveIngredient: (ing: Partial<IngredientInfo>) => Promise<boolean>;
  deleteIngredient: (id: string) => Promise<boolean>;
  saveArticle: (art: Partial<Article>) => Promise<boolean>;
  deleteArticle: (id: string) => Promise<boolean>;
  saveReview: (rev: Partial<ProductReview>) => Promise<boolean>;
  deleteReview: (id: string) => Promise<boolean>;
  saveProduct: (prod: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  addMedia: (media: Partial<MediaItem>) => Promise<boolean>;
  deleteMedia: (id: string) => Promise<boolean>;
}

const CmsContext = createContext<CmsContextType | undefined>(undefined);

const mergeCmsData = (incoming: any): CompleteCmsData => {
  if (!incoming || typeof incoming !== 'object') return initialCmsData;
  return {
    ...initialCmsData,
    ...incoming,
    siteSettings: {
      ...initialCmsData.siteSettings,
      ...(incoming.siteSettings || {})
    },
    topBar: {
      ...initialCmsData.topBar,
      ...(incoming.topBar || {})
    },
    heroSection: {
      ...initialCmsData.heroSection,
      ...(incoming.heroSection || {})
    },
    craftPhilosophySection: {
      ...initialCmsData.craftPhilosophySection,
      ...(incoming.craftPhilosophySection || {})
    },
    processTimelineSection: {
      ...initialCmsData.processTimelineSection,
      ...(incoming.processTimelineSection || {})
    },
    wellnessLifestyleSection: {
      ...initialCmsData.wellnessLifestyleSection,
      ...(incoming.wellnessLifestyleSection || {})
    },
    communitySection: {
      ...initialCmsData.communitySection,
      ...(incoming.communitySection || {})
    },
    homepageConfig: {
      signatureCreations: {
        ...initialCmsData.homepageConfig.signatureCreations,
        ...(incoming.homepageConfig?.signatureCreations || {})
      },
      allProducts: {
        ...initialCmsData.homepageConfig.allProducts,
        ...(incoming.homepageConfig?.allProducts || {})
      }
    },
    footerConfig: {
      ...initialCmsData.footerConfig,
      ...(incoming.footerConfig || {})
    },
    contactInfo: {
      ...initialCmsData.contactInfo,
      ...(incoming.contactInfo || {})
    },
    socialLinks: {
      ...initialCmsData.socialLinks,
      ...(incoming.socialLinks || {})
    },
    settings: {
      ...initialCmsData.settings,
      ...(incoming.settings || {})
    }
  };
};

const getInitialState = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && (typeof parsed === 'object' || Array.isArray(parsed))) {
        return parsed;
      }
    }
  } catch (e) {}
  return fallback;
};

export const CmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cms, setCms] = useState<CompleteCmsData>(() => mergeCmsData(getInitialState('alham_cms_cache', initialCmsData)));
  const [ingredients, setIngredients] = useState<IngredientInfo[]>(() => getInitialState('alham_ingredients_cache', initialIngredients));
  const [articles, setArticles] = useState<Article[]>(() => getInitialState('alham_articles_cache', initialArticles));
  const [reviews, setReviews] = useState<ProductReview[]>(() => getInitialState('alham_reviews_cache', initialReviews));
  const [products, setProducts] = useState<Product[]>(() => getInitialState('alham_products_cache', initialProducts));
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings>(() => getInitialState('alham_delivery_cache', initialDeliverySettings));
  const [mediaLibrary, setMediaLibrary] = useState<any[]>(() => cms.mediaItems || initialCmsData.mediaItems || []);

  const [paymentSettings, setPaymentSettings] = useState<any>(null);
  const [trackingSettings, setTrackingSettings] = useState<any>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBackendLoaded, setIsBackendLoaded] = useState<boolean>(false);

  const fetchCmsData = async () => {
    try {
      setIsLoading(true);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const ts = Date.now();
      const fetchWithTimeout = (url: string) => 
        fetch(url, { cache: 'no-store', signal: controller.signal }).catch(() => null);

      const [resCms, resDelivery, resPayment, resTracking] = await Promise.all([
        fetchWithTimeout(`/api/cms?_t=${ts}`),
        fetchWithTimeout(`/api/delivery-settings?_t=${ts}`),
        fetchWithTimeout(`/api/payment-settings?_t=${ts}`),
        fetchWithTimeout(`/api/tracking-settings?_t=${ts}`)
      ]);

      clearTimeout(timeoutId);

      if (resCms && resCms.ok) {
        const data = await resCms.json().catch(() => null);
        if (data) {
          if (data.cms) {
            const mergedCms = mergeCmsData(data.cms);
            setCms(mergedCms);
            try { localStorage.setItem('alham_cms_cache', JSON.stringify(mergedCms)); } catch(e){}
          }
          if (data.ingredients) {
            setIngredients(data.ingredients);
            try { localStorage.setItem('alham_ingredients_cache', JSON.stringify(data.ingredients)); } catch(e){}
          }
          if (data.articles) {
            setArticles(data.articles);
            try { localStorage.setItem('alham_articles_cache', JSON.stringify(data.articles)); } catch(e){}
          }
          if (data.reviews) {
            setReviews(data.reviews);
            try { localStorage.setItem('alham_reviews_cache', JSON.stringify(data.reviews)); } catch(e){}
          }
          if (data.products) {
            setProducts(data.products);
            try { localStorage.setItem('alham_products_cache', JSON.stringify(data.products)); } catch(e){}
          }
        }
      }

      if (resDelivery && resDelivery.ok) {
        const delData = await resDelivery.json().catch(() => null);
        if (delData?.deliverySettings) {
          setDeliverySettings(delData.deliverySettings);
          try { localStorage.setItem('alham_delivery_cache', JSON.stringify(delData.deliverySettings)); } catch(e){}
        }
      }

      if (resPayment && resPayment.ok) {
        const paymentData = await resPayment.json().catch(() => null);
        if (paymentData) setPaymentSettings(paymentData);
      }

      if (resTracking && resTracking.ok) {
        const trackingData = await resTracking.json().catch(() => null);
        if (trackingData) setTrackingSettings(trackingData);
      }

      setIsBackendLoaded(true);
    } catch (err) {
      console.warn('Backend API fetch timeout or static host notice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCmsData();

    // Attach real-time Firestore listeners for CMS, products, ingredients, articles, reviews, settings
    try {
      const cmsDocRef = doc(db, 'cms', 'main');
      const unsubscribeMain = onSnapshot(cmsDocRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data) {
            const rawCms = data.cms || data;
            setCms(prev => {
              const merged = mergeCmsData({ ...prev, ...rawCms });
              try { localStorage.setItem('alham_cms_cache', JSON.stringify(merged)); } catch(e){}
              return merged;
            });
          }
        }
      }, (error) => {
        console.warn('Firestore onSnapshot listener notice:', error);
      });

      const prodRef = collection(db, 'products');
      const unsubscribeProd = onSnapshot(prodRef, (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map(d => d.data() as Product);
          setProducts(list);
          try { localStorage.setItem('alham_products_cache', JSON.stringify(list)); } catch(e){}
        }
      }, (err) => console.warn('Firestore products listener notice:', err));

      const ingRef = collection(db, 'ingredients');
      const unsubscribeIng = onSnapshot(ingRef, (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map(d => d.data() as IngredientInfo);
          setIngredients(list);
          try { localStorage.setItem('alham_ingredients_cache', JSON.stringify(list)); } catch(e){}
        }
      }, (err) => console.warn('Firestore ingredients listener notice:', err));

      const artRef = collection(db, 'articles');
      const unsubscribeArt = onSnapshot(artRef, (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map(d => d.data() as Article);
          setArticles(list);
          try { localStorage.setItem('alham_articles_cache', JSON.stringify(list)); } catch(e){}
        }
      }, (err) => console.warn('Firestore articles listener notice:', err));

      const revRef = collection(db, 'reviews');
      const unsubscribeRev = onSnapshot(revRef, (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map(d => d.data() as ProductReview);
          setReviews(list);
          try { localStorage.setItem('alham_reviews_cache', JSON.stringify(list)); } catch(e){}
        }
      }, (err) => console.warn('Firestore reviews listener notice:', err));

      const deliveryDocRef = doc(db, 'settings', 'delivery');
      const unsubscribeDelivery = onSnapshot(deliveryDocRef, (snapshot) => {
        if (snapshot.exists()) {
          const delData = snapshot.data() as DeliverySettings;
          setDeliverySettings(delData);
          try { localStorage.setItem('alham_delivery_cache', JSON.stringify(delData)); } catch(e){}
        }
      }, (err) => console.warn('Firestore delivery listener notice:', err));

      const paymentDocRef = doc(db, 'settings', 'payment');
      const unsubscribePayment = onSnapshot(paymentDocRef, (snapshot) => {
        if (snapshot.exists()) {
          const payData = snapshot.data();
          setPaymentSettings(payData as PaymentSettings);
        }
      }, (err) => console.warn('Firestore payment listener notice:', err));

      const trackingDocRef = doc(db, 'settings', 'tracking');
      const unsubscribeTracking = onSnapshot(trackingDocRef, (snapshot) => {
        if (snapshot.exists()) {
          const trackData = snapshot.data();
          setTrackingSettings(trackData as TrackingSettings);
        }
      }, (err) => console.warn('Firestore tracking listener notice:', err));

      return () => {
        unsubscribeMain();
        unsubscribeProd();
        unsubscribeIng();
        unsubscribeArt();
        unsubscribeRev();
        unsubscribeDelivery();
        unsubscribePayment();
        unsubscribeTracking();
      };
    } catch (e) {
      console.warn('Firestore setup notice:', e);
    }
  }, []);


  const updateDeliverySettings = async (updated: Partial<DeliverySettings>): Promise<boolean> => {
    try {
      const merged = { ...deliverySettings, ...updated };
      setDeliverySettings(merged);
      try {
        await setDoc(doc(db, 'settings', 'delivery'), merged, { merge: true });
      } catch (fsErr) {
        console.warn('Firestore delivery write warning:', fsErr);
      }
      try {
        await fetch('/api/delivery-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
      } catch (e) {}
      return true;
    } catch (err) {
      console.error('Error updating delivery settings:', err);
      return false;
    }
  };

  const updateTrackingSettings = async (updated: any): Promise<boolean> => {
    try {
      const merged = { ...trackingSettings, ...updated };
      setTrackingSettings(merged);
      try {
        await setDoc(doc(db, 'settings', 'tracking'), merged, { merge: true });
      } catch (fsErr) {
        console.warn('Firestore tracking write warning:', fsErr);
      }
      try {
        await fetch('/api/tracking-settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(merged)
        });
      } catch (e) {}
      return true;
    } catch (err) {
      console.error('Error updating tracking settings:', err);
      return false;
    }
  };

  const updatePaymentSettings = async (updated: any): Promise<boolean> => {
    try {
      const merged = { ...paymentSettings, ...updated };
      setPaymentSettings(merged);
      try {
        await setDoc(doc(db, 'settings', 'payment'), merged, { merge: true });
      } catch (fsErr) {
        console.warn('Firestore payment write warning:', fsErr);
      }
      try {
        await fetch('/api/payment-settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(merged)
        });
      } catch (e) {}
      return true;
    } catch (err) {
      console.error('Error updating payment settings:', err);
      return false;
    }
  };

  const updateCms = async (updatedCms: Partial<CompleteCmsData>): Promise<boolean> => {
    try {
      const merged = mergeCmsData({ ...cms, ...updatedCms });
      const cleanMerged = JSON.parse(JSON.stringify(merged));

      setCms(cleanMerged);
      try { localStorage.setItem('alham_cms_cache', JSON.stringify(cleanMerged)); } catch(e){}

      try {
        await setDoc(doc(db, 'cms', 'main'), cleanMerged, { merge: true });
      } catch (fsErr) {
        console.warn('Client Firestore setDoc notice:', fsErr);
      }

      try {
        await fetch('/api/cms', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cms: cleanMerged })
        });
      } catch (e) {}

      return true;
    } catch (err) {
      console.error('Failed to update CMS:', err);
      return false;
    }
  };

  const saveIngredient = async (ing: Partial<IngredientInfo>): Promise<boolean> => {
    try {
      const ingId = ing.id || `ing-${Date.now()}`;
      const fullIng = { ...ing, id: ingId };

      try {
        await setDoc(doc(db, 'ingredients', ingId), fullIng, { merge: true });
      } catch (e) {}

      try {
        const isEdit = ingredients.some(i => i.id === ing.id);
        const url = isEdit ? `/api/ingredients/${ing.id}` : '/api/ingredients';
        const method = isEdit ? 'PUT' : 'POST';
        await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fullIng)
        });
      } catch (e) {}

      setIngredients(prev => {
        const exists = prev.some(i => i.id === ingId);
        if (exists) return prev.map(i => i.id === ingId ? { ...i, ...fullIng } as IngredientInfo : i);
        return [...prev, fullIng as IngredientInfo];
      });
      return true;
    } catch (err) {
      console.error('Error saving ingredient:', err);
      return false;
    }
  };

  const deleteIngredient = async (id: string): Promise<boolean> => {
    try {
      try {
        await deleteDoc(doc(db, 'ingredients', id));
      } catch (e) {}

      try {
        await fetch(`/api/ingredients/${id}`, { method: 'DELETE' });
      } catch (e) {}

      setIngredients(prev => prev.filter(i => i.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting ingredient:', err);
      return false;
    }
  };

  const saveArticle = async (art: Partial<Article>): Promise<boolean> => {
    try {
      const artId = art.id || `art-${Date.now()}`;
      const fullArt = { ...art, id: artId };

      try {
        await setDoc(doc(db, 'articles', artId), fullArt, { merge: true });
      } catch (e) {}

      try {
        const isEdit = !!art.id;
        const url = isEdit ? `/api/articles/${art.id}` : '/api/articles';
        const method = isEdit ? 'PUT' : 'POST';
        await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fullArt)
        });
      } catch (e) {}

      setArticles(prev => {
        const exists = prev.some(a => a.id === artId);
        if (exists) return prev.map(a => a.id === artId ? { ...a, ...fullArt } as Article : a);
        return [...prev, fullArt as Article];
      });
      return true;
    } catch (err) {
      console.error('Error saving article:', err);
      return false;
    }
  };

  const deleteArticle = async (id: string): Promise<boolean> => {
    try {
      try {
        await deleteDoc(doc(db, 'articles', id));
      } catch (e) {}

      try {
        await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      } catch (e) {}

      setArticles(prev => prev.filter(a => a.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting article:', err);
      return false;
    }
  };

  const saveReview = async (rev: Partial<ProductReview>): Promise<boolean> => {
    try {
      const revId = rev.id || `rev-${Date.now()}`;
      const fullRev = { ...rev, id: revId };

      try {
        await setDoc(doc(db, 'reviews', revId), fullRev, { merge: true });
      } catch (e) {}

      try {
        await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fullRev)
        });
      } catch (e) {}

      setReviews(prev => [...prev.filter(r => r.id !== revId), fullRev as ProductReview]);
      return true;
    } catch (err) {
      console.error('Error saving review:', err);
      return false;
    }
  };

  const deleteReview = async (id: string): Promise<boolean> => {
    try {
      try {
        await deleteDoc(doc(db, 'reviews', id));
      } catch (e) {}

      try {
        await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      } catch (e) {}

      setReviews(prev => prev.filter(r => r.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting review:', err);
      return false;
    }
  };

  const saveProduct = async (prod: Partial<Product>): Promise<boolean> => {
    try {
      const prodId = prod.id || `prod-${Date.now()}`;
      const fullProd = { ...prod, id: prodId };

      try {
        await setDoc(doc(db, 'products', prodId), fullProd, { merge: true });
      } catch (e) {}

      try {
        const isEdit = !!prod.id;
        const url = isEdit ? `/api/products/${prod.id}` : '/api/products';
        const method = isEdit ? 'PUT' : 'POST';
        await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fullProd)
        });
      } catch (e) {}

      setProducts(prev => {
        const exists = prev.some(p => p.id === prodId);
        if (exists) return prev.map(p => p.id === prodId ? { ...p, ...fullProd } as Product : p);
        return [...prev, fullProd as Product];
      });
      return true;
    } catch (err) {
      console.error('Error saving product:', err);
      return false;
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (e) {}

      try {
        await fetch(`/api/products/${id}`, { method: 'DELETE' });
      } catch (e) {}

      setProducts(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting product:', err);
      return false;
    }
  };

  const addMedia = async (media: Partial<MediaItem>): Promise<boolean> => {
    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(media)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.media) {
          setCms(prev => {
            const updated = { ...prev, mediaItems: data.media };
            try { localStorage.setItem('alham_cms_cache', JSON.stringify(updated)); } catch(e){}
            return updated;
          });
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding media asset:', err);
      return false;
    }
  };

  const deleteMedia = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        if (data.cms) {
          const mergedCms = mergeCmsData(data.cms);
          setCms(mergedCms);
          try { localStorage.setItem('alham_cms_cache', JSON.stringify(mergedCms)); } catch(e){}
        } else if (data.media) {
          setCms(prev => {
            const updated = { ...prev, mediaItems: data.media };
            try { localStorage.setItem('alham_cms_cache', JSON.stringify(updated)); } catch(e){}
            return updated;
          });
        }
        if (data.products) {
          setProducts(data.products);
          try { localStorage.setItem('alham_products_cache', JSON.stringify(data.products)); } catch(e){}
        }
        if (data.ingredients) {
          setIngredients(data.ingredients);
          try { localStorage.setItem('alham_ingredients_cache', JSON.stringify(data.ingredients)); } catch(e){}
        }
        if (data.articles) {
          setArticles(data.articles);
          try { localStorage.setItem('alham_articles_cache', JSON.stringify(data.articles)); } catch(e){}
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting media asset:', err);
      return false;
    }
  };

  return (
    <CmsContext.Provider
      value={{
        cms,
        ingredients,
        setIngredients,
        articles,
        setArticles,
        reviews,
        setReviews,
        products,
        deliverySettings,
        setDeliverySettings,
        updateDeliverySettings,

        paymentSettings,
        updatePaymentSettings,
        trackingSettings,
        updateTrackingSettings,

        mediaLibrary,
        setMediaLibrary,
        isLoading,
        isBackendLoaded,
        refreshCms: fetchCmsData,
        updateCms,
        saveIngredient,
        deleteIngredient,
        saveArticle,
        deleteArticle,
        saveReview,
        deleteReview,
        saveProduct,
        deleteProduct,
        addMedia,
        deleteMedia
      }}
    >
      {children}
    </CmsContext.Provider>
  );

};

export const useCms = (): CmsContextType => {
  const context = useContext(CmsContext);
  if (!context) {
    throw new Error('useCms must be used within a CmsProvider');
  }
  return context;
};
