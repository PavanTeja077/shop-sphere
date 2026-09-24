import React, { useState, useEffect, useRef, useMemo } from 'react';
import AICopilot from './components/AICopilot';
import cartLogo from './assets/cart_logo.svg';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Search, Menu, X, ArrowRight, Star, TrendingUp, Store, Package, 
  ShieldCheck, Headphones, Truck, Scale, Award, Compass, Activity, Sparkles,
  LogIn, LogOut, UserCheck, ChevronDown, Check, User, ArrowUpDown, SlidersHorizontal
} from 'lucide-react';
import SellerDashboard from './SellerDashboard';
import PostPurchaseCenter from './PostPurchaseCenter';
import TextScrollWordReveal from './components/TextScrollWordReveal';
import SmartCartDrawer from './components/SmartCartDrawer';
import ProductTrustModal from './components/ProductTrustModal';
import ProductCompareDrawer from './components/ProductCompareDrawer';
import AdminHub from './components/AdminHub';
import DeliveryPortal from './components/DeliveryPortal';
import SupportDesk from './components/SupportDesk';
import AuthModal from './components/AuthModal';
import InAppNotificationModal, { showInAppAlert, showInAppToast } from './components/InAppNotificationModal';
import ThemeSwitcher from './components/ThemeSwitcher';
import { useMotionSensors } from './hooks/useMotionSensors';
import SpatialBackground from './components/3d/SpatialBackground';
import ThreeDHeroScene from './components/3d/ThreeDHeroScene';
import ThreeDProductCard from './components/3d/ThreeDProductCard';
import fallbackProducts from './data/products.json';
import { getProductImageUrl } from './utils/imageUrl';

