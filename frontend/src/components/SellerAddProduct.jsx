import React, { useState } from 'react';
import { 
  PlusCircle, Upload, CheckCircle2, Image as ImageIcon, Sparkles, 
  Tag, Layers, RefreshCw, Eye, ArrowRight, ShieldCheck, Leaf
} from 'lucide-react';
import { showInAppAlert, showInAppToast } from './InAppNotificationModal';
import { API_BASE_URL } from '../config/api';

const SAMPLE_PRESETS = [
  {
    name: 'Quantum Studio Wireless Headphones',
    category: 'Electronics',
    price: 13999,
    stock: 20,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    description: 'High-fidelity audio monitors with hybrid active noise cancellation, custom graphene dynamic drivers, and 45h playtime.',
    ecoPackaging: true
  },
  {
    name: 'Nordic Oak Ergonomic Lounge Chair',
    category: 'Furniture',
    price: 26500,
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    description: 'Handcrafted solid Scandinavian white oak chair upholstered with organic wool blend fabric. Ergonomic curved lumbar support.',
    ecoPackaging: true
  },
  {
    name: 'Custom CNC Aluminum Mechanical Keyboard',
    category: 'Electronics',
    price: 7999,
    stock: 15,
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
    description: 'Triple-mode mechanical keyboard with hot-swappable switches, south-facing RGB backlighting, and gasket mount architecture.',
    ecoPackaging: false
  },
  {
    name: 'Minimalist Ambient Smart Lamp',
    category: 'Home',
    price: 3499,
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    description: 'Architectural aluminum LED desk lamp featuring stepless touch dimming, circadian warmth scheduling, and wireless phone charging pad.',
    ecoPackaging: true
  },
  {
    name: 'Artisan Raw Selvedge Denim Jacket',
    category: 'Wearables',
    price: 4999,
    stock: 12,
    imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80',
    description: '14oz Japanese shuttle loom raw selvedge denim jacket with custom brass hardware, hand-felled seams, and natural indigo dye.',
    ecoPackaging: true
  }
];

