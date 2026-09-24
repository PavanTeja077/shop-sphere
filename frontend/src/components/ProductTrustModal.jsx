import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, TrendingDown, Leaf, Star, CheckCircle, Award } from 'lucide-react';

export default function ProductTrustModal({ product, isOpen, onClose }) {
  if (!product) return null;

  const trust = product.trustScore || 98.5;
  const factors = product.trustFactors || {
    verifiedReviewsCount: 52,
    fulfillmentRate: 99.4,
    returnRate: 0.9,
    listingCompleteness: 96
  };
  const priceHistory = product.priceHistory || [
    { price: product.price + 2000, date: '2 months ago' },
    { price: product.price + 1000, date: '1 month ago' },
    { price: product.price, date: 'Current Best Price' }
  ];
  const sustainability = product.sustainability || {
    ecoPackaging: true,
    carbonNeutral: true,
    materials: 'Sustainable & Recyclable Materials'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            className="relative w-full max-w-xl bg-dark-900 border border-brand-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 text-white max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6 pb-4 border-b border-white/10">
              <div>
                <span className="text-[11px] font-mono tracking-widest uppercase text-brand-400 font-bold">
                  ShopSphere Trust Intelligence
                </span>
                <h3 className="text-xl font-bold mt-1 text-white">{product.name}</h3>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Trust Score Breakdown */}
            <div className="p-5 rounded-2xl bg-brand-500/10 border border-brand-500/30 mb-6 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-brand-500/20 border border-brand-500/40 flex flex-col items-center justify-center shrink-0">
                <Award className="w-6 h-6 text-brand-400" />
                <span className="text-xs font-bold text-white mt-0.5">{trust}%</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand-400" /> Verified Trust Score
                </h4>
                <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                  Transparent rating aggregated from verified buyer purchase delivery, seller fulfillment adherence, and low return rates.
                </p>
              </div>
            </div>

            {/* Factors Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[11px] text-gray-400 block mb-1">Fulfillment Reliability</span>
                <span className="text-lg font-bold text-emerald-400">{factors.fulfillmentRate}%</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[11px] text-gray-400 block mb-1">Verified Purchases</span>
                <span className="text-lg font-bold text-brand-400">{factors.verifiedReviewsCount} Reviews</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[11px] text-gray-400 block mb-1">Low Return Rate</span>
                <span className="text-lg font-bold text-blue-400">{factors.returnRate}%</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[11px] text-gray-400 block mb-1">Listing Quality</span>
                <span className="text-lg font-bold text-purple-400">{factors.listingCompleteness}% Complete</span>
              </div>
            </div>

            {/* Price Timeline Section */}
            <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-emerald-400" /> Price & Value Timeline
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  Lowest Price in 90 Days
                </span>
              </div>
              <div className="space-y-2">
                {priceHistory.map((ph, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs py-1.5 border-b border-white/5 last:border-0">
                    <span className="text-gray-400">{ph.date}</span>
                    <span className={`font-mono font-bold ${idx === priceHistory.length - 1 ? 'text-brand-400' : 'text-gray-300'}`}>
                      ₹{ph.price.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sustainability Indicator */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
              <Leaf className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-emerald-300 mb-1">Sustainable Shopping Attributes</h5>
                <p className="text-xs text-gray-300 mb-2">{sustainability.materials}</p>
                <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                  {sustainability.ecoPackaging && (
                    <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Eco-Friendly Packaging
                    </span>
                  )}
                  {sustainability.carbonNeutral && (
                    <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Carbon Neutral Shipping
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

