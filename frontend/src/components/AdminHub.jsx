import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Users, Package, AlertCircle, FileText, CheckCircle, XCircle, 
  Tag, Activity, Truck, MapPin, MessageSquare, ArrowRight, RefreshCcw 
} from 'lucide-react';
import { showInAppAlert, showInAppToast } from './InAppNotificationModal';
import { API_BASE_URL } from '../config/api';

export default function AdminHub({ onNavigateView }) {
  const [metrics, setMetrics] = useState({
    totalRevenue: 438500,
    activeSellers: 18,
    verifiedProducts: 796,
    disputesOpen: 1,
    pendingSellerApprovals: 3,
    systemHealth: '99.98% Uptime'
  });
  const [auditLogs, setAuditLogs] = useState([]);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // overview | orders | moderation | audit

  const loadData = () => {
    fetch(`${API_BASE_URL}/api/admin/metrics`)
      .then(r => r.json())
      .then(data => setMetrics(prev => ({ ...prev, ...data })))
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/admin/audit-logs`)
      .then(r => r.json())
      .then(data => setAuditLogs(Array.isArray(data) ? data : []))
      .catch(() => {});

    // Load customer placed orders
    let ordersList = [];
    try {
      const local = JSON.parse(localStorage.getItem('shopsphere_customer_orders') || '[]');
      if (Array.isArray(local) && local.length > 0) ordersList = [...local];
    } catch (e) {}

    fetch(`${API_BASE_URL}/api/delivery/orders`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const ids = new Set(ordersList.map(o => o.id || o._id));
          data.forEach(d => {
            const id = d._id || d.id;
            if (!ids.has(id)) {
              ordersList.push({
                id,
                status: d.status || 'CONFIRMED',
                date: d.createdAt ? d.createdAt.split('T')[0] : '2026-09-24',
                items: d.orderItems || [],
                totalPrice: d.subTotal || d.totalPrice || 0
              });
            }
          });
        }
        setCustomerOrders(ordersList);
      })
      .catch(() => setCustomerOrders(ordersList));
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingModeration = [
    { 
      id: 'prod_mod_1', 
      name: 'Emerald Velvet Nordic Sofa #1', 
      seller: 'Nordic Craft Co', 
      price: 48500, 
      category: 'Sofa', 
      image: `${API_BASE_URL}/uploads/ecommerce%20products/sofa/1.jpg`,
      status: 'Pending Review' 
    },
    { 
      id: 'prod_mod_2', 
      name: 'Raw Japanese Selvedge Denim Jeans #1', 
      seller: 'Indigo Artisans', 
      price: 3200, 
      category: 'Jeans', 
      image: `${API_BASE_URL}/uploads/ecommerce%20products/jeans/1.jpg`,
      status: 'Pending Review' 
    },
    { 
      id: 'prod_mod_3', 
      name: '65" OLED Gallery Design TV #1', 
      seller: 'Lumina Displays', 
      price: 84999, 
      category: 'TV', 
      image: `${API_BASE_URL}/uploads/ecommerce%20products/tv/1.jpg`,
      status: 'Pending Review' 
    }
  ];

  const handleModerate = (id, verdict) => {
    showInAppAlert({
      title: 'Moderation Action Recorded',
      message: `Product listing ${id} has been marked as "${verdict}" by Platform Administrator.`,
      type: verdict === 'APPROVED' ? 'success' : 'warning',
      confirmText: 'OK'
    });
  };

  const handleAdminUpdateOrderStatus = (orderId, newStatus) => {
    setCustomerOrders(prev => prev.map(o => (o.id === orderId || o._id === orderId) ? { ...o, status: newStatus } : o));

    try {
      const local = JSON.parse(localStorage.getItem('shopsphere_customer_orders') || '[]');
      const updated = local.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
      localStorage.setItem('shopsphere_customer_orders', JSON.stringify(updated));
    } catch (e) {}

    fetch(`${API_BASE_URL}/api/delivery/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, note: `Administrator set status to ${newStatus}` })
    }).catch(() => {});

    showInAppToast({
      message: `Admin override: Order #${orderId} marked as ${newStatus}`,
      type: 'success'
    });
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 max-w-7xl mx-auto min-h-screen text-white relative z-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Platform Governance & Operations
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Platform Admin Control Center</h1>
          <p className="text-gray-400 text-sm mt-1">
            Oversee customer orders, delivery partner fulfillment, listing moderation, and platform security.
          </p>
        </div>

        <div className="flex gap-2">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'orders', label: `Customer Orders (${customerOrders.length})` },
            { id: 'moderation', label: 'Listing Moderation' },
            { id: 'audit', label: 'Audit Logs' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-amber-500 to-teal-500 text-white border-amber-400/40 shadow-lg'
                  : 'glass-panel-3d text-gray-400 hover:text-white border-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            <div className="glass-panel-3d p-6 rounded-2xl border border-white/10">
              <span className="text-xs text-gray-400 font-semibold block mb-2">Total Gross Revenue</span>
              <p className="text-3xl font-extrabold text-teal-300">₹{metrics.totalRevenue.toLocaleString()}</p>
              <span className="text-[11px] text-emerald-400 mt-1 block">↑ 18.4% vs last week</span>
            </div>

            <div className="glass-panel-3d p-6 rounded-2xl border border-white/10">
              <span className="text-xs text-gray-400 font-semibold block mb-2">Active Artisan Sellers</span>
              <p className="text-3xl font-extrabold text-white">{metrics.activeSellers}</p>
              <span className="text-[11px] text-amber-400 mt-1 block">{metrics.pendingSellerApprovals} awaiting audit</span>
            </div>

            <div className="glass-panel-3d p-6 rounded-2xl border border-white/10">
              <span className="text-xs text-gray-400 font-semibold block mb-2">Verified Products</span>
              <p className="text-3xl font-extrabold text-white">{metrics.verifiedProducts}</p>
              <span className="text-[11px] text-teal-400 mt-1 block">796 Dataset items live</span>
            </div>

            <div className="glass-panel-3d p-6 rounded-2xl border border-white/10">
              <span className="text-xs text-gray-400 font-semibold block mb-2">Platform Health</span>
              <p className="text-3xl font-extrabold text-emerald-400">{metrics.systemHealth}</p>
              <span className="text-[11px] text-gray-400 mt-1 block">Express + MongoDB Connected</span>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-panel-3d p-6 rounded-2xl border border-white/10 space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                <Tag className="w-4 h-4 text-teal-400" /> Platform Promotional Coupons
              </h3>
              <div className="space-y-3">
                {[
                  { code: 'SPHERE10', discount: '10% OFF', min: '₹500', status: 'ACTIVE' },
                  { code: 'WELCOME20', discount: '20% OFF', min: '₹1,000', status: 'ACTIVE' },
                  { code: 'FLAT500', discount: '₹500 OFF', min: '₹2,000', status: 'ACTIVE' }
                ].map(c => (
                  <div key={c.code} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                    <div>
                      <span className="font-mono font-bold text-sm text-teal-300">{c.code}</span>
                      <p className="text-xs text-gray-400">{c.discount} • Min Order {c.min}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel-3d p-6 rounded-2xl border border-white/10 space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                <Truck className="w-4 h-4 text-blue-400" /> Logistics & Delivery Linkage
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Platform administrators can monitor real-time handovers between independent artisan sellers and Swift Logistics courier fleet.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                {onNavigateView && (
                  <>
                    <button
                      onClick={() => onNavigateView('delivery')}
                      className="px-4 py-2.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Open Delivery Partner Portal</span>
                    </button>

                    <button
                      onClick={() => onNavigateView('support')}
                      className="px-4 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Open Support Desk Queue</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Tab: Customer Orders & Deliveries */}
      {activeTab === 'orders' && (
        <div className="glass-panel-3d p-6 sm:p-7 rounded-3xl border border-white/10 space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-white/10">
            <div>
              <h3 className="text-lg font-bold text-white">Live Customer Placed Orders</h3>
              <p className="text-xs text-gray-400">All master orders placed by buyers across the marketplace.</p>
            </div>
            <button
              onClick={loadData}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 flex items-center gap-1"
            >
              <RefreshCcw className="w-3 h-3 text-teal-400" /> Refresh
            </button>
          </div>

          {customerOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-xs">
              <Package className="w-10 h-10 mx-auto mb-2 opacity-40 text-teal-400" />
              <p>No customer orders placed yet. Orders will appear here immediately after checkout.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {customerOrders.map(order => {
                const id = order.id || order._id;
                const status = order.status || 'CONFIRMED';
                return (
                  <div key={id} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-teal-400">Order #{id}</span>
                        <span className="text-xs text-gray-400">Date: {order.date || '2026-09-24'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                          status === 'DELIVERED' 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                            : status === 'OUT_FOR_DELIVERY' || status === 'SHIPPED'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          ● {status}
                        </span>

                        {/* Admin status override */}
                        {status !== 'DELIVERED' && (
                          <button
                            onClick={() => handleAdminUpdateOrderStatus(id, 'DELIVERED')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold border border-emerald-500/30"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-gray-300">
                      <span>Items: {order.items?.map(it => `${it.name} (x${it.qty || 1})`).join(', ') || 'Ordered Products'}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-400 pt-1 border-t border-white/5">
                      <span>Courier Fleet: Swift Logistics (Vehicle DL-04-8921)</span>
                      <span className="font-bold text-white">Total: ₹{(order.totalPrice || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'moderation' && (
        <div className="glass-panel-3d p-6 rounded-3xl border border-white/10">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
            <AlertCircle className="w-5 h-5 text-amber-400" /> Pending Artisan Listing Approvals
          </h3>
          <div className="space-y-4">
            {pendingModeration.map(item => (
              <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-4">
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-16 h-16 object-cover rounded-xl border border-white/10 shrink-0 bg-dark-900" 
                    />
                  )}
                  <div>
                    <h4 className="font-bold text-base text-white">{item.name}</h4>
                    <p className="text-xs text-gray-400">
                      Seller: {item.seller} • Category: <span className="text-teal-300 font-semibold">{item.category}</span> • Price: ₹{item.price.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleModerate(item.id, 'APPROVED')} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors">
                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button onClick={() => handleModerate(item.id, 'REJECTED')} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors">
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="glass-panel-3d p-6 rounded-3xl border border-white/10">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
            <Activity className="w-5 h-5 text-teal-400" /> Immutable Platform Audit Log
          </h3>
          <div className="space-y-3">
            {auditLogs.map(log => (
              <div key={log._id} className="flex justify-between items-center p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs">
                <div>
                  <span className="font-mono font-bold text-teal-300">{log.action}</span>
                  <p className="text-gray-400 mt-0.5">Actor: {log.actorRole} ({log.actorId})</p>
                </div>
                <span className="text-gray-500 text-[11px] font-mono">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
