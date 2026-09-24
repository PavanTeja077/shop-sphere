import React, { useState } from 'react';
import { PlusCircle, Upload, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { showInAppAlert, showInAppToast } from './InAppNotificationModal';
import { API_BASE_URL } from '../config/api';

export default function SellerAddProduct({ onAddProduct }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !description) {
      showInAppAlert({
        title: 'Missing Fields',
        message: 'Please fill in product name, price, and description before publishing.',
        type: 'warning',
        confirmText: 'OK'
      });
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('stock', stock || '10');
      formData.append('description', description);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      // Mock seller ID
      const sellerId = 'seller_123';
      const res = await fetch(`${API_BASE_URL}/api/seller/${sellerId}/products`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to create product');

      const data = await res.json();
      const created = data.product;

      // Ensure full URL for image if backend returned relative path
      const formattedProduct = {
        ...created,
        imageUrl: created.imageUrl
          ? (created.imageUrl.startsWith('http') ? created.imageUrl : `${API_BASE_URL}${created.imageUrl}`)
          : (preview || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80')
      };

      if (onAddProduct) {
        onAddProduct(formattedProduct);
      }

      setSuccess(true);
      setName('');
      setPrice('');
      setStock('');
      setDescription('');
      setImageFile(null);
      setPreview('');

      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error(err);
      showInAppAlert({
        title: 'Listing Failed',
        message: 'Failed to add product listing. Please check backend connection.',
        type: 'error',
        confirmText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl mb-10 border border-brand-500/30">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-brand-400" />
            Add New Product for Sale
          </h2>
          <p className="text-sm text-gray-400">
            Upload product details with images. Buyers will immediately see it in the marketplace.
          </p>
        </div>
        {success && (
          <span className="flex items-center gap-1.5 text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full font-bold">
            <CheckCircle2 className="w-4 h-4" /> Added to Marketplace!
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 columns: Text inputs */}
        <div className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Product Title</label>
              <input
                type="text"
                placeholder="e.g. Vintage Mechanical Keyboard"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-500 text-sm"
              >
                <option value="Electronics">Electronics</option>
                <option value="Wearables">Wearables</option>
                <option value="Furniture">Furniture</option>
                <option value="Home">Home</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Price (₹ INR)</label>
              <input
                type="number"
                placeholder="e.g. 4999"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Stock / Inventory</label>
              <input
                type="number"
                placeholder="e.g. 25"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Description</label>
            <textarea
              rows="3"
              placeholder="Describe key features, specs, and materials..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 text-sm resize-none"
              required
            ></textarea>
          </div>
        </div>

        {/* Right column: Image Upload & Submit */}
        <div className="flex flex-col justify-between space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Product Image</label>
            <div className="relative border-2 border-dashed border-white/20 hover:border-brand-500 rounded-xl p-4 text-center cursor-pointer transition-colors bg-white/5 h-44 flex flex-col items-center justify-center overflow-hidden">
              {preview ? (
                <img src={preview} alt="Upload preview" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="space-y-2 text-gray-400">
                  <ImageIcon className="w-8 h-8 mx-auto text-brand-400" />
                  <p className="text-xs">Click or drag image file here</p>
                  <p className="text-[10px] text-gray-500">PNG, JPG, WEBP up to 5MB</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(20,184,166,0.4)]"
          >
            <Upload className="w-4 h-4" />
            {loading ? 'Publishing Product...' : 'Publish Product to Marketplace'}
          </button>
        </div>
      </form>
    </div>
  );
}
