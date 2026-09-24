import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, RefreshCcw, MessageSquare, Receipt, ArrowRight, ShieldCheck, 
  CheckCircle, Truck, Clock, AlertCircle, Printer, X, ShoppingBag, ExternalLink, ChevronRight
} from 'lucide-react';
import { showInAppAlert, showInAppToast } from './components/InAppNotificationModal';
import { getProductImageUrl, handleImageErrorFallback } from './utils/imageUrl';

export default function PostPurchaseCenter({ currentUser, onNavigateView }) {
  const [activeTab, setActiveTab] = useState('tracking'); // tracking | returns | support
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [returnsList, setReturnsList] = useState([]);

  // Return Form State
  const [selectedReturnOrder, setSelectedReturnOrder] = useState('');
  const [selectedReturnProduct, setSelectedReturnProduct] = useState('');
  const [returnReason, setReturnReason] = useState('Quality not as expected');
  const [returnQuantity, setReturnQuantity] = useState(1);

  // Load orders from localStorage and backend API
  const loadOrders = async () => {
    setLoadingOrders(true);
    let combined = [];

    // 1. Load from localStorage
    try {
      const local = JSON.parse(localStorage.getItem('shopsphere_customer_orders') || '[]');
      if (Array.isArray(local)) combined = [...local];
    } catch (e) {
      console.error(e);
    }

    // 2. Fetch from backend
    try {
      const customerId = currentUser?._id || '65f0a1b2c3d4e5f6a7b8c9d0';
      const res = await fetch(`http://localhost:5000/api/orders/customer/${customerId}`);
      if (res.ok) {
        const backendOrders = await res.json();
        if (Array.isArray(backendOrders) && backendOrders.length > 0) {
          // Format backend orders
          const formatted = backendOrders.map(mo => ({
            id: mo._id || `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
            date: mo.createdAt ? mo.createdAt.split('T')[0] : '2026-09-24',
            status: mo.sellerOrders?.[0]?.status || 'CONFIRMED',
            totalPrice: mo.totalPrice || 0,
            items: mo.sellerOrders?.flatMap(so => so.orderItems || []) || [],
            sellerOrders: mo.sellerOrders || [],
            expectedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }));
          
          // Merge unique by ID
          const existingIds = new Set(combined.map(o => o.id));
          formatted.forEach(fo => {
            if (!existingIds.has(fo.id)) {
              combined.push(fo);
              existingIds.add(fo.id);
            }
          });
        }
      }
    } catch (err) {
      console.warn("Could not fetch remote customer orders, using local storage", err);
    }

    // 3. If still empty, provide seeded authentic initial order
    if (combined.length === 0) {
      combined = [
        {
          id: 'ORD-89234',
          date: '2026-09-22',
          status: 'SHIPPED',
          totalPrice: 29999,
          customer: { name: currentUser?.name || 'Customer', email: currentUser?.email || 'customer@shopsphere.com', phone: '+91 98450 11223' },
          shippingAddress: { address: 'Flat 402, Green Meadows, Road No 10, Banjara Hills', city: 'Hyderabad', postalCode: '500034', country: 'India' },
          items: [
            { 
              name: 'Quantum Noise-Cancelling Headphones', 
              image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', 
              price: 29999, 
              qty: 1 
            }
          ],
          expectedDelivery: '2026-09-28',
          sellerOrders: [
            { sellerName: 'Acoustic Labs Artisan Studio', status: 'SHIPPED' }
          ]
        }
      ];
      try {
        localStorage.setItem('shopsphere_customer_orders', JSON.stringify(combined));
      } catch (e) {}
    }

    setOrders(combined);
    if (combined.length > 0) {
      setSelectedReturnOrder(combined[0].id);
      if (combined[0].items && combined[0].items.length > 0) {
        setSelectedReturnProduct(combined[0].items[0].name);
      }
    }

    // Load returns
    try {
      const storedReturns = JSON.parse(localStorage.getItem('shopsphere_returns') || '[]');
      setReturnsList(storedReturns);
    } catch (e) {}

    setLoadingOrders(false);
  };

  useEffect(() => {
    loadOrders();
    const handleOrderSync = () => loadOrders();
    window.addEventListener('shopsphere_order_updated', handleOrderSync);
    window.addEventListener('storage', handleOrderSync);
    return () => {
      window.removeEventListener('shopsphere_order_updated', handleOrderSync);
      window.removeEventListener('storage', handleOrderSync);
    };
  }, [currentUser]);

  // Update return products when selected return order changes
  useEffect(() => {
    const targetOrder = orders.find(o => o.id === selectedReturnOrder);
    if (targetOrder && targetOrder.items && targetOrder.items.length > 0) {
      setSelectedReturnProduct(targetOrder.items[0].name);
    }
  }, [selectedReturnOrder, orders]);

  // Advance tracking stage for demonstration
  const handleAdvanceStatus = (orderId) => {
    const statusCycle = ['CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    setOrders(prev => {
      const updated = prev.map(o => {
        if (o.id === orderId) {
          const currentIndex = statusCycle.indexOf(o.status);
          const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
          showInAppToast({ message: `Order #${orderId} milestone updated to: ${nextStatus}`, type: 'info' });
          return { ...o, status: nextStatus };
        }
        return o;
      });
      try {
        localStorage.setItem('shopsphere_customer_orders', JSON.stringify(updated));
        window.dispatchEvent(new Event('shopsphere_order_updated'));
      } catch (e) {}
      return updated;
    });
  };

  // Submit return
  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    if (!selectedReturnOrder || !selectedReturnProduct) {
      showInAppAlert({
        title: 'Missing Details',
        message: 'Please select an order and item to return.',
        type: 'warning',
        confirmText: 'OK'
      });
      return;
    }

    const newReturn = {
      id: `RET-${Date.now().toString().slice(-5)}`,
      orderId: selectedReturnOrder,
      productName: selectedReturnProduct,
      reason: returnReason,
      quantity: returnQuantity,
      status: 'PENDING_APPROVAL',
      date: new Date().toISOString().split('T')[0]
    };

    try {
      await fetch('http://localhost:5000/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedReturnOrder,
          productId: selectedReturnProduct,
          productName: selectedReturnProduct,
          reason: returnReason,
          quantity: returnQuantity
        })
      });
    } catch (err) {
      console.warn("Backend return saved locally", err);
    }

    const updated = [newReturn, ...returnsList];
    setReturnsList(updated);
    try {
      localStorage.setItem('shopsphere_returns', JSON.stringify(updated));
    } catch (e) {}

    showInAppAlert({
      title: 'Return Request Logged',
      message: `Return request #${newReturn.id} for "${selectedReturnProduct}" submitted.\nOur merchant care team will review and email your prepaid shipping return label within 24 hours.`,
      type: 'success',
      confirmText: 'OK'
    });
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 max-w-6xl mx-auto min-h-screen text-white relative z-10">
      {/* Header Banner */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-xs font-semibold text-teal-300 mb-2">
            <Package className="w-3.5 h-3.5" />
            <span>Customer Fulfillment & Order Tracking</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            My Orders & Post-Purchase Care
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Real-time multi-vendor package milestones, official tax invoices, and verified returns.
          </p>
        </div>

        {onNavigateView && (
          <button
            onClick={() => onNavigateView('customer')}
            className="px-5 py-2.5 rounded-full glass-panel-3d border border-white/15 hover:border-teal-400 text-xs font-bold flex items-center gap-2 hover:bg-white/5 transition-all text-gray-300 hover:text-white"
          >
            <ShoppingBag className="w-4 h-4 text-teal-400" />
            <span>Continue Shopping</span>
          </button>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 sm:gap-4 mb-8 overflow-x-auto pb-2 border-b border-white/10">
        {[
          { id: 'tracking', label: `My Orders (${orders.length})`, icon: Package },
          { id: 'returns', label: `Returns & Refunds (${returnsList.length})`, icon: RefreshCcw },
          { id: 'support', label: 'Artisan Guarantee & Support', icon: ShieldCheck }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap border ${
                isActive
                  ? 'bg-gradient-to-r from-teal-500 to-brand-500 text-white border-teal-300/40 shadow-lg shadow-teal-500/20'
                  : 'glass-panel-3d text-gray-400 hover:text-white border-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Orders Tracking */}
      {activeTab === 'tracking' && (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="glass-panel-3d p-12 rounded-3xl border border-white/10 text-center">
              <Package className="w-12 h-12 text-gray-500 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-white mb-2">No Orders Placed Yet</h3>
              <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
                When you purchase items from our verified independent artisans, your orders and live tracking milestones will appear right here.
              </p>
              {onNavigateView && (
                <button
                  onClick={() => onNavigateView('customer')}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-teal-500 to-brand-500 text-white font-bold text-xs shadow-lg hover:brightness-110 transition-all"
                >
                  Explore Marketplace Catalog
                </button>
              )}
            </div>
          ) : (
            orders.map(order => {
              const status = order.status || 'CONFIRMED';
              const progressMap = {
                'PLACED': 15,
                'CONFIRMED': 25,
                'PACKED': 50,
                'SHIPPED': 75,
                'OUT_FOR_DELIVERY': 85,
                'DELIVERED': 100
              };
              const percent = progressMap[status] || (status === 'OUT_FOR_DELIVERY' ? 85 : 35);
              const isDelivered = status === 'DELIVERED';

              return (
                <div key={order.id} className="glass-panel-3d p-6 sm:p-7 rounded-3xl border border-white/10 space-y-6">
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-black text-teal-400">Order #{order.id}</span>
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                          isDelivered
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : status === 'OUT_FOR_DELIVERY'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            : status === 'SHIPPED'
                            ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          {status === 'OUT_FOR_DELIVERY' ? 'Out for Delivery' : status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Placed on {order.date} • Expected Arrival: <span className="text-gray-200 font-semibold">{order.expectedDelivery || '5 business days'}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => setSelectedInvoiceOrder(order)}
                        className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors text-gray-200 hover:text-white"
                        title="View printable tax invoice receipt"
                      >
                        <Receipt className="w-3.5 h-3.5 text-teal-400" />
                        <span>Invoice</span>
                      </button>

                      <button
                        onClick={() => handleAdvanceStatus(order.id)}
                        className="px-3 py-2 rounded-xl bg-white/5 hover:bg-teal-500/20 border border-white/15 text-[11px] font-semibold text-gray-300 hover:text-teal-300 transition-colors"
                        title="Simulate dispatch timeline progression"
                      >
                        Advance Milestone
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Progress Timeline */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-teal-400" />
                        <span>Fulfillment Milestone</span>
                      </span>
                      <span className="text-xs font-mono text-teal-400 font-bold">{percent}% complete</span>
                    </div>

                    <div className="relative mb-3">
                      <div className="overflow-hidden h-2.5 rounded-full bg-white/10">
                        <div 
                          style={{ width: `${percent}%` }} 
                          className="h-full bg-gradient-to-r from-teal-400 via-brand-400 to-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(20,184,166,0.6)]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 text-center text-[11px] font-semibold text-gray-400">
                      <span className={percent >= 25 ? 'text-teal-300 font-bold' : ''}>1. Confirmed</span>
                      <span className={percent >= 50 ? 'text-teal-300 font-bold' : ''}>2. Packed</span>
                      <span className={percent >= 75 ? 'text-blue-300 font-bold' : ''}>3. Out for Delivery</span>
                      <span className={percent >= 100 ? 'text-emerald-400 font-bold' : ''}>4. Delivered</span>
                    </div>
                  </div>

                  {/* Items in this Order */}
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Purchased Items ({order.items?.length || 0})
                    </p>
                    <div className="divide-y divide-white/5">
                      {order.items && order.items.map((item, idx) => (
                        <div key={idx} className="py-3 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3.5 min-w-0">
                            <img
                              src={getProductImageUrl(item.image || item.imageUrl)}
                              alt={item.name}
                              onError={(e) => handleImageErrorFallback(e, item.image || item.imageUrl)}
                              className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0 bg-dark-950"
                            />
                            <div className="min-w-0">
                              <h4 className="font-bold text-sm text-white truncate">{item.name}</h4>
                              <p className="text-xs text-gray-400 mt-0.5">
                                Qty: <span className="text-white font-semibold">{item.qty || 1}</span> • ₹{(item.price || 0).toLocaleString('en-IN')} each
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-extrabold text-teal-300">
                              ₹{((item.price || 0) * (item.qty || 1)).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Footer with Total */}
                  <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-gray-400">
                    <div>
                      <span>Shipped via Swift Express Logistics • Fully insured by ShopSphere Artisan Guarantee</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Order Total:</span>
                      <span className="text-base font-black text-white">
                        ₹{(order.totalPrice || order.items?.reduce((s, i) => s + (i.price * (i.qty || 1)), 0) || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Returns & Refunds */}
      {activeTab === 'returns' && (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Submit Return Request Card */}
          <div className="glass-panel-3d p-6 sm:p-7 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <RefreshCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Initiate a Return</h3>
                <p className="text-xs text-gray-400">7-Day Hassle-Free Verified Artisan Guarantee</p>
              </div>
            </div>

            <form onSubmit={handleSubmitReturn} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">Select Order:</label>
                <select
                  value={selectedReturnOrder}
                  onChange={(e) => setSelectedReturnOrder(e.target.value)}
                  className="w-full p-3 rounded-xl bg-dark-900 border border-white/15 text-white text-xs outline-none focus:border-teal-400"
                >
                  {orders.map(o => (
                    <option key={o.id} value={o.id}>
                      Order #{o.id} ({o.date} - ₹{o.totalPrice?.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">Select Item:</label>
                <select
                  value={selectedReturnProduct}
                  onChange={(e) => setSelectedReturnProduct(e.target.value)}
                  className="w-full p-3 rounded-xl bg-dark-900 border border-white/15 text-white text-xs outline-none focus:border-teal-400"
                >
                  {orders
                    .find(o => o.id === selectedReturnOrder)
                    ?.items?.map((it, idx) => (
                      <option key={idx} value={it.name}>
                        {it.name} (Qty: {it.qty || 1})
                      </option>
                    )) || <option value="">No items available</option>}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={returnQuantity}
                    onChange={(e) => setReturnQuantity(parseInt(e.target.value) || 1)}
                    className="w-full p-3 rounded-xl bg-dark-900 border border-white/15 text-white text-xs outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">Reason Category:</label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full p-3 rounded-xl bg-dark-900 border border-white/15 text-white text-xs outline-none focus:border-teal-400"
                  >
                    <option value="Quality not as expected">Quality not as expected</option>
                    <option value="Size / fit issue">Size / fit issue</option>
                    <option value="Item defective or damaged">Item defective or damaged</option>
                    <option value="Wrong product received">Wrong product received</option>
                    <option value="Delayed arrival">Delayed arrival</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-brand-500 hover:brightness-110 active:scale-98 text-white font-bold text-xs shadow-lg transition-all"
              >
                Submit Return Request
              </button>
            </form>
          </div>

          {/* Active Returns Queue */}
          <div className="glass-panel-3d p-6 sm:p-7 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center justify-between">
              <span>Submitted Returns ({returnsList.length})</span>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-gray-400">Live Status</span>
            </h3>

            {returnsList.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-xs">
                <RefreshCcw className="w-8 h-8 mx-auto mb-2 opacity-40 text-teal-400" />
                <p>No active return requests.</p>
                <p className="text-[11px] opacity-70 mt-1">Returns filed above will be listed here with tracking labels.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {returnsList.map(ret => (
                  <div key={ret.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs font-bold text-teal-300">{ret.id}</span>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {ret.status || 'UNDER REVIEW'}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-white truncate">{ret.productName}</h4>
                    <p className="text-[11px] text-gray-400">
                      Order: #{ret.orderId} • Reason: {ret.reason} • Qty: {ret.quantity}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: ShopSphere Guarantee & Support */}
      {activeTab === 'support' && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="glass-panel-3d p-7 rounded-3xl border border-white/10 space-y-4">
            <ShieldCheck className="w-10 h-10 text-teal-400 mb-2" />
            <h3 className="text-xl font-bold text-white">The ShopSphere Artisan Guarantee</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Every purchase on ShopSphere directly supports verified independent artisans. To ensure absolute confidence, every order includes:
            </p>
            <ul className="space-y-2 text-xs text-gray-400">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% On-Time Delivery Guarantee or ₹500 credit</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>7-Day Return Window with complimentary prepaid pickups</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Direct dispute escalation with 2-hour agent turnaround</span>
              </li>
            </ul>

            {onNavigateView && (
              <button
                onClick={() => onNavigateView('support')}
                className="mt-4 px-5 py-2.5 rounded-full bg-gradient-to-r from-teal-500 to-brand-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg"
              >
                <span>Go to Support Desk</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="glass-panel-3d p-7 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-lg font-bold text-white">Need Immediate Help?</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Have questions regarding multi-vendor package splits, transit milestones, or artisan certificates?
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-xs font-bold text-white">Priority Concierge</p>
                <p className="text-[11px] text-gray-400 mt-0.5">support@shopsphere.com • Available 24/7</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-xs font-bold text-white">Escalation Desk</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Toll-free: 1800-890-SPHERE (Mon-Sat, 9AM-8PM IST)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      <AnimatePresence>
        {selectedInvoiceOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInvoiceOrder(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-dark-900 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 text-white max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              {/* Invoice Header */}
              <div className="flex justify-between items-start pb-6 border-b border-white/10">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-teal-400">Tax Invoice / Receipt</span>
                  <h3 className="text-2xl font-black mt-1">ShopSphere Commerce</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Invoice #{selectedInvoiceOrder.id} • Date: {selectedInvoiceOrder.date}</p>
                </div>
                <button
                  onClick={() => setSelectedInvoiceOrder(null)}
                  className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Customer and Delivery info */}
              <div className="grid grid-cols-2 gap-4 py-4 border-b border-white/10 text-xs">
                <div>
                  <p className="font-bold text-gray-400 uppercase text-[10px]">Billed To:</p>
                  <p className="font-bold text-white mt-1">{selectedInvoiceOrder.customer?.name || currentUser?.name || 'Customer'}</p>
                  <p className="text-gray-400">{selectedInvoiceOrder.customer?.email || currentUser?.email || 'customer@shopsphere.com'}</p>
                  <p className="text-gray-400">{selectedInvoiceOrder.shippingAddress?.address ? `${selectedInvoiceOrder.shippingAddress.address}, ${selectedInvoiceOrder.shippingAddress.city || 'Hyderabad'}` : 'Flat 402, Green Meadows, Road No 10, Banjara Hills, Hyderabad 500034'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-400 uppercase text-[10px]">Payment Method:</p>
                  <p className="font-bold text-emerald-400 mt-1">Paid via Credit Card / UPI</p>
                  <p className="text-gray-400">Status: Completed (Tax Paid)</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="py-4">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 text-[10px] uppercase">
                      <th className="py-2">Item Description</th>
                      <th className="py-2 text-center">Qty</th>
                      <th className="py-2 text-right">Unit Price</th>
                      <th className="py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {selectedInvoiceOrder.items?.map((it, i) => (
                      <tr key={i}>
                        <td className="py-3 font-semibold text-white">{it.name}</td>
                        <td className="py-3 text-center">{it.qty || 1}</td>
                        <td className="py-3 text-right">₹{(it.price || 0).toLocaleString('en-IN')}</td>
                        <td className="py-3 text-right font-bold text-teal-300">
                          ₹{((it.price || 0) * (it.qty || 1)).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="pt-4 border-t border-white/10 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal:</span>
                  <span>₹{(selectedInvoiceOrder.totalPrice || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>GST / Tax (Included 18%):</span>
                  <span>Included</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping:</span>
                  <span className="text-emerald-400 font-bold">FREE (Artisan Sponsored)</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-white/10">
                  <span>Grand Total:</span>
                  <span className="text-teal-400">₹{(selectedInvoiceOrder.totalPrice || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setSelectedInvoiceOrder(null)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
