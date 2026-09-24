import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Tag, ShieldCheck, Truck, Store, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getProductImageUrl, handleImageErrorFallback } from '../utils/imageUrl';
import { API_BASE_URL } from '../config/api';

export default function SmartCartDrawer({
  isOpen,
  onClose,
  cart,
  removeFromCart,
  cartTotal,
  onCheckout,
  isCheckingOut,
  appliedCoupon,
  setAppliedCoupon
}) {
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMsg, setCouponMsg] = useState(null);

  // Group items by vendor/seller to provide multi-vendor intelligence
  const vendorGroups = cart.reduce((acc, item) => {
    const vendor = item.sellerName || 'Independent Artisan';
    if (!acc[vendor]) acc[vendor] = [];
    acc[vendor].push(item);
    return acc;
  }, {});

  const distinctVendorsCount = Object.keys(vendorGroups).length;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponMsg(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, cartTotal })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon(data);
        setCouponMsg({ type: 'success', text: data.message });
      } else {
        setCouponMsg({ type: 'error', text: data.message || 'Invalid coupon code' });
      }
    } catch (err) {
      setCouponMsg({ type: 'error', text: 'Failed to validate coupon' });
    } finally {
      setCouponLoading(false);
    }
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = Math.max(0, cartTotal - discountAmount);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed top-0 right-0 h-full w-full max-w-lg bg-dark-800 z-[70] shadow-2xl border-l border-white/10 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 flex justify-between items-center border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">Smart Cart</h2>
                  <p className="text-xs text-gray-400">Unified Multi-Vendor Checkout</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Smart Multi-Vendor Intelligence Banner */}
            {cart.length > 0 && (
              <div className="mx-6 mt-4 p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30">
                <div className="flex items-center gap-2 text-xs font-bold text-brand-300 mb-1">
                  <Store className="w-4 h-4" />
                  <span>Multi-Vendor Order Splitting ({distinctVendorsCount} {distinctVendorsCount === 1 ? 'Seller' : 'Sellers'})</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Items will be automatically grouped into {distinctVendorsCount} fulfillment {distinctVendorsCount === 1 ? 'package' : 'packages'}. Delivery timelines are coordinated independently for fastest arrival.
                </p>
              </div>
            )}

            {/* Cart Items grouped by vendor */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="text-center text-gray-400 mt-28">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30 text-brand-400" />
                  <p className="font-medium text-lg">Your cart is empty</p>
                  <p className="text-xs text-gray-500 mt-1">Explore trending products in the marketplace.</p>
                </div>
              ) : (
                Object.entries(vendorGroups).map(([vendor, items]) => (
                  <div key={vendor} className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-400 px-1">
                      <span className="flex items-center gap-1.5 text-brand-400">
                        <Store className="w-3.5 h-3.5" /> {vendor}
                      </span>
                      <span className="text-[11px] text-gray-500">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
                    </div>

                    {items.map((item) => (
                      <div key={item._id} className="flex gap-4 items-center bg-white/5 p-3 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                        <img 
                          src={getProductImageUrl(item.image)} 
                          alt={item.name} 
                          onError={(e) => handleImageErrorFallback(e, item.image)}
                          className="w-16 h-16 object-cover rounded-xl shrink-0" 
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm truncate text-white">{item.name}</h4>
                          <p className="text-brand-400 font-semibold text-sm">₹{item.price.toLocaleString()}</p>
                          <span className="text-[11px] text-gray-400">Qty: {item.qty}</span>
                        </div>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-gray-400 hover:text-red-400 p-2 rounded-lg hover:bg-white/5 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>

            {/* Footer with Coupon & Checkout */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-dark-900 space-y-4">
                {/* Coupon input */}
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. SPHERE10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white uppercase placeholder-gray-500 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-xs font-bold rounded-xl transition-colors"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </form>

                {couponMsg && (
                  <p className={`text-xs ${couponMsg.type === 'success' ? 'text-emerald-400' : 'text-red-400'} font-medium`}>
                    {couponMsg.text}
                  </p>
                )}

                {/* Pricing Summary */}
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-400 text-xs">
                    <span>Subtotal:</span>
                    <span>₹{cartTotal.toLocaleString()}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-400 text-xs">
                      <span>Discount ({appliedCoupon.code}):</span>
                      <span>-₹{discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-white/10 text-white">
                    <span>Grand Total:</span>
                    <span className="text-brand-400">₹{finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={onCheckout}
                  disabled={isCheckingOut}
                  className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(20,184,166,0.4)] flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-5 h-5" />
                  {isCheckingOut ? 'Reserving Inventory & Creating Split Orders...' : 'Proceed to Unified Checkout'}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

