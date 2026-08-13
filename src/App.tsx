import React, { useState, Suspense, lazy } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CmsProvider, useCms } from './context/CmsContext';
import { TrackingProvider, useTracking } from './components/TrackingProvider';
import { Product } from './types';

// Critical Above-the-Fold Components (Loaded Synchronously for Speed)
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FeaturedShowcase } from './components/FeaturedShowcase';
import { Footer } from './components/Footer';
import { FaviconUpdater } from './components/FaviconUpdater';
import { WhatsAppWidget } from './components/WhatsAppWidget';

// Below-the-Fold & Modal Components (Lazy-Loaded for Instant Mobile Bundle Parsing)
const CraftPhilosophy = lazy(() => import('./components/CraftPhilosophy').then(m => ({ default: m.CraftPhilosophy })));
const IngredientStory = lazy(() => import('./components/IngredientStory').then(m => ({ default: m.IngredientStory })));
const ProcessTimeline = lazy(() => import('./components/ProcessTimeline').then(m => ({ default: m.ProcessTimeline })));
const SignatureCollections = lazy(() => import('./components/SignatureCollections').then(m => ({ default: m.SignatureCollections })));
const WellnessLifestyle = lazy(() => import('./components/WellnessLifestyle').then(m => ({ default: m.WellnessLifestyle })));
const EditorialMagazine = lazy(() => import('./components/EditorialMagazine').then(m => ({ default: m.EditorialMagazine })));
const AlhamCommunity = lazy(() => import('./components/AlhamCommunity').then(m => ({ default: m.AlhamCommunity })));
const AllProductsSection = lazy(() => import('./components/AllProductsSection').then(m => ({ default: m.AllProductsSection })));

// Heavy Views & Modals (Lazy-Loaded)
const ProductDetailView = lazy(() => import('./components/ProductDetailView').then(m => ({ default: m.ProductDetailView })));
const CartDrawer = lazy(() => import('./components/CartDrawer').then(m => ({ default: m.CartDrawer })));
const CheckoutModal = lazy(() => import('./components/CheckoutModal').then(m => ({ default: m.CheckoutModal })));
const AuthModal = lazy(() => import('./components/AuthModal').then(m => ({ default: m.AuthModal })));
const AlhamCircleModal = lazy(() => import('./components/AlhamCircleModal').then(m => ({ default: m.AlhamCircleModal })));
const CustomerDashboard = lazy(() => import('./components/CustomerDashboard').then(m => ({ default: m.CustomerDashboard })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));

