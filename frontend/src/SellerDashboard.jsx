import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, DollarSign, TrendingUp, AlertCircle, Sparkles, CheckCircle2, 
  Layers, Plus, Search, ShieldCheck, ArrowUpRight, BarChart2, ArrowLeft,
  Edit3, Trash2, X, Check, Save, ExternalLink, Filter, RefreshCw, Box
} from 'lucide-react';
import SellerAddProduct from './components/SellerAddProduct';
import TextScrollWordReveal from './components/TextScrollWordReveal';
import { showInAppAlert, showInAppToast } from './components/InAppNotificationModal';

export default function SellerDashboard({ 
  products = [], 
  onProductAdded, 
  onProductUpdated, 
  onProductDeleted, 
  onRestockProduct,
  onNavigateToProduct,
  onBack 
}) {
  const [isFixing, setIsFixing] = useState(false);
  const [fixed, setFixed] = useState(false);
  const [inventorySearch, setInventorySearch] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'custom' | 'low-stock'
  const [editingProduct, setEditingProduct] = useState(null); // Product currently being edited

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editCategory, setEditCategory] = useState('');

  // Built-in store catalog items
  const [storeCatalog, setStoreCatalog] = useState([
    {
      _id: 'INV-301',
      code: 'SP-DESK-301',
      name: 'Eco-Crafted Bamboo Standing Desk',
      category: 'Furniture',
      price: 35000,
      stock: 14,
      inventory: 14,
      imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&q=80',
      trustScore: 99.8,
      soldCount: 48,
      status: 'In Stock',
      sellerName: 'Apex Merchant Store',
      isCustomSellerProduct: false
    },
    {
      _id: 'INV-302',
      code: 'SP-SOFA-302',
      name: 'Emerald Velvet Nordic Sofa',
      category: 'Furniture',
      price: 48500,
      stock: 6,
      inventory: 6,
      imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
      trustScore: 99.5,
      soldCount: 29,
      status: 'In Stock',
      sellerName: 'Apex Merchant Store',
      isCustomSellerProduct: false
    },
    {
      _id: 'INV-303',
      code: 'SP-TABLE-303',
      name: 'Solid Walnut Mid-Century Coffee Table',
      category: 'Furniture',
      price: 24999,
      stock: 9,
      inventory: 9,
      imageUrl: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&q=80',
      trustScore: 99.1,
      soldCount: 37,
      status: 'In Stock',
      sellerName: 'Apex Merchant Store',
      isCustomSellerProduct: false
    },
    {
      _id: 'INV-304',
      code: 'SP-CHAIR-304',
      name: 'Scandinavian Accent Lounge Chair',
      category: 'Furniture',
      price: 18999,
      stock: 12,
      inventory: 12,
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
      trustScore: 98.4,
      soldCount: 52,
      status: 'In Stock',
      sellerName: 'Apex Merchant Store',
      isCustomSellerProduct: false
    },
    {
      _id: 'INV-305',
      code: 'SP-AUDIO-305',
      name: 'Aura Studio Wireless Speaker',
      category: 'Electronics',
      price: 18499,
      stock: 18,
      inventory: 18,
      imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80',
      trustScore: 98.0,
      soldCount: 85,
      status: 'In Stock',
      sellerName: 'Apex Merchant Store',
      isCustomSellerProduct: false
    }
  ]);

  // Merge live custom products from main store (passed in via props) with store catalog
  const allSellerItems = useMemo(() => {
    // Filter live products from App.jsx that are custom seller products
    const liveCustom = products.filter(p => p.isCustomSellerProduct || p._id?.startsWith('prod_seller') || p._id?.startsWith('seller_prod'));
    
    // Combine custom products (first) with store catalog
    const combined = [...liveCustom];
    storeCatalog.forEach(item => {
      if (!combined.some(c => c._id === item._id)) {
        combined.push(item);
      }
    });

    return combined.map(item => {
      const currentStock = item.stock !== undefined ? Number(item.stock) : (item.inventory !== undefined ? Number(item.inventory) : 10);
      return {
        ...item,
        stock: currentStock,
        inventory: currentStock,
        status: currentStock === 0 ? 'Out of Stock' : (currentStock < 5 ? 'Low Stock' : 'In Stock')
      };
    });
  }, [products, storeCatalog]);

  // Split Orders (Fulfillment List)
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
    }
  ]);

  const handleAiFix = () => {
    setIsFixing(true);
    setTimeout(() => {
      setIsFixing(false);
      setFixed(true);
      showInAppToast({
        message: 'Gemini Copilot has automatically generated SEO tags and FAQ listings!',
        type: 'success'
      });
    }, 1500);
  };

  const handleNextStatus = (orderId) => {
    const flow = { 'PLACED': 'CONFIRMED', 'CONFIRMED': 'PACKED', 'PACKED': 'SHIPPED', 'SHIPPED': 'DELIVERED' };
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const next = flow[o.status] || o.status;
        showInAppToast({
          message: `Order #${orderId} moved to ${next}! Logistics notified.`,
          type: 'success'
        });
        return { ...o, status: next };
      }
      return o;
    }));
  };

  // Restock handler - updates both Seller Hub and Main Marketplace Display
  const handleRestock = (itemId, delta = 5) => {
    // If it's a live product, update via onRestockProduct prop
    if (onRestockProduct) {
      onRestockProduct(itemId, delta);
    }

    // Also update internal catalog if it's there
    setStoreCatalog(prev => prev.map(item => {
      if (item._id === itemId) {
        const newStock = (item.stock || item.inventory || 0) + delta;
        return {
          ...item,
          stock: newStock,
          inventory: newStock,
          status: newStock > 4 ? 'In Stock' : 'Low Stock'
        };
      }
      return item;
    }));

    showInAppToast({
      message: `Restocked item (+${delta} units). Reflected across store!`,
      type: 'success'
    });
  };

  // Open Edit Product Modal
  const handleStartEdit = (item) => {
    setEditingProduct(item);
    setEditName(item.name);
    setEditPrice(item.price.toString());
    setEditStock((item.stock || item.inventory || 10).toString());
    setEditCategory(item.category || 'Electronics');
  };

  // Save Product Updates - propagates to App.jsx Marketplace and Seller Hub
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    const numericPrice = Number(editPrice);
    const numericStock = Number(editStock);

    if (isNaN(numericPrice) || numericPrice <= 0) {
      showInAppAlert({
        title: 'Invalid Price',
        message: 'Please enter a valid price amount.',
        type: 'warning',
        confirmText: 'OK'
      });
      return;
    }

    const updated = {
      ...editingProduct,
      name: editName.trim(),
      price: numericPrice,
      stock: numericStock,
      inventory: numericStock,
      category: editCategory.trim()
    };

    // Propagate to parent (App.jsx) to update live marketplace products & localStorage
    if (onProductUpdated) {
      onProductUpdated(updated);
    }

    // Also update internal store catalog
    setStoreCatalog(prev => prev.map(item => item._id === updated._id ? updated : item));

    setEditingProduct(null);
    showInAppToast({
      message: `Updated "${updated.name}"! Changes are now LIVE on the Marketplace.`,
      type: 'success'
    });
  };

  // Delete Product Handler - propagates to App.jsx Marketplace and Seller Hub
  const handleDeleteProduct = (item) => {
    showInAppAlert({
      title: `Delete "${item.name}"?`,
      message: `Are you sure you want to delete this listing? It will be removed from your Seller Hub and the live Customer Marketplace display.`,
      type: 'warning',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        if (onProductDeleted) {
          onProductDeleted(item._id);
        }
        setStoreCatalog(prev => prev.filter(p => p._id !== item._id));
        showInAppToast({
          message: `Product removed from Seller Hub and Marketplace.`,
          type: 'info'
        });
      }
    });
  };

  // Jump to Marketplace view for this product
  const handleViewInStore = (item) => {
    if (onNavigateToProduct) {
      onNavigateToProduct(item._id);
    } else if (onBack) {
      onBack();
    }
  };

  // Filter items
  const filteredInventory = allSellerItems.filter(item => {
    const matchesSearch = 
      item.name?.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      item.category?.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      item.code?.toLowerCase().includes(inventorySearch.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'custom') {
      return item.isCustomSellerProduct || item._id?.startsWith('prod_seller') || item._id?.startsWith('seller_prod');
    }
    if (activeTab === 'low-stock') {
      return item.stock < 5;
    }
    return true;
  });

  const customCount = allSellerItems.filter(i => i.isCustomSellerProduct || i._id?.startsWith('prod_seller') || i._id?.startsWith('seller_prod')).length;
  const lowStockCount = allSellerItems.filter(i => i.stock < 5).length;

  const stats = [
    { title: 'Total Store Revenue', value: '₹1,84,500', icon: DollarSign, color: 'text-emerald-400' },
    { title: 'Active Live Listings', value: allSellerItems.length.toString(), icon: Layers, color: 'text-brand-400' },
    { title: 'Store Trust Score', value: '99.4%', icon: TrendingUp, color: 'text-blue-400' },
    { title: 'Active Orders', value: orders.length.toString(), icon: Package, color: 'text-amber-400' },
  ];

  return (
    <div className="pt-24 px-4 sm:px-6 max-w-7xl mx-auto min-h-screen pb-24 text-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold mb-2 border border-brand-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Artisan Portal • Apex Merchant Store
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Seller Hub & Inventory Studio
          </h1>
          <p className="text-sm text-gray-300 mt-1 max-w-2xl leading-relaxed">
            Manage your product catalog, list new items, update prices & stock in real-time, and fulfill split-orders.
          </p>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="px-5 py-2.5 bg-brand-500/20 hover:bg-brand-500 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 border border-brand-400/30 shadow-lg shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Marketplace
          </button>
        )}
      </div>

      {/* Analytics KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            key={stat.title} 
            className="glass-panel p-5 rounded-2xl border border-white/10"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.title}</h3>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Add Product Component with High Contrast & Instant Synchronization */}
      <SellerAddProduct onAddProduct={onProductAdded} />

      {/* Active Store Inventory & Product Management Studio */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 mb-12 shadow-2xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black flex items-center gap-2 text-white">
                <Layers className="w-6 h-6 text-brand-400" /> Active Store Listings & Inventory
              </h2>
              <span className="text-xs font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30 px-2.5 py-0.5 rounded-full font-mono">
                {filteredInventory.length} Items
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-1">
              Changes to price or stock made here are immediately pushed to the customer marketplace.
            </p>
          </div>

          {/* Search & Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-700/80 text-xs">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'all' ? 'bg-brand-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                All ({allSellerItems.length})
              </button>
              <button
                onClick={() => setActiveTab('custom')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'custom' ? 'bg-brand-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>My Listings</span>
                {customCount > 0 && (
                  <span className="bg-emerald-400/30 text-emerald-300 px-1.5 py-0.2 rounded-full text-[10px]">
                    {customCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('low-stock')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'low-stock' ? 'bg-brand-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                Low Stock ({lowStockCount})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input 
                type="text"
                placeholder="Search items by name, code..."
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                className="w-full bg-slate-900/95 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-400 shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredInventory.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-700/80">
            <Box className="w-12 h-12 mx-auto text-gray-500 mb-3" />
            <p className="text-base font-bold text-gray-300">No products match your criteria</p>
            <p className="text-xs text-gray-400 mt-1">Use the "Add New Product for Sale" form above to create your first listing.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredInventory.map((item) => {
              const isCustom = item.isCustomSellerProduct || item._id?.startsWith('prod_seller') || item._id?.startsWith('seller_prod');
              const displayImage = item.imageUrl || item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80';

              return (
                <motion.div 
                  key={item._id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-slate-900/90 rounded-2xl border border-slate-700/80 hover:border-brand-500/50 transition-all flex flex-col justify-between p-4 shadow-lg group relative overflow-hidden"
                >
                  <div>
                    {/* Image & Status Tag */}
                    <div className="relative h-44 rounded-xl overflow-hidden mb-3.5 bg-slate-950">
                      <img 
                        src={displayImage} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80';
                        }}
                      />
                      
                      {/* Stock badge */}
                      <span className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md ${
                        item.status === 'Low Stock' 
                          ? 'bg-amber-500 text-white' 
                          : item.status === 'Out of Stock'
                          ? 'bg-red-500 text-white'
                          : 'bg-emerald-500 text-white'
                      }`}>
                        {item.status}
                      </span>

                      {/* Live in Marketplace indicator */}
                      <span className="absolute top-2.5 right-2.5 text-[10px] font-mono bg-slate-900/90 backdrop-blur text-teal-300 font-bold px-2 py-0.5 rounded-md border border-teal-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Live in Store
                      </span>

                      {isCustom && (
                        <div className="absolute bottom-2 left-2 z-10 bg-emerald-950/90 border border-emerald-400/40 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Added by You
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-[11px] font-bold text-brand-400 uppercase tracking-wider mb-1">
                      <span>{item.category}</span>
                      <span className="text-gray-400 font-mono text-[10px]">{item.code || item._id}</span>
                    </div>

                    <h3 className="text-sm font-bold text-white truncate mb-1" title={item.name}>
                      {item.name}
                    </h3>

                    <div className="flex items-baseline justify-between mb-3">
                      <p className="text-lg font-extrabold text-white">₹{item.price.toLocaleString()}</p>
                      <span className="text-[11px] text-gray-400 font-medium">
                        {item.stock} in stock
                      </span>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    {/* Primary actions: Edit & Restock */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleStartEdit(item)}
                        className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 border border-slate-700"
                        title="Edit price, stock, or details"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-brand-400" /> Edit
                      </button>

                      <button 
                        onClick={() => handleRestock(item._id, 5)}
                        className="flex-1 py-1.5 px-2 bg-brand-500/20 hover:bg-brand-500 text-brand-300 hover:text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 border border-brand-500/30"
                        title="Restock 5 units immediately"
                      >
                        <Plus className="w-3.5 h-3.5" /> +5 Restock
                      </button>
                    </div>

                    {/* Secondary actions: View in Store & Delete */}
                    <div className="flex items-center gap-2 pt-1">
                      <button 
                        onClick={() => handleViewInStore(item)}
                        className="flex-1 py-1.5 px-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 border border-teal-500/20"
                        title="View item on the live marketplace page"
                      >
                        <ExternalLink className="w-3 h-3" /> View in Store
                      </button>

                      <button 
                        onClick={() => handleDeleteProduct(item)}
                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-colors border border-red-500/20 shrink-0"
                        title="Delete listing from Seller Hub and Marketplace"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-500/30 max-w-lg w-full shadow-2xl relative bg-slate-900"
            >
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-brand-400" />
                  <h3 className="text-xl font-bold text-white">Edit Marketplace Product</h3>
                </div>
                <button 
                  onClick={() => setEditingProduct(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Product Title</label>
                  <input 
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Price (₹ INR)</label>
                    <input 
                      type="number"
                      min="1"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Stock Units</label>
                    <input 
                      type="number"
                      min="0"
                      value={editStock}
                      onChange={(e) => setEditStock(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Category</label>
                  <input 
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-400"
                    required
                  />
                </div>

                <p className="text-xs text-teal-300/80 bg-teal-500/10 p-3 rounded-xl border border-teal-500/20">
                  Saving will immediately update this product in both your Seller Hub and the live Customer Marketplace display.
                </p>

                <div className="flex gap-3 pt-3">
                  <button 
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-gray-300 text-xs font-bold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white text-xs font-extrabold rounded-xl transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-4 h-4" /> Save & Update Marketplace
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Orders & AI Studio Section */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {/* Orders Fulfillment List */}
        <div className="md:col-span-2 glass-panel p-6 rounded-3xl border border-white/10">
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
              <div key={order.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-900/80 rounded-2xl border border-slate-700/80 gap-4">
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
                      className="px-4 py-2 bg-white text-dark-900 hover:bg-brand-50 rounded-xl text-xs font-bold transition-all shadow-md shrink-0 cursor-pointer"
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
        <div className="glass-panel p-6 rounded-3xl border border-brand-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-brand-400" />
              <h2 className="text-xl font-bold">AI Content Studio</h2>
            </div>
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border transition-colors ${fixed ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-brand-500/10 border-brand-500/20'}`}>
                <p className={`text-sm font-bold mb-1 ${fixed ? 'text-emerald-400' : 'text-brand-100'}`}>SEO Listing Optimizer</p>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {fixed ? '"Studio Headphones" listing optimized! Added 5 high-converting SEO tags and generated 3 FAQs.' : 'Your store catalog quality score is 85/100. Auto-generate AI tags & keywords to boost discovery ranking?'}
                </p>
                {!fixed && (
                  <button onClick={handleAiFix} disabled={isFixing} className="mt-3 text-xs bg-brand-500 hover:bg-brand-600 disabled:opacity-50 px-3.5 py-1.5 rounded-lg font-bold transition-colors cursor-pointer">
                    {isFixing ? 'Optimizing with Gemini...' : 'Auto-Generate Content Studio'}
                  </button>
                )}
                {fixed && <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-2" />}
              </div>

              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700/80">
                <p className="text-xs text-gray-400 mb-1">Catalog Listing Quality</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-brand-400">{fixed ? '98' : '85'}</span>
                  <span className="text-xs text-gray-500">/ 100 Grade A</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                  <div className="bg-brand-400 h-full transition-all duration-700" style={{ width: fixed ? '98%' : '85%' }}></div>
                </div>
              </div>

              <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <p className="text-xs text-amber-300 font-bold mb-1">Inventory Alert</p>
                <p className="text-xs text-gray-300">
                  {lowStockCount > 0 ? `${lowStockCount} items have less than 5 units remaining in stock.` : 'All product inventory levels are optimal.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Streamlined Word Reveal Banner placed cleanly at the bottom */}
      <TextScrollWordReveal
        kicker="SELLER PLATFORM INTELLIGENCE"
        statement="Scale your independent brand with AI-automated inventory management, seamless order fulfillment, and multi-vendor payout automation."
      />
    </div>
  );
}
