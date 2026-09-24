import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ShoppingBag, Award, ArrowRight } from 'lucide-react';
import { getProductImageUrl, handleImageErrorFallback } from '../utils/imageUrl';

export default function ProductCompareDrawer({ compareList, onRemove, onClear, onAddToCart, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-x-0 bottom-0 z-50 p-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="glass-panel p-6 rounded-3xl border border-brand-500/40 shadow-2xl bg-dark-900/95 backdrop-blur-xl"
        >
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Product Comparison Workspace ({compareList.length} / 4 Products)
              </h3>
              <p className="text-xs text-gray-400">Evaluate specifications, trust scores, and value side-by-side.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={onClear} className="text-xs text-gray-400 hover:text-white transition-colors">
                Clear All
              </button>
              <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {compareList.map((p) => (
              <div key={p._id} className="relative bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
                <button
                  onClick={() => onRemove(p._id)}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div>
                  <img 
                    src={getProductImageUrl(p.imageUrl || p.image)} 
                    alt={p.name} 
                    onError={(e) => handleImageErrorFallback(e, p.imageUrl || p.image)}
                    className="w-full h-28 object-cover rounded-xl mb-3" 
                  />
                  <span className="text-[10px] font-bold uppercase text-brand-400 tracking-wider block mb-1">{p.category}</span>
                  <h4 className="font-bold text-xs text-white truncate mb-1">{p.name}</h4>
                  <p className="text-sm font-bold text-brand-300 mb-2">₹{p.price.toLocaleString()}</p>

                  <div className="space-y-1.5 text-[11px] text-gray-300 border-t border-white/5 pt-2 mb-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Trust Score:</span>
                      <span className="font-bold text-emerald-400">{p.trustScore || 98}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Eco-Packaging:</span>
                      <span className="text-gray-200">Yes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Fulfillment:</span>
                      <span className="text-gray-200">99.5%</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onAddToCart(p)}
                  className="w-full py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

