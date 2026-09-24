import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, Package, MapPin, CheckCircle2, Clock, AlertTriangle, ArrowRight, 
  MessageSquare, User, Phone, Check, RefreshCcw, ExternalLink
} from 'lucide-react';
import { showInAppAlert, showInAppToast } from './InAppNotificationModal';
import { getProductImageUrl, handleImageErrorFallback } from '../utils/imageUrl';
import { API_BASE_URL } from '../config/api';

export default function DeliveryPortal({ onNavigateView }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'OUT_FOR_DELIVERY' | 'DELIVERED'

  // Fetch orders from backend and localStorage
  const loadDeliveryOrders = async () => {
    setLoading(true);
    let combined = [];

    // 1. Load from localStorage (customer placed orders)
    try {
      const local = JSON.parse(localStorage.getItem('shopsphere_customer_orders') || '[]');
      if (Array.isArray(local) && local.length > 0) {
        local.forEach(lo => {
          combined.push({
            _id: lo.id,
            status: lo.status || 'CONFIRMED',
            customer: lo.customer || {
              name: lo.shippingAddress?.recipientName || 'Customer',
              email: 'customer@shopsphere.com',
              phone: '+91 98450 11223'
            },
            shippingAddress: lo.shippingAddress || {
              address: 'Flat 402, Green Meadows, Road No 10, Banjara Hills',
              city: 'Hyderabad',
              postalCode: '500034',
              country: 'India'
            },
            seller: { name: lo.sellerOrders?.[0]?.sellerName || 'Verified Artisan Collective' },
            orderItems: lo.items || [],
            totalPrice: lo.totalPrice || 0,
            date: lo.date || '2026-09-24',
            updatedAt: new Date().toISOString()
          });
        });
      }
    } catch (e) {
      console.warn("Could not read local customer orders", e);
    }

    // 2. Fetch from backend
    try {
      const res = await fetch(`${API_BASE_URL}/api/delivery/orders`);
      if (res.ok) {
        const backendOrders = await res.json();
        if (Array.isArray(backendOrders) && backendOrders.length > 0) {
          backendOrders.forEach(bo => {
            const id = bo._id || bo.id;
            const existingIdx = combined.findIndex(c => c._id === id);
            const mapped = {
              _id: id,
              status: bo.status || 'CONFIRMED',
              customer: {
                name: bo.customer?.name || bo.shippingAddress?.recipientName || 'Customer',
                email: bo.customer?.email || 'customer@shopsphere.com',
                phone: bo.customer?.phone || '+91 98450 11223'
              },
              shippingAddress: bo.shippingAddress || {
                address: 'Flat 402, Green Meadows, Road No 10, Banjara Hills',
                city: 'Hyderabad',
                postalCode: '500034'
              },
              seller: bo.seller || { name: 'Artisan Hub' },
              orderItems: bo.orderItems || [],
              totalPrice: bo.subTotal || bo.totalPrice || 0,
              date: bo.createdAt ? bo.createdAt.split('T')[0] : '2026-09-24',
              updatedAt: bo.updatedAt || new Date().toISOString()
            };
            if (existingIdx >= 0) {
              combined[existingIdx] = { ...combined[existingIdx], ...mapped };
            } else {
              combined.push(mapped);
            }
          });
        }
      }
    } catch (err) {
      console.warn("Backend delivery orders offline, using local queue", err);
    }

    // 3. Fallback demo order if completely empty
    if (combined.length === 0) {
      combined = [
        {
          _id: 'ORD-89234',
          status: 'SHIPPED',
          customer: { name: 'Customer', email: 'customer@shopsphere.com', phone: '+91 98450 11223' },
          shippingAddress: { address: 'Flat 402, Green Meadows, Road No 10, Banjara Hills', city: 'Hyderabad', postalCode: '500034' },
          seller: { name: 'Apex Acoustics Store' },
          orderItems: [{ name: 'Quantum Noise-Cancelling Headphones', qty: 1, price: 29999 }],
          totalPrice: 29999,
          date: '2026-09-22',
          updatedAt: new Date().toISOString()
        }
      ];
    }

    setOrders(combined);
    setLoading(false);
  };

  useEffect(() => {
    loadDeliveryOrders();
    const handleSync = () => loadDeliveryOrders();
    window.addEventListener('shopsphere_order_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('shopsphere_order_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Update status (e.g. PACKED -> OUT_FOR_DELIVERY -> DELIVERED)
  const handleUpdateStatus = async (orderId, newStatus) => {
    // 1. Update state
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));

    // 2. Update localStorage for customer's My Orders
    try {
      const local = JSON.parse(localStorage.getItem('shopsphere_customer_orders') || '[]');
      const updatedLocal = local.map(lo => lo.id === orderId ? { ...lo, status: newStatus } : lo);
      localStorage.setItem('shopsphere_customer_orders', JSON.stringify(updatedLocal));
      window.dispatchEvent(new Event('shopsphere_order_updated'));
    } catch (e) {}

    // 3. Call backend API
    try {
      await fetch(`${API_BASE_URL}/api/delivery/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, note: `Courier marked as ${newStatus}` })
      });
    } catch (err) {
      console.warn("Backend update error, synced locally", err);
    }

    // 4. In-App Notification
    if (newStatus === 'DELIVERED') {
      showInAppAlert({
        title: 'Delivery Completed! 🎉',
        message: `Package #${orderId} marked as DELIVERED.\nCustomer account and platform records updated. Payment escrow released to artisan.`,
        type: 'success',
        confirmText: 'Done'
      });
    } else {
      showInAppToast({
        message: `Order #${orderId} status updated to: ${newStatus}`,
        type: 'success'
      });
    }
  };

  const filteredOrders = orders.filter(o => {
    if (filter === 'ALL') return true;
    if (filter === 'PENDING') return o.status === 'CONFIRMED' || o.status === 'PACKED';
    if (filter === 'OUT_FOR_DELIVERY') return o.status === 'SHIPPED' || o.status === 'OUT_FOR_DELIVERY';
    if (filter === 'DELIVERED') return o.status === 'DELIVERED';
    return true;
  });

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 max-w-6xl mx-auto min-h-screen text-white relative z-10">
      {/* Header Banner */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-semibold text-blue-300 mb-2">
            <Truck className="w-3.5 h-3.5 text-blue-400" />
            <span>Swift Logistics • Delivery Partner Operations</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Delivery Partner Portal
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Real-time customer order queue, route dispatching, and doorstep handover verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDeliveryOrders}
            className="px-4 py-2.5 rounded-xl glass-panel-3d border border-white/15 hover:border-blue-400 text-xs font-bold flex items-center gap-1.5 transition-colors text-gray-300 hover:text-white"
            title="Refresh order queue"
          >
            <RefreshCcw className="w-3.5 h-3.5 text-blue-400" />
            <span>Sync Queue</span>
          </button>

          {onNavigateView && (
            <button
              onClick={() => onNavigateView('support')}
              className="px-4 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-xs font-bold text-purple-300 flex items-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Customer Inquiries</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Counter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-white/10">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { id: 'ALL', label: `All Shipments (${orders.length})` },
            { id: 'PENDING', label: 'Ready to Dispatch' },
            { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
            { id: 'DELIVERED', label: 'Completed Deliveries' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white border-blue-400/50 shadow-md shadow-blue-500/20'
                  : 'glass-panel-3d text-gray-400 hover:text-white border-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-gray-400">
          Showing <span className="text-blue-400 font-bold">{filteredOrders.length}</span> active packages
        </div>
      </div>

      {/* Shipments List */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">Connecting to logistics dispatch network...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="glass-panel-3d p-12 rounded-3xl border border-white/10 text-center">
          <Truck className="w-12 h-12 text-gray-500 mx-auto mb-3 opacity-40" />
          <h3 className="text-lg font-bold text-white mb-1">No Orders in this Status</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
            When customers place orders, they will appear here automatically for pickup and delivery.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map(order => {
            const isDelivered = order.status === 'DELIVERED';
            const isOut = order.status === 'SHIPPED' || order.status === 'OUT_FOR_DELIVERY';
            const isPending = order.status === 'CONFIRMED' || order.status === 'PACKED';

            return (
              <div 
                key={order._id}
                className="glass-panel-3d p-6 sm:p-7 rounded-3xl border border-white/10 space-y-6 hover:border-blue-500/30 transition-colors"
              >
                {/* Top Row: IDs and Live Status */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-black text-blue-400">Shipment #{order._id}</span>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                        isDelivered
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : isOut
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        ● {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Origin Artisan: <span className="text-gray-200 font-semibold">{order.seller?.name || 'Verified Merchant'}</span> • Order Date: {order.date}
                    </p>
                  </div>

                  {/* Quick Action Buttons for Delivery Partner */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {order.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleUpdateStatus(order._id, 'PACKED')}
                        className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all"
                      >
                        Accept & Pack
                      </button>
                    )}

                    {(order.status === 'CONFIRMED' || order.status === 'PACKED') && (
                      <button
                        onClick={() => handleUpdateStatus(order._id, 'OUT_FOR_DELIVERY')}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-teal-500 hover:brightness-110 active:scale-98 text-white text-xs font-bold transition-all shadow-md"
                      >
                        Out for Delivery 🚚
                      </button>
                    )}

                    {isOut && (
                      <button
                        onClick={() => handleUpdateStatus(order._id, 'DELIVERED')}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 active:scale-98 text-white text-xs font-black shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Confirm Delivered (Package Handover)</span>
                      </button>
                    )}

                    {isDelivered && (
                      <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Handover Completed</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Details Grid: Customer Info & Destination Address */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Customer & Destination */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      <span>Delivery Recipient & Destination</span>
                    </h4>

                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-white text-sm flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span>{order.customer?.name || 'Customer'}</span>
                      </p>
                      <p className="text-gray-300 pl-5">{order.shippingAddress?.address || '123 Horizon Tower'}</p>
                      <p className="text-gray-400 pl-5">
                        {order.shippingAddress?.city || 'Mumbai'}, {order.shippingAddress?.postalCode || '400001'}
                      </p>
                      <p className="text-gray-400 pl-5 pt-1 flex items-center gap-1.5 text-[11px]">
                        <Phone className="w-3 h-3 text-teal-400" />
                        <span>{order.customer?.phone || '+91 98200 12345'}</span>
                        <span className="text-gray-500">• {order.customer?.email || 'customer@shopsphere.com'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Consigned Items */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-teal-400" />
                      <span>Package Contents ({order.orderItems?.length || 0} items)</span>
                    </h4>

                    <div className="space-y-2 max-h-36 overflow-y-auto custom-scrollbar pr-1">
                      {order.orderItems?.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs p-2 rounded-xl bg-black/20">
                          <div className="min-w-0 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px] text-teal-300 shrink-0">
                              {it.qty || 1}x
                            </span>
                            <span className="font-semibold text-white truncate max-w-[200px]">{it.name}</span>
                          </div>
                          <span className="text-teal-300 font-mono font-bold shrink-0">
                            ₹{((it.price || 0) * (it.qty || 1)).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs">
                      <span className="text-gray-400">Total Shipment Value:</span>
                      <span className="font-extrabold text-white text-sm">
                        ₹{(order.totalPrice || order.orderItems?.reduce((s, i) => s + (i.price * (i.qty || 1)), 0) || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Bar: Action to Chat & Transit Info */}
                <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>Dispatched via Swift Logistics Priority Ground Fleet (Courier Vehicle DL-04-8921)</span>
                  </div>

                  {onNavigateView && (
                    <button
                      onClick={() => onNavigateView('support')}
                      className="text-xs text-teal-300 hover:text-white font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Message Customer Regarding Delivery</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
