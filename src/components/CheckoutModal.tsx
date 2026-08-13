import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCms } from '../context/CmsContext';
import { useLanguage } from '../context/LanguageContext';
import { useTracking } from './TrackingProvider';
import { calculateFreeShipping } from '../utils/delivery';
import {
  X,
  CheckCircle2,
  Truck,
  Banknote,
  ShieldCheck,
  Clock,
  User,
  ArrowRight,
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  Tag,
  Package,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Order, DeliveryZone } from '../types';

interface CheckoutModalProps {
  onNavigate?: (view: 'home' | 'collection' | 'ingredients' | 'philosophy' | 'recipes' | 'account' | 'admin') => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onNavigate }) => {
  const {
    cart,
    subtotal,
    discountAmount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    updateQuantity,
    removeFromCart,
    clearCart,
    isCheckoutModalOpen,
    setIsCheckoutModalOpen,
    setSelectedZoneId: setCartSelectedZoneId
  } = useCart();

  const { currentUser, loginDirectly } = useAuth();
  const { deliverySettings, paymentSettings } = useCms();
  const [paymentSubmissionData, setPaymentSubmissionData] = useState({ senderNumber: '', transactionId: '', screenshotBase64: '' });
  const { language, t } = useLanguage();
  const { trackEvent } = useTracking();

  const zones: DeliveryZone[] = deliverySettings?.zones && deliverySettings.zones.length > 0
    ? deliverySettings.zones
    : [];

  const activeZones = zones.filter(z => z.active);

  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [street, setStreet] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState(activeZones[0]?.id || 'z-dhaka');
  const [deliveryType, setDeliveryType] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'bKash' | 'Nagad' | 'Rocket' | 'Card / Online Payment'>('Cash on Delivery');
  const [orderNotes, setOrderNotes] = useState('');

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const selectedZone = activeZones.find(z => z.id === selectedZoneId) || activeZones[0];

  // Dynamic Free Shipping calculation for selected zone
  const zoneFreeShippingInfo = calculateFreeShipping(deliverySettings, subtotal, selectedZoneId);
  const isFreeDeliveryEligible = zoneFreeShippingInfo.isFree;

  // Dynamic Delivery Fee calculation
  let calculatedDeliveryFee = deliveryType === 'express'
    ? (selectedZone?.expressFee || 120)
    : (selectedZone?.standardFee || 60);

  if (isFreeDeliveryEligible && deliveryType === 'standard') {
    calculatedDeliveryFee = 0;
  }

  const finalTotal = Math.max(0, subtotal - discountAmount + (cart.length > 0 ? calculatedDeliveryFee : 0));

  // Track Purchase ONLY when the order is successfully completed and the Thank You view is reached
  React.useEffect(() => {
    if (completedOrder && trackEvent) {
      const orderItems = completedOrder.items || [];
      const purchasedProductIds = orderItems.map((i: any) => i.sku || i.productId || i.item_id || i.id);
      const totalQuantity = orderItems.reduce((sum: number, i: any) => sum + Number(i.quantity || 1), 0);

      trackEvent('purchase', {
        id: completedOrder.id,
        transaction_id: completedOrder.id,
        order_id: completedOrder.id,
        total: Number(completedOrder.total || 0),
        value: Number(completedOrder.total || 0),
        currency: 'BDT',
        deliveryFee: Number(completedOrder.deliveryFee || 0),
        shipping: Number(completedOrder.deliveryFee || 0),
        discount: Number(completedOrder.discount || 0),
        content_ids: purchasedProductIds,
        content_type: 'product',
        num_items: totalQuantity,
        items: orderItems.map((item: any) => ({
          productId: item.productId,
          sku: item.sku || item.productId,
          item_id: item.sku || item.productId || item.id,
          productName: item.productName || item.name,
          item_name: item.productName || item.name || item.item_name,
          price: Number(item.price || 0),
          quantity: Number(item.quantity || 1),
          item_category: item.category || 'Confectionery',
          item_variant: item.selectedWeight || item.weight || ''
        }))
      });
    }
  }, [completedOrder?.id, trackEvent]);

  React.useEffect(() => {
    if (isCheckoutModalOpen && !completedOrder && cart.length > 0 && trackEvent) {
      try {
        trackEvent('begin_checkout', {
          cartItems: cart,
          cartTotal: finalTotal || subtotal,
          currency: 'BDT',
          value: finalTotal || subtotal,
          coupon: appliedCoupon?.code || undefined,
          content_ids: cart.map(i => i.product.sku || i.product.id),
          content_type: 'product',
          num_items: cart.reduce((sum, i) => sum + i.quantity, 0),
          items: cart.map(item => ({
            item_id: item.product.sku || item.product.id,
            item_name: item.product.name,
            price: Number(item.product.price || 0),
            quantity: item.quantity,
            item_category: item.product.category || 'Confectionery',
            item_variant: item.selectedWeight || item.product.weight || ''
          }))
        });
      } catch (err) {
        console.error('Error tracking begin_checkout:', err);
      }
    }
  }, [isCheckoutModalOpen]);

  if (!isCheckoutModalOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    setCouponError('');
    setCouponSuccess('');
    const res = await applyCoupon(couponCode);
    if (res.success) {
      setCouponSuccess(res.message);
      setCouponCode('');
    } else {
      setCouponError(res.message);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (cart.length === 0) {
      alert(t('Your cart is empty.', 'আপনার কার্টটি ফাঁকা।'));
      return;
    }
    if (!fullName || !phone || !street) {
      alert(t('Please fill in your full name, mobile phone, and delivery street address.', 'অনুগ্রহ করে আপনার নাম, মোবাইল নম্বর এবং ঠিকানা দিন।'));
      return;
    }

    setIsSubmitting(true);

    const orderPayload = {
      customerEmail: email || 'guest@alham.com',
      customerName: fullName,
      customerPhone: phone,
      shippingAddress: {
        id: `addr-${Date.now()}`,
        fullName,
        phone,
        street,
        city: t(selectedZone?.nameEn || selectedZone?.name || 'Dhaka', selectedZone?.nameBn || 'ঢাকা'),
        district: t(selectedZone?.nameEn || selectedZone?.name || 'Dhaka', selectedZone?.nameBn || 'ঢাকা')
      },
      items: cart.map(i => ({
        productId: i.product.id,
        productName: t(i.product.name, i.product.nameBn),
        sku: i.product.sku || `ALH-${i.product.id.toUpperCase()}`,
        price: i.product.price,
        quantity: i.quantity,
        weight: t(i.selectedWeight || i.product.weight, i.product.weightBn),
        image: i.product.images[0]
      })),
      subtotal,
      discount: discountAmount,
      deliveryFee: calculatedDeliveryFee,
      total: finalTotal,
      paymentMethod,
      notes: orderNotes
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();
      setIsSubmitting(false);

      if (data.success && data.order) {
        // Automatically authenticate and log in the customer to the newly created/linked account
        if (data.user) {
          loginDirectly(data.user);
        }

        setCompletedOrder(data.order);
        clearCart();
      } else {
        alert(t('Could not place order. Please try again.', 'অর্ডার নেওয়া সম্ভব হয়নি। আবার চেষ্টা করুন।'));
      }
    } catch (err) {
      setIsSubmitting(false);
      alert(t('Server error processing order. Please try again.', 'সার্ভারে সমস্যা হয়েছে। আবার চেষ্টা করুন।'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#29231F]/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#F7F2E8] border border-[#E8DCC8] rounded-3xl max-w-4xl w-full p-4 sm:p-6 lg:p-8 relative shadow-2xl my-auto space-y-6 max-h-[92vh] overflow-y-auto text-left">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8DCC8]">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#A86445]">
              {completedOrder ? t('Order Confirmed', 'অর্ডার নিশ্চিত করা হয়েছে') : t('Checkout & Verification', 'চেকআউট ও অর্ডার')}
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#29231F]">
              {completedOrder ? t('Thank You for Your Order', 'ধন্যবাদ! আপনার অর্ডার গ্রহণ করা হয়েছে') : t('Review Your Order & Shipping', 'অর্ডার রিভিউ এবং ডেলিভারি')}
            </h2>
          </div>

          <button
            onClick={() => {
              setIsCheckoutModalOpen(false);
              setCompletedOrder(null);
            }}
            className="p-2 text-[#29231F] hover:bg-[#E8DCC8] rounded-full transition-colors cursor-pointer"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!completedOrder ? (
          cart.length === 0 ? (
            /* Empty Cart View in Checkout */
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-[#E8DCC8]/50 rounded-full flex items-center justify-center text-[#6F7655]">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#29231F]">
                {t('Your Cart is Empty', 'আপনার কার্টটি বর্তমানে ফাঁকা')}
              </h3>
              <p className="text-xs text-[#29231F]/70 max-w-sm mx-auto">
                {t('Please add products to your cart before proceeding to checkout.', 'চেকআউটে যাওয়ার আগে অনুগ্রহ করে আপনার পছন্দের পণ্য কার্টে যোগ করুন।')}
              </p>
              <button
                onClick={() => {
                  setIsCheckoutModalOpen(false);
                  if (onNavigate) onNavigate('collection');
                }}
                className="px-6 py-3 bg-[#6F7655] hover:bg-[#29231F] text-white text-xs font-bold rounded-xl transition-all shadow-md"
              >
                {t('Explore Artisanal Collection', 'পণ্যসমূহ দেখুন')}
              </button>
            </div>
          ) : (
            <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              
              {/* LEFT COLUMN: Delivery Info & Payment (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                
                {/* 1. Customer & Address Information */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DCC8] space-y-3 shadow-sm">
                  <h3 className="font-serif font-bold text-sm text-[#6F7655] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#E8DCC8] pb-2">
                    <Truck className="w-4 h-4 text-[#A86445]" />
                    <span>{t('1. Delivery Address & Contact', '১. ডেলিভারির তথ্য ও ঠিকানা')}</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[#29231F] font-medium mb-1">{t('Full Name *', 'পূর্ণ নাম *')}</label>
                      <input
                        type="text"
                        required
                        placeholder={t('e.g. Farhana Ahmed', 'যেমন: ফারহানা আহমেদ')}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3 py-2.5 border border-[#E8DCC8] rounded-xl bg-[#F7F2E8]/40 text-[#29231F] focus:outline-none focus:border-[#6F7655]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#29231F] font-medium mb-1">{t('Mobile Phone Number *', 'মোবাইল নম্বর *')}</label>
                      <input
                        type="tel"
                        required
                        placeholder="01711223344"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2.5 border border-[#E8DCC8] rounded-xl bg-[#F7F2E8]/40 text-[#29231F] font-mono focus:outline-none focus:border-[#6F7655]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#29231F] font-medium mb-1">{t('Email Address (Optional)', 'ইমেইল ঠিকানা (ঐচ্ছিক)')}</label>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2.5 border border-[#E8DCC8] rounded-xl bg-[#F7F2E8]/40 text-[#29231F] focus:outline-none focus:border-[#6F7655]"
                      />
                    </div>

                    {/* Delivery Zone / Location Selector */}
                    <div>
                      <label className="block text-[#29231F] font-medium mb-1">{t('Delivery District / Zone *', 'ডেলিভারি এলাকা *')}</label>
                      <select
                        value={selectedZoneId}
                        onChange={(e) => {
                          setSelectedZoneId(e.target.value);
                          setCartSelectedZoneId(e.target.value);
                        }}
                        className="w-full px-3 py-2.5 border border-[#E8DCC8] rounded-xl bg-[#F7F2E8]/40 text-[#29231F] font-semibold focus:outline-none focus:border-[#6F7655]"
                      >
                        {activeZones.map(z => {
                          const zMin = z.freeDeliveryMinAmount ?? 1500;
                          return (
                            <option key={z.id} value={z.id}>
                              {t(z.nameEn || z.name, z.nameBn)} (৳{z.standardFee} - {t(`Free over ৳${zMin}`, `৳${zMin} এর উপরে ফ্রি`)})
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[#29231F] font-medium mb-1">{t('Street Address / House / Road *', 'সম্পূর্ণ ঠিকানা / বাড়ি / রোড *')}</label>
                      <input
                        type="text"
                        required
                        placeholder={t('House 12, Road 5, Block C, Gulshan 1', 'বাড়ি ১২, রোড ৫, ব্লক সি, গুলশান ১')}
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="w-full px-3 py-2.5 border border-[#E8DCC8] rounded-xl bg-[#F7F2E8]/40 text-[#29231F] focus:outline-none focus:border-[#6F7655]"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Option */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DCC8] space-y-3 shadow-sm">
                  <h3 className="font-serif font-bold text-sm text-[#6F7655] uppercase tracking-wider flex items-center justify-between border-b border-[#E8DCC8] pb-2">
                    <span>{t('2. Delivery Courier Option', '২. ডেলিভারি অপশন')}</span>
                    <span className="text-[11px] font-mono text-[#A86445] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {t('3–4 Business Days', '৩-৪ কর্মদিবস')}
                    </span>
                  </h3>

                  <div className="text-xs">
                    <div className="p-3.5 rounded-xl border border-[#6F7655] bg-[#6F7655]/10 font-bold text-[#29231F] flex items-center justify-between">
                      <div className="flex flex-col space-y-0.5">
                        <span className="font-bold text-[#6F7655] text-sm">
                          {t('Standard Delivery — 3–4 business days', 'স্ট্যান্ডার্ড ডেলিভারি — ৩-৪ কর্মদিবস')}
                        </span>
                        <span className="text-[11px] text-[#29231F]/70">
                          {t('Nationwide doorstep delivery via fast courier', 'সারা দেশে ক্যাশ অন ডেলিভারি মাধ্যমে ডোরস্টেপ সার্ভিস')}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#A86445] font-mono">
                        {isFreeDeliveryEligible
                          ? t('FREE', 'ফ্রি')
                          : `৳${selectedZone?.standardFee}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DCC8] space-y-3 shadow-sm">
                  <h3 className="font-serif font-bold text-sm text-[#6F7655] uppercase tracking-wider border-b border-[#E8DCC8] pb-2">
                    {t('3. Payment Method', '৩. পেমেন্ট পদ্ধতি')}
                  </h3>
                  <div className="text-xs">
                    <div className="p-3.5 rounded-xl border border-[#6F7655] bg-[#6F7655]/10 font-bold text-[#29231F] flex items-center space-x-3">
                      <div className="p-2 bg-[#6F7655] text-white rounded-lg shrink-0">
                        <Banknote className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-[#29231F] text-sm">{t('Cash on Delivery', 'ক্যাশ অন ডেলিভারি')}</span>
                        <span className="text-[11px] text-[#29231F]/70">
                          {t('Pay with cash when your package arrives at your doorstep', 'পণ্য হাতে পেয়ে নগদ টাকায় মুল্য পরিশোধ করুন')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Notes */}
                <div className="bg-white p-4 rounded-2xl border border-[#E8DCC8] space-y-2 shadow-sm">
                  <label className="block text-xs font-bold text-[#29231F]">{t('Delivery Instructions / Notes (Optional)', 'ডেলিভারি নির্দেশনা (ঐচ্ছিক)')}</label>
                  <textarea
                    rows={2}
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder={t('e.g. Please call before delivery', 'যেমন: ডেলিভারির আগে ফোন দিন')}
                    className="w-full px-3 py-2 border border-[#E8DCC8] rounded-xl bg-[#F7F2E8]/40 text-xs text-[#29231F] focus:outline-none focus:border-[#6F7655]"
                  />
                </div>

              </div>


              {/* RIGHT COLUMN: YOUR ORDER SUMMARY (5 cols) */}
              <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-4">
                <div className="bg-[#1F1A17] text-[#F7F2E8] p-5 rounded-2xl border border-[#C8A96B]/30 shadow-xl space-y-4">
                  
                  {/* Order Summary Header */}
                  <div className="flex items-center justify-between border-b border-[#F7F2E8]/10 pb-3">
                    <h3 className="font-serif font-bold text-base text-[#C8A96B] flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-[#C8A96B]" />
                      <span>{t('Your Order', 'আপনার অর্ডার')}</span>
                    </h3>
                    <span className="text-xs font-mono font-bold bg-[#29231F] text-[#E8DCC8] px-2.5 py-1 rounded-full border border-[#C8A96B]/20">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)} {t('Items', 'টি')}
                    </span>
                  </div>

                  {/* ITEMIZED ORDER LIST */}
                  <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                    {cart.map((item) => {
                      const itemWeight = t(item.selectedWeight || item.product.weight, item.product.weightBn);
                      const lineTotal = item.product.price * item.quantity;
                      return (
                        <div
                          key={item.product.id}
                          className="flex items-center gap-3 p-2.5 bg-[#29231F] border border-[#F7F2E8]/10 rounded-xl hover:border-[#C8A96B]/40 transition-colors"
                        >
                          {/* Image */}
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-12 h-12 rounded-lg object-cover bg-black/40 border border-[#F7F2E8]/10 shrink-0"
                          />

                          {/* Product Details */}
                          <div className="flex-1 min-w-0 text-xs">
                            <p className="font-bold text-[#F7F2E8] truncate">
                              {t(item.product.name, item.product.nameBn)}
                            </p>
                            
                            <div className="flex items-center gap-2 text-[11px] text-[#E8DCC8]/70 mt-0.5">
                              <span className="bg-[#C8A96B]/15 text-[#C8A96B] px-1.5 py-0.2 rounded font-mono text-[10px]">
                                {itemWeight}
                              </span>
                              <span>৳{item.product.price}</span>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center bg-[#1F1A17] rounded-lg border border-[#F7F2E8]/15 px-1 py-0.5">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                  className="w-5 h-5 flex items-center justify-center text-white/70 hover:text-white rounded transition-colors"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="px-2 font-mono font-bold text-[11px] text-[#C8A96B]">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                  className="w-5 h-5 flex items-center justify-center text-white/70 hover:text-white rounded transition-colors"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeFromCart(item.product.id)}
                                className="text-red-400 hover:text-red-300 p-1 transition-colors"
                                title={t('Remove item', 'পণ্যটি মুছুন')}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Line Total */}
                          <div className="text-right shrink-0 font-serif font-bold text-sm text-[#C8A96B]">
                            ৳{lineTotal}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Coupon Code Section */}
                  <div className="pt-2 border-t border-[#F7F2E8]/10 text-xs">
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300">
                        <div className="flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="font-bold uppercase font-mono">{appliedCoupon.code}</span>
                          <span className="text-[10px] text-emerald-200">(-৳{discountAmount})</span>
                        </div>
                        <button
                          type="button"
                          onClick={removeCoupon}
                          className="text-emerald-400 hover:text-white text-[10px] font-bold underline"
                        >
                          {t('Remove', 'সরান')}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder={t('Promo Code / Coupon', 'কুপন কোড')}
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            className="w-full px-3 py-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded-xl text-white font-mono uppercase text-xs focus:outline-none focus:border-[#C8A96B]"
                          />
                          <button
                            type="button"
                            onClick={handleApplyCoupon}
                            className="px-3 py-2 bg-[#C8A96B] hover:bg-[#b09154] text-[#29231F] font-bold rounded-xl text-xs shrink-0 transition-colors"
                          >
                            {t('Apply', 'প্রয়োগ')}
                          </button>
                        </div>
                        {couponError && <p className="text-red-400 text-[10px]">{couponError}</p>}
                        {couponSuccess && <p className="text-emerald-400 text-[10px]">{couponSuccess}</p>}
                      </div>
                    )}
                  </div>

                  {/* Free Shipping Info Badge */}
                  {zoneFreeShippingInfo && (
                    <div className="p-2.5 bg-[#29231F] rounded-xl border border-[#F7F2E8]/10 text-[11px] text-[#E8DCC8]/90 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#C8A96B] shrink-0" />
                      <span>
                        {isFreeDeliveryEligible
                          ? t('🎉 You unlocked FREE Delivery for this zone!', '🎉 আপনি ফ্রি ডেলিভারি পাচ্ছেন!')
                          : t(
                              `Add ৳${zoneFreeShippingInfo.amountNeeded} more for FREE delivery`,
                              `আর ৳${zoneFreeShippingInfo.amountNeeded} টাকার কেনাকাটা করলে ফ্রি ডেলিভারি!`
                            )}
                      </span>
                    </div>
                  )}

                  {/* Calculations Breakdown */}
                  <div className="space-y-2 text-xs pt-2 border-t border-[#F7F2E8]/10">
                    <div className="flex justify-between text-[#E8DCC8]/80">
                      <span>{t('Subtotal', 'সাবটোটাল')}</span>
                      <span className="font-mono">৳{subtotal}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-400 font-medium">
                        <span>{t('Coupon Discount', 'কুপন ডিসকাউন্ট')}</span>
                        <span className="font-mono">-৳{discountAmount}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-[#E8DCC8]/80">
                      <span>{t('Courier Delivery Charge', 'ডেলিভারি চার্জ')}</span>
                      <span className={calculatedDeliveryFee === 0 ? 'text-emerald-400 font-bold' : 'font-mono'}>
                        {calculatedDeliveryFee === 0 ? t('FREE Delivery', 'ফ্রি ডেলিভারি') : `৳${calculatedDeliveryFee}`}
                      </span>
                    </div>

                    <div className="flex justify-between font-bold text-base text-white pt-2 border-t border-[#F7F2E8]/20">
                      <span>{t('Total Payable Amount', 'সর্বমোট প্রদেয়')}</span>
                      <span className="font-serif text-lg text-[#C8A96B]">৳{finalTotal}</span>
                    </div>
                  </div>

                  {/* Confirm Order Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    id="confirm-order-btn"
                    className="w-full py-4 bg-[#6F7655] hover:bg-[#A86445] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2 font-bold">
                        <Loader2 className="w-5 h-5 animate-spin text-white shrink-0" />
                        <span>{t('Processing Order...', 'অর্ডার প্রক্রিয়া চলছে...')}</span>
                      </div>
                    ) : (
                      <>
                        <span>{t('Place Order Now', 'অর্ডার নিশ্চিত করুন')}</span>
                        <span className="font-serif text-sm bg-black/20 px-2.5 py-0.5 rounded-lg">৳{finalTotal}</span>
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-center text-[#E8DCC8]/50 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C8A96B]" />
                    <span>{t('Cash on Delivery guaranteed upon inspection', 'পণ্য হাতে পেয়ে টাকা পরিশোধ করুন')}</span>
                  </p>

                </div>
              </div>

            </form>
          )
        ) : (
          /* ORDER CONFIRMATION / THANK YOU VIEW */
          <div className="py-4 space-y-6 text-center max-h-[75vh] overflow-y-auto pr-1">
            
            {completedOrder.paymentStatus === 'Pending Verification' ? (
              <div className="space-y-4">
                <div className="p-4 bg-[#6F7655] text-white w-fit mx-auto rounded-full shadow-lg">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#29231F]">Payment Submitted</h3>
                <p className="text-xs text-[#29231F]/80">Your payment information is pending verification by our team. We will notify you once verified.</p>
              </div>
            ) : (['bKash', 'Nagad', 'Rocket'].includes(completedOrder.paymentMethod) && !completedOrder.paymentSubmission) ? (
              <div className="space-y-4 text-left max-w-xl mx-auto">
                <h3 className="font-serif text-xl font-bold text-[#29231F] text-center">Complete Your Payment</h3>
                <div className="bg-[#E8DCC8]/30 p-4 rounded-xl border border-[#E8DCC8] space-y-3">
                  <p className="text-sm">Please pay <strong>৳{completedOrder.total}</strong> via {completedOrder.paymentMethod}</p>
                  
                  <div className="bg-white p-3 rounded-lg border border-[#E8DCC8]">
                    <p className="text-xs text-[#6F7655] uppercase font-bold mb-1">Send Money To</p>
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-lg font-bold">{paymentSettings?.[completedOrder.paymentMethod.toLowerCase()]?.number || '01XXXXXXXXX'}</span>
                      <span className="text-[10px] bg-[#A86445]/10 text-[#A86445] px-2 py-1 rounded-full uppercase font-bold tracking-wider">
                        {paymentSettings?.[completedOrder.paymentMethod.toLowerCase()]?.accountType || 'Personal'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-xs space-y-2 text-[#29231F]/80">
                    <p><strong>Instructions:</strong> {paymentSettings?.[completedOrder.paymentMethod.toLowerCase()]?.instructions}</p>
                    <p><strong>Reference:</strong> {paymentSettings?.[completedOrder.paymentMethod.toLowerCase()]?.referenceInstructions}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="font-bold text-sm">Submit Payment Details</h4>
                  
                  <div>
                    <label className="block text-xs font-bold text-[#29231F] mb-1">Sender Mobile Number</label>
                    <input 
                      type="text" 
                      value={paymentSubmissionData.senderNumber}
                      onChange={(e) => setPaymentSubmissionData({...paymentSubmissionData, senderNumber: e.target.value})}
                      className="w-full p-3 rounded-xl border border-[#E8DCC8] bg-white text-sm" 
                      placeholder="e.g., 01712345678" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-[#29231F] mb-1">Transaction ID</label>
                    <input 
                      type="text" 
                      value={paymentSubmissionData.transactionId}
                      onChange={(e) => setPaymentSubmissionData({...paymentSubmissionData, transactionId: e.target.value})}
                      className="w-full p-3 rounded-xl border border-[#E8DCC8] bg-white text-sm uppercase font-mono" 
                      placeholder="e.g., 9DF3XJ..." 
                    />
                    <p className="text-[10px] mt-1 text-[#6F7655]">{paymentSettings?.[completedOrder.paymentMethod.toLowerCase()]?.transactionIdInstructions}</p>
                  </div>

                  <button
                    onClick={async () => {
                      if(!paymentSubmissionData.senderNumber || !paymentSubmissionData.transactionId) {
                        alert('Please enter sender number and transaction ID');
                        return;
                      }
                      try {
                        const res = await fetch(`/api/orders/${completedOrder.id}/payment`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            method: completedOrder.paymentMethod,
                            amount: completedOrder.total,
                            senderNumber: paymentSubmissionData.senderNumber,
                            transactionId: paymentSubmissionData.transactionId,
                            screenshotUrl: paymentSubmissionData.screenshotBase64
                          })
                        });
                        if (res.ok) {
                          const updated = await res.json();
                          setCompletedOrder(updated);
                        }
                      } catch(e) { console.error(e); }
                    }}
                    className="w-full py-3 bg-[#A86445] text-white text-xs font-bold rounded-xl hover:bg-[#8A5035] transition-colors"
                  >
                    Submit Payment Information
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 bg-[#6F7655] text-white w-fit mx-auto rounded-full shadow-lg">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold text-[#A86445] uppercase tracking-wider bg-[#A86445]/10 px-3 py-1 rounded-full">
                    {t(`Order ID: ${completedOrder.id}`, `অর্ডার আইডি: ${completedOrder.id}`)}
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#29231F] pt-2">
                    {t('Order Successfully Placed!', 'অর্ডার সফলভাবে সম্পন্ন হয়েছে!')}
                  </h3>
                  <p className="text-xs text-[#29231F]/80 max-w-sm mx-auto">
                    {t(
                      `We have received your order for ${completedOrder.customerName}. Our team is preparing your artisanal products.`,
                      `আমরা ${completedOrder.customerName}-এর অর্ডারটি গ্রহণ করেছি। আমাদের কিচেন ফ্রেশ খাদ্য প্রস্তুত করছে।`
                    )}
                  </p>

                  {completedOrder.customerEmail && completedOrder.customerEmail !== 'guest@alham.com' && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-center gap-2 max-w-md mx-auto my-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium text-[11px]">
                        {t(
                          `Account authenticated as ${completedOrder.customerEmail}`,
                          `অ্যাকাউন্ট সংযুক্ত এবং ${completedOrder.customerEmail} হিসেবে লগইন করা হয়েছে`
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* CONFIRMED ORDER ITEMS BREAKDOWN */}
                <div className="bg-[#1F1A17] text-[#F7F2E8] p-5 rounded-2xl border border-[#C8A96B]/30 text-left max-w-xl mx-auto space-y-3 shadow-xl">
                  <div className="flex justify-between items-center border-b border-[#F7F2E8]/10 pb-2">
                    <span className="font-serif font-bold text-sm text-[#C8A96B] uppercase tracking-wider flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#C8A96B]" />
                      <span>{t('Ordered Products', 'অর্ডারকৃত পণ্যসমূহ')}</span>
                    </span>
                    <span className="text-xs font-mono text-[#E8DCC8]/70">
                      {completedOrder.items?.length || 0} {t('Items', 'টি পণ্য')}
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {completedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2.5 bg-[#29231F] rounded-xl border border-[#F7F2E8]/10">
                        {item.image && (
                          <img src={item.image} alt={item.productName} className="w-11 h-11 rounded-lg object-cover bg-black/40 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0 text-xs">
                          <p className="font-bold text-[#F7F2E8] truncate">{item.productName}</p>
                          <p className="text-[11px] text-[#E8DCC8]/70 mt-0.5 font-mono">
                            {item.weight && <span className="bg-[#C8A96B]/10 text-[#C8A96B] px-1 py-0.2 rounded mr-1.5">{item.weight}</span>}
                            <span>Qty: {item.quantity} × ৳{item.price}</span>
                          </p>
                        </div>
                        <div className="text-right shrink-0 font-serif font-bold text-sm text-[#C8A96B]">
                          ৳{item.price * item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Confirmed Totals Breakdown */}
                  <div className="pt-2 border-t border-[#F7F2E8]/10 space-y-1.5 text-xs text-[#E8DCC8]/80">
                    <div className="flex justify-between">
                      <span>{t('Subtotal', 'সাবটোটাল')}</span>
                      <span className="font-mono">৳{completedOrder.subtotal}</span>
                    </div>

                    {completedOrder.discount > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>{t('Discount', 'ডিসকাউন্ট')}</span>
                        <span className="font-mono">-৳{completedOrder.discount}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>{t('Delivery Fee', 'ডেলিভারি চার্জ')}</span>
                      <span className="font-mono">৳{completedOrder.deliveryFee}</span>
                    </div>

                    <div className="flex justify-between font-bold text-base text-white pt-2 border-t border-[#F7F2E8]/20">
                      <span>{t('Grand Total', 'সর্বমোট')}</span>
                      <span className="font-serif text-lg text-[#C8A96B]">৳{completedOrder.total}</span>
                    </div>
                  </div>
                </div>

                {/* Recipient Shipping Details */}
                <div className="p-4 bg-[#E8DCC8]/50 rounded-2xl text-xs space-y-2 text-left max-w-xl mx-auto border border-[#E8DCC8]">
                  <div className="flex justify-between">
                    <span className="text-[#6F7655] font-semibold">{t('Deliver To:', 'প্রাপকের ঠিকানা:')}</span>
                    <span className="font-medium text-[#29231F]">{completedOrder.shippingAddress?.street}, {completedOrder.shippingAddress?.district}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6F7655] font-semibold">{t('Contact Phone:', 'ফোন নম্বর:')}</span>
                    <span className="font-mono font-medium text-[#29231F]">{completedOrder.customerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6F7655] font-semibold">{t('Payment Method:', 'পেমেন্ট পদ্ধতি:')}</span>
                    <span className="font-medium text-[#29231F]">{completedOrder.paymentMethod}</span>
                  </div>
                </div>
              </>
            )}
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-xl mx-auto">
              <button
                onClick={() => {
                  setIsCheckoutModalOpen(false);
                  setCompletedOrder(null);
                  if (onNavigate) onNavigate('account');
                }}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#6F7655] hover:bg-[#29231F] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>{t('Go to My Account', 'আমার অ্যাকাউন্টে যান')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setIsCheckoutModalOpen(false);
                  setCompletedOrder(null);
                  if (onNavigate) onNavigate('home');
                }}
                className="w-full sm:w-auto px-6 py-3.5 bg-transparent hover:bg-[#E8DCC8]/50 text-[#29231F] border border-[#E8DCC8] text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                {t('Continue Shopping', 'শপিং চালিয়ে যান')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