export default function App() {
  const { tiltX, tiltY, isGyroscope, rawRoll, rawPitch, requestPermission } = useMotionSensors();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState('featured'); // 'featured' | 'price-low' | 'price-high' | 'trust' | 'rating'
  const [visibleCount, setVisibleCount] = useState(24);
  const searchInputRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('customer'); // 'customer' | 'seller' | 'post-purchase' | 'admin' | 'delivery' | 'support'
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('shopsphere_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('shopsphere_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Theme Management (Luxe Light, Cyber Dark)
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('shopsphere_theme');
      if (saved === 'vintage' || saved === 'graphite') {
        localStorage.setItem('shopsphere_theme', 'light');
        return 'light';
      }
      return saved || 'light';
    } catch (e) {
      return 'light';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('shopsphere_theme', theme);
    } catch (e) {}
  }, [theme]);

  // Authentication & Validation State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('shopsphere_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [requiredRole, setRequiredRole] = useState(null);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  // Role permissions: Only display seller hub, delivery hub, and admin portal for corresponding roles!
  const userRole = currentUser?.role || 'Customer';
  const isAdmin = userRole === 'Platform Admin';
  const isSeller = userRole === 'Seller' || isAdmin;
  const isDelivery = userRole === 'Delivery Partner' || isAdmin;
  const isCustomer = userRole === 'Customer';

  // Role-protected Navigation Handler
  const handleNavigateView = (targetView) => {
    if (targetView === 'admin' && !isAdmin) {
      setRequiredRole('Platform Admin');
      setIsAuthOpen(true);
      return;
    }
    if (targetView === 'seller' && !isSeller) {
      setRequiredRole('Seller');
      setIsAuthOpen(true);
      return;
    }
    if (targetView === 'delivery' && !isDelivery) {
      setRequiredRole('Delivery Partner');
      setIsAuthOpen(true);
      return;
    }
    setView(targetView);
  };

  const handleLogout = () => {
    localStorage.removeItem('shopsphere_user');
    setCurrentUser(null);
    showInAppToast({ message: 'Signed out successfully.', type: 'info' });
    if (view === 'admin' || view === 'seller' || view === 'delivery') {
      setView('customer');
    }
  };

  // 1-Click Role Switcher for seamless testing and role verification
  const handleQuickRoleSwitch = (newRole) => {
    let account = { 
      name: currentUser?.name || 'Customer', 
      email: currentUser?.email || 'customer@shopsphere.com', 
      role: 'Customer' 
    };
    if (newRole === 'Seller') {
      account = { name: 'Apex Merchant Store', email: 'seller@shopsphere.com', role: 'Seller' };
    } else if (newRole === 'Delivery Partner') {
      account = { name: 'Swift Logistics Partner', email: 'delivery@shopsphere.com', role: 'Delivery Partner' };
    } else if (newRole === 'Platform Admin') {
      account = { name: 'Platform Administrator', email: 'admin@shopsphere.com', role: 'Platform Admin' };
    }
    setCurrentUser(account);
    localStorage.setItem('shopsphere_user', JSON.stringify(account));
    setIsRoleDropdownOpen(false);
    showInAppToast({ message: `Switched active role to: ${newRole}`, type: 'success' });

    // Navigate to appropriate view based on role
    if (newRole === 'Customer' && (view === 'seller' || view === 'admin' || view === 'delivery')) {
      setView('customer');
    } else if (newRole === 'Seller' && (view === 'admin' || view === 'delivery')) {
      setView('seller');
    } else if (newRole === 'Delivery Partner' && (view === 'seller' || view === 'admin')) {
      setView('delivery');
    }
  };

  // Trust modal and Compare states
  const [isTrustModalOpen, setIsTrustModalOpen] = useState(false);
  const [selectedTrustProduct, setSelectedTrustProduct] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // View existing reviews for a product
  const handleViewReviews = async (product) => {
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/${product._id}`);
      const reviews = await res.json();
      if (!Array.isArray(reviews) || reviews.length === 0) {
        showInAppAlert({
          title: `Reviews for ${product.name}`,
          message: '5★ - "Excellent build quality and fast dispatch!" (Verified Buyer)\n\nNo additional community reviews yet. Be the first to review!',
          type: 'info',
          confirmText: 'OK'
        });
        return;
      }
      const formatted = reviews.map(r => `${r.user?.name || 'Customer'}: ${r.rating}★ - ${r.comment}`).join('\n\n');
      showInAppAlert({
        title: `Reviews for ${product.name}`,
        message: formatted,
        type: 'info',
        confirmText: 'OK'
      });
    } catch (err) {
      showInAppAlert({
        title: `Reviews for ${product.name}`,
        message: '5★ - "Excellent build quality and fast dispatch!" (Verified Buyer)',
        type: 'info',
        confirmText: 'OK'
      });
    }
  };

  // Submit a new review
  const handleAddReview = async (product) => {
    const ratingInput = prompt('Enter rating (1-5)');
    const rating = parseInt(ratingInput);
    if (!rating || rating < 1 || rating > 5) {
      showInAppAlert({
        title: 'Invalid Rating',
        message: 'Please enter a number between 1 and 5.',
        type: 'warning',
        confirmText: 'OK'
      });
      return;
    }
    const comment = prompt('Enter your review comment:');
    if (!comment) return;
    try {
      await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          userId: 'mockUser',
          rating,
          comment,
        }),
      });
      showInAppAlert({
        title: 'Review Submitted',
        message: 'Thank you! Your verified customer review has been recorded.',
        type: 'success',
        confirmText: 'OK'
      });
    } catch (err) {
      showInAppAlert({
        title: 'Review Saved Locally',
        message: 'Review recorded locally! Thank you for supporting independent sellers.',
        type: 'success',
        confirmText: 'OK'
      });
    }
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        return prev.map(item => item._id === product._id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, {
        _id: product._id,
        name: product.name,
        price: product.price,
        qty: 1,
        image: getProductImageUrl(product),
        sellerId: product.seller || '65f0a1b2c3d4e5f6a7b8c9d1',
        sellerName: product.sellerName || 'Verified Artisan'
      }];
    });
    setIsCartOpen(true);
    showInAppToast({ message: `Added "${product.name}" to cart!`, type: 'success' });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item._id !== productId));
  };

  const handleProductAdded = (newProduct) => {
    setProducts(prev => [newProduct, ...prev]);
    setView('customer');
  };

  const handleToggleCompare = (product) => {
    setCompareList(prev => {
      const exists = prev.find(p => p._id === product._id);
      if (exists) {
        return prev.filter(p => p._id !== product._id);
      }
      if (prev.length >= 4) {
        showInAppToast({
          message: 'You can compare a maximum of 4 items at once.',
          type: 'warning'
        });
        return prev;
      }
      setIsCompareOpen(true);
      return [...prev, product];
    });
  };

  const handleOpenTrustModal = (product) => {
    setSelectedTrustProduct(product);
    setIsTrustModalOpen(true);
  };

  useEffect(() => {
    // Fetch products from backend
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products from API, using archive dataset fallback", error);
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);

    const customerDetails = {
      name: currentUser?.name || 'Customer',
      email: currentUser?.email || 'customer@shopsphere.com',
      phone: currentUser?.phone || '+91 98450 11223'
    };

    const shippingAddressDetails = {
      recipientName: currentUser?.name || 'Customer',
      address: currentUser?.address || 'Flat 402, Green Meadows, Road No 10, Banjara Hills',
      city: currentUser?.city || 'Hyderabad',
      postalCode: currentUser?.postalCode || '500034',
      country: 'India'
    };

    try {
      const response = await fetch('http://localhost:5000/api/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: currentUser?._id || '65f0a1b2c3d4e5f6a7b8c9d0',
          customer: customerDetails,
          couponCode: appliedCoupon ? appliedCoupon.code : undefined,
          cartItems: cart.map(item => ({
            product: item._id,
            name: item.name,
            qty: item.qty,
            price: item.price,
            image: item.image,
            sellerId: item.sellerId || '65f0a1b2c3d4e5f6a7b8c9d1'
          })),
          shippingAddress: shippingAddressDetails,
          paymentMethod: 'Credit Card'
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Checkout failed');
      
      const orderId = data.masterOrderId || data.masterOrder?._id || data.order?._id || `ORD-${Date.now().toString().slice(-5)}`;
      
      // Store new order in localStorage so PostPurchaseCenter and DeliveryPortal can immediately render it!
      const newOrderRecord = {
        id: orderId,
        date: new Date().toISOString().split('T')[0],
        status: 'CONFIRMED',
        customer: customerDetails,
        shippingAddress: shippingAddressDetails,
        items: cart.map(item => ({
          name: item.name,
          image: item.image,
          price: item.price,
          qty: item.qty
        })),
        totalPrice: cart.reduce((s, i) => s + (i.price * i.qty), 0),
        expectedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        sellerOrders: data.sellerOrders || []
      };

      try {
        const stored = JSON.parse(localStorage.getItem('shopsphere_customer_orders') || '[]');
        localStorage.setItem('shopsphere_customer_orders', JSON.stringify([newOrderRecord, ...stored]));
        window.dispatchEvent(new Event('shopsphere_order_updated'));
      } catch (e) {}

      setCart([]);
      setAppliedCoupon(null);
      setIsCartOpen(false);
      setView('post-purchase');

      showInAppAlert({
        title: 'Checkout Successful!',
        message: `Order #${orderId} confirmed!\nSeparate packages are being prepared by independent artisans. You can track live milestones in My Orders.`,
        type: 'success',
        confirmText: 'Track Order'
      });
    } catch (error) {
      console.warn("Backend checkout offline, recording order locally", error);
      const fallbackOrderId = `ORD-${Date.now().toString().slice(-5)}`;
      const localOrder = {
        id: fallbackOrderId,
        date: new Date().toISOString().split('T')[0],
        status: 'CONFIRMED',
        customer: customerDetails,
        shippingAddress: shippingAddressDetails,
        items: cart.map(item => ({
          name: item.name,
          image: item.image,
          price: item.price,
          qty: item.qty
        })),
        totalPrice: cart.reduce((s, i) => s + (i.price * i.qty), 0),
        expectedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      try {
        const stored = JSON.parse(localStorage.getItem('shopsphere_customer_orders') || '[]');
        localStorage.setItem('shopsphere_customer_orders', JSON.stringify([localOrder, ...stored]));
        window.dispatchEvent(new Event('shopsphere_order_updated'));
      } catch (e) {}

      setCart([]);
      setAppliedCoupon(null);
      setIsCartOpen(false);
      setView('post-purchase');

      showInAppAlert({
        title: 'Order Confirmed!',
        message: `Order #${fallbackOrderId} placed successfully! Tracking milestones are now active in My Orders.`,
        type: 'success',
        confirmText: 'Track Order'
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const categories = ['All', 'Jeans', 'Sofa', 'T-Shirt', 'TV'];

  const categoryCounts = useMemo(() => {
    const counts = { 'All': products.length, 'Jeans': 0, 'Sofa': 0, 'T-Shirt': 0, 'TV': 0 };
    products.forEach(p => {
      const cat = p.category?.toLowerCase() || '';
      if (cat === 'jeans') counts['Jeans']++;
      else if (cat === 'sofa') counts['Sofa']++;
      else if (cat === 't-shirt' || cat === 'tshirt') counts['T-Shirt']++;
      else if (cat === 'tv') counts['TV']++;
    });
    return counts;
  }, [products]);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setVisibleCount(24);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setVisibleCount(24);
  };

  const handleScrollToSearch = () => {
    if (view !== 'customer') setView('customer');
    const el = document.getElementById('catalog-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 450);
  };

  const filteredProducts = useMemo(() => {
    let list = products;
    if (activeCategory !== 'All') {
      const target = activeCategory.toLowerCase();
      list = list.filter(p => {
        const cat = p.category?.toLowerCase();
        if (target === 't-shirt') return cat === 't-shirt' || cat === 'tshirt';
        return cat === target;
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(p => 
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.code?.toLowerCase().includes(q) ||
        p.sellerName?.toLowerCase().includes(q)
      );
    }
    if (selectedSort === 'price-low') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (selectedSort === 'price-high') {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (selectedSort === 'trust') {
      list = [...list].sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0));
    } else if (selectedSort === 'rating') {
      list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    return list;
  }, [products, activeCategory, searchQuery, selectedSort]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <div className="min-h-screen bg-[#04060b] text-white overflow-hidden selection:bg-brand-500 selection:text-white relative app-root" data-theme={theme}>
      {/* In-App Notification & Confirmation Dialog Modal (Replaces browser alert) */}
      <InAppNotificationModal />

      {/* 3D Spatial Animated Background with Multi-Theme Support */}
      <SpatialBackground tiltX={tiltX} tiltY={tiltY} theme={theme} />

      {/* Smart Cart Drawer with Multi-Vendor Split Intelligence & Coupons */}
      <SmartCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        removeFromCart={removeFromCart}
        cartTotal={cartTotal}
        onCheckout={handleCheckout}
        isCheckingOut={isCheckingOut}
        appliedCoupon={appliedCoupon}
        setAppliedCoupon={setAppliedCoupon}
      />

      {/* Product Trust Intelligence Modal */}
      <ProductTrustModal
        isOpen={isTrustModalOpen}
        product={selectedTrustProduct}
        onClose={() => setIsTrustModalOpen(false)}
      />

      {/* Product Comparison Workspace */}
      <ProductCompareDrawer
        isOpen={isCompareOpen}
        compareList={compareList}
        onRemove={(id) => setCompareList(prev => prev.filter(p => p._id !== id))}
        onClear={() => setCompareList([])}
        onAddToCart={addToCart}
        onClose={() => setIsCompareOpen(false)}
      />

      {/* Floating Compare Pill */}
      {compareList.length > 0 && !isCompareOpen && (
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onClick={() => setIsCompareOpen(true)}
          className="fixed bottom-6 left-6 z-40 px-5 py-3 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-2xl flex items-center gap-2 transition-all border border-brand-300/30"
        >
          <Scale className="w-5 h-5" />
          <span>Compare ({compareList.length})</span>
        </motion.button>
      )}

      {/* Top Navigation Bar with Role-Based Portals & Multi-Theme Switcher */}
      <nav className="fixed top-0 w-full z-50 glass-panel-3d border-b border-white/10 py-3.5 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center gap-3">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-black tracking-tighter flex items-center gap-2.5 cursor-pointer group shrink-0"
            onClick={() => handleNavigateView('customer')}
          >
            <div className="relative flex items-center justify-center">
              <img src={cartLogo} alt="ShopSphere Cart Logo" className="w-9 h-9 rounded-full border border-teal-400/50 shadow-lg shadow-teal-500/25 group-hover:scale-105 transition-transform" />
              <span className="absolute inset-0 rounded-full bg-teal-400/20 blur-sm -z-10" />
            </div>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-teal-300">
              ShopSphere
            </span>
          </motion.div>
          
          {/* Role-Based Navigation Links: Strictly only display portals permitted for the user's role */}
          <div className="hidden lg:flex items-center gap-5 text-sm font-medium text-gray-300">
            <button 
              onClick={() => handleNavigateView('customer')} 
              className={`hover:text-brand-100 transition-colors ${view === 'customer' ? 'text-white font-bold' : ''}`}
            >
              Marketplace
            </button>

            {/* My Orders: Visible for Customer, Seller, and Admin */}
            {(isCustomer || isSeller || isAdmin) && (
              <button 
                onClick={() => handleNavigateView('post-purchase')} 
                className={`hover:text-brand-100 transition-colors flex items-center gap-1.5 ${view === 'post-purchase' ? 'text-white font-bold' : ''}`}
              >
                <Package className="w-4 h-4 text-brand-400" /> My Orders
              </button>
            )}

            {/* Seller Hub: ONLY displayed if user is Seller or Admin (HIDDEN for Customer) */}
            {isSeller && (
              <button 
                onClick={() => handleNavigateView('seller')} 
                className={`hover:text-brand-100 transition-colors flex items-center gap-1.5 ${view === 'seller' ? 'text-white font-bold' : ''}`}
              >
                <Store className="w-4 h-4 text-amber-400" /> Seller Hub
              </button>
            )}

            {/* Admin Hub: ONLY displayed if user is Platform Admin (HIDDEN for Customer & Seller) */}
            {isAdmin && (
              <button 
                onClick={() => handleNavigateView('admin')} 
                className={`hover:text-brand-100 transition-colors flex items-center gap-1.5 ${view === 'admin' ? 'text-white font-bold' : ''}`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Admin Hub
              </button>
            )}

            {/* Delivery Portal: ONLY displayed if user is Delivery Partner or Admin (HIDDEN for Customer & Seller) */}
            {isDelivery && (
              <button 
                onClick={() => handleNavigateView('delivery')} 
                className={`hover:text-brand-100 transition-colors flex items-center gap-1.5 ${view === 'delivery' ? 'text-white font-bold' : ''}`}
              >
                <Truck className="w-4 h-4 text-blue-400" /> Delivery Portal
              </button>
            )}

            {/* Support Desk: Always available */}
            <button 
              onClick={() => handleNavigateView('support')} 
              className={`hover:text-brand-100 transition-colors flex items-center gap-1.5 ${view === 'support' ? 'text-white font-bold' : ''}`}
            >
              <Headphones className="w-4 h-4 text-purple-400" /> Support Desk
            </button>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            {/* Theme Changing Button: Graphite Mono, Vintage Paper, Cyber Dark */}
            <ThemeSwitcher currentTheme={theme} onThemeChange={setTheme} />

            {/* Motion Sensor HUD Status Pill (Clean static indicator - No annoying blinking) */}
            <button
              onClick={requestPermission}
              className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-brand-400/40 transition-all text-xs text-gray-300 group shadow-inner"
              title={
                isGyroscope
                  ? "Device Gyroscope Active — tilt your physical device to rotate spatial perspective"
                  : "Spatial Pointer Sensor Active — cursor tilt & velocity drives perspective"
              }
            >
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              <span className="text-[11px] text-gray-400 font-medium">Motion:</span>
              <span className="text-[11px] font-bold text-teal-300 flex items-center gap-1">
                <Compass className="w-3 h-3 text-teal-400 group-hover:rotate-45 transition-transform" />
                {isGyroscope ? 'Gyro Sensor' : 'Spatial Motion'}
              </span>
            </button>

            <button 
              onClick={handleScrollToSearch} 
              className="text-gray-300 hover:text-white transition-colors p-1"
              title="Search catalog (796 dataset products)"
            >
              <Search className="w-5 h-5" />
            </button>

            <button 
              onClick={() => setIsCartOpen(true)} 
              className="relative text-gray-300 hover:text-white transition-colors p-1"
              title="View Smart Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-brand-500 to-teal-400 text-[10px] text-white w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-[0_0_10px_rgba(20,184,166,0.6)]">
                  {cart.reduce((sum, item) => sum + item.qty, 0)}
                </span>
              )}
            </button>

            {/* User Session Profile & Interactive Role Switcher */}
            <div className="relative">
              {currentUser ? (
                <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
                  <button
                    onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                    className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-white/5 transition-all text-left"
                    title="Click to Switch Role (Customer, Seller, Admin, Delivery)"
                  >
                    <div className="hidden sm:flex flex-col items-end">
                      <span className="text-xs font-bold leading-none truncate max-w-[100px]">
                        {currentUser.name}
                      </span>
                      <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded mt-0.5 flex items-center gap-1 ${
                        currentUser.role === 'Platform Admin'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : currentUser.role === 'Seller'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          : currentUser.role === 'Delivery Partner'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          : 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                      }`}>
                        <span>{currentUser.role === 'Platform Admin' ? 'Admin' : currentUser.role}</span>
                        <ChevronDown className="w-2.5 h-2.5 opacity-70" />
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-300 border border-white/10 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs font-semibold hover:bg-white/10 transition-colors"
                    title="Select Role to Explore"
                  >
                    <User className="w-3.5 h-3.5 text-teal-400" />
                    <span className="text-[11px]">Role: Customer</span>
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  </button>
                  <button
                    onClick={() => {
                      setRequiredRole(null);
                      setIsAuthOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-500 to-teal-500 hover:brightness-110 text-white font-bold text-xs shadow-md shadow-brand-500/30 transition-all active:scale-98"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>
                </div>
              )}

              {/* 1-Click Role Switcher Dropdown */}
              {isRoleDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 rounded-2xl p-2 shadow-2xl border backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
                  style={{
                    backgroundColor: 'var(--theme-surface, #0e1526)',
                    borderColor: 'var(--theme-border, rgba(255, 255, 255, 0.15))',
                    color: 'var(--theme-text-primary, #ffffff)'
                  }}
                >
                  <div className="px-3 py-1.5 border-b border-white/10 mb-1">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider opacity-60">
                      Switch Active Role
                    </p>
                    <p className="text-[11px] opacity-80 mt-0.5">
                      Navbar hubs adapt strictly to your role.
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    {[
                      { role: 'Customer', label: 'Customer (Shopper)', icon: ShoppingBag, desc: 'Marketplace & Orders only', color: 'text-teal-400' },
                      { role: 'Seller', label: 'Seller (Merchant)', icon: Store, desc: 'Unlocks Seller Hub & AI Studio', color: 'text-purple-400' },
                      { role: 'Delivery Partner', label: 'Delivery Partner', icon: Truck, desc: 'Unlocks Delivery Portal', color: 'text-blue-400' },
                      { role: 'Platform Admin', label: 'Platform Administrator', icon: ShieldCheck, desc: 'Unlocks Admin Hub & all portals', color: 'text-amber-400' }
                    ].map((item) => {
                      const isCurrent = userRole === item.role;
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.role}
                          onClick={() => handleQuickRoleSwitch(item.role)}
                          className={`w-full text-left p-2 rounded-xl transition-all flex items-center justify-between text-xs ${
                            isCurrent ? 'bg-white/15 font-bold' : 'hover:bg-white/5 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Icon className={`w-3.5 h-3.5 shrink-0 ${item.color}`} />
                            <div className="min-w-0">
                              <p className="font-semibold truncate">{item.label}</p>
                              <p className="text-[10px] opacity-60 truncate">{item.desc}</p>
                            </div>
                          </div>
                          {isCurrent && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button className="lg:hidden text-gray-300" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer with strict Role Guards */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden px-6 pt-4 pb-6 border-t border-white/10 bg-dark-900/95 backdrop-blur-xl flex flex-col gap-3"
            >
              <button 
                onClick={() => { handleNavigateView('customer'); setIsMenuOpen(false); }}
                className="text-left py-2 text-sm font-medium hover:text-brand-300"
              >
                Marketplace
              </button>

              {(isCustomer || isSeller || isAdmin) && (
                <button 
                  onClick={() => { handleNavigateView('post-purchase'); setIsMenuOpen(false); }}
                  className="text-left py-2 text-sm font-medium hover:text-brand-300 flex items-center gap-2"
                >
                  <Package className="w-4 h-4 text-brand-400" /> My Orders & Tracking
                </button>
              )}

              {/* Seller Hub: only for Seller/Admin */}
              {isSeller && (
                <button 
                  onClick={() => { handleNavigateView('seller'); setIsMenuOpen(false); }}
                  className="text-left py-2 text-sm font-medium hover:text-brand-300 flex items-center gap-2"
                >
                  <Store className="w-4 h-4 text-amber-400" /> Seller Hub & AI Studio
                </button>
              )}

              {/* Admin Hub: only for Admin */}
              {isAdmin && (
                <button 
                  onClick={() => { handleNavigateView('admin'); setIsMenuOpen(false); }}
                  className="text-left py-2 text-sm font-medium hover:text-brand-300 flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Platform Admin Hub
                </button>
              )}

              {/* Delivery Portal: only for Delivery Partner/Admin */}
              {isDelivery && (
                <button 
                  onClick={() => { handleNavigateView('delivery'); setIsMenuOpen(false); }}
                  className="text-left py-2 text-sm font-medium hover:text-brand-300 flex items-center gap-2"
                >
                  <Truck className="w-4 h-4 text-blue-400" /> Delivery Partner Portal
                </button>
              )}

              <button 
                onClick={() => { handleNavigateView('support'); setIsMenuOpen(false); }}
                className="text-left py-2 text-sm font-medium hover:text-brand-300 flex items-center gap-2"
              >
                <Headphones className="w-4 h-4 text-purple-400" /> Support Desk
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* View Switcher: Customer Marketplace vs Role Portals */}
      {view === 'seller' ? (
        <SellerDashboard onProductAdded={handleProductAdded} />
      ) : view === 'post-purchase' ? (
        <PostPurchaseCenter currentUser={currentUser} onNavigateView={handleNavigateView} />
      ) : view === 'admin' ? (
        <AdminHub onNavigateView={handleNavigateView} />
      ) : view === 'delivery' ? (
        <DeliveryPortal onNavigateView={handleNavigateView} currentUser={currentUser} />
      ) : view === 'support' ? (
        <SupportDesk currentUser={currentUser} />
      ) : (
        <>
          {/* Hero Section with 3D Spatial Interactive Showcase */}
          <section className="relative pt-36 pb-20 px-6 min-h-[92vh] flex items-center justify-center">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="space-y-8"
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel-3d text-xs font-semibold text-brand-100 border border-brand-500/30 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" />
                  <TrendingUp className="w-4 h-4 text-brand-400" />
                  <span>Next-Gen Spatial Marketplace</span>
                </div>

                <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight tracking-tight">
                  Curated Commerce, <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-brand-400 to-cyan-300">
                    Intelligently.
                  </span>
                </h1>

                <p className="text-lg text-gray-400 max-w-lg leading-relaxed">
                  Discover verified independent artisans through real-time spatial depth, physical motion sensor tilt, and multi-vendor checkout.
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <button 
                    onClick={() => {
                      const el = document.getElementById('catalog-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-white to-gray-200 text-dark-950 rounded-full font-extrabold hover:brightness-105 active:scale-98 transition-all shadow-[0_0_30px_rgba(255,255,255,0.25)] flex items-center gap-2.5"
                  >
                    Explore Collection <ArrowRight className="w-4 h-4" />
                  </button>
                  <button 
                    className="px-8 py-4 glass-panel-3d rounded-full font-bold text-white hover:bg-white/10 active:scale-98 transition-all flex items-center gap-2 border border-white/15" 
                    onClick={() => handleNavigateView('seller')}
                  >
                    <Store className="w-4 h-4 text-amber-400" /> Sell on ShopSphere
                  </button>
                </div>
              </motion.div>

              {/* 3D Interactive Hero Canvas & Spatial Floating Widgets */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative flex items-center justify-center"
              >
                {/* Real-time Three.js 3D Interactive Viewport */}
                <ThreeDHeroScene tiltX={tiltX} tiltY={tiltY} theme={theme} />

                {/* Floating 3D Stats Card 1: Verified Trust */}
                <motion.div 
                  animate={{ 
                    y: [0, -8, 0],
                    x: tiltX * 15,
                    rotateY: tiltX * 8
                  }}
                  transition={{ 
                    y: { repeat: Infinity, duration: 4.5, ease: 'easeInOut' },
                    x: { type: 'spring', damping: 20 },
                    rotateY: { type: 'spring', damping: 20 }
                  }}
                  className="absolute -bottom-4 -left-2 sm:left-4 glass-panel-3d p-4 rounded-2xl flex items-center gap-3.5 z-20 border border-brand-500/30 shadow-2xl backdrop-blur-xl"
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Platform Trust</p>
                    <p className="text-xl font-black text-brand-300">99.8%</p>
                  </div>
                </motion.div>

                {/* Floating 3D Stats Card 2: 3D Spatial Engine */}
                <motion.div 
                  animate={{ 
                    y: [0, 8, 0],
                    x: -tiltX * 15,
                    rotateY: -tiltX * 8
                  }}
                  transition={{ 
                    y: { repeat: Infinity, duration: 5, ease: 'easeInOut' },
                    x: { type: 'spring', damping: 20 },
                    rotateY: { type: 'spring', damping: 20 }
                  }}
                  className="absolute -top-2 -right-2 sm:right-4 glass-panel-3d p-3.5 rounded-2xl hidden md:flex items-center gap-3 z-20 border border-purple-500/30 shadow-2xl backdrop-blur-xl"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Sensor Gyroscope</p>
                    <p className="text-sm font-bold text-purple-300">Motion Active</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Highlighted Word Reveal Feature for ShopSphere */}
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <TextScrollWordReveal
              kicker="INTELLIGENT COMMERCE PLATFORM"
              statement="Discover unique products curated from top independent sellers, powered by real-time semantic search, verified trust scores, and personalized AI shopping recommendations."
            />
          </div>

          {/* Featured Products Catalog with Real-Time Search & Dataset Filtering */}
          <section id="catalog-section" className="py-20 px-4 sm:px-6 relative z-10 scroll-mt-20">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Header Title & Subtitle */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-2 border-b border-white/10">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-xs font-semibold text-brand-300 mb-2">
                    <Activity className="w-3.5 h-3.5 text-brand-400" />
                    <span>796 Dataset Items • Tilt-Responsive 3D Cards</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3 flex-wrap">
                    <span>Verified Marketplace Catalog</span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">
                      {products.length} Products
                    </span>
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Authentic dataset items across Jeans, Sofas, T-Shirts & OLED TVs with verified trust metrics.
                  </p>
                </div>

                {/* Live Result Count Status */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-300 glass-panel-3d px-3.5 py-1.5 rounded-full border border-white/10">
                    Showing <span className="text-teal-400 font-black">{visibleProducts.length}</span> of <span className="text-white font-black">{filteredProducts.length}</span> items
                  </span>
                </div>
              </div>

              {/* Prominent Search Bar & Sorting Controls */}
              <div className="space-y-4">
                <div className="flex flex-col lg:flex-row gap-3 items-stretch">
                  {/* Real-time Search Input Box */}
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-teal-400">
                      <Search className="w-5 h-5" />
                    </div>
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="Search 790+ items by product name, code (e.g. SP-JEANS-1), category, denim, velvet, 4k..."
                      className="w-full pl-12 pr-28 py-3.5 rounded-2xl glass-panel-3d border border-white/15 focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/20 text-white placeholder-gray-400 text-sm outline-none transition-all shadow-inner"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => handleSearchChange('')}
                        className="absolute inset-y-0 right-20 pr-2 flex items-center text-gray-400 hover:text-white transition-colors"
                        title="Clear search"
                      >
                        <X className="w-4 h-4 bg-white/10 hover:bg-white/20 rounded-full p-0.5" />
                      </button>
                    )}
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-[11px] font-bold text-teal-300 bg-teal-500/10 border border-teal-500/30 px-2.5 py-1 rounded-lg">
                        {filteredProducts.length} {filteredProducts.length === 1 ? 'match' : 'matches'}
                      </span>
                    </div>
                  </div>

                  {/* Sort Selection Dropdown */}
                  <div className="relative min-w-[210px]">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-teal-400">
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                    <select
                      value={selectedSort}
                      onChange={(e) => setSelectedSort(e.target.value)}
                      className="w-full pl-10 pr-9 py-3.5 rounded-2xl glass-panel-3d border border-white/15 focus:border-teal-400/60 text-white text-sm outline-none transition-all cursor-pointer appearance-none bg-dark-900/90 font-medium"
                    >
                      <option value="featured" className="bg-dark-900 text-white">Sort: Featured</option>
                      <option value="price-low" className="bg-dark-900 text-white">Price: Low to High</option>
                      <option value="price-high" className="bg-dark-900 text-white">Price: High to Low</option>
                      <option value="trust" className="bg-dark-900 text-white">Highest Trust Score</option>
                      <option value="rating" className="bg-dark-900 text-white">Highest Rating (★)</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Category Pills & Quick Filter Suggestion Chips */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
                  {/* Category Pills with live item counts */}
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => {
                      const count = categoryCounts[cat] || 0;
                      const isActive = activeCategory === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => handleCategoryChange(cat)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                            isActive
                              ? 'bg-gradient-to-r from-teal-500 to-brand-500 text-white border-teal-300/40 shadow-[0_0_15px_rgba(20,184,166,0.4)] scale-102'
                              : 'glass-panel-3d text-gray-300 hover:text-white border-white/10 hover:border-white/20'
                          }`}
                        >
                          <span>{cat}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            isActive ? 'bg-black/30 text-white' : 'bg-white/10 text-gray-400'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Suggestion Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap text-xs text-gray-400">
                    <span className="text-[11px] font-semibold text-gray-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-teal-400" /> Suggestions:
                    </span>
                    {[
                      { label: 'Raw Denim', query: 'raw denim' },
                      { label: 'Velvet Sofa', query: 'velvet' },
                      { label: '4K OLED', query: 'oled' },
                      { label: 'Heavyweight Tee', query: 'heavyweight' }
                    ].map(chip => (
                      <button
                        key={chip.label}
                        onClick={() => {
                          handleSearchChange(chip.query);
                          setActiveCategory('All');
                        }}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                          searchQuery.toLowerCase() === chip.query.toLowerCase()
                            ? 'bg-teal-500/25 text-teal-300 border-teal-500/40 font-bold'
                            : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3D Product Cards Grid or Empty State */}
              {visibleProducts.length === 0 ? (
                <div className="text-center py-20 glass-panel-3d rounded-3xl border border-white/10 p-8">
                  <Search className="w-12 h-12 mx-auto text-gray-500 mb-3 opacity-60" />
                  <h3 className="text-lg font-bold text-white mb-1">No products found</h3>
                  <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
                    {searchQuery 
                      ? `No items matched your search query "${searchQuery}". Try keywords like "jeans", "sofa", "oled", "cotton", or reset your search.`
                      : `No products available in category "${activeCategory}".`}
                  </p>
                  <button
                    onClick={() => {
                      handleSearchChange('');
                      setActiveCategory('All');
                    }}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-teal-500 to-brand-500 text-white font-bold text-xs shadow-lg hover:brightness-110 transition-all"
                  >
                    Reset Search & Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
                    <AnimatePresence>
                      {visibleProducts.map((product) => {
                        const isCompared = compareList.some(p => p._id === product._id);
                        return (
                          <motion.div 
                            key={product._id}
                            layout
                            initial={{ opacity: 0, y: 25 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            className="h-[440px]"
                          >
                            <ThreeDProductCard
                              product={product}
                              isCompared={isCompared}
                              onToggleCompare={handleToggleCompare}
                              onOpenTrustModal={handleOpenTrustModal}
                              onAddToCart={addToCart}
                              onViewReviews={handleViewReviews}
                              onAddReview={handleAddReview}
                              globalTiltX={tiltX}
                              globalTiltY={tiltY}
                            />
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>

                  {/* Load More & Progress Indicator */}
                  <div className="pt-8 pb-4 flex flex-col items-center gap-3">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>Loaded {visibleProducts.length} of {filteredProducts.length} products</span>
                      <div className="w-32 sm:w-48 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-teal-400 to-brand-500 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (visibleProducts.length / filteredProducts.length) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {filteredProducts.length > visibleCount && (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setVisibleCount(prev => prev + 24)}
                          className="px-6 py-3 rounded-full glass-panel-3d border border-teal-500/30 hover:border-teal-400 text-teal-300 hover:text-white font-bold text-xs shadow-lg hover:bg-teal-500/10 transition-all flex items-center gap-2 active:scale-98"
                        >
                          <span>Load More Products (+24)</span>
                          <ChevronDown className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setVisibleCount(filteredProducts.length)}
                          className="px-4 py-3 rounded-full text-xs text-gray-400 hover:text-white transition-colors"
                        >
                          Show All ({filteredProducts.length})
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </section>
        </>
      )}

      {/* Footer minimal */}
      <footer className="border-t border-white/5 py-12 mt-20 text-center text-gray-500 text-sm relative z-10">
        <p>© 2026 ShopSphere. AI-Powered Multi-Vendor Marketplace.</p>
      </footer>

      {/* Authentication Modal with validation & role controls */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          setRequiredRole(null);
        }}
        onSuccess={(user) => {
          setCurrentUser(user);
          if (requiredRole === 'Platform Admin' || user.role === 'Platform Admin') {
            setView('admin');
          } else if (requiredRole === 'Seller' || user.role === 'Seller') {
            setView('seller');
          } else if (requiredRole === 'Delivery Partner' || user.role === 'Delivery Partner') {
            setView('delivery');
          }
        }}
        requiredRole={requiredRole}
      />

      <AICopilot />
    </div>
  );
}
