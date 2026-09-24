import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, DollarSign, TrendingUp, AlertCircle, Sparkles, CheckCircle2, 
  Layers, Plus, Search, ShieldCheck, ArrowUpRight, BarChart2 
} from 'lucide-react';
import SellerAddProduct from './components/SellerAddProduct';
import TextScrollWordReveal from './components/TextScrollWordReveal';
import { showInAppAlert, showInAppToast } from './components/InAppNotificationModal';

export default function SellerDashboard({ onProductAdded }) {
  const [isFixing, setIsFixing] = useState(false);
  const [fixed, setFixed] = useState(false);
  const [inventorySearch, setInventorySearch] = useState('');

  const handleAiFix = () => {
    setIsFixing(true);
    setTimeout(() => {
      setIsFixing(false);
      setFixed(true);
    }, 1500);
  };

  const stats = [
    { title: 'Total Revenue', value: '₹1,48,500', icon: DollarSign, color: 'text-emerald-400' },
    { title: 'Active Orders', value: '18', icon: Package, color: 'text-brand-400' },
    { title: 'Store Trust Score', value: '99.2%', icon: TrendingUp, color: 'text-blue-400' },
    { title: 'Pending Returns', value: '1', icon: AlertCircle, color: 'text-red-400' },
  ];

  // Active Store Inventory & Product Listings in Dashboard
  const [inventoryItems, setInventoryItems] = useState([
    {
      id: 'INV-301',
      name: 'Eco-Crafted Bamboo Desk',
      category: 'Furniture',
      price: 35000,
      stock: 14,
      image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&q=80',
      trustScore: 99.8,
      soldCount: 48,
      status: 'In Stock'
    },
    {
      id: 'INV-302',
      name: 'Emerald Velvet Nordic Sofa',
      category: 'Furniture',
      price: 48500,
      stock: 6,
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
      trustScore: 99.5,
      soldCount: 29,
      status: 'In Stock'
    },
    {
      id: 'INV-303',
      name: 'Solid Walnut Mid-Century Coffee Table',
      category: 'Furniture',
      price: 24999,
      stock: 9,
      image: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&q=80',
      trustScore: 99.1,
      soldCount: 37,
      status: 'In Stock'
    },
    {
      id: 'INV-304',
      name: 'Scandinavian Accent Lounge Chair',
      category: 'Furniture',
      price: 18999,
      stock: 12,
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
      trustScore: 98.4,
      soldCount: 52,
      status: 'In Stock'
    },
    {
      id: 'INV-305',
      name: 'Ergonomic Executive Studio Chair',
      category: 'Furniture',
      price: 21999,
      stock: 8,
      image: 'https://images.unsplash.com/photo-1517705008128-361805f42e86?w=800&q=80',
      trustScore: 98.9,
      soldCount: 64,
      status: 'In Stock'
    },
    {
      id: 'INV-306',
      name: 'Handcrafted Modular Wall Bookshelf',
      category: 'Furniture',
      price: 18500,
      stock: 11,
      image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&q=80',
      trustScore: 97.9,
      soldCount: 31,
      status: 'In Stock'
    },
    {
      id: 'INV-307',
      name: 'Quantum Noise-Cancelling Headphones',
      category: 'Electronics',
      price: 29999,
      stock: 2,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      trustScore: 99.4,
      soldCount: 112,
      status: 'Low Stock'
    },
    {
      id: 'INV-308',
      name: 'Aura Studio Wireless Speaker',
      category: 'Electronics',
      price: 18499,
      stock: 18,
      image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80',
      trustScore: 98.0,
      soldCount: 85,
      status: 'In Stock'
    }
  ]);

  // Split Orders (Fulfillment List) with furniture items and working images
  const [orders, setOrders] = useState([
    { 
      id: 'SO-10842', 
      product: 'Quantum Noise-Cancelling Headphones', 
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      qty: 1, 
      price: 29999, 
      status: 'PACKED',
      customer: 'Aarav Sharma, Mumbai'
    },
    { 
      id: 'SO-10843', 
      product: 'Eco-Crafted Bamboo Desk', 
      image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&q=80',
      qty: 1, 
      price: 35000, 
      status: 'CONFIRMED',
      customer: 'Pooja Reddy, Hyderabad'
    },
    { 
      id: 'SO-10844', 
      product: 'Emerald Velvet Nordic Sofa', 
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
      qty: 1, 
      price: 48500, 
      status: 'PLACED',
      customer: 'Shreya Verma, Bengaluru'
    },
    { 
      id: 'SO-10845', 
      product: 'Solid Walnut Mid-Century Coffee Table', 
      image: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&q=80',
      qty: 1, 
      price: 24999, 
      status: 'CONFIRMED',
      customer: 'Priya Nair, Pune'
    },
    { 
      id: 'SO-10846', 
      product: 'Scandinavian Accent Lounge Chair', 
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
      qty: 2, 
      price: 37998, 
      status: 'PACKED',
      customer: 'Rahul Mehta, Delhi'
    },
    { 
      id: 'SO-10847', 
      product: 'Aura Studio Wireless Speaker', 
      image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80',
      qty: 2, 
      price: 36998, 
      status: 'SHIPPED',
      customer: 'Kunal Joshi, Chennai'
    },
    { 
      id: 'SO-10848', 
      product: 'Handcrafted Modular Wall Bookshelf', 
      image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&q=80',
      qty: 1, 
      price: 18500, 
      status: 'SHIPPED',
      customer: 'Vikram Singh, Jaipur'
    }
  ]);

  const handleNextStatus = (orderId) => {
    const flow = { 'PLACED': 'CONFIRMED', 'CONFIRMED': 'PACKED', 'PACKED': 'SHIPPED', 'SHIPPED': 'DELIVERED' };
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const next = flow[o.status] || o.status;
        showInAppToast({
          message: `Sub-Order ${orderId} updated to ${next}! Inventory reservation committed.`,
          type: 'success'
        });
        return { ...o, status: next };
      }
      return o;
    }));
  };

  const handleRestock = (itemId, delta = 5) => {
    setInventoryItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newStock = item.stock + delta;
        return {
          ...item,
          stock: newStock,
          status: newStock > 3 ? 'In Stock' : 'Low Stock'
        };
      }
      return item;
    }));
  };

  const handleNewProduct = (newProd) => {
    setInventoryItems(prev => [
      {
        id: `INV-${Date.now().toString().slice(-3)}`,
        name: newProd.name,
        category: newProd.category || 'General',
        price: Number(newProd.price),
        stock: Number(newProd.inventory || 10),
        image: newProd.imageUrl || 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&q=80',
        trustScore: 99.0,
        soldCount: 0,
        status: 'In Stock'
      },
      ...prev
    ]);
    if (onProductAdded) onProductAdded(newProd);
  };

  const filteredInventory = inventoryItems.filter(item => 
    item.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
    item.category.toLowerCase().includes(inventorySearch.toLowerCase())
  );

  return (
    <div className="pt-24 px-6 max-w-7xl mx-auto min-h-screen pb-24 text-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Seller Dashboard</h1>
          <p className="text-gray-400">Manage your store, list new products, fulfill orders, and monitor health.</p>
        </div>
      </div>

      {/* Highlighted Scroll Reveal Section */}
      <TextScrollWordReveal
        kicker="SELLER HUB INTELLIGENCE"
        statement="Scale your independent brand with AI-automated inventory management, seamless order fulfillment, and multi-vendor payout automation."
      />

      {/* Add Product Component with Image Upload */}
      <SellerAddProduct onAddProduct={handleNewProduct} />

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.title} 
            className="glass-panel p-6 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 font-medium">{stat.title}</h3>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-3xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Active Store Inventory & Product Listings in Dashboard */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 mb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-400" /> Active Store Listings & Inventory ({filteredInventory.length} Items)
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Live catalog items with transparent trust metrics, current stock levels, and one-click restocking.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input 
              type="text"
              placeholder="Search items..."
              value={inventorySearch}
              onChange={(e) => setInventorySearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredInventory.map((item) => (
            <motion.div 
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden hover:border-brand-500/40 transition-all flex flex-col justify-between p-3.5"
            >
              <div>
                <div className="relative h-40 rounded-xl overflow-hidden mb-3">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    item.status === 'Low Stock' 
                      ? 'bg-red-500/80 text-white shadow-md' 
                      : 'bg-emerald-500/80 text-white shadow-md'
                  }`}>
                    {item.status}
                  </span>
                  <span className="absolute top-2 right-2 text-[10px] font-mono bg-dark-900/80 backdrop-blur text-brand-300 font-bold px-1.5 py-0.5 rounded">
                    {item.trustScore}% Trust
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-semibold text-brand-400 uppercase tracking-wider mb-1">
                  <span>{item.category}</span>
                  <span className="text-gray-400 font-mono text-[10px]">{item.id}</span>
                </div>
                <h3 className="text-sm font-bold text-white truncate mb-1" title={item.name}>{item.name}</h3>
                <p className="text-base font-extrabold text-brand-300 mb-3">₹{item.price.toLocaleString()}</p>
              </div>

              <div className="pt-3 border-t border-white/10 space-y-2">
                <div className="flex justify-between text-xs text-gray-300">
                  <span className="text-gray-400">Stock:</span>
                  <span className="font-bold text-white">{item.stock} units</span>
                </div>
                <div className="flex justify-between text-xs text-gray-300">
                  <span className="text-gray-400">Total Sold:</span>
                  <span className="font-semibold text-gray-300">{item.soldCount}</span>
                </div>

                <div className="pt-2 flex gap-2">
                  <button 
                    onClick={() => handleRestock(item.id, 5)}
                    className="flex-1 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Restock (+5)
                  </button>
                  <button 
                    onClick={() => showInAppToast({
                      message: `Synchronizing AI SEO tags and trust indexing for ${item.name}`,
                      type: 'info'
                    })}
                    className="p-1.5 bg-brand-500/20 hover:bg-brand-500 text-brand-300 hover:text-white rounded-lg transition-colors"
                    title="Run AI SEO Sync"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Orders Fulfillment List with Thumbnails & State Machine */}
        <div className="md:col-span-2 glass-panel p-6 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Package className="w-5 h-5 text-brand-400" /> Recent Split Orders (To Fulfill)
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Dispatched per seller with individual tracking and inventory reservation</p>
            </div>
            <span className="text-xs text-brand-300 font-semibold bg-brand-500/10 px-2.5 py-1 rounded-full shrink-0">
              State Machine Active
            </span>
          </div>

          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 gap-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={order.image} 
                    alt={order.product} 
                    className="w-14 h-14 object-cover rounded-xl border border-white/10 shrink-0" 
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-mono font-bold text-sm text-brand-300">Sub-Order #{order.id}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        order.status === 'DELIVERED' ? 'bg-emerald-500/20 text-emerald-300' :
                        order.status === 'SHIPPED' ? 'bg-blue-500/20 text-blue-300' :
                        order.status === 'PACKED' ? 'bg-purple-500/20 text-purple-300' : 'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-white">{order.product} (x{order.qty})</p>
                    <p className="text-xs text-gray-400">Total: ₹{order.price.toLocaleString()} • Dest: {order.customer}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  {order.status !== 'DELIVERED' ? (
                    <button
                      onClick={() => handleNextStatus(order.id)}
                      className="px-4 py-2 bg-white text-dark-900 hover:bg-brand-50 rounded-xl text-xs font-bold transition-all shadow-md shrink-0"
                    >
                      Advance to {order.status === 'PLACED' ? 'CONFIRMED' : order.status === 'CONFIRMED' ? 'PACKED' : order.status === 'PACKED' ? 'SHIPPED' : 'DELIVERED'}
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Completed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Copilot & Content Studio */}
        <div className="glass-panel p-6 rounded-2xl border border-brand-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-brand-400" />
              <h2 className="text-xl font-bold">AI Content Studio</h2>
            </div>
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border transition-colors ${fixed ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-brand-500/10 border-brand-500/20'}`}>
                <p className={`text-sm font-bold mb-1 ${fixed ? 'text-emerald-400' : 'text-brand-100'}`}>SEO Listing Optimizer</p>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {fixed ? '"Bamboo Desk" listing optimized! Added 5 high-converting SEO tags and generated 3 FAQs.' : 'Your listing quality score is 82/100. Generate AI FAQs & keywords to boost discovery ranking?'}
                </p>
                {!fixed && (
                  <button onClick={handleAiFix} disabled={isFixing} className="mt-3 text-xs bg-brand-500 hover:bg-brand-600 disabled:opacity-50 px-3.5 py-1.5 rounded-lg font-bold transition-colors">
                    {isFixing ? 'Optimizing with Gemini...' : 'Auto-Generate Content Studio'}
                  </button>
                )}
                {fixed && <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-2" />}
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-xs text-gray-400 mb-1">Listing Quality Score</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-brand-400">{fixed ? '96' : '82'}</span>
                  <span className="text-xs text-gray-500">/ 100 Grade A</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mt-2">
                  <div className="bg-brand-400 h-full transition-all duration-700" style={{ width: fixed ? '96%' : '82%' }}></div>
                </div>
              </div>

              <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                <p className="text-xs text-red-300 font-bold mb-1">Inventory Alert</p>
                <p className="text-xs text-gray-300">"Quantum Headphones" has only 2 items remaining in stock.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