function MainAppContent() {
  const { currentUser, isAdmin } = useAuth();
  const { products, ingredients, articles, cms, isLoading, isBackendLoaded } = useCms();
  const { trackEvent } = useTracking() || {};
  const hasLocalCache = typeof window !== 'undefined' && !!localStorage.getItem('alham_cms_cache');

  const [currentView, setCurrentView] = useState<'home' | 'collection' | 'ingredients' | 'philosophy' | 'recipes' | 'account' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const viewMap: Record<string, any> = {
        '/': 'home',
        '/collection': 'collection',
        '/ingredients': 'ingredients',
        '/philosophy': 'philosophy',
        '/recipes': 'recipes',
        '/account': 'account',
        '/admin': 'admin'
      };
      if (viewMap[path]) return viewMap[path];
    }
    return 'home';
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCircleModalOpen, setIsCircleModalOpen] = useState(false);

  React.useEffect(() => {
    if (trackEvent) {
      trackEvent('page_view', {
        page_path: window.location.pathname,
        page_title: document.title
      });
    }
  }, [currentView, selectedProduct?.id]);

  React.useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const path = window.location.pathname;
      if (path.startsWith('/product/')) {
        const slug = path.split('/')[2];
        const prod = products.find(p => 
          p.id === slug || 
          p.name.toLowerCase().replace(/\s+/g, '-') === slug
        );
        if (prod) {
          setSelectedProduct(prod);
          return;
        }
      }
      
      setSelectedProduct(null);
      
      // Determine view from path
      const viewMap: Record<string, any> = {
        '/': 'home',
        '/collection': 'collection',
        '/ingredients': 'ingredients',
        '/philosophy': 'philosophy',
        '/recipes': 'recipes',
        '/account': 'account',
        '/admin': 'admin'
      };
      setCurrentView(viewMap[path] || (event.state?.view) || 'home');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [products]);

  const handleNavigate = (view: 'home' | 'collection' | 'ingredients' | 'philosophy' | 'recipes' | 'account' | 'admin') => {
    setCurrentView(view);
    setSelectedProduct(null);
    const newPath = view === 'home' ? '/' : `/${view}`;
    if (window.location.pathname !== newPath) {
      window.history.pushState({ view }, '', newPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (p: Product) => {
    setSelectedProduct(p);
    const slug = p.name.toLowerCase().replace(/\s+/g, '-');
    window.history.pushState({ view: 'product', productId: p.id }, '', `/product/${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Instant rendering: website loads immediately with no blocking load screen
  if (currentView === 'admin' && isAdmin) {
    return (
      <Suspense fallback={null}>
        <FaviconUpdater />
        <AdminDashboard onNavigateHome={() => handleNavigate('home')} />
      </Suspense>
    );
  }

  if (currentView === 'account' && currentUser) {
    return (
      <div className="bg-[#F7F2E8] min-h-screen">
        <FaviconUpdater />
        <Navbar onNavigate={handleNavigate} currentView={currentView} />
        <Suspense fallback={null}>
          <CustomerDashboard onNavigateHome={() => handleNavigate('home')} />
        </Suspense>
        <Footer onNavigate={handleNavigate} onOpenCircle={() => setIsCircleModalOpen(true)} />
      </div>
    );
  }

  return (
    <div className="bg-[#F7F2E8] text-[#29231F] min-h-screen font-sans selection:bg-[#6F7655] selection:text-white flex flex-col justify-between">
      <FaviconUpdater />
      <div>
        <Navbar onNavigate={handleNavigate} currentView={currentView} />

        <Suspense fallback={null}>
          {selectedProduct ? (
            <main className="pt-8">
              <ProductDetailView
                product={selectedProduct}
                onClose={() => {
                  if (window.history.state !== null || window.history.length > 2) {
                    window.history.back();
                  } else {
                    handleNavigate('home');
                  }
                }}
                onSelectProduct={handleSelectProduct}
              />
            </main>
          ) : currentView === 'home' ? (
            <main>
              <HeroSection
                onExploreClick={() => {
                  const el = document.getElementById('collection-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else handleNavigate('collection');
                }}
                onStoryClick={() => handleNavigate('philosophy')}
              />
              <FeaturedShowcase
                products={products}
                onSelectProduct={handleSelectProduct}
                config={cms?.homepageConfig?.signatureCreations}
              />
              <CraftPhilosophy />
              <IngredientStory ingredients={ingredients} onNavigate={handleNavigate} />
              <ProcessTimeline />
              <SignatureCollections
                products={products}
                onSelectProduct={handleSelectProduct}
              />
              <WellnessLifestyle onNavigate={handleNavigate} />
              <EditorialMagazine articles={articles} onNavigate={handleNavigate} />
              <AlhamCommunity />
              <AllProductsSection
                products={products}
                onSelectProduct={handleSelectProduct}
                config={cms?.homepageConfig?.allProducts}
              />
            </main>
          ) : currentView === 'collection' ? (
            <main className="pt-8">
              <SignatureCollections
                products={products}
                onSelectProduct={handleSelectProduct}
              />
              <FeaturedShowcase
                products={products}
                onSelectProduct={handleSelectProduct}
                config={cms?.homepageConfig?.signatureCreations}
              />
            </main>
          ) : currentView === 'ingredients' ? (
            <main className="pt-8">
              <IngredientStory ingredients={ingredients} onNavigate={handleNavigate} />
              <CraftPhilosophy />
            </main>
          ) : currentView === 'philosophy' ? (
            <main className="pt-8">
              <CraftPhilosophy />
              <ProcessTimeline />
            </main>
          ) : currentView === 'recipes' ? (
            <main className="pt-8">
              <EditorialMagazine articles={articles} onNavigate={handleNavigate} />
              <WellnessLifestyle onNavigate={handleNavigate} />
            </main>
          ) : null}
        </Suspense>
      </div>

      <Footer onNavigate={handleNavigate} onOpenCircle={() => setIsCircleModalOpen(true)} />
      <WhatsAppWidget />

      <Suspense fallback={null}>
        <CartDrawer />
        <CheckoutModal onNavigate={handleNavigate} />
        <AuthModal onNavigate={handleNavigate} />
        <AlhamCircleModal
          isOpen={isCircleModalOpen}
          onClose={() => setIsCircleModalOpen(false)}
        />
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CmsProvider>
          <TrackingProvider>
            <CartProvider>
              <MainAppContent />
            </CartProvider>
          </TrackingProvider>
        </CmsProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}


