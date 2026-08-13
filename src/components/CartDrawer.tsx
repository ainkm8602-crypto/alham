import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useTracking } from './TrackingProvider';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, CheckCircle2 } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { trackEvent } = useTracking();
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    appliedCoupon,
    discountAmount,
    deliveryFee,
    freeShippingInfo,
    total,
    applyCoupon,
    removeCoupon,
    setIsCheckoutModalOpen
  } = useCart();

  const [couponCode, setCouponCode] = useState('');

  React.useEffect(() => {
    if (isCartOpen) {
      trackEvent('view_cart', {
        cartItems: cart,
        cartTotal: total,
        currency: 'BDT',
        value: total,
        content_ids: cart.map(item => item.product.sku || item.product.id),
        items: cart.map(item => ({
          item_id: item.product.sku || item.product.id,
          item_name: item.product.name,
          price: Number(item.product.price || 0),
          quantity: item.quantity,
          item_category: item.product.category || 'Confectionery',
          item_variant: item.selectedWeight || item.product.weight || ''
        }))
      });
    }
  }, [isCartOpen]);

  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  if (!isCartOpen) return null;

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

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#29231F]/60 backdrop-blur-sm flex justify-end">
      <div className="bg-[#F7F2E8] w-full max-w-md h-full shadow-2xl flex flex-col justify-between p-6 relative border-l border-[#E8DCC8]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8DCC8]">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-[#6F7655]" />
            <h2 className="font-serif text-xl font-bold text-[#29231F]">Your Bag</h2>
            <span className="text-xs font-mono text-[#A86445] bg-[#A86445]/10 px-2 py-0.5 rounded-full">
              {cart.reduce((s, i) => s + i.quantity, 0)} Items
            </span>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            id="close-cart-drawer"
            className="p-1.5 text-[#29231F] hover:bg-[#E8DCC8] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Meter */}
        {freeShippingInfo && freeShippingInfo.freeDeliveryEnabled && (
          <div className="my-3 p-3 bg-[#E8DCC8]/50 rounded-xl text-xs space-y-1">
            <div className="flex justify-between font-medium text-[#29231F]">
              <span>
                {freeShippingInfo.isFree
                  ? '🎉 You unlocked Free Delivery!'
                  : `Add ৳${freeShippingInfo.amountNeeded} more for Free Shipping`}
              </span>
              <span>৳{freeShippingInfo.threshold} Target</span>
            </div>
            <div className="w-full bg-[#E8DCC8] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#6F7655] h-full transition-all duration-300"
                style={{ width: `${freeShippingInfo.progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {cart.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <ShoppingBag className="w-12 h-12 text-[#E8DCC8] mx-auto" />
              <p className="font-serif font-bold text-lg text-[#29231F]">Your bag is empty</p>
              <p className="text-xs text-[#29231F]/60 max-w-xs mx-auto">
                Discover our signature Snickers bars, Khajur Barfi, and White Nougat.
              </p>
            </div>
          ) : (
            cart.map(item => (
              <div
                key={item.product.id}
                className="p-3 bg-white border border-[#E8DCC8] rounded-xl flex space-x-3 text-left shadow-sm"
              >
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-lg object-cover bg-[#E8DCC8] shrink-0"
                />

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-serif font-bold text-xs text-[#29231F]">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => {
                            trackEvent('remove_from_cart', {
                              currency: 'BDT',
                              value: item.product.price * item.quantity,
                              items: [{
                                item_id: item.product.id,
                                item_name: item.product.name,
                                price: item.product.price,
                                quantity: item.quantity
                              }]
                            });
                            removeFromCart(item.product.id);
                        }}
                        className="text-[#29231F]/40 hover:text-red-600 transition-colors p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-[10px] text-[#A86445] font-medium">{item.selectedWeight}</span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-[#E8DCC8] rounded bg-[#F7F2E8]">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="px-2 py-0.5 text-xs font-bold text-[#29231F] hover:bg-[#E8DCC8]"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="px-2 py-0.5 text-xs font-bold text-[#29231F] hover:bg-[#E8DCC8]"
                      >
                        +
                      </button>
                    </div>

                    <span className="font-serif font-bold text-xs text-[#29231F]">
                      ৳{item.product.price * item.quantity}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout Summary */}
        {cart.length > 0 && (
          <div className="pt-4 border-t border-[#E8DCC8] space-y-3 text-xs">
            {/* Coupon Code Section */}
            <div>
              {appliedCoupon ? (
                <div className="p-2.5 bg-[#6F7655]/10 border border-[#6F7655]/30 rounded-lg flex items-center justify-between text-xs">
                  <span className="font-medium text-[#6F7655] flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> Code '{appliedCoupon.code}' applied (-৳{discountAmount})
                  </span>
                  <button onClick={removeCoupon} className="text-xs text-red-600 font-bold underline">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Coupon Code (e.g. ALHAMFIRST)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-2 border border-[#E8DCC8] rounded-lg bg-white text-xs text-[#29231F] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-[#29231F] text-white text-xs font-medium rounded-lg hover:bg-[#6F7655]"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && <p className="text-[11px] text-red-600 mt-1">{couponError}</p>}
              {couponSuccess && <p className="text-[11px] text-[#6F7655] mt-1">{couponSuccess}</p>}
            </div>

            {/* Calculations */}
            <div className="space-y-1.5 text-[#29231F]/80">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>৳{subtotal}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-[#A86445]">
                  <span>Discount</span>
                  <span>-৳{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span>{deliveryFee === 0 ? 'FREE' : `৳${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#29231F] pt-1 border-t border-[#E8DCC8]">
                <span>Total Amount</span>
                <span className="font-serif text-lg">৳{total}</span>
              </div>
            </div>

            <button
              onClick={handleProceedToCheckout}
              id="proceed-checkout-btn"
              className="w-full py-3.5 bg-[#6F7655] hover:bg-[#29231F] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center space-x-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