export default function SellerAddProduct({ onAddProduct }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [customCategory, setCustomCategory] = useState('');
  const [stock, setStock] = useState('15');
  const [description, setDescription] = useState('');
  const [sellerName, setSellerName] = useState('Apex Merchant Store');
  const [ecoPackaging, setEcoPackaging] = useState(true);
  
  // Image handling
  const [imageSourceMode, setImageSourceMode] = useState('url'); // 'url' | 'upload'
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const activeCategory = category === 'Custom' ? (customCategory.trim() || 'General') : category;
  const activeImage = imagePreview || imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';

  const handleApplyPreset = (preset) => {
    setName(preset.name);
    setCategory(preset.category);
    setPrice(preset.price.toString());
    setStock(preset.stock.toString());
    setDescription(preset.description);
    setImageUrl(preset.imageUrl);
    setImagePreview(preset.imageUrl);
    setImageFile(null);
    setEcoPackaging(preset.ecoPackaging);
    showInAppToast({
      message: `Loaded template: "${preset.name}"`,
      type: 'info'
    });
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const objUrl = URL.createObjectURL(file);
      setImagePreview(objUrl);
      setImageUrl('');
    }
  };

  const handleImageUrlChange = (e) => {
    const val = e.target.value;
    setImageUrl(val);
    setImagePreview(val);
    setImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !price || !description.trim()) {
      showInAppAlert({
        title: 'Missing Required Fields',
        message: 'Please provide a product title, price in INR, and description before publishing.',
        type: 'warning',
        confirmText: 'OK'
      });
      return;
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      showInAppAlert({
        title: 'Invalid Price',
        message: 'Please enter a valid price amount greater than 0.',
        type: 'warning',
        confirmText: 'OK'
      });
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const sellerId = 'seller_apex_store';
      const prodCode = `SP-SLR-${Date.now().toString().slice(-4)}`;
      let finalImageUrl = activeImage;

      // Try uploading to backend API if image file was selected
      if (imageFile) {
        try {
          const formData = new FormData();
          formData.append('name', name);
          formData.append('price', price);
          formData.append('category', activeCategory);
          formData.append('stock', stock || '10');
          formData.append('description', description);
          formData.append('image', imageFile);

          const res = await fetch(`${API_BASE_URL}/api/seller/${sellerId}/products`, {
            method: 'POST',
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            if (data?.product?.imageUrl) {
              finalImageUrl = data.product.imageUrl.startsWith('http')
                ? data.product.imageUrl
                : `${API_BASE_URL}${data.product.imageUrl}`;
            }
          }
        } catch (backendErr) {
          console.warn('Backend image upload skipped, using client preview/URL:', backendErr);
        }
      }

      const newProduct = {
        _id: `prod_seller_${Date.now()}`,
        code: prodCode,
        name: name.trim(),
        category: activeCategory,
        price: numericPrice,
        originalPrice: Math.round(numericPrice * 1.2),
        stock: Number(stock || 15),
        inventory: Number(stock || 15),
        description: description.trim(),
        imageUrl: finalImageUrl,
        rating: 4.9,
        trustScore: 99.2,
        trustFactors: {
          verifiedReviewsCount: 1,
          fulfillmentRate: 99.8,
          returnRate: 0.2,
          listingCompleteness: 100
        },
        sustainability: {
          ecoPackaging: ecoPackaging,
          carbonNeutral: ecoPackaging,
          materials: 'Verified Artisan Grade'
        },
        sellerName: sellerName.trim() || 'Apex Merchant Store',
        isCustomSellerProduct: true,
        soldCount: 0,
        dateAdded: new Date().toISOString().split('T')[0]
      };

      if (onAddProduct) {
        onAddProduct(newProduct);
      }

      setSuccess(true);
      showInAppToast({
        message: `Product "${newProduct.name}" is now LIVE on Marketplace!`,
        type: 'success'
      });

      // Reset form
      setName('');
      setPrice('');
      setStock('15');
      setDescription('');
      setImageUrl('');
      setImageFile(null);
      setImagePreview('');
      setCustomCategory('');

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Error creating product:', err);
      showInAppAlert({
        title: 'Listing Failed',
        message: 'Could not create product listing. Please check input parameters and try again.',
        type: 'error',
        confirmText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl mb-12 border border-brand-500/30 shadow-2xl relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold mb-2 border border-brand-500/30">
            <PlusCircle className="w-3.5 h-3.5" />
            Seller Studio • Direct Catalog Listing
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Add New Product for Sale
          </h2>
          <p className="text-sm text-gray-300 max-w-2xl mt-1 leading-relaxed">
            Configure your item details, stock count, and high-res imagery. Products are instantly synchronized to both your Seller Hub inventory and the live customer Marketplace.
          </p>
        </div>

        {success && (
          <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-4 py-2.5 rounded-xl font-bold text-xs shrink-0 animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Live on Marketplace!
          </div>
        )}
      </div>

      {/* 1-Click Quick Presets */}
      <div className="mb-8 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" /> Quick-Fill Sample Templates (1-Click Test):
          </span>
          <span className="text-[11px] text-gray-400">Click any preset to prefill fields</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="text-xs bg-slate-900/90 hover:bg-brand-500/20 text-gray-200 hover:text-white px-3.5 py-2 rounded-xl border border-slate-700/80 hover:border-brand-500/50 transition-all flex items-center gap-2 font-medium shadow-sm"
            >
              <Tag className="w-3 h-3 text-brand-400" />
              <span>{p.name.split(' ').slice(0, 3).join(' ')}</span>
              <span className="text-brand-300 font-bold">₹{p.price.toLocaleString()}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Left Section: Product Details Inputs (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Row 1: Title & Seller Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-200 mb-1.5 flex items-center gap-1">
                <span>Product Title</span>
                <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Wireless Noise-Cancelling Headphones"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900/95 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 text-sm shadow-inner transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-200 mb-1.5 flex items-center gap-1">
                <span>Seller / Artisan Store Name</span>
              </label>
              <input
                type="text"
                placeholder="Apex Merchant Store"
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                className="w-full bg-slate-900/95 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 text-sm shadow-inner transition-all"
              />
            </div>
          </div>

          {/* Row 2: Category, Price, Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-200 mb-1.5 flex items-center gap-1">
                <span>Category</span>
                <span className="text-red-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900/95 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 text-sm shadow-inner transition-all"
              >
                <option value="Electronics">Electronics</option>
                <option value="Furniture">Furniture</option>
                <option value="Wearables">Wearables</option>
                <option value="Home">Home</option>
                <option value="Audio">Audio</option>
                <option value="Jeans">Jeans</option>
                <option value="T-Shirt">T-Shirt</option>
                <option value="TV">TV</option>
                <option value="Custom">+ Custom Category</option>
              </select>

              {category === 'Custom' && (
                <input
                  type="text"
                  placeholder="Enter custom category name"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full mt-2 bg-slate-900/95 border border-brand-500/50 rounded-xl px-3 py-2 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-brand-400"
                  required
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-200 mb-1.5 flex items-center gap-1">
                <span>Price (₹ INR)</span>
                <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-brand-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  placeholder="4999"
                  min="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-slate-900/95 border border-slate-700/80 rounded-xl pl-8 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 text-sm shadow-inner transition-all font-semibold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-200 mb-1.5 flex items-center gap-1">
                <span>Initial Inventory Units</span>
                <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                placeholder="15"
                min="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full bg-slate-900/95 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 text-sm shadow-inner transition-all font-semibold"
                required
              />
            </div>
          </div>

          {/* Row 3: Description */}
          <div>
            <label className="block text-xs font-bold text-gray-200 mb-1.5 flex items-center gap-1">
              <span>Product Description & Features</span>
              <span className="text-red-400">*</span>
            </label>
            <textarea
              rows="3"
              placeholder="Highlight material quality, artisanal craftsmanship, specifications, and warranty details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900/95 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 text-sm shadow-inner transition-all resize-none"
              required
            ></textarea>
          </div>

          {/* Row 4: Image input controls */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-brand-400" /> Product Image Source:
              </span>
              <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                <button
                  type="button"
                  onClick={() => setImageSourceMode('url')}
                  className={`px-3 py-1 text-xs rounded-md font-semibold transition-all ${
                    imageSourceMode === 'url' ? 'bg-brand-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Web URL
                </button>
                <button
                  type="button"
                  onClick={() => setImageSourceMode('upload')}
                  className={`px-3 py-1 text-xs rounded-md font-semibold transition-all ${
                    imageSourceMode === 'upload' ? 'bg-brand-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  File Upload
                </button>
              </div>
            </div>

            {imageSourceMode === 'url' ? (
              <div>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={imageUrl}
                  onChange={handleImageUrlChange}
                  className="w-full bg-slate-900/95 border border-slate-700/80 rounded-xl px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-brand-400 text-xs"
                />
                <p className="text-[11px] text-gray-400 mt-1">Paste any direct image link, Unsplash URL, or use a sample preset above.</p>
              </div>
            ) : (
              <div className="relative border-2 border-dashed border-slate-700 hover:border-brand-500/70 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-900/50">
                <Upload className="w-5 h-5 mx-auto text-brand-400 mb-1" />
                <p className="text-xs font-semibold text-gray-200">Click or drag image file here</p>
                <p className="text-[10px] text-gray-400">PNG, JPG, WEBP up to 10MB</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Eco-Friendly Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="eco-box"
              checked={ecoPackaging}
              onChange={(e) => setEcoPackaging(e.target.checked)}
              className="w-4 h-4 rounded text-brand-500 focus:ring-brand-400 bg-slate-900 border-slate-700"
            />
            <label htmlFor="eco-box" className="text-xs text-gray-300 flex items-center gap-1.5 cursor-pointer select-none">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              <span>Certified Eco-Friendly Packaging & Verified Carbon-Neutral Delivery</span>
            </label>
          </div>
        </div>

        {/* Right Section: Live Marketplace Preview & Submit (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-brand-400" /> Live Preview Card:
              </span>
              <span className="text-[10px] text-brand-300 bg-brand-500/20 px-2 py-0.5 rounded font-mono font-bold">
                Marketplace View
              </span>
            </div>

            {/* Preview Card */}
            <div className="rounded-2xl border border-slate-700/80 bg-slate-900/90 p-4 shadow-xl relative overflow-hidden">
              <div className="relative h-44 rounded-xl overflow-hidden mb-3 bg-slate-950">
                <img
                  src={activeImage}
                  alt="Preview"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
                  }}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/90 text-white shadow-sm flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> 99.2% Trust
                </span>
                <span className="absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-900/80 text-teal-300 border border-teal-500/30">
                  {stock || 15} in stock
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-brand-400 uppercase tracking-wider">
                  <span>{activeCategory}</span>
                  <span className="text-gray-400 font-mono text-[10px]">SP-PREVIEW</span>
                </div>
                <h4 className="text-sm font-bold text-white truncate" title={name || 'Product Title'}>
                  {name || 'Product Title Preview'}
                </h4>
                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                  {description || 'Product description will appear here as written.'}
                </p>
                <div className="flex items-baseline justify-between pt-2 border-t border-slate-800">
                  <span className="text-lg font-extrabold text-white">
                    ₹{price ? Number(price).toLocaleString() : '0'}
                  </span>
                  <span className="text-[11px] text-gray-400 truncate max-w-[130px]">
                    {sellerName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="space-y-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 disabled:opacity-50 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-[0_0_25px_rgba(20,184,166,0.5)] cursor-pointer text-sm"
            >
              <Upload className="w-4 h-4" />
              {loading ? 'Publishing to Marketplace...' : 'Publish Product to Marketplace'}
            </button>
            <p className="text-[11px] text-center text-gray-400">
              Immediately updates active inventory and reflects in main store catalog.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
