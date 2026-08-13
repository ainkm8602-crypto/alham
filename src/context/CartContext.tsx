import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Coupon } from '../types';
import { useCms } from './CmsContext';
import { useTracking } from '../components/TrackingProvider';
import { calculateFreeShipping, FreeShippingInfo } from '../utils/delivery';

import { Check, ArrowRight, X } from 'lucide-react';

interface ToastState {
  show: boolean;
  productName: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedWeight?: string, openDrawer?: boolean) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  subtotal: number;
  appliedCoupon: Coupon | null;
  discountAmount: number;
  deliveryFee: number;
  freeShippingInfo: FreeShippingInfo;
  selectedZoneId: string;
  setSelectedZoneId: (zoneId: string) => void;
  total: number;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  quickBuy: (product: Product, quantity?: number, selectedWeight?: string) => void;
  isCheckoutModalOpen: boolean;
  setIsCheckoutModalOpen: (open: boolean) => void;
  cartBumpKey: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { deliverySettings } = useCms();
  const trackingContext = useTracking();
  const trackEvent = trackingContext?.trackEvent;
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('alham_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [cartBumpKey, setCartBumpKey] = useState(0);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('alham_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (toast && toast.show) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const freeShippingInfo = calculateFreeShipping(deliverySettings, subtotal, selectedZoneId);
  const activeZone = freeShippingInfo.selectedZone;
  const standardFee = activeZone?.standardFee || 60;
  const deliveryFee = subtotal === 0 ? 0 : (freeShippingInfo.isFree ? 0 : standardFee);

  useEffect(() => {
    if (appliedCoupon) {
      if (appliedCoupon.discountType === 'percentage') {
        setDiscountAmount(Math.round((subtotal * appliedCoupon.discountValue) / 100));
      } else {
        setDiscountAmount(appliedCoupon.discountValue);
      }
    } else {
      setDiscountAmount(0);
    }
  }, [subtotal, appliedCoupon]);

  const total = Math.max(0, subtotal - discountAmount + (cart.length > 0 ? deliveryFee : 0));

  const addToCart = (product: Product, quantity = 1, selectedWeight?: string, openDrawer = false) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity, selectedWeight: selectedWeight || product.weight }];
    });

    setCartBumpKey(Date.now());

    if (trackEvent) {
      try {
        trackEvent('add_to_cart', {
          currency: 'BDT',
          value: Number(product.price || 0) * quantity,
          content_ids: [product.id],
          content_name: product.name,
          content_type: 'product',
          quantity: quantity,
          items: [{
            item_id: product.id,
            item_name: product.name,
            price: Number(product.price || 0),
            quantity: quantity,
            item_category: product.category || 'Confectionery',
            item_variant: selectedWeight || product.weight || ''
          }]
        });
      } catch (e) {
        console.error('Error tracking add_to_cart:', e);
      }
    }

    if (openDrawer) {
      setIsCartOpen(true);
    } else {
      setToast({
        show: true,
        productName: product.name
      });
    }
  };

  const removeFromCart = (productId: string) => {
    const existing = cart.find(item => item.product.id === productId);
    if (existing && trackEvent) {
      try {
        trackEvent('remove_from_cart', {
          currency: 'BDT',
          value: Number(existing.product.price || 0) * existing.quantity,
          content_ids: [existing.product.id],
          content_name: existing.product.name,
          content_type: 'product',
          quantity: existing.quantity,
          items: [{
            item_id: existing.product.id,
            item_name: existing.product.name,
            price: Number(existing.product.price || 0),
            quantity: existing.quantity,
            item_category: existing.product.category || 'Confectionery',
            item_variant: existing.selectedWeight || existing.product.weight || ''
          }]
        });
      } catch (e) {
        console.error('Error tracking remove_from_cart:', e);
      }
    }
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const existing = cart.find(item => item.product.id === productId);
    if (!existing) return;

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const diff = quantity - existing.quantity;
    if (diff > 0 && trackEvent) {
      try {
        trackEvent('add_to_cart', {
          currency: 'BDT',
          value: Number(existing.product.price || 0) * diff,
          content_ids: [existing.product.id],
          content_name: existing.product.name,
          content_type: 'product',
          quantity: diff,
          items: [{
            item_id: existing.product.id,
            item_name: existing.product.name,
            price: Number(existing.product.price || 0),
            quantity: diff,
            item_category: existing.product.category || 'Confectionery',
            item_variant: existing.selectedWeight || existing.product.weight || ''
          }]
        });
      } catch (e) {
        console.error('Error tracking add_to_cart on qty increase:', e);
      }
    } else if (diff < 0 && trackEvent) {
      const removeQty = Math.abs(diff);
      try {
        trackEvent('remove_from_cart', {
          currency: 'BDT',
          value: Number(existing.product.price || 0) * removeQty,
          content_ids: [existing.product.id],
          content_name: existing.product.name,
          content_type: 'product',
          quantity: removeQty,
          items: [{
            item_id: existing.product.id,
            item_name: existing.product.name,
            price: Number(existing.product.price || 0),
            quantity: removeQty,
            item_category: existing.product.category || 'Confectionery',
            item_variant: existing.selectedWeight || existing.product.weight || ''
          }]
        });
      } catch (e) {
        console.error('Error tracking remove_from_cart on qty decrease:', e);
      }
    }

    setCart(prev =>
      prev.map(item => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  const applyCoupon = async (code: string) => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal })
      });
      const data = await res.json();
      if (data.success) {
        setAppliedCoupon(data.coupon);
        setDiscountAmount(data.discountAmount);
        return { success: true, message: `Coupon '${data.coupon.code}' applied successfully!` };
      }
      return { success: false, message: data.error || 'Failed to apply coupon' };
    } catch (err) {
      return { success: false, message: 'Server error validating coupon' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  const quickBuy = (product: Product, quantity = 1, selectedWeight?: string) => {
    addToCart(product, quantity, selectedWeight);
    setIsCartOpen(false);
    setIsCheckoutModalOpen(true);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        subtotal,
        appliedCoupon,
        discountAmount,
        deliveryFee,
        freeShippingInfo,
        selectedZoneId,
        setSelectedZoneId,
        total,
        applyCoupon,
        removeCoupon,
        quickBuy,
        isCheckoutModalOpen,
        setIsCheckoutModalOpen,
        cartBumpKey
      }}
    >
      {children}

      {/* Minimal Temporary Confirmation Toast */}
      
        {toast && toast.show && (
          <div
            key="cart-toast-modal"
            
            
            
            
            className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[9999] max-w-sm w-[calc(100vw-2.5rem)] bg-[#29231F] text-[#F7F2E8] p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-[#C8A96B]/40 flex items-center justify-between gap-3 backdrop-blur-md"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#A86445] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#C8A96B] uppercase tracking-wider flex items-center gap-1">
                  <span>✓ Added to Cart</span>
                </div>
                <p className="text-xs sm:text-sm font-serif font-medium text-[#F7F2E8] truncate">
                  {toast.productName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setToast(null);
                  setIsCartOpen(true);
                }}
                className="px-3.5 py-1.5 bg-[#A86445] hover:bg-[#8B4D31] text-white text-[11px] sm:text-xs font-bold rounded-full transition-colors flex items-center gap-1 shadow-sm uppercase tracking-wider"
              >
                <span>View Cart</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setToast(null)}
                className="p-1 text-[#F7F2E8]/50 hover:text-white transition-colors"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
